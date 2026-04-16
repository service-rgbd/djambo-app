CREATE TABLE IF NOT EXISTS app_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  content_encoding text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_success_at timestamptz,
  last_failure_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  disabled_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_app_push_subscriptions_user_id ON app_push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_push_subscriptions_active ON app_push_subscriptions(user_id, disabled_at);

ALTER TABLE app_push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_push_subscriptions_owner_manage ON app_push_subscriptions;
CREATE POLICY app_push_subscriptions_owner_manage ON app_push_subscriptions
  FOR ALL USING (
    user_id = app_current_user_id()
    OR app_current_user_role() = 'ADMIN'
  )
  WITH CHECK (
    user_id = app_current_user_id()
    OR app_current_user_role() = 'ADMIN'
  );