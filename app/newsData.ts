export type NewsItem = {
  date: string;
  company: string;
  title: string;
  slug: string;
  blurb: string;
  tag: "Investment" | "Portfolio";
  image: string;
  imageAlt: string;
  body: readonly string[];
};

export const newsItems: readonly NewsItem[] = [
  {
    date: "2026-07-09",
    company: "Skapion",
    title: "qFund Participates in Skapion’s $36M Seed Round",
    slug: "qfund-participates-skapion-36m-seed",
    blurb: "qFund participated in Skapion’s $36 million Seed financing as the defense-tech company advances a purpose-built platform for countering coordinated drone swarms.",
    tag: "Investment",
    image: "/news/skapion-drone-swarm.webp",
    imageAlt: "Four counter-drone quadcopters flying in formation",
    body: [
      "qFund participated in the $36 million Seed round of Skapion, an Israeli defense technology company developing a purpose-built counter-swarm defense platform.",
      "The financing was co-led by UP.Partners and Khosla Ventures, with qFund participating alongside Fusion VC, Stratos Ventures and TBD VC.",
      "Skapion is building a system designed from the ground up for the challenge of coordinated drone swarms rather than individual UAV threats. The company said the financing will support engineering expansion, accelerated product development, system integration and testing, and engagement with defense and government organizations across Israel, the United States and additional international markets.",
      "For qFund, the investment reflects its focus on early-stage deep technologies addressing complex, infrastructure-level challenges in defense and autonomous systems.",
    ],
  },
  {
    date: "2026-06-30",
    company: "Esh-Tech",
    title: "qFund Participates in Esh-Tech’s $18M Funding Round",
    slug: "qfund-participates-esh-tech-18m-round",
    blurb: "qFund joined Esh-Tech’s $18 million financing as the company moves its DroneLight counter-drone laser system toward scaled production and international deployment.",
    tag: "Investment",
    image: "/news/esh-tech-dronelight.webp",
    imageAlt: "Esh-Tech DroneLight counter-drone laser system mounted on a tracked vehicle",
    body: [
      "qFund participated in an $18 million financing round for Esh-Tech, the Israeli defense technology company developing the DroneLight pulsed-laser counter-drone system.",
      "The round was led by Kinetica, with qFund joining Mahari, Renaton Capital, 2i Ventures, Hinkley, FFG, angel investors and the Israel Innovation Authority through its startup fund framework.",
      "Esh-Tech said the financing will be used to complete development of DroneLight, establish a production line in Israel, expand the team, and increase international marketing, sales and delivery activity.",
      "The investment adds another advanced defense technology company to qFund’s deep-tech portfolio and reflects the fund’s focus on technologies that combine difficult hardware, engineering and real-world deployment requirements.",
    ],
  },
  {
    date: "2026-02-17",
    company: "LiteVision-EO",
    title: "qFund Joins LiteVision-EO’s $8M Seed Round",
    slug: "qfund-invests-litevision-8m-seed",
    blurb: "qFund participated in LiteVision-EO’s $8 million Seed financing, backing the Israeli company’s development of compact electro-optical imaging systems for drones.",
    tag: "Investment",
    image: "/news/litevision-drone-imaging.webp",
    imageAlt: "Compact unmanned helicopter flying above desert terrain",
    body: [
      "qFund participated in the $8 million Seed financing of LiteVision-EO, an Israeli defense technology startup developing compact electro-optical imaging systems for drones.",
      "The financing brought together qFund with 8VC, Kinetica and 10D.",
      "LiteVision-EO develops electro-optical cameras designed for the constraints of smaller unmanned aerial platforms, combining advanced imaging capabilities with compact form factors for tactical drone applications.",
      "The investment fits qFund’s strategy of backing early-stage deep-technology companies where sophisticated hardware, sensing and engineering create fundamental enabling capabilities.",
    ],
  },
  {
    date: "2025-09-30",
    company: "Commcrete",
    title: "qFund-Backed Commcrete Reaches $29M in Total Funding",
    slug: "qfund-backed-commcrete-29m-funding",
    blurb: "Early qFund portfolio company Commcrete announced $29 million in cumulative funding, including a $21 million Series A to accelerate its tactical satellite communications platform.",
    tag: "Portfolio",
    image: "/news/commcrete-stardust-flipper.webp",
    imageAlt: "Commcrete Stardust and Flipper tactical communications units on a soldier's gear",
    body: [
      "qFund portfolio company Commcrete announced $29 million in cumulative financing across its Seed and Series A rounds.",
      "The latest $21 million Series A was led by Greenfield Partners, with participation from Redseed Ventures and existing investors. Commcrete’s earlier Seed financing was backed by qFund, Prof. Amnon Shashua and private angel investors.",
      "Commcrete develops compact tactical satellite communications systems designed to provide secure connectivity in environments where conventional communications infrastructure is unavailable or unreliable. The company said the financing will support global expansion as adoption of its systems grows across defense, security, emergency-response and other operational markets.",
      "The milestone represents continued growth for a company qFund backed at an earlier stage of its development.",
    ],
  },
  {
    date: "2025-07-03",
    company: "QEDMA",
    title: "qFund Participates in QEDMA’s $26M Series A",
    slug: "qfund-qedma-26m-series-a",
    blurb: "qFund participated in QEDMA’s $26 million Series A alongside IBM and international investors as the company advances software for reducing errors in quantum computation.",
    tag: "Investment",
    image: "/news/qedma-quantum-computing.webp",
    imageAlt: "Gold-toned quantum computing cryostat against a black background",
    body: [
      "qFund participated in QEDMA’s $26 million Series A financing, supporting the Israeli quantum computing company as it advances software designed to reduce and mitigate errors in quantum computation.",
      "The round was led by Glilot Capital Partners through Glilot+, with participation including IBM, Korea Investment Partners, TPY Capital, qFund and additional investors.",
      "QEDMA develops software-based quantum error suppression and mitigation technology intended to improve the accuracy and practical usefulness of calculations performed on today’s quantum computing hardware.",
      "The investment reflects qFund’s commitment to deep technologies addressing fundamental technical bottlenecks and to Israel’s growing quantum technology ecosystem.",
    ],
  },
] as const;

export function formatNewsDate(date: string) {
  const [year, month, day = 1] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
