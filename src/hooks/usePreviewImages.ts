/**
 * Hook to load preview images for the marquee.
 *
 * In a Vite project, files in /public are served as static assets at the root path.
 * Add new images to /public/images/ and list them here to include them in the marquee.
 *
 * To auto-generate this list, you can run:
 *   node -e "const fs=require('fs');const p='./public/images';console.log(JSON.stringify(fs.readdirSync(p).filter(f=>/\.(png|jpg|jpeg|webp|gif)$/i.test(f)).map(f=>'/images/'+f)))"
 */

import { useMemo } from 'react';

// ──────────────────────────────────────────────────────────────────────────────
// Add any new screenshots / images from /public/images/ here
// ──────────────────────────────────────────────────────────────────────────────
const IMAGE_FILENAMES: string[] = [
  'Screenshot 2026-02-21 141101.png',
  'Screenshot 2026-02-21 141110.png',
  'Screenshot 2026-02-21 141117.png',
  'Screenshot 2026-02-21 141134.png',
  'Screenshot 2026-02-21 141141.png',
  'Screenshot 2026-02-21 141206.png',
];

export function usePreviewImages(): string[] {
  return useMemo(
    () => IMAGE_FILENAMES.map((name) => `/images/${encodeURIComponent(name)}`),
    []
  );
}
