"use client";

import { createElement, ElementType, ReactNode } from "react";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

interface RevealProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

/**
 * Renders `as` (default "div") as the actual reveal target — not a wrapper — so CSS
 * rules keyed off the element's own class + .reveal (e.g. `.hero-title.reveal{ --d: 80 }`)
 * keep working exactly like the original static-HTML `.reveal` elements.
 */
export default function Reveal({ as = "div", className = "", children, style, ...rest }: RevealProps) {
  const { ref, isIn } = useRevealOnScroll<HTMLElement>();
  return createElement(
    as,
    {
      ...rest,
      ref,
      className: `reveal${isIn ? " in" : ""}${className ? ` ${className}` : ""}`,
      style,
    },
    children
  );
}
