"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useI18n } from "@/i18n/I18nProvider";
import { formatLapTime } from "@/i18n/messages";
import type { TrackDef } from "@/lib/types";

export function SetupConfirmDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  track: TrackDef | undefined;
  laps: number;
  drivers: number;
  onConfirm: () => void;
}) {
  const { open, onOpenChange, track, laps, drivers, onConfirm } = props;
  const { t, locale } = useI18n();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-zinc-950 p-6 text-zinc-100 shadow-2xl outline-none">
          <Dialog.Title className="text-lg font-semibold tracking-tight">
            {t("confirm.title")}
          </Dialog.Title>
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">{t("confirm.track")}</span>
              <span className="text-right font-medium text-zinc-100">
                {track ? t(track.nameKey) : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">{t("confirm.laps")}</span>
              <span className="font-mono">{laps}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">{t("confirm.drivers")}</span>
              <span className="font-mono">{drivers}</span>
            </div>
            {track ? (
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">{t("home.lapTime")}</span>
                <span className="font-mono">
                  {formatLapTime(track.lapTimeSeconds, locale)}
                </span>
              </div>
            ) : null}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
              >
                {t("confirm.cancel")}
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(220,38,38,0.35)] hover:bg-red-500"
            >
              {t("confirm.ok")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
