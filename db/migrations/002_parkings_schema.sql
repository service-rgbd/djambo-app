CREATE TABLE IF NOT EXISTS parkings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES owner_profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  access_type text NOT NULL DEFAULT 'standard',
  opening_hours text,
  security_features text[] NOT NULL DEFAULT '{}',
  capacity_total integer NOT NULL DEFAULT 0 CHECK (capacity_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS parking_id uuid REFERENCES parkings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_parkings_owner_id ON parkings(owner_id);
CREATE INDEX IF NOT EXISTS idx_parkings_city ON parkings(city);
CREATE INDEX IF NOT EXISTS idx_vehicles_parking_id ON vehicles(parking_id);

DROP TRIGGER IF EXISTS trg_parkings_updated_at ON parkings;
CREATE TRIGGER trg_parkings_updated_at BEFORE UPDATE ON parkings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE parkings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parkings_public_read ON parkings;
CREATE POLICY parkings_public_read ON parkings FOR SELECT USING (true);

DROP POLICY IF EXISTS parkings_owner_manage ON parkings;
CREATE POLICY parkings_owner_manage ON parkings
  FOR ALL USING (
    owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    OR app_current_user_role() = 'ADMIN'
  )
  WITH CHECK (
    owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    OR app_current_user_role() = 'ADMIN'
  );