/**
 * Leistungsbetraege der Pflegeversicherung, haeusliche Pflege.
 *
 * 2026: Uebersicht des Bundesgesundheitsministeriums "Leistungsansprueche der
 *       Versicherten im Jahr 2026", Stand 04.11.2025.
 * 2027: Pflegeneuordnungsgesetz, Kabinettsfassung 30.09.2026 -
 *       § 36 Abs. 3 (Sachleistungsbudget), § 37 Abs. 1 (Entlastungsbudget),
 *       § 39 Abs. 1 (Ueberbrueckungsbudget), § 45b Abs. 1 (Sozialraumbudget),
 *       § 40 Abs. 2 entfaellt fuer Verbrauchshilfsmittel.
 *
 * Index 0 entspricht Pflegegrad 1.
 */

export type Pflegegrad = 1 | 2 | 3 | 4 | 5;

export const BETRAEGE_2026 = {
  pflegegeld: [0, 347, 599, 800, 990],
  sachleistung: [0, 796, 1497, 1859, 2299],
  entlastungsbetrag: [131, 131, 131, 131, 131],
  verbrauchshilfsmittel: [42, 42, 42, 42, 42],
  /** gemeinsamer Jahresbetrag Verhinderungs- und Kurzzeitpflege */
  ersatzpflegeJahr: [0, 3539, 3539, 3539, 3539],
  tagespflege: [0, 721, 1357, 1685, 2085],
} as const;

export const BETRAEGE_2027 = {
  /** Pflegegeld im Umfang eines Entlastungsbudgets */
  pflegegeld: [0, 380, 630, 890, 1080],
  sachleistung: [0, 890, 1590, 2090, 2530],
  /** Sozialraumbudget, zweckgebunden fuer anerkannte Angebote zur Unterstuetzung im Alltag */
  sozialraumbudget: [0, 175, 175, 175, 175],
  /** faellt als eigener Anspruch weg, wird aus dem Entlastungsbudget bezahlt */
  verbrauchshilfsmittel: [0, 0, 0, 0, 0],
  /** Ueberbrueckungsbudget statt Verhinderungs- und Kurzzeitpflege */
  ueberbrueckungJahr: [0, 2285, 2285, 2285, 2285],
  tagespflege: [0, 721, 1357, 1685, 2085],
} as const;

export type Nutzung = {
  pflegegrad: Pflegegrad;
  /** Anteil Pflegegeld gegenueber Sachleistung: 1 = nur Angehoerige, 0 = nur Pflegedienst */
  anteilPflegegeld: number;
  nutztEntlastungsbetrag: boolean;
  nutztHilfsmittelbox: boolean;
  nutztErsatzpflege: boolean;
  /**
   * Wer die Ersatzpflege uebernimmt. Nahe Angehoerige, die nicht erwerbsmaessig
   * pflegen, bekommen nach § 39 Abs. 3 Satz 2 SGB XI regelmaessig nur das
   * Pflegegeld fuer zwei Monate - nicht den gemeinsamen Jahresbetrag.
   */
  ersatzpflegeDurchAngehoerige: boolean;
  unter25: boolean;
};

export type Posten = {
  name: string;
  alt: number;
  neu: number;
  hinweis?: string;
};

export type Vergleich = {
  posten: Posten[];
  summeAlt: number;
  summeNeu: number;
  differenz: number;
};

/** Monatlicher Vergleich der Ansprueche fuer einen konkreten Haushalt. */
export function vergleiche(n: Nutzung): Vergleich {
  const i = n.pflegegrad - 1;
  const g = Math.min(Math.max(n.anteilPflegegeld, 0), 1);
  const posten: Posten[] = [];

  const geldAlt = BETRAEGE_2026.pflegegeld[i] * g;
  const geldNeu = BETRAEGE_2027.pflegegeld[i] * g;
  posten.push({
    name: g === 1 ? "Pflegegeld" : "Pflegegeld, anteilig",
    alt: geldAlt,
    neu: geldNeu,
    hinweis: n.pflegegrad === 1 ? "Pflegegrad 1 hat keinen Anspruch, vorher und nachher" : undefined,
  });

  if (g < 1) {
    posten.push({
      name: "Pflegedienst, anteilig",
      alt: BETRAEGE_2026.sachleistung[i] * (1 - g),
      neu: BETRAEGE_2027.sachleistung[i] * (1 - g),
      hinweis: "wird zum Sachleistungsbudget",
    });
  }

  if (n.nutztEntlastungsbetrag) {
    const neu = n.unter25 && n.pflegegrad >= 2 ? 300 : BETRAEGE_2027.sozialraumbudget[i];
    posten.push({
      name: "Entlastungsbetrag, künftig Sozialraumbudget",
      alt: BETRAEGE_2026.entlastungsbetrag[i],
      neu,
      hinweis:
        n.pflegegrad === 1
          ? "fällt für Pflegegrad 1 weg, es bleiben die Beratungseinsätze nach § 37 Abs. 3"
          : "nur für anerkannte Angebote, Erstattung gegen Belege",
    });
  }

  if (n.nutztHilfsmittelbox) {
    posten.push({
      name: "Pflegehilfsmittel zum Verbrauch",
      alt: BETRAEGE_2026.verbrauchshilfsmittel[i],
      neu: BETRAEGE_2027.verbrauchshilfsmittel[i],
      hinweis: "kein eigener Anspruch mehr, aus dem Pflegegeld zu zahlen",
    });
  }

  if (n.nutztErsatzpflege) {
    // § 39 Abs. 3 Satz 2 SGB XI: nicht erwerbsmaessig pflegende nahe Angehoerige
    // erhalten regelmaessig das Pflegegeld fuer zwei Monate, nicht den
    // gemeinsamen Jahresbetrag. Nachgewiesene Aufwendungen kaemen hinzu, die
    // kennen wir nicht und rechnen sie deshalb nicht mit.
    const altJahr = n.ersatzpflegeDurchAngehoerige
      ? BETRAEGE_2026.pflegegeld[i] * 2
      : BETRAEGE_2026.ersatzpflegeJahr[i];
    posten.push({
      name: "Ersatzpflege, künftig Überbrückungsbudget",
      alt: altJahr / 12,
      neu: BETRAEGE_2027.ueberbrueckungJahr[i] / 12,
      hinweis: n.ersatzpflegeDurchAngehoerige
        ? "heute das Pflegegeld für zwei Monate, künftig nicht mehr für Angehörige"
        : "Jahresbetrag auf den Monat gerechnet, künftig nur Notdienst oder Kurzzeitpflege",
    });
  }

  const summeAlt = posten.reduce((s, p) => s + p.alt, 0);
  const summeNeu = posten.reduce((s, p) => s + p.neu, 0);
  return {
    posten,
    summeAlt: Math.round(summeAlt * 100) / 100,
    summeNeu: Math.round(summeNeu * 100) / 100,
    differenz: Math.round((summeNeu - summeAlt) * 100) / 100,
  };
}

export function euro(n: number): string {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: n % 1 === 0 ? 0 : 2 });
}

export function punkte(n: number): string {
  return n.toLocaleString("de-DE", { maximumFractionDigits: 2 });
}
