import { MetadataRoute } from "next";
import { getAllPropertySlugs } from "@/lib/db/actions/property.actions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://homes.in";

  const slugs = await getAllPropertySlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl,                priority: 1.0,  changeFrequency: "weekly" },
    { url: `${baseUrl}/projects`,  priority: 0.9,  changeFrequency: "daily" },
    { url: `${baseUrl}/about`,     priority: 0.6,  changeFrequency: "monthly" },
    { url: `${baseUrl}/contact`,   priority: 0.7,  changeFrequency: "monthly" },
    { url: `${baseUrl}/services`,  priority: 0.6,  changeFrequency: "monthly" },
    { url: `${baseUrl}/blogs`,     priority: 0.7,  changeFrequency: "weekly" },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    priority: 0.85,
    changeFrequency: "weekly" as const,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...propertyRoutes];
}
