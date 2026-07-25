"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import NextRaceCard from "@/components/home/NextRaceCard";
import { getJSON } from "@/lib/api";
import { Race, RaceTableResponse } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; race: Race };

export default function NextRaceSection() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getJSON<RaceTableResponse>("current/next.json");
        const race = data.MRData.RaceTable.Races[0];
        if (!race) throw new Error("No upcoming race");
        if (!cancelled) setState({ status: "ready", race });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section" id="next-race">
      <div className="container">
        <Reveal as="div" className="section-head">
          <p className="eyebrow">Up Next</p>
          <h2>Next Race Weekend</h2>
        </Reveal>

        <Reveal as="div" className="race-card">
          {state.status === "loading" && (
            <div className="race-card-loading">
              Fetching race data
              <span className="dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          )}
          {state.status === "error" && (
            <div className="race-card-loading">
              Couldn&apos;t reach the timing feed right now. Refresh to try again.
            </div>
          )}
          {state.status === "ready" && <NextRaceCard race={state.race} />}
        </Reveal>
      </div>
    </section>
  );
}
