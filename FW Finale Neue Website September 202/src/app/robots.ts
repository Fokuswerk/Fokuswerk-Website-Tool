import type { MetadataRoute } from 'next';

const basis = process.env.NEXT_PUBLIC_SITE_URL || 'https://fokuswerk.de';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/danke', '/api/'] },
    sitemap: `${basis}/sitemap.xml`,
  };
}
