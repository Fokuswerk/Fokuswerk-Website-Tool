-- ============================================================
-- Migration v8 — Security hardening
-- Fixes all Supabase Security Lint findings:
--   ERROR: RLS disabled on public.sites
--   ERROR: RLS disabled on public.contact_submissions
--   WARN:  rls_auto_enable() callable by anon/authenticated
--   WARN:  update_updated_at() has mutable search_path
-- NOTE: "Leaked Password Protection" must be enabled manually
--       in the Supabase Dashboard → Authentication → Settings
-- ============================================================


-- ─── 1. Fix: update_updated_at — set immutable search_path ──────────────────
-- Prevents search_path injection attacks on this trigger function.

CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ─── 2. Fix: rls_auto_enable — revoke public execute access ─────────────────
-- This function was accessible to anon + authenticated as SECURITY DEFINER.
-- Revoke execute so only the owning role (postgres/service_role) can call it.

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;


-- ─── 3. Fix: Enable RLS on public.sites ─────────────────────────────────────
-- All DB access uses the anon key. Policies:
--   anon      → SELECT only  (public site pages at /site/[slug] render server-side)
--   authenticated → full access (dashboard: create/edit/delete sites)

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Anyone can read a site (needed for /site/[slug] public pages)
CREATE POLICY "Public can read sites"
  ON public.sites
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only logged-in users (dashboard owner) can create/edit/delete
CREATE POLICY "Authenticated users can insert sites"
  ON public.sites
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sites"
  ON public.sites
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sites"
  ON public.sites
  FOR DELETE
  TO authenticated
  USING (true);


-- ─── 4. Fix: Enable RLS on public.contact_submissions ───────────────────────
-- Policies:
--   anon      → INSERT only  (contact form on public sites submits as anon)
--   authenticated → full access (admin reads/manages submissions)

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form (public-facing feature)
CREATE POLICY "Public can submit contact forms"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only logged-in users can read/delete submissions (privacy of visitors)
CREATE POLICY "Authenticated users can read contact submissions"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete contact submissions"
  ON public.contact_submissions
  FOR DELETE
  TO authenticated
  USING (true);
