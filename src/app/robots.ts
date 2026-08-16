// robots.txt：允许爬虫 + 指向 sitemap
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/settings/", "/ai/", "/errors/", "/stats/"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
