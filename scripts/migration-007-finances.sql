-- Migration 007: Données financières + effectif sur companies
-- A exécuter dans le SQL Editor de Supabase

-- ============================================================
-- 1. Données financières (depuis API recherche-entreprises.api.gouv.fr)
-- ============================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS chiffre_affaires NUMERIC;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS resultat_net NUMERIC;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS effectif TEXT;           -- tranche effectif salarié
ALTER TABLE companies ADD COLUMN IF NOT EXISTS date_creation_entreprise TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS categorie_entreprise TEXT; -- PME, ETI, GE

-- ============================================================
-- 2. Mettre à jour la fonction RPC GMB score (pas de changement de formule)
-- ============================================================
-- Pas de modifications nécessaires : les champs financiers ne font pas partie du GMB score.
