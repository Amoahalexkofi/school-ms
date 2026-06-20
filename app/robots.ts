import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://getskula.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/novalss-admin", "/settings", "/sign-in"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
