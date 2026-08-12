/**
 * QF-9 "WRAITH" — procedural heavy-lift defense drone
 * ---------------------------------------------------
 * Single-file React Three Fiber asset. Everything is generated from primitives:
 * no GLTF, no textures, no external assets.
 *
 * Requires:
 *   react  three  @react-three/fiber  @react-three/drei  @react-three/postprocessing
 *
 * Usage:
 *   import DroneScene from './Drone.jsx';
 *   <DroneScene accent="#00c8e8" bloom={1.5} spin />
 */

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  Lightformer,
  OrbitControls,
  ContactShadows,
  RoundedBox,
  Grid,
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';

/* ═══════════════════════════════════════════════════════════════════════
   1. MATERIAL LIBRARY
   Spread these into <meshStandardMaterial {...M.hull} />. Keeping them as
   plain prop objects means every panel shares one visual language and the
   whole drone can be re-skinned from a single place.
   ═══════════════════════════════════════════════════════════════════════ */

const M = {
  // primary tactical gunmetal — dark, high metalness, satin finish
  hull:      { color: '#2a3040', metalness: 0.95, roughness: 0.38, envMapIntensity: 1.35 },
  // deeper shadow plates that sit under the armour for panel-gap contrast
  hullDark:  { color: '#12151f', metalness: 0.9,  roughness: 0.55, envMapIntensity: 0.9 },
  // woven carbon — near-black, slightly rougher, low reflection
  carbon:    { color: '#0a0c12', metalness: 0.55, roughness: 0.62, envMapIntensity: 0.7 },
  // brushed / machined steel for joints, bolts, hardware
  steel:     { color: '#8d99ad', metalness: 1.0,  roughness: 0.28, envMapIntensity: 1.7 },
  // anodised titanium — a hair warmer, used on load-bearing structure
  titanium:  { color: '#5b6577', metalness: 1.0,  roughness: 0.34, envMapIntensity: 1.5 },
  // rubberised gasket / cable sheathing
  rubber:    { color: '#08090d', metalness: 0.1,  roughness: 0.95, envMapIntensity: 0.35 },
  // glass over the optics
  optic:     { color: '#040a10', metalness: 1.0,  roughness: 0.06, envMapIntensity: 2.4 },
};

/* Over-bright colours (values > 1) are what the bloom pass latches onto.
   Blue-only emissive palette. */
const HOT = {
  cyan:  new THREE.Color(0.0, 2.9, 3.8),
  cyanL: new THREE.Color(0.0, 1.5, 2.0),
  blue:  new THREE.Color(0.25, 0.95, 3.0),
  blueL: new THREE.Color(0.15, 0.6, 1.9),
};

const TAU = Math.PI * 2;

/* ═══════════════════════════════════════════════════════════════════════
   2. DETAIL PRIMITIVES
   Small reusable bits of "greebling" — the fasteners, gills and cable runs
   that sell scale. These are what separate a prop from a box.
   ═══════════════════════════════════════════════════════════════════════ */

/** Ring of hex bolts around a circular face. */
function BoltRing({ count = 8, radius = 0.2, size = 0.018, y = 0, ...rest }) {
  const bolts = useMemo(
    () => Array.from({ length: count }, (_, i) => (i / count) * TAU),
    [count],
  );
  return (
    <group position-y={y} {...rest}>
      {bolts.map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]} castShadow>
          <cylinderGeometry args={[size, size, 0.022, 6]} />
          <meshStandardMaterial {...M.steel} />
        </mesh>
      ))}
    </group>
  );
}

/** Stack of heat-sink fins. */
function HeatFins({ count = 7, width = 0.5, height = 0.06, depth = 0.03, gap = 0.045, ...rest }) {
  return (
    <group {...rest}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[0, 0, (i - (count - 1) / 2) * gap]} castShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial {...M.titanium} roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

/** Recessed panel line — a thin dark inset that reads as a seam. */
function PanelGap({ length = 1, ...rest }) {
  return (
    <mesh {...rest}>
      <boxGeometry args={[0.012, 0.012, length]} />
      <meshStandardMaterial {...M.hullDark} />
    </mesh>
  );
}

/** Glowing conduit run — the drone's exposed "nervous system". */
function Conduit({ points, radius = 0.014, color = HOT.cyan }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    [points],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 24, radius, 8, false]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

/** Small status LED with an optional light source. */
function Lamp({ color = HOT.cyan, size = 0.022, light = 0, position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {light > 0 && <pointLight color={color} intensity={light} distance={2.4} decay={2} />}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3. CORE CHASSIS
   Layered construction: structural spine → armour plates → greebles.
   ═══════════════════════════════════════════════════════════════════════ */

function Chassis({ accent }) {
  const armour = useMemo(
    () => [
      { pos: [0, 0.16, -0.55], size: [0.86, 0.09, 0.72] },
      { pos: [0, 0.16, 0.28], size: [0.98, 0.09, 0.84] },
      { pos: [0, -0.16, -0.1], size: [1.1, 0.08, 1.5] },
      { pos: [0.62, 0.02, 0.05], size: [0.11, 0.18, 1.15], rot: [0, 0, 0.18] },
      { pos: [-0.62, 0.02, 0.05], size: [0.11, 0.18, 1.15], rot: [0, 0, -0.18] },
    ],
    [],
  );

  return (
    <group>
      {/* ── structural core ─────────────────────────────────────────── */}
      <RoundedBox args={[1.28, 0.3, 2.1]} radius={0.09} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial {...M.hull} />
      </RoundedBox>

      {/* dorsal spine housing */}
      <RoundedBox
        args={[0.74, 0.2, 1.42]}
        radius={0.06}
        smoothness={5}
        position={[0, 0.2, -0.05]}
        castShadow
      >
        <meshStandardMaterial {...M.carbon} />
      </RoundedBox>

      {/* ventral avionics tray */}
      <RoundedBox args={[0.8, 0.14, 1.24]} radius={0.05} position={[0, -0.19, 0.02]} castShadow>
        <meshStandardMaterial {...M.hullDark} />
      </RoundedBox>

      {/* ── overlapping armour plating ──────────────────────────────── */}
      {armour.map((p, i) => (
        <RoundedBox
          key={i}
          args={p.size}
          radius={0.032}
          smoothness={3}
          position={p.pos}
          rotation={p.rot || [0, 0, 0]}
          castShadow
        >
          <meshStandardMaterial {...M.hull} roughness={0.3} color="#333b4d" />
        </RoundedBox>
      ))}

      {/* panel seams */}
      <PanelGap length={1.9} position={[0.3, 0.176, -0.05]} />
      <PanelGap length={1.9} position={[-0.3, 0.176, -0.05]} />
      <PanelGap length={0.9} position={[0, -0.178, 0.42]} rotation={[0, Math.PI / 2, 0]} />

      {/* ── nose: faceted sensor prow ───────────────────────────────── */}
      <group position={[0, 0.02, -1.0]}>
        <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, Math.PI / 6, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.46, 0.2, 6]} />
          <meshStandardMaterial {...M.hull} />
        </mesh>
        <mesh position={[0, -0.01, -0.16]} rotation={[Math.PI / 2, Math.PI / 6, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.42, 0.44, 6]} />
          <meshStandardMaterial {...M.hull} color="#333b4d" />
        </mesh>
        <RoundedBox args={[0.3, 0.19, 0.16]} radius={0.055} smoothness={5} position={[0, -0.02, -0.44]} castShadow>
          <meshStandardMaterial {...M.hullDark} />
        </RoundedBox>
        <RoundedBox args={[0.34, 0.14, 0.5]} radius={0.06} smoothness={5} position={[0, 0.13, -0.1]} castShadow>
          <meshStandardMaterial {...M.carbon} />
        </RoundedBox>
        <mesh position={[0, -0.02, -0.53]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.1, 0.05, 12]} />
          <meshStandardMaterial {...M.steel} />
        </mesh>
        <mesh position={[0, 0.06, -0.5]}>
          <boxGeometry args={[0.16, 0.026, 0.03]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
      </group>

      {/* ── tail: transom block + twin ion thrusters ─────────────────── */}
      <RoundedBox args={[1.0, 0.36, 0.42]} radius={0.09} smoothness={5} position={[0, 0.02, 0.98]} castShadow>
        <meshStandardMaterial {...M.hull} color="#2f374a" />
      </RoundedBox>
      <RoundedBox args={[0.62, 0.16, 0.3]} radius={0.05} smoothness={4} position={[0, 0.24, 0.94]} castShadow>
        <meshStandardMaterial {...M.carbon} />
      </RoundedBox>
      {[-0.34, 0.34].map((x) => (
        <group key={x} position={[x, 0.03, 1.05]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.19, 0.22, 0.42, 20, 1]} />
            <meshStandardMaterial {...M.titanium} />
          </mesh>
          <mesh position={[0, 0, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.185, 0.185, 0.06, 20, 1, true]} />
            <meshStandardMaterial {...M.steel} side={THREE.DoubleSide} />
          </mesh>
          {/* combustion core */}
          <mesh position={[0, 0, 0.24]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.155, 24]} />
            <meshBasicMaterial color={HOT.blue} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.27]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.16, 0.2, 24]} />
            <meshBasicMaterial
              color={accent}
              toneMapped={false}
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
          <pointLight
            position={[0, 0, 0.5]}
            color="#2f9dff"
            intensity={2}
            distance={3}
            decay={2}
          />
          <BoltRing count={10} radius={0.2} y={0} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.2]} />
        </group>
      ))}

      {/* dorsal heat exchanger */}
      <HeatFins count={9} width={0.56} height={0.07} depth={0.028} gap={0.05} position={[0, 0.33, 0.1]} />
      {/* comms blister */}
      <mesh position={[0, 0.32, -0.62]} castShadow>
        <sphereGeometry args={[0.1, 20, 16, 0, TAU, 0, Math.PI / 2]} />
        <meshStandardMaterial {...M.optic} />
      </mesh>

      {/* exposed wiring loom along the spine */}
      <Conduit
        points={[
          [0.19, 0.31, -0.72],
          [0.24, 0.28, -0.2],
          [0.24, 0.28, 0.4],
          [0.19, 0.22, 0.86],
        ]}
        color={HOT.cyanL}
      />
      <Conduit
        points={[
          [-0.19, 0.31, -0.72],
          [-0.24, 0.28, -0.2],
          [-0.24, 0.28, 0.4],
          [-0.19, 0.22, 0.86],
        ]}
        color={HOT.cyanL}
      />

      {/* hull ID lamps */}
      <Lamp color={HOT.blueL} position={[0.34, 0.31, -0.95]} size={0.016} />
      <Lamp color={HOT.blueL} position={[-0.34, 0.31, -0.95]} size={0.016} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   4. PROPULSION — articulated rotor arm with ducted fan
   ═══════════════════════════════════════════════════════════════════════ */

function RotorArm({ angle, accent, index, reverse }) {
  const rotor = useRef();
  const speed = 46 * (reverse ? -1 : 1);

  useFrame((_, dt) => {
    if (rotor.current) rotor.current.rotation.y += speed * dt;
  });

  const R = 0.58; // duct radius
  const boom = 0.82;
  const navColor = index < 2 ? HOT.cyanL : HOT.blueL;

  return (
    <group rotation={[0, angle, 0]}>
      {/* ── shoulder joint ────────────────────────────────────────── */}
      <group position={[0, 0, -0.62]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
          <meshStandardMaterial {...M.titanium} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.15, 0.02, 8, 20]} />
          <meshStandardMaterial {...M.steel} />
        </mesh>
        <BoltRing count={6} radius={0.09} rotation={[0, 0, Math.PI / 2]} position={[0.16, 0, 0]} />
      </group>

      {/* ── boom ──────────────────────────────────────────────────── */}
      <group position={[0, -0.03, -0.62 - boom / 2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.1, boom, 12]} />
          <meshStandardMaterial {...M.carbon} />
        </mesh>
        {/* upper fairing */}
        <RoundedBox args={[0.17, 0.09, boom * 0.92]} radius={0.03} position={[0, 0.08, 0]} castShadow>
          <meshStandardMaterial {...M.hull} />
        </RoundedBox>
        {/* reinforcement ribs */}
        {[-0.3, 0, 0.3].map((z) => (
          <mesh key={z} position={[0, 0, z * boom]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.093, 0.014, 8, 18]} />
            <meshStandardMaterial {...M.steel} />
          </mesh>
        ))}
        {/* cable run to the motor */}
        <Conduit
          points={[
            [0.09, 0.06, boom / 2 - 0.05],
            [0.1, 0.05, 0],
            [0.09, 0.04, -boom / 2 + 0.05],
          ]}
          radius={0.011}
          color={HOT.cyanL}
        />
      </group>

      {/* ── nacelle + ducted fan assembly ─────────────────────────── */}
      <group position={[0, 0, -0.62 - boom - 0.02]}>
        {/* motor can */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.17, 0.24, 20]} />
          <meshStandardMaterial {...M.hull} />
        </mesh>
        <mesh position={[0, 0.19, 0]}>
          <cylinderGeometry args={[0.11, 0.15, 0.05, 20]} />
          <meshStandardMaterial {...M.steel} />
        </mesh>
        <BoltRing count={8} radius={0.12} y={0.215} />
        {/* stator glow slit */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.152, 0.152, 0.02, 20]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>

        {/* protective duct shroud */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[R, 0.045, 10, 44]} />
          <meshStandardMaterial {...M.hull} />
        </mesh>
        <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R, 0.028, 8, 44]} />
          <meshStandardMaterial {...M.titanium} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[R, R, 0.16, 44, 1, true]} />
          <meshStandardMaterial {...M.hullDark} side={THREE.DoubleSide} roughness={0.7} />
        </mesh>
        {/* accent lip on the intake */}
        <mesh position={[0, 0.145, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[R - 0.03, R + 0.005, 44]} />
          <meshBasicMaterial
            color={accent}
            toneMapped={false}
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* stator struts tying the duct to the motor */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            rotation={[0, (i / 4) * TAU + Math.PI / 8, 0]}
            position={[0, 0.02, 0]}
            castShadow
          >
            <boxGeometry args={[R * 2 - 0.1, 0.035, 0.05]} />
            <meshStandardMaterial {...M.titanium} />
          </mesh>
        ))}

        {/* ── the rotor itself — 5 twisted blades ─────────────────── */}
        <group ref={rotor} position={[0, 0.1, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.075, 0.09, 0.09, 16]} />
            <meshStandardMaterial {...M.steel} />
          </mesh>
          <mesh position={[0, 0.055, 0]}>
            <coneGeometry args={[0.07, 0.09, 16]} />
            <meshStandardMaterial {...M.hull} />
          </mesh>
          {Array.from({ length: 5 }, (_, i) => (
            <group key={i} rotation={[0, (i / 5) * TAU, 0]}>
              <mesh position={[(R - 0.14) / 2 + 0.07, 0, 0]} rotation={[0.42, 0, 0.03]} castShadow>
                <boxGeometry args={[R - 0.16, 0.011, 0.115]} />
                <meshStandardMaterial {...M.carbon} roughness={0.45} />
              </mesh>
              {/* blade-tip marker */}
              <mesh position={[R - 0.13, 0, 0]}>
                <boxGeometry args={[0.05, 0.013, 0.05]} />
                <meshBasicMaterial color={accent} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>

        {/* navigation light pod under the duct */}
        <mesh position={[0, -0.09, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.1, 12]} />
          <meshStandardMaterial {...M.hullDark} />
        </mesh>
        <Lamp color={navColor} position={[0, -0.16, 0]} size={0.032} light={0.8} />
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   5. SENSORS & ARMAMENT
   ═══════════════════════════════════════════════════════════════════════ */

/** Gimballed EO/IR targeting ball — the drone's "eye". */
function SensorTurret({ accent }) {
  const ball = useRef();
  const iris = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ball.current) {
      ball.current.rotation.y = Math.sin(t * 0.55) * 0.5;
      ball.current.rotation.x = 0.18 + Math.sin(t * 0.31) * 0.12;
    }
    if (iris.current) iris.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.055);
  });

  return (
    <group position={[0, -0.36, -0.72]}>
      {/* yoke */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.12, 16]} />
        <meshStandardMaterial {...M.titanium} />
      </mesh>
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 0.0, 0]} rotation={[0, 0, 0.22 * Math.sign(x)]} castShadow>
          <boxGeometry args={[0.05, 0.26, 0.11]} />
          <meshStandardMaterial {...M.hull} />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, 0.46, 12]} />
        <meshStandardMaterial {...M.steel} />
      </mesh>

      {/* gimbal ball */}
      <group ref={ball} position={[0, -0.1, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.23, 32, 24]} />
          <meshStandardMaterial {...M.hull} color="#232936" roughness={0.32} />
        </mesh>
        {/* seam band */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.231, 0.008, 8, 40]} />
          <meshStandardMaterial {...M.hullDark} />
        </mesh>
        {/* primary optic */}
        <group position={[0, 0, -0.19]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.14, 0.09, 28]} />
            <meshStandardMaterial {...M.steel} />
          </mesh>
          <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.115, 0.115, 0.03, 28]} />
            <meshStandardMaterial {...M.optic} />
          </mesh>
          <mesh ref={iris} position={[0, 0, -0.068]}>
            <circleGeometry args={[0.085, 28]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.072]}>
            <ringGeometry args={[0.088, 0.108, 28]} />
            <meshBasicMaterial color={HOT.cyanL} toneMapped={false} transparent opacity={0.7} />
          </mesh>
          <pointLight
            position={[0, 0, -0.35]}
            color={accent}
            intensity={2.4}
            distance={3.2}
            decay={2}
          />
        </group>
        {/* secondary laser designator */}
        <mesh position={[0.14, 0.09, -0.17]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 0.09, 16]} />
          <meshStandardMaterial {...M.hullDark} />
        </mesh>
        <mesh position={[0.14, 0.09, -0.215]}>
          <circleGeometry args={[0.026, 16]} />
          <meshBasicMaterial color={HOT.blue} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Underslung twin-barrel defense turret. */
function DefenseTurret({ accent }) {
  const yaw = useRef();
  useFrame(({ clock }) => {
    if (yaw.current) yaw.current.rotation.y = Math.sin(clock.elapsedTime * 0.42 + 1.2) * 0.65;
  });

  return (
    <group position={[0, -0.32, 0.55]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.17, 0.2, 0.09, 20]} />
        <meshStandardMaterial {...M.hullDark} />
      </mesh>
      <BoltRing count={8} radius={0.16} y={0.05} />
      <group ref={yaw} position={[0, -0.11, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.15, 24, 18]} />
          <meshStandardMaterial {...M.hull} />
        </mesh>
        <mesh position={[0, 0.02, -0.1]} rotation={[Math.PI / 2 - 0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.19, 0.22, 0.12]} />
          <meshStandardMaterial {...M.carbon} />
        </mesh>
        {[-0.05, 0.05].map((x) => (
          <group key={x}>
            <mesh position={[x, 0.05, -0.32]} rotation={[Math.PI / 2 - 0.12, 0, 0]} castShadow>
              <cylinderGeometry args={[0.022, 0.026, 0.42, 12]} />
              <meshStandardMaterial {...M.steel} />
            </mesh>
            <mesh position={[x, 0.06, -0.5]} rotation={[Math.PI / 2 - 0.12, 0, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.05, 12]} />
              <meshStandardMaterial {...M.hullDark} />
            </mesh>
          </group>
        ))}
        {/* ammo feed glow */}
        <mesh position={[0, 0.1, 0.06]}>
          <boxGeometry args={[0.1, 0.016, 0.1]} />
          <meshBasicMaterial color={HOT.cyanL} toneMapped={false} />
        </mesh>
        <Lamp color={HOT.blueL} position={[0, -0.06, -0.16]} size={0.018} />
      </group>
    </group>
  );
}

/** Rear-mounted comms antennae. */
function Antennae({ accent }) {
  return (
    <group position={[0, 0.34, 0.6]}>
      {[-1, 1].map((s) => (
        <group key={s} rotation={[-0.45, 0, s * 0.34]}>
          <mesh position={[s * 0.3, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.016, 0.44, 8]} />
            <meshStandardMaterial {...M.steel} />
          </mesh>
          <mesh position={[s * 0.3, 0.0, 0]}>
            <cylinderGeometry args={[0.035, 0.045, 0.06, 12]} />
            <meshStandardMaterial {...M.rubber} />
          </mesh>
          <Lamp color={accent} position={[s * 0.3, 0.43, 0]} size={0.016} />
        </group>
      ))}
    </group>
  );
}

/** Skid landing gear. */
function LandingGear() {
  return (
    <group position={[0, -0.46, 0.05]}>
      {[-0.44, 0.44].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 1.02, 10]} />
            <meshStandardMaterial {...M.carbon} />
          </mesh>
          {[-0.3, 0.3].map((z) => (
            <mesh
              key={z}
              position={[-Math.sign(x) * 0.05, 0.13, z]}
              rotation={[0, 0, Math.sign(x) * 0.34]}
              castShadow
            >
              <cylinderGeometry args={[0.022, 0.022, 0.3, 8]} />
              <meshStandardMaterial {...M.titanium} />
            </mesh>
          ))}
          {[-0.44, 0.44].map((z) => (
            <mesh key={'p' + z} position={[0, -0.02, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.038, 0.03, 0.1, 10]} />
              <meshStandardMaterial {...M.rubber} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   6. THE DRONE — assembly + flight animation
   ═══════════════════════════════════════════════════════════════════════ */

export function Drone({ accent = '#00c8e8', spin = true, ...props }) {
  const root = useRef();
  const body = useRef();

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    // (a) slow turntable showcase rotation
    if (spin && root.current) root.current.rotation.y += dt * 0.28;
    // (b) hover bob + reactive attitude — the drone never sits still
    if (body.current) {
      body.current.position.y = Math.sin(t * 0.9) * 0.09;
      body.current.rotation.x = Math.sin(t * 0.7) * 0.035;
      body.current.rotation.z = Math.cos(t * 0.55) * 0.045;
    }
  });

  return (
    <group ref={root} {...props}>
      <group ref={body}>
        <Chassis accent={accent} />
        {[0, 1, 2, 3].map((i) => (
          <RotorArm
            key={i}
            index={i}
            angle={Math.PI / 4 + (i * Math.PI) / 2}
            accent={accent}
            reverse={i % 2 === 0}
          />
        ))}
        <SensorTurret accent={accent} />
        <DefenseTurret accent={accent} />
        <Antennae accent={accent} />
        <LandingGear />
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   7. LIGHTING RIG
   A hand-built lightformer environment: gives the metal crisp, directional
   reflections without downloading an HDRI.
   Swap for <Environment preset="city" /> if you'd rather stream the map.
   ═══════════════════════════════════════════════════════════════════════ */

function StudioEnvironment({ accent }) {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={['#04090c']} />
      {/* overhead key */}
      <Lightformer form="rect" intensity={3.4} position={[0, 5, 1]} scale={[10, 5, 1]} rotation={[Math.PI / 2, 0, 0]} />
      {/* cool cyan rim from behind-left */}
      <Lightformer form="rect" intensity={6} color={accent} position={[-5, 1, -4]} scale={[8, 4, 1]} rotation={[0, -Math.PI / 3, 0]} />
      {/* electric-blue fill right */}
      <Lightformer form="rect" intensity={3.5} color="#1e7be8" position={[5, 0, 3]} scale={[8, 4, 1]} rotation={[0, Math.PI / 2.4, 0]} />
      {/* specular streaks that travel across the armour */}
      {[-3, -1, 1, 3].map((x) => (
        <Lightformer key={x} form="rect" intensity={2} position={[x, 3.5, -2]} scale={[0.6, 4, 1]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
      <Lightformer form="ring" intensity={2.5} color="#ffffff" position={[0, -3, 0]} scale={6} rotation={[-Math.PI / 2, 0, 0]} />
    </Environment>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   8. SCENE
   ═══════════════════════════════════════════════════════════════════════ */

export default function DroneScene({
  accent = '#00c8e8',
  spin = true,
  bloom = 1.5,
  grid = true,
  controls = true,
  cameraPosition = [3.8, 2.55, 5.9],
  cameraFov = 37,
  frameloop = 'always',
  onCreated,
  className,
  style,
}) {
  const aberration = useMemo(() => new THREE.Vector2(0.0006, 0.0009), []);

  return (
    <Canvas
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
      shadows
      dpr={[1, 1.25]}
      frameloop={frameloop}
      onCreated={onCreated}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: cameraPosition, fov: cameraFov, near: 0.1, far: 60 }}
    >
      <color attach="background" args={['#04090c']} />
      <fog attach="fog" args={['#04090c', 11, 26]} />

      {/* scene lighting — the environment does the heavy lifting */}
      <ambientLight intensity={0.22} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <spotLight position={[-6, 4, -6]} angle={0.5} penumbra={1} intensity={28} color={accent} />
      <StudioEnvironment accent={accent} />

      <group position={[0, 0.35, 0]}>
        <Drone accent={accent} spin={spin} />
      </group>

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.62}
        scale={13}
        blur={2.6}
        far={4.5}
        color="#000308"
      />
      {grid && (
        <Grid
          position={[0, -1.51, 0]}
          args={[30, 30]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#12304a"
          sectionSize={2.5}
          sectionThickness={1.1}
          sectionColor={accent}
          fadeDistance={22}
          fadeStrength={1.6}
          infiniteGrid
        />
      )}

      {controls && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.06}
          minDistance={3.4}
          maxDistance={14}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI / 1.85}
          target={[0, 0.1, 0]}
        />
      )}

      <EffectComposer multisampling={2}>
        <Bloom
          intensity={bloom}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.28}
          mipmapBlur
          radius={0.58}
        />
        <ChromaticAberration offset={aberration} radialModulation modulationOffset={0.4} />
        <Vignette eskil={false} offset={0.22} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   9. PREVIEW BOOTSTRAP
   Only used by the standalone preview page — delete this whole block when
   you drop Drone.jsx into your app and import <DroneScene /> yourself.
   ═══════════════════════════════════════════════════════════════════════ */
