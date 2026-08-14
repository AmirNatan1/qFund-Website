export { industryChapters as focusAreas } from "./industries/industryConfig";

export type PortfolioCompany = {
  name: string;
  logo: string;
  description: string;
  url: string;
  background: string;
  logoMode?: "multiply" | "full-bleed" | "flush-contain" | "litevision-crop";
  logoScale?: number;
};

export const portfolio: readonly PortfolioCompany[] = [
  {
    name: "Element Security",
    logo: "/portfolio/element-security-color.svg",
    description: "Maps internet-facing assets and proves which flaws are actually exploitable",
    url: "https://element.security/",
    background: "#111111",
    logoScale: 1.06,
  },
  {
    name: "Commcrete",
    logo: "/portfolio/commcrete-color.svg",
    description: "Compact satellite radios and converters for tactical voice and data comms",
    url: "https://www.commcrete.com/",
    background: "#f2eee9",
    logoScale: 1.05,
  },
  {
    name: "Skapion",
    logo: "/portfolio/skapion-hd.svg",
    description: "Native counter-swarm defense system against attacking drone swarms",
    url: "https://www.skapion.com/",
    background: "#293137",
    logoMode: "full-bleed",
  },
  {
    name: "Oraqon",
    logo: "/portfolio/oraqon-hd.png",
    description: "Develops Cosmic, a future-ready technology platform for advanced computing",
    url: "https://www.oraqon.com/",
    background: "linear-gradient(135deg, #123b67 0%, #117fa1 55%, #25bcb5 100%)",
    logoScale: 1.12,
  },
  {
    name: "Qedma",
    logo: "/portfolio/qedma-hd.jpg",
    description: "Error-suppression software that extends what today's quantum computers can compute",
    url: "https://www.qedma.com/",
    background: "#ffffff",
    logoMode: "flush-contain",
  },
  {
    name: "Actasys",
    logo: "/portfolio/actasys.webp",
    description: "Thermal management for high-density data-center racks and networking silicon",
    url: "https://www.actasysinc.com/",
    background: "#ffffff",
    logoScale: 1.06,
  },
  {
    name: "Particle",
    logo: "/portfolio/particle-hd.svg",
    description: "Particle-physics and advanced-propulsion systems for aerospace and defense",
    url: "https://particle-lab.com/",
    background: "#ffffff",
    logoScale: 1.22,
  },
  {
    name: "Signal Edge",
    logo: "/portfolio/signal-edge-color.png",
    description: "Low-SWaP RF sensors and radar for electromagnetic ISR and targeting",
    url: "https://signal-edge.com/",
    background: "#100f0f",
    logoScale: 1,
  },
  {
    name: "LiteVision",
    logo: "/portfolio/litevision-color.png",
    description: "Miniaturized electro-optical imaging systems for defense and civilian platforms",
    url: "https://litevision-eo.com/",
    background: "#f3f1eb",
    logoMode: "litevision-crop",
  },
  {
    name: "QuamCore",
    logo: "/portfolio/quamcore-color.svg",
    description: "Superconducting quantum processors architected to scale beyond one million qubits",
    url: "https://www.quamcore.com/",
    background: "linear-gradient(135deg, #203678 0%, #5477b6 100%)",
    logoScale: 1.04,
  },
  {
    name: "Esh-Tech",
    logo: "/portfolio/eshtech-color.svg",
    description: "Pulsed-laser hard-kill effector for short-range counter-drone defense",
    url: "https://www.esh-tech.com/",
    background: "#22235f",
    logoScale: 1.08,
  },
];

export const team = [
  {
    name: "Liav Ben Rubi",
    role: "Managing Partner",
    image: "/team/liav-ben-rubi-hd.webp",
    linkedin: "https://www.linkedin.com/in/liav-ben-rubi/",
    bio: "Liav has over 14 years of experience across automotive, robotics, and logistics. He began his career leading R&D programs in the Intelligence Technological Operational Command, and later served as a CEO in the automotive sector, running multinational programs from inception through implementation.",
  },
  {
    name: "Dana Taigman Koren",
    role: "Managing Partner",
    image: "/team/dana-taigman-koren-hd.webp",
    linkedin: "https://www.linkedin.com/in/danataigmankoren/",
    bio: "Dana has more than 18 years of experience in investments, strategic initiatives, and global partnerships. She began as a strategic consultant and held corporate roles across IT, system integration, market research, and business intelligence, and led a multi-CVC collaboration with Lufthansa, Boeing, and gategroup.",
  },
  {
    name: "Liron Ben Zaken",
    role: "Principal",
    image: "/team/liron-ben-zaken-hd.webp",
    linkedin: "https://www.linkedin.com/in/liron-ben-zaken/",
    bio: "Liron is a Principal on qFund’s investment team, bringing more than a decade of professional experience to the role. She is an alumna of Ben-Gurion University of the Negev.",
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

export const evaluationPillars = [
  {
    code: "01",
    title: "Founder-problem fit",
    text: "Rare technical depth, real operating instinct, and a team built to outlearn the market.",
    signal: "EARNED INSIGHT",
  },
  {
    code: "02",
    title: "Step-change technology",
    text: "A leap in performance, not an incremental edge—with protection that keeps it hard to follow.",
    signal: "A TRUE LEAP FORWARD",
  },
  {
    code: "03",
    title: "A market in motion",
    text: "An urgent, expanding market where a painful real-world problem leaves room for category leadership.",
    signal: "PULL, NOT PROMISE",
  },
  {
    code: "04",
    title: "A widening moat",
    text: "IP, trade secrets, and hard-won know-how that widen the lead with every milestone.",
    signal: "BUILT TO COMPOUND",
  },
] as const;

export const valueCreation = [
  {
    code: "V/01",
    title: "Prove the edge",
    text: "We pressure-test the science, run proofs of concept, and connect teams with test vehicles and beta sites.",
  },
  {
    code: "V/02",
    title: "Open the right doors",
    text: "We bring customers, industrial partners, defense organizations, manufacturers, and co-investors into the room.",
  },
  {
    code: "V/03",
    title: "Find the route to market",
    text: "We sharpen the path from feasibility to market entry, fundraising, and the value-chain decisions in between.",
  },
  {
    code: "V/04",
    title: "Build for the long run",
    text: "We work at board level on investment structure, market strategy, and the decisions that turn progress into momentum.",
  },
] as const;
