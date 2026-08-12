"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import IndustryModelStage, { scheduleIndustryAssetPreload } from "./IndustryModelStage";
import { industryChapters, pendingIndustryModelCount, suppliedIndustryModelCount } from "./industryConfig";

const LAST_CHAPTER_INDEX = industryChapters.length - 1;
const EMPTY_RENDER_WINDOW = { start: -1, end: -1 };

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
  const renderWindowRef = useRef(EMPTY_RENDER_WINDOW);
  const [activeIndex, setActiveIndex] = useState(0);
  const [renderWindow, setRenderWindow] = useState(EMPTY_RENDER_WINDOW);
  const [isImmersive, setIsImmersive] = useState(false);

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
    const progress = Math.min(1, Math.max(0, (scrollY - metrics.storyTop) / metrics.travel));
    const x = Math.round(-progress * LAST_CHAPTER_INDEX * metrics.viewportWidth * 2) / 2;
    const nextIndex = Math.min(LAST_CHAPTER_INDEX, Math.max(0, Math.round(progress * LAST_CHAPTER_INDEX)));
    const viewportTop = metrics.storyTop - scrollY;
    const viewportBottom = viewportTop + metrics.storyHeight;
    const storyIsNearViewport = viewportBottom > -metrics.viewportHeight * 0.25
      && viewportTop < metrics.viewportHeight * 3.25;
    const immersive = scrollY >= metrics.storyTop && scrollY <= metrics.storyTop + metrics.travel;
    const nextRenderWindow = storyIsNearViewport
      ? {
          start: Math.max(0, nextIndex - 1),
          end: Math.min(LAST_CHAPTER_INDEX, nextIndex + 1),
        }
      : { start: -1, end: -1 };

    track.style.transform = `translate3d(${x}px, 0, 0)`;
    story.style.setProperty("--qf-industry-progress", String(progress));
    if (immersiveRef.current !== immersive) {
      immersiveRef.current = immersive;
      setIsImmersive(immersive);
      document.documentElement.classList.toggle("qf-industries-immersive", immersive);
    }
    if (activeIndexRef.current !== nextIndex) {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
    if (
      renderWindowRef.current.start !== nextRenderWindow.start
      || renderWindowRef.current.end !== nextRenderWindow.end
    ) {
      renderWindowRef.current = nextRenderWindow;
      setRenderWindow(nextRenderWindow);
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
    const cancelPreload = scheduleIndustryAssetPreload();

    return () => {
      cancelPreload();
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refreshMetrics);
      window.removeEventListener("load", refreshMetrics);
      document.documentElement.classList.remove("qf-industries-immersive");
    };
  }, [measureStory, updatePosition]);

  const goToChapter = (index: number) => {
    const story = storyRef.current;
    if (!story) return;
    const metrics = metricsRef.current ?? measureStory();
    if (!metrics) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: metrics.storyTop + (index / LAST_CHAPTER_INDEX) * metrics.travel,
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
                  shouldRender={index >= renderWindow.start && index <= renderWindow.end}
                  paused={!isImmersive || activeIndex !== index}
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
