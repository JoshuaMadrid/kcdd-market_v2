-- ============================================================
-- Phase 9 Batch A: Donor cause-area match alerts
-- ============================================================
-- Reason: Donors currently must visit /requests to discover new opportunities.
-- This batch lets donors opt into cause areas; when a CBO posts a matching
-- open request the system inserts an in-app notification automatically.
--
-- This migration:
--   1. Creates `donor_cause_areas` junction table with RLS
--   2. Creates `set_donor_cause_areas` RPC for atomic DELETE-then-INSERT
--   3. Creates `notify_matching_donors` trigger (SECURITY DEFINER) on requests
--
-- Design decisions:
--   * SECURITY DEFINER on the trigger because CBO sessions cannot INSERT into
--     `request_notifications` for OTHER recipients under existing RLS.
--   * Atomic RPC for set_donor_cause_areas because supabase-js has no
--     cross-statement transaction. DELETE+INSERT in two round trips would
--     silently lose preferences on partial failure.
--   * `notification_type='match_alert'` is a new VARCHAR value. The column
--     is VARCHAR(50) with no CHECK constraint so any string inserts cleanly.
-- ============================================================

-- 1. Junction table
CREATE TABLE IF NOT EXISTS donor_cause_areas (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id      TEXT        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  cause_area_id UUID        NOT NULL REFERENCES cause_areas(id)   ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (donor_id, cause_area_id)
);

CREATE INDEX IF NOT EXISTS idx_donor_cause_areas_donor ON donor_cause_areas(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_cause_areas_cause ON donor_cause_areas(cause_area_id);

-- 2. RLS
ALTER TABLE donor_cause_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Donors manage their own cause areas" ON donor_cause_areas;
CREATE POLICY "Donors manage their own cause areas"
  ON donor_cause_areas
  FOR ALL
  USING (donor_id = public.clerk_user_id())
  WITH CHECK (donor_id = public.clerk_user_id());

-- 3. Atomic RPC — replace donor's cause-area selections in a single transaction.
-- SECURITY DEFINER so the function can DELETE+INSERT even if the caller's RLS
-- context fluctuates. The function itself verifies the caller owns the donor_id.
CREATE OR REPLACE FUNCTION public.set_donor_cause_areas(
  p_donor_id       TEXT,
  p_cause_area_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Authorize: caller must be the donor themselves.
  IF p_donor_id IS DISTINCT FROM public.clerk_user_id() THEN
    RAISE EXCEPTION 'Forbidden: can only set your own cause areas';
  END IF;

  -- Wipe existing selections for this donor.
  DELETE FROM donor_cause_areas WHERE donor_id = p_donor_id;

  -- Insert the new set (no-op if array is empty).
  IF p_cause_area_ids IS NOT NULL AND array_length(p_cause_area_ids, 1) > 0 THEN
    INSERT INTO donor_cause_areas (donor_id, cause_area_id)
    SELECT p_donor_id, unnest(p_cause_area_ids)
    ON CONFLICT (donor_id, cause_area_id) DO NOTHING;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_donor_cause_areas(TEXT, UUID[]) TO authenticated, service_role;

-- 4. Trigger function — notify matching donors on new open requests.
-- SECURITY DEFINER because the CBO session inserting the request cannot INSERT
-- request_notifications rows for OTHER recipients under existing RLS policies.
CREATE OR REPLACE FUNCTION public.notify_matching_donors()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'open' THEN
    INSERT INTO request_notifications (
      recipient_id, request_id, notification_type, title, message, is_read
    )
    SELECT
      dca.donor_id,
      NEW.id,
      'match_alert',
      'New request matches your interests',
      'A new request just opened in a cause area you follow.',
      false
    FROM donor_cause_areas dca
    JOIN donor_profiles    dp  ON dca.donor_id = dp.user_id
    WHERE dca.cause_area_id = NEW.cause_area_id
      AND dp.max_per_request >= NEW.amount;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_matching_donors_trigger ON requests;
CREATE TRIGGER notify_matching_donors_trigger
  AFTER INSERT ON requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_matching_donors();
