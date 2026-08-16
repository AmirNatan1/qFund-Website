"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import FrontierField from "./FrontierField";
import { announceIntroSettled } from "./introState";

/**
 * Opening reveal.
 *
 * A second frontier field is pinned over the page at the viewport's own
 * dimensions — composed for the screen it is on, drawn at device resolution,
 * never a magnified crop of the small one. It holds long enough to read as the
 * qFund mark, then its box is animated down onto the exact rectangle the real
 * field occupies in the hero. The composition reflows as the box changes shape,
 * so the square it lands in is a shape the field grew into rather than a frame
 * cropped around it, and the last frame is drawn at precisely the hero's size.
 */

const TIMING = {
  /** Field fades up from the paper backdrop. */
  fadeIn: 420,
  /** Full-bleed hold ends and the descent begins. */
  departAt: 1000,
  /** Descent duration. */
  descent: 900,
  /** Page chrome starts entering, measured from the start of the descent. */
  outroOffset: 460,
  /** Backdrop clears, measured from the start of the descent. */
  backdropOffset: 480,
  backdropDuration: 380,
  /** Clone hands over to the real field. */
  swapDuration: 150,
  /** Abort duration when the visitor scrolls, clicks or types. */
  skipDuration: 260,
} as const;

/** Slight extra emphasis on the mark while the field is the size of the screen. */
const MARK_EMPHASIS = 1.2;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Slow away, quick through the middle, soft into place. */
function easeDescent(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

export default function IntroReveal({ targetRef }: { targetRef: RefObject<HTMLDivElement | null> }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(true);
  const [buffer, setBuffer] = useState({ width: 0, height: 0 });

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

    if (reduced || !stage || !backdrop || !target) {
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

    // Open at the viewport's own dimensions and end on the hero's rectangle.
    const from = { left: 0, top: 0, width: viewportWidth, height: viewportHeight };
    const to = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };

    const applyBox = (progress: number) => {
      stage.style.left = `${lerp(from.left, to.left, progress)}px`;
      stage.style.top = `${lerp(from.top, to.top, progress)}px`;
      stage.style.width = `${lerp(from.width, to.width, progress)}px`;
      stage.style.height = `${lerp(from.height, to.height, progress)}px`;
      stage.style.setProperty("--qf-intro-p", progress.toFixed(4));
    };

    // The mark and the field's grid are sized for the small square, so at screen
    // size they would read as specks. Both are opened up by how much taller the
    // field has become — a proportional enlargement of the resting composition
    // rather than an arbitrary one — and resolve to their resting values exactly
    // as it lands. The mark carries a little extra emphasis while it is the
    // largest thing on the page.
    const enlargement = Math.min(3, Math.max(1, viewportHeight / rect.height));
    const markScale = Math.min(3, enlargement * MARK_EMPHASIS);
    const gridScale = enlargement;

    const applyDetail = (progress: number) => {
      stage.style.setProperty("--qf-intro-mark", lerp(markScale, 1, progress).toFixed(4));
      stage.style.setProperty("--qf-intro-grid", lerp(gridScale, 1, progress).toFixed(4));
    };

    applyBox(0);
    applyDetail(0);
    setBuffer({ width: Math.ceil(viewportWidth), height: Math.ceil(viewportHeight) });

    // Where the hero square sits below the fold, the descent would finish out of
    // sight. Those visitors get the same opening, cleared while it is still on
    // screen rather than trailing off the bottom edge.
    const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
    const landsInView = visibleHeight / rect.height > 0.55;

    const timers: number[] = [];
    let settled = false;
    let handedOver = false;
    let frame = 0;
    let skipFrom = -1;
    let startedAt = 0;

    function clearTimers() {
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
    }

    function teardown() {
      window.cancelAnimationFrame(frame);
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

    function handOver() {
      if (settled || handedOver || !stage) return;
      handedOver = true;
      // Two frames of grace: the field's own loop redraws the composition at the
      // final box before the real one is uncovered beneath it.
      root.classList.add("qf-intro-landed");
      stage.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: TIMING.swapDuration,
        easing: "linear",
        fill: "forwards",
      });
      timers.push(
        window.setTimeout(() => {
          if (settled) return;
          settled = true;
          teardown();
        }, TIMING.swapDuration + 90),
      );
    }

    function skip() {
      if (settled || handedOver || skipFrom >= 0) return;
      // Fold the remaining descent into a quick exit rather than cutting it.
      skipFrom = performance.now();
      clearTimers();
      root.classList.add("qf-intro-outro", "qf-intro-landed");
      timers.push(window.setTimeout(() => {
        if (settled) return;
        settled = true;
        teardown();
      }, TIMING.skipDuration + 40));
    }

    function onResize() {
      // A genuine layout change moves the hero square out from under the clone.
      // Mobile URL-bar height changes are ignored.
      const width = document.documentElement.clientWidth || window.innerWidth;
      if (Math.abs(width - viewportWidth) > 4) skip();
    }

    const fadeOutStartsAt = landsInView
      ? TIMING.departAt + TIMING.descent
      : TIMING.departAt + TIMING.backdropOffset;

    function tick(now: number) {
      frame = 0;
      if (settled || !stage || !backdrop) return;
      if (!startedAt) startedAt = now;
      const elapsed = now - startedAt;

      if (skipFrom >= 0) {
        const out = Math.min(1, (now - skipFrom) / TIMING.skipDuration);
        stage.style.opacity = String(1 - easeOut(out));
        backdrop.style.opacity = String(1 - easeOut(out));
        if (out >= 1) return;
        frame = window.requestAnimationFrame(tick);
        return;
      }

      if (elapsed < TIMING.fadeIn) {
        stage.style.opacity = easeOut(elapsed / TIMING.fadeIn).toFixed(3);
      } else {
        stage.style.opacity = "1";
      }

      const descent = Math.min(1, Math.max(0, (elapsed - TIMING.departAt) / TIMING.descent));
      const progress = easeDescent(descent);
      applyBox(progress);
      applyDetail(progress);

      const backdropStart = TIMING.departAt + TIMING.backdropOffset;
      if (elapsed >= backdropStart) {
        const fade = Math.min(1, (elapsed - backdropStart) / TIMING.backdropDuration);
        backdrop.style.opacity = String(1 - fade);
      }

      if (!landsInView && elapsed >= fadeOutStartsAt) {
        const fade = Math.min(1, (elapsed - fadeOutStartsAt) / TIMING.backdropDuration);
        stage.style.opacity = String(1 - fade);
      }

      if (descent >= 1) {
        // Exactly on the hero's rectangle, then two frames for the field to draw
        // the composition at that size before the hand-over.
        applyBox(1);
        applyDetail(1);
        window.requestAnimationFrame(() => window.requestAnimationFrame(handOver));
        return;
      }

      frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);

    timers.push(
      window.setTimeout(() => root.classList.add("qf-intro-outro"), TIMING.departAt + TIMING.outroOffset),
    );
    // Backstop, so the page is never left sitting behind the veil if frames stop
    // arriving — a tab backgrounded mid-animation will hold the loop.
    timers.push(window.setTimeout(handOver, TIMING.departAt + TIMING.descent + 3000));

    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", toTop);

    return () => {
      settled = true;
      teardown();
    };
    // One opening per page view: this runs once per mount.
  }, [targetRef]);

  if (!mounted) return null;

  return (
    <div className="qf-intro" aria-hidden="true">
      <div className="qf-intro-backdrop" ref={backdropRef} />
      <div className="qf-intro-stage" ref={stageRef}>
        <FrontierField interactive={false} fluidWidth={buffer.width} fluidHeight={buffer.height} />
      </div>
    </div>
  );
}
