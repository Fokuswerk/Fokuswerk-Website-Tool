import { createBrowserClient } from "@supabase/ssr";

/**
 * Gemeinsame Angaben zur Inhaltsverwaltung – bewusst ohne Serverbezug,
 * damit diese Datei auch in Browser-Komponenten verwendet werden darf.
 *
 * Die Website läuft auch ohne Supabase: Sind die beiden Umgebungsvariablen
 * nicht gesetzt, fällt alles auf die eingebauten Inhalte in `content/`
 * zurück. So bleibt sie funktionsfähig, solange der Verein noch keinen
 * Zugang eingerichtet hat.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_SCHLUESSEL = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Ist eine Inhaltsverwaltung hinterlegt? */
export const cmsAktiv = Boolean(SUPABASE_URL && SUPABASE_SCHLUESSEL);

/** Adresse eines Bildes im öffentlichen Speicherordner. */
export function bildAdresse(pfad: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/bilder/${pfad}`;
}

/** Zugang für den Browser – nur mit dem öffentlichen Schlüssel. */
export function browserClient() {
  if (!cmsAktiv) throw new Error("Supabase ist nicht eingerichtet.");
  return createBrowserClient(SUPABASE_URL!, SUPABASE_SCHLUESSEL!);
}
