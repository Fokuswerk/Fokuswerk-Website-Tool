import type { MetadataRoute } from 'next';

const basis = process.env.NEXT_PUBLIC_SITE_URL || 'https://fokuswerk.de';

export default function sitemap(): MetadataRoute.Sitemap {
  const jetzt = new Date();
  return [
    { url: `${basis}/`, lastModified: jetzt, priority: 1 },
    { url: `${basis}/fallstudien/wav-westerstede`, lastModified: jetzt, priority: 0.8 },
    { url: `${basis}/kontakt`, lastModified: jetzt, priority: 0.7 },
  ];
}
