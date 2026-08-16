import type { MetadataRoute } from "next";
import { newsItems } from "./newsData";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://qfund.io";
  const paths = ["/", "/news/", "/contact/", ...newsItems.map((item) => `/news/${item.slug}/`)];
  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
  }));
}
