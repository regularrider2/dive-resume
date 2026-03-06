-- Add ref column to events so analytics can break down by ?ref= tag.
-- Run once in Supabase SQL Editor. Safe to run multiple times (IF NOT EXISTS).
ALTER TABLE events ADD COLUMN IF NOT EXISTS ref text;
