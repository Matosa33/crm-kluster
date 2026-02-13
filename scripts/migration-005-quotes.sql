-- Migration 005: Quotes (Devis) system + Company legal fields for SIRET
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. Add legal fields to companies for quote generation
-- ============================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS siret TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS siren TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS legal_form TEXT; -- e.g. "SAS", "SARL", "EI"
ALTER TABLE companies ADD COLUMN IF NOT EXISTS naf_code TEXT;  -- code APE/NAF
ALTER TABLE companies ADD COLUMN IF NOT EXISTS naf_label TEXT; -- libellé activité
ALTER TABLE companies ADD COLUMN IF NOT EXISTS vat_number TEXT; -- numéro TVA intracommunautaire
ALTER TABLE companies ADD COLUMN IF NOT EXISTS capital TEXT; -- capital social
ALTER TABLE companies ADD COLUMN IF NOT EXISTS rcs_city TEXT; -- ville du RCS
ALTER TABLE companies ADD COLUMN IF NOT EXISTS headquarters_address TEXT; -- adresse siège social

-- ============================================================
-- 2. Create quotes (devis) table
-- ============================================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Reference number: DEV-YYYY-NNN
  reference TEXT NOT NULL UNIQUE,
  -- Link to company and optionally contact
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'brouillon'
    CHECK (status IN ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
  -- Dates
  issued_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  -- Financial
  total_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_after_discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tva_rate NUMERIC(5,2) DEFAULT 20,
  total_tva NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_ttc NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Client info snapshot (for PDF)
  client_name TEXT,
  client_address TEXT,
  client_siret TEXT,
  client_vat_number TEXT,
  -- Notes
  notes TEXT,
  conditions TEXT DEFAULT 'Conditions générales : Révisions incluses : 2 allers-retours. Délai de livraison : 4 semaines maximum à compter de réception des éléments.',
  -- Tracking
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. Create quote lines table
-- ============================================================
CREATE TABLE IF NOT EXISTS quote_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  -- Position in quote
  sort_order INTEGER NOT NULL DEFAULT 0,
  -- Catalog reference (optional - can be custom line)
  catalog_item_id TEXT, -- references catalog.ts id
  -- Line details
  label TEXT NOT NULL,
  description TEXT,
  -- Pricing
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total_ht NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Optional: unit label for display
  unit_label TEXT DEFAULT 'unité', -- "unité", "heure", "mois", "page", etc.
  -- Section grouping
  section TEXT, -- e.g. "Développement", "SEO & Data", "Options"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_quotes_company ON quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_contact ON quotes(contact_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_lines_quote ON quote_lines(quote_id);
CREATE INDEX IF NOT EXISTS idx_companies_siret ON companies(siret) WHERE siret IS NOT NULL;

-- ============================================================
-- 5. RLS Policies
-- ============================================================
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_lines ENABLE ROW LEVEL SECURITY;

-- Quotes: authenticated users can do everything
CREATE POLICY "quotes_select" ON quotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "quotes_insert" ON quotes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "quotes_update" ON quotes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "quotes_delete" ON quotes FOR DELETE TO authenticated USING (true);

-- Quote lines: authenticated users can do everything
CREATE POLICY "quote_lines_select" ON quote_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "quote_lines_insert" ON quote_lines FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "quote_lines_update" ON quote_lines FOR UPDATE TO authenticated USING (true);
CREATE POLICY "quote_lines_delete" ON quote_lines FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 6. Function to generate quote reference
-- ============================================================
CREATE OR REPLACE FUNCTION generate_quote_reference()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  seq INTEGER;
  ref TEXT;
BEGIN
  year_str := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference FROM '\d+$') AS INTEGER)
  ), 0) + 1 INTO seq
  FROM quotes
  WHERE reference LIKE 'DEV-' || year_str || '-%';
  ref := 'DEV-' || year_str || '-' || LPAD(seq::TEXT, 3, '0');
  RETURN ref;
END;
$$ LANGUAGE plpgsql;
