"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ports observeReveal()'s actual behavior from the original main.js: it force-adds
 * `.in` via a double requestAnimationFrame right after mount, regardless of real
 * scroll position — it does NOT wait for genuine viewport intersection. Used for
 * dynamically-inserted grid cards (circuit cards, record cards) where the original
 * wanted them to just fade in as soon as they render.
 */
export function useMountReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isIn, setIsIn] = useState(false);

  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setIsIn(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return { ref, isIn };
}
