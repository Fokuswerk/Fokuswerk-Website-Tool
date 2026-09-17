import type { StaticImageData } from "next/image";
import { bilder } from "./bilder";

/**
 * Die Projekte des Vereins.
 *
 * Grundlage: die Aufzählung auf der bisherigen Über-uns-Seite
 * ("Wunschbaum am Meer", "Grundausstattung zur Einschulung",
 * "Sommerglücksgutscheine", "Individuelle Hilfen für Kinder in Not").
 * Die Beschreibungen geben nur wieder, was dort bzw. auf der Seite
 * "Aktuelles" beschrieben ist – bitte beim Ergänzen genauso verfahren.
 */

export type Projekt = {
  slug: string;
  titel: string;
  kurz: string;
  beschreibung: string;
  bild?: StaticImageData;
  bildAlt?: string;
};

export const projekte: Projekt[] = [
  {
    slug: "wunschbaum-am-meer",
    titel: "Wunschbaum am Meer",
    kurz: "Weihnachtswünsche, die sonst offen bleiben würden.",
    beschreibung:
      "Unser größtes Projekt: Kinder aus Familien, denen es schwerfällt, Weihnachtswünsche zu erfüllen, schreiben ihren Wunsch auf eine Karte. Die Karten hängen an einem Weihnachtsbaum – wer mag, pflückt eine davon und macht ein Kind glücklich.",
    bild: bilder.wunschbaum2025Wunschkarten,
    bildAlt:
      "Zwei Ehrenamtliche hängen beschriftete Wunschkarten an den geschmückten Weihnachtsbaum.",
  },
  {
    slug: "grundausstattung-einschulung",
    titel: "Grundausstattung zur Einschulung",
    kurz: "Damit der erste Schultag ein guter Tag wird.",
    beschreibung:
      "Ein Schulranzen, Hefte, Stifte: Zum Schulstart kommt einiges zusammen. Wir helfen Familien in unserer Gemeinde dabei, ihre Kinder gut ausgestattet in die erste Klasse zu schicken.",
  },
  {
    slug: "sommerglücksgutscheine",
    titel: "Sommerglücksgutscheine",
    kurz: "Ferien, die in Erinnerung bleiben.",
    beschreibung:
      "Mit den Sommerglücksgutscheinen ermöglichen wir Kindern Erlebnisse in den Sommerferien – etwas, das sonst am Geld scheitern würde.",
  },
  {
    slug: "individuelle-hilfen",
    titel: "Individuelle Hilfen für Kinder in Not",
    kurz: "Wenn es schnell und unbürokratisch gehen muss.",
    beschreibung:
      "Nicht jede Not passt in ein Projekt. Deshalb helfen wir auch im Einzelfall – dort, wo ein Kind kurzfristig Unterstützung braucht.",
  },
];

/**
 * Meilensteine für die Zeitleiste auf der Über-uns-Seite.
 * Jeder Eintrag ist durch Texte oder Bildunterschriften der bisherigen
 * Website belegt. Bitte keine Jahreszahlen ergänzen, die dort nicht stehen.
 */
export type Meilenstein = {
  jahr: string;
  titel: string;
  text: string;
  bild?: StaticImageData;
  bildAlt?: string;
};

export const meilensteine: Meilenstein[] = [
  {
    jahr: "2011",
    titel: "Sechs Mütter, ein Baum",
    text: "Der Verein entsteht aus einer Initiative von sechs Müttern, die den ersten „Wunschbaum am Meer“ ins Leben rufen. Schon im ersten Jahr kommen so viele Geschenke zusammen, dass die Tische kaum reichen.",
    bild: bilder.g2011BaumGeschmueckt,
    bildAlt: "Der erste geschmückte Wunschbaum am Meer im Jahr 2011.",
  },
  {
    jahr: "2012",
    titel: "Aus der Idee wird ein Verein",
    text: "Das Team wächst, der Wunschbaum wird zur festen Größe in Bad Zwischenahn – und die Glücksbringer zeigen sich auch außerhalb der Weihnachtszeit, zum Beispiel beim Rügenwalder Cup.",
    bild: bilder.g2012Vereinsmitglieder,
    bildAlt: "Die Vereinsmitglieder der Glücksbringer am Meer im Jahr 2012.",
  },
  {
    jahr: "2013 – 2014",
    titel: "Schwimmkurse und Kürbisfest",
    text: "Neben dem Wunschbaum entstehen weitere Aktionen: Schwimmkurse, bei denen jedes Kind am Ende eine Urkunde in den Händen hält, und ein Kürbisfest, bei dem viele Menschen den Verein kennenlernen.",
    bild: bilder.g2013SchwimmkursUrkunden,
    bildAlt: "Urkundenübergabe nach dem Schwimmkurs 2013 am Beckenrand.",
  },
  {
    jahr: "2025",
    titel: "Der 15. Wunschbaum am Meer",
    text: "Der Wunschbaum steht in der Bibliothek am Meer – und zusätzlich digital unter wunschbaum-bz.de. Den Baum spendet in diesem Jahr Jackelin Cordes von der Weinbar in Bad Zwischenahn.",
    bild: bilder.wunschbaum2025Team,
    bildAlt:
      "Das Team der Glücksbringer am Meer mit verpackten Geschenken vor dem Wunschbaum 2025.",
  },
];

/**
 * Wer den Verein unterstützt – ausschließlich das, was auf der bisherigen
 * Website konkret genannt wird.
 */
export const unterstuetzer = [
  {
    name: "Gemeinde Bad Zwischenahn",
    rolle:
      "Die Gemeindeverwaltung schreibt die Familien an, deren Kinder einen Wunsch einreichen können.",
    href: null,
  },
  {
    name: "Bibliothek am Meer",
    rolle:
      "Im alten Kurhaus steht der Wunschbaum – hier werden Wünsche gepflückt und Geschenke abgegeben.",
    href: null,
  },
  {
    name: "Weinbar Bad Zwischenahn",
    rolle:
      "Jackelin Cordes hat den Weihnachtsbaum für den 15. Wunschbaum am Meer gespendet.",
    href: "http://www.weinbar-zwischenahn.de/",
  },
];
