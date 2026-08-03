"use client";

import { useEffect, useRef } from "react";

/* ------------------------------------------------------------------------- *
 * StrataField
 *
 * A full-bleed, dependency-free Canvas 2D composition in two layers that
 * share a single scalar field:
 *
 *   1. Contours - marching-squares isolines of a domain-warped fractal noise
 *      field, drawn as hairlines and swept slowly through value space so new
 *      lines emerge and dissolve continuously.
 *
 *   2. Silk - particles advected along the curl of that same field. The
 *      isolines of a scalar field are exactly the streamlines of its curl, so
 *      the particles glide along the drawn contours. The velocity field is
 *      divergence-free by construction, so particles never pool into sinks.
 *
 * Everything is drafted rather than glowing: one hue family, hairline weights,
 * a narrow luminance range, and structure that evolves over roughly a minute.
 * ------------------------------------------------------------------------- */

/* ------------------------------- tuning ------------------------------- */

const CELL = 15; // CSS px per field cell
const LEVELS = 5; // simultaneous contour levels
const FIELD_SLICES = 5; // field rows are refreshed across this many frames
const SPAN_X = 1.2; // noise units across the viewport width
const FIELD_TIME = 0.03; // field evolution rate, units per second
const SWEEP_RATE = 0.055; // contour sweep rate, cycles per second

const CONTOUR_ALPHA = 0.3;
const CONTOUR_INDEX_ALPHA = 0.42; // every cycle's leading line, drawn heavier

/* Density is concentrated in a soft hump right of centre rather than spread
   evenly, so the frame has a subject and real negative space. */
const FOCUS_X = 0.66;
const FOCUS_SPREAD = 0.36;
const FOCUS_DEPTH = 0.7;

const PARTICLE_AREA = 3600; // one particle per N square CSS px
const PARTICLE_CAP = 1400;
const PARTICLE_SPEED = 2; // CSS px per frame at unit gradient
const PARTICLE_BANDS = 3;
const SILK_ALPHA = 0.15;
const SILK_WIDTH = 1;
const TRAIL_FADE = 0.007; // trail buffer decay per frame
const SILK_DETAIL = 0.75; // trail buffer resolution relative to CSS px

const FLOW_COLS = 60; // pointer-wake injection grid
const FLOW_ROWS = 34;
const WAKE_DECAY = 0.94;
const WAKE_GAIN = 180;
const POINTER_LAG = 0.06;

const P_STRIDE = 6; // x, y, vx, vy, life, depth

/* -------------------------------- noise -------------------------------- */

/** Improved Perlin noise, 3D. Deterministic, allocation-free, no dependencies. */
export function createNoise(seed: number) {
  const perm = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) perm[i] = i;

  let state = (seed || 1) >>> 0;
  for (let i = 255; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    const swap = perm[i];
    perm[i] = perm[j];
    perm[j] = swap;
  }

  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i += 1) p[i] = perm[i & 255];

  const grad = (hash: number, x: number, y: number, z: number) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return function noise(x: number, y: number, z: number) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const fx = x - xi;
    const fy = y - yi;
    const fz = z - zi;

    const X = xi & 255;
    const Y = yi & 255;
    const Z = zi & 255;

    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10);
    const v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const w = fz * fz * fz * (fz * (fz * 6 - 15) + 10);

    const a = p[X] + Y;
    const aa = p[a] + Z;
    const ab = p[a + 1] + Z;
    const b = p[X + 1] + Y;
    const ba = p[b] + Z;
    const bb = p[b + 1] + Z;

    const n1 = grad(p[aa], fx, fy, fz);
    const n2 = grad(p[ba], fx - 1, fy, fz);
    const n3 = grad(p[ab], fx, fy - 1, fz);
    const n4 = grad(p[bb], fx - 1, fy - 1, fz);
    const n5 = grad(p[aa + 1], fx, fy, fz - 1);
    const n6 = grad(p[ba + 1], fx - 1, fy, fz - 1);
    const n7 = grad(p[ab + 1], fx, fy - 1, fz - 1);
    const n8 = grad(p[bb + 1], fx - 1, fy - 1, fz - 1);

    const x1 = n1 + u * (n2 - n1);
    const x2 = n3 + u * (n4 - n3);
    const x3 = n5 + u * (n6 - n5);
    const x4 = n7 + u * (n8 - n7);

    const y1 = x1 + v * (x2 - x1);
    const y2 = x3 + v * (x4 - x3);

    return y1 + w * (y2 - y1);
  };
}

type Noise = ReturnType<typeof createNoise>;

/* Rotated, detuned octaves keep peaks from stacking on the axes. */
const ROT_COS = 0.8;
const ROT_SIN = 0.6;
const LACUNARITY = 2.02;

export function fbm(noise: Noise, x: number, y: number, z: number, octaves: number) {
  let sum = 0;
  let norm = 0;
  let amp = 1;
  let px = x;
  let py = y;

  for (let i = 0; i < octaves; i += 1) {
    sum += amp * noise(px, py, z * (1 + i * 0.13));
    norm += amp;
    amp *= 0.5;
    const nx = (px * ROT_COS - py * ROT_SIN) * LACUNARITY;
    const ny = (px * ROT_SIN + py * ROT_COS) * LACUNARITY;
    px = nx;
    py = ny;
  }

  return sum / norm;
}

/** Two-vector domain warp. This is what supplies the organic irregularity. */
export function warpedField(noise: Noise, x: number, y: number, t: number) {
  const qx = fbm(noise, x, y, t, 2);
  const qy = fbm(noise, x + 5.2, y + 1.3, t + 2.7, 2);
  return fbm(noise, x + 2.6 * qx, y + 2.6 * qy, t * 0.9, 3);
}

/* ------------------------------ component ------------------------------ */

export default function StrataField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLCanvasElement>(null);
  const silkRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const rootNode = rootRef.current;
    const linesNode = linesRef.current;
    const silkNode = silkRef.current;
    if (!rootNode || !linesNode || !silkNode) return;

    const lineContext = linesNode.getContext("2d");
    const silkContext = silkNode.getContext("2d");
    if (!lineContext || !silkContext) return;

    /* Non-null aliases: narrowing from the guards above does not reach the
       hoisted function declarations below. */
    const root: HTMLDivElement = rootNode;
    const lines: HTMLCanvasElement = linesNode;
    const silk: HTMLCanvasElement = silkNode;
    const lineCtx: CanvasRenderingContext2D = lineContext;
    const silkCtx: CanvasRenderingContext2D = silkContext;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const noise = createNoise(0x51ea7a);

    /* geometry */
    let cssW = 1;
    let cssH = 1;
    let linePix = 1;
    let silkPix = 1;

    /* scalar field */
    let cols = 1;
    let rows = 1;
    let gw = 2;
    let gh = 2;
    let field = new Float32Array(4);
    let sliceRow = 0;
    let runLo = Infinity;
    let runHi = -Infinity;
    let lo = -0.35;
    let hi = 0.35;

    /* pointer wake */
    const wake = new Float32Array(FLOW_COLS * FLOW_ROWS * 2);
    const pointer = { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42, px: 0.5, py: 0.42, live: false };

    /* particles */
    let particles = new Float32Array(P_STRIDE);
    let count = 0;

    /* quiet zones */
    let mask: HTMLCanvasElement | null = null;
    const quiet = { cx: 0.3, cy: 0.5, rx: 0.36, ry: 0.32, depth: 0.42 };
    let intensity = 1;

    /* clock */
    let clock = 0;
    let sweep = 0;
    let last = 0;
    let raf = 0;
    let running = false;
    let onScreen = true;

    /* scroll */
    let progress = 0;
    let smoothProgress = 0;
    let yBias = 0;
    let scrollQueued = false;
    let lastOpacity = -1;

    /* ------------------------------------------------------------------ *
     * Quiet-zone weighting. Motion tapers to nothing at the frame edges
     * and thins where the headline sits, so the type never has to fight
     * the field. This is amplitude modulation, not a scrim on top.
     * ------------------------------------------------------------------ */
    function weightAt(nx: number, ny: number) {
      const edge =
        Math.min(1, nx / 0.14) *
        Math.min(1, (1 - nx) / 0.12) *
        Math.min(1, ny / 0.12) *
        Math.min(1, (1 - ny) / 0.14);
      if (edge <= 0) return 0;

      const fx = (nx - FOCUS_X) / FOCUS_SPREAD;
      const focus = 1 - FOCUS_DEPTH + FOCUS_DEPTH * Math.exp(-(fx * fx));

      const dx = (nx - quiet.cx) / quiet.rx;
      const dy = (ny - quiet.cy) / quiet.ry;
      const near = Math.exp(-(dx * dx + dy * dy));

      return edge * focus * (1 - quiet.depth * near);
    }

    /** Bakes weightAt() into a low-resolution alpha mask for the line layer. */
    function buildMask() {
      const mw = Math.max(2, Math.round(cssW / 6));
      const mh = Math.max(2, Math.round(cssH / 6));
      const canvas = document.createElement("canvas");
      canvas.width = mw;
      canvas.height = mh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const image = ctx.createImageData(mw, mh);
      const data = image.data;
      for (let y = 0; y < mh; y += 1) {
        const ny = (y + 0.5) / mh;
        for (let x = 0; x < mw; x += 1) {
          const nx = (x + 0.5) / mw;
          const remove = 1 - weightAt(nx, ny);
          const i = (y * mw + x) * 4;
          data[i + 3] = Math.round(Math.max(0, Math.min(1, remove)) * 255);
        }
      }
      ctx.putImageData(image, 0, 0);
      return canvas;
    }

    /** Reads the real headline box so the quiet zone follows the layout. */
    function measureQuietZone() {
      const copy = root.parentElement?.querySelector<HTMLElement>(".qf-hero-copy");
      const bounds = root.getBoundingClientRect();
      if (!copy || bounds.width < 1 || bounds.height < 1) return;

      const box = copy.getBoundingClientRect();
      const cx = (box.left + box.width * 0.42 - bounds.left) / bounds.width;
      const cy = (box.top + box.height * 0.5 - bounds.top) / bounds.height;

      quiet.cx = Math.max(0.1, Math.min(0.9, cx));
      quiet.cy = Math.max(0.1, Math.min(0.9, cy));
      quiet.rx = Math.max(0.22, Math.min(0.6, (box.width * 0.62) / bounds.width));
      quiet.ry = Math.max(0.2, Math.min(0.6, (box.height * 0.52) / bounds.height));
      const narrow = bounds.width < 760;
      quiet.depth = narrow ? 0.72 : 0.42;
      intensity = narrow ? 0.62 : bounds.width < 1100 ? 0.82 : 1;
    }

    /* ------------------------------ field ------------------------------ */

    function computeRow(row: number, t: number) {
      const spanY = SPAN_X * (cssH / Math.max(1, cssW));
      const ny = (row / Math.max(1, gh - 1)) * spanY + yBias;
      const base = row * gw;
      for (let col = 0; col < gw; col += 1) {
        const nx = (col / Math.max(1, gw - 1)) * SPAN_X;
        const value = warpedField(noise, nx, ny, t);
        field[base + col] = value;
        if (value < runLo) runLo = value;
        if (value > runHi) runHi = value;
      }
    }

    /** Refreshes a horizontal stripe each frame, spreading the noise cost. */
    function refreshFieldSlice(t: number) {
      const perFrame = Math.max(1, Math.ceil(gh / FIELD_SLICES));
      for (let i = 0; i < perFrame; i += 1) {
        computeRow(sliceRow, t);
        sliceRow += 1;
        if (sliceRow >= gh) {
          sliceRow = 0;
          if (runHi > runLo) {
            lo += (runLo - lo) * 0.35;
            hi += (runHi - hi) * 0.35;
          }
          runLo = Infinity;
          runHi = -Infinity;
        }
      }
    }

    function computeFieldFully(t: number) {
      runLo = Infinity;
      runHi = -Infinity;
      for (let row = 0; row < gh; row += 1) computeRow(row, t);
      if (runHi > runLo) {
        lo = runLo;
        hi = runHi;
      }
      sliceRow = 0;
      runLo = Infinity;
      runHi = -Infinity;
    }

    /** Bilinear sample of the scalar field in CSS pixel space. */
    function sampleField(x: number, y: number) {
      let gx = x / CELL;
      let gy = y / CELL;
      if (gx < 0) gx = 0;
      if (gy < 0) gy = 0;
      if (gx > gw - 1.001) gx = gw - 1.001;
      if (gy > gh - 1.001) gy = gh - 1.001;

      const ix = gx | 0;
      const iy = gy | 0;
      const fx = gx - ix;
      const fy = gy - iy;
      const i = iy * gw + ix;

      const top = field[i] + (field[i + 1] - field[i]) * fx;
      const bottom = field[i + gw] + (field[i + gw + 1] - field[i + gw]) * fx;
      return top + (bottom - top) * fy;
    }

    /* -------------------------- contour layer -------------------------- */

    /* Hoisted so the inner cell loop allocates nothing. */
    let lensK = 0;
    let lensMx = 0;
    let lensMy = 0;
    let lensR2 = 1;

    /**
     * Lens distortion applied to emitted vertices only, so the contours
     * bulge around the cursor like a glass loupe laid on paper.
     */
    function strokeSegment(ax: number, ay: number, bx: number, by: number) {
      let sx = ax;
      let sy = ay;
      let tx = bx;
      let ty = by;

      if (lensK !== 0) {
        let dx = ax - lensMx;
        let dy = ay - lensMy;
        let d2 = dx * dx + dy * dy;
        if (d2 < lensR2) {
          const r = 1 - d2 / lensR2;
          const push = lensK * r * r;
          sx = ax + dx * push;
          sy = ay + dy * push;
        }
        dx = bx - lensMx;
        dy = by - lensMy;
        d2 = dx * dx + dy * dy;
        if (d2 < lensR2) {
          const r = 1 - d2 / lensR2;
          const push = lensK * r * r;
          tx = bx + dx * push;
          ty = by + dy * push;
        }
      }

      lineCtx.moveTo(sx, sy);
      lineCtx.lineTo(tx, ty);
    }

    function drawContours(alphaScale: number) {
      lineCtx.setTransform(linePix, 0, 0, linePix, 0, 0);
      lineCtx.clearRect(0, 0, cssW, cssH);
      lineCtx.lineCap = "round";
      lineCtx.lineJoin = "round";

      const range = Math.max(0.02, hi - lo);
      const insetLo = lo + range * 0.08;
      const span = range * 0.84;

      const lensR = Math.min(cssW, cssH) * 0.3;
      lensR2 = lensR * lensR;
      lensK = pointer.live ? 0.42 : 0;
      lensMx = pointer.x * cssW;
      lensMy = pointer.y * cssH;

      for (let level = 0; level < LEVELS; level += 1) {
        const u = (level / LEVELS + sweep) % 1;
        const fade = Math.sin(u * Math.PI);
        const isIndex = level === 0;
        const alpha =
          fade * fade * (isIndex ? CONTOUR_INDEX_ALPHA : CONTOUR_ALPHA) * alphaScale * intensity;
        if (alpha < 0.005) continue;

        const threshold = insetLo + u * span;
        lineCtx.beginPath();

        for (let row = 0; row < rows; row += 1) {
          const y0 = row * CELL;
          const y1 = y0 + CELL;
          const base = row * gw;

          for (let col = 0; col < cols; col += 1) {
            const i = base + col;
            const tl = field[i];
            const tr = field[i + 1];
            const bl = field[i + gw];
            const br = field[i + gw + 1];

            let key = 0;
            if (tl > threshold) key |= 8;
            if (tr > threshold) key |= 4;
            if (br > threshold) key |= 2;
            if (bl > threshold) key |= 1;
            if (key === 0 || key === 15) continue;

            const x0 = col * CELL;
            const x1 = x0 + CELL;

            /* Linearly interpolated edge crossings. Without the
               interpolation this degrades to 45-degree staircases. */
            const eTop = x0 + CELL * ((threshold - tl) / (tr - tl || 1e-6));
            const eBottom = x0 + CELL * ((threshold - bl) / (br - bl || 1e-6));
            const eLeft = y0 + CELL * ((threshold - tl) / (bl - tl || 1e-6));
            const eRight = y0 + CELL * ((threshold - tr) / (br - tr || 1e-6));

            switch (key) {
              case 1: // BL in
              case 14: // TL TR BR in
                strokeSegment(x0, eLeft, eBottom, y1);
                break;
              case 2: // BR in
              case 13:
                strokeSegment(eBottom, y1, x1, eRight);
                break;
              case 3: // BL BR in
              case 12:
                strokeSegment(x0, eLeft, x1, eRight);
                break;
              case 4: // TR in
              case 11:
                strokeSegment(eTop, y0, x1, eRight);
                break;
              case 6: // TR BR in
              case 9:
                strokeSegment(eTop, y0, eBottom, y1);
                break;
              case 7: // TR BR BL in
              case 8: // TL in
                strokeSegment(x0, eLeft, eTop, y0);
                break;
              case 5: // TR BL in - saddle
                strokeSegment(eTop, y0, x1, eRight);
                strokeSegment(x0, eLeft, eBottom, y1);
                break;
              case 10: // TL BR in - saddle
                strokeSegment(x0, eLeft, eTop, y0);
                strokeSegment(eBottom, y1, x1, eRight);
                break;
              default:
                break;
            }
          }
        }

        lineCtx.lineWidth = isIndex ? 1.35 : 0.9;
        lineCtx.strokeStyle =
          level % 3 === 1
            ? `rgba(34, 199, 203, ${(alpha * 0.82).toFixed(4)})`
            : `rgba(12, 111, 105, ${alpha.toFixed(4)})`;
        lineCtx.stroke();
      }

      if (mask) {
        lineCtx.globalCompositeOperation = "destination-out";
        lineCtx.drawImage(mask, 0, 0, cssW, cssH);
        lineCtx.globalCompositeOperation = "source-over";
      }
    }

    /* ---------------------------- silk layer ---------------------------- */

    function seedParticle(index: number, spread: boolean) {
      const i = index * P_STRIDE;
      particles[i] = Math.random() * cssW;
      particles[i + 1] = Math.random() * cssH;
      particles[i + 2] = 0;
      particles[i + 3] = 0;
      particles[i + 4] = spread ? Math.random() * 300 : 300 + Math.random() * 220;
      particles[i + 5] = Math.random();
    }

    function buildParticles() {
      const target = Math.min(
        PARTICLE_CAP,
        Math.max(220, Math.round((cssW * cssH) / PARTICLE_AREA)),
      );
      particles = new Float32Array(target * P_STRIDE);
      count = target;
      for (let n = 0; n < count; n += 1) seedParticle(n, true);
    }

    let wakeX = 0;
    let wakeY = 0;

    function sampleWake(nx: number, ny: number) {
      const gx = Math.max(0, Math.min(FLOW_COLS - 1.001, nx * (FLOW_COLS - 1)));
      const gy = Math.max(0, Math.min(FLOW_ROWS - 1.001, ny * (FLOW_ROWS - 1)));
      const ix = gx | 0;
      const iy = gy | 0;
      const fx = gx - ix;
      const fy = gy - iy;

      const i00 = (iy * FLOW_COLS + ix) * 2;
      const i10 = i00 + 2;
      const i01 = i00 + FLOW_COLS * 2;
      const i11 = i01 + 2;

      const a = (1 - fx) * (1 - fy);
      const b = fx * (1 - fy);
      const c = (1 - fx) * fy;
      const d = fx * fy;

      wakeX = wake[i00] * a + wake[i10] * b + wake[i01] * c + wake[i11] * d;
      wakeY = wake[i00 + 1] * a + wake[i10 + 1] * b + wake[i01 + 1] * c + wake[i11 + 1] * d;
    }

    /* The cursor injects velocity into a field that decays slowly, so the
       medium remembers where the pointer has been instead of snapping. */
    function injectWake(dt: number) {
      const decay = Math.pow(WAKE_DECAY, dt);
      for (let i = 0; i < wake.length; i += 1) wake[i] *= decay;
      if (!pointer.live) return;

      const vx = pointer.x - pointer.px;
      const vy = pointer.y - pointer.py;
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed < 0.0004) return;

      const cx = pointer.x * (FLOW_COLS - 1);
      const cy = pointer.y * (FLOW_ROWS - 1);
      const radius = FLOW_COLS * 0.13;
      const r2 = radius * radius;
      const gain = Math.min(0.34, speed * 9);

      const x0 = Math.max(0, Math.floor(cx - radius));
      const x1 = Math.min(FLOW_COLS - 1, Math.ceil(cx + radius));
      const y0 = Math.max(0, Math.floor(cy - radius));
      const y1 = Math.min(FLOW_ROWS - 1, Math.ceil(cy + radius));

      for (let y = y0; y <= y1; y += 1) {
        for (let x = x0; x <= x1; x += 1) {
          const dx = x - cx;
          const dy = y - cy;
          const d2 = dx * dx + dy * dy;
          if (d2 > r2) continue;
          const falloff = 1 - d2 / r2;
          const w = falloff * falloff * gain;
          const i = (y * FLOW_COLS + x) * 2;
          wake[i] += vx * w * WAKE_GAIN;
          wake[i + 1] += vy * w * WAKE_GAIN;
        }
      }
    }

    function stepSilk(dt: number, fade: boolean, alphaScale: number) {
      if (fade) {
        silkCtx.setTransform(1, 0, 0, 1, 0, 0);
        /* Fade the alpha channel only. Fading with source-over instead
           would never converge on an 8-bit backing store and would leave
           a permanent coloured haze where the pointer had travelled. */
        const amount = Math.min(0.5, (TRAIL_FADE + Math.random() * 0.008) * dt);
        silkCtx.globalCompositeOperation = "destination-out";
        silkCtx.globalAlpha = amount;
        silkCtx.fillStyle = "#000";
        silkCtx.fillRect(0, 0, silk.width, silk.height);
        silkCtx.globalAlpha = 1;
        silkCtx.globalCompositeOperation = "source-over";
      }

      silkCtx.setTransform(silkPix, 0, 0, silkPix, 0, 0);
      silkCtx.lineCap = "round";

      const eps = CELL * 0.7;
      const smooth = 1 - Math.pow(0.5, dt);

      for (let band = 0; band < PARTICLE_BANDS; band += 1) {
        const near = band / (PARTICLE_BANDS - 1);
        let drew = false;
        silkCtx.beginPath();

        for (let n = 0; n < count; n += 1) {
          const i = n * P_STRIDE;
          const depth = particles[i + 5];
          if (Math.min(PARTICLE_BANDS - 1, (depth * PARTICLE_BANDS) | 0) !== band) continue;

          const x = particles[i];
          const y = particles[i + 1];

          /* Curl of the scalar field: velocity runs along the isolines,
             which are the very lines the contour layer draws. */
          let vx = (sampleField(x, y + eps) - sampleField(x, y - eps)) / (2 * eps);
          let vy = -(sampleField(x + eps, y) - sampleField(x - eps, y)) / (2 * eps);

          const mag = Math.sqrt(vx * vx + vy * vy) || 1e-6;
          const gate = 0.45 + 0.55 * Math.min(1, mag / 0.004);
          vx = (vx / mag) * gate;
          vy = (vy / mag) * gate;

          sampleWake(x / cssW, y / cssH);
          vx += wakeX;
          vy += wakeY;

          /* First-order lag on direction. This is what makes ribbons
             instead of gravel. */
          particles[i + 2] += (vx - particles[i + 2]) * smooth;
          particles[i + 3] += (vy - particles[i + 3]) * smooth;

          const speed = PARTICLE_SPEED * (0.62 + depth * 0.66) * dt;
          const nx2 = x + particles[i + 2] * speed;
          const ny2 = y + particles[i + 3] * speed;

          particles[i + 4] -= dt;
          if (
            particles[i + 4] <= 0 ||
            nx2 < -20 ||
            nx2 > cssW + 20 ||
            ny2 < -20 ||
            ny2 > cssH + 20
          ) {
            seedParticle(n, false);
            continue;
          }

          if (weightAt(nx2 / cssW, ny2 / cssH) > 0.02) {
            silkCtx.moveTo(x, y);
            silkCtx.lineTo(nx2, ny2);
            drew = true;
          }

          particles[i] = nx2;
          particles[i + 1] = ny2;
        }

        if (!drew) continue;

        const bandAlpha = SILK_ALPHA * (1 + near * 0.64) * alphaScale * intensity;
        silkCtx.lineWidth = SILK_WIDTH * (1 + near * 0.85);
        silkCtx.strokeStyle =
          band === PARTICLE_BANDS - 1
            ? `rgba(34, 199, 203, ${(bandAlpha * 1.05).toFixed(4)})`
            : `rgba(9, 62, 61, ${bandAlpha.toFixed(4)})`;
        silkCtx.stroke();
      }
    }

    /* ------------------------------ frame ------------------------------ */

    function frame(now: number) {
      raf = window.requestAnimationFrame(frame);

      const rawDt = last === 0 ? 16.667 : now - last;
      last = now;
      /* Clamped so a tab-switch cannot produce one exploded garbage frame,
         and normalised so 60Hz and 144Hz run at the same speed. */
      const dtMs = Math.min(34, Math.max(4, rawDt));
      const dt = dtMs / 16.667;

      smoothProgress += (progress - smoothProgress) * Math.min(1, 0.06 * dt);
      const timeScale = 1 - smoothProgress * 0.55;
      const alphaScale = 1 - smoothProgress * 0.35;

      clock += (dtMs / 1000) * timeScale;
      sweep = (sweep + (dtMs / 1000) * SWEEP_RATE * timeScale) % 1;
      yBias += (smoothProgress * 0.55 - yBias) * Math.min(1, 0.05 * dt);

      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, POINTER_LAG * dt);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, POINTER_LAG * dt);

      refreshFieldSlice(clock * FIELD_TIME);
      injectWake(dt);
      stepSilk(dt, true, alphaScale);
      drawContours(alphaScale);

      const opacity = 1 - smoothProgress * 0.82;
      if (Math.abs(opacity - lastOpacity) > 0.005) {
        lastOpacity = opacity;
        root.style.setProperty("--strata-opacity", opacity.toFixed(3));
      }
    }

    function start() {
      if (running || reduced.matches || !onScreen || document.hidden) return;
      running = true;
      last = 0;
      raf = window.requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    }

    /** One composed still frame. Used for first paint and reduced motion. */
    function renderStill(warmSteps: number) {
      computeFieldFully(clock * FIELD_TIME);
      silkCtx.setTransform(1, 0, 0, 1, 0, 0);
      silkCtx.clearRect(0, 0, silk.width, silk.height);
      for (let i = 0; i < warmSteps; i += 1) stepSilk(1, false, 1);
      drawContours(1);
      lastOpacity = 1;
      root.style.setProperty("--strata-opacity", "1");
    }

    /* ----------------------------- sizing ----------------------------- */

    function resize() {
      const bounds = root.getBoundingClientRect();
      const nextW = Math.max(1, Math.round(bounds.width));
      const nextH = Math.max(1, Math.round(bounds.height));
      if (nextW === cssW && nextH === cssH) return;

      cssW = nextW;
      cssH = nextH;

      const dpr = window.devicePixelRatio || 1;
      /* Lines must stay crisp, so they get real device pixels up to a cap.
         The trail buffer is soft by nature and renders below 1:1, then
         upscales - cheaper and visually indistinguishable. */
      linePix = Math.min(dpr, 1.75);
      silkPix = Math.min(1.15, SILK_DETAIL * Math.min(dpr, 1.5));

      lines.width = Math.round(cssW * linePix);
      lines.height = Math.round(cssH * linePix);
      silk.width = Math.round(cssW * silkPix);
      silk.height = Math.round(cssH * silkPix);

      cols = Math.max(1, Math.ceil(cssW / CELL));
      rows = Math.max(1, Math.ceil(cssH / CELL));
      gw = cols + 1;
      gh = rows + 1;
      field = new Float32Array(gw * gh);

      measureQuietZone();
      mask = buildMask();
      buildParticles();
      renderStill(reduced.matches ? 150 : 26);
    }

    /* ----------------------------- events ----------------------------- */

    const onPointerMove = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      if (bounds.width < 1 || bounds.height < 1) return;
      const nx = (event.clientX - bounds.left) / bounds.width;
      const ny = (event.clientY - bounds.top) / bounds.height;
      if (nx < -0.15 || nx > 1.15 || ny < -0.15 || ny > 1.15) {
        pointer.live = false;
        return;
      }
      pointer.tx = Math.max(0, Math.min(1, nx));
      pointer.ty = Math.max(0, Math.min(1, ny));
      pointer.live = true;
    };

    const releasePointer = () => {
      pointer.live = false;
      pointer.tx = 0.5;
      pointer.ty = 0.42;
    };

    const onScrollEvent = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      window.requestAnimationFrame(() => {
        scrollQueued = false;
        const bounds = root.getBoundingClientRect();
        progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height)));
      });
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const onMotionChange = () => {
      stop();
      if (reduced.matches) renderStill(150);
      else start();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(root);

    const gate = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        if (onScreen) start();
        else stop();
      },
      { threshold: 0 },
    );
    gate.observe(root);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", releasePointer, { passive: true });
    window.addEventListener("blur", releasePointer);
    window.addEventListener("scroll", onScrollEvent, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onMotionChange);

    resize();
    onScrollEvent();
    start();

    return () => {
      stop();
      observer.disconnect();
      gate.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", releasePointer);
      window.removeEventListener("blur", releasePointer);
      window.removeEventListener("scroll", onScrollEvent);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div className="qf-strata" ref={rootRef} aria-hidden="true">
      <canvas className="qf-strata-silk" ref={silkRef} />
      <canvas className="qf-strata-lines" ref={linesRef} />
      <span className="qf-strata-veil" />
    </div>
  );
}
