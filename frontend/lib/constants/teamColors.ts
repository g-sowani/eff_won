export const TEAM_COLORS: Record<string, string> = {
  mercedes: "#27F4D2",
  ferrari: "#E8002D",
  red_bull: "#3671C6",
  mclaren: "#FF8000",
  alpine: "#00A1E8",
  williams: "#1868DB",
  aston_martin: "#229971",
  rb: "#6C98FF",
  haas: "#B6BABD",
  sauber: "#52C41A",
  audi: "#B6002D",
  cadillac: "#8A8D93",
  alphatauri: "#2B4562",
  alfa: "#B12039",
  renault: "#FFF200",
  racing_point: "#F596C8",
};

export function teamColor(id: string): string {
  return TEAM_COLORS[id] || "#e10600";
}
