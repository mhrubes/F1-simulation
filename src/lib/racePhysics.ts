import type { RaceDriverState } from "@/lib/types";
import type { TrackDef } from "@/lib/types";
import { ensureLapSpeedFactors, lookupLapSpeedFactor } from "@/lib/trackLapFactors";

function microNoise(t: number, id: number): number {
  return 0.97 + 0.06 * Math.sin(t * 0.003 + id * 1.7);
}

/**
 * @param dtSeconds krok simulace v sekundách (typicky (min(Δt_wall,50ms)/1000) × násobič rychlosti).
 */
export function integrateDrivers(
  drivers: RaceDriverState[],
  track: TrackDef,
  dtSeconds: number,
  totalLaps: number,
  now: number,
): { drivers: RaceDriverState[]; allFinished: boolean } {
  const dt = Math.max(0, Math.min(dtSeconds, 0.25));
  const lapFactors = ensureLapSpeedFactors(track.pathD);

  const next = drivers.map((d) => {
    if (d.finished) return d;
    const geometryMult = lookupLapSpeedFactor(lapFactors, d.lapProgress);
    const mult =
      geometryMult * microNoise(now, d.driverId.charCodeAt(1));
    const baseLap = track.lapTimeSeconds / d.paceFactor;
    const instantLap = baseLap / mult;
    const rate = 1 / instantLap;
    let lapProgress = d.lapProgress + rate * dt;
    let completedLaps = d.completedLaps;
    let guard = 0;
    while (lapProgress >= 1 && completedLaps < totalLaps && guard < 48) {
      lapProgress -= 1;
      completedLaps += 1;
      guard += 1;
    }
    const done = completedLaps >= totalLaps;
    if (done) {
      lapProgress = 0;
      completedLaps = totalLaps;
    }
    const instKmh = (track.lengthMeters / instantLap) * 3.6;
    const alpha = 1 - Math.exp(-dt * 2.2);
    const displayAvgKmh =
      d.displayAvgKmh === 0
        ? instKmh
        : d.displayAvgKmh + (instKmh - d.displayAvgKmh) * alpha;

    return {
      ...d,
      lapProgress,
      completedLaps,
      displayAvgKmh,
      finished: done,
    };
  });

  const allFinished =
    next.length > 0 && next.every((d) => d.finished);

  return { drivers: next, allFinished };
}

export function sortLive(drivers: RaceDriverState[]): RaceDriverState[] {
  return [...drivers].sort(
    (a, b) => b.completedLaps + b.lapProgress - (a.completedLaps + a.lapProgress),
  );
}

export function sortStatic(drivers: RaceDriverState[]): RaceDriverState[] {
  return [...drivers].sort((a, b) => a.internalIndex - b.internalIndex);
}
