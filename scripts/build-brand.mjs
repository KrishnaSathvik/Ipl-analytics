/**
 * Regenerates public/og-image.png from brand/og-image.svg.
 *
 * The SVG template embeds public/logo.png as the brand mark via a
 * {{LOGO_SRC}} placeholder that we replace with a base64 data URI
 * (sharp's libvips blocks file: refs for security, so we can't link
 * directly).
 *
 * The favicon.io files (favicon.ico, favicon-16x16.png, favicon-32x32.png,
 * apple-touch-icon.png, android-chrome-{192,512}.png, favicon.svg) live
 * directly in public/ and don't need regeneration — they come from
 * favicon.io when you refresh the brand.
 *
 * Run:  npm run brand
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT   = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const BRAND  = join(ROOT, 'brand');

const logoPng     = readFileSync(join(PUBLIC, 'logo.png'));
const logoDataUri = `data:image/png;base64,${logoPng.toString('base64')}`;
const ogSvg       = Buffer.from(
  readFileSync(join(BRAND, 'og-image.svg'), 'utf8').replaceAll('{{LOGO_SRC}}', logoDataUri)
);

await sharp(ogSvg, { density: 200 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile(join(PUBLIC, 'og-image.png'));

console.log('  public/og-image.png');
console.log('\nOG image rebuilt from public/logo.png.');
