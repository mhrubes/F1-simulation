"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/I18nProvider";
import type { RaceDriverState } from "@/lib/types";

function formatDuration(ms: number | null): string {
  if (ms == null || !Number.isFinite(ms)) return "—";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}:${mm.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
  return `${mm}:${r.toString().padStart(2, "0")}`;
}

export function ResultsModal(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  top: RaceDriverState[];
  durationMs: number | null;
  onReset: () => void;
}) {
  const { open, onOpenChange, top, durationMs, onReset } = props;
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(94vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-zinc-950 p-6 text-zinc-100 shadow-2xl outline-none">
          <Dialog.Title className="text-xl font-semibold tracking-tight">
            {t("results.title")}
          </Dialog.Title>
          <p className="mt-2 text-sm text-zinc-400">
            {t("results.duration")}:{" "}
            <span className="font-mono text-zinc-100">{formatDuration(durationMs)}</span>
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-3 py-2">{t("results.pos")}</th>
                  <th className="px-3 py-2">{t("results.driver")}</th>
                  <th className="px-3 py-2">{t("results.team")}</th>
                </tr>
              </thead>
              <tbody>
                {top.map((d, idx) => (
                  <tr key={d.driverId} className="border-t border-white/5 odd:bg-white/[0.02]">
                    <td className="px-3 py-2 font-mono">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium">
                      {d.firstName} {d.lastName}
                    </td>
                    <td className="px-3 py-2 text-zinc-300">{t(d.teamKey)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
              >
                {t("results.close")}
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={() => {
                onReset();
                onOpenChange(false);
                router.push("/");
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              {t("results.home")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
