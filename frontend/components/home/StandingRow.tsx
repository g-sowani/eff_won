"use client";

import { useBarFillOnScroll } from "@/hooks/useBarFillOnScroll";

export default function StandingRow({
  position,
  widthPct,
  name,
  teamColorHex,
  subLabel,
  points,
}: {
  position: string;
  widthPct: number;
  name: string;
  teamColorHex: string;
  subLabel: string;
  points: string;
}) {
  const barRef = useBarFillOnScroll<HTMLDivElement>(widthPct);

  return (
    <div className="standing-row">
      <div className="standing-bar" ref={barRef} />
      <div className="standing-pos">{position}</div>
      <div className="standing-info">
        <div className="standing-name">{name}</div>
        <div className="standing-team">
          <span className="team-dot" style={{ background: teamColorHex }} />
          {subLabel}
        </div>
      </div>
      <div className="standing-pts">
        {points}
        <small>PTS</small>
      </div>
    </div>
  );
}
