"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DRIVERS } from "@/data/drivers";
import { getTrack, TRACKS } from "@/data/tracks";
import { useI18n } from "@/i18n/I18nProvider";
import { formatLapTime } from "@/i18n/messages";
import { useRaceStore } from "@/store/raceStore";
import { runFrameLoop } from "@/lib/runFrameLoop";
import { SetupConfirmDialog } from "./SetupConfirmDialog";
import { TrackCircuit } from "./TrackCircuit";

export function HomeClient() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const initFromSetup = useRaceStore((s) => s.initFromSetup);

  const [trackId, setTrackId] = useState<string | null>(null);
  const [laps, setLaps] = useState(8);
  const [drivers, setDrivers] = useState(10);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewP, setPreviewP] = useState(0);

  const track = useMemo(() => getTrack(trackId), [trackId]);

  useEffect(() => {
    if (!track) {
      return;
    }
    let p = 0;
    let last = performance.now();
    return runFrameLoop(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      p = (p + (1 / track.lapTimeSeconds) * track.previewSpeedFactor * dt) % 1;
      setPreviewP(p);
    });
  }, [track]);

  const maxDrivers = DRIVERS.length;
  const canContinue =
    Boolean(trackId) && laps >= 1 && drivers >= 1 && drivers <= maxDrivers;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-xl flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-[0_0_40px_rgba(220,38,38,0.25)]">
          {t("app.title")}
        </h1>
        <p className="text-sm text-zinc-400">{t("app.subtitle")}</p>
      </div>

      <div className="w-full space-y-3 text-left">
        <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {t("home.selectTrack")}
        </label>
        <select
          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-red-500/60"
          value={trackId ?? ""}
          onChange={(e) => setTrackId(e.target.value || null)}
        >
          <option value="">{t("home.selectTrack")}</option>
          {TRACKS.map((tr) => (
            <option key={tr.id} value={tr.id}>
              {t(tr.nameKey)}
            </option>
          ))}
        </select>
      </div>

      {track ? (
        <div className="w-full space-y-3">
          <p className="text-center text-sm text-zinc-400">{t("home.previewHint")}</p>
          <TrackCircuit
            track={track}
            className="mx-auto aspect-[1000/650] w-full max-w-xs"
            previewProgress={previewP}
          />
          <p className="text-center text-xs text-zinc-400">
            {t("home.lapTime")}:{" "}
            <span className="font-mono text-zinc-100">
              {formatLapTime(track.lapTimeSeconds, locale)}
            </span>
          </p>
        </div>
      ) : null}

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 text-left">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("home.laps")}
          </label>
          <input
            type="number"
            min={1}
            max={200}
            value={laps}
            onChange={(e) => setLaps(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-zinc-100 outline-none focus:border-red-500/60"
          />
        </div>
        <div className="space-y-2 text-left">
          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("home.drivers")}
          </label>
          <input
            type="number"
            min={1}
            max={maxDrivers}
            value={drivers}
            onChange={(e) =>
              setDrivers(
                Math.min(maxDrivers, Math.max(1, Number(e.target.value) || 1)),
              )
            }
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-zinc-100 outline-none focus:border-red-500/60"
          />
        </div>
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={() => setConfirmOpen(true)}
        className="w-full rounded-2xl bg-red-600 px-6 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(220,38,38,0.35)] transition enabled:hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {t("home.gotoSim")}
      </button>

      <SetupConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        track={track}
        laps={laps}
        drivers={drivers}
        onConfirm={() => {
          if (!trackId) return;
          initFromSetup({ trackId, totalLaps: laps, driverCount: drivers });
          router.push("/race");
        }}
      />
    </main>
  );
}
