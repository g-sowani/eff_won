"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-spy: returns the id of whichever of `ids` currently crosses a thin
 * band around the middle of the viewport, or null when none does (e.g. on the
 * hero, or on a page that doesn't have these sections at all).
 */
export function useActiveSection(ids: string[], enabled = true): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (!enabled) return;
    const els = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // Several can overlap the band briefly; prefer the first in page order.
        setActive(els.find((el) => visible.has(el.id))?.id ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      setActive(null);
    };
  }, [key, enabled]);

  return enabled ? active : null;
}
