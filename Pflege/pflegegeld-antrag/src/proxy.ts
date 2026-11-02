import { NextResponse, type NextRequest } from "next/server";
import { SCHLEUSE_KEKS, schleusenMerkmal, gleich } from "@/lib/schleuse";

/**
 * Schleuse vor der ganzen Seite.
 *
 * Solange Impressum und Datenschutzerklärung nicht ausgefüllt sind, darf die
 * Seite nicht öffentlich erreichbar sein. `noindex` allein reicht dafür nicht —
 * das hält nur Suchmaschinen fern, nicht jemanden, der die Adresse kennt. Mit
 * dieser Schleuse ist sie tatsächlich nicht öffentlich.
 *
 * Zum Abschalten: diese Datei löschen. Sonst nichts.
 *
 * Heisst proxy.ts und nicht middleware.ts — Next 16 hat die alte Bezeichnung
 * abgeloest, der Mechanismus ist derselbe.
 */

/**
 * Was ohne Passwort durchkommt. Die Anmeldeseite selbst muss dabei sein, sonst
 * kann sie sich nicht laden — und ihre Schriften und Stile auch, sonst steht
 * dort eine nackte HTML-Seite.
 */
const FREI = [
  "/schleuse",
  "/api/schleuse",
  "/icon.svg",
  "/favicon.ico",
  "/vorschau.jpg",
];

export async function proxy(req: NextRequest) {
  const pfad = req.nextUrl.pathname;

  if (FREI.some((f) => pfad === f) || pfad.startsWith("/_next/")) {
    return NextResponse.next();
  }

  const keks = req.cookies.get(SCHLEUSE_KEKS)?.value;
  if (keks && gleich(keks, await schleusenMerkmal())) {
    return NextResponse.next();
  }

  // Aufrufe der Schnittstellen bekommen eine Zahl, keine Anmeldeseite — eine
  // HTML-Seite als Antwort auf einen JSON-Aufruf verwirrt nur.
  if (pfad.startsWith("/api/")) {
    return NextResponse.json({ ok: false, grund: "schleuse" }, { status: 401 });
  }

  const ziel = req.nextUrl.clone();
  ziel.pathname = "/schleuse";
  // Wohin es nach dem Einlassen weitergehen soll.
  ziel.search = pfad === "/" ? "" : `?weiter=${encodeURIComponent(pfad + req.nextUrl.search)}`;
  return NextResponse.redirect(ziel);
}

export const config = {
  // Bilder und sonstige Dateien aus /public laufen über diesen Treffer mit,
  // deshalb stehen die Ausnahmen oben in FREI und nicht hier.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
