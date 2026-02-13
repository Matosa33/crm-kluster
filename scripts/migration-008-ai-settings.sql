-- Migration 008: AI Settings for Copilot
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  openrouter_api_key TEXT,
  model_id TEXT DEFAULT 'anthropic/claude-sonnet-4',
  custom_instructions TEXT,
  tone TEXT DEFAULT 'professionnel'
    CHECK (tone IN ('professionnel', 'decontracte', 'technique')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_settings_user ON ai_settings(user_id);

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_settings_select_own" ON ai_settings
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "ai_settings_insert_own" ON ai_settings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_settings_update_own" ON ai_settings
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
