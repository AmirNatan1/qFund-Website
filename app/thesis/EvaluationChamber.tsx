"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";

type EvaluationPillar = {
  code: string;
  title: string;
  text: string;
  signal: string;
};

type EvaluationChamberProps = {
  pillars: readonly EvaluationPillar[];
};

type ChamberStyle = CSSProperties & {
  "--evaluation-index": number;
  "--evaluation-x": string;
  "--evaluation-y": string;
};

export default function EvaluationChamber({ pillars }: EvaluationChamberProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const chamberRef = useRef<HTMLDivElement>(null);
  const activePillar = pillars[activeIndex];

  const moveLight = (event: PointerEvent<HTMLDivElement>) => {
    const chamber = chamberRef.current;
    if (!chamber) return;

    const bounds = chamber.getBoundingClientRect();
    chamber.style.setProperty("--evaluation-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    chamber.style.setProperty("--evaluation-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  };

  const style = {
    "--evaluation-index": activeIndex,
    "--evaluation-x": "42%",
    "--evaluation-y": "48%",
  } as ChamberStyle;

  return (
    <div className="evaluation-chamber reveal" ref={chamberRef} style={style} onPointerMove={moveLight}>
      <div className="evaluation-stage" aria-hidden="true">
        <span className="evaluation-grid" />
        <span className="evaluation-axis evaluation-axis-x" />
        <span className="evaluation-axis evaluation-axis-y" />
        <span className="evaluation-ring evaluation-ring-a" />
        <span className="evaluation-ring evaluation-ring-b" />
        <span className="evaluation-ring evaluation-ring-c" />
        <span className="evaluation-sweep" />
        <span className="evaluation-beacon"><i /></span>
        <div className="evaluation-core">
          <small>ACTIVE TEST</small>
          <strong>{activePillar.code}</strong>
          <span>{activePillar.signal}</span>
        </div>
        <div className="evaluation-stage-readout" key={activePillar.code}>
          <span>{activePillar.title}</span>
          <p>{activePillar.text}</p>
        </div>
      </div>

      <div className="evaluation-controls" role="group" aria-label="qFund evaluation pillars">
        {pillars.map((pillar, index) => (
          <button
            className={index === activeIndex ? "evaluation-control is-active" : "evaluation-control"}
            type="button"
            aria-pressed={index === activeIndex}
            key={pillar.code}
            onClick={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onPointerEnter={() => setActiveIndex(index)}
          >
            <span>{pillar.code}</span>
            <span>
              <small>{pillar.signal}</small>
              <strong>{pillar.title}</strong>
              <p>{pillar.text}</p>
            </span>
            <i aria-hidden="true">{index === activeIndex ? "●" : "○"}</i>
          </button>
        ))}
      </div>
    </div>
  );
}
