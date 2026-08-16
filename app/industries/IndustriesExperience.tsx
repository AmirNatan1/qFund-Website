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

const CAROUSEL_INTERVAL_MS = 3000;
const LAST_CHAPTER_INDEX = industryChapters.length - 1;

export default function IndustriesExperience() {
  const storyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const modelInteractingRef = useRef(false);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isModelInteracting, setIsModelInteracting] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [mountedModelIds, setMountedModelIds] = useState<ReadonlySet<IndustryModelId>>(
    () => new Set(["quantum-computer"]),
  );
  // The shared WebGL scene waits until the opening reveal has settled, keeping
  // first-load animation work isolated from the heavier 3D assets.
  const [sceneStageReady, setSceneStageReady] = useState(false);

  const markModelRenderReady = useCallback((modelId: IndustryModelId) => {
    setMountedModelIds((current) => {
      if (current.has(modelId)) return current;
      const next = new Set(current);
      next.add(modelId);
      return next;
    });
  }, []);

  const selectChapter = useCallback((index: number) => {
    const nextIndex = Math.min(LAST_CHAPTER_INDEX, Math.max(0, index));
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  }, []);

  const updateTrackPosition = useCallback(() => {
    const story = storyRef.current;
    const track = trackRef.current;
    if (!story || !track) return;
    const x = Math.round(-activeIndexRef.current * window.innerWidth * 2) / 2;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
    story.style.setProperty("--qf-industry-active-index", String(activeIndexRef.current));
  }, []);

  const startModelInteraction = useCallback(() => {
    modelInteractingRef.current = true;
    setIsModelInteracting(true);
  }, []);

  const endModelInteraction = useCallback(() => {
    modelInteractingRef.current = false;
    setIsModelInteracting(false);
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;

    const resizeObserver = new ResizeObserver(updateTrackPosition);
    resizeObserver.observe(story);
    window.addEventListener("resize", updateTrackPosition, { passive: true });
    updateTrackPosition();

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.2 },
    );
    visibilityObserver.observe(story);

    let cancelPreload = () => undefined as void;
    const cancelIntroWait = whenIntroSettles(() => {
      setSceneStageReady(true);
      cancelPreload = scheduleIndustryAssetPreload(markModelRenderReady);
    });

    return () => {
      cancelIntroWait();
      cancelPreload();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("resize", updateTrackPosition);
    };
  }, [markModelRenderReady, updateTrackPosition]);

  useEffect(() => {
    updateTrackPosition();
  }, [activeIndex, updateTrackPosition]);

  useEffect(() => {
    const releaseInteraction = () => endModelInteraction();
    const updatePageVisibility = () => setPageVisible(!document.hidden);
    updatePageVisibility();
    window.addEventListener("pointerup", releaseInteraction);
    window.addEventListener("pointercancel", releaseInteraction);
    window.addEventListener("blur", releaseInteraction);
    document.addEventListener("visibilitychange", updatePageVisibility);
    return () => {
      window.removeEventListener("pointerup", releaseInteraction);
      window.removeEventListener("pointercancel", releaseInteraction);
      window.removeEventListener("blur", releaseInteraction);
      document.removeEventListener("visibilitychange", updatePageVisibility);
    };
  }, [endModelInteraction]);

  useEffect(() => {
    if (!sceneStageReady || !isInView || isModelInteracting || !pageVisible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(() => {
      selectChapter((activeIndexRef.current + 1) % industryChapters.length);
    }, CAROUSEL_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isInView, isModelInteracting, pageVisible, sceneStageReady, selectChapter]);

  return (
    <section className="qf-industries qf-thesis qf-scroll-section" id="thesis" data-qf-section aria-labelledby="thesis-title">
      <div className="qf-industries-intro">
        <div className="qf-section-label qf-reveal"><span>03</span><p>Thesis</p></div>
        <div className="qf-thesis-heading qf-reveal">
          <p className="qf-kicker">EARLY-STAGE DEEP TECH VENTURE CAPITAL</p>
          <h2 id="thesis-title">We back builders of the deep future—<em>before it becomes obvious.</em></h2>
          <p className="qf-thesis-deck">
            From pre-seed to Series A, qFund invests in the foundational technologies that reshape strategic industries. We bring conviction beyond capital, pairing an early-stage mindset with a long view of technical consequence.
          </p>
        </div>
        <div className="qf-thesis-principles qf-reveal" aria-label="qFund investment thesis">
          <article><span>01 · OUR FOCUS</span><strong>Deep Tech</strong></article>
          <article><span>02 · WE BACK</span><strong>Builders of foundational technology</strong></article>
          <article><span>03 · ENTRY STAGE</span><strong>Pre-seed to Series A</strong></article>
          <article><span>04 · WITH</span><strong>Conviction beyond capital</strong></article>
        </div>
        <div className="qf-thesis-bridge qf-reveal">
          <span>EIGHT FRONTIERS</span>
          <p>One continuous thesis, moving across the technologies that define the deep future.</p>
        </div>
      </div>

      <div
        className="qf-industry-story"
        ref={storyRef}
        style={{ "--qf-industry-count": industryChapters.length } as CSSProperties}
        data-industry-chapters={industryChapters.length}
        data-industry-models-supplied={suppliedIndustryModelCount}
        data-industry-models-pending={pendingIndustryModelCount}
        data-carousel-interval={CAROUSEL_INTERVAL_MS}
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
                aria-hidden={activeIndex !== index}
                key={chapter.slug}
              >
                <IndustryModelStage chapter={chapter} readyModelIds={mountedModelIds} />
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
                paused={!isInView}
                onInteractionStart={startModelInteraction}
                onInteractionEnd={endModelInteraction}
              />
            ) : null}
          </div>

          <div className="qf-industry-chrome">
            <span className="qf-industry-chrome-label">THESIS / 03 SECOND CYCLE</span>
            <nav className="qf-industry-chapter-nav" aria-label="Thesis chapters">
              {industryChapters.map((chapter, index) => (
                <button
                  type="button"
                  className={activeIndex === index ? "is-active" : ""}
                  aria-label={`Go to ${chapter.title}`}
                  aria-current={activeIndex === index ? "step" : undefined}
                  onClick={() => selectChapter(index)}
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
