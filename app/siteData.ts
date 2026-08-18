export { industryChapters as focusAreas } from "./industries/industryConfig";

export type PortfolioCompany = {
  name: string;
  logo: string;
  description: string;
  url: string;
  logoMode?: "multiply" | "full-bleed" | "flush-contain" | "canvas-crop" | "litevision-crop" | "lockup";
  logoScale?: number;
  wordmark?: string;
};

export const portfolio: readonly PortfolioCompany[] = [
  {
    name: "Skapion",
    logo: "/portfolio/skapion-mark.svg",
    description: "Native counter-swarm defense system against attacking drone swarms",
    url: "https://www.skapion.com/",
    logoMode: "lockup",
    wordmark: "SKAPION",
  },
  {
    name: "QuamCore",
    logo: "/portfolio/quamcore-color.svg",
    description: "Superconducting quantum processors architected to scale beyond one million qubits",
    url: "https://www.quamcore.com/",
    logoScale: 1,
  },
  {
    name: "Commcrete",
    logo: "/portfolio/commcrete-color.svg",
    description: "Compact satellite radios and converters for tactical voice and data comms",
    url: "https://www.commcrete.com/",
    logoScale: 1,
  },
  {
    name: "LiteVision",
    logo: "/portfolio/litevision-clean.png",
    description: "Miniaturized electro-optical imaging systems for defense and civilian platforms",
    url: "https://litevision-eo.com/",
    logoScale: 0.95,
  },
  {
    name: "SignalEdge",
    logo: "/portfolio/signal-edge-color.png",
    description: "Low-SWaP RF sensors and radar for electromagnetic ISR and targeting",
    url: "https://signal-edge.com/",
    logoScale: 1,
  },
  {
    name: "Oraqon",
    logo: "/portfolio/oraqon-hd.png",
    description: "Develops Cosmic, a future-ready technology platform for advanced computing",
    url: "https://www.oraqon.com/",
    logoScale: 1,
  },
  {
    name: "Particle",
    logo: "/portfolio/particle-hd.svg",
    description: "Particle-physics and advanced-propulsion systems for aerospace and defense",
    url: "https://particle-lab.com/",
    logoMode: "lockup",
    wordmark: "PARTICLE",
  },
  {
    name: "Esh-Tech",
    logo: "/portfolio/eshtech-color.svg",
    description: "Pulsed-laser hard-kill effector for short-range counter-drone defense",
    url: "https://www.esh-tech.com/",
    logoScale: 1,
  },
  {
    name: "Actasys",
    logo: "/portfolio/actasys-clean.png",
    description: "Thermal management for high-density data-center racks and networking silicon",
    url: "https://www.actasysinc.com/",
    logoScale: 0.95,
  },
  {
    name: "Element Security",
    logo: "/portfolio/element-security-color.svg",
    description: "Maps internet-facing assets and proves which flaws are actually exploitable",
    url: "https://element.security/",
    logoScale: 1.05,
  },
  {
    name: "QEDMA",
    logo: "/portfolio/qedma-clean.png",
    description: "Error-suppression software that extends what today's quantum computers can compute",
    url: "https://www.qedma.com/",
    logoScale: 1,
  },
];

export const team = [
  {
    name: "Liav Ben Rubi",
    role: "Managing Partner",
    image: "/team/liav-ben-rubi-enhanced.png",
    linkedin: "https://www.linkedin.com/in/liav-ben-rubi/",
  },
  {
    name: "Dana Taigman Koren",
    role: "Managing Partner",
    image: "/team/dana-taigman-koren-portrait-2026.png",
    linkedin: "https://www.linkedin.com/in/danataigmankoren/",
  },
  {
    name: "Liron Ben Zaken",
    role: "Principal",
    image: "/team/liron-ben-zaken-hd.webp",
    linkedin: "https://www.linkedin.com/in/liron-ben-zaken/",
  },
] as const;

export const filters = [
  ["all", "All companies"],
  ["quantum", "Quantum & sensing"],
  ["defense", "Defense systems"],
  ["infrastructure", "Infrastructure"],
] as const;

export const investmentCriteria = [
  {
    code: "01",
    title: "Team",
    text: "Industry-leading teams with the expertise to drive 10× industry transformations.",
  },
  {
    code: "02",
    title: "Deep Tech",
    text: "Breakthrough technologies delivering order-of-magnitude performance in at least one critical dimension.",
  },
  {
    code: "03",
    title: "Market",
    text: "Massive, high-conviction markets with clear potential for 10× industry transformations and short go-to-market.",
  },
] as const;
