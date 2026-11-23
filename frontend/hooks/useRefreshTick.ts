"use client";

import { useEffect, useState } from "react";
import { getSeasonCalendar, isDuringRaceWeekend } from "@/lib/raceWeekend";

const MINUTE = 60 * 1000;

/** Refresh interval during a race weekend — sessions are finishing and results are being published. */
export const RACE_WEEKEND_INTERVAL_MS = 5 * MINUTE;
/** Refresh interval between race weekends — data rarely changes, so this is just a safety net. */
export const OFF_WEEKEND_INTERVAL_MS = 60 * MINUTE;
/** Used until the calendar loads, or if it can't be loaded. */
const FALLBACK_INTERVAL_MS = 15 * MINUTE;

/**
 * Returns a counter that goes up every `intervalMs` while the tab is visible.
 * Put it in a fetch effect's dependency list to re-fetch on a timer.
 *
 * - Pauses while the tab is hidden (no wasted requests in background tabs).
 * - When the tab becomes visible again and data is stale, it ticks immediately.
 * - Pass `enabled: false` to stop refreshing entirely.
 */
export function useRefreshTick(intervalMs: number, enabled: boolean = true): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let lastRun = Date.now();
    let id: ReturnType<typeof setInterval> | undefined;

    const fire = () => {
      lastRun = Date.now();
      setTick((t) => t + 1);
    };
    const start = () => {
      if (id === undefined) id = setInterval(fire, intervalMs);
    };
    const stop = () => {
      if (id !== undefined) {
        clearInterval(id);
        id = undefined;
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
        return;
      }
      if (Date.now() - lastRun >= intervalMs) fire();
      start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [intervalMs, enabled]);

  return tick;
}

/**
 * Race-weekend-aware refresh tick for live sections: every 5 min during a race weekend,
 * hourly otherwise. Re-checks which mode it's in on every tick, so it switches over on its own
 * (the live window opens 2h before FP1, so the hourly check never misses a session).
 */
export function useLiveRefreshTick(enabled: boolean = true): number {
  const [intervalMs, setIntervalMs] = useState(FALLBACK_INTERVAL_MS);
  const tick = useRefreshTick(intervalMs, enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    getSeasonCalendar()
      .then((races) => {
        if (!cancelled) {
          setIntervalMs(isDuringRaceWeekend(races) ? RACE_WEEKEND_INTERVAL_MS : OFF_WEEKEND_INTERVAL_MS);
        }
      })
      .catch(() => {
        if (!cancelled) setIntervalMs(FALLBACK_INTERVAL_MS);
      });
    return () => {
      cancelled = true;
    };
  }, [tick, enabled]);

  return tick;
}
