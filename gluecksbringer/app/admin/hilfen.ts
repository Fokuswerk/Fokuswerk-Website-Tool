"use client";

/** Kleine Helfer für den Verwaltungsbereich. */

/** Aus "Der 16. Wunschbaum am Meer" wird "der-16-wunschbaum-am-meer". */
export function adresseAus(text: string) {
  return text
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type Aufbereitet = {
  datei: Blob;
  breite: number;
  hoehe: number;
  endung: string;
};

const HOECHSTBREITE = 2400;

/**
 * Handyfotos sind schnell acht Megabyte groß. Vor dem Hochladen werden sie
 * deshalb im Browser auf eine vernünftige Kantenlänge gebracht und neu
 * gespeichert – das spart Ladezeit auf der Website und Wartezeit beim
 * Hochladen. Die Maße geben wir mit, damit auf der Seite kein Platz
 * nachträglich springt.
 */
export async function bildAufbereiten(datei: File): Promise<Aufbereitet> {
  const bitmap = await createImageBitmap(datei);
  const faktor = Math.min(1, HOECHSTBREITE / Math.max(bitmap.width, bitmap.height));
  const breite = Math.round(bitmap.width * faktor);
  const hoehe = Math.round(bitmap.height * faktor);

  // PNG mit Transparenz (etwa Zeichnungen) bleibt PNG, alles andere wird JPEG.
  const transparent = datei.type === "image/png";
  const typ = transparent ? "image/png" : "image/jpeg";

  const flaeche = document.createElement("canvas");
  flaeche.width = breite;
  flaeche.height = hoehe;
  const stift = flaeche.getContext("2d");
  if (!stift) throw new Error("Das Bild konnte nicht verarbeitet werden.");
  stift.imageSmoothingQuality = "high";
  stift.drawImage(bitmap, 0, 0, breite, hoehe);
  bitmap.close();

  const blob = await new Promise<Blob | null>((fertig) =>
    flaeche.toBlob(fertig, typ, 0.86),
  );
  if (!blob) throw new Error("Das Bild konnte nicht gespeichert werden.");

  return { datei: blob, breite, hoehe, endung: transparent ? "png" : "jpg" };
}

/** Eindeutiger Dateiname, damit sich nichts gegenseitig überschreibt. */
export function dateinameBauen(ordner: string, originalname: string, endung: string) {
  const stamm = adresseAus(originalname.replace(/\.[^.]+$/, "")) || "bild";
  const marke = Date.now().toString(36);
  return `${ordner}/${stamm}-${marke}.${endung}`;
}

export function heute() {
  return new Date().toISOString().slice(0, 10);
}
