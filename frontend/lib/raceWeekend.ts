import { getJSON } from "./api";
import { sessionDate } from "./sessions";
import { Race, RaceTableResponse } from "./types";

const HOUR = 60 * 60 * 1000;

/** Live window opens this long before a weekend's first session... */
const WINDOW_BEFORE_MS = 2 * HOUR;
/** ...and stays open this long after the race starts, so post-race results/standings get picked up. */
const WINDOW_AFTER_MS = 24 * HOUR;
/** A race's own details page stops refreshing once this long has passed since the race started. */
const SETTLED_AFTER_MS = 3 * 24 * HOUR;

let calendarPromise: Promise<Race[]> | null = null;

/**
 * The current season calendar, fetched at most once per visit and shared by every caller
 * (CalendarSection and the refresh scheduler). A failed fetch is not cached, so the next call retries.
 */
export function getSeasonCalendar(): Promise<Race[]> {
  if (!calendarPromise) {
    calendarPromise = getJSON<RaceTableResponse>("current.json")
      .then((data) => data.MRData.RaceTable.Races)
      .catch((err) => {
        calendarPromise = null;
        throw err;
      });
  }
  return calendarPromise;
}

function raceStart(race: Race): number | null {
  return sessionDate(race.date, race.time)?.getTime() ?? null;
}

function weekendStart(race: Race): number | null {
  const first = race.FirstPractice ?? race.SprintQualifying ?? race.SprintShootout ?? race.Qualifying;
  return (sessionDate(first?.date, first?.time) ?? sessionDate(race.date, race.time))?.getTime() ?? null;
}

/** True if `now` falls inside any race's live window (shortly before FP1 through a day after the race). */
export function isDuringRaceWeekend(races: Race[], now: number = Date.now()): boolean {
  return races.some((race) => {
    const start = weekendStart(race);
    const end = raceStart(race);
    if (start === null || end === null) return false;
    return now >= start - WINDOW_BEFORE_MS && now <= end + WINDOW_AFTER_MS;
  });
}

/** True once a race is far enough in the past that its results won't change any more. */
export function isRaceSettled(race: Race, now: number = Date.now()): boolean {
  const start = raceStart(race);
  return start !== null && now > start + SETTLED_AFTER_MS;
}
