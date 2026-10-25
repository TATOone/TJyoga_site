/**
 * Offline frames of the quote-block canvas animation (no browser).
 * Mirrors src/lib/padmasanaDots.ts enough to sanity-check the look.
 * Usage: node scripts/render-padmasana-frames.mjs [outdir]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = process.argv[2] || join(ROOT, 'artifacts/padmasana-frames');
const WIDTH = 960;
const HEIGHT = 540;
const CREAM = { r: 245, g: 239, b: 231 };
const WAVE_ACCENT = { r: 200, g: 92, b: 60 };
const MOTION = {
  breathPeriod: 7,
  breathAmp: 0.14,
  wavePeriod: 9,
  waveAmp: 0.23,
  waveBright: 0.9,
  waveSigma: 0.084,
  shimmerAmp: 0.016,
  figureOpacityAmp: 0.09,
  fieldBreathShare: 0.22,
};

const source = readFileSync(join(ROOT, 'src/data/quotePadmasanaDots.ts'), 'utf8');
const num = (name) => {
  const match = source.match(new RegExp(`${name}: ([0-9.]+)`));
  if (!match) {
    throw new Error(`missing ${name}`);
  }
  return Number(match[1]);
};
const packedMatch = source.match(/packed: '([^']+)'/);
if (!packedMatch) {
  throw new Error('missing packed');
}

const pack = {
  cols: num('cols'),
  rows: num('rows'),
  srcW: num('srcW'),
  srcH: num('srcH'),
  originX: num('originX'),
  originY: num('originY'),
  pitch: num('pitch'),
  radiusScale: num('radiusScale'),
  count: num('count'),
  figureTop: num('figureTop'),
  figureBottom: num('figureBottom'),
  spineX: num('spineX'),
  packed: packedMatch[1],
};

const bytes = Buffer.from(pack.packed, 'base64');
const dots = [];
for (let i = 0; i < pack.count; i += 1) {
  const offset = i * 7;
  const col = bytes[offset];
  const row = bytes[offset + 1];
  const radius = bytes[offset + 2] / pack.radiusScale / pack.srcW;
  dots.push({
    x: (pack.originX + col * pack.pitch) / pack.srcW,
    y: (pack.originY + row * pack.pitch) / pack.srcH,
    radius,
    r: bytes[offset + 4],
    g: bytes[offset + 5],
    b: bytes[offset + 6],
    phase: ((col * 12.9898 + row * 78.233) % 1) * Math.PI * 2,
    isFigure: radius >= 4 / pack.srcW,
  });
}

const top = pack.figureTop;
const bottom = pack.figureBottom;
const spineX = pack.spineX;

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const breathAmount = (timeSec) => {
  const cycle = ((timeSec / MOTION.breathPeriod) % 1 + 1) % 1;
  const inhale = cycle < 0.52;
  const local = inhale ? cycle / 0.52 : (1 - cycle) / 0.48;
  return 0.5 - 0.5 * Math.cos(Math.PI * clamp01(local));
};

class SoftwareCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
    this.clear();
  }

  clear() {
    const { data, width, height } = this;
    for (let i = 0; i < width * height; i += 1) {
      const o = i * 4;
      data[o] = CREAM.r;
      data[o + 1] = CREAM.g;
      data[o + 2] = CREAM.b;
      data[o + 3] = 255;
    }
  }

  dot(cx, cy, radius, r, g, b, a = 1) {
    const x0 = Math.max(0, Math.floor(cx - radius - 1));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + radius + 1));
    const y0 = Math.max(0, Math.floor(cy - radius - 1));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + radius + 1));

    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const dist = Math.hypot(dx, dy);
        const coverage = Math.max(0, Math.min(1, radius + 0.5 - dist)) * a;
        if (coverage <= 0) {
          continue;
        }
        const o = (y * this.width + x) * 4;
        this.data[o] = Math.round(this.data[o] * (1 - coverage) + r * coverage);
        this.data[o + 1] = Math.round(
          this.data[o + 1] * (1 - coverage) + g * coverage,
        );
        this.data[o + 2] = Math.round(
          this.data[o + 2] * (1 - coverage) + b * coverage,
        );
      }
    }
  }

  applyEdgeFade() {
    const { data, width, height } = this;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const nx = (x + 0.5) / width - 0.5;
        const ny = (y + 0.5) / height - 0.46;
        const e = (nx * nx) / (0.72 * 0.72) + (ny * ny) / (0.78 * 0.78);
        let t = 0;
        if (e > 0.36) {
          t = Math.min(1, (e - 0.36) / (0.78 - 0.36));
          t *= t * (3 - 2 * t);
        }
        if (t <= 0) {
          continue;
        }
        const o = (y * width + x) * 4;
        data[o] = Math.round(data[o] * (1 - t) + CREAM.r * t);
        data[o + 1] = Math.round(data[o + 1] * (1 - t) + CREAM.g * t);
        data[o + 2] = Math.round(data[o + 2] * (1 - t) + CREAM.b * t);
      }
    }
  }
}

const paint = (target, timeSec, opts = {}) => {
  const amount = breathAmount(timeSec);
  const figureBreath = 1 + MOTION.breathAmp * (amount * 2 - 1);
  const fieldBreath =
    1 + MOTION.breathAmp * MOTION.fieldBreathShare * (amount * 2 - 1);
  const cycle = ((timeSec / MOTION.wavePeriod) % 1 + 1) % 1;
  const travel = cycle * cycle * (3 - 2 * cycle);
  const waveY = bottom + (top - bottom) * travel;
  const invSigma = 1 / (2 * MOTION.waveSigma * MOTION.waveSigma);
  const minSide = Math.min(WIDTH, HEIGHT);
  const waveAmp = opts.rest ? 0 : MOTION.waveAmp;
  const waveBright = opts.rest ? 0 : MOTION.waveBright;

  target.clear();
  for (const dot of dots) {
    const dy = dot.y - waveY;
    const dx = (dot.x - spineX) * 0.85;
    const wave = dot.isFigure
      ? Math.exp(-(dy * dy + dx * dx * 0.18) * invSigma)
      : 0;
    const shimmer = dot.isFigure
      ? MOTION.shimmerAmp * Math.sin(timeSec * 1.35 + dot.phase + dot.y * 6)
      : 0;
    const scale = dot.isFigure ? figureBreath : fieldBreath;
    const radius =
      dot.radius * WIDTH * scale * (1 + wave * waveAmp) * (1 + shimmer);
    if (radius < 0.2) {
      continue;
    }
    const warm = dot.isFigure ? clamp01(wave * waveBright) : 0;
    const mix = warm * 0.82;
    const alpha = dot.isFigure
      ? clamp01(0.92 + amount * MOTION.figureOpacityAmp + warm * 0.1)
      : 1;
    target.dot(
      dot.x * WIDTH,
      dot.y * HEIGHT,
      Math.min(radius, minSide * 0.034),
      Math.round(dot.r + (WAVE_ACCENT.r - dot.r) * mix),
      Math.round(dot.g + (WAVE_ACCENT.g - dot.g) * mix),
      Math.round(dot.b + (WAVE_ACCENT.b - dot.b) * mix),
      alpha,
    );
  }
};

const frames = [
  { name: 'padmasana_contrast_rest.png', time: 3.5, rest: true },
  { name: 'padmasana_contrast_wave_base.png', time: 1.8 },
  { name: 'padmasana_contrast_wave_crown.png', time: 7.6 },
];

mkdirSync(OUT_DIR, { recursive: true });

for (const frame of frames) {
  const surface = new SoftwareCanvas(WIDTH, HEIGHT);
  paint(surface, frame.time, { rest: Boolean(frame.rest) });
  surface.applyEdgeFade();
  const file = join(OUT_DIR, frame.name);
  await sharp(Buffer.from(surface.data), {
    raw: { width: WIDTH, height: HEIGHT, channels: 4 },
  })
    .png()
    .toFile(file);
  console.log('wrote', file);
}

writeFileSync(
  join(OUT_DIR, 'readme.txt'),
  [
    `dots=${dots.length}`,
    `cols=${pack.cols}`,
    `rows=${pack.rows}`,
    `packedBytes=${bytes.length}`,
    `top=${top.toFixed(3)} bottom=${bottom.toFixed(3)} spineX=${spineX.toFixed(3)}`,
  ].join('\n'),
);
