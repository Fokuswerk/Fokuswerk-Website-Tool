/**
 * Mailversand über Resend.
 *
 * Zwei Dinge sind hier bewusst streng:
 *
 * 1. **Ohne FEATURE_MAILVERSAND=true geht nichts raus.** Der Text wird dann
 *    gerendert und ins Protokoll geschrieben, aber nicht verschickt. So lässt
 *    sich der ganze Weg prüfen, ohne Mailvolumen zu verbrauchen oder fremde
 *    Postfächer zu belasten.
 *
 * 2. **Die Bestätigungsmail enthält keine Werbung.** Sie fragt nur, ob die
 *    Anmeldung gewollt war. Eine Bestätigungsmail mit Werbung darin ist selbst
 *    die unerlaubte Zusendung, die das Double Opt-in verhindern soll
 *    (BGH, 10.02.2011, I ZR 164/09 – Double-opt-in-Verfahren).
 */

const SCHLUESSEL = process.env.RESEND_SCHLUESSEL;
const ABSENDER = process.env.MAIL_ABSENDER;
const SCHARF = process.env.FEATURE_MAILVERSAND === "true";

export type Mail = {
  an: string;
  betreff: string;
  text: string;
};

export function versandBereit(): boolean {
  return Boolean(SCHLUESSEL && ABSENDER);
}

export function versandScharf(): boolean {
  return SCHARF && versandBereit();
}

/**
 * Schickt eine Mail. Gibt zurück, was tatsächlich passiert ist — der Aufrufer
 * soll nicht raten müssen, ob etwas rausging.
 */
export async function senden(mail: Mail): Promise<"verschickt" | "trocken" | "fehler"> {
  if (!versandScharf()) {
    // Absichtlich ohne Adresse im Protokoll: der Betreff genügt zum Nachvollziehen.
    console.log(
      `MAIL TROCKEN (${versandBereit() ? "FEATURE_MAILVERSAND steht nicht auf true" : "kein Schlüssel oder Absender"}): ${mail.betreff}`,
    );
    return "trocken";
  }
  try {
    const antwort = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${SCHLUESSEL}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: ABSENDER,
        to: [mail.an],
        subject: mail.betreff,
        text: mail.text,
      }),
    });
    if (!antwort.ok) {
      console.error("Mail nicht verschickt:", antwort.status, (await antwort.text()).slice(0, 300));
      return "fehler";
    }
    return "verschickt";
  } catch (fehler) {
    console.error("Mailversand gescheitert:", fehler);
    return "fehler";
  }
}

/**
 * Der Text der Bestätigungsmail. Reiner Text, keine Bilder, kein HTML:
 * eine Bestätigungsanfrage soll wie eine Nachricht aussehen und nicht wie ein
 * Newsletter, und sie muss auch in einem Textclient vollständig lesbar sein.
 */
export function bestaetigungsMail(adresse: string, link: string, anlass: string): Mail {
  const worum =
    anlass === "bescheid"
      ? "eine Erinnerung an Ihre Widerspruchsfrist"
      : anlass === "reform"
        ? "eine Nachricht, sobald die endgültigen Beträge feststehen"
        : "eine Erinnerung an den Stichtag am 31. Dezember";

  return {
    an: adresse,
    betreff: "Bitte bestätigen Sie Ihre Anmeldung",
    text: [
      "Guten Tag,",
      "",
      `Sie haben auf pflegegeld-antrag.de ${worum} angefordert.`,
      "",
      "Damit sicher ist, dass die Anmeldung von Ihnen kommt, bestätigen Sie sie bitte",
      "über diesen Link:",
      "",
      link,
      "",
      "Der Link gilt sieben Tage. Solange Sie nicht bestätigen, schicken wir Ihnen nichts",
      "und löschen den Eintrag danach wieder.",
      "",
      "Falls Sie sich nicht angemeldet haben, müssen Sie nichts tun. Ohne Bestätigung",
      "passiert nichts.",
      "",
      "— Pflegegeld-Antrag",
    ].join("\n"),
  };
}
