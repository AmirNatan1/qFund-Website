import type { Metadata } from "next";
import QFundExperience from "./QFundExperience";

export const metadata: Metadata = {
  title: "qFund | Early-Stage Deep Tech Venture Capital",
  description:
    "qFund invests from Pre-seed to Series A in Israeli-related Deep Tech startups developing core infrastructure, hardware, and enabling technologies.",
  alternates: { canonical: "/" },
  keywords: [
    "Deep Tech venture capital",
    "Israel VC",
    "quantum computing",
    "defense technology",
    "semiconductors",
    "qFund",
  ],
  openGraph: {
    title: "qFund | Early-Stage Deep Tech Venture Capital",
    description:
      "qFund invests from Pre-seed to Series A in Israeli-related Deep Tech startups developing core infrastructure, hardware, and enabling technologies.",
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
      "qFund invests from Pre-seed to Series A in Israeli-related Deep Tech startups developing core infrastructure, hardware, and enabling technologies.",
    images: ["/og-motion.png"],
  },
};

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
      addressCountry: "IL",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <QFundExperience />
    </>
  );
}
