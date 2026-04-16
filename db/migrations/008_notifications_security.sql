CREATE TABLE IF NOT EXISTS app_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_sessions_user_id ON app_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_sessions_expires_at ON app_sessions(expires_at);

CREATE TABLE IF NOT EXISTS app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type in ('REQUEST_CREATED', 'REQUEST_UPDATED', 'CONTRACT_CREATED', 'CONTRACT_UPDATED', 'PROFILE_VIEWED')),
  title text NOT NULL,
  detail text NOT NULL,
  related_kind text NOT NULL CHECK (related_kind in ('vehicle_request', 'contract', 'owner_profile')),
  related_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_app_notifications_recipient_created_at ON app_notifications(recipient_user_id, created_at desc);
CREATE INDEX IF NOT EXISTS idx_app_notifications_recipient_is_read ON app_notifications(recipient_user_id, is_read);

CREATE TABLE IF NOT EXISTS owner_profile_views (
  owner_profile_id uuid NOT NULL REFERENCES owner_profiles(id) ON DELETE CASCADE,
  viewer_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  first_viewed_at timestamptz NOT NULL DEFAULT now(),
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  view_count integer NOT NULL DEFAULT 1 CHECK (view_count >= 1),
  PRIMARY KEY (owner_profile_id, viewer_user_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_profile_views_owner_profile_id ON owner_profile_views(owner_profile_id, first_viewed_at desc);

ALTER TABLE vehicle_requests
  ADD COLUMN IF NOT EXISTS response_message text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz,
  ADD COLUMN IF NOT EXISTS responded_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL;

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS response_message text,
  ADD COLUMN IF NOT EXISTS responded_at timestamptz,
  ADD COLUMN IF NOT EXISTS responded_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL;

ALTER TABLE app_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_sessions_owner_manage ON app_sessions;
CREATE POLICY app_sessions_owner_manage ON app_sessions
  FOR ALL USING (
    user_id = app_current_user_id()
    OR app_current_user_role() = 'ADMIN'
  )
  WITH CHECK (
    user_id = app_current_user_id()
    OR app_current_user_role() = 'ADMIN'
  );

DROP POLICY IF EXISTS app_notifications_recipient_read ON app_notifications;
CREATE POLICY app_notifications_recipient_read ON app_notifications
  FOR SELECT USING (
    recipient_user_id = app_current_user_id()
    OR app_current_user_role() = 'ADMIN'
  );

DROP POLICY IF EXISTS app_notifications_recipient_update ON app_notifications;
CREATE POLICY app_notifications_recipient_update ON app_notifications
  FOR UPDATE USING (
    recipient_user_id = app_current_user_id()
    OR app_current_user_role() = 'ADMIN'
  )
  WITH CHECK (
    recipient_user_id = app_current_user_id()
    OR app_current_user_role() = 'ADMIN'
  );

DROP POLICY IF EXISTS owner_profile_views_owner_read ON owner_profile_views;
CREATE POLICY owner_profile_views_owner_read ON owner_profile_views
  FOR SELECT USING (
    exists (
      select 1
      from owner_profiles op
      where op.id = owner_profile_views.owner_profile_id
        and op.user_id = app_current_user_id()
    )
    OR viewer_user_id = app_current_user_id()
    OR app_current_user_role() = 'ADMIN'
  );