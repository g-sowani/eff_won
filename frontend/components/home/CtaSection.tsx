import Reveal from "@/components/ui/Reveal";

export default function CtaSection() {
  return (
    <section className="section cta-section">
      <Reveal as="div" className="container cta-inner">
        <h2>Don&apos;t miss a lap.</h2>
        <p>Data refreshes straight from live F1 timing feeds every time you load the grid.</p>
        <a href="#next-race" className="btn btn-primary">
          Check Next Race <span className="arrow">&rarr;</span>
        </a>
      </Reveal>
    </section>
  );
}
