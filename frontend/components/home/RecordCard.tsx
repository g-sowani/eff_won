"use client";

import { RecordEntry } from "@/lib/constants/records";
import { useMountReveal } from "@/hooks/useMountReveal";

export default function RecordCard({ record }: { record: RecordEntry }) {
  const { ref, isIn } = useMountReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`record-card reveal${isIn ? " in" : ""}`}>
      <span className="record-icon">{record.icon}</span>
      <div className="record-label">{record.label}</div>
      <div className="record-value">{record.value}</div>
      <div className="record-sub">{record.sub}</div>
    </div>
  );
}
