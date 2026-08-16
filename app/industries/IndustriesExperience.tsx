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
const CAROUSEL_INTERVAL_MS = 4500;
const GESTURE_IDLE_MS = 260;
const RELEASE_ANIMATION_MS = 950;

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
  const visualIndexRef = useRef(0);
  const exitArmedRef = useRef(false);
  const releasingRef = useRef(false);
  const gestureIdleTimerRef = useRef(0);
  const releaseTimerRef = useRef(0);
  const transitionTimerRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchCanExitRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mountedModelIds, setMountedModelIds] = useState<ReadonlySet<IndustryModelId>>(
    () => new Set(["quantum-computer"]),
  );
  const [isImmersive, setIsImmersive] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [isModelInteracting, setIsModelInteracting] = useState(false);
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
    setIsModelInteracting(true);
  }, []);

  const endModelInteraction = useCallback(() => {
    modelInteractingRef.current = false;
    setIsModelInteracting(false);
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
    const x = Math.round(-visualIndexRef.current * metrics.viewportWidth * 2) / 2;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
    story.style.setProperty("--qf-industry-active-index", String(visualIndexRef.current));
  }, [measureStory]);

  const selectChapter = useCallback((index: number, forward = false) => {
    const nextIndex = Math.min(LAST_CHAPTER_INDEX, Math.max(0, index));
    const wrapsForward = forward && activeIndexRef.current === LAST_CHAPTER_INDEX && nextIndex === 0;
    const track = trackRef.current;
    window.clearTimeout(transitionTimerRef.current);
    track?.classList.remove("is-resetting");
    visualIndexRef.current = wrapsForward ? industryChapters.length : nextIndex;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    transitionTimerRef.current = window.setTimeout(() => {
      if (wrapsForward && trackRef.current) {
        trackRef.current.classList.add("is-resetting");
        visualIndexRef.current = 0;
        updateTrackPosition();
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => trackRef.current?.classList.remove("is-resetting"));
        });
      }
    }, 1050);
  }, [updateTrackPosition]);

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
    if (!isImmersive || isAutoplayPaused || isModelInteracting) return;
    const timer = window.setInterval(() => {
      if (modelInteractingRef.current) return;
      selectChapter((activeIndexRef.current + 1) % industryChapters.length, true);
    }, CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isAutoplayPaused, isImmersive, isModelInteracting, selectChapter]);

  useEffect(() => {
    if (!isModelInteracting) return;
    const releaseInteraction = () => endModelInteraction();
    window.addEventListener("pointerup", releaseInteraction);
    window.addEventListener("pointercancel", releaseInteraction);
    window.addEventListener("blur", releaseInteraction);
    return () => {
      window.removeEventListener("pointerup", releaseInteraction);
      window.removeEventListener("pointercancel", releaseInteraction);
      window.removeEventListener("blur", releaseInteraction);
    };
  }, [endModelInteraction, isModelInteracting]);

  useEffect(() => {
    const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const armAfterGesture = () => {
      window.clearTimeout(gestureIdleTimerRef.current);
      gestureIdleTimerRef.current = window.setTimeout(() => {
        exitArmedRef.current = true;
      }, GESTURE_IDLE_MS);
    };
    const setImmersiveMode = (active: boolean) => {
      immersiveRef.current = active;
      setIsImmersive(active);
      document.documentElement.classList.toggle("qf-industries-immersive", active);
    };
    const enterCarousel = () => {
      if (immersiveRef.current || releasingRef.current) return;
      const metrics = measureStory();
      if (!metrics) return;
      exitArmedRef.current = false;
      setImmersiveMode(true);
      window.scrollTo({ top: metrics.storyTop, behavior: reducedMotion() ? "auto" : "smooth" });
      armAfterGesture();
    };
    const releaseCarousel = (direction: 1 | -1) => {
      const metrics = metricsRef.current ?? measureStory();
      if (!metrics || releasingRef.current) return;
      releasingRef.current = true;
      exitArmedRef.current = false;
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
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 2) return;
      if (releasingRef.current) {
        event.preventDefault();
        return;
      }
      const direction: 1 | -1 = event.deltaY > 0 ? 1 : -1;
      if (immersiveRef.current) {
        event.preventDefault();
        window.clearTimeout(gestureIdleTimerRef.current);
        if (exitArmedRef.current) releaseCarousel(direction);
        else armAfterGesture();
        return;
      }
      if (shouldEnter(direction)) {
        event.preventDefault();
        enterCarousel();
      }
    };
    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? 0;
      touchCanExitRef.current = immersiveRef.current && exitArmedRef.current;
      if (immersiveRef.current) window.clearTimeout(gestureIdleTimerRef.current);
    };
    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
      const delta = touchStartYRef.current - currentY;
      if (Math.abs(delta) < 10) return;
      if (releasingRef.current) {
        event.preventDefault();
        return;
      }
      const direction: 1 | -1 = delta > 0 ? 1 : -1;
      if (immersiveRef.current) {
        event.preventDefault();
        if (touchCanExitRef.current) releaseCarousel(direction);
        return;
      }
      if (shouldEnter(direction)) {
        event.preventDefault();
        enterCarousel();
      }
    };
    const onTouchEnd = () => {
      if (immersiveRef.current) armAfterGesture();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("button, a, input, textarea, select")) return;
      const downKeys = ["ArrowDown", "PageDown", " ", "End"];
      const upKeys = ["ArrowUp", "PageUp", "Home"];
      const direction: 1 | -1 | null = downKeys.includes(event.key)
        ? 1
        : upKeys.includes(event.key) ? -1 : null;
      if (!direction) return;
      if (releasingRef.current) {
        event.preventDefault();
        return;
      }
      if (immersiveRef.current) {
        event.preventDefault();
        releaseCarousel(direction);
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
      window.clearTimeout(gestureIdleTimerRef.current);
      window.clearTimeout(releaseTimerRef.current);
      window.clearTimeout(transitionTimerRef.current);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [measureStory]);

  const goToChapter = (index: number) => {
    selectChapter(index, activeIndexRef.current === LAST_CHAPTER_INDEX && index === 0);
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
            <article
              className="qf-industry-chapter qf-industry-chapter-clone"
              style={{ "--qf-industry-accent": industryChapters[0].accent } as CSSProperties}
              aria-hidden="true"
            >
              <div className="qf-industry-stage" />
              <div className="qf-industry-copy">
                <div className="qf-industry-copy-meta">
                  <span>{industryChapters[0].code}</span>
                  <span>{industryChapters[0].short}</span>
                </div>
                <h3>{industryChapters[0].title}</h3>
                <p>{industryChapters[0].text}</p>
              </div>
            </article>
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
              <button
                type="button"
                className={`qf-industry-autoplay${isAutoplayPaused ? " is-paused" : ""}`}
                aria-label={isAutoplayPaused ? "Resume automatic industry slides" : "Pause automatic industry slides"}
                aria-pressed={isAutoplayPaused}
                onClick={() => setIsAutoplayPaused((paused) => !paused)}
              >
                <span className="qf-industry-autoplay-icon" aria-hidden="true" />
                <span>{isAutoplayPaused ? "RESUME" : "PAUSE"}</span>
              </button>
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
