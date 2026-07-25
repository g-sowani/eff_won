"use client";

import { useState } from "react";
import Link from "next/link";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Root-relative (not bare "#...") so these still resolve correctly when clicked
// from a non-home page like /race/[season]/[round] — those section ids only exist
// on the home page.
const NAV_LINKS = [
  { href: "/#next-race", label: "Next Race" },
  { href: "/#calendar", label: "Calendar" },
  { href: "/#results", label: "Results" },
  { href: "/#standings", label: "Standings" },
  { href: "/#records", label: "Records" },
];

export default function Navbar() {
  const { scrolled, progressPct } = useScrollProgress();
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="nav-inner">
        <Link href="/#top" className="brand" onClick={closeMenu}>
          <span className="brand-mark" />
          <span className="brand-text">
            APEX<span className="brand-accent">F1</span>
          </span>
        </Link>
        <div className="nav-right">
          <nav className={`nav-links${open ? " open" : ""}`}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link" onClick={closeMenu}>
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <button
            className={`nav-toggle${open ? " open" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <div className="nav-progress" style={{ width: `${progressPct}%` }} />
    </header>
  );
}
