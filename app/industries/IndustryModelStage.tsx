"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, Center, ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import type { IndustryChapter, IndustryModelConfig, IndustryModelId } from "./industryConfig";

const DatacenterScene = dynamic(() => import("../../3D Objects/DatacenterScene.jsx"), { ssr: false });
const DroneScene = dynamic(() => import("../../3D Objects/Drone.jsx"), { ssr: false });
const NuclearPlantComplex = dynamic(() => import("../../3D Objects/NuclearPlantComplex.jsx"), { ssr: false });
const ParticleAcceleratorScene = dynamic(() => import("../../3D Objects/ParticleAccelerator.jsx"), { ssr: false });
const SatelliteScene = dynamic(() => import("../../3D Objects/SatelliteScene.jsx"), { ssr: false });

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

function QuantumComputerObject({ model, reducedMotion }: { model: IndustryModelConfig; reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(model.publicPath ?? "/3d/quantum-computer.glb");
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const rotation = model.framing.rotation ?? [0, 0, 0];

  useFrame((_, delta) => {
    if (!reducedMotion && group.current) {
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

function QuantumComputerScene({ model, reducedMotion }: { model: IndustryModelConfig; reducedMotion: boolean }) {
  const camera = model.framing.camera ?? { position: [4.8, 3.1, 6.4] as const, fov: 34 };

  return (
    <Canvas
      camera={{ position: [...camera.position], fov: camera.fov, near: 0.05, far: 300 }}
      dpr={[1, 1.7]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <color attach="background" args={["#04090d"]} />
      <ambientLight intensity={0.46} color="#8bbbc4" />
      <directionalLight position={[5, 7, 4]} intensity={2.6} color="#e1fbff" />
      <directionalLight position={[-5, 1, -4]} intensity={1.4} color="#258bbd" />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={5} color="#dffcff" position={[4, 5, 4]} scale={[8, 5, 1]} />
        <Lightformer intensity={4} color="#22c7cb" position={[-5, 1, -3]} scale={[6, 5, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.18}>
          <Center>
            <QuantumComputerObject model={model} reducedMotion={reducedMotion} />
          </Center>
        </Bounds>
      </Suspense>
      <ContactShadows position={[0, -1.6, 0]} opacity={0.48} scale={11} blur={2.4} far={4} color="#000407" />
      <OrbitControls makeDefault enablePan={false} enableZoom={false} enableRotate={false} />
    </Canvas>
  );
}

function ModelRenderer({ model, reducedMotion }: { model: IndustryModelConfig; reducedMotion: boolean }) {
  const id: IndustryModelId = model.id;

  switch (id) {
    case "quantum-computer":
      return <QuantumComputerScene model={model} reducedMotion={reducedMotion} />;
    case "drone":
      return (
        <DroneScene
          accent="#22c7cb"
          spin={!reducedMotion && Boolean(model.renderOptions.spin)}
          bloom={Number(model.renderOptions.bloom ?? 1.25)}
          grid={Boolean(model.renderOptions.grid)}
          controls={false}
          onCreated={undefined}
          className={undefined}
          style={undefined}
        />
      );
    case "datacenter":
      return (
        <DatacenterScene
          spin={reducedMotion ? 0 : Number(model.renderOptions.spin ?? 0.075)}
          className={undefined}
          style={undefined}
        />
      );
    case "satellite":
      return (
        <SatelliteScene
          bloom={Number(model.renderOptions.bloom ?? 1.25)}
          spin={reducedMotion ? 0 : Number(model.renderOptions.spin ?? 0.1)}
          stars={Boolean(model.renderOptions.stars)}
          className={undefined}
          style={undefined}
        />
      );
    case "particle-accelerator":
      return (
        <ParticleAcceleratorScene
          autoRotate={!reducedMotion && Boolean(model.renderOptions.autoRotate)}
          bloomIntensity={Number(model.renderOptions.bloomIntensity ?? 1.55)}
          showGrid={Boolean(model.renderOptions.showGrid)}
          envPreset={null}
          className={undefined}
          style={undefined}
        />
      );
    case "nuclear-plant":
      return (
        <NuclearPlantComplex
          rotationSpeed={reducedMotion ? 0 : Number(model.renderOptions.rotationSpeed ?? 0.055)}
          steam={!reducedMotion && Boolean(model.renderOptions.steam)}
          bloomIntensity={Number(model.renderOptions.bloomIntensity ?? 0.85)}
          environmentPreset={undefined}
          className={undefined}
          style={undefined}
        />
      );
  }
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

export default function IndustryModelStage({ chapter, shouldRender }: { chapter: IndustryChapter; shouldRender: boolean }) {
  const reducedMotion = useReducedMotion();
  const model = chapter.model;
  const presentation = model?.presentation;
  const style = {
    "--qf-model-scale": presentation?.scale ?? 1,
    "--qf-model-x": presentation?.offset[0] ?? "0%",
    "--qf-model-y": presentation?.offset[1] ?? "0%",
  } as CSSProperties;

  return (
    <div className="qf-industry-stage" role="img" aria-label={`${chapter.title} industry object`}>
      {model && shouldRender ? (
        <div className="qf-industry-model-shell" style={style}>
          <Suspense fallback={<AtmosphericFallback chapter={chapter} waiting />}>
            <ModelRenderer model={model} reducedMotion={reducedMotion} />
          </Suspense>
        </div>
      ) : (
        <AtmosphericFallback chapter={chapter} waiting={Boolean(model)} />
      )}
      <span className="qf-industry-stage-vignette" aria-hidden="true" />
    </div>
  );
}
