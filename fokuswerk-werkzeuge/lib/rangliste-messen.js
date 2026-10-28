// Die Messung für die Ortsrangliste.
//
// Zwei Abrufe, beide über Apify, beide mit demselben Token:
//
//   1. Google-Unternehmensprofile aller Betriebe eines Gewerks an einem Ort.
//      Liefert Bewertungszahl, Schnitt, Fotozahl, Website-Eintrag, Kategorie — und
//      `claimThisBusiness`, also ob der Inhaber sein Profil je übernommen hat.
//   2. Die Meta-Werbebibliothek, eine Suche je Betriebsname.
//
// Warum nicht direkt: Die Werbebibliothek beantwortet einen Abruf vom Server mit 403
// (geprüft am 28.10.2026). Im Browser läuft sie ohne Login, auf einem Server nicht.
// Google Maps ohne Schlüssel ist dasselbe Spiel. Beides über einen Dienst zu holen, der
// Wohn-IPs und Bot-Prüfungen abräumt, ist hier nicht Bequemlichkeit, sondern der
// einzige Weg, der morgen auch noch funktioniert.
//
// ▲ Die Zuordnung der Anzeigen ist der heikelste Teil dieser Datei. Eine Suche nach
// „Oeltjenbruns" findet auch einen Dropshipping-Shop, der personalisierte Uhren mit
// diesem Nachnamen verkauft; eine Suche nach „EUROMASTER" findet die Kette und Michelin,
// nicht die Filiale im Ort. Wer das nicht aussortiert, schreibt einem Betrieb ins PDF,
// seine Nachbarn würden werben — und verliert beim ersten Nachprüfen alles.

const APIFY = "https://api.apify.com/v2/acts";
const PLACES = "compass~crawler-google-places";
const ADLIB = "curious_coder~facebook-ads-library-scraper";

// Wörter, die in keinem Betriebsnamen etwas unterscheiden. Ein Treffer auf eines davon
// ist kein Treffer.
const ALLERWELT = new Set([
  "auto", "autos", "kfz", "car", "cars", "werkstatt", "werkstätten", "service", "autoservice",
  "gmbh", "ug", "kg", "ohg", "gbr", "mbh", "co", "und", "der", "die", "das", "haus", "autohaus",
  "meister", "technik", "center", "zentrum", "team", "group", "deutschland", "online",
  "shop", "handel", "partner", "profi", "pro", "express", "bau", "gmbhcokg", "ek",
  "ihr", "ihre", "alle", "beste", "neu", "neue",
  // Gattungswörter aus den Gewerken. Ohne sie wird aus „B&K KFZ und Lackier Service" das
  // Kennwort „lackier", und jede Lackiererei Deutschlands gilt als derselbe Betrieb —
  // am 28.10.2026 live passiert, gleich dreimal in einem Ort.
  "lackier", "lackierung", "lackiererei", "lack", "karosserie", "karosseriebau",
  "nutzfahrzeuge", "nutzfahrzeug", "fahrzeug", "fahrzeuge", "automobile", "automobil",
  "mobile", "reifen", "motor", "motoren", "getriebe", "unfall", "abschlepp", "prüfstelle",
  "pruefstelle", "ersatzteile", "teile", "dach", "dachdecker", "bedachung", "elektro",
  "elektrik", "sanitaer", "sanitär", "heizung", "klima", "maler", "malerei", "tischler",
  "tischlerei", "schreinerei", "garten", "landschaft", "bedachungen", "innenausbau",
]);

function normal(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Die Wörter, an denen man genau diesen Betrieb erkennt — Eigennamen, keine Gattung.
//
// Der Ortsname gehört dazu ausgeschlossen, und zwar genau deshalb, weil er so oft im
// Firmennamen steht: Innerhalb eines Ortes unterscheidet er nichts. „Auto Westerstede UG"
// behielt ohne diesen Ausschluss nur „westerstede" als Kennwort — und wurde damit dem
// „Grillwerk Westerstede" zugeordnet.
export function kennwoerter(name, ort = "") {
  const ortsworte = new Set(normal(ort).split(" ").filter(Boolean));
  return normal(name)
    .split(" ")
    .filter((w) => w.length >= 4 && !ALLERWELT.has(w) && !ortsworte.has(w));
}

/**
 * Gehört diese Anzeige zu diesem Betrieb?
 *
 * Drei Ausgänge, und der mittlere ist der wichtige:
 *   "sicher"   — der Werbetreibende trägt ein Kennwort des Betriebs UND es gibt keinen
 *                Hinweis, dass eine Kette oder ein Fremder wirbt.
 *   "unsicher" — ein Kennwort trifft, aber der Name passt nicht zusammen. Zählt NICHT
 *                als Werbung des Betriebs; taucht im Ergebnis als Vermerk auf.
 *   "nein"     — kein Bezug.
 *
 * Im Zweifel „unsicher". Ein verpasster Werbetreibender kostet eine Beobachtung, ein
 * erfundener kostet den Termin.
 */
export function zuordnen(betriebsname, pageName, ort = "") {
  const fremd = normal(pageName);
  if (!fremd) return "nein";

  // Gleicher Name, fertig. Steht ganz vorn, weil der Rest der Prüfung Kennwörter
  // braucht: „SBB Autoservice GmbH" besteht nur aus einem zu kurzen Kürzel und zwei
  // Gattungswörtern und hat deshalb keines — obwohl Namensgleichheit der denkbar
  // beste Beleg ist.
  if (fremd === normal(betriebsname)) return "sicher";

  const meine = kennwoerter(betriebsname, ort);
  // Bleibt nach Gattung und Ortsname nichts Unterscheidendes übrig — „Nutzfahrzeuge
  // Service", „Auto Westerstede UG" —, dann ist über diesen Betrieb schlicht keine
  // Aussage möglich. Lieber keine als eine falsche.
  if (!meine.length) return "nein";

  // Geprüft wird in dieser Richtung: Steckt alles, was den FREMDEN Werbetreibenden
  // ausmacht, in unserem Betriebsnamen? Umgekehrt zu fragen war falsch — ein Betrieb
  // heißt „Freie Mehrmarkenwerkstatt Ralf Renken" und wirbt als „Ralf Renken", und
  // dann fehlen zwei eigene Kennwörter, ohne dass irgendetwas dagegen spräche.
  const seine = kennwoerter(pageName, ort);
  if (!seine.length) return "nein";
  const passt = (w) => meine.some((m) => m === w || m.includes(w) || w.includes(m));
  // Gar keine Überschneidung heißt: ein fremder Betrieb, der zufällig im Suchergebnis
  // stand. Das ist kein Zweifelsfall, sondern ein klares Nein — „Family Gifts D3" hat
  // mit „Dieter Schulz" nichts zu tun und gehört nicht einmal in die Vermerkliste.
  if (!seine.some(passt)) return "nein";
  if (seine.some((w) => !passt(w))) return "unsicher";

  // Trägt der eigene Name den Ort und der fremde nicht, wirbt mit hoher Wahrscheinlichkeit
  // die Kette und nicht die Filiale. „EUROMASTER Westerstede PKW & LKW" gegen schlicht
  // „Euromaster": Die Anzeige lief bundesweit, nicht für diesen Standort.
  const ortImEigenen = normal(ort) && normal(betriebsname).includes(normal(ort));
  const ortImFremden = normal(ort) && fremd.includes(normal(ort));
  if (ortImEigenen && !ortImFremden) return "unsicher";

  // Hängt alles an einem einzigen Wort, muss dieses Wort lang genug sein, um ein
  // Eigenname zu sein. „Autohaus Spiegel" behält nur „spiegel" — und traf damit DER
  // SPIEGEL, das Nachrichtenmagazin (live gesehen am 28.10.2026). „Oeltjenbruns" mit
  // zwölf Zeichen trägt diese Last, „spiegel" mit sieben nicht. Zwei übereinstimmende
  // Wörter reichen dagegen auch kurz: „Dieter Schulz" ist als Paar eindeutig genug.
  if (seine.length === 1 && seine[0].length < 8) return "unsicher";

  return "sicher";
}

async function apify(actor, input, { token, grenze = 120000, maxItems = null } = {}) {
  if (!token) throw new Error("APIFY_TOKEN fehlt");
  const u = new URL(`${APIFY}/${actor}/run-sync-get-dataset-items`);
  u.searchParams.set("token", token);
  if (maxItems) u.searchParams.set("maxItems", String(maxItems));

  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), grenze);
  try {
    const antwort = await fetch(u, {
      method: "POST",
      signal: abbruch.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!antwort.ok) {
      throw new Error(`${actor} antwortete ${antwort.status}: ${(await antwort.text()).slice(0, 200)}`);
    }
    return await antwort.json();
  } finally {
    clearTimeout(uhr);
  }
}

/**
 * Die Betriebe eines Gewerks an einem Ort.
 *
 * `maxCrawledPlacesPerSearch` begrenzt, was abgerechnet wird — ohne Grenze zieht der
 * Abruf in einer größeren Stadt dreistellig viele Profile, und jedes kostet.
 */
export async function profileHolen({ gewerk, ort, hoechstens = 24, token }) {
  const roh = await apify(
    PLACES,
    {
      searchStringsArray: [gewerk],
      locationQuery: `${ort}, Germany`,
      maxCrawledPlacesPerSearch: hoechstens,
      language: "de",
      countryCode: "de",
      skipClosedPlaces: true,
    },
    { token, grenze: 150000 },
  );

  return (Array.isArray(roh) ? roh : [])
    .filter((p) => p?.title)
    .map((p) => ({
      name: String(p.title).trim(),
      kategorie: p.categoryName || null,
      bewertungen: Number.isFinite(p.reviewsCount) ? p.reviewsCount : 0,
      schnitt: Number.isFinite(p.totalScore) ? p.totalScore : null,
      fotos: Number.isFinite(p.imagesCount) ? p.imagesCount : 0,
      website: Boolean(p.website),
      telefon: Boolean(p.phone),
      // Google bietet „Inhaber dieses Unternehmens?" nur an, wenn das Profil niemandem
      // gehört. Das Feld ist damit die einzige verlässliche Auskunft darüber, ob der
      // Betrieb sein eigenes Profil je in die Hand genommen hat.
      uebernommen: p.claimThisBusiness !== true,
      ort: p.city || ort,
    }));
}

/**
 * Für jeden Betrieb: wirbt er bei Meta, und worum?
 *
 * Alle Suchen laufen in EINEM Actor-Aufruf. Einzeln wären es so viele Starts wie
 * Betriebe, und jeder Start kostet Zeit und Geld.
 */
export async function anzeigenHolen(betriebe, { token, ort = "", jeBetrieb = 6 } = {}) {
  const suchen = betriebe.map((b) => {
    // Gesucht wird mit den Kennwoertern OHNE Ortsnamen: „Auto Westerstede" findet jeden
    // Werbetreibenden des Ortes, der Betriebsname ohne Ort findet den Betrieb.
    const begriff = kennwoerter(b.name, ort).slice(0, 2).join(" ");
    return {
      betrieb: b.name,
      begriff,
      url: begriff
        ? "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=DE" +
          `&q=${encodeURIComponent('"' + begriff + '"')}&search_type=keyword_exact_phrase`
        : null,
    };
  }).filter((s) => s.url);

  let roh = [];
  try {
    roh = await apify(
      ADLIB,
      {
        urls: suchen.map((s) => ({ url: s.url })),
        limitPerSource: jeBetrieb,
        scrapeAdDetails: false,
      },
      { token, grenze: 120000, maxItems: betriebe.length * jeBetrieb },
    );
  } catch (fehler) {
    // Die Werbebibliothek ist der fragilere der beiden Abrufe. Fällt sie aus, bleibt die
    // Rangliste trotzdem stehen — sie ist das Herz, die Anzeigenlage die Zugabe.
    console.error("Anzeigenlage gescheitert:", fehler?.message);
    return { verfuegbar: false, je: new Map(), unsicher: [] };
  }

  const je = new Map(betriebe.map((b) => [b.name, []]));
  const unsicher = [];

  for (const a of Array.isArray(roh) ? roh : []) {
    if (!a?.page_name) continue; // Leerzeile einer Suche ohne Treffer.
    const quelle = suchen.find((s) => s.url === a.url);
    if (!quelle) continue;

    const urteil = zuordnen(quelle.betrieb, a.page_name, ort);
    if (urteil === "nein") continue;
    if (urteil === "unsicher") {
      unsicher.push({ betrieb: quelle.betrieb, werbetreibender: a.page_name });
      continue;
    }

    je.get(quelle.betrieb).push({
      werbetreibender: a.page_name,
      aktiv: a.is_active === true,
      // Die Kategorie kommt von Meta selbst. „EMPLOYMENT" heißt: Das ist eine
      // Stellenanzeige — der Unterschied zwischen „wirbt um Kunden" und „sucht Personal",
      // und der ist für dieses Werkzeug der ganze Punkt.
      personal: Array.isArray(a.categories) && a.categories.includes("EMPLOYMENT"),
      von: (a.start_date_formatted || "").slice(0, 10) || null,
      bis: (a.end_date_formatted || "").slice(0, 10) || null,
      id: a.ad_archive_id || null,
      text: typeof a["snapshot.body.text"] === "string" && !a["snapshot.body.text"].includes("{{")
        ? a["snapshot.body.text"]
        : null,
    });
  }

  return { verfuegbar: true, je, unsicher };
}

/**
 * Alles zusammen. Gibt die rohe Messung zurück, kein Urteil — das rechnet
 * `rangliste-urteil.js`, damit sich an der Bewertung etwas ändern lässt, ohne neu
 * zu messen (und zu bezahlen).
 */
export async function sammle({ gewerk, ort, hoechstens = 24, ohneAnzeigen = false }) {
  const token = process.env.APIFY_TOKEN;
  if (!token) return { fehler: "kein_apify_token" };
  if (!gewerk || !ort) return { fehler: "gewerk_oder_ort_fehlt" };

  let betriebe;
  try {
    betriebe = await profileHolen({ gewerk, ort, hoechstens, token });
  } catch (fehler) {
    console.error("Profile gescheitert:", fehler?.message);
    return { fehler: "profile_nicht_lesbar" };
  }
  if (betriebe.length < 3) return { fehler: "zu_wenige_betriebe" };

  // Nur die Betriebe der Hauptkategorie kommen in die Rangliste. Eine Suche nach
  // „Autowerkstatt" liefert auch Ersatzteilhandel, Reifenhandel und Prüfstelle — die
  // stehen am selben Ort, sind aber keine Wettbewerber und verfälschen jeden Rang.
  const haeufigste = mehrheitskategorie(betriebe);
  const kern = betriebe.filter((b) => b.kategorie === haeufigste);
  const liste = kern.length >= 3 ? kern : betriebe;

  const grund = {
    gewerk,
    ort,
    kategorie: haeufigste,
    gemessenAm: new Date().toISOString(),
    aussortiert: betriebe.length - liste.length,
    betriebe: liste.map((b) => ({ ...b, anzeigen: [] })),
  };

  // Die Anzeigenprüfung dauert so lange wie die Profile selbst — am 28.10.2026 gemessen:
  // 28,4 s für die Profile, 29,4 s für die Anzeigen. Wer beides in einem Zug abwartet,
  // sitzt eine Minute vor einem grauen Knopf, und genau dort bricht der Trichter ab.
  // Deshalb kann der Aufrufer die Profile allein holen und die Anzeigen nachreichen.
  if (ohneAnzeigen) return { ...grund, anzeigenVerfuegbar: null, anzeigenUnsicher: [] };

  return { ...grund, ...(await anzeigenErgaenzen(grund, token)) };
}

/**
 * Die Anzeigenlage zu einer fertigen Profilmessung nachholen.
 *
 * Getrennt von `sammle`, damit die Seite den Markt schon zeigen kann, während das hier
 * noch läuft. Gibt nur die Felder zurück, die sich ändern — der Aufrufer legt sie über
 * seine vorhandene Messung.
 */
export async function anzeigenErgaenzen(messung, token = process.env.APIFY_TOKEN) {
  const anzeigen = await anzeigenHolen(messung.betriebe, { token, ort: messung.ort });
  return {
    anzeigenVerfuegbar: anzeigen.verfuegbar,
    anzeigenUnsicher: anzeigen.unsicher,
    betriebe: messung.betriebe.map((b) => ({ ...b, anzeigen: anzeigen.je.get(b.name) || [] })),
  };
}

function mehrheitskategorie(betriebe) {
  const zaehler = new Map();
  for (const b of betriebe) {
    if (!b.kategorie) continue;
    zaehler.set(b.kategorie, (zaehler.get(b.kategorie) || 0) + 1);
  }
  let beste = null;
  let hoechste = 0;
  for (const [k, n] of zaehler) {
    if (n > hoechste) { beste = k; hoechste = n; }
  }
  return beste;
}
