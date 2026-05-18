-- ============================================================
-- Phase 8.5: Hybrid Donations — In-Kind Device Pledges
-- ============================================================
-- Reason: The marketplace currently supports only cash donations via Stripe.
-- Corporate IT-refresh donors, individual donors with surplus laptops, and
-- bulk refurbishers cannot contribute hardware directly. Phase 8.5 adds a
-- parallel in-kind pledge path while keeping the cash flow unchanged.
--
-- This migration:
--   1. Creates `in_kind_pledges` table (pre-acceptance donor intent record)
--   2. Adds `donation_type` (VARCHAR + CHECK) and `pledge_id` (FK) to `requests`
--   3. Sets up RLS policies — donor manages own pledge, CBO sees pledges for own org
--
-- Design decisions (recorded so future tasks don't relitigate):
--   * `donation_type` uses VARCHAR + CHECK, NOT a Postgres ENUM. Enum
--     mutations (ALTER TYPE ADD VALUE) are non-transactional and cannot
--     be rolled back. VARCHAR + CHECK is fully transactional.
--   * `requests.status` still uses the existing enum — we reuse `claimed`
--     for both cash and in-kind, distinguished by `donation_type`.
--   * `in_kind_pledges.delivery_address` is PII. RLS restricts SELECT to
--     the pledging donor and the owning CBO. No column-level encryption
--     in MVP — deferred to Phase 9 (pgcrypto).
--   * Single donor per request (no multi-donor partial fulfillment) — this
--     keeps the lifecycle simple. Multi-donor model is Phase 9.
--   * `pledge_id` on `requests` is forward-referenced — we create
--     `in_kind_pledges` FIRST, then add the FK column. Never split this
--     migration into multiple files.
-- ============================================================

-- 1. Create in_kind_pledges table FIRST (forward referenced from requests.pledge_id)
CREATE TABLE IF NOT EXISTS in_kind_pledges (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id        UUID        NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  donor_id          TEXT        NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  -- Quantities the donor commits to deliver. Shape matches DeviceTypeBreakdown
  -- on the frontend: { desktops?: number, laptops?: number, tablets?: number, smartphones?: number }
  device_breakdown  JSONB       NOT NULL DEFAULT '{}'::jsonb,
  -- Donor-provided notes: condition, age, OS, accessories, etc.
  donor_notes       TEXT,
  -- PII: pickup or shipping address.
  -- RLS allows visibility only to the donor (self) and the CBO that owns the request.
  delivery_address  TEXT        NOT NULL,
  -- pending  = donor submitted, awaiting CBO decision
  -- accepted = CBO accepted, awaiting physical receipt
  -- rejected = CBO declined; the request was reopened automatically
  pledge_status     VARCHAR(10) NOT NULL DEFAULT 'pending'
    CHECK (pledge_status IN ('pending', 'accepted', 'rejected')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_in_kind_pledges_request_id ON in_kind_pledges(request_id);
CREATE INDEX IF NOT EXISTS idx_in_kind_pledges_donor_id   ON in_kind_pledges(donor_id);
CREATE INDEX IF NOT EXISTS idx_in_kind_pledges_status     ON in_kind_pledges(pledge_status);

-- Reuse existing updated_at trigger function
DROP TRIGGER IF EXISTS update_in_kind_pledges_updated_at ON in_kind_pledges;
CREATE TRIGGER update_in_kind_pledges_updated_at
  BEFORE UPDATE ON in_kind_pledges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Add donation_type + pledge_id columns to requests (FK back to in_kind_pledges now valid)
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS donation_type VARCHAR(10) NOT NULL DEFAULT 'cash'
    CHECK (donation_type IN ('cash', 'in_kind')),
  ADD COLUMN IF NOT EXISTS pledge_id UUID REFERENCES in_kind_pledges(id) ON DELETE SET NULL;

-- 3. RLS — enable + policies
ALTER TABLE in_kind_pledges ENABLE ROW LEVEL SECURITY;

-- Donor can SELECT/INSERT/UPDATE/DELETE their own pledges
DROP POLICY IF EXISTS "Donors manage their own pledges" ON in_kind_pledges;
CREATE POLICY "Donors manage their own pledges"
  ON in_kind_pledges
  FOR ALL
  USING (donor_id = public.clerk_user_id())
  WITH CHECK (donor_id = public.clerk_user_id());

-- CBO (org owner) can SELECT pledges against their own requests
DROP POLICY IF EXISTS "CBOs view pledges for their requests" ON in_kind_pledges;
CREATE POLICY "CBOs view pledges for their requests"
  ON in_kind_pledges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM requests r
      INNER JOIN organizations o ON r.organization_id = o.id
      WHERE r.id = in_kind_pledges.request_id
        AND o.user_id = public.clerk_user_id()
    )
  );
