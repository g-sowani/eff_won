import Hero from "@/components/home/Hero";
import NextRaceSection from "@/components/home/NextRaceSection";
import CalendarSection from "@/components/home/CalendarSection";
import ResultsSection from "@/components/home/ResultsSection";
import StandingsSection from "@/components/home/StandingsSection";
import RecordsSection from "@/components/home/RecordsSection";
import CtaSection from "@/components/home/CtaSection";
import DitherField from "@/components/ui/DitherField";

export default function Home() {
  return (
    <>
      {/* One fixed track scene behind the whole page; scrolling drives you down the track. */}
      <DitherField className="track-backdrop" finishSelector=".cta-section" />
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
