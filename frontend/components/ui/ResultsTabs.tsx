export type ResultsTab = "race" | "quali";

export default function ResultsTabs({
  active,
  onChange,
}: {
  active: ResultsTab;
  onChange: (tab: ResultsTab) => void;
}) {
  return (
    <div className="tabs">
      <button
        className={`tab-btn${active === "race" ? " active" : ""}`}
        onClick={() => onChange("race")}
      >
        Race
      </button>
      <button
        className={`tab-btn${active === "quali" ? " active" : ""}`}
        onClick={() => onChange("quali")}
      >
        Qualifying
      </button>
    </div>
  );
}
