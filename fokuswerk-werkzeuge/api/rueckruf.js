// Der Terminschritt des Stellenanzeigen-Trichters.
//
// Er läuft erst, nachdem jemand das Ergebnis gesehen hat — Name, Nummer und Betrieb liegen
// also längst vor. Es fehlt nur noch das Wann. Deshalb nimmt dieser Endpunkt kein Formular
// entgegen, sondern eine Bestätigung: ein Zeitfenster zu einem Lead, den es schon gibt.
//
// Warum ein eigener Endpunkt und kein Feld am großen: Der große schreibt Anzeigen und
// braucht dafür eine halbe Minute. Ein Rückrufwunsch darf nicht dahinter warten.

import { sendeMail } from "../lib/lead.js";

const ERLAUBT = (process.env.ORIGINS ||
  "https://fokuswerk.de,https://www.fokuswerk.de,https://frank-site-485713.framer.app")
  .split(",").map((h) => h.trim()).filter(Boolean);

const AN_UNS = "contact@fokuswerk.de";

// Derselbe Schlüssel wie in api/rangliste.js. Damit lässt sich prüfen, ob ein Zeitfenster
// angenommen wird, OHNE eine Mail auszulösen.
//
// ▲ Warum das hier sein muss: Dieser Endpunkt war einen Tag lang kaputt — die Komponente
// schickte andere Schlüssel, als er kannte, und jeder Rückrufwunsch endete mit 422. Von
// außen war das nicht nachweisbar, denn ein unvollständiger Aufruf antwortet genauso wie
// ein unbekanntes Zeitfenster, und ein vollständiger hätte eine Mail verschickt. Genau
// diese Blindstelle hat den Fehler so lange verdeckt.
const DIAGNOSE = "fw-probe-2610";
const trockenlauf = (req) => req.query?.trocken === "1" && req.query?.diagnose === DIAGNOSE;

// ▲ Diese Schlüssel sind ein Vertrag mit `Stellenanzeiger.tsx`, nicht freie Wortwahl.
// Die Komponente schickt `gleich`, `mittag`, `feierabend`, `frueh`; hier standen vier
// andere Wörter. Folge: `FENSTER[k.fenster]` war immer undefiniert, jeder Rückrufwunsch
// endete mit 422 und der Besucher las „Das hat nicht geklappt. Rufen Sie durch." — und
// zwar genau nach dem Tippen auf „Gleich, ich bin am Handy". Der wärmste Moment des
// Trichters war seit dem Bau tot. Wer hier Wörter ändert, ändert sie in beiden Dateien.
//
// Die vier alten Schlüssel bleiben als Zweitnamen stehen, damit eine noch im Browser
// liegende ältere Fassung der Komponente nicht ins Leere läuft.
const FENSTER = {
  gleich: "jetzt gleich",
  mittag: "in der Mittagspause",
  feierabend: "nach Feierabend, ab 17 Uhr",
  frueh: "morgen früh, vor 7:30 Uhr",
  heute: "heute noch",
  morgen_vormittag: "morgen vormittags",
  morgen_nachmittag: "morgen nachmittags",
  woche: "diese Woche, egal wann",
};

// Wer „gleich" tippt, hat das Handy in der Hand. Das muss im Postfach auffallen.
const SOFORT = new Set(["gleich", "heute"]);

const text = (w, max) => {
  const v = typeof w === "string" ? w.trim() : "";
  return v && v.length <= max && !/[\u0000-\u001f]/.test(v) ? v : null;
};

export default async function handler(req, res) {
  const herkunft = req.headers.origin;
  if (herkunft && ERLAUBT.includes(herkunft)) {
    res.setHeader("Access-Control-Allow-Origin", herkunft);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ fehler: "nur_post" });

  let k = req.body;
  if (typeof k === "string") {
    try { k = JSON.parse(k); } catch { k = null; }
  }

  const fenster = FENSTER[k?.fenster];
  const telefon = text(k?.telefon, 40);
  const email = text(k?.email, 120);
  if (!fenster || (!telefon && !email)) {
    return res.status(422).json({ fehler: "unvollstaendig" });
  }

  const betrieb = text(k?.betrieb, 120) || text(k?.domain, 120) || "unbekannt";
  const name = text(k?.name, 80) || "—";
  const beruf = text(k?.beruf, 80) || "—";
  const quelle = text(k?.herkunft?.quelle, 40);
  const kampagne = text(k?.herkunft?.kampagne, 80);

  const zeilen = [
    `${betrieb} möchte zurückgerufen werden — ${fenster}.`,
    "",
    `Ansprechpartner: ${name}`,
    `Telefon:         ${telefon || "—"}`,
    `E-Mail:          ${email || "—"}`,
    `Sucht:           ${beruf}`,
    `Website:         ${text(k?.domain, 120) || "—"}`,
    quelle ? `Herkunft:        ${quelle}${kampagne ? " · " + kampagne : ""}` : null,
    "",
    "Die Anzeigen hat der Betrieb bereits bekommen. Gesprächsthema ist die Ausspielung.",
  ].filter((z) => z !== null);

  if (trockenlauf(req)) {
    return res.status(200).json({ ok: true, gemeldet: false, trockenlauf: fenster });
  }

  try {
    await sendeMail({
      an: AN_UNS,
      betreff: `${SOFORT.has(k?.fenster) ? "SOFORT " : ""}Rückruf ${fenster}: ${betrieb}`,
      text: zeilen.join("\n"),
      antwortAn: email || undefined,
    });
  } catch (fehler) {
    console.error("Rückrufmeldung gescheitert:", fehler?.message);
    // Der Wunsch ist trotzdem echt. Lieber im Protokoll als gar nicht.
    console.log("Rückruf (ungesendet):", JSON.stringify({ betrieb, telefon, fenster }));
    return res.status(200).json({ ok: true, gemeldet: false });
  }

  return res.status(200).json({ ok: true, gemeldet: true });
}
