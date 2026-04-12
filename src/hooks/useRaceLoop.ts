"use client";

import { useEffect, useRef } from "react";
import { getTrack } from "@/data/tracks";
import { integrateDrivers } from "@/lib/racePhysics";
import { ensureLapSpeedFactors } from "@/lib/trackLapFactors";
import { useRaceStore } from "@/store/raceStore";

/** Herní smyčka při fázi racing */
export function useRaceLoop() {
  const trackId = useRaceStore((s) => s.trackId);
  const totalLaps = useRaceStore((s) => s.totalLaps);
  const phase = useRaceStore((s) => s.phase);
  const setDrivers = useRaceStore((s) => s.setDrivers);
  const setPhase = useRaceStore((s) => s.setPhase);
  const setRaceTimes = useRaceStore((s) => s.setRaceTimes);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trackId) return;
    const track = getTrack(trackId);
    if (track) queueMicrotask(() => ensureLapSpeedFactors(track.pathD));
  }, [trackId]);

  useEffect(() => {
    if (phase !== "racing" || !trackId) {
      lastRef.current = null;
      return;
    }
    const track = getTrack(trackId);
    if (!track) return;

    let frame = 0;
    const step = (t: number) => {
      if (lastRef.current == null) lastRef.current = t;
      const dt = t - lastRef.current;
      lastRef.current = t;
      const { drivers: next, allFinished } = integrateDrivers(
        useRaceStore.getState().drivers,
        track,
        dt,
        totalLaps,
        t,
      );
      setDrivers(next);
      if (allFinished) {
        const started = useRaceStore.getState().raceStartedAt;
        setPhase("finished");
        setRaceTimes(started, performance.now());
        lastRef.current = null;
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [phase, trackId, totalLaps, setDrivers, setPhase, setRaceTimes]);
}
