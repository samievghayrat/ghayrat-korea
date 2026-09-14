import type { MetadataRoute } from 'next';

const BASE_URL = 'https://ghayrat.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: BASE_URL, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/auction`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/how-to-buy`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contacts`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
