import { SessionEntry } from "@/lib/sessions";

const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
const DATE_FORMAT: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };

export default function SessionChip({ session, isNext }: { session: SessionEntry; isNext: boolean }) {
  return (
    <div className={`session-chip${isNext ? " is-next" : ""}`}>
      <div className="session-name">{session.label}</div>
      <div className="session-time">{session.dt.toLocaleTimeString(undefined, TIME_FORMAT)}</div>
      <div className="session-date">{session.dt.toLocaleDateString(undefined, DATE_FORMAT)}</div>
    </div>
  );
}
