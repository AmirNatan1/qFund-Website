export type NewsItem = {
  date: string;
  company: string;
  title: string;
  image: string;
  imageAlt: string;
  url: string;
};

export const newsItems: readonly NewsItem[] = [
  {
    date: "2026-07-09",
    company: "Skapion",
    title: "q fund Participates in Skapion’s $36M Seed Round",
    image: "/news/skapion-drone-swarm.webp",
    imageAlt: "Four counter-drone quadcopters flying in formation",
    url: "https://www.calcalistech.com/ctechnews/article/skeqh33xzl",
  },
  {
    date: "2026-06-30",
    company: "Esh-Tech",
    title: "q fund Participates in Esh-Tech’s $18M Funding Round",
    image: "/news/esh-tech-dronelight.webp",
    imageAlt: "Esh-Tech DroneLight counter-drone laser system mounted on a tracked vehicle",
    url: "https://techtime.co.il/2026/06/30/esh-tech/",
  },
  {
    date: "2026-02-17",
    company: "LiteVision",
    title: "q fund Co-Led LiteVision’s $8M Seed Round with 8VC",
    image: "/news/litevision-drone-imaging.webp",
    imageAlt: "Compact unmanned helicopter flying above desert terrain",
    url: "https://en.globes.co.il/en/article-8vc-makes-first-israeli-defense-tech-investment-1001535231",
  },
] as const;
