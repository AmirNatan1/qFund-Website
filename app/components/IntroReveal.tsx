"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import FrontierField from "./FrontierField";
import { announceIntroSettled } from "./introState";

/**
 * Full-bleed opening field. It holds indefinitely after fading in and only
 * travels to the hero when the visitor scrolls, taps, clicks, or uses a key.
 */
const TIMING = {
  fadeIn: 420,
  descent: 980,
  backdropOffset: 360,
  backdropDuration: 420,
  swapDuration: 160,
} as const;

const MARK_EMPHASIS = 1.2;
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
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
    const target =
      targetRef.current ?? document.querySelector<HTMLDivElement>(".qf-hero-visual > .qf-frontier-field");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearIntroState = () => {
      root.classList.remove("qf-intro-active", "qf-intro-outro", "qf-intro-landed");
      announceIntroSettled();
    };

    if (reduced || !stage || !backdrop || !target) {
      clearIntroState();
      setMounted(false);
      return;
    }

    const introStage = stage;
    const introBackdrop = backdrop;

    (window as typeof window & { __qfIntro?: boolean }).__qfIntro = true;
    root.classList.add("qf-intro-active");

    const previousRestoration = history.scrollRestoration;
    try {
      history.scrollRestoration = "manual";
    } catch {
      /* Unsupported browsers still receive the explicit scroll reset below. */
    }

    const keepAtTop = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      } catch {
        window.scrollTo(0, 0);
      }
    };
    keepAtTop();

    let viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    let viewportHeight = document.documentElement.clientHeight || window.innerHeight;
    let targetBox = target.getBoundingClientRect();
    let frame = 0;
    let departingAt = -1;
    let settled = false;
    const mountedAt = performance.now();

    const applyBox = (progress: number) => {
      introStage.style.left = `${lerp(0, targetBox.left, progress)}px`;
      introStage.style.top = `${lerp(0, targetBox.top, progress)}px`;
      introStage.style.width = `${lerp(viewportWidth, targetBox.width, progress)}px`;
      introStage.style.height = `${lerp(viewportHeight, targetBox.height, progress)}px`;
      introStage.style.setProperty("--qf-intro-p", progress.toFixed(4));
    };

    const applyDetail = (progress: number) => {
      const enlargement = Math.min(3, Math.max(1, viewportHeight / Math.max(1, targetBox.height)));
      introStage.style.setProperty(
        "--qf-intro-mark",
        lerp(Math.min(3, enlargement * MARK_EMPHASIS), 1, progress).toFixed(4),
      );
      introStage.style.setProperty("--qf-intro-grid", lerp(enlargement, 1, progress).toFixed(4));
    };

    const prepare = () => {
      targetBox = target.getBoundingClientRect();
      if (targetBox.width < 1 || targetBox.height < 1) return false;
      applyBox(0);
      applyDetail(0);
      setBuffer({ width: Math.ceil(viewportWidth), height: Math.ceil(viewportHeight) });
      return true;
    };

    if (!prepare()) {
      clearIntroState();
      setMounted(false);
      return;
    }

    const removeListeners = () => {
      window.removeEventListener("wheel", beginDeparture);
      window.removeEventListener("touchmove", beginDeparture);
      window.removeEventListener("keydown", beginDeparture);
      window.removeEventListener("pointerdown", beginDeparture);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", keepAtTop);
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      window.cancelAnimationFrame(frame);
      removeListeners();
      try {
        history.scrollRestoration = previousRestoration;
      } catch {
        /* Ignore restoration failures. */
      }
      clearIntroState();
      setMounted(false);
    };

    const handOver = () => {
      if (settled) return;
      root.classList.add("qf-intro-landed");
      const swap = introStage.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: TIMING.swapDuration,
        easing: "linear",
        fill: "forwards",
      });
      void swap.finished.then(finish, finish);
    };

    function tick(now: number) {
      frame = 0;
      if (settled) return;

      if (departingAt < 0) {
        const fade = Math.min(1, (now - mountedAt) / TIMING.fadeIn);
        introStage.style.opacity = easeOutCubic(fade).toFixed(3);
        if (fade < 1) frame = window.requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - departingAt;
      const rawProgress = Math.min(1, elapsed / TIMING.descent);
      const progress = easeInOutCubic(rawProgress);
      applyBox(progress);
      applyDetail(progress);

      if (elapsed >= TIMING.backdropOffset) {
        const fade = Math.min(1, (elapsed - TIMING.backdropOffset) / TIMING.backdropDuration);
        introBackdrop.style.opacity = String(1 - easeOutCubic(fade));
      }

      if (rawProgress >= 1) {
        applyBox(1);
        applyDetail(1);
        window.requestAnimationFrame(() => window.requestAnimationFrame(handOver));
        return;
      }

      frame = window.requestAnimationFrame(tick);
    }

    function beginDeparture(event: Event) {
      if (settled || departingAt >= 0) return;
      if (event.cancelable) event.preventDefault();
      keepAtTop();
      departingAt = performance.now();
      root.classList.add("qf-intro-outro");
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(tick);
    }

    function onResize() {
      if (departingAt >= 0) return;
      viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      prepare();
    }

    frame = window.requestAnimationFrame(tick);
    window.addEventListener("wheel", beginDeparture, { passive: false });
    window.addEventListener("touchmove", beginDeparture, { passive: false });
    window.addEventListener("keydown", beginDeparture);
    window.addEventListener("pointerdown", beginDeparture);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("load", keepAtTop, { once: true });

    return () => {
      settled = true;
      window.cancelAnimationFrame(frame);
      removeListeners();
      try {
        history.scrollRestoration = previousRestoration;
      } catch {
        /* Ignore restoration failures. */
      }
      clearIntroState();
    };
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
