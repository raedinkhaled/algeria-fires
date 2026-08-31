import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site-url";

const routes = [
  { path: "/", priority: 1 },
  { path: "/investigation", priority: 0.9 },
  { path: "/chronology", priority: 0.85 },
  { path: "/map", priority: 0.85 },
  { path: "/report", priority: 0.85 },
  { path: "/data", priority: 0.8 },
  { path: "/methodology", priority: 0.8 },
  { path: "/sources", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority }) => ({
    url: absoluteUrl(path),
    lastModified: "2026-08-31",
    changeFrequency: "monthly",
    priority,
  }));
}
