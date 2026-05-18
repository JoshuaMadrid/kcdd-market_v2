-- ============================================================
-- Phase 8: max request amount guardrail
-- ============================================================
-- Reason: The wizard form enforces `amount <= 10000` client-side, but
-- since there is no backend POST /api/requests endpoint yet
-- (deferred to a future phase), the only defense-in-depth path is a
-- DB-level CHECK constraint. This rejects any client that bypasses
-- the form and writes via supabase-js directly.
--
-- All existing seed amounts are below 10000 (highest = 1100), so the
-- constraint adds cleanly without validation errors.
-- ============================================================

ALTER TABLE requests
  ADD CONSTRAINT requests_amount_max
  CHECK (amount <= 10000);
