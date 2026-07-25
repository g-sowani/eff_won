"use client";

import { useEffect, useState } from "react";

export default function Loader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    function finish() {
      timeoutId = setTimeout(() => setDone(true), 400);
    }
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
    }
    return () => {
      window.removeEventListener("load", finish);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className={`loader${done ? " done" : ""}`}>
      <div className="loader-flag">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="flag-square" key={i} />
        ))}
      </div>
      <p className="loader-text">LOADING GRID</p>
    </div>
  );
}
