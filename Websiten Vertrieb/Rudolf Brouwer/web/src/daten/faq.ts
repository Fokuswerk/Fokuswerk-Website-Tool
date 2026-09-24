/**
 * Nur echte Kundenfragen. Wo es keine belegbare Zahl gibt, wird erklärt,
 * wovon sie abhängt — statt eine Spanne zu erfinden.
 */
export type Frage = { frage: string; antwort: string };

export const faqAllgemein: Frage[] = [
  {
    frage: "Was kostet ein neues Bad bei Brouwer?",
    antwort:
      "Eine Zahl, die vor der Besichtigung genannt wird, ist geraten. Der Preis hängt an der Größe des Raums, am Zustand von Leitungen und Estrich, an der Zahl der Gewerke, die dazukommen, und an der Ausstattung, für die Sie sich entscheiden. Nach dem Termin vor Ort bekommen Sie einen Festpreis für das gesamte Bad — nicht eine Position je Handwerker.",
  },
  {
    frage: "Wie lange dauert eine Badsanierung?",
    antwort:
      "Auch das entscheidet sich vor Ort: Ein Bad, bei dem nur Oberflächen und Objekte getauscht werden, ist schneller fertig als eines, bei dem Leitungen neu verlegt und Wände versetzt werden. Verbindlich ist der Termin, der im Angebot steht — Brouwer arbeitet mit Fixterminen.",
  },
  {
    frage: "Übernimmt Brouwer auch die anderen Handwerker?",
    antwort:
      "Ja. Maurer-, Fliesen- und Malerarbeiten, Innenausbau, Elektroarbeiten und die Endreinigung werden von Brouwer koordiniert. Sie haben einen Ansprechpartner statt fünf Telefonnummern.",
  },
  {
    frage: "Wo arbeitet Brouwer?",
    antwort:
      "Der Betrieb sitzt seit 1973 an der Oldenburger Straße 209 in Wardenburg, am Ortseingang. Ob Ihr Vorhaben im Einsatzgebiet liegt, klären Sie am schnellsten im Telefonat.",
    /* TODO: vom Kunden bestätigen — das genaue Einsatzgebiet ist auf der alten
       Website nirgends benannt und wird hier bewusst nicht behauptet. */
  },
  {
    frage: "Kann ich die Ausstellung ohne Termin besuchen?",
    antwort:
      "Besser mit. Brouwer bittet ausdrücklich um eine vorherige Terminabsprache — dann ist jemand da, der Zeit für Sie hat, statt Sie zwischen zwei Baustellen zu beraten. Die Ausstellung umfasst mehr als 500 Quadratmeter für Bad und Pool.",
  },
  {
    frage: "Gibt es einen Notdienst?",
    antwort:
      "Ja, einen 24-Stunden-Notdienst für die Heizung. Wenn die Anlage am Wochenende ausfällt, rufen Sie unter 04407 8991 an.",
    /* TODO: vom Kunden bestätigen — ob der Notdienst außerhalb der
       Geschäftszeiten über dieselbe Rufnummer läuft, ist nicht dokumentiert. */
  },
];

export const faqHeizung: Frage[] = [
  {
    frage: "Wann sollte ich meine Heizung erneuern?",
    antwort:
      "Wenn Reparaturen häufiger werden, Ersatzteile schwer zu bekommen sind oder ein Umbau ohnehin ansteht. Der schlechteste Zeitpunkt ist der Ausfall im Januar, weil dann die Technik gewählt wird, die gerade lieferbar ist — und nicht die, die zum Gebäude passt.",
  },
  {
    frage: "Welche Technik passt zu meinem Gebäude?",
    antwort:
      "Das hängt an Dämmung, Heizflächen und den Vorlauftemperaturen, die Ihr Haus braucht. Brouwer führt die nach Wärmeschutzverordnung vorgeschriebenen Berechnungen durch, damit die Leistung der Anlage dem tatsächlichen Wärmebedarf entspricht — eine zu groß gewählte Anlage kostet dauerhaft Geld.",
  },
  {
    frage: "Darf ich überhaupt noch eine Gasheizung einbauen?",
    antwort:
      "Der Einbau einer neuen Öl- oder Gasheizung ist weiterhin zulässig. Zu bedenken sind die Preisentwicklung der Energieträger, die CO₂-Abgabe und die Verpflichtung, ab 2029 steigende Anteile erneuerbarer Energien zu nutzen. Genau das gehört in die Beratung, bevor Sie sich festlegen.",
  },
  {
    frage: "Gibt es Förderung?",
    antwort:
      "Für regenerative Wärmeerzeuger gibt es Förderprogramme der KfW, für Solarthermie zusätzlich Wege über das BAFA. Brouwer berät zu den Fördermöglichkeiten und bezieht sie in das Angebot ein. Welche Sätze für Ihr Vorhaben gelten, hängt vom Programm und vom Antragszeitpunkt ab — deshalb steht hier keine Prozentzahl.",
  },
  {
    frage: "Was passiert bei einer Störung?",
    antwort:
      "Der Kundendienst übernimmt Reparatur und Störungsbeseitigung. Für den Heizungsausfall außerhalb der Geschäftszeiten gibt es den 24-Stunden-Notdienst.",
  },
  {
    frage: "Wer übernimmt die Wartung?",
    antwort:
      "Brouwer bleibt nach der Installation Ihr Ansprechpartner. Regelmäßige Wartung stellt sicher, dass die Anlage ihre Leistung bringt und betriebsbereit bleibt.",
  },
];

export const faqPool: Frage[] = [
  {
    frage: "Lohnt sich die Sanierung eines alten Pools?",
    antwort:
      "Häufig ja. Eine neue Folie gibt dem Becken die Farbe zurück, eine Treppe ersetzt die Leiter, und eine moderne Filterpumpe spart einen erheblichen Teil des Stroms, den die alte verbraucht hat. Was in Ihrem Fall sinnvoll ist, zeigt sich am Becken.",
  },
  {
    frage: "Wie wird ein Pool beheizt?",
    antwort:
      "Über einen Wärmetauscher, der an die Wärmeerzeugung des Hauses angebunden wird. Genau hier trifft der Pool auf das, was Brouwer seit Jahrzehnten macht: Heizungsbau.",
  },
  {
    frage: "Wer ist für Schwimmbad zuständig?",
    antwort:
      "Der Schwimmbadbereich liegt bei der Brouwer Pool & Wellness GmbH an derselben Adresse. Ansprechpartner sind Roelf und Nicole Brouwer, ausführliche Informationen stehen auf pool-gmbh.de.",
  },
];
