/**
 * Die Leistungen sind nach der Aufgabe des Kunden geschnitten,
 * nicht nach den Gewerken des Betriebs.
 */

export type Leistung = {
  weg: string;
  marke: string;          // Versal-Label
  titel: string;          // wie der Kunde die Aufgabe nennt
  gewerk: string;         // wie der Betrieb sie nennt
  anriss: string;
  bild: string;
  alt: string;
};

export const leistungen: Leistung[] = [
  {
    weg: "/leistungen/badsanierung",
    marke: "Bad",
    titel: "Das Bad komplett erneuern",
    gewerk: "Badsanierung, Badplanung, seniorengerechter Umbau",
    anriss:
      "Ein Bad zu erneuern heißt: Fliesenleger, Elektriker, Maurer, Maler und Sanitär müssen in der richtigen Reihenfolge durch dieselbe Tür. Brouwer plant die Reihenfolge und koordiniert die anderen Gewerke mit.",
    bild: "bad-01.webp",
    alt: "Fertiggestelltes Badezimmer mit Aufsatzwaschbecken, Holzunterschrank und Rundspiegel",
  },
  {
    weg: "/leistungen/heizung",
    marke: "Heizung",
    titel: "Die Heizung erneuern",
    gewerk: "Heizungsbau, Modernisierung, Wärmeerzeuger",
    anriss:
      "Die alte Anlage läuft noch — aber wie lange, und was kommt danach? Vor der Technik steht die Rechnung: Brouwer ermittelt den tatsächlichen Wärmebedarf des Gebäudes und legt die Anlage danach aus.",
    bild: "a-heizgeraet.webp",
    alt: "Wandhängendes Heizgerät und Heizkörper im Ausstellungsraum",
  },
  {
    weg: "/leistungen/energie",
    marke: "Energie",
    titel: "Wärme aus der Sonne holen",
    gewerk: "Solarthermie, regenerative Wärmeerzeugung, Förderberatung",
    anriss:
      "Solarthermie erwärmt Brauchwasser und unterstützt die Heizung. Wir sagen Ihnen, was Ihr Dach hergibt, welche Kollektorbauart dazu passt — und welche Förderung dafür in Frage kommt.",
    bild: "solardach.webp",
    alt: "Wohnhaus mit Solarkollektoren auf dem Dach",
  },
  {
    weg: "/leistungen/pool-wellness",
    marke: "Pool & Wellness",
    titel: "Den Pool planen und am Laufen halten",
    gewerk: "Schwimmbadbau, Poolsanierung, Dampfdusche, Whirlpool",
    anriss:
      "Hinter einer ruhigen Wasserfläche arbeiten Pumpe, Filter, Wärmetauscher und Wasseraufbereitung dauerhaft zusammen. Beheizt wird ein Pool von denselben Leuten, die seit Jahrzehnten Heizungen bauen.",
    bild: "a-duesen.webp",
    alt: "Massagedüsen im Beckenrand eines Whirlpools in Nahaufnahme",
  },
  {
    weg: "/leistungen/kundendienst",
    marke: "Kundendienst",
    titel: "Warten, reparieren, im Notfall kommen",
    gewerk: "Wartung, Störungsbeseitigung, 24-Stunden-Heizungsnotdienst",
    anriss:
      "Nach dem Einbau bleibt derselbe Betrieb zuständig. Regelmäßige Wartung hält die Anlage in Betrieb — und wenn die Heizung am Wochenende ausfällt, gibt es einen Notdienst rund um die Uhr.",
    bild: "kreuzgriff.webp",
    alt: "Verchromter Kreuzgriff einer Armatur in Nahaufnahme",
  },
];

/** Der reale Ablauf einer Badsanierung — aus der Beschreibung der alten Website. */
export const badAblauf = [
  { nr: "01", titel: "Beratung", text: "Ein erstes Gespräch in der Ausstellung. Sie sehen Oberflächen, Armaturen und Möbel in echter Größe statt auf einem Bildschirm." },
  { nr: "02", titel: "Planung", text: "Wir nehmen auf, was der Raum hergibt, und planen Ihr Bad. Auf Wunsch gehen Sie mit der 3D-Brille durch den Entwurf, bevor eine Fliese fällt." },
  { nr: "03", titel: "Angebot", text: "Sie bekommen einen Festpreis und einen Fixtermin — nicht eine Position je Gewerk, sondern das Bad." },
  { nr: "04", titel: "Koordination", text: "Maurer, Fliesenleger, Elektriker, Maler und Innenausbau werden nach Plan bestellt. Sie rufen niemanden selbst an." },
  { nr: "05", titel: "Ausführung", text: "Installation und Montage übernimmt Brouwer. Beim Ausbrechen läuft eine Staubabsauganlage, damit der Staub im Bad bleibt und nicht in der Wohnung." },
  { nr: "06", titel: "Übergabe", text: "Zum Schluss die Endreinigung. Sie bekommen ein fertiges Bad übergeben, kein Baustellenende." },
];

/** Systeme, die auf der alten Website ausdrücklich als Möglichkeiten genannt werden. */
export const waermeerzeuger = [
  { name: "Wärmepumpe", text: "Nutzt Umweltwärme. Passt am besten zu gut gedämmten Gebäuden und großen Heizflächen." },
  { name: "Hybridheizung", text: "Kombination aus Gasbrennwertgerät und Wärmepumpe — die Wärmepumpe trägt die Grundlast, das Brennwertgerät die Spitzen." },
  { name: "Solarthermische Anlage", text: "Erwärmt Brauchwasser und unterstützt die Heizung. Lässt sich mit den übrigen Systemen kombinieren." },
  { name: "Biomasseheizung", text: "Heizen mit Pellets. Braucht Platz für die Lagerung, dafür einen nachwachsenden Brennstoff." },
  { name: "Brennstoffzellenheizung", text: "Erzeugt Wärme und Strom zugleich." },
  { name: "Fern- oder Nahwärme", text: "Anschluss an ein bestehendes Netz, wo eines liegt. Die wenigste Technik im Haus." },
];
