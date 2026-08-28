import { MetadataRoute } from 'next';
import { getAllCompanies } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://leetcamp.sys';

  const companies = getAllCompanies();

  const companyRoutes = companies.map((c) => ({
    url: `${baseUrl}/company/${encodeURIComponent(c.company)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...companyRoutes,
  ];
}
