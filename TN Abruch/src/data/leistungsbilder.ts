/**
 * Was hinter einer Leistungskategorie steckt — allgemein, nicht projektbezogen.
 *
 * Auf den Projektseiten wird damit erklärt, was die genannte Leistung als Gewerk
 * umfasst. Bewusst getrennt von den Projektdaten: Über den Ablauf eines einzelnen
 * Altprojekts liegt uns nichts vor, über das Gewerk sehr wohl. Die Texte decken
 * sich mit den Leistungsseiten und behaupten nichts darüber hinaus.
 */

export type Kategorie = 'schadstoff' | 'entkernung' | 'demontage' | 'beton';

export const leistungsbilder: Record<
  Kategorie,
  { label: string; href: string; body: string; points: string[] }
> = {
  schadstoff: {
    label: 'Schadstoffsanierung',
    href: '/leistungen/schadstoffsanierung/',
    body:
      'Ausbau asbesthaltiger und künstlicher Mineralfaser-Produkte unter Auflagen: ' +
      'abgeschotteter Schwarzbereich, Unterdruckhaltung, Personen- und Materialschleuse, ' +
      'Verpackung und Entsorgung mit Nachweis, Freimessung vor der Rückgabe.',
    points: [
      'Zulassung nach TRGS 519 Ziffer 2.7 Anlage 3 — einschließlich weichgebundener Produkte',
      'Sachkunde nach TRGS 521 für künstliche Mineralfasern',
      '1- bis 4-Kammerschleusen, Unterdruckhaltegeräte von 500 bis 12.500 cbm',
      'Entsorgung mit Nachweis, Freimessung durch ein akkreditiertes Labor',
    ],
  },
  entkernung: {
    label: 'Rückbau & Entkernung',
    href: '/leistungen/rueckbau-entkernung/',
    body:
      'Alles herausnehmen, was nicht trägt — Trennwände, Decken, Böden, Estriche, ' +
      'Verkleidungen und Haustechnik — und dabei nichts anfassen, was tragen muss. ' +
      'Handarbeit mit Maschinenunterstützung, nicht umgekehrt.',
    points: [
      'Ausbau bis auf die Tragstruktur, anschließend wird weitergebaut',
      'Handabbruch in beengten Lagen und bei laufendem Betrieb',
      'Bagger von 1 t bis 18,5 t, Radlader von 1,5 t bis 6,0 t',
      'Getrennte Erfassung der Fraktionen bereits auf der Baustelle',
    ],
  },
  demontage: {
    label: 'Demontage',
    href: '/leistungen/rueckbau-entkernung/',
    body:
      'Zerlegen statt Abbrechen: Fassaden, Betriebseinrichtungen und Anlagenteile ' +
      'werden dort abgenommen, wo Bauteile erhalten bleiben sollen oder das Material ' +
      'sortenrein zurück in den Kreislauf geht.',
    points: [
      'Fassaden- und Anlagendemontage, auch bei erhaltenswerter Substanz',
      'Sortenreine Trennung der Materialien für die Verwertung',
      'Arbeiten im laufenden Betrieb nach Abstimmung mit dem Nutzer',
    ],
  },
  beton: {
    label: 'Beton, Bohren & Sägen',
    href: '/leistungen/beton-bohren-saegen/',
    body:
      'Trennen statt zerschlagen: Kernbohrungen, Wand- und Bodensägearbeiten und ' +
      'Betonabbruch dort, wo Erschütterung in angrenzende Bauteile vermieden werden muss.',
    points: [
      'Maßhaltige Öffnungen für Türen, Fenster, Treppen und Haustechnik',
      'Trennschnitte, damit ein Bauteil kontrolliert fällt',
      'Betonabbruch an Fundamenten, Bodenplatten, Stützen und Wänden',
    ],
  },
};
