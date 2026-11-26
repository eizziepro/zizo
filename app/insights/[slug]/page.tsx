import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { WhatsAppLink } from '@/components/WhatsAppLink';
import { getArticleBySlug, articles } from '@/lib/insights-data';
import { generateArticleSchema, generateBreadcrumbSchema } from '@/lib/structured-data';
import { siteConfig } from '@/lib/config';
import { CalendarIcon, ShieldCheckIcon } from '@/components/Icons';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: `${article.title} | Zizo Surrogacy Insights`,
    description: article.summary,
    alternates: {
      canonical: `${siteConfig.url}/insights/${article.slug}/`,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.publishDate,
      modifiedTime: article.modifiedDate,
      authors: [article.author.name],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const articleSchema = generateArticleSchema({
    title: article.title,
    slug: article.slug,
    description: article.summary,
    publishDate: article.publishDate,
    modifiedDate: article.modifiedDate,
    authorName: article.author.name,
    authorUrl: `${siteConfig.url}/about/`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Agency Insights', url: `${siteConfig.url}/insights/` },
    { name: article.title, url: `${siteConfig.url}/insights/${article.slug}/` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumbs
        items={[
          { name: 'Agency Insights', href: '/insights/' },
          { name: article.title },
        ]}
      />

      <article className="section-padding bg-[var(--surface-page)]">
        <div className="container max-w-3xl">
          {/* Header */}
          <header className="mb-10 pb-8 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 text-xs font-mono uppercase text-[var(--text-muted)] mb-3">
              <span className="font-semibold text-[var(--action-primary)]">{article.category}</span>
              <span>&bull;</span>
              <span>{article.readTime}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-medium text-[var(--black-shade-150)] leading-tight mb-4">
              {article.title}
            </h1>

            <p className="text-base text-[var(--text-secondary)] font-light leading-relaxed mb-6">
              {article.summary}
            </p>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-4 border-t border-[var(--border-subtle)]">
              <div>
                <span className="text-[var(--text-primary)] font-medium block">{article.author.name}</span>
                <span>{article.author.role}</span>
              </div>
              <time dateTime={article.publishDate}>
                {new Date(article.publishDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </div>
          </header>

          {/* Body Paragraphs */}
          <div className="prose prose-lg max-w-none space-y-6 text-sm md:text-base text-[var(--text-primary)] leading-relaxed">
            {article.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Medical & Legal Disclaimer Callout */}
          <div className="my-10 p-5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs text-[var(--text-secondary)]">
            <ShieldCheckIcon size={20} className="text-[var(--action-primary)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[var(--black-shade-150)] block mb-1">Notice:</strong>
              This article is published for educational and informational purposes only. It does not constitute formal legal counsel or medical advice. Prospective parents and surrogates should consult with qualified legal and fertility specialists regarding their specific circumstances.
            </div>
          </div>

          {/* In-Article Conversion Card */}
          <div className="p-8 rounded-xl bg-[var(--surface-warm)] border border-[var(--border-default)] text-center flex flex-col items-center gap-3">
            <h3 className="text-xl font-medium text-[var(--black-shade-150)]">
              Have Questions About This Topic?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-primary)] max-w-lg leading-relaxed">
              Our coordination team is available to discuss your personal circumstances and guide you toward qualified clinical and legal partners.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/book-a-call/" className="btn btn-primary text-sm">
                <CalendarIcon size={16} />
                <span>Schedule a Consultation</span>
              </Link>
              <WhatsAppLink audience="general" variant="primary" />
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
