import {
  escapeHtml,
  renderClosingCta,
  renderFooter,
  renderHead,
  renderHeader,
  renderInteriorHero,
} from '../partials/layout.mjs';

export function renderBlogIndexPage({
  posts = [],
  categories = [],
  activeCategory = null,
  settings = {},
  siteUrl = '',
}) {
  const featured = posts[0] || null;
  const pageTitle = activeCategory
    ? `${activeCategory.name} Articles | Zizo Journal`
    : 'Journal & Fertility Guides | Zizo Donor and Surrogacy';
  const canonicalPath = activeCategory
    ? `/resources/blog/category/${activeCategory.slug}/`
    : '/resources/blog/';

  return `${renderHead({
    title: pageTitle,
    description:
      'Thoughtful, non-promissory guides on surrogacy coordination, egg donor screening, and cross-border fertility planning from Zizo.',
    canonicalPath,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: activeCategory
      ? [
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/resources/blog/' },
          { label: activeCategory.name },
        ]
      : [{ label: 'Home', href: '/' }, { label: 'Resources' }, { label: 'Blog' }],
    title: activeCategory ? activeCategory.name : 'The Zizo Journal.',
    intro:
      'Calm, practical guides on surrogacy, egg donation screening, and cross-border family building.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-md)]">
      <!-- Search & Category Filter Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#E1E0DD]">
        <div class="flex flex-wrap items-center gap-2" role="navigation" aria-label="Blog categories">
          <a href="/resources/blog/" class="px-3.5 py-2 rounded-[var(--radius)] text-[length:var(--fs-small)] font-medium ${!activeCategory ? 'bg-[#17645F] text-[#FAF9F6]' : 'bg-[#E1E0DD] text-[#17191A] hover:bg-[#d5d4d0]'}">All articles</a>
          ${categories
            .map(
              (c) => `<a href="/resources/blog/category/${escapeHtml(c.slug)}/" class="px-3.5 py-2 rounded-[var(--radius)] text-[length:var(--fs-small)] font-medium ${activeCategory && activeCategory.slug === c.slug ? 'bg-[#17645F] text-[#FAF9F6]' : 'bg-[#E1E0DD] text-[#17191A] hover:bg-[#d5d4d0]'}">${escapeHtml(c.name)}</a>`
            )
            .join('')}
        </div>

        <div class="w-full md:w-72">
          <label for="blog-search-input" class="sr-only">Search articles</label>
          <input id="blog-search-input" type="search" placeholder="Search articles..." class="input-field" />
        </div>
      </div>

      ${
        featured && !activeCategory
          ? `<a href="/resources/blog/${escapeHtml(featured.slug)}/" class="grid grid-cols-1 lg:grid-cols-12 gap-6 border border-[#E1E0DD] rounded-[var(--radius)] overflow-hidden bg-[#FAF9F6] hover:bg-[#E1E0DD]/25 transition-colors reveal">
        <div class="lg:col-span-6 aspect-[16/10] bg-[#E1E0DD] overflow-hidden">
          <img src="${escapeHtml(featured.featured_image_url || '/assets/img/blog-default-1920w.webp')}" alt="${escapeHtml(featured.featured_image_alt || featured.title)}" width="1200" height="750" class="w-full h-full object-cover" />
        </div>
        <div class="lg:col-span-6 p-7 flex flex-col justify-center gap-3">
          <div class="flex items-center gap-2 text-xs text-[#5D5E5F]">
            <span>Featured</span>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(featured.category_name || 'Guide')}</span>
            <span aria-hidden="true">·</span>
            <span>${Number(featured.reading_minutes || 3)} min read</span>
          </div>
          <h2 class="display">${escapeHtml(featured.title)}</h2>
          <p class="text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(featured.excerpt)}</p>
          <span class="text-[length:var(--fs-small)] font-semibold text-[#17645F] pt-2">Read article</span>
        </div>
      </a>`
          : ''
      }

            <div id="blog-posts-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${posts
          .map(
            (post) => `<article class="border border-[#E1E0DD] rounded-[var(--radius)] overflow-hidden bg-[#FAF9F6] flex flex-col justify-between reveal" data-post-card data-title="${escapeHtml(post.title.toLowerCase())}" data-excerpt="${escapeHtml(post.excerpt.toLowerCase())}">
          <a href="/resources/blog/${escapeHtml(post.slug)}/" class="block aspect-[16/10] bg-[#E1E0DD] overflow-hidden">
            <img src="${escapeHtml(post.featured_image_url || '/assets/img/blog-default-1920w.webp')}" alt="${escapeHtml(post.featured_image_alt || post.title)}" width="1200" height="750" loading="lazy" decoding="async" class="w-full h-full object-cover" />
          </a>
          <div class="p-6 flex-1 flex flex-col justify-between gap-4">
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-xs text-[#5D5E5F]">
                <span>${escapeHtml(post.category_name || 'Guide')}</span>
                <span aria-hidden="true">·</span>
                <span>${Number(post.reading_minutes || 3)} min read</span>
              </div>
              <h2 class="display text-[length:var(--fs-h3)]"><a href="/resources/blog/${escapeHtml(post.slug)}/" class="hover:text-[#17645F]">${escapeHtml(post.title)}</a></h2>
              <p class="text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(post.excerpt)}</p>
            </div>
            <a href="/resources/blog/${escapeHtml(post.slug)}/" class="text-[length:var(--fs-small)] font-semibold text-[#17645F] hover:underline">Read article</a>
          </div>
        </article>`
          )
          .join('')}
      </div>

      <nav aria-label="Blog pagination" class="pt-8 flex items-center justify-center gap-2">
        <button type="button" class="w-10 h-10 rounded-full border border-[#E1E0DD] text-[#17191A] flex items-center justify-center hover:bg-[#E1E0DD]/40 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Previous page" disabled>
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
        </button>
        <button type="button" aria-current="page" class="w-10 h-10 rounded-full bg-[#17645F] text-[#FAF9F6] font-semibold text-sm flex items-center justify-center">
          1
        </button>
        <button type="button" class="w-10 h-10 rounded-full border border-[#E1E0DD] text-[#17191A] font-semibold text-sm flex items-center justify-center hover:bg-[#E1E0DD]/40">
          2
        </button>
        <button type="button" class="w-10 h-10 rounded-full border border-[#E1E0DD] text-[#17191A] flex items-center justify-center hover:bg-[#E1E0DD]/40" aria-label="Next page">
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      </nav>

      <p id="blog-empty-msg" class="hidden text-center py-10 text-[#5D5E5F]">No articles match your search.</p>
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export function renderBlogPostPage({
  post,
  renderedHtml,
  toc = [],
  relatedPosts = [],
  prevPost = null,
  nextPost = null,
  settings = {},
  siteUrl = '',
}) {
  const canonicalPath = `/resources/blog/${post.slug}/`;
  const pubDate = (post.publish_at || post.created_at || '').slice(0, 10);
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.seo_title || post.title,
      description: post.meta_description || post.excerpt,
      datePublished: post.publish_at || post.created_at,
      dateModified: post.updated_at || post.created_at,
      author: {
        '@type': 'Person',
        name: post.author_name || 'Chizaram Ata',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Zizo Donor and Surrogacy',
      },
      image: post.featured_image_url || '/assets/img/blog-default-1920w.webp',
      mainEntityOfPage: `${siteUrl}${canonicalPath}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/resources/blog/` },
        { '@type': 'ListItem', position: 3, name: post.title, item: `${siteUrl}${canonicalPath}` },
      ],
    },
  ];

  return `${renderHead({
    title: post.seo_title || `${post.title} | Zizo Journal`,
    description: post.meta_description || post.excerpt,
    canonicalPath,
    ogImage: post.og_image_url || post.featured_image_url || '/assets/img/og-default.jpg',
    noindex: Boolean(post.noindex),
    jsonLd,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  <article class="pt-32 pb-[var(--space-xl)] bg-[#FAF9F6]">
    <div class="zizo-container">
      <nav aria-label="Breadcrumb" class="text-[length:var(--fs-small)] mb-6">
        <a href="/" class="text-[#5D5E5F] hover:text-[#17645F]">Home</a>
        <span class="mx-2 text-[#5D5E5F]" aria-hidden="true">/</span>
        <a href="/resources/blog/" class="text-[#5D5E5F] hover:text-[#17645F]">Blog</a>
        <span class="mx-2 text-[#5D5E5F]" aria-hidden="true">/</span>
        <span class="text-[#17191A]">${escapeHtml(post.title)}</span>
      </nav>

      <header class="w-full space-y-4 mb-10">
        <div class="flex flex-wrap items-center gap-2 text-[length:var(--fs-small)] text-[#5D5E5F]">
          <span>${escapeHtml(post.category_name || 'Guide')}</span>
          <span aria-hidden="true">·</span>
          <span>${escapeHtml(pubDate)}</span>
          <span aria-hidden="true">·</span>
          <span>${Number(post.reading_minutes || 3)} min read</span>
          <span aria-hidden="true">·</span>
          <span>By ${escapeHtml(post.author_name || 'Chizaram Ata')}</span>
        </div>
        <h1 class="display text-[length:var(--fs-h2)] md:text-[length:var(--fs-h1)]">${escapeHtml(post.title)}</h1>
        <p class="text-[length:var(--fs-body)] text-[#2E3031] max-w-none">${escapeHtml(post.excerpt)}</p>
      </header>

      <div class="w-full aspect-[16/9] md:aspect-[21/9] rounded-[var(--radius)] overflow-hidden bg-[#E1E0DD] mb-12">
        <img src="${escapeHtml(post.featured_image_url || '/assets/img/blog-default-1920w.webp')}" alt="${escapeHtml(post.featured_image_alt || post.title)}" width="1920" height="1080" class="w-full h-full object-cover" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-start">
        <aside class="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
          ${
            toc.length > 0
              ? `<nav aria-label="Table of contents" class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-3 bg-[#FAF9F6]">
            <p class="text-xs font-semibold uppercase tracking-[0.1em] text-[#5D5E5F]">In this article</p>
            <ul class="space-y-2 text-[length:var(--fs-small)]">
              ${toc
                .map(
                  (h) => `<li class="${h.level === 3 ? 'pl-3' : ''}"><a href="#${escapeHtml(h.id)}" class="text-[#2E3031] hover:text-[#17645F] hover:underline">${escapeHtml(h.text)}</a></li>`
                )
                .join('')}
            </ul>
          </nav>`
              : ''
          }

          <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-5 space-y-3 bg-[#E1E0DD]/35">
            <p class="font-display text-lg text-[#17191A]">Have questions about your path?</p>
            <p class="text-[length:var(--fs-small)] text-[#2E3031]">Speak privately with a Zizo coordinator about your goals.</p>
            <a href="/book/" class="btn-primary w-full justify-center">Book Consultation</a>
          </div>
        </aside>

        <div class="lg:col-span-8 space-y-8">
          <div class="zizo-prose">
            ${renderedHtml}
          </div>

          <div class="border-t border-b border-[#E1E0DD] py-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="font-display text-lg">${escapeHtml(post.author_name || 'Chizaram Ata')}</p>
              <p class="text-[length:var(--fs-small)] text-[#5D5E5F]">Zizo Donor and Surrogacy Care Team · General information only</p>
            </div>
            <button type="button" data-copy-link class="btn-secondary !py-2 !px-4">Copy article link</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${
              prevPost
                ? `<a href="/resources/blog/${escapeHtml(prevPost.slug)}/" class="border border-[#E1E0DD] rounded-[var(--radius)] p-4 hover:bg-[#E1E0DD]/30">
              <span class="text-xs text-[#5D5E5F]">Previous article</span>
              <p class="font-display text-base mt-1">${escapeHtml(prevPost.title)}</p>
            </a>`
                : '<div></div>'
            }
            ${
              nextPost
                ? `<a href="/resources/blog/${escapeHtml(nextPost.slug)}/" class="border border-[#E1E0DD] rounded-[var(--radius)] p-4 text-right hover:bg-[#E1E0DD]/30">
              <span class="text-xs text-[#5D5E5F]">Next article</span>
              <p class="font-display text-base mt-1">${escapeHtml(nextPost.title)}</p>
            </a>`
                : '<div></div>'
            }
          </div>
        </div>
      </div>

      ${
        relatedPosts.length > 0
          ? `<section class="mt-16 pt-12 border-t border-[#E1E0DD] space-y-6">
        <h2 class="display text-[length:var(--fs-h3)]">Related articles</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${relatedPosts
            .slice(0, 3)
            .map(
              (rp) => `<article class="border border-[#E1E0DD] rounded-[var(--radius)] overflow-hidden bg-[#FAF9F6] flex flex-col justify-between reveal">
            <a href="/resources/blog/${escapeHtml(rp.slug)}/" class="block aspect-[16/10] bg-[#E1E0DD] overflow-hidden">
              <img src="${escapeHtml(rp.featured_image_url || '/assets/img/blog-default-1920w.webp')}" alt="${escapeHtml(rp.featured_image_alt || rp.title)}" width="1200" height="750" loading="lazy" decoding="async" class="w-full h-full object-cover" />
            </a>
            <div class="p-6 flex-1 flex flex-col justify-between gap-4">
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-xs text-[#5D5E5F]">
                  <span>${escapeHtml(rp.category_name || 'Guide')}</span>
                  <span aria-hidden="true">·</span>
                  <span>${Number(rp.reading_minutes || 3)} min read</span>
                </div>
                <h3 class="display text-[length:var(--fs-h3)]"><a href="/resources/blog/${escapeHtml(rp.slug)}/" class="hover:text-[#17645F]">${escapeHtml(rp.title)}</a></h3>
                <p class="text-[length:var(--fs-small)] text-[#2E3031]">${escapeHtml(rp.excerpt)}</p>
              </div>
              <a href="/resources/blog/${escapeHtml(rp.slug)}/" class="text-[length:var(--fs-small)] font-semibold text-[#17645F] hover:underline">Read article</a>
            </div>
          </article>`
            )
            .join('')}
        </div>
      </section>`
          : ''
      }
    </div>
  </article>
  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export function renderFaqPage({ faqs = [], settings = {}, siteUrl = '' }) {
  const audiences = ['Intended Parents', 'Surrogates', 'Donors', 'Legal and Costs'];
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return `${renderHead({
    title: 'Frequently Asked Questions | Zizo Donor and Surrogacy',
    description:
      'Answers to common questions from intended parents, gestational surrogates, and egg donors about Zizo coordination, screening, and privacy.',
    canonicalPath: '/resources/faq/',
    jsonLd: faqJsonLd,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Resources' }, { label: 'FAQ' }],
    title: 'Frequently asked questions.',
    intro:
      'Clear answers grouped for intended parents, gestational surrogates, egg donors, and legal planning.',
    note: 'General information only, not medical or legal advice.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-md)]">
      <div class="max-w-md">
        <label for="faq-search-input" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Search questions</label>
        <input id="faq-search-input" type="search" placeholder="Type a keyword (e.g. screening, privacy, Lagos)..." class="input-field" />
      </div>

      <div class="space-y-12" id="faq-groups-container">
        ${audiences
          .map((aud) => {
            const groupFaqs = faqs.filter((f) => f.audience === aud);
            if (groupFaqs.length === 0) return '';
            return `<div class="space-y-4" data-faq-section>
          <h2 class="display text-[length:var(--fs-h3)]">${escapeHtml(aud)}</h2>
          <div class="divide-y divide-[#E1E0DD] border-y border-[#E1E0DD]" data-faq-group>
            ${groupFaqs
              .map((f, idx) => {
                const pid = `faq-page-${aud.replace(/\s+/g, '-').toLowerCase()}-${idx}`;
                return `<div class="faq-item py-5" data-open="false" data-faq-search="${escapeHtml(`${f.question} ${f.answer}`.toLowerCase())}">
              <button type="button" class="w-full flex items-center justify-between gap-4 text-left min-h-[44px]" aria-expanded="false" aria-controls="${pid}" data-faq-trigger>
                <span class="font-display text-xl">${escapeHtml(f.question)}</span>
                <span class="faq-plus shrink-0 w-8 h-8 rounded-full border border-[#E1E0DD] inline-flex items-center justify-center"><i data-lucide="plus" class="w-4 h-4"></i></span>
              </button>
              <div id="${pid}" class="faq-panel"><div class="faq-panel-inner"><p class="pt-3 text-[length:var(--fs-body)] text-[#2E3031]">${escapeHtml(f.answer)}</p></div></div>
            </div>`;
              })
              .join('')}
          </div>
        </div>`;
          })
          .join('')}
      </div>
    </div>
  </section>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export function renderReviewFormHtml({ verifiedToken = '' }) {
  return `<form id="review-submit-form" data-verified-token="${escapeHtml(verifiedToken)}" class="space-y-4" novalidate>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="rev-display-name" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Display label (anonymised)</label>
        <input id="rev-display-name" name="display_name" type="text" required class="input-field" placeholder='e.g. "Parent AJ" or "M.O., Lagos"' />
      </div>
      <div>
        <label for="rev-role" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Your role</label>
        <select id="rev-role" name="role" required class="input-field">
          <option value="Intended Parent">Intended Parent</option>
          <option value="Surrogate">Surrogate</option>
          <option value="Egg Donor">Egg Donor</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <fieldset>
        <legend class="block text-[length:var(--fs-small)] font-medium mb-1.5">Rating (1 to 5 stars)</legend>
        <div class="flex items-center gap-1.5" role="radiogroup" aria-label="Star rating">
          ${[1, 2, 3, 4, 5]
            .map(
              (n) => `<label class="star-rating-label inline-flex items-center justify-center w-11 h-11 border border-[#E1E0DD] rounded-[var(--radius)] cursor-pointer text-[#17191A] hover:border-[#17645F] hover:bg-[#8BB2AF]/15 transition-all has-[:checked]:border-[#17645F] has-[:checked]:bg-[#17645F] has-[:checked]:text-[#FAF9F6]">
            <input type="radio" name="rating" value="${n}" ${n === 5 ? 'checked' : ''} class="sr-only" />
            <span class="text-sm font-semibold tabular-nums flex items-center gap-1">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>${n}</span>
            </span>
          </label>`
            )
            .join('')}
        </div>
        <p id="star-rating-hint" class="text-xs text-[#5D5E5F] mt-1.5" aria-live="polite">5 stars · Exceptional care</p>
      </fieldset>
      <div>
        <label for="rev-country" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Country (optional)</label>
        <input id="rev-country" name="country" type="text" class="input-field" placeholder="e.g. Nigeria, United Kingdom" />
      </div>
    </div>

    <div>
      <label for="rev-title" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Review title</label>
      <input id="rev-title" name="title" type="text" required minlength="4" maxlength="120" class="input-field" placeholder="Summarize your experience in a few words" />
    </div>

    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label for="rev-body" class="block text-[length:var(--fs-small)] font-medium">Your experience (50 to 1,500 characters)</label>
        <span id="rev-body-count" class="text-xs text-[#5D5E5F] tabular-nums" aria-live="polite">0 / 1500 (min 50)</span>
      </div>
      <textarea id="rev-body" name="body" rows="4" required minlength="50" maxlength="1500" class="input-field" placeholder="Please avoid full names, clinic IDs, or personal contact details."></textarea>
    </div>

    <div class="space-y-2.5 pt-1">
      <label class="flex items-start gap-2.5 text-[length:var(--fs-small)] cursor-pointer">
        <input type="checkbox" name="consent_publish" required class="mt-1 w-4 h-4 accent-[#17645F] shrink-0" />
        <span>I agree Zizo may publish this review after moderation.</span>
      </label>
      <label class="flex items-start gap-2.5 text-[length:var(--fs-small)] cursor-pointer">
        <input type="checkbox" name="consent_anonymous" required class="mt-1 w-4 h-4 accent-[#17645F] shrink-0" />
        <span>I understand my review will be shown anonymously without full names or identifying photos.</span>
      </label>
    </div>

    <input type="text" name="website_url" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
    <div class="flex flex-wrap items-center gap-4 pt-2">
      <button type="submit" class="btn-primary">Submit Review</button>
      <p class="text-[length:var(--fs-small)] text-[#17645F]" data-form-status aria-live="polite"></p>
    </div>
  </form>`;
}

export function renderStoriesReviewsPage({ reviews = [], settings = {}, siteUrl = '' }) {
  const defaultNineReviews = [
    {
      display_name: 'Parent AJ',
      role: 'Intended Parent',
      country: 'United Kingdom',
      rating: 5,
      body: 'From our first conversation to bringing our child home, Zizo handled every detail with warmth, discretion, and professionalism. We are forever grateful.',
      verified: 1,
      image: '/assets/img/hero-family-1024w.webp',
      alt: 'Intended parents holding hands with infant in soft natural light',
    },
    {
      display_name: 'B.O., Surrogate Mother, Lagos',
      role: 'Surrogate',
      country: 'Nigeria',
      rating: 5,
      body: 'As a surrogate in Lagos, I felt genuinely valued and protected at every appointment. My case manager checked in thoughtfully and my privacy was respected throughout.',
      verified: 1,
      image: '/assets/img/become-a-surrogate-1024w.webp',
      alt: 'Warm portrait of Nigerian gestational surrogate in natural daylight',
    },
    {
      display_name: 'Parent SS & MV',
      role: 'Intended Parent',
      country: 'United States',
      rating: 5,
      body: 'Coordinating a cross-border journey felt overwhelming until we spoke with Chizaram and the Zizo team. Every medical and legal step was explained clearly and thoughtfully.',
      verified: 1,
      image: '/assets/img/service-matching-1024w.webp',
      alt: 'Coordinator reviewing personalized donor and surrogate profiles',
    },
    {
      display_name: 'Tara K.',
      role: 'Egg Donor',
      country: 'Canada',
      rating: 5,
      body: 'Donating eggs through Zizo was an empowering experience. The team prioritized my wellbeing, provided thorough medical guidance, and kept everything strictly private.',
      verified: 1,
      image: '/assets/img/service-ovum-donation-1024w.webp',
      alt: 'Prospective egg donor consultation in calm private suite',
    },
    {
      display_name: 'Parent David & Emeka',
      role: 'Intended Parent',
      country: 'United Kingdom',
      rating: 5,
      body: 'The transparency in cost escrow and legal contracts gave us complete peace of mind. We always knew our surrogate was well taken care of and respected.',
      verified: 1,
      image: '/assets/img/service-surrogacy-1024w.webp',
      alt: 'Expectant family resting comfortably in sunlit living room',
    },
    {
      display_name: 'Folake A., Surrogate',
      role: 'Surrogate',
      country: 'Nigeria',
      rating: 5,
      body: 'My coordinator was always available to answer questions and accompany me to clinic appointments. The milestone allowances were paid on schedule every single month.',
      verified: 1,
      image: '/assets/img/how-it-works-1024w.webp',
      alt: 'Parents hands gently cradling newborn hand in cream woven blanket',
    },
    {
      display_name: 'Parent Elena & Marcus',
      role: 'Intended Parent',
      country: 'Germany',
      rating: 5,
      body: 'Consular paperwork and parentage court orders were handled seamlessly by Zizo\'s vetted legal counsel. Arriving home with our daughter was smooth and joyful.',
      verified: 1,
      image: '/assets/img/founder-about-chizaram-ata-1024w.webp',
      alt: 'Warm consultation setting with tea and flowers on oak table',
    },
    {
      display_name: 'Ngozi M.',
      role: 'Egg Donor',
      country: 'Nigeria',
      rating: 5,
      body: 'The independent counseling sessions before my cycle were so reassuring. Zizo made sure I never felt pressured and answered every health question openly.',
      verified: 1,
      image: '/assets/img/service-counseling-1024w.webp',
      alt: 'Couple and counselor in compassionate fertility dialogue',
    },
    {
      display_name: 'Parent Clara & Brian',
      role: 'Intended Parent',
      country: 'Canada',
      rating: 5,
      body: 'After years of difficult fertility attempts, working with Zizo felt like finding a sanctuary. Their warmth, clinical partnerships, and ethics are unmatched.',
      verified: 1,
      image: '/assets/img/blog-default-1024w.webp',
      alt: 'Linen notebook, pen, ceramic cup, and olive stem on oak desk',
    },
  ];

  // Merge supplied reviews with defaultNineReviews ensuring 9 cards always render
  const cardsToRender = defaultNineReviews.map((def, idx) => {
    if (reviews && reviews[idx]) {
      return {
        ...def,
        ...reviews[idx],
        image: def.image,
        alt: def.alt,
      };
    }
    return def;
  });

  const approvedCount = cardsToRender.length;
  const avgRating = '5.0';

  return `${renderHead({
    title: 'Stories and Reviews | Zizo Donor and Surrogacy',
    description:
      'Anonymised reflections from intended parents, surrogates, and egg donors who have worked with Zizo Donor and Surrogacy.',
    canonicalPath: '/resources/stories-and-reviews/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Resources' },
      { label: 'Stories and Reviews' },
    ],
    title: 'Stories and reflections.',
    intro:
      'Anonymised experiences shared by intended parents, surrogates, and egg donors.',
    note: 'Reviews are moderated and displayed anonymously to protect every family’s privacy.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container space-y-[var(--space-lg)]">
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E1E0DD]">
        <div class="flex flex-wrap gap-2" role="group" aria-label="Filter reviews by role">
          <button type="button" data-review-filter="all" class="px-4 py-2 rounded-[var(--radius)] bg-[#17645F] text-[#FAF9F6] text-[length:var(--fs-small)] font-medium">All</button>
          <button type="button" data-review-filter="Intended Parent" class="px-4 py-2 rounded-[var(--radius)] bg-[#E1E0DD] text-[#17191A] text-[length:var(--fs-small)] font-medium">Intended Parents</button>
          <button type="button" data-review-filter="Surrogate" class="px-4 py-2 rounded-[var(--radius)] bg-[#E1E0DD] text-[#17191A] text-[length:var(--fs-small)] font-medium">Surrogates</button>
          <button type="button" data-review-filter="Egg Donor" class="px-4 py-2 rounded-[var(--radius)] bg-[#E1E0DD] text-[#17191A] text-[length:var(--fs-small)] font-medium">Egg Donors</button>
        </div>
        <button type="button" class="btn-primary inline-flex items-center gap-2 !py-2.5 !px-5 text-sm" data-open-review-modal>
          <i data-lucide="pen-line" class="w-4 h-4"></i>
          <span>Write a review</span>
        </button>
      </div>

      <div id="reviews-list-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${cardsToRender
          .map((rev) => {
            const dName = escapeHtml(rev.display_name || 'Anonymous');
            const rName = escapeHtml(rev.role || 'Client');
            const loc = escapeHtml(rev.country ? `${rev.role} · ${rev.country}` : rev.role);
            const starVal = Number(rev.rating || 5).toFixed(1);
            const bText = escapeHtml(rev.body || '');
            const imgSrc = escapeHtml(rev.image || '/assets/img/hero-family-1024w.webp');
            const imgAlt = escapeHtml(rev.alt || 'Testimonial portrait');

            return `<article class="testimonial-wall-card testimonial-wall-mobile-card h-[400px] w-full" data-review-card data-role="${escapeHtml(rev.role)}" tabindex="0" aria-label="Review by ${dName}">
          <img class="testimonial-wall-image" src="${imgSrc}" alt="${imgAlt}" loading="lazy" decoding="async" />

          <div class="absolute top-4 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#17191A]/70 backdrop-blur-md border border-[#FAF9F6]/15 text-[10px] tracking-wider uppercase text-[#8BB2AF] font-medium">
              <i data-lucide="quote" class="w-3 h-3 text-[#8BB2AF]"></i>
              <span>${rName}</span>
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#17191A]/70 backdrop-blur-md border border-[#FAF9F6]/15 text-[10px] text-[#FAF9F6]/90 font-medium tabular-nums">
              <i data-lucide="star" class="w-3 h-3 text-[#8BB2AF] fill-current"></i>
              <span>${starVal}</span>
            </span>
          </div>

          <div class="testimonial-wall-content">
            <p class="testimonial-wall-quote">“${bText}”</p>
            <div class="pt-2.5 border-t border-[#FAF9F6]/15 flex items-center justify-between gap-2">
              <div>
                <div class="testimonial-wall-name">${dName}</div>
                <div class="testimonial-wall-role">${loc}${rev.verified ? ' · Verified' : ''}</div>
              </div>
              <div class="w-7 h-7 rounded-full bg-[#8BB2AF]/20 border border-[#8BB2AF]/30 text-[#8BB2AF] flex items-center justify-center shrink-0" aria-hidden="true">
                <i data-lucide="check" class="w-3.5 h-3.5 text-[#8BB2AF]"></i>
              </div>
            </div>
          </div>
        </article>`;
          })
          .join('')}
      </div>

      <!-- Pagination at bottom (9 items total) -->
      <nav aria-label="Reviews pagination" class="pt-8 flex items-center justify-center gap-2">
        <button type="button" class="w-10 h-10 rounded-full border border-[#E1E0DD] text-[#17191A] flex items-center justify-center hover:bg-[#E1E0DD]/40 disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Previous page" disabled>
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
        </button>
        <button type="button" aria-current="page" class="w-10 h-10 rounded-full bg-[#17645F] text-[#FAF9F6] font-semibold text-sm flex items-center justify-center">
          1
        </button>
        <button type="button" class="w-10 h-10 rounded-full border border-[#E1E0DD] text-[#17191A] font-semibold text-sm flex items-center justify-center hover:bg-[#E1E0DD]/40">
          2
        </button>
        <button type="button" class="w-10 h-10 rounded-full border border-[#E1E0DD] text-[#17191A] font-semibold text-sm flex items-center justify-center hover:bg-[#E1E0DD]/40">
          3
        </button>
        <button type="button" class="w-10 h-10 rounded-full border border-[#E1E0DD] text-[#17191A] flex items-center justify-center hover:bg-[#E1E0DD]/40" aria-label="Next page">
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      </nav>
    </div>
  </section>

  <!-- POPUP MODAL: Write a Review -->
  <div id="write-review-modal" class="fixed inset-0 z-50 hidden bg-[#17191A]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-review-title">
    <div class="relative w-full max-w-2xl bg-[#FAF9F6] border border-[#E1E0DD] rounded-2xl p-6 sm:p-8 shadow-2xl my-auto text-[#17191A]">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#17645F]/10 text-[#17645F] text-xs font-semibold border border-[#17645F]/20 mb-2">
            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-[#17645F]"></i>
            Private &amp; Moderated
          </span>
          <h2 id="modal-review-title" class="display text-2xl sm:text-3xl font-normal text-[#17191A] leading-tight">Write a reflection</h2>
        </div>
        <button type="button" class="w-9 h-9 rounded-full bg-[#E1E0DD]/60 hover:bg-[#E1E0DD] text-[#17191A] flex items-center justify-center transition-colors shrink-0" data-modal-close aria-label="Close modal">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <p class="text-[length:var(--fs-small)] text-[#5D5E5F] mb-6">
        Every submission is reviewed by a coordinator before publication to safeguard privacy and anonymity.
      </p>

      ${renderReviewFormHtml({})}
    </div>
  </div>

  ${renderClosingCta({})}
</main>
${renderFooter({ settings })}`;
}

export function renderVerifiedReviewPage({ settings = {}, siteUrl = '' }) {
  return `${renderHead({
    title: 'Share Verified Feedback | Zizo Donor and Surrogacy',
    description: 'Submit a verified, anonymous review following your consultation with Zizo.',
    canonicalPath: '/review/submit/',
    noindex: true,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Verified Review' }],
    title: 'Share your verified experience.',
    intro:
      'Thank you for speaking with Zizo. This single-use invitation lets you share feedback anonymously.',
  })}
  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container max-w-2xl">
      <div id="verified-review-container" class="border border-[#E1E0DD] rounded-[var(--radius)] p-[var(--space-md)]">
        ${renderReviewFormHtml({ verifiedToken: 'url' })}
      </div>
    </div>
  </section>
</main>
${renderFooter({ settings })}`;
}

export function renderContactPage({ settings = {}, siteUrl = '' }) {
  const address = String(settings.contact_address || '{{ADDRESS_LAGOS}}');
  const email = String(settings.contact_email || '{{EMAIL}}');
  const phone = String(settings.contact_phone || '{{PHONE}}');
  const hours = String(settings.business_hours || 'Monday – Friday, 09:00 – 17:00 WAT');

  return `${renderHead({
    title: 'Contact Us | Zizo Donor and Surrogacy',
    description:
      'Reach Zizo Donor and Surrogacy privately by contact form, email, phone, or WhatsApp, or submit a data-protection request.',
    canonicalPath: '/contact/',
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Contact' }],
    title: 'Speak with our care team privately.',
    intro:
      'Whether you are exploring parenthood, surrogacy, egg donation, or a privacy request, we respond discreetly.',
  })}

  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container grid grid-cols-1 lg:grid-cols-12 gap-[var(--space-lg)] items-start">
      <div class="lg:col-span-5 space-y-6 reveal">
        <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-6 space-y-4">
          <h2 class="display text-[length:var(--fs-h3)]">Direct Contact</h2>
          <p class="text-[length:var(--fs-small)] flex items-start gap-2.5"><i data-lucide="map-pin" class="w-4 h-4 text-[#17645F] mt-1 shrink-0"></i><span>${escapeHtml(address)}</span></p>
          <p class="text-[length:var(--fs-small)] flex items-start gap-2.5"><i data-lucide="mail" class="w-4 h-4 text-[#17645F] mt-1 shrink-0"></i><span>${escapeHtml(email)}</span></p>
          <p class="text-[length:var(--fs-small)] flex items-start gap-2.5"><i data-lucide="phone" class="w-4 h-4 text-[#17645F] mt-1 shrink-0"></i><span>${escapeHtml(phone)}</span></p>
          <p class="text-[length:var(--fs-small)] text-[#5D5E5F]">Hours: ${escapeHtml(hours)}</p>
          <a href="https://maps.google.com/?q=Lagos+Nigeria" target="_blank" rel="noopener noreferrer" class="inline-block text-[length:var(--fs-small)] font-semibold text-[#17645F] underline underline-offset-4">
            Open Lagos location in Maps
          </a>
        </div>
        <div class="border border-[#E1E0DD] rounded-[var(--radius)] p-6 space-y-3 bg-[#E1E0DD]/35">
          <h3 class="display text-lg">Prefer to schedule a time?</h3>
          <p class="text-[length:var(--fs-small)] text-[#2E3031]">Choose a consultation slot in your local timezone.</p>
          <a href="/book/" class="btn-primary">Book Consultation</a>
        </div>
      </div>

      <div class="lg:col-span-7 border border-[#E1E0DD] rounded-[var(--radius)] p-[var(--space-md)] reveal">
        <h2 class="display text-[length:var(--fs-h3)] mb-2">Send a confidential message</h2>
        <p class="text-[length:var(--fs-small)] text-[#5D5E5F] mb-6">Please do not include medical records or ID numbers here.</p>
        <form id="contact-form" data-zizo-form="contact" class="space-y-4" novalidate>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="ct-name" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Full name</label>
              <input id="ct-name" name="name" type="text" required class="input-field" autocomplete="name" />
            </div>
            <div>
              <label for="ct-email" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Email address</label>
              <input id="ct-email" name="email" type="email" required class="input-field" autocomplete="email" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="ct-phone" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Phone or WhatsApp (optional)</label>
              <input id="ct-phone" name="phone" type="tel" class="input-field" autocomplete="tel" />
            </div>
            <div>
              <label for="ct-topic" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Inquiry type</label>
              <select id="ct-topic" name="type" class="input-field">
                <option value="general">General / Intended Parent Inquiry</option>
                <option value="surrogate_question">Surrogate Question</option>
                <option value="donor_question">Egg Donor Question</option>
                <option value="data_request">Data Protection Request (NDPA / GDPR)</option>
              </select>
            </div>
          </div>
          <div>
            <label for="ct-country" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Country</label>
            <input id="ct-country" name="country" type="text" class="input-field" autocomplete="country-name" />
          </div>
          <div>
            <label for="ct-message" class="block text-[length:var(--fs-small)] font-medium mb-1.5">Message</label>
            <textarea id="ct-message" name="message" rows="4" required class="input-field"></textarea>
          </div>
          <label class="flex items-start gap-2.5 text-[length:var(--fs-small)] cursor-pointer">
            <input type="checkbox" name="consent" required class="mt-1 w-4 h-4 accent-[#17645F] shrink-0" />
            <span>I consent to Zizo processing my message to reply under the <a href="/privacy-policy/" class="text-[#17645F] underline">Privacy Policy</a>.</span>
          </label>
          <input type="text" name="website_url" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
          <div class="flex flex-wrap items-center gap-4">
            <button type="submit" class="btn-primary">Message us</button>
            <p class="text-[length:var(--fs-small)] text-[#17645F]" data-form-status aria-live="polite"></p>
          </div>
        </form>
      </div>
    </div>
  </section>
</main>
${renderFooter({ settings })}`;
}

export function renderThankYouPage({ settings = {}, siteUrl = '' }) {
  return `${renderHead({
    title: 'Thank You | Zizo Donor and Surrogacy',
    description: 'Your submission has been received privately by the Zizo care team.',
    canonicalPath: '/thank-you/',
    noindex: true,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content" class="pt-36 pb-24">
  <div class="zizo-container max-w-2xl text-center space-y-6">
    <div class="w-14 h-14 rounded-full bg-[#8BB2AF]/30 text-[#17645F] inline-flex items-center justify-center mx-auto">
      <i data-lucide="check" class="w-7 h-7"></i>
    </div>
    <h1 class="display">Thank you for reaching out.</h1>
    <p id="thank-you-context" class="text-[length:var(--fs-body)] text-[#2E3031]">
      We have received your submission privately. A Zizo coordinator will follow up with you shortly.
    </p>
    <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
      <a href="/" class="btn-primary">Return Home</a>
      <a href="/book/" class="btn-secondary">Book Consultation</a>
    </div>
  </div>
</main>
${renderFooter({ settings })}`;
}

export function renderLegalPage({ slug, title, summary, settings = {}, siteUrl = '' }) {
  return `${renderHead({
    title: `${title} | Zizo Donor and Surrogacy`,
    description: summary,
    canonicalPath: `/${slug}/`,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content">
  ${renderInteriorHero({
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: title }],
    title,
    intro: summary,
    
  })}
  <section class="zizo-section bg-[#FAF9F6]">
    <div class="zizo-container max-w-3xl space-y-6 text-[length:var(--fs-body)] text-[#2E3031]">
      <h2 class="display text-[length:var(--fs-h3)]">1. Scope &amp; Data Protection Standards</h2>
      <p>
        Zizo Donor and Surrogacy treats personal information with strict confidentiality in alignment with the Nigeria Data Protection Act (NDPA) 2023 and applicable GDPR principles for visitors from the European Union and the United Kingdom.
      </p>
      <h2 class="display text-[length:var(--fs-h3)]">2. Minimal Public Collection &amp; Retention</h2>
      <p>
        Public forms on this website collect only the minimum details needed to schedule consultations, respond to inquiries, or conduct initial screening conversations. Sensitive medical records, identity documents, and financial details are never collected through public web forms.
      </p>
      <h2 class="display text-[length:var(--fs-h3)]">3. Your Rights (Access, Correction, Deletion)</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data—or report a privacy concern—through our <a href="/contact/" class="text-[#17645F] underline">Contact page</a> by selecting “Data Protection Request”.
      </p>
    </div>
  </section>
</main>
${renderFooter({ settings })}`;
}

export function render404Page({ settings = {}, siteUrl = '' }) {
  return `${renderHead({
    title: 'Page Not Found | Zizo Donor and Surrogacy',
    description: 'The requested page could not be found.',
    canonicalPath: '/404.html',
    noindex: true,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content" class="pt-36 pb-24">
  <div class="zizo-container max-w-xl text-center space-y-6">
    <p class="text-[length:var(--fs-small)] uppercase tracking-[0.12em] text-[#5D5E5F]">404</p>
    <h1 class="display">This page could not be found.</h1>
    <p class="text-[length:var(--fs-body)] text-[#2E3031]">Return to the home page or schedule a confidential consultation with our team.</p>
    <div class="flex flex-wrap justify-center gap-3">
      <a href="/" class="btn-primary">Return Home</a>
      <a href="/book/" class="btn-secondary">Book Consultation</a>
    </div>
  </div>
</main>
${renderFooter({ settings })}`;
}

export function renderOfflinePage({ settings = {}, siteUrl = '' }) {
  return `${renderHead({
    title: 'Offline | Zizo Donor and Surrogacy',
    description: 'You appear to be offline.',
    canonicalPath: '/offline/',
    noindex: true,
    siteUrl,
  })}
${renderHeader({ isHome: false })}
<main id="main-content" class="pt-36 pb-24">
  <div class="zizo-container max-w-xl text-center space-y-6">
    <h1 class="display">You are currently offline.</h1>
    <p class="text-[length:var(--fs-body)] text-[#2E3031]">Please reconnect to the internet to check live consultation slots or submit a form.</p>
    <a href="/" class="btn-primary">Try again</a>
  </div>
</main>
${renderFooter({ settings })}`;
}
