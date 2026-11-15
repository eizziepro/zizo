import test from 'node:test';
import assert from 'node:assert/strict';
import {
  anonymizeDisplayName,
  calculateReadingMinutes,
  sanitizeMarkdownToHtml,
  validateReviewPayload,
} from './validation';

test('validateReviewPayload blocks URLs, short bodies, and missing consent', () => {
  const valid = validateReviewPayload({
    display_name: 'Parent AJ',
    role: 'Intended Parent',
    rating: 5,
    title: 'Thoughtful guidance across borders',
    body: 'Zizo kept every conversation private and calm from our very first consultation through birth.',
    consent_publish: true,
    consent_anonymous: true,
  });
  assert.equal(valid.ok, true);

  const withUrl = validateReviewPayload({
    display_name: 'Parent AJ',
    role: 'Intended Parent',
    rating: 5,
    title: 'Check this out',
    body: 'Visit https://example.com for more details on our journey with Zizo and the medical team.',
    consent_publish: true,
    consent_anonymous: true,
  });
  assert.equal(withUrl.ok, false);
});

test('anonymizeDisplayName preserves initials style and strips full names', () => {
  assert.equal(anonymizeDisplayName('Parent AJ'), 'Parent AJ');
  assert.equal(anonymizeDisplayName('Chinedu Okafor'), 'C.O.');
});

test('sanitizeMarkdownToHtml removes script/iframe and builds TOC', () => {
  const md = `## First Section\n\nHello [link](https://example.org).\n\n<script>alert(1)</script>\n\n### Subsection One\n\nMore text.`;
  const res = sanitizeMarkdownToHtml(md);
  assert.equal(res.html.includes('<script'), false);
  assert.equal(res.html.includes('rel="noopener noreferrer"'), true);
  assert.equal(res.toc.length, 2);
  assert.equal(res.toc[0].id, 'first-section');
  assert.equal(calculateReadingMinutes(md), 1);
});
