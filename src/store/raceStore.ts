"use client";

import { create } from "zustand";
import { pickRandomDrivers, uniqueCarNumbers } from "@/data/drivers";
import type { RaceDriverState, RacePhase } from "@/lib/types";

export type RaceTimeScale = 1 | 2 | 3 | 5 | 10;

export type RaceStoreState = {
  trackId: string | null;
  totalLaps: number;
  drivers: RaceDriverState[];
  phase: RacePhase;
  raceStartedAt: number | null;
  raceEndedAt: number | null;
  /** Násobič plynutí simulace během závodu (1×–5×, nad 30 kol i 10×); neovlivní km/h jako „rychlost auta“. */
  raceTimeScale: RaceTimeScale;
  /** Délka závodu pro výsledky (ms), doplní se v cíli: Σ min(Δt_wall,50 ms)×násobič — odpovídá 1× „závodnímu“ času. */
  raceResultDurationMs: number | null;
  hoveredDriverId: string | null;
  /** Jezdci zvolení u startovního roště — zvýraznění na trati (více najednou). */
  trackedDriverIds: string[];
  /** 0–1 vizuální posun do depa po závodě */
  pitAnimation: number;
  /** Po zavření výsledků na /race — jemně zvýraznit návrat na úvod (viz hlavička). */
  raceHomeAttention: boolean;
};

type RaceStoreActions = {
  initFromSetup: (input: { trackId: string; totalLaps: number; driverCount: number }) => void;
  reset: () => void;
  setPhase: (p: RacePhase) => void;
  setRaceTimeScale: (scale: RaceTimeScale) => void;
  setRaceResultDurationMs: (ms: number | null) => void;
  setHoveredDriverId: (id: string | null) => void;
  toggleTrackedDriver: (driverId: string) => void;
  setDrivers: (d: RaceDriverState[]) => void;
  setRaceTimes: (startedAt: number | null, endedAt: number | null) => void;
  setPitAnimation: (v: number) => void;
  setRaceHomeAttention: (v: boolean) => void;
};

const initial: RaceStoreState = {
  trackId: null,
  totalLaps: 1,
  drivers: [],
  phase: "idle",
  raceStartedAt: null,
  raceEndedAt: null,
  raceTimeScale: 1,
  raceResultDurationMs: null,
  hoveredDriverId: null,
  trackedDriverIds: [],
  pitAnimation: 0,
  raceHomeAttention: false,
};

export const useRaceStore = create<RaceStoreState & RaceStoreActions>((set) => ({
  ...initial,
  initFromSetup: ({ trackId, totalLaps, driverCount }) => {
    const picked = pickRandomDrivers(driverCount);
    const nums = uniqueCarNumbers(picked.length);
    const drivers: RaceDriverState[] = picked.map((d, i) => ({
      driverId: d.id,
      internalIndex: i + 1,
      carNumber: nums[i],
      firstName: d.firstName,
      lastName: d.lastName,
      teamKey: d.teamKey,
      paceFactor: 0.965 + Math.random() * 0.07,
      lapProgress: 0,
      completedLaps: 0,
      displayAvgKmh: 0,
      finished: false,
      finishSimTimeMs: null,
      disqualified: false,
      dqPending: false,
      dqAfterProgress: null,
      soloFinishLine: null,
    }));
    set({
      trackId,
      totalLaps,
      drivers,
      phase: "idle",
      raceStartedAt: null,
      raceEndedAt: null,
      raceTimeScale: 1,
      raceResultDurationMs: null,
      hoveredDriverId: null,
      trackedDriverIds: [],
      pitAnimation: 0,
      raceHomeAttention: false,
    });
  },
  reset: () => set({ ...initial }),
  setPhase: (phase) => set({ phase }),
  setRaceTimeScale: (raceTimeScale) => set({ raceTimeScale }),
  setRaceResultDurationMs: (raceResultDurationMs) => set({ raceResultDurationMs }),
  setHoveredDriverId: (hoveredDriverId) => set({ hoveredDriverId }),
  toggleTrackedDriver: (driverId) =>
    set((s) => {
      const row = s.drivers.find((d) => d.driverId === driverId);
      if (!row || row.disqualified) return {};
      const cur = s.trackedDriverIds;
      if (cur.includes(driverId)) {
        return { trackedDriverIds: cur.filter((id) => id !== driverId) };
      }
      return { trackedDriverIds: [...cur, driverId] };
    }),
  setDrivers: (drivers) => set({ drivers }),
  setRaceTimes: (raceStartedAt, raceEndedAt) =>
    set((s) => ({
      raceStartedAt,
      raceEndedAt,
      ...(raceStartedAt != null && raceEndedAt == null ? { raceResultDurationMs: null } : {}),
    })),
  setPitAnimation: (pitAnimation) => set({ pitAnimation }),
  setRaceHomeAttention: (raceHomeAttention) => set({ raceHomeAttention }),
}));
