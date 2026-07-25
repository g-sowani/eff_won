"use client";

import { useEffect, useState } from "react";

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeParts(target: Date | null): CountdownParts {
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

/**
 * Ticks every second toward `target`. Uses the React-endorsed "adjust state
 * during render" pattern (comparing against a mirrored previous target) to reset
 * parts synchronously when `target` changes, instead of setState-in-effect. The
 * effect itself only owns the recurring `setInterval` and its cleanup, which is
 * what guarantees the "clear before re-arm" invariant the original main.js had to
 * do manually — it clears whenever `target` changes or the component unmounts.
 */
export function useCountdown(target: Date | null): CountdownParts {
  const [prevTarget, setPrevTarget] = useState(target);
  const [parts, setParts] = useState<CountdownParts>(() => computeParts(target));

  if (target !== prevTarget && target?.getTime() !== prevTarget?.getTime()) {
    setPrevTarget(target);
    setParts(computeParts(target));
  }

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => {
      const next = computeParts(target);
      setParts(next);
      if (next.expired) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return parts;
}
