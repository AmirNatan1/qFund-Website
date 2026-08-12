/**
 * qFund — Hyper-detailed 3D cloud datacenter
 * -------------------------------------------------------------------------
 * Single-file React Three Fiber scene. Default export mounts its own <Canvas>;
 * named exports let you drop <Datacenter /> into an existing canvas.
 *
 * deps: react three @react-three/fiber @react-three/drei @react-three/postprocessing
 *
 * Performance notes:
 *  - Every repeated element (blade bodies, bezels, vents, drive bays, LEDs,
 *    fan blades, grill rings, cable-tray rungs) is an InstancedMesh, so a
 *    12-rack / 288-blade / 2,592-LED farm still renders in ~90 draw calls.
 *  - LED colour is written straight into the instanceColor buffer each frame.
 *    No React state churn, no per-LED objects.
 */

import React, { useRef, useMemo, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  Lightformer,
  Grid,
  MeshReflectorMaterial,
  RoundedBox,
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

/* ------------------------------------------------------------------ tokens */

export const PALETTE = {
  void: '#04090C',
  obsidian: '#090C12',
  charcoal: '#12161E',
  gunmetal: '#1B212B',
  steel: '#2A323E',
  brushed: '#3B4450',
  cyan: '#00C8E8',
  blue: '#2F6BFF',
  green: '#3BE08A',
  amber: '#FFB020',
  rose: '#FF4D6A',
}

const RACK = { w: 0.62, h: 2.1, d: 1.05 }
const BAY = { bottom: 0.17, top: 1.93 }
const BLADES_PER_RACK = 24
const LEDS_PER_BLADE = 9
const RACKS_PER_ROW = 6
const RACK_PITCH = 0.685
const ROW_Z = [-1.42, 1.42]
const TAU = Math.PI * 2
const DEG = Math.PI / 180

/** Deterministic PRNG so every reload builds the identical farm. */
const rng = (seed) => {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const dummy = new THREE.Object3D()
const tint = new THREE.Color()

/* ------------------------------------------------------------ server blades */

/**
 * One rack's worth of blade servers. Bodies, front bezels, vent slots, drive
 * bays and status LEDs are five instanced meshes.
 */
export function ServerBlades({ seed = 1, count = BLADES_PER_RACK }) {
  const bodies = useRef()
  const bezels = useRef()
  const vents = useRef()
  const bays = useRef()
  const leds = useRef()

  const pitch = (BAY.top - BAY.bottom) / count
  const VENTS_PER_BLADE = 3
  const BAYS_PER_BLADE = 2

  // ---- procedural layout, built once -------------------------------------
  const spec = useMemo(() => {
    const r = rng(seed * 7919 + 13)
    const traffic = [PALETTE.cyan, PALETTE.cyan, PALETTE.blue, PALETTE.green, PALETTE.green, PALETTE.amber]
    const ledList = []
    const blades = []

    for (let i = 0; i < count; i++) {
      const y = BAY.bottom + pitch * (i + 0.5)
      // a few slots are left empty (blanking panels) — real racks are never full
      const populated = r() > 0.08
      blades.push({ y, populated, depth: 0.5 + r() * 0.12 })
      if (!populated) continue

      for (let j = 0; j < LEDS_PER_BLADE; j++) {
        let color
        let mode // 0 = hard blink, 1 = breathe, 2 = solid
        if (j === 0) {
          color = PALETTE.green
          mode = 2
        } else if (j === 1) {
          color = PALETTE.cyan
          mode = 1
        } else {
          const roll = r()
          color = roll > 0.965 ? PALETTE.rose : traffic[(traffic.length * r()) | 0]
          mode = 0
        }
        ledList.push({
          x: 0.163 + j * 0.0122,
          y: y + (j === 0 ? -0.011 : 0.009),
          color: new THREE.Color(color),
          mode,
          seed: r(),
          rate: 1.4 + r() * 16,
        })
      }
    }
    return { blades, ledList }
  }, [seed, count, pitch])

  // ---- write instance matrices once --------------------------------------
  useLayoutEffect(() => {
    const { blades, ledList } = spec
    let b = 0
    let v = 0
    let d = 0

    blades.forEach(({ y, populated, depth }) => {
      // chassis body — sunk back behind the bezel
      dummy.position.set(0, y, 0.42 - depth / 2)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, depth)
      dummy.updateMatrix()
      bodies.current.setMatrixAt(b, dummy.matrix)

      // front bezel — blanking panels get a flat plate, servers a detailed face
      dummy.position.set(0, y, 0.4305)
      dummy.scale.set(1, populated ? 1 : 1.06, 1)
      dummy.updateMatrix()
      bezels.current.setMatrixAt(b, dummy.matrix)
      b++

      if (!populated) return

      for (let k = 0; k < VENTS_PER_BLADE; k++) {
        dummy.position.set(-0.052 + k * 0.072, y + 0.001, 0.4405)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        vents.current.setMatrixAt(v++, dummy.matrix)
      }
      for (let k = 0; k < BAYS_PER_BLADE; k++) {
        dummy.position.set(-0.222 + k * 0.086, y, 0.4395)
        dummy.updateMatrix()
        bays.current.setMatrixAt(d++, dummy.matrix)
      }
    })

    // hide unused vent / bay instances behind the rack
    for (let i = v; i < count * VENTS_PER_BLADE; i++) {
      dummy.position.set(0, -9, 0)
      dummy.updateMatrix()
      vents.current.setMatrixAt(i, dummy.matrix)
    }
    for (let i = d; i < count * BAYS_PER_BLADE; i++) {
      dummy.position.set(0, -9, 0)
      dummy.updateMatrix()
      bays.current.setMatrixAt(i, dummy.matrix)
    }

    ledList.forEach((led, i) => {
      dummy.position.set(led.x, led.y, 0.4455)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      leds.current.setMatrixAt(i, dummy.matrix)
      leds.current.setColorAt(i, led.color)
    })

    bodies.current.instanceMatrix.needsUpdate = true
    bezels.current.instanceMatrix.needsUpdate = true
    vents.current.instanceMatrix.needsUpdate = true
    bays.current.instanceMatrix.needsUpdate = true
    leds.current.instanceMatrix.needsUpdate = true
    if (leds.current.instanceColor) leds.current.instanceColor.needsUpdate = true
  }, [spec, count])

  // ---- blink ---------------------------------------------------------------
  useFrame(({ clock }) => {
    const mesh = leds.current
    if (!mesh || !mesh.instanceColor) return
    const t = clock.elapsedTime
    const list = spec.ledList

    for (let i = 0; i < list.length; i++) {
      const led = list[i]
      let k
      if (led.mode === 2) {
        k = 1
      } else if (led.mode === 1) {
        k = 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(t * 2.1 + led.seed * 40))
      } else {
        // bursty network traffic: the blink rate itself is modulated
        const burst = Math.sin(t * 0.61 + led.seed * 31) > 0.45 ? 2.9 : 1
        const wave = Math.sin(t * led.rate * burst + led.seed * 97)
        k = wave > 0.12 ? 1 : 0.045
      }
      tint.copy(led.color).multiplyScalar(0.1 + k * 4.4)
      mesh.setColorAt(i, tint)
    }
    mesh.instanceColor.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[0.515, 0.056, 1]} />
        <meshStandardMaterial color={PALETTE.charcoal} roughness={0.62} metalness={0.78} />
      </instancedMesh>

      <instancedMesh ref={bezels} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[0.525, 0.05, 0.022]} />
        <meshStandardMaterial
          color="#333D4A"
          roughness={0.42}
          metalness={0.72}
          emissive="#0A1D28"
          emissiveIntensity={1}
        />
      </instancedMesh>

      <instancedMesh ref={vents} args={[undefined, undefined, count * 3]} frustumCulled={false}>
        <boxGeometry args={[0.062, 0.026, 0.014]} />
        <meshStandardMaterial color="#05070B" roughness={0.95} metalness={0.2} />
      </instancedMesh>

      <instancedMesh ref={bays} args={[undefined, undefined, count * 2]} frustumCulled={false}>
        <boxGeometry args={[0.074, 0.036, 0.016]} />
        <meshStandardMaterial color="#464F5C" roughness={0.33} metalness={0.95} />
      </instancedMesh>

      <instancedMesh ref={leds} args={[undefined, undefined, spec.ledList.length]} frustumCulled={false}>
        <boxGeometry args={[0.011, 0.011, 0.007]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

/* -------------------------------------------------------------- cooling fan */

/**
 * A rack's roof fan tray. Every repeated part (shroud, lit intake rim, grill
 * rings, hub, blades) is instanced across the whole bank, so a two-fan tray
 * costs five draw calls instead of twenty-four.
 */
export function FanBank({ offsets = [-0.152, 0.152], radius = 0.14, speed = 9, ...props }) {
  const rotor = useRef()
  const shrouds = useRef()
  const rims = useRef()
  const grills = useRef()
  const hubs = useRef()
  const blades = useRef()
  const BLADES = 9
  const n = offsets.length

  useLayoutEffect(() => {
    offsets.forEach((ox, f) => {
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)

      dummy.position.set(ox, 0, 0)
      dummy.updateMatrix()
      shrouds.current.setMatrixAt(f, dummy.matrix)

      dummy.position.set(ox, 0.037, 0)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      dummy.updateMatrix()
      rims.current.setMatrixAt(f, dummy.matrix)

      // --- inside the rotated (face-up) frame ---
      dummy.rotation.set(Math.PI / 2, 0, 0)
      dummy.position.set(ox, 0, 0)
      dummy.updateMatrix()
      hubs.current.setMatrixAt(f, dummy.matrix)

      ;[0.42, 0.68, 0.95].forEach((k, ri) => {
        dummy.position.set(ox, 0, 0.034)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(radius * k)
        dummy.updateMatrix()
        grills.current.setMatrixAt(f * 3 + ri, dummy.matrix)
      })
      dummy.scale.set(1, 1, 1)

      for (let i = 0; i < BLADES; i++) {
        const a = (i / BLADES) * TAU
        dummy.position.set(ox + Math.cos(a) * radius * 0.55, Math.sin(a) * radius * 0.55, 0)
        dummy.rotation.set(0, 0, a)
        dummy.updateMatrix()
        dummy.rotateX(0.62)
        dummy.updateMatrix()
        blades.current.setMatrixAt(f * BLADES + i, dummy.matrix)
      }
    })
    ;[shrouds, rims, grills, hubs, blades].forEach((r) => (r.current.instanceMatrix.needsUpdate = true))
  }, [offsets, radius])

  useFrame((_, delta) => {
    if (rotor.current) rotor.current.rotation.z += delta * speed
  })

  return (
    <group {...props}>
      <instancedMesh ref={shrouds} args={[undefined, undefined, n]} frustumCulled={false}>
        <cylinderGeometry args={[radius * 1.09, radius * 1.09, 0.075, 26, 1, true]} />
        <meshStandardMaterial color={PALETTE.steel} roughness={0.42} metalness={0.95} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={rims} args={[undefined, undefined, n]} frustumCulled={false}>
        <ringGeometry args={[radius * 1.0, radius * 1.09, 26]} />
        <meshBasicMaterial color="#0B6E85" toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>

      <group rotation={[-Math.PI / 2, 0, 0]}>
        <instancedMesh ref={grills} args={[undefined, undefined, n * 3]} frustumCulled={false}>
          <torusGeometry args={[1, 0.045, 6, 26]} />
          <meshStandardMaterial color={PALETTE.brushed} roughness={0.35} metalness={1} />
        </instancedMesh>
        <group ref={rotor}>
          <instancedMesh ref={hubs} args={[undefined, undefined, n]} frustumCulled={false}>
            <cylinderGeometry args={[radius * 0.3, radius * 0.3, 0.038, 18]} />
            <meshStandardMaterial color={PALETTE.gunmetal} roughness={0.3} metalness={1} />
          </instancedMesh>
          <instancedMesh ref={blades} args={[undefined, undefined, n * BLADES]} frustumCulled={false}>
            <boxGeometry args={[radius * 0.78, 0.011, radius * 0.5]} />
            <meshStandardMaterial color="#2E3742" roughness={0.55} metalness={0.7} />
          </instancedMesh>
        </group>
      </group>
    </group>
  )
}

/* ---------------------------------------------------------------- rack door */

/** Recessed smoked-glass security door with frame, handle and lock plate. */
export function RackDoor() {
  const frame = useRef()
  const glassW = RACK.w - 0.075
  const glassH = RACK.h - 0.235
  const z = RACK.d / 2 - 0.055
  const cy = RACK.h / 2 + 0.01

  useLayoutEffect(() => {
    const parts = [
      [-(glassW / 2 + 0.014), cy, 0.028, glassH + 0.028],
      [glassW / 2 + 0.014, cy, 0.028, glassH + 0.028],
      [0, cy - (glassH / 2 + 0.014), glassW + 0.056, 0.028],
      [0, cy + (glassH / 2 + 0.014), glassW + 0.056, 0.028],
    ]
    parts.forEach(([x, y, sx, sy], i) => {
      dummy.position.set(x, y, z + 0.004)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(sx, sy, 0.03)
      dummy.updateMatrix()
      frame.current.setMatrixAt(i, dummy.matrix)
    })
    frame.current.instanceMatrix.needsUpdate = true
  }, [glassW, glassH, cy, z])

  return (
    <group>
      <mesh position={[0, cy, z]}>
        <boxGeometry args={[glassW, glassH, 0.012]} />
        <meshPhysicalMaterial
          color="#16303C"
          transmission={0.97}
          thickness={0.07}
          roughness={0.16}
          metalness={0.3}
          ior={1.45}
          reflectivity={0.72}
          clearcoat={0.6}
          clearcoatRoughness={0.22}
          attenuationColor="#1E7E95"
          attenuationDistance={3.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* frame: two stiles + two rails, one instanced unit box */}
      <instancedMesh ref={frame} args={[undefined, undefined, 4]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={PALETTE.steel} roughness={0.3} metalness={1} />
      </instancedMesh>

      {/* handle + lock */}
      <mesh position={[glassW / 2 - 0.045, cy - 0.05, z + 0.03]}>
        <boxGeometry args={[0.016, 0.24, 0.024]} />
        <meshStandardMaterial color="#4A535F" roughness={0.22} metalness={1} />
      </mesh>
      <mesh position={[glassW / 2 - 0.045, cy + 0.13, z + 0.024]}>
        <cylinderGeometry args={[0.011, 0.011, 0.014, 14]} />
        <meshStandardMaterial color="#5B6673" roughness={0.2} metalness={1} />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------- rack rear */

/** Perforated exhaust door, patch panel and link LEDs — half the farm is
 *  always showing its back, so the rear needs as much detail as the front. */
export function RackRear({ seed = 1 }) {
  const slots = useRef()
  const links = useRef()
  const stiles = useRef()
  const SLOTS = 24
  const LINKS = 12

  const spec = useMemo(() => {
    const r = rng(seed * 6151 + 7)
    return Array.from({ length: LINKS }, (_, i) => ({
      x: -0.2 + (i % 6) * 0.08,
      y: 1.845 + Math.floor(i / 6) * 0.052,
      color: new THREE.Color(r() > 0.22 ? PALETTE.green : PALETTE.amber),
      rate: 2.5 + r() * 15,
      seed: r(),
    }))
  }, [seed])

  useLayoutEffect(() => {
    for (let i = 0; i < SLOTS; i++) {
      dummy.position.set(0, 0.24 + i * 0.065, 0.008)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      slots.current.setMatrixAt(i, dummy.matrix)
    }
    slots.current.instanceMatrix.needsUpdate = true

    ;[-1, 1].forEach((k, i) => {
      dummy.position.set(k * (RACK.w / 2 - 0.028), RACK.h / 2, 0.006)
      dummy.updateMatrix()
      stiles.current.setMatrixAt(i, dummy.matrix)
    })
    stiles.current.instanceMatrix.needsUpdate = true

    spec.forEach((l, i) => {
      dummy.position.set(l.x, l.y, 0.018)
      dummy.updateMatrix()
      links.current.setMatrixAt(i, dummy.matrix)
      links.current.setColorAt(i, l.color)
    })
    links.current.instanceMatrix.needsUpdate = true
    if (links.current.instanceColor) links.current.instanceColor.needsUpdate = true
  }, [spec])

  useFrame(({ clock }) => {
    const m = links.current
    if (!m || !m.instanceColor) return
    const t = clock.elapsedTime
    for (let i = 0; i < spec.length; i++) {
      const l = spec[i]
      const on = Math.sin(t * l.rate + l.seed * 61) > -0.15 ? 1 : 0.06
      tint.copy(l.color).multiplyScalar(0.1 + on * 3.4)
      m.setColorAt(i, tint)
    }
    m.instanceColor.needsUpdate = true
  })

  return (
    <group position={[0, 0, -RACK.d / 2 - 0.016]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, RACK.h / 2, 0]}>
        <boxGeometry args={[RACK.w - 0.05, RACK.h - 0.19, 0.03]} />
        <meshStandardMaterial color="#141922" roughness={0.66} metalness={0.74} />
      </mesh>
      <instancedMesh ref={slots} args={[undefined, undefined, SLOTS]} frustumCulled={false}>
        <boxGeometry args={[RACK.w - 0.17, 0.03, 0.02]} />
        <meshStandardMaterial color="#04070C" roughness={0.98} metalness={0.15} />
      </instancedMesh>
      {/* patch panel */}
      <mesh position={[0, 1.87, 0.012]}>
        <boxGeometry args={[RACK.w - 0.14, 0.13, 0.016]} />
        <meshStandardMaterial color="#1D242E" roughness={0.4} metalness={0.9} />
      </mesh>
      <instancedMesh ref={links} args={[undefined, undefined, LINKS]} frustumCulled={false}>
        <boxGeometry args={[0.013, 0.009, 0.006]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {/* hinge stiles */}
      <instancedMesh ref={stiles} args={[undefined, undefined, 2]} frustumCulled={false}>
        <boxGeometry args={[0.024, RACK.h - 0.19, 0.038]} />
        <meshStandardMaterial color="#2A323E" roughness={0.34} metalness={1} />
      </instancedMesh>
    </group>
  )
}

/* -------------------------------------------------------------- cable riser */

/** Three bundles arcing from the rack head into the overhead containment tray. */
export function CableRiser({ seed = 1 }) {
  const curves = useMemo(() => {
    const r = rng(seed * 3391 + 5)
    return [0.13, -0.14].map((x) => {
      const j = r() * 0.07
      return new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(x, RACK.h - 0.06, -0.33),
        new THREE.Vector3(x, RACK.h + 0.6 + j, 0.16),
        new THREE.Vector3(x * 0.55, 2.575, 1.0 + j)
      )
    })
  }, [seed])

  const colors = ['#132534', '#0F3040']
  return (
    <group>
      {curves.map((c, i) => (
        <mesh key={i}>
          <tubeGeometry args={[c, 24, 0.03, 7, false]} />
          <meshStandardMaterial color={colors[i]} roughness={0.72} metalness={0.32} />
        </mesh>
      ))}
    </group>
  )
}

/* -------------------------------------------------------------- server rack */

export function ServerRack({ seed = 1, ...props }) {
  const status = useRef()
  const posts = useRef()
  const w = RACK.w
  const h = RACK.h
  const d = RACK.d

  useLayoutEffect(() => {
    ;[-1, 1].forEach((k, i) => {
      dummy.position.set(k * (RACK.w / 2 - 0.048), RACK.h / 2, RACK.d / 2 - 0.13)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      posts.current.setMatrixAt(i, dummy.matrix)
    })
    posts.current.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(({ clock }) => {
    if (!status.current) return
    const t = clock.elapsedTime
    const k = Math.sin(t * 1.7 + seed * 2.4) > -0.2 ? 1 : 0.18
    status.current.color.copy(tint.set(PALETTE.cyan)).multiplyScalar(1.1 + k * 2.2)
  })

  return (
    <group {...props}>
      {/* ---- cabinet shell (front left open so the blades read) ---- */}
      <mesh position={[0, h / 2, -d / 2 + 0.016]}>
        <boxGeometry args={[w, h, 0.032]} />
        <meshStandardMaterial color={PALETTE.obsidian} roughness={0.7} metalness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <RoundedBox
          key={s}
          args={[0.032, h, d]}
          radius={0.01}
          smoothness={2}
          position={[s * (w / 2 - 0.016), h / 2, 0]}
        >
          <meshStandardMaterial color={PALETTE.charcoal} roughness={0.55} metalness={0.82} />
        </RoundedBox>
      ))}
      <RoundedBox args={[w + 0.012, 0.07, d + 0.012]} radius={0.012} smoothness={2} position={[0, h - 0.035, 0]}>
        <meshStandardMaterial color={PALETTE.gunmetal} roughness={0.45} metalness={0.9} />
      </RoundedBox>
      {/* plinth / kick, inset so the cabinet appears to float a little */}
      <mesh position={[0, 0.045, 0]}>
        <boxGeometry args={[w - 0.05, 0.09, d - 0.06]} />
        <meshStandardMaterial color="#070A0F" roughness={0.9} metalness={0.4} />
      </mesh>
      {/* interior liner — pure black cavity behind the blades */}
      <mesh position={[0, h / 2, -0.06]}>
        <boxGeometry args={[w - 0.07, h - 0.2, 0.02]} />
        <meshStandardMaterial color="#03050A" roughness={1} metalness={0} />
      </mesh>

      {/* ---- front mounting posts ---- */}
      <instancedMesh ref={posts} args={[undefined, undefined, 2]} frustumCulled={false}>
        <boxGeometry args={[0.038, h - 0.24, 0.09]} />
        <meshStandardMaterial color="#171C24" roughness={0.6} metalness={0.85} />
      </instancedMesh>

      <ServerBlades seed={seed} />
      <RackDoor />

      {/* ---- nameplate + status bar above the door ---- */}
      <mesh position={[0, h - 0.115, d / 2 - 0.03]}>
        <boxGeometry args={[w - 0.14, 0.05, 0.014]} />
        <meshStandardMaterial color="#0C1017" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[-0.09, h - 0.115, d / 2 - 0.021]}>
        <boxGeometry args={[0.2, 0.008, 0.006]} />
        <meshBasicMaterial ref={status} toneMapped={false} color={PALETTE.cyan} />
      </mesh>

      {/* ---- roof fan tray ---- */}
      <FanBank position={[0, h + 0.05, -0.05]} radius={0.14} speed={8.6 + (seed % 5) * 0.9} />

      <RackRear seed={seed} />
      <CableRiser seed={seed} />
    </group>
  )
}

/* --------------------------------------------------------------- the floor */

/** Soft radial falloff used for the LED spill pools on the deck. */
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,255,255,0.95)')
    g.addColorStop(0.45, 'rgba(255,255,255,0.28)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])
}

/**
 * Raised access-floor platform: reflective deck, grid tiles, lit edge trim.
 * `reflective` costs an extra scene render per frame — drop it to false on
 * low-end hardware and the polished-metal fallback still reads well.
 */
export function Floor({ width = 5.6, depth = 5.4, height = 0.3, reflective = true }) {
  const glow = useGlowTexture()

  return (
    <group>
      {/* deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[width, depth]} />
        {reflective ? (
          <MeshReflectorMaterial
            resolution={512}
            blur={[240, 64]}
            mixBlur={0.85}
            mixStrength={26}
            depthScale={1.1}
            minDepthThreshold={0.35}
            maxDepthThreshold={1.35}
            color="#070A11"
            roughness={0.8}
            metalness={0.82}
          />
        ) : (
          <meshStandardMaterial color="#070A11" roughness={0.22} metalness={0.95} envMapIntensity={1.7} />
        )}
      </mesh>

      {/* LED spill pooling in front of each row */}
      {ROW_Z.map((z) => (
        <mesh
          key={z}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.009, z > 0 ? z - 0.78 : z + 0.78]}
          renderOrder={2}
        >
          <planeGeometry args={[width * 0.82, 1.9]} />
          <meshBasicMaterial
            map={glow}
            color="#127C96"
            transparent
            opacity={0.75}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* floor-tile grid */}
      <Grid
        position={[0, 0.005, 0]}
        args={[width, depth]}
        cellSize={0.28}
        cellThickness={0.5}
        cellColor="#1B2530"
        sectionSize={1.12}
        sectionThickness={1}
        sectionColor="#0E5A6B"
        fadeDistance={26}
        fadeStrength={1.2}
      />

      {/* platform body */}
      <mesh position={[0, -height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#0A0D13" roughness={0.78} metalness={0.55} />
      </mesh>
      {/* chamfer band */}
      <mesh position={[0, -0.022, 0]}>
        <boxGeometry args={[width + 0.05, 0.03, depth + 0.05]} />
        <meshStandardMaterial color={PALETTE.gunmetal} roughness={0.4} metalness={0.95} />
      </mesh>
      {/* lit edge trim */}
      {[-1, 1].map((s) => (
        <mesh key={`ex${s}`} position={[0, -0.055, s * (depth / 2 + 0.012)]}>
          <boxGeometry args={[width + 0.05, 0.012, 0.012]} />
          <meshBasicMaterial color="#0090AC" toneMapped={false} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`ez${s}`} position={[s * (width / 2 + 0.012), -0.055, 0]}>
          <boxGeometry args={[0.012, 0.012, depth + 0.05]} />
          <meshBasicMaterial color="#0090AC" toneMapped={false} />
        </mesh>
      ))}

      {/* void plane below the platform for depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height - 0.001, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#04090C" roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

/* ----------------------------------------------------- overhead containment */

/** Cable ladder and light strips running the length of the hot aisle. */
export function OverheadRig({ span = 4.4 }) {
  const rungs = useRef()
  const COUNT = 20

  useLayoutEffect(() => {
    for (let i = 0; i < COUNT; i++) {
      dummy.position.set(-span / 2 + (span / (COUNT - 1)) * i, 0, 0)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      rungs.current.setMatrixAt(i, dummy.matrix)
    }
    rungs.current.instanceMatrix.needsUpdate = true
  }, [span])

  return (
    <group position={[0, 2.62, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0, s * 0.42]}>
          <boxGeometry args={[span, 0.055, 0.035]} />
          <meshStandardMaterial color={PALETTE.steel} roughness={0.45} metalness={0.95} />
        </mesh>
      ))}
      <instancedMesh ref={rungs} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.022, 0.014, 0.86]} />
        <meshStandardMaterial color="#39424E" roughness={0.5} metalness={0.9} />
      </instancedMesh>

      {/* bundled fibre runs */}
      {[
        [-0.24, '#0C1622'],
        [-0.08, '#123246'],
        [0.09, '#0A1A2A'],
        [0.25, '#14202C'],
      ].map(([z, c], i) => (
        <mesh key={i} position={[0, 0.035, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.021, 0.021, span, 10]} />
          <meshStandardMaterial color={c} roughness={0.72} metalness={0.35} />
        </mesh>
      ))}

      {/* aisle light strips */}
      {[-0.66, 0.66].map((z) => (
        <group key={z} position={[0, 0.12, z]}>
          <mesh>
            <boxGeometry args={[span * 0.92, 0.05, 0.1]} />
            <meshStandardMaterial color="#131923" roughness={0.5} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.028, 0]}>
            <boxGeometry args={[span * 0.9, 0.008, 0.07]} />
            <meshBasicMaterial color="#8FD9EA" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------- the assembly */

/** Everything on the platform, slowly turning on Y. */
export function Datacenter({ spin = 0.075, reflections = true }) {
  const turntable = useRef()
  const glowRefs = useRef([])

  const racks = useMemo(() => {
    const out = []
    let seed = 1
    ROW_Z.forEach((z, rowIndex) => {
      for (let i = 0; i < RACKS_PER_ROW; i++) {
        out.push({
          key: `${rowIndex}-${i}`,
          seed: seed++,
          position: [(i - (RACKS_PER_ROW - 1) / 2) * RACK_PITCH, 0, z],
          rotation: [0, rowIndex === 0 ? 0 : Math.PI, 0],
        })
      }
    })
    return out
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (turntable.current) turntable.current.rotation.y = t * spin
    glowRefs.current.forEach((l, i) => {
      if (l) l.intensity = 1.9 + Math.sin(t * (1.3 + i * 0.37) + i) * 0.55
    })
  })

  return (
    <group ref={turntable}>
      <Floor reflective={reflections} />
      {racks.map((r) => (
        <ServerRack key={r.key} seed={r.seed} position={r.position} rotation={r.rotation} />
      ))}
      <OverheadRig />

      {/* cyan spill from the LED walls onto floor and glass */}
      {ROW_Z.map((z, rowIndex) =>
        [-1.05, 1.05].map((x, i) => (
          <pointLight
            key={`${z}-${x}`}
            ref={(el) => { glowRefs.current[rowIndex * 2 + i] = el }}
            position={[x, 1.0, z]}
            color={PALETTE.cyan}
            intensity={2.0}
            distance={3.6}
            decay={2}
          />
        ))
      )}

      {/* cool overhead wash down the aisle */}
      <pointLight position={[-1.5, 2.45, 0]} color="#BFEAF6" intensity={2.4} distance={7} decay={2} />
      <pointLight position={[1.5, 2.45, 0]} color="#BFEAF6" intensity={2.4} distance={7} decay={2} />
      {/* rim from behind, gives the cabinets an edge against the void */}
      <pointLight position={[0, 1.6, -4.6]} color={PALETTE.blue} intensity={6} distance={9} decay={2} />
    </group>
  )
}

/* ------------------------------------------------------------------- scene */

export function Scene({ spin = 0.075 }) {
  return (
    <>
      <color attach="background" args={[PALETTE.void]} />
      <fog attach="fog" args={[PALETTE.void, 13, 34]} />

      <ambientLight intensity={0.3} color="#63879F" />
      <directionalLight position={[4, 9, 3]} intensity={0.5} color="#9FC4D8" />

      {/* Dark studio env — swap for <Environment preset="night" /> if you'd
          rather pull the pmndrs HDRI. Lightformers keep it offline + tunable. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#04090C']} />
        <Lightformer intensity={4.2} rotation-x={Math.PI / 2} position={[0, 6, -2]} scale={[12, 6, 1]} color="#8FC2D8" />
        <Lightformer intensity={6} rotation-y={Math.PI / 2} position={[-7, 2, 0]} scale={[10, 3, 1]} color="#00C8E8" />
        <Lightformer intensity={3.4} rotation-y={-Math.PI / 2} position={[7, 2, 0]} scale={[10, 3, 1]} color="#2F6BFF" />
        <Lightformer intensity={1.1} rotation-x={-Math.PI / 2} position={[0, -4, 0]} scale={[14, 14, 1]} color="#0A1420" />
      </Environment>

      <Datacenter spin={spin} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.06}
        target={[0, 1.06, 0]}
        minDistance={3.4}
        maxDistance={18}
        minPolarAngle={22 * DEG}
        maxPolarAngle={86 * DEG}
      />

      <EffectComposer multisampling={2} disableNormalPass>
        <Bloom intensity={2} luminanceThreshold={0.6} luminanceSmoothing={0.28} mipmapBlur radius={0.75} />
        <Vignette offset={0.3} darkness={0.62} eskil={false} />
      </EffectComposer>
    </>
  )
}

export default function DatacenterScene({ className, style, spin = 0.075, frameloop = 'always' }) {
  return (
    <Canvas
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
      dpr={[1, 1.25]}
      frameloop={frameloop}
      shadows={false}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
      camera={{ position: [4.5, 1.72, 5.5], fov: 44, near: 0.1, far: 120 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.28
        if ('transmissionResolutionScale' in gl) gl.transmissionResolutionScale = 0.4
      }}
    >
      <Scene spin={spin} />
    </Canvas>
  )
}
