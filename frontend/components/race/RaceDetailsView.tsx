"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import RaceHeader from "@/components/race/RaceHeader";
import SessionSchedule from "@/components/race/SessionSchedule";
import RaceResultsPanel from "@/components/race/RaceResultsPanel";
import { getJSON } from "@/lib/api";
import { QualifyingResult, Race, RaceResult, RaceTableResponse } from "@/lib/types";

type HeadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "notfound" }
  | { status: "ready"; race: Race };

type ResultsStatus = "loading" | "error" | "ready";

export default function RaceDetailsView({ season, round }: { season: string; round: string }) {
  const [head, setHead] = useState<HeadState>({ status: "loading" });
  const [raceStatus, setRaceStatus] = useState<ResultsStatus>("loading");
  const [raceResults, setRaceResults] = useState<RaceResult[]>();
  const [qualiStatus, setQualiStatus] = useState<ResultsStatus>("loading");
  const [qualiResults, setQualiResults] = useState<QualifyingResult[]>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getJSON<RaceTableResponse>(`${season}/${round}.json`);
        const race = data.MRData.RaceTable.Races[0];
        if (cancelled) return;
        setHead(race ? { status: "ready", race } : { status: "notfound" });
      } catch {
        if (!cancelled) setHead({ status: "error" });
      }

      try {
        const data = await getJSON<RaceTableResponse>(`${season}/${round}/results.json`);
        const race = data.MRData.RaceTable.Races[0];
        if (cancelled) return;
        setRaceResults(race?.Results);
        setRaceStatus("ready");
      } catch {
        if (!cancelled) setRaceStatus("error");
      }

      try {
        const data = await getJSON<RaceTableResponse>(`${season}/${round}/qualifying.json`);
        const race = data.MRData.RaceTable.Races[0];
        if (cancelled) return;
        setQualiResults(race?.QualifyingResults);
        setQualiStatus("ready");
      } catch {
        if (!cancelled) setQualiStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [season, round]);

  return (
    <section className="section race-details">
      <div className="container">
        <Link href="/#calendar" className="race-details-back">
          &larr; Back to calendar
        </Link>

        {head.status === "loading" && <div className="table-loading">Loading&hellip;</div>}
        {head.status === "error" && (
          <div className="race-not-found">Couldn&apos;t reach the timing feed right now. Refresh to try again.</div>
        )}
        {head.status === "notfound" && (
          <div className="race-not-found">
            No race found for {season} round {round}.
          </div>
        )}
        {head.status === "ready" && (
          <>
            <Reveal as="div">
              <RaceHeader race={head.race} />
            </Reveal>
            <Reveal as="div" className="section-head">
              <p className="eyebrow">Schedule</p>
              <h2>Session Times</h2>
            </Reveal>
            <SessionSchedule race={head.race} />
            <Reveal as="div" className="section-head" style={{ marginTop: 60 }}>
              <p className="eyebrow">Results</p>
              <h2>Race &amp; Qualifying</h2>
            </Reveal>
            <RaceResultsPanel
              raceStatus={raceStatus}
              raceResults={raceResults}
              qualiStatus={qualiStatus}
              qualiResults={qualiResults}
            />
          </>
        )}
      </div>
    </section>
  );
}
