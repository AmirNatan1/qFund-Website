/**
 * SensorArray.jsx
 * ---------------------------------------------------------------------------
 * Multi-spectral Sensor Array Cluster — procedural, hyper-detailed, animated.
 *
 * Stack: react + three + @react-three/fiber + @react-three/drei
 *        + @react-three/postprocessing
 *
 * Default export mounts a full <Canvas> scene. Every sub-assembly is also
 * exported so you can drop just the cluster into an existing scene:
 *
 *     import { SensorArrayCluster } from './SensorArray'
 *     <Canvas> <SensorArrayCluster /> </Canvas>
 *
 * Units are meters, Y-up, base resting at y = 0.
 * ---------------------------------------------------------------------------
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  Suspense,
} from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useActiveFrame as useFrame } from './SceneActivity.jsx';
import {
  ContactShadows,
  Environment,
  Grid,
  Lightformer,
  OrbitControls,
} from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';

/* ==========================================================================
 * 0. TUNING — one place for the knobs worth turning
 * ======================================================================== */

export const TUNING = {
  spin: 0.11, // rad/s — platform 360° sweep (~57 s per revolution)
  envPreset: 'night', // 'night' | 'city' | 'warehouse' | 'studio'
  bloom: { intensity: 1.8, threshold: 0.75, smoothing: 0.2 },
  colors: {
    primary: '#00c8e8', // cyan-500 — apertures, data nodes
    laser: '#3b9eff', // blue-400 — rangefinders, beacons
    telemetry: '#a8effb', // cyan-200 — downlink telemetry
  },
};

/* ==========================================================================
 * 1. MATERIALS — small shared palette, physically-based
 * ======================================================================== */

const MatCtx = createContext(null);
const useMats = () => useContext(MatCtx);

function useMaterialPalette(colors = TUNING.colors) {
  const mats = useMemo(() => {
    const p = (name, o) => new THREE.MeshPhysicalMaterial({ name, ...o });
    const neon = (name, color) =>
      Object.assign(new THREE.MeshBasicMaterial({ name, color }), {
        toneMapped: false,
      });

    return {
      // Structure: anodized graphite, medium roughness, high metalness
      hull: p('hull-graphite', {
        color: '#22262c',
        roughness: 0.4,
        metalness: 0.72,
        clearcoat: 0.22,
        clearcoatRoughness: 0.65,
        envMapIntensity: 0.9,
      }),
      hullDark: p('hull-shadowline', {
        color: '#101318',
        roughness: 0.55,
        metalness: 0.62,
        envMapIntensity: 0.7,
      }),
      // Mounts / gimbal castings: tactical anodized black
      mount: p('mount-anodized', {
        color: '#0c0e12',
        roughness: 0.34,
        metalness: 0.86,
        clearcoat: 0.5,
        clearcoatRoughness: 0.35,
        envMapIntensity: 1.1,
      }),
      // Machined steel: struts, trunnions, fasteners
      steel: p('steel-machined', {
        color: '#9aa3ad',
        roughness: 0.26,
        metalness: 1,
        envMapIntensity: 1.3,
      }),
      // Carbon composite: panels, radomes, dish backing
      composite: p('carbon-composite', {
        color: '#191c21',
        roughness: 0.3,
        metalness: 0.25,
        clearcoat: 1,
        clearcoatRoughness: 0.14,
        envMapIntensity: 1,
      }),
      // Reflector face: matte metallic steel, slightly brighter
      reflector: p('reflector-steel', {
        color: '#868e99',
        roughness: 0.58,
        metalness: 0.94,
        envMapIntensity: 1,
      }),
      // Optics: transmissive glass
      glass: p('optic-glass', {
        color: '#e6f8ff',
        roughness: 0.02,
        metalness: 0,
        transmission: 1,
        thickness: 0.32,
        ior: 1.62,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transparent: true,
        envMapIntensity: 1.6,
      }),
      // Coated optics: glossy black mirror glass
      optic: p('optic-coated', {
        color: '#04060a',
        roughness: 0.035,
        metalness: 0.15,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.8,
      }),
      // Cable jacket / boots
      rubber: p('cable-jacket', {
        color: '#0a0b0e',
        roughness: 0.82,
        metalness: 0.05,
      }),
      // Emissive set (MeshBasicMaterial → picked up by Bloom)
      neonPrimary: neon('emit-primary', colors.primary),
      neonLaser: neon('emit-laser', colors.laser),
      neonTelemetry: neon('emit-telemetry', colors.telemetry),
    };
  }, [colors.primary, colors.laser, colors.telemetry]);

  useEffect(
    () => () => Object.values(mats).forEach((m) => m.dispose && m.dispose()),
    [mats]
  );
  return mats;
}

/* ==========================================================================
 * 2. PRIMITIVE HELPERS — struts, fastener rings, fin stacks, harnesses
 * ======================================================================== */

/** A cylinder spanning two points — used for trusses, actuators, feed legs. */
export function Strut({ from, to, radius = 0.014, material, segments = 8 }) {
  const [fromX, fromY, fromZ] = from;
  const [toX, toY, toZ] = to;
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(fromX, fromY, fromZ);
    const b = new THREE.Vector3(toX, toY, toZ);
    const dir = b.clone().sub(a);
    const l = Math.max(dir.length(), 1e-4);
    return {
      pos: a.clone().add(b).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.clone().normalize()
      ),
      len: l,
    };
  }, [fromX, fromY, fromZ, toX, toY, toZ]);

  return (
    <mesh position={pos} quaternion={quat} material={material} castShadow>
      <cylinderGeometry args={[radius, radius, len, segments]} />
    </mesh>
  );
}

/** Instanced fastener ring — cheap density on every flange. */
export function BoltRing({
  radius,
  count = 16,
  y = 0,
  size = 0.019,
  material,
  axis = 'y',
}) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const v = new THREE.Vector3();
    if (axis === 'z') q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      if (axis === 'z') v.set(Math.cos(a) * radius, Math.sin(a) * radius, y);
      else v.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
      ref.current.setMatrixAt(i, m.compose(v, q, s));
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [radius, count, y, axis]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={material}>
      <cylinderGeometry args={[size, size * 0.78, size * 1.5, 6]} />
    </instancedMesh>
  );
}

/** Instanced fin stack — heat-sink radiators, pod cooling packs. */
export function FinStack({
  count = 12,
  pitch = 0.035,
  fin = [0.34, 0.24, 0.006],
  material,
}) {
  const ref = useRef();
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const span = (count - 1) * pitch;
    for (let i = 0; i < count; i++) {
      ref.current.setMatrixAt(
        i,
        m.compose(new THREE.Vector3(0, 0, -span / 2 + i * pitch), q, s)
      );
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [count, pitch]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, count]}
      material={material}
      castShadow
    >
      <boxGeometry args={fin} />
    </instancedMesh>
  );
}

/** Sagging cable run between two hardpoints. */
export function CableRun({ from, to, sag = 0.18, radius = 0.018, material }) {
  const [fromX, fromY, fromZ] = from;
  const [toX, toY, toZ] = to;
  const geo = useMemo(() => {
    const a = new THREE.Vector3(fromX, fromY, fromZ);
    const b = new THREE.Vector3(toX, toY, toZ);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const q1 = a.clone().lerp(b, 0.3);
    const q2 = a.clone().lerp(b, 0.7);
    q1.y -= sag * 0.85;
    q2.y -= sag * 0.85;
    mid.y -= sag;
    const curve = new THREE.CatmullRomCurve3([a, q1, mid, q2, b]);
    return new THREE.TubeGeometry(curve, 30, radius, 8, false);
  }, [fromX, fromY, fromZ, toX, toY, toZ, sag, radius]);

  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} material={material} castShadow />;
}

/** Pulsing emissive node: color + optional point light breathe together. */
export function StatusNode({
  position,
  size = 0.022,
  tone = 'neonPrimary',
  speed = 2.2,
  phase = 0,
  light = 0,
  shape = 'sphere',
}) {
  const M = useMats();
  const mat = useMemo(() => M[tone].clone(), [M, tone]);
  const base = useMemo(() => mat.color.clone(), [mat]);
  const lightRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    const k = 0.32 + 0.68 * Math.pow(0.5 + 0.5 * Math.sin(t), 2.2);
    mat.color.copy(base).multiplyScalar(0.35 + k);
    if (lightRef.current) lightRef.current.intensity = light * k;
  });

  return (
    <group position={position}>
      <mesh material={mat}>
        {shape === 'sphere' ? (
          <sphereGeometry args={[size, 12, 12]} />
        ) : (
          <boxGeometry args={[size * 2.6, size * 0.7, size * 0.7]} />
        )}
      </mesh>
      {light > 0 && (
        <pointLight
          ref={lightRef}
          color={base}
          distance={1.6}
          decay={2}
          intensity={light}
        />
      )}
    </group>
  );
}

/* ==========================================================================
 * 3. BASE PLATFORM — octagonal structural hub
 * ======================================================================== */

export function BasePlatform() {
  const M = useMats();
  const DECK_R = 1.5;

  const vents = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return {
          key: i,
          pos: [Math.cos(a) * 1.045, 0.42, Math.sin(a) * 1.045],
          rot: [0, -a, 0],
          grille: i % 2 === 0,
        };
      }),
    []
  );

  return (
    <group name="base-platform">
      {/* ground pads + legs */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
        const x = Math.cos(a) * 1.62;
        const z = Math.sin(a) * 1.62;
        return (
          <group key={i}>
            <mesh position={[x, 0.025, z]} material={M.hullDark} castShadow receiveShadow>
              <cylinderGeometry args={[0.22, 0.26, 0.05, 6]} />
            </mesh>
            <mesh position={[x, 0.07, z]} material={M.steel}>
              <cylinderGeometry args={[0.055, 0.055, 0.05, 12]} />
            </mesh>
            <Strut from={[x, 0.09, z]} to={[x * 0.55, 0.44, z * 0.55]} radius={0.045} material={M.hull} />
            <Strut from={[x * 0.98, 0.09, z * 0.98]} to={[x * 0.42, 0.2, z * 0.42]} radius={0.022} material={M.steel} />
          </group>
        );
      })}

      {/* base plate */}
      <mesh position={[0, 0.1, 0]} material={M.hullDark} castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.36, 0.1, 8]} />
      </mesh>

      {/* pedestal drum */}
      <mesh position={[0, 0.42, 0]} material={M.hull} castShadow receiveShadow>
        <cylinderGeometry args={[1.02, 1.18, 0.54, 8]} />
      </mesh>
      {/* vertical corner buttresses */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 1.09, 0.42, Math.sin(a) * 1.09]}
            rotation={[0, -a, 0]}
            material={M.hullDark}
            castShadow
          >
            <boxGeometry args={[0.07, 0.5, 0.14]} />
          </mesh>
        );
      })}

      {/* side service panels + louvered vents */}
      {vents.map((v) => (
        <group key={v.key} position={v.pos} rotation={v.rot}>
          <mesh material={M.hullDark} castShadow>
            <boxGeometry args={[0.035, 0.34, 0.5]} />
          </mesh>
          {v.grille ? (
            <group position={[0.028, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <FinStack count={7} pitch={0.045} fin={[0.3, 0.012, 0.03]} material={M.steel} />
            </group>
          ) : (
            <mesh position={[0.03, -0.1, 0.14]} material={M.steel}>
              <boxGeometry args={[0.02, 0.06, 0.16]} />
            </mesh>
          )}
        </group>
      ))}

      {/* deck + chamfer plate */}
      <mesh position={[0, 0.755, 0]} material={M.hull} castShadow receiveShadow>
        <cylinderGeometry args={[DECK_R, DECK_R * 0.99, 0.13, 8]} />
      </mesh>
      <mesh position={[0, 0.845, 0]} material={M.mount} castShadow receiveShadow>
        <cylinderGeometry args={[1.4, 1.46, 0.06, 8]} />
      </mesh>
      <mesh position={[0, 0.69, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
        <torusGeometry args={[1.19, 0.028, 8, 40]} />
      </mesh>
      <BoltRing radius={1.31} count={24} y={0.879} material={M.steel} />

      {/* deck panel seams */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.78, 0.879, Math.sin(a) * 0.78]}
            rotation={[0, -a, 0]}
            material={M.hullDark}
          >
            <boxGeometry args={[1.22, 0.006, 0.014]} />
          </mesh>
        );
      })}
      {[0.62, 1.06].map((r, i) => (
        <mesh key={i} position={[0, 0.879, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.hullDark}>
          <torusGeometry args={[r, 0.006, 4, 8 * (i + 3)]} />
        </mesh>
      ))}

      {/* deck greebles: junction boxes + conduit */}
      {[
        [0.62, -0.98, 0.24],
        [-1.12, 0.15, -0.3],
        [0.2, 1.16, 0.16],
      ].map(([x, z, w], i) => (
        <group key={i} position={[x, 0.94, z]} rotation={[0, Math.atan2(x, z), 0]}>
          <mesh material={M.hullDark} castShadow>
            <boxGeometry args={[w, 0.13, 0.17]} />
          </mesh>
          <mesh position={[0, 0.075, 0]} material={M.steel}>
            <boxGeometry args={[w * 0.55, 0.012, 0.1]} />
          </mesh>
          <StatusNode
            position={[w * 0.32, 0.02, 0.09]}
            size={0.011}
            tone={i === 1 ? 'neonTelemetry' : 'neonPrimary'}
            speed={1.6 + i * 0.7}
            phase={i * 1.9}
          />
        </group>
      ))}

      {/* heat-sink radiators on two pedestal faces */}
      {[Math.PI * 0.25, Math.PI * 1.25].map((a, i) => (
        <group
          key={i}
          position={[Math.cos(a) * 1.16, 0.45, Math.sin(a) * 1.16]}
          rotation={[0, -a + Math.PI / 2, 0]}
        >
          <mesh material={M.hullDark} castShadow>
            <boxGeometry args={[0.5, 0.36, 0.03]} />
          </mesh>
          <group position={[0, 0, 0.09]} rotation={[0, Math.PI / 2, 0]}>
            <FinStack count={13} pitch={0.038} fin={[0.14, 0.3, 0.006]} material={M.hull} />
          </group>
        </group>
      ))}
    </group>
  );
}

/* ==========================================================================
 * 4. PARABOLIC DISH + DUAL-AXIS GIMBAL
 * ======================================================================== */

export function ParabolicDish({
  radius = 0.98,
  focal = 0.46,
  pedestal = 0.42,
  sweep = { pan: 0.85, panRate: 0.16, tilt: 0.34, tiltRate: 0.1, phase: 0 },
  feedTone = 'neonPrimary',
  ...props
}) {
  const M = useMats();
  const panRef = useRef();
  const tiltRef = useRef();

  // Every piece of hardware is dimensioned relative to the reference aperture,
  // so the assembly stays self-similar at any dish size.
  const k = radius / 0.98;
  const s = (v) => v * k;

  const f = radius * focal;
  const yAt = (r) => (r * r) / (4 * f);
  const rimY = yAt(radius);
  const shell = s(0.05); // reflector thickness
  const back = s(0.075); // rib/ring standoff behind the concave face

  const profile = useMemo(() => {
    const N = 26;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const r = (radius * i) / N;
      pts.push(new THREE.Vector2(Math.max(r, 0.001), yAt(r)));
    }
    pts.push(new THREE.Vector2(radius + s(0.022), rimY + s(0.03)));
    for (let i = N; i >= 0; i--) {
      const r = (radius * i) / N;
      pts.push(new THREE.Vector2(Math.max(r, 0.001), yAt(r) - shell));
    }
    return pts;
  }, [radius, f, shell]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // slow sky sweep with a shaped ease → reads as a search pattern
    const p = Math.sin(t * sweep.panRate + sweep.phase);
    panRef.current.rotation.y = sweep.pan * Math.sign(p) * Math.pow(Math.abs(p), 0.75);
    tiltRef.current.rotation.x = -(
      sweep.tilt +
      0.2 * Math.sin(t * sweep.tiltRate * 1.7 + sweep.phase * 2)
    );
  });

  return (
    <group name="parabolic-dish" {...props}>
      {/* fixed pedestal + azimuth bearing */}
      {/* tapered pylon: slim neck so the reflector sweeps outside it */}
      <mesh position={[0, pedestal / 2, 0]} material={M.hull} castShadow receiveShadow>
        <cylinderGeometry args={[s(0.09), s(0.28), pedestal, 12]} />
      </mesh>
      <BoltRing radius={s(0.25)} count={12} y={0.012} size={s(0.016)} material={M.steel} />
      <mesh position={[0, pedestal + s(0.02), 0]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
        <torusGeometry args={[s(0.11), s(0.024), 10, 28]} />
      </mesh>

      <group ref={panRef} position={[0, pedestal, 0]}>
        {/* azimuth housing + drive motor — kept below the reflector's sweep */}
        <mesh position={[0, s(0.05), 0]} material={M.mount} castShadow>
          <cylinderGeometry args={[s(0.15), s(0.17), s(0.1), 16]} />
        </mesh>
        <group position={[s(0.23), s(0.05), 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={M.mount} castShadow>
            <cylinderGeometry args={[s(0.055), s(0.055), s(0.16), 14]} />
          </mesh>
          <FinStack count={5} pitch={s(0.026)} fin={[s(0.09), s(0.09), s(0.005)]} material={M.steel} />
        </group>

        {/* yoke arms + trunnion — tall enough that the reflector's lower
            quadrant sweeps outside the support column at every elevation */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * s(0.28), s(0.67), -s(0.2)]} material={M.mount} castShadow>
            <boxGeometry args={[s(0.08), s(1.06), s(0.13)]} />
          </mesh>
        ))}
        {[0.38, 0.82].map((y, i) => (
          <mesh key={i} position={[0, s(y), -s(0.26)]} material={M.hullDark} castShadow>
            <boxGeometry args={[s(0.56), s(0.06), s(0.1)]} />
          </mesh>
        ))}
        <mesh position={[0, s(1.18), 0]} rotation={[0, 0, Math.PI / 2]} material={M.steel}>
          <cylinderGeometry args={[s(0.045), s(0.045), s(0.62), 14]} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * s(0.28), s(1.18), -s(0.1)]}
            material={M.mount}
            castShadow
          >
            <boxGeometry args={[s(0.08), s(0.13), s(0.26)]} />
          </mesh>
        ))}
        <mesh
          position={[s(0.31), s(1.18), 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={M.mount}
          castShadow
        >
          <cylinderGeometry args={[s(0.085), s(0.085), s(0.06), 18]} />
        </mesh>
        <BoltRing radius={s(0.055)} count={8} y={0} size={s(0.011)} axis="z" material={M.steel} />

        {/* elevation assembly */}
        <group ref={tiltRef} position={[0, s(1.18), 0]}>
          {/* standoff spine: trunnion → reflector hub */}
          <mesh position={[0, 0, s(0.17)]} material={M.mount} castShadow>
            <boxGeometry args={[s(0.19), s(0.15), s(0.34)]} />
          </mesh>
          {[-1, 1].map((side) => (
            <Strut
              key={side}
              from={[side * s(0.085), 0, s(0.04)]}
              to={[side * s(0.15), -s(0.02), s(0.33)]}
              radius={s(0.018)}
              material={M.steel}
            />
          ))}

          {/* dish shell: profile lathed, boresight rotated to +Z */}
          <group position={[0, 0, s(0.34)]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh material={M.reflector} castShadow receiveShadow>
              <latheGeometry args={[profile, 72]} />
            </mesh>
            {/* hub + back structure */}
            <mesh position={[0, -shell - s(0.05), 0]} material={M.composite} castShadow>
              <cylinderGeometry args={[s(0.16), s(0.2), s(0.16), 16]} />
            </mesh>
            {[0.55, 0.82].map((t, i) => (
              <mesh
                key={i}
                position={[0, yAt(radius * t) - shell - back, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                material={M.hullDark}
              >
                <torusGeometry args={[radius * t, s(0.016), 6, 48]} />
              </mesh>
            ))}
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const stops = [0.14, 0.42, 0.7, 0.97].map((t) => radius * t);
              return stops.slice(0, -1).map((r0, j) => {
                const r1 = stops[j + 1];
                return (
                  <Strut
                    key={`${i}-${j}`}
                    from={[Math.cos(a) * r0, yAt(r0) - shell - back, Math.sin(a) * r0]}
                    to={[Math.cos(a) * r1, yAt(r1) - shell - back, Math.sin(a) * r1]}
                    radius={s(0.013)}
                    material={M.hullDark}
                  />
                );
              });
            })}
            {/* prime-focus feed: tripod legs, horn, subreflector */}
            {Array.from({ length: 3 }, (_, i) => {
              const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
              const r = radius * 0.86;
              return (
                <Strut
                  key={i}
                  from={[Math.cos(a) * r, yAt(r), Math.sin(a) * r]}
                  to={[0, f + s(0.06), 0]}
                  radius={s(0.017)}
                  material={M.steel}
                />
              );
            })}
            <mesh position={[0, f + s(0.02), 0]} material={M.mount} castShadow>
              <cylinderGeometry args={[s(0.13), s(0.055), s(0.2), 20]} />
            </mesh>
            <mesh position={[0, f + s(0.15), 0]} material={M.hullDark} castShadow>
              <cylinderGeometry args={[s(0.06), s(0.075), s(0.1), 16]} />
            </mesh>
            <mesh
              position={[0, f - s(0.085), 0]}
              rotation={[Math.PI / 2, 0, 0]}
              material={M[feedTone]}
            >
              <torusGeometry args={[s(0.115), s(0.011), 8, 28]} />
            </mesh>
            <StatusNode
              position={[0, f - s(0.06), 0]}
              size={s(0.021)}
              tone={feedTone}
              speed={1.4}
              light={0.8 * k}
            />
            {/* feed waveguide down to the hub */}
            <CableRun
              from={[s(0.055), f - s(0.02), s(0.04)]}
              to={[s(0.12), s(0.06), s(0.11)]}
              sag={s(0.06)}
              radius={s(0.016)}
              material={M.rubber}
            />
          </group>

          {/* counterweight + rear electronics can */}
          <mesh position={[0, 0, -s(0.22)]} material={M.hullDark} castShadow>
            <cylinderGeometry args={[s(0.3), s(0.34), s(0.12), 18]} />
          </mesh>
          <mesh position={[0, 0, -s(0.33)]} material={M.mount} castShadow>
            <boxGeometry args={[s(0.34), s(0.2), s(0.14)]} />
          </mesh>
          <StatusNode
            position={[s(0.1), s(0.07), -s(0.4)]}
            size={s(0.014)}
            tone="neonTelemetry"
            speed={3.1}
            shape="bar"
          />
        </group>
      </group>
    </group>
  );
}

/* ==========================================================================
 * 5. OPTICAL / LIDAR TURRET
 * ======================================================================== */

export function OpticalTurret({
  scale = 1,
  phase = 0,
  yawRate = 0.24,
  yawRange = 1.5,
  laser = false,
  ...props
}) {
  const M = useMats();
  const yawRef = useRef();
  const pitchRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const s = Math.sin(t * yawRate + phase);
    yawRef.current.rotation.y = yawRange * Math.sign(s) * Math.pow(Math.abs(s), 0.7);
    pitchRef.current.rotation.x = 0.1 + 0.26 * Math.sin(t * 0.33 + phase * 1.7);
  });

  return (
    <group name="optical-turret" scale={scale} {...props}>
      {/* fixed collar */}
      <mesh position={[0, 0.035, 0]} material={M.hullDark} castShadow receiveShadow>
        <cylinderGeometry args={[0.19, 0.22, 0.07, 16]} />
      </mesh>
      <BoltRing radius={0.175} count={10} y={0.072} size={0.014} material={M.steel} />

      <group ref={yawRef} position={[0, 0.07, 0]}>
        <mesh position={[0, 0.055, 0]} material={M.mount} castShadow>
          <cylinderGeometry args={[0.15, 0.165, 0.11, 20]} />
        </mesh>
        <mesh position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
          <torusGeometry args={[0.145, 0.014, 8, 28]} />
        </mesh>
        {/* yoke */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.145, 0.21, 0]} material={M.mount} castShadow>
            <boxGeometry args={[0.05, 0.22, 0.11]} />
          </mesh>
        ))}
        <mesh position={[0.175, 0.28, 0]} rotation={[0, 0, Math.PI / 2]} material={M.hullDark} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.05, 16]} />
        </mesh>

        <group ref={pitchRef} position={[0, 0.28, 0]}>
          {/* sensor pod, boresight +Z */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={M.hull} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.44, 24]} />
          </mesh>
          <mesh position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]} material={M.mount} castShadow>
            <cylinderGeometry args={[0.158, 0.148, 0.05, 24]} />
          </mesh>
          <mesh position={[0, 0, -0.23]} rotation={[Math.PI / 2, 0, 0]} material={M.hullDark} castShadow>
            <cylinderGeometry args={[0.14, 0.12, 0.06, 20]} />
          </mesh>
          {/* dorsal rail + cooling pack */}
          <mesh position={[0, 0.15, -0.02]} material={M.hullDark} castShadow>
            <boxGeometry args={[0.1, 0.03, 0.3]} />
          </mesh>
          <group position={[0, 0.1, -0.1]}>
            <FinStack count={9} pitch={0.026} fin={[0.16, 0.1, 0.005]} material={M.steel} />
          </group>

          {/* main aperture: barrel + coated optic + transmissive lens */}
          <group position={[0, 0, 0.245]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={M.mount} castShadow>
              <cylinderGeometry args={[0.115, 0.12, 0.06, 24]} />
            </mesh>
            <mesh position={[0, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]} material={M.optic}>
              <cylinderGeometry args={[0.1, 0.1, 0.012, 24]} />
            </mesh>
            <mesh position={[0, 0, 0.042]} material={M.glass}>
              <sphereGeometry args={[0.1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.34]} />
            </mesh>
            <mesh position={[0, 0, 0.036]} material={M.neonPrimary}>
              <torusGeometry args={[0.105, 0.0055, 6, 32]} />
            </mesh>
          </group>

          {/* secondary lens bank */}
          {[
            [-0.095, 0.075],
            [0.095, 0.075],
            [0, -0.105],
          ].map(([x, y], i) => (
            <group key={i} position={[x, y, 0.235]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} material={M.hullDark} castShadow>
                <cylinderGeometry args={[0.042, 0.045, 0.05, 16]} />
              </mesh>
              <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} material={M.optic}>
                <cylinderGeometry args={[0.033, 0.033, 0.008, 16]} />
              </mesh>
              <mesh position={[0, 0, 0.035]} material={M.glass}>
                <sphereGeometry args={[0.033, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.36]} />
              </mesh>
            </group>
          ))}

          {/* laser rangefinder / LIDAR tube */}
          <group position={[0.155, -0.03, 0.13]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={M.mount} castShadow>
              <cylinderGeometry args={[0.032, 0.032, 0.34, 16]} />
            </mesh>
            <mesh position={[0, 0, 0.175]} rotation={[Math.PI / 2, 0, 0]} material={M.steel}>
              <cylinderGeometry args={[0.036, 0.03, 0.03, 16]} />
            </mesh>
            <StatusNode
              position={[0, 0, 0.196]}
              size={0.021}
              tone={laser ? 'neonLaser' : 'neonPrimary'}
              speed={5.5}
              phase={phase * 3}
              light={laser ? 1.5 : 0.9}
            />
          </group>

          <StatusNode position={[-0.15, 0.06, 0.02]} size={0.012} tone="neonTelemetry" speed={2.4} phase={phase} shape="bar" />
          <pointLight
            position={[0, 0, 0.4]}
            color={TUNING.colors.primary}
            intensity={0.7}
            distance={1.4}
            decay={2}
          />
        </group>
      </group>

      {/* service loop at the base */}
      <CableRun from={[-0.16, 0.11, 0.08]} to={[0.02, 0.08, 0.22]} sag={0.03} radius={0.016} material={M.rubber} />
    </group>
  );
}

/* ==========================================================================
 * 6. PHASED-ARRAY PANEL
 * ======================================================================== */

export function PhasedArrayPanel({
  w = 0.92,
  h = 0.66,
  cols = 12,
  rows = 9,
  phase = 0,
  ...props
}) {
  const M = useMats();
  const hingeRef = useRef();
  const patchRef = useRef();
  const liveRef = useRef();
  const liveMat = useMemo(() => M.neonPrimary.clone(), [M]);

  const grid = useMemo(() => {
    const pad = 0.06;
    const cw = (w - pad * 2) / cols;
    const ch = (h - pad * 2) / rows;
    const cells = [];
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++)
        cells.push([
          -w / 2 + pad + cw * (c + 0.5),
          -h / 2 + pad + ch * (r + 0.5),
        ]);
    return { cells, cw, ch };
  }, [w, h, cols, rows]);

  // deterministic subset of "live" emitters
  const live = useMemo(
    () => grid.cells.filter((_, i) => (i * 7 + 3) % 17 === 0),
    [grid]
  );

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    grid.cells.forEach(([x, y], i) =>
      patchRef.current.setMatrixAt(i, m.compose(new THREE.Vector3(x, y, 0.032), q, s))
    );
    patchRef.current.instanceMatrix.needsUpdate = true;
    live.forEach(([x, y], i) =>
      liveRef.current.setMatrixAt(i, m.compose(new THREE.Vector3(x, y, 0.04), q, s))
    );
    liveRef.current.instanceMatrix.needsUpdate = true;
  }, [grid, live]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    hingeRef.current.rotation.x = -0.5 + 0.08 * Math.sin(t * 0.21 + phase);
    const k = 0.4 + 0.6 * Math.pow(0.5 + 0.5 * Math.sin(t * 3.1 + phase * 2), 3);
    liveMat.color.setStyle(TUNING.colors.primary);
    liveMat.color.multiplyScalar(0.4 + k);
  });

  return (
    <group name="phased-array" {...props}>
      {/* mount bracket + hinge */}
      <mesh position={[0, 0.06, 0]} material={M.hullDark} castShadow>
        <boxGeometry args={[0.4, 0.12, 0.16]} />
      </mesh>
      <mesh position={[0, 0.13, 0]} rotation={[0, 0, Math.PI / 2]} material={M.steel}>
        <cylinderGeometry args={[0.028, 0.028, 0.44, 14]} />
      </mesh>

      <group ref={hingeRef} position={[0, 0.13, 0]}>
        <group position={[0, h / 2 + 0.05, 0]}>
          {/* composite frame */}
          <mesh material={M.composite} castShadow receiveShadow>
            <boxGeometry args={[w, h, 0.035]} />
          </mesh>
          {/* recessed emitter field */}
          <mesh position={[0, 0, 0.014]} material={M.mount}>
            <boxGeometry args={[w - 0.075, h - 0.075, 0.016]} />
          </mesh>
          {/* micro patch elements */}
          <instancedMesh
            ref={patchRef}
            args={[undefined, undefined, grid.cells.length]}
            material={M.steel}
          >
            <boxGeometry args={[grid.cw * 0.62, grid.ch * 0.62, 0.01]} />
          </instancedMesh>
          <instancedMesh
            ref={liveRef}
            args={[undefined, undefined, live.length]}
            material={liveMat}
          >
            <boxGeometry args={[grid.cw * 0.34, grid.ch * 0.34, 0.006]} />
          </instancedMesh>
          {/* perimeter rails + rear stiffeners */}
          {[
            [0, h / 2 - 0.018, w - 0.02, 0.03],
            [0, -h / 2 + 0.018, w - 0.02, 0.03],
          ].map(([x, y, bw, bh], i) => (
            <mesh key={`h${i}`} position={[x, y, 0.03]} material={M.hullDark}>
              <boxGeometry args={[bw, bh, 0.028]} />
            </mesh>
          ))}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * (w / 2 - 0.018), 0, 0.03]} material={M.hullDark}>
              <boxGeometry args={[0.03, h - 0.02, 0.028]} />
            </mesh>
          ))}
          <mesh position={[0, h / 2 - 0.018, 0.046]} material={M.neonPrimary}>
            <boxGeometry args={[w * 0.66, 0.005, 0.004]} />
          </mesh>
          {[-0.22, 0.22].map((y, i) => (
            <mesh key={i} position={[0, y, -0.045]} material={M.hullDark} castShadow>
              <boxGeometry args={[w * 0.9, 0.05, 0.06]} />
            </mesh>
          ))}
        </group>
        {/* actuator ram */}
        <Strut from={[0.14, 0.02, 0.02]} to={[0.14, h * 0.55, -0.16]} radius={0.02} material={M.steel} />
      </group>
      <CableRun from={[-0.16, 0.13, 0.05]} to={[0.06, 0.09, 0.2]} sag={0.03} radius={0.014} material={M.rubber} />
    </group>
  );
}

/* ==========================================================================
 * 7. TELEMETRY MAST — lattice tower, whips, beacon
 * ======================================================================== */

export function TelemetryMast({ height = 1.35, radius = 0.11, ...props }) {
  const M = useMats();
  const levels = 5;
  const rails = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => {
        const a = (i / 3) * Math.PI * 2;
        return [Math.cos(a) * radius, Math.sin(a) * radius];
      }),
    [radius]
  );

  return (
    <group name="telemetry-mast" {...props}>
      <mesh position={[0, 0.04, 0]} material={M.hullDark} castShadow>
        <cylinderGeometry args={[0.19, 0.21, 0.08, 12]} />
      </mesh>
      {rails.map(([x, z], i) => (
        <Strut key={i} from={[x, 0.06, z]} to={[x, height, z]} radius={0.017} material={M.hull} />
      ))}
      {Array.from({ length: levels }, (_, l) => {
        const y0 = 0.1 + (l * (height - 0.16)) / levels;
        const y1 = 0.1 + ((l + 1) * (height - 0.16)) / levels;
        return rails.map(([x, z], i) => {
          const [nx, nz] = rails[(i + 1) % 3];
          return (
            <React.Fragment key={`${l}-${i}`}>
              <Strut from={[x, y0, z]} to={[nx, y1, nz]} radius={0.008} material={M.steel} />
              <Strut from={[x, y1, z]} to={[nx, y1, nz]} radius={0.007} material={M.steel} />
            </React.Fragment>
          );
        });
      })}
      <mesh position={[0, height + 0.02, 0]} material={M.mount} castShadow>
        <cylinderGeometry args={[0.16, 0.13, 0.05, 16]} />
      </mesh>
      {/* omni whips + GPS puck */}
      {[
        [0.075, 0.4, 0.0],
        [-0.05, 0.32, 0.06],
      ].map(([x, l, z], i) => (
        <group key={i}>
          <mesh position={[x, height + l / 2 + 0.05, z]} material={M.hullDark}>
            <cylinderGeometry args={[0.007, 0.009, l, 8]} />
          </mesh>
          <mesh position={[x, height + l + 0.06, z]} material={M.steel}>
            <sphereGeometry args={[0.014, 10, 10]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, height + 0.07, 0]} material={M.hullDark} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.035, 16]} />
      </mesh>
      <StatusNode position={[0, height + 0.11, 0]} size={0.02} tone="neonLaser" speed={1.9} light={1.2} />
      {/* two dipole cross-arms */}
      {[0.45, 0.78].map((k, i) => (
        <group key={i} position={[0, height * k, 0]} rotation={[0, i * 0.9, 0]}>
          <mesh material={M.steel}>
            <boxGeometry args={[0.42, 0.008, 0.008]} />
          </mesh>
          {[-0.19, 0.19].map((x, j) => (
            <mesh key={j} position={[x, 0.05, 0]} material={M.steel}>
              <cylinderGeometry args={[0.005, 0.005, 0.1, 6]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ==========================================================================
 * 8. THE CLUSTER — hierarchical assembly + 360° platform sweep
 * ======================================================================== */

export function SensorArrayCluster({ spin = TUNING.spin, colors, ...props }) {
  const mats = useMaterialPalette(colors);
  const spinRef = useRef();
  useFrame((_, dt) => {
    spinRef.current.rotation.y += spin * Math.min(dt, 0.05);
  });

  const DECK = 0.88; // deck top surface

  return (
    <MatCtx.Provider value={mats}>
      <group ref={spinRef} name="sensor-array-cluster" {...props}>
        <BasePlatform />

        {/* primary S-band dish */}
        <ParabolicDish
          position={[-0.5, DECK, -0.58]}
          rotation={[0, 0.55, 0]}
          radius={0.98}
          pedestal={0.16}
          sweep={{ pan: 0.85, panRate: 0.15, tilt: 0.42, tiltRate: 0.09, phase: 0 }}
        />

        {/* secondary high-frequency dish — faster, tighter sweep */}
        <ParabolicDish
          position={[0.82, DECK, -0.42]}
          rotation={[0, -0.7, 0]}
          radius={0.46}
          focal={0.4}
          pedestal={0.12}
          sweep={{ pan: 1.25, panRate: 0.34, tilt: 0.5, tiltRate: 0.27, phase: 2.1 }}
          feedTone="neonTelemetry"
        />

        {/* optical / LIDAR turrets */}
        <OpticalTurret position={[0.55, DECK, 0.85]} rotation={[0, -0.5, 0]} scale={1} laser phase={0.4} />
        <OpticalTurret position={[-0.78, DECK, 0.72]} rotation={[0, 0.6, 0]} scale={0.78} phase={2.6} yawRate={0.38} />
        <OpticalTurret position={[-1.02, DECK, -0.42]} rotation={[0, 1.9, 0]} scale={0.62} phase={4.3} yawRate={0.52} yawRange={2.2} />

        {/* planar emitters on the flanks */}
        <PhasedArrayPanel position={[1.16, DECK, 0.5]} rotation={[0, -1.05, 0]} phase={0.6} />
        <PhasedArrayPanel position={[-0.2, DECK, 1.2]} rotation={[0, 0.2, 0]} w={0.78} h={0.56} cols={10} rows={8} phase={2.9} />

        <TelemetryMast position={[1.02, DECK, -1.0]} />

        {/* harnesses tying the sensor heads back to the core */}
        <CableRun from={[-0.5, DECK + 0.1, -0.5]} to={[-0.1, DECK + 0.07, 0.1]} sag={0.035} material={mats.rubber} />
        <CableRun from={[0.55, DECK + 0.1, 0.85]} to={[0.16, DECK + 0.07, 0.3]} sag={0.04} material={mats.rubber} />
        <CableRun from={[1.02, DECK + 0.1, -1.0]} to={[0.5, DECK + 0.07, -0.36]} sag={0.045} material={mats.rubber} />
        <CableRun from={[1.16, DECK + 0.1, 0.5]} to={[0.62, DECK + 0.07, 0.12]} sag={0.03} radius={0.014} material={mats.rubber} />

        {/* deck data nodes — travelling pulse */}
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2 + 0.3;
          return (
            <StatusNode
              key={i}
              position={[Math.cos(a) * 1.36, DECK + 0.01, Math.sin(a) * 1.36]}
              size={0.016}
              tone={i % 3 === 0 ? 'neonTelemetry' : 'neonPrimary'}
              speed={2.6}
              phase={i * 0.7}
              light={i % 3 === 0 ? 0.22 : 0}
            />
          );
        })}
      </group>
    </MatCtx.Provider>
  );
}

/* ==========================================================================
 * 9. ENVIRONMENT — HDRI preset with a procedural fallback
 * ======================================================================== */

class Boundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Studio lightformer rig — no network, still gives crisp specular streaks. */
function ProceduralEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer intensity={2.4} color="#8fdcff" position={[0, 5, -6]} scale={[12, 4, 1]} />
      <Lightformer intensity={1.2} color="#3d6cff" position={[-6, 2, 2]} scale={[6, 8, 1]} rotation-y={Math.PI / 2} />
      <Lightformer intensity={0.9} color="#ffffff" position={[6, 3, -1]} scale={[5, 6, 1]} rotation-y={-Math.PI / 2} />
      <Lightformer intensity={0.5} color="#00e0ff" position={[0, -3, 3]} scale={[10, 3, 1]} rotation-x={Math.PI / 2} />
    </Environment>
  );
}

function SceneEnvironment({ preset = TUNING.envPreset }) {
  return (
    <Boundary fallback={<ProceduralEnvironment />}>
      <Suspense fallback={<ProceduralEnvironment />}>
        <Environment preset={preset} environmentIntensity={0.9} />
      </Suspense>
    </Boundary>
  );
}

/* ==========================================================================
 * 10. SCENE — lights, ground, controls, post
 * ======================================================================== */

export function SensorArrayScene({
  spin = TUNING.spin,
  colors = TUNING.colors,
  bloom = TUNING.bloom,
  envPreset = TUNING.envPreset,
  showGrid = true,
  gl,
  className,
  style,
  ...rest // forwarded to <Canvas> (resize, frameloop, onCreated, …)
}) {
  return (
    <Canvas
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance', ...gl }}
      camera={{ position: [6.4, 3.3, 7.2], fov: 36, near: 0.1, far: 120 }}
      {...rest}
    >
      <color attach="background" args={['#05070c']} />
      <fog attach="fog" args={['#05070c', 16, 44]} />

      {/* key + rim + fill */}
      <hemisphereLight args={['#7fb2d8', '#05070c', 0.35]} />
      <directionalLight
        position={[7, 9, 5]}
        intensity={1.5}
        color="#dfefff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />
      <spotLight position={[-8, 5, -6]} angle={0.7} penumbra={1} intensity={70} color="#2f6bff" distance={30} />
      <spotLight position={[4, 2.2, -8]} angle={0.8} penumbra={1} intensity={26} color={colors.primary} distance={26} />
      <pointLight position={[0, 1.2, 6]} intensity={3.5} color="#9fc4ff" distance={14} decay={2} />

      <SceneEnvironment preset={envPreset} />

      <Suspense fallback={null}>
        <SensorArrayCluster spin={spin} colors={colors} />
      </Suspense>

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color="#0a0d13" roughness={0.85} metalness={0.2} />
      </mesh>
      {showGrid && (
        <Grid
          position={[0, 0.002, 0]}
          args={[30, 30]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#121a22"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#0d4a58"
          fadeDistance={22}
          fadeStrength={2.2}
          infiniteGrid
        />
      )}
      <ContactShadows position={[0, 0.004, 0]} scale={11} resolution={1024} opacity={0.62} blur={2.2} far={5} color="#000308" />

      <OrbitControls
        makeDefault
        enableZoom={false}
        enableDamping
        dampingFactor={0.06}
        target={[0, 1.35, 0]}
        minDistance={3.6}
        maxDistance={22}
        minPolarAngle={0.12}
        maxPolarAngle={1.52}
      />

      <EffectComposer multisampling={4} disableNormalPass>
        <Bloom
          intensity={bloom.intensity}
          luminanceThreshold={bloom.threshold}
          luminanceSmoothing={bloom.smoothing}
          mipmapBlur
          radius={0.62}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.72} />
      </EffectComposer>
    </Canvas>
  );
}

export default SensorArrayScene;
