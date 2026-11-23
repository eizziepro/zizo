-- Zizo Donor and Surrogacy: Payment Gateways & External Integrations
-- Migration: 006_integrations_and_payments.sql

-- 1. Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  gateway TEXT NOT NULL CHECK (gateway IN ('paystack', 'remita', 'manual')),
  gateway_reference TEXT UNIQUE NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL CHECK (status IN ('initialized', 'pending', 'success', 'failed', 'refunded')),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  channel TEXT,
  paid_at TIMESTAMPTZ,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_ref ON payment_transactions(gateway_reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- 2. RLS Security for Payment Transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read payment_transactions" ON payment_transactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Coordinator/Owner manage payment_transactions" ON payment_transactions FOR ALL
  USING (current_staff_role() IN ('owner', 'coordinator'));

-- 3. Default integration keys in site_settings
INSERT INTO site_settings (key, value) VALUES
  ('paystack_enabled', 'false'),
  ('paystack_mode', '"test"'),
  ('paystack_public_key', '""'),
  ('paystack_secret_key', '""'),
  ('paystack_webhook_secret', '""'),
  ('paystack_currencies', '["NGN", "USD", "GBP", "EUR"]'),
  ('remita_enabled', 'false'),
  ('remita_merchant_id', '""'),
  ('remita_service_type_id', '""'),
  ('remita_api_key', '""'),
  ('remita_public_key', '""'),
  ('remita_mode', '"demo"')
ON CONFLICT (key) DO NOTHING;
