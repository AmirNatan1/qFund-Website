export const focusAreas = [
  {
    code: "01",
    title: "Quantum systems",
    short: "Quantum",
    text: "Hardware, control layers, and software that turn quantum effects into useful computational advantage.",
    signal: "QBIT / ERROR ↓",
  },
  {
    code: "02",
    title: "Robotics & autonomy",
    short: "Robotics",
    text: "Intelligent machines operating beyond the screen—from industrial automation to mission-critical autonomy.",
    signal: "SENSE / PLAN / ACT",
  },
  {
    code: "03",
    title: "Compute infrastructure",
    short: "Compute",
    text: "Semiconductors, thermal systems, photonics, and infrastructure for the next order of compute density.",
    signal: "FLOPS / WATT ↑",
  },
  {
    code: "04",
    title: "Space & communications",
    short: "Space",
    text: "Resilient connectivity, RF, optics, and orbital infrastructure for an always-connected physical world.",
    signal: "LINK / LATENCY ↓",
  },
  {
    code: "05",
    title: "Energy systems",
    short: "Energy",
    text: "Breakthrough generation, storage, and control technologies built for abundant, resilient energy.",
    signal: "BASELOAD / 24:7",
  },
  {
    code: "06",
    title: "Sensing & intelligence",
    short: "Sensing",
    text: "High-resolution sensing platforms that make the invisible measurable, actionable, and defensible.",
    signal: "NOISE / SIGNAL ↑",
  },
] as const;

export const portfolio = [
  {
    name: "Qedma",
    category: "Quantum computing",
    group: "compute",
    line: "Error suppression software unlocking useful quantum computation.",
    year: "2023",
  },
  {
    name: "Actasys",
    category: "Compute infrastructure",
    group: "matter",
    line: "Precision thermal systems for high-density data infrastructure.",
    year: "2023",
  },
  {
    name: "Commcrete",
    category: "Satellite communications",
    group: "connected",
    line: "Compact satellite connectivity for the world beyond terrestrial networks.",
    year: "2023",
  },
  {
    name: "Element Security",
    category: "Cyber infrastructure",
    group: "connected",
    line: "Continuous intelligence across the expanding external attack surface.",
    year: "2022",
  },
] as const;

export const team = [
  {
    initials: "LBR",
    name: "Liav Ben Rubi",
    role: "Managing Partner",
    focus: "Deep technology · Company building",
  },
  {
    initials: "DTK",
    name: "Dana Taigman Koren",
    role: "Managing Partner",
    focus: "Frontier systems · Early-stage strategy",
  },
  {
    initials: "LBZ",
    name: "Liron Ben Zaken",
    role: "Principal",
    focus: "Research · Founder partnerships",
  },
] as const;

export const filters = [
  ["all", "All companies"],
  ["matter", "Matter & energy"],
  ["compute", "Compute"],
  ["connected", "Connected systems"],
] as const;

export const underwritingTests = [
  {
    code: "T/01",
    title: "Technical truth",
    text: "A non-obvious advantage grounded in physics, architecture, or proprietary know-how—not a temporary feature gap.",
    signal: "ADVANTAGE / VERIFIED",
  },
  {
    code: "M/02",
    title: "Milestone velocity",
    text: "A sequence of experiments and engineering proofs that can retire the hardest risks faster than consensus expects.",
    signal: "RISK / FALLING",
  },
  {
    code: "E/03",
    title: "Economic leverage",
    text: "A breakthrough that changes a customer’s system economics—through performance, resilience, access, or cost.",
    signal: "VALUE / COMPOUNDING",
  },
  {
    code: "F/04",
    title: "Founder range",
    text: "Rare teams able to move fluently between first principles, product decisions, early customers, and global ambition.",
    signal: "RANGE / EXPANDING",
  },
] as const;

export const fieldNotes = [
  {
    code: "Q/01",
    category: "Quantum",
    title: "Quantum utility arrives before fault tolerance",
    summary: "The most valuable near-term systems may be those that make imperfect hardware measurably more useful, not those that wait for perfection.",
    watch: "Error suppression · orchestration · domain-specific advantage",
  },
  {
    code: "I/02",
    category: "Infrastructure",
    title: "The thermal wall is now a systems opportunity",
    summary: "As compute density rises, cooling and power delivery move from facilities constraints to core product architecture.",
    watch: "Heat removal · power density · workload-aware control",
  },
  {
    code: "A/03",
    category: "Robotics",
    title: "Autonomy moves into the physical stack",
    summary: "Robotic advantage will increasingly come from tightly coupling sensing, compute, control, and purpose-built hardware.",
    watch: "Edge inference · safety · unstructured environments",
  },
  {
    code: "S/04",
    category: "Space",
    title: "Resilient links become strategic infrastructure",
    summary: "Persistent connectivity beyond terrestrial coverage creates new products wherever conventional networks are fragile or absent.",
    watch: "RF efficiency · optical links · network orchestration",
  },
  {
    code: "E/05",
    category: "Energy",
    title: "Control layers unlock physical energy assets",
    summary: "Software matters most when it is inseparable from the physics: managing generation, storage, and demand as one responsive system.",
    watch: "Grid intelligence · long-duration storage · industrial heat",
  },
  {
    code: "X/06",
    category: "Sensing",
    title: "New measurements create new markets",
    summary: "When a signal becomes cheap, continuous, and precise enough, it changes what operators can insure, automate, and optimize.",
    watch: "Novel modalities · signal processing · trusted data",
  },
] as const;
