"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment, Lightformer, OrbitControls, Stars, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group, PerspectiveCamera } from "three";
import { SceneActivity } from "../../3D Objects/SceneActivity.jsx";
import {
  industryChapters,
  type IndustryChapter,
  type IndustryModelConfig,
  type IndustryModelId,
} from "./industryConfig";

const loadDatacenterScene = () => import("../../3D Objects/DatacenterScene.jsx");
const loadCyberSecurity = () => import("../../3D Objects/CyberSecurityHologram.jsx");
const loadDroneScene = () => import("../../3D Objects/Drone.jsx");
const loadNuclearPlant = () => import("../../3D Objects/NuclearPlantComplex.jsx");
const loadParticleAccelerator = () => import("../../3D Objects/ParticleAccelerator.jsx");
const loadSatelliteScene = () => import("../../3D Objects/SatelliteScene.jsx");
const loadSensorArray = () => import("../../3D Objects/SensorArray.jsx");

const CyberSecurityModel = dynamic(() => loadCyberSecurity().then((module) => module.Assembly), { ssr: false });
const DatacenterModel = dynamic(() => loadDatacenterScene().then((module) => module.Datacenter), { ssr: false });
const DroneModel = dynamic(() => loadDroneScene().then((module) => module.Drone), { ssr: false });
const NuclearPlantModel = dynamic(() => loadNuclearPlant().then((module) => module.PlantComplex), { ssr: false });
const ParticleAcceleratorModel = dynamic(
  () => loadParticleAccelerator().then((module) => module.Accelerator),
  { ssr: false },
);
const SatelliteModel = dynamic(() => loadSatelliteScene().then((module) => module.Satellite), { ssr: false });
const SensorArrayModel = dynamic(() => loadSensorArray().then((module) => module.SensorArrayCluster), { ssr: false });

const scenePreloadTasks: ReadonlyArray<{ id: IndustryModelId; load: () => Promise<unknown> }> = [
  { id: "drone", load: loadDroneScene },
  { id: "datacenter", load: loadDatacenterScene },
  { id: "satellite", load: loadSatelliteScene },
  { id: "particle-accelerator", load: loadParticleAccelerator },
  { id: "cyber-security", load: loadCyberSecurity },
  { id: "sensor-array", load: loadSensorArray },
  { id: "nuclear-plant", load: loadNuclearPlant },
];

const renderReadyModelIds = new Set<IndustryModelId>();
const preloadListeners = new Set<(modelId: IndustryModelId) => void>();
let assetPreloadStarted = false;

function announceRenderReady(modelId: IndustryModelId) {
  renderReadyModelIds.add(modelId);
  preloadListeners.forEach((listener) => listener(modelId));
}

/** Parse every scene module ahead of the story without creating one WebGL context per chapter. */
export function scheduleIndustryAssetPreload(onRenderReady: (modelId: IndustryModelId) => void) {
  if (typeof window === "undefined") return () => undefined;

  renderReadyModelIds.forEach(onRenderReady);
  preloadListeners.add(onRenderReady);

  if (!assetPreloadStarted) {
    assetPreloadStarted = true;
    useGLTF.preload("/3d/quantum-computer.glb");
    announceRenderReady("quantum-computer");
    let taskIndex = 0;

    const runNext = async () => {
      const task = scenePreloadTasks[taskIndex++];
      if (!task) return;
      try {
        await task.load();
        announceRenderReady(task.id);
      } catch {
        // The chapter fallback remains available if a scene import fails.
      }
      scheduleNext();
    };

    const scheduleNext = () => {
      if (taskIndex >= scenePreloadTasks.length) return;
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => void runNext(), { timeout: 600 });
      } else {
        globalThis.setTimeout(() => void runNext(), 120);
      }
    };

    scheduleNext();
  }

  return () => preloadListeners.delete(onRenderReady);
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function QuantumComputerObject({
  model,
  reducedMotion,
  paused,
}: {
  model: IndustryModelConfig;
  reducedMotion: boolean;
  paused: boolean;
}) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(model.publicPath ?? "/3d/quantum-computer.glb");
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const rotation = model.framing.rotation ?? [0, 0, 0];

  useFrame((_, delta) => {
    if (!reducedMotion && !paused && group.current) {
      group.current.rotation.y += delta * Number(model.renderOptions.autoRotateSpeed ?? 0.18);
    }
  });

  return (
    <group
      ref={group}
      position={model.framing.position ?? [0, 0, 0]}
      rotation={rotation}
      scale={model.framing.modelScale ?? 1}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

const modelChapters = new Map(
  industryChapters.flatMap((chapter) => chapter.model ? [[chapter.model.id, chapter] as const] : []),
);

const cameraTargets: Partial<Record<IndustryModelId, readonly [number, number, number]>> = {
  "quantum-computer": [0, 0, 0],
  drone: [0, 0.1, 0],
  datacenter: [0, 1.06, 0],
  satellite: [0, 0, 0],
  "particle-accelerator": [0, 0.4, 0],
  "cyber-security": [0, 0, 0],
  "sensor-array": [0, 1.35, 0],
  "nuclear-plant": [0, 15, 0],
};

function SharedCamera({ activeModelId }: { activeModelId: IndustryModelId | null }) {
  const { camera, invalidate } = useThree();

  useEffect(() => {
    if (!activeModelId) return;
    const model = modelChapters.get(activeModelId)?.model;
    const framing = model?.framing.camera;
    if (!framing) return;
    camera.position.set(framing.position[0], framing.position[1], framing.position[2]);
    // Three.js cameras are intentionally mutable scene objects.
    // eslint-disable-next-line react-hooks/immutability
    (camera as PerspectiveCamera).fov = framing.fov;
    camera.lookAt(...(cameraTargets[activeModelId] ?? [0, 0, 0]));
    (camera as PerspectiveCamera).updateProjectionMatrix();
    invalidate();
  }, [activeModelId, camera, invalidate]);

  return null;
}

function ModelGroup({
  id,
  activeModelId,
  moving,
  children,
}: {
  id: IndustryModelId;
  activeModelId: IndustryModelId | null;
  moving: boolean;
  children: React.ReactNode;
}) {
  const active = activeModelId === id;
  const presentationScale = modelChapters.get(id)?.model?.presentation.scale ?? 1;

  return (
    <SceneActivity active={active} maxFps={moving ? 20 : 30}>
      <group
        name={`qf-industry-scene-${id}`}
        visible={active}
        scale={presentationScale}
        userData={{ qfActive: active }}
      >
        {children}
      </group>
    </SceneActivity>
  );
}

function SceneWarmup({ readyModelIds }: { readyModelIds: ReadonlySet<IndustryModelId> }) {
  const { gl, scene, invalidate } = useThree();
  const completed = useRef(false);

  useEffect(() => {
    if (completed.current || readyModelIds.size < 8) return;
    let cancelled = false;
    let timer: ReturnType<typeof globalThis.setTimeout> | undefined;

    const compileScenes = async () => {
      await new Promise<void>((resolve) => {
        timer = globalThis.setTimeout(resolve, 800);
      });
      for (const id of renderReadyModelIds) {
        if (cancelled) return;
        const group = scene.getObjectByName(`qf-industry-scene-${id}`);
        const modelCamera = modelChapters.get(id)?.model?.framing.camera;
        if (!group || !modelCamera) continue;
        const compileCamera = new THREE.PerspectiveCamera(modelCamera.fov, 1, 0.05, 2200);
        compileCamera.position.set(modelCamera.position[0], modelCamera.position[1], modelCamera.position[2]);
        compileCamera.lookAt(...(cameraTargets[id] ?? [0, 0, 0]));
        compileCamera.updateProjectionMatrix();
        const industryGroups = [...renderReadyModelIds]
          .map((modelId) => scene.getObjectByName(`qf-industry-scene-${modelId}`))
          .filter((candidate): candidate is THREE.Object3D => Boolean(candidate));
        industryGroups.forEach((candidate) => {
          candidate.visible = false;
        });
        group.visible = true;
        await gl.compileAsync(group, compileCamera, scene);
        gl.render(scene, compileCamera);
        industryGroups.forEach((candidate) => {
          candidate.visible = Boolean(candidate.userData.qfActive);
        });
        await new Promise<void>((resolve) => {
          timer = globalThis.setTimeout(resolve, 80);
        });
      }
      if (!cancelled) {
        completed.current = true;
        invalidate();
      }
    };

    void compileScenes();
    return () => {
      cancelled = true;
      if (timer) globalThis.clearTimeout(timer);
    };
  }, [gl, invalidate, readyModelIds, scene]);

  return null;
}

function RenderBudget({ moving }: { moving: boolean }) {
  const elapsed = useRef(0);

  useFrame((state, delta) => {
    const frameInterval = 1 / (moving ? 20 : 30);
    elapsed.current += delta;
    if (elapsed.current < frameInterval) return;
    elapsed.current %= frameInterval;
    state.gl.render(state.scene, state.camera);
  }, 1);

  return null;
}

function AdaptiveResolution({ moving }: { moving: boolean }) {
  const setDpr = useThree((state) => state.setDpr);

  useEffect(() => {
    setDpr(moving ? 0.65 : 0.9);
  }, [moving, setDpr]);

  return null;
}

function PreloadedIndustryModels({
  activeModelId,
  readyModelIds,
  reducedMotion,
  moving,
}: {
  activeModelId: IndustryModelId | null;
  readyModelIds: ReadonlySet<IndustryModelId>;
  reducedMotion: boolean;
  moving: boolean;
}) {
  const quantum = modelChapters.get("quantum-computer")?.model;

  return (
    <Suspense fallback={null}>
      {quantum && readyModelIds.has("quantum-computer") ? (
        <ModelGroup id="quantum-computer" activeModelId={activeModelId} moving={moving}>
          <Center>
            <QuantumComputerObject model={quantum} reducedMotion={reducedMotion} paused={activeModelId !== "quantum-computer"} />
          </Center>
        </ModelGroup>
      ) : null}
      {readyModelIds.has("drone") ? (
        <ModelGroup id="drone" activeModelId={activeModelId} moving={moving}>
          <group position={[0, 0.35, 0]}><DroneModel accent="#22c7cb" spin={!reducedMotion} /></group>
        </ModelGroup>
      ) : null}
      {readyModelIds.has("datacenter") ? (
        <ModelGroup id="datacenter" activeModelId={activeModelId} moving={moving}>
          <DatacenterModel spin={reducedMotion ? 0 : 0.075} />
        </ModelGroup>
      ) : null}
      {readyModelIds.has("satellite") ? (
        <ModelGroup id="satellite" activeModelId={activeModelId} moving={moving}>
          <Stars radius={80} depth={50} count={1600} factor={3} saturation={0} fade speed={0.25} />
          <SatelliteModel spin={reducedMotion ? 0 : 0.1} />
        </ModelGroup>
      ) : null}
      {readyModelIds.has("particle-accelerator") ? (
        <ModelGroup id="particle-accelerator" activeModelId={activeModelId} moving={moving}>
          <ParticleAcceleratorModel autoRotate={!reducedMotion} beamColor="#00e5ff" accentColor="#ff2fa0" />
        </ModelGroup>
      ) : null}
      {readyModelIds.has("cyber-security") ? (
        <ModelGroup id="cyber-security" activeModelId={activeModelId} moving={moving}>
          <CyberSecurityModel spin={reducedMotion ? 0 : 0.055} showStreams showIcons />
        </ModelGroup>
      ) : null}
      {readyModelIds.has("sensor-array") ? (
        <ModelGroup id="sensor-array" activeModelId={activeModelId} moving={moving}>
          <SensorArrayModel spin={reducedMotion ? 0 : 0.085} colors={undefined} />
        </ModelGroup>
      ) : null}
      {readyModelIds.has("nuclear-plant") ? (
        <ModelGroup id="nuclear-plant" activeModelId={activeModelId} moving={moving}>
          <NuclearPlantModel rotationSpeed={reducedMotion ? 0 : 0.055} steam={!reducedMotion} />
        </ModelGroup>
      ) : null}
    </Suspense>
  );
}

export function IndustrySharedCanvas({
  chapter,
  readyModelIds,
  paused,
  moving,
}: {
  chapter: IndustryChapter;
  readyModelIds: ReadonlySet<IndustryModelId>;
  paused: boolean;
  moving: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const activeModelId = chapter.model?.id ?? null;
  const ready = Boolean(activeModelId && readyModelIds.has(activeModelId));
  const target: readonly [number, number, number] = activeModelId
    ? cameraTargets[activeModelId] ?? [0, 0, 0]
    : [0, 0, 0];

  return (
    <div className={`qf-industry-shared-stage${ready ? " is-visible" : ""}`} aria-hidden="true">
      <Canvas
        dpr={0.9}
        frameloop={paused || !ready ? "demand" : "always"}
        camera={{ position: [4.8, 3.1, 6.4], fov: 34, near: 0.05, far: 2200 }}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
      >
        <color attach="background" args={["#04090c"]} />
        <ambientLight intensity={0.48} color="#8bbbc4" />
        <hemisphereLight args={["#9fc6d8", "#020407", 0.75]} />
        <directionalLight position={[8, 12, 7]} intensity={2.8} color="#e1fbff" />
        <directionalLight position={[-7, 3, -6]} intensity={1.2} color="#258bbd" />
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={4} color="#dffcff" position={[5, 7, 4]} scale={[10, 6, 1]} />
          <Lightformer intensity={3} color="#22c7cb" position={[-6, 2, -4]} scale={[8, 5, 1]} />
        </Environment>
        <SharedCamera activeModelId={ready ? activeModelId : null} />
        <SceneWarmup readyModelIds={readyModelIds} />
        <PreloadedIndustryModels
          activeModelId={ready ? activeModelId : null}
          readyModelIds={readyModelIds}
          reducedMotion={reducedMotion}
          moving={moving}
        />
        <AdaptiveResolution moving={moving} />
        <RenderBudget moving={moving} />
        <OrbitControls
          makeDefault
          target={[target[0], target[1], target[2]]}
          enablePan={false}
          enableZoom={false}
          enableRotate
          enableDamping
          dampingFactor={0.06}
        />
      </Canvas>
      <span className="qf-industry-stage-vignette" />
    </div>
  );
}

function AtmosphericFallback({ chapter, waiting }: { chapter: IndustryChapter; waiting?: boolean }) {
  const approvedImage = chapter.fallback.approvedStaticImage;

  return (
    <div
      className={`qf-industry-fallback ${approvedImage ? "has-approved-image" : "is-field"}${waiting ? " is-waiting" : ""}`}
      aria-hidden="true"
    >
      {approvedImage ? (
        <Image src={approvedImage} alt="" fill sizes="(max-width: 900px) 100vw, 62vw" unoptimized />
      ) : null}
      <span className="qf-industry-fallback-grid" />
      <span className="qf-industry-fallback-orbit orbit-one" />
      <span className="qf-industry-fallback-orbit orbit-two" />
      <span className="qf-industry-fallback-signal" />
    </div>
  );
}

export default function IndustryModelStage({
  chapter,
  readyModelIds,
}: {
  chapter: IndustryChapter;
  readyModelIds: ReadonlySet<IndustryModelId>;
}) {
  const waiting = Boolean(chapter.model && !readyModelIds.has(chapter.model.id));
  return (
    <div className="qf-industry-stage" role="img" aria-label={`${chapter.title} industry object`}>
      {!chapter.model || waiting ? <AtmosphericFallback chapter={chapter} waiting={waiting} /> : null}
      <span className="qf-industry-stage-vignette" aria-hidden="true" />
    </div>
  );
}
