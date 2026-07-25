import Reveal from "@/components/ui/Reveal";
import RecordCard from "@/components/home/RecordCard";
import { RECORDS } from "@/lib/constants/records";

export default function RecordsSection() {
  return (
    <section className="section section-alt" id="records">
      <div className="container">
        <Reveal as="div" className="section-head">
          <p className="eyebrow">The Archive</p>
          <h2>All-Time Records</h2>
        </Reveal>

        <div className="records-grid">
          {RECORDS.map((record) => (
            <RecordCard record={record} key={record.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
