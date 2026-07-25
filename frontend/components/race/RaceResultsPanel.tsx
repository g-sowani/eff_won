"use client";

import { useState } from "react";
import ResultsTabs, { ResultsTab } from "@/components/ui/ResultsTabs";
import RaceResultsTable from "@/components/ui/RaceResultsTable";
import QualifyingResultsTable from "@/components/ui/QualifyingResultsTable";
import { QualifyingResult, RaceResult } from "@/lib/types";

type Status = "loading" | "error" | "ready";

export default function RaceResultsPanel({
  raceStatus,
  raceResults,
  qualiStatus,
  qualiResults,
}: {
  raceStatus: Status;
  raceResults?: RaceResult[];
  qualiStatus: Status;
  qualiResults?: QualifyingResult[];
}) {
  const [tab, setTab] = useState<ResultsTab>("race");

  return (
    <>
      <ResultsTabs active={tab} onChange={setTab} />
      <div className="table-wrap">
        <RaceResultsTable results={raceResults} status={raceStatus} hidden={tab !== "race"} />
        <QualifyingResultsTable results={qualiResults} status={qualiStatus} hidden={tab !== "quali"} />
      </div>
    </>
  );
}
