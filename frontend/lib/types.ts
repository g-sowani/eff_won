export interface Location {
  lat: string;
  long: string;
  locality: string;
  country: string;
}

export interface Circuit {
  circuitId: string;
  circuitName: string;
  Location: Location;
}

export interface Constructor {
  constructorId: string;
  name: string;
}

export interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
}

export interface SessionInfo {
  date: string;
  time?: string;
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: Circuit;
  FirstPractice?: SessionInfo;
  SecondPractice?: SessionInfo;
  ThirdPractice?: SessionInfo;
  SprintQualifying?: SessionInfo;
  SprintShootout?: SessionInfo;
  Sprint?: SessionInfo;
  Qualifying?: SessionInfo;
  Results?: RaceResult[];
  QualifyingResults?: QualifyingResult[];
}

export interface RaceResult {
  position: string;
  points: string;
  Driver: Driver;
  Constructor: Constructor;
  Time?: { time: string };
  status: string;
}

export interface QualifyingResult {
  position: string;
  Driver: Driver;
  Constructor: Constructor;
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

export interface DriverStanding {
  position: string;
  points: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface RaceTable {
  Races: Race[];
}

export interface StandingsList {
  DriverStandings?: DriverStanding[];
  ConstructorStandings?: ConstructorStanding[];
}

export interface StandingsTable {
  StandingsLists: StandingsList[];
}

export interface MRData<T> {
  MRData: T;
}

export type RaceTableResponse = MRData<{ RaceTable: RaceTable }>;
export type StandingsTableResponse = MRData<{ StandingsTable: StandingsTable }>;
