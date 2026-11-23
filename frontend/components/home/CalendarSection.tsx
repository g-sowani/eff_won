"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import CircuitCard from "@/components/home/CircuitCard";
import { getSeasonCalendar } from "@/lib/raceWeekend";
import { Race } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; races: Race[] };

export default function CalendarSection() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetched once per visit (shared with the refresh scheduler) — the calendar rarely changes.
        const races = await getSeasonCalendar();
        if (!cancelled) setState({ status: "ready", races });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section" id="calendar">
      <div className="container">
        <Reveal as="div" className="section-head">
          <p className="eyebrow">Season</p>
          <h2>Race Calendar</h2>
        </Reveal>

        <div className="calendar-grid">
          {state.status === "loading" && <div className="table-loading">Loading&hellip;</div>}
          {state.status === "error" && (
            <div className="table-loading">Couldn&apos;t load the season calendar.</div>
          )}
          {state.status === "ready" && state.races.length === 0 && (
            <div className="table-loading">No calendar data available yet.</div>
          )}
          {state.status === "ready" &&
            state.races.map((race) => <CircuitCard race={race} key={`${race.season}-${race.round}`} />)}
        </div>
      </div>
    </section>
  );
}
