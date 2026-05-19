-- Migration: Allow donors to view their own tax receipts via Clerk JWT
--
-- Context: 20240325000000_fix_payment_rls.sql dropped the user-facing SELECT
-- policy on donor_documents and left only a service_role policy, with a
-- TODO comment to re-add the user policy once Clerk JWT integration landed.
-- Clerk JWT is now wired up (public.clerk_user_id() helper exists since
-- 20260518000000_clerk_user_id_text.sql), but the SELECT policy was never
-- added back. Result: receipts are inserted by the backend (service_role) but
-- the donor dashboard reads them with the publishable key + Clerk JWT and
-- gets a silent RLS block — every fetch returns [].

BEGIN;

CREATE POLICY "Donors view own documents"
  ON donor_documents FOR SELECT
  USING (user_id = public.clerk_user_id());

COMMIT;
