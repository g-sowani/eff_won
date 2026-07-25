"use client";

import { useEffect, useRef } from "react";

/**
 * One IntersectionObserver per row (a fine simplification vs. the original's single
 * shared observer per list, at this app's scale). Sets width via rAF once in view,
 * then unobserves — matches animateBars()'s one-shot fill animation.
 */
export function useBarFillOnScroll<T extends HTMLElement>(widthPct: number) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              (entry.target as HTMLElement).style.width = `${widthPct}%`;
            });
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [widthPct]);

  return ref;
}
