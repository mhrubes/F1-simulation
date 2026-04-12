import type { TrackDef } from "@/lib/types";

/** SVG path musí odpovídat souborům v /public/generated/tracks */
export const TRACKS: TrackDef[] = [
  {
    id: "monza",
    nameKey: "tracks.monza",
    lapTimeSeconds: 79,
    previewSpeedFactor: 2,
    imageSrc: "/generated/tracks/monza.svg",
    /** Jednoduchá „dokola“ – protáhlá smyčka (rýchlostní charakter) */
    pathD:
      "M 140 360 C 140 200 220 120 500 120 C 780 120 860 200 860 360 C 860 520 780 600 500 600 C 220 600 140 520 140 360 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5793,
  },
  {
    id: "spa",
    nameKey: "tracks.spa",
    lapTimeSeconds: 106,
    previewSpeedFactor: 2,
    imageSrc: "/generated/tracks/spa.svg",
    pathD:
      "M 70 420 L 95 280 L 210 220 L 340 260 L 415 180 L 545 145 L 675 175 L 780 135 L 910 210 L 925 350 L 845 470 L 715 520 L 545 495 L 400 530 L 255 495 L 145 505 L 75 460 L 70 420 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 7004,
  },
  {
    id: "silverstone",
    nameKey: "tracks.silverstone",
    lapTimeSeconds: 88,
    previewSpeedFactor: 2,
    imageSrc: "/generated/tracks/silverstone.svg",
    pathD:
      "M 120 140 L 290 110 L 455 150 L 615 125 L 765 185 L 835 305 L 795 445 L 655 535 L 485 515 L 330 555 L 185 490 L 125 320 L 120 140 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5891,
  },
  {
    id: "monaco",
    nameKey: "tracks.monaco",
    lapTimeSeconds: 74,
    previewSpeedFactor: 2,
    imageSrc: "/generated/tracks/monaco.svg",
    pathD:
      "M 155 500 L 155 215 L 285 140 L 455 160 L 595 135 L 745 195 L 815 315 L 775 445 L 645 525 L 495 505 L 355 530 L 220 505 L 155 500 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 3337,
  },
  {
    id: "suzuka",
    nameKey: "tracks.suzuka",
    lapTimeSeconds: 92,
    previewSpeedFactor: 2,
    imageSrc: "/generated/tracks/suzuka.svg",
    pathD:
      "M 485 95 C 665 75 840 190 825 330 C 805 435 700 485 595 470 C 505 458 455 520 355 515 C 215 505 105 395 125 265 C 145 165 265 95 400 95 C 430 95 460 95 485 95 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5807,
  },
  {
    id: "interlagos",
    nameKey: "tracks.interlagos",
    lapTimeSeconds: 72,
    previewSpeedFactor: 2,
    imageSrc: "/generated/tracks/interlagos.svg",
    /** Druhá jednoduchá „dokola“ – kompaktnější ovál */
    pathD:
      "M 500 145 C 715 145 855 250 855 325 C 855 410 715 505 500 505 C 285 505 145 410 145 325 C 145 250 285 145 500 145 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 4309,
  },
  {
    id: "ridgeway",
    nameKey: "tracks.ridgeway",
    lapTimeSeconds: 94,
    previewSpeedFactor: 2,
    imageSrc: "/generated/tracks/ridgeway.svg",
    /** Dlouhá spodní rovinka, ostrá levá, šikmý úsek, dva „vrcholy“ + V, technická pravá */
    pathD:
      "M 110 530 L 780 530 C 865 530 925 485 915 400 C 910 340 955 310 935 265 L 975 215 L 915 185 L 955 135 C 915 75 820 55 755 95 C 695 70 635 105 605 155 C 575 125 515 95 455 120 C 380 155 300 230 235 320 C 170 415 85 485 110 530 Z",
    viewBox: "0 0 1000 650",
    lengthMeters: 5480,
  },
];

export function getTrack(id: string | null): TrackDef | undefined {
  if (!id) return undefined;
  return TRACKS.find((t) => t.id === id);
}
