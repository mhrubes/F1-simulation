"use client";

import { useEffect, useState } from "react";

function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Hodiny jen na klientovi – stejný placeholder na SSR i při hydrataci,
 * aby nedocházelo k chybě „Hydration failed“ kvůli posunu vteřin.
 */
export function useClock(tickMs = 250): string {
  const [text, setText] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setText(formatTime(new Date()));
    tick();
    const id = window.setInterval(tick, tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  return text;
}
