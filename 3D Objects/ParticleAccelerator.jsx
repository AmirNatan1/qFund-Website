/**
 * ParticleAccelerator.jsx
 * ---------------------------------------------------------------------------
 * A hyper-detailed, procedurally generated particle-accelerator segment
 * (LHC-inspired) built with React Three Fiber.
 *
 * Stack: react · three · @react-three/fiber · @react-three/drei ·
 *        @react-three/postprocessing
 *
 * Structure
 *   BeamCurve ........ shared arc that every subsystem is threaded onto
 *   BeamPipe ......... chrome vacuum conduit, built in runs with glass portals
 *   MagnetAssembly ... superconducting quadrupole cryostat (body, collars,
 *                      flanges, bolt rings, ribs, valve tree, diagnostics)
 *   BellowsSection ... corrugated expansion joint between modules
 *   DiagnosticStation  instrumented box with glass portal onto the beam
 *   CryoBundle ....... parallel cryogenic / vacuum tube network + clamps
 *   SupportTruss ..... floor-mounted cradle + plinth
 *   DetectorHub ...... octagonal interaction cavity, layered plates, wire nest
 *   ParticleStream ... traveling bunches, spark cloud, pulse rings, core beam
 *   BeamLights ....... dynamic point lights riding the beam path
 *   Accelerator ...... the rotating facility group (drop this into any Canvas)
 *   ParticleAcceleratorScene ... full Canvas + environment + EffectComposer
 *
 * Default export = ParticleAcceleratorScene.
 */

import React, { useMemo, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, Grid } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

/* ═══════════════════════════════ palette ═══════════════════════════════ */

const C = {
  casing: '#16325c',      // cryostat deep blue
  casingAlt: '#e0aa22',   // service-yellow module
  gunmetal: '#2b323c',
  chrome: '#d3dde9',
  matte: '#0d1118',
  carbon: '#141a22',
  copper: '#a5673c',
  beam: '#00c8e8',        // brand cyan
  beamHot: '#c9f7ff',
  magenta: '#ff2fa0',
  violet: '#7d5cff',
  void: '#04060b',
}

/* shared materials — one instance, reused across hundreds of meshes */
const M = {
  chrome: new THREE.MeshPhysicalMaterial({ color: C.chrome, metalness: 1, roughness: 0.045, clearcoat: 1, clearcoatRoughness: 0.05 }),
  steel: new THREE.MeshStandardMaterial({ color: '#9aa8b8', metalness: 1, roughness: 0.18 }),
  gunmetal: new THREE.MeshStandardMaterial({ color: C.gunmetal, metalness: 0.9, roughness: 0.34 }),
  matte: new THREE.MeshStandardMaterial({ color: C.matte, metalness: 0.2, roughness: 0.85 }),
  carbon: new THREE.MeshStandardMaterial({ color: C.carbon, metalness: 0.35, roughness: 0.7 }),
  copper: new THREE.MeshStandardMaterial({ color: C.copper, metalness: 1, roughness: 0.28 }),
  yellow: new THREE.MeshStandardMaterial({ color: C.casingAlt, metalness: 0.7, roughness: 0.36 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: '#b9d8e4', metalness: 0, roughness: 0.06, transmission: 0.92,
    thickness: 0.4, ior: 1.42, transparent: true, opacity: 0.5, side: THREE.DoubleSide,
  }),
  led: new THREE.MeshBasicMaterial({ color: C.beamHot }),
  ledWarm: new THREE.MeshBasicMaterial({ color: C.casingAlt }),
  ledHot: new THREE.MeshBasicMaterial({ color: C.magenta }),
}

/* ═══════════════════════════ geometry helpers ══════════════════════════ */

/** Merge simple (position/normal/uv) geometries into one buffer — keeps the
 *  bolt rings and wire nests down to a single draw call each. */
function mergeGeos(geos) {
  const list = geos.map((g) => (g.index ? g.toNonIndexed() : g))
  const out = new THREE.BufferGeometry()
  const total = list.reduce((n, g) => n + g.attributes.position.count, 0)
  for (const key of ['position', 'normal', 'uv']) {
    if (!list[0].attributes[key]) continue
    const size = list[0].attributes[key].itemSize
    const arr = new Float32Array(total * size)
    let o = 0
    for (const g of list) {
      arr.set(g.attributes[key].array, o)
      o += g.attributes[key].array.length
    }
    out.setAttribute(key, new THREE.BufferAttribute(arr, size))
  }
  out.computeBoundingSphere()
  return out
}

/** Z-aligned cylinder (every module is authored along local +Z). */
function zCyl(rTop, rBot, len, seg = 32, open = false) {
  const g = new THREE.CylinderGeometry(rTop, rBot, len, seg, 1, open)
  g.rotateX(Math.PI / 2)
  return g
}

/** Ring of bolt heads around the Z axis, merged. */
function boltRing(count, ringR, boltR, h) {
  const geos = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const g = zCyl(boltR, boltR, h, 6)
    g.translate(Math.cos(a) * ringR, Math.sin(a) * ringR, 0)
    geos.push(g)
  }
  return mergeGeos(geos)
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ══════════════════════════════ beam curve ═════════════════════════════ */

const ARC_R = 26
const ARC_SPAN = 0.62

function makeBeamCurve() {
  const pts = []
  for (let i = 0; i <= 48; i++) {
    const th = THREE.MathUtils.lerp(-ARC_SPAN, ARC_SPAN, i / 48)
    pts.push(new THREE.Vector3(Math.sin(th) * ARC_R, 0, -ARC_R * (1 - Math.cos(th))))
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0)
}

const UP = new THREE.Vector3(0, 1, 0)
const FWD = new THREE.Vector3(0, 0, 1)
const _p = new THREE.Vector3()
const _t = new THREE.Vector3()
const _s = new THREE.Vector3()
const _u = new THREE.Vector3()
const _q = new THREE.Quaternion()

/** position + orientation quaternion at parameter t along the curve */
function frameAt(curve, t) {
  const pos = curve.getPointAt(THREE.MathUtils.clamp(t, 0, 1))
  const tan = curve.getTangentAt(THREE.MathUtils.clamp(t, 0, 1)).normalize()
  const quat = new THREE.Quaternion().setFromUnitVectors(FWD, tan)
  return { position: pos.toArray(), quaternion: quat, tangent: tan }
}

/** Sub-curve between two parameters — used for pipe runs and offset tubes. */
function subCurve(curve, t0, t1, steps = 24, offset = null) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const t = THREE.MathUtils.lerp(t0, t1, i / steps)
    const p = curve.getPointAt(t).clone()
    if (offset) {
      const tan = curve.getTangentAt(t).normalize()
      const side = new THREE.Vector3().crossVectors(tan, UP).normalize()
      const up = new THREE.Vector3().crossVectors(side, tan).normalize()
      p.addScaledVector(side, offset[0]).addScaledVector(up, offset[1])
    }
    pts.push(p)
  }
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0)
}

/* module layout along the arc */
const LAYOUT = [
  { t: 0.042, type: 'magnet', tone: C.casing },
  { t: 0.105, type: 'window' },
  { t: 0.165, type: 'magnet', tone: C.casing },
  { t: 0.235, type: 'station' },
  { t: 0.305, type: 'magnet', tone: C.casingAlt },
  { t: 0.368, type: 'bellows' },
  { t: 0.428, type: 'magnet', tone: C.casing },
  { t: 0.5, type: 'hub' },
  { t: 0.572, type: 'magnet', tone: C.casing },
  { t: 0.632, type: 'bellows' },
  { t: 0.695, type: 'magnet', tone: C.casingAlt },
  { t: 0.765, type: 'station' },
  { t: 0.835, type: 'magnet', tone: C.casing },
  { t: 0.895, type: 'window' },
  { t: 0.958, type: 'magnet', tone: C.casing },
]

/* opaque pipe runs — the gaps between them are glass viewing sections */
const PIPE_RUNS = [[0.0, 0.078], [0.132, 0.208], [0.262, 0.738], [0.792, 0.868], [0.922, 1.0]]
const WINDOW_TYPES = ['window', 'station']
const FLOOR_Y = -3.1

/* ══════════════════════════════ beam pipe ═════════════════════════════ */

function BeamPipe({ curve }) {
  const g = useMemo(() => ({
    runs: PIPE_RUNS.map(([a, b]) => new THREE.TubeGeometry(subCurve(curve, a, b, 40), 60, 0.3, 28, false)),
    jacket: PIPE_RUNS.map(([a, b]) => new THREE.TubeGeometry(subCurve(curve, a, b, 40), 24, 0.36, 12, false)),
    portal: zCyl(0.35, 0.35, 1.72, 28, true),
    collar: zTorusRing(0.345, 0.05),
  }), [curve])

  return (
    <group>
      {g.runs.map((geo, i) => <mesh key={i} geometry={geo} material={M.chrome} />)}
      {g.jacket.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial color="#5d6a7a" metalness={1} roughness={0.42} wireframe transparent opacity={0.22} />
        </mesh>
      ))}
      {/* glass portals bridging the pipe gaps — the beam is visible through these */}
      {LAYOUT.filter((m) => WINDOW_TYPES.indexOf(m.type) > -1).map((m, i) => {
        const f = frameAt(curve, m.t)
        return (
          <group key={i} position={f.position} quaternion={f.quaternion}>
            <mesh geometry={g.portal} material={M.glass} />
            <mesh geometry={g.collar} position={[0, 0, 0.86]} material={M.steel} />
            <mesh geometry={g.collar} position={[0, 0, -0.86]} material={M.steel} />
          </group>
        )
      })}
    </group>
  )
}

function zTorusRing(r, tube, seg = 8, rad = 28, arc = Math.PI * 2) {
  return new THREE.TorusGeometry(r, tube, seg, rad, arc)
}

/* ═══════════════════════ superconducting quadrupole ════════════════════ */

function MagnetAssembly({ length = 1.9, radius = 0.68, tone = C.casing }) {
  const g = useMemo(() => ({
    body: zCyl(radius, radius, length, 44),
    collar: zCyl(radius * 1.07, radius * 1.07, length * 0.1, 44),
    flange: zTorusRing(radius * 1.04, 0.055, 8, 44),
    bolts: boltRing(12, radius * 1.04, 0.05, 0.14),
    rib: new THREE.BoxGeometry(0.1, 0.16, length * 0.8),
    band: zCyl(radius * 1.03, radius * 1.03, 0.2, 44),
    valve: zCyl(0.1, 0.1, 0.55, 16),
    valveBody: zCyl(0.19, 0.19, 0.26, 16),
    wheel: zTorusRing(0.17, 0.038, 8, 22),
    box: new THREE.BoxGeometry(0.44, 0.32, 0.78),
    plate: new THREE.BoxGeometry(0.5, 0.05, 0.9),
    led: new THREE.BoxGeometry(0.06, 0.02, 0.34),
    conduit: zCyl(0.055, 0.055, length * 0.94, 10),
  }), [length, radius])

  const ribs = useMemo(() => [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * Math.PI * 2 + 0.26), [])
  const half = length / 2

  return (
    <group>
      <mesh geometry={g.body} castShadow receiveShadow>
        <meshPhysicalMaterial color={tone} metalness={0.85} roughness={0.3} clearcoat={0.4} clearcoatRoughness={0.35} />
      </mesh>

      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * half * 0.92]}>
          <mesh geometry={g.collar} material={M.gunmetal} />
          <mesh geometry={g.flange} material={M.steel} />
          <mesh geometry={g.bolts} material={M.gunmetal} />
        </group>
      ))}

      {ribs.map((a, i) => (
        <group key={i} rotation={[0, 0, a]}>
          <mesh geometry={g.rib} position={[0, radius * 1.04, 0]} material={M.gunmetal} />
        </group>
      ))}

      {/* hazard band + cryogenic feed conduits */}
      <mesh geometry={g.band} position={[0, 0, -half * 0.6]} material={M.yellow} />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={g.conduit} position={[s * radius * 0.82, radius * 0.78, 0]} material={M.copper} />
      ))}

      {/* top valve tree */}
      <group position={[0, radius + 0.24, half * 0.28]}>
        <mesh geometry={g.valve} rotation={[Math.PI / 2, 0, 0]} material={M.steel} />
        <mesh geometry={g.valveBody} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} material={M.gunmetal} />
        <mesh geometry={g.wheel} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.42, 0]} material={M.copper} />
      </group>

      {/* side diagnostics crate */}
      <group position={[radius + 0.2, -0.1, -half * 0.3]}>
        <mesh geometry={g.box} material={M.carbon} />
        <mesh geometry={g.plate} position={[0, 0.18, 0]} material={M.gunmetal} />
        <mesh geometry={g.led} position={[0.23, 0.04, 0]} material={M.led} />
        <mesh geometry={g.led} position={[0.23, -0.06, 0]} material={M.ledWarm} />
      </group>
    </group>
  )
}

/* ═════════════════════════════ bellows joint ═══════════════════════════ */

function BellowsSection({ rings = 16, radius = 0.38, length = 1.1 }) {
  const g = useMemo(() => ({
    ring: zTorusRing(radius, 0.055, 8, 30),
    core: zCyl(radius * 0.82, radius * 0.82, length, 24),
    flange: zCyl(radius * 1.22, radius * 1.22, 0.09, 30),
    bolts: boltRing(8, radius * 1.05, 0.04, 0.12),
  }), [radius, length])

  return (
    <group>
      <mesh geometry={g.core} material={M.gunmetal} />
      {Array.from({ length: rings }, (_, i) => (
        <mesh key={i} geometry={g.ring} material={M.steel}
          position={[0, 0, THREE.MathUtils.lerp(-length / 2 + 0.06, length / 2 - 0.06, i / (rings - 1))]} />
      ))}
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * (length / 2 + 0.05)]}>
          <mesh geometry={g.flange} material={M.steel} />
          <mesh geometry={g.bolts} material={M.gunmetal} />
        </group>
      ))}
    </group>
  )
}

/* ═══════════════════════ instrumented diagnostic station ═══════════════ */

function DiagnosticStation() {
  const g = useMemo(() => ({
    frame: new THREE.BoxGeometry(1.5, 1.5, 0.16),
    rack: new THREE.BoxGeometry(0.66, 1.1, 0.5),
    strip: new THREE.BoxGeometry(0.5, 0.035, 0.06),
    gauge: zCyl(0.16, 0.16, 0.08, 20),
    gaugeFace: zCyl(0.13, 0.13, 0.02, 20),
    arm: new THREE.BoxGeometry(0.1, 0.1, 1.1),
    hose: zTorusRing(0.34, 0.05, 6, 18, Math.PI * 1.3),
  }), [])

  return (
    <group>
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={g.frame} position={[0, 0, s * 0.46]} material={M.carbon} />
      ))}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.0, 0.05, 0]} rotation={[0, 0, s > 0 ? 0 : Math.PI]}>
          <mesh geometry={g.rack} material={M.matte} />
          {[0.34, 0.2, 0.06, -0.08].map((y, i) => (
            <mesh key={i} geometry={g.strip} position={[0.02, y, 0.26]} material={i === 0 ? M.led : i === 3 ? M.ledHot : M.ledWarm} />
          ))}
          <mesh geometry={g.gauge} position={[0.02, -0.34, 0.26]} rotation={[Math.PI / 2, 0, 0]} material={M.steel} />
          <mesh geometry={g.gaugeFace} position={[0.02, -0.34, 0.31]} rotation={[Math.PI / 2, 0, 0]} material={M.led} />
          <mesh geometry={g.arm} position={[-0.42, 0.1, 0]} material={M.gunmetal} />
          <mesh geometry={g.hose} position={[-0.5, -0.3, 0]} rotation={[0, Math.PI / 2, 0.4]} material={M.copper} />
        </group>
      ))}
    </group>
  )
}

/* ═════════════════════ cryogenic / vacuum tube network ═════════════════ */

const CRYO_LINES = [
  { off: [1.05, 0.62], r: 0.135, mat: M.chrome },
  { off: [-1.05, 0.62], r: 0.135, mat: M.chrome },
  { off: [1.18, -0.5], r: 0.1, mat: M.steel },
  { off: [-1.18, -0.5], r: 0.1, mat: M.steel },
  { off: [0, 1.02], r: 0.085, mat: M.copper },
  { off: [0.62, -0.92], r: 0.07, mat: M.gunmetal },
  { off: [-0.62, -0.92], r: 0.07, mat: M.gunmetal },
]

function CryoBundle({ curve }) {
  const tubes = useMemo(
    () => CRYO_LINES.map((l) => ({
      geo: new THREE.TubeGeometry(subCurve(curve, 0.01, 0.99, 90, l.off), 120, l.r, 14, false),
      mat: l.mat,
    })),
    [curve]
  )
  const clampGeo = useMemo(() => {
    const geos = [new THREE.BoxGeometry(2.7, 0.16, 0.18)]
    for (const l of CRYO_LINES) {
      const g = new THREE.TorusGeometry(l.r + 0.035, 0.03, 5, 16)
      g.translate(l.off[0], l.off[1], 0)
      geos.push(g)
    }
    return mergeGeos(geos)
  }, [])
  const clampTs = useMemo(() => [0.09, 0.18, 0.265, 0.36, 0.45, 0.55, 0.64, 0.73, 0.82, 0.91], [])

  return (
    <group>
      {tubes.map((t, i) => <mesh key={i} geometry={t.geo} material={t.mat} />)}
      {clampTs.map((t, i) => {
        const f = frameAt(curve, t)
        return <mesh key={i} geometry={clampGeo} position={f.position} quaternion={f.quaternion} material={M.gunmetal} />
      })}
    </group>
  )
}

/* ═══════════════════════════ structural support ════════════════════════ */

function SupportTruss({ height = 2.4, width = 2.2 }) {
  const g = useMemo(() => ({
    leg: new THREE.BoxGeometry(0.17, height, 0.17),
    cradle: new THREE.BoxGeometry(width, 0.18, 0.5),
    brace: new THREE.BoxGeometry(0.1, width * 0.95, 0.1),
    plinth: new THREE.BoxGeometry(width * 1.35, 0.26, 1.25),
    pad: new THREE.BoxGeometry(0.34, 0.1, 0.34),
    bolt: zCyl(0.05, 0.05, 0.34, 8),
  }), [height, width])

  return (
    <group position={[0, -height / 2 - 0.28, 0]}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={g.leg} position={[s * width * 0.42, 0, 0]} rotation={[0, 0, s * -0.07]} material={M.carbon} />
          <mesh geometry={g.pad} position={[s * width * 0.42, -height / 2 - 0.02, 0]} material={M.gunmetal} />
        </group>
      ))}
      <mesh geometry={g.brace} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2 + 0.34]} material={M.carbon} />
      <mesh geometry={g.brace} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2 - 0.34]} material={M.carbon} />
      <mesh geometry={g.cradle} position={[0, height / 2 + 0.05, 0]} material={M.gunmetal} />
      <mesh geometry={g.bolt} position={[0, height / 2 + 0.05, 0]} material={M.steel} />
      <mesh geometry={g.plinth} position={[0, -height / 2 - 0.18, 0]} material={M.matte} />
    </group>
  )
}

/* ══════════════════════════════ detector hub ═══════════════════════════ */

function DetectorHub({ pulseColor = C.beam }) {
  const core = useRef()
  const halo = useRef()
  const light = useRef()
  const rings = useRef()

  const g = useMemo(() => {
    const rand = mulberry32(7)
    /* dense wire-bundle nest: many short torus arcs merged into one mesh */
    const wires = []
    for (let i = 0; i < 90; i++) {
      const r = 1.46 + rand() * 0.52
      const arc = 0.5 + rand() * 1.7
      const w = new THREE.TorusGeometry(r, 0.016 + rand() * 0.014, 4, 22, arc)
      w.rotateZ(rand() * Math.PI * 2)
      w.translate(0, 0, THREE.MathUtils.lerp(-1.42, 1.42, rand()))
      wires.push(w)
    }
    /* radial detector plates */
    const plates = []
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2
      const p = new THREE.BoxGeometry(0.06, 0.62, 2.5)
      p.translate(0, 1.16, 0)
      p.rotateZ(a)
      plates.push(p)
    }
    /* endcap wedge segments */
    const caps = []
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8
      const c = new THREE.BoxGeometry(0.9, 0.34, 0.2)
      c.translate(0, 1.72, 0)
      c.rotateZ(a)
      caps.push(c)
    }
    return {
      shellOuter: zCyl(2.42, 2.42, 2.0, 8, true),
      shellMid: zCyl(2.0, 2.0, 2.5, 8, true),
      shellInner: zCyl(1.4, 1.4, 3.0, 8, true),
      ribRing: zTorusRing(2.45, 0.1, 6, 8),
      wires: mergeGeos(wires),
      plates: mergeGeos(plates),
      caps: mergeGeos(caps),
      coreShell: new THREE.SphereGeometry(0.62, 32, 24),
      haloShell: new THREE.SphereGeometry(1.2, 24, 18),
      tray: new THREE.BoxGeometry(0.5, 0.16, 3.6),
      mast: new THREE.BoxGeometry(0.16, 1.5, 0.16),
      pulseRing: zTorusRing(1.5, 0.045, 6, 40),
      panel: new THREE.BoxGeometry(1.5, 0.9, 0.1),
    }
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const beat = Math.pow((Math.sin(t * 2.1) + 1) / 2, 3)
    const s = 0.86 + beat * 0.5
    if (core.current) core.current.scale.setScalar(s)
    if (halo.current) {
      halo.current.scale.setScalar(0.95 + beat * 0.9)
      halo.current.material.opacity = 0.1 + beat * 0.42
    }
    if (light.current) light.current.intensity = 6 + beat * 46
    if (rings.current) {
      rings.current.children.forEach((r, i) => {
        const k = (t * 0.55 + i / 3) % 1
        r.position.z = THREE.MathUtils.lerp(-1.5, 1.5, k)
        r.scale.setScalar(0.7 + Math.sin(k * Math.PI) * 0.55)
        r.material.opacity = Math.sin(k * Math.PI) * 0.85
      })
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 8]}>
      <mesh geometry={g.shellOuter} material={M.carbon} castShadow />
      <mesh geometry={g.shellMid}>
        <meshPhysicalMaterial color={C.casing} metalness={0.88} roughness={0.28} clearcoat={0.5} />
      </mesh>
      <mesh geometry={g.shellInner} material={M.gunmetal} />
      {[-1, 1].map((s) => <mesh key={s} geometry={g.ribRing} position={[0, 0, s * 1.0]} material={M.steel} />)}
      {[-1, 1].map((s) => <mesh key={s} geometry={g.caps} position={[0, 0, s * 1.02]} material={M.gunmetal} />)}
      <mesh geometry={g.plates} material={M.steel} />
      <mesh geometry={g.wires} material={M.copper} />

      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, 0, (i / 4) * Math.PI * 2 + Math.PI / 8]}>
          <mesh geometry={g.tray} position={[0, 2.6, 0]} material={M.matte} />
        </group>
      ))}
      <mesh geometry={g.mast} position={[0, 3.3, 0]} material={M.carbon} />
      <mesh geometry={g.panel} position={[0, 4.0, 0]} rotation={[0, 0, -Math.PI / 8]} material={M.matte} />

      {/* collision core */}
      <mesh ref={core} geometry={g.coreShell}>
        <meshBasicMaterial color={C.beamHot} toneMapped={false} />
      </mesh>
      <mesh ref={halo} geometry={g.haloShell}>
        <meshBasicMaterial color={pulseColor} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={rings}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} geometry={g.pulseRing}>
            <meshBasicMaterial color={pulseColor} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight ref={light} color={pulseColor} distance={22} intensity={14} />
    </group>
  )
}

/* ══════════════════════════ particle stream ════════════════════════════ */

const LUT_N = 900
const _l1 = new THREE.Vector3()
const _l2 = new THREE.Vector3()

function buildLUT(curve) {
  const pos = new Float32Array(LUT_N * 3)
  const tan = new Float32Array(LUT_N * 3)
  for (let i = 0; i < LUT_N; i++) {
    const t = i / (LUT_N - 1)
    curve.getPointAt(t, _p).toArray(pos, i * 3)
    curve.getTangentAt(t, _t).normalize().toArray(tan, i * 3)
  }
  return { pos, tan }
}

function sampleLUT(lut, t, outP, outT) {
  const f = THREE.MathUtils.clamp(t, 0, 1) * (LUT_N - 1)
  const i = Math.floor(f)
  const j = Math.min(i + 1, LUT_N - 1)
  const a = f - i
  outP.fromArray(lut.pos, i * 3).lerp(_l1.fromArray(lut.pos, j * 3), a)
  if (outT) outT.fromArray(lut.tan, i * 3).lerp(_l2.fromArray(lut.tan, j * 3), a).normalize()
}

const SPARKS = 700
const BUNCHES = 10

function ParticleStream({ curve, color = C.beam, hot = C.magenta, speed = 0.42 }) {
  const lut = useMemo(() => buildLUT(curve), [curve])
  const sparks = useRef()
  const bunches = useRef()

  const seeds = useMemo(() => {
    const rand = mulberry32(19)
    const arr = new Float32Array(SPARKS * 4)
    for (let i = 0; i < SPARKS; i++) {
      arr[i * 4 + 0] = rand()                       // t offset
      arr[i * 4 + 1] = (rand() - 0.5) * 0.13        // side jitter
      arr[i * 4 + 2] = (rand() - 0.5) * 0.13        // up jitter
      arr[i * 4 + 3] = 0.75 + rand() * 1.6          // speed multiplier
    }
    return arr
  }, [])

  const sparkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3))
    return g
  }, [])

  const beamGeo = useMemo(() => new THREE.TubeGeometry(subCurve(curve, 0, 1, 120), 200, 0.075, 12, false), [curve])
  const glowGeo = useMemo(() => new THREE.TubeGeometry(subCurve(curve, 0, 1, 120), 200, 0.21, 12, false), [curve])
  const bunchGeo = useMemo(() => zCyl(0.1, 0.1, 1.0, 12), [])

  useFrame((state, dt) => {
    const time = state.clock.elapsedTime

    if (sparks.current) {
      const arr = sparks.current.geometry.attributes.position.array
      for (let i = 0; i < SPARKS; i++) {
        const t = (seeds[i * 4] + time * speed * seeds[i * 4 + 3]) % 1
        sampleLUT(lut, t, _p, _t)
        _s.crossVectors(_t, UP).normalize()
        _u.crossVectors(_s, _t).normalize()
        _p.addScaledVector(_s, seeds[i * 4 + 1]).addScaledVector(_u, seeds[i * 4 + 2])
        arr[i * 3] = _p.x; arr[i * 3 + 1] = _p.y; arr[i * 3 + 2] = _p.z
      }
      sparks.current.geometry.attributes.position.needsUpdate = true
    }

    if (bunches.current) {
      bunches.current.children.forEach((m, i) => {
        const t = (i / BUNCHES + time * speed * 1.35) % 1
        sampleLUT(lut, t, _p, _t)
        m.position.copy(_p)
        _q.setFromUnitVectors(FWD, _t)
        m.quaternion.copy(_q)
        const stretch = 2.4 + Math.sin(time * 6 + i) * 0.8
        m.scale.set(1, 1, stretch)
        m.material.opacity = 0.55 + Math.sin(time * 9 + i * 1.7) * 0.35
      })
    }
  })

  return (
    <group>
      <mesh geometry={beamGeo}>
        <meshBasicMaterial color={C.beamHot} toneMapped={false} />
      </mesh>
      <mesh geometry={glowGeo}>
        <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <points ref={sparks} geometry={sparkGeo}>
        <pointsMaterial color={color} size={0.075} sizeAttenuation transparent opacity={0.95}
          blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </points>
      <group ref={bunches}>
        {Array.from({ length: BUNCHES }, (_, i) => (
          <mesh key={i} geometry={bunchGeo}>
            <meshBasicMaterial color={i % 3 === 0 ? hot : C.beamHot} transparent opacity={0.8}
              blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ═══════════════════ dynamic lights riding the beam ════════════════════ */

function BeamLights({ curve, color = C.beam, hot = C.magenta }) {
  const lut = useMemo(() => buildLUT(curve), [curve])
  const group = useRef()

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (!group.current) return
    group.current.children.forEach((l, i) => {
      const t = (i / group.current.children.length + time * 0.14) % 1
      sampleLUT(lut, t, _p, null)
      l.position.copy(_p)
      l.intensity = 9 + Math.sin(time * 3 + i) * 4
    })
  })

  return (
    <group ref={group}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <pointLight key={i} color={i % 3 === 0 ? hot : color} distance={9} intensity={10} />
      ))}
    </group>
  )
}

/* pedestal under the detector cavity */
function HubPedestal() {
  const g = useMemo(() => ({
    slab: new THREE.BoxGeometry(6.2, 0.42, 3.6),
    block: new THREE.BoxGeometry(1.5, 0.75, 2.6),
    shoe: new THREE.BoxGeometry(1.1, 0.3, 1.9),
  }), [])
  return (
    <group>
      <mesh geometry={g.slab} position={[0, -2.86, 0]} material={M.matte} />
      {[-1.9, 1.9].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh geometry={g.block} position={[0, -2.28, 0]} material={M.carbon} />
          <mesh geometry={g.shoe} position={[0, -1.78, 0]} material={M.gunmetal} />
        </group>
      ))}
    </group>
  )
}

/* every other magnet carries a floor truss */
const $index_support = (i) => i % 2 === 0

/* ══════════════════════════ facility assembly ══════════════════════════ */

export function Accelerator({ autoRotate = true, rotationSpeed = 0.06, beamColor = C.beam, accentColor = C.magenta }) {
  const root = useRef()
  const curve = useMemo(() => makeBeamCurve(), [])
  const frames = useMemo(() => LAYOUT.map((m) => ({ ...m, f: frameAt(curve, m.t) })), [curve])
  const pipeHeight = 0

  useFrame((_, dt) => {
    if (autoRotate && root.current) root.current.rotation.y += dt * rotationSpeed
  })

  return (
    <group ref={root} position={[0, pipeHeight, 0]}>
      <BeamPipe curve={curve} />
      <CryoBundle curve={curve} />

      {frames.map((m, i) => (
        <group key={i} position={m.f.position} quaternion={m.f.quaternion}>
          {m.type === 'magnet' && <MagnetAssembly tone={m.tone} />}
          {m.type === 'bellows' && <BellowsSection />}
          {m.type === 'station' && <DiagnosticStation />}
          {m.type === 'hub' && <DetectorHub pulseColor={beamColor} />}
          {m.type === 'magnet' && $index_support(i) && <SupportTruss />}
          {m.type === 'hub' && <HubPedestal />}
        </group>
      ))}

      <ParticleStream curve={curve} color={beamColor} hot={accentColor} />
      <BeamLights curve={curve} color={beamColor} hot={accentColor} />
    </group>
  )
}

/* ════════════════════════════ studio environment ══════════════════════ */

/** Procedural laboratory-style env map (no HDRI fetch). Pass
 *  envPreset="night" to use drei's HDRI presets instead. */
function LabEnvironment() {
  return (
    <Environment resolution={256} frames={1} background={false}>
      <Lightformer intensity={3.6} color="#9fd8ff" form="rect" scale={[14, 4, 1]} position={[0, 9, -6]} rotation={[Math.PI / 2.4, 0, 0]} />
      <Lightformer intensity={2.4} color="#ffffff" form="rect" scale={[10, 2.5, 1]} position={[-9, 5, 3]} rotation={[0, Math.PI / 2.6, 0]} />
      <Lightformer intensity={2.1} color="#7fe9ff" form="rect" scale={[10, 2.5, 1]} position={[9, 5, 3]} rotation={[0, -Math.PI / 2.6, 0]} />
      <Lightformer intensity={0.9} color="#2c3a52" form="circle" scale={[16, 16, 1]} position={[0, -8, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <Lightformer intensity={1.2} color="#ff8bd0" form="rect" scale={[6, 1.6, 1]} position={[0, 2, 12]} rotation={[0, Math.PI, 0]} />
    </Environment>
  )
}

/* ══════════════════════════════ full scene ═════════════════════════════ */

export function ParticleAcceleratorScene({
  envPreset = null,           // e.g. "night" — requires drei's HDRI CDN
  autoRotate = true,
  beamColor = C.beam,
  accentColor = C.magenta,
  bloomIntensity = 2.0,
  showGrid = true,
  className,
  style,
}) {
  return (
    <Canvas
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
      camera={{ position: [12, 4.6, 16.2], fov: 44, near: 0.1, far: 260 }}
    >
      <color attach="background" args={[C.void]} />
      <fog attach="fog" args={[C.void, 26, 80]} />

      <ambientLight intensity={0.34} color="#7d93b8" />
      <directionalLight position={[14, 20, 10]} intensity={1.6} color="#cfe4ff" castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
      <directionalLight position={[-16, 9, -12]} intensity={0.8} color="#4f7cb4" />
      <directionalLight position={[0, -5, -14]} intensity={0.4} color={C.beam} />
      <spotLight position={[0, 17, 0]} angle={0.95} penumbra={1} intensity={110} distance={62} color="#a9d6ff" />

      {envPreset ? <Environment preset={envPreset} background={false} /> : <LabEnvironment />}

      <Accelerator autoRotate={autoRotate} beamColor={beamColor} accentColor={accentColor} />

      {showGrid && (
        <Grid
          position={[0, FLOOR_Y, 0]}
          args={[90, 90]}
          cellSize={0.7}
          cellThickness={0.55}
          cellColor="#121a25"
          sectionSize={3.5}
          sectionThickness={1}
          sectionColor="#0a4655"
          fadeDistance={62}
          fadeStrength={1.4}
          infiniteGrid
        />
      )}

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={9}
        maxDistance={70}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.4, 0]}
      />

      <EffectComposer disableNormalPass multisampling={2}>
        <Bloom intensity={bloomIntensity} luminanceThreshold={0.7} luminanceSmoothing={0.28} mipmapBlur radius={0.82} />
        <Vignette offset={0.28} darkness={0.82} eskil={false} />
      </EffectComposer>
    </Canvas>
  )
}

export default ParticleAcceleratorScene

/* ─────────────────────────────────────────────────────────────────────────
 * Standalone demo mount — delete this block when importing into your app.
 * Renders into #accelerator-root if present; query params override defaults:
 *   ?beam=%2300c8e8&accent=%23ff2fa0&rotate=0&bloom=2.4&grid=0
 * ──────────────────────────────────────────────────────────────────────── */
const __host = typeof document !== 'undefined' && document.getElementById('accelerator-root')
if (__host) {
  const q = new URLSearchParams(location.search)
  createRoot(__host).render(
    <ParticleAcceleratorScene
      beamColor={q.get('beam') || undefined}
      accentColor={q.get('accent') || undefined}
      autoRotate={q.get('rotate') !== '0'}
      showGrid={q.get('grid') !== '0'}
      bloomIntensity={q.get('bloom') ? Number(q.get('bloom')) : undefined}
    />
  )
}
