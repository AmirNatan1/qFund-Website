export const INTRO_DONE_EVENT = "qf:intro-done";

/**
 * Runs `task` once the opening reveal has resolved, so heavy start-up work never
 * competes with it for the main thread. If the reveal was never armed - reduced
 * motion, or any page that does not run it - the task starts immediately. While
 * the reveal is holding for interaction, deferred work remains deferred too.
 */
export function whenIntroSettles(task: () => void): () => void {
  if (typeof window === "undefined") {
    task();
    return () => undefined;
  }

  if (!document.documentElement.classList.contains("qf-intro-active")) {
    task();
    return () => undefined;
  }

  let released = false;
  const cleanup = () => {
    window.removeEventListener(INTRO_DONE_EVENT, release);
  };

  function release() {
    if (released) return;
    released = true;
    cleanup();
    task();
  }

  window.addEventListener(INTRO_DONE_EVENT, release, { once: true });

  return cleanup;
}

export function announceIntroSettled() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}
