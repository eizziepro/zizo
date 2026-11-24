-- Zizo Donor and Surrogacy: Production Cleanup
-- Purge any stale dummy data from early development migrations

DELETE FROM consultation_types WHERE slug IN (
  'intended-parent-consultation',
  'surrogate-information-call',
  'egg-donor-information-call',
  'cost-and-program-planning'
);

DELETE FROM categories WHERE slug IN (
  'surrogacy-guides',
  'surrogate-care',
  'egg-donation'
);

DELETE FROM reviews WHERE rating >= 1;
DELETE FROM faqs WHERE id IS NOT NULL;
DELETE FROM posts WHERE id IS NOT NULL;
