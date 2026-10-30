// Die Stellenausschreibung als PDF.
//
// Warum ein PDF: Der Inhaber leitet das weiter — an die Frau im Büro, die es einstellt,
// oder an den Sohn, der die Anzeige schaltet. Eine Mail weiterzuleiten heißt, unseren
// Verkaufstext mitzuschicken. Ein PDF ist ein Dokument: Es hat einen Titel, Seitenzahlen
// und einen Absender, man kann es ausdrucken und auf den Tisch legen.
//
// Dieselbe Haussprache wie seo-analyse-pdf.js, bewusst als eigene Datei: Die beiden
// Berichte haben nichts gemeinsam außer der Optik, und ein gemeinsamer Satzbaukasten
// hätte jede Änderung am einen zum Risiko für das andere gemacht.

import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { KANAL_ZEICHEN, MARKENHINWEIS, SATZHOEHE } from "./marken.js";

const WURZEL = dirname(dirname(fileURLToPath(import.meta.url)));
// Pfade und Registriernamen getrennt halten. Vorher schrieb die Funktion die Namen in
// SCHRIFT zurueck — beim ZWEITEN Aufruf in derselben Instanz bekam registerFont dann
// den Namen statt des Pfads und stuerzte mit ENOENT ab. Ein Serverless-Container
// bedient mehrere Anfragen, also war das kein theoretischer Fall.
const PFADE = {
  normal: join(WURZEL, "schriften", "Inter-Regular.ttf"),
  mittel: join(WURZEL, "schriften", "Inter-Medium.ttf"),
  halbfett: join(WURZEL, "schriften", "Inter-SemiBold.ttf"),
};

const SCHRIFT = { normal: "n", mittel: "m", halbfett: "h" };

const TINTE = "#0E0F12";
const LEISE = "#6B6A6E";
const STILL = "#9A9A9D";
const LINIE = "#E4E1DB";
const AKZENT = "#B84116";

const DUNKEL = "#17161B";
const PAPIER_HELL = "#F5F3EF";
const P70 = "#B8B5B2";
const P45 = "#86837F";
const SIGNAL = "#FF5A1F";
const ORANGE_HELL = "#FF7341";

const RAND = 54;
const BREITE = 595.28 - RAND * 2;
const FUSS = 72;

function neueSeite(d, zustand) {
  d.addPage();
  zustand.seite += 1;
  // Der laufende Kolumnentitel: Auf einer Seite ohne Bandkopf steht oben links weiter
  // der Abschnitt, in dem man ist. Wer blättert, sieht sonst nur „Stellenausschreibung"
  // und muss zurücksuchen, wohin der Text gehört.
  if (zustand.kopf) zustand.kopf[zustand.seite] = zustand.abschnitt || null;
  zustand.bandAufSeite = false;
  d.x = RAND;
  return RAND;
}

function platzPruefen(d, zustand, hoehe) {
  if (d.y + hoehe < 842 - FUSS) return;
  neueSeite(d, zustand);
}

function versal(d, text, farbe = STILL, groesse = 8) {
  d.font(SCHRIFT.halbfett).fontSize(groesse).fillColor(farbe)
    .text(String(text).toUpperCase(), RAND, d.y, { characterSpacing: 1.1, width: BREITE });
}

// Die Zeichen der Kanäle, als Pfade gesetzt (siehe lib/marken.js).
//
// Gezeichnet wird mit svg-to-pdfkit. Der Grafikzustand wird um jedes Zeichen gesichert:
// Die Bibliothek setzt Füllfarbe und Transformationen selbst, und ohne save/restore
// schreibt der nächste Textblock in der Farbe des zuletzt gezeichneten Logos weiter.
// Jedes Zeichen bekommt seine eigene Höhe (siehe SATZHOEHE): rechnerisch gleich hoch
// gesetzt wirkt der Schriftzug mit Claim darunter kleiner als der ohne.
const satzhoehe = (z, grund) => (SATZHOEHE[z.name] || 12) * (grund / 12);

function zeichenBreite(liste, grund) {
  const lueckeN = Math.max(0, liste.length - 1);
  return liste.reduce((s, z) => s + z.verhaeltnis * satzhoehe(z, grund), 0) + lueckeN * 8;
}

function zeichenSetzen(d, liste, x, y, grund) {
  let xx = x;
  // An der Mittellinie ausgerichtet, nicht an der Oberkante: Sonst tanzen zwei Zeichen
  // mit verschiedenen Höhen in derselben Reihe.
  for (const z of liste) {
    const hoehe = satzhoehe(z, grund);
    const breite = z.verhaeltnis * hoehe;
    const versatz = (grund - hoehe) / 2;
    d.save();
    try {
      SVGtoPDF(d, z.svg, xx, y + versatz, { width: breite, height: hoehe, assumePt: true });
    } catch (e) {
      // Ein Zeichen, das nicht aufgeht, darf das Dokument nicht kosten.
    }
    d.restore();
    xx += breite + 8;
  }
  return xx - x - 8;
}

// Zeilen selbst brechen.
//
// pdfkit trennt nach den Unicode-Umbruchregeln auch am Schrägstrich. „Landschaftsgärtner
// (m/w/d)." wurde damit zu „(m/" am Zeilenende und „w/d)." in der nächsten — in einem
// Text, den der Betrieb markiert, kopiert und als Anzeige einstellt, liest sich das wie
// ein Tippfehler. Hier wird nur am Leerzeichen gebrochen; ein Wort, das allein nicht in
// die Spalte passt (eine lange Adresse etwa), wird zeichenweise getrennt.
function zeilenBrechen(d, text, breite) {
  const zeilen = [];
  let aktuell = "";
  for (const wort of String(text).split(/\s+/).filter(Boolean)) {
    const versuch = aktuell ? aktuell + " " + wort : wort;
    if (d.widthOfString(versuch) <= breite) {
      aktuell = versuch;
      continue;
    }
    if (aktuell) zeilen.push(aktuell);
    if (d.widthOfString(wort) <= breite) {
      aktuell = wort;
      continue;
    }
    let rest = wort;
    while (d.widthOfString(rest) > breite) {
      let schnitt = rest.length - 1;
      while (schnitt > 1 && d.widthOfString(rest.slice(0, schnitt)) > breite) schnitt--;
      zeilen.push(rest.slice(0, schnitt));
      rest = rest.slice(schnitt);
    }
    aktuell = rest;
  }
  if (aktuell) zeilen.push(aktuell);
  return zeilen;
}

// Text, der in eine Spalte passen muss. `lineBreak: false` allein reicht nicht: pdfkit
// bricht trotzdem um, wenn ein Wort nicht mehr hineingeht — im Wegweiser lief die
// Beschreibung dann in die Zeile darunter.
function aufBreite(d, text, breite) {
  const roh = String(text || "");
  if (d.widthOfString(roh) <= breite) return roh;
  let kurz = roh;
  while (kurz.length > 1 && d.widthOfString(kurz + " …") > breite) {
    kurz = kurz.slice(0, -1);
  }
  return kurz.replace(/[\s·,]+$/, "") + " …";
}

// Eine helle Kachel mit dem Zeichen darin — fremde Marken bleiben in ihren Farben, und
// die brauchen hellen Grund. Gibt die Breite der Kachel zurück.
function markenkachel(d, liste, text, x, y, { hoehe = 28, zeichenHoehe = 12 } = {}) {
  const polster = 10;
  const innen = liste && liste.length
    ? zeichenBreite(liste, zeichenHoehe)
    : d.font(SCHRIFT.mittel).fontSize(9).widthOfString(text || "");
  const breite = innen + polster * 2;
  d.save();
  d.roundedRect(x, y, breite, hoehe, 5).fillColor(PAPIER_HELL).fill();
  d.restore();
  if (liste && liste.length) {
    zeichenSetzen(d, liste, x + polster, y + (hoehe - zeichenHoehe) / 2, zeichenHoehe);
  } else {
    d.font(SCHRIFT.mittel).fontSize(9).fillColor(TINTE)
      .text(text || "", x + polster, y + (hoehe - 9) / 2 + 0.5, { width: innen + 2, lineBreak: false });
  }
  return breite;
}

// Wo die Plattform abschneidet, liegt selten eine Wortgrenze. Hart bei Zeichen 125 zu
// trennen las sich im Druck wie ein Tippfehler („Harpst … mehr edt"), deshalb zurück bis
// zum letzten Leerzeichen — nur wenn eines in Reichweite ist, sonst bleibt es hart.
function schnittstelle(text, grenze) {
  if (text.length <= grenze) return grenze;
  const raum = text.lastIndexOf(" ", grenze);
  return raum > grenze - 18 ? raum : grenze;
}

const einzeilig = (w) => (typeof w === "string" ? w.replace(/[ \t]+/g, " ").trim() : w);

// Der Zeichenzaehler eines Feldes. Bei einer harten Grenze zaehlt er, bei einer
// Schnittmarke sagt er, wo die Plattform abschneidet — das ist etwas anderes, und als
// „zu lang" ausgegeben waere es schlicht falsch.
function zaehlerText(f) {
  if (!f.grenze) return null;
  const n = String(f.wert || "").length;
  if (f.grenzeArt === "max") {
    return n + " von " + f.grenze + " Zeichen" + (n > f.grenze ? " — bitte kürzen" : "");
  }
  return "im Feed sichtbar: die ersten " + f.grenze + " Zeichen";
}

// Ein Feld: Beschriftung mit Zaehler, darunter der Wert. Beim Primaertext wird der
// sichtbare Anfang dunkel und der Rest hell gesetzt, damit man sieht, ob der Aufhaenger
// vorn steht.
// Ein Feld.
//
// Was der Betrieb übernimmt, steht in einer Karte: heller Grund, schmale Akzentkante
// links. Was er nur liest — Anleitungsschritte, Wochenplan, Drehbuch (`ohneKopie`) —
// steht frei im Satz. Vorher sah beides gleich aus, und auf einer Seite mit zehn
// Anleitungsschritten und drei Anzeigentexten war nicht zu erkennen, was wohin gehört.
//
// Die Karte wird nur gezeichnet, wenn der Text auf eine Seite passt. Ein Kasten, der
// über den Seitenwechsel läuft, hätte oben einen Deckel und unten keinen.
function feldSetzen(d, zustand, f) {
  let grauErklaeren = false;
  const wert = String(f.wert || "");
  const absaetze = wert.split(/\n+/).filter(Boolean);
  const polster = 14;
  const innen = BREITE - polster * 2 - 4;
  const alsKarte = !f.ohneKopie && absaetze.length > 0;
  const breiteText = alsKarte ? innen : BREITE;
  d.font(SCHRIFT.normal).fontSize(10);
  const zeilenhoehe = d.currentLineHeight(true) + 1.5;
  const satz = absaetze.map((a) => zeilenBrechen(d, a, breiteText));
  const hWert = satz.reduce((s, zeilen) => s + zeilen.length * zeilenhoehe + 5, 0);
  platzPruefen(d, zustand, hWert + (alsKarte ? 52 : 30));

  const y = d.y;
  d.font(SCHRIFT.halbfett).fontSize(7).fillColor(STILL)
    .text(String(f.etikett || "").toUpperCase(), RAND, y, { characterSpacing: 1.1, width: BREITE - 160, lineBreak: false });
  const z = zaehlerText(f);
  if (z) {
    const drueber = f.grenzeArt === "max" && wert.length > f.grenze;
    d.font(SCHRIFT.normal).fontSize(7).fillColor(drueber ? AKZENT : STILL)
      .text(z, RAND, y, { width: BREITE, align: "right", lineBreak: false });
  }
  d.y = y + 13;

  // Passt die Karte nicht mehr aufs Blatt, wird sie ohne Grund gesetzt.
  const karte = alsKarte && d.y + hWert + 26 < 842 - FUSS;
  const links = karte ? RAND + polster + 4 : RAND;
  const breite = karte ? innen : BREITE;
  if (karte) {
    const hoehe = hWert + 20;
    d.save();
    d.roundedRect(RAND, d.y, BREITE, hoehe, 5).fillColor(PAPIER_HELL).fill();
    d.roundedRect(RAND, d.y, 2.5, hoehe, 1.2).fillColor(AKZENT).fill();
    d.restore();
    d.y += 11;
  }

  // Die Grenze, ab der Facebook den Rest einklappt — als Zeichenposition im ganzen Wert.
  const schnitt = f.grenzeArt === "schnitt" && f.grenze;
  const grenzeAb = schnitt ? schnittstelle(wert, f.grenze) : -1;
  let gelesen = 0;
  d.font(SCHRIFT.normal).fontSize(10);
  for (let i = 0; i < absaetze.length; i++) {
    for (const zeile of satz[i]) {
      // Position dieser Zeile im Gesamtwert. Die Wortgrenzen sind beim Brechen erhalten
      // geblieben, die Zeichenzahl stimmt also bis auf zusammengefasste Leerräume.
      const beginn = gelesen;
      gelesen += zeile.length + 1;
      const y = d.y;
      if (!schnitt || beginn >= grenzeAb) {
        d.fillColor(schnitt ? STILL : TINTE).text(zeile, links, y, { width: breite, lineBreak: false });
      } else if (gelesen - 1 <= grenzeAb) {
        d.fillColor(TINTE).text(zeile, links, y, { width: breite, lineBreak: false });
      } else {
        // Die Grenze liegt mitten in dieser Zeile: davor dunkel, dahinter grau, dazwischen
        // der Strich. Hier stand früher „ … mehr " in Akzentfarbe — die Nachbildung des
        // Facebook-Knopfes, nach der auf Papier tatsächlich getippt wurde.
        const teiler = grenzeAb - beginn;
        d.fillColor(TINTE).text(zeile.slice(0, teiler), links, y, { width: breite, lineBreak: false, continued: true });
        d.fillColor(STILL).text(" | ", { continued: true });
        d.fillColor(STILL).text(zeile.slice(teiler), { lineBreak: false });
        grauErklaeren = true;
      }
      if (schnitt && gelesen - 1 > grenzeAb) grauErklaeren = true;
      d.y = y + zeilenhoehe;
      d.x = RAND;
    }
    d.y += 5;
  }
  if (karte) d.y += 9;
  if (grauErklaeren && !zustand.grauErklaert) {
    zustand.grauErklaert = true;
    d.font(SCHRIFT.normal).fontSize(7.5).fillColor(STILL).text(
      "Alles hinter dem Strich zeigt Facebook erst, wenn jemand auf „Mehr anzeigen\" tippt. " +
        "Deshalb steht das Wichtigste davor.",
      RAND, d.y + 3, { width: BREITE - 60, lineGap: 1 },
    );
    d.y += 4;
    d.x = RAND;
  }
  d.y += 10;
}

// Der Kopf eines Abschnitts: ein helles Band über die ganze Breite, links die
// Bezeichnung, rechts das Zeichen des Kanals.
//
// Vorher trennte hier eine Haarlinie. Auf einer Seite mit vier Feldern, drei Fassungen
// und zehn Anleitungsschritten verschwindet die — „unübersichtlich, da kann ruhig eine
// größere Abtrennung zwischen und vor jedem" (30.10.2026). Das Band trennt sichtbar, und
// das Zeichen sagt vor dem Lesen, wo man ist.
const BAND_HOEHE = 42;

function bandKopf(d, zustand, { nummer, name, zeichen }) {
  platzPruefen(d, zustand, BAND_HOEHE + 110);
  zustand.abschnitt = String(name || "");
  // Nur das erste Band einer Seite bestimmt den Kolumnentitel. Sonst stand über einer
  // Seite, die mit „Ihre eigene Seite" beginnt, der Abschnitt, der unten anfängt.
  if (zustand.kopf && !zustand.bandAufSeite) {
    zustand.kopf[zustand.seite] = zustand.abschnitt;
    zustand.bandAufSeite = true;
  }
  const y = d.y + 20;
  d.save();
  d.roundedRect(RAND, y, BREITE, BAND_HOEHE, 6).fillColor(PAPIER_HELL).fill();
  d.restore();

  d.font(SCHRIFT.halbfett).fontSize(9).fillColor(AKZENT).text(
    (nummer ? nummer + " · " : "") + String(name || "").toUpperCase(),
    RAND + 18, y + BAND_HOEHE / 2 - 4.5, { characterSpacing: 1.1, width: BREITE - 200, lineBreak: false },
  );

  if (zeichen && zeichen.length) {
    const grund = 19;
    const breite = zeichenBreite(zeichen, grund);
    zeichenSetzen(d, zeichen, RAND + BREITE - 18 - breite, y + (BAND_HOEHE - grund) / 2, grund);
  }

  d.x = RAND;
  d.y = y + BAND_HOEHE + 14;
}

function blockSetzen(d, zustand, block, nummer) {
  platzPruefen(d, zustand, 160);
  const beginnt = zustand.seite;
  bandKopf(d, zustand, { nummer, name: block.name, zeichen: KANAL_ZEICHEN[block.id] || [] });

  if (block.wofuer) {
    d.font(SCHRIFT.normal).fontSize(9).fillColor(LEISE)
      .text(block.wofuer, RAND, d.y, { width: BREITE - 40, lineGap: 1 });
  }
  d.y += 14;

  (block.stuecke || []).forEach((st, si) => {
    if (st.titel) {
      platzPruefen(d, zustand, 60);
      d.font(SCHRIFT.mittel).fontSize(12).fillColor(TINTE)
        .text(String.fromCharCode(65 + si) + " · " + st.titel, RAND, d.y, { width: BREITE });
      d.y += 8;
    }
    (st.felder || []).forEach((f) => feldSetzen(d, zustand, f));
  });
  return beginnt;
}

// Was in einem Kanal steckt, in einer Zeile — für den Wegweiser auf dem Deckblatt.
// Abgelesen am Ergebnis selbst: Hat der Kanal mehrere benannte Stücke, sind es Fassungen,
// sonst stehen die Feldnamen da. Von Hand gepflegte Beschreibungen gingen beim nächsten
// Umbau des Modells still daneben.
function kanalInhalt(k) {
  const stuecke = k.stuecke || [];
  const benannt = stuecke.filter((st) => st.titel);
  if (benannt.length > 1) {
    return benannt.length + " Fassungen · " + benannt.map((st) => st.titel).join(", ");
  }
  const felder = stuecke.flatMap((st) => st.felder || []).map((f) => f.etikett).filter(Boolean);
  return felder.slice(0, 3).join(", ") + (felder.length > 3 ? " …" : "");
}

// Der Wegweiser selbst. Steht auf dem Deckblatt, gesetzt wird er zuletzt: Die Seitenzahlen
// stehen erst fest, wenn alles umbrochen ist.
function wegweiserSetzen(d, zeilen, y, hoehe) {
  d.font(SCHRIFT.halbfett).fontSize(8).fillColor(ORANGE_HELL)
    .text("WAS IN DIESEM DOKUMENT STEHT", RAND, y, { characterSpacing: 1.2, width: BREITE, lineBreak: false });

  // Ohne Trennlinien.
  //
  // Zwischen jeder Zeile lag eine Haarlinie — acht Striche quer über das Deckblatt, und
  // getragen haben sie nichts: Die Zuordnung macht die Spalte, nicht der Strich
  // (30.10.2026). Gegliedert wird jetzt über den Abstand; nach dem letzten Kanal steht
  // eine größere Lücke, weil danach keine Kanäle mehr kommen, sondern Beigaben.
  let yy = y + 24;
  let vorherNummer = true;
  for (const z of zeilen) {
    if (vorherNummer && !z.nummer) yy += 10;
    vorherNummer = !!z.nummer;

    if (z.nummer) {
      d.font(SCHRIFT.mittel).fontSize(7.5).fillColor(ORANGE_HELL)
        .text(String(z.nummer).padStart(2, "0"), RAND, yy + 2.5, { width: 18, lineBreak: false });
    }
    d.font(SCHRIFT.mittel).fontSize(10).fillColor(PAPIER_HELL)
      .text(z.name, RAND + 22, yy, { width: 168, lineBreak: false, ellipsis: true });
    const spalte = BREITE - 196 - 46;
    d.font(SCHRIFT.normal).fontSize(8.5).fillColor(P45)
      .text(aufBreite(d, z.was, spalte), RAND + 196, yy + 1.5, { width: spalte, lineBreak: false });
    d.font(SCHRIFT.normal).fontSize(8.5).fillColor(P70)
      .text("S. " + z.seite, RAND, yy + 1.5, { width: BREITE, align: "right", lineBreak: false });
    yy += hoehe;
  }
  return yy;
}

export function ausschreibungPdf(daten, ergebnis) {
  return new Promise((loesen, scheitern) => {
    try {
      const betrieb = ergebnis.betrieb || daten.domain || "Ihr Betrieb";
      const beruf = daten.beruf || "die offene Stelle";
      const d = new PDFDocument({
        size: "A4",
        bufferPages: true,
        margins: { top: RAND, bottom: FUSS, left: RAND, right: RAND },
        info: {
          Title: "Stellenausschreibung — " + betrieb,
          Author: "Fokuswerk — Abt & Bodenstab GbR",
          Subject: betrieb + " sucht " + beruf,
          Creator: "fokuswerk.de/stellenanzeige",
        },
      });
      d.registerFont("n", PFADE.normal);
      d.registerFont("m", PFADE.mittel);
      d.registerFont("h", PFADE.halbfett);

      const stuecke = [];
      d.on("data", (s) => stuecke.push(s));
      d.on("end", () => loesen(Buffer.concat(stuecke)));
      d.on("error", scheitern);

      const zustand = { seite: 1, kopf: {}, abschnitt: null };
      const L = ergebnis.marktlage;

      // ── Deckblatt ────────────────────────────────────────────────────────
      // Satzspiegel aus: Auf dem Deckblatt steht jedes Element an einer festen Stelle.
      // Mit Rand legt pdfkit beim ersten Text unterhalb der Fußhöhe eine neue Seite an —
      // der Markenhinweis über der Fußzeile hat genau das ausgelöst, und der Einleitungs-
      // satz landete allein auf Seite 2.
      // ▲ Eigenes Objekt, keine Mutation: `page.margins` und `options.margins` sind in
      // pdfkit dieselbe Referenz. `d.page.margins.top = 0` hat deshalb auch jede spätere
      // Seite randlos gemacht — der Kopftext von Seite 2 lief in die Kopfzeile.
      d.page.margins = { top: 0, bottom: 0, left: RAND, right: RAND };
      d.rect(0, 0, 595.28, 842).fillColor(DUNKEL).fill();
      for (let i = 10; i >= 1; i--) {
        d.save();
        d.circle(470, 120, i * 42).fillColor(SIGNAL).fillOpacity(0.016).fill();
        d.restore();
      }

      const heute = new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
      d.font(SCHRIFT.halbfett).fontSize(10).fillColor(PAPIER_HELL)
        .text("FOKUSWERK", RAND, RAND, { characterSpacing: 2.2 });
      d.font(SCHRIFT.normal).fontSize(8.5).fillColor(P45)
        .text(heute, RAND, RAND + 1, { width: BREITE, align: "right" });

      d.y = RAND + 86;
      d.font(SCHRIFT.halbfett).fontSize(8).fillColor(ORANGE_HELL)
        .text("STELLENAUSSCHREIBUNG", RAND, d.y, { characterSpacing: 1.2 });
      d.moveDown(0.6);
      d.font(SCHRIFT.mittel).fontSize(26).fillColor(PAPIER_HELL)
        .text(betrieb, RAND, d.y, { width: BREITE - 40, lineGap: -3 });
      d.moveDown(0.3);
      d.font(SCHRIFT.normal).fontSize(12).fillColor(P70)
        .text("sucht " + beruf, RAND, d.y, { width: BREITE });

      // Die Kanäle als Zeichen, direkt unter dem Titel. „Vier Kanäle" ist eine Behauptung,
      // vier Marken sind eine Auskunft — und die Frage „wo landet das eigentlich?" ist die
      // erste, die ein Betrieb an diesem Dokument hat.
      const kachelZeichen = (ergebnis.kanaele || [])
        .map((k) => ({ liste: KANAL_ZEICHEN[k.id] || [], name: k.name }))
        .filter((k) => k.liste.length || k.name);
      // Alles ab hier rechnet von der Unterkante der Reihe aus. Feste Koordinaten gingen
      // daneben, sobald der Betriebsname zweizeilig wurde — dann lagen die Kacheln im
      // Titel und die große Zahl in den Kacheln.
      let yUnten = d.y + 10;
      if (kachelZeichen.length) {
        let xK = RAND;
        const yK = d.y + 24;
        for (const k of kachelZeichen) {
          const breite = markenkachel(d, k.liste, k.name, xK, yK);
          xK += breite + 8;
          if (xK > RAND + BREITE - 40) break;
        }
        // Der Hinweis stand direkt unter den Kacheln und las sich wie Kleingedrucktes
        // mitten im Blatt. Unten über der Fußzeile stört er niemanden und steht trotzdem.
        d.font(SCHRIFT.normal).fontSize(6.5).fillColor(P45)
          .text(MARKENHINWEIS, RAND, 752, { width: BREITE, lineBreak: false });
        yUnten = yK + BAND_HOEHE - 8;
      }

      // Wo der Wegweiser hinkommt. Gesetzt wird er ganz zuletzt — erst dann stehen die
      // Seitenzahlen fest. Liegt eine Marktlage vor, teilt sie sich das Deckblatt mit ihm;
      // ohne sie bekommt er die ganze Fläche. Vorher stand ohne Marktlage nur ein Absatz
      // Fließtext auf dem Blatt, und darunter zwei Drittel Leere.
      let yWegweiser = 318;

      if (L) {
        // Die Marktlage ist das Motiv: Erst wissen, wogegen man antritt. Kleiner gesetzt
        // als früher (96 pt), weil unter ihr jetzt steht, was im Dokument steht.
        const yZahl = yUnten + 16;
        d.font(SCHRIFT.mittel).fontSize(68).fillColor(PAPIER_HELL)
          .text(String(L.vakanzzeit), RAND, yZahl, { lineGap: -14 });
        const breiteZahl = d.widthOfString(String(L.vakanzzeit));
        d.font(SCHRIFT.normal).fontSize(11).fillColor(P70)
          .text("Tage", RAND + breiteZahl + 10, yZahl + 42);
        d.font(SCHRIFT.halbfett).fontSize(8).fillColor(ORANGE_HELL)
          .text("DIE LAGE IN IHREM BERUF", RAND, yZahl + 6, { width: BREITE, align: "right", characterSpacing: 1.2 });

        d.font(SCHRIFT.normal).fontSize(10.5).fillColor(P70).text(
          "bleibt eine gemeldete Stelle in Ihrem Beruf im Schnitt offen. Das sind " +
            L.vakanzzeitWort + ". Wenn Sie seit Wochen suchen, liegt das nicht an Ihnen.",
          RAND, yZahl + 86, { width: BREITE - 60, lineGap: 1.5 },
        );

        const paare = [
          L.anteilDreiMonate !== null && L.anteilDreiMonate !== undefined
            ? [String(L.anteilDreiMonate).replace(".", ",") + " %", "der gemeldeten Stellen stehen länger als drei Monate offen"]
            : null,
          L.arbeitsloseJe100 !== null && L.arbeitsloseJe100 !== undefined
            ? [String(L.arbeitsloseJe100).replace(".", ","), "Arbeitslose kommen auf 100 offene Stellen"]
            : null,
        ].filter(Boolean);
        let yZ = Math.max(d.y + 14, yZahl + 128);
        for (const [wert, text] of paare) {
          d.moveTo(RAND, yZ).lineTo(RAND + BREITE, yZ).lineWidth(0.6).strokeColor("#2C2A30").stroke();
          d.font(SCHRIFT.mittel).fontSize(15).fillColor(PAPIER_HELL).text(wert, RAND, yZ + 10, { width: 110 });
          d.font(SCHRIFT.normal).fontSize(9.5).fillColor(P70)
            .text(text, RAND + 120, yZ + 13, { width: BREITE - 120 });
          yZ += 44;
        }
        yWegweiser = yZ + 24;

        d.font(SCHRIFT.normal).fontSize(7).fillColor(P45).text(
          L.berufsgruppe + " · " + L.gebiet + " · gleitende Jahresergebnisse " + L.stand + ". " +
            L.quelle.text + " (" + L.quelle.link + "). Umrechnung in Monate von uns.",
          RAND, 724, { width: BREITE, lineGap: 1 },
        );
      } else {
        d.font(SCHRIFT.normal).fontSize(12).fillColor(P70).text(
          "Alles, was Sie zum Besetzen der Stelle brauchen — fertig formuliert, " +
            "für jeden Kanal in dem Format, das er verlangt.",
          RAND, yUnten + 18, { width: BREITE - 60, lineGap: 2 },
        );
        yWegweiser = yUnten + 90;
      }

      // ── Die Kanäle ───────────────────────────────────────────────────────
      // Die Zahl kommt aus dem Ergebnis. Sie stand hier als Wort — „drei Kanäle" —, und
      // als die Jobbörse der Arbeitsagentur dazukam, stimmte die Überschrift über vier
      // Blöcken nicht mehr.
      const wegweiser = [];
      const kanaele = ergebnis.kanaele || [];
      // Zahlwort samt Beugung. „Fertig für einen Kanäle" stand im Probelauf mit einem
      // einzigen Kanal auf dem Blatt — der Fall tritt ein, wenn die Jobbörse nicht taugt
      // und das Modell nur einen Block liefert.
      const ZAHLWORT = ["keinen", "einen", "zwei", "drei", "vier", "fünf", "sechs"];
      const n = kanaele.length;
      const zahlwort = ZAHLWORT[n] || String(n);
      const kanalWort = n === 1 ? "einen Kanal" : zahlwort + " Kanäle";
      const fassungWort = n === 1 ? "eine Fassung" : zahlwort + " Fassungen";
      neueSeite(d, zustand);
      versal(d, "Ihre Texte, fertig für " + kanalWort, AKZENT, 9);
      d.y += 6;
      d.font(SCHRIFT.normal).fontSize(10).fillColor(LEISE).text(
        "Dieselbe Stelle, " + fassungWort + " — jeweils in dem Format, das der Kanal " +
          "verlangt. Wo eine Zeichengrenze gilt, steht sie dabei.",
        RAND, d.y, { width: BREITE - 30, lineGap: 1.5 },
      );
      d.y += 12;
      kanaele.forEach((k, i) => {
        const seite = blockSetzen(d, zustand, k, i + 1);
        wegweiser.push({ nummer: i + 1, name: k.name, was: kanalInhalt(k), seite });
      });

      // ── Vier Fragen ──────────────────────────────────────────────────────
      if ((ergebnis.fragen || []).length) {
        platzPruefen(d, zustand, 150);
        wegweiser.push({
          name: "Vier Fragen für die Bewerbung",
          was: "statt Lebenslauf und Anschreiben",
          seite: zustand.seite,
        });
        bandKopf(d, zustand, { name: "Vier Fragen für die Bewerbung" });
        d.font(SCHRIFT.normal).fontSize(9).fillColor(LEISE).text(
          "Statt Lebenslauf und Anschreiben. Das ist der Grund, warum sich jemand meldet, " +
            "der sich sonst nicht bewirbt.",
          RAND, d.y, { width: BREITE - 40, lineGap: 1 },
        );
        d.y += 14;
        ergebnis.fragen.forEach((f, i) => {
          const h = d.font(SCHRIFT.normal).fontSize(10).heightOfString(f, { width: BREITE - 24, lineGap: 1.5 });
          platzPruefen(d, zustand, h + 14);
          const yy = d.y;
          d.font(SCHRIFT.mittel).fontSize(8).fillColor(STILL)
            .text(String(i + 1).padStart(2, "0"), RAND, yy + 2, { width: 18, lineBreak: false });
          d.font(SCHRIFT.normal).fontSize(10).fillColor(TINTE)
            .text(f, RAND + 24, yy, { width: BREITE - 24, lineGap: 1.5 });
          d.y += 9;
          d.x = RAND;
        });
      }

      // ── Die Mappe ────────────────────────────────────────────────────────
      if ((ergebnis.mappe || []).length) {
        platzPruefen(d, zustand, 170);
        wegweiser.push({
          name: "Und so bringen Sie es an den Start",
          was: (ergebnis.mappe || []).map((k) => String(k.name || "").replace(/^\d+\s*·\s*/, "")).join(" · "),
          seite: zustand.seite,
        });
        d.moveDown(2.2);
        versal(d, "Und so bringen Sie es an den Start", AKZENT, 10);
        d.y += 7;
        d.font(SCHRIFT.normal).fontSize(10).fillColor(LEISE).text(
          "Texte allein stellen niemanden ein. Ab hier steht, was damit zu tun ist — " +
            "jeder Schritt einmal, mit Ihren Werten.",
          RAND, d.y, { width: BREITE - 30, lineGap: 1.5 },
        );
        d.y += 12;
        ergebnis.mappe.forEach((k) => blockSetzen(d, zustand, k, null));
      }

      // ── Budget und Schluss ───────────────────────────────────────────────
      // Budget und Schlussblock gehören zusammen auf eine Seite. Vorher prüfte jeder für
      // sich, und wenn es beim Budget gerade noch reichte, rutschte der Block allein auf
      // eine letzte, sonst leere Seite — zweimal passiert, beide Male zu Recht bemängelt.
      const hBand = schlussbandHoehe(d);
      const hBudget = String(ergebnis.budget || "")
        .split(/\n+/)
        .filter(Boolean)
        .reduce((sum, a) => sum + d.font(SCHRIFT.normal).fontSize(10).heightOfString(a, { width: BREITE, lineGap: 1.5 }) + 6, 70);

      if (ergebnis.budget) {
        platzPruefen(d, zustand, hBudget + hBand + 30);
        wegweiser.push({
          name: "Budget",
          was: "was die bezahlte Anzeige kostet",
          seite: zustand.seite,
        });
        bandKopf(d, zustand, { name: "Budget" });
        for (const a of String(ergebnis.budget).split(/\n+/).filter(Boolean)) {
          platzPruefen(d, zustand, 50);
          d.font(SCHRIFT.normal).fontSize(10).fillColor(TINTE).text(a, RAND, d.y, { width: BREITE, lineGap: 1.5 });
          d.y += 6;
          d.x = RAND;
        }
        d.y += 4;
        d.font(SCHRIFT.normal).fontSize(8.5).fillColor(STILL).text(
          "Richtwert aus Ihren Angaben, keine Zusage. Nur der bezahlte Kanal kostet Geld — " +
            "Kleinanzeigen und Ihre eigene Seite sind umsonst.",
          RAND, d.y, { width: BREITE, lineGap: 1 },
        );
        d.y += 10;
      }

      schlussband(d, zustand);

      // ── Wegweiser aufs Deckblatt ─────────────────────────────────────────
      // Zuletzt, weil die Seitenzahlen erst jetzt feststehen. Passt die Liste nicht mehr
      // in den freien Streifen, rücken die Zeilen enger zusammen statt über die Fußzeile
      // zu laufen.
      if (wegweiser.length) {
        d.switchToPage(0);
        d.page.margins.bottom = 0;
        d.page.margins.top = 0;
        const platz = (L ? 706 : 700) - yWegweiser - 20;
        const hoehe = Math.max(17, Math.min(L ? 24 : 36, Math.floor(platz / wegweiser.length)));
        const unten = wegweiserSetzen(d, wegweiser, yWegweiser, hoehe);

        // Ohne Marktlage bleibt unter der Liste Platz. Dort steht der Umfang: Wer ein
        // Dokument aufmacht, will zuerst wissen, worauf er sich einlässt.
        if (!L) {
          const teile = [
            d.bufferedPageRange().count + " Seiten",
            kanaele.length + " Kanäle",
            (ergebnis.fragen || []).length ? (ergebnis.fragen || []).length + " Bewerberfragen" : null,
            (ergebnis.mappe || []).length ? "Anleitung und Wochenplan" : null,
          ].filter(Boolean);
          d.font(SCHRIFT.normal).fontSize(9).fillColor(P45)
            .text(teile.join("  ·  "), RAND, unten + 22, { width: BREITE, lineBreak: false });
        }
      }

      // ── Fußzeilen ────────────────────────────────────────────────────────
      const anzahl = d.bufferedPageRange().count;
      for (let i = 0; i < anzahl; i++) {
        d.switchToPage(i);
        // Ohne das legt pdfkit für jede Fußzeile eine neue Seite an, weil sie unterhalb
        // des Satzspiegels steht — und jede neue Seite bekommt wieder eine Fußzeile.
        // Eigenes Objekt, siehe Deckblatt: die Ränder sind sonst dokumentweit geteilt.
        d.page.margins = { top: 0, bottom: 0, left: RAND, right: RAND };
        const deckblatt = i === 0;
        const schrift = deckblatt ? "#5B585C" : STILL;

        if (!deckblatt) {
          const abschnitt = zustand.kopf[i + 1];
          d.font(SCHRIFT.halbfett).fontSize(7).fillColor(abschnitt ? AKZENT : STILL).text(
            (abschnitt || "Stellenausschreibung").toUpperCase(), RAND, RAND - 24,
            { characterSpacing: 1.1, width: BREITE / 2, lineBreak: false },
          );
          d.font(SCHRIFT.normal).fontSize(7).fillColor(STILL).text(
            (betrieb + " · " + beruf).slice(0, 68), RAND, RAND - 24,
            { width: BREITE, align: "right", lineBreak: false },
          );
        }

        const y = 842 - 54;
        if (!deckblatt) {
          d.moveTo(RAND, y - 12).lineTo(RAND + BREITE, y - 12).lineWidth(0.6).strokeColor(LINIE).stroke();
        }
        d.font(SCHRIFT.normal).fontSize(7.5).fillColor(schrift).text(
          "Fokuswerk — Abt & Bodenstab GbR · Schramperweg 90 · 26129 Oldenburg · 0176 63307587 · contact@fokuswerk.de",
          RAND, y, { width: BREITE - 40, lineBreak: false },
        );
        d.font(SCHRIFT.normal).fontSize(7.5).fillColor(schrift)
          .text(i + 1 + " / " + anzahl, RAND, y, { width: BREITE, align: "right", lineBreak: false });
      }

      d.end();
    } catch (fehler) {
      scheitern(fehler);
    }
  });
}

const SCHLUSSSATZ =
  "Die Texte sind der kleinere Teil. Was entscheidet, ist die Ausspielung: Video, " +
  "Zielgruppe, Budget und die Antwort binnen eines Tages. Wenn Sie die sechs Stunden " +
  "nicht haben, übernehmen wir das.";

// Wie hoch der Schlussblock wird. Der Aufrufer braucht das VOR dem Budget, um beide
// zusammen umbrechen zu lassen — sonst stand der Block allein auf einer letzten Seite.
const SCHRITTE = [
  ["Diese Woche", "Video drehen. Vier Einstellungen mit dem Handy, rund zwanzig Minuten."],
  ["Dann", "Anzeige zusammenbauen und starten. Etwa eine Stunde."],
  ["Ab Tag fünf", "Antworten, binnen 24 Stunden. Danach sind die Guten weg."],
];

function schlussbandHoehe(d) {
  const innen = BREITE - 40;
  const satz = d.font(SCHRIFT.normal).fontSize(10).heightOfString(SCHLUSSSATZ, { width: innen, lineGap: 1.5 });
  const schritte = SCHRITTE.reduce(
    (sum, [, t]) => sum + d.font(SCHRIFT.normal).fontSize(10).heightOfString(t, { width: innen - 96 }) + 15,
    0,
  );
  return 128 + schritte + satz;
}

// Der Schluss. Ein Block mit drei Schritten und der Anschrift statt einer Zeile: Vorher
// war das ein Restposten auf einer halbleeren Seite — jetzt ist es ein Abschluss.
// Prueft selbst keinen Platz; das macht der Aufrufer für Budget und Block gemeinsam.
function schlussband(d, zustand) {
  const innen = BREITE - 40;
  const hoehe = schlussbandHoehe(d);

  const oben = d.y + 10;
  d.save();
  d.roundedRect(RAND, oben, BREITE, hoehe, 6).fillColor(DUNKEL).fill();
  d.restore();

  const x = RAND + 20;
  d.font(SCHRIFT.halbfett).fontSize(8).fillColor(ORANGE_HELL)
    .text("UND JETZT?", x, oben + 22, { characterSpacing: 1.2, width: innen, lineBreak: false });
  d.font(SCHRIFT.mittel).fontSize(14).fillColor(PAPIER_HELL)
    .text("Die Texte stehen. Jetzt müssen sie noch die Richtigen sehen.", x, oben + 40, { width: innen });

  let y = oben + 74;
  for (const [wann, was] of SCHRITTE) {
    d.font(SCHRIFT.halbfett).fontSize(7).fillColor(P45)
      .text(wann.toUpperCase(), x, y + 2, { characterSpacing: 1.1, width: 88, lineBreak: false });
    d.font(SCHRIFT.normal).fontSize(10).fillColor(PAPIER_HELL)
      .text(was, x + 96, y, { width: innen - 96 });
    y = d.y + 9;
  }

  y += 4;
  d.moveTo(x, y).lineTo(RAND + BREITE - 20, y).lineWidth(0.6).strokeColor("#2C2A30").stroke();
  d.font(SCHRIFT.normal).fontSize(10).fillColor(P70)
    .text(SCHLUSSSATZ, x, y + 14, { width: innen, lineGap: 1.5 });
  d.font(SCHRIFT.mittel).fontSize(10).fillColor(PAPIER_HELL)
    .text("Zehn Minuten am Telefon: 0176 63307587 · contact@fokuswerk.de", x, d.y + 10, { width: innen });

  d.y = oben + hoehe + 12;
  d.x = RAND;
}
