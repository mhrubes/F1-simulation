/**
 * Opakovaně volá onFrame. Na viditelné kartě použije requestAnimationFrame,
 * na skryté setTimeout — prohlížeč při skryté kartě silně omezuje rAF,
 * takže simulace by jinak „zamrzla“.
 *
 * @returns `false` z onFrame zastaví smyčku (např. dokončená krátká animace).
 */
export function runFrameLoop(
  onFrame: () => void | false,
  options?: { hiddenIntervalMs?: number },
): () => void {
  const hiddenMs = options?.hiddenIntervalMs ?? 120;
  let rafId = 0;
  let timeoutId = 0;
  let stopped = false;

  const clear = () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (timeoutId) clearTimeout(timeoutId);
    rafId = 0;
    timeoutId = 0;
  };

  const tick = () => {
    if (stopped) return;
    if (onFrame() === false) {
      stopped = true;
      clear();
      return;
    }
    schedule();
  };

  const schedule = () => {
    if (stopped) return;
    clear();
    const hidden =
      typeof document !== "undefined" &&
      document.visibilityState === "hidden";
    if (hidden) {
      timeoutId = window.setTimeout(() => {
        timeoutId = 0;
        tick();
      }, hiddenMs);
    } else {
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        tick();
      });
    }
  };

  const onVis = () => {
    if (stopped) return;
    clear();
    schedule();
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVis);
  }

  schedule();

  return () => {
    stopped = true;
    clear();
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", onVis);
    }
  };
}
