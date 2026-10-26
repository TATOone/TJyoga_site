import { QUOTE_PADMASANA_DOT_PACK } from '../data/quotePadmasanaDots';

export type PadmasanaDot = {
  x: number;
  y: number;
  radius: number;
  ink: number;
  r: number;
  g: number;
  b: number;
  phase: number;
  isFigure: boolean;
};

export type PadmasanaMotion = {
  breathPeriod: number;
  breathAmp: number;
  wavePeriod: number;
  waveAmp: number;
  waveBright: number;
  waveSigma: number;
  shimmerAmp: number;
  figureOpacityAmp: number;
  fieldBreathShare: number;
};

export type PadmasanaBounds = {
  top: number;
  bottom: number;
  spineX: number;
};

export type PadmasanaScene = {
  dots: PadmasanaDot[];
  bounds: PadmasanaBounds;
};

export const PADMASANA_MOTION: PadmasanaMotion = {
  breathPeriod: 7,
  breathAmp: 0.11,
  wavePeriod: 9.4,
  waveAmp: 0.16,
  waveBright: 0.72,
  waveSigma: 0.22,
  shimmerAmp: 0.016,
  figureOpacityAmp: 0.06,
  fieldBreathShare: 0.22,
};

export const PADMASANA_REDUCED_MOTION: PadmasanaMotion = {
  breathPeriod: 14,
  breathAmp: 0.055,
  wavePeriod: 18.8,
  waveAmp: 0.08,
  waveBright: 0.44,
  waveSigma: 0.24,
  shimmerAmp: 0.01,
  figureOpacityAmp: 0.035,
  fieldBreathShare: 0.18,
};

export const PADMASANA_FRAME_MS = 1000 / 30;
export const PADMASANA_MAX_DPR = 2;

const WAVE_ACCENT = { r: 200, g: 92, b: 60 };
const WAVE_COLOR_MIX = 0.49;
const LATERAL_INV_SIGMA = 1 / (2 * 0.084 * 0.084);

let cachedScene: PadmasanaScene | null = null;

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function shimmerPhase(col: number, row: number): number {
  return ((col * 12.9898 + row * 78.233) % 1) * Math.PI * 2;
}

export function unpackPadmasanaDots(
  pack = QUOTE_PADMASANA_DOT_PACK,
): PadmasanaScene {
  if (cachedScene) {
    return cachedScene;
  }

  const bytes = decodeBase64(pack.packed);
  const dots: PadmasanaDot[] = [];

  for (let i = 0; i < pack.count; i += 1) {
    const offset = i * 7;
    const col = bytes[offset];
    const row = bytes[offset + 1];
    const radius = bytes[offset + 2] / pack.radiusScale / pack.srcW;
    const ink = bytes[offset + 3] / 255;
    const x = (pack.originX + col * pack.pitch) / pack.srcW;
    const y = (pack.originY + row * pack.pitch) / pack.srcH;
    dots.push({
      x,
      y,
      radius,
      ink,
      r: bytes[offset + 4],
      g: bytes[offset + 5],
      b: bytes[offset + 6],
      phase: shimmerPhase(col, row),
      isFigure: radius >= 4 / pack.srcW,
    });
  }

  cachedScene = {
    dots,
    bounds: {
      top: pack.figureTop,
      bottom: pack.figureBottom,
      spineX: pack.spineX,
    },
  };
  return cachedScene;
}

export function motionForPreference(reduced: boolean): PadmasanaMotion {
  return reduced ? PADMASANA_REDUCED_MOTION : PADMASANA_MOTION;
}

function clamp01(value: number): number {
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
}

function mixChannel(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

export function breathAmount(timeSec: number, motion: PadmasanaMotion): number {
  return 0.5 + 0.5 * Math.sin((Math.PI * 2 * timeSec) / motion.breathPeriod);
}

export function breathScale(timeSec: number, motion: PadmasanaMotion): number {
  return (
    1 + motion.breathAmp * Math.sin((Math.PI * 2 * timeSec) / motion.breathPeriod)
  );
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function cosineBump(distance: number, halfWidth: number): number {
  const width = halfWidth <= 0 ? 1 : halfWidth;
  const t = Math.abs(distance) / width;
  if (t >= 1) {
    return 0;
  }
  return 0.5 + 0.5 * Math.cos(Math.PI * t);
}

function wrappedCosinePulse(
  u: number,
  center: number,
  halfWidth: number,
): number {
  return (
    cosineBump(u - center, halfWidth) +
    cosineBump(u - (center - 1), halfWidth) +
    cosineBump(u - (center + 1), halfWidth)
  );
}

export function spineCoordinate(y: number, bounds: PadmasanaBounds): number {
  const span = bounds.bottom - bounds.top;
  if (span <= 0) {
    return 0;
  }
  return (bounds.bottom - y) / span;
}

export function waveAmount(
  u: number,
  timeSec: number,
  motion: PadmasanaMotion,
): number {
  const center = fract(timeSec / motion.wavePeriod);
  const twin = center < 0.5 ? center + 0.5 : center - 0.5;
  return Math.min(
    1,
    wrappedCosinePulse(u, center, motion.waveSigma) +
      wrappedCosinePulse(u, twin, motion.waveSigma),
  );
}

export type PadmasanaDrawTarget = {
  clear: () => void;
  dot: (
    x: number,
    y: number,
    radius: number,
    r: number,
    g: number,
    b: number,
    a: number,
  ) => void;
};

export function paintPadmasanaFrame(
  target: PadmasanaDrawTarget,
  width: number,
  height: number,
  scene: PadmasanaScene,
  timeSec: number,
  motion: PadmasanaMotion,
): void {
  const amount = breathAmount(timeSec, motion);
  const figureBreath = breathScale(timeSec, motion);
  const fieldBreath =
    1 +
    motion.breathAmp *
      motion.fieldBreathShare *
      Math.sin((Math.PI * 2 * timeSec) / motion.breathPeriod);
  const minSide = Math.min(width, height);

  target.clear();

  for (const dot of scene.dots) {
    const u = spineCoordinate(dot.y, scene.bounds);
    const dx = (dot.x - scene.bounds.spineX) * 0.85;
    const lateral = Math.exp(-(dx * dx * 0.18) * LATERAL_INV_SIGMA);
    const wave = dot.isFigure
      ? waveAmount(u, timeSec, motion) * lateral
      : 0;
    const shimmer = dot.isFigure
      ? motion.shimmerAmp * Math.sin(timeSec * 1.35 + dot.phase + dot.y * 6)
      : 0;
    const scale = dot.isFigure ? figureBreath : fieldBreath;
    const radius =
      dot.radius * width * scale * (1 + wave * motion.waveAmp) * (1 + shimmer);
    if (radius < 0.2) {
      continue;
    }

    const warm = dot.isFigure ? clamp01(wave * motion.waveBright) : 0;
    const r = Math.round(mixChannel(dot.r, WAVE_ACCENT.r, warm * WAVE_COLOR_MIX));
    const g = Math.round(mixChannel(dot.g, WAVE_ACCENT.g, warm * WAVE_COLOR_MIX));
    const b = Math.round(mixChannel(dot.b, WAVE_ACCENT.b, warm * WAVE_COLOR_MIX));
    const alpha = dot.isFigure
      ? clamp01(0.92 + amount * motion.figureOpacityAmp + warm * 0.1)
      : 1;

    target.dot(
      dot.x * width,
      dot.y * height,
      Math.min(radius, minSide * 0.034),
      Math.min(255, r),
      Math.min(255, g),
      Math.min(255, b),
      alpha,
    );
  }
}

export function createCanvasTarget(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): PadmasanaDrawTarget {
  let lastFill = '';
  return {
    clear: () => {
      ctx.clearRect(0, 0, width, height);
    },
    dot: (x, y, radius, r, g, b, a) => {
      const fill = `rgba(${r},${g},${b},${a.toFixed(3)})`;
      if (fill !== lastFill) {
        ctx.fillStyle = fill;
        lastFill = fill;
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    },
  };
}
