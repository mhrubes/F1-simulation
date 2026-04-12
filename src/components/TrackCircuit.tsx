"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { RaceDriverState, TrackDef } from "@/lib/types";
import { cn } from "@/lib/cn";

type Marker = {
  id: string;
  s: number;
  number: number;
  highlight?: boolean;
  dim?: boolean;
  /** Čeká na S/F před Q — blikající značka na trati */
  dqPending?: boolean;
};

function tauOnTrack(d: RaceDriverState): number {
  const x = d.completedLaps + d.lapProgress;
  return ((x % 1) + 1) % 1;
}

const PIT_TAU = 0.86;

/** Stabilní výchozí — `[]` v parametrech by se vytvářelo znovu každý render a rozbíjelo by závislosti. */
const EMPTY_TRACKED_IDS: readonly string[] = [];

type Pt = { x: number; y: number };

type StartFinishGeom = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lx: number;
  ly: number;
};

function computeStartFinish(path: SVGPathElement): StartFinishGeom | null {
  const total = path.getTotalLength();
  if (!Number.isFinite(total) || total < 2) return null;
  const p0 = path.getPointAtLength(0);
  const eps = Math.max(0.5, total * 0.004);
  let pFwd = path.getPointAtLength(eps);
  let tx = pFwd.x - p0.x;
  let ty = pFwd.y - p0.y;
  let len = Math.hypot(tx, ty);
  if (len < 1e-4) {
    pFwd = path.getPointAtLength(Math.max(0, total - eps));
    tx = p0.x - pFwd.x;
    ty = p0.y - pFwd.y;
    len = Math.hypot(tx, ty) || 1;
  } else {
    tx /= len;
    ty /= len;
  }
  const px = -ty;
  const py = tx;
  const half = 24;
  const labelGap = 20;
  return {
    x1: p0.x + px * half,
    y1: p0.y + py * half,
    x2: p0.x - px * half,
    y2: p0.y - py * half,
    lx: p0.x + px * (half + labelGap),
    ly: p0.y + py * (half + labelGap),
  };
}

export function TrackCircuit(props: {
  track: TrackDef;
  className?: string;
  pitBlend?: number;
  drivers?: RaceDriverState[];
  hoveredDriverId?: string | null;
  /** Zvýraznění na trati z tabulky startovního roště (více jezdců). */
  trackedDriverIds?: readonly string[];
  phase?: "idle" | "lights" | "racing" | "finished";
  previewProgress?: number | null;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [points, setPoints] = useState<Array<{ m: Marker; pt: Pt }>>([]);
  const rid = useId().replace(/:/g, "");
  const gid = `asphalt-${rid}`;
  const fid = `glow-${rid}`;
  const {
    track,
    className,
    pitBlend = 0,
    drivers,
    hoveredDriverId,
    trackedDriverIds = EMPTY_TRACKED_IDS,
    phase = "idle",
    previewProgress,
  } = props;

  const { t } = useI18n();
  const [startFinish, setStartFinish] = useState<StartFinishGeom | null>(null);

  const markers: Marker[] = useMemo(() => {
    if (previewProgress != null) {
      return [
        {
          id: "preview",
          s: ((previewProgress % 1) + 1) % 1,
          number: 0,
          highlight: true,
        },
      ];
    }
    if (!drivers?.length) return [];
    const tableHoverActive = phase === "racing" || phase === "finished";
    const tracked = new Set(trackedDriverIds);
    return drivers.map((d) => {
      const base = tauOnTrack(d);
      const s = base * (1 - pitBlend) + PIT_TAU * pitBlend;
      return {
        id: d.driverId,
        s,
        number: d.carNumber,
        highlight:
          tableHoverActive &&
          (hoveredDriverId === d.driverId || tracked.has(d.driverId)),
        dim: phase === "finished",
        dqPending: Boolean(d.dqPending),
      };
    });
  }, [drivers, hoveredDriverId, trackedDriverIds, phase, pitBlend, previewProgress]);

  useLayoutEffect(() => {
    const el = pathRef.current;
    if (!el) {
      setPoints([]);
      setStartFinish(null);
      return;
    }
    const total = Math.max(1, el.getTotalLength());
    setStartFinish(computeStartFinish(el));
    setPoints(
      markers.map((m) => ({
        m,
        pt: el.getPointAtLength(total * m.s),
      })),
    );
  }, [markers, track.pathD]);

  const orderedPoints = useMemo(() => {
    const active = phase === "racing" || phase === "finished";
    const tracked = new Set(trackedDriverIds);
    const boost =
      active && (hoveredDriverId != null || tracked.size > 0);
    if (!boost) return points;
    const rank = (id: string) => {
      if (id === hoveredDriverId) return 2;
      if (tracked.has(id)) return 1;
      return 0;
    };
    return [...points].sort((a, b) => rank(a.m.id) - rank(b.m.id));
  }, [points, hoveredDriverId, trackedDriverIds, phase]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 to-zinc-900 shadow-[0_20px_80px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      <svg viewBox={track.viewBox} className="h-full w-full" role="img">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1b1f2a" />
            <stop offset="100%" stopColor="#11141d" />
          </linearGradient>
          <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={track.pathD}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="46"
          strokeLinejoin="round"
        />
        <path
          ref={pathRef}
          d={track.pathD}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="34"
          strokeLinejoin="round"
        />
        <path
          d={track.pathD}
          fill="none"
          stroke="#e10600"
          strokeWidth="3"
          strokeLinejoin="round"
          opacity={0.55}
        />
        {startFinish ? (
          <g aria-label={t("track.startFinish")}>
            <title>{t("track.startFinish")}</title>
            <line
              x1={startFinish.x1}
              y1={startFinish.y1}
              x2={startFinish.x2}
              y2={startFinish.y2}
              stroke="#fafafa"
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.95}
            />
            <line
              x1={startFinish.x1}
              y1={startFinish.y1}
              x2={startFinish.x2}
              y2={startFinish.y2}
              stroke="#171717"
              strokeWidth={6}
              strokeDasharray="5 7"
              strokeLinecap="round"
              opacity={0.85}
            />
            <text
              x={startFinish.lx}
              y={startFinish.ly}
              fill="#e4e4e7"
              fontSize={16}
              fontWeight={800}
              textAnchor="middle"
              dominantBaseline="middle"
              stroke="#09090b"
              strokeWidth={0.75}
              paintOrder="stroke fill"
              style={{ fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              S/F
            </text>
          </g>
        ) : null}
        {orderedPoints.map(({ m, pt }) => {
          const r = m.highlight ? 16 : m.number === 0 ? 10 : 13;
          const fill = m.highlight
            ? "#f97316"
            : m.dim
              ? "#57534e"
              : m.dqPending
                ? "#f59e0b"
                : "#e11d48";
          const blinkPending =
            m.dqPending && !m.dim && (phase === "racing" || phase === "finished");
          return (
            <g key={m.id} filter={m.highlight ? `url(#${fid})` : undefined}>
              {blinkPending ? (
                <animate
                  attributeName="opacity"
                  values="1;0.28;1"
                  keyTimes="0;0.5;1"
                  dur="0.75s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                />
              ) : null}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={r + (m.highlight ? 4 : 2)}
                fill="rgba(0,0,0,0.45)"
              />
              <circle cx={pt.x} cy={pt.y} r={r} fill={fill} stroke="#0a0a0a" strokeWidth="2" />
              {m.number !== 0 ? (
                <text
                  x={pt.x}
                  y={pt.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-zinc-950"
                  style={{ fontSize: m.highlight ? 13 : 11, fontWeight: 800 }}
                >
                  {m.number}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
