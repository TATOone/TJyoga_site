/** Shared motion: cubic-bezier(0.22, 1, 0.36, 1). Animate only transform/opacity. */

export const EASE_OUT_QUART = [0.22, 1, 0.36, 1] as const;

export const REVEAL_TRANSITION = {
  duration: 0.7,
  ease: EASE_OUT_QUART,
} as const;

export const REVEAL_HIDDEN = { opacity: 0, y: 32 } as const;
export const REVEAL_VISIBLE = { opacity: 1, y: 0 } as const;

export const revealTransition = (delay = 0) => ({
  duration: 0.7,
  delay,
  ease: EASE_OUT_QUART,
});
