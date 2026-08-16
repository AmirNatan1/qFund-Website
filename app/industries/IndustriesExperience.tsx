"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
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

  const moveThesisField = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--qf-thesis-x", `${((x + 0.5) * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty("--qf-thesis-y", `${((y + 0.5) * 100).toFixed(2)}%`);
    event.currentTarget.style.setProperty("--qf-thesis-shift-x", `${(x * 18).toFixed(2)}px`);
    event.currentTarget.style.setProperty("--qf-thesis-shift-y", `${(y * 14).toFixed(2)}px`);
  };

  const resetThesisField = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--qf-thesis-x", "68%");
    event.currentTarget.style.setProperty("--qf-thesis-y", "42%");
    event.currentTarget.style.setProperty("--qf-thesis-shift-x", "0px");
    event.currentTarget.style.setProperty("--qf-thesis-shift-y", "0px");
  };

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
        <div
          className="qf-thesis-system qf-reveal"
          onPointerMove={moveThesisField}
          onPointerLeave={resetThesisField}
        >
          <span className="qf-thesis-system-grid" aria-hidden="true" />
          <div className="qf-thesis-statement">
            <p className="qf-kicker">EARLY-STAGE DEEP TECH</p>
            <h2 id="thesis-title"><span>Early conviction.</span><em>Foundational technology.</em></h2>
            <small>QF / THESIS / 03</small>
          </div>

          <div className="qf-thesis-orbit" aria-hidden="true">
            <span className="qf-thesis-ring qf-thesis-ring-one" />
            <span className="qf-thesis-ring qf-thesis-ring-two" />
            <span className="qf-thesis-ring qf-thesis-ring-three" />
            <span className="qf-thesis-scan" />
            <span className="qf-thesis-crosshair qf-thesis-crosshair-x" />
            <span className="qf-thesis-crosshair qf-thesis-crosshair-y" />
            <div className="qf-thesis-core">
              <span>WE BACK</span>
              <strong>DEEP<br />TECH</strong>
              <small>BUILDERS</small>
            </div>
          </div>

          <ul className="qf-thesis-signals" aria-label="qFund investment thesis">
            <li className="is-focus"><span>01 / FOCUS</span><strong>Deep Tech</strong></li>
            <li className="is-builders"><span>02 / BUILDERS</span><strong>Foundational technology</strong></li>
            <li className="is-entry"><span>03 / ENTRY</span><strong>Pre-seed to Series A</strong></li>
            <li className="is-partnership"><span>04 / PARTNERSHIP</span><strong>Conviction beyond capital</strong></li>
          </ul>

          <div className="qf-thesis-handoff" aria-hidden="true">
            <span>EIGHT FRONTIERS</span>
            <i />
            <span>THESIS IN MOTION</span>
            <b>↓</b>
          </div>
        </div>
        <div className="qf-thesis-ticker" aria-hidden="true">
          <div>
            <span>DEEP TECH</span><i />
            <span>PRE-SEED TO SERIES A</span><i />
            <span>FOUNDATIONAL SYSTEMS</span><i />
            <span>CONVICTION BEYOND CAPITAL</span><i />
            <span>DEEP TECH</span><i />
            <span>PRE-SEED TO SERIES A</span><i />
            <span>FOUNDATIONAL SYSTEMS</span><i />
            <span>CONVICTION BEYOND CAPITAL</span><i />
          </div>
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
