import { MODULE, belegungsbreite, modul } from "@/data/module";
import { KUECHENTYPEN, WOHNUNGEN, typFuer } from "@/data/projekt";
import { VARIANTEN, type VarianteRoh } from "@/data/varianten";
import type { Kuechentyp, Position, Wandseite, Zeile } from "@/lib/typen";
import { MWST } from "@/data/geraete";

/**
 * Alle Mengen und Kosten werden hier aus Modulkatalog und Variantenbelegung
 * gerechnet. In der gesamten Anwendung steht keine Kostenzahl fest im Code.
 */

export interface Gewichtung {
  kosten: number;
  stauraum: number;
  ergonomie: number;
  installation: number;
}

export const GEWICHTUNG_STANDARD: Gewichtung = {
  kosten: 30,
  stauraum: 25,
  ergonomie: 25,
  installation: 20,
};

export interface ListenPosition {
  modulId: string;
  bezeichnung: string;
  artikel: string;
  kategorie: string;
  breite: number | null;
  einheit: string;
  menge: number;
  einzelpreis: number;
  gesamt: number;
}

/** Alle Positionen einer Variante, Zeilenmodule und Flächenpositionen zusammen. */
export function positionen(v: VarianteRoh): Position[] {
  const aus: Position[] = [];
  for (const [zeileId, ids] of Object.entries(v.belegung)) {
    for (const id of ids) aus.push({ modulId: id, menge: 1, zeileId });
  }
  aus.push(...v.weitere);
  return aus;
}

/** Zusammengefasste Stückliste, nach Modul gruppiert. */
export function stueckliste(v: VarianteRoh): ListenPosition[] {
  const summe = new Map<string, number>();
  for (const p of positionen(v)) {
    summe.set(p.modulId, (summe.get(p.modulId) ?? 0) + p.menge);
  }
  const reihenfolge = MODULE.map((m) => m.id);
  return [...summe.entries()]
    .sort((a, b) => reihenfolge.indexOf(a[0]) - reihenfolge.indexOf(b[0]))
    .map(([id, menge]) => {
      const m = modul(id);
      return {
        modulId: id,
        bezeichnung: m.bezeichnung,
        artikel: m.artikel,
        kategorie: m.kategorie,
        breite: m.breite,
        einheit: m.einheit,
        menge,
        einzelpreis: m.preis,
        gesamt: Math.round(m.preis * menge),
      };
    });
}

export function preis(v: VarianteRoh): number {
  return stueckliste(v).reduce((s, p) => s + p.gesamt, 0);
}

/** Position eines Moduls innerhalb seiner Zeile, in mm ab Zeilenanfang. */
export interface ModulPlatz {
  modulId: string;
  index: number;
  von: number;
  bis: number;
  breite: number;
}

export function platzierung(v: VarianteRoh, zeileId: string): ModulPlatz[] {
  const ids = v.belegung[zeileId] ?? [];
  let x = 0;
  return ids.map((id, index) => {
    const b = modul(id).breite ?? 0;
    const platz = { modulId: id, index, von: x, bis: x + b, breite: b };
    x += b;
    return platz;
  });
}

function mitte(p: ModulPlatz): number {
  return Math.round((p.von + p.bis) / 2);
}

function finde(v: VarianteRoh, typ: Kuechentyp, modulId: string) {
  for (const z of typ.zeilen) {
    const treffer = platzierung(v, z.id).find((p) => p.modulId === modulId);
    if (treffer) return { zeile: z, platz: treffer };
  }
  return null;
}

/** Stauraum in Litern, aus Korpusmaßen gerechnet. */
export function stauraum(v: VarianteRoh): number {
  let liter = 0;
  for (const p of positionen(v)) {
    const m = modul(p.modulId);
    if (!m.breite || !m.hoehe) continue;
    const tiefe = m.kategorie === "haengeschrank" ? 350 : 560;
    if (m.kategorie === "blende") continue;
    liter += (m.breite * m.hoehe * tiefe * p.menge) / 1_000_000;
  }
  return Math.round(liter);
}

/** Zusammenhängende Arbeitsfläche zwischen Spüle und Kochfeld, in mm. */
export function arbeitsflaeche(v: VarianteRoh, typ: Kuechentyp): number {
  const sp = finde(v, typ, "SP600");
  const kf = finde(v, typ, "KF600");
  if (!sp || !kf) return 0;
  if (sp.zeile.id !== kf.zeile.id) {
    // Über Eck: Arbeitsfläche vom jeweiligen Modul bis zur gemeinsamen Ecke.
    const bisEcke = (f: { zeile: Zeile; platz: ModulPlatz }) => {
      const laenge = f.zeile.laenge;
      return Math.min(f.platz.von, laenge - f.platz.bis);
    };
    return bisEcke(sp) + bisEcke(kf);
  }
  const a = sp.platz.von < kf.platz.von ? sp.platz : kf.platz;
  const b = sp.platz.von < kf.platz.von ? kf.platz : sp.platz;
  return Math.max(0, b.von - a.bis);
}

/**
 * Abstand eines Laufmasses auf einer Wand bis zu einer bestimmten Raumecke.
 *
 * Die Wandkonvention steht im Kopf von data/projekt.ts: nord und sued laufen
 * von links nach rechts, west und ost von oben nach unten. Ein Laufmass ist
 * also immer vom westlichen bzw. noerdlichen Ende der Wand gemessen. Liegt
 * die gesuchte Ecke an genau diesem Ende, IST das Laufmass der Abstand; liegt
 * sie am anderen, ist es die Wandlaenge minus Laufmass.
 */
function abstandZurEcke(
  wand: Wandseite,
  laufmass: number,
  ecke: { west: boolean; nord: boolean },
  raum: { breite: number; tiefe: number },
): number {
  if (wand === "nord" || wand === "sued") return ecke.west ? laufmass : raum.breite - laufmass;
  return ecke.nord ? laufmass : raum.tiefe - laufmass;
}

/** Die gemeinsame Ecke zweier aneinanderstossender Waende. */
function gemeinsameEcke(a: Wandseite, b: Wandseite): { west: boolean; nord: boolean } {
  const waagerecht = a === "nord" || a === "sued" ? a : b;
  const senkrecht = a === "west" || a === "ost" ? a : b;
  return { west: senkrecht === "west", nord: waagerecht === "nord" };
}

/** Weg von der Spülenmitte zum Abwasserfallstrang, in mm. */
export function installationsweg(v: VarianteRoh, typ: Kuechentyp): number {
  const sp = finde(v, typ, "SP600");
  const fs = typ.zwangspunkte.find((z) => z.art === "fallstrang");
  if (!sp || !fs) return 0;
  const spX = sp.zeile.start + mitte(sp.platz);
  const fsMitte = fs.von + Math.round(fs.breite / 2);
  if (sp.zeile.wand === fs.wand) return Math.abs(spX - fsMitte);
  /* Ueber Eck: beide Teilstrecken gehen zur GEMEINSAMEN Ecke der beiden
     Waende. Vorher nahm Math.min() die naehere Raumecke — also unter
     Umstaenden die falsche — und das zweite Mass wurde vom eigenen
     Wandanfang gezaehlt statt von der Ecke. Nachgemessen lag K-04 damit bei
     525 mm statt 3915, und K-01-C bei 1125 statt 2325. Bei K-01 kamen so fuer
     alle drei Varianten identische Wege heraus, womit spanne() bei max===min
     pauschal 100 lieferte und jede Variante die vollen 20 Punkte fuer
     Installation bekam. */
  const ecke = gemeinsameEcke(sp.zeile.wand, fs.wand);
  return (
    abstandZurEcke(sp.zeile.wand, spX, ecke, typ.raum) +
    abstandZurEcke(fs.wand, fsMitte, ecke, typ.raum)
  );
}

/**
 * Bewegungsfläche vor der Zeile, in mm: Raumtiefe abzüglich der Korpustiefe
 * jeder Zeile, die in diese Tiefe hineinragt. Bei zwei Zeilen gegenüber sind
 * das zwei, sonst eine — eine L-Form ragt nur mit einer Zeile in die Tiefe.
 *
 * Vorher stand hier ein Ausdruck, der in beiden Zweigen dasselbe lieferte und
 * am Ende null abzog. Er sah nach einer Rechnung aus und war keine.
 */
export function bewegungsflaeche(typ: Kuechentyp): number {
  const korpus = 600;
  const zeilenInDerTiefe = typ.grundform === "zweizeilig" ? 2 : 1;
  return typ.raum.tiefe - zeilenInDerTiefe * korpus;
}

export interface Kennzahlen {
  preis: number;
  stauraum: number;
  arbeitsflaeche: number;
  installationsweg: number;
  bewegungsflaeche: number;
  passblenden: number;
  module: number;
  bewertung: number;
}

export function kennzahlen(
  v: VarianteRoh,
  typ: Kuechentyp,
  gewichtung: Gewichtung = GEWICHTUNG_STANDARD,
): Kennzahlen {
  const geschwister = VARIANTEN.filter((x) => x.typId === v.typId);
  const preise = geschwister.map(preis);
  const staus = geschwister.map(stauraum);
  const wege = geschwister.map((x) => installationsweg(x, typ));
  const flaechen = geschwister.map((x) => arbeitsflaeche(x, typ));

  const spanne = (werte: number[], wert: number, kleinerIstBesser: boolean) => {
    const min = Math.min(...werte);
    const max = Math.max(...werte);
    if (max === min) return 100;
    const anteil = (wert - min) / (max - min);
    return Math.round((kleinerIstBesser ? 1 - anteil : anteil) * 100);
  };

  const p = preis(v);
  const s = stauraum(v);
  const w = installationsweg(v, typ);
  const f = arbeitsflaeche(v, typ);

  const summe = gewichtung.kosten + gewichtung.stauraum + gewichtung.ergonomie + gewichtung.installation;
  const bewertung = Math.round(
    (spanne(preise, p, true) * gewichtung.kosten +
      spanne(staus, s, false) * gewichtung.stauraum +
      spanne(flaechen, f, false) * gewichtung.ergonomie +
      spanne(wege, w, true) * gewichtung.installation) /
      (summe || 1),
  );

  const alle = positionen(v);
  return {
    preis: p,
    stauraum: s,
    arbeitsflaeche: f,
    installationsweg: w,
    bewegungsflaeche: bewegungsflaeche(typ),
    passblenden: alle.filter((x) => modul(x.modulId).kategorie === "blende").length,
    module: alle.filter((x) => x.zeileId).length,
    bewertung,
  };
}

export function variantenFuer(typId: string): VarianteRoh[] {
  return VARIANTEN.filter((v) => v.typId === typId);
}

export function variante(id: string): VarianteRoh {
  const v = VARIANTEN.find((x) => x.id === id);
  if (!v) throw new Error(`Unbekannte Variante: ${id}`);
  return v;
}

/** Projektweite Aggregation über die aktuelle Variantenauswahl. */
export interface Projektsumme {
  gesamt: number;
  jeTyp: Array<{ typId: string; variantId: string; anzahl: number; einzel: number; summe: number }>;
  positionen: Array<ListenPosition & { typen: string[] }>;
}

export function projektsumme(auswahl: Record<string, string>): Projektsumme {
  const jeTyp = KUECHENTYPEN.map((t) => {
    const v = variante(auswahl[t.id]);
    const einzel = preis(v);
    const anzahl = t.wohnungen.length;
    return { typId: t.id, variantId: v.id, anzahl, einzel, summe: einzel * anzahl };
  });

  const sammel = new Map<string, ListenPosition & { typen: string[] }>();
  for (const t of KUECHENTYPEN) {
    const v = variante(auswahl[t.id]);
    const anzahl = t.wohnungen.length;
    for (const p of stueckliste(v)) {
      const vorhanden = sammel.get(p.modulId);
      if (vorhanden) {
        vorhanden.menge += p.menge * anzahl;
        vorhanden.gesamt += p.gesamt * anzahl;
        if (!vorhanden.typen.includes(t.id)) vorhanden.typen.push(t.id);
      } else {
        sammel.set(p.modulId, {
          ...p,
          menge: p.menge * anzahl,
          gesamt: p.gesamt * anzahl,
          typen: [t.id],
        });
      }
    }
  }
  const reihenfolge = MODULE.map((m) => m.id);
  return {
    gesamt: jeTyp.reduce((s, x) => s + x.summe, 0),
    jeTyp,
    positionen: [...sammel.values()].sort(
      (a, b) => reihenfolge.indexOf(a.modulId) - reihenfolge.indexOf(b.modulId),
    ),
  };
}

export function wohnungenFuer(typId: string) {
  return WOHNUNGEN.filter((w) => w.typId === typId);
}

/**
 * Prüft die Invariante, auf der alles beruht: die Summe der Korpusbreiten
 * einer Belegung muss exakt die Zeilenlänge ergeben. Wird beim Start und im
 * Prüfskript ausgeführt.
 */
export function pruefeBelegungen(): string[] {
  const fehler: string[] = [];
  for (const v of VARIANTEN) {
    const typ = typFuer(v.typId);
    for (const z of typ.zeilen) {
      const ids = v.belegung[z.id];
      if (!ids) {
        fehler.push(`${v.id}: Zeile ${z.id} ohne Belegung`);
        continue;
      }
      const breite = belegungsbreite(ids);
      if (breite !== z.laenge) {
        fehler.push(
          `${v.id}, Zeile ${z.id}: Belegung ${breite} mm, Zeilenlänge ${z.laenge} mm, Abweichung ${breite - z.laenge} mm`,
        );
      }
    }
    for (const zeileId of Object.keys(v.belegung)) {
      if (!typ.zeilen.some((z: Zeile) => z.id === zeileId)) {
        fehler.push(`${v.id}: unbekannte Zeile ${zeileId}`);
      }
    }
  }
  return fehler;
}

/**
 * Gerechnet wird netto — im Haus, gegenüber dem Lieferanten, im Angebot.
 * Was ein Verbraucher sieht, muss dagegen der Endpreis sein, also brutto.
 */
export function brutto(netto: number): number {
  return Math.round(netto * (1 + MWST));
}

export function eur(wert: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(wert);
}

export function mm(wert: number): string {
  return new Intl.NumberFormat("de-DE").format(wert);
}

export function zahl(wert: number, stellen = 0): string {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: stellen, maximumFractionDigits: stellen }).format(wert);
}
