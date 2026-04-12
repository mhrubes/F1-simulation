"use client";

import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTrack } from "@/data/tracks";
import { useRaceLoop } from "@/hooks/useRaceLoop";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/cn";
import { runFrameLoop } from "@/lib/runFrameLoop";
import { sortLive, sortStatic } from "@/lib/racePhysics";
import type { RaceDriverState } from "@/lib/types";
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

/** Stejný vizuál jako kroužek auta na SVG trati (červená výplň, tmavý obrys). */
function TrackStyleCarDisc({ n, title }: { n: number; title: string }) {
  return (
    <div title={title} className="relative flex h-[34px] w-[34px] shrink-0 items-center justify-center">
      <div
        className="absolute rounded-full bg-black/45"
        style={{ width: 30, height: 30, left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
      />
      <div
        className="relative flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-[#0a0a0a] bg-[#e11d48] text-[11px] font-extrabold leading-none text-zinc-950"
        style={{ fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" }}
      >
        {n}
      </div>
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
  const trackedDriverIds = useRaceStore((s) => s.trackedDriverIds);
  const toggleTrackedDriver = useRaceStore((s) => s.toggleTrackedDriver);
  const raceTimeScale = useRaceStore((s) => s.raceTimeScale);
  const setRaceTimeScale = useRaceStore((s) => s.setRaceTimeScale);
  const raceResultDurationMs = useRaceStore((s) => s.raceResultDurationMs);

  const [tab, setTab] = useState<"static" | "live">("static");
  const [lightsOpen, setLightsOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [pitBlend, setPitBlend] = useState(0);
  const [pageSize, setPageSize] = useState<LeaderPageSize>(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [listCollapsed, setListCollapsed] = useState(false);
  const finishedRef = useRef(false);
  const prevDisqualifiedSig = useRef("");

  useRaceLoop();

  /** Po diskvalifikaci (Q) odebrat jezdce ze sledování na trati. */
  useEffect(() => {
    const sig = drivers
      .filter((d) => d.disqualified)
      .map((d) => d.driverId)
      .sort()
      .join("|");
    if (sig === prevDisqualifiedSig.current) return;
    prevDisqualifiedSig.current = sig;
    const dq = new Set(sig ? sig.split("|") : []);
    useRaceStore.setState((s) => {
      const next = s.trackedDriverIds.filter((id) => !dq.has(id));
      if (next.length === s.trackedDriverIds.length) return {};
      return { trackedDriverIds: next };
    });
  }, [drivers]);

  const track = useMemo(() => getTrack(trackId ?? null), [trackId]);

  const liveRacing = useMemo(
    () => sortLive(drivers.filter((d) => !d.disqualified)),
    [drivers],
  );
  const stat = useMemo(() => sortStatic(drivers), [drivers]);
  const disqualified = useMemo(
    () =>
      [...drivers.filter((d) => d.disqualified)].sort(
        (a, b) => a.internalIndex - b.internalIndex,
      ),
    [drivers],
  );
  const racePosById = useMemo(() => {
    const m = new Map<string, number>();
    liveRacing.forEach((d, i) => m.set(d.driverId, i + 1));
    return m;
  }, [liveRacing]);

  const leaderLapDisplay = useMemo(() => {
    const leader = liveRacing[0];
    if (!leader) return 0;
    return Math.min(totalLaps, Math.floor(leader.completedLaps + leader.lapProgress));
  }, [liveRacing, totalLaps]);

  const canSwitchLists = phase === "racing" || phase === "finished";

  const totalDrivers = drivers.length;
  const pageCount = Math.max(1, Math.ceil(totalDrivers / pageSize));
  const rowOffset = pageIndex * pageSize;

  const pagedStat = useMemo(() => {
    return stat.slice(rowOffset, rowOffset + pageSize);
  }, [stat, rowOffset, pageSize]);

  const pagedLive = useMemo(() => {
    return liveRacing.slice(rowOffset, rowOffset + pageSize);
  }, [liveRacing, rowOffset, pageSize]);

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
    return runFrameLoop(() => {
      const u = Math.min(1, (performance.now() - start) / 900);
      setPitBlend(u);
      if (u >= 1) return false;
    });
  }, [phase]);

  const onLightsDone = useCallback(() => {
    setLightsOpen(false);
    setPhase("racing");
    setRaceTimes(performance.now(), null);
  }, [setPhase, setRaceTimes]);

  const durationMs = phase === "finished" ? raceResultDurationMs : null;

  const top5 = useMemo(() => liveRacing.slice(0, 5), [liveRacing]);

  if (!track) return null;

  return (
    <div className="mx-auto flex w-full max-w-[min(1680px,calc(100vw-2rem))] flex-col gap-6 px-3 py-8 sm:px-5 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">{t(track.nameKey)}</h1>
            <p className="text-sm text-zinc-400">
              {t("race.lapCounter")}:{" "}
              <span className="font-mono text-zinc-100">
                {leaderLapDisplay}/{totalLaps}
              </span>
            </p>
          </div>
          {phase === "racing" ? (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {t("race.timeScale")}
                  </span>
                  <div className="flex gap-0.5" role="group" aria-label={t("race.timeScale")}>
                    {([1, 2, 3, 5] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRaceTimeScale(s)}
                        className={cn(
                          "min-w-[2.75rem] rounded-md px-2.5 py-1 text-sm font-semibold tabular-nums transition",
                          raceTimeScale === s
                            ? "bg-red-600 text-white"
                            : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="bottom"
                className="z-30 max-w-[min(90vw,280px)] rounded-md border border-white/10 bg-zinc-950 px-2 py-1.5 text-xs leading-snug text-zinc-200 shadow-lg"
              >
                {t("race.timeScaleTooltip")}
              </Tooltip.Content>
            </Tooltip.Root>
          ) : null}
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
                followOnTrackEnabled={canSwitchLists}
                trackedDriverIds={trackedDriverIds}
                toggleTrackedDriver={toggleTrackedDriver}
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
                followOnTrackEnabled={canSwitchLists}
                trackedDriverIds={trackedDriverIds}
                toggleTrackedDriver={toggleTrackedDriver}
                racePosById={racePosById}
                t={t}
              />
            </Tabs.Content>
          </>
        )}
      </Tabs.Root>

      {disqualified.length > 0 ? (
        <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-200/90">
            {t("race.disqualified")} - {disqualified.length}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {disqualified.map((d) => {
              const lapsShown = Math.min(
                totalLaps,
                Math.floor(d.completedLaps + d.lapProgress),
              );
              const title = `${d.firstName} ${d.lastName} — ${lapsShown}/${totalLaps} — ${t("race.statusQ")}`;
              return <TrackStyleCarDisc key={d.driverId} n={d.carNumber} title={title} />;
            })}
          </div>
        </div>
      ) : null}

      <div className="w-full space-y-2">
        {phase === "finished" ? (
          <div className="flex justify-end text-sm">
            <span className="text-amber-300">{t("race.finished")}</span>
          </div>
        ) : null}
        <TrackCircuit
          track={track}
          className="aspect-[1000/650] w-full max-h-[min(68vh,720px)] [&>svg]:origin-center [&>svg]:scale-[1.03] motion-reduce:[&>svg]:scale-100"
          drivers={drivers.filter((d) => !d.disqualified)}
          hoveredDriverId={hoveredDriverId}
          trackedDriverIds={trackedDriverIds}
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
  rows: RaceDriverState[];
  /** Posun řádků oproti celému seznamu (živá pozice v závodě). */
  rowOffset: number;
  mode: "live" | "static";
  totalLaps: number;
  phase: string;
  hoveredDriverId: string | null;
  setHoveredDriverId: (id: string | null) => void;
  /** Sloupec se zaškrtávkou u startovního roště (závod / cíl). */
  followOnTrackEnabled?: boolean;
  trackedDriverIds?: string[];
  toggleTrackedDriver?: (id: string) => void;
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
    followOnTrackEnabled = false,
    trackedDriverIds = [],
    toggleTrackedDriver,
    racePosById,
    t,
  } = props;

  /**
   * Jezdec + stáj: `minmax(..., fr)` — hlavička sedí nad sloupci bez zbytečné díry, stáj má min. šířku.
   * Live má stejné pořadí sloupců jako rošt: jezdec → stáj → Ø km/h → kola.
   */
  /** Live: stejné pořadí textových sloupců jako startovní rošt — jezdec, stáj, Ø km/h, kola. */
  const headerLive =
    "grid grid-cols-[48px_56px_minmax(10.5rem,1.15fr)_minmax(11rem,1.25fr)_5.5rem_88px] items-center gap-x-3 gap-y-1 border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400";
  const headerLiveFollow =
    "grid grid-cols-[48px_56px_minmax(10.5rem,1.15fr)_minmax(11rem,1.25fr)_5.5rem_88px_minmax(5.5rem,6.5rem)] items-center gap-x-3 gap-y-1 border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400";
  const headerStatic =
    "grid grid-cols-[52px_56px_minmax(10.5rem,1.1fr)_minmax(11rem,1.2fr)_5.5rem_64px_88px] items-center gap-x-3 gap-y-1 border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400";
  const headerStaticFollow =
    "grid grid-cols-[52px_56px_minmax(10.5rem,1.1fr)_minmax(11rem,1.2fr)_5.5rem_64px_88px_minmax(5.5rem,6.5rem)] items-center gap-x-3 gap-y-1 border-b border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400";
  const rowLive =
    "grid grid-cols-[48px_56px_minmax(10.5rem,1.15fr)_minmax(11rem,1.25fr)_5.5rem_88px] items-center gap-x-3 gap-y-1 px-3 py-2 hover:bg-white/[0.03]";
  const rowLiveFollow =
    "grid grid-cols-[48px_56px_minmax(10.5rem,1.15fr)_minmax(11rem,1.25fr)_5.5rem_88px_minmax(5.5rem,6.5rem)] items-center gap-x-3 gap-y-1 px-3 py-2 hover:bg-white/[0.03]";
  const rowStatic =
    "grid grid-cols-[52px_56px_minmax(10.5rem,1.1fr)_minmax(11rem,1.2fr)_5.5rem_64px_88px] items-center gap-x-3 gap-y-1 px-3 py-2 hover:bg-white/[0.03]";
  const rowStaticFollow =
    "grid grid-cols-[52px_56px_minmax(10.5rem,1.1fr)_minmax(11rem,1.2fr)_5.5rem_64px_88px_minmax(5.5rem,6.5rem)] items-center gap-x-3 gap-y-1 px-3 py-2 hover:bg-white/[0.03]";
  const rowLiveHi =
    "grid grid-cols-[48px_56px_minmax(10.5rem,1.15fr)_minmax(11rem,1.25fr)_5.5rem_88px] items-center gap-x-3 gap-y-1 bg-orange-500/10 px-3 py-2";
  const rowLiveFollowHi =
    "grid grid-cols-[48px_56px_minmax(10.5rem,1.15fr)_minmax(11rem,1.25fr)_5.5rem_88px_minmax(5.5rem,6.5rem)] items-center gap-x-3 gap-y-1 bg-orange-500/10 px-3 py-2";
  const rowStaticHi =
    "grid grid-cols-[52px_56px_minmax(10.5rem,1.1fr)_minmax(11rem,1.2fr)_5.5rem_64px_88px] items-center gap-x-3 gap-y-1 bg-orange-500/10 px-3 py-2";
  const rowStaticFollowHi =
    "grid grid-cols-[52px_56px_minmax(10.5rem,1.1fr)_minmax(11rem,1.2fr)_5.5rem_64px_88px_minmax(5.5rem,6.5rem)] items-center gap-x-3 gap-y-1 bg-orange-500/10 px-3 py-2";

  const showTrackingCol = followOnTrackEnabled;
  const staticFollow = mode === "static" && showTrackingCol;
  const liveFollow = mode === "live" && showTrackingCol;

  const trackingHeader = (
    <span
      className="whitespace-nowrap text-center leading-tight"
      title={t("race.followCheckbox")}
    >
      {t("race.colTracking")}
    </span>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
      {mode === "live" ? (
        liveFollow ? (
          <div className={headerLiveFollow}>
            <span>{t("race.colPos")}</span>
            <span>{t("race.colNo")}</span>
            <span>{t("race.colDriver")}</span>
            <span>{t("race.colTeam")}</span>
            <span className="text-right">{t("race.colAvg")}</span>
            <span className="text-right">{t("race.colLaps")}</span>
            {trackingHeader}
          </div>
        ) : (
          <div className={headerLive}>
            <span>{t("race.colPos")}</span>
            <span>{t("race.colNo")}</span>
            <span>{t("race.colDriver")}</span>
            <span>{t("race.colTeam")}</span>
            <span className="text-right">{t("race.colAvg")}</span>
            <span className="text-right">{t("race.colLaps")}</span>
          </div>
        )
      ) : staticFollow ? (
        <div className={headerStaticFollow}>
          <span>{t("race.colRoof")}</span>
          <span>{t("race.colNo")}</span>
          <span>{t("race.colDriver")}</span>
          <span>{t("race.colTeam")}</span>
          <span className="text-right">{t("race.colAvg")}</span>
          <span className="text-right">{t("race.colRacePos")}</span>
          <span className="text-right">{t("race.colLaps")}</span>
          {trackingHeader}
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
          const tracked = trackedDriverIds.includes(d.driverId);
          const hi =
            activeHover &&
            (hoveredDriverId === d.driverId || tracked);
          let rowClass: string;
          if (mode === "live") {
            rowClass = liveFollow ? (hi ? rowLiveFollowHi : rowLiveFollow) : hi ? rowLiveHi : rowLive;
          } else if (staticFollow) {
            rowClass = hi ? rowStaticFollowHi : rowStaticFollow;
          } else {
            rowClass = hi ? rowStaticHi : rowStatic;
          }
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
              <div className="min-w-0 self-center text-sm font-medium leading-snug text-zinc-100">
                <span className="break-words [overflow-wrap:anywhere]">
                  {d.firstName} {d.lastName}
                </span>
                {d.disqualified ? (
                  <span
                    className="ml-1 inline-block align-middle rounded border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300"
                    title={t("race.disqualified")}
                  >
                    {t("race.statusQ")}
                  </span>
                ) : null}
              </div>
              {mode === "live" ? (
                <>
                  <div className="min-w-0 self-center text-sm leading-snug text-zinc-400 break-words [overflow-wrap:anywhere]">
                    {t(d.teamKey)}
                  </div>
                  <div className="flex items-center justify-end font-mono text-sm text-zinc-300">
                    {Math.round(d.displayAvgKmh || 0)}
                  </div>
                  <div className="flex items-center justify-end font-mono text-sm text-zinc-300">
                    {lapsShown}/{totalLaps}
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-0 self-center text-sm leading-snug text-zinc-400 break-words [overflow-wrap:anywhere]">
                    {t(d.teamKey)}
                  </div>
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
              {staticFollow || liveFollow ? (
                <div
                  className="flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-white/20 bg-black/40 text-orange-500 focus:ring-orange-500/60 disabled:cursor-not-allowed disabled:opacity-25"
                    checked={tracked}
                    disabled={d.disqualified}
                    onChange={() => toggleTrackedDriver?.(d.driverId)}
                    aria-label={t("race.followCheckbox")}
                    title={t("race.followCheckbox")}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
