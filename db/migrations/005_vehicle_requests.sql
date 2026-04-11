CREATE TABLE IF NOT EXISTS vehicle_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES owner_profiles(id) ON DELETE SET NULL,
  vehicle_reference text NOT NULL,
  vehicle_title text NOT NULL,
  owner_name text,
  request_type text NOT NULL CHECK (request_type in ('RENT', 'BUY')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status in ('PENDING', 'CONTACTED', 'APPROVED', 'REJECTED', 'CANCELED')),
  start_date date,
  end_date date,
  estimated_total integer CHECK (estimated_total is null or estimated_total >= 0),
  offered_price integer CHECK (offered_price is null or offered_price >= 0),
  pickup_mode text,
  contact_preference text,
  message text,
  request_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_request_dates_valid CHECK (end_date is null or start_date is null or end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_requests_user_id ON vehicle_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_requests_vehicle_id ON vehicle_requests(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_requests_owner_id ON vehicle_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_requests_status_created_at ON vehicle_requests(status, created_at desc);