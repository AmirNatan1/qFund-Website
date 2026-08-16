"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { whenIntroSettles } from "../components/introState";
import IndustryModelStage, { IndustrySharedCanvas, scheduleIndustryAssetPreload } from "./IndustryModelStage";
import {
  industryChapters,
  pendingIndustryModelCount,
  suppliedIndustryModelCount,
  type IndustryModelId,
} from "./industryConfig";

const LAST_CHAPTER_INDEX = industryChapters.length - 1;
const WHEEL_GESTURE_IDLE_MS = 220;
const RELEASE_ANIMATION_MS = 800;

type StoryMetrics = {
  storyTop: number;
  storyHeight: number;
  travel: number;
  viewportWidth: number;
  viewportHeight: number;
};

export default function IndustriesExperience() {
  const storyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const immersiveRef = useRef(false);
  const modelInteractingRef = useRef(false);
  const metricsRef = useRef<StoryMetrics | null>(null);
  const activeIndexRef = useRef(0);
  const releasingRef = useRef(false);
  const wheelGestureActiveRef = useRef(false);
  const wheelGestureTimerRef = useRef(0);
  const releaseTimerRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchHandledRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mountedModelIds, setMountedModelIds] = useState<ReadonlySet<IndustryModelId>>(
    () => new Set(["quantum-computer"]),
  );
  const [isImmersive, setIsImmersive] = useState(false);
  // The WebGL context is not created while the opening reveal is on screen.
  const [sceneStageReady, setSceneStageReady] = useState(false);

  const markModelRenderReady = useCallback((modelId: IndustryModelId) => {
    setMountedModelIds((current) => {
      if (current.has(modelId)) return current;
      const next = new Set(current);
      next.add(modelId);
      return next;
    });
  }, []);

  const startModelInteraction = useCallback(() => {
    modelInteractingRef.current = true;
  }, []);

  const endModelInteraction = useCallback(() => {
    modelInteractingRef.current = false;
  }, []);

  const measureStory = useCallback(() => {
    const story = storyRef.current;
    if (!story) return null;
    const bounds = story.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const metrics = {
      storyTop: window.scrollY + bounds.top,
      storyHeight: story.offsetHeight,
      travel: Math.max(1, story.offsetHeight - viewportHeight),
      viewportWidth: window.innerWidth,
      viewportHeight,
    };
    metricsRef.current = metrics;
    return metrics;
  }, []);

  const updateTrackPosition = useCallback(() => {
    const story = storyRef.current;
    const track = trackRef.current;
    if (!story || !track) return;

    const metrics = metricsRef.current ?? measureStory();
    if (!metrics) return;
    const x = Math.round(-activeIndexRef.current * metrics.viewportWidth * 2) / 2;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
    story.style.setProperty("--qf-industry-active-index", String(activeIndexRef.current));
  }, [measureStory]);

  const selectChapter = useCallback((index: number) => {
    const nextIndex = Math.min(LAST_CHAPTER_INDEX, Math.max(0, index));
    if (nextIndex === activeIndexRef.current) return;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  }, []);

  useEffect(() => {
    const refreshMetrics = () => {
      measureStory();
      updateTrackPosition();
    };

    const observer = new ResizeObserver(refreshMetrics);
    if (storyRef.current) observer.observe(storyRef.current);
    window.addEventListener("resize", refreshMetrics, { passive: true });
    window.addEventListener("load", refreshMetrics, { once: true });
    measureStory();
    updateTrackPosition();
    // Scene loading is deferred until the opening reveal has resolved: parsing
    // several megabytes of geometry mid-animation is what a first impression
    // cannot afford. The section is far below the fold either way.
    let cancelPreload = () => undefined as void;
    const cancelIntroWait = whenIntroSettles(() => {
      setSceneStageReady(true);
      cancelPreload = scheduleIndustryAssetPreload(markModelRenderReady);
    });

    return () => {
      cancelIntroWait();
      cancelPreload();
      observer.disconnect();
      window.removeEventListener("resize", refreshMetrics);
      window.removeEventListener("load", refreshMetrics);
      document.documentElement.classList.remove("qf-industries-immersive");
    };
  }, [markModelRenderReady, measureStory, updateTrackPosition]);

  useEffect(() => {
    updateTrackPosition();
  }, [activeIndex, updateTrackPosition]);

  useEffect(() => {
    const releaseInteraction = () => endModelInteraction();
    window.addEventListener("pointerup", releaseInteraction);
    window.addEventListener("pointercancel", releaseInteraction);
    window.addEventListener("blur", releaseInteraction);
    return () => {
      window.removeEventListener("pointerup", releaseInteraction);
      window.removeEventListener("pointercancel", releaseInteraction);
      window.removeEventListener("blur", releaseInteraction);
    };
  }, [endModelInteraction]);

  useEffect(() => {
    const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setImmersiveMode = (active: boolean) => {
      immersiveRef.current = active;
      setIsImmersive(active);
      document.documentElement.classList.toggle("qf-industries-immersive", active);
    };
    const holdWheelGesture = () => {
      const firstEvent = !wheelGestureActiveRef.current;
      wheelGestureActiveRef.current = true;
      window.clearTimeout(wheelGestureTimerRef.current);
      wheelGestureTimerRef.current = window.setTimeout(() => {
        wheelGestureActiveRef.current = false;
      }, WHEEL_GESTURE_IDLE_MS);
      return firstEvent;
    };
    const enterCarousel = () => {
      if (immersiveRef.current || releasingRef.current) return;
      const metrics = measureStory();
      if (!metrics) return;
      setImmersiveMode(true);
      window.scrollTo({ top: metrics.storyTop, behavior: reducedMotion() ? "auto" : "smooth" });
    };
    const releaseCarousel = (direction: 1 | -1) => {
      const metrics = metricsRef.current ?? measureStory();
      if (!metrics || releasingRef.current) return;
      releasingRef.current = true;
      setImmersiveMode(false);
      const destination = direction > 0
        ? metrics.storyTop + metrics.storyHeight + 2
        : Math.max(0, metrics.storyTop - metrics.viewportHeight * 0.72);
      window.scrollTo({ top: destination, behavior: reducedMotion() ? "auto" : "smooth" });
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = window.setTimeout(() => {
        releasingRef.current = false;
      }, RELEASE_ANIMATION_MS);
    };
    const shouldEnter = (direction: 1 | -1) => {
      const story = storyRef.current;
      if (!story || releasingRef.current) return false;
      const bounds = story.getBoundingClientRect();
      return direction > 0
        ? bounds.top > 0 && bounds.top <= window.innerHeight * 0.72
        : bounds.top < 0 && bounds.bottom >= window.innerHeight * 0.28;
    };
    const stepCarousel = (direction: 1 | -1) => {
      if (modelInteractingRef.current) return;
      const currentIndex = activeIndexRef.current;
      if (direction > 0) {
        if (currentIndex < LAST_CHAPTER_INDEX) selectChapter(currentIndex + 1);
        else releaseCarousel(1);
      } else if (currentIndex > 0) {
        selectChapter(currentIndex - 1);
      } else {
        releaseCarousel(-1);
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 1) return;
      if (releasingRef.current) {
        event.preventDefault();
        return;
      }
      const direction: 1 | -1 = event.deltaY > 0 ? 1 : -1;
      if (immersiveRef.current) {
        event.preventDefault();
        if (holdWheelGesture()) stepCarousel(direction);
        return;
      }
      if (shouldEnter(direction)) {
        event.preventDefault();
        enterCarousel();
        holdWheelGesture();
      }
    };
    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? 0;
      touchHandledRef.current = false;
    };
    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
      const delta = touchStartYRef.current - currentY;
      if (Math.abs(delta) < 24) return;
      if (releasingRef.current) {
        event.preventDefault();
        return;
      }
      const direction: 1 | -1 = delta > 0 ? 1 : -1;
      if (immersiveRef.current) {
        event.preventDefault();
        if (!touchHandledRef.current) {
          touchHandledRef.current = true;
          stepCarousel(direction);
        }
        return;
      }
      if (shouldEnter(direction)) {
        event.preventDefault();
        touchHandledRef.current = true;
        enterCarousel();
      }
    };
    const onTouchEnd = () => {
      touchHandledRef.current = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("button, a, input, textarea, select")) return;
      const downKeys = ["ArrowDown", "PageDown", " ", "End"];
      const upKeys = ["ArrowUp", "PageUp", "Home"];
      const direction: 1 | -1 | null = downKeys.includes(event.key)
        ? 1
        : upKeys.includes(event.key) ? -1 : null;
      if (!direction) return;
      if (event.repeat) {
        if (immersiveRef.current) event.preventDefault();
        return;
      }
      if (releasingRef.current) {
        event.preventDefault();
        return;
      }
      if (immersiveRef.current) {
        event.preventDefault();
        stepCarousel(direction);
      } else if (shouldEnter(direction)) {
        event.preventDefault();
        enterCarousel();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(wheelGestureTimerRef.current);
      window.clearTimeout(releaseTimerRef.current);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [measureStory, selectChapter]);

  const goToChapter = (index: number) => {
    selectChapter(index);
  };

  return (
    <section className="qf-industries qf-scroll-section" id="industries" data-qf-section aria-labelledby="industries-title">
      <div className="qf-industries-intro">
        <div className="qf-section-label qf-reveal"><span>02</span><p>Industries</p></div>
        <div className="qf-section-heading qf-reveal">
          <p className="qf-kicker">EIGHT DEEP-TECH FRONTIERS</p>
          <h2 id="industries-title">Eight sectors, one continuous view of the <em>deep future.</em></h2>
        </div>
      </div>

      <div
        className={`qf-industry-story${isImmersive ? " is-immersive" : ""}`}
        ref={storyRef}
        style={{ "--qf-industry-count": industryChapters.length } as CSSProperties}
        data-industry-chapters={industryChapters.length}
        data-industry-models-supplied={suppliedIndustryModelCount}
        data-industry-models-pending={pendingIndustryModelCount}
      >
        <div className="qf-industry-sticky">
          <div className="qf-industry-track" ref={trackRef}>
            {industryChapters.map((chapter, index) => (
              <article
                className={`qf-industry-chapter${activeIndex === index ? " is-active" : ""}`}
                id={`industry-${chapter.slug}`}
                data-industry-chapter
                data-model-status={chapter.model ? "supplied" : "pending"}
                data-model-id={chapter.model?.id}
                style={{ "--qf-industry-accent": chapter.accent } as CSSProperties}
                aria-labelledby={`industry-title-${chapter.slug}`}
                key={chapter.slug}
              >
                <IndustryModelStage
                  chapter={chapter}
                  readyModelIds={mountedModelIds}
                />
                <div className="qf-industry-copy">
                  <div className="qf-industry-copy-meta">
                    <span>{chapter.code}</span>
                    <span>{chapter.short}</span>
                  </div>
                  <h3 id={`industry-title-${chapter.slug}`}>{chapter.title}</h3>
                  <p>{chapter.text}</p>
                </div>
              </article>
            ))}
            {sceneStageReady ? (
              <IndustrySharedCanvas
                chapter={industryChapters[activeIndex]}
                readyModelIds={mountedModelIds}
                paused={!isImmersive}
                onInteractionStart={startModelInteraction}
                onInteractionEnd={endModelInteraction}
              />
            ) : null}
          </div>

          <div className="qf-industry-chrome">
            <span className="qf-industry-chrome-label">INDUSTRIES / EXPLORE</span>
            <nav className="qf-industry-chapter-nav" aria-label="Industry chapters">
              {industryChapters.map((chapter, index) => (
                <button
                  type="button"
                  className={activeIndex === index ? "is-active" : ""}
                  aria-label={`Go to ${chapter.title}`}
                  aria-current={activeIndex === index ? "step" : undefined}
                  onClick={() => goToChapter(index)}
                  key={chapter.slug}
                >
                  <i aria-hidden="true" />
                  <span>{chapter.code}</span>
                </button>
              ))}
            </nav>
            <div className="qf-industry-status">
              <p className="qf-industry-counter" aria-hidden="true">
                <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
                <span>/ {String(industryChapters.length).padStart(2, "0")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
