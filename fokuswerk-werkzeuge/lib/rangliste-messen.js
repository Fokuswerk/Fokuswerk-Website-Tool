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
// Google Ads Transparency. Im Modus "advertisers" kostet eine Zeile 0,3 Cent — und es
// entsteht nur eine Zeile fuer Betriebe, die wirklich werben. Wer nicht wirbt, kostet nichts.
const GOOGLE_ADS = "scrapesage~google-ads-transparency-scraper";

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
  // Nachtrag 28.10.2026. Jedes dieser Woerter war der EINZIGE Anker einer falschen
  // Zuordnung in den ausgelieferten Daten: „ATT Autoteile Technik" traf den Onlinehandel
  // „ATP-AUTOTEILE" (unterscheidend waren nur „att" und „atp", beide zu kurz), „L&B Motors"
  // traf „SehgalMotors.PK", „KS Fahrzeughandel" traf „ELN_DasFahrzeughandelssystem".
  "autoteile", "autoteil", "motors", "autoservice", "fahrzeughandel", "werkstatt",
  // ▲ Hier gehoeren „hausverwaltung" und „landtechnik" ausdruecklich NICHT hinein, obwohl
  // beide nach Gattung klingen. Sie kennzeichnen einen ANDEREN Betrieb derselben Familie,
  // und genau daran erkennt die Pruefung unten den Unterschied: „Oeltjenbruns Landtechnik"
  // ist nicht „H. Oeltjenbruns", und „bruenjeshausverwaltung" ist nicht „Auto Bruenjes".
  // In der Allerwelt-Liste wuerden sie zu Rauschen — und beide Faelle wieder durchgehen.
]);

// Welches Wort gehoert zu welchem Gewerk. Gebraucht fuer genau eine Frage: Nennt sich der
// fremde Werbetreibende selbst nach einem ANDEREN Gewerk als dem gemessenen? „KFZ-Auto
// Elektrik Goerlich" und „dachdecker_a.goerlich" teilen den Nachnamen — aber die eine Seite
// sagt von sich, sie sei ein Dachdecker, und das ist keine Autowerkstatt.
const GEWERKWORTE = {
  auto: ["auto", "kfz", "autoteile", "motors", "autoservice", "fahrzeug", "fahrzeuge",
    "fahrzeughandel", "automobile", "automobil", "reifen", "motor", "motoren", "getriebe",
    "karosserie", "karosseriebau", "lackier", "lackiererei", "abschlepp", "nutzfahrzeuge",
    "werkstatt", "mehrmarkenwerkstatt", "pkw", "lkw"],
  dach: ["dach", "dachdecker", "bedachung", "bedachungen", "flachdach"],
  elektro: ["elektro", "elektrik", "elektriker"],
  shk: ["sanitaer", "heizung", "klima", "klempner", "installateur"],
  maler: ["maler", "malerei", "lackierer"],
  holz: ["tischler", "tischlerei", "schreiner", "schreinerei", "innenausbau"],
  garten: ["garten", "landschaft", "gartenbau"],
  // Landmaschinen sind kein Gartenbau. Eigene Gruppe, damit die Pruefung sie gegen jedes
  // andere Gewerk stellt: „Oeltjenbruns Landtechnik" ist nicht „H. Oeltjenbruns" die
  // Autowerkstatt, auch wenn der Nachname derselbe ist.
  agrar: ["landtechnik", "landmaschinen", "agrar"],
};

/** Zu welcher Gewerkgruppe gehoert dieser Gewerkname? */
function gewerkGruppe(gewerk) {
  const g = normal(gewerk);
  if (!g) return null;
  for (const [gruppe, worte] of Object.entries(GEWERKWORTE)) {
    if (worte.some((w) => g.includes(w))) return gruppe;
  }
  return null;
}

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
export function zuordnen(betriebsname, pageName, ort = "", gewerk = "") {
  const fremd = normal(pageName);
  if (!fremd) return "nein";

  // Gleicher Name, fertig. Steht ganz vorn, weil der Rest der Prüfung Kennwörter
  // braucht: „SBB Autoservice GmbH" besteht nur aus einem zu kurzen Kürzel und zwei
  // Gattungswörtern und hat deshalb keines — obwohl Namensgleichheit der denkbar
  // beste Beleg ist.
  if (fremd === normal(betriebsname)) return "sicher";

  // Gleiche Zeichen, andere Leerstellen. „König39" gegen „König 39": Das sind zwei
  // Schreibweisen desselben Betriebs, aber die Kennwortpruefung darunter sieht einmal
  // „koenig39" und einmal „koenig" plus eine Zahl, die als zu kurz herausfaellt — und
  // verwarf den Treffer. Gefunden am 29.10.2026 beim ersten Google-Lauf in Oldenburg.
  if (fremd.replace(/ /g, "") === normal(betriebsname).replace(/ /g, "")) return "sicher";

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
  // Nennt der fremde Werbetreibende sich selbst nach einem anderen Gewerk, und kommt das
  // gemessene in seinem Namen gar nicht vor, dann ist er ein anderer Betrieb — auch bei
  // gleichem Nachnamen. „KFZ-Auto Elektrik Goerlich" gegen „dachdecker_a.goerlich": in den
  // ausgelieferten Daten zaehlte das als werbende Autowerkstatt.
  const meinGewerk = gewerkGruppe(gewerk);
  if (meinGewerk) {
    const fremdWorte = new Set(fremd.split(" "));
    const nenntEigenes = GEWERKWORTE[meinGewerk].some((w) => fremdWorte.has(w));
    const nenntFremdes = Object.entries(GEWERKWORTE)
      .filter(([gruppe]) => gruppe !== meinGewerk)
      .some(([, worte]) => worte.some((w) => fremdWorte.has(w)));
    if (nenntFremdes && !nenntEigenes) return "nein";
  }

  // Ein fremdes Wort passt zu einem eigenen, wenn es dasselbe ist — oder wenn das eine im
  // anderen steckt UND nach dem Herausnehmen nichts Eigenstaendiges stehen bleibt.
  //
  // ▲ Der Zusatz ist der ganze Unterschied. Ohne ihn genuegte es, dass ein fremder Name ein
  // Kennwort ENTHAELT: „bruenjeshausverwaltung" enthaelt „bruenjes", und damit wurde die
  // Hausverwaltung derselben Familie zur werbenden Autowerkstatt „Auto Bruenjes" —
  // ausgeliefert und auf der Seite behauptet. Gattungswoerter zaehlen dabei nicht als
  // eigenstaendig, denn „autohausmeyer" minus „meyer" ist „autohaus" und damit derselbe
  // Betrieb, nur zusammengeschrieben.
  const ohne = (lang, kurz) => lang.split(kurz).join("");
  const passt = (w) =>
    meine.some((m) => {
      if (m === w) return true;
      const laenger = w.includes(m) ? w : m.includes(w) ? m : null;
      if (!laenger) return false;
      const uebrig = ohne(laenger, laenger === w ? m : w);
      return uebrig.length < 4 || ALLERWELT.has(uebrig);
    });
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

async function apify(actor, input, { token, grenze = 120000, maxItems = null, versuche = 2 } = {}) {
  if (!token) throw new Error("APIFY_TOKEN fehlt");
  const u = new URL(`${APIFY}/${actor}/run-sync-get-dataset-items`);
  u.searchParams.set("token", token);
  if (maxItems) u.searchParams.set("maxItems", String(maxItems));

  // ▲ Ein zweiter Versuch bei 429 und 5xx.
  //
  // Der Google-Scraper antwortete am 30.10.2026 aus der Serverless-Funktion heraus mit
  // „502 Bad Gateway", während derselbe Aufruf vom Rechner aus durchlief. Die Folge stand
  // in der Rangliste: Bei jedem Betrieb „keine Werbung", auch bei dem, der seine Anzeige
  // gerade selbst bezahlt. Ein Fehlschlag der Quelle darf nicht wie ein Messergebnis
  // aussehen — deshalb hier der zweite Anlauf und weiter unten der Strich statt „keine".
  let letzter = null;
  for (let versuch = 1; versuch <= versuche; versuch++) {
    const abbruch = new AbortController();
    const uhr = setTimeout(() => abbruch.abort(), grenze);
    try {
      const antwort = await fetch(u, {
        method: "POST",
        signal: abbruch.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (antwort.ok) return await antwort.json();
      const text = (await antwort.text()).slice(0, 200);
      letzter = new Error(`${actor} antwortete ${antwort.status}: ${text}`);
      const nochmal = antwort.status === 429 || antwort.status >= 500;
      if (!nochmal || versuch === versuche) throw letzter;
      await new Promise((r) => setTimeout(r, 4000));
    } catch (fehler) {
      letzter = fehler;
      // Ein Abbruch wegen Zeitüberschreitung bleibt ein Abbruch; zweimal zu warten
      // verdoppelt nur die Wartezeit des Besuchers.
      if (fehler?.name === "AbortError" || versuch === versuche) throw fehler;
      await new Promise((r) => setTimeout(r, 4000));
    } finally {
      clearTimeout(uhr);
    }
  }
  throw letzter || new Error(`${actor} ohne Antwort`);
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
      // ▲ KEIN skipClosedPlaces. Das ist bei Apify ein kostenpflichtiger Filter und kostet
      // 0,001 USD je Profil zusaetzlich — bei 24 Profilen also 2,4 Cent, ein Fuenftel der
      // gesamten Profilkosten. Die Felder `permanentlyClosed` und `temporarilyClosed`
      // kommen ohnehin in jeder Antwort mit, also sortieren wir unten selbst aus. Gratis.
    },
    { token, grenze: 150000 },
  );

  return (Array.isArray(roh) ? roh : [])
    .filter((p) => p?.title && !p.permanentlyClosed && !p.temporarilyClosed)
    .map((p) => ({
      name: String(p.title).trim(),
      kategorie: p.categoryName || null,
      bewertungen: Number.isFinite(p.reviewsCount) ? p.reviewsCount : 0,
      schnitt: Number.isFinite(p.totalScore) ? p.totalScore : null,
      fotos: Number.isFinite(p.imagesCount) ? p.imagesCount : 0,
      website: Boolean(p.website),
      // Die Adresse selbst, nicht nur ob es eine gibt: Der Google-Ads-Check fragt nach
      // Domains. Bis zum 29.10.2026 stand hier nur das Ja/Nein, und damit war der Vorrat
      // fuer diese Frage blind.
      domain: reineDomain(p.website),
      telefon: Boolean(p.phone),
      // Google bietet „Inhaber dieses Unternehmens?" nur an, wenn das Profil niemandem
      // gehört. Das Feld ist damit die einzige verlässliche Auskunft darüber, ob der
      // Betrieb sein eigenes Profil je in die Hand genommen hat.
      uebernommen: p.claimThisBusiness !== true,
      ort: p.city || ort,
    }));
}

/**
 * Einen einzelnen Betrieb bei Google suchen — über seinen NAMEN, nicht über eine Kategorie.
 *
 * Warum das der richtige Einstieg ist: Der Trichter fragte zuerst nach dem Gewerk, aber kein
 * Betrieb kennt die Kategorie, unter der Google ihn führt. Die vergibt Google, nicht er.
 * Fokuswerk steht dort als „Online-Marketing-Unternehmen" — auf den Begriff kommt niemand,
 * und drei Anläufe mit Werbeagentur, Marketingagentur und Social-Media-Agentur gingen am
 * 29.10.2026 alle ins Leere. Wer den Namen eingibt, braucht nicht zu raten, und die Rangliste
 * entsteht anschließend in genau der Kategorie, in der Google ihn selbst einsortiert hat.
 */
export async function betriebSuchen({ betrieb, ort, token = process.env.APIFY_TOKEN }) {
  const roh = await apify(
    PLACES,
    {
      searchStringsArray: [String(betrieb).trim()],
      locationQuery: `${ort}, Germany`,
      // Drei statt einem: Bei „Müller" in einer Kleinstadt liegen mehrere nebeneinander,
      // und der erste Treffer ist nicht zwingend der gemeinte. Die Auswahl trifft der Mensch.
      maxCrawledPlacesPerSearch: 3,
      language: "de",
      countryCode: "de",
    },
    { token, grenze: 120000 },
  );

  return (Array.isArray(roh) ? roh : [])
    .filter((p) => p?.title && p.categoryName && !p.permanentlyClosed && !p.temporarilyClosed)
    // Dieselben Felder wie `profileHolen`: Der gefundene Betrieb muss sich in die Rangliste
    // einhaengen lassen. Grund: Die Suche nach der Kategorie ist bei Google eine TEXTsuche,
    // kein Filter — „Online-Marketing-Unternehmen" in Oldenburg lieferte 17 Betriebe und
    // Fokuswerk war nicht dabei, obwohl Google genau diese Kategorie an seinem Profil
    // fuehrt (29.10.2026). Wer sich selbst gesucht hat, muss in seiner eigenen Liste stehen.
    .map((p) => ({
      name: String(p.title).trim(),
      kategorie: p.categoryName,
      // Zum Wiedererkennen, wenn mehrere zur Auswahl stehen.
      anschrift: p.address || p.street || null,
      bewertungen: Number.isFinite(p.reviewsCount) ? p.reviewsCount : 0,
      schnitt: Number.isFinite(p.totalScore) ? p.totalScore : null,
      fotos: Number.isFinite(p.imagesCount) ? p.imagesCount : 0,
      website: Boolean(p.website),
      domain: reineDomain(p.website),
      telefon: Boolean(p.phone),
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
export async function anzeigenHolen(betriebe, { token, ort = "", gewerk = "", jeBetrieb = 6 } = {}) {
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

    const urteil = zuordnen(quelle.betrieb, a.page_name, ort, gewerk);
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
    // Der Originaltext bleibt am Ergebnis haengen. Nach aussen gibt der Endpunkt weiter nur
    // `profile_nicht_lesbar` heraus; fuer die Fehlersuche hinter dem Diagnoseschluessel ist
    // der Unterschied zwischen "kein Guthaben" und "Actor kaputt" aber der ganze Unterschied.
    return { fehler: "profile_nicht_lesbar", grund: String(fehler?.message || fehler).slice(0, 400) };
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
  if (ohneAnzeigen) return { ...grund, anzeigenVerfuegbar: null, anzeigenUnsicher: [], googleVerfuegbar: null, googleUnsicher: [] };

  return { ...grund, ...(await anzeigenErgaenzen(grund, token)) };
}

/**
 * Die Anzeigenlage zu einer fertigen Profilmessung nachholen.
 *
 * Getrennt von `sammle`, damit die Seite den Markt schon zeigen kann, während das hier
 * noch läuft. Gibt nur die Felder zurück, die sich ändern — der Aufrufer legt sie über
 * seine vorhandene Messung.
 */
export async function anzeigenErgaenzen(messung, token = process.env.APIFY_TOKEN, { eigeneDomain = null } = {}) {
  // Nacheinander, nicht nebeneinander.
  //
  // Parallel lief es schneller, aber die beiden Apify-Actors teilen sich dasselbe Konto
  // und dessen Arbeitsspeicher. Der zweite Lauf bekam regelmäßig ein 502 — und ein
  // Fehlschlag sieht in der Tabelle aus wie „wirbt nicht". Lieber eine Minute mehr in
  // einem Aufruf, der ohnehin im Hintergrund läuft, während der Besucher den Teaser liest.
  const meta = await anzeigenHolen(messung.betriebe, { token, ort: messung.ort, gewerk: messung.gewerk });
  const google = await googleAnzeigenHolen(messung.betriebe, {
    token, ort: messung.ort, gewerk: messung.gewerk, zuerst: eigeneDomain,
  });
  return {
    anzeigenVerfuegbar: meta.verfuegbar,
    anzeigenUnsicher: meta.unsicher,
    googleVerfuegbar: google.verfuegbar,
    googleUnsicher: google.unsicher,
    googleSpur: google.spur || null,
    betriebe: messung.betriebe.map((b) => ({
      ...b,
      anzeigen: meta.je.get(b.name) || [],
      googleAnzeigen: google.je.get(b.name) || [],
      // Bei dieser Domain hat die Quelle nicht geantwortet — das ist etwas anderes als
      // „wirbt nicht", und die Tabelle muss es unterscheiden können.
      googleUngemessen: b.domain ? (google.nichtGemessen || new Set()).has(b.domain) : true,
    })),
  };
}

// Aus der Website-Adresse die nackte Domain. Null, wenn nichts Brauchbares dasteht —
// Facebook-Seiten und Branchenbucheintraege sind keine eigene Website.
function reineDomain(url) {
  if (typeof url !== "string" || !url.trim()) return null;
  let host;
  try {
    host = new URL(url.includes("://") ? url : "https://" + url).hostname.toLowerCase();
  } catch {
    return null;
  }
  host = host.replace(/^www\./, "");
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)) return null;
  // Wer nur eine Facebook-Seite oder einen Eintrag im Branchenbuch hinterlegt hat, hat
  // keine Domain, unter der er werben koennte.
  if (/(facebook|instagram|google|business\.site|jimdo|wixsite|gelbeseiten|das-telefonbuch)\./.test(host)) return null;
  return host;
}

/**
 * Fuer jeden Betrieb: wirbt er bei Google?
 *
 * Gefragt wird mit der Domain, nicht mit dem Namen — die Transparenzdatenbank ordnet
 * Werbetreibende ueber die beworbene Website zu. Betriebe ohne eigene Domain koennen
 * deshalb nicht geprueft werden; das ist kein "wirbt nicht", sondern "unbekannt".
 *
 * Die Falle, im Probelauf am 29.10.2026 gesehen: Auf `euromaster.de` kamen fuenf
 * Werbetreibende zurueck, vier davon fremde Agenturen und Partner aus AT, DK und SE, die
 * auf dieselbe Seite werben. Ungefiltert haette der Bericht vier werbende Autowerkstaetten
 * in Westerstede gemeldet, die es nicht gibt. Deshalb laeuft jede Zeile durch dieselbe
 * Zuordnung wie bei Meta.
 */
// Wie viele Domains in einen Abruf dürfen.
//
// Gemessen am 30.10.2026: Fünf Domains am Stück findet die Quelle zuverlässig (42 s,
// Treffer dabei). Zwölf bis fünfzehn in einem Lauf liefern reihenweise Leermeldungen —
// Google drosselt innerhalb derselben Sitzung, und der Scraper meldet die Lücke nicht als
// Lücke, sondern gibt die Domain einfach nicht zurück. Genau so verschwand die laufende
// Anzeige des Betriebs, der sich die Auswertung angesehen hat.
const GOOGLE_GRUPPE = 5;

export async function googleAnzeigenHolen(betriebe, { token, ort = "", gewerk = "", zuerst = null } = {}) {
  const mitDomain = betriebe.filter((b) => b.domain);
  if (!mitDomain.length) return { verfuegbar: true, je: new Map(), unsicher: [], nichtGemessen: new Set(), spur: { domains: 0 } };

  // ▲ Zweiter Anlauf für die Domains, die leer zurückkamen.
  //
  // Das Transparency Center antwortet nicht verlässlich: Derselbe Abruf über dieselben
  // 15 Domains brachte einmal einen Treffer und wenige Minuten später fünf — darunter
  // fokuswerk.de, das beim ersten Mal fehlte. Gemeldet am 30.10.2026, und zwar von dem
  // Betrieb, der seine eigene Google-Anzeige gerade selbst bezahlt: In seiner Zeile stand
  // „keine". Wer das liest, glaubt auch den anderen Spalten nicht mehr.
  //
  // Ein Nachschlag über die stillen Domains kostet einen weiteren Lauf, läuft aber im
  // Nachhol-Aufruf (?anzeigen=1), während der Besucher den Teaser liest.
  const abfragen = async (domains, grenze) =>
    apify(
      GOOGLE_ADS,
      { domains, resultType: "advertisers", region: "DE" },
      { token, grenze, maxItems: domains.length * 8 },
    );

  let alleDomains = [...new Set(mitDomain.map((b) => b.domain))];
  // Die eigene Domain in die erste Gruppe. Wenn die Zeit knapp wird, stimmt wenigstens
  // die Zeile, die der Betrieb zuerst liest — seine eigene.
  if (zuerst && alleDomains.includes(zuerst)) {
    alleDomains = [zuerst, ...alleDomains.filter((dom) => dom !== zuerst)];
  }

  const gruppen = [];
  // Die eigene Domain bekommt einen Lauf für sich. Ein Abruf über eine einzelne Domain
  // trifft zuverlässig (gemessen: 15 s, Treffer dabei) — und das ist die Zeile, an der
  // der Betrieb die ganze Auswertung misst.
  let rest = alleDomains;
  if (zuerst && alleDomains.includes(zuerst)) {
    gruppen.push([zuerst]);
    rest = alleDomains.filter((dom) => dom !== zuerst);
  }
  for (let i = 0; i < rest.length; i += GOOGLE_GRUPPE) {
    gruppen.push(rest.slice(i, i + GOOGLE_GRUPPE));
  }

  let roh = [];
  const nichtGemessen = new Set();
  const spur = { domains: alleDomains.length, gruppen: gruppen.length, gelungen: 0, zeilen: 0, fehler: [], abgebrochen: 0 };
  // Zeitbudget. Die Serverless-Funktion endet nach 300 Sekunden, und davor liegen schon
  // die Profile und die Meta-Prüfung. Lieber die letzten Gruppen ehrlich als ungemessen
  // ausweisen als die ganze Antwort verlieren — dann stünde gar nichts da.
  const beginn = Date.now();
  const budget = 160000;
  for (let i = 0; i < gruppen.length; i++) {
    const gruppe = gruppen[i];
    if (Date.now() - beginn > budget) {
      for (const dom of gruppe) nichtGemessen.add(dom);
      spur.abgebrochen += 1;
      continue;
    }
    // Luft zwischen den Läufen: Drei Abrufe unmittelbar hintereinander brachten zusammen
    // weniger Treffer als ein einzelner — die Quelle drosselt über die Läufe hinweg.
    if (i > 0) await new Promise((r) => setTimeout(r, 4000));
    try {
      const teil = await abfragen(gruppe, 110000);
      if (Array.isArray(teil)) roh = roh.concat(teil);
      spur.gelungen += 1;
    } catch (fehler) {
      // Eine Gruppe, die ausfällt, nimmt nur ihre eigenen Domains mit. Die werden als
      // ungemessen vermerkt statt als „wirbt nicht" ausgegeben.
      for (const dom of gruppe) nichtGemessen.add(dom);
      spur.fehler.push(String(fehler?.message || fehler).slice(0, 90));
      console.error("Google-Gruppe gescheitert:", fehler?.message);
    }
  }
  spur.zeilen = roh.length;
  if (!spur.gelungen) {
    return { verfuegbar: false, je: new Map(), unsicher: [], nichtGemessen, spur };
  }

  const je = new Map();
  const unsicher = [];
  const gesehen = new Set();
  for (const zeile of Array.isArray(roh) ? roh : []) {
    // Aus zwei Läufen kann derselbe Werbetreibende zweimal kommen.
    const kennung = String(zeile?.advertiserId || "") + "|" + String(zeile?.matchedDomain || "");
    if (gesehen.has(kennung)) continue;
    gesehen.add(kennung);
    const domain = String(zeile?.matchedDomain || zeile?.matchedQuery || "").toLowerCase();
    const betrieb = mitDomain.find((b) => b.domain === domain);
    if (!betrieb) continue;
    // Beide Namen prüfen: Google führt den Anzeigenamen (`name`) und den bestätigten
    // Rechtsträger (`legalName`) getrennt, und mal passt der eine zum Google-Profil, mal
    // der andere. Nur den Rechtsträger zu nehmen, verwirft den Betrieb, der als „Müller
    // GmbH" wirbt und bei Google „Autohaus Müller" heißt — und umgekehrt.
    const namen = [...new Set([zeile?.name, zeile?.legalName].map((x) => String(x || "").trim()).filter(Boolean))];
    let urteil = "nein";
    let werber = namen[0] || "";
    for (const kandidat of namen) {
      const u = zuordnen(betrieb.name, kandidat, ort, gewerk);
      if (u === "sicher") { urteil = "sicher"; werber = kandidat; break; }
      if (u === "unsicher" && urteil === "nein") { urteil = "unsicher"; werber = kandidat; }
    }
    if (urteil !== "sicher") {
      if (urteil === "unsicher") unsicher.push({ betrieb: betrieb.name, werber, domain });
      continue;
    }
    const bisher = je.get(betrieb.name) || [];
    bisher.push({
      werber,
      anzahlVon: Number.isFinite(zeile?.approxAdCountLow) ? zeile.approxAdCountLow : null,
      anzahlBis: Number.isFinite(zeile?.approxAdCountHigh) ? zeile.approxAdCountHigh : null,
      land: zeile?.countryCode || null,
      bestaetigt: zeile?.verified === true,
    });
    je.set(betrieb.name, bisher);
  }
  spur.treffer = je.size;
  spur.unsicher = unsicher.length;
  spur.ungemessen = nichtGemessen.size;
  return { verfuegbar: true, je, unsicher, nichtGemessen, spur };
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
