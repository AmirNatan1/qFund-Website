export type IndustryModelId =
  | "quantum-computer"
  | "drone"
  | "datacenter"
  | "satellite"
  | "particle-accelerator"
  | "cyber-security"
  | "sensor-array"
  | "nuclear-plant";

export type IndustryModelConfig = {
  id: IndustryModelId;
  source: string;
  publicPath?: string;
  presentation: {
    scale: number;
    offset: readonly [string, string];
  };
  framing: {
    modelScale?: number;
    position?: readonly [number, number, number];
    rotation?: readonly [number, number, number];
    camera?: {
      position: readonly [number, number, number];
      fov: number;
    };
  };
  renderOptions: Record<string, string | number | boolean | null>;
};

export type IndustryChapter = {
  code: string;
  slug: string;
  title: string;
  short: string;
  text: string;
  accent: string;
  model: IndustryModelConfig | null;
  fallback: {
    mode: "field" | "approved-image";
    approvedStaticImage?: string;
  };
};

export const industryChapters = [
  {
    code: "01",
    slug: "quantum-computing",
    title: "Quantum Computing",
    short: "Quantum",
    text: "Israel has emerged as a global leader in quantum technology, building strength across both hardware and software. Each domain carries immense potential for groundbreaking innovation—hardware is redefining the limits of what quantum systems can achieve, while software is unlocking their true computational power.",
    accent: "#22c7cb",
    model: {
      id: "quantum-computer",
      source: "3D Objects/quantum-computer.glb",
      publicPath: "/3d/quantum-computer.glb",
      presentation: { scale: 1.22, offset: ["0%", "1%"] },
      framing: {
        modelScale: 1,
        position: [0, 0, 0],
        rotation: [0, -0.32, 0],
        camera: { position: [4.2, 2.7, 5.5], fov: 32 },
      },
      renderOptions: { autoRotateSpeed: 0.18, environment: "studio" },
    },
    fallback: { mode: "field" },
  },
  {
    code: "02",
    slug: "robotics-and-drones",
    title: "Robotics and Drones",
    short: "Robotics",
    text: "Autonomous systems are transforming logistics, inspection, defense, and labor. We invest in robotics companies where software and hardware meet precision execution.",
    accent: "#66d9de",
    model: {
      id: "drone",
      source: "3D Objects/Drone.jsx",
      presentation: { scale: 0.9, offset: ["0%", "1%"] },
      framing: { camera: { position: [3.8, 2.55, 5.9], fov: 37 } },
      renderOptions: { grid: false, controls: false, bloom: 1.25, spin: true },
    },
    fallback: { mode: "field" },
  },
  {
    code: "03",
    slug: "data-centers",
    title: "Data Centers",
    short: "Data Centers",
    text: "The physical layer of the internet is under reinvention—energy, cooling, latency, control. We invest in the core technologies and operational systems powering that shift.",
    accent: "#5b92ff",
    model: {
      id: "datacenter",
      source: "3D Objects/DatacenterScene.jsx",
      presentation: { scale: 1, offset: ["0%", "0%"] },
      framing: { camera: { position: [4.5, 1.72, 5.5], fov: 44 } },
      renderOptions: { spin: 0.075 },
    },
    fallback: { mode: "field" },
  },
  {
    code: "04",
    slug: "space",
    title: "Space",
    short: "Space",
    text: "Low-Earth orbit is no longer experimental—it’s operational. We back companies building communication infrastructure with clear commercial and national-security use cases.",
    accent: "#e6b958",
    model: {
      id: "satellite",
      source: "3D Objects/SatelliteScene.jsx",
      presentation: { scale: 0.96, offset: ["0%", "0%"] },
      framing: { camera: { position: [5.6, 2.6, 9.9], fov: 34 } },
      renderOptions: { bloom: 1.25, spin: 0.1, stars: true },
    },
    fallback: { mode: "field" },
  },
  {
    code: "05",
    slug: "particle-accelerators",
    title: "Particle Accelerators",
    short: "Accelerators",
    text: "A once-niche technology now powering material innovation, medicine, and clean energy. We invest where complex physics meets commercial possibility.",
    accent: "#f26bab",
    model: {
      id: "particle-accelerator",
      source: "3D Objects/ParticleAccelerator.jsx",
      presentation: { scale: 1, offset: ["0%", "0%"] },
      framing: { camera: { position: [12, 4.6, 16.2], fov: 44 } },
      renderOptions: { autoRotate: true, bloomIntensity: 1.55, showGrid: false },
    },
    fallback: { mode: "field" },
  },
  {
    code: "06",
    slug: "cyber-and-attack-surfaces",
    title: "Cyber & Attack Surfaces",
    short: "Cyber",
    text: "As the digital threat surface expands, we invest in platforms securing infrastructure, devices, and networks across civilian and defense domains.",
    accent: "#83d1bb",
    model: {
      id: "cyber-security",
      source: "3D Objects/CyberSecurityHologram.jsx",
      presentation: { scale: 0.94, offset: ["0%", "0%"] },
      framing: { camera: { position: [0, 0.15, 10.2], fov: 40 } },
      renderOptions: { spin: 0.055, showStreams: true, showIcons: true },
    },
    fallback: { mode: "field" },
  },
  {
    code: "07",
    slug: "sensing-rf-optics-and-quantum-intelligence",
    title: "Sensing, RF, Optics & Quantum Intelligence",
    short: "Sensing & RF",
    text: "From RF to quantum, sensors are foundational to autonomy, defense, and scientific discovery. We invest in sensing platforms enabling high-resolution, real-time intelligence across domains.",
    accent: "#4f7dff",
    model: {
      id: "sensor-array",
      source: "3D Objects/SensorArray.jsx",
      presentation: { scale: 0.95, offset: ["0%", "0%"] },
      framing: { camera: { position: [6.4, 3.3, 7.2], fov: 36 } },
      renderOptions: { spin: 0.085, showGrid: false },
    },
    fallback: {
      mode: "approved-image",
      approvedStaticImage: "/focus/advanced-electronics.jpg",
    },
  },
  {
    code: "08",
    slug: "geothermal-and-nuclear-energy",
    title: "Geothermal & Nuclear Energy",
    short: "Energy",
    text: "Decarbonization needs scalable, always-on energy. We invest in geothermal and nuclear innovations redefining what’s possible in clean, resilient power infrastructure.",
    accent: "#ef8e65",
    model: {
      id: "nuclear-plant",
      source: "3D Objects/NuclearPlantComplex.jsx",
      presentation: { scale: 1.03, offset: ["0%", "0%"] },
      framing: { camera: { position: [206, 108, 226], fov: 26 } },
      renderOptions: {
        rotationSpeed: 0.055,
        steam: true,
        bloomIntensity: 0.72,
        environmentPreset: null,
        backgroundTop: "#04090c",
        backgroundBottom: "#04090c",
        fogColor: "#04090c",
      },
    },
    fallback: { mode: "field" },
  },
] as const satisfies readonly IndustryChapter[];

export const suppliedIndustryModelCount = industryChapters.filter((chapter) => chapter.model !== null).length;
export const pendingIndustryModelCount = industryChapters.length - suppliedIndustryModelCount;
