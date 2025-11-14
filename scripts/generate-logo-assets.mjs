// Generate raster assets from the main SVG logo using sharp
// Outputs: PNG/WebP sizes, favicon.ico, social preview

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const srcSvg = path.join(root, 'public/images/logo/tjyoga-logo.svg');
const srcCompactSvg = path.join(root, 'public/images/logo/tjyoga-logo-compact.svg');
const outDir = path.join(root, 'public/images/logo/exports');

const ensureDir = async (p) => {
  await fs.mkdir(p, { recursive: true });
};

const writeRaster = async () => {
  await ensureDir(outDir);
  const svg = await fs.readFile(srcSvg);
  const compactSvg = await fs.readFile(srcCompactSvg);

  // Only generate larger sizes (remove small ones)
  const sizes = [256, 384, 512, 1024];

  // PNG sizes: use full version for larger sizes
  await Promise.all(
    sizes.map((size) =>
      sharp(svg)
        .resize({ width: size })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(path.join(outDir, `tjyoga-logo-${size}.png`))
    )
  );

  // WEBP (lossless for crisp logos): use full version
  await Promise.all(
    [256, 512, 1024].map((size) =>
      sharp(svg)
        .resize({ width: size })
        .webp({ lossless: true })
        .toFile(path.join(outDir, `tjyoga-logo-${size}.webp`))
    )
  );

  // Favicons as PNG (use compact version, much larger: 128x128 and 64x64)
  await sharp(compactSvg).resize(128, 128).png().toFile(path.join(root, 'public', 'favicon-128.png'));
  await sharp(compactSvg).resize(64, 64).png().toFile(path.join(root, 'public', 'favicon-64.png'));
  // Standard favicon.ico (many browsers look for this first)
  await sharp(compactSvg).resize(32, 32).png().toFile(path.join(root, 'public', 'favicon.ico'));
  // Apple touch icon (use compact)
  await sharp(compactSvg).resize(180, 180).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'));

  // Social preview (OG: 1200x630) - cream background with centered logo
  const ogPath = path.join(root, 'public/images/og-image.png');
  const bg = { r: 245, g: 239, b: 231, alpha: 1 }; // cream
  const canvas = sharp({ create: { width: 1200, height: 630, channels: 4, background: bg } });
  const logoPng = await sharp(svg).resize({ width: 620 }).png().toBuffer();
  await canvas
    .composite([{ input: logoPng, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(ogPath);

  console.log('Assets generated in', outDir);
};

writeRaster().catch((err) => {
  console.error('Failed to generate logo assets:', err);
  process.exit(1);
});


