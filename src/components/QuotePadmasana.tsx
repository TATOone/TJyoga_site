import React, { useEffect, useRef, useState } from 'react';
import { QUOTE_PADMASANA_POSTER } from '../config/media';
import {
  PADMASANA_FRAME_MS,
  PADMASANA_MAX_DPR,
  createCanvasTarget,
  motionForPreference,
  paintPadmasanaFrame,
  unpackPadmasanaDots,
} from '../lib/padmasanaDots';

type QuotePadmasanaProps = {
  className?: string;
  fadeEdges?: boolean;
};

function canvasSupported(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  try {
    const node = document.createElement('canvas');
    return Boolean(node.getContext('2d'));
  } catch {
    return false;
  }
}

const QuotePadmasana: React.FC<QuotePadmasanaProps> = ({
  className = '',
  fadeEdges = true,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [usePoster, setUsePoster] = useState(() => !canvasSupported());

  useEffect(() => {
    if (usePoster) {
      return;
    }

    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      setUsePoster(true);
      return;
    }

    const scene = unpackPadmasanaDots();
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const clockOffsetSec = Math.random() * 512;

    let visible = true;
    let pageHidden = document.hidden;
    let reduced = reduceQuery.matches;
    let frame = 0;
    let lastDraw = 0;
    let width = 0;
    let height = 0;
    let target = createCanvasTarget(ctx, 1, 1);

    const syncSize = (): boolean => {
      const rect = root.getBoundingClientRect();
      const dpr = Math.min(PADMASANA_MAX_DPR, window.devicePixelRatio || 1);
      const nextW = Math.max(1, Math.round(rect.width * dpr));
      const nextH = Math.max(1, Math.round(rect.height * dpr));
      if (nextW === width && nextH === height) {
        return false;
      }
      width = nextW;
      height = nextH;
      canvas.width = nextW;
      canvas.height = nextH;
      target = createCanvasTarget(ctx, nextW, nextH);
      return true;
    };

    const draw = (now: number) => {
      if (width < 2 || height < 2) {
        return;
      }
      paintPadmasanaFrame(
        target,
        width,
        height,
        scene,
        now / 1000 + clockOffsetSec,
        motionForPreference(reduced),
      );
      lastDraw = now;
    };

    const tick = (now: number) => {
      frame = window.requestAnimationFrame(tick);
      if (!visible || pageHidden) {
        return;
      }
      if (now - lastDraw < PADMASANA_FRAME_MS) {
        return;
      }
      draw(now);
    };

    const start = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!frame) {
        return;
      }
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const onVisibility = () => {
      pageHidden = document.hidden;
      if (!pageHidden && visible) {
        start();
      }
    };

    const onReduce = () => {
      reduced = reduceQuery.matches;
    };

    syncSize();
    draw(performance.now());

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible && !pageHidden) {
          start();
        }
      },
      { root: null, threshold: 0.01 },
    );
    io.observe(root);

    const ro = new ResizeObserver(() => {
      if (syncSize() && visible && !pageHidden) {
        draw(performance.now());
      }
    });
    ro.observe(root);

    document.addEventListener('visibilitychange', onVisibility);
    reduceQuery.addEventListener('change', onReduce);
    start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reduceQuery.removeEventListener('change', onReduce);
    };
  }, [usePoster]);

  const frameClass = [
    'quote-padmasana',
    fadeEdges ? 'quote-padmasana--fade' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className={frameClass} aria-hidden="true">
      {usePoster ? (
        <img
          src={QUOTE_PADMASANA_POSTER}
          alt=""
          width={960}
          height={540}
          decoding="async"
          draggable={false}
        />
      ) : (
        <canvas ref={canvasRef} />
      )}
    </div>
  );
};

export default QuotePadmasana;
