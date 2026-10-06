// Seitendaten und Seitenbauer für die Branchen-Landingpages
const OL_FRAGE = ["Arbeitet Fokuswerk nur in Oldenburg?", "Websites und Kampagnen betreuen wir bundesweit. Für Foto- und Videoaufnahmen fahren wir im Umkreis von rund 100 Kilometern: Oldenburg, Ammerland, Ostfriesland, Bremen und das dazwischen."];
const FAKTEN = (leistung) => [
  ["Leistungen", leistung],
  ["Region", "Oldenburg, Ammerland, Ostfriesland, Bremen — Websites und Anzeigen bundesweit"],
  ["Bis zur neuen Website", "in der Regel vier bis fünf Wochen"],
  ["Preis", "festes Angebot mit einer Summe nach dem Erstgespräch"],
  ["Ansprechpartner", "Julius Abt und Thees Bodenstab — ohne Projektmanager dazwischen"],
];
const ALLE = {
  zahnaerzte: ["Zahnarztpraxen", "Website für Zahnärzte, Google Ads für Selbstzahler, ZFA-Recruiting.", "/branchen/zahnaerzte"],
  aerzte: ["Arztpraxen", "Praxiswebsite, die das Telefon entlastet, und MFA-Recruiting.", "/branchen/aerzte"],
  handwerk: ["Handwerk", "Website und Marketing für Aufträge mit Marge und neue Fachkräfte.", "/branchen/handwerk"],
  werkstaetten: ["Werkstätten & Autohäuser", "Werkstatttermine über Google und Recruiting für Mechatroniker.", "/branchen/werkstaetten"],
  optiker: ["Optik & Hörakustik", "Lokale Anzeigen und Kampagnen für Sehtest- und Hörtest-Termine.", "/branchen/optiker"],
};
const kw = (l, w, s, n) => ({ l, w, s, n });

const BRANCHEN = {
  zahnaerzte: {
    pfad: "/branchen/zahnaerzte", name: "Zahnarztpraxen",
    title: "Marketing für Zahnarztpraxen | Website, Google & ZFA-Recruiting | Fokuswerk",
    description: "Praxismarketing für Zahnärzte: Website für Zahnarztpraxen, Google Ads für Selbstzahlerleistungen und Recruiting für ZFA — werberechtlich sauber, mit festem Angebot. Fokuswerk aus Oldenburg.",
    kopf: {
      etikett: "[ BRANCHE · ZAHNARZTPRAXEN ]", geist: "Zahnärzte", marke: "WEBSITE · GOOGLE · ZFA-RECRUITING",
      h1: "Marketing für [[Zahnarztpraxen]], das Patienten und Personal bringt.",
      lead: "Wir bauen Websites für Zahnärzte, schalten Google- und Meta-Anzeigen für Selbstzahlerleistungen und finden über Social Recruiting neue ZFA — alles aus einer Hand, aus Oldenburg.",
      bild: BILDU("photo-1629909613654-28e377c37b09"), alt: "Behandlungszimmer einer Zahnarztpraxis",
      bildEtikett: "[ PRAXISMARKETING FÜR ZAHNÄRZTE ]", bildTitel: "Die richtigen Patienten — und das Team, das sie behandelt.",
    },
    antwort: {
      frage: "Was bringt [[Marketing]] einer Zahnarztpraxis?",
      absaetze: [
        "Gutes Praxismarketing sorgt dafür, dass die richtigen Patienten Ihre Praxis finden — vor allem für Leistungen, die privat bezahlt werden: Implantate, Aligner, Prophylaxe, Bleaching. Und es hilft beim zweiten Engpass vieler Praxen: Zahnmedizinische Fachangestellte zu finden.",
        "Fokuswerk verbindet dafür drei Dinge: eine Website für Zahnärzte, die Vertrauen schafft und Terminanfragen auslöst, Google-Anzeigen auf die Suchen Ihrer Region und Recruiting-Kampagnen auf Instagram und Facebook. Alles in den Grenzen von Berufsordnung und Heilmittelwerbegesetz.",
      ],
      fakten: FAKTEN("Website, Google Ads, Meta Ads, ZFA-Recruiting, Foto und Video"),
    },
    probleme: [
      ["Selbstzahler finden die Praxis nicht", "Wer „Implantat“ oder „professionelle Zahnreinigung“ plus Ort sucht, landet oft bei Ketten und Portalen. Die eigene Website taucht weit unten auf — oder beantwortet die Fragen nicht, die vor dem Anruf stehen."],
      ["ZFA-Stellen bleiben monatelang offen", "Stellenportale erreichen nur, wer gerade aktiv sucht. Die meisten guten Fachkräfte sind angestellt — und sehen Ihre Anzeige nie."],
      ["Werberecht bremst Ideen aus", "Heilversprechen, reißerische Vorher-nachher-Vergleiche, Rabattaktionen: Vieles, was in anderen Branchen funktioniert, ist für Praxen tabu. Nicht jede Agentur kennt die Grenzen."],
    ],
    loesung: [
      ["Website für Zahnärzte", "Behandlungen verständlich erklärt, Team und Praxis gezeigt, Terminanfrage prominent. Schnell auf dem Handy und für Google und KI-Assistenten gut lesbar.", "/leistungen/websites"],
      ["Google Ads für Selbstzahler", "Suchanzeigen auf die Behandlungen, die sich für Ihre Praxis rechnen — begrenzt auf Ihren Einzugsbereich, mit Tracking bis zur Terminanfrage.", "/leistungen/performance-marketing"],
      ["ZFA-Recruiting", "Kampagnen auf Instagram und Facebook, die wechselbereite Fachkräfte in der Region erreichen — mit eigener Karriereseite und einer Bewerbung ohne Anschreiben.", "/leistungen/performance-marketing"],
    ],
    beispiel: {
      google: { firma: "Zahnarztpraxis Lindenhof · Oldenburg", suche: "zahnimplantat oldenburg", domain: "praxis-lindenhof.de › implantate", headline: "Zahnimplantate in Oldenburg — ausführliche Erstberatung", beschreibung: "Implantologie in ruhiger Atmosphäre. Verständliche Kostenpläne, Termine auch abends. Jetzt Beratung anfragen.", links: ["Beratung anfragen", "Kosten & Ablauf", "Team"], werte: [kw("Klickrate", 8.7, 1, " %"), kw("Ø Klickpreis", 2.4, 2, " €"), kw("Anfragen", 34, 0, "")] },
      meta: { titel: "Recruiting-Anzeige · Instagram", firma: "Zahnarztpraxis Lindenhof · ZFA gesucht", absender: "Zahnarztpraxis Lindenhof", schlagzeile: "ZFA (m/w/d) — Teilzeit oder Vollzeit, ab sofort", knopf: "Kurz bewerben", bild: BILDU("photo-1667133295315-820bb6481730", 720), chips: [{ l: "Reichweite", w: "18.600" }, { l: "€ je Bewerbung", w: "21 €" }, { l: "Bewerbungen", w: "14", akz: true }] },
      cockpit: { titel: "Praxis-Cockpit", firma: "Zahnarztpraxis Lindenhof · Google & Meta · 12 Wochen", kpis: [{ l: "Terminanfragen", w: 96, d: "+48 %" }, { l: "€ je Anfrage", w: 31.2, s: 2, n: " €", d: "−27 %" }, { l: "Werbebudget", w: 3000, n: " €", d: "12 Wochen" }, { l: "Neupatienten", w: 41, d: "43 % der Anfragen" }], anfragen: [4, 5, 5, 6, 7, 8, 8, 9, 10, 10, 11, 13], kosten: [48, 45, 44, 40, 38, 36, 35, 33, 32, 31, 30, 29] },
      trichter: { titel: "Von der Suche zum Behandlungstermin", firma: "Implantologie · 3 Monate", stufen: [{ l: "Impressionen", w: 62400, anteil: 1 }, { l: "Klicks", w: 2150, anteil: 0.62, q: "3,4 %" }, { l: "Anfragen", w: 96, anteil: 0.38, q: "4,5 %" }, { l: "Termine", w: 41, anteil: 0.22, q: "42,7 %" }] },
    },
    fragenTitel: "Was Zahnärzte vor dem [[Start]] wissen wollen.",
    fragen: [
      ["Was kostet Marketing für eine Zahnarztpraxis?", "Das hängt vom Umfang ab: Eine neue Website ist ein einmaliges Projekt, Anzeigen und Recruiting laufen monatlich mit eigenem Werbebudget. Nach dem Erstgespräch bekommen Sie ein festes Angebot mit einer Summe, nicht mit einem Stundensatz."],
      ["Darf eine Zahnarztpraxis bei Google werben?", "Ja. Werbung für zahnärztliche Leistungen ist erlaubt, solange sie sachlich informiert. Berufsordnung und Heilmittelwerbegesetz verbieten unter anderem Heilversprechen und irreführende Darstellungen. Wir formulieren Anzeigen und Texte so, dass sie informieren statt versprechen — die rechtliche Prüfung im Einzelfall ersetzt das nicht."],
      ["Wie findet eine Zahnarztpraxis neue ZFA?", "Die meisten guten ZFA sind angestellt und suchen nicht aktiv. Recruiting-Kampagnen auf Instagram und Facebook erreichen sie trotzdem — im Umkreis Ihrer Praxis, mit einer kurzen Bewerbung ohne Anschreiben und einer Karriereseite, die zeigt, wie es sich bei Ihnen arbeitet."],
      ["Was gehört auf eine Website für Zahnärzte?", "Behandlungen in verständlicher Sprache, Team und Räume, Sprechzeiten, Anfahrt und eine einfache Terminanfrage. Dazu die Pflichtangaben im Impressum, etwa Kammer und Berufsbezeichnung, und eine Datenschutzerklärung. Und die Seite muss auf dem Handy schnell laden."],
      OL_FRAGE,
    ],
    service: "Praxismarketing für Zahnarztpraxen", zielgruppe: "Zahnarztpraxen",
  },
  aerzte: {
    pfad: "/branchen/aerzte", name: "Arztpraxen",
    title: "Website für Ärzte & Arztpraxen | Praxismarketing aus Oldenburg | Fokuswerk",
    description: "Websites für Ärzte und Arztpraxen, die Patienten informieren und das Telefon entlasten — plus Sichtbarkeit bei Google und MFA-Recruiting. Fokuswerk aus Oldenburg, festes Angebot.",
    kopf: {
      etikett: "[ BRANCHE · ARZTPRAXEN ]", geist: "Arztpraxen", marke: "PRAXISWEBSITE · GOOGLE · MFA-RECRUITING",
      h1: "Websites für [[Ärzte]], die das Telefon entlasten.",
      lead: "Eine Praxiswebsite, die Patienten die häufigsten Fragen vorab beantwortet, bei Google gefunden wird und offene MFA-Stellen besetzen hilft. Gebaut von Fokuswerk aus Oldenburg.",
      bild: BILDU("photo-1758691461888-b74515208d7a"), alt: "Arzt im Sprechzimmer",
      bildEtikett: "[ WEBSITE FÜR ARZTPRAXEN ]", bildTitel: "Weniger Anrufe mit Standardfragen. Mehr Zeit für Patienten.",
    },
    antwort: {
      frage: "Was macht eine gute [[Website]] für Arztpraxen aus?",
      absaetze: [
        "Eine gute Praxiswebsite beantwortet die Fragen, die sonst am Telefon landen: Sprechzeiten, Leistungen, Rezeptbestellung, Vertretung, Aufnahme neuer Patienten. Sie ist auf dem Handy schnell, barrierearm und bei Google mit Ihrem Ort und Fachgebiet auffindbar.",
        "Fokuswerk baut solche Websites für Arzt- und Facharztpraxen — mit Texten, die wir selbst schreiben, und Fotos aus Ihrer Praxis. Auf Wunsch kommen Google-Anzeigen für Selbstzahlerleistungen und Recruiting-Kampagnen für Medizinische Fachangestellte dazu.",
      ],
      fakten: FAKTEN("Praxiswebsite, Google-Sichtbarkeit, Google Ads, MFA-Recruiting, Foto und Video"),
    },
    probleme: [
      ["Das Telefon steht nicht still", "Viele Anrufe drehen sich um Sprechzeiten, Rezepte und Vertretungen. Stehen diese Antworten nicht klar auf der Website, landen sie am Empfang — zwischen Patienten vor Ort."],
      ["Die Website ist in die Jahre gekommen", "Nicht handytauglich, langsam, mit veralteten Angaben oder ohne klare Struktur. Patienten merken das — und Google auch."],
      ["Medizinische Fachangestellte fehlen", "Offene MFA-Stellen bleiben lange unbesetzt. Die passenden Kandidatinnen sind meist angestellt und lesen keine Stellenportale."],
    ],
    loesung: [
      ["Praxiswebsite", "Klare Struktur, Sprechzeiten auf einen Blick, Terminanfrage oder Rückrufbitte, barrierearm und schnell. Pflege übernehmen wir auf Wunsch im Abo.", "/leistungen/websites"],
      ["Sichtbar bei Google", "Gepflegtes Google-Unternehmensprofil, lokale Suchbegriffe und strukturierte Daten, damit Ihre Praxis mit Fachgebiet und Ort gefunden wird.", "/leistungen/websites"],
      ["MFA-Recruiting", "Kampagnen auf Instagram und Facebook im Umkreis Ihrer Praxis, mit eigener Karriereseite und kurzer Bewerbung ohne Anschreiben.", "/leistungen/performance-marketing"],
    ],
    beispiel: {
      google: { firma: "Hautarztpraxis am Wall · Oldenburg", suche: "hautarzt oldenburg termin", domain: "hautarzt-am-wall.de › termin", headline: "Hautarztpraxis am Wall — Termin online anfragen", beschreibung: "Hautkrebsvorsorge, Allergologie, ästhetische Dermatologie. Neue Patienten willkommen, Termine auch kurzfristig.", links: ["Online-Termin", "Leistungen", "Anfahrt"], werte: [kw("Klickrate", 11.2, 1, " %"), kw("Ø Klickpreis", 1.35, 2, " €"), kw("Anfragen", 128, 0, "")] },
      meta: { titel: "Recruiting-Anzeige · Instagram", firma: "Hausarztpraxis am Park · MFA gesucht", absender: "Hausarztpraxis am Park", schlagzeile: "MFA (m/w/d) — feste Zeiten, freitags ab 13 Uhr", knopf: "Kurz bewerben", bild: BILDU("photo-1678940807523-cde32f676946", 720), chips: [{ l: "Reichweite", w: "15.900" }, { l: "€ je Bewerbung", w: "24 €" }, { l: "Bewerbungen", w: "11", akz: true }] },
      cockpit: { titel: "Praxis-Cockpit", firma: "Hautarztpraxis am Wall · Google Ads · 12 Wochen", kpis: [{ l: "Terminanfragen", w: 128, d: "+52 %" }, { l: "€ je Anfrage", w: 9.8, s: 2, n: " €", d: "−31 %" }, { l: "Werbebudget", w: 1250, n: " €", d: "12 Wochen" }, { l: "Anrufe aus der Seite", w: 214, d: "Klick auf Telefonnummer" }], anfragen: [6, 7, 8, 8, 9, 10, 11, 11, 12, 13, 15, 18], kosten: [14.5, 14, 13.2, 12.8, 12, 11.6, 11, 10.8, 10.4, 10.1, 9.9, 9.8] },
      trichter: { titel: "Von der Suche zum Termin", firma: "Selbstzahlerleistungen · 3 Monate", stufen: [{ l: "Impressionen", w: 41800, anteil: 1 }, { l: "Klicks", w: 1980, anteil: 0.64, q: "4,7 %" }, { l: "Anfragen", w: 128, anteil: 0.4, q: "6,5 %" }, { l: "Termine", w: 97, anteil: 0.3, q: "75,8 %" }] },
    },
    fragenTitel: "Was Ärzte vor dem [[Relaunch]] wissen wollen.",
    fragen: [
      ["Was kostet eine Website für eine Arztpraxis?", "Das hängt vom Umfang ab — eine Hausarztpraxis mit fünf Unterseiten ist etwas anderes als ein MVZ mit mehreren Standorten. Nach dem Erstgespräch bekommen Sie ein festes Angebot mit einer Summe, nicht mit einem Stundensatz."],
      ["Welche Pflichtangaben braucht eine Praxiswebsite?", "Unter anderem ein Impressum mit gesetzlicher Berufsbezeichnung, zuständiger Ärztekammer und den berufsrechtlichen Regelungen sowie eine Datenschutzerklärung — bei Online-Terminbuchung auch Angaben zum eingesetzten Dienst. Wir bauen die Struktur dafür ein und stimmen die Inhalte mit Ihnen ab."],
      ["Kann eine Website Anrufe in der Praxis reduzieren?", "Ja, wenn sie die häufigsten Fragen sichtbar beantwortet: Sprechzeiten, Vertretungen, Rezeptbestellung, Aufnahme neuer Patienten. Wie groß der Effekt ist, hängt von Ihrer Praxis ab — wir messen, wie oft diese Antworten aufgerufen werden."],
      ["Wie findet eine Arztpraxis neue MFA?", "Über Recruiting-Kampagnen auf Instagram und Facebook im Umkreis Ihrer Praxis. Gute MFA sind meist angestellt und suchen nicht aktiv — sie reagieren aber auf eine Anzeige mit echten Bildern aus Ihrem Team und eine Bewerbung ohne Anschreiben."],
      OL_FRAGE,
    ],
    service: "Websites und Praxismarketing für Arztpraxen", zielgruppe: "Arzt- und Facharztpraxen",
  },
  handwerk: {
    pfad: "/branchen/handwerk", name: "Handwerk",
    title: "Website & Marketing für Handwerker | Mehr Aufträge und Fachkräfte | Fokuswerk",
    description: "Website für Handwerker und Marketing im Handwerk: mehr passende Aufträge, mehr Bewerbungen, klare Zahlen. Fokuswerk aus Oldenburg für Handwerksbetriebe im Nordwesten.",
    kopf: {
      etikett: "[ BRANCHE · HANDWERK ]", geist: "Handwerk", marke: "WEBSITE · GOOGLE · FACHKRÄFTE",
      h1: "Websites und Marketing für [[Handwerker]], die ausgelastet bleiben wollen.",
      lead: "Für Dachdecker, SHK, Elektro, Tischlerei, Garten- und Landschaftsbau: eine Website, die Anfragen sortiert, Anzeigen für die Aufträge, die sich lohnen, und Kampagnen, die Fachkräfte erreichen.",
      bild: BILDU("photo-1621905251189-08b45d6a269e"), alt: "Elektriker bei der Arbeit",
      bildEtikett: "[ MARKETING IM HANDWERK ]", bildTitel: "Die Aufträge, die Sie wollen — nicht nur die, die anrufen.",
    },
    antwort: {
      frage: "Was bringt [[Marketing]] im Handwerk?",
      absaetze: [
        "Die meisten Betriebe haben genug zu tun — aber nicht immer die richtigen Aufträge und selten genug Leute. Gutes Marketing im Handwerk steuert beides: Es bringt Anfragen für die Arbeiten, die sich für Sie lohnen, und macht Ihren Betrieb für Fachkräfte und Azubis sichtbar.",
        "Fokuswerk baut dafür Websites für Handwerker, schaltet Google- und Meta-Anzeigen im Umkreis Ihres Betriebs und produziert Fotos und Videos direkt bei Ihnen vor Ort — ohne Stockfotos von lächelnden Handwerkern.",
      ],
      fakten: FAKTEN("Website, Google Ads, Meta Ads, Recruiting, Foto und Video vor Ort"),
    },
    probleme: [
      ["Die falschen Anfragen", "Kleinstaufträge, Preisvergleiche, Anfragen außerhalb des Gebiets. Wer alles anruft, kostet Zeit, die auf der Baustelle fehlt."],
      ["Keine Fachkräfte, keine Azubis", "Stellenanzeigen im Portal bringen kaum Bewerbungen. Gute Gesellen sind angestellt — und werden nur erreicht, wenn man sie dort anspricht, wo sie ohnehin sind."],
      ["Die Website ist ein Schaufenster ohne Tür", "Viele Seiten zeigen Referenzen, sagen aber nicht, was als Nächstes passiert: kein klarer Ablauf, keine Rückrufbitte, keine Angabe zum Einzugsgebiet."],
    ],
    loesung: [
      ["Website für Handwerker", "Leistungen, Einzugsgebiet und Ablauf klar erklärt, ein Anfrageformular mit den Fragen, die Sie für ein Angebot brauchen. Schnell auf dem Handy und bei Google mit Ihrem Ort auffindbar.", "/leistungen/websites"],
      ["Anzeigen für die richtigen Aufträge", "Google-Suchanzeigen auf die Leistungen, die sich rechnen — Wärmepumpe statt Tropfhahn —, begrenzt auf Ihr Einzugsgebiet und mit Tracking bis zur Anfrage.", "/leistungen/performance-marketing"],
      ["Fachkräfte und Azubis finden", "Recruiting-Kampagnen auf Instagram und Facebook mit Videos aus Ihrem Betrieb, einer eigenen Karriereseite und einer Bewerbung ohne Anschreiben.", "/leistungen/content"],
    ],
    beispiel: {
      google: { firma: "Haustechnik Ohlrogge · Oldenburg", suche: "wärmepumpe einbauen oldenburg", domain: "haustechnik-ohlrogge.de › wärmepumpe", headline: "Wärmepumpe vom Meisterbetrieb — Beratung vor Ort", beschreibung: "Planung, Förderantrag und Einbau aus einer Hand. Beratung vor Ort im Umkreis von 40 km. Jetzt Termin anfragen.", links: ["Beratung anfragen", "Förderung", "Referenzen"], werte: [kw("Klickrate", 7.9, 1, " %"), kw("Ø Klickpreis", 3.1, 2, " €"), kw("Anfragen", 46, 0, "")] },
      meta: { titel: "Recruiting-Anzeige · Reels", firma: "Dachtechnik Freese · Dachdecker gesucht", absender: "Dachtechnik Freese", schlagzeile: "Dachdecker (m/w/d) — Firmenwagen ab Tag eins", knopf: "Kurz bewerben", bild: BILDU("photo-1691571026798-1c5819901996", 720), chips: [{ l: "Reichweite", w: "23.800" }, { l: "Klickrate", w: "1,8 %" }, { l: "Bewerbungen", w: "9", akz: true }] },
      cockpit: { titel: "Betriebs-Cockpit", firma: "Haustechnik Ohlrogge · Google & Meta · 12 Wochen", kpis: [{ l: "Anfragen", w: 118, d: "+71 %" }, { l: "€ je Anfrage", w: 26.4, s: 2, n: " €", d: "−38 %" }, { l: "Werbebudget", w: 3100, n: " €", d: "12 Wochen" }, { l: "Aufträge", w: 27, d: "Ø 14.600 € je Auftrag" }], anfragen: [4, 6, 6, 7, 8, 9, 10, 11, 12, 13, 14, 18], kosten: [42, 39, 38, 35, 33, 31, 30, 29, 28, 27, 26.8, 26.4] },
      trichter: { titel: "Vom Klick zum Auftrag", firma: "Wärmepumpen · 3 Monate", stufen: [{ l: "Impressionen", w: 96500, anteil: 1 }, { l: "Klicks", w: 3040, anteil: 0.62, q: "3,2 %" }, { l: "Anfragen", w: 118, anteil: 0.38, q: "3,9 %" }, { l: "Aufträge", w: 27, anteil: 0.2, q: "22,9 %" }] },
    },
    referenzen: [
      ["HEIZUNG, BAD, ELEKTRO", "Andre Henken", "Oldenburg · Entwurf", "https://andre-henken-website.vercel.app/"],
      ["GEBÄUDEREINIGUNG", "Glanzwerk", "Oldenburg · Entwurf", "https://glanzwerk-oldenburg.vercel.app/"],
      ["GARTENPFLEGE", "Gartenzwerg", "Bad Zwischenahn · Entwurf", "https://gartenzwerg-praesentation.vercel.app/"],
    ],
    fragenTitel: "Was Handwerksbetriebe vorher [[wissen]] wollen.",
    fragen: [
      ["Was kostet eine Website für Handwerker?", "Das hängt vom Umfang ab — eine Seite mit fünf Leistungsseiten ist etwas anderes als ein Betrieb mit mehreren Standorten und Karrierebereich. Nach dem Erstgespräch bekommen Sie ein festes Angebot mit einer Summe, nicht mit einem Stundensatz."],
      ["Lohnt sich Werbung für Handwerker, die schon ausgelastet sind?", "Oft gerade dann. Wer ausgelastet ist, kann wählen: Anzeigen auf die Leistungen mit der besten Marge sorgen dafür, dass die Auslastung aus den richtigen Aufträgen kommt. Und Recruiting-Kampagnen schaffen die Kapazität, die fehlt."],
      ["Wie finden Handwerksbetriebe Fachkräfte und Azubis?", "Über die Kanäle, auf denen die Leute ohnehin sind: Instagram und Facebook, im Umkreis Ihres Betriebs. Mit echten Bildern aus Ihrem Alltag, einer Karriereseite und einer Bewerbung, die zwei Minuten dauert statt zwanzig."],
      ["Brauchen wir dafür eigene Fotos und Videos?", "Ja — und die machen wir selbst. Ein halber Tag bei Ihnen vor Ort reicht für Website, Anzeigen und Recruiting. Stockfotos überzeugen weder Kunden noch Bewerber."],
      OL_FRAGE,
    ],
    service: "Websites und Marketing für Handwerksbetriebe", zielgruppe: "Handwerksbetriebe",
  },
  werkstaetten: {
    pfad: "/branchen/werkstaetten", name: "Werkstätten & Autohäuser",
    title: "Werbung & Marketing für Kfz-Werkstätten und Autohäuser | Fokuswerk",
    description: "Werbung für Kfz-Werkstätten, Karosseriebetriebe, Autohäuser, Motorgeräte und Landtechnik: Website, Google Ads für Werkstatttermine und Recruiting für Kfz-Mechatroniker. Fokuswerk, Oldenburg.",
    kopf: {
      etikett: "[ BRANCHE · WERKSTÄTTEN & AUTOHÄUSER ]", geist: "Werkstätten", marke: "KFZ · KAROSSERIE · MOTORGERÄTE · LANDTECHNIK",
      h1: "Werbung für [[Kfz-Werkstätten]] und Autohäuser, die sich nachrechnen lässt.",
      lead: "Für Kfz- und Karosseriebetriebe, Autohäuser, Zweirad, Motorgeräte und Landtechnik: eine Website, die Werkstatttermine bringt, Anzeigen auf die Aufträge mit Marge und Kampagnen, die Mechatroniker erreichen.",
      bild: BILDU("photo-1676018366904-c083ed678e60"), alt: "Kfz-Werkstatt mit Hebebühne",
      bildEtikett: "[ WERKSTATTMARKETING ]", bildTitel: "Ein Stammkunde bringt über Jahre Tausende Euro. Er sollte nicht beim Nachbarn landen.",
    },
    antwort: {
      frage: "Was bringt [[Werbung]] für eine Kfz-Werkstatt?",
      absaetze: [
        "Werkstätten leben von Stammkunden — und von denen, die neu in die Region ziehen, das Autohaus wechseln oder eine Panne haben. Werbung für Kfz-Werkstätten sorgt dafür, dass diese Menschen Ihren Betrieb finden, wenn sie suchen: bei Google, mit Ihrem Ort, auf dem Handy.",
        "Fokuswerk arbeitet schwerpunktmäßig für Betriebe mit eigener Werkstatt — die Website der Kfz-Werkstatt WAV in Westerstede ist von uns, dazu Entwürfe für Karosseriebau Heinz und Bunjes Motorgeräte. Dazu kommen Google-Anzeigen für Werkstatttermine und Recruiting für Kfz-Mechatroniker.",
      ],
      fakten: FAKTEN("Website, Google Ads, Meta Ads, Mechatroniker-Recruiting, Foto und Video"),
    },
    probleme: [
      ["Mechatroniker fehlen", "Die Hebebühne steht, weil Leute fehlen. Stellenanzeigen im Portal erreichen nur, wer ohnehin wechseln will — und genau die sind selten."],
      ["Neukunden kommen nur per Empfehlung", "Empfehlungen sind gut, aber nicht planbar. Wer bei Google „Werkstatt“ plus Ort sucht, findet oft zuerst Ketten und Vergleichsportale."],
      ["Die Website beantwortet die Fragen nicht", "Termin, Ersatzwagen, Hol- und Bringservice, Marken, Notdienst: Was Kunden vor dem Anruf wissen wollen, steht oft nirgends."],
    ],
    loesung: [
      ["Website für Werkstätten", "Leistungen, Marken, Termine und Notdienst auf einen Blick — mit Online-Terminanfrage und Anruf per Klick. So wie bei WAV Westerstede.", "/leistungen/websites"],
      ["Google Ads für Werkstatttermine", "Suchanzeigen auf Inspektion, HU, Unfallinstandsetzung oder Reifenwechsel — nur im Einzugsgebiet, nur zu Öffnungszeiten, mit Tracking bis zum Termin.", "/leistungen/performance-marketing"],
      ["Recruiting für Kfz-Mechatroniker", "Kampagnen auf Instagram und Facebook mit Videos aus Ihrer Werkstatt — für Gesellen, Meister und Azubis im Umkreis.", "/leistungen/content"],
    ],
    beispiel: {
      google: { firma: "Autoservice Harms · Oldenburg", suche: "inspektion werkstatt oldenburg", domain: "autoservice-harms.de › inspektion", headline: "Inspektion nach Herstellervorgabe — Termin diese Woche", beschreibung: "Alle Marken, die Herstellergarantie bleibt erhalten. Ersatzwagen und Hol- und Bringservice. Jetzt online Termin anfragen.", links: ["Termin anfragen", "Preise", "Ersatzwagen"], werte: [kw("Klickrate", 10.3, 1, " %"), kw("Ø Klickpreis", 0.95, 2, " €"), kw("Anfragen", 71, 0, "")] },
      meta: { titel: "Recruiting-Anzeige · Reels", firma: "Autohaus Meinen · Kfz-Mechatroniker", absender: "Autohaus Meinen", schlagzeile: "Kfz-Mechatroniker (m/w/d) — 4-Tage-Woche möglich", knopf: "Kurz bewerben", bild: BILDU("photo-1723099971299-3789db53604c", 720), chips: [{ l: "Reichweite", w: "21.400" }, { l: "€ je Bewerbung", w: "14,60 €" }, { l: "Bewerbungen", w: "37", akz: true }] },
      cockpit: { titel: "Werkstatt-Cockpit", firma: "Autoservice Harms · Google Ads · 12 Wochen", kpis: [{ l: "Terminanfragen", w: 162, d: "+58 %" }, { l: "€ je Anfrage", w: 11.9, s: 2, n: " €", d: "−36 %" }, { l: "Werbebudget", w: 1930, n: " €", d: "12 Wochen" }, { l: "Neukunden", w: 74, d: "46 % der Anfragen" }], anfragen: [8, 9, 10, 10, 12, 13, 13, 14, 15, 17, 18, 23], kosten: [18.6, 17.9, 17, 16.4, 15.5, 14.8, 14.2, 13.6, 13, 12.5, 12.1, 11.9] },
      trichter: { titel: "Von der Suche in die Werkstatt", firma: "Inspektion & HU · 3 Monate", stufen: [{ l: "Impressionen", w: 58200, anteil: 1 }, { l: "Klicks", w: 3620, anteil: 0.66, q: "6,2 %" }, { l: "Anfragen", w: 162, anteil: 0.42, q: "4,5 %" }, { l: "Termine", w: 128, anteil: 0.34, q: "79,0 %" }] },
    },
    referenzen: [
      ["KFZ-WERKSTATT", "WAV Westerstede", "Westerstede · live unter wav-wst.de", "https://wav-wst.de/"],
      ["KAROSSERIEBAU", "Karosseriebau Heinz", "Großheide · Entwurf", "https://karosseriebau-heinz.vercel.app/"],
      ["MOTORGERÄTE & WERKSTATT", "Bunjes Motorgeräte", "Wardenburg · Entwurf", "https://bunjes-motorgeraete.vercel.app/"],
    ],
    fragenTitel: "Was Werkstätten vorher [[wissen]] wollen.",
    fragen: [
      ["Was kostet Werbung für eine Kfz-Werkstatt?", "Zwei Teile: das Werbebudget, das direkt an Google oder Meta geht, und unsere Betreuung. Wie hoch das Budget sein sollte, hängt von Einzugsgebiet und Kapazität ab — das rechnen wir im Erstgespräch mit Ihren Zahlen durch. Danach bekommen Sie ein festes Angebot."],
      ["Wie finden Werkstätten Kfz-Mechatroniker?", "Über Recruiting-Kampagnen auf Instagram und Facebook im Umkreis Ihres Betriebs. Gute Mechatroniker sind angestellt und suchen nicht aktiv — sie reagieren aber auf eine Anzeige, die zeigt, wie es bei Ihnen wirklich aussieht, und auf eine Bewerbung ohne Anschreiben."],
      ["Lohnt sich Google Ads für eine Werkstatt?", "Wenn die Anzeigen auf die richtigen Leistungen und das richtige Gebiet begrenzt sind, in der Regel ja: Wer „Inspektion“ plus Ort sucht, braucht jetzt einen Termin. Wir starten mit exakten Suchbegriffen statt breiter Streuung und schließen Begriffe wie „Ausbildung“ oder „selber machen“ von Anfang an aus."],
      ["Arbeitet Fokuswerk auch für Autohäuser, Motorgeräte und Landtechnik?", "Ja. Unser Schwerpunkt sind Betriebe mit eigener Werkstatt: Kfz, Karosserie, Zweirad, Motorgeräte, Land- und Forsttechnik, Nutzfahrzeuge. Käufer, Fachkräftemangel und Servicegeschäft ähneln sich dort stark."],
      OL_FRAGE,
    ],
    service: "Werbung und Marketing für Kfz-Werkstätten und Autohäuser", zielgruppe: "Kfz-Werkstätten, Autohäuser und Betriebe mit eigener Werkstatt",
  },
  optiker: {
    pfad: "/branchen/optiker", name: "Optik & Hörakustik",
    title: "Werbung für Optiker & Hörakustiker | Marketing aus Oldenburg | Fokuswerk",
    description: "Werbung und Marketing für Augenoptiker und Hörakustiker: lokale Google-Anzeigen, Meta-Kampagnen für Sehtest- und Hörtest-Termine, Website und Recruiting. Fokuswerk aus Oldenburg.",
    kopf: {
      etikett: "[ BRANCHE · OPTIK & HÖRAKUSTIK ]", geist: "Optiker", marke: "SEHTEST · HÖRTEST · LOKALE ANZEIGEN",
      h1: "Werbung für [[Optiker]] und Hörakustiker, die Termine bringt.",
      lead: "Lokale Google-Anzeigen, Meta-Kampagnen für Sehtest und Hörtest und eine Website, auf der man direkt einen Termin anfragt — für inhabergeführte Fachgeschäfte, die gegen Ketten bestehen wollen.",
      bild: BILDU("photo-1486250944723-86bca2b15b06"), alt: "Brillenwand im Fachgeschäft",
      bildEtikett: "[ FACHGESCHÄFT STATT KETTE ]", bildTitel: "Beratung ist Ihr Vorteil. Sie muss nur gefunden werden.",
    },
    antwort: {
      frage: "Wie gewinnt ein [[Optiker]] neue Kunden?",
      absaetze: [
        "Brillen und Hörgeräte werden selten spontan gekauft — der Weg beginnt meist mit einem Termin: Sehtest, Hörtest, Beratung. Gutes Marketing für Optiker und Hörakustiker sorgt dafür, dass dieser Termin bei Ihnen gebucht wird und nicht bei der Kette im Einkaufszentrum.",
        "Fokuswerk verbindet dafür lokale Google-Anzeigen, Meta-Kampagnen im Umkreis Ihres Geschäfts und eine Website mit Terminanfrage — und misst, wie viele Termine daraus entstehen. Kampagnen für Augenoptiker haben wir bereits betreut.",
      ],
      fakten: FAKTEN("Google Ads, Meta Ads, Website, Recruiting, Foto und Video"),
    },
    probleme: [
      ["Ketten dominieren die Werbung", "Große Filialisten sind in jeder Suche und jedem Feed präsent. Das inhabergeführte Fachgeschäft mit der besseren Beratung wird dabei übersehen."],
      ["Der Weg zum Termin ist zu lang", "Wer einen Sehtest will, möchte ihn sofort anfragen — nicht erst Öffnungszeiten suchen und zurückrufen lassen."],
      ["Fachkräfte sind schwer zu finden", "Gute Augenoptiker und Hörakustiker werden überall gesucht. Stellenanzeigen allein bringen kaum Bewerbungen."],
    ],
    loesung: [
      ["Lokale Google-Anzeigen", "Suchanzeigen auf „Optiker“, „Sehtest“ oder „Hörgeräte“ plus Ort — begrenzt auf Ihr Einzugsgebiet, mit Messung von Anrufen und Terminanfragen.", "/leistungen/performance-marketing"],
      ["Kampagnen für Sehtest und Hörtest", "Meta-Anzeigen im Umkreis mit Motiven aus Ihrem Geschäft: neue Kollektion, Sonnenbrillen-Saison, Hörtest — jeweils mit direkter Terminanfrage und werberechtlich sauber formuliert.", "/leistungen/performance-marketing"],
      ["Website mit Terminanfrage", "Sortiment, Marken, Leistungen und Team — und ein Termin in wenigen Klicks. Schnell auf dem Handy und bei Google mit Ihrem Ort auffindbar.", "/leistungen/websites"],
    ],
    beispiel: {
      google: { firma: "Optik am Wall · Oldenburg", suche: "sehtest oldenburg", domain: "optik-am-wall.de › sehtest", headline: "Sehtest in Oldenburg — heute noch einen Termin", beschreibung: "Sehtest beim Meisterbetrieb. Ruhige Beratung, große Fassungsauswahl. Termin online anfragen.", links: ["Termin anfragen", "Kontaktlinsen", "Marken"], werte: [kw("Klickrate", 12.4, 1, " %"), kw("Ø Klickpreis", 0.78, 2, " €"), kw("Anfragen", 88, 0, "")] },
      meta: { titel: "Meta-Anzeige · Feed & Stories", firma: "Optik am Wall · Sehtest-Termine", absender: "Optik am Wall", schlagzeile: "Neue Brille vor dem Winter? Sehtest in 20 Minuten.", knopf: "Termin anfragen", bild: BILDU("photo-1542432389-a40026383873", 720), chips: [{ l: "Reichweite", w: "31.200" }, { l: "Klickrate", w: "1,9 %" }, { l: "Termine", w: "52", akz: true }] },
      cockpit: { titel: "Geschäfts-Cockpit", firma: "Optik am Wall · Google & Meta · 12 Wochen", kpis: [{ l: "Terminanfragen", w: 140, d: "+66 %" }, { l: "€ je Anfrage", w: 8.6, s: 2, n: " €", d: "−44 %" }, { l: "Werbebudget", w: 1200, n: " €", d: "12 Wochen" }, { l: "Brillenkäufe", w: 61, d: "Ø 480 € Warenkorb" }], anfragen: [6, 7, 8, 9, 10, 10, 12, 12, 13, 15, 17, 21], kosten: [15.4, 14.8, 13.9, 13, 12.1, 11.8, 10.9, 10.3, 9.8, 9.3, 8.9, 8.6] },
      trichter: { titel: "Vom Feed ins Geschäft", firma: "Sehtest-Kampagne · 3 Monate", stufen: [{ l: "Impressionen", w: 124000, anteil: 1 }, { l: "Klicks", w: 2640, anteil: 0.6, q: "2,1 %" }, { l: "Anfragen", w: 140, anteil: 0.38, q: "5,3 %" }, { l: "Käufe", w: 61, anteil: 0.24, q: "43,6 %" }] },
    },
    fragenTitel: "Was Optiker vorher [[wissen]] wollen.",
    fragen: [
      ["Was kostet Werbung für einen Optiker?", "Zwei Teile: das Werbebudget, das direkt an Google oder Meta geht, und unsere Betreuung. Wie hoch das Budget sein sollte, hängt von Ihrem Einzugsgebiet ab — das rechnen wir im Erstgespräch mit Ihren Zahlen durch. Danach bekommen Sie ein festes Angebot."],
      ["Gilt das Heilmittelwerbegesetz auch für Optiker und Hörakustiker?", "Brillen, Kontaktlinsen und Hörgeräte sind Medizinprodukte — für ihre Bewerbung gelten Regeln des Heilmittelwerbegesetzes. Wir formulieren Anzeigen sachlich und ohne Heilversprechen; die rechtliche Prüfung im Einzelfall ersetzt das nicht."],
      ["Lohnt sich Werbung gegen die großen Ketten?", "Ja, wenn sie lokal und präzise ist. Ketten werben breit und überregional, ein Fachgeschäft gewinnt im Umkreis weniger Kilometer — mit Beratung, Service und einem Termin, den man sofort anfragen kann."],
      ["Wie findet ein Optiker neue Mitarbeiter?", "Über Recruiting-Kampagnen auf Instagram und Facebook im Umkreis Ihres Geschäfts. Gute Augenoptiker und Hörakustiker sind angestellt und suchen nicht aktiv — sie reagieren aber auf eine Anzeige mit echten Bildern aus Ihrem Team und eine Bewerbung ohne Anschreiben."],
      OL_FRAGE,
    ],
    service: "Werbung und Marketing für Augenoptiker und Hörakustiker", zielgruppe: "Augenoptiker und Hörakustiker",
  },
};

async function neueSeite(pfad, name) {
  const t = "pg" + Math.random().toString(36).slice(2, 7);
  const r = await framer.agent.applyChanges(`+WebPageNode ${t} name="${name}" path="${pfad}"; +FrameNode ${t}d parent="${t}" name="Desktop";`);
  const page = r.renamedIds[t], D = r.renamedIds[t + "d"];
  const r2 = await framer.agent.applyChanges(`SET ${page} layoutTemplate="kydvDx4Fl";`);
  return { page, D, fehler: { ...(r.errors || {}), ...(r2.errors || {}) } };
}

async function holeSeite(pfad, name) {
  const pages = await framer.agent.getNodesOfTypes({ types: ["WebPageNode"] });
  const p = pages.find((x) => x.attributes?.path === pfad);
  if (!p) {
    const np = await neueSeite(pfad, name);
    const seite = { pfad, D: np.D };
    await breakpoints(seite);
    return { page: np.page, seite, fehler: np.fehler };
  }
  const s = await framer.agent.serialize({ id: p.id, depth: 1, attributeFilter: ["name"] });
  const bps = s.children || [];
  const D = bps.find((b) => b.name === "Desktop")?.id || bps[0].id;
  const seite = { pfad, D, T: bps.find((b) => b.name === "Tablet")?.id, P: bps.find((b) => b.name === "Phone")?.id };
  if (!seite.T) await breakpoints(seite);
  // vorhandenen Inhalt leeren
  const d = await framer.agent.getNode({ id: D }, { pagePath: pfad });
  const del = (d.children || []).map((c) => `DEL ${c.id};`).join(" ");
  if (del) await framer.agent.applyChanges(del, { pagePath: pfad });
  return { page: p.id, seite, fehler: {} };
}
async function baueBranche(key, comps) {
  const c = BRANCHEN[key];
  const np = await holeSeite(c.pfad, c.name);
  const seite = np.seite;
  const b = new Bau("br" + key.slice(0, 3), seite);
  b.seitenkopfB({ ...c.kopf, brot: [["Start", "/"], ["Branchen", "/branchen"], [c.name, null]] });
  b.antwort(c.antwort);
  b.dreiKartenL({ etikett: "[ WAS HÄUFIG KLEMMT ]", geist: "Ausgangslage", karten: c.probleme });
  b.dreiKartenL({ etikett: "[ WAS WIR DAFÜR BAUEN ]", geist: "Lösung", karten: c.loesung });
  const r1 = await b.commit(key + "-1");
  const b2 = new Bau("bs" + key.slice(0, 3), seite);
  b2.beispiel(c.beispiel, comps.beispiel);
  if (c.referenzen) b2.referenzen(c.referenzen);
  b2.ablauf();
  b2.fragen({ titel: c.fragenTitel, liste: c.fragen });
  b2.weitere(Object.entries(ALLE).filter(([k]) => k !== key).map(([, v]) => v));
  const url = "https://fokuswerk.de" + c.pfad;
  b2.schema(comps.schema, [
    { "@type": "Service", "@id": url + "#leistung", "name": c.service, "serviceType": c.service, "provider": { "@id": "https://fokuswerk.de/#organisation" }, "audience": { "@type": "BusinessAudience", "audienceType": c.zielgruppe }, "areaServed": [{ "@type": "City", "name": "Oldenburg" }, { "@type": "AdministrativeArea", "name": "Ammerland" }, { "@type": "AdministrativeArea", "name": "Ostfriesland" }, { "@type": "City", "name": "Bremen" }, { "@type": "Country", "name": "Deutschland" }], "url": url, "description": c.description },
    { "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Start", "item": "https://fokuswerk.de/" }, { "@type": "ListItem", "position": 2, "name": "Branchen", "item": "https://fokuswerk.de/branchen" }, { "@type": "ListItem", "position": 3, "name": c.name, "item": url }] },
    { "@type": "FAQPage", "@id": url + "#faq", "mainEntity": c.fragen.map(([f, a]) => ({ "@type": "Question", "name": f, "acceptedAnswer": { "@type": "Answer", "text": a } })) },
  ]);
  const r2 = await b2.commit(key + "-2");
  const a = await dupliziere("uQzcUyeMt", seite);
  const m = await framer.agent.applyChanges(`SET ${np.page} metadata.title="${q(c.title)}" metadata.description="${q(c.description)}" metadata.noIndex="true";`);
  return { key, seite, page: np.page, fehler: [np.fehler, r1.fehler, r1.fehlerOv, r2.fehler, r2.fehlerOv, a.fehler, m.errors || {}].map((x) => JSON.stringify(x)).filter((x) => x !== "{}") };
}
globalThis.BRANCHEN = BRANCHEN; globalThis.ALLE = ALLE; globalThis.baueBranche = baueBranche; globalThis.neueSeite = neueSeite; globalThis.holeSeite = holeSeite;
