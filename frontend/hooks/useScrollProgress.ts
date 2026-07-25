"use client";

import { useEffect, useState } from "react";

export function useScrollProgress() {
  const [scrolled, setScrolled] = useState(false);
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      setProgressPct(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  return { scrolled, progressPct };
}
