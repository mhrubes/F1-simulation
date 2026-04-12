"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RaceDriverState, TrackDef } from "@/lib/types";
import { cn } from "@/lib/cn";

type Marker = {
  id: string;
  s: number;
  number: number;
  highlight?: boolean;
  dim?: boolean;
};

function tauOnTrack(d: RaceDriverState): number {
  const x = d.completedLaps + d.lapProgress;
  return ((x % 1) + 1) % 1;
}

const PIT_TAU = 0.86;

type Pt = { x: number; y: number };

export function TrackCircuit(props: {
  track: TrackDef;
  className?: string;
  pitBlend?: number;
  drivers?: RaceDriverState[];
  hoveredDriverId?: string | null;
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
    phase = "idle",
    previewProgress,
  } = props;

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
    return drivers.map((d) => {
      const base = tauOnTrack(d);
      const s = base * (1 - pitBlend) + PIT_TAU * pitBlend;
      return {
        id: d.driverId,
        s,
        number: d.carNumber,
        highlight: tableHoverActive && hoveredDriverId === d.driverId,
        dim: phase === "finished",
      };
    });
  }, [drivers, hoveredDriverId, phase, pitBlend, previewProgress]);

  useLayoutEffect(() => {
    const el = pathRef.current;
    if (!el) {
      setPoints([]);
      return;
    }
    const total = Math.max(1, el.getTotalLength());
    setPoints(
      markers.map((m) => ({
        m,
        pt: el.getPointAtLength(total * m.s),
      })),
    );
  }, [markers, track.pathD]);

  const orderedPoints = useMemo(() => {
    const boost =
      hoveredDriverId != null && (phase === "racing" || phase === "finished");
    if (!boost) return points;
    const id = hoveredDriverId;
    return [...points].sort(
      (a, b) => (a.m.id === id ? 1 : 0) - (b.m.id === id ? 1 : 0),
    );
  }, [points, hoveredDriverId, phase]);

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
        {orderedPoints.map(({ m, pt }) => {
          const r = m.highlight ? 16 : m.number === 0 ? 10 : 13;
          const fill = m.highlight ? "#f97316" : m.dim ? "#57534e" : "#e11d48";
          return (
            <g key={m.id} filter={m.highlight ? `url(#${fid})` : undefined}>
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
