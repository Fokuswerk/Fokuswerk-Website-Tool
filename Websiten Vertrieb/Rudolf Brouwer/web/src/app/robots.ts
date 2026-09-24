import type { MetadataRoute } from "next";
import { basisUrl, indexierbar } from "@/daten/betrieb";

export default function robots(): MetadataRoute.Robots {
  if (!indexierbar) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${basisUrl}/sitemap.xml`,
    host: basisUrl,
  };
}
