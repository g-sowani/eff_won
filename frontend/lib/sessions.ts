import { Race } from "./types";

export interface SessionEntry {
  key: string;
  label: string;
  dt: Date;
}

const SESSION_DEFS: { key: keyof Race; label: string }[] = [
  { key: "FirstPractice", label: "Practice 1" },
  { key: "SecondPractice", label: "Practice 2" },
  { key: "ThirdPractice", label: "Practice 3" },
  { key: "SprintQualifying", label: "Sprint Quali" },
  { key: "SprintShootout", label: "Sprint Shootout" },
  { key: "Sprint", label: "Sprint" },
  { key: "Qualifying", label: "Qualifying" },
];

export function sessionDate(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  return new Date(`${dateStr}T${timeStr || "00:00:00Z"}`);
}

export function buildSessionList(race: Race): SessionEntry[] {
  const sessions: SessionEntry[] = SESSION_DEFS.filter((s) => race[s.key]).map((s) => {
    const info = race[s.key] as { date: string; time?: string };
    return { key: s.key, label: s.label, dt: sessionDate(info.date, info.time) as Date };
  });

  const raceDt = sessionDate(race.date, race.time);
  if (raceDt) sessions.push({ key: "Race", label: "Race", dt: raceDt });

  sessions.sort((a, b) => a.dt.getTime() - b.dt.getTime());
  return sessions;
}

export function findNextSession(sessions: SessionEntry[], now: Date = new Date()): SessionEntry | undefined {
  return sessions.find((s) => s.dt > now) || sessions[sessions.length - 1];
}
