-- Run this once against your existing "triptory" database to enable
-- saving trip notes and uploaded photos to the database.
--
-- Usage (psql):
--   psql -U postgres -d triptory -f add_notes_and_media.sql

-- 1. Add the "notes" column to travel_plans (used by the Create/Edit Trip "Notes" field)
ALTER TABLE travel_plans ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Create the "media" table (stores uploaded trip photos)
CREATE TABLE IF NOT EXISTS media (
    media_id SERIAL PRIMARY KEY,
    file_path TEXT NOT NULL,
    type TEXT NOT NULL,
    plan_id INTEGER NOT NULL REFERENCES travel_plans(plan_id) ON DELETE CASCADE
);
