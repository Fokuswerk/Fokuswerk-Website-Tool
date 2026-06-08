-- ============================================================
-- Migration v10 — Leads Pipeline
-- Separate leads table for the sales workflow:
-- Discovery → Analyse → Anruf → Demo-Site → Verkauf
-- ============================================================

-- ─── Enum: Lead Status ───────────────────────────────────────────────────────

CREATE TYPE lead_pipeline_status AS ENUM (
  'neu',          -- gerade gefunden
  'analysiert',   -- KI-Analyse läuft/fertig
  'zu_kontaktieren', -- bereit für Anruf
  'kontaktiert',  -- angerufen, noch keine Entscheidung
  'interessiert', -- hat Interesse gezeigt, Demo angefordert
  'demo_erstellt',-- Website wurde generiert
  'angebot',      -- Demo geschickt, wartet auf Entscheidung
  'gewonnen',     -- bezahlt / abgeschlossen
  'verloren'      -- abgesagt oder kein Interesse
);

-- ─── Leads Tabelle ───────────────────────────────────────────────────────────

CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Stammdaten (aus Suche)
  company_name    TEXT NOT NULL,
  industry        TEXT,
  city            TEXT,
  address         TEXT,
  phone           TEXT,
  email           TEXT,
  website         TEXT,
  maps_url        TEXT,
  sources         TEXT[] DEFAULT '{}',

  -- Google Daten
  google_place_id TEXT,
  google_rating   NUMERIC(3,1),
  google_rating_count INTEGER,

  -- Website-Qualitäts-Analyse
  website_score         INTEGER,        -- 0-100: 100 = sehr schlecht (→ guter Lead)
  website_score_notes   TEXT[],         -- Gründe für den Score
  website_builder       TEXT,           -- "jimdo" | "wix" | "1und1" | "homepage-baukasten" | null
  website_has_ssl       BOOLEAN,
  website_is_mobile     BOOLEAN,
  website_age_estimate  TEXT,           -- "sehr alt (vor 2015)" | "alt (2015-2019)" | "aktuell"

  -- KI-Analyse (CompanyDNA)
  dna             JSONB,

  -- Preis-Einschätzung
  price_min       INTEGER,              -- in EUR
  price_max       INTEGER,
  price_reasoning TEXT,

  -- Sales Pipeline
  status          lead_pipeline_status NOT NULL DEFAULT 'neu',
  call_notes      TEXT,
  generated_site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  sale_price      INTEGER,             -- tatsächlicher Verkaufspreis in EUR

  -- Zeitstempel
  contacted_at    TIMESTAMPTZ,
  won_at          TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Indizes
CREATE INDEX idx_leads_status      ON leads(status);
CREATE INDEX idx_leads_city        ON leads(city);
CREATE INDEX idx_leads_industry    ON leads(industry);
CREATE INDEX idx_leads_website_score ON leads(website_score DESC NULLS LAST);
CREATE INDEX idx_leads_created_at  ON leads(created_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Nur eingeloggte User dürfen alles
CREATE POLICY "Authenticated users can read leads"
  ON leads FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert leads"
  ON leads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete leads"
  ON leads FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ─── contact_submissions: add site_id column if not exists ───────────────────
-- (needed for lead-generated sites)
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
