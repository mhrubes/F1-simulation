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
  /** Simulovaný čas závodu (ms, 1× herní čas) v okamžiku cíle; jen pro klasifikované v cíli. */
  finishSimTimeMs: number | null;
  /** Modrá vlajka: po dojetí na S/F — závod ukončen, označení Q, bez jízdy dál */
  disqualified: boolean;
  /** Lídr má o ≥1 kolo víc; jezdec dojíždí k další čáře S/F, pak dostane Q */
  dqPending: boolean;
  /** Celkový „progress“ (součet kol + zlomek), u kterého proběhne DQ na čáře; null = nečeká */
  dqAfterProgress: number | null;
  /** Jen poslední aktivní jezdec: cílový progress na S/F po dojetí aktuálního kola, pak konec závodu */
  soloFinishLine: number | null;
}
