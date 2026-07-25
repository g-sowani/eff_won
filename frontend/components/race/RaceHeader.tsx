import { Race } from "@/lib/types";
import CircuitTrack from "@/components/ui/CircuitTrack";

export default function RaceHeader({ race }: { race: Race }) {
  const dateStr = new Date(`${race.date}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="race-details-head">
      <div>
        <div className="race-round">
          ROUND {race.round} &middot; {race.season}
        </div>
        <div className="race-name">{race.raceName}</div>
        <div className="race-location">
          <span>{race.Circuit.circuitName}</span> — {race.Circuit.Location.locality},{" "}
          {race.Circuit.Location.country}
        </div>
        <div className="race-location">{dateStr}</div>
      </div>
      <CircuitTrack circuitId={race.Circuit.circuitId} className="race-details-track" />
    </div>
  );
}
