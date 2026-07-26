"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";

type FocusArea = {
  code: string;
  title: string;
  short: string;
  text: string;
};

type FocusAreasGalleryProps = {
  areas: readonly FocusArea[];
};

const focusImages = [
  "/focus/quantum-computing.webp",
  "/focus/defense.webp",
  "/focus/energy.webp",
  "/focus/advanced-industry.webp",
  "/focus/semiconductors.webp",
  "/focus/advanced-electronics.webp",
] as const;

export default function FocusAreasGallery({ areas }: FocusAreasGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeArea = areas[activeIndex];

  const moveSelection = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (index + direction + areas.length) % areas.length;
    setActiveIndex(nextIndex);

    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");
    buttons?.[nextIndex]?.focus();
  };

  return (
    <div className="focus-gallery reveal">
      <div className="focus-gallery-stage" role="tabpanel" id="focus-active-panel" aria-labelledby={`focus-tab-${activeArea.code}`}>
        <Image
          className="focus-gallery-image"
          src={focusImages[activeIndex]}
          alt={`${activeArea.title}: a minimal qFund scientific visualization`}
          fill
          sizes="(max-width: 720px) 100vw, 70vw"
          key={activeArea.code}
        />
        <span className="focus-gallery-grid" aria-hidden="true" />
        <span className="focus-gallery-scan" aria-hidden="true" />
        <div className="focus-gallery-index" aria-hidden="true">{activeArea.code} / 06</div>
        <div className="focus-gallery-copy" key={`${activeArea.code}-copy`}>
          <p className="eyebrow">STRATEGIC FOCUS AREA</p>
          <h3>{activeArea.title}</h3>
          <p>{activeArea.text}</p>
        </div>
      </div>

      <div className="focus-gallery-controls" role="tablist" aria-label="Strategic focus areas">
        {areas.map((area, index) => (
          <button
            className={index === activeIndex ? "focus-gallery-control is-active" : "focus-gallery-control"}
            type="button"
            role="tab"
            id={`focus-tab-${area.code}`}
            aria-selected={index === activeIndex}
            aria-controls="focus-active-panel"
            key={area.code}
            onClick={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onPointerEnter={() => setActiveIndex(index)}
            onKeyDown={(event) => moveSelection(event, index)}
          >
            <span className="focus-gallery-thumb" aria-hidden="true">
              <Image src={focusImages[index]} alt="" fill sizes="160px" />
            </span>
            <span>{area.code}</span>
            <strong>{area.title}</strong>
            <i aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
