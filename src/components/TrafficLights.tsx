"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  onComplete: () => void;
};

/** Tři žluté fáze, poté krátká zelená – signál startu */
export function TrafficLights({ open, onComplete }: Props) {
  const [yellowOn, setYellowOn] = useState(0);
  const [green, setGreen] = useState(false);
  const cbRef = useRef(onComplete);

  useEffect(() => {
    cbRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!open) {
      setYellowOn(0);
      setGreen(false);
      return;
    }
    const t1 = window.setTimeout(() => setYellowOn(1), 350);
    const t2 = window.setTimeout(() => setYellowOn(2), 700);
    const t3 = window.setTimeout(() => setYellowOn(3), 1050);
    const t4 = window.setTimeout(() => setGreen(true), 1350);
    const t5 = window.setTimeout(() => {
      cbRef.current();
    }, 1650);
    return () => {
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex gap-4 rounded-3xl border border-white/10 bg-zinc-950/90 p-8 shadow-2xl">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex h-24 w-16 items-end justify-center rounded-2xl border border-white/10 bg-black/60 p-2"
              >
                <div
                  className="h-16 w-12 rounded-full border border-zinc-700 transition-colors duration-150"
                  style={{
                    background:
                      green && yellowOn === 3
                        ? "radial-gradient(circle at 30% 25%, #bbf7d0, #16a34a)"
                        : yellowOn > i
                          ? "radial-gradient(circle at 30% 25%, #fef08a, #ca8a04)"
                          : "radial-gradient(circle at 30% 25%, #27272a, #0a0a0a)",
                    boxShadow:
                      green && yellowOn === 3
                        ? "0 0 40px rgba(34,197,94,0.55)"
                        : yellowOn > i
                          ? "0 0 40px rgba(234,179,8,0.55)"
                          : "none",
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
