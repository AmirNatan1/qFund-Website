import type { Metadata } from "next";
import QFundExperience from "./QFundExperience";

export const metadata: Metadata = {
  title: "qFund | Early-Stage Deep Tech Venture Capital",
  description:
    "qFund invests from Pre-seed to Series A in Deep Tech startups developing core infrastructure, hardware, and enabling technologies.",
  alternates: { canonical: "/" },
  keywords: [
    "Deep Tech venture capital",
    "quantum computing",
    "defense technology",
    "semiconductors",
    "qFund",
  ],
  openGraph: {
    title: "qFund | Early-Stage Deep Tech Venture Capital",
    description:
      "qFund invests from Pre-seed to Series A in Deep Tech startups developing core infrastructure, hardware, and enabling technologies.",
    url: "/",
    type: "website",
    siteName: "qFund",
    images: [
      {
        url: "/og-motion.png",
        width: 1659,
        height: 948,
        alt: "qFund",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "qFund | Early-Stage Deep Tech Venture Capital",
    description:
      "qFund invests from Pre-seed to Series A in Deep Tech startups developing core infrastructure, hardware, and enabling technologies.",
    images: ["/og-motion.png"],
  },
};

/**
 * Arms the opening reveal before the hero paints, so the page never flashes its
 * resting state on the way in. This runs while the document is still parsing.
 * Visitors who ask for reduced motion never arm it, and the failsafe clears the
 * class if the bundle never takes over.
 */
const introBootstrap =
  '(function(){try{var d=document.documentElement;' +
  'if(!d||!window.matchMedia)return;' +
  'if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;' +
  'd.classList.add("qf-intro-active");' +
  'window.setTimeout(function(){if(!window.__qfIntro){' +
  'd.classList.remove("qf-intro-active","qf-intro-outro","qf-intro-landed");}},6000);' +
  '}catch(e){}})();';

export default function Home() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "qFund",
    url: "https://qfund.io/",
    logo: "https://qfund.io/qfund-logo.png",
    email: "info@qfund.io",
    sameAs: ["https://www.linkedin.com/company/q-fund"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Arik Einstein 3",
      addressLocality: "Herzliya",
    },
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
