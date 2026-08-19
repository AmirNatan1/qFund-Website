import type { Metadata } from "next";
import "./globals.css";
import "./revamp.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qfund.io"),
  title: "q fund | Early-Stage Deep Tech Venture Capital",
  description:
    "q fund invests in early-stage deeptech startups building core infrastructure, hardware, and enabling technologies across quantum computing, AI infrastructure, industrial systems, semiconductors, defense and national security.",
  openGraph: {
    type: "website",
    url: "https://qfund.io",
    siteName: "q fund",
    title: "q fund | Early-Stage Deep Tech Venture Capital",
    description:
      "q fund invests in early-stage deeptech startups building core infrastructure, hardware, and enabling technologies across quantum computing, AI infrastructure, industrial systems, semiconductors, defense and national security.",
    images: [
      {
        url: "/og.png",
        width: 1680,
        height: 945,
        alt: "q fund",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "q fund | Early-Stage Deep Tech Venture Capital",
    description:
      "q fund invests in early-stage deeptech startups building core infrastructure, hardware, and enabling technologies across quantum computing, AI infrastructure, industrial systems, semiconductors, defense and national security.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
