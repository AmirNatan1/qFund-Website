"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import FrontierField from "./FrontierField";
import { announceIntroSettled } from "./introState";

/**
 * Opening reveal.
 *
 * A pixel-identical clone of the hero's frontier field is pinned over the page at
 * viewport-covering scale, held long enough to read as the qFund mark, then flown
 * down onto the exact rectangle the real field occupies in the hero. The clone and
 * the real field share one deterministic renderer, so the hand-off at the end is a
 * straight swap rather than a visible transition.
 */

const TIMING = {
  /** Field fades up from the paper backdrop. */
  fadeIn: 400,
  /** Opening overshoot settles into the covering scale. */
  settle: 340,
  /** Full-bleed hold ends and the shrink begins. */
  shrinkAt: 1000,
  /** Shrink lands on the hero square. */
  landAt: 1880,
  /** Page chrome starts entering. */
  outroAt: 1460,
  /** Backdrop clears to reveal the hero, just before the field settles. */
  backdropAt: 1480,
  backdropDuration: 360,
  /** Clone hands over to the real field. */
  swapDuration: 150,
  /** Abort duration when the visitor scrolls, clicks or types. */
  skipDuration: 240,
} as const;

const SHRINK_EASE = "cubic-bezier(0.7, 0, 0.16, 1)";
const SETTLE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function IntroReveal({ targetRef }: { targetRef: RefObject<HTMLDivElement | null> }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(true);
  const [densityBoost, setDensityBoost] = useState(1);

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    const stage = stageRef.current;
    const backdrop = backdropRef.current;
    // React attaches refs in tree order, so fall back to a query in case this
    // effect ever runs before the hero field below it has been wired up.
    const target =
      targetRef.current ?? document.querySelector<HTMLDivElement>(".qf-hero-visual > .qf-frontier-field");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearClasses = () => {
      root.classList.remove("qf-intro-active", "qf-intro-outro", "qf-intro-landed");
      announceIntroSettled();
    };

    if (reduced || !stage || !backdrop || !target || typeof stage.animate !== "function") {
      clearClasses();
      setMounted(false);
      return;
    }

    // Tell the bootstrap failsafe that the real sequence has taken over.
    (window as typeof window & { __qfIntro?: boolean }).__qfIntro = true;
    root.classList.add("qf-intro-active");

    const previousRestoration = history.scrollRestoration;
    try {
      history.scrollRestoration = "manual";
    } catch {
      /* unsupported — the scroll reset below still applies */
    }

    function toTop() {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      } catch {
        window.scrollTo(0, 0);
      }
    }
    toTop();

    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
    const rect = target.getBoundingClientRect();

    if (rect.width < 1 || rect.height < 1) {
      clearClasses();
      setMounted(false);
      return;
    }

    // Pin the clone onto the exact rectangle the hero field occupies.
    stage.style.left = `${rect.left}px`;
    stage.style.top = `${rect.top}px`;
    stage.style.width = `${rect.width}px`;
    stage.style.height = `${rect.height}px`;

    // Uniform scale that covers the viewport, so the mark never distorts.
    const cover = Math.max(viewportWidth / rect.width, viewportHeight / rect.height) * 1.02;
    const offsetX = viewportWidth / 2 - (rect.left + rect.width / 2);
    const offsetY = viewportHeight / 2 - (rect.top + rect.height / 2);
    const at = (scale: number) =>
      `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px) scale(${scale.toFixed(4)})`;

    // On narrow layouts the hero square sits below the fold, so there is nothing to
    // fly into. Those visitors get the same full-bleed opening, resolved as a shrink
    // toward the centre while the hero copy rises in.
    const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
    const landsOnScreen = visibleHeight / rect.height > 0.55;
    const land = landsOnScreen ? "translate(0px, 0px) scale(1)" : at(cover * 0.32);

    setDensityBoost(Math.min(cover, 2.6));

    const timers: number[] = [];
    /** Opacity animations, cancelled on an early exit; the flight is left to finish. */
    const fades: Animation[] = [];
    const animations: Animation[] = [];
    let settled = false;

    function clearTimers() {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    }

    function teardown() {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", toTop);
      clearTimers();
      try {
        history.scrollRestoration = previousRestoration;
      } catch {
        /* ignore */
      }
      clearClasses();
      setMounted(false);
    }

    function skip() {
      if (settled || !stage || !backdrop) return;
      settled = true;
      const stageOpacity = Number(getComputedStyle(stage).opacity) || 0;
      const backdropOpacity = Number(getComputedStyle(backdrop).opacity) || 0;
      // Only the fades are replaced. Cancelling the flight would snap the clone
      // to its landing rectangle in a single frame; letting it run means the
      // visitor sees it continue on its way out.
      fades.forEach((animation) => animation.cancel());
      clearTimers();
      root.classList.add("qf-intro-outro", "qf-intro-landed");
      const options = { duration: TIMING.skipDuration, easing: "ease-out", fill: "forwards" as const };
      animations.push(
        stage.animate([{ opacity: stageOpacity }, { opacity: 0 }], options),
        backdrop.animate([{ opacity: backdropOpacity }, { opacity: 0 }], options),
      );
      timers.push(window.setTimeout(teardown, TIMING.skipDuration + 20));
    }

    function onResize() {
      // A genuine layout change moves the hero square out from under the clone.
      // Mobile URL-bar height changes are ignored.
      const width = document.documentElement.clientWidth || window.innerWidth;
      if (Math.abs(width - viewportWidth) > 4) skip();
    }

    const flight = stage.animate(
      [
        { offset: 0, transform: at(cover * 1.05), easing: SETTLE_EASE },
        { offset: TIMING.settle / TIMING.landAt, transform: at(cover), easing: "cubic-bezier(0.4, 0, 0.6, 1)" },
        { offset: TIMING.shrinkAt / TIMING.landAt, transform: at(cover * 0.985), easing: SHRINK_EASE },
        { offset: 1, transform: land },
      ],
      { duration: TIMING.landAt, fill: "both" },
    );
    animations.push(flight);

    fades.push(
      stage.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: TIMING.fadeIn,
        easing: "ease-out",
        fill: "both",
      }),
      backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
        delay: TIMING.backdropAt,
        duration: TIMING.backdropDuration,
        easing: "ease-in-out",
        fill: "forwards",
      }),
    );

    if (!landsOnScreen) {
      fades.push(
        stage.animate([{ opacity: 1 }, { opacity: 0 }], {
          delay: TIMING.backdropAt,
          duration: TIMING.backdropDuration,
          easing: "linear",
          fill: "forwards",
        }),
      );
    }

    animations.push(...fades);

    let handedOver = false;

    function handOver() {
      if (settled || handedOver) return;
      handedOver = true;
      // The hand-over is driven by the flight itself, never by a timer: a timer
      // can fire while the animation still has a frame or two to run, which
      // would show the clone and the real field a few pixels apart.
      root.classList.add("qf-intro-landed");
      if (landsOnScreen && stage) {
        animations.push(
          stage.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: TIMING.swapDuration,
            easing: "linear",
            fill: "forwards",
          }),
        );
      }
      timers.push(
        window.setTimeout(() => {
          if (settled) return;
          settled = true;
          teardown();
        }, TIMING.swapDuration + 80),
      );
    }

    flight.finished.then(handOver, () => undefined);

    timers.push(window.setTimeout(() => root.classList.add("qf-intro-outro"), TIMING.outroAt));

    // Backstop, so the page is never left sitting behind the veil if the flight
    // never reports finished — a tab backgrounded mid-animation will hold it.
    // It waits for the flight to actually reach its landing rather than handing
    // over on the clock, which on a slow first paint would arrive too early.
    const deadline = TIMING.landAt + 12000;
    let waited = TIMING.landAt + 700;
    function backstop() {
      if (settled || handedOver) return;
      if (Number(flight.currentTime ?? 0) < TIMING.landAt - 20 && waited < deadline) {
        waited += 400;
        timers.push(window.setTimeout(backstop, 400));
        return;
      }
      handOver();
    }
    timers.push(window.setTimeout(backstop, waited));

    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", toTop);

    return () => {
      settled = true;
      animations.forEach((animation) => animation.cancel());
      teardown();
    };
    // One opening per page view: this runs once per mount.
  }, [targetRef]);

  if (!mounted) return null;

  return (
    <div className="qf-intro" aria-hidden="true">
      <div className="qf-intro-backdrop" ref={backdropRef} />
      <div className="qf-intro-stage" ref={stageRef}>
        <FrontierField interactive={false} densityBoost={densityBoost} />
      </div>
    </div>
  );
}
