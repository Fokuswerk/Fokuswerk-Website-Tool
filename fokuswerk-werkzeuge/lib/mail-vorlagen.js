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

const PAPIER = "#F5F3EF";
const WEISS = "#FFFFFF";
const TINTE = "#17161B";
const LEISE = "#6B6A6E";
const LINIE = "#E4E1DB";
const AKZENT = "#B84116";
const SCHRIFT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif";

function escape(t) {
  return String(t == null ? "" : t)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Absätze eines Anzeigentextes (getrennt durch \n) zu <p> machen
function absaetze(text, farbe = TINTE, groesse = "15px") {
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

function huelle(inhalt, vorschau) {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:${PAPIER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(vorschau)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPIER};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">
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

function karte(inhalt, polster = "24px") {
  return `<tr><td style="padding:0 0 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="background:${WEISS};border:1px solid ${LINIE};border-radius:14px;">
      <tr><td style="padding:${polster};">${inhalt}</td></tr>
    </table>
  </td></tr>`;
}

function etikett(text) {
  return `<p style="margin:0 0 12px;font:600 11px/1 ${SCHRIFT};letter-spacing:0.16em;color:${LEISE};text-transform:uppercase;">${escape(text)}</p>`;
}

// ---------------------------------------------------------------------------
// 1. An den Betrieb: seine drei Anzeigen
// ---------------------------------------------------------------------------

export function anzeigenMail(daten, ergebnis) {
  const name = daten?.kontakt?.name ? " " + daten.kontakt.name : "";
  const betrieb = ergebnis?.betrieb || daten?.domain || "Ihren Betrieb";

  const kopf = `<tr><td style="padding:0 4px 24px;">
    <h1 style="margin:0 0 10px;font:600 26px/1.25 ${SCHRIFT};color:${TINTE};letter-spacing:-0.02em;">
      Ihre drei Stellenanzeigen
    </h1>
    <p style="margin:0;font:400 15px/1.6 ${SCHRIFT};color:${LEISE};">
      Guten Tag${escape(name)}, hier sind die Texte für ${escape(betrieb)}. Sie können sie
      unverändert bei Facebook und Instagram einstellen oder anpassen.
    </p>
  </td></tr>`;

  const anzeigen = (ergebnis?.anzeigen || [])
    .map((a, i) =>
      karte(
        `<p style="margin:0 0 4px;font:600 11px/1 ${SCHRIFT};letter-spacing:0.16em;color:${AKZENT};text-transform:uppercase;">Anzeige ${i + 1}</p>
         <p style="margin:0 0 14px;font:600 17px/1.35 ${SCHRIFT};color:${TINTE};">${escape(a.titel || "")}</p>
         ${absaetze(a.text)}`
      )
    )
    .join("");

  const fragen = (ergebnis?.fragen || []).length
    ? karte(
        etikett("Vier Fragen für die Bewerbung") +
          `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">` +
          ergebnis.fragen
            .map(
              (f, i) =>
                `<tr>
                   <td width="24" valign="top" style="font:600 15px/1.6 ${SCHRIFT};color:${AKZENT};padding:0 0 8px;">${i + 1}</td>
                   <td style="font:400 15px/1.6 ${SCHRIFT};color:${TINTE};padding:0 0 8px;">${escape(f)}</td>
                 </tr>`
            )
            .join("") +
          `</table>`
      )
    : "";

  const budget = ergebnis?.budget
    ? karte(etikett("Budget") + absaetze(ergebnis.budget))
    : "";

  const abschluss = `<tr><td style="padding:14px 4px 0;">
    <p style="margin:0 0 16px;font:400 15px/1.65 ${SCHRIFT};color:${LEISE};">
      Die Anzeige ist der kleinere Teil. Was darüber entscheidet, ob sich jemand meldet, ist die
      Ausspielung: wer sie sieht, bei welchem Budget und wie die Bewerbung hereinkommt.
    </p>
    <a href="https://fokuswerk.de/kontakt"
       style="display:inline-block;background:${TINTE};color:${PAPIER};text-decoration:none;
              font:600 15px/1 ${SCHRIFT};padding:15px 26px;border-radius:999px;">
      Darüber sprechen
    </a>
    <p style="margin:16px 0 0;font:400 14px/1.6 ${SCHRIFT};color:${LEISE};">
      Oder antworten Sie einfach auf diese Mail.
    </p>
  </td></tr>`;

  const text = [
    `Guten Tag${name},`,
    "",
    `hier sind die drei Anzeigentexte für ${betrieb}.`,
    "",
    ...(ergebnis?.anzeigen || []).flatMap((a, i) => [`— Anzeige ${i + 1}: ${a.titel || ""} —`, "", a.text || "", ""]),
    "Vier Fragen für die Bewerbung:",
    ...(ergebnis?.fragen || []).map((f, i) => `  ${i + 1}. ${f}`),
    "",
    "Budget:",
    ergebnis?.budget || "",
    "",
    "Die Anzeige ist der kleinere Teil. Was darüber entscheidet, ob sich jemand meldet, ist die",
    "Ausspielung. Wenn Sie darüber sprechen möchten, antworten Sie einfach auf diese Mail.",
    "",
    "Fokuswerk — Abt & Bodenstab GbR · Schramperweg 90 · 26129 Oldenburg",
    "0176 63307587 · contact@fokuswerk.de · USt-IdNr. DE456629159",
  ].join("\n");

  return {
    html: huelle(kopf + anzeigen + fragen + budget + abschluss, `Drei Anzeigentexte für ${betrieb}`),
    text,
  };
}

// ---------------------------------------------------------------------------
// 2. An uns: der Lead, zum Überfliegen gebaut
// ---------------------------------------------------------------------------

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

function zeile(bezeichnung, wert, hervor) {
  if (!wert) return "";
  return `<tr>
    <td width="150" valign="top" style="font:400 13px/1.6 ${SCHRIFT};color:${LEISE};padding:0 12px 10px 0;white-space:nowrap;">${escape(bezeichnung)}</td>
    <td valign="top" style="font:${hervor ? "600 16px" : "400 15px"}/1.5 ${SCHRIFT};color:${TINTE};padding:0 0 10px;">${wert}</td>
  </tr>`;
}

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
        ${zeile("Ansprechpartner", escape(k.name), true)}
        ${zeile("Telefon", k.telefon ? `<a href="tel:${escape(String(k.telefon).replace(/\s/g, ""))}" style="color:${TINTE};text-decoration:none;border-bottom:1px solid ${LINIE};">${escape(k.telefon)}</a>` : "", true)}
        ${zeile("E-Mail", k.email ? `<a href="mailto:${escape(k.email)}" style="color:${TINTE};text-decoration:none;border-bottom:1px solid ${LINIE};">${escape(k.email)}</a>` : "")}
        ${zeile("Website", daten?.domain ? `<a href="https://${escape(daten.domain)}" style="color:${TINTE};text-decoration:none;border-bottom:1px solid ${LINIE};">${escape(daten.domain)}</a>` : "")}
      </table>`
  );

  const lage = karte(
    etikett("Was er gesagt hat") +
      `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${zeile("Gesucht", escape(daten?.beruf))}
        ${zeile("Dringlichkeit", escape(DRINGLICH[daten?.dringlichkeit] || ""))}
        ${zeile("Offene Stellen", escape(STELLEN[daten?.stellen] || ""))}
        ${zeile("Anzeigen bisher", escape(ERFAHRUNG[daten?.erfahrung] || ""))}
        ${zeile("Stärken der Stelle", escape((daten?.staerken || []).map((s) => STAERKEN[s] || s).join(", ")))}
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
