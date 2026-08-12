/**
 * ORBITAL RELAY PLATFORM — procedural hyper-detailed satellite
 * ---------------------------------------------------------------------------
 * Single-file React Three Fiber scene. No external models, HDRIs or textures:
 * every material map is generated procedurally at runtime (crumpled MLI foil
 * normals, solar-cell grid, radiator grooves), and all lighting comes from a
 * hand-built Drei <Environment> so the component is fully self-contained.
 *
 * Stack: react · three · @react-three/fiber · @react-three/drei · @react-three/postprocessing
 *
 *   <SatelliteScene bloom={1.5} spin={0.12} stars />
 *
 * Props
 *   bloom  number   Bloom intensity (default 1.5)
 *   spin   number   Root Y-axis rotation, rad/s (default 0.12)
 *   stars  boolean  Drei starfield backdrop (default true)
 */

import * as THREE from 'three';
import React, { useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/* ═══════════════════════════════════════════════════════════════════════════
   0 · PALETTE
   ═══════════════════════════════════════════════════════════════════════════ */

const C = {
  kapton: '#b98a1c',        // thermal foil — base
  kaptonHot: '#e5bb55',     // thermal foil — sun-facing blanket segments
  kaptonDeep: '#6d4a11',    // shadowed blanket
  titanium: '#98a2ae',
  carbon: '#12161d',
  radiator: '#e2e8f1',
  cell: '#0a1b3d',
  neon: '#00c8e8',          // qFund cyan — optics + status
  neonPale: '#a8effb',
  blue: '#1e7be8',
  beacon: '#fb6a6a',
};

/* ═══════════════════════════════════════════════════════════════════════════
   1 · PROCEDURAL TEXTURES
   ═══════════════════════════════════════════════════════════════════════════ */

const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Tiling multi-octave value noise → Float32Array heightfield in [0,1]. */
function valueNoise(size, seed, octaves = [[6, 1], [12, 0.52], [24, 0.26], [48, 0.13]]) {
  const rnd = mulberry32(seed);
  const h = new Float32Array(size * size);
  let amp = 0;
  for (const [f, a] of octaves) {
    amp += a;
    const g = new Float32Array(f * f);
    for (let i = 0; i < g.length; i++) g[i] = rnd();
    const at = (x, y) => g[(y % f) * f + (x % f)];
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * f, y0 = Math.floor(fy), ty = fy - y0;
      const sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * f, x0 = Math.floor(fx), tx = fx - x0;
        const sx = tx * tx * (3 - 2 * tx);
        const top = at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx;
        const bot = at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx;
        h[y * size + x] += a * (top * (1 - sy) + bot * sy);
      }
    }
  }
  for (let i = 0; i < h.length; i++) h[i] /= amp;
  return h;
}

/** Crumpled-foil normal map (ridged noise → Sobel). */
function foilNormalTexture(size = 512, seed = 1337) {
  const n = valueNoise(size, seed);
  const h = new Float32Array(size * size);
  for (let i = 0; i < h.length; i++) {
    const r = Math.abs(n[i] * 2 - 1);          // ridged → sharp creases
    h[i] = Math.pow(1 - r, 1.7);
  }
  const data = new Uint8Array(size * size * 4);
  const S = 3.4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const l = h[y * size + ((x - 1 + size) % size)];
      const r = h[y * size + ((x + 1) % size)];
      const u = h[((y - 1 + size) % size) * size + x];
      const d = h[((y + 1) % size) * size + x];
      let nx = (l - r) * S, ny = (u - d) * S, nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len; ny /= len; nz /= len;
      data[i * 4] = (nx * 0.5 + 0.5) * 255;
      data[i * 4 + 1] = (ny * 0.5 + 0.5) * 255;
      data[i * 4 + 2] = (nz * 0.5 + 0.5) * 255;
      data[i * 4 + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/** Broad roughness break-up from the same noise field. */
function foilRoughnessTexture(size = 256, seed = 99) {
  const n = valueNoise(size, seed, [[4, 1], [9, 0.5], [18, 0.25]]);
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < n.length; i++) {
    const v = 40 + n[i] * 150;
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/** Photovoltaic cell array: dark blue cells, silver busbars, interconnects. */
function solarCellTexture(cols = 22, rows = 10) {
  const S = 46, w = cols * S, h = rows * S;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.fillStyle = '#03070f'; g.fillRect(0, 0, w, h);
  const rnd = mulberry32(7);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * S + 2, py = y * S + 2, s = S - 4;
      const tint = 0.86 + rnd() * 0.28;
      const grd = g.createLinearGradient(px, py, px + s, py + s);
      grd.addColorStop(0, `rgba(${Math.round(16 * tint)},${Math.round(44 * tint)},${Math.round(104 * tint)},1)`);
      grd.addColorStop(0.55, `rgba(${Math.round(8 * tint)},${Math.round(24 * tint)},${Math.round(66 * tint)},1)`);
      grd.addColorStop(1, `rgba(${Math.round(20 * tint)},${Math.round(56 * tint)},${Math.round(126 * tint)},1)`);
      g.fillStyle = grd;
      g.fillRect(px, py, s, s);
      // busbars
      g.strokeStyle = 'rgba(196,214,238,0.30)';
      g.lineWidth = 1;
      for (let b = 1; b <= 3; b++) {
        g.beginPath();
        g.moveTo(px + (s * b) / 4, py);
        g.lineTo(px + (s * b) / 4, py + s);
        g.stroke();
      }
      // collector bar + cell edge
      g.fillStyle = 'rgba(214,228,246,0.22)';
      g.fillRect(px, py + s * 0.5 - 1, s, 2);
      g.strokeStyle = 'rgba(0,0,0,0.55)';
      g.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
    }
  }
  // panel-wide diagonal sheen
  const sh = g.createLinearGradient(0, 0, w, h);
  sh.addColorStop(0, 'rgba(120,180,255,0.06)');
  sh.addColorStop(0.5, 'rgba(0,0,0,0)');
  sh.addColorStop(1, 'rgba(120,180,255,0.05)');
  g.fillStyle = sh; g.fillRect(0, 0, w, h);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Radiator / phased-array line grid. */
function grooveTexture(lines = 40, color = 'rgba(150,170,200,0.5)') {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 256;
  const g = cv.getContext('2d');
  g.fillStyle = '#0d1119'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = color; g.lineWidth = 1;
  for (let i = 0; i < lines; i++) {
    const p = (i / lines) * 256;
    g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 256); g.stroke();
  }
  g.strokeStyle = 'rgba(0,200,232,0.16)';
  for (let i = 0; i < 8; i++) {
    const p = (i / 8) * 256;
    g.beginPath(); g.moveTo(0, p); g.lineTo(256, p); g.stroke();
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* ═══════════════════════════════════════════════════════════════════════════
   2 · MATERIAL LIBRARY  (built once, shared by every mesh)
   ═══════════════════════════════════════════════════════════════════════════ */

function useSpacecraftMaterials() {
  const mats = useMemo(() => {
    const foilN = foilNormalTexture();
    const foilR = foilRoughnessTexture();
    const cells = solarCellTexture();
    const grooves = grooveTexture();
    const array = grooveTexture(24, 'rgba(0,200,232,0.35)');
    foilN.repeat.set(2, 2); foilR.repeat.set(2, 2);

    const foil = (color, rough) => new THREE.MeshPhysicalMaterial({
      color, metalness: 0.92, roughness: rough,
      normalMap: foilN, normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: foilR,
      clearcoat: 0.35, clearcoatRoughness: 0.55,
      sheen: 0.5, sheenColor: new THREE.Color('#ffd98a'),
      envMapIntensity: 1.25,
    });

    return {
      foil: foil(C.kapton, 0.2),
      foilHot: foil(C.kaptonHot, 0.26),
      foilDeep: foil(C.kaptonDeep, 0.34),
      titanium: new THREE.MeshStandardMaterial({
        color: C.titanium, metalness: 0.86, roughness: 0.36, envMapIntensity: 1.1,
      }),
      titaniumBright: new THREE.MeshStandardMaterial({
        color: '#c7d0da', metalness: 0.95, roughness: 0.18, envMapIntensity: 1.4,
      }),
      carbon: new THREE.MeshStandardMaterial({
        color: C.carbon, metalness: 0.55, roughness: 0.46, envMapIntensity: 0.8,
      }),
      radiator: new THREE.MeshPhysicalMaterial({
        color: C.radiator, metalness: 0.2, roughness: 0.5,
        map: grooves, clearcoat: 0.45, clearcoatRoughness: 0.3,
      }),
      phased: new THREE.MeshStandardMaterial({
        color: '#1b2436', metalness: 0.7, roughness: 0.35, map: array,
      }),
      solar: new THREE.MeshPhysicalMaterial({
        map: cells, color: '#8fb4ff',
        metalness: 0.62, roughness: 0.14,
        clearcoat: 1, clearcoatRoughness: 0.06,
        iridescence: 0.55, iridescenceIOR: 1.5, iridescenceThicknessRange: [120, 460],
        envMapIntensity: 1.35,
      }),
      solarBack: new THREE.MeshStandardMaterial({
        color: '#1a1f28', metalness: 0.4, roughness: 0.62,
      }),
      grid: new THREE.MeshBasicMaterial({
        color: C.neon, wireframe: true, transparent: true, opacity: 0.1, toneMapped: false,
      }),
      dishFront: new THREE.MeshPhysicalMaterial({
        color: '#d8c284', metalness: 0.96, roughness: 0.11,
        clearcoat: 0.5, side: THREE.DoubleSide, envMapIntensity: 1.6,
      }),
      neon: new THREE.MeshBasicMaterial({ color: C.neon, toneMapped: false }),
      neonDim: new THREE.MeshBasicMaterial({ color: '#0b7a9e', toneMapped: false }),
      neonPale: new THREE.MeshBasicMaterial({ color: C.neonPale, toneMapped: false }),
      beacon: new THREE.MeshBasicMaterial({ color: C.beacon, toneMapped: false }),
      glass: new THREE.MeshPhysicalMaterial({
        color: '#050a14', metalness: 0.1, roughness: 0.05,
        clearcoat: 1, transmission: 0.25, ior: 1.6,
      }),
      textures: [foilN, foilR, cells, grooves, array],
    };
  }, []);

  useEffect(() => () => {
    Object.values(mats).forEach((m) => {
      if (Array.isArray(m)) m.forEach((t) => t.dispose && t.dispose());
      else if (m && m.dispose) m.dispose();
    });
  }, [mats]);

  return mats;
}

/* ═══════════════════════════════════════════════════════════════════════════
   3 · STRUCTURAL PRIMITIVES
   ═══════════════════════════════════════════════════════════════════════════ */

const UP = new THREE.Vector3(0, 1, 0);

/** Cylinder spanning two arbitrary points — the workhorse for trusses/struts. */
function Strut({ from, to, radius = 0.014, material, segments = 8 }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(b, a);
    const l = dir.length();
    return {
      pos: a.clone().add(b).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()),
      len: l,
    };
  }, [from[0], from[1], from[2], to[0], to[1], to[2]]);
  return (
    <mesh position={pos} quaternion={quat} material={material} castShadow>
      <cylinderGeometry args={[radius, radius, len, segments]} />
    </mesh>
  );
}

/** Deterministic surface clutter — connectors, brackets, harness boxes. */
function Greebles({ seed, count, spread, material, materialAlt }) {
  const items = useMemo(() => {
    const rnd = mulberry32(seed);
    return Array.from({ length: count }, () => {
      const kind = rnd();
      return {
        p: [
          (rnd() - 0.5) * spread[0],
          (rnd() - 0.5) * spread[1],
          (rnd() - 0.5) * spread[2],
        ],
        s: [0.03 + rnd() * 0.09, 0.02 + rnd() * 0.06, 0.03 + rnd() * 0.08],
        r: rnd() * Math.PI,
        cyl: kind > 0.68,
        alt: kind > 0.42,
      };
    });
  }, [seed, count, spread[0], spread[1], spread[2]]);

  return (
    <group>
      {items.map((it, i) => (
        <mesh
          key={i}
          position={it.p}
          rotation={[0, it.r, 0]}
          material={it.alt ? materialAlt : material}
          castShadow
        >
          {it.cyl
            ? <cylinderGeometry args={[it.s[0] * 0.6, it.s[0] * 0.6, it.s[1] * 1.6, 10]} />
            : <boxGeometry args={it.s} />}
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4 · MAIN BUS  (octagonal chassis, MLI blankets, radiators, decks)
   ═══════════════════════════════════════════════════════════════════════════ */

const BUS_R = 0.86;
const BUS_H = 1.5;

function MainBus({ m }) {
  const faces = useMemo(
    () => Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      return {
        i, a,
        p: [Math.sin(a) * (BUS_R * 0.955), 0, Math.cos(a) * (BUS_R * 0.955)],
        radiator: i === 2 || i === 6,
      };
    }),
    [],
  );

  return (
    <group>
      {/* core chassis */}
      <mesh material={m.foilDeep} castShadow receiveShadow>
        <cylinderGeometry args={[BUS_R, BUS_R, BUS_H, 8]} />
      </mesh>

      {/* MLI blanket panels / radiators, one per octagon face */}
      {faces.map((f) => (
        <group key={f.i} position={f.p} rotation={[0, f.a, 0]}>
          <mesh
            material={f.radiator ? m.radiator : f.i % 3 === 0 ? m.foilHot : m.foil}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[BUS_R * 0.74, BUS_H * 0.9, 0.05]} />
          </mesh>
          {/* blanket stand-off battens */}
          {[-0.42, 0, 0.42].map((y) => (
            <mesh key={y} position={[0, y * BUS_H, 0.04]} material={m.titanium}>
              <boxGeometry args={[BUS_R * 0.76, 0.022, 0.022]} />
            </mesh>
          ))}
          {!f.radiator && (
            <Greebles
              seed={20 + f.i}
              count={5}
              spread={[BUS_R * 0.6, BUS_H * 0.66, 0.02]}
              material={m.titanium}
              materialAlt={m.carbon}
            />
          )}
          {f.radiator && (
            <mesh position={[0, 0, 0.06]} material={m.titaniumBright}>
              <boxGeometry args={[BUS_R * 0.7, 0.018, 0.018]} />
            </mesh>
          )}
        </group>
      ))}

      {/* vertical corner rails */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * BUS_R * 0.99, 0, Math.cos(a) * BUS_R * 0.99]}
            rotation={[0, a, 0]}
            material={m.titanium}
            castShadow
          >
            <boxGeometry args={[0.055, BUS_H * 1.02, 0.055]} />
          </mesh>
        );
      })}

      {/* decks + blanket seam rings */}
      <mesh position={[0, BUS_H / 2 + 0.03, 0]} material={m.titanium} castShadow receiveShadow>
        <cylinderGeometry args={[BUS_R * 1.02, BUS_R * 1.02, 0.06, 8]} />
      </mesh>
      <mesh position={[0, -BUS_H / 2 - 0.03, 0]} material={m.carbon} castShadow receiveShadow>
        <cylinderGeometry args={[BUS_R * 1.02, BUS_R * 1.02, 0.06, 8]} />
      </mesh>
      {[-0.34, 0.34].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.titaniumBright}>
          <torusGeometry args={[BUS_R * 0.99, 0.012, 6, 8]} />
        </mesh>
      ))}

      {/* upper deck equipment cluster */}
      <group position={[0, BUS_H / 2 + 0.1, 0]}>
        <Greebles
          seed={4}
          count={14}
          spread={[BUS_R * 1.1, 0.06, BUS_R * 1.1]}
          material={m.titanium}
          materialAlt={m.foilHot}
        />
        <mesh position={[0.34, 0.05, -0.3]} material={m.carbon} castShadow>
          <boxGeometry args={[0.3, 0.14, 0.24]} />
        </mesh>
        <mesh position={[-0.36, 0.07, 0.28]} material={m.foilHot} castShadow>
          <boxGeometry args={[0.26, 0.18, 0.3]} />
        </mesh>
      </group>

      {/* propellant tank belly + nadir phased array */}
      <mesh position={[0, -BUS_H / 2 - 0.18, 0]} material={m.titaniumBright} castShadow>
        <sphereGeometry args={[0.3, 24, 16, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55]} />
      </mesh>
      <group position={[0, -BUS_H / 2 - 0.1, 0.42]} rotation={[0.14, 0, 0]}>
        <mesh material={m.phased} castShadow>
          <boxGeometry args={[0.74, 0.05, 0.5]} />
        </mesh>
        {[-0.26, 0, 0.26].map((x) => (
          <mesh key={x} position={[x, -0.035, 0]} material={m.neonDim}>
            <sphereGeometry args={[0.012, 8, 8]} />
          </mesh>
        ))}
      </group>

      {/* waveguide runs */}
      <WaveGuide m={m} />
    </group>
  );
}

function WaveGuide({ m }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.5, 0.6, 0.62),
      new THREE.Vector3(0.72, 0.22, 0.6),
      new THREE.Vector3(0.78, -0.2, 0.42),
      new THREE.Vector3(0.6, -0.6, 0.36),
    ]);
    return new THREE.TubeGeometry(curve, 28, 0.028, 8, false);
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} material={m.titaniumBright} castShadow />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   5 · SOLAR ARRAY WING  (yoke → 3 segmented panels on an inter-panel truss)
   ═══════════════════════════════════════════════════════════════════════════ */

const PANEL_L = 1.34;
const PANEL_W = 1.5;
const PANEL_GAP = 0.16;
const PANEL_X0 = 1.6;

function SolarPanelSegment({ m, index }) {
  const half = PANEL_W / 2;
  return (
    <group>
      {/* honeycomb substrate */}
      <mesh material={m.solarBack} castShadow receiveShadow>
        <boxGeometry args={[PANEL_L, 0.032, PANEL_W]} />
      </mesh>
      {/* photovoltaic face */}
      <mesh position={[0, 0.024, 0]} material={m.solar} receiveShadow>
        <boxGeometry args={[PANEL_L * 0.965, 0.012, PANEL_W * 0.965]} />
      </mesh>
      {/* fine cell-grid overlay */}
      <mesh position={[0, 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.grid}>
        <planeGeometry args={[PANEL_L * 0.96, PANEL_W * 0.96, 6, 11]} />
      </mesh>
      {/* frame rails */}
      {[[0, half], [0, -half]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.004, z]} material={m.titanium} castShadow>
          <boxGeometry args={[PANEL_L, 0.05, 0.035]} />
        </mesh>
      ))}
      {[-PANEL_L / 2, PANEL_L / 2].map((x) => (
        <mesh key={x} position={[x, 0.004, 0]} material={m.titanium} castShadow>
          <boxGeometry args={[0.035, 0.05, PANEL_W]} />
        </mesh>
      ))}
      {/* underside stiffeners + harness */}
      {[-0.42, 0, 0.42].map((z) => (
        <mesh key={z} position={[0, -0.032, z * PANEL_W]} material={m.carbon}>
          <boxGeometry args={[PANEL_L * 0.96, 0.03, 0.03]} />
        </mesh>
      ))}
      <mesh position={[0, -0.05, half * 0.82]} rotation={[0, 0, Math.PI / 2]} material={m.foilHot}>
        <cylinderGeometry args={[0.018, 0.018, PANEL_L * 0.9, 8]} />
      </mesh>
      {index === 2 && (
        <mesh position={[PANEL_L / 2 + 0.04, 0.02, half * 0.72]} material={m.beacon}>
          <sphereGeometry args={[0.026, 10, 10]} />
        </mesh>
      )}
    </group>
  );
}

function TrussBay({ m, x, halfSpan = PANEL_W / 2 - 0.1 }) {
  const g = PANEL_GAP;
  const nodes = [
    [x - g / 2, 0.05, halfSpan], [x + g / 2, 0.05, halfSpan],
    [x - g / 2, -0.05, halfSpan], [x + g / 2, -0.05, halfSpan],
    [x - g / 2, 0.05, -halfSpan], [x + g / 2, 0.05, -halfSpan],
    [x - g / 2, -0.05, -halfSpan], [x + g / 2, -0.05, -halfSpan],
  ];
  return (
    <group>
      {/* longerons */}
      <Strut from={nodes[0]} to={nodes[1]} radius={0.016} material={m.titanium} />
      <Strut from={nodes[2]} to={nodes[3]} radius={0.016} material={m.titanium} />
      <Strut from={nodes[4]} to={nodes[5]} radius={0.016} material={m.titanium} />
      <Strut from={nodes[6]} to={nodes[7]} radius={0.016} material={m.titanium} />
      {/* diagonal bracing */}
      <Strut from={nodes[0]} to={nodes[3]} radius={0.009} material={m.carbon} />
      <Strut from={nodes[4]} to={nodes[7]} radius={0.009} material={m.carbon} />
      {/* hinge line */}
      <mesh position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.titaniumBright} castShadow>
        <cylinderGeometry args={[0.038, 0.038, PANEL_W * 0.94, 12]} />
      </mesh>
      {[halfSpan * 0.5, -halfSpan * 0.5].map((z) => (
        <mesh key={z} position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]} material={m.foilHot}>
          <cylinderGeometry args={[0.055, 0.055, 0.09, 12]} />
        </mesh>
      ))}
    </group>
  );
}

/** One articulated wing. `side` = +1 / −1. Pivots about its own long axis. */
function SolarWing({ m, side, tracking }) {
  const pivot = useRef();

  useFrame(({ clock }) => {
    if (!pivot.current) return;
    // slow sun-tracking sweep — mirrored so both wings stay co-planar on the drive axis
    const sweep = tracking ? Math.sin(clock.elapsedTime * 0.17) * 0.5 : 0;
    pivot.current.rotation.x = side * sweep;
  });

  return (
    <group rotation={[0, side > 0 ? 0 : Math.PI, 0]}>
      {/* solar array drive assembly */}
      <group position={[BUS_R * 0.92, 0.28, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh material={m.titanium} castShadow>
          <cylinderGeometry args={[0.17, 0.19, 0.22, 20]} />
        </mesh>
        <mesh position={[0, 0.13, 0]} material={m.foilHot} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.08, 20]} />
        </mesh>
        <mesh position={[0, 0.18, 0]} material={m.neon}>
          <torusGeometry args={[0.1, 0.008, 6, 20]} />
        </mesh>
      </group>

      <group ref={pivot} position={[0, 0.28, 0]}>
        {/* yoke */}
        <Strut from={[1.0, 0, 0.24]} to={[PANEL_X0, 0, 0.08]} radius={0.032} material={m.titanium} />
        <Strut from={[1.0, 0, -0.24]} to={[PANEL_X0, 0, -0.08]} radius={0.032} material={m.titanium} />
        <Strut from={[PANEL_X0 - 0.02, 0, 0.3]} to={[PANEL_X0 - 0.02, 0, -0.3]} radius={0.024} material={m.titanium} />

        {[0, 1, 2].map((i) => {
          const x = PANEL_X0 + PANEL_L / 2 + i * (PANEL_L + PANEL_GAP);
          return (
            <group key={i}>
              <group position={[x, 0, 0]}>
                <SolarPanelSegment m={m} index={i} />
              </group>
              {i > 0 && <TrussBay m={m} x={x - PANEL_L / 2 - PANEL_GAP / 2} />}
            </group>
          );
        })}

        {/* root hinge + inboard cable spool */}
        <mesh position={[PANEL_X0 + 0.02, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.titaniumBright} castShadow>
          <cylinderGeometry args={[0.05, 0.05, PANEL_W * 0.9, 12]} />
        </mesh>
        <mesh position={[1.26, -0.04, 0]} material={m.foilHot} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.12, 12]} />
        </mesh>
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   6 · COMMUNICATIONS  (gimballed parabolic reflector + horns + mast)
   ═══════════════════════════════════════════════════════════════════════════ */

function DishAntenna({ m, radius = 0.92, focal = 0.72 }) {
  const gimbal = useRef();

  const reflector = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 26; i++) {
      const r = (i / 26) * radius;
      pts.push(new THREE.Vector2(r, (r * r) / (4 * focal)));
    }
    return new THREE.LatheGeometry(pts, 72);
  }, [radius, focal]);
  useEffect(() => () => reflector.dispose(), [reflector]);

  const struts = useMemo(() => {
    const rimR = radius * 0.86;
    return [0, 1, 2].map((i) => {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      return {
        from: [Math.cos(a) * rimR, (rimR * rimR) / (4 * focal), Math.sin(a) * rimR],
        to: [0, focal * 0.92, 0],
      };
    });
  }, [radius, focal]);

  // subtle scanning motion — azimuth sweep with a slower elevation nod
  useFrame(({ clock }) => {
    if (!gimbal.current) return;
    const t = clock.elapsedTime;
    gimbal.current.rotation.y = Math.sin(t * 0.34) * 0.3;
    gimbal.current.rotation.z = Math.sin(t * 0.21) * 0.13;
  });

  return (
    <group position={[0.1, -0.38, 1.3]}>
      {/* deployment boom + elbow */}
      <Strut from={[0, 0.52, -0.66]} to={[0, 0.12, 0.34]} radius={0.045} material={m.titanium} />
      <Strut from={[0, 0.52, -0.66]} to={[0, 0.1, -0.34]} radius={0.03} material={m.carbon} />
      <mesh position={[0, 0.12, 0.34]} material={m.carbon} castShadow>
        <sphereGeometry args={[0.1, 16, 12]} />
      </mesh>
      <group position={[0, 0.12, 0.42]}>
        {/* two-axis gimbal rings */}
        <mesh material={m.titaniumBright} castShadow>
          <torusGeometry args={[0.13, 0.02, 8, 24]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.titanium} castShadow>
          <torusGeometry args={[0.1, 0.018, 8, 24]} />
        </mesh>

        <group ref={gimbal}>
          {/* reflector — opens Earthwards (−Y) */}
          <group position={[0, -0.12, 0]} rotation={[Math.PI, 0, 0]}>
            <mesh geometry={reflector} material={m.dishFront} castShadow receiveShadow />
            {/* rear shell — pushed well clear of the front surface to avoid z-fighting */}
            <mesh geometry={reflector} position={[0, 0.055, 0]} scale={[1.03, 1.06, 1.03]} material={m.foilHot} />
            <mesh position={[0, (radius * radius) / (4 * focal), 0]} rotation={[Math.PI / 2, 0, 0]} material={m.titanium}>
              <torusGeometry args={[radius, 0.022, 8, 64]} />
            </mesh>
            {/* feed horn on a tripod */}
            {struts.map((s, i) => (
              <Strut key={i} from={s.from} to={s.to} radius={0.011} material={m.titaniumBright} />
            ))}
            <group position={[0, focal * 0.9, 0]}>
              <mesh material={m.titaniumBright} castShadow>
                <cylinderGeometry args={[0.09, 0.045, 0.16, 16]} />
              </mesh>
              <mesh position={[0, -0.11, 0]} material={m.neon}>
                <sphereGeometry args={[0.028, 12, 12]} />
              </mesh>
            </group>
            {/* rear support ribs */}
            {[0, 1, 2, 3].map((i) => {
              const a = (i / 4) * Math.PI * 2;
              return (
                <Strut
                  key={i}
                  from={[Math.cos(a) * radius * 0.8, (radius * 0.8) ** 2 / (4 * focal) - 0.02, Math.sin(a) * radius * 0.8]}
                  to={[0, -0.02, 0]}
                  radius={0.014}
                  material={m.carbon}
                />
              );
            })}
          </group>
        </group>
      </group>
    </group>
  );
}

function HornAntennas({ m }) {
  return (
    <group position={[-0.2, -0.1, -0.86]} rotation={[0.3, 0, 0]}>
      {[[-0.26, 0], [0.26, 0.06]].map(([x, y], i) => (
        <group key={i} position={[x, y, 0]} rotation={[-Math.PI / 2, Math.PI / 4, 0]}>
          <mesh material={m.foilHot} castShadow>
            <cylinderGeometry args={[0.15, 0.06, 0.34, 4, 1, true]} />
          </mesh>
          <mesh position={[0, -0.2, 0]} material={m.titanium} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.1, 12]} />
          </mesh>
          <mesh position={[0, 0.17, 0]} material={m.neonDim}>
            <circleGeometry args={[0.11, 4]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.14, 0.06]} material={m.carbon} castShadow>
        <boxGeometry args={[0.7, 0.16, 0.12]} />
      </mesh>
    </group>
  );
}

function SensorMast({ m }) {
  return (
    <group position={[-0.32, BUS_H / 2 + 0.06, -0.3]}>
      <mesh position={[0, 0.55, 0]} material={m.carbon} castShadow>
        <cylinderGeometry args={[0.028, 0.036, 1.1, 12]} />
      </mesh>
      {[0.28, 0.62, 0.92].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.titaniumBright}>
          <torusGeometry args={[0.042, 0.008, 6, 16]} />
        </mesh>
      ))}
      {/* magnetometer boom head */}
      <mesh position={[0, 1.14, 0]} material={m.titanium} castShadow>
        <sphereGeometry args={[0.07, 16, 12]} />
      </mesh>
      <mesh position={[0, 1.22, 0]} material={m.neon}>
        <sphereGeometry args={[0.018, 10, 10]} />
      </mesh>
      {/* star tracker + GPS patches on the deck */}
      <group position={[0.52, 0.12, 0.1]} rotation={[0.4, 0.6, 0]}>
        <mesh material={m.carbon} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.26]} />
        </mesh>
        <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]} material={m.glass}>
          <cylinderGeometry args={[0.07, 0.07, 0.03, 20]} />
        </mesh>
        <mesh position={[0, 0, 0.16]} material={m.neonDim}>
          <circleGeometry args={[0.05, 20]} />
        </mesh>
      </group>
      <mesh position={[0.86, 0.03, -0.24]} material={m.foilHot} castShadow>
        <boxGeometry args={[0.18, 0.04, 0.18]} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   7 · THRUSTERS & OPTICS
   ═══════════════════════════════════════════════════════════════════════════ */

function ThrusterBlock({ m, position, rotation, phase }) {
  const glow = useRef();
  useFrame(({ clock }) => {
    if (!glow.current) return;
    const p = 0.55 + 0.45 * Math.sin(clock.elapsedTime * 2.4 + phase);
    glow.current.scale.setScalar(0.7 + p * 0.6);
  });
  return (
    <group position={position} rotation={rotation}>
      <mesh material={m.carbon} castShadow>
        <boxGeometry args={[0.19, 0.15, 0.19]} />
      </mesh>
      <mesh position={[0, 0.09, 0]} material={m.foilHot}>
        <boxGeometry args={[0.14, 0.04, 0.14]} />
      </mesh>
      {[[0.09, -0.02, 0.05, 0, 0, -Math.PI / 2], [0.09, -0.02, -0.05, 0, 0, -Math.PI / 2], [0, -0.11, 0, 0, 0, Math.PI]].map(
        ([x, y, z, rx, ry, rz], i) => (
          <group key={i} position={[x, y, z]} rotation={[rx, ry, rz]}>
            <mesh material={m.titaniumBright} castShadow>
              <cylinderGeometry args={[0.045, 0.022, 0.07, 14, 1, true]} />
            </mesh>
            <mesh position={[0, 0.036, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.carbon}>
              <circleGeometry args={[0.043, 14]} />
            </mesh>
          </group>
        ),
      )}
      <mesh ref={glow} position={[0, 0.115, 0.06]} material={m.neon}>
        <sphereGeometry args={[0.017, 10, 10]} />
      </mesh>
    </group>
  );
}

function OpticalPayload({ m }) {
  const iris = useRef();
  useFrame(({ clock }) => {
    if (!iris.current) return;
    iris.current.material.opacity = 0.72 + 0.28 * Math.sin(clock.elapsedTime * 1.1);
  });
  return (
    <group position={[0, -BUS_H / 2 - 0.14, -0.1]}>
      {/* sunshade + baffle stack */}
      <mesh position={[0, -0.28, 0]} material={m.carbon} castShadow>
        <cylinderGeometry args={[0.34, 0.27, 0.4, 28, 1, true]} />
      </mesh>
      <mesh position={[0, -0.08, 0]} material={m.titanium} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.24, 28]} />
      </mesh>
      {[-0.02, -0.14, -0.26].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.titaniumBright}>
          <torusGeometry args={[0.29, 0.014, 8, 32]} />
        </mesh>
      ))}
      <mesh position={[0, -0.16, 0]} material={m.foilHot}>
        <cylinderGeometry args={[0.31, 0.31, 0.05, 28]} />
      </mesh>
      {/* objective lens — emissive */}
      <mesh position={[0, -0.482, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.neon}>
        <circleGeometry args={[0.23, 32]} />
      </mesh>
      <mesh
        ref={iris}
        position={[0, -0.5, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.14, 32]} />
        <meshBasicMaterial color={C.neonPale} transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <pointLight position={[0, -0.72, 0]} color={C.neon} intensity={2.2} distance={2.2} />

      {/* secondary star camera */}
      <group position={[0.42, -0.06, 0.16]} rotation={[0.2, 0, 0.1]}>
        <mesh material={m.titanium} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.3, 18]} />
        </mesh>
        <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.neonDim}>
          <circleGeometry args={[0.07, 20]} />
        </mesh>
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   8 · SATELLITE ASSEMBLY
   ═══════════════════════════════════════════════════════════════════════════ */

function Satellite({ spin = 0.12, ...props }) {
  const m = useSpacecraftMaterials();
  const root = useRef();
  const beacon = useRef();

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (root.current) {
      root.current.rotation.y += delta * spin;                 // continuous 360° sweep
      root.current.rotation.x = Math.sin(t * 0.23) * 0.055;    // orbital drift
      root.current.rotation.z = Math.sin(t * 0.17) * 0.045;
      root.current.position.y = Math.sin(t * 0.4) * 0.11;
    }
    if (beacon.current) {
      beacon.current.material.opacity = Math.max(0, Math.sin(t * 3.1)) ** 6;
    }
  });

  const corners = useMemo(
    () => [
      [1, 1], [-1, 1], [-1, -1], [1, -1],
    ].map(([sx, sz], i) => ({
      position: [sx * 0.62, -BUS_H / 2 - 0.02, sz * 0.62],
      rotation: [0, Math.atan2(sx, sz), 0],
      phase: i * 1.7,
    })),
    [],
  );

  return (
    <group ref={root} {...props}>
      <MainBus m={m} />
      <SolarWing m={m} side={1} tracking />
      <SolarWing m={m} side={-1} tracking />
      <DishAntenna m={m} />
      <HornAntennas m={m} />
      <SensorMast m={m} />
      <OpticalPayload m={m} />
      {corners.map((c, i) => (
        <ThrusterBlock key={i} m={m} position={c.position} rotation={c.rotation} phase={c.phase} />
      ))}
      {/* navigation beacon */}
      <mesh ref={beacon} position={[0.3, BUS_H / 2 + 0.2, 0.42]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color={C.beacon} transparent opacity={1} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   9 · LIGHTING RIG
   ═══════════════════════════════════════════════════════════════════════════ */

function OrbitalLighting() {
  return (
    <>
      {/* hard, unfiltered sunlight — deep terminator shadows */}
      <directionalLight
        castShadow
        position={[9, 7.5, 5]}
        intensity={5.2}
        color="#fff4e2"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
      />
      {/* earthshine fill + cyan rim */}
      <directionalLight position={[-7, -4, -5]} intensity={0.5} color="#2f6ecb" />
      <pointLight position={[-4.5, 1.5, -6]} intensity={14} distance={18} color={C.neon} />
      <ambientLight intensity={0.05} color="#24344f" />

      {/* self-contained studio env for metal reflections.
          Swap for <Environment preset="night" /> if you want the pmndrs HDRI. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#04060b']} />
        <Lightformer intensity={9} color="#fff6e6" position={[10, 6, 4]} scale={[12, 12, 1]} target={[0, 0, 0]} />
        <Lightformer intensity={1.1} color="#1e7be8" position={[-8, -3, -6]} scale={[16, 16, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={2.2} color="#00c8e8" position={[-5, 3, -8]} scale={5} target={[0, 0, 0]} />
        <Lightformer intensity={0.5} color="#8ea6c8" position={[0, -9, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[20, 20, 1]} />
      </Environment>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   10 · SCENE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SatelliteScene({
  bloom = 1.5,
  spin = 0.12,
  stars = true,
  style,
  className,
}) {
  return (
    <Canvas
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [5.6, 2.6, 9.9], fov: 34, near: 0.1, far: 400 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color('#04060b');
      }}
    >
      <OrbitalLighting />

      <Suspense fallback={null}>
        {stars && (
          <Stars radius={80} depth={50} count={2600} factor={5} saturation={0} fade speed={0.3} />
        )}
        <Satellite spin={spin} />
      </Suspense>

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        enablePan={false}
        minDistance={5}
        maxDistance={26}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI - 0.25}
      />

      <EffectComposer multisampling={4}>
        <Bloom
          intensity={bloom}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.28}
          mipmapBlur
          radius={0.72}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}

export { Satellite, SolarWing, DishAntenna, HornAntennas, SensorMast, OpticalPayload, MainBus, OrbitalLighting };
