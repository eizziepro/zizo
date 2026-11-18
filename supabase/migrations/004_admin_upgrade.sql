-- Zizo Donor and Surrogacy: Admin Upgrade Schema Additions
-- Migration: 004_admin_upgrade.sql

-- 1. Extend staff table with profile and notification fields
ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS avatar_path TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Lagos',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"booking": true, "inquiry": true, "application": true, "review": true}'::jsonb;

-- 2. Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  body_md TEXT NOT NULL,
  price_amount INTEGER NOT NULL DEFAULT 0,
  price_currency TEXT NOT NULL DEFAULT 'NGN',
  price_label TEXT DEFAULT 'From',
  price_note TEXT,
  show_price BOOLEAN NOT NULL DEFAULT true,
  image_path TEXT,
  image_alt TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo JSONB DEFAULT '{}'::jsonb,
  linked_consultation_type_id UUID REFERENCES consultation_types(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Site Pages Registry Table
CREATE TABLE IF NOT EXISTS site_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'static',
  can_have_faqs BOOLEAN NOT NULL DEFAULT true
);

-- Seed static pages registry
INSERT INTO site_pages (slug, title, type, can_have_faqs)
VALUES
  ('home', 'Home', 'static', true),
  ('about', 'About Zizo', 'static', true),
  ('how-it-works', 'How It Works', 'static', true),
  ('packages', 'Zizo Packages', 'static', true),
  ('international', 'International Programs', 'static', true),
  ('become-a-surrogate', 'Become a Surrogate', 'static', true),
  ('become-an-egg-donor', 'Become an Egg Donor', 'static', true),
  ('contact', 'Contact Us', 'static', true),
  ('book', 'Book a Consultation', 'static', true),
  ('reviews', 'Reviews', 'static', true),
  ('faq', 'Main FAQ Page', 'static', true)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title;

-- 4. Extend faqs table and create faq_assignments
ALTER TABLE faqs
  ADD COLUMN IF NOT EXISTS answer_md TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE faqs SET answer_md = answer WHERE answer_md IS NULL;

CREATE TABLE IF NOT EXISTS faq_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_id UUID NOT NULL REFERENCES faqs(id) ON DELETE CASCADE,
  page_type TEXT NOT NULL CHECK (page_type IN ('service', 'page')),
  page_ref TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_faq_page UNIQUE (faq_id, page_type, page_ref)
);

-- 5. Storage bucket for Avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Enable RLS on new tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_assignments ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Services
CREATE POLICY "Public read published services" ON services FOR SELECT
  USING (status = 'published');

CREATE POLICY "Editor/Owner manage services" ON services FOR ALL
  USING (current_staff_role() IN ('owner', 'editor'));

-- Site Pages
CREATE POLICY "Public read site_pages" ON site_pages FOR SELECT
  USING (true);

CREATE POLICY "Owner manage site_pages" ON site_pages FOR ALL
  USING (current_staff_role() = 'owner');

-- FAQ Assignments
CREATE POLICY "Public read faq_assignments" ON faq_assignments FOR SELECT
  USING (true);

CREATE POLICY "Editor/Owner manage faq_assignments" ON faq_assignments FOR ALL
  USING (current_staff_role() IN ('owner', 'editor'));

-- Storage policy for Avatars
CREATE POLICY "Authenticated staff access avatars" ON storage.objects FOR ALL
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 8. Audit log staff insert policy (for logging staff actions and PII reveals)
CREATE POLICY "Staff insert audit_log" ON audit_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

