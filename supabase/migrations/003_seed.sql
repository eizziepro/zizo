-- Zizo Donor and Surrogacy: Production Baseline Settings
-- Only verified system settings are seeded. Zero dummy consultation types, reviews, or categories.

INSERT INTO site_settings (key, value) VALUES
  ('brand_name', '"Zizo Donor and Surrogacy"'),
  ('short_name', '"Zizo Surrogacy"'),
  ('contact_address', '"Bode Thomas St, Surulere, Lagos"'),
  ('contact_email', '"info@zizosurrogacy.com"'),
  ('contact_phone', '"09024944961"'),
  ('whatsapp_number', '"2349024944961"'),
  ('stats_experience', '"12+ years"'),
  ('stats_families_helped', '""'),
  ('stats_regions', '"5 regions"'),
  ('stats_support_24_7', '""'),
  ('auto_confirm_bookings', 'false'),
  ('payment_enabled', 'false'),
  ('gcal_sync_enabled', 'false'),
  ('cancel_cutoff_hours', '24')
ON CONFLICT (key) DO NOTHING;
