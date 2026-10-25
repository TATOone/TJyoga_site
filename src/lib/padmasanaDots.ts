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
};

export type PadmasanaMotion = {
  breathPeriod: number;
  breathAmp: number;
  wavePeriod: number;
  waveAmp: number;
  waveBright: number;
  waveSigma: number;
  shimmerAmp: number;
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
  breathAmp: 0.08,
  wavePeriod: 9,
  waveAmp: 0.16,
  waveBright: 0.55,
  waveSigma: 0.055,
  shimmerAmp: 0.016,
};

export const PADMASANA_REDUCED_MOTION: PadmasanaMotion = {
  breathPeriod: 14,
  breathAmp: 0.035,
  wavePeriod: 18,
  waveAmp: 0.07,
  waveBright: 0.22,
  waveSigma: 0.07,
  shimmerAmp: 0.008,
};

export const PADMASANA_FRAME_MS = 1000 / 30;
export const PADMASANA_MAX_DPR = 2;

const GOLD = { r: 196, g: 154, b: 108 };

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

export function breathScale(timeSec: number, motion: PadmasanaMotion): number {
  const cycle = ((timeSec / motion.breathPeriod) % 1 + 1) % 1;
  const inhale = cycle < 0.52;
  const local = inhale ? cycle / 0.52 : (1 - cycle) / 0.48;
  const eased = 0.5 - 0.5 * Math.cos(Math.PI * clamp01(local));
  return 1 + motion.breathAmp * (eased * 2 - 1);
}

export function waveFields(
  timeSec: number,
  bounds: PadmasanaBounds,
  motion: PadmasanaMotion,
): { waveY: number; sigma: number } {
  const cycle = ((timeSec / motion.wavePeriod) % 1 + 1) % 1;
  const travel = cycle * cycle * (3 - 2 * cycle);
  return {
    waveY: bounds.bottom + (bounds.top - bounds.bottom) * travel,
    sigma: motion.waveSigma,
  };
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
  const breath = breathScale(timeSec, motion);
  const { waveY, sigma } = waveFields(timeSec, scene.bounds, motion);
  const invSigma = 1 / (2 * sigma * sigma);
  const minSide = Math.min(width, height);

  target.clear();

  for (const dot of scene.dots) {
    const dy = dot.y - waveY;
    const dx = (dot.x - scene.bounds.spineX) * 1.15;
    const wave = Math.exp(-(dy * dy + dx * dx * 0.35) * invSigma);
    const shimmer =
      motion.shimmerAmp *
      Math.sin(timeSec * 1.35 + dot.phase + dot.y * 6);
    const radius =
      dot.radius *
      width *
      breath *
      (1 + wave * motion.waveAmp) *
      (1 + shimmer);
    if (radius < 0.2) {
      continue;
    }

    const warm = clamp01(wave * motion.waveBright);
    const r = Math.round(mixChannel(dot.r, GOLD.r, warm * 0.38));
    const g = Math.round(mixChannel(dot.g, GOLD.g, warm * 0.38));
    const b = Math.round(mixChannel(dot.b, GOLD.b, warm * 0.38));

    target.dot(
      dot.x * width,
      dot.y * height,
      Math.min(radius, minSide * 0.03),
      Math.min(255, r),
      Math.min(255, g),
      Math.min(255, b),
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
    dot: (x, y, radius, r, g, b) => {
      const fill = `rgb(${r},${g},${b})`;
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
