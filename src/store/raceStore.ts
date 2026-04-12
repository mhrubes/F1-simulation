"use client";

import { create } from "zustand";
import { pickRandomDrivers, uniqueCarNumbers } from "@/data/drivers";
import type { RaceDriverState, RacePhase } from "@/lib/types";

export type RaceStoreState = {
  trackId: string | null;
  totalLaps: number;
  drivers: RaceDriverState[];
  phase: RacePhase;
  raceStartedAt: number | null;
  raceEndedAt: number | null;
  hoveredDriverId: string | null;
  /** 0–1 vizuální posun do depa po závodě */
  pitAnimation: number;
};

type RaceStoreActions = {
  initFromSetup: (input: { trackId: string; totalLaps: number; driverCount: number }) => void;
  reset: () => void;
  setPhase: (p: RacePhase) => void;
  setHoveredDriverId: (id: string | null) => void;
  setDrivers: (d: RaceDriverState[]) => void;
  setRaceTimes: (startedAt: number | null, endedAt: number | null) => void;
  setPitAnimation: (v: number) => void;
};

const initial: RaceStoreState = {
  trackId: null,
  totalLaps: 1,
  drivers: [],
  phase: "idle",
  raceStartedAt: null,
  raceEndedAt: null,
  hoveredDriverId: null,
  pitAnimation: 0,
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
    }));
    set({
      trackId,
      totalLaps,
      drivers,
      phase: "idle",
      raceStartedAt: null,
      raceEndedAt: null,
      hoveredDriverId: null,
      pitAnimation: 0,
    });
  },
  reset: () => set({ ...initial }),
  setPhase: (phase) => set({ phase }),
  setHoveredDriverId: (hoveredDriverId) => set({ hoveredDriverId }),
  setDrivers: (drivers) => set({ drivers }),
  setRaceTimes: (raceStartedAt, raceEndedAt) => set({ raceStartedAt, raceEndedAt }),
  setPitAnimation: (pitAnimation) => set({ pitAnimation }),
}));
