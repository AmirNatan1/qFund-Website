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

export const portfolio = [
  {
    name: "Element Security",
    category: "Cybersecurity",
    group: "infrastructure",
    description:
      "Proactive security for the external attack surface, identifying and eliminating high-impact exposures before attackers can exploit them.",
    website: "https://element.security/",
    logo: "/portfolio/element-security.webp",
    validation: null,
  },
  {
    name: "Commcrete",
    category: "Satellite communications",
    group: "defense",
    description:
      "Ultra-compact satellite communication solutions for critical-tactical users, providing reliable connectivity across defense, public safety, automotive, and commercial sectors—even in remote or hostile environments.",
    website: "https://www.commcrete.com/",
    logo: "/portfolio/commcrete.webp",
    validation: null,
  },
  {
    name: "Skapion",
    category: "Counter-swarm defense",
    group: "defense",
    description:
      "A swarm-native kinetic defense platform designed for simultaneous, cost-efficient, multi-target interception of UAS swarm threats.",
    website: "https://www.skapion.com/",
    logo: "/portfolio/skapion.webp",
    validation: "EMI secured as the company's largest customer.",
  },
  {
    name: "Oraqon",
    category: "Quantum sensing",
    group: "quantum",
    description:
      "A quantum-sensor solution for rapid, precise, and reliable detection of laser threats, including in challenging battlefield conditions.",
    website: "https://www.oraqon.com/",
    logo: "/portfolio/oraqon.webp",
    validation: "Presented at AUSA with General Dynamics within five months of founding.",
  },
  {
    name: "Qedma",
    category: "Quantum computing",
    group: "quantum",
    description:
      "Software solutions that enhance quantum-computer performance and pursue quantum algorithmic advantage across quantum platforms.",
    website: "https://www.qedma.com/",
    logo: "/portfolio/qedma.webp",
    validation: "Strategic investment from IBM. A proof-of-concept engagement with Hyundai is underway.",
  },
  {
    name: "Actasys",
    category: "Thermal management",
    group: "infrastructure",
    description:
      "Thermal and air-actuation technology for compact, space-constrained systems across automotive, AI infrastructure, semiconductors, and defense.",
    website: "https://www.actasysinc.com/",
    logo: "/portfolio/actasys.webp",
    validation: "Strategic investor participation from Ineffable Ventures.",
  },
  {
    name: "Particle",
    category: "Particle acceleration",
    group: "defense",
    description:
      "A compact particle-accelerator system for instant interception of missile, rocket, and UAV swarms, delivering high-energy impact in milliseconds.",
    website: "https://particle-lab.com/",
    logo: "/portfolio/particle.webp",
    validation: "VDL is a manufacturing and co-development partner.",
  },
  {
    name: "Signal Edge",
    category: "RF systems",
    group: "defense",
    description:
      "A high-performance, low-SWaP RF core combining ISR, homing, electronic warfare, and radar in a software-reconfigurable hardware unit.",
    website: "https://signal-edge.com/",
    logo: "/portfolio/signal-edge.webp",
    validation: "qFund led the round. Early adoption by leading defense contractors.",
  },
  {
    name: "LiteVision",
    category: "Electro-optics",
    group: "defense",
    description:
      "A compact, high-resolution wide-area surveillance system integrating MWIR and HD visual sensors with onboard processing.",
    website: "https://litevision-eo.com/",
    logo: "/portfolio/litevision.webp",
    validation: "qFund led the seed round, joined by Kinetika, 10D, and 8VC.",
  },
  {
    name: "QuamCore",
    category: "Quantum computing",
    group: "quantum",
    description:
      "An integrated cryostat architecture designed to address the scaling bottleneck in quantum computing and target million-qubit machines.",
    website: "https://www.quamcore.com/",
    logo: "/portfolio/quamcore.webp",
    validation: "Korean market entry supported through a strategic introduction to LG.",
  },
] as const;

export const team = [
  {
    name: "Liav Ben Rubi",
    role: "Managing Partner",
    image: "/team/liav-ben-rubi.webp",
    linkedin: "https://www.linkedin.com/in/liav-ben-rubi/",
    bio: "Liav has over 14 years of experience across automotive, robotics, and logistics. He began his career leading R&D programs in the Intelligence Technological Operational Command, and later served as a CEO in the automotive sector, running multinational programs from inception through implementation.",
  },
  {
    name: "Dana Taigman Koren",
    role: "Managing Partner",
    image: "/team/dana-taigman-koren.webp",
    linkedin: "https://www.linkedin.com/in/danataigmankoren/",
    bio: "Dana has more than 18 years of experience in investments, strategic initiatives, and global partnerships. She began as a strategic consultant and held corporate roles across IT, system integration, market research, and business intelligence, and led a multi-CVC collaboration with Lufthansa, Boeing, and gategroup.",
  },
  {
    name: "Liron Ben Zaken",
    role: "Principal",
    image: "/team/liron-ben-zaken.png",
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
