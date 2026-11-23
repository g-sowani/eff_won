"use client";

import { useEffect, useState } from "react";

const LIGHTS = 5;
const STEP_MS = 650;

/**
 * Five-light start gantry: once the page loader clears, the lights come on one
 * by one, hold, then all go out together ("lights out"). Purely decorative.
 * Under prefers-reduced-motion it skips straight to the final (out) state.
 */
export default function StartLights() {
  // 0..5 = number of lights lit; 6 = lights out.
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off sync to a media query
      setStep(LIGHTS + 1);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      // Give the loader (load + 400ms, then a 600ms fade) time to clear.
      for (let i = 1; i <= LIGHTS; i++) {
        timers.push(setTimeout(() => setStep(i), 900 + i * STEP_MS));
      }
      timers.push(setTimeout(() => setStep(LIGHTS + 1), 900 + LIGHTS * STEP_MS + 900));
    };
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
    return () => {
      window.removeEventListener("load", run);
      timers.forEach(clearTimeout);
    };
  }, []);

  const out = step > LIGHTS;

  return (
    <div className={`start-lights${out ? " is-out" : ""}`} aria-hidden="true">
      {Array.from({ length: LIGHTS }).map((_, i) => (
        <div className="start-pod" key={i}>
          <span className={`start-lamp${!out && step > i ? " on" : ""}`} />
          <span className={`start-lamp${!out && step > i ? " on" : ""}`} />
        </div>
      ))}
    </div>
  );
}
