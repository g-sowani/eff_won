export interface RecordEntry {
  icon: string;
  label: string;
  value: string;
  sub: string;
}

export const RECORDS: RecordEntry[] = [
  { icon: "🏆", label: "Most Drivers’ Championships", value: "7 Titles", sub: "Michael Schumacher & Lewis Hamilton" },
  { icon: "🏁", label: "Most Race Wins", value: "105 Wins", sub: "Lewis Hamilton" },
  { icon: "⏱️", label: "Most Pole Positions", value: "104 Poles", sub: "Lewis Hamilton" },
  { icon: "🎯", label: "Most Podium Finishes", value: "202 Podiums", sub: "Lewis Hamilton" },
  { icon: "🛠️", label: "Most Constructors’ Titles", value: "16 Titles", sub: "Scuderia Ferrari" },
  { icon: "👑", label: "Youngest World Champion", value: "23y 134d", sub: "Sebastian Vettel — 2010" },
  { icon: "⚡", label: "Youngest Race Winner", value: "18y 228d", sub: "Max Verstappen — 2016 Spanish GP" },
  { icon: "📈", label: "Most Wins in a Single Season", value: "19 Wins", sub: "Max Verstappen — 2023" },
  { icon: "🔥", label: "Longest Consecutive Win Streak", value: "10 Races", sub: "Max Verstappen — 2023" },
  { icon: "🎖️", label: "Oldest World Champion", value: "46 Years", sub: "Juan Manuel Fangio — 1957" },
  { icon: "🧭", label: "Most Grand Prix Entries", value: "400+ Starts", sub: "Fernando Alonso" },
  { icon: "🛞", label: "Fastest Pit Stop", value: "1.80 sec", sub: "Red Bull Racing — 2019 Brazilian GP" },
];
