"""Re-encode the images inside content.snapshot.json to WebP, with thumbnails.

This is the offline twin of the Images tab in /admin. Both do the same thing
and use the same numbers (see the header of src/lib/image.js); this one exists
because the browser version needs an admin sitting at a keyboard with the site
open, and a snapshot that arrives by hand — a restored backup, a merge, an
import — should not have to wait for that.

    python scripts/optimise-snapshot-images.py            # report only
    python scripts/optimise-snapshot-images.py --write    # rewrite in place

Every `data:image/...` value is resized, re-encoded as WebP, and given a small
companion under `<key>Thumb` for list rows and cards. A result larger than what
went in is discarded and the original kept, so running this twice is safe and
the second run is a no-op.

Requires Pillow (`pip install Pillow`). Nothing in the build depends on this
script — the build only runs scripts/extract-content-images.mjs, which is pure
Node — so a machine without Pillow can still build the site.
"""

import base64
import io
import json
import re
import sys
from pathlib import Path

from PIL import Image

# The default Windows console codepage is cp1252, which cannot print the
# en-dashes and arrows below — the script would do all its work and then die
# on the report. Ask for UTF-8 explicitly rather than writing duller prose.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
SNAPSHOT = ROOT / "src/data/content.snapshot.json"

# Kept identical to FULL_EDGE / THUMB_EDGE / QUALITY_* in src/lib/image.js.
# If you change one, change the other, or an image will look different
# depending on which route it came in through.
FULL_EDGE = 1800
THUMB_EDGE = 420
QUALITY_FULL = 92
QUALITY_THUMB = 70

# Formats a canvas or PIL round-trip would damage rather than shrink.
PASSTHROUGH = {"image/gif", "image/svg+xml"}

DATA_URL = re.compile(r"^data:([a-z0-9.+/-]+);base64,(.+)$", re.I)


def human(n):
    if n < 1024:
        return f"{n} B"
    if n < 1024 * 1024:
        return f"{n / 1024:.0f} KB"
    return f"{n / 1024 / 1024:.1f} MB"


def encode(img, edge, quality):
    """Fit `img` inside `edge` (never upscaling) and return a WebP data URL."""
    w, h = img.size
    scale = min(1.0, edge / max(w, h))
    if scale < 1.0:
        img = img.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def convert(value):
    """(full, thumb) for a data URL, or None when it should be left alone."""
    m = DATA_URL.match(value)
    if not m or m.group(1).lower() in PASSTHROUGH:
        return None

    raw = base64.b64decode(m.group(2))
    img = Image.open(io.BytesIO(raw))
    # EXIF rotation, matching createImageBitmap({imageOrientation:'from-image'})
    try:
        from PIL import ImageOps

        img = ImageOps.exif_transpose(img)
    except Exception:
        pass
    # WebP has no CMYK or palette mode; convert once so both encodes agree
    img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")

    full = encode(img, FULL_EDGE, QUALITY_FULL)
    thumb = encode(img, THUMB_EDGE, QUALITY_THUMB)

    # A small source can come out of the encoder larger than it went in.
    # Keeping the bigger one would make "optimise" a pessimisation.
    if len(full) >= len(value):
        full = value
    return full, thumb


def walk(node, report):
    """Rewrite in place, filing each thumbnail beside the key it came from."""
    if isinstance(node, list):
        for item in node:
            walk(item, report)
        return
    if not isinstance(node, dict):
        return

    for key in list(node.keys()):
        value = node[key]
        if isinstance(value, (list, dict)):
            walk(value, report)
            continue
        if not isinstance(value, str) or not value.startswith("data:image/"):
            continue
        if key.endswith("Thumb"):  # already a companion; do not nest
            continue
        # Already done. Re-encoding WebP into WebP only loses a little more
        # detail each pass and can come out slightly larger, so a second run
        # must be a no-op. Same test as `stale` in the Images tab of /admin.
        if value.startswith("data:image/webp") and isinstance(node.get(key + "Thumb"), str):
            continue

        try:
            out = convert(value)
        except Exception as err:  # a corrupt or truncated payload
            report.append((key, len(value), None, f"could not decode ({err})"))
            continue
        if out is None:
            report.append((key, len(value), None, "left as-is"))
            continue

        full, thumb = out
        before = len(value)
        after = len(full) + len(thumb)
        node[key] = full
        node[key + "Thumb"] = thumb
        report.append((key, before, after, "webp + thumbnail"))


def main():
    write = "--write" in sys.argv

    text = SNAPSHOT.read_text(encoding="utf-8-sig")  # tolerate a stray BOM
    data = json.loads(text)

    report = []
    walk(data, report)

    if not report:
        print("No embedded images found — nothing to do.")
        return

    before = sum(r[1] for r in report)
    after = sum(r[2] if r[2] is not None else r[1] for r in report)
    for key, b, a, note in report:
        shown = f"{human(b)} → {human(a)}" if a is not None else human(b)
        print(f"  {key:<12} {shown:<22} {note}")
    saved = (1 - after / before) * 100 if before else 0
    print(f"\n{len(report)} image(s): {human(before)} → {human(after)}  ({saved:.0f}% smaller)")

    if not write:
        print("\nReport only. Re-run with --write to rewrite the snapshot.")
        return

    # No BOM: JSON.parse and every non-bundler reader choke on one.
    SNAPSHOT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nWrote {SNAPSHOT.relative_to(ROOT)}.")


if __name__ == "__main__":
    main()
