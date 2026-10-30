// Die beiden Mails zur SEO- und GEO-Analyse.
//
// Dieselbe Hülle und dieselben Karten wie beim Stellenanzeiger: Tabellenlayout, Stile
// inline, keine Webschriften, keine Bilder. In Betrieben wird beides blockiert, und eine
// Mail, die als leeres Rechteck ankommt, ist schlimmer als gar keine.
//
// Beide gehen als HTML **und** als Text hinaus.

import {
  escape, huelle, karte, etikett, angabe,
  WEISS, TINTE, LEISE, LINIE, AKZENT, SCHRIFT,
} from "./mail-vorlagen.js";

const FARBE = { gut: "#1F6B4A", luecke: "#8A6A1F", mangel: "#A8321B", unbekannt: LEISE };
const WORT = {
  mangel: "Kostet Sie Kunden",
  luecke: "Lücke",
  gut: "In Ordnung",
  unbekannt: "Nicht messbar",
};

const ANFRAGEN = {
  empfehlung: "fast nur über Empfehlung",
  google: "auch über Google",
  social: "über Instagram oder Facebook",
  kaum: "kommt gerade wenig",
};
const ZIEL = {
  anfragen: "mehr Anfragen von Kunden",
  mitarbeiter: "Mitarbeiter finden",
  auftritt: "besser dastehen",
  unklar: "erst einmal sehen, wo er steht",
};

// Ein Befund als Zeile. Der Messwert steht immer dabei — ohne ihn ist es eine Behauptung,
// und der Betrieb soll jede Angabe in seinem Quelltext nachsehen können.
function befundZeile(b) {
  const farbe = FARBE[b.urteil] || LEISE;
  return `<tr><td style="padding:14px 0;border-top:1px solid ${LINIE};">
    <p style="margin:0 0 4px;font:600 11px/1 ${SCHRIFT};letter-spacing:0.12em;text-transform:uppercase;color:${farbe};">${escape(WORT[b.urteil] || "")}</p>
    <p style="margin:0;font:500 15px/1.45 ${SCHRIFT};color:${TINTE};">${escape(b.titel)}</p>
    ${b.messwert ? `<p style="margin:7px 0 0;padding-left:10px;border-left:2px solid ${farbe};font:400 13px/1.55 ${SCHRIFT};color:${LEISE};">${escape(b.messwert)}</p>` : ""}
    ${b.klartext ? `<p style="margin:9px 0 0;font:400 14px/1.6 ${SCHRIFT};color:${TINTE};">${escape(b.klartext)}</p>` : ""}
    ${b.folge ? `<p style="margin:7px 0 0;font:500 13px/1.55 ${SCHRIFT};color:${AKZENT};">${escape(b.folge)}</p>` : ""}
  </td></tr>`;
}

// ---------------------------------------------------------------------------
// 1. An den Betrieb: seine Auswertung
// ---------------------------------------------------------------------------

// Liegt das PDF bei, ist die Mail nur noch das Anschreiben: Note, die drei schwersten
// Punkte, Verweis auf den Anhang. Alles andere steht im Dokument — eine Mail, die den
// Bericht noch einmal vollständig enthält, macht den Anhang überflüssig und sich selbst
// unlesbar (die erste Fassung war 43 KB).
export function auswertungMail(daten, ergebnis, { mitPdf = false } = {}) {
  const alle = (ergebnis.felder || []).flatMap((f) => f.befunde || []);
  const maengel = alle.filter((b) => b.urteil === "mangel");
  const name = String(daten?.kontakt?.name || "").trim();
  const anrede = name ? "Guten Tag " + name : "Guten Tag";
  const betrieb = ergebnis.betrieb || daten.domain || "Ihre Seite";

  // Oben einmal die Note als gestalteter Block — danach ein ganz normaler Brief.
  // Vorher war die ganze Mail gebaut: Karten, Etiketten, Befundlisten. Das liest sich
  // wie ein Prospekt, und man mag kein Prospekt.
  const auftakt = karte(`
    ${etikett("Ihre SEO- und GEO-Analyse")}
    <p style="margin:0 0 4px;font:500 20px/1.25 ${SCHRIFT};color:${TINTE};">${escape(betrieb)}</p>
    <p style="margin:0 0 20px;font:400 13px/1.5 ${SCHRIFT};color:${LEISE};">${escape(ergebnis.domain || daten.domain || "")} · geprüft am ${escape(ergebnis.geprueft || "")}</p>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="font:500 44px/1 ${SCHRIFT};color:${TINTE};">${escape(String(ergebnis.gesamt ?? "–"))}</td>
      <td style="padding-left:8px;font:400 13px/1 ${SCHRIFT};color:${LEISE};">von 100</td>
    </tr></table>
    ${ergebnis.einordnung ? `<p style="margin:14px 0 0;font:400 15px/1.6 ${SCHRIFT};color:${TINTE};">${escape(ergebnis.einordnung.satz)}</p>` : ""}`);

  const absatz = (t) =>
    `<p style="margin:0 0 16px;font:400 16px/1.7 ${SCHRIFT};color:${TINTE};">${t}</p>`;

  const zuerstSatz = maengel.length
    ? (maengel.length === 1
        ? `Ein Punkt kostet Sie aus unserer Sicht heute Kunden: ${escape(maengel[0].titel)}.`
        : `${["", "Ein", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Sieben"][maengel.length] || maengel.length} Punkte kosten Sie aus unserer Sicht heute Kunden: ` +
          maengel.slice(0, 2).map((b) => escape(b.titel)).join(" und ") +
          (maengel.length > 2 ? " — und " + (maengel.length - 2) + " weitere" : "") + ".") +
      " Die stehen im PDF ganz vorn, mit dem jeweiligen Aufwand."
    : "Nichts davon kostet Sie gerade Kunden — das ist seltener, als Sie denken.";

  const brief = `<tr><td style="padding:26px 4px 0;">
    ${absatz(escape(anrede) + ",")}
    ${absatz(
      `im Anhang finden Sie Ihre Analyse als PDF. Darin stehen alle ${alle.length} Befunde,
       jeder mit dem Wert, den wir an Ihrer Seite gemessen haben, und dem, was er bedeutet.
       Dazu, was eine KI über Ihren Betrieb findet — und was nicht.`,
    )}
    ${absatz(zuerstSatz)}
    ${absatz(
      `Die Hälfte der Punkte können Sie selbst erledigen oder von dem erledigen lassen,
       der Ihre Seite betreut. Das Dokument können Sie dafür einfach weitergeben.`,
    )}
    ${absatz(
      `Wenn Sie Fragen zu einem Befund haben oder Hilfe brauchen, melden Sie sich gerne.
       Einfach auf diese Mail antworten oder anrufen:
       <a href="tel:+4917663307587" style="color:${TINTE};">0176 63307587</a>.`,
    )}
    <p style="margin:26px 0 0;font:400 16px/1.7 ${SCHRIFT};color:${TINTE};">
      Viele Grüße<br>Thees Bodenstab
    </p>
  </td></tr>`;

  const roh = (t) => String(t).replace(/<[^>]+>/g, "");

  const text = [
    `Ihre SEO- und GEO-Analyse für ${betrieb}: ${ergebnis.gesamt ?? "–"} von 100` +
      (ergebnis.einordnung ? ` (${ergebnis.einordnung.wort})` : ""),
    ergebnis.einordnung ? ergebnis.einordnung.satz : "",
    "",
    anrede + ",",
    "",
    `im Anhang finden Sie Ihre Analyse als PDF. Darin stehen alle ${alle.length} Befunde, jeder`,
    "mit dem Wert, den wir an Ihrer Seite gemessen haben, und dem, was er bedeutet. Dazu,",
    "was eine KI über Ihren Betrieb findet — und was nicht.",
    "",
    roh(zuerstSatz),
    "",
    "Die Hälfte der Punkte können Sie selbst erledigen oder von dem erledigen lassen, der",
    "Ihre Seite betreut. Das Dokument können Sie dafür einfach weitergeben.",
    "",
    "Wenn Sie Fragen zu einem Befund haben oder Hilfe brauchen, melden Sie sich gerne.",
    "Einfach auf diese Mail antworten oder anrufen: 0176 63307587.",
    "",
    "Viele Grüße",
    "Thees Bodenstab",
    "",
    "Fokuswerk — Abt & Bodenstab GbR · Schramperweg 90 · 26129 Oldenburg",
    "0176 63307587 · contact@fokuswerk.de · USt-IdNr. DE456629159",
  ].filter((z) => z !== null && z !== undefined).join("\n");

  return {
    html: huelle(`<tr><td style="padding:0 4px;">${auftakt}</td></tr>` + brief,
      "Ihre SEO- und GEO-Analyse: " + (ergebnis.gesamt ?? "–") + " von 100"),
    text,
  };
}

export function seoLeadMail(daten, ergebnis, lagerstand) {
  const k = daten.kontakt || {};
  const maengel = (ergebnis.felder || [])
    .flatMap((f) => f.befunde || [])
    .filter((b) => b.urteil === "mangel");

  // Diese Mail sagt, wer sich gemeldet hat. Mehr nicht.
  //
  // Die erste Fassung hatte die drei schwersten Befunde mit Klartext und Handlungsempfehlung
  // drin — rund zwei Bildschirme auf dem Handy. Im Postfach liest das niemand: Wer die
  // Meldung sieht, will wissen, ob er anruft, und ruft dann an. Alles Weitere steht in der
  // Pipeline und in der Auswertung, die der Betrieb selbst bekommen hat.
  const inhalt = karte(`
    ${etikett("Neuer Lead · SEO- und GEO-Analyse")}
    <p style="margin:0 0 3px;font:500 21px/1.3 ${SCHRIFT};color:${TINTE};">${escape(k.name || "Ohne Namen")}</p>
    <p style="margin:0 0 18px;font:400 14px/1.5 ${SCHRIFT};color:${LEISE};">${escape(ergebnis.betrieb || daten.domain || "")}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;">
      ${angabe("Telefon", k.telefon, { hervor: true, link: k.telefon ? "tel:" + String(k.telefon).replace(/\s/g, "") : "" })}
      ${angabe("E-Mail", k.email, { link: k.email ? "mailto:" + k.email : "" })}
      ${angabe("Website", (ergebnis.domain || daten.domain || "").replace(/^https?:\/\//, "").replace(/\/$/, ""))}
    </table>

    <p style="margin:18px 0 0;padding-top:14px;border-top:1px solid ${LINIE};font:400 14px/1.6 ${SCHRIFT};color:${TINTE};">
      Sichtbarkeit <strong style="font-weight:600;">${escape(String(ergebnis.gesamt ?? "–"))} von 100</strong>${maengel.length ? escape(" · " + maengel.length + (maengel.length === 1 ? " schwerer Mangel" : " schwere Mängel")) : ""}<br>
      ${daten.leistung ? escape("Will gefunden werden für " + daten.leistung + (daten.ort ? " in " + daten.ort : "")) : ""}${daten.ziel && ZIEL[daten.ziel] ? escape(" · Ziel: " + ZIEL[daten.ziel]) : ""}
    </p>`);

  const html = huelle(
    inhalt,
    (k.name || "Neuer Lead") + " · " + (ergebnis.gesamt ?? "–") + " von 100",
  );

  const alsText = [
    "NEUER LEAD · SEO- UND GEO-ANALYSE",
    "",
    (k.name || "Ohne Namen"),
    (ergebnis.betrieb || daten.domain || ""),
    "",
    "Telefon: " + (k.telefon || "–"),
    "E-Mail:  " + (k.email || "–"),
    "Website: " + (ergebnis.domain || daten.domain || "–"),
    "",
    "Sichtbarkeit " + (ergebnis.gesamt ?? "–") + " von 100" +
      (maengel.length ? " · " + maengel.length + " schwere Mängel" : ""),
    daten.leistung
      ? "Will gefunden werden für " + daten.leistung + (daten.ort ? " in " + daten.ort : "")
      : "",
    daten.ziel && ZIEL[daten.ziel] ? "Ziel: " + ZIEL[daten.ziel] : "",
  ].filter((z) => z !== "").join("\n");

  return { html, text: alsText };
}
