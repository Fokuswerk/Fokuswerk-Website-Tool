import type { NeutralesModul } from "@/lib/typen";

/**
 * Neutraler Modulkatalog.
 *
 * Bewusst getrennt vom Lieferantenartikel: die Planung rechnet mit neutralen
 * Typen aus Koordinationsmaß und Funktion. Der Lieferantenadapter (Feld
 * `artikel`) bildet sie auf ein konkretes Programm ab. Ein zweiter Lieferant
 * ist damit eine Tabelle, kein Umbau.
 *
 * Alle Preise EUR netto, Preisstand siehe PREISSTAND. Demo-Werte.
 */

export const PREISSTAND = "01.09.2026";
export const PREIS_GUELTIG_BIS = "31.08.2027";
export const LIEFERANT = "Partnerprogramm M (Demo)";

export const MODULE: NeutralesModul[] = [
  // Unterschränke
  { id: "US600", bezeichnung: "Unterschrank, 2 Auszüge", kategorie: "unterschrank", breite: 600, hoehe: 720, einheit: "stk", preis: 238, artikel: "US60-2A-M" },
  { id: "US450", bezeichnung: "Unterschrank, 3 Auszüge", kategorie: "unterschrank", breite: 450, hoehe: 720, einheit: "stk", preis: 196, artikel: "US45-3A-M" },
  { id: "AZ600", bezeichnung: "Auszugsschrank, Apothekerauszug", kategorie: "unterschrank", breite: 600, hoehe: 720, einheit: "stk", preis: 312, artikel: "US60-AP-M" },
  { id: "UT600", bezeichnung: "Unterschrank mit Tür und Boden", kategorie: "unterschrank", breite: 600, hoehe: 720, einheit: "stk", preis: 186, artikel: "US60-TR-M" },
  { id: "UT450", bezeichnung: "Unterschrank mit Tür und Boden", kategorie: "unterschrank", breite: 450, hoehe: 720, einheit: "stk", preis: 158, artikel: "US45-TR-M" },
  { id: "MU600", bezeichnung: "Auszug mit Mülltrennung", kategorie: "unterschrank", breite: 600, hoehe: 720, einheit: "stk", preis: 346, artikel: "US60-MU-M" },
  { id: "US300", bezeichnung: "Unterschrank, 2 Auszüge", kategorie: "unterschrank", breite: 300, hoehe: 720, einheit: "stk", preis: 164, artikel: "US30-2A-M" },
  { id: "AZ300", bezeichnung: "Apothekerauszug, schmal", kategorie: "unterschrank", breite: 300, hoehe: 720, einheit: "stk", preis: 274, artikel: "US30-AP-M" },
  { id: "SP600", bezeichnung: "Spülenunterschrank", kategorie: "unterschrank", breite: 600, hoehe: 720, einheit: "stk", preis: 264, artikel: "US60-SP-M" },
  { id: "GS600", bezeichnung: "Geschirrspüler-Nische", kategorie: "unterschrank", breite: 600, hoehe: 720, einheit: "stk", preis: 148, artikel: "NI60-GS-M" },
  // Geraeteschraenke brauchen eigene Kennungen. Standen sie als US600 und
  // US450 im Plan, waren sie von Fuellschraenken nicht zu unterscheiden: die
  // Unterlagen setzten Anschluss und Bohrmass an den erstbesten Treffer.
  { id: "GS450", bezeichnung: "Geschirrspüler-Nische 45 cm", kategorie: "unterschrank", breite: 450, hoehe: 720, einheit: "stk", preis: 142, artikel: "NI45-GS-M" },
  { id: "KS600", bezeichnung: "Unterbau-Kühlschrank-Schrank", kategorie: "unterschrank", breite: 600, hoehe: 720, einheit: "stk", preis: 238, artikel: "US60-KS-M" },
  { id: "KF600", bezeichnung: "Kochfeld-Unterschrank", kategorie: "unterschrank", breite: 600, hoehe: 720, einheit: "stk", preis: 286, artikel: "US60-KF-M" },

  // Hochschränke
  { id: "HK600", bezeichnung: "Hochschrank Kühlschrank", kategorie: "hochschrank", breite: 600, hoehe: 2010, einheit: "stk", preis: 428, artikel: "HS60-KS178-M" },
  { id: "HB600", bezeichnung: "Hochschrank Backofen", kategorie: "hochschrank", breite: 600, hoehe: 2010, einheit: "stk", preis: 472, artikel: "HS60-BO-M" },

  /* 700 statt 720, und die Hochschraenke 2010 statt 2060: die Unterlagen
     drucken "Oberkante Hoch- und Haengeschraenke 2160 mm" (HOCH_H aus
     masse.ts). Mit den alten Werten schloss der bestellte Haengeschrank bei
     2180 ab und der Hochschrank auf seinem 150er Sockel bei 2210 — die
     gedruckte Zahl passte zu keinem Artikel der eigenen Stueckliste. Das
     Feld wird nirgends zum Zeichnen benutzt, nur gedruckt. */
  // Hängeschränke
  { id: "HS600", bezeichnung: "Hängeschrank", kategorie: "haengeschrank", breite: 600, hoehe: 700, einheit: "stk", preis: 168, artikel: "OS60-M" },
  { id: "HS450", bezeichnung: "Hängeschrank", kategorie: "haengeschrank", breite: 450, hoehe: 700, einheit: "stk", preis: 139, artikel: "OS45-M" },

  // Blenden und Flächen
  { id: "PB150", bezeichnung: "Passblende, Zuschnitt vor Ort", kategorie: "blende", breite: 150, hoehe: 720, einheit: "stk", preis: 46, artikel: "PB-150-M" },
  { id: "AP", bezeichnung: "Arbeitsplatte Schichtstoff 40 mm, Tiefe 600", kategorie: "arbeitsplatte", breite: null, hoehe: 40, einheit: "lfm", preis: 152, artikel: "AP-SL-600-M" },
  { id: "SO", bezeichnung: "Sockel 150 mm mit Dichtlippe", kategorie: "sockel", breite: null, hoehe: 150, einheit: "lfm", preis: 40, artikel: "SO-150-M" },

  // Geräte und Ausstattung
  { id: "GP1", bezeichnung: "Gerätepaket Standard: Kühlschrank, Backofen, Kochfeld, Dunstesse", kategorie: "geraet", breite: null, hoehe: null, einheit: "psch", preis: 1180, artikel: "GP-STD-M" },
  { id: "GP2", bezeichnung: "Gerätepaket Plus: wie Standard, zusätzlich Geschirrspüler", kategorie: "geraet", breite: null, hoehe: null, einheit: "psch", preis: 1330, artikel: "GP-PLU-M" },
  { id: "SPA", bezeichnung: "Spüle Edelstahl und Armatur", kategorie: "spuele", breite: null, hoehe: null, einheit: "psch", preis: 265, artikel: "SPA-ES-M" },

  // Leistungen und Zuschläge
  { id: "MON", bezeichnung: "Montage und Kleinteile", kategorie: "montage", breite: null, hoehe: null, einheit: "lfm", preis: 78, artikel: "MON-LFM-M" },
  { id: "BARR", bezeichnung: "Zuschlag barrierearme Ausführung: unterfahrbare Spüle, abgesenkte Hängeschränke", kategorie: "zuschlag", breite: null, hoehe: null, einheit: "psch", preis: 620, artikel: "ZUS-BARR-M" },
];

const INDEX = new Map(MODULE.map((m) => [m.id, m]));

/**
 * Was im Plan an der Nummer steht.
 *
 * Die Positionsliste nannte jeden Unterschrank "Schrank" — bei einer Zeile
 * aus sieben Teilen stand dort dreimal, viermal, fünfmal dasselbe Wort, und
 * der Plan sah aus, als hätte niemand nachgedacht. Der Katalog weiß mehr als
 * die Rolle: ein Apothekerauszug ist kein Türschrank, und der Mülltrenner
 * neben der Spüle ist der Grund, warum er dort steht.
 */
export const MODULKURZ: Record<string, string> = {
  US600: "Auszüge",
  US450: "Auszüge",
  US300: "Auszug schmal",
  UT600: "Tür und Boden",
  UT450: "Tür und Boden",
  AZ600: "Apothekerauszug",
  AZ300: "Apotheker schmal",
  MU600: "Mülltrenner",
  KS600: "Kühlschrank",
};

export function modul(id: string): NeutralesModul {
  // Passleiste mit frei zugeschnittener Breite: "PBX:<mm>".
  // Reale Kuechen schliessen den Rest einer Nische so, weil Wandlaengen
  // selten auf das Modulraster fallen.
  if (id.startsWith("PBX:")) {
    const breite = Number(id.slice(4));
    return {
      id,
      bezeichnung: breite < 60 ? "Ausgleichsleiste, vor Ort zugeschnitten" : "Passleiste, vor Ort zugeschnitten",
      kategorie: "blende",
      breite,
      hoehe: 720,
      einheit: "stk",
      preis: Math.max(28, Math.round(breite * 0.28)),
      artikel: "PB-ZS-M",
    };
  }
  const m = INDEX.get(id);
  if (!m) throw new Error(`Unbekanntes Modul: ${id}`);
  return m;
}

/**
 * Gibt es dieses Modul, und ist es als Breitenangabe brauchbar?
 *
 * `modul()` wirft bei einer unbekannten Kennung. Das ist richtig, solange
 * Kennungen aus dem Code kommen — aber eine gespeicherte Belegung aus einer
 * aelteren Sitzung kann Module nennen, die es nicht mehr gibt, und eine
 * zugeschnittene Passleiste kann aus einer Rechnung mit einer Breite von
 * null oder darunter kommen. Beides muss sich pruefen lassen, ohne dass die
 * Seite dabei stehenbleibt.
 */
export function istBekanntesModul(id: string): boolean {
  if (id.startsWith("PBX:")) {
    const breite = Number(id.slice(4));
    return Number.isFinite(breite) && breite > 0;
  }
  return INDEX.has(id);
}

export function istZeilenmodul(id: string): boolean {
  const k = modul(id).kategorie;
  return k === "unterschrank" || k === "hochschrank" || k === "blende";
}

/** Summe der Korpusbreiten einer Zeilenbelegung in mm. */
export function belegungsbreite(ids: string[]): number {
  return ids.reduce((s, id) => s + (modul(id).breite ?? 0), 0);
}
