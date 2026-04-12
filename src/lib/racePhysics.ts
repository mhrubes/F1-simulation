import type { RaceDriverState } from "@/lib/types";
import type { TrackDef } from "@/lib/types";
import { firstRacerFast } from "@/config/raceFeatures";
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
  /** Současný simulovaný čas závodu (ms) po tomto fyzikálním kroku — razítko cíle. */
  simElapsedMs: number,
): { drivers: RaceDriverState[]; allFinished: boolean } {
  const dt = Math.max(0, Math.min(dtSeconds, 0.25));
  const lapFactors = ensureLapSpeedFactors(track.pathD);

  const next = drivers.map((d) => {
    if (d.finished || d.disqualified) return d;
    let instantLap: number;
    let instKmh: number;
    const boostedFirst = firstRacerFast && d.internalIndex === 1;
    if (boostedFirst) {
      instKmh =
        500 *
        (0.985 + 0.03 * Math.sin(now * 0.0025 + d.driverId.charCodeAt(1)));
      instantLap = (track.lengthMeters * 3.6) / instKmh;
    } else {
      const geometryMult = lookupLapSpeedFactor(lapFactors, d.lapProgress);
      const mult =
        geometryMult * microNoise(now, d.driverId.charCodeAt(1));
      const baseLap = track.lapTimeSeconds / d.paceFactor;
      instantLap = baseLap / mult;
      instKmh = (track.lengthMeters / instantLap) * 3.6;
    }
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
      finishSimTimeMs: done
        ? d.finishSimTimeMs != null
          ? d.finishSimTimeMs
          : simElapsedMs
        : d.finishSimTimeMs,
    };
  });

  const withDq = applyBlueFlagDisqualification(next, totalLaps);
  const finalDrivers = applySoleSurvivorFinish(withDq, totalLaps, simElapsedMs);

  const allFinished =
    finalDrivers.length > 0 &&
    finalDrivers.every((d) => d.finished || d.disqualified);

  return { drivers: finalDrivers, allFinished };
}

/** Aktivní v závodě: ne v cíli ani ne diskvalifikovaní (čekající na S/F stále jedou). */
function racingActive(d: RaceDriverState): boolean {
  return !d.finished && !d.disqualified;
}

/**
 * Každý jezdec (kromě lídra), za kterým má lídr alespoň celé kolo náskoku,
 * čeká na další čáru start/cíl; po jejím přejetí dostane Q a zastaví se.
 * Dřívější logika jen pro „posledního“ a jen při přechodu mezery přes 1 nechala
 * ostatní obkroužené jezdce navždy bez trestu.
 */
function applyBlueFlagDisqualification(
  integrated: RaceDriverState[],
  totalLaps: number,
): RaceDriverState[] {
  const racing = integrated.filter(racingActive);
  if (racing.length < 2) return integrated;

  const sorted = [...racing].sort(
    (a, b) => totalRaceProgress(b) - totalRaceProgress(a),
  );
  const leader = sorted[0];
  const leaderTotal = totalRaceProgress(leader);

  const pass1 = integrated.map((d) => {
    if (d.finished || d.disqualified) return d;
    if (d.driverId === leader.driverId) return d;

    const my = totalRaceProgress(d);
    if (leaderTotal - my < 1) return d;

    if (d.dqPending) return d;

    const nextLine = Math.floor(my) + 1;
    return {
      ...d,
      dqPending: true,
      dqAfterProgress: nextLine,
    };
  });

  return pass1.map((d) => {
    if (!d.dqPending || d.disqualified || d.finished) return d;
    const line = d.dqAfterProgress;
    if (line == null) return d;
    const my = totalRaceProgress(d);
    if (my + 1e-6 < line) return d;

    const snapLaps = Math.min(line, totalLaps);
    return {
      ...d,
      disqualified: true,
      dqPending: false,
      dqAfterProgress: null,
      lapProgress: 0,
      completedLaps: snapLaps,
    };
  });
}

/**
 * Zůstane-li jen jeden jezdec (ostatní Q nebo v cíli), po dojetí další čáry S/F
 * (aktuální kolo = další celý progress) závod skončí — nemusí odjet plný počet kol.
 */
function applySoleSurvivorFinish(
  drivers: RaceDriverState[],
  totalLaps: number,
  simElapsedMs: number,
): RaceDriverState[] {
  const racing = drivers.filter(racingActive);
  if (racing.length !== 1) {
    return drivers.map((d) =>
      d.soloFinishLine != null ? { ...d, soloFinishLine: null } : d,
    );
  }

  const sole = racing[0];
  return drivers.map((d) => {
    if (d.driverId !== sole.driverId) {
      return d.soloFinishLine != null ? { ...d, soloFinishLine: null } : d;
    }
    if (d.finished || d.disqualified) return d;

    const my = totalRaceProgress(d);
    let line = d.soloFinishLine;
    if (line == null) {
      line = Math.floor(my) + 1;
    }

    if (my + 1e-6 >= line) {
      const snapLaps = Math.min(Math.floor(my + 1e-6), totalLaps);
      return {
        ...d,
        finished: true,
        lapProgress: 0,
        completedLaps: snapLaps,
        soloFinishLine: null,
        finishSimTimeMs: d.finishSimTimeMs ?? simElapsedMs,
      };
    }

    return { ...d, soloFinishLine: line };
  });
}

export function sortLive(drivers: RaceDriverState[]): RaceDriverState[] {
  return [...drivers].sort(
    (a, b) => b.completedLaps + b.lapProgress - (a.completedLaps + a.lapProgress),
  );
}

export function sortStatic(drivers: RaceDriverState[]): RaceDriverState[] {
  return [...drivers].sort((a, b) => a.internalIndex - b.internalIndex);
}
