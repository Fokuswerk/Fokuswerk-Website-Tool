"use server";

import { revalidatePath } from "next/cache";

/**
 * Sagt Next.js, dass die öffentlichen Seiten neu erzeugt werden sollen.
 * Wird nach jedem Speichern im Verwaltungsbereich aufgerufen, damit
 * Änderungen sofort sichtbar sind und nicht erst nach einer Minute.
 */
export async function seitenErneuern() {
  revalidatePath("/");
  revalidatePath("/aktuelles");
  revalidatePath("/aktuelles/[slug]", "page");
  revalidatePath("/galerie");
  revalidatePath("/sitemap.xml");
}
