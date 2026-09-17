"use server";

import { verein } from "@/content/verein";

export type FormularZustand = {
  status: "leer" | "erfolg" | "fehler";
  meldung?: string;
  felder?: Partial<
    Record<"name" | "email" | "nachricht" | "einwilligung", string>
  >;
};

const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Nimmt das Kontaktformular entgegen und schickt die Nachricht per E-Mail.
 *
 * Damit das Formular arbeitet, müssen zwei Umgebungsvariablen gesetzt sein:
 *   RESEND_API_KEY      – API-Schlüssel des Versanddienstes resend.com
 *   KONTAKT_ABSENDER    – verifizierte Absenderadresse, z. B. website@ihre-domain.de
 * Optional:
 *   KONTAKT_EMPFAENGER  – Zieladresse (Standard: die Vereinsadresse)
 *
 * Es werden keine Daten gespeichert – die Nachricht wird nur weitergeleitet.
 */
export async function nachrichtSenden(
  _zustand: FormularZustand,
  formular: FormData,
): Promise<FormularZustand> {
  // Unsichtbares Feld gegen automatisierte Einträge
  if (String(formular.get("website") ?? "").trim() !== "") {
    return { status: "erfolg" };
  }

  const name = String(formular.get("name") ?? "").trim();
  const email = String(formular.get("email") ?? "").trim();
  const nachricht = String(formular.get("nachricht") ?? "").trim();
  const einwilligung = formular.get("einwilligung") === "on";

  const felder: FormularZustand["felder"] = {};
  if (name.length < 2) felder.name = "Bitte geben Sie Ihren Namen an.";
  if (!EMAIL_MUSTER.test(email))
    felder.email = "Bitte prüfen Sie Ihre E-Mail-Adresse.";
  if (nachricht.length < 10)
    felder.nachricht = "Bitte schreiben Sie uns ein paar Worte mehr.";
  if (!einwilligung)
    felder.einwilligung =
      "Ohne Ihre Einwilligung dürfen wir die Nachricht nicht verarbeiten.";

  if (Object.keys(felder).length > 0) {
    return {
      status: "fehler",
      meldung: "Bitte prüfen Sie die markierten Felder.",
      felder,
    };
  }

  const apiSchluessel = process.env.RESEND_API_KEY;
  const absender = process.env.KONTAKT_ABSENDER;
  const empfaenger = process.env.KONTAKT_EMPFAENGER ?? verein.email;

  if (!apiSchluessel || !absender) {
    return {
      status: "fehler",
      meldung: `Das Formular ist gerade nicht erreichbar. Schreiben Sie uns bitte direkt an ${verein.email}.`,
    };
  }

  try {
    const antwort = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiSchluessel}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: absender,
        to: [empfaenger],
        reply_to: email,
        subject: `Nachricht über die Website von ${name}`,
        text: `Name: ${name}\nE-Mail: ${email}\n\n${nachricht}`,
      }),
    });

    if (!antwort.ok)
      throw new Error(`Versand fehlgeschlagen (${antwort.status})`);
  } catch {
    return {
      status: "fehler",
      meldung: `Die Nachricht konnte nicht versendet werden. Bitte schreiben Sie uns direkt an ${verein.email}.`,
    };
  }

  return {
    status: "erfolg",
    meldung:
      "Vielen Dank! Ihre Nachricht ist bei uns angekommen – wir melden uns.",
  };
}
