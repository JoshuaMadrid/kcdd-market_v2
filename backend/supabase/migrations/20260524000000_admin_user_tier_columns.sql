-- ============================================================
-- Admin User Management: org_tier + verification_status columns
-- ============================================================
-- Reason: the origin/main admin redesign (pages/admin/DashboardPage,
-- pages/admin/UsersPage) reads and writes `user_profiles.org_tier`
-- and `user_profiles.verification_status`, but no migration on main
-- ever created the columns. Result: User Management table renders
-- empty tier badges and undefined status — the bug surfaced via
-- http://localhost:3000/admin/dashboard > User Management.
--
-- Columns mirror the canonical TS constants in
-- frontend-vite/src/constants/userTypes.ts:
--   ORG_TIERS         = individual | small_org | large_org
--   VERIFICATION_STATUS = unverified | verified
--
-- Backfill rules:
--   * Default org_tier = 'individual' for everyone (donors + admin +
--     newly-signed-up CBOs). Admins can promote CBOs to small/large
--     from the User Management screen.
--   * verification_status = 'verified' where is_vetted = true
--     (mostly the seeded admin + CBOs); 'unverified' otherwise.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS org_tier TEXT NOT NULL DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified';

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_org_tier_check;
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_org_tier_check
  CHECK (org_tier IN ('individual', 'small_org', 'large_org'));

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_verification_status_check;
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_verification_status_check
  CHECK (verification_status IN ('unverified', 'verified'));

-- Backfill verification_status from is_vetted
UPDATE user_profiles
   SET verification_status = 'verified'
 WHERE is_vetted = true
   AND verification_status = 'unverified';
