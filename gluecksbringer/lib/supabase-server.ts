import "server-only";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_SCHLUESSEL, SUPABASE_URL, cmsAktiv } from "./supabase";

/** Zugang zum reinen Lesen beim Bauen und Neuaufbauen der Seiten. */
export function lesenClient() {
  if (!cmsAktiv) throw new Error("Supabase ist nicht eingerichtet.");
  return createServerClient(SUPABASE_URL!, SUPABASE_SCHLUESSEL!, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
