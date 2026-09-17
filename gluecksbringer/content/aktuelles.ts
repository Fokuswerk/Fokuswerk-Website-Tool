import type { StaticImageData } from "next/image";
import { bilder } from "./bilder";

/**
 * Beiträge für den Bereich "Aktuelles".
 *
 * Neuen Beitrag anlegen:
 *   – Objekt oben in das Array `beitraege` einfügen (neueste zuerst)
 *   – `slug` ist die Adresse: /aktuelles/<slug>, nur Kleinbuchstaben und Bindestriche
 *   – `datum` im Format JJJJ-MM-TT, `datumLabel` ist die sichtbare Angabe
 *   – Bild vorher in `content/bilder.ts` eintragen
 *
 * Bitte nur Inhalte aufnehmen, die tatsächlich stattgefunden haben,
 * und Termine, Preise und Kontodaten genau prüfen.
 */

export type Block =
  | { typ: "absatz"; text: string }
  | { typ: "ueberschrift"; text: string }
  | { typ: "liste"; punkte: string[] }
  | { typ: "schritte"; eintraege: { zeit: string; text: string }[] }
  | { typ: "hinweis"; text: string }
  | { typ: "spendenkonto"; verwendungszweck?: string }
  | { typ: "bild"; bild: StaticImageData; alt: string; unterschrift?: string };

export type Beitrag = {
  slug: string;
  titel: string;
  kategorie: string;
  datum: string;
  datumLabel: string;
  teaser: string;
  bild: StaticImageData;
  bildAlt: string;
  /** Hochformat-Bilder werden in Karten anders beschnitten. */
  bildPosition?: string;
  inhalt: Block[];
};

export const beitraege: Beitrag[] = [
  {
    slug: "wunschbaum-am-meer-2025",
    titel: "Mach mit! Der 15. Wunschbaum am Meer",
    kategorie: "Wunschbaum",
    datum: "2025-11-17",
    datumLabel: "November 2025",
    teaser:
      "Kinderwünsche, die sonst offen bleiben würden: Vom 17. November bis 1. Dezember 2025 hingen die Wunschkarten in der Bibliothek am Meer – und zum ersten Mal auch am digitalen Wunschbaum.",
    bild: bilder.wunschbaum2025Vorbereitung,
    bildAlt:
      "Zwei Ehrenamtliche der Glücksbringer am Meer bereiten an einem Tisch die Wunschkarten für den Wunschbaum vor.",
    inhalt: [
      {
        typ: "absatz",
        text: "Wir möchten auch dieses Jahr wieder den Familien in unserer Gemeinde helfen, denen es schwer fällt, die Weihnachtswünsche ihrer Kinder zu erfüllen.",
      },
      {
        typ: "absatz",
        text: "Die bedürftigen Familien werden von der Gemeindeverwaltung angeschrieben. Die Kinder können dann einen Weihnachtswunsch bis max. 25 € einreichen, der in Form einer Wunschkarte an einen Weihnachtsbaum gehängt wird.",
      },
      {
        typ: "bild",
        bild: bilder.wunschbaum2025Plakat,
        alt: "Plakat zum 15. Wunschbaum am Meer 2025 mit der Aufschrift „Mach mit!“, allen Terminen und dem Maskottchen Puck in einer Weihnachtskugel.",
        unterschrift: "Das Plakat zum 15. Wunschbaum am Meer.",
      },
      { typ: "ueberschrift", text: "So können Sie helfen" },
      {
        typ: "schritte",
        eintraege: [
          {
            zeit: "17. November – 01. Dezember 2025",
            text: "Sie pflücken einen Weihnachtswunsch von unserem Weihnachtsbaum, der in der Bibliothek am Meer im alten Kurhaus, Auf dem hohen Ufer 20 in Bad Zwischenahn steht, oder virtuell, indem Sie auf den Weihnachtsbaum klicken.",
          },
          {
            zeit: "Bis 06. Dezember 2025",
            text: "Sie geben Ihr verpacktes Geschenk in der Bibliothek am Meer ab. Öffnungszeiten Di Do Fr 14–18 Uhr / Sa 10–14 Uhr.",
          },
        ],
      },
      {
        typ: "absatz",
        text: "Die Geschenke werden von uns rechtzeitig vor dem Weihnachtsfest an die Familien überreicht.",
      },
      {
        typ: "hinweis",
        text: "Nicht abgepflückte Wünsche können wir nur mit Hilfe von Spenden erfüllen.",
      },
      { typ: "spendenkonto", verwendungszweck: "Wunschbaum am Meer" },
    ],
  },
  {
    slug: "unser-wunschbaum-steht",
    titel: "Heute war es endlich soweit: Unser Wunschbaum steht",
    kategorie: "Aus dem Verein",
    datum: "2025-11-15",
    datumLabel: "15. November 2025",
    teaser:
      "Aufgestellt, liebevoll geschmückt und mit vielen Wunschkarten bestückt – und gespendet hat den Baum in diesem Jahr die Weinbar in Bad Zwischenahn.",
    bild: bilder.wunschbaum2025Team,
    bildAlt:
      "Das Team der Glücksbringer am Meer steht mit verpackten Geschenken vor dem geschmückten Wunschbaum.",
    inhalt: [
      {
        typ: "absatz",
        text: "Heute war es endlich soweit! Unser Wunschbaum wurde aufgestellt, liebevoll geschmückt und mit vielen Wunschkarten bestückt.",
      },
      {
        typ: "absatz",
        text: "Ab Montag, 17. November, heißt es dann wieder: Wünsche pflücken, Freude schenken! Schnappen Sie sich eine Karte, erfüllen Sie einem Kind einen Herzenswunsch – und zaubern Sie den Kindern ein strahlendes Lächeln zu Weihnachten ins Gesicht.",
      },
      {
        typ: "bild",
        bild: bilder.wunschbaum2025Wunschkarten,
        alt: "Zwei Ehrenamtliche hängen Wunschkarten an den beleuchteten Weihnachtsbaum.",
        unterschrift: "Jede Karte steht für den Wunsch eines Kindes.",
      },
      {
        typ: "absatz",
        text: "Oder Sie pflücken sich eine Wunschkarte von unserem digitalen Wunschbaum www.wunschbaum-bz.de. Wir freuen uns auf Ihre Unterstützung!",
      },
      {
        typ: "absatz",
        text: "Einen Dank auch an Jackelin Cordes von der Weinbar in Bad Zwischenahn, die uns dieses Jahr den Baum gespendet hat.",
      },
    ],
  },
  {
    slug: "puck-stellt-sich-vor",
    titel: "Puck stellt sich vor",
    kategorie: "Aus dem Verein",
    datum: "2025-10-04",
    datumLabel: "Oktober 2025",
    teaser:
      "Unsere Webseite bekommt einen neuen Auftritt – und unser Maskottchen tritt dabei aus der Weihnachtskugel heraus.",
    bild: bilder.wunschbaum2025Banner,
    bildAlt:
      "Banner „Mach mit! 15. Wunschbaum am Meer“ mit dem Maskottchen Puck in einer Weihnachtskugel.",
    inhalt: [
      {
        typ: "absatz",
        text: "Unsere Webseite bekommt einen neuen Auftritt. Puck, unser Maskottchen, stellt sich vor.",
      },
      {
        typ: "absatz",
        text: "Puck begleitet den Wunschbaum am Meer seit vielen Jahren: als kleine Figur auf jeder Wunschkarte, auf den Plakaten und auf unserem allerersten Weihnachtslogo.",
      },
      {
        typ: "bild",
        bild: bilder.g2011Weihnachtslogo,
        alt: "Das erste Weihnachtslogo des Vereins: eine gezeichnete Christbaumkugel mit Puck und einem Geschenk.",
        unterschrift: "Unser erstes Weihnachtslogo aus dem Jahr 2011.",
      },
    ],
  },
];

export const beitraegeSortiert = [...beitraege].sort((a, b) =>
  b.datum.localeCompare(a.datum),
);

export function beitragNachSlug(slug: string): Beitrag | undefined {
  return beitraege.find((beitrag) => beitrag.slug === slug);
}
