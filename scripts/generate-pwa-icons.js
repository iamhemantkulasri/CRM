// Generates PWA raster icons from public/icons/icon-source.svg
// Run: node scripts/generate-pwa-icons.js
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const src = join(root, 'public', 'icons', 'icon-source.svg');
const outDir = join(root, 'public', 'icons');

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

for (const t of targets) {
  await sharp(src, { density: 512 })
    .resize(t.size, t.size, { fit: 'contain', background: '#2563EB' })
    .png()
    .toFile(join(outDir, t.file));
  console.log(`wrote ${t.file} (${t.size}x${t.size})`);
}
