import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://getskula.com";
  const now = new Date();
  const routes = [
    "", "/features", "/contact", "/demo", "/terms", "/privacy",
    "/school-management-software-ghana",
    "/school-fees-management-software-ghana",
    "/student-attendance-software-ghana",
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : path.endsWith("-ghana") ? 0.9 : 0.7,
  }));
}
