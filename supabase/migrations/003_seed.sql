-- Zizo Donor and Surrogacy: Initial Seed Data
INSERT INTO site_settings (key, value) VALUES
  ('brand_name', '"Zizo Donor and Surrogacy"'),
  ('short_name', '"Zizo Surrogacy"'),
  ('contact_address', '"Bode Thomas St, Surulere, Lagos"'),
  ('contact_email', '"info@zizosurrogacy.com"'),
  ('contact_phone', '"09024944961"'),
  ('whatsapp_number', '"2349024944961"'),
  ('stats_experience', '"12+ years"'),
  ('stats_families_helped', '"{{FAMILIES_HELPED}}"'),
  ('stats_regions', '"5 regions"'),
  ('stats_support_24_7', '""'),
  ('auto_confirm_bookings', 'true'),
  ('payment_enabled', 'false'),
  ('gcal_sync_enabled', 'false'),
  ('cancel_cutoff_hours', '24')
ON CONFLICT (key) DO NOTHING;

INSERT INTO consultation_types (name, slug, duration_min, buffer_min, channels, intro, sort) VALUES
  ('Intended Parent Consultation', 'intended-parent-consultation', 30, 15, ARRAY['Google Meet', 'Phone call', 'WhatsApp call'], 'A private, unhurried conversation about your family-building goals and cross-border coordination options.', 1),
  ('Surrogate Information Call', 'surrogate-information-call', 20, 10, ARRAY['WhatsApp call', 'Phone call', 'Google Meet'], 'Speak confidentially with a coordinator about surrogate eligibility, screening, compensation transparency, and personal support.', 2),
  ('Egg Donor Information Call', 'egg-donor-information-call', 20, 10, ARRAY['WhatsApp call', 'Phone call', 'Google Meet'], 'Learn how anonymous ovum donation screening works and how donor wellbeing is protected.', 3),
  ('Cost and Program Planning', 'cost-and-program-planning', 45, 15, ARRAY['Google Meet', 'Phone call'], 'Review programme pathways across Nigeria, Europe, Asia, Canada, and the United States.', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO reviews (display_name, role, rating, title, body, country, status, featured, source, confirm_permission, approved_at) VALUES
  ('Parent AJ', 'Intended Parent', 5, 'Always grateful for steady, compassionate care', 'From our first conversation to bringing our child home, Zizo handled every detail with warmth, discretion, and professionalism. We are forever grateful.', 'United Kingdom', 'approved', true, 'legacy', false, now()),
  ('Parent SS & MV', 'Intended Parent', 5, 'Seamless coordination across borders', 'Coordinating a cross-border journey felt overwhelming until we spoke with Chizaram and the Zizo team. Every medical and legal step was explained clearly and thoughtfully.', 'United States', 'approved', true, 'legacy', false, now()),
  ('B.O., Surrogate Mother, Lagos', 'Surrogate', 5, 'Respected, supported, and genuinely cared for', 'As a surrogate in Lagos, I felt genuinely valued and protected at every appointment. My case manager checked in thoughtfully and my privacy was respected throughout.', 'Nigeria', 'approved', true, 'legacy', false, now());

INSERT INTO categories (slug, name) VALUES
  ('surrogacy-guides', 'Surrogacy Guides'),
  ('surrogate-care', 'Surrogate Care'),
  ('egg-donation', 'Egg Donation')
ON CONFLICT (slug) DO NOTHING;
