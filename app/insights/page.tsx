import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { articles } from '@/lib/insights-data';
import { generateBreadcrumbSchema } from '@/lib/structured-data';
import { siteConfig } from '@/lib/config';
import { ArrowRightIcon, CalendarIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Agency Insights | Surrogacy Guides & Updates | Zizo Surrogacy',
  description:
    'Thoughtful guides, legal perspectives, and clinical coordination insights for intended parents and surrogates in Lagos, Nigeria.',
  alternates: {
    canonical: `${siteConfig.url}/insights/`,
  },
};

export default function InsightsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Agency Insights', url: `${siteConfig.url}/insights/` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumbs items={[{ name: 'Agency Insights' }]} />

      <section className="bg-dark text-white py-16 border-b-dark">
        <div className="wrap max-w-4xl">
          <span className="label-mono label-mono-inverse mb-4 inline-block">Agency Insights</span>
          <h1 className="display-hero text-white mb-4">
            Guidance, legal clarity, and clinical perspectives.
          </h1>
          <p className="text-lg text-inverse-muted leading-relaxed font-light">
            Clear, honest articles answering the most important legal, medical, and emotional questions surrounding assisted reproduction and surrogacy in Lagos, Nigeria.
          </p>
        </div>
      </section>

      <section className="section-padding bg-[var(--surface-page)]">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <article key={article.slug} className="bento-card p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono uppercase text-[var(--text-muted)] mb-3">
                    <span className="font-semibold text-[var(--action-primary)]">{article.category}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h2 className="text-xl font-medium text-[var(--black-shade-150)] mb-3">
                    <Link href={`/insights/${article.slug}/`} className="hover:text-[var(--action-primary)]">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                    {article.summary}
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    By {article.author.name}
                  </span>
                  <Link
                    href={`/insights/${article.slug}/`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--action-primary)] hover:underline"
                  >
                    <span>Read Article</span>
                    <ArrowRightIcon size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
