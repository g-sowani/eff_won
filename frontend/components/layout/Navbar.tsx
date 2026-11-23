"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useActiveSection } from "@/hooks/useActiveSection";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Root-relative (not bare "#...") so these still resolve correctly when clicked
// from a non-home page like /race/[season]/[round] — those section ids only exist
// on the home page. "Next Race" is the CTA pill rather than a plain link.
const NAV_LINKS = [
  { id: "calendar", label: "Calendar" },
  { id: "results", label: "Results" },
  { id: "standings", label: "Standings" },
  { id: "records", label: "Records" },
];
const SPY_IDS = ["next-race", ...NAV_LINKS.map((l) => l.id)];

export default function Navbar() {
  const { scrolled, progressPct } = useScrollProgress();
  const [open, setOpen] = useState(false);
  const isHome = usePathname() === "/";
  const active = useActiveSection(SPY_IDS, isHome);

  function closeMenu() {
    setOpen(false);
  }

  // Next's <Link> ignores a click whose hash already matches the URL, so after one
  // click on "Next Race", scrolling away and clicking again would do nothing. On the
  // home page, scroll to the section ourselves. scrollIntoView() picks up the CSS
  // scroll-behavior, so the prefers-reduced-motion override still applies.
  function goToSection(e: MouseEvent, id: string) {
    closeMenu();
    if (!isHome) return; // let <Link> navigate to the home page
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView();
    if (location.hash !== `#${id}`) history.pushState(history.state, "", `#${id}`);
  }

  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}${open ? " open" : ""}`}>
      <div className="dock">
        <Link href="/#top" className="brand" onClick={(e) => goToSection(e, "top")}>
          <span className="brand-mark" />
          <span className="brand-text">
            <span className="brand-accent">F1</span> FOR YOU
          </span>
        </Link>
        <nav className={`nav-links${open ? " open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={`/#${link.id}`}
              className="nav-link"
              aria-current={active === link.id ? "location" : undefined}
              onClick={(e) => goToSection(e, link.id)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
        <Link href="/#next-race" className="nav-cta" onClick={(e) => goToSection(e, "next-race")}>
          Next Race
        </Link>
        <button
          className={`nav-toggle${open ? " open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="nav-progress" aria-hidden="true">
          <div className="nav-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </header>
  );
}
