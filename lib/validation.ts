import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import { marked } from 'marked';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as unknown as Window & typeof globalThis);

const BLOCKED_URL_PATTERN = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|ng|uk|ca|co)\b)/i;
const PROFANITY_LIST = ['spammer', 'viagra', 'casino', 'crypto-profit', 'porn'];

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email || '').trim());
}

export function isValidPhone(phone: string): boolean {
  const cleaned = (phone || '').replace(/[\s\-().]/g, '');
  return /^\+?\d{7,16}$/.test(cleaned);
}

export function containsBlockedReviewContent(text: string): string | null {
  if (BLOCKED_URL_PATTERN.test(text)) {
    return 'Links and website addresses are not permitted in reviews.';
  }
  const lower = text.toLowerCase();
  for (const word of PROFANITY_LIST) {
    if (lower.includes(word)) {
      return 'Your review contains restricted language and could not be accepted.';
    }
  }
  return null;
}

export function anonymizeDisplayName(raw: string): string {
  const clean = (raw || '').trim().replace(/\s+/g, ' ');
  if (!clean) return 'Parent A.';
  if (/^(Parent\s+[A-Z& ]{1,8}|[A-Z]\.([A-Z]\.)?)/i.test(clean)) {
    return clean.slice(0, 36);
  }
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return `${parts[0][0].toUpperCase()}.`;
  }
  const initials = parts.map((p) => `${p[0].toUpperCase()}.`).join('');
  return initials;
}

export function validateReviewPayload(input: {
  display_name?: string;
  role?: string;
  rating?: unknown;
  title?: string;
  body?: string;
  consent_publish?: boolean;
  consent_anonymous?: boolean;
  website_url?: string; // honeypot
}): { ok: true } | { ok: false; error: string } {
  if (input.website_url && input.website_url.trim().length > 0) {
    return { ok: false, error: 'Submission rejected.' };
  }
  if (!input.display_name || input.display_name.trim().length < 2) {
    return { ok: false, error: 'Please provide an initial or display label (for example, "Parent AJ").' };
  }
  const allowedRoles = ['Intended Parent', 'Surrogate', 'Egg Donor'];
  if (!input.role || !allowedRoles.includes(input.role)) {
    return { ok: false, error: 'Please choose your role.' };
  }
  const ratingNum = Number(input.rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return { ok: false, error: 'Please select a star rating between 1 and 5.' };
  }
  if (!input.title || input.title.trim().length < 4 || input.title.trim().length > 120) {
    return { ok: false, error: 'Please enter a short review title (4 to 120 characters).' };
  }
  const body = (input.body || '').trim();
  if (body.length < 50 || body.length > 1500) {
    return { ok: false, error: 'Your review must be between 50 and 1,500 characters.' };
  }
  const blockedReason = containsBlockedReviewContent(`${input.title} ${body}`);
  if (blockedReason) {
    return { ok: false, error: blockedReason };
  }
  if (!input.consent_publish || !input.consent_anonymous) {
    return { ok: false, error: 'Please confirm both consent checkboxes before submitting.' };
  }
  return { ok: true };
}

export function calculateReadingMinutes(markdown: string): number {
  const plain = (markdown || '').replace(/[#>*_`[\]()-]/g, ' ').trim();
  const words = plain ? plain.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function sanitizeMarkdownToHtml(markdown: string): {
  html: string;
  toc: Array<{ id: string; text: string; level: 2 | 3 }>;
} {
  marked.setOptions({ gfm: true, breaks: false });
  const rawHtml = marked.parse(markdown || '') as string;

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const href = node.getAttribute('href') || '';
      if (href.startsWith('http://') || href.startsWith('https://')) {
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h2',
      'h3',
      'h4',
      'p',
      'ul',
      'ol',
      'li',
      'a',
      'strong',
      'em',
      'blockquote',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'hr',
      'br',
    ],
    ALLOWED_ATTR: ['href', 'rel', 'target', 'src', 'alt', 'width', 'height', 'id'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'form'],
  });

  DOMPurify.removeAllHooks();

  // Add deterministic IDs to H2/H3 for table of contents
  const dom = new JSDOM(`<body>${cleanHtml}</body>`);
  const toc: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  const headings = dom.window.document.querySelectorAll('h2, h3');
  const seen = new Set<string>();
  headings.forEach((el) => {
    const text = (el.textContent || '').trim();
    if (!text) return;
    let baseId = slugify(text) || 'section';
    let id = baseId;
    let idx = 2;
    while (seen.has(id)) {
      id = `${baseId}-${idx++}`;
    }
    seen.add(id);
    el.setAttribute('id', id);
    toc.push({
      id,
      text,
      level: el.tagName === 'H2' ? 2 : 3,
    });
  });

  return {
    html: dom.window.document.body.innerHTML,
    toc,
  };
}
