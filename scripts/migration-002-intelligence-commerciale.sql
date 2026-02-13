-- ============================================
-- Migration 002 : Intelligence commerciale
-- A executer sur une BDD existante
-- ============================================

-- Nouveaux enums
CREATE TYPE website_status AS ENUM ('pas_de_site', 'site_existant', 'inconnu');
CREATE TYPE website_quality AS ENUM ('bonne', 'correcte', 'mauvaise', 'obsolete');

-- Colonnes intelligence site web sur companies
ALTER TABLE companies
  ADD COLUMN website_status website_status DEFAULT 'inconnu',
  ADD COLUMN website_quality website_quality,
  ADD COLUMN is_mobile_friendly BOOLEAN,
  ADD COLUMN website_notes TEXT;

-- Colonnes pipeline commercial sur contacts
ALTER TABLE contacts
  ADD COLUMN deal_amount DECIMAL(10,2),
  ADD COLUMN next_followup_at TIMESTAMPTZ,
  ADD COLUMN lost_reason TEXT;

-- Index pour les relances (requete frequente sur le dashboard)
CREATE INDEX idx_contacts_next_followup ON contacts(next_followup_at)
  WHERE next_followup_at IS NOT NULL;
