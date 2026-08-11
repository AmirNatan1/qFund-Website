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
  url?: string;
};

export const portfolio: readonly PortfolioCompany[] = [
  {
    name: "Element Security",
    logo: "/portfolio/element-security.webp",
    description: "Maps internet-facing assets and proves which flaws are actually exploitable",
    url: "https://element.security/",
  },
  {
    name: "Commcrete",
    logo: "/portfolio/commcrete.webp",
    description: "Compact satellite radios and converters for tactical voice and data comms",
  },
  {
    name: "Skapion",
    logo: "/portfolio/skapion.webp",
    description: "Native counter-swarm defense system against attacking drone swarms",
  },
  {
    name: "Oraqon",
    logo: "/portfolio/oraqon.webp",
    description: "TODO: description",
  },
  {
    name: "Qedma",
    logo: "/portfolio/qedma.webp",
    description: "Error-suppression software that extends what today's quantum computers can compute",
  },
  {
    name: "Actasys",
    logo: "/portfolio/actasys.webp",
    description: "Thermal management for high-density data-center racks and networking silicon",
  },
  {
    name: "Particle",
    logo: "/portfolio/particle.webp",
    description: "TODO: description",
  },
  {
    name: "Signal Edge",
    logo: "/portfolio/signal-edge.webp",
    description: "Low-SWaP RF sensors and radar for electromagnetic ISR and targeting",
  },
  {
    name: "LiteVision",
    logo: "/portfolio/litevision.webp",
    description: "TODO: description",
  },
  {
    name: "QuamCore",
    logo: "/portfolio/quamcore.webp",
    description: "Superconducting quantum processors architected to scale beyond one million qubits",
  },
  {
    name: "Eshtech",
    logo: "/portfolio/eshtech.webp",
    description: "Pulsed-laser hard-kill effector for short-range counter-drone defense",
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
