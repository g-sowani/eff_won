import { Race } from "@/lib/types";
import { buildSessionList } from "@/lib/sessions";
import SessionChip from "@/components/ui/SessionChip";

export default function SessionSchedule({ race }: { race: Race }) {
  const sessions = buildSessionList(race);
  if (sessions.length === 0) return null;

  return (
    <div className="race-sessions">
      {sessions.map((session) => (
        <SessionChip session={session} isNext={false} key={session.key} />
      ))}
    </div>
  );
}
