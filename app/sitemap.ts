import type { MetadataRoute } from "next";
import { getAllPropertySlugs } from "@/lib/properties";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://luxeestate.example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllPropertySlugs();

  return [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    ...slugs.map(({ slug }) => ({
      url: `${BASE_URL}/properties/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

