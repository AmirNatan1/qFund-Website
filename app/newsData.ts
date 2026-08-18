export type NewsSource = {
  outlet: string;
  title: string;
  url: string;
};

export type NewsItem = {
  date: string;
  company: string;
  title: string;
  slug: string;
  image: string;
  imageAlt: string;
  sources: readonly NewsSource[];
};

export const newsItems: readonly NewsItem[] = [
  {
    date: "2026-07-09",
    company: "Skapion",
    title: "qFund Participates in Skapion’s $36M Seed Round",
    slug: "qfund-participates-skapion-36m-seed",
    image: "/news/skapion-drone-swarm.webp",
    imageAlt: "Four counter-drone quadcopters flying in formation",
    sources: [
      {
        outlet: "CTech",
        title: "Skapion emerges from stealth with $36M Seed round for counter-drone swarm defense",
        url: "https://www.calcalistech.com/ctechnews/article/skeqh33xzl",
      },
      {
        outlet: "Techtime",
        title: "Skapion raises $36M to develop a counter-swarm defense system",
        url: "https://techtime.news/2026/07/14/skapion/",
      },
      {
        outlet: "New-Tech Magazine",
        title: "Skapion raises $36M for a drone-swarm interception system",
        url: "https://www.new-techonline.com/2026/07/%D7%A1%D7%98%D7%90%D7%A8%D7%98-%D7%90%D7%A4-%D7%94%D7%94%D7%92%D7%A0%D7%94-skapion-%D7%92%D7%99%D7%99%D7%A1-36-%D7%9E%D7%99%D7%9C%D7%99%D7%95%D7%9F-%D7%93%D7%95%D7%9C%D7%A8-%D7%9C%D7%A4%D7%99%D7%AA/",
      },
    ],
  },
  {
    date: "2026-06-30",
    company: "Esh-Tech",
    title: "qFund Participates in Esh-Tech’s $18M Funding Round",
    slug: "qfund-participates-esh-tech-18m-round",
    image: "/news/esh-tech-dronelight.webp",
    imageAlt: "Esh-Tech DroneLight counter-drone laser system mounted on a tracked vehicle",
    sources: [
      {
        outlet: "Techtime",
        title: "Esh-Tech raises $18M to expand its DroneLight counter-drone system",
        url: "https://techtime.co.il/2026/06/30/esh-tech/",
      },
      {
        outlet: "Bizportal",
        title: "Esh-Tech raises $18M to expand deployment of its drone-interception laser",
        url: "https://www.bizportal.co.il/BizTech/news/article/20034826",
      },
    ],
  },
  {
    date: "2026-02-17",
    company: "LiteVision",
    title: "qFund Co-Led LiteVision’s $8M Seed Round with 8VC",
    slug: "qfund-invests-litevision-8m-seed",
    image: "/news/litevision-drone-imaging.webp",
    imageAlt: "Compact unmanned helicopter flying above desert terrain",
    sources: [
      {
        outlet: "Globes",
        title: "8VC makes first Israeli defense-tech investment",
        url: "https://en.globes.co.il/en/article-8vc-makes-first-israeli-defense-tech-investment-1001535231",
      },
      {
        outlet: "Startup Nation Finder",
        title: "LiteVision company and funding profile",
        url: "https://finder.startupnationcentral.org/company_page/litevision-eo",
      },
    ],
  },
  {
    date: "2025-09-30",
    company: "Commcrete",
    title: "qFund-Backed Commcrete Reaches $29M in Total Funding",
    slug: "qfund-backed-commcrete-29m-funding",
    image: "/news/commcrete-stardust-flipper.webp",
    imageAlt: "Commcrete Stardust and Flipper tactical communications units on a soldier's gear",
    sources: [
      {
        outlet: "PR Newswire",
        title: "Commcrete raises $29M to deliver SATCOM-on-the-move",
        url: "https://www.prnewswire.com/news-releases/commcrete-raises-29m-to-deliver-first-true-satcom-on-the-move-downsizing-humvee-mounted-antenna-to-three-centimeters-302570829.html",
      },
      {
        outlet: "CTech",
        title: "Commcrete raises $29M for tactical satellite communications",
        url: "https://www.calcalistech.com/ctechnews/article/rkzk00fthlx",
      },
      {
        outlet: "Commcrete",
        title: "News and media coverage",
        url: "https://www.commcrete.com/resources/news",
      },
    ],
  },
  {
    date: "2025-07-03",
    company: "QEDMA",
    title: "qFund Participates in QEDMA’s $26M Series A",
    slug: "qfund-qedma-26m-series-a",
    image: "/news/qedma-quantum-computing.webp",
    imageAlt: "Gold-toned quantum computing cryostat against a black background",
    sources: [
      {
        outlet: "TechCrunch",
        title: "Israeli quantum startup QEDMA raises $26M with IBM joining",
        url: "https://techcrunch.com/2025/07/03/israeli-quantum-startup-qedma-just-raised-26-million-with-ibm-joining-in/",
      },
      {
        outlet: "PR Newswire",
        title: "QEDMA raises $26M to tackle quantum-computing errors",
        url: "https://www.prnewswire.com/news-releases/qedma-raises-26m-with-participation-from-ibm-to-tackle-quantum-computing-errors-and-accelerate-pace-to-quantum-advantage-302497701.html",
      },
      {
        outlet: "Calcalist",
        title: "IBM invests in Israeli quantum company QEDMA",
        url: "https://www.calcalist.co.il/calcalistech/article/ryhvor7hgg",
      },
    ],
  },
] as const;
