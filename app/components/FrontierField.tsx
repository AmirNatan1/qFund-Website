"use client";

import { useEffect, useRef, type CSSProperties } from "react";

function parseHexColor(value: string): [number, number, number] {
  const match = value.trim().match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!match) return [0, 0, 0];
  return [Number.parseInt(match[1], 16), Number.parseInt(match[2], 16), Number.parseInt(match[3], 16)];
}

function rgba([red, green, blue]: [number, number, number], alpha: number) {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/** Per-frame paint budget, in milliseconds, used to size the canvas backing store. */
const BUDGET_MS = 9;

export type FrontierFieldProps = {
  /** Extra class names applied to the field shell. */
  className?: string;
  /** Inline styles applied to the field shell. */
  style?: CSSProperties;
  /** Follow the pointer. Disabled for the opening reveal clone. */
  interactive?: boolean;
  /**
   * Multiplies the canvas backing-store resolution. The opening reveal scales the
   * field far beyond its layout size, so it renders at a matching density to stay
   * crisp while it fills the viewport.
   */
  densityBoost?: number;
  /** Receives the field shell so callers can measure it. */
  elementRef?: (node: HTMLDivElement | null) => void;
};

export default function FrontierField({
  className,
  style,
  interactive = true,
  densityBoost = 1,
  elementRef,
}: FrontierFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const boostRef = useRef(densityBoost);
  const resizeRef = useRef<((boost: number) => void) | null>(null);
  /** Measured paint cost of one frame at boost 1, in milliseconds. */
  const unitCostRef = useRef(0);

  /**
   * Extra resolution is only worth having if the device can still paint a frame
   * in time. Paint cost grows with the square of the density, so the cost of one
   * cheap frame predicts the rest: where the budget cannot cover the request —
   * software rendering, weak integrated graphics — the density is trimmed to fit
   * rather than stuttering through the opening.
   */
  const affordableBoost = (requested: number) => {
    if (requested <= 1.02 || unitCostRef.current <= 0) return requested;
    return Math.max(1, Math.min(requested, Math.sqrt(BUDGET_MS / unitCostRef.current)));
  };

  useEffect(() => {
    resizeRef.current?.(affordableBoost(densityBoost));
  }, [densityBoost]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const field = fieldRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !field || !context) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const brandRgb = parseHexColor(rootStyles.getPropertyValue("--color-brand"));
    const accentRgb = parseHexColor(rootStyles.getPropertyValue("--qf-coral"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, inside: false };
    let width = 1;
    let height = 1;
    let frame = 0;
    let fieldVisible = false;
    let pageVisible = !document.hidden;

    const render = (time: number) => {
      const seconds = time / 1000;
      pointer.x += (pointer.targetX - pointer.x) * 0.055;
      pointer.y += (pointer.targetY - pointer.y) * 0.055;

      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";

      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const pointerX = pointer.x * width;
      const pointerY = pointer.y * height;
      const fieldRadius = Math.max(width, height) * 0.32;

      const lens = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, fieldRadius);
      lens.addColorStop(0, rgba(accentRgb, 0.15));
      lens.addColorStop(0.42, rgba(brandRgb, 0.09));
      lens.addColorStop(1, rgba(brandRgb, 0));
      context.fillStyle = lens;
      context.fillRect(0, 0, width, height);

      const rows = 15;
      const horizontalSteps = 64;
      for (let row = 0; row < rows; row += 1) {
        const rowRatio = row / (rows - 1);
        const baseY = height * (0.16 + rowRatio * 0.68);
        context.beginPath();
        for (let step = 0; step <= horizontalSteps; step += 1) {
          const ratio = step / horizontalSteps;
          const x = ratio * width;
          const centerPull = Math.exp(-Math.pow((ratio - 0.5) / 0.23, 2));
          const wave = Math.sin(ratio * 10 + row * 0.48 + seconds * 0.52) * (1.5 + centerPull * 5.5);
          const depth = (rowRatio - 0.5) * Math.sin((ratio - 0.5) * Math.PI) * 9;
          const dx = x - pointerX;
          const dy = baseY - pointerY;
          const pointerPull = pointer.inside
            ? (pointerY - baseY) * Math.exp(-(dx * dx + dy * dy) / (fieldRadius * fieldRadius)) * 0.13
            : 0;
          const y = baseY + wave + depth + pointerPull;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        const rowDistance = Math.abs(rowRatio - 0.5);
        context.strokeStyle = rgba(brandRgb, 0.12 + (0.5 - rowDistance) * 0.27);
        context.lineWidth = row === 7 ? 1.35 : 0.86;
        context.stroke();
      }

      const columns = 13;
      const verticalSteps = 48;
      for (let column = 0; column < columns; column += 1) {
        const columnRatio = column / (columns - 1);
        const baseX = width * (0.12 + columnRatio * 0.76);
        context.beginPath();
        for (let step = 0; step <= verticalSteps; step += 1) {
          const ratio = step / verticalSteps;
          const y = ratio * height;
          const centerPull = Math.exp(-Math.pow((ratio - 0.5) / 0.27, 2));
          const wave = Math.cos(ratio * 8 + column * 0.42 - seconds * 0.42) * (1.2 + centerPull * 4);
          const dx = baseX - pointerX;
          const dy = y - pointerY;
          const pointerPull = pointer.inside
            ? (pointerX - baseX) * Math.exp(-(dx * dx + dy * dy) / (fieldRadius * fieldRadius)) * 0.11
            : 0;
          const x = baseX + wave + pointerPull;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = rgba(brandRgb, 0.16);
        context.lineWidth = 0.82;
        context.stroke();
      }

      for (let anchor = 0; anchor < 6; anchor += 1) {
        const angle = -Math.PI / 2 + (anchor / 6) * Math.PI * 2 + seconds * 0.025;
        const radiusX = width * 0.33;
        const radiusY = height * 0.29;
        const x = centerX + Math.cos(angle) * radiusX;
        const y = centerY + Math.sin(angle) * radiusY;
        const pulse = 0.5 + Math.sin(seconds * 1.2 + anchor * 1.4) * 0.5;
        context.beginPath();
        context.arc(x, y, 2.3 + pulse * 1.2, 0, Math.PI * 2);
        context.fillStyle = rgba(accentRgb, 0.55 + pulse * 0.35);
        context.fill();
        context.beginPath();
        context.arc(x, y, 7 + pulse * 4, 0, Math.PI * 2);
        context.strokeStyle = rgba(accentRgb, 0.08 + pulse * 0.12);
        context.lineWidth = 1;
        context.stroke();
      }

      const particles = 18;
      for (let particle = 0; particle < particles; particle += 1) {
        const progress = (seconds * 0.055 + particle / particles) % 1;
        const fromLeft = particle % 2 === 0;
        const startX = fromLeft ? -12 : width + 12;
        const startY = height * (0.17 + ((particle * 37) % 66) / 100);
        const controlX = centerX + (fromLeft ? -1 : 1) * width * 0.12;
        const controlY = centerY + Math.sin(particle * 2.1) * height * 0.2;
        const inverse = 1 - progress;
        const x = inverse * inverse * startX + 2 * inverse * progress * controlX + progress * progress * centerX;
        const y = inverse * inverse * startY + 2 * inverse * progress * controlY + progress * progress * centerY;
        const opacity = Math.sin(progress * Math.PI) * 0.72;
        context.beginPath();
        context.arc(x, y, 1.15 + progress * 1.25, 0, Math.PI * 2);
        context.fillStyle = rgba(accentRgb, opacity);
        context.fill();
      }

      const emission = (seconds % 5.4) / 5.4;
      context.beginPath();
      context.arc(centerX, centerY, 54 + emission * Math.min(width, height) * 0.28, 0, Math.PI * 2);
      context.strokeStyle = rgba(brandRgb, Math.pow(1 - emission, 2) * 0.32);
      context.lineWidth = 1;
      context.stroke();
    };

    const resize = (boost = boostRef.current) => {
      boostRef.current = boost;
      // Layout size, not the visual rect: the opening reveal scales an ancestor,
      // and getBoundingClientRect would fold that scale into the backing store.
      width = Math.max(1, field.offsetWidth);
      height = Math.max(1, field.offsetHeight);
      const base = Math.min(window.devicePixelRatio || 1, 1.4);
      const density = Math.min(Math.max(base, base * boost), 3.2);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(density, 0, 0, density, 0, 0);
      const started = performance.now();
      render(started);
      unitCostRef.current = (performance.now() - started) / (boost * boost);
    };

    const animate = (time: number) => {
      frame = 0;
      if (reduced || !fieldVisible || !pageVisible) return;
      render(time);
      frame = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!reduced && fieldVisible && pageVisible && !frame) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const stopAnimation = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = field.getBoundingClientRect();
      pointer.targetX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      pointer.targetY = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      pointer.inside = true;
      field.style.setProperty("--frontier-x", `${(pointer.targetX * 100).toFixed(1)}%`);
      field.style.setProperty("--frontier-y", `${(pointer.targetY * 100).toFixed(1)}%`);
      if (reduced) render(0);
    };

    const onPointerLeave = () => {
      pointer.targetX = 0.5;
      pointer.targetY = 0.5;
      pointer.inside = false;
      field.style.setProperty("--frontier-x", "50%");
      field.style.setProperty("--frontier-y", "50%");
      if (reduced) render(0);
    };

    const observer = new ResizeObserver(() => resize());
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        fieldVisible = entry.isIntersecting;
        if (fieldVisible) startAnimation();
        else stopAnimation();
      },
      { rootMargin: "12%" },
    );
    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible) startAnimation();
      else stopAnimation();
    };
    observer.observe(field);
    visibilityObserver.observe(field);
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (interactive) {
      field.addEventListener("pointermove", onPointerMove, { passive: true });
      field.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }
    resizeRef.current = resize;
    // Measure one cheap frame before committing to the requested density.
    const requested = boostRef.current;
    resize(1);
    const chosen = affordableBoost(requested);
    if (chosen > 1.02) resize(chosen);

    return () => {
      resizeRef.current = null;
      stopAnimation();
      observer.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      field.removeEventListener("pointermove", onPointerMove);
      field.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [interactive]);

  return (
    <div
      className={className ? `qf-frontier-field ${className}` : "qf-frontier-field"}
      ref={(node) => {
        fieldRef.current = node;
        elementRef?.(node);
      }}
      style={style}
      aria-hidden="true"
    >
      <canvas className="qf-frontier-canvas" ref={canvasRef} />
      <span className="qf-frontier-core">
        <span className="qf-frontier-mark">
          <i className="qf-frontier-q" />
          <i className="qf-frontier-arrow" />
        </span>
      </span>
      <span className="qf-frontier-depth depth-one" />
      <span className="qf-frontier-depth depth-two" />
    </div>
  );
}
