import type { StaticImageData } from "next/image";
import { bilder } from "./bilder";

/**
 * Die Galerie, nach Jahren gruppiert.
 *
 * Die Bildunterschriften stammen – wo vorhanden – wörtlich von der
 * bisherigen Website. Die Jahre ergeben sich aus den Dateinamen und
 * Aufnahmedaten der Originalbilder.
 *
 * Neues Jahr ergänzen: Bilder in `content/bilder.ts` eintragen und hier
 * einen neuen Abschnitt oben anfügen.
 */

export type GalerieBild = {
  bild: StaticImageData;
  /** Sichtbare Bildunterschrift, falls vorhanden. */
  unterschrift?: string;
  /** Beschreibung für Screenreader und Suchmaschinen. */
  alt: string;
};

export type GalerieJahr = {
  jahr: string;
  einleitung?: string;
  bilder: GalerieBild[];
};

export const galerie: GalerieJahr[] = [
  {
    jahr: "2025",
    einleitung: "Der 15. Wunschbaum am Meer in der Bibliothek am Meer.",
    bilder: [
      {
        bild: bilder.wunschbaum2025Team,
        unterschrift: "Der Wunschbaum steht – und die ersten Geschenke auch.",
        alt: "Sechs Ehrenamtliche der Glücksbringer am Meer stehen mit verpackten Geschenken vor dem geschmückten Wunschbaum.",
      },
      {
        bild: bilder.wunschbaum2025Wunschkarten,
        unterschrift: "Jede Karte steht für den Wunsch eines Kindes.",
        alt: "Zwei Ehrenamtliche hängen beschriftete Wunschkarten an den beleuchteten Weihnachtsbaum.",
      },
      {
        bild: bilder.wunschbaum2025Vorbereitung,
        unterschrift: "Vorbereitung: Wunschkarten beschriften und binden.",
        alt: "Zwei Ehrenamtliche sitzen an einem Tisch und bereiten Wunschkarten vor.",
      },
      {
        bild: bilder.wunschbaum2025Plakat,
        unterschrift: "Mach mit! Das Plakat zum 15. Wunschbaum am Meer.",
        alt: "Grünes Plakat zum 15. Wunschbaum am Meer 2025 mit allen Terminen.",
      },
    ],
  },
  {
    jahr: "2024",
    bilder: [
      {
        bild: bilder.geschenkuebergabe2024,
        unterschrift: "Die gesammelten Geschenke vor der Übergabe.",
        alt: "Fünf Ehrenamtliche stehen hinter einem Tisch voller verpackter Weihnachtsgeschenke.",
      },
    ],
  },
  {
    jahr: "2016 / 2017",
    bilder: [
      {
        bild: bilder.g2017Geschenke,
        alt: "Ein Raum voller verpackter Geschenke, gestapelt in Kartons.",
      },
    ],
  },
  {
    jahr: "2015",
    bilder: [
      {
        bild: bilder.g2015Wunschbaum,
        unterschrift: "Der Wunschbaum am Meer mit Plakat und Wunschkarten.",
        alt: "Weihnachtsbaum voller Wunschkarten neben einer Staffelei mit dem Wunschbaum-Plakat.",
      },
    ],
  },
  {
    jahr: "2014",
    bilder: [
      {
        bild: bilder.g2014Schwimmkurs,
        unterschrift: "Der Schwimmkurs 2014.",
        alt: "Kinder und Betreuerinnen im Schwimmbecken während des Schwimmkurses.",
      },
      {
        bild: bilder.g2014SchwimmkursUrkunde,
        unterschrift: "jeder Schwimmkursteilnehmer erhielt eine Urkunde",
        alt: "Ein Kind hält stolz seine Schwimmurkunde in die Kamera.",
      },
      {
        bild: bilder.g2014Kuerbisfest1,
        unterschrift: "Kürbisfest 2014",
        alt: "Ehrenamtliche der Glücksbringer am Meer beim Kürbisfest 2014.",
      },
      {
        bild: bilder.g2014Kuerbisfest2,
        unterschrift: "Wir konnten den Verein vielen Menschen näher bringen",
        alt: "Besucherinnen und Besucher am Stand des Vereins beim Kürbisfest.",
      },
      {
        bild: bilder.g2014Kuerbisfest3,
        alt: "Weitere Eindrücke vom Kürbisfest 2014.",
      },
    ],
  },
  {
    jahr: "2013",
    bilder: [
      {
        bild: bilder.g2013SchwimmkursUrkunden,
        unterschrift: "Der Schwimmkurs 2013 …",
        alt: "Urkundenübergabe am Beckenrand nach dem Schwimmkurs 2013.",
      },
      {
        bild: bilder.g2013Schwimmkurs,
        unterschrift: "… brachte viel Freude …",
        alt: "Kinder im Schwimmbecken während des Schwimmkurses 2013.",
      },
      {
        bild: bilder.g2013SchwimmkursStolz,
        unterschrift: "… und Stolz.",
        alt: "Kinder und Betreuerinnen am Beckenrand nach dem Schwimmkurs.",
      },
      {
        bild: bilder.g2013Wunschbaum,
        unterschrift: "Der Wunschbaum in diesem Jahr …",
        alt: "Der Wunschbaum am Meer im Jahr 2013, behängt mit Wunschkarten.",
      },
      {
        bild: bilder.g2013WunschbaumKinder,
        unterschrift:
          "… wurde wieder mit Unterstützung vieler Kinder geschmückt",
        alt: "Kinder und Ehrenamtliche stehen vor dem geschmückten Wunschbaum 2013.",
      },
    ],
  },
  {
    jahr: "2012",
    bilder: [
      {
        bild: bilder.g2012RuegenwalderCup,
        unterschrift: "beim Rügenwalder Cup",
        alt: "Die Glücksbringer am Meer beim Rügenwalder Cup 2012.",
      },
      {
        bild: bilder.g2012Vereinsmitglieder,
        unterschrift: "die Vereinsmitglieder",
        alt: "Gruppenfoto der Vereinsmitglieder der Glücksbringer am Meer 2012.",
      },
      {
        bild: bilder.g2012Geschenke,
        unterschrift: "Wunschbaumgeschenke 2012",
        alt: "Gestapelte, bunt verpackte Wunschbaumgeschenke aus dem Jahr 2012.",
      },
      {
        bild: bilder.g2012Vorsitzende,
        unterschrift: "unsere „Chefs“",
        alt: "Zwei Vereinsvorsitzende sitzen lachend an einem Tisch mit Wunschkarten.",
      },
    ],
  },
  {
    jahr: "2011",
    einleitung: "Das erste Jahr – so fing alles an.",
    bilder: [
      {
        bild: bilder.g2011SoFingAllesAn,
        unterschrift: "so fing alles an",
        alt: "Ein Raum voller verpackter Geschenke beim ersten Wunschbaum 2011.",
      },
      {
        bild: bilder.g2011BaumAufstellen,
        unterschrift: "der erste Wunschbaum wird aufgestellt",
        alt: "Der erste Wunschbaum am Meer wird aufgestellt.",
      },
      {
        bild: bilder.g2011BaumGeschmueckt,
        unterschrift: "… und ist geschmückt",
        alt: "Der erste Wunschbaum am Meer, fertig geschmückt und mit Wunschkarten behängt.",
      },
      {
        bild: bilder.g2011ErsteGeschenke,
        unterschrift: "die ersten Geschenke",
        alt: "Eine Ehrenamtliche sortiert die ersten Wunschbaumgeschenke auf langen Tischen.",
      },
      {
        bild: bilder.g2011Geschenkausgabe,
        unterschrift: "noch mehr Geschenke – toll!!",
        alt: "Tische voller verpackter Geschenke bei der Geschenkausgabe 2011.",
      },
      {
        bild: bilder.g2011GrosseFreude,
        unterschrift: "Freude nicht nur bei den Kindern …",
        alt: "Eine Ehrenamtliche freut sich zwischen den fertig gepackten Geschenken.",
      },
      {
        bild: bilder.g2011VieleGeschenke,
        unterschrift: "… sondern auch bei uns",
        alt: "Sehr viele verpackte Geschenke beim ersten Wunschbaum am Meer.",
      },
      {
        bild: bilder.g2011Weihnachtslogo,
        unterschrift: "unser erstes Weihnachtslogo",
        alt: "Das erste Weihnachtslogo: eine gezeichnete Christbaumkugel mit dem Maskottchen Puck.",
      },
    ],
  },
];

export const galerieBilderGesamt = galerie.reduce(
  (summe, jahr) => summe + jahr.bilder.length,
  0,
);
