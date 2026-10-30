// Was nach den Anzeigen passiert: Der Betrieb, der das Werkzeug ausgefüllt hat, ist ein Lead.
//
// Drei Wege, keiner darf einen anderen mitreißen. Wer seine Anzeigen bekommen hat, soll sie
// behalten, auch wenn die Übergabe klemmt.
//
//   1. Eintrag im Sales-Funnel des Outreach-Werkzeugs (Tabelle `funnel_leads`)
//   2. Meldung an uns per E-Mail, damit jemand zeitnah anrufen kann
//   3. Zusendung der Anzeigen an den Betrieb — das steht so auf der Seite, also muss es passieren
//
// Umgebungsvariablen:
//   MAIL_API_KEY        Resend, für Weg 2 und 3
//   FUNNEL_ZIEL         Adresse des Funnel-Endpunkts im Outreach-Werkzeug
//   FUNNEL_SCHLUESSEL   derselbe Wert wie dort, sonst antwortet er mit 401
// Fehlt eine, wird der betreffende Weg still übersprungen — sichtbar im Protokoll.

import { anzeigenMail, leadMail } from "./mail-vorlagen.js";
import { ausschreibungPdf } from "./stellen-pdf.js";

// Verifiziert bei Resend ist email.fokuswerk.de (geprüft 26.10.2026) — nicht mail.fokuswerk.de.
export const ABSENDER = "Fokuswerk <werkzeug@email.fokuswerk.de>";
// ⚠ Solange die Werkzeuge im Aufbau sind, gehen alle Meldungen an die persönliche
// Adresse statt ins gemeinsame Postfach — Probeläufe sollen dort niemanden stören.
// VOR DEM LIVEGANG zurück auf contact@fokuswerk.de stellen (oder MAIL_AN_UNS setzen).
export const AN_UNS = process.env.MAIL_AN_UNS || "bodenstab@fokuswerk.de";

// Der Wortlaut, den der Besucher im letzten Schritt abhakt. Steht in `Stellenanzeiger.tsx`;
// ändert er sich dort, gehört er auch hier geändert — am Datensatz soll stehen, wem der
// Mensch tatsächlich zugestimmt hat.
const EINWILLIGUNG =
  "Fokuswerk darf mir die Anzeigen schicken und sich zu dieser Anfrage melden. Jederzeit " +
  "widerrufbar, die Angaben gehen an niemanden sonst.";

// Das zweite, freiwillige Häkchen. Getrennt gespeichert, weil es getrennt gegeben wurde:
// Nur dieser Wortlaut trägt eine Werbeeinwilligung nach § 7 UWG.
const NEWSLETTER_EINWILLIGUNG =
  "Schickt mir außerdem, was bei anderen Betrieben funktioniert hat — ein paar Mal im Jahr, " +
  "jederzeit abbestellbar.";

// ---------------------------------------------------------------------------
// 1. Sales-Funnel im Outreach-Werkzeug
// ---------------------------------------------------------------------------

export async function meldeAnFunnel(daten, pdf = null, ergebnis = null) {
  const ziel = process.env.FUNNEL_ZIEL || "https://fokuswerk-outreach.vercel.app/api/funnel";
  const schluessel = process.env.FUNNEL_SCHLUESSEL;
  if (!schluessel) return { uebersprungen: "kein FUNNEL_SCHLUESSEL" };

  const k = daten?.kontakt || {};
  if (!k.email) return { uebersprungen: "keine Adresse" };
  const domain = String(daten?.domain || "").toLowerCase()
    .replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  const antwort = await fetch(ziel, {
    method: "POST",
    headers: { "content-type": "application/json", "x-funnel-schluessel": schluessel },
    body: JSON.stringify({
      name: k.name || null,
      email: k.email,
      telefon: k.telefon || null,
      firma: daten?.betrieb || domain || null,
      freebie: "Stellenanzeigen-Generator",
      // Zwei Einwilligungen, zwei Häkchen: Die erste gilt der Antwort auf SEINE Anfrage,
      // die zweite laufender Werbung. Nur die zweite macht ihn zu einem Newsletter-Empfänger.
      newsletter: daten?.newsletter === true,
      einwilligungstext: daten?.newsletter === true
        ? EINWILLIGUNG + " | Newsletter: " + NEWSLETTER_EINWILLIGUNG
        : EINWILLIGUNG,
      // Woher der Besucher kam. Schickt die Seite nichts mit, steht "funnel" —
      // besser als leer, und sobald die Komponente UTM-Werte durchreicht,
      // stehen hier meta/google und die Kampagne.
      quelle: daten?.herkunft?.quelle || "funnel",
      kampagne: daten?.herkunft?.kampagne || null,
      anzeige: daten?.herkunft?.anzeige || null,
      seite: "/stellenanzeige",
      // Die Antworten aus dem Trichter. Sie sind der eigentliche Wert dieses Leads:
      // Wer hier steht, hat gesagt, wen er sucht und wie dringend.
      antworten: {
        domain: domain || null,
        beruf: daten?.beruf || null,
        dringlichkeit: daten?.dringlichkeit || null,
        stellen: daten?.stellen || null,
        erfahrung: daten?.erfahrung || null,
        staerken: Array.isArray(daten?.staerken) ? daten.staerken : [],
      },
      // Dieselbe Mappe, die der Betrieb bekommt — damit im Gespräch beide dieselben Texte
      // vor sich haben. Klemmt die Ablage drüben, kommt der Lead trotzdem an.
      pdf: pdf ? pdf.toString("base64") : null,
      pdf_name: pdf ? dateiname(ergebnis, daten?.beruf) : null,
    }),
  });
  const inhalt = await antwort.json().catch(() => ({}));
  if (!antwort.ok) throw new Error("Funnel " + antwort.status + ": " + (inhalt.fehler || ""));
  return inhalt.schon_da ? { schon_da: true } : { angelegt: true };
}

// ---------------------------------------------------------------------------
// 2. + 3. E-Mail
// ---------------------------------------------------------------------------

export async function sendeMail({ an, betreff, text, html, antwortAn, anhaenge }) {
  const schluessel = process.env.MAIL_API_KEY;
  if (!schluessel) return { uebersprungen: "kein MAIL_API_KEY" };
  const antwort = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: "Bearer " + schluessel, "content-type": "application/json" },
    body: JSON.stringify({
      from: ABSENDER,
      to: [an],
      subject: betreff,
      // Beides mitschicken: Wer HTML blockt — und das sind in Betrieben mehr, als man denkt —
      // bekommt die Textfassung und nicht eine leere Mail.
      ...(html ? { html } : {}),
      text,
      ...(antwortAn ? { reply_to: antwortAn } : {}),
      // Anhänge als Base64. Resend nimmt bis 40 MB je Mail; unsere PDFs liegen bei 45 KB.
      ...(anhaenge && anhaenge.length
        ? {
            attachments: anhaenge.map((a) => ({
              filename: a.name,
              content: Buffer.isBuffer(a.inhalt) ? a.inhalt.toString("base64") : a.inhalt,
            })),
          }
        : {}),
    }),
  });
  if (!antwort.ok) {
    const t = await antwort.text().catch(() => "");
    throw new Error("Resend " + antwort.status + ": " + t.slice(0, 200));
  }
  return { gesendet: true };
}

export async function meldeAnUns(daten, lagerstand) {
  const { html, text } = leadMail(daten, lagerstand);
  return sendeMail({
    an: AN_UNS,
    betreff: (daten.betrieb || daten.domain) + " sucht " + (daten.beruf || "jemanden"),
    html,
    text,
    antwortAn: daten.kontakt?.email || undefined,
  });
}

function dateiname(ergebnis, beruf) {
  const roh = String(ergebnis?.betrieb || "Betrieb")
    .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
    .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  return "Stellenausschreibung-" + (roh || "Betrieb") + ".pdf";
}

// Das PDF kommt von außen herein, seit es auch an den Funnel geht: Die Funnel-Meldung läuft
// vor dieser Funktion, und zweimal rechnen hieße zweimal dieselbe Mappe setzen.
export async function schickeAnBetrieb(daten, ergebnis, pdf = null) {
  const an = daten?.kontakt?.email;
  if (!an) return { uebersprungen: "keine Adresse" };

  const { html, text } = anzeigenMail(daten, ergebnis);
  const bericht = await sendeMail({
    an,
    betreff:
      "Ihre Stellenausschreibung für " +
      (daten.beruf || "die offene Stelle") +
      " — drei Kanäle und die Anleitung",
    html,
    text,
    antwortAn: AN_UNS,
    anhaenge: pdf ? [{ name: dateiname(ergebnis, daten.beruf), inhalt: pdf }] : undefined,
  });
  return { ...bericht, pdf: pdf ? Math.round(pdf.length / 1024) + " KB" : "keins" };
}

// ---------------------------------------------------------------------------
// Alles zusammen, ohne dass einer den anderen mitreißt
// ---------------------------------------------------------------------------

// Muss **vor** der Antwort abgewartet werden. Der erste Entwurf startete die Arbeit nebenher
// und gab sofort zurück — auf einem dauerhaft laufenden Server richtig, bei Vercel falsch: Die
// Funktion wird nach `res.json()` eingefroren, und nichts davon lief je zu Ende (26.10.2026,
// zwei Durchläufe ohne eine einzige Mail bei Resend).
// Damit ein hängender Dienst die Anzeigen nicht aufhält, bricht `mitFrist` nach 8 Sekunden ab.
export function mitFrist(versprechen, ms, was) {
  return Promise.race([
    versprechen,
    new Promise((_, ab) => setTimeout(() => ab(new Error(was + ": Frist von " + ms + " ms überschritten")), ms)),
  ]);
}

export function verarbeiteLead(daten, ergebnis) {
  return (async () => {
    const bericht = {};

    // Einmal setzen, zweimal benutzen: Der Funnel bekommt die Mappe als base64, der Betrieb
    // als Mailanhang. Das PDF ist die Lieferung, die weitergereicht wird — an die Frau im
    // Büro oder an den, der die Anzeige schaltet. Scheitert es, läuft alles weiter: Die Texte
    // stehen auch in der Mail. Lieber ohne Anhang als gar nicht.
    let pdf = null;
    try {
      pdf = await ausschreibungPdf(daten, ergebnis);
    } catch (f) {
      console.error("PDF gescheitert:", f?.message);
    }

    let lagerstand;
    try {
      lagerstand = await mitFrist(meldeAnFunnel(daten, pdf, ergebnis), 8000, "Funnel");
      console.log("Funnel:", JSON.stringify(lagerstand));
    } catch (f) {
      lagerstand = { fehler: f?.message };
      console.error("Funnel-Übergabe gescheitert:", f?.message);
    }
    bericht.funnel = lagerstand;
    try {
      bericht.meldung = await mitFrist(meldeAnUns(daten, lagerstand), 8000, "Meldung an uns");
    } catch (f) {
      bericht.meldung = { fehler: f?.message };
      console.error("Meldung an uns gescheitert:", f?.message);
    }
    try {
      bericht.zusendung = await mitFrist(schickeAnBetrieb(daten, ergebnis, pdf), 8000, "Zusendung");
    } catch (f) {
      bericht.zusendung = { fehler: f?.message };
      console.error("Zusendung an den Betrieb gescheitert:", f?.message);
    }
    return bericht;
  })();
}
