// Die beiden Mails, die das Werkzeug verschickt — als HTML, nicht als Textwüste.
//
// Regeln für E-Mail-HTML, die hier eingehalten sind:
//   · Tabellen statt Flexbox — Outlook kann nichts anderes
//   · alle Stile inline, kein <style>-Block (Gmail schneidet ihn teils weg)
//   · keine Webschriften, keine Bilder: Schriften werden blockiert, Bilder meist auch.
//     Die Marke steht als Text, damit sie immer da ist.
//   · 600 px Breite, die überall funktioniert
//   · Orange nur groß oder abgedunkelt (#B84116), sonst reicht der Kontrast nicht
//
// Haltung: heller Grund, weiße Karten, viel Luft, klare Gliederung. Kein dunkles Dashboard,
// keine Farbbalken, keine Symbole — die Mail soll aussehen wie von einer Agentur, die weiß,
// was sie tut, und nicht wie ein Newsletter-Baukasten.

export const PAPIER = "#F5F3EF";
export const WEISS = "#FFFFFF";
export const TINTE = "#17161B";
export const LEISE = "#6B6A6E";
export const LINIE = "#E4E1DB";
export const AKZENT = "#B84116";
export const SCHRIFT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif";

export function escape(t) {
  return String(t == null ? "" : t)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Absätze eines Anzeigentextes (getrennt durch \n) zu <p> machen
export function absaetze(text, farbe = TINTE, groesse = "15px") {
  return String(text || "")
    .split("\n")
    .map((z) => z.trim())
    .filter(Boolean)
    .map(
      (z) =>
        `<p style="margin:0 0 10px;font:400 ${groesse}/1.65 ${SCHRIFT};color:${farbe};">${escape(z)}</p>`
    )
    .join("");
}

export function huelle(inhalt, vorschau) {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:${PAPIER};word-break:break-word;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(vorschau)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPIER};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
  <tr><td style="padding:0 4px 22px;">
    <span style="font:600 15px/1 ${SCHRIFT};letter-spacing:0.14em;color:${TINTE};">FOKUSWERK</span>
  </td></tr>
  ${inhalt}
  <tr><td style="padding:28px 4px 0;border-top:1px solid ${LINIE};">
    <p style="margin:0;font:400 12px/1.7 ${SCHRIFT};color:${LEISE};">
      Fokuswerk — Abt &amp; Bodenstab GbR · Schramperweg 90 · 26129 Oldenburg<br>
      0176 63307587 · contact@fokuswerk.de · USt-IdNr. DE456629159
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function karte(inhalt, polster = "24px") {
  return `<tr><td style="padding:0 0 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background:${WEISS};border:1px solid ${LINIE};border-radius:14px;">
      <tr><td style="padding:${polster};">${inhalt}</td></tr>
    </table>
  </td></tr>`;
}

export function etikett(text) {
  return `<p style="margin:0 0 12px;font:600 11px/1 ${SCHRIFT};letter-spacing:0.16em;color:${LEISE};text-transform:uppercase;">${escape(text)}</p>`;
}

// Eine Angabe der internen Meldungen: Beschriftung klein darüber, Wert darunter über die
// ganze Breite. Vorher stand die Beschriftung links in einer Spalte mit fester Breite und
// `white-space:nowrap` — auf dem Handy blieben dem Wert daneben rund 140 px, und jede
// längere Mailadresse brach darin mitten im Wort um („…@icloud.co / m"). Gestapelt hat
// jeder Wert die volle Zeile.
//
// `wert` ist immer Rohtext und wird hier maskiert. `link` macht daraus einen Verweis
// (`tel:`, `mailto:` oder `https://`) — die drei Meldungen hatten dafür vorher drei
// eigene Fassungen mit drei verschiedenen Verträgen.
export function angabe(bezeichnung, wert, { hervor = false, link = "" } = {}) {
  const text = wert == null ? "" : String(wert).trim();
  if (!text) return "";
  const inhalt = link
    ? `<a href="${escape(link)}" style="color:${TINTE};text-decoration:none;border-bottom:1px solid ${LINIE};">${escape(text)}</a>`
    : escape(text);
  return `<tr><td style="padding:0 0 13px;">
    <p style="margin:0 0 3px;font:600 10px/1.2 ${SCHRIFT};letter-spacing:0.13em;color:${LEISE};text-transform:uppercase;">${escape(bezeichnung)}</p>
    <p style="margin:0;font:${hervor ? "600 17px" : "400 15px"}/1.45 ${SCHRIFT};color:${TINTE};">${inhalt}</p>
  </td></tr>`;
}

// ---------------------------------------------------------------------------
// 1. An den Betrieb: seine drei Anzeigen
// ---------------------------------------------------------------------------

export function anzeigenMail(daten, ergebnis) {
  // Den Namen so nehmen, wie er eingetragen wurde. „Herr/Frau" waere Formularsprache,
  // und das Geschlecht kennen wir nicht — geraten wird hier nicht.
  const name = String(daten?.kontakt?.name || "").trim();
  const anrede = name ? "Guten Tag " + name : "Guten Tag";
  const betrieb = ergebnis?.betrieb || daten?.domain || "Ihren Betrieb";
  const beruf = daten?.beruf || "die offene Stelle";
  const L = ergebnis?.marktlage;

  // Oben einmal die Zahl als gestalteter Block — danach ein ganz normaler Brief.
  // Vorher war die ganze Mail gebaut: Karten, Etiketten, Aufzählungen, ein Kasten mit
  // dem Angebot. Das liest sich wie ein Prospekt, und man mag kein Prospekt.
  const auftakt = L
    ? `<tr><td style="padding:0 4px 26px;">
         ${karte(
           `<p style="margin:0 0 6px;font:600 11px/1 ${SCHRIFT};letter-spacing:0.16em;color:${AKZENT};text-transform:uppercase;">Die Lage in Ihrem Beruf</p>
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="font:500 42px/1 ${SCHRIFT};color:${TINTE};">${L.vakanzzeit}</td>
              <td style="padding-left:10px;font:400 14px/1.35 ${SCHRIFT};color:${LEISE};">Tage bleibt eine<br>Stelle im Schnitt offen</td>
            </tr></table>
            <p style="margin:14px 0 0;font:400 12px/1.5 ${SCHRIFT};color:${LEISE};">
              ${escape(L.berufsgruppe)} · ${escape(L.gebiet)} · ${escape(L.stand)} ·
              <a href="${L.quelle.link}" style="color:${LEISE};">${escape(L.quelle.text)}</a>
            </p>`,
         )}
       </td></tr>`
    : "";

  const absatz = (t) =>
    `<p style="margin:0 0 16px;font:400 16px/1.7 ${SCHRIFT};color:${TINTE};">${t}</p>`;

  const brief = `<tr><td style="padding:0 4px;">
    ${absatz(escape(anrede) + ",")}
    ${absatz(
      `im Anhang finden Sie Ihre Stellenausschreibung als PDF. Darin stehen die Texte für
       vier Kanäle — Kleinanzeigen, die Jobbörse der Arbeitsagentur, Facebook und Instagram
       und Ihre eigene Seite —, jeweils so, wie der Kanal sie haben will. Dazu die vier
       Fragen für die Bewerbung, eine Anleitung zum Schalten der Anzeige mit Ihrem Ort und
       Ihrem Tagesbudget, ein kurzes Drehbuch für ein Handyvideo und die ersten Antworten
       an Bewerber. Auf der ersten Seite steht, was wo zu finden ist.`,
    )}
    ${absatz(
      `Am einfachsten drucken Sie das PDF aus oder leiten es an den weiter, der die
       Anzeige einstellt. Die Texte können Sie unverändert übernehmen oder ändern, was
       nicht passt — es ist Ihre Stelle, Sie kennen ${escape(betrieb)} besser als wir.`,
    )}
    ${absatz(
      `Wenn Sie dabei Fragen haben oder irgendwo Hilfe brauchen, melden Sie sich gerne.
       Einfach auf diese Mail antworten oder anrufen:
       <a href="tel:+4917663307587" style="color:${TINTE};">0176 63307587</a>.`,
    )}
    <p style="margin:26px 0 0;font:400 16px/1.7 ${SCHRIFT};color:${TINTE};">
      Viele Grüße<br>Thees Bodenstab
    </p>
  </td></tr>`;

  const text = [
    ...(L
      ? [
          `${L.vakanzzeit} Tage bleibt eine Stelle als ${beruf} in ${L.gebiet} im Schnitt offen.`,
          `(${L.berufsgruppe} · ${L.stand} · ${L.quelle.text})`,
          "",
        ]
      : []),
    anrede + ",",
    "",
    "im Anhang finden Sie Ihre Stellenausschreibung als PDF. Darin stehen die Texte für vier",
    "Kanäle — Kleinanzeigen, die Jobbörse der Arbeitsagentur, Facebook und Instagram und Ihre",
    "eigene Seite —, jeweils so, wie der Kanal sie haben will. Dazu die vier Fragen für die",
    "Bewerbung, eine Anleitung zum Schalten der Anzeige mit Ihrem Ort und Ihrem Tagesbudget,",
    "ein kurzes Drehbuch für ein Handyvideo und die ersten Antworten an Bewerber. Auf der",
    "ersten Seite steht, was wo zu finden ist.",
    "",
    "Am einfachsten drucken Sie das PDF aus oder leiten es an den weiter, der die Anzeige",
    `einstellt. Die Texte können Sie unverändert übernehmen oder ändern, was nicht passt —`,
    `es ist Ihre Stelle, Sie kennen ${betrieb} besser als wir.`,
    "",
    "Wenn Sie dabei Fragen haben oder irgendwo Hilfe brauchen, melden Sie sich gerne.",
    "Einfach auf diese Mail antworten oder anrufen: 0176 63307587.",
    "",
    "Viele Grüße",
    "Thees Bodenstab",
    "",
    "Fokuswerk — Abt & Bodenstab GbR · Schramperweg 90 · 26129 Oldenburg",
    "0176 63307587 · contact@fokuswerk.de · USt-IdNr. DE456629159",
  ].join("\n");

  return {
    html: huelle(auftakt + brief, `Ihre Stellenausschreibung für ${betrieb}`),
    text,
  };
}

const DRINGLICH = { sofort: "so schnell wie möglich", wochen: "in den nächsten Wochen", planung: "plant vor" };
const STELLEN = { eine: "eine", zwei_drei: "zwei bis drei", mehr: "mehr als drei" };
const ERFAHRUNG = {
  laeuft: "schaltet bereits Anzeigen bei Meta",
  probiert: "hat es probiert, war unzufrieden",
  nie: "hat noch nie Anzeigen geschaltet",
};
const STAERKEN = {
  bezahlung: "Bezahlung über dem Üblichen", feierabend: "geregelter Feierabend",
  team: "kleines, eingespieltes Team", technik: "moderne Ausrüstung",
  aufstieg: "Weiterbildung und Aufstieg", sicherheit: "sicherer Arbeitsplatz",
};

export function leadMail(daten, lagerstand) {
  const k = daten?.kontakt || {};
  const betrieb = daten?.betrieb || daten?.domain || "unbekannt";
  const eilig = daten?.dringlichkeit === "sofort";

  const kopf = `<tr><td style="padding:0 4px 20px;">
    <h1 style="margin:0 0 6px;font:600 24px/1.3 ${SCHRIFT};color:${TINTE};letter-spacing:-0.02em;">
      ${escape(betrieb)} sucht ${escape(daten?.beruf || "jemanden")}
    </h1>
    <p style="margin:0;font:400 14px/1.6 ${SCHRIFT};color:${LEISE};">
      Über den Stellenanzeigen-Generator auf fokuswerk.de${eilig ? " · <strong style=\"color:" + AKZENT + ';">sucht sofort</strong>' : ""}
    </p>
  </td></tr>`;

  const kontakt = karte(
    etikett("Kontakt") +
      `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${angabe("Ansprechpartner", k.name, { hervor: true })}
        ${angabe("Telefon", k.telefon, { hervor: true, link: k.telefon ? "tel:" + String(k.telefon).replace(/\s/g, "") : "" })}
        ${angabe("E-Mail", k.email, { link: k.email ? "mailto:" + k.email : "" })}
        ${angabe("Website", daten?.domain, { link: daten?.domain ? "https://" + daten.domain : "" })}
      </table>`
  );

  const lage = karte(
    etikett("Was er gesagt hat") +
      `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${angabe("Gesucht", daten?.beruf, { hervor: true })}
        ${angabe("Dringlichkeit", DRINGLICH[daten?.dringlichkeit] || "")}
        ${angabe("Offene Stellen", STELLEN[daten?.stellen] || "")}
        ${angabe("Anzeigen bisher", ERFAHRUNG[daten?.erfahrung] || "")}
        ${angabe("Stärken der Stelle", (daten?.staerken || []).map((s) => STAERKEN[s] || s).join(", "))}
      </table>`
  );

  const hinweis = `<tr><td style="padding:10px 4px 0;">
    <p style="margin:0;font:400 13px/1.6 ${SCHRIFT};color:${LEISE};">
      Die Anzeigen sind dem Betrieb bereits zugeschickt. Auf diese Mail zu antworten schreibt
      direkt an ${escape(k.email || "den Betrieb")}.
      ${lagerstand?.angelegt ? "Steht im Sales-Funnel."
        : lagerstand?.schon_da ? "Stand schon im Sales-Funnel — zweite Anfrage derselben Adresse."
        : lagerstand?.uebersprungen ? "Nicht im Funnel: " + escape(lagerstand.uebersprungen) + "."
        : lagerstand?.fehler ? "Nicht im Funnel: " + escape(lagerstand.fehler) : ""}
    </p>
  </td></tr>`;

  const text = [
    `${betrieb} sucht ${daten?.beruf || "jemanden"}`,
    "",
    `Ansprechpartner: ${k.name || "—"}`,
    `Telefon:         ${k.telefon || "—"}`,
    `E-Mail:          ${k.email || "—"}`,
    `Website:         ${daten?.domain || "—"}`,
    "",
    `Dringlichkeit:   ${DRINGLICH[daten?.dringlichkeit] || "—"}`,
    `Offene Stellen:  ${STELLEN[daten?.stellen] || "—"}`,
    `Anzeigen bisher: ${ERFAHRUNG[daten?.erfahrung] || "—"}`,
    `Stärken:         ${(daten?.staerken || []).map((s) => STAERKEN[s] || s).join(", ") || "—"}`,
  ].join("\n");

  return {
    html: huelle(kopf + kontakt + lage + hinweis, `${betrieb} sucht ${daten?.beruf || "jemanden"}`),
    text,
  };
}
