import type { Metadata } from "next";
import { headers } from "next/headers";
import QFundExperience from "./QFundExperience";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "qfund.io";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = protocol + "://" + host;

  return {
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
      images: [{ url: origin + "/og.png", width: 1712, height: 944, alt: "qFund — Funding the deep future of technology." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "qFund | Funding the Deep Future of Technology",
      description:
        "Early partners to exceptional scientists and engineers building the foundations of what comes next.",
      images: [origin + "/og.png"],
    },
  };
}

export default function Home() {
  return <QFundExperience />;
}
