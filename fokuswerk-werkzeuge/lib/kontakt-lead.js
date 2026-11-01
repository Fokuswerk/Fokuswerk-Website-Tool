// Was aus einer Anfrage über das Kontaktformular wird.
//
// Das Formular auf /kontakt gehört Framer, nicht uns: Es schickt seine Felder an Framers
// eigenen Dienst, der daraus eine Mail mit dem Betreff „New Submission" macht und sie an
// das im Editor eingetragene Postfach legt. Mehr passiert dort nicht — kein Eintrag im
// Sales-Funnel, keine Antwortadresse, unter der man direkt zurückschreiben kann.
//
// Damit war /kontakt der einzige Weg auf der ganzen Seite, auf dem ein Lead NICHT im
// Outreach-Werkzeug ankam, während die drei Freebies jeden einzelnen dort anlegen.
// Gemerkt hat das niemand, weil die Mail ja kam.
//
// Dieser Endpunkt hängt sich daneben, er ersetzt nichts: Ein Schnipsel auf der Seite
// spiegelt dieselbe Absendung hierher. Framers Mail kommt weiter — klemmt also unser
// Weg, ist trotzdem nichts verloren. Das ist der Grund für die Doppelung.
//
// Zwei Wege, keiner darf den anderen mitreißen:
//   1. Eintrag im Sales-Funnel (`freebie: "Kontaktformular"`)
//   2. Meldung an das gemeinsame Postfach — mit `reply_to` auf den Absender, damit
//      „Antworten" beim Betrieb landet und nicht bei Framer.

import { sendeMail, mitFrist, AN_UNS } from "./lead.js";
import { escape, huelle, karte, etikett, angabe, SCHRIFT, TINTE, LEISE, AKZENT } from "./mail-vorlagen.js";

// Der Wortlaut unter dem Formular auf /kontakt. Ändert er sich dort, gehört er auch hier
// geändert — am Datensatz soll stehen, wem der Mensch tatsächlich zugestimmt hat.
const EINWILLIGUNG =
  "Angaben aus dem Kontaktformular auf fokuswerk.de/kontakt, abgeschickt zur Beantwortung " +
  "dieser Anfrage.";

/** Die interne Meldung: dieselbe Hülle wie bei den drei Freebies, damit das Postfach eine Sprache spricht. */
export function kontaktMeldung(d) {
  const betrieb = d.unternehmen || d.name || "Unbekannt";
  const thema = d.thema || "ohne Angabe";

  const kopf = `<tr><td style="padding:0 4px 20px;">
    <h1 style="margin:0 0 6px;font:600 24px/1.3 ${SCHRIFT};color:${TINTE};letter-spacing:-0.02em;">
      ${escape(betrieb)} fragt an
    </h1>
    <p style="margin:0;font:400 14px/1.6 ${SCHRIFT};color:${LEISE};">
      Über das Kontaktformular auf fokuswerk.de · Thema: <strong style="color:${AKZENT};">${escape(thema)}</strong>
    </p>
  </td></tr>`;

  const kontakt = karte(
    etikett("Kontakt") +
      `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${angabe("Ansprechpartner", d.name, { hervor: true })}
        ${angabe("Unternehmen", d.unternehmen)}
        ${angabe("Telefon", d.telefon, { hervor: true, link: d.telefon ? "tel:" + String(d.telefon).replace(/\s/g, "") : "" })}
        ${angabe("E-Mail", d.email, { link: d.email ? "mailto:" + d.email : "" })}
        ${angabe("Website", d.website, { link: d.website ? (/^https?:\/\//.test(d.website) ? d.website : "https://" + d.website) : "" })}
      </table>`
  );

  // Die Nachricht ist das einzige Feld, in dem jemand frei schreibt. Sie steht deshalb in
  // einer eigenen Karte und nicht als weitere Zeile zwischen den Stammdaten.
  const nachricht = d.nachricht
    ? karte(
        etikett("Nachricht") +
          `<p style="margin:0;font:400 15px/1.65 ${SCHRIFT};color:${TINTE};white-space:pre-wrap;">${escape(d.nachricht)}</p>`
      )
    : karte(
        etikett("Nachricht") +
          `<p style="margin:0;font:400 15px/1.65 ${SCHRIFT};color:${LEISE};">Das Feld blieb leer.</p>`
      );

  const text = [
    `${betrieb} fragt an — über das Kontaktformular auf fokuswerk.de`,
    "",
    `Thema:           ${thema}`,
    `Ansprechpartner: ${d.name || "—"}`,
    `Unternehmen:     ${d.unternehmen || "—"}`,
    `Telefon:         ${d.telefon || "—"}`,
    `E-Mail:          ${d.email || "—"}`,
    `Website:         ${d.website || "—"}`,
    "",
    "Nachricht:",
    d.nachricht || "(leer)",
    "",
    `Auf diese Mail zu antworten schreibt direkt an ${d.email || "den Absender"}.`,
  ].join("\n");

  return {
    betreff: `Anfrage: ${betrieb} — ${thema}`,
    html: huelle(kopf + kontakt + nachricht, `${betrieb} · ${thema}`),
    text,
  };
}

/** Weg 1: Eintrag im Sales-Funnel des Outreach-Werkzeugs. */
export async function meldeAnFunnel(d) {
  const ziel = process.env.FUNNEL_ZIEL || "https://fokuswerk-outreach.vercel.app/api/funnel";
  const schluessel = process.env.FUNNEL_SCHLUESSEL;
  if (!schluessel) return { uebersprungen: "kein FUNNEL_SCHLUESSEL" };

  const antwort = await fetch(ziel, {
    method: "POST",
    headers: { "content-type": "application/json", "x-funnel-schluessel": schluessel },
    body: JSON.stringify({
      name: d.name || null,
      email: d.email,
      telefon: d.telefon || null,
      firma: d.unternehmen || d.website || null,
      freebie: "Kontaktformular",
      // Kein Häkchen für laufende Werbung auf diesem Formular. Wer anfragt, hat damit
      // noch keine Werbeeinwilligung nach § 7 UWG gegeben — also steht hier false.
      newsletter: false,
      einwilligungstext: EINWILLIGUNG,
      quelle: d.herkunft?.quelle || "kontaktformular",
      kampagne: d.herkunft?.kampagne || null,
      anzeige: d.herkunft?.anzeige || null,
      seite: "/kontakt",
      // Was im Formular stand. Das Thema ist die eigentliche Vorqualifizierung:
      // „Noch unklar" ist ein anderes Gespräch als „Performance Marketing".
      antworten: {
        thema: d.thema || null,
        website: d.website || null,
        nachricht: d.nachricht || null,
      },
    }),
  });
  const inhalt = await antwort.json().catch(() => ({}));
  if (!antwort.ok) throw new Error("Funnel " + antwort.status + ": " + (inhalt.fehler || ""));
  return inhalt.schon_da ? { schon_da: true } : { angelegt: true };
}

/**
 * Beide Wege nebeneinander, keiner blockiert den anderen.
 *
 * Und beide landen im Protokoll — dieselbe Lehre wie beim Wettbewerb: Ein Weg, dessen
 * Ergebnis nirgends steht, ist ein Weg, dessen Ausfall niemand bemerkt.
 */
export async function verarbeiteKontakt(d) {
  const m = kontaktMeldung(d);

  const [funnel, meldung] = await Promise.allSettled([
    mitFrist(meldeAnFunnel(d), 8000, "Funnel"),
    mitFrist(
      sendeMail({ an: AN_UNS, betreff: m.betreff, text: m.text, html: m.html, antwortAn: d.email || undefined }),
      8000,
      "Meldung",
    ),
  ]);

  const wert = (r) => (r.status === "fulfilled" ? r.value : { fehler: String(r.reason?.message || r.reason) });
  const bericht = { funnel: wert(funnel), meldung: wert(meldung) };
  for (const [weg, w] of Object.entries(bericht)) {
    if (w && w.fehler) console.error(`Kontakt: ${weg} gescheitert:`, w.fehler);
    else console.log(`Kontakt: ${weg}:`, JSON.stringify(w));
  }
  return bericht;
}
