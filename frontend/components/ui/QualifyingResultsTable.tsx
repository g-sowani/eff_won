import { QualifyingResult } from "@/lib/types";
import { teamColor } from "@/lib/constants/teamColors";

type Status = "loading" | "error" | "ready";

export default function QualifyingResultsTable({
  results,
  status,
  hidden = false,
}: {
  results?: QualifyingResult[];
  status: Status;
  hidden?: boolean;
}) {
  let body: React.ReactNode;
  if (status === "loading") {
    body = (
      <tr>
        <td colSpan={6} className="table-loading">
          Loading&hellip;
        </td>
      </tr>
    );
  } else if (status === "error") {
    body = (
      <tr>
        <td colSpan={6} className="table-loading">
          Couldn&apos;t load qualifying results.
        </td>
      </tr>
    );
  } else if (!results || results.length === 0) {
    body = (
      <tr>
        <td colSpan={6} className="table-loading">
          No qualifying data available yet.
        </td>
      </tr>
    );
  } else {
    body = results.slice(0, 10).map((r) => (
      <tr key={r.Driver.driverId}>
        <td className={`pos-cell pos-${r.position}`}>{r.position}</td>
        <td className="driver-cell">
          {r.Driver.givenName} {r.Driver.familyName}
        </td>
        <td>
          <span className="team-dot" style={{ background: teamColor(r.Constructor.constructorId) }} />
          {r.Constructor.name}
        </td>
        <td className="mono">{r.Q1 || "—"}</td>
        <td className="mono">{r.Q2 || "—"}</td>
        <td className="mono">{r.Q3 || "—"}</td>
      </tr>
    ));
  }

  return (
    <table className={`data-table${hidden ? " hidden" : ""}`}>
      <thead>
        <tr>
          <th>Pos</th>
          <th>Driver</th>
          <th>Team</th>
          <th>Q1</th>
          <th>Q2</th>
          <th>Q3</th>
        </tr>
      </thead>
      <tbody>{body}</tbody>
    </table>
  );
}
