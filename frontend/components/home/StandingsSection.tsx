"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import StandingRow from "@/components/home/StandingRow";
import { getJSON } from "@/lib/api";
import { useLiveRefreshTick } from "@/hooks/useRefreshTick";
import { ConstructorStanding, DriverStanding, StandingsTableResponse } from "@/lib/types";
import { teamColor } from "@/lib/constants/teamColors";

type Status = "loading" | "error" | "ready";

export default function StandingsSection() {
  const [driverStatus, setDriverStatus] = useState<Status>("loading");
  const [driverRows, setDriverRows] = useState<DriverStanding[]>([]);
  const [constructorStatus, setConstructorStatus] = useState<Status>("loading");
  const [constructorRows, setConstructorRows] = useState<ConstructorStanding[]>([]);

  const refreshTick = useLiveRefreshTick();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getJSON<StandingsTableResponse>("current/driverstandings.json");
        const list = data.MRData.StandingsTable.StandingsLists[0];
        if (cancelled) return;
        setDriverRows(list?.DriverStandings || []);
        setDriverStatus("ready");
      } catch {
        if (!cancelled) setDriverStatus((s) => (s === "ready" ? s : "error"));
      }

      try {
        const data = await getJSON<StandingsTableResponse>("current/constructorstandings.json");
        const list = data.MRData.StandingsTable.StandingsLists[0];
        if (cancelled) return;
        setConstructorRows(list?.ConstructorStandings || []);
        setConstructorStatus("ready");
      } catch {
        if (!cancelled) setConstructorStatus((s) => (s === "ready" ? s : "error"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const maxDriverPts = Math.max(...driverRows.map((r) => Number(r.points)), 1);
  const maxConstructorPts = Math.max(...constructorRows.map((r) => Number(r.points)), 1);

  return (
    <section className="section" id="standings">
      <div className="container">
        <Reveal as="div" className="section-head">
          <p className="eyebrow">Championship</p>
          <h2>Current Standings</h2>
        </Reveal>

        <div className="standings-grid">
          <Reveal as="div" className="standings-col">
            <h3 className="standings-title">Drivers</h3>
            <div className="standings-list">
              {driverStatus === "loading" && <div className="table-loading">Loading&hellip;</div>}
              {driverStatus === "error" && (
                <div className="table-loading">Couldn&apos;t load driver standings.</div>
              )}
              {driverStatus === "ready" && driverRows.length === 0 && (
                <div className="table-loading">No standings available yet.</div>
              )}
              {driverStatus === "ready" &&
                driverRows.map((r) => {
                  const team = r.Constructors[0];
                  return (
                    <StandingRow
                      key={r.Driver.driverId}
                      position={r.position}
                      widthPct={(Number(r.points) / maxDriverPts) * 100}
                      name={`${r.Driver.givenName} ${r.Driver.familyName}`}
                      teamColorHex={teamColor(team.constructorId)}
                      subLabel={team.name}
                      points={r.points}
                    />
                  );
                })}
            </div>
          </Reveal>

          <Reveal as="div" className="standings-col">
            <h3 className="standings-title">Constructors</h3>
            <div className="standings-list">
              {constructorStatus === "loading" && <div className="table-loading">Loading&hellip;</div>}
              {constructorStatus === "error" && (
                <div className="table-loading">Couldn&apos;t load constructor standings.</div>
              )}
              {constructorStatus === "ready" && constructorRows.length === 0 && (
                <div className="table-loading">No standings available yet.</div>
              )}
              {constructorStatus === "ready" &&
                constructorRows.map((r) => (
                  <StandingRow
                    key={r.Constructor.constructorId}
                    position={r.position}
                    widthPct={(Number(r.points) / maxConstructorPts) * 100}
                    name={r.Constructor.name}
                    teamColorHex={teamColor(r.Constructor.constructorId)}
                    subLabel={`${r.wins} win${r.wins === "1" ? "" : "s"}`}
                    points={r.points}
                  />
                ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
