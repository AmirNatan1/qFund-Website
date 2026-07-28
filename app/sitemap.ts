import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://qfund.io";
  return ["/", "/news/", "/contact/"].map((path) => ({
    url: `${baseUrl}${path}`,
  }));
}
