/**
 * Alles Geschaeftliche steht hier. Grundsatz: Es werden keine Referenzen,
 * Kennzahlen oder Zitate erfunden. Was nicht belegt ist, steht nicht auf der
 * Seite — auch dann nicht, wenn das Ergebnis gut war.
 */

export const marke = {
  name: 'Fokuswerk',
  firma: 'Fokuswerk GbR',
  strasse: 'Schramperweg 90',
  plz: '26129',
  ort: 'Oldenburg',
  telefon: '+4917663307587',
  telefonText: '0176 633 075 87',
  mail: 'contact@fokuswerk.de',
  ustId: 'DE456629159',
  vertreter: 'Thees Bodenstab & Julius Abt',
  instagram: 'https://www.instagram.com/fokuswerk.de/',
  linkedin: 'https://www.linkedin.com/company/fokuswerk/',
} as const;

export const cta = {
  text: 'Gespräch vereinbaren',
  notiz: '20 Minuten am Telefon. Danach wissen Sie, ob sich das für Sie rechnet.',
  ziel: '/kontakt',
} as const;

export const navigation = [
  { titel: 'Arbeit', pfad: '/#arbeit' },
  { titel: 'Fallstudie', pfad: '/fallstudien/wav-westerstede' },
  { titel: 'Rechnung', pfad: '/#rechnung' },
  { titel: 'Kontakt', pfad: '/kontakt' },
] as const;

/** Belegt aus den Werbekonten. Jede Zahl ist auf ein Konto zurückführbar. */
export const beleg = {
  budget: 550.27,
  bewerbungen: 68,
  brauchbar: '25–30',
  tage: 14,
  guenstig: 4.92,
  teuer: 218,
  anfragen: 120,
  monate: 2.5,
} as const;

/** Branchenwerte, als solche gekennzeichnet — keine Fokuswerk-Behauptung. */
export const rechnung = {
  stundenJahr: 1275,
  satzStandard: 95,
  quelle:
    'Verrechnete Stunden je Fachkraft und Jahr, multipliziert mit Ihrem Stundenverrechnungssatz. Branchenwerte für freie Werkstätten im ländlichen Raum, Stand 2026. Teile- und Materialumsatz kommt obendrauf.',
} as const;

export const disziplinen = [
  {
    kennung: 'Bewegtbild',
    titel: 'Wir drehen im Betrieb',
    text: 'Keine Models, keine Studiobilder. Ihre Leute an Ihren Maschinen. Ein halber Tag im Monat, daraus der Vorrat für vier Wochen.',
  },
  {
    kennung: 'Performance',
    titel: 'Wir fahren die Kampagnen',
    text: 'Meta und Google, mit Messung, die trägt. Varianten laufen gegeneinander, bis eine gewinnt — und die andere wird abgeschaltet.',
  },
  {
    kennung: 'Web',
    titel: 'Wir bauen, wo es landet',
    text: 'Karriereseite, Anfrageseite, Firmenseite. Auf Ihrem Konto, auf Ihren Namen. Diese Seite hier ist aus derselben Werkstatt.',
  },
] as const;
