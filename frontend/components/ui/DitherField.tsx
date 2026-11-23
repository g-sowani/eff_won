"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed, full-viewport dot-matrix backdrop for the home page: a circuit
 * rushing toward the viewer, where page scroll is distance traveled.
 *
 * A procedural scene is sampled once per cell, ordered-dithered (4x4 Bayer)
 * down to a small palette, and drawn as square dots with a 1px gap. Solid
 * colors only, no gradients.
 *
 * Scroll drives the journey:
 * - distance: kerbs/track texture are fixed in world space, so scrolling makes
 *   them rush toward you (smoothed, so it has a little inertia);
 * - corners: road curvature varies along the track, so bends come and go;
 * - time of day: dusk at the top of the page, starry night at the bottom;
 * - finish line: a checkered line sits at the end of the page's distance and
 *   arrives as you reach the bottom;
 * - legibility: the scene dims behind the data sections, then returns to full
 *   strength for the finish.
 *
 * Re-reads the palette when `data-theme` flips. Under prefers-reduced-motion
 * there's no animation loop, and it redraws once per scroll instead.
 */

// Dark → light in dark mode (bright = white-hot); light → deep in light mode.
// Index 0 is also the gap color between dots, so it matches --bg.
const PALETTES: Record<"dark" | "light", string[]> = {
  dark: ["#08090d", "#170d13", "#3a0c10", "#7d0a09", "#e10600", "#ffc9c4"],
  light: ["#f3f4f8", "#f8dedb", "#f4aaa3", "#ec5d53", "#e10600", "#8a0400"],
};

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** World units traveled per pixel scrolled. */
const DIST_PER_PX = 0.03;
/** How far past the end of the scroll the finish line sits (keeps it mid-ground, not at your feet). */
const FINISH_AHEAD = 0.36;
/** Depth of the checkered band, in world units. */
const FINISH_DEPTH = 0.3;
const HORIZON = 0.64;
const TRACK_HALF_WIDTH = 0.3;

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number): number {
  return noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Road curvature at a world position: a mix of two slow waves, so corners vary in direction and tightness. */
const curvature = (d: number) => 0.0022 * Math.sin(d * 0.045) + 0.0011 * Math.sin(d * 0.11 + 1.3);

interface Frame {
  t: number; // seconds, for clouds/twinkle
  dist: number; // world distance from scroll (smoothed)
  roll: number; // dist + a slow idle crawl, for kerb/track texture
  night: number; // 0 dusk → 1 night
  dim: number; // 0 full scene → 1 dimmed behind content
  finishZ: number; // world position of the finish line
  aspect: number;
  col: number;
  row: number;
}

/** Scene brightness in [0, 1] at normalized (u, v). */
function sample(u: number, v: number, f: Frame): number {
  const haze = 0.4 * (1 - 0.55 * f.night);

  if (v < HORIZON) {
    const d = HORIZON - v;
    const cx = (u - 0.5) * f.aspect;
    let val = haze * Math.exp(-d * 5) + 0.16 * (1 - 0.5 * f.night) * Math.exp(-cx * cx * 2.5 - d * 3.5);

    const n = fbm(u * f.aspect * 2.6 + f.t * 0.025 + f.dist * 0.01, v * 5.5 - f.t * 0.004);
    val += Math.max(0, n - 0.52) * (0.5 + 0.9 * (1 - d)) * (1 - 0.55 * f.night);

    // Floodlight disc, upper right.
    const dx = (u - 0.82) * f.aspect;
    const dy = v - 0.24;
    const r = Math.sqrt(dx * dx + dy * dy);
    if (r < 0.07) return 1;
    val += 0.3 * Math.exp(-(r - 0.07) * 16);

    // Stars come out as night falls.
    if (f.night > 0.2) {
      const h = hash(f.col * 1.31, f.row * 1.77);
      if (h > 0.994) {
        const twinkle = 0.65 + 0.35 * Math.sin(f.t * 2.5 + h * 977);
        val = Math.max(val, smoothstep(0.2, 0.7, f.night) * twinkle);
      }
    }
    return val * (1 - f.dim * 0.6);
  }

  // Ground: perspective projection of a flat world.
  const dz = Math.max(v - HORIZON, 0.004);
  const z = 0.1 / dz;
  const bend = curvature(f.dist + z * 0.5) * z * z;
  const x = ((u - 0.5) * f.aspect * 0.1) / dz - bend;
  const ax = Math.abs(x);
  const W = TRACK_HALF_WIDTH;
  const wz = z + f.roll; // world position, for texture that should rush past

  let val: number;
  if (ax < W - 0.05) {
    const fz = z + f.dist; // finish line is fixed to scroll distance, not the idle crawl
    if (fz > f.finishZ && fz < f.finishZ + FINISH_DEPTH) {
      val = ((Math.floor(x * 14) + Math.floor(((fz - f.finishZ) / FINISH_DEPTH) * 3)) & 1) === 0 ? 1 : 0.04;
    } else {
      val = 0.06 + noise(x * 18, wz * 6) * 0.08;
    }
  } else if (ax < W) {
    val = 0.75; // white edge line
  } else if (ax < W + 0.16) {
    const stripe = (wz * 1.6) % 1;
    val = stripe < 0.5 ? 1 : 0.62; // red / white kerb
  } else {
    val = 0.18 + noise(x * 3, wz * 1.2) * 0.14;
  }

  // Fade into the horizon haze with distance.
  const fog = Math.exp(-dz * 16);
  val = val * (1 - fog) + haze * fog;
  return val * (1 - f.dim * 0.4);
}

function hexToABGR(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (255 << 24) | (b << 16) | (g << 8) | r; // little-endian RGBA in a Uint32
}

export default function DitherField({
  className = "",
  finishSelector,
}: {
  className?: string;
  /** Element whose bottom edge marks the end of the journey (finish line, full night). */
  finishSelector?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let palette: number[] = [];
    let cell = 4;
    let cols = 0;
    let rows = 0;
    let image: ImageData | null = null;
    let pixels: Uint32Array | null = null;
    let raf = 0;
    let lastFrame = 0;
    const start = performance.now();
    let dist = window.scrollY * DIST_PER_PX; // smoothed toward the scroll target

    const readPalette = () => {
      const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      palette = PALETTES[theme].map(hexToABGR);
    };

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      cell = width > 1800 ? 5 : 4;
      cols = Math.max(1, Math.ceil(width / cell));
      rows = Math.max(1, Math.ceil(height / cell));
      canvas.width = cols * cell;
      canvas.height = rows * cell;
      image = ctx.createImageData(canvas.width, canvas.height);
      pixels = new Uint32Array(image.data.buffer);
    };

    const scrollState = () => {
      const vh = window.innerHeight;
      const pageMax = Math.max(1, document.documentElement.scrollHeight - vh);
      // The journey ends when the finish element's bottom meets the viewport bottom
      // (so the line isn't hidden under the footer), or at the page bottom without one.
      const finishEl = finishSelector ? document.querySelector<HTMLElement>(finishSelector) : null;
      const max = finishEl
        ? Math.min(pageMax, Math.max(1, finishEl.offsetTop + finishEl.offsetHeight - vh))
        : pageMax;
      const y = window.scrollY;
      const progress = Math.min(1, y / max);
      return {
        target: y * DIST_PER_PX,
        finishZ: max * DIST_PER_PX + FINISH_AHEAD,
        night: progress,
        // Full scene on the hero and at the finish; dimmed behind the sections in between.
        dim: smoothstep(vh * 0.45, vh * 0.95, y) * (1 - smoothstep(max - vh * 0.9, max - vh * 0.2, y)),
      };
    };

    const draw = (now: number) => {
      if (!image || !pixels) return;
      const s = scrollState();
      const t = (now - start) / 1000;
      const f: Frame = {
        t,
        dist,
        roll: dist + (reduceMotion ? 0 : t * 0.6),
        night: s.night,
        dim: s.dim,
        finishZ: s.finishZ,
        aspect: cols / rows,
        col: 0,
        row: 0,
      };
      const W = canvas.width;
      const levels = palette.length - 1;
      const dot = cell - 1;
      pixels.fill(palette[0]);

      for (let r = 0; r < rows; r++) {
        const v = (r + 0.5) / rows;
        f.row = r;
        for (let c = 0; c < cols; c++) {
          f.col = c;
          const val = sample((c + 0.5) / cols, v, f);
          const threshold = BAYER4[(r & 3) * 4 + (c & 3)];
          const idx = Math.min(levels, Math.max(0, Math.floor(val * levels + threshold)));
          if (idx === 0) continue;
          const color = palette[idx];
          const base = r * cell * W + c * cell;
          for (let dy = 0; dy < dot; dy++) {
            const row = base + dy * W;
            for (let dx = 0; dx < dot; dx++) pixels[row + dx] = color;
          }
        }
      }
      ctx.putImageData(image, 0, 0);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastFrame < 1000 / 30) return; // ~30fps is plenty for this look
      lastFrame = now;
      dist += (scrollState().target - dist) * 0.18; // ease toward scroll position
      draw(now);
    };

    // Reduced motion: no loop; jump straight to the scroll position, once per frame at most.
    let pending = false;
    const onScroll = () => {
      if (!reduceMotion || pending) return;
      pending = true;
      requestAnimationFrame((now) => {
        pending = false;
        dist = scrollState().target;
        draw(now);
      });
    };

    readPalette();
    resize();
    draw(performance.now());
    if (!reduceMotion) raf = requestAnimationFrame(loop);
    window.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);

    const mo = new MutationObserver(() => {
      readPalette();
      draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      mo.disconnect();
    };
  }, [finishSelector]);

  return <canvas ref={canvasRef} className={`dither-field ${className}`} aria-hidden="true" />;
}
