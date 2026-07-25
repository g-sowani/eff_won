"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Backs <Reveal>: adds `.in` once the element crosses the viewport threshold,
 * then stops observing (one-shot, matching the original single shared
 * IntersectionObserver's unobserve-after-hit behavior).
 */
export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isIn, setIsIn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIn(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, isIn };
}
