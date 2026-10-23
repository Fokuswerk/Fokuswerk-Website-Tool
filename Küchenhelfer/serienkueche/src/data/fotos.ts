import type { GeraeteArt } from "@/data/geraete";

/**
 * Fotos für die Seite.
 *
 * Freie Bilder von Unsplash (Unsplash-Lizenz, kommerzielle Nutzung ohne
 * Namensnennung erlaubt). Wir nennen die Fotografinnen und Fotografen
 * trotzdem.
 *
 * Zwei Dinge stehen bewusst dabei: die Raumbilder sind Beispiele und keine
 * Küchen, die über dieses Werkzeug geplant wurden. Und die Gerätebilder
 * zeigen die Art des Geräts, nicht das einzelne Modell — die Bilder der
 * Hersteller kommen mit deren Katalog.
 */

export interface Foto {
  id: string;
  alt: string;
  urheber: string;
}

export const FOTOS = {
  hero: {
    id: "photo-1600684388091-627109f3cd60",
    alt: "Küche mit matten dunklen Fronten und Holzboden",
    urheber: "Sven Brandsma",
  },
  marmor: {
    id: "photo-1695542958346-d51b0c2f1917",
    alt: "Dunkle Küche mit Marmorarbeitsplatte",
    urheber: "Tim Schmidbauer",
  },
  gruen: {
    id: "photo-1586208958839-06c17cacdf08",
    alt: "Küche mit grünen Fronten, modern und zugleich altmodisch",
    urheber: "Kam Idris",
  },
  detail: {
    id: "photo-1698133468654-156bfe8b088e",
    alt: "Dunkle Küchenzeile mit Schneidebrett auf der Platte",
    urheber: "Laura Barry",
  },
  insel: {
    id: "photo-1765766601532-90e9b96320c8",
    alt: "Moderne dunkle Küche mit Marmorboden",
    urheber: "Marina Nazina",
  },
  licht: {
    id: "photo-1790156690388-1229a422c30a",
    alt: "Lange Küchenzeile mit eingelassenen Kochfeldern und Pendelleuchten",
    urheber: "Ceba Solutions",
  },
} satisfies Record<string, Foto>;

/** Ein Bild je Geräteart. Zeigt die Art, nicht das Modell. */
export const GERAETEFOTOS: Record<GeraeteArt, Foto> = {
  kuehlschrank: {
    id: "photo-1713514022453-4adc636025a4",
    alt: "Kühlschrank zwischen weißen Küchenfronten",
    urheber: "Sanju Pandita",
  },
  kochfeld: {
    id: "photo-1755062371460-3592808f7aea",
    alt: "Induktionskochfeld in einer Küche mit Holzfronten",
    urheber: "Grace Anne Bobadilla",
  },
  backofen: {
    id: "photo-1772567732993-3c546ee1a52c",
    alt: "Eingebauter Backofen im Hochschrank",
    urheber: "Franco Debartolo",
  },
  spuelmaschine: {
    id: "photo-1736390755053-f57997f7931b",
    alt: "Geschirr wird in eine Spülmaschine geräumt",
    urheber: "Jutta Elisabeth",
  },
  dunstabzug: {
    id: "photo-1772016608838-d8d467da27e8",
    alt: "Küche mit Dunstabzug über dem Kochfeld",
    urheber: "Smart Renovations",
  },
};

/** Bild-Adresse in der gewünschten Breite. Unsplash rechnet selbst herunter,
    deshalb laden wir nie mehr als nötig. */
export function fotoUrl(f: Foto, breite: number): string {
  return `https://images.unsplash.com/${f.id}?fm=jpg&q=78&w=${breite}&auto=format&fit=crop`;
}

export const FOTO_HINWEIS =
  "Beispielbilder, keine über dieses Werkzeug geplanten Küchen — die gibt es noch nicht.";

export const GERAETEFOTO_HINWEIS =
  "Die Bilder zeigen die Art des Geräts, nicht das einzelne Modell. Herstellerbilder kommen mit dem Lieferantenkatalog.";

export const FOTO_URHEBER = [
  ...Object.values(FOTOS).map((f) => f.urheber),
  ...Object.values(GERAETEFOTOS).map((f) => f.urheber),
]
  .filter((n, i, a) => a.indexOf(n) === i)
  .join(", ");
