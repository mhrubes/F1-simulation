export type Locale = "cs" | "en" | "sk";

export type RacePhase = "idle" | "lights" | "racing" | "finished";

export interface TrackDef {
  id: string;
  nameKey: string;
  /** Cílový čas kola v sekundách (60–180) */
  lapTimeSeconds: number;
  /** Náhled běží oproti závodu rychleji */
  previewSpeedFactor: number;
  imageSrc: string;
  pathD: string;
  viewBox: string;
  /** Délka „okruhu“ v metrech (pro výpočet rychlosti) */
  lengthMeters: number;
}

export interface DriverDef {
  id: string;
  firstName: string;
  lastName: string;
  teamKey: string;
}

export interface RaceDriverState {
  driverId: string;
  internalIndex: number;
  carNumber: number;
  firstName: string;
  lastName: string;
  teamKey: string;
  /** náhodný skill závodu */
  paceFactor: number;
  /** 0–1 průběh kola */
  lapProgress: number;
  completedLaps: number;
  /** exponenciální průměr km/h pro zobrazení */
  displayAvgKmh: number;
  finished: boolean;
}
