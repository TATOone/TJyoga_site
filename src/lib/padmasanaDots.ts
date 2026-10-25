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
  breathAmp: 0.14,
  wavePeriod: 9,
  waveAmp: 0.23,
  waveBright: 0.9,
  waveSigma: 0.084,
  shimmerAmp: 0.016,
  figureOpacityAmp: 0.09,
  fieldBreathShare: 0.22,
};

export const PADMASANA_REDUCED_MOTION: PadmasanaMotion = {
  breathPeriod: 14,
  breathAmp: 0.07,
  wavePeriod: 18,
  waveAmp: 0.12,
  waveBright: 0.55,
  waveSigma: 0.095,
  shimmerAmp: 0.01,
  figureOpacityAmp: 0.055,
  fieldBreathShare: 0.18,
};

export const PADMASANA_FRAME_MS = 1000 / 30;
export const PADMASANA_MAX_DPR = 2;

const WAVE_ACCENT = { r: 200, g: 92, b: 60 };

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
  const cycle = ((timeSec / motion.breathPeriod) % 1 + 1) % 1;
  const inhale = cycle < 0.52;
  const local = inhale ? cycle / 0.52 : (1 - cycle) / 0.48;
  return 0.5 - 0.5 * Math.cos(Math.PI * clamp01(local));
}

export function breathScale(timeSec: number, motion: PadmasanaMotion): number {
  return 1 + motion.breathAmp * (breathAmount(timeSec, motion) * 2 - 1);
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
  const figureBreath = 1 + motion.breathAmp * (amount * 2 - 1);
  const fieldBreath =
    1 + motion.breathAmp * motion.fieldBreathShare * (amount * 2 - 1);
  const { waveY, sigma } = waveFields(timeSec, scene.bounds, motion);
  const invSigma = 1 / (2 * sigma * sigma);
  const minSide = Math.min(width, height);

  target.clear();

  for (const dot of scene.dots) {
    const dy = dot.y - waveY;
    const dx = (dot.x - scene.bounds.spineX) * 0.85;
    const wave = dot.isFigure
      ? Math.exp(-(dy * dy + dx * dx * 0.18) * invSigma)
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
    const r = Math.round(mixChannel(dot.r, WAVE_ACCENT.r, warm * 0.82));
    const g = Math.round(mixChannel(dot.g, WAVE_ACCENT.g, warm * 0.82));
    const b = Math.round(mixChannel(dot.b, WAVE_ACCENT.b, warm * 0.82));
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
