/**
 * Geldwege. Jeder Vorschlag haengt an einem gemessenen Befund aus dem Rechner,
 * nicht am Zufall. "wert" ist der interne Erloes je Anfrage und wird nie angezeigt.
 *
 * ANNAHMEN zu Marktwerten, nicht belegt, vor der ersten Abrechnung zu pruefen:
 *  - Treppenlift: 40 bis 60 Euro je validem Lead
 *  - Hausnotruf: um 130 Euro je Abschluss
 *  - Umbau und Vergleichsportale: rund 30 Prozent Umsatzanteil
 *  - 24-Stunden-Betreuung: Einzelvereinbarung, deutlich darueber
 * Es liegt noch kein Partnervertrag vor. Diese Zahlen steuern nur die interne
 * Reihenfolge und duerfen nirgends angezeigt oder zugesagt werden.
 */

import type { ModulId } from "./nba.ts";

export type Angebot = {
  id: string;
  titel: string;
  /** Warum gerade dieser Haushalt das braucht */
  grund: string;
  /** Was die Pflegekasse dazu beitraegt */
  kasse: string;
  wert: number;
  bezahlt: boolean;
};

export const ANGEBOTE: Record<ModulId, Angebot[]> = {
  1: [
    {
      id: "treppenlift",
      titel: "Treppenlift oder Rampe",
      grund: "Die Bewertung zeigt Einschränkungen beim Treppensteigen und beim Fortbewegen.",
      kasse: "Die Pflegekasse kann im Einzelfall einen Zuschuss für wohnumfeldverbessernde Maßnahmen gewähren, je Maßnahme bis 4.180 Euro (§ 40 Abs. 4 SGB XI).",
      wert: 55,
      bezahlt: true,
    },
    {
      id: "badumbau",
      titel: "Barrierefreies Bad",
      grund: "Wer sich schwer fortbewegt, stürzt am häufigsten im Bad.",
      kasse: "Derselbe Zuschuss, bei einer erneuten Maßnahme erneut möglich – ebenfalls als Kann-Leistung im Einzelfall.",
      wert: 60,
      bezahlt: true,
    },
  ],
  2: [
    {
      id: "betreuung24",
      titel: "Betreuung im Haushalt",
      grund: "Bei nachlassender Orientierung bleibt ein Haushalt selten allein tragfähig.",
      kasse: "Pflegegeld und ab 2027 das Sozialraumbudget können angerechnet werden.",
      wert: 180,
      bezahlt: true,
    },
    {
      id: "tagespflege",
      titel: "Tagespflege in der Nähe",
      grund: "Entlastet die Pflegeperson tagsüber und hält Struktur im Tagesablauf.",
      kasse: "Eigener Anspruch je Pflegegrad, zusätzlich zum Pflegegeld.",
      wert: 45,
      bezahlt: false,
    },
  ],
  3: [
    {
      id: "betreuung24",
      titel: "Betreuung im Haushalt",
      grund: "Verhaltensauffälligkeiten und nächtliche Unruhe überlasten Angehörige zuerst.",
      kasse: "Pflegegeld und ab 2027 das Sozialraumbudget können angerechnet werden.",
      wert: 180,
      bezahlt: true,
    },
  ],
  4: [
    {
      id: "pflegedienst",
      titel: "Ambulanter Pflegedienst",
      grund: "Bei der Selbstversorgung liegt der größte Teil des Hilfebedarfs.",
      kasse: "Sachleistungsbudget, ab 2027 bis 2.530 Euro im Monat.",
      wert: 70,
      bezahlt: true,
    },
    {
      id: "pflegebett",
      titel: "Pflegebett und technische Hilfsmittel",
      grund: "Waschen, Ankleiden und Umsetzen werden mit dem richtigen Bett leichter.",
      kasse: "Technische Pflegehilfsmittel werden voll übernommen, Zuzahlung höchstens 25 Euro.",
      wert: 40,
      bezahlt: true,
    },
  ],
  5: [
    {
      id: "hausnotruf",
      titel: "Hausnotruf",
      grund: "Mehrere medizinische Maßnahmen am Tag bedeuten ein höheres Risiko allein zu Hause.",
      kasse: "Als technisches Pflegehilfsmittel von der Pflegekasse getragen.",
      wert: 130,
      bezahlt: true,
    },
  ],
  6: [
    {
      id: "alltagsbegleitung",
      titel: "Alltagsbegleitung",
      grund: "Beschäftigung und Kontakte lassen nach, das ist der klassische Einsatzbereich.",
      kasse: "Entlastungsbetrag 131 Euro, ab 2027 Sozialraumbudget 175 Euro im Monat.",
      wert: 50,
      bezahlt: true,
    },
  ],
};

export function angeboteFuer(modul: ModulId): Angebot[] {
  return ANGEBOTE[modul] ?? [];
}
