-- Migration 004: Add meeting fields to activities
-- Run this in your Supabase SQL editor

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS attendees TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meeting_notes TEXT;

-- Index for calendar queries (activities with a scheduled date)
CREATE INDEX IF NOT EXISTS idx_activities_scheduled
  ON activities(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Index for kanban performance
CREATE INDEX IF NOT EXISTS idx_contacts_status_updated
  ON contacts(status, updated_at DESC);
