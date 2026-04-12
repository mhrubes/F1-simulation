"use client";

import { useClock } from "@/hooks/useClock";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/cn";

const LANGS: Locale[] = ["cs", "en", "sk"];

export function AppHeader() {
  const clock = useClock(200);
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="w-24 shrink-0" />
        <div className="flex flex-1 justify-center">
          <div className="rounded-full border border-white/10 bg-white/5 px-6 py-1.5 font-mono text-sm tracking-[0.2em] text-zinc-100 tabular-nums">
            {clock}
          </div>
        </div>
        <div className="flex w-48 shrink-0 flex-col items-end gap-1 text-xs text-zinc-400">
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
    </header>
  );
}
