import Hero from "@/components/home/Hero";
import NextRaceSection from "@/components/home/NextRaceSection";
import CalendarSection from "@/components/home/CalendarSection";
import ResultsSection from "@/components/home/ResultsSection";
import StandingsSection from "@/components/home/StandingsSection";
import RecordsSection from "@/components/home/RecordsSection";
import CtaSection from "@/components/home/CtaSection";

export default function Home() {
  return (
    <>
      <Hero />
      <NextRaceSection />
      <CalendarSection />
      <ResultsSection />
      <StandingsSection />
      <RecordsSection />
      <CtaSection />
    </>
  );
}
