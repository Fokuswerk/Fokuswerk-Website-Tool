/**
 * Fotos für die Seite.
 *
 * Freie Bilder von Unsplash (Unsplash-Lizenz, Nutzung auch kommerziell ohne
 * Namensnennung erlaubt). Wir nennen die Fotografinnen und Fotografen
 * trotzdem — und schreiben dazu, dass es Beispielbilder sind und keine
 * Küchen, die über dieses Werkzeug geplant wurden. Alles andere wäre eine
 * Referenz, die es noch nicht gibt.
 */

export interface Foto {
  /** Kennung des Bildes bei Unsplash. */
  id: string;
  alt: string;
  urheber: string;
  seite: string;
}

export const FOTOS = {
  weit: {
    id: "photo-1721614465872-f59fb6feb0f3",
    alt: "Helle Küche mit weißen Fronten und Holzboden",
    urheber: "Alex Tyson",
    seite: "https://unsplash.com/photos/a-kitchen-with-white-cabinets-and-wood-floors-VSZCL7n1aiE",
  },
  hell: {
    id: "photo-1722859030232-6a5d22308ea1",
    alt: "Küche mit weißen Schränken und Dielenboden",
    urheber: "Lisa Anna",
    seite: "https://unsplash.com/photos/a-kitchen-with-white-cabinets-and-wooden-floors-UA4G2SVGWUg",
  },
  modern: {
    id: "photo-1692133186528-c1c42edd5a5c",
    alt: "Moderne Küchenzeile mit Insel",
    urheber: "Brian Wangenheim",
    seite: "https://unsplash.com/photos/a-kitchen-with-white-cabinets-and-wood-floors-QJyLk2urg6I",
  },
  ruhig: {
    id: "photo-1674217444141-d8ca3bc66584",
    alt: "Zurückhaltend eingerichtete Küche mit weißen Wänden",
    urheber: "David Libeert",
    seite: "https://unsplash.com/photos/a-kitchen-with-white-walls-and-wood-floors-slfL-x_7sSw",
  },
  auszug: {
    id: "photo-1676907228185-6869277a9f8f",
    alt: "Offener Küchenauszug mit eingeräumtem Geschirr",
    urheber: "Orgalux",
    seite: "https://unsplash.com/photos/an-open-drawer-in-a-kitchen-filled-with-dishes-BngKr53ZvR4",
  },
  zeile: {
    id: "photo-1721901948031-e260af9635df",
    alt: "Lange Küchenzeile mit weißen Fronten",
    urheber: "Alex Tyson",
    seite: "https://unsplash.com/photos/a-kitchen-with-white-cabinets-and-wooden-floors-LiNcrHZm1Bw",
  },
} satisfies Record<string, Foto>;

/** Bild-Adresse in der gewünschten Breite. Unsplash rechnet selbst herunter,
    deshalb laden wir nie mehr als nötig. */
export function fotoUrl(f: Foto, breite: number): string {
  return `https://images.unsplash.com/${f.id}?fm=jpg&q=72&w=${breite}&auto=format&fit=crop`;
}

export const FOTO_HINWEIS =
  "Beispielbilder, keine über dieses Werkzeug geplanten Küchen — die gibt es noch nicht.";

export const FOTO_URHEBER = Object.values(FOTOS)
  .map((f) => f.urheber)
  .filter((n, i, a) => a.indexOf(n) === i)
  .join(", ");
