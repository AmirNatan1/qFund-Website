"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import IndustryModelStage from "./IndustryModelStage";
import { industryChapters, pendingIndustryModelCount, suppliedIndustryModelCount } from "./industryConfig";

const LAST_CHAPTER_INDEX = industryChapters.length - 1;

export default function IndustriesExperience() {
  const storyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updatePosition = useCallback(() => {
    const story = storyRef.current;
    const track = trackRef.current;
    if (!story || !track) return;

    const bounds = story.getBoundingClientRect();
    const storyTop = window.scrollY + bounds.top;
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, (window.scrollY - storyTop) / travel));
    const x = -progress * LAST_CHAPTER_INDEX * window.innerWidth;
    const nextIndex = Math.min(LAST_CHAPTER_INDEX, Math.max(0, Math.round(progress * LAST_CHAPTER_INDEX)));

    track.style.transform = `translate3d(${x}px, 0, 0)`;
    story.style.setProperty("--qf-industry-progress", String(progress));
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  }, []);

  useEffect(() => {
    let frame = 0;
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        updatePosition();
        frame = 0;
      });
    };

    const observer = new ResizeObserver(requestUpdate);
    if (storyRef.current) observer.observe(storyRef.current);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    updatePosition();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [updatePosition]);

  const goToChapter = (index: number) => {
    const story = storyRef.current;
    if (!story) return;
    const storyTop = window.scrollY + story.getBoundingClientRect().top;
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: storyTop + (index / LAST_CHAPTER_INDEX) * travel,
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
                <IndustryModelStage chapter={chapter} shouldRender={Math.abs(activeIndex - index) <= 1} />
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
