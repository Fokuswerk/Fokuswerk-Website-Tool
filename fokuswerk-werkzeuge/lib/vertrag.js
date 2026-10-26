// Prüft die Modellantwort gegen die Form, die die Website erwartet. Alles, was durchkommt,
// steht gleich im Browser eines fremden Betriebs — darum lieber ein Fehler als eine
// halbfertige Anzeige.

const FLOSKELN = [
  "werde teil unseres teams",
  "wir suchen verstärkung",
  "zur verstärkung unseres teams",
  "du bist motiviert",
  "spannende herausforderung",
];

const ohneRufzeichen = (text) => text.replace(/\s*!+/g, ".").replace(/\.\.+/g, ".");

export function pruefeAntwort(roh) {
  if (!roh || typeof roh !== "object") return { fehler: "modell_unlesbar" };
  if (roh.fehler === "beruf_unklar") return { fehler: "beruf_unklar" };

  const anzeigen = Array.isArray(roh.anzeigen) ? roh.anzeigen : [];
  const fragen = Array.isArray(roh.fragen) ? roh.fragen : [];
  if (anzeigen.length !== 3 || fragen.length !== 4) return { fehler: "modell_unvollstaendig" };

  const geprueft = [];
  for (const anzeige of anzeigen) {
    const titel = typeof anzeige?.titel === "string" ? anzeige.titel.trim() : "";
    const text = typeof anzeige?.text === "string" ? anzeige.text.trim() : "";
    if (titel.length < 8 || titel.length > 80) return { fehler: "modell_unvollstaendig" };
    if (text.length < 80 || text.length > 900) return { fehler: "modell_unvollstaendig" };
    geprueft.push({
      titel: ohneRufzeichen(titel).replace(/\.$/, ""),
      text: ohneRufzeichen(text),
    });
  }

  const alles = geprueft.map((a) => `${a.titel} ${a.text}`).join(" ").toLowerCase();
  if (FLOSKELN.some((f) => alles.includes(f))) return { fehler: "modell_floskeln" };

  const geprueftefragen = fragen.map((f) => String(f).trim()).filter(Boolean);
  if (geprueftefragen.length !== 4) return { fehler: "modell_unvollstaendig" };

  const betrieb = typeof roh.betrieb === "string" ? roh.betrieb.trim().slice(0, 80) : "";
  return { betrieb, anzeigen: geprueft, fragen: geprueftefragen };
}

export function pruefeEingabe(koerper) {
  const domain = typeof koerper?.domain === "string" ? koerper.domain.trim() : "";
  const beruf = typeof koerper?.beruf === "string" ? koerper.beruf.trim() : "";

  if (!domain || domain.length > 120) return { fehler: "domain_fehlt" };
  if (beruf.length < 3 || beruf.length > 60) return { fehler: "beruf_fehlt" };
  // Keine Steuerzeichen, keine Zeilenumbrüche — das Feld ist ein Berufsname, kein Freitext.
  if (/[\u0000-\u001f<>]/.test(beruf)) return { fehler: "beruf_fehlt" };

  return { domain, beruf };
}
