import type { MetadataRoute } from "next";
import { beitraegeLaden } from "@/content/laden";
import { siteUrl } from "@/content/verein";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const beitraege = await beitraegeLaden();
  const seiten: {
    pfad: string;
    prioritaet: number;
    frequenz: "weekly" | "monthly" | "yearly";
  }[] = [
    { pfad: "", prioritaet: 1, frequenz: "monthly" },
    { pfad: "/ueber-uns", prioritaet: 0.8, frequenz: "yearly" },
    { pfad: "/aktuelles", prioritaet: 0.9, frequenz: "weekly" },
    { pfad: "/galerie", prioritaet: 0.7, frequenz: "monthly" },
    { pfad: "/unterstuetzen", prioritaet: 0.9, frequenz: "yearly" },
    { pfad: "/kontakt", prioritaet: 0.7, frequenz: "yearly" },
    { pfad: "/impressum", prioritaet: 0.2, frequenz: "yearly" },
    { pfad: "/datenschutz", prioritaet: 0.2, frequenz: "yearly" },
  ];

  return [
    ...seiten.map((seite) => ({
      url: `${siteUrl}${seite.pfad}`,
      lastModified: new Date(),
      changeFrequency: seite.frequenz,
      priority: seite.prioritaet,
    })),
    ...beitraege.map((beitrag) => ({
      url: `${siteUrl}/aktuelles/${beitrag.slug}`,
      lastModified: new Date(beitrag.datum),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
