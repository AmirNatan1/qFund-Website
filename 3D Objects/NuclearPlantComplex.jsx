/**
 * NuclearPlantComplex.jsx
 * ---------------------------------------------------------------------------
 * A procedurally-modelled, hyper-detailed nuclear power plant complex.
 *
 *   npm i three @react-three/fiber @react-three/drei @react-three/postprocessing
 *
 *   import NuclearPlantComplex from './NuclearPlantComplex';
 *   <NuclearPlantComplex />            // fills its parent (position: relative)
 *
 * Everything is generated in code: no external textures, no GLTF, no HDRI
 * dependency (the drei Environment is optional and fails soft).
 *
 * Structure
 *   · Texture + material library   — procedural canvas maps, shared THREE mats
 *   · Instancing helpers           — barBetween() / <Instances/>
 *   · CoolingTower + SteamPlume
 *   · ReactorBuilding
 *   · TurbineHall
 *   · Switchyard (pylons, transformers, insulators, catenary lines)
 *   · PipeNetwork (racks, tube runs, glowing coolant flow)
 *   · CoolingPond, Terrain
 *   · Scene + <NuclearPlantComplex/>
 * ---------------------------------------------------------------------------
 */

import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  Suspense,
} from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useActiveFrame as useFrame } from './SceneActivity.jsx';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

/* ===========================================================================
   0 · Palette + deterministic randomness
   =========================================================================== */

const C = {
  concrete: '#b9bdc0',
  concreteDark: '#8d9297',
  concreteStain: '#9aa0a4',
  pad: '#6a7077',
  gravel: '#4c525a',
  ground: '#070c0f',
  gunmetal: '#39404a',
  steel: '#616a75',
  steelPale: '#8e98a4',
  rust: '#7d4a33',
  glass: '#14283c',
  copper: '#8a6a45',
  glow: '#00c8e8',
  glowDeep: '#1e7be8',
  water: '#0d2b3a',
};

/** mulberry32 — stable pseudo-random so the plant looks identical every load */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ===========================================================================
   1 · Procedural texture maps (canvas → THREE.CanvasTexture)
   =========================================================================== */

function makeCanvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

/** Value-noise grayscale used as roughness + bump for weathered concrete. */
function makeNoiseTexture({ size = 512, octaves = 5, base = 0.62, amp = 0.38, streaks = 0, seed = 1 }) {
  const cv = makeCanvas(size);
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(size, size);
  const rand = rng(seed);

  // build octave lattices
  const layers = [];
  for (let o = 0; o < octaves; o++) {
    const n = 4 << o;
    const grid = new Float32Array(n * n);
    for (let i = 0; i < grid.length; i++) grid[i] = rand();
    layers.push({ n, grid });
  }
  const sample = (layer, x, y) => {
    const { n, grid } = layer;
    const fx = x * n, fy = y * n;
    const x0 = Math.floor(fx) % n, y0 = Math.floor(fy) % n;
    const x1 = (x0 + 1) % n, y1 = (y0 + 1) % n;
    const tx = fx - Math.floor(fx), ty = fy - Math.floor(fy);
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = grid[y0 * n + x0], b = grid[y0 * n + x1];
    const c2 = grid[y1 * n + x0], d = grid[y1 * n + x1];
    return (a + (b - a) * sx) * (1 - sy) + (c2 + (d - c2) * sx) * sy;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      let val = 0, w = 0.5, tot = 0;
      for (let o = 0; o < octaves; o++) {
        val += sample(layers[o], u, v) * w;
        tot += w;
        w *= 0.5;
      }
      val /= tot;
      if (streaks) {
        // faint vertical weathering runs
        const s = sample(layers[1], u * 6.0, v * 0.12);
        val = val * (1 - streaks) + s * streaks;
      }
      const g = Math.max(0, Math.min(255, (base + (val - 0.5) * amp) * 255));
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = g;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

/** Animated wave normal map for the cooling pond. */
function makeWaterNormal(size = 256) {
  const cv = makeCanvas(size);
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(size, size);
  const h = (x, y) => {
    const u = (x / size) * Math.PI * 2, v = (y / size) * Math.PI * 2;
    return (
      Math.sin(u * 3 + Math.cos(v * 2) * 0.8) * 0.5 +
      Math.sin(v * 5 - u * 1.4) * 0.3 +
      Math.sin(u * 9 + v * 7) * 0.14
    );
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = h(x + 1, y) - h(x - 1, y);
      const dy = h(x, y + 1) - h(x, y - 1);
      const n = new THREE.Vector3(-dx * 1.6, -dy * 1.6, 1).normalize();
      const i = (y * size + x) * 4;
      img.data[i] = (n.x * 0.5 + 0.5) * 255;
      img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

/* ===========================================================================
   2 · Shared material + geometry library (built once, lazily)
   =========================================================================== */

let _lib = null;
function lib() {
  if (_lib) return _lib;

  const concreteMap = makeNoiseTexture({ base: 0.78, amp: 0.5, streaks: 0.35, seed: 7 });
  concreteMap.repeat.set(4, 4);
  const concreteFine = makeNoiseTexture({ base: 0.74, amp: 0.42, seed: 21 });
  concreteFine.repeat.set(8, 8);
  const metalMap = makeNoiseTexture({ base: 0.55, amp: 0.55, streaks: 0.5, seed: 33 });
  metalMap.repeat.set(3, 6);
  const waterNormal = makeWaterNormal();

  const phys = (o) => new THREE.MeshPhysicalMaterial(o);
  const std = (o) => new THREE.MeshStandardMaterial(o);

  const mat = {
    /* -- concrete family -------------------------------------------------- */
    concrete: phys({
      color: C.concrete, roughness: 0.94, metalness: 0.02, clearcoat: 0.04,
      roughnessMap: concreteMap, bumpMap: concreteMap, bumpScale: 0.055,
      side: THREE.DoubleSide,
    }),
    concreteInner: std({
      color: '#5c6166', roughness: 1, metalness: 0, side: THREE.BackSide,
      roughnessMap: concreteFine,
    }),
    concreteDark: phys({
      color: C.concreteDark, roughness: 0.96, metalness: 0.02,
      roughnessMap: concreteFine, bumpMap: concreteFine, bumpScale: 0.04,
    }),
    pad: std({ color: C.pad, roughness: 0.98, metalness: 0.01, roughnessMap: concreteFine }),
    gravel: std({ color: C.gravel, roughness: 1, metalness: 0.02, roughnessMap: concreteFine, bumpMap: concreteFine, bumpScale: 0.09 }),

    /* -- metal family ------------------------------------------------------ */
    gunmetal: std({ color: C.gunmetal, roughness: 0.52, metalness: 0.78, roughnessMap: metalMap }),
    steel: std({ color: C.steel, roughness: 0.44, metalness: 0.86, roughnessMap: metalMap }),
    steelPale: std({ color: C.steelPale, roughness: 0.38, metalness: 0.72, roughnessMap: metalMap }),
    galv: std({ color: '#9aa3ad', roughness: 0.62, metalness: 0.64, roughnessMap: metalMap }),
    rust: std({ color: C.rust, roughness: 0.88, metalness: 0.35, roughnessMap: metalMap, bumpMap: metalMap, bumpScale: 0.05 }),
    copper: std({ color: C.copper, roughness: 0.45, metalness: 0.9 }),
    porcelain: phys({ color: '#c9cdd2', roughness: 0.22, metalness: 0.0, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
    cable: std({ color: '#20252c', roughness: 0.85, metalness: 0.3 }),

    /* -- glazing ----------------------------------------------------------- */
    glass: phys({
      color: C.glass, roughness: 0.08, metalness: 0.35,
      clearcoat: 1, clearcoatRoughness: 0.06,
      emissive: '#0b2434', emissiveIntensity: 0.35,
    }),

    /* -- water ------------------------------------------------------------- */
    water: phys({
      color: '#123141', roughness: 0.42, metalness: 0.0,
      transmission: 0.7, thickness: 3.0, ior: 1.33, reflectivity: 0.28,
      normalMap: waterNormal, normalScale: new THREE.Vector2(0.16, 0.16),
      clearcoat: 0,
      envMapIntensity: 0.5,
    }),

    /* -- emissive / flow --------------------------------------------------- */
    glow: new THREE.MeshBasicMaterial({ color: C.glow, toneMapped: false }),
    glowDeep: new THREE.MeshBasicMaterial({ color: C.glowDeep, toneMapped: false }),
    hazard: std({ color: '#c9762a', roughness: 0.7, metalness: 0.2 }),
  };

  const geo = {
    bar: new THREE.BoxGeometry(1, 1, 1),
    rod: new THREE.CylinderGeometry(0.5, 0.5, 1, 10),
    rodHi: new THREE.CylinderGeometry(0.5, 0.5, 1, 20),
    disc: new THREE.CylinderGeometry(0.5, 0.5, 1, 24),
    sphere: new THREE.SphereGeometry(0.5, 16, 12),
    puff: new THREE.IcosahedronGeometry(1, 2),
    cone: new THREE.ConeGeometry(0.5, 1, 16),
    ring: new THREE.TorusGeometry(1, 0.02, 8, 64),
  };

  _lib = { mat, geo, waterNormal };
  return _lib;
}

/* ===========================================================================
   3 · Instancing helpers
   =========================================================================== */

const UP = new THREE.Vector3(0, 1, 0);

/** Member spanning a→b, box/cylinder unit-geometry oriented along its own +Y. */
function barBetween(a, b, t = 0.2, t2) {
  const A = new THREE.Vector3(a[0], a[1], a[2]);
  const B = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = B.clone().sub(A);
  const len = dir.length() || 0.0001;
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
  const mid = A.add(B).multiplyScalar(0.5);
  return { p: [mid.x, mid.y, mid.z], q, s: [t, len, t2 ?? t] };
}

const _o = new THREE.Object3D();

function Instances({ geometry, material, items, cast = true, receive = true }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    items.forEach((it, i) => {
      _o.position.set(it.p[0], it.p[1], it.p[2]);
      if (it.q) _o.quaternion.copy(it.q);
      else _o.rotation.set(...(it.r || [0, 0, 0]));
      _o.scale.set(...(it.s || [1, 1, 1]));
      _o.updateMatrix();
      m.setMatrixAt(i, _o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items]);
  if (!items.length) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, items.length]}
      castShadow={cast}
      receiveShadow={receive}
    />
  );
}

/** Ring of items around Y with a callback per index. */
function radial(count, fn) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(fn((i / count) * Math.PI * 2, i));
  return out;
}

/* ===========================================================================
   4 · Cooling tower — hyperboloid shell, X-brace base, steam plume
   =========================================================================== */

const TOWER = { H: 52, rThroat: 9.8, rBase: 18.6, throatT: 0.72, lift: 7.2 };

function hyperR(y) {
  const throatY = TOWER.H * TOWER.throatT;
  const k = Math.sqrt((TOWER.rBase / TOWER.rThroat) ** 2 - 1);
  const c = throatY / k;
  const r = TOWER.rThroat * Math.sqrt(1 + ((y - throatY) / c) ** 2);
  // cornice: the top ~10% flares out, which is what makes the profile legible
  const t = Math.max(0, (y - TOWER.H * 0.9) / (TOWER.H * 0.1));
  return r * (1 + 0.09 * t * t);
}

function SteamPlume({ seed = 1, count = 18, radius = 10, rise = 68, speed = 0.05 }) {
  const { geo } = lib();
  const refs = useRef([]);
  const data = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      phase: r(),
      ox: (r() - 0.5) * radius * 1.05,
      oz: (r() - 0.5) * radius * 1.05,
      drift: (r() - 0.5) * 0.5,
      spin: (r() - 0.5) * 0.35,
      squash: 0.42 + r() * 0.3,
      size: 2.6 + r() * 2.8,
    }));
  }, [seed, count, radius]);

  const mats = useMemo(
    () =>
      data.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: '#ffffff',
            roughness: 1,
            metalness: 0,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            fog: true,
          })
      ),
    [data]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    data.forEach((d, i) => {
      const m = refs.current[i];
      if (!m) return;
      const k = (t * speed + d.phase) % 1;
      const grow = 0.35 + k * 2.15;
      m.position.set(
        d.ox * (0.4 + k * 1.5) + d.drift * k * 26,
        k * rise,
        d.oz * (0.4 + k * 1.5) + d.drift * k * 14
      );
      m.scale.set(d.size * grow, d.size * grow * d.squash, d.size * grow);
      m.rotation.y = t * d.spin + d.phase * 6;
      m.rotation.x = d.phase * 3;
      const fadeIn = Math.min(1, k / 0.12);
      const fadeOut = Math.max(0, 1 - Math.max(0, k - 0.35) / 0.65);
      mats[i].opacity = 0.24 * fadeIn * fadeOut * fadeOut;
    });
  });

  return (
    <group>
      {data.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          geometry={geo.puff}
          material={mats[i]}
          renderOrder={2}
        />
      ))}
    </group>
  );
}

function CoolingTower({ position = [0, 0, 0], seed = 1, steam = true }) {
  const { mat, geo } = lib();

  const shell = useMemo(() => {
    const pts = [];
    const rows = 44;
    for (let i = 0; i <= rows; i++) {
      const y = TOWER.lift + (TOWER.H - TOWER.lift) * (i / rows);
      pts.push(new THREE.Vector2(hyperR(y), y));
    }
    const g = new THREE.LatheGeometry(pts, 108);
    return g;
  }, []);

  const innerShell = useMemo(() => {
    const pts = [];
    const rows = 30;
    for (let i = 0; i <= rows; i++) {
      const y = TOWER.lift - 0.6 + (TOWER.H - TOWER.lift) * (i / rows);
      pts.push(new THREE.Vector2(hyperR(y) - 0.55, y));
    }
    return new THREE.LatheGeometry(pts, 72);
  }, []);

  /* X-braced ventilation colonnade at the base */
  const struts = useMemo(() => {
    const out = [];
    const n = 46;
    const rTop = hyperR(TOWER.lift);
    const rFoot = TOWER.rBase + 1.4;
    const step = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const a = i * step;
      const foot1 = [Math.cos(a) * rFoot, 0.2, Math.sin(a) * rFoot];
      const foot2 = [Math.cos(a + step) * rFoot, 0.2, Math.sin(a + step) * rFoot];
      const head1 = [Math.cos(a) * rTop, TOWER.lift, Math.sin(a) * rTop];
      const head2 = [Math.cos(a + step) * rTop, TOWER.lift, Math.sin(a + step) * rTop];
      out.push(barBetween(foot1, head2, 0.52, 0.72));
      out.push(barBetween(foot2, head1, 0.52, 0.72));
    }
    return out;
  }, []);

  /* horizontal construction lift-lines on the shell */
  const bands = useMemo(() => {
    const out = [];
    for (let i = 1; i < 13; i++) {
      const y = TOWER.lift + ((TOWER.H - TOWER.lift) * i) / 13;
      const r = hyperR(y) + 0.12;
      out.push({ p: [0, y, 0], r: [Math.PI / 2, 0, 0], s: [r, r, 1] });
    }
    return out;
  }, []);

  /* vertical maintenance ribs, staggered so the shell never reads as a plain lathe */
  const ribs = useMemo(
    () =>
      radial(30, (a) => {
        const yA = TOWER.lift + 1.2;
        const yB = TOWER.H - 1.2;
        return barBetween(
          [Math.cos(a) * (hyperR(yA) + 0.1), yA, Math.sin(a) * (hyperR(yA) + 0.1)],
          [Math.cos(a) * (hyperR(yB) + 0.1), yB, Math.sin(a) * (hyperR(yB) + 0.1)],
          0.24
        );
      }),
    []
  );

  const stair = useMemo(() => {
    const out = [];
    const a = 0.7;
    for (let i = 0; i < 26; i++) {
      const y = TOWER.lift + i * 1.7;
      const r = hyperR(y) + 0.95;
      out.push({ p: [Math.cos(a) * r, y, Math.sin(a) * r], r: [0, -a, 0], s: [1.5, 0.1, 0.5] });
    }
    return out;
  }, []);

  const rTopEdge = hyperR(TOWER.H);

  return (
    <group position={position}>
      <mesh geometry={shell} material={mat.concrete} castShadow receiveShadow />
      <mesh geometry={innerShell} material={mat.concreteInner} />

      <Instances geometry={geo.bar} material={mat.concreteDark} items={struts} />
      <Instances geometry={geo.ring} material={mat.concreteDark} items={bands} cast={false} />
      <Instances geometry={geo.bar} material={mat.concreteDark} items={ribs} />
      <Instances geometry={geo.bar} material={mat.galv} items={stair} />

      {/* foundation ring + apron */}
      <mesh position={[0, 0.35, 0]} receiveShadow castShadow material={mat.concreteDark}>
        <cylinderGeometry args={[TOWER.rBase + 2.4, TOWER.rBase + 3.0, 0.7, 72]} />
      </mesh>
      <mesh position={[0, 0.08, 0]} receiveShadow material={mat.pad}>
        <cylinderGeometry args={[TOWER.rBase + 7, TOWER.rBase + 7, 0.16, 64]} />
      </mesh>

      {/* internal fill deck, visible through the colonnade */}
      <mesh position={[0, 6.4, 0]} receiveShadow material={mat.gunmetal}>
        <cylinderGeometry args={[hyperR(TOWER.lift) - 1.2, hyperR(TOWER.lift) - 1.2, 0.5, 48]} />
      </mesh>

      {/* crown ring */}
      <mesh position={[0, TOWER.H + 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat.galv}>
        <torusGeometry args={[rTopEdge + 0.1, 0.28, 8, 96]} />
      </mesh>

      <group position={[0, TOWER.H - 1, 0]}>
        {steam && <SteamPlume seed={seed} radius={rTopEdge * 0.85} />}
      </group>

      {/* aircraft warning beacons */}
      {radial(4, (a) => a).map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * rTopEdge, TOWER.H + 0.9, Math.sin(a) * rTopEdge]}>
          <sphereGeometry args={[0.34, 10, 8]} />
          <meshBasicMaterial color="#ff5a4d" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ===========================================================================
   5 · Reactor containment building
   =========================================================================== */

function ReactorBuilding({ position = [0, 0, 0] }) {
  const { mat, geo } = lib();
  const R = 12;
  const H = 19;

  const ribs = useMemo(
    () => radial(36, (a) => ({ p: [Math.cos(a) * (R + 0.18), 1.6 + H / 2, Math.sin(a) * (R + 0.18)], r: [0, -a, 0], s: [0.9, H, 0.55] })),
    []
  );
  const buttress = useMemo(
    () => radial(12, (a) => ({ p: [Math.cos(a) * (R + 0.8), 2.6, Math.sin(a) * (R + 0.8)], r: [0, -a, 0], s: [2.2, 5.2, 1.9] })),
    []
  );
  const ladder = useMemo(() => {
    const out = [];
    for (let i = 0; i < 26; i++) out.push({ p: [R + 0.5, 2.2 + i * 0.62, 0], s: [0.6, 0.07, 0.07] });
    out.push(barBetween([R + 0.5, 2.0, -0.28], [R + 0.5, 18.4, -0.28], 0.09));
    out.push(barBetween([R + 0.5, 2.0, 0.28], [R + 0.5, 18.4, 0.28], 0.09));
    return out;
  }, []);

  const glowRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (glowRef.current) {
      glowRef.current.intensity = 22 + Math.sin(t * 1.3) * 8 + Math.sin(t * 5.7) * 3;
    }
  });

  return (
    <group position={position}>
      {/* plinth */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow material={mat.concreteDark}>
        <cylinderGeometry args={[R + 2.6, R + 3.2, 1.6, 64]} />
      </mesh>

      {/* containment cylinder */}
      <mesh position={[0, 1.6 + H / 2, 0]} castShadow receiveShadow material={mat.concrete}>
        <cylinderGeometry args={[R, R, H, 72]} />
      </mesh>

      {/* dome */}
      <mesh position={[0, 1.6 + H, 0]} castShadow receiveShadow material={mat.concrete}>
        <sphereGeometry args={[R, 72, 36, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {/* dome springing ring + lantern */}
      <mesh position={[0, 1.6 + H + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat.concreteDark}>
        <torusGeometry args={[R + 0.25, 0.55, 10, 96]} />
      </mesh>
      <mesh position={[0, 1.6 + H + R - 0.4, 0]} castShadow material={mat.steel}>
        <cylinderGeometry args={[1.5, 1.9, 2.4, 20]} />
      </mesh>

      <Instances geometry={geo.bar} material={mat.concreteDark} items={ribs} />
      <Instances geometry={geo.bar} material={mat.concreteDark} items={buttress} />
      <Instances geometry={geo.bar} material={mat.galv} items={ladder} />

      {/* equipment airlock */}
      <group position={[-R - 1.2, 6.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow material={mat.steel}>
          <cylinderGeometry args={[3.2, 3.2, 5.5, 28]} />
        </mesh>
        <mesh position={[0, -2.9, 0]} material={mat.gunmetal}>
          <cylinderGeometry args={[3.5, 3.5, 0.5, 28]} />
        </mesh>
      </group>

      {/* reactor auxiliary block */}
      <mesh position={[0, 5, -R - 6]} castShadow receiveShadow material={mat.concreteDark}>
        <boxGeometry args={[16, 10, 12]} />
      </mesh>
      <mesh position={[0, 10.4, -R - 6]} castShadow material={mat.gunmetal}>
        <boxGeometry args={[16.6, 0.8, 12.6]} />
      </mesh>

      {/* stack */}
      <mesh position={[9, 16, -R - 8]} castShadow material={mat.concrete}>
        <cylinderGeometry args={[1.1, 1.6, 30, 20]} />
      </mesh>
      <mesh position={[9, 29.5, -R - 8]} rotation={[-Math.PI / 2, 0, 0]} material={mat.hazard}>
        <torusGeometry args={[1.16, 0.14, 6, 24]} />
      </mesh>

      {/* ── reactor flow glow: cyan band at the dome springing + base ring ── */}
      <mesh position={[0, 1.6 + H - 0.7, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat.glow}>
        <torusGeometry args={[R + 0.05, 0.13, 8, 120]} />
      </mesh>
      <mesh position={[0, 2.1, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat.glow}>
        <torusGeometry args={[R + 0.45, 0.16, 8, 120]} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 4, 0]} color={C.glow} intensity={22} distance={54} decay={2} />
    </group>
  );
}

/* ===========================================================================
   6 · Turbine hall
   =========================================================================== */

function TurbineHall({ position = [0, 0, 0], L = 58, W = 24, H = 14 }) {
  const { mat, geo } = lib();

  const windows = useMemo(() => {
    const out = [];
    const cols = 22;
    const rows = [6.6, 10.4];
    for (let c = 0; c < cols; c++) {
      const x = -L / 2 + 1.9 + (c * (L - 3.8)) / (cols - 1);
      rows.forEach((y) => {
        out.push({ p: [x, y, W / 2 + 0.16], s: [1.75, 2.5, 0.22] });
        out.push({ p: [x, y, -W / 2 - 0.16], s: [1.75, 2.5, 0.22] });
      });
    }
    // gable ends
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 4; c++)
        out.push({ p: [L / 2 + 0.16, 6.6 + r * 3.8, -6 + c * 4], r: [0, Math.PI / 2, 0], s: [1.75, 2.5, 0.22] });
    return out;
  }, [L, W]);

  const fins = useMemo(() => {
    const out = [];
    const n = 40;
    for (let i = 0; i < n; i++) {
      const x = -L / 2 + (i * L) / (n - 1);
      out.push({ p: [x, H / 2, W / 2 + 0.1], s: [0.28, H, 0.3] });
      out.push({ p: [x, H / 2, -W / 2 - 0.1], s: [0.28, H, 0.3] });
    }
    return out;
  }, [L, W, H]);

  const bracket = useMemo(() => {
    const out = [];
    for (let i = 0; i < 12; i++) {
      const x = -L / 2 + 3 + (i * (L - 6)) / 11;
      out.push({ p: [x, 4.2, W / 2 + 1.5], s: [0.24, 0.24, 2.6] });
      out.push(barBetween([x, 2.4, W / 2 + 0.2], [x, 4.1, W / 2 + 2.6], 0.2));
    }
    return out;
  }, [L, W]);

  const roofKit = useMemo(() => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const x = -L / 2 + 6 + (i * (L - 12)) / 6;
      out.push({ p: [x, H + 6.6, 0], s: [2.6, 1.6, 5.6] });
    }
    return out;
  }, [L, H]);

  return (
    <group position={position}>
      {/* pad */}
      <mesh position={[0, 0.12, 0]} receiveShadow material={mat.pad}>
        <boxGeometry args={[L + 14, 0.24, W + 14]} />
      </mesh>

      {/* body */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow material={mat.gunmetal}>
        <boxGeometry args={[L, H, W]} />
      </mesh>

      {/* plinth */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow material={mat.concreteDark}>
        <boxGeometry args={[L + 1.2, 2, W + 1.2]} />
      </mesh>

      {/* barrel roof */}
      <mesh position={[0, H, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={mat.steelPale}>
        <cylinderGeometry args={[W / 2, W / 2, L, 40, 1, false, 0, Math.PI]} />
      </mesh>
      <mesh position={[0, H + 0.1, 0]} rotation={[0, 0, Math.PI / 2]} material={mat.glass}>
        <cylinderGeometry args={[W / 2 + 0.06, W / 2 + 0.06, L - 4, 40, 1, true, Math.PI * 0.42, Math.PI * 0.16]} />
      </mesh>

      <Instances geometry={geo.bar} material={mat.glass} items={windows} cast={false} />
      <Instances geometry={geo.bar} material={mat.steel} items={fins} />
      <Instances geometry={geo.bar} material={mat.steel} items={bracket} />
      <Instances geometry={geo.bar} material={mat.steelPale} items={roofKit} />

      {/* exterior pipe runs on the brackets */}
      {[
        { y: 4.4, r: 0.55, m: mat.steelPale },
        { y: 3.5, r: 0.38, m: mat.rust },
        { y: 2.7, r: 0.3, m: mat.gunmetal },
      ].map((p, i) => (
        <mesh key={i} position={[0, p.y, W / 2 + 2.2]} rotation={[0, 0, Math.PI / 2]} castShadow material={p.m}>
          <cylinderGeometry args={[p.r, p.r, L - 4, 16]} />
        </mesh>
      ))}
      {/* the pipe-run elbows dropping to grade */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (L / 2 - 2), 2.4, W / 2 + 2.2]} castShadow material={mat.steelPale}>
          <torusGeometry args={[2, 0.55, 10, 20, Math.PI / 2]} />
        </mesh>
      ))}

      {/* condenser hall annex */}
      <mesh position={[0, 4, -W / 2 - 5]} castShadow receiveShadow material={mat.steel}>
        <boxGeometry args={[L - 14, 8, 10]} />
      </mesh>
      <mesh position={[0, 8.3, -W / 2 - 5]} castShadow material={mat.gunmetal}>
        <boxGeometry args={[L - 13.4, 0.7, 10.6]} />
      </mesh>

      {/* louvre stacks */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (L / 2 - 8), H + 9, 0]} castShadow material={mat.steel}>
          <cylinderGeometry args={[1.5, 1.9, 7, 18]} />
        </mesh>
      ))}
    </group>
  );
}

/* ===========================================================================
   7 · Switchyard — pylons, transformers, insulators, catenaries
   =========================================================================== */

function latticeMembers(origin, { h = 30, baseHalf = 4.2, topHalf = 1.5, levels = 7, arms = true }) {
  const out = [];
  const [ox, oy, oz] = origin;
  const at = (lvl, sx, sz) => {
    const t = lvl / levels;
    const half = baseHalf + (topHalf - baseHalf) * t;
    return [ox + sx * half, oy + h * t, oz + sz * half];
  };
  const corners = [
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];
  // legs
  for (let l = 0; l < levels; l++) {
    corners.forEach(([sx, sz]) => out.push(barBetween(at(l, sx, sz), at(l + 1, sx, sz), 0.3)));
  }
  // horizontals + X bracing per face
  for (let l = 1; l <= levels; l++) {
    for (let c = 0; c < 4; c++) {
      const a = corners[c], b = corners[(c + 1) % 4];
      out.push(barBetween(at(l, a[0], a[1]), at(l, b[0], b[1]), 0.19));
      if (l < levels) {
        out.push(barBetween(at(l - 1, a[0], a[1]), at(l, b[0], b[1]), 0.15));
        out.push(barBetween(at(l - 1, b[0], b[1]), at(l, a[0], a[1]), 0.15));
      }
    }
  }
  if (arms) {
    // three cross-arms, each a small triangulated boom
    [0.62, 0.8, 0.96].forEach((f, i) => {
      const y = oy + h * f;
      const reach = 11 - i * 2.2;
      [-1, 1].forEach((s) => {
        out.push(barBetween([ox, y, oz], [ox + s * reach, y, oz], 0.24));
        out.push(barBetween([ox + s * reach, y, oz], [ox, y + 4.2, oz], 0.16));
        out.push(barBetween([ox + s * reach * 0.5, y, oz], [ox, y + 2.4, oz], 0.13));
      });
    });
  }
  return out;
}

function CatenaryLines({ spans, sag = 3.2, radius = 0.09 }) {
  const { mat } = lib();
  const geos = useMemo(
    () =>
      spans.map(([a, b]) => {
        const A = new THREE.Vector3(...a);
        const B = new THREE.Vector3(...b);
        const pts = [];
        for (let i = 0; i <= 12; i++) {
          const t = i / 12;
          const p = A.clone().lerp(B, t);
          p.y -= Math.sin(t * Math.PI) * sag;
          pts.push(p);
        }
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, radius, 6, false);
      }),
    [spans, sag, radius]
  );
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mat.cable} castShadow />
      ))}
    </group>
  );
}

function InsulatorStack({ position, count = 7, r = 0.5, gap = 0.42 }) {
  const { mat, geo } = lib();
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        p: [0, i * gap, 0],
        s: [r * 2 * (i % 2 ? 0.72 : 1), gap * 0.55, r * 2 * (i % 2 ? 0.72 : 1)],
      })),
    [count, r, gap]
  );
  return (
    <group position={position}>
      <Instances geometry={geo.disc} material={mat.porcelain} items={items} />
    </group>
  );
}

function Transformer({ position = [0, 0, 0], rotation = [0, 0, 0], seed = 3 }) {
  const { mat, geo } = lib();
  const fins = useMemo(() => {
    const out = [];
    for (let s of [-1, 1])
      for (let i = 0; i < 14; i++)
        out.push({ p: [-3.1 + i * 0.48, 2.4, s * 2.7], s: [0.14, 3.6, 1.5] });
    return out;
  }, []);
  const bolts = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({ p: [-3.2 + i * 0.72, 4.62, 0], s: [0.22, 0.16, 0.22] })),
    []
  );

  const arcRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed * 3.3;
    if (arcRef.current) {
      const f = Math.max(0, Math.sin(t * 6.1) * Math.sin(t * 17.3) * Math.sin(t * 2.7));
      arcRef.current.scale.setScalar(0.35 + f * 1.5);
      arcRef.current.material.opacity = 0.15 + f * 0.85;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.25, 0]} receiveShadow material={mat.concreteDark}>
        <boxGeometry args={[10, 0.5, 8]} />
      </mesh>
      {/* main tank */}
      <mesh position={[0, 2.6, 0]} castShadow receiveShadow material={mat.steel}>
        <boxGeometry args={[7.4, 4.4, 4.6]} />
      </mesh>
      {/* conservator */}
      <mesh position={[0, 5.4, -1.6]} rotation={[0, 0, Math.PI / 2]} castShadow material={mat.rust}>
        <cylinderGeometry args={[0.95, 0.95, 6.2, 20]} />
      </mesh>
      <Instances geometry={geo.bar} material={mat.galv} items={fins} />
      <Instances geometry={geo.bar} material={mat.gunmetal} items={bolts} />

      {/* HV bushings */}
      {[-2.1, 0, 2.1].map((x, i) => (
        <group key={i} position={[x, 4.8, 1.1]}>
          <mesh castShadow material={mat.porcelain}>
            <coneGeometry args={[0.7, 1.2, 16]} />
          </mesh>
          <InsulatorStack position={[0, 0.8, 0]} count={6} r={0.42} gap={0.36} />
          <mesh position={[0, 3.1, 0]} material={mat.copper}>
            <cylinderGeometry args={[0.16, 0.16, 0.6, 10]} />
          </mesh>
        </group>
      ))}

      {/* LV bushings */}
      {[-1.4, 1.4].map((x, i) => (
        <group key={i} position={[x, 4.8, -1.9]}>
          <InsulatorStack position={[0, 0, 0]} count={4} r={0.34} gap={0.3} />
        </group>
      ))}

      {/* electrical arc / flow indicator */}
      <mesh ref={arcRef} position={[0, 6.9, 1.1]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshBasicMaterial color={C.glow} transparent opacity={0.6} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Switchyard({ position = [0, 0, 0] }) {
  const { mat, geo } = lib();

  const pylons = useMemo(() => {
    const out = [];
    [[-14, 0, -16], [-14, 0, 14], [16, 0, -2]].forEach((o, i) =>
      out.push(...latticeMembers(o, { h: 30 - i * 2, baseHalf: 4.2, topHalf: 1.4, levels: 7 }))
    );
    return out;
  }, []);

  /* gantry structure carrying the busbars */
  const gantry = useMemo(() => {
    const out = [];
    for (let i = 0; i < 6; i++) {
      const x = -20 + i * 8.4;
      out.push(barBetween([x, 0, -6.5], [x, 9.5, -6.5], 0.34));
      out.push(barBetween([x, 0, 6.5], [x, 9.5, 6.5], 0.34));
      out.push(barBetween([x, 9.5, -6.5], [x, 9.5, 6.5], 0.28));
      out.push(barBetween([x, 7.4, -6.5], [x, 9.4, 0], 0.16));
      out.push(barBetween([x, 7.4, 6.5], [x, 9.4, 0], 0.16));
    }
    return out;
  }, []);

  /* current transformers + disconnect posts scattered across the yard */
  const posts = useMemo(() => {
    const r = rng(11);
    const out = [];
    for (let i = 0; i < 22; i++) {
      const x = -22 + (i % 11) * 4.4;
      const z = i < 11 ? -3.2 : 3.6;
      out.push({ p: [x, 1.4 + r() * 0.4, z], s: [0.55, 2.8, 0.55] });
    }
    return out;
  }, []);

  const busbars = useMemo(() => {
    const out = [];
    [-4.6, 0, 4.6].forEach((z) => out.push({ p: [-1, 9.9, z], r: [0, 0, Math.PI / 2], s: [0.24, 44, 0.24] }));
    return out;
  }, []);

  const fence = useMemo(() => {
    const out = [];
    const w = 30, d = 24;
    for (let i = 0; i < 34; i++) {
      const t = i / 34;
      const a = t * Math.PI * 2;
      const x = Math.cos(a) * w, z = Math.sin(a) * d;
      out.push({ p: [x, 1.5, z], s: [0.16, 3, 0.16] });
    }
    return out;
  }, []);

  const spans = useMemo(
    () => [
      [[-14, 26, -16], [-14, 26, 14]],
      [[-14, 22.5, -16], [-14, 22.5, 14]],
      [[-14, 24, 14], [16, 22, -2]],
      [[-14, 21, -16], [16, 19, -2]],
      [[16, 24, -2], [64, 30, -30]],
      [[16, 20.5, -2], [64, 26, -30]],
      [[-14, 26, -16], [-40, 30, -64]],
    ],
    []
  );

  const pulseRef = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    pulseRef.current.forEach((m, i) => {
      if (!m) return;
      const k = (t * 0.42 + i * 0.31) % 1;
      m.position.x = -23 + k * 44;
      m.material.opacity = Math.sin(k * Math.PI) * 0.95;
    });
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} receiveShadow material={mat.gravel}>
        <boxGeometry args={[66, 0.2, 54]} />
      </mesh>

      <Instances geometry={geo.bar} material={mat.galv} items={pylons} />
      <Instances geometry={geo.bar} material={mat.galv} items={gantry} />
      <Instances geometry={geo.bar} material={mat.steel} items={posts} />
      <Instances geometry={geo.rod} material={mat.copper} items={busbars} cast={false} />
      <Instances geometry={geo.bar} material={mat.gunmetal} items={fence} cast={false} />

      {/* insulator stacks on the disconnect posts */}
      {Array.from({ length: 11 }, (_, i) => (
        <React.Fragment key={i}>
          <InsulatorStack position={[-22 + i * 4.4, 2.9, -3.2]} count={6} r={0.46} />
          <InsulatorStack position={[-22 + i * 4.4, 2.9, 3.6]} count={6} r={0.46} />
        </React.Fragment>
      ))}

      <Transformer position={[-20, 0, -17]} seed={1} />
      <Transformer position={[-6, 0, -17]} seed={2} />
      <Transformer position={[8, 0, -17]} seed={3} />
      <Transformer position={[-13, 0, 16]} rotation={[0, Math.PI, 0]} seed={4} />

      {/* control building */}
      <mesh position={[22, 3, 16]} castShadow receiveShadow material={mat.concreteDark}>
        <boxGeometry args={[14, 6, 10]} />
      </mesh>
      <mesh position={[22, 6.4, 16]} castShadow material={mat.gunmetal}>
        <boxGeometry args={[14.6, 0.8, 10.6]} />
      </mesh>

      <CatenaryLines spans={spans} />

      {/* travelling charge pulses along the busbars */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => (pulseRef.current[i] = el)} position={[0, 9.9, -4.6 + i * 4.6]}>
          <sphereGeometry args={[0.42, 12, 10]} />
          <meshBasicMaterial color={C.glow} transparent opacity={0.9} toneMapped={false} />
        </mesh>
      ))}
      <pointLight position={[0, 12, 0]} color={C.glow} intensity={14} distance={46} decay={2} />
    </group>
  );
}

/* ===========================================================================
   8 · Pipe network — racks, big tube runs, glowing coolant flow
   =========================================================================== */

function PipeRun({ points, radius = 1.0, material, glow = false, segments = 90 }) {
  const { mat } = lib();
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.35),
    [points]
  );
  const geoMain = useMemo(() => new THREE.TubeGeometry(curve, segments, radius, 18, false), [curve, radius, segments]);
  const geoGlow = useMemo(
    () => (glow ? new THREE.TubeGeometry(curve, segments, radius * 0.24, 8, false) : null),
    [curve, radius, glow, segments]
  );

  const glowRef = useRef();
  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const t = clock.elapsedTime;
    const f = 0.55 + 0.45 * Math.sin(t * 1.9) * Math.sin(t * 0.7 + 1.2);
    glowRef.current.material.opacity = 0.45 + f * 0.55;
  });

  return (
    <group>
      <mesh geometry={geoMain} material={material || mat.steelPale} castShadow receiveShadow />
      {glow && (
        <mesh
          ref={glowRef}
          geometry={geoGlow}
          position={[0, radius * 0.92, 0]}
        >
          <meshBasicMaterial color={C.glow} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function PipeRack({ from, to, height = 6, bays = 10 }) {
  const { mat, geo } = lib();
  const items = useMemo(() => {
    const A = new THREE.Vector3(...from);
    const B = new THREE.Vector3(...to);
    const dir = B.clone().sub(A).normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(2.4);
    const out = [];
    for (let i = 0; i <= bays; i++) {
      const p = A.clone().lerp(B, i / bays);
      const l = p.clone().sub(perp), r = p.clone().add(perp);
      out.push(barBetween([l.x, 0, l.z], [l.x, height, l.z], 0.42));
      out.push(barBetween([r.x, 0, r.z], [r.x, height, r.z], 0.42));
      out.push(barBetween([l.x, height, l.z], [r.x, height, r.z], 0.34));
      if (i < bays) {
        const q = A.clone().lerp(B, (i + 1) / bays);
        const l2 = q.clone().sub(perp), r2 = q.clone().add(perp);
        out.push(barBetween([l.x, height - 0.4, l.z], [l2.x, height - 2.6, l2.z], 0.16));
        out.push(barBetween([r.x, height - 2.6, r.z], [r2.x, height - 0.4, r2.z], 0.16));
        out.push(barBetween([l.x, height - 0.2, l.z], [l2.x, height - 0.2, l2.z], 0.2));
        out.push(barBetween([r.x, height - 0.2, r.z], [r2.x, height - 0.2, r2.z], 0.2));
      }
    }
    return out;
  }, [from, to, height, bays]);
  return <Instances geometry={geo.bar} material={mat.steel} items={items} />;
}

function PipeNetwork() {
  const { mat } = lib();
  return (
    <group>
      {/* reactor → turbine hall main steam lines */}
      <PipeRack from={[8, 0, 14]} to={[8, 0, 40]} height={7} bays={5} />
      <PipeRun
        points={[
          [4, 7.6, 12],
          [4, 7.6, 26],
          [4, 7.6, 40],
          [4, 7.6, 48],
        ]}
        radius={1.15}
        material={mat.steelPale}
        glow
      />
      <PipeRun
        points={[
          [11.5, 7.0, 12],
          [11.5, 7.0, 30],
          [11.5, 7.0, 48],
        ]}
        radius={0.85}
        material={mat.rust}
      />

      {/* turbine hall → cooling towers circulating water */}
      <PipeRack from={[-16, 0, 34]} to={[-46, 0, 30]} height={6} bays={8} />
      <PipeRun
        points={[
          [-16, 6.6, 33],
          [-30, 6.6, 32],
          [-44, 6.6, 30],
          [-52, 5.0, 30],
          [-52, 2.0, 30],
        ]}
        radius={1.35}
        material={mat.steelPale}
        glow
      />
      <PipeRun
        points={[
          [-16, 6.6, 36],
          [-30, 6.6, 35],
          [-46, 6.0, 22],
          [-52, 4.0, 4],
          [-52, 2.0, -12],
        ]}
        radius={1.1}
        material={mat.gunmetal}
      />

      {/* pond intake */}
      <PipeRack from={[-30, 0, 52]} to={[-24, 0, 66]} height={5} bays={4} />
      <PipeRun
        points={[
          [-30, 5.6, 46],
          [-29, 5.6, 56],
          [-25, 4.6, 66],
          [-22, 1.6, 72],
        ]}
        radius={1.0}
        material={mat.steelPale}
        glow
      />
    </group>
  );
}

/* ===========================================================================
   9 · Cooling pond + terrain
   =========================================================================== */

function CoolingPond({ position = [0, 0, 0], radius = 30 }) {
  const { mat, geo, waterNormal } = lib();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    waterNormal.offset.set(t * 0.012, t * 0.008);
  });

  const bollards = useMemo(
    () =>
      radial(28, (a) => ({
        p: [Math.cos(a) * (radius + 1.6), 0.75, Math.sin(a) * (radius + 1.6)],
        s: [0.34, 1.5, 0.34],
      })),
    [radius]
  );

  return (
    <group position={position}>
      {/* basin bed */}
      <mesh position={[0, -1.4, 0]} receiveShadow material={mat.concreteDark}>
        <cylinderGeometry args={[radius + 0.4, radius - 1.6, 3, 96]} />
      </mesh>
      {/* water surface */}
      <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={mat.water}>
        <circleGeometry args={[radius, 128]} />
      </mesh>
      {/* concrete edging */}
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat.concrete}>
        <torusGeometry args={[radius + 0.9, 0.95, 10, 128]} />
      </mesh>
      <Instances geometry={geo.bar} material={mat.galv} items={bollards} />

      {/* intake structure */}
      <group position={[radius * 0.55, 0, -radius * 0.62]}>
        <mesh position={[0, 2, 0]} castShadow receiveShadow material={mat.concreteDark}>
          <boxGeometry args={[12, 4, 8]} />
        </mesh>
        <mesh position={[0, 4.4, 0]} castShadow material={mat.gunmetal}>
          <boxGeometry args={[12.6, 0.8, 8.6]} />
        </mesh>
        {[-3.6, -1.2, 1.2, 3.6].map((x) => (
          <mesh key={x} position={[x, 1.8, 4.2]} material={mat.steel}>
            <boxGeometry args={[1.8, 2.6, 0.3]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Terrain() {
  const { mat, geo } = lib();
  const roads = useMemo(
    () => [
      { p: [0, 0.06, 56], s: [150, 0.12, 7] },
      { p: [34, 0.06, 22], s: [7, 0.12, 76] },
      { p: [-26, 0.06, 6], s: [7, 0.12, 100] },
    ],
    []
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[420, 96]} />
        <meshStandardMaterial color={C.ground} roughness={1} metalness={0} />
      </mesh>
      <Instances geometry={geo.bar} material={mat.gravel} items={roads} cast={false} />
    </group>
  );
}

/* ===========================================================================
   10 · Composition + scene
   =========================================================================== */

export function PlantComplex({ rotationSpeed = 0.08, steam = true }) {
  const spin = useRef();
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * rotationSpeed;
  });
  return (
    <group ref={spin}>
      {/* recentre the site over the turntable axis */}
      <group position={[-6, 0, -26]}>
        <Terrain />
        <CoolingTower position={[-54, 0, -14]} seed={5} steam={steam} />
        <CoolingTower position={[-54, 0, 32]} seed={19} steam={steam} />
        <ReactorBuilding position={[8, 0, 0]} />
        <TurbineHall position={[6, 0, 46]} />
        <Switchyard position={[64, 0, 16]} />
        <PipeNetwork />
        <CoolingPond position={[-14, 0, 78]} radius={30} />

        {/* auxiliary blocks + tank farm to round out the site */}
        <mesh position={[44, 4, 54]} castShadow receiveShadow material={lib().mat.concreteDark}>
          <boxGeometry args={[18, 8, 14]} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[40 + i * 11, 0, -28]}>
            <mesh position={[0, 4.5, 0]} castShadow receiveShadow material={lib().mat.steelPale}>
              <cylinderGeometry args={[4.2, 4.2, 9, 32]} />
            </mesh>
            <mesh position={[0, 9.4, 0]} castShadow material={lib().mat.steelPale}>
              <sphereGeometry args={[4.2, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            </mesh>
            <mesh position={[0, 0.3, 0]} receiveShadow material={lib().mat.concreteDark}>
              <cylinderGeometry args={[5.4, 5.8, 0.6, 32]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/** drei's Environment pulls an HDRI over the network — never let that kill the app. */
class SoftFail extends React.Component {
  constructor(p) {
    super(p);
    this.state = { dead: false };
  }
  static getDerivedStateFromError() {
    return { dead: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.dead ? null : this.props.children;
  }
}

function GradientSky({ top = '#102638', bottom = '#03070b' }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          top: { value: new THREE.Color(top) },
          bottom: { value: new THREE.Color(bottom) },
        },
        vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `
          uniform vec3 top; uniform vec3 bottom; varying vec3 vP;
          void main(){
            float h = clamp(normalize(vP).y * 0.5 + 0.5, 0.0, 1.0);
            vec3 c = mix(bottom, top, pow(h, 0.75));
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    [top, bottom]
  );
  return (
    <mesh material={mat} scale={950} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 24]} />
    </mesh>
  );
}

/** IBL is a nice-to-have: mount it only once the plant has painted a frame. */
function LazyEnvironment({ preset }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 350);
    return () => clearTimeout(t);
  }, []);
  if (!preset || !on) return null;
  return (
    <SoftFail>
      <Suspense fallback={null}>
        <Environment preset={preset} />
      </Suspense>
    </SoftFail>
  );
}

function Scene({
  rotationSpeed,
  steam,
  bloomIntensity,
  environmentPreset,
  backgroundTop,
  backgroundBottom,
  fogColor,
}) {
  const sun = useRef();
  useLayoutEffect(() => {
    const l = sun.current;
    if (!l) return;
    l.shadow.mapSize.set(1024, 1024);
    const c = l.shadow.camera;
    c.left = -150; c.right = 150; c.top = 150; c.bottom = -150;
    c.near = 1; c.far = 460;
    c.updateProjectionMatrix();
    l.shadow.bias = -0.0006;
    l.shadow.normalBias = 0.5;
  }, []);

  return (
    <>
      <GradientSky top={backgroundTop} bottom={backgroundBottom} />
      <fog attach="fog" args={[fogColor, 220, 600]} />

      <hemisphereLight args={['#8fb6cc', '#020407', 0.82]} />
      <directionalLight
        ref={sun}
        castShadow
        position={[120, 155, 80]}
        intensity={2.15}
        color="#e4f3ff"
      />
      <directionalLight position={[-90, 60, -120]} intensity={0.55} color="#8fb6ff" />

      <LazyEnvironment preset={environmentPreset} />

      <PlantComplex rotationSpeed={rotationSpeed} steam={steam} />

      <ContactShadows
        position={[0, 0.02, 0]}
        scale={340}
        resolution={512}
        blur={3.4}
        opacity={0.28}
        far={40}
        frames={1}
      />

    </>
  );
}

/* ===========================================================================
   11 · Public component
   =========================================================================== */

export default function NuclearPlantComplex({
  rotationSpeed = 0.08,
  steam = true,
  bloomIntensity = 1.0,
  environmentPreset = 'city',
  backgroundTop = '#04090c',
  backgroundBottom = '#04090c',
  fogColor = '#04090c',
  frameloop = 'always',
  className,
  style,
}) {
  return (
    <div
      className={className}
      style={{ position: 'absolute', inset: 0, background: backgroundBottom, ...style }}
    >
      <Canvas
        dpr={0.8}
        frameloop={frameloop}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [206, 108, 226], fov: 26, near: 1, far: 2200 }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.02;
          scene.matrixAutoUpdate = true;
        }}
      >
        <Suspense fallback={null}>
          <Scene
            rotationSpeed={rotationSpeed}
            steam={steam}
            bloomIntensity={bloomIntensity}
            environmentPreset={environmentPreset}
            backgroundTop={backgroundTop}
            backgroundBottom={backgroundBottom}
            fogColor={fogColor}
          />
        </Suspense>
        <OrbitControls
          makeDefault
          target={[0, 15, 0]}
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.06}
          minDistance={95}
          maxDistance={620}
          maxPolarAngle={Math.PI / 2 - 0.035}
        />
      </Canvas>
    </div>
  );
}

export { CoolingTower, ReactorBuilding, TurbineHall, Switchyard, PipeNetwork, CoolingPond, Scene };
