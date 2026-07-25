"use client";

import { useMemo } from "react";
import { Race } from "@/lib/types";
import { buildSessionList, findNextSession, sessionDate } from "@/lib/sessions";
import { useCountdown } from "@/hooks/useCountdown";
import SessionChip from "@/components/ui/SessionChip";

export default function NextRaceCard({ race }: { race: Race }) {
  const sessions = buildSessionList(race);
  const nextSession = findNextSession(sessions);
  // Memoized on the primitive date/time so the Date reference stays stable
  // across re-renders (including the ones useCountdown itself triggers every
  // second) — otherwise a fresh Date each render would look like a "target
  // changed" to useCountdown and needlessly reset/rebuild its interval.
  const target = useMemo(() => sessionDate(race.date, race.time), [race.date, race.time]);
  const { days, hours, minutes, seconds } = useCountdown(target);

  const units = [
    { u: "D", label: "Days", value: days },
    { u: "H", label: "Hrs", value: hours },
    { u: "M", label: "Min", value: minutes },
    { u: "S", label: "Sec", value: seconds },
  ];

  return (
    <>
      <div className="race-top">
        <div>
          <div className="race-round">
            ROUND {race.round} &middot; {race.season}
          </div>
          <div className="race-name">{race.raceName}</div>
          <div className="race-location">
            <span>{race.Circuit.circuitName}</span> — {race.Circuit.Location.locality},{" "}
            {race.Circuit.Location.country}
          </div>
        </div>
        <div className="countdown">
          {units.map((unit) => (
            <div className="countdown-unit" key={unit.u}>
              <div className="countdown-num">{String(unit.value).padStart(2, "0")}</div>
              <div className="countdown-label">{unit.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="race-sessions">
        {sessions.map((session) => (
          <SessionChip session={session} isNext={session.key === nextSession?.key} key={session.key} />
        ))}
      </div>
    </>
  );
}
