"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";

type ThesisPoint = {
  code: string;
  title: string;
  text: string;
};

type ThesisConvictionFieldProps = {
  points: readonly ThesisPoint[];
};

type FieldStyle = CSSProperties & {
  "--active-stop": string;
  "--field-x": string;
  "--field-y": string;
  "--field-tilt-x": string;
  "--field-tilt-y": string;
};

export default function ThesisConvictionField({ points }: ThesisConvictionFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activePoint = points[activeIndex];

  const moveFieldLight = (event: PointerEvent<HTMLDivElement>) => {
    const field = fieldRef.current;
    if (!field) return;

    const bounds = field.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    field.style.setProperty("--field-x", `${x * 100}%`);
    field.style.setProperty("--field-y", `${y * 100}%`);
    field.style.setProperty("--field-tilt-x", `${(0.5 - y) * 2.5}deg`);
    field.style.setProperty("--field-tilt-y", `${(x - 0.5) * 3.5}deg`);
  };

  const resetFieldLight = () => {
    const field = fieldRef.current;
    if (!field) return;

    field.style.setProperty("--field-x", "50%");
    field.style.setProperty("--field-y", "50%");
    field.style.setProperty("--field-tilt-x", "0deg");
    field.style.setProperty("--field-tilt-y", "0deg");
  };

  const style = {
    "--active-stop": `${((activeIndex + 0.5) / points.length) * 100}%`,
    "--field-x": "50%",
    "--field-y": "50%",
    "--field-tilt-x": "0deg",
    "--field-tilt-y": "0deg",
  } as FieldStyle;

  return (
    <div
      className="thesis-conviction-field reveal is-visible"
      ref={fieldRef}
      style={style}
      onPointerMove={moveFieldLight}
      onPointerLeave={resetFieldLight}
      aria-label="Explore qFund's three-part investment thesis"
    >
      <div className="thesis-field-readout">
        <div>
          <span>THESIS SIGNAL</span>
          <strong>{activePoint.title}</strong>
        </div>
        <p key={activePoint.code} aria-live="polite">{activePoint.text}</p>
        <small>{activePoint.code} / 03</small>
      </div>

      <div className="thesis-field-track" role="group" aria-label="Thesis signals">
        <span className="thesis-field-beam" aria-hidden="true">
          <i className="thesis-field-current" />
          <i className="thesis-field-pulse pulse-a" />
          <i className="thesis-field-pulse pulse-b" />
          <i className="thesis-field-pulse pulse-c" />
        </span>

        {points.map((point, index) => (
          <button
            className={index === activeIndex ? "thesis-field-point is-active" : "thesis-field-point"}
            type="button"
            key={point.code}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onPointerEnter={() => setActiveIndex(index)}
          >
            <span className="thesis-point-node" aria-hidden="true">
              <i />
              <b />
            </span>
            <span className="thesis-point-copy">
              <small>{point.code}</small>
              <strong>{point.title}</strong>
            </span>
          </button>
        ))}

        <span className="thesis-field-focus" aria-hidden="true"><i /></span>
      </div>
    </div>
  );
}
