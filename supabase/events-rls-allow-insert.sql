-- Allow anonymous inserts into events (so the frontend can send analytics).
-- Run in Supabase Dashboard → SQL Editor if events are not being recorded.
--
-- 1. Enable RLS on the table (if not already):
--    ALTER TABLE events ENABLE ROW LEVEL SECURITY;
--
-- 2. Allow anon role to INSERT only (no read/update/delete from anon):
CREATE POLICY "Allow anon insert events"
  ON events
  FOR INSERT
  TO anon
  WITH CHECK (true);
