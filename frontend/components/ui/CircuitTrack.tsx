import { CIRCUIT_TRACKS, FALLBACK_TRACK } from "@/lib/constants/circuitTracks";
import { roundedPolygonPath } from "@/lib/svg/roundedPolygonPath";

export default function CircuitTrack({
  circuitId,
  className = "circuit-track",
}: {
  circuitId: string;
  className?: string;
}) {
  const points = CIRCUIT_TRACKS[circuitId] || FALLBACK_TRACK;
  const pathD = roundedPolygonPath(points, 7);
  const start = points[0];

  return (
    <svg className={className} viewBox="0 0 220 140" aria-hidden="true">
      <path d={pathD} />
      <circle cx={start[0]} cy={start[1]} r={3.2} />
    </svg>
  );
}
