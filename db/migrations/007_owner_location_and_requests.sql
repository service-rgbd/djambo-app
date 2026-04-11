ALTER TABLE parkings
  ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS location_source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS location_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS location_updated_at timestamptz;

ALTER TABLE vehicle_requests
  ADD COLUMN IF NOT EXISTS booking_channel text NOT NULL DEFAULT 'DIRECT_APP' CHECK (booking_channel in ('DIRECT_APP', 'ON_SITE')),
  ADD COLUMN IF NOT EXISTS customer_details jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_parkings_location_updated_at ON parkings(location_updated_at desc);
CREATE INDEX IF NOT EXISTS idx_vehicle_requests_booking_channel ON vehicle_requests(booking_channel);
