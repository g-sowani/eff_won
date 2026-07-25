"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import ResultsTabs, { ResultsTab } from "@/components/ui/ResultsTabs";
import RaceResultsTable from "@/components/ui/RaceResultsTable";
import QualifyingResultsTable from "@/components/ui/QualifyingResultsTable";
import { getJSON } from "@/lib/api";
import { QualifyingResult, RaceResult, RaceTableResponse } from "@/lib/types";

type Status = "loading" | "error" | "ready";

export default function ResultsSection() {
  const [tab, setTab] = useState<ResultsTab>("race");
  const [raceTitle, setRaceTitle] = useState(" ");
  const [raceStatus, setRaceStatus] = useState<Status>("loading");
  const [raceResults, setRaceResults] = useState<RaceResult[]>();
  const [qualiStatus, setQualiStatus] = useState<Status>("loading");
  const [qualiResults, setQualiResults] = useState<QualifyingResult[]>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getJSON<RaceTableResponse>("current/last/results.json");
        const race = data.MRData.RaceTable.Races[0];
        if (cancelled) return;
        setRaceTitle(
          race
            ? `${race.raceName} — ${new Date(race.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`
            : " "
        );
        setRaceResults(race?.Results);
        setRaceStatus("ready");
      } catch {
        if (!cancelled) setRaceStatus("error");
      }

      try {
        const data = await getJSON<RaceTableResponse>("current/last/qualifying.json");
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
  }, []);

  return (
    <section className="section section-alt" id="results">
      <div className="container">
        <Reveal as="div" className="section-head">
          <p className="eyebrow">Last Time Out</p>
          <h2>Latest Results</h2>
        </Reveal>

        <Reveal as="div">
          <ResultsTabs active={tab} onChange={setTab} />
        </Reveal>

        <Reveal as="div" className="results-race-title">
          {raceTitle}
        </Reveal>

        <Reveal as="div" className="table-wrap">
          <RaceResultsTable results={raceResults} status={raceStatus} hidden={tab !== "race"} />
          <QualifyingResultsTable results={qualiResults} status={qualiStatus} hidden={tab !== "quali"} />
        </Reveal>
      </div>
    </section>
  );
}
