import Reveal from "@/components/ui/Reveal";
import StartLights from "@/components/home/StartLights";
import HeroPitWall from "@/components/home/HeroPitWall";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content container">
        <Reveal as="div" className="hero-lights">
          <StartLights />
        </Reveal>
        <Reveal as="h1" className="hero-title">
          <span className="text-accent">F1</span> FOR YOU
        </Reveal>
        <Reveal as="p" className="hero-sub">
          Every apex. Every millisecond.
        </Reveal>
        <Reveal className="hero-cta">
          <a href="#next-race" className="btn btn-primary">
            Next Race <span className="arrow">&rarr;</span>
          </a>
          <a href="#standings" className="btn btn-ghost">
            Standings
          </a>
        </Reveal>
      </div>

      <Reveal as="div" className="hero-pit container">
        <HeroPitWall />
      </Reveal>
    </section>
  );
}
