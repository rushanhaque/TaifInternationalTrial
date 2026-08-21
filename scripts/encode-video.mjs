/* ============ source video → what a browser can actually play ============

   WHY THIS EXISTS, AND WHY NOT WebP

   WebP is a still-image format. Animated WebP exists, but it has no
   hardware decoding, no B-frames and no modern motion compensation — a
   76-second 1080p clip encoded as animated WebP runs to hundreds of
   megabytes against ~15 MB of H.264. It is not a video format and is never
   the answer for this.

   THE ACTUAL PROBLEM WITH THE SOURCES

   Both source clips are HEVC (H.265). H.265 is an excellent archival codec
   and a poor delivery one for the open web:

     Firefox   — no HEVC support on any desktop platform
     Chrome    — hardware-decode only, absent on many Windows/Linux machines
     Safari    — full support

   A muted autoplaying background video that silently fails to decode does
   not fall back to anything; it renders as a dead black box behind the
   copy. So the sources are transcoded to two delivery formats and offered
   together, letting the browser take the first one it understands:

     VP9 / WebM  — every modern browser except older Safari. Roughly
                   30–40% smaller than H.264 at matched quality.
     H.264 / MP4 — the universal floor. Every browser, every platform,
                   hardware-decoded essentially everywhere. Listed last so
                   it is only used when VP9 is not available.

   ON QUALITY: this is a generational re-encode — the sources are already
   lossy, so their compression artifacts are what is being preserved. The
   CRF values below are chosen to sit visually at the source rather than to
   chase it exactly; both clips are backdrops running behind text at low
   contrast, which is the least demanding thing video is ever asked to do.

   Run: node scripts/encode-video.mjs                                     */

import { execFileSync } from 'node:child_process'
import ffmpegPath from 'ffmpeg-static'
import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.join('public', 'video')

/* name: what the site will reference. from: the raw source. width: the
   encode width, chosen from what the element is actually PAINTED at,
   measured in the browser — not from what the source happens to be.

     hero  (.hb-video)             full-bleed, 1265px at a 1280 viewport
                                   and up to ~1920 on a wide monitor, so
                                   1080p is really being used. Left alone.

     craft (.craft-card__video-bg) sits inside a card and measured 1213px
                                   wide. A 1920-wide source is downscaled
                                   by the browser before it is ever seen,
                                   so encoding at 1280 is not a reduction
                                   in what reaches the eye — it is the
                                   same "cap the long edge at what the
                                   layout can paint" rule the image
                                   pipeline uses, applied to video. */
const CLIPS = [
  { from: path.join('assets', 'Landing.mp4'), name: 'landing', width: 1920 },
  { from: path.join('assets', 'Craft.mp4'), name: 'craft', width: 1280 },
]

/* CRF, not bitrate: these two clips have very different motion (the hero
   is slow and wide, the craft clip is close and busy) and a fixed bitrate
   would over-spend on one and starve the other. */
const VP9_CRF = 34 //  VP9's scale runs 0–63; 32–36 is the 1080p web band
const H264_CRF = 24 //  x264's runs 0–51; 23 is default, 24 is a hair below

const run = (args) => execFileSync(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] })
const mb = (f) => (fs.statSync(f).size / 1024 / 1024).toFixed(2)

fs.mkdirSync(OUT_DIR, { recursive: true })

let totalIn = 0
let totalOut = 0

for (const clip of CLIPS) {
  if (!fs.existsSync(clip.from)) {
    console.log(`skip  ${clip.from} — not found`)
    continue
  }

  const webm = path.join(OUT_DIR, `${clip.name}.webm`)
  const mp4 = path.join(OUT_DIR, `${clip.name}.mp4`)
  const inMb = +mb(clip.from)
  totalIn += inMb
  console.log(`\n${clip.from}  (${inMb} MB, HEVC)`)

  /* ── VP9 / WebM ─────────────────────────────────────────────────────
     row-mt + tiles are what keep VP9 encoding from taking all afternoon;
     they cost a fraction of a percent of efficiency. -an strips audio,
     which neither clip has and neither needs — these are muted backdrops
     and a silent track is pure bytes. */
  /* -2 keeps the height even and on the source's aspect ratio; an odd
     dimension is invalid for yuv420p and ffmpeg will refuse it. */
  const scale = ['-vf', `scale=${clip.width}:-2:flags=lanczos`]

  process.stdout.write('  vp9  … ')
  run([
    '-y', '-i', clip.from,
    ...scale,
    '-c:v', 'libvpx-vp9',
    '-crf', String(VP9_CRF), '-b:v', '0',
    '-row-mt', '1', '-tile-columns', '2', '-threads', '8',
    '-cpu-used', '2',
    '-pix_fmt', 'yuv420p',
    '-an',
    webm,
  ])
  console.log(`${mb(webm)} MB`)

  /* ── H.264 / MP4 ────────────────────────────────────────────────────
     -movflags +faststart relocates the moov atom to the head of the file.
     Without it a browser must download the whole clip before it can start
     playing — on a background video that is the difference between the
     page looking finished and looking broken for several seconds.

     High profile / level 4.0 is the widest-compatible pairing that still
     allows 1080p; yuv420p because nothing decodes 4:2:2 in a browser. */
  process.stdout.write('  h264 … ')
  run([
    '-y', '-i', clip.from,
    ...scale,
    '-c:v', 'libx264',
    '-crf', String(H264_CRF),
    '-preset', 'slow',
    '-profile:v', 'high', '-level', '4.0',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-an',
    mp4,
  ])
  console.log(`${mb(mp4)} MB`)

  totalOut += +mb(webm)
}

console.log(
  `\nsources ${totalIn.toFixed(2)} MB (HEVC — unplayable in Firefox) → ` +
    `${totalOut.toFixed(2)} MB of VP9 served first, H.264 behind it for everything else`
)
