"use client";

import { useEffect, useRef } from "react";
import { getTrack } from "@/data/tracks";
import { integrateDrivers } from "@/lib/racePhysics";
import { runFrameLoop } from "@/lib/runFrameLoop";
import { ensureLapSpeedFactors } from "@/lib/trackLapFactors";
import { useRaceStore } from "@/store/raceStore";

/** Horní mez jednoho fyzikálního kroku (stejné chování jako dřív u rAF). */
const WALL_CHUNK_MS = 50;
/**
 * Max. fyzikálních kroků za jedno volání (ochrana UI).
 * Při aktivní záložce je typicky Δt ~16 ms → vždy 1 řez; víc řezů jen po zadrhání rAF.
 */
const MAX_SLICES_VISIBLE = 12;
const MAX_SLICES_HIDDEN = 48;
/** Po dlouhé nečinnosti (např. první frame) nezpracovat najednou celé minuty. */
const MAX_WALL_BANK_MS = 10_000;

/** Herní smyčka při fázi racing — běží i na skryté záložce (setTimeout fallback). */
export function useRaceLoop() {
  const trackId = useRaceStore((s) => s.trackId);
  const totalLaps = useRaceStore((s) => s.totalLaps);
  const phase = useRaceStore((s) => s.phase);
  const setDrivers = useRaceStore((s) => s.setDrivers);
  const setPhase = useRaceStore((s) => s.setPhase);
  const setRaceTimes = useRaceStore((s) => s.setRaceTimes);
  const setRaceResultDurationMs = useRaceStore((s) => s.setRaceResultDurationMs);
  const lastWallRef = useRef<number | null>(null);
  const wallBankRef = useRef(0);
  const simRaceMsRef = useRef(0);

  useEffect(() => {
    if (!trackId) return;
    const track = getTrack(trackId);
    if (track) queueMicrotask(() => ensureLapSpeedFactors(track.pathD));
  }, [trackId]);

  useEffect(() => {
    if (phase !== "racing" || !trackId) {
      lastWallRef.current = null;
      wallBankRef.current = 0;
      return;
    }
    const track = getTrack(trackId);
    if (!track) return;

    simRaceMsRef.current = 0;
    lastWallRef.current = null;
    wallBankRef.current = 0;

    const stopLoop = runFrameLoop(
      () => {
        if (useRaceStore.getState().phase !== "racing") return false;
        const wallNow = performance.now();
        if (lastWallRef.current == null) {
          lastWallRef.current = wallNow;
          return;
        }
        let delta = wallNow - lastWallRef.current;
        lastWallRef.current = wallNow;
        if (delta > MAX_WALL_BANK_MS) delta = MAX_WALL_BANK_MS;
        wallBankRef.current += delta;

        const tabVisible =
          typeof document === "undefined" ||
          document.visibilityState !== "hidden";
        const maxSlices = tabVisible ? MAX_SLICES_VISIBLE : MAX_SLICES_HIDDEN;

        const st0 = useRaceStore.getState();
        let slices = 0;
        let drivers = st0.drivers;
        const scale = st0.raceTimeScale;

        while (wallBankRef.current > 0 && slices < maxSlices) {
          const chunkMs = Math.min(wallBankRef.current, WALL_CHUNK_MS);
          wallBankRef.current -= chunkMs;
          slices++;
          simRaceMsRef.current += chunkMs * scale;
          const dtSeconds = (chunkMs / 1000) * scale;
          const { drivers: next, allFinished } = integrateDrivers(
            drivers,
            track,
            dtSeconds,
            totalLaps,
            performance.now(),
            simRaceMsRef.current,
          );
          drivers = next;
          if (allFinished) {
            const started = useRaceStore.getState().raceStartedAt;
            setRaceResultDurationMs(simRaceMsRef.current);
            setRaceTimes(started, performance.now());
            setPhase("finished");
            lastWallRef.current = null;
            wallBankRef.current = 0;
            setDrivers(drivers);
            return false;
          }
        }

        setDrivers(drivers);
      },
      { hiddenIntervalMs: 100 },
    );

    return stopLoop;
  }, [
    phase,
    trackId,
    totalLaps,
    setDrivers,
    setPhase,
    setRaceTimes,
    setRaceResultDurationMs,
  ]);
}
