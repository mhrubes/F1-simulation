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
  const setRaceResultDurationMs = useRaceStore((s) => s.setRaceResultDurationMs);
  const lastRef = useRef<number | null>(null);
  const simRaceMsRef = useRef(0);

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

    simRaceMsRef.current = 0;
    let frame = 0;
    const step = (t: number) => {
      if (lastRef.current == null) lastRef.current = t;
      const dtWall = t - lastRef.current;
      lastRef.current = t;
      const st = useRaceStore.getState();
      const scale = st.raceTimeScale;
      const dtWallCapped = Math.min(Math.max(0, dtWall), 50);
      simRaceMsRef.current += dtWallCapped * scale;
      const dtSeconds = (dtWallCapped / 1000) * scale;
      const { drivers: next, allFinished } = integrateDrivers(
        useRaceStore.getState().drivers,
        track,
        dtSeconds,
        totalLaps,
        t,
      );
      setDrivers(next);
      if (allFinished) {
        const started = useRaceStore.getState().raceStartedAt;
        setRaceResultDurationMs(simRaceMsRef.current);
        setRaceTimes(started, performance.now());
        setPhase("finished");
        lastRef.current = null;
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [phase, trackId, totalLaps, setDrivers, setPhase, setRaceTimes, setRaceResultDurationMs]);
}
