"use client";

import { useEffect, useRef, useState } from "react";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduceMotion || !hasFinePointer) return;

    const el = ref.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let curX = targetX;
    let curY = targetY;
    let rafId: number | null = null;

    function renderGlow() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      if (el) el.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1) {
        rafId = requestAnimationFrame(renderGlow);
      } else {
        rafId = null;
      }
    }

    function wake() {
      if (!rafId) rafId = requestAnimationFrame(renderGlow);
    }

    function onMouseMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      setActive(true);
      wake();
    }

    function onMouseLeave() {
      setActive(false);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={ref} className={`cursor-glow${active ? " active" : ""}`} aria-hidden="true" />;
}
