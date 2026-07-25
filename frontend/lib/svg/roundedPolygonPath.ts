interface Point {
  x: number;
  y: number;
}

function sub(a: number[], b: number[]): Point {
  return { x: a[0] - b[0], y: a[1] - b[1] };
}

function length(v: Point): number {
  return Math.hypot(v.x, v.y) || 1;
}

function norm(v: Point): Point {
  const l = length(v);
  return { x: v.x / l, y: v.y / l };
}

export function roundedPolygonPath(points: number[][], r: number): string {
  const n = points.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const curr = points[i];
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const toPrev = sub(prev, curr);
    const toNext = sub(next, curr);
    const rr = Math.min(r, length(toPrev) / 2, length(toNext) / 2);
    const p1dir = norm(toPrev);
    const p2dir = norm(toNext);
    const p1 = { x: curr[0] + p1dir.x * rr, y: curr[1] + p1dir.y * rr };
    const p2 = { x: curr[0] + p2dir.x * rr, y: curr[1] + p2dir.y * rr };
    d += i === 0 ? `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} ` : `L${p1.x.toFixed(1)},${p1.y.toFixed(1)} `;
    d += `Q${curr[0].toFixed(1)},${curr[1].toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} `;
  }
  return d + "Z";
}
