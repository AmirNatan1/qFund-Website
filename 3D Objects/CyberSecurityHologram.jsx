/**
 * CyberSecurityHologram.jsx
 * ---------------------------------------------------------------------------
 * A self-contained, hyper-detailed holographic "cyber security" data display.
 *
 *   Layer 1 — Core .......... faceted shield + angular padlock (brightest)
 *   Layer 2 — Data streams .. branching PCB traces, tubes, pads, data packets
 *   Layer 3 — Icons ......... globe, gear, cloud, bulb, bar chart, document
 *
 * Everything is energy, not matter: no lights, no PBR. Every surface is an
 * unlit MeshBasicMaterial (toneMapped={false}) so raw colour values punch past
 * 1.0 and get bloomed by the EffectComposer. That bloom *is* the lighting.
 *
 *   npm i three @react-three/fiber @react-three/drei @react-three/postprocessing
 *
 *   import CyberSecurityHologram from './CyberSecurityHologram'
 *   <CyberSecurityHologram />          // fills its parent (100% / 100%)
 *
 * Props: bloom, spin, showStreams, showIcons, className, style
 * ---------------------------------------------------------------------------
 */

import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useActiveFrame as useFrame } from './SceneActivity.jsx'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

/* ═══════════════════════════════════════════════════════ palette + helpers ═ */

const P = {
  void: '#04060B',
  hot: '#E8FEFF', // white-hot core highlight
  cyan: '#00C8E8', // brand hero hue
  cyanMid: '#0A93AE',
  cyanDim: '#0B5566',
  blue: '#2C6BFF', // electric-blue companion
  blueDim: '#12306E',
}

const C = {
  hot: new THREE.Color(P.hot),
  cyan: new THREE.Color(P.cyan),
  cyanDim: new THREE.Color(P.cyanDim),
  blue: new THREE.Color(P.blue),
  tube: new THREE.Color('#1E86F0'),
}

/** Deterministic PRNG so the generated network is identical every mount. */
const rng = (seed) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Unlit "hologram glass" — solid faces, never occluding sibling glow. */
const Glass = ({ color = P.cyan, opacity = 0.34, side = THREE.DoubleSide }) => (
  <meshBasicMaterial
    color={color}
    transparent
    opacity={opacity}
    side={side}
    depthWrite={false}
    toneMapped={false}
  />
)

/** Unlit additive energy — used for anything that should read as pure light. */
const Energy = ({ color = P.cyan, opacity = 1, side = THREE.FrontSide }) => (
  <meshBasicMaterial
    color={color}
    transparent
    opacity={opacity}
    side={side}
    blending={THREE.AdditiveBlending}
    depthWrite={false}
    toneMapped={false}
  />
)

/** Crisp facet outlines lifted off any geometry. */
function Wire({ geometry, color = P.hot, opacity = 0.9, angle = 1 }) {
  const g = useMemo(() => new THREE.EdgesGeometry(geometry, angle), [geometry, angle])
  return (
    <lineSegments geometry={g}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  )
}

/** Rounded/chamfered rectangle profile for extrusion. */
function roundedRect(w, h, r) {
  const s = new THREE.Shape()
  s.moveTo(-w + r, -h)
  s.lineTo(w - r, -h)
  s.lineTo(w, -h + r)
  s.lineTo(w, h - r)
  s.lineTo(w - r, h)
  s.lineTo(-w + r, h)
  s.lineTo(-w, h - r)
  s.lineTo(-w, -h + r)
  s.closePath()
  return s
}

const extrude = (shape, depth, bevel = 0.03) => {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 8,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
  })
  g.center()
  return g
}

/* ═════════════════════════════════════════════ LAYER 1 — CORE: THE SHIELD ═ */

/** Classic heraldic shield silhouette: shoulders, straight flanks, ogee point. */
function shieldShape(w = 1.06, h = 1.42) {
  const s = new THREE.Shape()
  s.moveTo(0, h)
  s.lineTo(w * 0.99, h * 0.7)
  s.lineTo(w, -h * 0.14)
  s.quadraticCurveTo(w * 0.95, -h * 0.66, 0, -h)
  s.quadraticCurveTo(-w * 0.95, -h * 0.66, -w, -h * 0.14)
  s.lineTo(-w * 0.99, h * 0.7)
  s.closePath()
  return s
}

/** Procedural scanline/data texture — no external assets. */
function scanTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')
  x.fillStyle = '#000308'
  x.fillRect(0, 0, 256, 256)
  x.strokeStyle = 'rgba(0,200,232,0.42)'
  x.lineWidth = 1
  for (let i = 0; i < 256; i += 9) {
    x.beginPath()
    x.moveTo(0, i + 0.5)
    x.lineTo(256, i + 0.5)
    x.stroke()
  }
  x.strokeStyle = 'rgba(0,200,232,0.16)'
  for (let i = 0; i < 256; i += 32) {
    x.beginPath()
    x.moveTo(i + 0.5, 0)
    x.lineTo(i + 0.5, 256)
    x.stroke()
  }
  x.fillStyle = 'rgba(232,254,255,0.5)'
  for (let i = 0; i < 90; i++) {
    x.fillRect(((i * 53) % 250) | 0, ((i * 97) % 250) | 0, 3, 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2.2, 2.2)
  return t
}

function Shield() {
  const outer = useMemo(() => extrude(shieldShape(), 0.2, 0.06), [])
  const inner = useMemo(() => extrude(shieldShape(0.84, 1.14), 0.1, 0.035), [])
  const plate = useMemo(() => new THREE.ShapeGeometry(shieldShape(0.8, 1.08), 10), [])
  const tex = useMemo(() => scanTexture(), [])
  const texRef = useRef(tex)
  const scan = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    texRef.current.offset.y = -t * 0.09
    if (scan.current) scan.current.opacity = 0.24 + Math.sin(t * 1.6) * 0.08
  })

  return (
    <group>
      {/* faceted translucent hull */}
      <mesh geometry={outer}>
        <Glass color={P.cyan} opacity={0.16} />
      </mesh>
      <Wire geometry={outer} color={P.hot} opacity={0.95} />

      {/* recessed inner escutcheon */}
      <mesh geometry={inner} position={[0, 0, 0.1]}>
        <Glass color={P.cyanMid} opacity={0.34} />
      </mesh>
      <Wire geometry={inner} color={P.cyan} opacity={0.75} />

      {/* live data surface */}
      <mesh geometry={plate} position={[0, 0, 0.17]}>
        <meshBasicMaterial
          ref={scan}
          map={tex}
          transparent
          opacity={0.26}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* centre rib + shoulder chevrons */}
      <mesh position={[0, 0.1, 0.2]}>
        <boxGeometry args={[0.02, 2.2, 0.02]} />
        <Energy color={P.hot} opacity={0.5} />
      </mesh>
      {[0.55, 0.2].map((y, i) => (
        <group key={i} position={[0, y, 0.19]}>
          <mesh position={[-0.34, 0, 0]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[0.6, 0.022, 0.02]} />
            <Energy color={P.cyan} opacity={0.7} />
          </mesh>
          <mesh position={[0.34, 0, 0]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.6, 0.022, 0.02]} />
            <Energy color={P.cyan} opacity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════ LAYER 1 — CORE: THE PADLOCK ═ */

function Padlock() {
  const body = useMemo(() => extrude(roundedRect(0.5, 0.42, 0.09), 0.34, 0.045), [])
  const face = useMemo(() => extrude(roundedRect(0.36, 0.29, 0.06), 0.06, 0.02), [])
  const group = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // (d) precise vertical levitation + a slow scan yaw
    group.current.position.y = -0.14 + Math.sin(t * 1.15) * 0.09
    group.current.rotation.y = Math.sin(t * 0.45) * 0.14
  })

  return (
    <group ref={group} renderOrder={20} position={[0, -0.14, 1.05]} scale={1.02}>
      {/* shackle: faceted half-torus + two straight legs */}
      <group position={[0, 0.46, 0]}>
        <mesh>
          <torusGeometry args={[0.27, 0.052, 6, 28, Math.PI]} />
          <Glass color={P.hot} opacity={0.5} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.27, 0.052, 6, 28, Math.PI]} />
          <meshBasicMaterial color={P.hot} wireframe transparent opacity={0.55} toneMapped={false} />
        </mesh>
        {[-0.27, 0.27].map((x) => (
          <mesh key={x} position={[x, -0.12, 0]}>
            <boxGeometry args={[0.095, 0.26, 0.095]} />
            <Glass color={P.cyan} opacity={0.45} />
          </mesh>
        ))}
      </group>

      {/* body */}
      <mesh geometry={body}>
        <Glass color={P.cyan} opacity={0.4} side={THREE.FrontSide} />
      </mesh>
      <Wire geometry={body} color={P.hot} opacity={1} />

      {/* inset faceplate */}
      <mesh geometry={face} position={[0, 0, 0.18]}>
        <Glass color={P.hot} opacity={0.22} />
      </mesh>
      <Wire geometry={face} color={P.cyan} opacity={0.9} />

      {/* keyhole */}
      <group position={[0, 0.02, 0.23]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.05, 8]} />
          <Energy color={P.hot} opacity={0.95} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.06, 0.14, 0.05]} />
          <Energy color={P.hot} opacity={0.95} />
        </mesh>
      </group>
    </group>
  )
}

/* ══════════════════════════════════════════ LAYER 2 — DATA STREAMS (PCB) ═ */

/** 45°-quantised branching network, generated once. */
function buildNetwork(seed = 12) {
  const r = rng(seed)
  const DIR = []
  for (let i = 0; i < 8; i++) DIR.push([Math.cos((i * Math.PI) / 4), Math.sin((i * Math.PI) / 4)])

  const segs = []
  const pads = []
  const SPOKES = 18

  for (let i = 0; i < SPOKES; i++) {
    const a = (i / SPOKES) * Math.PI * 2
    let d = Math.round(a / (Math.PI / 4)) % 8
    const z = (Math.round(r() * 4) - 2) * 0.24
    let p = new THREE.Vector3(Math.cos(a) * 1.24, Math.sin(a) * 1.24, z)
    pads.push({ p: p.clone(), s: 0.9 })

    const steps = 3 + Math.floor(r() * 3)
    for (let s = 0; s < steps; s++) {
      if (s > 0 && r() < 0.75) d = (d + (r() < 0.5 ? 1 : 7)) % 8
      const len = 0.4 + r() * 0.72
      const q = new THREE.Vector3(p.x + DIR[d][0] * len, p.y + DIR[d][1] * len, p.z)
      if (q.length() > 3.9) break
      segs.push({ a: p.clone(), b: q, w: s === 0 ? 0.055 : 0.036, o: s, tube: r() < 0.34 })
      p = q

      if (r() < 0.5 && s < steps - 1) {
        let bd = (d + (r() < 0.5 ? 2 : 6)) % 8
        let bp = p.clone()
        const bs = 1 + Math.floor(r() * 2)
        for (let k = 0; k < bs; k++) {
          const bl = 0.3 + r() * 0.5
          const bq = new THREE.Vector3(
            bp.x + DIR[bd][0] * bl,
            bp.y + DIR[bd][1] * bl,
            bp.z + (r() - 0.5) * 0.26
          )
          segs.push({ a: bp.clone(), b: bq, w: 0.024, o: s + k + 1, tube: false })
          bp = bq
          bd = (bd + (r() < 0.5 ? 1 : 7)) % 8
        }
        pads.push({ p: bp.clone(), s: 0.7 })
      }
      if (s === steps - 1) pads.push({ p: p.clone(), s: 1.15 })
    }
  }
  return { segs, pads }
}

const PACKETS = 34
const UP = new THREE.Vector3(0, 1, 0)
const XAXIS = new THREE.Vector3(1, 0, 0)

function DataStreams() {
  const net = useMemo(() => buildNetwork(12), [])
  const traceRef = useRef()
  const tubeRef = useRef()
  const padRef = useRef()
  const packRef = useRef()

  const traces = useMemo(() => net.segs.filter((s) => !s.tube), [net])
  const tubes = useMemo(() => net.segs.filter((s) => s.tube), [net])

  /** Bake instance matrices once; colour is what animates. */
  const baked = useMemo(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const dir = new THREE.Vector3()
    const mid = new THREE.Vector3()
    const bake = (list, thin) =>
      list.map((s) => {
        dir.subVectors(s.b, s.a)
        const len = dir.length()
        q.setFromUnitVectors(XAXIS, dir.clone().normalize())
        mid.addVectors(s.a, s.b).multiplyScalar(0.5)
        const w = s.w
        return {
          m: m.clone().compose(mid.clone(), q.clone(), new THREE.Vector3(len, w, thin ? w * 0.45 : w)),
          o: s.o,
          d: mid.length(),
        }
      })
    return { traces: bake(traces, true), tubes: bake(tubes, false) }
  }, [traces, tubes])

  const packets = useMemo(() => {
    const r = rng(5)
    return Array.from({ length: PACKETS }, () => ({
      s: net.segs[Math.floor(r() * net.segs.length)],
      initialProgress: r(),
      v: 0.45 + r() * 0.85,
    }))
  }, [net])
  const packetProgress = useRef(null)
  if (packetProgress.current == null) {
    packetProgress.current = Float32Array.from(packets, (packet) => packet.initialProgress)
  }

  // write matrices + init colour buffers
  React.useLayoutEffect(() => {
    const attach = (ref, items) => {
      if (!ref.current) return
      items.forEach((it, i) => ref.current.setMatrixAt(i, it.m))
      ref.current.instanceMatrix.needsUpdate = true
      ref.current.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(items.length * 3),
        3
      )
    }
    attach(traceRef, baked.traces)
    attach(tubeRef, baked.tubes)

    const m = new THREE.Matrix4()
    net.pads.forEach((p, i) => {
      m.identity()
        .makeRotationX(Math.PI / 2)
        .setPosition(p.p)
      m.scale(new THREE.Vector3(p.s, 1, p.s))
      padRef.current.setMatrixAt(i, m)
    })
    padRef.current.instanceMatrix.needsUpdate = true
  }, [baked, net])

  const tmp = useMemo(() => ({ c: new THREE.Color(), m: new THREE.Matrix4(), v: new THREE.Vector3() }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // (b) pulsing data — a sharp crest travels outward from the core
    const drive = (ref, items, base, gain) => {
      const col = ref.current?.instanceColor
      if (!col) return
      for (let i = 0; i < items.length; i++) {
        const w = 0.5 + 0.5 * Math.sin(t * 2.1 - items[i].d * 1.05 - items[i].o * 0.35)
        const k = Math.pow(w, 7)
        tmp.c.copy(base).lerp(C.hot, k * gain * 0.55)
        tmp.c.multiplyScalar(0.46 + k * 0.8)
        col.setXYZ(i, tmp.c.r, tmp.c.g, tmp.c.b)
      }
      col.needsUpdate = true
    }
    drive(traceRef, baked.traces, C.cyan, 0.9)
    drive(tubeRef, baked.tubes, C.tube, 0.7)

    // travelling data packets
    for (let i = 0; i < packets.length; i++) {
      const pk = packets[i]
      let progress = packetProgress.current[i] + 0.012 * pk.v
      if (progress > 1) progress -= 1
      packetProgress.current[i] = progress
      tmp.v.lerpVectors(pk.s.a, pk.s.b, progress)
      const fade = Math.sin(progress * Math.PI)
      tmp.m.makeScale(0.1 + fade * 0.16, 0.055, 0.055).setPosition(tmp.v)
      packRef.current.setMatrixAt(i, tmp.m)
    }
    packRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {/* thin rectangular traces */}
      <instancedMesh ref={traceRef} args={[undefined, undefined, baked.traces.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>

      {/* linear tubes */}
      <instancedMesh ref={tubeRef} args={[undefined, undefined, baked.tubes.length]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 6]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>

      {/* solder pads / junction nodes */}
      <instancedMesh ref={padRef} args={[undefined, undefined, net.pads.length]}>
        <cylinderGeometry args={[0.075, 0.075, 0.03, 8]} />
        <Energy color={P.cyan} opacity={0.7} />
      </instancedMesh>

      {/* packets in flight */}
      <instancedMesh ref={packRef} args={[undefined, undefined, PACKETS]}>
        <boxGeometry args={[1, 1, 1]} />
        <Energy color={P.hot} opacity={1} />
      </instancedMesh>
    </group>
  )
}

/* ═════════════════════════════════════════════════════ orbital furniture ═ */

function Rings() {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    g.current.rotation.z = t * 0.06
    g.current.children[1].rotation.z = -t * 0.14
  })
  return (
    <group ref={g} position={[0, 0, -0.6]}>
      {[2.05, 2.62, 4.3].map((r, i) => (
        <mesh key={r} rotation={[0, 0, i * 0.4]}>
          <torusGeometry args={[r, 0.006, 3, 128]} />
          <Energy color={i === 2 ? P.blueDim : P.cyanMid} opacity={i === 2 ? 0.5 : 0.8} />
        </mesh>
      ))}
      {/* dashed outer arc ticks */}
      {Array.from({ length: 48 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2
        return (
          <mesh key={`t${i}`} position={[Math.cos(a) * 3.35, Math.sin(a) * 3.35, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[i % 4 === 0 ? 0.16 : 0.06, 0.012, 0.012]} />
            <Energy color={P.cyan} opacity={i % 4 === 0 ? 0.85 : 0.4} />
          </mesh>
        )
      })}
    </group>
  )
}

function Starfield() {
  const geo = useMemo(() => {
    const r = rng(31)
    const n = 900
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const rad = 7 + r() * 9
      const th = r() * Math.PI * 2
      const ph = Math.acos(2 * r() - 1)
      pos.set(
        [rad * Math.sin(ph) * Math.cos(th), rad * Math.sin(ph) * Math.sin(th), rad * Math.cos(ph)],
        i * 3
      )
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * 0.01
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.05}
        color={P.cyanMid}
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}

/* ══════════════════════════════════════════════ LAYER 3 — FLOATING ICONS ═ */

/** Targeting brackets that frame every icon. */
function Reticle({ s = 0.62 }) {
  return (
    <group>
      {[
        [-1, 1],
        [1, 1],
        [-1, -1],
        [1, -1],
      ].map(([x, y], i) => (
        <group key={i} position={[x * s, y * s, 0]}>
          <mesh position={[-x * 0.08, 0, 0]}>
            <boxGeometry args={[0.16, 0.014, 0.014]} />
            <Energy color={P.cyan} opacity={0.8} />
          </mesh>
          <mesh position={[0, -y * 0.08, 0]}>
            <boxGeometry args={[0.014, 0.16, 0.014]} />
            <Energy color={P.cyan} opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** (c) gentle pseudo-random drift on all local axes. */
function IconShell({ position, seed, scale = 1, children }) {
  const ref = useRef()
  const o = useMemo(() => {
    const r = rng(seed)
    return { a: r() * 6.28, b: r() * 6.28, c: r() * 6.28, s: 0.55 + r() * 0.6 }
  }, [seed])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * o.s
    ref.current.position.set(
      position[0] + Math.sin(t * 0.52 + o.a) * 0.13,
      position[1] + Math.sin(t * 0.67 + o.b) * 0.19,
      position[2] + Math.cos(t * 0.43 + o.c) * 0.14
    )
    ref.current.rotation.set(
      Math.sin(t * 0.31 + o.b) * 0.24,
      Math.sin(t * 0.38 + o.a) * 0.55,
      Math.sin(t * 0.24 + o.c) * 0.12
    )
  })

  return (
    <group ref={ref} position={position} scale={scale}>
      {children}
      <Reticle />
    </group>
  )
}

function GlobeIcon() {
  const sphere = useMemo(() => new THREE.SphereGeometry(0.36, 18, 12), [])
  return (
    <group>
      <mesh geometry={sphere}>
        <Glass color={P.blue} opacity={0.22} />
      </mesh>
      <mesh geometry={sphere}>
        <meshBasicMaterial color={P.cyan} wireframe transparent opacity={0.6} toneMapped={false} />
      </mesh>
      {[0, 1.1, -1.1].map((rx, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + rx, 0, 0]}>
          <torusGeometry args={[i === 0 ? 0.36 : 0.3, 0.008, 3, 48]} />
          <Energy color={P.hot} opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function GearIcon() {
  const geo = useMemo(() => {
    const teeth = 9
    const rIn = 0.26
    const rOut = 0.42
    const step = (Math.PI * 2) / teeth
    const pts = []
    for (let i = 0; i < teeth; i++) {
      const a = i * step
      pts.push(
        [rIn, a],
        [rOut, a + step * 0.1],
        [rOut, a + step * 0.4],
        [rIn, a + step * 0.5]
      )
    }
    const s = new THREE.Shape()
    pts.forEach(([r, a], i) => {
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)
    })
    s.closePath()
    const hole = new THREE.Path()
    hole.absarc(0, 0, 0.15, 0, Math.PI * 2, true)
    s.holes.push(hole)
    return extrude(s, 0.11, 0)
  }, [])
  return (
    <group>
      <mesh geometry={geo}>
        <Glass color={P.cyan} opacity={0.3} />
      </mesh>
      <Wire geometry={geo} color={P.hot} opacity={0.85} />
    </group>
  )
}

function CloudIcon() {
  const blobs = [
    [-0.34, -0.05, 0, 0.16],
    [-0.11, 0.09, 0.03, 0.22],
    [0.16, 0.02, -0.03, 0.18],
    [0.36, -0.06, 0.02, 0.14],
  ]
  return (
    <group>
      {blobs.map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh>
            <icosahedronGeometry args={[r, 1]} />
            <Glass color={P.cyan} opacity={0.26} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[r, 1]} />
            <meshBasicMaterial color={P.hot} wireframe transparent opacity={0.6} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[0.86, 0.026, 0.13]} />
        <Energy color={P.cyan} opacity={0.6} />
      </mesh>
    </group>
  )
}

function BulbIcon() {
  return (
    <group>
      <mesh position={[0, 0.09, 0]}>
        <sphereGeometry args={[0.26, 16, 12]} />
        <Glass color={P.hot} opacity={0.16} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <sphereGeometry args={[0.26, 12, 8]} />
        <meshBasicMaterial color={P.cyan} wireframe transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {/* filament */}
      <mesh position={[0, 0.1, 0]} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[0.08, 0.016, 4, 12]} />
        <Energy color={P.hot} opacity={1} />
      </mesh>
      {/* screw base */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.16 - i * 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1 - i * 0.008, 0.017, 4, 16]} />
          <Energy color={P.cyan} opacity={0.9} />
        </mesh>
      ))}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.03, 0.06, 6]} />
        <Glass color={P.cyan} opacity={0.5} />
      </mesh>
    </group>
  )
}

function ChartIcon() {
  const bars = [0.18, 0.34, 0.26, 0.48]
  return (
    <group position={[0, -0.1, 0]}>
      {bars.map((h, i) => (
        <group key={i} position={[-0.24 + i * 0.16, h / 2, 0]}>
          <mesh>
            <boxGeometry args={[0.1, h, 0.1]} />
            <Glass color={i === 3 ? P.hot : P.cyan} opacity={i === 3 ? 0.5 : 0.3} />
          </mesh>
          <mesh>
            <boxGeometry args={[0.1, h, 0.1]} />
            <meshBasicMaterial color={P.hot} wireframe transparent opacity={0.7} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[0.72, 0.018, 0.16]} />
        <Energy color={P.cyan} opacity={0.9} />
      </mesh>
      <mesh position={[-0.36, 0.28, 0]}>
        <boxGeometry args={[0.018, 0.58, 0.018]} />
        <Energy color={P.cyan} opacity={0.7} />
      </mesh>
    </group>
  )
}

function DocIcon() {
  const geo = useMemo(() => extrude(roundedRect(0.27, 0.35, 0.04), 0.06, 0.02), [])
  return (
    <group>
      <mesh geometry={geo}>
        <Glass color={P.cyan} opacity={0.28} />
      </mesh>
      <Wire geometry={geo} color={P.hot} opacity={0.9} />
      {/* folded corner */}
      <mesh position={[0.17, 0.25, 0.05]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.14, 0.14, 0.015]} />
        <Energy color={P.hot} opacity={0.75} />
      </mesh>
      {/* text lines */}
      {[0.08, 0.0, -0.08, -0.16].map((y, i) => (
        <mesh key={y} position={[i === 3 ? -0.05 : 0, y, 0.05]}>
          <boxGeometry args={[i === 3 ? 0.18 : 0.32, 0.02, 0.012]} />
          <Energy color={P.cyan} opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function FloatingIcons() {
  const items = [
    { C: GlobeIcon, p: [-3.55, 1.55, 1.15], s: 1.15, seed: 101 },
    { C: GearIcon, p: [3.5, 1.75, -0.8], s: 1.1, seed: 202 },
    { C: CloudIcon, p: [4.0, -0.7, 1.25], s: 1.3, seed: 303 },
    { C: BulbIcon, p: [-4.05, -1.05, -0.7], s: 1.15, seed: 404 },
    { C: ChartIcon, p: [-1.85, -2.85, 0.9], s: 1.05, seed: 505 },
    { C: DocIcon, p: [2.05, -2.9, -1.0], s: 1.1, seed: 606 },
  ]
  return (
    <group>
      {items.map(({ C: Icon, p, s, seed }, i) => (
        <IconShell key={i} position={p} seed={seed} scale={s}>
          <Icon />
        </IconShell>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════ ASSEMBLY ═ */

/** (a) slow, majestic, continuous 360° Y rotation of the whole display. */
export function Assembly({ spin = 0.055, showStreams = true, showIcons = true }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.elapsedTime * spin
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.11) * 0.05
  })
  return (
    <group ref={ref}>
      <Rings />
      {showStreams && <DataStreams />}
      {showIcons && <FloatingIcons />}
      <Shield />
      <Padlock />
    </group>
  )
}

/* ══════════════════════════════════════════════════════════════════ SCENE ═ */

export function Scene({ bloom = 2.6, spin = 0.055, showStreams = true, showIcons = true }) {
  return (
    <>
      <color attach="background" args={[P.void]} />
      <Starfield />
      <Assembly spin={spin} showStreams={showStreams} showIcons={showIcons} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.07}
        minDistance={4}
        maxDistance={16}
        minPolarAngle={0.55}
        maxPolarAngle={Math.PI - 0.55}
      />
      <EffectComposer multisampling={4}>
        <Bloom
          intensity={bloom}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.22}
          mipmapBlur
          radius={0.82}
        />
        <Vignette offset={0.26} darkness={0.85} eskil={false} />
      </EffectComposer>
    </>
  )
}

export default function CyberSecurityHologram({
  bloom = 2.6,
  spin = 0.055,
  showStreams = true,
  showIcons = true,
  className,
  style,
}) {
  return (
    <div className={className} style={{ width: '100%', height: '100%', background: P.void, ...style }}>
      <Canvas
        flat
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        camera={{ position: [0, 0.15, 10.2], fov: 40, near: 0.1, far: 60 }}
      >
        <Scene bloom={bloom} spin={spin} showStreams={showStreams} showIcons={showIcons} />
      </Canvas>
    </div>
  )
}
