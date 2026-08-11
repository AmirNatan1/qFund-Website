export const focusAreas = [
  {
    code: "01",
    title: "Quantum computing",
    short: "Quantum",
    text: "From software that makes today's noisy machines useful, to cryostat architecture built to break the qubit scaling bottleneck.",
  },
  {
    code: "02",
    title: "Defense",
    short: "Defense",
    text: "Interception, detection, and electronic warfare — counter-swarm systems, directed-energy interception, laser threat detection, and software-reconfigurable RF cores.",
  },
  {
    code: "03",
    title: "Energy",
    short: "Energy",
    text: "Generation, storage, and the physical infrastructure of the energy transition.",
  },
  {
    code: "04",
    title: "Advanced industry",
    short: "Industry",
    text: "Actuation, cooling, and sensing for the systems that industry actually runs on — automotive, manufacturing, and AI infrastructure.",
  },
  {
    code: "05",
    title: "Semiconductors",
    short: "Semiconductors",
    text: "The materials, components, and process technologies underneath advanced compute.",
  },
  {
    code: "06",
    title: "Advanced electronics",
    short: "Electronics",
    text: "Compact, high-performance RF and electro-optical systems where size, weight, and power decide whether a technology ships.",
  },
] as const;

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
    title: "Team",
    text: "Domain authority with deep, proven expertise concentrated in the team solving the problem.",
    signal: "DOMAIN AUTHORITY",
  },
  {
    code: "02",
    title: "Technology",
    text: "10× performance improvement in a critical dimension. Proprietary, defensible, and not replicable for two to three years.",
    signal: "10× PERFORMANCE",
  },
  {
    code: "03",
    title: "Market",
    text: "Massive markets undergoing transformation. A real-world problem with a clear path to market dominance.",
    signal: "MARKET TRANSFORMATION",
  },
  {
    code: "04",
    title: "Defensibility",
    text: "Strong IP position: patents, trade secrets, and years of hard R&D. A technology barrier that compounds over time.",
    signal: "COMPOUNDING BARRIER",
  },
] as const;

export const valueCreation = [
  {
    code: "V/01",
    title: "Technical validation",
    text: "We run technology evaluations, proof-of-concept projects, and partner assessments, with access to test vehicles and beta sites.",
  },
  {
    code: "V/02",
    title: "Strategic access",
    text: "We open doors to customers, industrial partners, defense organizations, manufacturers, and co-investors.",
  },
  {
    code: "V/03",
    title: "Commercialization",
    text: "We support go-to-market, product feasibility, market entry, fundraising, and resolving value-chain constraints.",
  },
  {
    code: "V/04",
    title: "Company building",
    text: "We structure investment frameworks, take board-level roles, and work on market strategy.",
  },
] as const;
