#!/usr/bin/env python3
"""Generate the favicon set and the Open Graph card from one source image.

    python scripts/gen-brand-assets.py

Reads  assets/taif-brand.png   (the square brand image — logo over the interior)
Writes public/og.png           1200x630, the link-share card
       public/favicon.ico      16 / 32 / 48 multi-resolution
       public/icon-192.png     PWA
       public/icon-512.png     PWA + maskable
       public/apple-touch-icon.png  180x180

WHY THE ICONS ARE A CROP, NOT THE WHOLE PICTURE
A browser tab renders a favicon at 16x16. The full image — monogram, wordmark,
"International", a lamp and a chair — becomes an unreadable brown smudge at
that size. So the icons are cut down to the monogram alone, which still reads
as the brand at 16px, while og.png keeps the whole composition (it is displayed
at ~500px wide in a social card, where the detail survives).

Tune MONOGRAM_BOX if the crop clips the mark — the values are fractions of the
source image (left, top, right, bottom), so they hold at any resolution.
"""

import io
import struct
import sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'OpenGraph & Favicon.png'
OUT = ROOT / 'public'

# Fractions of the source bounding the interlaced monogram, with air around it.
# Measured, not guessed: in the 880x846 original the mark occupies exactly
# x 392-491, y 204-304. This is that box grown 1.6x and squared off, which
# leaves the mark filling ~62% of the frame — inside the 80% circle Android
# crops a maskable icon to, so the corners of the interlace do not get shaved.
# Re-measure if the artwork is ever recomposed.
MONOGRAM_BOX = (0.4108, 0.2056, 0.5926, 0.3948)

# The .ico gets its own, tighter crop (mark grown only 1.1x). The two families
# are solving different problems: the PWA icons must survive a circular mask,
# while a 16x16 browser tab must stay legible — and at 16px the interlace is
# fine enough that the padding above turns it into a grey smudge. Tighter
# framing plus a contrast/sharpen pass is what keeps the knot readable there.
FAVICON_BOX = (0.4364, 0.2352, 0.5670, 0.3652)

# Vertical centre of the whole lockup (monogram through "International"), which
# spans y 204-567 of the 846px original. The OG crop is anchored here.
LOCKUP_CENTRE_Y = 0.4557

OG_SIZE = (1200, 630)


def cover(img, size, focal_y=0.5):
    """Scale to fill `size` and crop the overflow — no letterboxing.

    `focal_y` is the fraction of the source that should end up on the card's
    horizontal centre line. It defaults to the middle, but the OG card passes
    the centre of the lockup: a square source cropped to 1.9:1 loses ~45% of
    its height, and centring on the image instead of the artwork left the
    monogram jammed against the top edge with the chair eating the bottom.
    """
    tw, th = size
    sw, sh = img.size
    scale = max(tw / sw, th / sh)
    nw, nh = round(sw * scale), round(sh * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    top = round(focal_y * nh - th / 2)
    top = max(0, min(top, nh - th))          # never crop past the edges
    return img.crop((left, top, left + tw, top + th))


def write_ico(path, frames):
    """Write a multi-resolution .ico from already-rendered frames.

    Pillow's ICO writer derives every size from the one image it is handed, so
    a per-size sharpen cannot survive it — asking for 16/32/48 off a 16px base
    silently produced a single-entry file. The container is simple enough to
    emit directly: a 6-byte header, one 16-byte directory entry per image, then
    PNG-compressed payloads (supported by every browser and Windows Vista on).
    """
    blobs = []
    for f in frames:
        buf = io.BytesIO()
        f.convert('RGBA').save(buf, 'PNG', optimize=True)
        blobs.append(buf.getvalue())

    header = struct.pack('<HHH', 0, 1, len(blobs))          # reserved, type=icon, count
    offset = len(header) + 16 * len(blobs)
    entries = b''
    for f, blob in zip(frames, blobs):
        # 0 in the size byte means 256; every size we ship is smaller than that
        entries += struct.pack(
            '<BBBBHHII',
            f.width % 256, f.height % 256, 0, 0, 1, 32, len(blob), offset,
        )
        offset += len(blob)

    path.write_bytes(header + entries + b''.join(blobs))


def square_crop(src, box):
    """Cut `box` (fractions of `src`) out and pad it to a square.

    The padding colour is sampled from the crop's own corners rather than
    hardcoded, so it sits flush against the source's lighting gradient instead
    of banding against it.
    """
    w, h = src.size
    l, t, r, b = box
    m = src.crop((round(l * w), round(t * h), round(r * w), round(b * h)))
    corners = [m.getpixel(p) for p in
               ((0, 0), (m.width - 1, 0), (0, m.height - 1), (m.width - 1, m.height - 1))]
    pad = tuple(sum(c[i] for c in corners) // len(corners) for i in range(3))
    side = max(m.size)
    plate = Image.new('RGB', (side, side), pad)
    plate.paste(m, ((side - m.width) // 2, (side - m.height) // 2))
    return plate


def main():
    if not SRC.exists():
        sys.exit(
            f"Source image not found: {SRC}\n"
            "Save the brand image there (PNG or JPG renamed to .png) and re-run."
        )

    src = Image.open(SRC).convert('RGB')
    w, h = src.size
    print(f'source {SRC.name}: {w}x{h}')

    if w < OG_SIZE[0]:
        print(
            f'  note: {w}px wide is narrower than the 1200px OG card, so og.png '
            'is upscaled and will look slightly soft. A larger original would fix it.'
        )

    OUT.mkdir(exist_ok=True)

    # ── the share card: the whole composition, centred on the lockup ─────────
    cover(src, OG_SIZE, focal_y=LOCKUP_CENTRE_Y).save(OUT / 'og.png', 'PNG', optimize=True)
    print(f'  og.png                {OG_SIZE[0]}x{OG_SIZE[1]}')

    # ── the icons: the monogram alone, so it survives 16x16 ──────────────────
    plate = square_crop(src, MONOGRAM_BOX)
    side = plate.width
    print(f'  monogram crop {side}x{side}')

    for name, px in (('icon-192.png', 192), ('icon-512.png', 512), ('apple-touch-icon.png', 180)):
        icon = plate.resize((px, px), Image.LANCZOS)
        if px > side:
            # the mark is only ~160px in the source, so the large PWA icons are
            # an upscale; a light unsharp pass keeps the strokes from going mushy
            icon = icon.filter(ImageFilter.UnsharpMask(radius=px / 120, percent=110, threshold=2))
        icon.save(OUT / name, 'PNG', optimize=True)
        print(f'  {name:<22}{px}x{px}{"  (upscaled)" if px > side else ""}')

    # A real multi-resolution .ico — Google's favicon crawler wants the file to
    # exist and to carry the small sizes, not just one big bitmap. Each size is
    # rendered and sharpened separately rather than letting the encoder
    # downsample one bitmap, which is what made 16x16 illegible.
    fav = square_crop(src, FAVICON_BOX)
    frames = []
    for px in (16, 32, 48):
        f = fav.resize((px, px), Image.LANCZOS)
        f = ImageEnhance.Contrast(f).enhance(1.35)
        frames.append(f.filter(ImageFilter.UnsharpMask(radius=0.6, percent=160, threshold=0)))
    write_ico(OUT / 'favicon.ico', frames)
    print('  favicon.ico           16/32/48  (sharpened per size)')

    print('\nDone. Hard-refresh (Ctrl+Shift+R) to get past the cached favicon.')


if __name__ == '__main__':
    main()
