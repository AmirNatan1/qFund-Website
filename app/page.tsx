import type { Metadata } from "next";
import QFundExperience from "./QFundExperience";

export const metadata: Metadata = {
  title: "qFund | Funding the Deep Future of Technology",
  description:
    "qFund is an early-stage deep tech venture firm partnering with exceptional Israeli scientists and engineers.",
  keywords: [
    "deep tech venture capital",
    "Israel VC",
    "quantum computing",
    "robotics",
    "compute infrastructure",
    "qFund",
  ],
  openGraph: {
    title: "qFund | Funding the Deep Future of Technology",
    description:
      "Early partners to exceptional scientists and engineers building the foundations of what comes next.",
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
      "Early partners to exceptional scientists and engineers building the foundations of what comes next.",
    images: ["/og.png"],
  },
};

export default function Home() {
  return <QFundExperience />;
}
