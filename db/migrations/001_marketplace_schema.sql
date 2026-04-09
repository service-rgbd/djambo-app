CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('USER', 'PARTICULIER', 'PARC_AUTO', 'ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
    CREATE TYPE contract_status AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_category') THEN
    CREATE TYPE vehicle_category AS ENUM ('SUV', 'BERLINE', 'LUXE', 'ECONOMIQUE', 'UTILITAIRE', 'PICKUP', 'CABRIOLET', 'MONOSPACE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fuel_type_enum') THEN
    CREATE TYPE fuel_type_enum AS ENUM ('Petrol', 'Diesel', 'Hybrid', 'Electric');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transmission_type') THEN
    CREATE TYPE transmission_type AS ENUM ('Manuelle', 'Automatique');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION app_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(current_setting('app.user_id', true), '')::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app_current_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN NULLIF(current_setting('app.user_role', true), '')::user_role;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email citext NOT NULL UNIQUE,
  password_hash text,
  role user_role NOT NULL DEFAULT 'USER',
  phone text,
  avatar_url text,
  email_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS owner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  description text,
  address text,
  city text NOT NULL,
  country text NOT NULL,
  whatsapp text,
  verified boolean NOT NULL DEFAULT false,
  response_time text,
  member_since date NOT NULL DEFAULT current_date,
  rating numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  vehicle_count integer NOT NULL DEFAULT 0 CHECK (vehicle_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES owner_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL CHECK (year >= 2000 AND year <= 2100),
  category vehicle_category NOT NULL,
  fuel_type fuel_type_enum NOT NULL,
  transmission transmission_type NOT NULL,
  seats integer NOT NULL CHECK (seats BETWEEN 1 AND 30),
  price_per_day integer NOT NULL CHECK (price_per_day >= 0),
  price_sale integer CHECK (price_sale >= 0),
  is_for_rent boolean NOT NULL DEFAULT true,
  is_for_sale boolean NOT NULL DEFAULT false,
  description text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  location text NOT NULL,
  city text NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  view_count integer NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  is_featured boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  mileage integer NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  color text,
  conditions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  search_document tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(model, '') || ' ' || coalesce(city, ''))
  ) STORED,
  CONSTRAINT vehicle_sale_or_rent_required CHECK (is_for_rent OR is_for_sale)
);

CREATE TABLE IF NOT EXISTS vehicle_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  renter_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES owner_profiles(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_price integer NOT NULL CHECK (total_price >= 0),
  status booking_status NOT NULL DEFAULT 'PENDING',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  booked_period daterange GENERATED ALWAYS AS (daterange(start_date, end_date, '[]')) STORED,
  CONSTRAINT booking_dates_valid CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES owner_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vehicle_id, user_id)
);

CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES owner_profiles(id) ON DELETE CASCADE,
  contract_number text NOT NULL UNIQUE,
  status contract_status NOT NULL DEFAULT 'DRAFT',
  start_date date NOT NULL,
  end_date date NOT NULL,
  daily_rate integer NOT NULL CHECK (daily_rate >= 0),
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contract_dates_valid CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_owner_profiles_city ON owner_profiles(city);
CREATE INDEX IF NOT EXISTS idx_owner_profiles_verified ON owner_profiles(verified);

CREATE INDEX IF NOT EXISTS idx_vehicles_owner_id ON vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_city_category ON vehicles(city, category);
CREATE INDEX IF NOT EXISTS idx_vehicles_featured_available ON vehicles(is_featured, is_available);
CREATE INDEX IF NOT EXISTS idx_vehicles_price_per_day ON vehicles(price_per_day);
CREATE INDEX IF NOT EXISTS idx_vehicles_rating_desc ON vehicles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_available_partial ON vehicles(city, price_per_day) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_vehicles_search_document ON vehicles USING GIN(search_document);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_trgm ON vehicles USING GIN(brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vehicles_model_trgm ON vehicles USING GIN(model gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_sort ON vehicle_images(vehicle_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status_dates ON bookings(status, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_reviews_vehicle_id ON reviews(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_reviews_owner_id ON reviews(owner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_vehicle_id ON contracts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_contracts_owner_id ON contracts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_customer_id ON contracts(customer_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_vehicle_period_excl'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_vehicle_period_excl
      EXCLUDE USING gist (
        vehicle_id WITH =,
        booked_period WITH &&
      ) WHERE (status IN ('PENDING', 'CONFIRMED'));
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;
CREATE TRIGGER trg_app_users_updated_at BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_owner_profiles_updated_at ON owner_profiles;
CREATE TRIGGER trg_owner_profiles_updated_at BEFORE UPDATE ON owner_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON vehicles;
CREATE TRIGGER trg_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_contracts_updated_at ON contracts;
CREATE TRIGGER trg_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_users_self_select ON app_users;
CREATE POLICY app_users_self_select ON app_users
  FOR SELECT USING (id = app_current_user_id() OR app_current_user_role() = 'ADMIN');

DROP POLICY IF EXISTS owner_profiles_public_read ON owner_profiles;
CREATE POLICY owner_profiles_public_read ON owner_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS owner_profiles_owner_manage ON owner_profiles;
CREATE POLICY owner_profiles_owner_manage ON owner_profiles
  FOR ALL USING (user_id = app_current_user_id() OR app_current_user_role() = 'ADMIN')
  WITH CHECK (user_id = app_current_user_id() OR app_current_user_role() = 'ADMIN');

DROP POLICY IF EXISTS vehicles_public_read ON vehicles;
CREATE POLICY vehicles_public_read ON vehicles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS vehicles_owner_manage ON vehicles;
CREATE POLICY vehicles_owner_manage ON vehicles
  FOR ALL USING (
    owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    OR app_current_user_role() = 'ADMIN'
  )
  WITH CHECK (
    owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    OR app_current_user_role() = 'ADMIN'
  );

DROP POLICY IF EXISTS vehicle_images_public_read ON vehicle_images;
CREATE POLICY vehicle_images_public_read ON vehicle_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS vehicle_images_owner_manage ON vehicle_images;
CREATE POLICY vehicle_images_owner_manage ON vehicle_images
  FOR ALL USING (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    ) OR app_current_user_role() = 'ADMIN'
  )
  WITH CHECK (
    vehicle_id IN (
      SELECT id FROM vehicles WHERE owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    ) OR app_current_user_role() = 'ADMIN'
  );

DROP POLICY IF EXISTS bookings_read_access ON bookings;
CREATE POLICY bookings_read_access ON bookings
  FOR SELECT USING (
    renter_id = app_current_user_id()
    OR owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    OR app_current_user_role() = 'ADMIN'
  );

DROP POLICY IF EXISTS bookings_insert_renter ON bookings;
CREATE POLICY bookings_insert_renter ON bookings
  FOR INSERT WITH CHECK (renter_id = app_current_user_id() OR app_current_user_role() = 'ADMIN');

DROP POLICY IF EXISTS bookings_update_owner_or_admin ON bookings;
CREATE POLICY bookings_update_owner_or_admin ON bookings
  FOR UPDATE USING (
    renter_id = app_current_user_id()
    OR owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    OR app_current_user_role() = 'ADMIN'
  )
  WITH CHECK (
    renter_id = app_current_user_id()
    OR owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    OR app_current_user_role() = 'ADMIN'
  );

DROP POLICY IF EXISTS reviews_public_read ON reviews;
CREATE POLICY reviews_public_read ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS reviews_insert_authenticated ON reviews;
CREATE POLICY reviews_insert_authenticated ON reviews
  FOR INSERT WITH CHECK (user_id = app_current_user_id() OR app_current_user_role() = 'ADMIN');

DROP POLICY IF EXISTS contracts_access_policy ON contracts;
CREATE POLICY contracts_access_policy ON contracts
  FOR ALL USING (
    customer_id = app_current_user_id()
    OR owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    OR app_current_user_role() = 'ADMIN'
  )
  WITH CHECK (
    customer_id = app_current_user_id()
    OR owner_id IN (SELECT id FROM owner_profiles WHERE user_id = app_current_user_id())
    OR app_current_user_role() = 'ADMIN'
  );