import type { MetadataRoute } from "next";
import { basisUrl } from "@/daten/betrieb";

const wege: { weg: string; rang: number }[] = [
  { weg: "/", rang: 1 },
  { weg: "/leistungen", rang: 0.9 },
  { weg: "/leistungen/badsanierung", rang: 0.9 },
  { weg: "/leistungen/heizung", rang: 0.9 },
  { weg: "/leistungen/energie", rang: 0.8 },
  { weg: "/leistungen/pool-wellness", rang: 0.8 },
  { weg: "/leistungen/kundendienst", rang: 0.8 },
  { weg: "/ausstellung", rang: 0.9 },
  { weg: "/unternehmen", rang: 0.7 },
  { weg: "/karriere", rang: 0.9 },
  { weg: "/karriere/ausbildung", rang: 0.8 },
  { weg: "/kontakt", rang: 0.9 },
  { weg: "/impressum", rang: 0.2 },
  { weg: "/datenschutz", rang: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const stand = new Date();
  return wege.map(({ weg, rang }) => ({
    url: `${basisUrl}${weg}`,
    lastModified: stand,
    changeFrequency: rang >= 0.8 ? "monthly" : "yearly",
    priority: rang,
  }));
}
