"use client";

import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTrack } from "@/data/tracks";
import { useRaceLoop } from "@/hooks/useRaceLoop";
import { useI18n } from "@/i18n/I18nProvider";
import { sortLive, sortStatic } from "@/lib/racePhysics";
import { useRaceStore } from "@/store/raceStore";
import { ResultsModal } from "./ResultsModal";
import { TrackCircuit } from "./TrackCircuit";
import { TrafficLights } from "./TrafficLights";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 50] as const;
type LeaderPageSize = (typeof PAGE_SIZE_OPTIONS)[number];

function Badge({ n }: { n: number }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-100 ring-1 ring-white/10">
      {n}
    </div>
  );
}

export function RaceScreen() {
  const { t } = useI18n();
  const trackId = useRaceStore((s) => s.trackId);
  const totalLaps = useRaceStore((s) => s.totalLaps);
  const drivers = useRaceStore((s) => s.drivers);
  const phase = useRaceStore((s) => s.phase);
  const setPhase = useRaceStore((s) => s.setPhase);
  const setRaceTimes = useRaceStore((s) => s.setRaceTimes);
  const hoveredDriverId = useRaceStore((s) => s.hoveredDriverId);
  const setHoveredDriverId = useRaceStore((s) => s.setHoveredDriverId);
  const raceStartedAt = useRaceStore((s) => s.raceStartedAt);
  const raceEndedAt = useRaceStore((s) => s.raceEndedAt);

  const [tab, setTab] = useState<"static" | "live">("static");
  const [lightsOpen, setLightsOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [pitBlend, setPitBlend] = useState(0);
  const [pageSize, setPageSize] = useState<LeaderPageSize>(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [listCollapsed, setListCollapsed] = useState(false);
  const finishedRef = useRef(false);

  useRaceLoop();

  const track = useMemo(() => getTrack(trackId ?? null), [trackId]);

  const live = useMemo(() => sortLive(drivers), [drivers]);
  const stat = useMemo(() => sortStatic(drivers), [drivers]);
  const racePosById = useMemo(() => {
    const m = new Map<string, number>();
    live.forEach((d, i) => m.set(d.driverId, i + 1));
    return m;
  }, [live]);

  const leaderLapDisplay = useMemo(() => {
    const leader = live[0];
    if (!leader) return 0;
    return Math.min(totalLaps, Math.floor(leader.completedLaps + leader.lapProgress));
  }, [live, totalLaps]);

  const canSwitchLists = phase === "racing" || phase === "finished";

  const totalDrivers = drivers.length;
  const pageCount = Math.max(1, Math.ceil(totalDrivers / pageSize));
  const rowOffset = pageIndex * pageSize;

  const pagedStat = useMemo(() => {
    return stat.slice(rowOffset, rowOffset + pageSize);
  }, [stat, rowOffset, pageSize]);

  const pagedLive = useMemo(() => {
    return live.slice(rowOffset, rowOffset + pageSize);
  }, [live, rowOffset, pageSize]);

  useEffect(() => {
    setPageIndex(0);
  }, [pageSize]);

  useEffect(() => {
    setPageIndex((i) => Math.min(Math.max(0, i), pageCount - 1));
  }, [pageCount]);

  useEffect(() => {
    if (phase !== "finished") {
      finishedRef.current = false;
      return;
    }
    if (finishedRef.current) return;
    finishedRef.current = true;
    queueMicrotask(() => setResultsOpen(true));
    const start = performance.now();
    let fr = 0;
    const step = (now: number) => {
      const u = Math.min(1, (now - start) / 900);
      setPitBlend(u);
      if (u < 1) fr = requestAnimationFrame(step);
    };
    fr = requestAnimationFrame(step);
    return () => cancelAnimationFrame(fr);
  }, [phase]);

  const onLightsDone = useCallback(() => {
    setLightsOpen(false);
    setPhase("racing");
    setRaceTimes(performance.now(), null);
  }, [setPhase, setRaceTimes]);

  const durationMs =
    raceStartedAt != null && raceEndedAt != null ? raceEndedAt - raceStartedAt : null;

  const top5 = useMemo(() => sortLive(drivers).slice(0, 5), [drivers]);

  if (!track) return null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{t(track.nameKey)}</h1>
          <p className="text-sm text-zinc-400">
            {t("race.lapCounter")}:{" "}
            <span className="font-mono text-zinc-100">
              {leaderLapDisplay}/{totalLaps}
            </span>
          </p>
        </div>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <span className="inline-flex">
              <button
                type="button"
                disabled={phase !== "idle" || lightsOpen}
                onClick={() => {
                  setLightsOpen(true);
                  setPhase("lights");
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(220,38,38,0.35)] transition enabled:hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("race.start")}
              </button>
            </span>
          </Tooltip.Trigger>
          {phase !== "idle" || lightsOpen ? (
            <Tooltip.Content className="z-30 rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 shadow-lg">
              {lightsOpen || phase === "lights"
                ? t("race.tooltip.lights")
                : phase === "finished"
                  ? t("race.finished")
                  : t("race.tooltip.startDone")}
            </Tooltip.Content>
          ) : null}
        </Tooltip.Root>
      </div>

      <Tabs.Root
        value={tab}
        onValueChange={(v) => {
          if (v === "live" && !canSwitchLists) return;
          setTab(v as "static" | "live");
        }}
        className="w-full"
      >
        <Tabs.List className="flex gap-2 rounded-xl border border-white/10 bg-black/30 p-1">
          <Tabs.Trigger
            value="static"
            className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 data-[state=active]:bg-white/10 data-[state=active]:text-white"
          >
            {t("race.listStatic")}
          </Tabs.Trigger>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span className="flex flex-1">
                <Tabs.Trigger
                  value="live"
                  disabled={!canSwitchLists}
                  className="w-full rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 data-[state=active]:bg-white/10 data-[state=active]:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("race.listLive")}
                </Tabs.Trigger>
              </span>
            </Tooltip.Trigger>
            {!canSwitchLists ? (
              <Tooltip.Content className="z-20 rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 shadow-lg">
                {t("race.tooltip.tabs")}
              </Tooltip.Content>
            ) : null}
          </Tooltip.Root>
        </Tabs.List>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
          <button
            type="button"
            onClick={() => setListCollapsed((c) => !c)}
            aria-expanded={!listCollapsed}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
          >
            {listCollapsed ? t("race.expand") : t("race.collapse")}
          </button>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              <span>{t("race.perPage")}</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) as LeaderPageSize)}
                className="rounded-lg border border-white/15 bg-zinc-950 px-2 py-1.5 text-sm font-medium text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/40"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            {!listCollapsed ? (
              <>
                <span className="text-sm tabular-nums text-zinc-300">
                  {t("race.pageShort")} {pageIndex + 1}/{pageCount}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pageIndex <= 0}
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                    title={t("race.prevPage")}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-zinc-200 transition enabled:hover:bg-white/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    disabled={pageIndex >= pageCount - 1}
                    onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                    title={t("race.nextPage")}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-zinc-200 transition enabled:hover:bg-white/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ›
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {listCollapsed ? (
          <p className="mt-3 rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center text-sm text-zinc-500">
            {t("race.listHidden")}
          </p>
        ) : (
          <>
            <Tabs.Content value="static" className="mt-3 outline-none">
              <LeaderTable
                rows={pagedStat}
                rowOffset={rowOffset}
                mode="static"
                totalLaps={totalLaps}
                phase={phase}
                hoveredDriverId={hoveredDriverId}
                setHoveredDriverId={setHoveredDriverId}
                racePosById={racePosById}
                t={t}
              />
            </Tabs.Content>
            <Tabs.Content value="live" className="mt-3 outline-none">
              <LeaderTable
                rows={pagedLive}
                rowOffset={rowOffset}
                mode="live"
                totalLaps={totalLaps}
                phase={phase}
                hoveredDriverId={hoveredDriverId}
                setHoveredDriverId={setHoveredDriverId}
                racePosById={racePosById}
                t={t}
              />
            </Tabs.Content>
          </>
        )}
      </Tabs.Root>

      <div className="space-y-2">
        {phase === "finished" ? (
          <div className="flex justify-end text-sm">
            <span className="text-amber-300">{t("race.finished")}</span>
          </div>
        ) : null}
        <TrackCircuit
          track={track}
          className="aspect-[1000/650] w-full max-h-[520px]"
          drivers={drivers}
          hoveredDriverId={hoveredDriverId}
          phase={phase}
          pitBlend={pitBlend}
        />
      </div>

      <TrafficLights open={lightsOpen} onComplete={onLightsDone} />

      <ResultsModal
        open={resultsOpen}
        onOpenChange={setResultsOpen}
        top={top5}
        durationMs={durationMs}
        onReset={() => {
          useRaceStore.getState().reset();
        }}
      />
    </div>
  );
}

function LeaderTable(props: {
  rows: ReturnType<typeof sortLive>;
  /** Posun řádků oproti celému seznamu (živá pozice v závodě). */
  rowOffset: number;
  mode: "live" | "static";
  totalLaps: number;
  phase: string;
  hoveredDriverId: string | null;
  setHoveredDriverId: (id: string | null) => void;
  racePosById: Map<string, number>;
  t: (k: string) => string;
}) {
  const {
    rows,
    rowOffset,
    mode,
    totalLaps,
    phase,
    hoveredDriverId,
    setHoveredDriverId,
    racePosById,
    t,
  } = props;

  const headerLive =
    "grid grid-cols-[48px_56px_minmax(0,1fr)_96px_minmax(0,1fr)_88px] items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400";
  const headerStatic =
    "grid grid-cols-[52px_56px_minmax(0,1fr)_minmax(0,1fr)_96px_64px_88px] items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400";
  const rowLive =
    "grid grid-cols-[48px_56px_minmax(0,1fr)_96px_minmax(0,1fr)_88px] items-center gap-2 px-3 py-2 hover:bg-white/[0.03]";
  const rowStatic =
    "grid grid-cols-[52px_56px_minmax(0,1fr)_minmax(0,1fr)_96px_64px_88px] items-center gap-2 px-3 py-2 hover:bg-white/[0.03]";
  const rowLiveHi =
    "grid grid-cols-[48px_56px_minmax(0,1fr)_96px_minmax(0,1fr)_88px] items-center gap-2 bg-orange-500/10 px-3 py-2";
  const rowStaticHi =
    "grid grid-cols-[52px_56px_minmax(0,1fr)_minmax(0,1fr)_96px_64px_88px] items-center gap-2 bg-orange-500/10 px-3 py-2";

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
      {mode === "live" ? (
        <div className={headerLive}>
          <span>{t("race.colPos")}</span>
          <span>{t("race.colNo")}</span>
          <span>{t("race.colDriver")}</span>
          <span className="text-right">{t("race.colAvg")}</span>
          <span>{t("race.colTeam")}</span>
          <span className="text-right">{t("race.colLaps")}</span>
        </div>
      ) : (
        <div className={headerStatic}>
          <span>{t("race.colRoof")}</span>
          <span>{t("race.colNo")}</span>
          <span>{t("race.colDriver")}</span>
          <span>{t("race.colTeam")}</span>
          <span className="text-right">{t("race.colAvg")}</span>
          <span className="text-right">{t("race.colRacePos")}</span>
          <span className="text-right">{t("race.colLaps")}</span>
        </div>
      )}
      <div className="divide-y divide-white/5">
        {rows.map((d, idx) => {
          const lapsShown = Math.min(totalLaps, Math.floor(d.completedLaps + d.lapProgress));
          const activeHover = phase === "racing" || phase === "finished";
          const hi = activeHover && hoveredDriverId === d.driverId;
          const rowClass = mode === "live" ? (hi ? rowLiveHi : rowLive) : hi ? rowStaticHi : rowStatic;
          const livePos =
            mode === "live" ? rowOffset + idx + 1 : d.internalIndex;
          const racePos = racePosById.get(d.driverId) ?? "—";
          return (
            <div
              key={d.driverId}
              className={rowClass}
              onMouseEnter={() => activeHover && setHoveredDriverId(d.driverId)}
              onMouseLeave={() => activeHover && setHoveredDriverId(null)}
            >
              <div className="flex items-center font-mono text-sm text-zinc-200">{livePos}</div>
              <div className="flex items-center">
                <Badge n={d.carNumber} />
              </div>
              <div className="flex items-center text-sm font-medium text-zinc-100">
                {d.firstName} {d.lastName}
              </div>
              {mode === "live" ? (
                <>
                  <div className="flex items-center justify-end font-mono text-sm text-zinc-300">
                    {Math.round(d.displayAvgKmh || 0)}
                  </div>
                  <div className="flex items-center truncate text-sm text-zinc-400">{t(d.teamKey)}</div>
                  <div className="flex items-center justify-end font-mono text-sm text-zinc-300">
                    {lapsShown}/{totalLaps}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center truncate text-sm text-zinc-400">{t(d.teamKey)}</div>
                  <div className="flex items-center justify-end font-mono text-sm text-zinc-300">
                    {Math.round(d.displayAvgKmh || 0)}
                  </div>
                  <div className="flex items-center justify-end font-mono text-sm text-zinc-300">
                    {racePos}
                  </div>
                  <div className="flex items-center justify-end font-mono text-sm text-zinc-300">
                    {lapsShown}/{totalLaps}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
