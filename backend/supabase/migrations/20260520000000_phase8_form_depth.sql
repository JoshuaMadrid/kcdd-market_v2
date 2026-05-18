-- ============================================================
-- Phase 8: Application Form Depth — schema additions
-- ============================================================
-- Reason: The original CBO request form was too thin compared to John's
-- 8/18 spreadsheet review. This migration adds 12 columns to `requests`
-- and 2 columns to `organizations` so the upcoming 3-step wizard form
-- has schema backing.
--
-- This migration:
--   1. Adds device_type_breakdown JSONB + 6 essay TEXT columns to requests
--   2. Adds 3 boolean toggles (refurbished_ok, has_supplier, has_it_support)
--   3. Adds distribution_method TEXT[] and need_frequency enum-via-CHECK
--   4. Adds ages_served TEXT[] and pre_eligibility_status TEXT to organizations
--
-- Design decisions (recorded here so future tasks don't relitigate):
--   * `distribution_method` has NO DB-level CHECK on element values
--     ('individual' / 'computer_lab' / 'shared'). Frontend Zod schema enforces
--     the allowed set. Backend writes that bypass the form can insert arbitrary
--     strings silently — accept this trade-off for ALTER TABLE simplicity.
--   * Essay TEXT columns are nullable (NO NOT NULL) at DB level. Frontend
--     enforces required vs. optional. Existing 28 mock rows remain valid.
--   * `request_details` view in 20260518000000 is NOT updated here. It uses
--     explicit column selection, so adding columns does not break it. Any
--     future code that needs these fields via the view requires its own
--     migration.
--   * No RLS changes needed — existing row-level policies on requests and
--     organizations cover all new columns automatically (Postgres RLS is
--     row-level, not column-level).
-- ============================================================

-- 1. Extend requests with Phase 8 columns
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS device_type_breakdown   JSONB   NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS essay_technology_gap    TEXT,
  ADD COLUMN IF NOT EXISTS essay_population_impact TEXT,
  ADD COLUMN IF NOT EXISTS essay_prior_support     TEXT,
  ADD COLUMN IF NOT EXISTS essay_sustainability    TEXT,
  ADD COLUMN IF NOT EXISTS essay_it_capacity       TEXT,
  ADD COLUMN IF NOT EXISTS essay_urgency_narrative TEXT,
  ADD COLUMN IF NOT EXISTS refurbished_ok          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_supplier            BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_it_support          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS distribution_method     TEXT[],
  ADD COLUMN IF NOT EXISTS need_frequency          TEXT
    CONSTRAINT requests_need_frequency_check
      CHECK (need_frequency IS NULL OR need_frequency IN ('one_time', 'recurring'));

-- 2. Extend organizations with Phase 8 columns
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS ages_served            TEXT[],
  ADD COLUMN IF NOT EXISTS pre_eligibility_status TEXT;
