/**
 * Renders brand SVGs to PNGs at all required sizes.
 *
 * Source of truth:
 *   brand/logo.svg       → 512×512 app icon (used for all PWA icon sizes)
 *   brand/favicon.svg    → small favicon (copied straight to public/)
 *   brand/og-image.svg   → 1200×630 social share image
 *
 * Outputs:
 *   public/favicon.svg
 *   public/og-image.png
 *   public/icons/icon-{72,96,128,144,152,192,384,512}.png
 */

import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT   = join(__dirname, '..');
const BRAND  = join(ROOT, 'brand');
const PUBLIC = join(ROOT, 'public');
const ICONS  = join(PUBLIC, 'icons');

mkdirSync(ICONS, { recursive: true });

const logoSvg = readFileSync(join(BRAND, 'logo.svg'));
const ogSvg   = readFileSync(join(BRAND, 'og-image.svg'));

// 1) Copy favicon SVG as-is (browsers render vector faviconss directly)
copyFileSync(join(BRAND, 'favicon.svg'), join(PUBLIC, 'favicon.svg'));
console.log('  public/favicon.svg');

// 2) Render all PWA icon sizes from logo.svg
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
for (const size of ICON_SIZES) {
  const out = join(ICONS, `icon-${size}.png`);
  await sharp(logoSvg, { density: 300 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`  public/icons/icon-${size}.png`);
}

// 3) Render OG image at 1200×630
await sharp(ogSvg, { density: 200 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile(join(PUBLIC, 'og-image.png'));
console.log('  public/og-image.png');

console.log(`\nBrand assets rendered from brand/*.svg.`);
