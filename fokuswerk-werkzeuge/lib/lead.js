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

// Verifiziert bei Resend ist email.fokuswerk.de (geprüft 26.10.2026) — nicht mail.fokuswerk.de.
const ABSENDER = "Fokuswerk <werkzeug@email.fokuswerk.de>";
const AN_UNS = "contact@fokuswerk.de";

// Der Wortlaut, den der Besucher im letzten Schritt abhakt. Steht in `Stellenanzeiger.tsx`;
// ändert er sich dort, gehört er auch hier geändert — am Datensatz soll stehen, wem der
// Mensch tatsächlich zugestimmt hat.
const EINWILLIGUNG =
  "Fokuswerk darf mir die Anzeigen zuschicken und mich zu dieser Anfrage per E-Mail oder " +
  "Telefon kontaktieren. Die Angaben werden nicht weitergegeben, die Einwilligung kann ich " +
  "jederzeit widerrufen.";

// ---------------------------------------------------------------------------
// 1. Sales-Funnel im Outreach-Werkzeug
// ---------------------------------------------------------------------------

export async function meldeAnFunnel(daten) {
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
      // Keine Newsletter-Freigabe: Der Besucher stimmt der Antwort auf SEINE Anfrage zu,
      // nicht laufender Werbung. Das sind zwei verschiedene Einwilligungen.
      newsletter: false,
      einwilligungstext: EINWILLIGUNG,
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
    }),
  });
  const inhalt = await antwort.json().catch(() => ({}));
  if (!antwort.ok) throw new Error("Funnel " + antwort.status + ": " + (inhalt.fehler || ""));
  return inhalt.schon_da ? { schon_da: true } : { angelegt: true };
}

// ---------------------------------------------------------------------------
// 2. + 3. E-Mail
// ---------------------------------------------------------------------------

async function sendeMail({ an, betreff, text, html, antwortAn }) {
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

export async function schickeAnBetrieb(daten, ergebnis) {
  const an = daten?.kontakt?.email;
  if (!an) return { uebersprungen: "keine Adresse" };
  const { html, text } = anzeigenMail(daten, ergebnis);
  return sendeMail({
    an,
    betreff: "Ihre Stellenanzeigen für " + (daten.beruf || "die offene Stelle"),
    html,
    text,
    antwortAn: AN_UNS,
  });
}

// ---------------------------------------------------------------------------
// Alles zusammen, ohne dass einer den anderen mitreißt
// ---------------------------------------------------------------------------

// Muss **vor** der Antwort abgewartet werden. Der erste Entwurf startete die Arbeit nebenher
// und gab sofort zurück — auf einem dauerhaft laufenden Server richtig, bei Vercel falsch: Die
// Funktion wird nach `res.json()` eingefroren, und nichts davon lief je zu Ende (26.10.2026,
// zwei Durchläufe ohne eine einzige Mail bei Resend).
// Damit ein hängender Dienst die Anzeigen nicht aufhält, bricht `mitFrist` nach 8 Sekunden ab.
function mitFrist(versprechen, ms, was) {
  return Promise.race([
    versprechen,
    new Promise((_, ab) => setTimeout(() => ab(new Error(was + ": Frist von " + ms + " ms überschritten")), ms)),
  ]);
}

export function verarbeiteLead(daten, ergebnis) {
  return (async () => {
    const bericht = {};
    let lagerstand;
    try {
      lagerstand = await mitFrist(meldeAnFunnel(daten), 8000, "Funnel");
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
      bericht.zusendung = await mitFrist(schickeAnBetrieb(daten, ergebnis), 8000, "Zusendung");
    } catch (f) {
      bericht.zusendung = { fehler: f?.message };
      console.error("Zusendung an den Betrieb gescheitert:", f?.message);
    }
    return bericht;
  })();
}
