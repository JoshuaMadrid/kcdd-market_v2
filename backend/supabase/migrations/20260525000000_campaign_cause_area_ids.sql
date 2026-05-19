-- ============================================================
-- Campaigns: add cause_area_ids array column
-- ============================================================
-- Reason: the origin/main RequestsPage (campaigns view) and
-- getActiveCampaigns helper both read `campaign.cause_area_ids: string[]`,
-- but no migration on main ever created the column. Result: cause-area
-- chip filter has nothing to match against; campaign cards can't render
-- overlay tags.
--
-- Type: TEXT[] (cause_areas.id is TEXT post 20240303). Default empty array
-- so existing rows + new inserts without explicit ids stay valid.
-- A GIN index speeds up the `id = ANY(cause_area_ids)` and intersection
-- queries done client-side today and potentially server-side later.

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS cause_area_ids TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_campaigns_cause_area_ids
  ON campaigns USING GIN (cause_area_ids);
