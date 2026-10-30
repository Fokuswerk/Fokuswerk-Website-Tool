// Der Wettbewerbsvergleich als PDF.
//
// Gleiche Bauart wie seo-analyse-pdf.js: dunkles Deckblatt, Inter als eingebettete
// TTF, Fußzeile über bufferPages. Was hier anders ist, ist der Gegenstand — dort wird
// eine Website gemessen, hier ein Markt. Jede Zahl in diesem Dokument stammt aus einem
// Abruf, der im Quellenblock am Ende mit Datum steht. Steht ein Wert nicht dort, darf
// er nicht ins PDF: Der Betrieb prüft seine Nachbarn gegen, und ein falscher Wert in
// der Liste kostet nicht den Termin, sondern die Glaubwürdigkeit aller anderen.
//
// Keine Emojis in Texten, die hierher kommen. Inter hat keine, pdfkit setzt dann leere
// Kästchen. Fremde Anzeigentexte laufen durch ohneEmoji().

import PDFDocument from "pdfkit";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = dirname(dirname(fileURLToPath(import.meta.url)));
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
const GUT = "#1F6B4A";
const MANGEL = "#A8321B";
const LUECKE = "#8A6A1F";

const DUNKEL = "#17161B";
const PAPIER_HELL = "#F5F3EF";
const P70 = "#B8B5B2";
const P45 = "#86837F";
const SIGNAL = "#FF5A1F";

const RAND = 54;
const BREITE = 595.28 - RAND * 2;
const FUSS = 72;

function ohneEmoji(text) {
  return String(text || "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{27BF}\u{FE0F}\u{20E3}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function zahl(n) {
  return new Intl.NumberFormat("de-DE").format(n);
}

function komma(n) {
  return String(n).replace(".", ",");
}

function neueSeite(d, zustand) {
  d.addPage();
  zustand.seite += 1;
  d.x = RAND;
  d.y = RAND;
  return RAND;
}

function platzPruefen(d, zustand, hoehe) {
  if (d.y + hoehe < 842 - FUSS) return;
  neueSeite(d, zustand);
}

function versal(d, text, farbe = STILL) {
  d.font(SCHRIFT.halbfett).fontSize(8).fillColor(farbe)
    .text(String(text).toUpperCase(), RAND, d.y, { characterSpacing: 1.1, width: BREITE });
  d.moveDown(0.35);
}

function linie(d, farbe = LINIE) {
  const y = d.y;
  d.moveTo(RAND, y).lineTo(RAND + BREITE, y).lineWidth(0.6).strokeColor(farbe).stroke();
  d.y = y + 1;
}

// ── Die Liste ───────────────────────────────────────────────────────────
// Spaltenraster einmal festgelegt, damit Kopf und Zeilen nicht auseinanderlaufen.
const SPALTEN = [
  { x: 0, b: 26, t: "", rechts: false },
  { x: 26, b: 196, t: "Betrieb", rechts: false },
  { x: 222, b: 54, t: "Bewert.", rechts: true },
  { x: 276, b: 44, t: "Schnitt", rechts: true },
  { x: 320, b: 42, t: "Fotos", rechts: true },
  { x: 362, b: 56, t: "Website", rechts: true },
  { x: 418, b: 69, t: "Anzeigen", rechts: true },
];

function tabellenkopf(d) {
  const y = d.y;
  SPALTEN.forEach((s) => {
    if (!s.t) return;
    d.font(SCHRIFT.halbfett).fontSize(7).fillColor(STILL).text(s.t.toUpperCase(), RAND + s.x, y, {
      width: s.b,
      align: s.rechts ? "right" : "left",
      characterSpacing: 0.8,
      lineBreak: false,
    });
  });
  d.y = y + 13;
  linie(d, "#D9D5CE");
  d.y += 4;
}

// Text auf eine feste Breite bringen. Gemessen wird mit der Schrift, die gerade gesetzt ist.
function kuerzen(d, text, breite) {
  const t = String(text || "");
  if (d.widthOfString(t) <= breite) return t;
  let kurz = t;
  while (kurz.length > 4 && d.widthOfString(kurz + "…") > breite) kurz = kurz.slice(0, -1);
  return kurz.trimEnd() + "…";
}

function tabellenzeile(d, b, eigen) {
  const y = d.y;
  const hoehe = 19;

  if (eigen) {
    d.save();
    d.rect(RAND - 6, y - 4, BREITE + 12, hoehe).fillColor(AKZENT).fillOpacity(0.07).fill();
    d.restore();
    d.save();
    d.rect(RAND - 6, y - 4, 2.5, hoehe).fillColor(AKZENT).fill();
    d.restore();
  }

  const stift = eigen ? SCHRIFT.halbfett : SCHRIFT.normal;
  const tinte = eigen ? TINTE : "#3A3A3E";

  d.font(eigen ? SCHRIFT.halbfett : SCHRIFT.mittel).fontSize(8.5)
    .fillColor(eigen ? AKZENT : STILL)
    .text(String(b.platz), RAND, y, { width: 20, align: "right", lineBreak: false });

  // Selbst kuerzen statt pdfkit kuerzen zu lassen: `lineBreak: false` mit `ellipsis` liess
  // „Chris Wassermann Kfz-Meisterbetrieb GmbH" trotzdem umbrechen, und die zweite Zeile lag
  // quer ueber der naechsten Tabellenzeile (29.10.2026). Die Zeilenhoehe ist fest, also muss
  // der Name hineinpassen.
  d.font(stift).fontSize(9).fillColor(tinte)
    .text(kuerzen(d, b.name, 196), RAND + 26, y - 0.5, { width: 196, lineBreak: false });

  d.font(stift).fontSize(9).fillColor(tinte)
    .text(zahl(b.bewertungen), RAND + 222, y, { width: 54, align: "right", lineBreak: false });

  d.font(SCHRIFT.normal).fontSize(9).fillColor(LEISE)
    .text(komma(b.schnitt.toFixed(1)), RAND + 276, y, { width: 44, align: "right", lineBreak: false });

  d.font(SCHRIFT.normal).fontSize(9).fillColor(b.fotos === 0 ? MANGEL : LEISE)
    .text(String(b.fotos), RAND + 320, y, { width: 42, align: "right", lineBreak: false });

  d.font(SCHRIFT.normal).fontSize(8.5).fillColor(b.website ? GUT : MANGEL)
    .text(b.website ? "ja" : "fehlt", RAND + 362, y + 0.5, { width: 56, align: "right", lineBreak: false });

  // Welcher Kanal, nicht nur ob. Seit der Google-Check dazugekommen ist, waere ein blosses
  // „ja" die unwichtigere Haelfte der Auskunft.
  const kanal = [b.anzeigen ? b.anzeigenWort || "Meta" : null, b.google ? "Google" : null]
    .filter(Boolean)
    .join(" + ");
  d.font(SCHRIFT.normal).fontSize(8.5).fillColor(kanal ? GUT : STILL)
    .text(kanal || "keine", RAND + 418, y + 0.5, {
      width: 69, align: "right", lineBreak: false,
    });

  d.y = y + hoehe - 4;
  d.moveTo(RAND, d.y).lineTo(RAND + BREITE, d.y).lineWidth(0.4).strokeColor("#EDEAE4").stroke();
  d.y += 4;
  d.x = RAND;
}

// ── Ein Befund ──────────────────────────────────────────────────────────────
const ART = {
  mangel: { farbe: MANGEL, wort: "KOSTET SIE PLÄTZE", ton: "#A8321B" },
  luecke: { farbe: LUECKE, wort: "LÜCKE", ton: "#8A6A1F" },
  gut: { farbe: GUT, wort: "DAS SPRICHT FÜR SIE", ton: "#1F6B4A" },
};

function befund(d, zustand, b) {
  const a = ART[b.art] || ART.luecke;
  const innen = BREITE - 32;
  const hTitel = d.font(SCHRIFT.mittel).fontSize(12.5).heightOfString(b.titel, { width: innen });
  const hMess = b.messwert
    ? d.font(SCHRIFT.normal).fontSize(8.5).heightOfString(b.messwert, { width: innen })
    : 0;
  const hText = d.font(SCHRIFT.normal).fontSize(9.5).heightOfString(b.klartext, { width: innen, lineGap: 1 });
  const hFolge = b.folge
    ? d.font(SCHRIFT.mittel).fontSize(9).heightOfString(b.folge, { width: innen })
    : 0;
  const hoehe = 44 + hTitel + hMess + hText + hFolge;
  platzPruefen(d, zustand, hoehe + 12);

  const oben = d.y;
  d.save();
  d.roundedRect(RAND, oben, BREITE, hoehe, 4).fillColor(a.ton).fillOpacity(0.04).fill();
  d.restore();
  d.save();
  d.rect(RAND, oben, 3, hoehe).fillColor(a.farbe).fill();
  d.restore();

  const x = RAND + 16;
  let y = oben + 13;
  d.font(SCHRIFT.halbfett).fontSize(7).fillColor(a.farbe)
    .text(a.wort, x, y, { characterSpacing: 1.1, width: innen });
  y = d.y + 3;
  d.font(SCHRIFT.mittel).fontSize(12.5).fillColor(TINTE).text(b.titel, x, y, { width: innen });
  y = d.y + 5;
  if (b.messwert) {
    d.font(SCHRIFT.normal).fontSize(8.5).fillColor(LEISE).text(b.messwert, x, y, { width: innen });
    y = d.y + 6;
  }
  d.font(SCHRIFT.normal).fontSize(9.5).fillColor(TINTE).text(b.klartext, x, y, { width: innen, lineGap: 1 });
  y = d.y + 5;
  if (b.folge) {
    d.font(SCHRIFT.mittel).fontSize(9).fillColor(AKZENT).text(b.folge, x, y, { width: innen });
  }

  d.y = oben + hoehe + 12;
  d.x = RAND;
}

// ── Der Schlussblock ────────────────────────────────────────────────────────
// Höhe vorher rechnen und den Block an den vorigen binden: Steht er allein auf einer
// leeren Seite, liest er sich wie ein nachgeschobener Verkaufszettel.
function schlussbandHoehe(d, schritte, satz) {
  const innen = BREITE - 40;
  const spalte = innen - 26;
  const hSchritte = schritte.reduce(
    (summe, s) =>
      summe +
      d.font(SCHRIFT.mittel).fontSize(10.5).heightOfString(s.titel, { width: spalte }) +
      (s.folge ? d.font(SCHRIFT.normal).fontSize(8.5).heightOfString(s.folge, { width: spalte }) + 2 : 0) +
      11,
    0,
  );
  return 92 + hSchritte + d.font(SCHRIFT.normal).fontSize(9).heightOfString(satz, { width: innen, lineGap: 1.5 });
}

function schlussband(d, schritte, satz) {
  const innen = BREITE - 40;
  const spalte = innen - 26;
  const hoehe = schlussbandHoehe(d, schritte, satz);
  const oben = d.y + 12;

  d.save();
  d.roundedRect(RAND, oben, BREITE, hoehe, 6).fillColor(DUNKEL).fill();
  d.restore();

  const x = RAND + 20;
  let y = oben + 22;
  d.font(SCHRIFT.halbfett).fontSize(8).fillColor("#FF7341")
    .text("WIE ES WEITERGEHT", x, y, { characterSpacing: 1.2, width: innen, lineBreak: false });
  y = oben + 45;
  schritte.forEach((s, i) => {
    d.font(SCHRIFT.mittel).fontSize(8).fillColor(P45)
      .text(String(i + 1).padStart(2, "0"), x, y + 3, { width: 20, lineBreak: false });
    d.font(SCHRIFT.mittel).fontSize(10.5).fillColor(PAPIER_HELL).text(s.titel, x + 26, y, { width: spalte });
    y = d.y;
    if (s.folge) {
      d.font(SCHRIFT.normal).fontSize(8.5).fillColor(P45).text(s.folge, x + 26, y + 2, { width: spalte });
      y = d.y;
    }
    y += 11;
  });
  y += 5;
  d.moveTo(x, y).lineTo(RAND + BREITE - 20, y).lineWidth(0.6).strokeColor("#2C2A30").stroke();
  d.font(SCHRIFT.normal).fontSize(9).fillColor(P70).text(satz, x, y + 14, { width: innen, lineGap: 1.5 });

  d.y = oben + hoehe + 12;
  d.x = RAND;
}

export function ranglistePdf(e) {
  return new Promise((loesen, scheitern) => {
    try {
      const d = new PDFDocument({
        size: "A4",
        bufferPages: true,
        margins: { top: RAND, bottom: FUSS, left: RAND, right: RAND },
        info: {
          Title: "Wettbewerb — " + e.betrieb,
          Author: "Fokuswerk — Abt & Bodenstab GbR",
          Subject: e.gewerk + " in " + e.ort,
          Creator: "fokuswerk.de/wettbewerb",
        },
      });
      d.registerFont("n", PFADE.normal);
      d.registerFont("m", PFADE.mittel);
      d.registerFont("h", PFADE.halbfett);

      const stuecke = [];
      d.on("data", (s) => stuecke.push(s));
      d.on("end", () => loesen(Buffer.concat(stuecke)));
      d.on("error", scheitern);

      const zustand = { seite: 1 };
      const eigen = e.liste.find((b) => b.eigen);

      // ══ Deckblatt ═════════════════════════════════════════════════════════
      d.rect(0, 0, 595.28, 842).fillColor(DUNKEL).fill();
      for (let i = 10; i >= 1; i--) {
        d.save();
        d.circle(470, 120, i * 42).fillColor(SIGNAL).fillOpacity(0.016).fill();
        d.restore();
      }

      d.font(SCHRIFT.halbfett).fontSize(10).fillColor(PAPIER_HELL)
        .text("FOKUSWERK", RAND, RAND, { characterSpacing: 2.2 });
      d.font(SCHRIFT.normal).fontSize(8.5).fillColor(P45)
        .text(e.geprueft, RAND, RAND + 1, { width: BREITE, align: "right" });

      d.y = RAND + 128;
      d.font(SCHRIFT.halbfett).fontSize(8).fillColor("#FF7341")
        .text("IHR PLATZ IM ORT", RAND, d.y, { characterSpacing: 1.2 });
      d.moveDown(0.6);
      d.font(SCHRIFT.mittel).fontSize(26).fillColor(PAPIER_HELL)
        .text(e.betrieb, RAND, d.y, { width: BREITE - 40, lineGap: -3 });
      d.moveDown(0.3);
      d.font(SCHRIFT.normal).fontSize(10).fillColor(P45)
        .text(e.gewerk + " in " + e.ort, RAND, d.y, { width: BREITE });

      // Der Platz als Hauptmotiv.
      const yPlatz = 318;
      d.font(SCHRIFT.mittel).fontSize(96).fillColor(PAPIER_HELL)
        .text(String(eigen.platz), RAND, yPlatz, { lineGap: -20 });
      const bPlatz = d.widthOfString(String(eigen.platz));
      d.font(SCHRIFT.normal).fontSize(12).fillColor(P45)
        .text("von " + e.liste.length, RAND + bPlatz + 12, yPlatz + 62);
      d.font(SCHRIFT.mittel).fontSize(12).fillColor("#FF7341")
        .text(e.einordnung.wort, RAND, yPlatz + 10, { width: BREITE, align: "right" });

      // Der Balken läuft von hinten nach vorn: Platz 1 ist voll, der letzte fast leer.
      const yBalken = yPlatz + 104;
      const anteil = (e.liste.length - eigen.platz + 1) / e.liste.length;
      d.rect(RAND, yBalken, BREITE, 3).fillColor("#2C2A30").fill();
      d.rect(RAND, yBalken, BREITE * anteil, 3).fillColor(PAPIER_HELL).fill();

      d.font(SCHRIFT.normal).fontSize(11).fillColor(P70)
        .text(e.einordnung.satz, RAND, yBalken + 20, { width: BREITE - 30, lineGap: 2 });

      // Was Plätze kostet.
      const schwer = e.befunde.filter((b) => b.art === "mangel");
      if (schwer.length) {
        d.y = 548;
        d.font(SCHRIFT.halbfett).fontSize(8).fillColor("#FF8A6B").text(
          (schwer.length === 1 ? "EIN PUNKT KOSTET" : schwer.length + " PUNKTE KOSTEN") + " SIE PLÄTZE",
          RAND, d.y, { characterSpacing: 1.2 },
        );
        d.moveDown(0.6);
        for (const b of schwer.slice(0, 3)) {
          const y = d.y;
          d.save();
          d.rect(RAND, y + 3, 2.5, 11).fillColor("#FF8A6B").fill();
          d.restore();
          d.font(SCHRIFT.mittel).fontSize(11.5).fillColor(PAPIER_HELL)
            .text(b.titel, RAND + 13, y, { width: BREITE - 13 });
          d.moveDown(0.4);
          d.x = RAND;
        }
      }

      // Der Markt in Zahlen.
      //
      // Die Hoehe richtet sich nach der Zahl der Felder, der FUSS des Blocks bleibt fest.
      // Vorher stand hier eine feste 686 fuer genau vier Felder. Als am 29.10.2026 die
      // Google-Zahl dazukam, lief das fuenfte Feld ueber den Seitenrand: Der Wert landete
      // auf Seite 2, die Beschriftung auf Seite 3, und dazwischen standen zwei fast leere
      // Seiten. Wer eine Zahl ergaenzt, soll das Layout nicht von Hand nachrechnen muessen.
      const spalte = (BREITE - 24) / 2;
      const reihen = Math.max(1, Math.ceil(e.kennzahlen.length / 2));
      let yFeld = 724 - (reihen - 1) * 38;
      d.font(SCHRIFT.halbfett).fontSize(8).fillColor(P45)
        .text("DER ORT IN ZAHLEN", RAND, yFeld - 22, { characterSpacing: 1.2 });
      e.kennzahlen.forEach((k, i) => {
        const x = RAND + (i % 2) * (spalte + 24);
        if (i % 2 === 0 && i > 0) yFeld += 38;
        d.font(SCHRIFT.mittel).fontSize(15).fillColor(PAPIER_HELL)
          .text(k.wert, x, yFeld, { width: spalte, lineBreak: false });
        d.font(SCHRIFT.normal).fontSize(8.5).fillColor(P45)
          .text(k.text, x, yFeld + 19, { width: spalte - 10, lineBreak: false });
      });

      // ══ Seite 2 — die Liste ═══════════════════════════════════════════
      neueSeite(d, zustand);
      versal(d, "Der Wettbewerb", AKZENT);
      d.font(SCHRIFT.mittel).fontSize(19).fillColor(TINTE)
        .text(e.gewerkPlural + " in " + e.ort, RAND, d.y, { width: BREITE });
      d.moveDown(0.5);
      d.font(SCHRIFT.normal).fontSize(9.5).fillColor(LEISE)
        .text(e.listeEinleitung, RAND, d.y, { width: BREITE - 20, lineGap: 1.5 });
      d.moveDown(1.2);

      tabellenkopf(d);
      e.liste.forEach((b) => tabellenzeile(d, b, b.eigen));

      d.moveDown(0.8);
      d.font(SCHRIFT.normal).fontSize(8).fillColor(STILL)
        .text(e.listeFussnote, RAND, d.y, { width: BREITE, lineGap: 1.5 });

      // Die Quellen stehen hier und nicht am Dokumentende: Sie gehören zu den Zahlen
      // darüber, und am Ende blieben sie als vier Zeilen allein auf einer leeren Seite.
      d.moveDown(2);
      linie(d);
      d.moveDown(0.9);
      versal(d, "Woher die Zahlen kommen", STILL);
      e.quellen.forEach((q) => {
        d.font(SCHRIFT.mittel).fontSize(8.5).fillColor(LEISE)
          .text(q.titel, RAND, d.y, { width: BREITE });
        d.font(SCHRIFT.normal).fontSize(8.5).fillColor(STILL)
          .text(q.text, RAND, d.y + 1, { width: BREITE, lineGap: 1.2 });
        d.moveDown(0.6);
      });

      // ══ Seite 3 — die Befunde ═════════════════════════════════════════════
      neueSeite(d, zustand);
      versal(d, "Was dahinter steht", AKZENT);
      d.font(SCHRIFT.mittel).fontSize(19).fillColor(TINTE)
        .text("Woher Ihr Platz kommt", RAND, d.y, { width: BREITE });
      d.moveDown(1);
      e.befunde.forEach((b) => befund(d, zustand, b));

      // ══ Seite 4 — die Anzeigenlage ════════════════════════════════════════
      neueSeite(d, zustand);
      versal(d, "Die Anzeigenlage", AKZENT);
      d.font(SCHRIFT.mittel).fontSize(19).fillColor(TINTE)
        .text("Wer wirbt, und um was", RAND, d.y, { width: BREITE });
      d.moveDown(0.5);
      d.font(SCHRIFT.normal).fontSize(9.5).fillColor(LEISE)
        .text(e.anzeigen.einleitung, RAND, d.y, { width: BREITE - 20, lineGap: 1.5 });
      d.moveDown(1.2);

      // Die eine Zahl, die das Bild macht.
      const oben = d.y;
      d.save();
      d.roundedRect(RAND, oben, BREITE, 78, 5).fillColor(AKZENT).fillOpacity(0.05).fill();
      d.restore();
      d.font(SCHRIFT.mittel).fontSize(38).fillColor(AKZENT)
        .text(e.anzeigen.zahl, RAND + 20, oben + 16, { width: 150, lineBreak: false });
      // Der Satz steht direkt an der Zahl, nicht an einer festen Spalte: Bei „1" bliebe
      // sonst ein Loch, bei „12 von 40" liefe er in die Zahl hinein.
      const xSatz = RAND + 20 + d.widthOfString(String(e.anzeigen.zahl)) + 22;
      d.font(SCHRIFT.mittel).fontSize(11).fillColor(TINTE)
        .text(e.anzeigen.zahlText, xSatz, oben + 20, { width: RAND + BREITE - xSatz - 20, lineGap: 1.5 });
      d.y = oben + 78 + 18;
      d.x = RAND;

      e.anzeigen.treffer.forEach((t) => {
        platzPruefen(d, zustand, 150);
        versal(d, t.wer, STILL);
        d.font(SCHRIFT.mittel).fontSize(11).fillColor(TINTE)
          .text(t.titel, RAND, d.y, { width: BREITE });
        d.moveDown(0.3);
        d.font(SCHRIFT.normal).fontSize(8.5).fillColor(LEISE)
          .text(t.lauf, RAND, d.y, { width: BREITE });
        d.moveDown(0.6);

        // Der fremde Anzeigentext als Zitat, eingerückt und grau — er ist Beleg,
        // nicht unsere Aussage.
        const yz = d.y;
        const hz = d.font(SCHRIFT.normal).fontSize(9).heightOfString(ohneEmoji(t.text), {
          width: BREITE - 30, lineGap: 1.5,
        });
        d.save();
        d.rect(RAND, yz, 2, hz + 4).fillColor(LINIE).fill();
        d.restore();
        d.font(SCHRIFT.normal).fontSize(9).fillColor("#4A4A4E")
          .text(ohneEmoji(t.text), RAND + 14, yz + 2, { width: BREITE - 30, lineGap: 1.5 });
        d.moveDown(1);
        d.x = RAND;
      });

      d.moveDown(0.4);
      befund(d, zustand, e.anzeigen.befund);
      // Google Ads daneben, seit 29.10.2026. Faellt weg, wenn kein Betrieb im Ort eine
      // eigene Domain hat — dann gibt es nichts zu pruefen und nichts zu sagen.
      if (e.anzeigen.googleBefund) {
        platzPruefen(d, zustand, 120);
        befund(d, zustand, e.anzeigen.googleBefund);
      }

      // Der Schlussblock wird an den Befund davor gebunden. Allein auf einer Seite liest
      // er sich wie ein nachgeschobener Verkaufszettel.
      if (d.y + schlussbandHoehe(d, e.schritte, e.schlusssatz) > 842 - FUSS) neueSeite(d, zustand);
      schlussband(d, e.schritte, e.schlusssatz);

      // ── Kopf- und Fußzeilen auf alle Seiten ───────────────────────────────
      const anzahl = d.bufferedPageRange().count;
      for (let i = 0; i < anzahl; i++) {
        d.switchToPage(i);
        // Ohne das legt pdfkit für jede Fußzeile eine neue Seite an, weil sie unterhalb
        // des Satzspiegels steht — und jede neue Seite bekommt wieder eine Fußzeile.
        d.page.margins.bottom = 0;
        d.page.margins.top = 0;
        if (i === 0) continue;

        d.font(SCHRIFT.halbfett).fontSize(7).fillColor(STILL).text(
          "IHR PLATZ IM ORT", RAND, RAND - 24,
          { characterSpacing: 1.1, width: BREITE / 2, lineBreak: false },
        );
        d.font(SCHRIFT.normal).fontSize(7).fillColor(STILL).text(
          e.betrieb + " · " + e.ort, RAND, RAND - 24,
          { width: BREITE, align: "right", lineBreak: false },
        );

        const yf = 842 - 54;
        d.moveTo(RAND, yf - 12).lineTo(RAND + BREITE, yf - 12).lineWidth(0.6).strokeColor(LINIE).stroke();
        d.font(SCHRIFT.normal).fontSize(7.5).fillColor(STILL)
          .text("Fokuswerk · " + e.geprueft, RAND, yf, { width: BREITE, lineBreak: false });
        d.font(SCHRIFT.normal).fontSize(7.5).fillColor(STILL)
          .text(i + 1 + " / " + anzahl, RAND, yf, { width: BREITE, align: "right", lineBreak: false });
      }

      d.end();
    } catch (fehler) {
      scheitern(fehler);
    }
  });
}
