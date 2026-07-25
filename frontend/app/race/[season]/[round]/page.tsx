import RaceDetailsView from "@/components/race/RaceDetailsView";

export default async function RaceDetailsPage({
  params,
}: {
  params: Promise<{ season: string; round: string }>;
}) {
  const { season, round } = await params;
  return <RaceDetailsView season={season} round={round} />;
}
