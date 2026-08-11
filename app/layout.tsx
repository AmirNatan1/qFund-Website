import type { Metadata } from "next";
import "./globals.css";
import "./revamp.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qfund.io"),
  title: "qFund | Early-Stage Deep Tech Venture Capital",
  description:
    "qFund invests from Pre-seed to Series A in Deep Tech startups developing core infrastructure, hardware, and enabling technologies.",
  openGraph: {
    type: "website",
    url: "https://qfund.io",
    siteName: "qFund",
    title: "qFund | Early-Stage Deep Tech Venture Capital",
    description:
      "qFund invests from Pre-seed to Series A in Deep Tech startups developing core infrastructure, hardware, and enabling technologies.",
    images: [
      {
        url: "/og.png",
        width: 1680,
        height: 945,
        alt: "qFund",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "qFund | Early-Stage Deep Tech Venture Capital",
    description:
      "qFund invests from Pre-seed to Series A in Deep Tech startups developing core infrastructure, hardware, and enabling technologies.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
