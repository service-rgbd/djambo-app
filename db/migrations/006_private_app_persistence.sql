CREATE TABLE IF NOT EXISTS app_settings (
  user_id uuid PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  business_name text,
  public_email text,
  support_phone text,
  city text,
  response_time text,
  store_slug text,
  public_store_url text,
  public_profile_url text,
  chauffeur_on_demand boolean NOT NULL DEFAULT true,
  chauffeur_daily_rate integer NOT NULL DEFAULT 30000 CHECK (chauffeur_daily_rate >= 0),
  delivery_enabled boolean NOT NULL DEFAULT true,
  whatsapp_enabled boolean NOT NULL DEFAULT true,
  contract_signature_enabled boolean NOT NULL DEFAULT true,
  notifications_email boolean NOT NULL DEFAULT true,
  notifications_sms boolean NOT NULL DEFAULT false,
  brand_logo text,
  storefront_cover text,
  contract_banner text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS chauffeur_requested boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS chauffeur_rate integer NOT NULL DEFAULT 0 CHECK (chauffeur_rate >= 0),
  ADD COLUMN IF NOT EXISTS generated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_app_settings_city ON app_settings(city);

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON app_settings;
CREATE TRIGGER trg_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_settings_owner_manage ON app_settings;
CREATE POLICY app_settings_owner_manage ON app_settings
  FOR ALL USING (
    user_id = app_current_user_id()
    OR app_current_user_role() = 'ADMIN'
  )
  WITH CHECK (
    user_id = app_current_user_id()
    OR app_current_user_role() = 'ADMIN'
  );