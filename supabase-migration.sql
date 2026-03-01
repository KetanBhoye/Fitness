-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates the key-value table used by the Fitness Tracker app

CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Allow full access via anon key (personal single-user app)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON app_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for faster lookups by key prefix (e.g. workout:*, meals:*)
CREATE INDEX IF NOT EXISTS idx_app_data_key ON app_data (key);
