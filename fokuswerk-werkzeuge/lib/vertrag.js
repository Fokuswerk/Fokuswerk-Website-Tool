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

// ── Das Ergebnis, wie die Seite es erwartet ──────────────────────────────────
//
// Das Modell liefert nur die Texte. Kanalnamen, Etiketten und Zeichengrenzen setzen wir
// hier — sonst erfindet das Modell bei jedem Lauf andere Beschriftungen, und die Grenzen
// sind ohnehin Tatsachen der Plattformen, keine Ermessenssache.
//
//   kanaele: [{ id, name, wofuer, stuecke: [{ titel, felder: [{ etikett, wert, grenze,
//                                                               grenzeArt }] }] }]
//
// grenzeArt "max"     — harte Grenze der Plattform, darüber wird abgeschnitten oder
//                       die Eingabe abgelehnt.
// grenzeArt "schnitt" — dort blendet die Plattform „… mehr" ein; längerer Text geht
//                       nicht verloren, wird aber zunaechst nicht gelesen.

const zahl = (w) => (typeof w === "string" ? w.trim() : "");
const liste = (w, min, max) => {
  if (!Array.isArray(w)) return null;
  const e = w.map((x) => zahl(x)).filter(Boolean);
  return e.length >= min && e.length <= max ? e : null;
};

function feld(etikett, wert, grenze, grenzeArt) {
  const f = { etikett, wert };
  if (grenze) { f.grenze = grenze; f.grenzeArt = grenzeArt; }
  return f;
}

export function pruefeAntwort(roh) {
  if (!roh || typeof roh !== "object") return { fehler: "modell_unlesbar" };
  if (roh.fehler === "beruf_unklar") return { fehler: "beruf_unklar" };

  const fehlt = { fehler: "modell_unvollstaendig" };

  // ── Kleinanzeigen ──────────────────────────────────────────────────────────
  const ka = roh.kleinanzeigen || {};
  const kaTitel = ohneRufzeichen(zahl(ka.titel)).replace(/\.$/, "");
  const kaText = ohneRufzeichen(zahl(ka.text));
  // Die 65 Zeichen sind die harte Grenze der Plattform. Ein Titel knapp darueber wird
  // trotzdem ausgeliefert und auf der Seite ausgezeichnet — besser, der Betrieb kuerzt
  // ein Wort, als dass der ganze Lauf an zwei Zeichen scheitert.
  if (kaTitel.length < 8 || kaTitel.length > 90) return fehlt;
  if (kaText.length < 300 || kaText.length > 2500) return fehlt;

  // ── Facebook und Instagram ─────────────────────────────────────────────────
  const metaRoh = Array.isArray(roh.meta) ? roh.meta : [];
  if (metaRoh.length !== 3) return fehlt;
  const metaStuecke = [];
  for (const v of metaRoh) {
    const primaer = ohneRufzeichen(zahl(v?.primaertext));
    const ueber = ohneRufzeichen(zahl(v?.ueberschrift)).replace(/\.$/, "");
    const besch = ohneRufzeichen(zahl(v?.beschreibung)).replace(/\.$/, "");
    if (primaer.length < 80 || primaer.length > 900) return fehlt;
    if (ueber.length < 4 || ueber.length > 70) return fehlt;
    if (besch.length < 2 || besch.length > 70) return fehlt;
    metaStuecke.push({
      titel: zahl(v?.winkel) || null,
      felder: [
        // Beim Primärtext ist 125 kein Höchstwert, sondern die Stelle, an der Facebook
        // „… mehr" einblendet: Längeres geht nicht verloren, es wird nur zunächst nicht
        // gelesen. Überschrift und Beschreibung schneidet die Plattform dagegen hart ab.
        feld("Primärtext", primaer, 125, "schnitt"),
        feld("Überschrift", ueber, 40, "max"),
        feld("Beschreibung", besch, 30, "max"),
      ],
    });
  }

  // ── Karriereseite ──────────────────────────────────────────────────────────
  const ks = roh.karriereseite || {};
  const ksUeber = ohneRufzeichen(zahl(ks.ueberschrift)).replace(/\.$/, "");
  const ksEin = ohneRufzeichen(zahl(ks.einleitung));
  const aufgaben = liste(ks.aufgaben, 3, 8);
  const anforderungen = liste(ks.anforderungen, 2, 8);
  const wirBieten = liste(ks.wirBieten, 2, 8);
  const ksBew = ohneRufzeichen(zahl(ks.bewerbung));
  if (ksUeber.length < 4 || ksUeber.length > 100) return fehlt;
  if (ksEin.length < 40 || ksEin.length > 700) return fehlt;
  if (!aufgaben || !anforderungen || !wirBieten) return fehlt;
  if (ksBew.length < 20 || ksBew.length > 500) return fehlt;

  // ── Jobbörse der Bundesagentur ─────────────────────────────────────────────
  //
  // ▲ Dieser Kanal darf den Lauf NICHT scheitern lassen. Die anderen drei sind das
  // Versprechen der Seite; fehlt einer, war der Lauf wertlos. Dieser ist eine Zugabe, und
  // ein Besucher, der nach siebzig Sekunden einen Fehler liest, ist teurer als einer, der
  // drei von vier Kanälen bekommt. Liefert das Modell nichts Brauchbares, fällt der Kanal
  // still weg — das Protokoll sagt es, damit es auffällt, wenn es die Regel wird.
  const jb = roh.jobboerse || {};
  const jbBeruf = ohneRufzeichen(zahl(jb.berufsbezeichnung)).replace(/\.$/, "");
  const jbText = ohneRufzeichen(zahl(jb.stellenbeschreibung));
  const jbTaugt = jbBeruf.length >= 4 && jbBeruf.length <= 90 && jbText.length >= 400 && jbText.length <= 3000;
  if (!jbTaugt) console.error("Jobbörse übersprungen:", { beruf: jbBeruf.length, text: jbText.length });

  const punkte = (e) => e.map((x) => ohneRufzeichen(x)).join("\n");

  // ── Floskelprüfung über alles ──────────────────────────────────────────────
  const alles = [
    kaTitel, kaText, ksUeber, ksEin, ksBew, jbBeruf, jbText,
    ...metaStuecke.flatMap((st) => st.felder.map((f) => f.wert)),
    ...aufgaben, ...anforderungen, ...wirBieten,
  ].join(" ").toLowerCase();
  if (FLOSKELN.some((f) => alles.includes(f))) return { fehler: "modell_floskeln" };

  // ── Video-Drehbuch ─────────────────────────────────────────────────────────
  const db = roh.drehbuch || {};
  const dbHinweis = ohneRufzeichen(zahl(db.hinweis));
  const dbAnsage = ohneRufzeichen(zahl(db.ansage));
  const einstellungen = (Array.isArray(db.einstellungen) ? db.einstellungen : [])
    .map((e) => ({
      was: ohneRufzeichen(zahl(e?.was)),
      dauer: zahl(e?.dauer),
      hinweis: ohneRufzeichen(zahl(e?.hinweis)),
    }))
    .filter((e) => e.was);
  if (einstellungen.length < 3 || einstellungen.length > 5) return fehlt;
  if (dbHinweis.length < 10 || dbAnsage.length < 10 || dbAnsage.length > 300) return fehlt;

  // ── Die ersten Antworten ───────────────────────────────────────────────────
  const antworten = (Array.isArray(roh.antworten) ? roh.antworten : [])
    .map((a) => ({ anlass: zahl(a?.anlass), text: ohneRufzeichen(zahl(a?.text)) }))
    .filter((a) => a.anlass && a.text.length >= 20 && a.text.length <= 700);
  if (antworten.length !== 3) return fehlt;

  const fragen = (Array.isArray(roh.fragen) ? roh.fragen : []).map((f) => zahl(f)).filter(Boolean);
  if (fragen.length !== 4) return fehlt;

  const kanaele = [
    {
      id: "kleinanzeigen",
      name: "Kleinanzeigen",
      wofuer:
        "Kostenlos inserieren auf kleinanzeigen.de. Dort suchen Leute, die gerade wirklich " +
        "etwas Neues wollen — sachlich und vollständig geschrieben, nicht als Werbung.",
      stuecke: [{ titel: null, felder: [feld("Titel", kaTitel, 65, "max"), feld("Anzeigentext", kaText)] }],
    },
    // Hinter Kleinanzeigen, weil beides kostenlose Inserate sind: Die zwei macht der
    // Inhaber am selben Abend, bevor überhaupt Geld im Spiel ist.
    ...(jbTaugt
      ? [{
          id: "jobboerse",
          name: "Jobbörse der Arbeitsagentur",
          wofuer:
            "Kostenlos, die größte Stellenbörse Deutschlands, und von dort läuft die Anzeige " +
            "automatisch weiter nach EURES. Hier liest nicht nur, wer selbst sucht: " +
            "Arbeitsvermittler suchen passende Leute heraus und rufen sie an. Einstellen im " +
            "Arbeitgeberportal unter arbeitsagentur.de, ohne Schnittstelle und ohne Vertrag.",
          stuecke: [{
            titel: null,
            felder: [feld("Berufsbezeichnung", jbBeruf, 60, "max"), feld("Stellenbeschreibung", jbText)],
          }],
        }]
      : []),
    {
      id: "meta",
      name: "Facebook und Instagram",
      wofuer:
        "Bezahlte Anzeige. Hier scrollt jemand, der gar nicht sucht — deshalb drei Fassungen " +
        "mit verschiedenen Aufhängern, die man gegeneinander laufen lässt.",
      stuecke: metaStuecke,
    },
    {
      id: "karriereseite",
      name: "Ihre eigene Seite",
      wofuer:
        "Die vollständige Fassung für Ihre Website. Sie bleibt stehen, wird bei Google " +
        "gefunden, und auf sie können alle anderen Kanäle verweisen.",
      stuecke: [
        {
          titel: null,
          felder: [
            feld("Überschrift", ksUeber),
            feld("Einleitung", ksEin),
            feld("Das machst du", punkte(aufgaben)),
            feld("Das bringst du mit", punkte(anforderungen)),
            feld("Das bieten wir", punkte(wirBieten)),
            feld("So bewirbst du dich", ksBew),
          ],
        },
      ],
    },
  ];

  const betrieb = zahl(roh.betrieb).slice(0, 80);
  const ort = zahl(roh.ort).slice(0, 60) || null;
  const bg = zahl(roh.berufsgruppe);
  const berufsgruppe = /^\d{3}$/.test(bg) ? bg : null;
  return { betrieb, ort, berufsgruppe, kanaele, fragen, drehbuch: { hinweis: dbHinweis, ansage: dbAnsage, einstellungen }, antworten };
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
