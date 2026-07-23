import type { Metadata } from "next";
import QFundExperience from "./QFundExperience";

export const metadata: Metadata = {
  title: "qFund | Funding the Deep Future of Technology",
  description:
    "qFund is an early-stage venture capital firm backing Israeli-related Deep Tech founders.",
  keywords: [
    "deep tech venture capital",
    "Israel VC",
    "quantum computing",
    "defense technology",
    "semiconductors",
    "qFund",
  ],
  openGraph: {
    title: "qFund | Funding the Deep Future of Technology",
    description:
      "An early-stage venture capital firm backing Israeli-related Deep Tech founders.",
    type: "website",
    siteName: "qFund",
    images: [
      {
        url: "/og.png",
        width: 1712,
        height: 944,
        alt: "qFund — Funding the deep future of technology.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "qFund | Funding the Deep Future of Technology",
    description:
      "An early-stage venture capital firm backing Israeli-related Deep Tech founders.",
    images: ["/og.png"],
  },
};

export default function Home() {
  return <QFundExperience />;
}
