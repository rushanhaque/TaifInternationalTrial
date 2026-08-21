/* ============ video sources ============
   The clips are self-hosted out of public/video/, produced from the raw
   files in assets/ by scripts/encode-video.mjs — run `npm run video` after
   replacing a source.

   EACH CLIP IS A LIST, IN PREFERENCE ORDER, and that is the whole point of
   this file. A <video> takes the first <source> it can decode, so ordering
   WebM ahead of MP4 hands VP9 to every modern browser and leaves H.264 as
   the floor for everything else.

   The raw files are HEVC (H.265), which Firefox cannot decode at all and
   Chrome only plays with hardware support — pointing the site straight at
   those would have left a dead black box behind the copy for a large share
   of visitors. Neither of these lists should ever contain an HEVC file.

   Paths, not imports: these live in public/ and are served as static files
   rather than going through the bundler.                                  */

export const LANDING_VIDEO = [
  { src: '/video/landing.webm', type: 'video/webm' },
  { src: '/video/landing.mp4', type: 'video/mp4' },
]

export const CRAFT_VIDEO = [
  { src: '/video/craft.webm', type: 'video/webm' },
  { src: '/video/craft.mp4', type: 'video/mp4' },
]
