/**
 * Fallstudien.
 *
 * Eine weitere Fallstudie ist ein weiterer Eintrag in diesem Array — Übersicht
 * und Detailseite entstehen daraus automatisch. Regel: Jede Zahl muss aus einem
 * Werbekonto, einer Rechnung oder einem Vertrag belegbar sein. Zitate nur mit
 * schriftlicher Freigabe des Betriebs.
 */

export interface Kennzahl {
  wert: string;
  label: string;
  hinweis?: string;
}

export interface Block {
  kopf: string;
  text: string;
}

export interface Fallstudie {
  slug: string;
  betrieb: string;
  branche: string;
  ort: string;
  leistung: string[];
  /** Anriss für Übersicht und Startseite. Ein Satz, konkret. */
  kurz: string;
  /** Titelzeilen der Detailseite, Umbrüche bewusst gesetzt. */
  titel: string[];
  /** Die vier Zahlen, die auf Übersichten erscheinen. */
  kennzahlen: Kennzahl[];
  ausgangslage: string[];
  problem: Block[];
  vorgehen: Block[];
  ergebnis: Kennzahl[];
  ergebnisText: string[];
  seitdem?: { kopf: string; text: string };
  learnings: Block[];
  belegsatz: string;
  /** Freigegebenes Zitat. Fehlt, solange keine schriftliche Freigabe vorliegt. */
  zitat?: { text: string; person: string };
  bild: string;
}

export const fallstudien: Fallstudie[] = [
  {
    slug: 'wav-westerstede',
    betrieb: 'WAV Westerstede',
    branche: 'Freie Kfz-Werkstatt',
    ort: 'Westerstede, Ammerland',
    leistung: ['Drehtag im Betrieb', 'Bewerberkampagne Meta', 'Karriereseite', 'Google Ads für Neukunden'],
    kurz:
      'Neun Monate erfolglose Suche, dann ein Drehtag, drei getestete Kampagnenvarianten — und nach vierzehn Tagen ein unterschriebener Vertrag mit einem Kfz-Mechatroniker.',
    titel: ['550 € Werbebudget.', 'Ein Mechatroniker', 'nach 14 Tagen.'],
    kennzahlen: [
      { wert: '550,27 €', label: 'Werbebudget' },
      { wert: '68', label: 'Bewerbungen' },
      { wert: '25–30', label: 'fachlich brauchbar' },
      { wert: '14 Tage', label: 'bis zur Unterschrift' },
    ],
    ausgangslage: [
      'Alexander Lüers führt eine freie Kfz-Werkstatt in Westerstede. Er suchte seit neun Monaten einen Kfz-Mechatroniker: Anzeige bei einem Jobportal, Aushang im Schaufenster, Nachfragen bei der Innung.',
      'Im ganzen Jahr kamen vier Bewerbungen, keine passte. Zwei Hebebühnen liefen deshalb nur halbtags, und Termine vergab er drei Wochen im Voraus.',
      'Das ist kein Betriebsproblem. Es ist ein Strukturproblem — und es sieht in jeder zweiten Werkstatt der Region genauso aus.',
    ],
    problem: [
      {
        kopf: 'Die Stellenanzeige wartet',
        text: 'Ein Portal erreicht nur, wer aktiv sucht. Der gute Mechatroniker sucht nicht — er hat einen Job. Erreichbar ist er nur dort, wo er ohnehin schon ist.',
      },
      {
        kopf: 'Bewerben ist zu umständlich',
        text: 'Lebenslauf, Anschreiben, PDF am Rechner. Abends auf dem Sofa macht das niemand. Jede zusätzliche Hürde kostet den größten Teil der Interessenten.',
      },
      {
        kopf: 'Anfangen ist leicht, dranbleiben nicht',
        text: 'In der Region schaltet kaum ein Betrieb etwas, das man ernsthaft eine Kampagne nennen könnte. Nicht, weil sie es nicht wollen — sondern weil es im Tagesgeschäft niemand macht.',
      },
    ],
    vorgehen: [
      {
        kopf: 'Ein Drehtag im Betrieb',
        text: 'Keine Models, keine Studiobilder — seine eigenen Leute an den eigenen Hebebühnen. Wer sich bewirbt, soll vorher sehen, wo er landet.',
      },
      {
        kopf: 'Drei Kampagnenvarianten gleichzeitig',
        text: 'Bewerbung direkt in der App, Bewerbung über eine eigene Seite, Bewerbung über die Website. Wir wussten vorher nicht, was bei einer Werkstatt funktioniert — also haben wir es nicht geraten, sondern gemessen.',
      },
      {
        kopf: 'Nach zehn Tagen war es eindeutig',
        text: 'Die eine Variante kostete 4,92 € pro Bewerbung, die andere 218 €. Wir haben die teure abgeschaltet und das Budget umgelegt.',
      },
      {
        kopf: 'Bewerbung in unter 60 Sekunden',
        text: 'Ohne Lebenslauf, ohne Anschreiben, direkt vom Handy. Und jede Bewerbung ging sofort auf sein Telefon, nicht drei Tage später ins Postfach.',
      },
    ],
    ergebnis: [
      { wert: '550,27 €', label: 'Werbebudget insgesamt' },
      { wert: '68', label: 'Bewerbungen' },
      { wert: '25–30', label: 'davon fachlich brauchbar' },
      { wert: '14 Tage', label: 'bis zum unterschriebenen Vertrag' },
    ],
    ergebnisText: [
      'Der Mechatroniker arbeitet heute noch dort.',
    ],
    seitdem: {
      kopf: 'Und seitdem',
      text: 'Für die Kundenseite läuft parallel Google Ads. Rund 120 Anfragen in zweieinhalb Monaten — etwa 48 im Monat, also zwei an jedem Werktag. Die Kampagne läuft weiter.',
    },
    learnings: [
      {
        kopf: 'Der Unterschied zwischen 4,92 € und 218 € ist keine Kleinigkeit',
        text: 'Bei gleichem Budget sind das 44 Bewerbungen statt einer. Wir haben dieses Lehrgeld einmal bezahlt. Beim nächsten Betrieb läuft die teure Variante gar nicht erst an.',
      },
      {
        kopf: 'Die Antwortzeit entscheidet mit',
        text: 'Eine Bewerbung, die zwei Tage liegen bleibt, ist meistens weg. Deshalb steht die Antwortzeit von zwei Tagen inzwischen im Vertrag — als Pflicht des Betriebs, nicht als Empfehlung.',
      },
      {
        kopf: 'Das Material trägt zweimal',
        text: 'Aus demselben Drehtag entstand auch das Material für die Kundenseite. Der zweite Nutzen kostet fast nichts — das ist der Grund, warum aus einer Bewerberkampagne ein Gesamtsystem wurde.',
      },
    ],
    belegsatz:
      'Alle Zahlen stammen aus den Werbekonten. Alexander Lüers ist als Referenz freigegeben — wenn Sie mit ihm sprechen möchten, geben wir Ihnen seine Nummer.',
    bild: 'hebebuehne-dreh',
  },
];

export const nachSlug = (slug: string) => fallstudien.find((f) => f.slug === slug);
