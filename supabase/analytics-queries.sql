-- Deep Dive Resume — Supabase analytics queries
-- Run these in Supabase Dashboard → SQL Editor. Table: events (session_id, ref, event_type, data jsonb).
--
-- If no new sessions appear: (1) Check production env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
-- (2) Visits with ?ref=self do not record (by design). (3) If RLS is on, allow anon INSERT — see events-rls-allow-insert.sql.

-- =============================================================================
-- 1. Visits (sessions) per ref tag
-- =============================================================================
SELECT
  COALESCE(ref, '(no ref)') AS ref,
  COUNT(DISTINCT session_id) AS sessions
FROM events
WHERE event_type = 'session_start'
GROUP BY ref
ORDER BY sessions DESC;


-- =============================================================================
-- 2. Funnel: sessions → dives started → completions (overall)
-- =============================================================================
WITH started AS (
  SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE event_type = 'dive_started'
),
completed AS (
  SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE event_type = 'completion'
),
sessions AS (
  SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE event_type = 'session_start'
)
SELECT
  (SELECT n FROM sessions) AS total_sessions,
  (SELECT n FROM started) AS dives_started,
  (SELECT n FROM completed) AS completions,
  ROUND(100.0 * (SELECT n FROM started) / NULLIF((SELECT n FROM sessions), 0), 1) AS pct_start_dive,
  ROUND(100.0 * (SELECT n FROM completed) / NULLIF((SELECT n FROM started), 0), 1) AS pct_complete_of_started
;


-- =============================================================================
-- 3. Funnel per ref (sessions, started, completed)
-- =============================================================================
WITH ref_sessions AS (
  SELECT ref, session_id
  FROM events
  WHERE event_type = 'session_start'
  GROUP BY ref, session_id
),
ref_started AS (
  SELECT ref, session_id
  FROM events
  WHERE event_type = 'dive_started'
  GROUP BY ref, session_id
),
ref_completed AS (
  SELECT ref, session_id
  FROM events
  WHERE event_type = 'completion'
  GROUP BY ref, session_id
)
SELECT
  COALESCE(r.ref, '(no ref)') AS ref,
  COUNT(DISTINCT r.session_id) AS sessions,
  COUNT(DISTINCT s.session_id) AS started,
  COUNT(DISTINCT c.session_id) AS completed,
  ROUND(100.0 * COUNT(DISTINCT s.session_id) / NULLIF(COUNT(DISTINCT r.session_id), 0), 1) AS pct_start,
  ROUND(100.0 * COUNT(DISTINCT c.session_id) / NULLIF(COUNT(DISTINCT s.session_id), 0), 1) AS pct_complete
FROM ref_sessions r
LEFT JOIN ref_started s ON r.ref IS NOT DISTINCT FROM s.ref AND r.session_id = s.session_id
LEFT JOIN ref_completed c ON r.ref IS NOT DISTINCT FROM c.ref AND r.session_id = c.session_id
GROUP BY r.ref
ORDER BY sessions DESC;


-- =============================================================================
-- 4. Device: touch vs desktop (from session_start data)
-- =============================================================================
SELECT
  COALESCE((data->>'isTouchDevice')::boolean, false) AS is_touch,
  COUNT(DISTINCT session_id) AS sessions
FROM events
WHERE event_type = 'session_start'
GROUP BY (data->>'isTouchDevice')::boolean
ORDER BY sessions DESC;


-- =============================================================================
-- 5. CTAs clicked (email, linkedin, phone, resume)
-- =============================================================================
SELECT
  data->>'linkType' AS link_type,
  COUNT(*) AS clicks
FROM events
WHERE event_type = 'cta_clicked'
GROUP BY data->>'linkType'
ORDER BY clicks DESC;


-- =============================================================================
-- 6. Completions: average dive time (seconds)
-- =============================================================================
SELECT
  COUNT(*) AS completions_with_time,
  ROUND(AVG((data->>'totalTime')::int), 0) AS avg_seconds,
  ROUND(MIN((data->>'totalTime')::int), 0) AS min_seconds,
  ROUND(MAX((data->>'totalTime')::int), 0) AS max_seconds
FROM events
WHERE event_type = 'completion'
  AND data->>'totalTime' IS NOT NULL
  AND (data->>'totalTime')::int BETWEEN 0 AND 3600;


-- =============================================================================
-- 7. Lobster delivered (sessions that brought lobster to surface)
-- =============================================================================
SELECT
  COALESCE(ref, '(no ref)') AS ref,
  COUNT(DISTINCT session_id) AS sessions_delivered_lobster
FROM events
WHERE event_type = 'lobster_delivered'
GROUP BY ref
ORDER BY sessions_delivered_lobster DESC;


-- =============================================================================
-- 8. Ghost Diver / NPC chat usage
-- =============================================================================
SELECT
  COALESCE(ref, '(no ref)') AS ref,
  COUNT(DISTINCT session_id) AS sessions_opened_chat,
  COUNT(*) AS total_chat_events
FROM events
WHERE event_type IN ('npc_chat_opened', 'ghost_diver_chat')
GROUP BY ref
ORDER BY sessions_opened_chat DESC;


-- =============================================================================
-- 9. Zone popularity (which zones get entered most)
-- =============================================================================
SELECT
  data->>'zone' AS zone,
  COUNT(*) AS entries
FROM events
WHERE event_type = 'zone_entered'
GROUP BY data->>'zone'
ORDER BY entries DESC;


-- =============================================================================
-- 10. Item discovery (which treasures get found most)
-- =============================================================================
SELECT
  data->>'itemId' AS item_id,
  data->>'itemType' AS item_type,
  COUNT(*) AS discoveries
FROM events
WHERE event_type = 'item_discovered'
GROUP BY data->>'itemId', data->>'itemType'
ORDER BY discoveries DESC;
