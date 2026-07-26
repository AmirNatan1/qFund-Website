"use client";

import { useRef, type PointerEvent } from "react";

export default function ContactDialogue() {
  const fieldRef = useRef<HTMLDivElement>(null);

  const moveField = (event: PointerEvent<HTMLDivElement>) => {
    const field = fieldRef.current;
    if (!field || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    field.style.setProperty("--dialogue-x", x.toFixed(3));
    field.style.setProperty("--dialogue-y", y.toFixed(3));
  };

  const resetField = () => {
    fieldRef.current?.style.setProperty("--dialogue-x", "0");
    fieldRef.current?.style.setProperty("--dialogue-y", "0");
  };

  return (
    <div
      className="contact-dialogue"
      aria-hidden="true"
      onPointerMove={moveField}
      onPointerLeave={resetField}
    >
      <div className="contact-dialogue-field" ref={fieldRef}>
        <span className="dialogue-endpoint dialogue-endpoint-a"><i /></span>
        <span className="dialogue-endpoint dialogue-endpoint-b"><i /></span>

        <span className="dialogue-path dialogue-path-a"><i /></span>
        <span className="dialogue-path dialogue-path-b"><i /></span>
        <span className="dialogue-path dialogue-path-c"><i /></span>

        <span className="dialogue-echo dialogue-echo-a" />
        <span className="dialogue-echo dialogue-echo-b" />
        <span className="dialogue-mark dialogue-mark-a" />
        <span className="dialogue-mark dialogue-mark-b" />
      </div>
    </div>
  );
}
