import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qfund.io"),
  title: "qFund | Deep Tech Venture Capital",
  description:
    "Early-stage venture capital backing Israeli-related Deep Tech founders.",
  openGraph: {
    type: "website",
    url: "https://qfund.io",
    siteName: "qFund",
    title: "qFund | Funding the Deep Future of Technology",
    description:
      "Early-stage venture capital backing Israeli-related Deep Tech founders.",
    images: [
      {
        url: "/og.png",
        width: 1680,
        height: 945,
        alt: "qFund — Funding the Deep Future of Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "qFund | Funding the Deep Future of Technology",
    description:
      "Early-stage venture capital backing Israeli-related Deep Tech founders.",
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
