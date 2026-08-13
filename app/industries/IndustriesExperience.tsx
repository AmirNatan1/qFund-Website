"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import IndustryModelStage, { IndustrySharedCanvas, scheduleIndustryAssetPreload } from "./IndustryModelStage";
import {
  industryChapters,
  pendingIndustryModelCount,
  suppliedIndustryModelCount,
  type IndustryModelId,
} from "./industryConfig";

const LAST_CHAPTER_INDEX = industryChapters.length - 1;
const PORTAL_PROGRESS = 1 / 16;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
};

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
  const metricsRef = useRef<StoryMetrics | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mountedModelIds, setMountedModelIds] = useState<ReadonlySet<IndustryModelId>>(
    () => new Set(["quantum-computer"]),
  );
  const [isImmersive, setIsImmersive] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const markModelRenderReady = useCallback((modelId: IndustryModelId) => {
    setMountedModelIds((current) => {
      if (current.has(modelId)) return current;
      const next = new Set(current);
      next.add(modelId);
      return next;
    });
  }, []);

  useEffect(() => {
    let scrollEndTimer = 0;
    let scrolling = false;
    const onScroll = () => {
      if (!scrolling) {
        scrolling = true;
        setIsScrolling(true);
      }
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => {
        scrolling = false;
        setIsScrolling(false);
      }, 140);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(scrollEndTimer);
      window.removeEventListener("scroll", onScroll);
    };
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

  const updatePosition = useCallback(() => {
    const story = storyRef.current;
    const track = trackRef.current;
    if (!story || !track) return;

    const metrics = metricsRef.current ?? measureStory();
    if (!metrics) return;
    const scrollY = window.scrollY;
    const rawProgress = clamp01((scrollY - metrics.storyTop) / metrics.travel);
    const progress = clamp01((rawProgress - PORTAL_PROGRESS) / (1 - PORTAL_PROGRESS * 2));
    const chapterPosition = progress * LAST_CHAPTER_INDEX;
    const x = Math.round(-chapterPosition * metrics.viewportWidth * 2) / 2;
    const nextIndex = Math.min(LAST_CHAPTER_INDEX, Math.max(0, Math.round(chapterPosition)));
    const activeChapterX = Math.round((nextIndex - chapterPosition) * metrics.viewportWidth * 2) / 2;
    const entered = smoothstep(rawProgress / PORTAL_PROGRESS);
    const exited = smoothstep((rawProgress - (1 - PORTAL_PROGRESS)) / PORTAL_PROGRESS);
    const portalPresence = Math.min(entered, 1 - exited);
    const portalScale = 0.94 + portalPresence * 0.06;
    const portalOpacity = 0.78 + portalPresence * 0.22;
    const portalRadius = (1 - portalPresence) * 32;
    const portalY = ((1 - entered) - exited) * metrics.viewportHeight * 0.022;
    const immersive = scrollY >= metrics.storyTop && scrollY < metrics.storyTop + metrics.storyHeight;

    track.style.transform = `translate3d(${x}px, 0, 0)`;
    story.style.setProperty("--qf-industry-progress", String(progress));
    // Keep the single high-performance WebGL surface physically attached to
    // the active slide so the model and copy travel as one complete page.
    story.style.setProperty("--qf-industry-active-shift", `${activeChapterX}px`);
    story.style.setProperty("--qf-industry-portal-scale", portalScale.toFixed(4));
    story.style.setProperty("--qf-industry-portal-opacity", portalOpacity.toFixed(4));
    story.style.setProperty("--qf-industry-portal-radius", `${portalRadius.toFixed(2)}px`);
    story.style.setProperty("--qf-industry-portal-y", `${portalY.toFixed(2)}px`);
    if (immersiveRef.current !== immersive) {
      immersiveRef.current = immersive;
      setIsImmersive(immersive);
      document.documentElement.classList.toggle("qf-industries-immersive", immersive);
    }
    if (activeIndexRef.current !== nextIndex) {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
  }, [measureStory]);

  useEffect(() => {
    let frame = 0;
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        updatePosition();
        frame = 0;
      });
    };

    const onScroll = () => requestUpdate();

    const refreshMetrics = () => {
      measureStory();
      requestUpdate();
    };

    const observer = new ResizeObserver(refreshMetrics);
    if (storyRef.current) observer.observe(storyRef.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refreshMetrics, { passive: true });
    window.addEventListener("load", refreshMetrics, { once: true });
    measureStory();
    updatePosition();
    const cancelPreload = scheduleIndustryAssetPreload(markModelRenderReady);

    return () => {
      cancelPreload();
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refreshMetrics);
      window.removeEventListener("load", refreshMetrics);
      document.documentElement.classList.remove("qf-industries-immersive");
    };
  }, [markModelRenderReady, measureStory, updatePosition]);

  const goToChapter = (index: number) => {
    const story = storyRef.current;
    if (!story) return;
    const metrics = metricsRef.current ?? measureStory();
    if (!metrics) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const journeyProgress = PORTAL_PROGRESS
      + (index / LAST_CHAPTER_INDEX) * (1 - PORTAL_PROGRESS * 2);
    window.scrollTo({
      top: metrics.storyTop + journeyProgress * metrics.travel,
      behavior: reduced ? "auto" : "smooth",
    });
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
        className="qf-industry-story"
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
          </div>

          <IndustrySharedCanvas
            chapter={industryChapters[activeIndex]}
            readyModelIds={mountedModelIds}
            paused={!isImmersive}
            moving={isScrolling}
          />

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
            <p className="qf-industry-counter" aria-hidden="true">
              <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
              <span>/ {String(industryChapters.length).padStart(2, "0")}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
