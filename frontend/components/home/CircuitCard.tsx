"use client";

import Link from "next/link";
import { Race } from "@/lib/types";
import { flagFor } from "@/lib/constants/countryFlags";
import CircuitTrack from "@/components/ui/CircuitTrack";
import { useMountReveal } from "@/hooks/useMountReveal";

export default function CircuitCard({ race }: { race: Race }) {
  const { ref, isIn } = useMountReveal<HTMLAnchorElement>();
  const circuit = race.Circuit;
  const dateStr = new Date(`${race.date}T00:00:00`).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });

  return (
    <Link
      ref={ref}
      href={`/race/${race.season}/${race.round}`}
      className={`circuit-card reveal${isIn ? " in" : ""}`}
    >
      <div className="circuit-top">
        <span className="circuit-round">R{String(race.round).padStart(2, "0")}</span>
        <span className="circuit-date">{dateStr}</span>
      </div>
      <CircuitTrack circuitId={circuit.circuitId} />
      <div className="circuit-city">
        {flagFor(circuit.Location.country)} {circuit.Location.locality}
      </div>
      <div className="circuit-country">{circuit.Location.country}</div>
    </Link>
  );
}
