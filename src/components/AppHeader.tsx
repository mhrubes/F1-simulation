"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useClock } from "@/hooks/useClock";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/cn";
import { LeaveRaceConfirmDialog } from "@/components/LeaveRaceConfirmDialog";
import { useRaceStore } from "@/store/raceStore";

const LANGS: Locale[] = ["cs", "en", "sk"];

function HomePageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M9 22V12h6v10M3 10l9-7 9 7v11a1 1 0 01-1 1h-5v-8H9v8H4a1 1 0 01-1-1V10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppHeader() {
  const clock = useClock(200);
  const { locale, setLocale, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const reset = useRaceStore((s) => s.reset);
  const raceHomeAttention = useRaceStore((s) => s.raceHomeAttention);
  const setRaceHomeAttention = useRaceStore((s) => s.setRaceHomeAttention);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const onRacePage = pathname === "/race";

  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-[min(1680px,calc(100vw-2rem))] grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-3 sm:px-5 md:px-6">
        <div className="flex min-w-0 justify-start">
          {onRacePage ? (
            <button
              type="button"
              onClick={() => {
                setRaceHomeAttention(false);
                setLeaveOpen(true);
              }}
              aria-label={t("header.raceHomeExpand")}
              className={cn(
                "group flex h-9 max-w-full items-stretch overflow-hidden rounded-lg border border-white/10 bg-white/5 text-zinc-200",
                "transition-[color,background-color,box-shadow] duration-200",
                "hover:bg-white/10 hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/55",
                raceHomeAttention && "race-home-attention",
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center" aria-hidden>
                <HomePageIcon className="size-[1.15rem]" />
              </span>
              <span
                className={cn(
                  "grid overflow-hidden transition-[grid-template-columns] duration-500 ease-out motion-reduce:transition-none",
                  "grid-cols-[0fr] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]",
                )}
              >
                <span className="min-w-0">
                  <span className="block whitespace-nowrap py-1.5 pr-2.5 pl-0.5 text-left text-sm font-medium">
                    {t("header.raceHomeExpand")}
                  </span>
                </span>
              </span>
            </button>
          ) : null}
        </div>
        <div className="justify-self-center">
          <div className="rounded-full border border-white/10 bg-white/5 px-6 py-1.5 font-mono text-sm tracking-[0.2em] text-zinc-100 tabular-nums">
            {clock}
          </div>
        </div>
        <div className="flex min-w-0 flex-col items-end gap-1 justify-self-end text-xs text-zinc-400">
          <span className="uppercase tracking-wide">{t("header.lang")}</span>
          <div className="flex gap-1">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                className={cn(
                  "rounded-md px-2 py-1 font-semibold uppercase transition",
                  locale === l
                    ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.35)]"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <LeaveRaceConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        onConfirm={() => {
          reset();
          router.push("/");
        }}
      />
    </header>
  );
}
