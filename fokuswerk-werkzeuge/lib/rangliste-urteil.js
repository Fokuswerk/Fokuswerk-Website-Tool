// Aus der Messung wird eine Rangliste und ein Urteil.
//
// Getrennt vom Messen, weil Messen Geld kostet und Urteilen nicht: An der Bewertung
// lässt sich schrauben, ohne für jeden Versuch neu abzurufen.
//
// Zwei Regeln gelten in dieser Datei überall:
//
//   1. Jeder Satz, der eine Zahl behauptet, bekommt sie aus der Messung mitgeliefert.
//      Der Betrieb prüft seine Nachbarn gegen — in einem Ort mit vierzehn Werkstätten
//      kennt er zehn davon persönlich.
//   2. Über fremde Betriebe gibt es Zahlen, aber kein Urteil. Sie stehen mit Namen in
//      der Liste, weil die Namen den Beweis tragen; bewertet wird nur, wer das Werkzeug
//      selbst benutzt hat.

// Pluralformen lassen sich im Deutschen nicht aus Endungen ableiten. Der Versuch ergab
// live „15 Sanitäre", und im Freitextfeld entstanden „Autohause", „Karosseriebaue",
// „Reifenhandele" und „Physiotherapiee" — auf der Seite wie im PDF. Was hier nicht
// drinsteht, bekommt deshalb die neutrale Form „Betriebe": lieber allgemein als falsch.
const PLURAL = {
  autowerkstatt: "Autowerkstätten",
  kfzwerkstatt: "Kfz-Werkstätten",
  kfzreparatur: "Kfz-Werkstätten",
  autohaus: "Autohäuser",
  autohandel: "Autohändler",
  karosseriebau: "Karosseriebaubetriebe",
  lackiererei: "Lackierereien",
  reifenhandel: "Reifenhändler",
  dachdecker: "Dachdecker",
  bedachung: "Dachdeckerbetriebe",
  elektriker: "Elektriker",
  elektrotechnik: "Elektrobetriebe",
  maler: "Maler",
  malerei: "Malerbetriebe",
  tischlerei: "Tischlereien",
  schreinerei: "Schreinereien",
  sanitaer: "Sanitärbetriebe",
  heizung: "Heizungsbauer",
  shk: "SHK-Betriebe",
  klempnerei: "Klempnereien",
  zahnarzt: "Zahnarztpraxen",
  arzt: "Arztpraxen",
  physiotherapie: "Physiotherapiepraxen",
  friseur: "Friseure",
  kosmetik: "Kosmetikstudios",
  steinmetz: "Steinmetzbetriebe",
  gartenbau: "Gartenbaubetriebe",
  galabau: "Galabaubetriebe",
  fliesenleger: "Fliesenleger",
  zimmerei: "Zimmereien",
  bauunternehmen: "Bauunternehmen",
  baeckerei: "Bäckereien",
  metzgerei: "Metzgereien",
  optiker: "Optiker",
  hoerakustik: "Hörakustiker",
  apotheke: "Apotheken",
};

/**
 * Der Plural eines Gewerks — oder „Betriebe", wenn wir ihn nicht sicher kennen.
 *
 * Geraten wird hier nichts mehr. „15 Betriebe in Westerstede" ist allgemeiner als
 * „15 Karosseriebaue", aber es ist richtig, und falsch wiegt auf dieser Seite schwerer:
 * Wer einen Grammatikfehler in der Überschrift sieht, glaubt den Zahlen darunter weniger.
 */
export function plural(gewerk) {
  if (!gewerk) return "Betriebe";
  const schluessel = String(gewerk)
    .toLowerCase()
    .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z]/g, "");
  if (PLURAL[schluessel]) return PLURAL[schluessel];
  // Auch ein Teiltreffer hilft: „Kfz-Werkstatt Meier" trägt „kfzwerkstatt" in sich.
  for (const [k, v] of Object.entries(PLURAL)) {
    if (schluessel.includes(k) && k.length >= 6) return v;
  }
  return "Betriebe";
}

function median(werte) {
  const s = [...werte].sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const komma = (n) => String(n).replace(".", ",");

/** Rang heißt: wie viele sind echt besser, plus eins. Gleichstand teilt sich den Platz. */
function rang(wert, alle) {
  return alle.filter((w) => w > wert).length + 1;
}

// Namen vergleichen, ohne an Groß- und Kleinschreibung, Umlauten oder Interpunktion zu
// scheitern. Der Name kommt über drei Stationen herein — Eingabe des Besuchers, Treffer
// der Places-Suche, Profil in der Messung —, und ein exakter Stringvergleich hat genau
// dann „betrieb_unbekannt" gemeldet, wenn eine Station ein Komma oder ein „GmbH" mehr
// hatte als die andere.
export function nameGleich(a, b) {
  const k = (w) =>
    String(w || "")
      .toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "");
  const x = k(a);
  const y = k(b);
  if (!x || !y) return false;
  // Enthalten statt gleich: „Fokuswerk" gegen „Fokuswerk Online Marketing" ist derselbe
  // Betrieb. Die kürzere Seite muss dafür mindestens vier Zeichen haben, sonst trifft
  // „Bau" auf jeden Bauunternehmer im Ort.
  if (x === y) return true;
  const kurz = x.length <= y.length ? x : y;
  const lang = x.length <= y.length ? y : x;
  return kurz.length >= 4 && lang.startsWith(kurz);
}

export function bewerte(messung, { eigenerName } = {}) {
  const liste = [...messung.betriebe].sort((a, b) => b.bewertungen - a.bewertungen);
  liste.forEach((b, i) => { b.platz = i + 1; });

  const eigen =
    liste.find((b) => b.name === eigenerName) ||
    liste.find((b) => nameGleich(b.name, eigenerName)) ||
    null;
  const n = liste.length;

  const alleBewertungen = liste.map((b) => b.bewertungen);
  const alleFotos = liste.map((b) => b.fotos);
  const summe = alleBewertungen.reduce((s, w) => s + w, 0);
  const medianBewertungen = median(alleBewertungen);
  const medianFotos = median(alleFotos);
  const ohneWebsite = liste.filter((b) => !b.website).length;
  const nichtUebernommen = liste.filter((b) => !b.uebernommen).length;

  // Wer wirbt, und worum — und vor allem: wirbt er JETZT oder hat er mal?
  //
  // ▲ Das ist der Unterschied, an dem die Glaubwuerdigkeit dieser Seite haengt. In allen
  // neun vorgerechneten Orten lagen 55 Anzeigen, davon **keine einzige aktiv**; die
  // juengste in Westerstede endete am 17.02.2026. Die Seite sagte trotzdem „Genau einer
  // wirbt um Kunden". Ein Westersteder, der den Betrieb kennt, widerlegt das in zehn
  // Sekunden — und damit auch alle anderen Zahlen.
  // Betriebe ohne unterscheidenden Namensteil sind nicht geprüft, nicht „ohne Werbung".
  const metaPruefbar = liste.filter((b) => !b.metaUngemessen).length;
  const werbende = liste.filter((b) => b.anzeigen.length > 0);
  const umKunden = werbende.filter((b) => b.anzeigen.some((a) => !a.personal));
  const umKundenAktiv = werbende.filter((b) => b.anzeigen.some((a) => !a.personal && a.aktiv));
  const nurPersonal = werbende.filter((b) => b.anzeigen.every((a) => a.personal));
  // Wann lief die letzte Anzeige, die um Kunden warb?
  const letzteKundenwerbung = umKunden
    .flatMap((b) => b.anzeigen.filter((a) => !a.personal).map((a) => a.bis || a.von))
    .filter(Boolean)
    .sort()
    .at(-1) || null;

  // Google Ads, seit 29.10.2026. Getrennt gezaehlt und nicht mit Meta verrechnet: Es sind
  // zwei Kanaele mit zwei Entscheidungen dahinter, und wer bei Google wirbt, wirbt in aller
  // Regel nicht bei Meta. Geprueft werden kann nur, wer eine eigene Domain hat — `googlePruefbar`
  // sagt, auf wie viele Betriebe sich die Zahl ueberhaupt bezieht.
  // Geprüft ist nur, wer eine Domain hat UND bei wem die Quelle geantwortet hat.
  const googlePruefbar = liste.filter((b) => b.domain && !b.googleUngemessen).length;
  const beiGoogle = liste.filter((b) => (b.googleAnzeigen || []).length > 0);

  const markt = {
    anzahl: n,
    googlePruefbar,
    metaPruefbar,
    googleGemessen: messung.googleVerfuegbar === true,
    beiGoogle: beiGoogle.length,
    bewertungenGesamt: summe,
    medianBewertungen,
    medianFotos,
    ohneWebsite,
    nichtUebernommen,
    werbende: werbende.length,
    umKunden: umKunden.length,
    umKundenAktiv: umKundenAktiv.length,
    letzteKundenwerbung,
    nurPersonal: nurPersonal.length,
    spitze: liste[0] || null,
  };

  if (!eigen) return { liste, markt, eigen: null, befunde: [], einordnung: null };

  // Ab welcher Bewertungszahl ist ein Schnitt überhaupt aussagekräftig? Ein Betrieb mit
  // einer einzigen Bewertung steht bei 5,0 — das ist kein Qualitätsurteil, sondern ein
  // Einzelfall. Die Schwelle hält solche Werte aus dem Vergleich heraus.
  const SCHWELLE = Math.max(10, Math.min(40, Math.round(medianBewertungen * 0.75)));
  const belastbar = liste.filter((b) => b.bewertungen >= SCHWELLE && b.schnitt != null);
  const besterBelastbarerSchnitt = belastbar.length
    ? Math.max(...belastbar.map((b) => b.schnitt))
    : null;

  const ueberIhm = liste.filter((b) => b.platz < eigen.platz);
  const raenge = {
    bewertungen: eigen.platz,
    fotos: rang(eigen.fotos, alleFotos),
    schnitt: eigen.schnitt != null ? rang(eigen.schnitt, liste.map((b) => b.schnitt ?? 0)) : null,
  };

  const befunde = [];

  // ── Profil nicht übernommen: der schwerste Befund, den es hier gibt ────────────
  if (!eigen.uebernommen) {
    befunde.push({
      art: "mangel",
      titel: "Ihr Google-Profil gehört Ihnen nicht",
      messwert:
        `Gemessen: Google bietet Ihr Profil zur Übernahme an. ${nichtUebernommen} von ${n} ` +
        `${plural(messung.gewerk)} im Ort sind in derselben Lage.`,
      klartext:
        "Der Eintrag existiert, aber niemand hat ihn beansprucht. Sie können weder Fotos " +
        "hochladen noch Öffnungszeiten korrigieren noch auf Bewertungen antworten — und " +
        "Google zeigt daneben jedem Besucher an, dass hier ein Inhaber fehlt.",
      folge: "Das ist der einzige Punkt in dieser Auswertung, der alle anderen blockiert.",
    });
  }

  // ── Website im Profil ─────────────────────────────────────────────────────────
  if (!eigen.website) {
    const obenMit = ueberIhm.filter((b) => b.website).length;
    befunde.push({
      art: "mangel",
      titel: "In Ihrem Google-Profil fehlt der Internetauftritt",
      messwert:
        `Gemessen: kein Eintrag im Feld Website.` +
        (ueberIhm.length
          ? ` ${obenMit} der ${ueberIhm.length} Betriebe über Ihnen haben dort einen.`
          : ` ${n - ohneWebsite} von ${n} Betrieben im Ort haben dort einen.`),
      klartext:
        "Wer Sie bei Google findet, bekommt Adresse und Telefonnummer — aber keinen Weg, " +
        "sich vorher ein Bild zu machen.",
      folge: "Wer vorher vergleichen will, vergleicht die anderen.",
    });
  }

  // ── Fotos ─────────────────────────────────────────────────────────────────────
  if (eigen.fotos === 0) {
    const mitFotos = liste.filter((b) => b.fotos > 0).length;
    befunde.push({
      art: "mangel",
      titel: "Kein einziges Foto in Ihrem Profil",
      messwert:
        `Gemessen: 0 Fotos. Die Hälfte der Betriebe im Ort hat mehr als ${komma(medianFotos)}, ` +
        `der Spitzenwert liegt bei ${Math.max(...alleFotos)}.`,
      klartext:
        "Wer Ihren Eintrag öffnet, sieht nur Text — keine Werkstatt, kein Team, kein Fahrzeug.",
      folge: `${mitFotos} Betriebe im Ort zeigen, wie es bei ihnen aussieht. Sie nicht.`,
    });
  } else if (eigen.fotos < medianFotos) {
    befunde.push({
      art: "luecke",
      titel: eigen.fotos === 1 ? "Nur ein Foto in Ihrem Profil" : `Nur ${eigen.fotos} Fotos in Ihrem Profil`,
      messwert: `Gemessen: ${eigen.fotos}. Mitte im Ort: ${komma(medianFotos)}, Spitzenwert: ${Math.max(...alleFotos)}.`,
      klartext:
        "Genug, dass der Eintrag nicht leer wirkt — zu wenig, um einen Eindruck zu hinterlassen.",
      folge: "Zehn Bilder vom Betrieb sind eine Stunde Arbeit, einmalig.",
    });
  }

  // ── Abstand nach oben ─────────────────────────────────────────────────────────
  if (eigen.platz > 1 && liste[0]) {
    const abstand = liste[0].bewertungen - eigen.bewertungen;
    const besserBewertet = ueberIhm.filter((b) => (b.schnitt ?? 0) > (eigen.schnitt ?? 0)).length;
    befunde.push({
      art: "luecke",
      titel: `${abstand} Bewertungen Abstand zum Ersten`,
      messwert:
        `Gemessen: ${eigen.bewertungen} Bewertungen. Platz 1 hat ${liste[0].bewertungen}, ` +
        `die Mitte des Ortes liegt bei ${komma(medianBewertungen)}.`,
      klartext:
        besserBewertet === 0
          ? "Keiner der Betriebe über Ihnen ist besser bewertet als Sie — sie sind nur öfter " +
            "bewertet. Das ist der Unterschied, der diese Liste sortiert."
          : `Von den ${ueberIhm.length} Betrieben über Ihnen sind ${besserBewertet} auch besser ` +
            "bewertet. Bei den übrigen ist es allein die Zahl.",
      folge: "Jeder zufriedene Kunde, der nichts schreibt, ist ein Platz, der liegen bleibt.",
    });
  }

  // ── Was für ihn spricht ───────────────────────────────────────────────────────
  if (
    eigen.schnitt != null &&
    besterBelastbarerSchnitt != null &&
    eigen.bewertungen >= SCHWELLE &&
    eigen.schnitt >= besterBelastbarerSchnitt
  ) {
    const teilen = belastbar.filter((b) => b.schnitt === eigen.schnitt && b.name !== eigen.name).length;
    const duennere = liste.filter((b) => (b.schnitt ?? 0) > eigen.schnitt && b.bewertungen < SCHWELLE);
    befunde.push({
      art: "gut",
      titel: "Ihr Schnitt ist der höchste im Ort",
      messwert:
        `Gemessen: ${komma(eigen.schnitt.toFixed(1))} bei ${eigen.bewertungen} Bewertungen. Unter den ` +
        `${belastbar.length} Betrieben mit mindestens ${SCHWELLE} Bewertungen gibt es keinen besseren Wert.`,
      klartext:
        (duennere.length
          ? `${duennere.length} Betriebe im Ort stehen höher — alle mit weniger als ${SCHWELLE} ` +
            "Bewertungen, wo ein einzelnes Urteil den ganzen Schnitt macht. "
          : "") +
        (teilen
          ? `Unter den belastbaren Werten teilen Sie den höchsten mit ${teilen} ${teilen === 1 ? "weiteren Betrieb" : "weiteren Betrieben"}.`
          : "Unter den belastbaren Werten steht keiner höher als Sie."),
      folge: "Die Arbeit stimmt. Es sieht sie nur keiner.",
    });
  }

  // ── Wenn am Profil nichts mehr zu holen ist ───────────────────────────────────
  // Ein gepflegter Spitzenreiter bekäme sonst eine Auswertung mit zwei Zeilen. Dass bei
  // ihm nichts zu finden ist, ist selbst der Befund — und es ist derselbe Übergang, auf
  // den die ganze Auswertung hinausläuft, nur eine Stufe früher erreicht.
  if (!befunde.some((b) => b.art === "mangel" || b.art === "luecke")) {
    befunde.push({
      art: "gut",
      titel: "An Ihrem Profil ist nichts mehr zu holen",
      messwert:
        `Gemessen: Platz ${eigen.platz} von ${n} nach Bewertungen, ${eigen.fotos} Fotos ` +
        `(Mitte im Ort: ${komma(medianFotos)}), Internetauftritt eingetragen, Profil übernommen.`,
      klartext:
        "Die Punkte, an denen die meisten Betriebe in dieser Liste verlieren, haben Sie erledigt. " +
        "Damit endet, was sich über das Google-Profil erreichen lässt.",
      folge: "Ab hier geht es nicht mehr um Gefundenwerden, sondern um Nachfrage.",
    });
  }

  // ── Die Anzeigenlage ──────────────────────────────────────────────────────────
  const anzeigenbefund = anzeigenlageBefund(messung, markt, eigen, n);

  return {
    liste,
    markt,
    eigen,
    raenge,
    befunde,
    anzeigen: anzeigenbefund,
    einordnung: einordnen(eigen, liste, ueberIhm, {
      belastbar: eigen.bewertungen >= SCHWELLE && eigen.schnitt != null,
    }),
  };
}

// „im Dezember 2025" aus einem ISO-Datum. Nur Monat und Jahr, weil der Tag, an dem eine
// Anzeige endete, niemanden interessiert — das Jahr dagegen sehr wohl.
export function monatJahr(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return "im " + d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

function anzeigenlageBefund(messung, markt, eigen, n) {
  if (!messung.anzeigenVerfuegbar) return null;

  const eigeneAnzeigen = eigen.anzeigen.length;
  const treffer = messung.betriebe
    .filter((b) => b.anzeigen.length && b.name !== eigen.name)
    .map((b) => ({
      wer: b.name,
      platz: b.platz,
      anzahl: b.anzeigen.length,
      personal: b.anzeigen.every((a) => a.personal),
      aktiv: b.anzeigen.some((a) => a.aktiv),
      von: b.anzeigen.map((a) => a.von).filter(Boolean).sort()[0] || null,
      bis: b.anzeigen.map((a) => a.bis).filter(Boolean).sort().at(-1) || null,
      text: b.anzeigen.find((a) => a.text)?.text || null,
      id: b.anzeigen[0]?.id || null,
    }));

  // Der Satz, der das Bild macht. Drei Lagen, drei verschiedene Aussagen — und jede
  // davon trägt ein Gespräch, auch die mittlere.
  let zahl;
  let zahlText;
  if (markt.umKunden === 0 && markt.werbende === 0) {
    zahl = "0";
    zahlText = `von ${n} Betrieben in ${messung.ort} hat je bei Meta geworben.`;
  } else if (markt.umKunden === 0) {
    zahl = String(markt.werbende);
    zahlText =
      `von ${n} Betrieben in ${messung.ort} hat überhaupt je bei Meta geworben. ` +
      "Um Kunden geworben hat keiner.";
  } else if (!markt.umKundenAktiv) {
    // Der haeufigste Fall, und der, den die Seite monatelang falsch beschrieben hat: Es gibt
    // Anzeigen, aber keine laeuft noch. Praesens wird hier zur Falschaussage.
    zahl = String(markt.umKunden);
    const wann = monatJahr(markt.letzteKundenwerbung);
    zahlText =
      `von ${n} Betrieben in ${messung.ort} haben schon einmal um Kunden geworben` +
      (wann ? `, zuletzt ${wann}` : "") +
      ". Gerade läuft keine Anzeige.";
  } else {
    zahl = String(markt.umKundenAktiv);
    zahlText =
      `von ${n} Betrieben in ${messung.ort} werben gerade um Kunden.` +
      (eigeneAnzeigen ? "" : " Sie nicht.");
  }

  const befund =
    markt.umKunden === 0
      ? {
          art: "luecke",
          titel: `Um Kunden wirbt in ${messung.ort} niemand`,
          messwert:
            `Geprüft: ${n} von ${n} Betrieben. Gefunden: ` +
            (markt.werbende
              ? `${markt.werbende} ${markt.werbende === 1 ? "Werbetreibender" : "Werbetreibende"}, ` +
                `${markt.nurPersonal === markt.werbende ? "ausschließlich mit Stellenanzeigen" : "keiner davon mit Kundenwerbung"}.`
              : "keiner."),
          klartext:
            `In ${messung.ort} konkurriert niemand um die Aufmerksamkeit potenzieller Kunden — ` +
            "weder bei Facebook noch bei Instagram.",
          folge: "Wer hier zuerst wirbt, hat keinen Wettbewerb um den Platz.",
        }
      : eigeneAnzeigen
        ? {
            art: "gut",
            titel: "Sie werben, die meisten hier nicht",
            messwert: `Gemessen: ${markt.umKunden} von ${n} Betrieben werben um Kunden, Sie gehören dazu.`,
            klartext:
              "Sie sind damit in der Minderheit — und zwar in der, die sichtbar ist, wenn jemand " +
              "gerade nicht aktiv sucht.",
            folge: "Die Frage ist nicht mehr ob, sondern wie gut.",
          }
        : {
            art: "mangel",
            titel: `${markt.umKunden} ${markt.umKunden === 1 ? "Betrieb wirbt" : "Betriebe werben"} um Ihre Kunden`,
            messwert: `Geprüft: ${n} von ${n} Betrieben. ${markt.umKunden} davon werben um Kunden, Sie nicht.`,
            klartext:
              "Diese Betriebe erreichen Leute, die gerade gar nicht suchen. Sie erreichen nur die, " +
              "die von sich aus bei Google nachschauen.",
            folge: "Wer nicht wirbt, wartet.",
          };

  // Google Ads als eigener Befund, seit 29.10.2026. Nicht mit Meta verrechnet: Wer bei
  // Google wirbt, kauft Leute ab, die gerade suchen — wer bei Meta wirbt, Leute, die nicht
  // suchen. Das sind zwei Aussagen, und die zweite ist fuer einen Handwerksbetrieb
  // regelmaessig die unangenehmere.
  const pruefbar = markt.googlePruefbar || 0;
  const eigenerBeiGoogle = eigen && (eigen.googleAnzeigen || []).length > 0;
  // ▲ Ohne gelungene Messung gibt es keinen Google-Befund.
  //
  // Vorher stand bei einem Fehlschlag der Quelle „Bei Google wirbt in Oldenburg niemand"
  // — und in der Tabelle bei jedem Betrieb „keine". Gemeldet am 30.10.2026 von dem
  // Betrieb, dessen eigene Anzeige in dem Moment lief. Eine ausgefallene Messung ist
  // kein Messergebnis.
  const googleGemessen = messung.googleVerfuegbar === true;
  const googleBefund = !pruefbar || !googleGemessen
    ? null
    : markt.beiGoogle === 0
      ? {
          art: "luecke",
          titel: `Bei Google wirbt in ${messung.ort} niemand`,
          messwert: `Geprüft: die ${pruefbar} Betriebe mit eigener Website. Gefunden: keiner.`,
          klartext:
            "Wer bei Google sucht, bekommt hier ausschließlich die unbezahlten Ergebnisse zu " +
            "sehen. Über den Platz ganz oben entscheidet derzeit niemand mit Geld.",
          folge: "Der Platz über dem ersten Ergebnis ist frei.",
        }
      : eigenerBeiGoogle
        ? {
            art: "gut",
            titel: "Sie werben bei Google",
            messwert: `Gemessen: ${markt.beiGoogle} von ${pruefbar} geprüften Betrieben werben bei Google, Sie gehören dazu.`,
            klartext:
              "Sie sind damit bei denen dabei, die über dem ersten Suchergebnis stehen, wenn " +
              "jemand gerade nach Ihrer Leistung sucht.",
            folge: "Die Frage ist nicht mehr ob, sondern zu welchem Preis je Anfrage.",
          }
        : {
            art: "mangel",
            titel: `${markt.beiGoogle} ${markt.beiGoogle === 1 ? "Betrieb wirbt" : "Betriebe werben"} bei Google über Ihnen`,
            messwert: `Geprüft: die ${pruefbar} Betriebe mit eigener Website. ${markt.beiGoogle} ${markt.beiGoogle === 1 ? "davon wirbt" : "davon werben"} bei Google, Sie nicht.`,
            klartext:
              "Sucht jemand in Ihrer Gegend nach Ihrer Leistung, stehen diese Betriebe über dem " +
              "ersten unbezahlten Ergebnis — also über Ihnen, unabhängig davon, wie gut Ihre " +
              "Seite ist.",
            folge: "Das trifft genau die Leute, die gerade einen Auftrag zu vergeben haben.",
          };

  return {
    zahl,
    zahlText,
    treffer,
    befund,
    googleBefund,
    unsicher: messung.anzeigenUnsicher || [],
    googleUnsicher: messung.googleUnsicher || [],
  };
}

// Der Einordnungssatz steht ganz oben auf dem Deckblatt und ist der erste, den jemand
// liest. Er muss zur Lage passen: „Sie stehen nicht hinten, weil Ihre Arbeit schlechter
// wäre" ist für Platz 2 von 14 Unsinn, und bei einem Betrieb mit fünf Bewertungen ist
// „keiner hat einen besseren Schnitt" zwar wahr, sagt aber nichts — sein 5,0 ist ein
// Einzelurteil, kein Qualitätsnachweis. Deshalb hängt der Zusatz an der Belastbarkeit.
function einordnen(eigen, liste, ueberIhm, { belastbar } = {}) {
  const n = liste.length;
  const anteil = eigen.platz / n;
  const wort =
    eigen.platz === 1 ? "Platz eins"
    : anteil <= 0.25 ? "Oberes Viertel"
    : anteil <= 0.5 ? "Obere Hälfte"
    : anteil <= 0.75 ? "Unteres Mittelfeld"
    : "Unteres Viertel";

  if (eigen.platz === 1) {
    return {
      wort,
      satz:
        "Kein Betrieb in Ihrem Ort hat mehr Bewertungen als Sie. Die Frage ist ab hier nicht " +
        "mehr, ob man Sie findet — sondern wie viele Leute überhaupt suchen.",
    };
  }

  const darunter = n - eigen.platz;
  const kopf =
    `${ueberIhm.length} ${ueberIhm.length === 1 ? "Betrieb hat" : "Betriebe haben"} mehr ` +
    `Bewertungen als Sie, ${darunter} weniger. `;

  const besserBewertet = ueberIhm.filter((b) => (b.schnitt ?? 0) > (eigen.schnitt ?? 0)).length;
  const obereHaelfte = anteil <= 0.5;

  // Den Schnitt nur dann ins Feld führen, wenn er auf genug Bewertungen steht.
  if (!belastbar) {
    return {
      wort,
      satz:
        kopf +
        (obereHaelfte
          ? "Nach oben ist es von hier aus nicht mehr weit — es fehlen Bewertungen, nicht Qualität."
          : "Ihr Schnitt steht bisher auf zu wenigen Bewertungen, um im Ort zu zählen. Das ist " +
            "die erste Stellschraube."),
    };
  }

  if (besserBewertet === 0) {
    return {
      wort,
      satz:
        kopf +
        (obereHaelfte
          ? "Keiner davon ist besser bewertet als Sie — sie sind nur öfter bewertet."
          : "Keiner davon hat einen besseren Schnitt. Sie stehen also nicht hinten, weil Ihre " +
            "Arbeit schlechter wäre — sondern weil weniger Leute davon wissen."),
    };
  }

  return {
    wort,
    satz:
      kopf +
      `${besserBewertet} davon ${besserBewertet === 1 ? "ist" : "sind"} auch besser bewertet, ` +
      `die übrigen ${ueberIhm.length - besserBewertet} nicht.`,
  };
}
