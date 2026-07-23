import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://qfund.io"),
  title: "qFund | Deep Tech Venture Capital",
  description:
    "Early-stage venture capital backing Israeli-related Deep Tech founders.",
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
