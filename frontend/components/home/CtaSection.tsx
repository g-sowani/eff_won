import Reveal from "@/components/ui/Reveal";

/** The finish: the page's fixed track backdrop brings the checkered line in behind this. */
export default function CtaSection() {
  return (
    <section className="cta-section">
      <Reveal as="div" className="container cta-inner">
        <h2>Don&apos;t miss a lap.</h2>
        <a href="#next-race" className="btn btn-primary">
          Next Race <span className="arrow">&rarr;</span>
        </a>
      </Reveal>
    </section>
  );
}
