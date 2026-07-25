import Reveal from "@/components/ui/Reveal";

export default function Hero() {
  const season = new Date().getFullYear();

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-grid" />
        <div className="hero-glow" />
      </div>
      <div className="hero-stripe stripe-1" />
      <div className="hero-stripe stripe-2" />

      <div className="hero-content container">
        <Reveal as="p" className="hero-kicker">
          SEASON <span>{season}</span> &middot; LIGHTS OUT
        </Reveal>
        <Reveal as="h1" className="hero-title">
          <span className="line">EVERY APEX.</span>
          <span className="line">
            EVERY <span className="text-accent">MILLISECOND.</span>
          </span>
        </Reveal>
        <Reveal as="p" className="hero-sub">
          Live standings, race &amp; qualifying results, and the records that define Formula 1
          history — all in one place.
        </Reveal>

        <Reveal className="hero-cta">
          <a href="#next-race" className="btn btn-primary">
            Next Race <span className="arrow">&rarr;</span>
          </a>
          <a href="#standings" className="btn btn-ghost">
            View Standings
          </a>
        </Reveal>
      </div>

      <Reveal className="scroll-cue" aria-hidden="true" as="div">
        <span>SCROLL</span>
        <div className="scroll-cue-line" />
      </Reveal>
    </section>
  );
}
