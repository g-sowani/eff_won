import { RaceResult } from "@/lib/types";
import { teamColor } from "@/lib/constants/teamColors";

type Status = "loading" | "error" | "ready";

export default function RaceResultsTable({
  results,
  status,
  hidden = false,
}: {
  results?: RaceResult[];
  status: Status;
  hidden?: boolean;
}) {
  let body: React.ReactNode;
  if (status === "loading") {
    body = (
      <tr>
        <td colSpan={5} className="table-loading">
          Loading&hellip;
        </td>
      </tr>
    );
  } else if (status === "error") {
    body = (
      <tr>
        <td colSpan={5} className="table-loading">
          Couldn&apos;t load race results.
        </td>
      </tr>
    );
  } else if (!results || results.length === 0) {
    body = (
      <tr>
        <td colSpan={5} className="table-loading">
          No results available yet.
        </td>
      </tr>
    );
  } else {
    body = results.slice(0, 10).map((r) => {
      const timeOrStatus = r.Time ? r.Time.time : r.status;
      return (
        <tr key={r.Driver.driverId}>
          <td className={`pos-cell pos-${r.position}`}>{r.position}</td>
          <td className="driver-cell">
            {r.Driver.givenName} {r.Driver.familyName}
          </td>
          <td>
            <span className="team-dot" style={{ background: teamColor(r.Constructor.constructorId) }} />
            {r.Constructor.name}
          </td>
          <td className="mono">{timeOrStatus}</td>
          <td>{r.points}</td>
        </tr>
      );
    });
  }

  return (
    <table className={`data-table${hidden ? " hidden" : ""}`}>
      <thead>
        <tr>
          <th>Pos</th>
          <th>Driver</th>
          <th>Team</th>
          <th>Time / Status</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>{body}</tbody>
    </table>
  );
}
