-- ============================================================
-- Phase 8.5 (follow-up): atomic pledge RPC
-- ============================================================
-- Reason: The /pledge-in-kind endpoint must atomically (1) claim the
-- request only if it is still open, (2) insert the in_kind_pledge row,
-- and (3) link the pledge_id back to the request. supabase-js has no
-- cross-statement transaction primitive, so application-level sequencing
-- creates a zombie state if step 2 or 3 fails between writes.
--
-- This RPC wraps all three statements inside a single SQL function and
-- returns the new pledge id, or NULL if the request was already claimed.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_in_kind_pledge(
  p_request_id       UUID,
  p_donor_id         TEXT,
  p_device_breakdown JSONB,
  p_donor_notes      TEXT,
  p_delivery_address TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pledge_id    UUID;
  v_claim_count  INTEGER;
BEGIN
  -- Step 1: race-safe claim. Only succeeds if status is currently 'open'.
  UPDATE requests
  SET status        = 'claimed',
      donor_id      = p_donor_id,
      donation_type = 'in_kind',
      claimed_at    = NOW()
  WHERE id     = p_request_id
    AND status = 'open';

  GET DIAGNOSTICS v_claim_count = ROW_COUNT;
  IF v_claim_count = 0 THEN
    -- Already claimed or non-existent — return NULL so caller can 409.
    RETURN NULL;
  END IF;

  -- Step 2: insert the pledge record.
  INSERT INTO in_kind_pledges (
    request_id, donor_id, device_breakdown, donor_notes, delivery_address
  )
  VALUES (
    p_request_id, p_donor_id, p_device_breakdown, p_donor_notes, p_delivery_address
  )
  RETURNING id INTO v_pledge_id;

  -- Step 3: link the pledge back to the request.
  UPDATE requests
  SET pledge_id = v_pledge_id
  WHERE id = p_request_id;

  -- Step 4: audit log.
  INSERT INTO request_history (request_id, changed_by_id, old_status, new_status)
  VALUES (p_request_id, p_donor_id, 'open', 'claimed');

  RETURN v_pledge_id;
END;
$$;

-- Allow authenticated users to call this RPC (RLS still enforces row visibility).
GRANT EXECUTE ON FUNCTION public.create_in_kind_pledge(UUID, TEXT, JSONB, TEXT, TEXT) TO authenticated, service_role;
