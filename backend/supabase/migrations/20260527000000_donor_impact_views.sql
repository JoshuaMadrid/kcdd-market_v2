-- Migration: donor impact views
-- Creates 4 read-only views used by /donor/impact page.
--
-- Security model:
-- payment_transactions and fulfillment_records have service-role-only RLS, so
-- these views run as SECURITY DEFINER (security_invoker=false) to read the
-- underlying rows. To prevent any authenticated caller from reading other
-- donors' data, every view filters internally on donor_id = public.clerk_user_id().
-- The filter happens at view-resolution time, BEFORE any caller-supplied
-- .eq('user_id', ...) — so the JS-side filter becomes belt-and-suspenders,
-- not the actual security boundary.
--
-- public.clerk_user_id() returns NULL for unauthenticated/anon callers, which
-- collapses each view to 0 rows. Safe by default.

-- 1. donor_impact_summary
CREATE OR REPLACE VIEW public.donor_impact_summary
WITH (security_invoker = false)
AS
SELECT
  pt.donor_id                                        AS user_id,
  ROUND(SUM(pt.amount_total) / 100.0, 2)            AS total_donated,
  COUNT(DISTINCT r.id)
    FILTER (WHERE r.status = 'fulfilled')            AS lives_impacted,
  COUNT(DISTINCT pt.organization_id)                 AS organizations_helped,
  COUNT(DISTINCT TO_CHAR(
    COALESCE(pt.completed_at, pt.created_at),
    'YYYY-MM'
  ))                                                 AS months_active
FROM public.payment_transactions pt
LEFT JOIN public.requests r
  ON r.id = pt.request_id
WHERE pt.status = 'succeeded'
  AND pt.donor_id = public.clerk_user_id()
GROUP BY pt.donor_id;

-- 2. donor_impact_by_cause
-- Splits each donation evenly across the org's cause areas.
CREATE OR REPLACE VIEW public.donor_impact_by_cause
WITH (security_invoker = false)
AS
WITH per_tx_cause AS (
  SELECT
    pt.donor_id,
    oca.cause_area_id,
    ca.name                                          AS cause_area_name,
    (pt.amount_total / 100.0)
      / COUNT(*) OVER (PARTITION BY pt.id)          AS split_amount
  FROM public.payment_transactions pt
  JOIN public.organization_cause_areas oca
    ON oca.organization_id = pt.organization_id
  JOIN public.cause_areas ca
    ON ca.id = oca.cause_area_id
  WHERE pt.status = 'succeeded'
    AND pt.donor_id = public.clerk_user_id()
),
donor_cause_totals AS (
  SELECT
    donor_id,
    cause_area_id,
    cause_area_name,
    SUM(split_amount)                                AS amount
  FROM per_tx_cause
  GROUP BY donor_id, cause_area_id, cause_area_name
),
donor_totals AS (
  SELECT
    donor_id,
    SUM(amount)                                      AS grand_total
  FROM donor_cause_totals
  GROUP BY donor_id
)
SELECT
  dct.donor_id                                       AS user_id,
  dct.cause_area_id,
  dct.cause_area_name,
  ROUND(dct.amount, 2)                               AS amount,
  ROUND(dct.amount / NULLIF(dt.grand_total, 0) * 100, 1) AS percentage
FROM donor_cause_totals dct
JOIN donor_totals dt USING (donor_id);

-- 3. donor_monthly_donations
CREATE OR REPLACE VIEW public.donor_monthly_donations
WITH (security_invoker = false)
AS
SELECT
  pt.donor_id                                        AS user_id,
  EXTRACT(YEAR FROM COALESCE(pt.completed_at, pt.created_at))::int AS year,
  TO_CHAR(COALESCE(pt.completed_at, pt.created_at), 'Mon') AS month,
  ROUND(SUM(pt.amount_total) / 100.0, 2)            AS amount
FROM public.payment_transactions pt
WHERE pt.status = 'succeeded'
  AND pt.donor_id = public.clerk_user_id()
GROUP BY
  pt.donor_id,
  EXTRACT(YEAR FROM COALESCE(pt.completed_at, pt.created_at)),
  TO_CHAR(COALESCE(pt.completed_at, pt.created_at), 'Mon');

-- 4. donor_impact_stories
-- Shows fulfilled donations (request fulfilled + fulfillment_record exists).
CREATE OR REPLACE VIEW public.donor_impact_stories
WITH (security_invoker = false)
AS
SELECT
  fr.donor_id                                        AS user_id,
  COALESCE(fr.notes, r.description)                 AS description,
  o.name                                             AS organization_name,
  fr.created_at
FROM public.fulfillment_records fr
JOIN public.requests r
  ON r.id = fr.request_id
JOIN public.organizations o
  ON o.id = r.organization_id
WHERE r.status = 'fulfilled'
  AND fr.donor_id = public.clerk_user_id();

-- Grant SELECT to authenticated role (PostgREST uses this role for JWT requests).
-- Each view filters internally on public.clerk_user_id(), so the GRANT is safe.
GRANT SELECT ON public.donor_impact_summary      TO authenticated;
GRANT SELECT ON public.donor_impact_by_cause     TO authenticated;
GRANT SELECT ON public.donor_monthly_donations   TO authenticated;
GRANT SELECT ON public.donor_impact_stories      TO authenticated;
