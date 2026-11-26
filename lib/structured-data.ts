import { siteConfig } from './config';

/**
 * Structured Data (JSON-LD) Generators — Zizo Surrogacy
 * Compliant with schema.md and Google Search Central requirements.
 */

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      '@id': `${siteConfig.url}/#organization`,
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    telephone: siteConfig.contact.phoneGeneralRaw,
    email: siteConfig.contact.email,
    sameAs: [
      siteConfig.socials.instagram,
      siteConfig.socials.tiktok,
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: siteConfig.contact.phoneGeneralRaw,
        contactType: 'customer support',
        areaServed: 'NG',
        availableLanguage: ['en'],
      },
      {
        '@type': 'ContactPoint',
        telephone: siteConfig.contact.phoneSurrogateRaw,
        contactType: 'surrogate inquiries',
        areaServed: 'NG',
        availableLanguage: ['en'],
      },
    ],
  };
}

export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: siteConfig.contact.phoneGeneralRaw,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.location.street,
      addressLocality: siteConfig.location.locality,
      addressRegion: siteConfig.location.region,
      postalCode: siteConfig.location.postalCode,
      addressCountry: siteConfig.location.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.location.coordinates.latitude,
      longitude: siteConfig.location.coordinates.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
    ],
  };
}

export function generateServiceSchema(
  serviceName: string,
  serviceDescription: string,
  serviceSlug: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteConfig.url}/${serviceSlug}/#service`,
    name: serviceName,
    description: serviceDescription,
    url: `${siteConfig.url}/${serviceSlug}/`,
    provider: {
      '@id': `${siteConfig.url}/#organization`,
    },
    areaServed: {
      '@type': 'City',
      name: 'Lagos',
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  slug: string;
  description: string;
  publishDate: string;
  modifiedDate: string;
  authorName: string;
  authorUrl?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${siteConfig.url}/insights/${article.slug}/#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/insights/${article.slug}/`,
    },
    headline: article.title,
    description: article.description,
    image: article.image || siteConfig.ogImage,
    datePublished: article.publishDate,
    dateModified: article.modifiedDate,
    author: {
      '@type': 'Person',
      name: article.authorName,
      ...(article.authorUrl ? { url: article.authorUrl } : {}),
    },
    publisher: {
      '@id': `${siteConfig.url}/#organization`,
    },
  };
}
