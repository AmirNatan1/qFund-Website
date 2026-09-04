import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://qfund.io";
  const paths = [
    "/",
    "/contact/",
    "/privacy/",
    "/accessibility/",
    "/terms/",
  ];
  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
  }));
}
