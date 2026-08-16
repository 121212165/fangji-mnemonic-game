// 站点地图：列出分类与方剂详情页
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const [categories, formulas] = await Promise.all([
    db.formulaCategory.findMany({ select: { id: true, updatedAt: true } }),
    db.formula.findMany({ select: { id: true, updatedAt: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${appUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${appUrl}/search`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${appUrl}/categories/${c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const formulaEntries: MetadataRoute.Sitemap = formulas.map((f) => ({
    url: `${appUrl}/formulas/${encodeURIComponent(f.id)}`,
    lastModified: f.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...categoryEntries, ...formulaEntries];
}
