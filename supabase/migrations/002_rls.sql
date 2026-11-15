-- Zizo Donor and Surrogacy: Row Level Security Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_staff_role() RETURNS TEXT AS $$
  SELECT role FROM staff WHERE user_id = auth.uid() AND active = true LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Public Read-Only Policies (No public reads on bookings, inquiries, applications, subscribers, audit_log, staff)
CREATE POLICY "Public read published posts" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Public read published faqs" ON faqs FOR SELECT USING (published = true);
CREATE POLICY "Public read active consultation types" ON consultation_types FOR SELECT USING (active = true);
CREATE POLICY "Public read non-sensitive site_settings" ON site_settings FOR SELECT
  USING (key IN ('brand_name','short_name','contact_address','contact_email','contact_phone','whatsapp_number','business_hours','stats_experience','stats_families_helped','stats_regions','stats_support_24_7'));

-- Staff Role Policies
CREATE POLICY "Owner full access settings" ON site_settings FOR ALL USING (current_staff_role() = 'owner');
CREATE POLICY "Owner full access staff" ON staff FOR ALL USING (current_staff_role() = 'owner');
CREATE POLICY "Owner read audit_log" ON audit_log FOR SELECT USING (current_staff_role() = 'owner');

CREATE POLICY "Coordinator/Owner bookings" ON bookings FOR ALL USING (current_staff_role() IN ('owner', 'coordinator'));
CREATE POLICY "Coordinator/Owner availability_rules" ON availability_rules FOR ALL USING (current_staff_role() IN ('owner', 'coordinator'));
CREATE POLICY "Coordinator/Owner availability_exceptions" ON availability_exceptions FOR ALL USING (current_staff_role() IN ('owner', 'coordinator'));
CREATE POLICY "Coordinator/Owner inquiries" ON inquiries FOR ALL USING (current_staff_role() IN ('owner', 'coordinator'));
CREATE POLICY "Coordinator/Owner applications" ON applications FOR ALL USING (current_staff_role() IN ('owner', 'coordinator'));
CREATE POLICY "Owner subscribers" ON subscribers FOR ALL USING (current_staff_role() = 'owner');

CREATE POLICY "Staff moderate reviews" ON reviews FOR ALL USING (current_staff_role() IN ('owner', 'editor', 'coordinator'));
CREATE POLICY "Staff review edits" ON review_edits FOR ALL USING (current_staff_role() IN ('owner', 'editor', 'coordinator'));
CREATE POLICY "Editor/Owner posts" ON posts FOR ALL USING (current_staff_role() IN ('owner', 'editor'));
CREATE POLICY "Editor/Owner post_revisions" ON post_revisions FOR ALL USING (current_staff_role() IN ('owner', 'editor'));
CREATE POLICY "Editor/Owner faqs" ON faqs FOR ALL USING (current_staff_role() IN ('owner', 'editor'));
CREATE POLICY "Editor/Owner media" ON media FOR ALL USING (current_staff_role() IN ('owner', 'editor'));
