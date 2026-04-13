"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useI18n } from "@/i18n/I18nProvider";

export function LeaveRaceConfirmDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}) {
  const { open, onOpenChange, onConfirm } = props;
  const { t } = useI18n();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-zinc-950 p-6 text-zinc-100 shadow-2xl outline-none">
          <Dialog.Title className="text-lg font-semibold tracking-tight">
            {t("race.leaveTitle")}
          </Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-relaxed text-zinc-300">
            {t("race.leaveBody")}
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
              >
                {t("race.leaveCancel")}
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
              {t("race.leaveConfirm")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
