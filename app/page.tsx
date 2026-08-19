import type { Metadata } from "next";
import QFundExperience from "./QFundExperience";

export const metadata: Metadata = {
  title: "q fund | Early-Stage Deep Tech Venture Capital",
  description:
    "q fund invests in early-stage deeptech startups building core infrastructure, hardware, and enabling technologies across quantum computing, AI infrastructure, industrial systems, semiconductors, defense and national security.",
  alternates: { canonical: "/" },
  keywords: [
    "Deep Tech venture capital",
    "quantum computing",
    "defense technology",
    "semiconductors",
    "q fund",
  ],
  openGraph: {
    title: "q fund | Early-Stage Deep Tech Venture Capital",
    description:
      "q fund invests in early-stage deeptech startups building core infrastructure, hardware, and enabling technologies across quantum computing, AI infrastructure, industrial systems, semiconductors, defense and national security.",
    url: "/",
    type: "website",
    siteName: "q fund",
    images: [
      {
        url: "/og-motion.png",
        width: 1659,
        height: 948,
        alt: "q fund",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "q fund | Early-Stage Deep Tech Venture Capital",
    description:
      "q fund invests in early-stage deeptech startups building core infrastructure, hardware, and enabling technologies across quantum computing, AI infrastructure, industrial systems, semiconductors, defense and national security.",
    images: ["/og-motion.png"],
  },
};

/**
 * Arms the opening reveal before the hero paints. An in-memory marker prevents
 * it from replaying during client-side navigation without placing a persistent
 * identifier on the visitor's device. Visitors who ask for reduced motion never
 * arm it, and the failsafe clears the class if the bundle never takes over.
 */
const introBootstrap =
  '(function(){try{var d=document.documentElement;' +
  'if(!d||!window.matchMedia)return;' +
  'if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;' +
  'if(window.__qfIntroSeen)return;' +
  'window.__qfIntroSeen=true;' +
  'window.__qfIntroFirstVisit=true;' +
  'd.classList.add("qf-intro-active");' +
  'window.setTimeout(function(){if(!window.__qfIntro){' +
  'd.classList.remove("qf-intro-active","qf-intro-outro","qf-intro-landed");}},6000);' +
  '}catch(e){}})();';

export default function Home() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "q fund",
    url: "https://qfund.io/",
    logo: "https://qfund.io/qfund-logo.png",
    email: "info@qfund.io",
    sameAs: ["https://www.linkedin.com/company/q-fund"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script dangerouslySetInnerHTML={{ __html: introBootstrap }} />
      <QFundExperience />
    </>
  );
}
