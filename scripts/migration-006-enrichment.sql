-- Migration 006: Enrichissement scraping + Reseaux sociaux + GMB Score
-- A executer dans le SQL Editor de Supabase

-- ============================================================
-- 1. Enrichissement depuis les API SERP (description, categories, GPS, horaires)
-- ============================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS categories TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS opening_hours JSONB;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS service_options JSONB;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- ============================================================
-- 2. Reseaux sociaux (saisie manuelle - pas dispo via Maps API)
-- ============================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_youtube TEXT;

-- ============================================================
-- 3. Score de completion GMB (0-100, cache pour perf)
-- ============================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS gmb_score INTEGER DEFAULT 0;

-- ============================================================
-- 4. Recalculer le GMB score pour toutes les entreprises existantes
-- ============================================================
-- ============================================================
-- 5. Fonction RPC pour recalculer les scores GMB (appelée après scraping)
-- ============================================================
CREATE OR REPLACE FUNCTION recalculate_gmb_scores(target_city TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  UPDATE companies SET gmb_score = LEAST(100,
    CASE WHEN phone IS NOT NULL AND phone != '' THEN 10 ELSE 0 END
    + CASE WHEN website IS NOT NULL AND website != '' THEN 15 ELSE 0 END
    + CASE WHEN address IS NOT NULL AND address != '' THEN 5 ELSE 0 END
    + CASE WHEN rating IS NOT NULL AND rating > 0 THEN 10 ELSE 0 END
    + CASE WHEN review_count >= 5 THEN 10 ELSE 0 END
    + CASE WHEN review_count >= 20 THEN 5 ELSE 0 END
    + CASE WHEN description IS NOT NULL AND description != '' THEN 10 ELSE 0 END
    + CASE WHEN opening_hours IS NOT NULL THEN 10 ELSE 0 END
    + CASE WHEN categories IS NOT NULL AND array_length(categories, 1) > 0 THEN 5 ELSE 0 END
    + CASE WHEN google_maps_url IS NOT NULL AND google_maps_url != '' THEN 5 ELSE 0 END
    + CASE WHEN COALESCE(social_facebook, social_instagram, social_twitter, social_linkedin, social_youtube) IS NOT NULL THEN 10 ELSE 0 END
    + CASE WHEN email IS NOT NULL AND email != '' THEN 5 ELSE 0 END
  )
  WHERE (target_city IS NULL OR city = target_city);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. Recalculer maintenant pour toutes les entreprises existantes
-- ============================================================
SELECT recalculate_gmb_scores();
