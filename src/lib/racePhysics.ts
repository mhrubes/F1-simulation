import type { RaceDriverState } from "@/lib/types";
import type { TrackDef } from "@/lib/types";
import { ensureLapSpeedFactors, lookupLapSpeedFactor } from "@/lib/trackLapFactors";

export function totalRaceProgress(d: RaceDriverState): number {
  return d.completedLaps + d.lapProgress;
}

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
    if (d.finished || d.disqualified) return d;
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

  const withDq = applyLeaderLapsLastDisqualification(drivers, next);

  const allFinished =
    withDq.length > 0 && withDq.every((d) => d.finished || d.disqualified);

  return { drivers: withDq, allFinished };
}

/** Aktivní v závodě: ne v cíli ani ne diskvalifikovaní. */
function racingActive(d: RaceDriverState): boolean {
  return !d.finished && !d.disqualified;
}

/**
 * Pokud lídr v tomto kroku „dojede“ poslednímu o celé kolo víc (obkroužení),
 * poslední jezdec se diskvalifikuje (Q), zastaví se na čáře S/F (lapProgress 0),
 * statistiky zůstanou z posledního integračního kroku.
 */
function applyLeaderLapsLastDisqualification(
  prev: RaceDriverState[],
  integrated: RaceDriverState[],
): RaceDriverState[] {
  const racing = integrated.filter(racingActive);
  if (racing.length < 2) return integrated;

  const sorted = [...racing].sort(
    (a, b) => totalRaceProgress(b) - totalRaceProgress(a),
  );
  const leader = sorted[0];
  const last = sorted[sorted.length - 1];

  const prevById = new Map(prev.map((d) => [d.driverId, d]));
  const pLeader = prevById.get(leader.driverId) ?? leader;
  const pLast = prevById.get(last.driverId) ?? last;

  const gapBefore = totalRaceProgress(pLeader) - totalRaceProgress(pLast);
  const gapNow = totalRaceProgress(leader) - totalRaceProgress(last);

  if (gapNow < 1 || gapBefore >= 1) return integrated;

  return integrated.map((d) =>
    d.driverId === last.driverId
      ? {
          ...d,
          disqualified: true,
          lapProgress: 0,
        }
      : d,
  );
}

export function sortLive(drivers: RaceDriverState[]): RaceDriverState[] {
  return [...drivers].sort(
    (a, b) => b.completedLaps + b.lapProgress - (a.completedLaps + a.lapProgress),
  );
}

export function sortStatic(drivers: RaceDriverState[]): RaceDriverState[] {
  return [...drivers].sort((a, b) => a.internalIndex - b.internalIndex);
}
