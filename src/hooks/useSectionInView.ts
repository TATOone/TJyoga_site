import { useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * Intersection for home lazy sections: keep scroll reveal, but fire
 * a bit before the heading is fully on screen so first paint is not blank.
 */
export const useSectionInView = <T extends HTMLElement = HTMLHeadingElement>() => {
  const ref = useRef<T | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.08, margin: '160px 0px' });
  return { ref, isInView };
};
