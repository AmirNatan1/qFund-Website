export const focusAreas = [
  {
    code: "01",
    title: "Quantum computing",
    short: "Quantum",
    text: "Breakthrough technologies across quantum computing.",
  },
  {
    code: "02",
    title: "Defense",
    short: "Defense",
    text: "Breakthrough technologies across defense.",
  },
  {
    code: "03",
    title: "Energy",
    short: "Energy",
    text: "Breakthrough technologies across energy.",
  },
  {
    code: "04",
    title: "Advanced industry",
    short: "Industry",
    text: "Breakthrough technologies across advanced industry.",
  },
  {
    code: "05",
    title: "Semiconductors",
    short: "Semiconductors",
    text: "Breakthrough technologies across semiconductors.",
  },
  {
    code: "06",
    title: "Advanced electronics",
    short: "Electronics",
    text: "Breakthrough technologies across advanced electronics.",
  },
] as const;

export const portfolio = [
  {
    name: "Element Security",
    category: "Cybersecurity",
    group: "infrastructure",
    description:
      "Proactive security for the external attack surface, identifying and eliminating high-impact exposures before attackers can exploit them.",
    founded: "2021",
    stage: "Early stage",
    website: "https://element.security/",
    logo: "/portfolio/element-security.webp",
  },
  {
    name: "Commcrete",
    category: "Satellite communications",
    group: "defense",
    description:
      "Ultra-compact satellite communication solutions for critical-tactical users, providing reliable connectivity across defense, public safety, automotive, and commercial sectors—even in remote or hostile environments.",
    founded: "2020",
    stage: "Series A",
    website: "https://www.commcrete.com/",
    logo: "/portfolio/commcrete.webp",
  },
  {
    name: "Skapion",
    category: "Counter-swarm defense",
    group: "defense",
    description:
      "A swarm-native kinetic defense platform designed for simultaneous, cost-efficient, multi-target interception of UAS swarm threats.",
    founded: "2025",
    stage: "Seed",
    website: "https://www.skapion.com/",
    logo: "/portfolio/skapion.webp",
  },
  {
    name: "Oraqon",
    category: "Quantum sensing",
    group: "quantum",
    description:
      "A quantum-sensor solution for rapid, precise, and reliable detection of laser threats, including in challenging battlefield conditions.",
    founded: "2024",
    stage: "Seed",
    website: "https://www.oraqon.com/",
    logo: "/portfolio/oraqon.webp",
  },
  {
    name: "Qedma",
    category: "Quantum computing",
    group: "quantum",
    description:
      "Software solutions that enhance quantum-computer performance and pursue quantum algorithmic advantage across quantum platforms.",
    founded: "2020",
    stage: "Series A",
    website: "https://www.qedma.com/",
    logo: "/portfolio/qedma.webp",
  },
  {
    name: "Actasys",
    category: "Thermal management",
    group: "infrastructure",
    description:
      "Thermal and air-actuation technology for compact, space-constrained systems across automotive, AI infrastructure, semiconductors, and defense.",
    founded: "2020",
    stage: "Seed",
    website: "https://www.actasysinc.com/",
    logo: "/portfolio/actasys.webp",
  },
  {
    name: "Particle",
    category: "Particle acceleration",
    group: "defense",
    description:
      "A compact particle-accelerator system for instant interception of missile, rocket, and UAV swarms, delivering high-energy impact in milliseconds.",
    founded: "2024",
    stage: "Seed",
    website: "https://particle-lab.com/",
    logo: "/portfolio/particle.webp",
  },
  {
    name: "Signal Edge",
    category: "RF systems",
    group: "defense",
    description:
      "A high-performance, low-SWaP RF core combining ISR, homing, electronic warfare, and radar in a software-reconfigurable hardware unit.",
    founded: "2024",
    stage: "Seed",
    website: "https://signal-edge.com/",
    logo: "/portfolio/signal-edge.webp",
  },
  {
    name: "LiteVision",
    category: "Electro-optics",
    group: "defense",
    description:
      "A compact, high-resolution wide-area surveillance system integrating MWIR and HD visual sensors with onboard processing.",
    founded: "2025",
    stage: "Seed",
    website: "https://litevision-eo.com/",
    logo: "/portfolio/litevision.webp",
  },
  {
    name: "QuamCore",
    category: "Quantum computing",
    group: "quantum",
    description:
      "An integrated cryostat architecture designed to address the scaling bottleneck in quantum computing and target million-qubit machines.",
    founded: "2023",
    stage: "Series A",
    website: "https://www.quamcore.com/",
    logo: "/portfolio/quamcore.webp",
  },
] as const;

export const team = [
  {
    name: "Liav Ben Rubi",
    role: "Managing Partner",
    image: "/team/liav-ben-rubi.webp",
    linkedin: "https://www.linkedin.com/in/liav-ben-rubi/",
    bio: "Liav brings over 14 years of experience in automotive, robotics, and logistics. He began his career leading R&D programs in the Intelligence Technological Operational Command and later served as a CEO in the automotive sector. He is also CEO of Quantum Hub.",
  },
  {
    name: "Dana Taigman Koren",
    role: "Managing Partner",
    image: "/team/dana-taigman-koren.webp",
    linkedin: "https://www.linkedin.com/in/danataigmankoren/",
    bio: "Dana has more than 18 years of experience in investments, strategic initiatives, and global partnerships. She led a multi-CVC collaboration with Lufthansa, Boeing, and gategroup and is Chief Business Officer at Quantum Hub.",
  },
  {
    name: "Liron Ben Zaken",
    role: "Principal · Investment Team",
    image: "/team/liron-ben-zaken.png",
    linkedin: "https://www.linkedin.com/in/liron-ben-zaken/",
    bio: "",
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
    title: "Founders",
    text: "Industry top-tier founders—proven experts capable of driving 10× industry transformations.",
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
    title: "Founders",
    text: "Domain authority with deep, proven expertise. The founder must be the world’s leading expert on this specific problem.",
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

export const dealFlow = [
  ["3,250", "Initial review"],
  ["953", "Hub partners’ assessment"],
  ["430", "Initial business assessment"],
  ["300", "Review"],
  ["146", "Evaluate"],
  ["51", "Assess"],
  ["31", "Full due diligence"],
  ["10", "Investments"],
] as const;

export const hubPartners = [
  {
    name: "Taavura Livnat Group",
    text: "Mobility, logistics, energy, infrastructure, air cargo, express delivery, data centers, and cloud.",
  },
  {
    name: "VDL Group",
    text: "An international industrial group active in automotive, factory automation, semiconductors, and defense.",
  },
  {
    name: "Hyundai Motor Group",
    text: "A global group active in vehicle production, steel, construction, logistics, IT, and finance.",
  },
  {
    name: "Bazan Group",
    text: "Israel’s largest refinery and petrochemical complex.",
  },
] as const;

export const valueCreation = [
  {
    code: "V/01",
    title: "Validation",
    text: "Technology evaluations, proof-of-concept projects, partner assessments, test vehicles, and beta sites.",
  },
  {
    code: "V/02",
    title: "Strategic access",
    text: "Introductions to customers, industrial partners, defense organizations, manufacturers, and co-investors.",
  },
  {
    code: "V/03",
    title: "Commercialization",
    text: "Support for go-to-market, product feasibility, market entry, fundraising, and value-chain constraints.",
  },
  {
    code: "V/04",
    title: "Company building",
    text: "Investment frameworks, board-level support, and market strategy.",
  },
] as const;
