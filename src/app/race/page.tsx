"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RaceScreen } from "@/components/RaceScreen";
import { useI18n } from "@/i18n/I18nProvider";
import { useRaceStore } from "@/store/raceStore";

export default function RacePage() {
  const router = useRouter();
  const { t } = useI18n();
  const trackId = useRaceStore((s) => s.trackId);
  const drivers = useRaceStore((s) => s.drivers);

  useEffect(() => {
    if (!trackId || drivers.length === 0) {
      router.replace("/");
    }
  }, [trackId, drivers.length, router]);

  if (!trackId || drivers.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6 text-sm text-zinc-500">
        {t("app.title")}…
      </div>
    );
  }

  return <RaceScreen />;
}
