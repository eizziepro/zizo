import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // All 10 canonical public launch routes
  const routes = [
    '',
    'intended-parents',
    'become-a-surrogate',
    'egg-donation',
    'how-surrogacy-works',
    'about',
    'book-a-call',
    'contact',
    'insights',
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}/${route ? `${route}/` : ''}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route.includes('intended-parents') || route.includes('become-a-surrogate') ? 0.9 : 0.8,
  }));
}
