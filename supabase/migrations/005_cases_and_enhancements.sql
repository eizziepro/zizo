-- Zizo Donor and Surrogacy: Form Schemas & Field Enhancements
-- Migration: 005_cases_and_enhancements.sql

-- Ensure cases table is removed
DROP TABLE IF EXISTS cases CASCADE;

-- 1. Applications Table Enhancements
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS candidate_code TEXT,
  ADD COLUMN IF NOT EXISTS screening_checklist JSONB DEFAULT '{"medical_history": false, "infectious_panel": false, "ultrasound_amh": false, "psych_eval": false, "legal_consent": false}'::jsonb;

-- 2. Inquiries Table Enhancements
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS preferred_region TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Website form';

-- 3. Reviews Table Enhancements
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS verified_token_id TEXT,
  ADD COLUMN IF NOT EXISTS journey_year TEXT;

-- 4. Bookings Table Enhancements (Ensure status & start_at are explicitly indexed)
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_at ON bookings(start_at);
