import type { MetadataRoute } from "next";

const basis = "https://brouwer-gmbh.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const stand = new Date();
  const seiten: { pfad: string; prioritaet: number }[] = [
    { pfad: "", prioritaet: 1 },
    { pfad: "/bad", prioritaet: 0.9 },
    { pfad: "/heizung", prioritaet: 0.9 },
    { pfad: "/solarenergie", prioritaet: 0.8 },
    { pfad: "/schwimmbad", prioritaet: 0.8 },
    { pfad: "/wellness", prioritaet: 0.7 },
    { pfad: "/ausstellung", prioritaet: 0.8 },
    { pfad: "/unternehmen", prioritaet: 0.7 },
    { pfad: "/karriere", prioritaet: 0.7 },
    { pfad: "/kontakt", prioritaet: 0.9 },
    { pfad: "/partner", prioritaet: 0.4 },
  ];
  return seiten.map((s) => ({
    url: `${basis}${s.pfad}`,
    lastModified: stand,
    changeFrequency: "monthly",
    priority: s.prioritaet,
  }));
}
