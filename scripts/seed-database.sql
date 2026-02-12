-- ============================================
-- CRM Kluster - Schema complet Supabase
-- ============================================

-- Enums
CREATE TYPE contact_status AS ENUM (
  'a_contacter',
  'contacte',
  'rdv_planifie',
  'devis_envoye',
  'gagne',
  'perdu'
);

CREATE TYPE contact_priority AS ENUM ('basse', 'moyenne', 'haute');

CREATE TYPE activity_type AS ENUM ('appel', 'email', 'rdv', 'note');

CREATE TYPE scrape_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- ============================================
-- Table: profiles
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'commercial' CHECK (role IN ('admin', 'commercial')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles visibles par tous les utilisateurs authentifies"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utilisateurs peuvent modifier leur propre profil"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Trigger pour creer un profil automatiquement a l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'commercial')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Table: companies
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  google_maps_url TEXT,
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  source_api TEXT CHECK (source_api IN ('serper', 'serpapi', 'manual')),
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_companies_city ON companies(city);
CREATE INDEX idx_companies_business_type ON companies(business_type);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);
CREATE UNIQUE INDEX idx_companies_unique_name_city ON companies(name, city);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entreprises visibles par tous les utilisateurs authentifies"
  ON companies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifies peuvent creer des entreprises"
  ON companies FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifies peuvent modifier des entreprises"
  ON companies FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifies peuvent supprimer des entreprises"
  ON companies FOR DELETE TO authenticated USING (true);

-- ============================================
-- Table: contacts
-- ============================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  position TEXT,
  status contact_status DEFAULT 'a_contacter',
  assigned_to UUID REFERENCES profiles(id),
  priority contact_priority DEFAULT 'moyenne',
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contacts visibles par tous les utilisateurs authentifies"
  ON contacts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifies peuvent creer des contacts"
  ON contacts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifies peuvent modifier des contacts"
  ON contacts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifies peuvent supprimer des contacts"
  ON contacts FOR DELETE TO authenticated USING (true);

-- ============================================
-- Table: activities
-- ============================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type activity_type NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activites visibles par tous les utilisateurs authentifies"
  ON activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifies peuvent creer des activites"
  ON activities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifies peuvent modifier des activites"
  ON activities FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifies peuvent supprimer des activites"
  ON activities FOR DELETE TO authenticated USING (true);

-- ============================================
-- Table: status_changes (audit trail)
-- ============================================
CREATE TABLE status_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  old_status contact_status,
  new_status contact_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_changes_contact_id ON status_changes(contact_id);
CREATE INDEX idx_status_changes_created_at ON status_changes(created_at DESC);

ALTER TABLE status_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Changements de statut visibles par tous"
  ON status_changes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifies peuvent creer des changements"
  ON status_changes FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- Table: scrape_jobs
-- ============================================
CREATE TABLE scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  city TEXT NOT NULL,
  status scrape_status DEFAULT 'pending',
  results_count INTEGER DEFAULT 0,
  api_used TEXT CHECK (api_used IN ('serper', 'serpapi')),
  error_message TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_scrape_jobs_status ON scrape_jobs(status);
CREATE INDEX idx_scrape_jobs_created_at ON scrape_jobs(created_at DESC);

ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scrape jobs visibles par tous les utilisateurs authentifies"
  ON scrape_jobs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Utilisateurs authentifies peuvent creer des scrape jobs"
  ON scrape_jobs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Utilisateurs authentifies peuvent modifier des scrape jobs"
  ON scrape_jobs FOR UPDATE TO authenticated USING (true);

-- ============================================
-- Trigger updated_at automatique
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_companies
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_contacts
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
