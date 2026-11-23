"use client";

import { useEffect, useMemo, useState } from "react";
import { getJSON } from "@/lib/api";
import { sessionDate } from "@/lib/sessions";
import { flagFor } from "@/lib/constants/countryFlags";
import { teamColor } from "@/lib/constants/teamColors";
import { getSeasonCalendar, isDuringRaceWeekend } from "@/lib/raceWeekend";
import { useLiveRefreshTick } from "@/hooks/useRefreshTick";
import { useCountdown } from "@/hooks/useCountdown";
import CircuitTrack from "@/components/ui/CircuitTrack";
import { DriverStanding, Race, RaceResult, RaceTableResponse, StandingsTableResponse } from "@/lib/types";

type Live<T> = { status: "loading" } | { status: "error" } | { status: "ready"; data: T };

/**
 * Fetches one endpoint on the live refresh tick. Each tile owns its own
 * fetch so one failing endpoint doesn't blank the others, and a background
 * refresh never replaces good data with an error.
 */
function useLive<T>(path: string, pick: (json: unknown) => T | undefined, tick: number): Live<T> {
  const [state, setState] = useState<Live<T>>({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    getJSON<unknown>(path)
      .then((json) => {
        const data = pick(json);
        if (data === undefined) throw new Error("Empty response");
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState((s) => (s.status === "ready" ? s : { status: "error" }));
      });
    return () => {
      cancelled = true;
    };
    // `pick` is a module-level function per call site, so it's stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick]);
  return state;
}

const pickNextRace = (j: unknown) => (j as RaceTableResponse).MRData.RaceTable.Races[0];
const pickLeader = (j: unknown) =>
  (j as StandingsTableResponse).MRData.StandingsTable.StandingsLists[0]?.DriverStandings?.[0];
const pickLastRace = (j: unknown) => (j as RaceTableResponse).MRData.RaceTable.Races[0];

const shortRaceName = (name: string) => name.replace("Grand Prix", "GP");
const pad = (n: number) => String(n).padStart(2, "0");

function NextTile({ race }: { race: Race }) {
  const target = useMemo(() => sessionDate(race.date, race.time), [race.date, race.time]);
  const { days, hours, minutes, seconds, expired } = useCountdown(target);
  return (
    <a href="#next-race" className="pit-tile pit-tile-next">
      <div className="pit-label">
        Next <span className="pit-round">R{pad(Number(race.round))}</span>
      </div>
      <div className="pit-next-body">
        <div>
          <div className="pit-title">
            <span className="pit-flag">{flagFor(race.Circuit.Location.country)}</span>
            {shortRaceName(race.raceName)}
          </div>
          <div className="pit-clock">
            {expired ? (
              "Race day"
            ) : (
              <>
                {pad(days)}
                <i>d</i> {pad(hours)}
                <i>h</i> {pad(minutes)}
                <i>m</i> {pad(seconds)}
                <i>s</i>
              </>
            )}
          </div>
        </div>
        <CircuitTrack circuitId={race.Circuit.circuitId} className="circuit-track pit-track" />
      </div>
    </a>
  );
}

function DriverTile({
  href,
  label,
  name,
  constructorId,
  stat,
  statUnit,
}: {
  href: string;
  label: string;
  name: string;
  constructorId: string;
  stat: string;
  statUnit: string;
}) {
  return (
    <a href={href} className="pit-tile">
      <div className="pit-label">{label}</div>
      <div className="pit-title">
        <span className="team-dot" style={{ background: teamColor(constructorId) }} />
        {name}
      </div>
      <div className="pit-stat">
        {stat} <i>{statUnit}</i>
      </div>
    </a>
  );
}

function Placeholder({ status, label }: { status: "loading" | "error"; label: string }) {
  return (
    <div className="pit-tile is-empty">
      <div className="pit-label">{label}</div>
      <div className="pit-empty">{status === "loading" ? "Syncing…" : "No signal"}</div>
    </div>
  );
}

export default function HeroPitWall() {
  const tick = useLiveRefreshTick();
  const next = useLive<Race>("current/next.json", pickNextRace, tick);
  const leader = useLive<DriverStanding>("current/driverstandings.json", pickLeader, tick);
  const last = useLive<Race>("current/last/results.json", pickLastRace, tick);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSeasonCalendar()
      .then((races) => !cancelled && setLive(isDuringRaceWeekend(races)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const winner: RaceResult | undefined = last.status === "ready" ? last.data.Results?.[0] : undefined;

  return (
    <div className="pit-wall">
      <div className="pit-wall-bar">
        <span className={`pit-status${live ? " is-live" : ""}`}>
          <span className="pit-status-dot" />
          {live ? "Race weekend" : "Pit wall"}
        </span>
        <span className="pit-season">{new Date().getFullYear()}</span>
      </div>
      <div className="pit-grid">
        {next.status === "ready" ? <NextTile race={next.data} /> : <Placeholder status={next.status} label="Next" />}
        {leader.status === "ready" ? (
          <DriverTile
            href="#standings"
            label="Leader"
            name={leader.data.Driver.familyName}
            constructorId={leader.data.Constructors[0]?.constructorId ?? ""}
            stat={leader.data.points}
            statUnit="pts"
          />
        ) : (
          <Placeholder status={leader.status} label="Leader" />
        )}
        {winner && last.status === "ready" ? (
          <DriverTile
            href="#results"
            label="Last win"
            name={winner.Driver.familyName}
            constructorId={winner.Constructor.constructorId}
            stat={shortRaceName(last.data.raceName).replace(/ GP$/, "")}
            statUnit="GP"
          />
        ) : (
          <Placeholder status={last.status === "ready" ? "error" : last.status} label="Last win" />
        )}
      </div>
    </div>
  );
}
