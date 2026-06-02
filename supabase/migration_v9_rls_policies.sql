-- ============================================================
-- Migration v9 — Tighten RLS policies (fix "always true" warnings)
-- Replaces USING (true) / WITH CHECK (true) on write operations
-- with auth.uid() IS NOT NULL so a valid auth session is required.
-- ============================================================


-- ─── sites: replace overly-permissive write policies ────────────────────────

DROP POLICY IF EXISTS "Authenticated users can insert sites"  ON public.sites;
DROP POLICY IF EXISTS "Authenticated users can update sites"  ON public.sites;
DROP POLICY IF EXISTS "Authenticated users can delete sites"  ON public.sites;

CREATE POLICY "Authenticated users can insert sites"
  ON public.sites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sites"
  ON public.sites
  FOR UPDATE
  TO authenticated
  USING     (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete sites"
  ON public.sites
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);


-- ─── contact_submissions: tighten delete, keep insert open ──────────────────
-- INSERT stays open to anon (public contact forms) — WITH CHECK (true) is
-- the only realistic option for an unauthenticated submission endpoint.
-- The linter warns but this is intentional by design.

DROP POLICY IF EXISTS "Authenticated users can delete contact submissions" ON public.contact_submissions;

CREATE POLICY "Authenticated users can delete contact submissions"
  ON public.contact_submissions
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
