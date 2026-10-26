// Liest die Website eines Betriebs — nach denselben Regeln wie der Rechercheagent, weil
// dieselben Fallen hier wieder zuschlagen:
//
//   * Alle vier Varianten (apex/www × https/http). Wer nur https://domain probiert, hält
//     jede zweite Handwerkerseite für tot.
//   * Unterseiten aus der Sitemap oder den internen Links, nie geraten. Und jede abgerufene
//     Seite per Prüfsumme gegen die Startseite — viele Seiten antworten auf unbekannte Pfade
//     mit HTTP 200 und der Startseite, und dann schreibt das Modell die Anzeige aus dem
//     Begrüßungstext statt aus der Stellenbeschreibung.
//   * robots.txt gilt. Was dort gesperrt ist, holen wir nicht.

import { createHash } from "node:crypto";

const KENNUNG =
  "Mozilla/5.0 (compatible; FokuswerkStellenanzeiger/1.0; +https://fokuswerk.de)";
const ZEITGRENZE = 8000;
const MAXBYTES = 1_200_000;
const MAXZEICHEN = 12_000;

// Unterseiten, die über einen Betrieb etwas aussagen. Reihenfolge ist die Vorzugsreihenfolge.
const GESUCHTE_PFADE = [
  "karriere", "jobs", "stelle", "bewerb", "mitarbeit",
  "ueber-uns", "über-uns", "ueberuns", "unternehmen", "team", "wir-ueber-uns",
];

async function liesBegrenzt(antwort) {
  if (!antwort.body) return await antwort.text();
  const leser = antwort.body.getReader();
  const teile = [];
  let menge = 0;
  while (menge < MAXBYTES) {
    const { done, value } = await leser.read();
    if (done) break;
    teile.push(value);
    menge += value.length;
  }
  try { await leser.cancel(); } catch {}
  return new TextDecoder("utf-8", { fatal: false }).decode(
    teile.length === 1 ? teile[0] : Buffer.concat(teile.map(Buffer.from)),
  );
}

export async function holeSeite(adresse, { zeitgrenze = ZEITGRENZE } = {}) {
  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), zeitgrenze);
  try {
    const antwort = await fetch(adresse, {
      redirect: "follow",
      signal: abbruch.signal,
      headers: { "user-agent": KENNUNG, accept: "text/html,application/xml,*/*" },
    });
    if (!antwort.ok) return null;
    const typ = antwort.headers.get("content-type") || "";
    if (typ && !/html|xml|text/i.test(typ)) return null;
    return { adresse: antwort.url, inhalt: await liesBegrenzt(antwort) };
  } catch {
    return null;
  } finally {
    clearTimeout(uhr);
  }
}

// Die erste der vier Varianten, die antwortet. Die effektive Adresse zählt, nicht die
// eingegebene: wer auf www umleitet, hat sonst später keine einzige passende Unterseite.
export async function findeErreichbareAdresse(domain) {
  const rein = domain.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/?#].*$/, "");
  if (!/^[a-z0-9ä-ü-]+(\.[a-z0-9ä-ü-]+)+$/i.test(rein)) return null;
  // Die Domain kommt aus einem offenen Eingabefeld. Ohne diese Sperre könnte jemand den
  // Server auf das interne Netz zeigen lassen (127.0.0.1, 169.254.169.254, firmen.local).
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(rein)) return null;
  if (/\.(local|internal|localhost|test|lan|home|arpa)$/i.test(rein)) return null;

  for (const versuch of [
    `https://${rein}`, `https://www.${rein}`,
    `http://${rein}`, `http://www.${rein}`,
  ]) {
    const seite = await holeSeite(versuch);
    if (seite && seite.inhalt.length > 500) return seite;
  }
  return null;
}

// robots.txt ist kein Gesetz, aber die ausdrückliche Bitte des Betriebs, den wir gewinnen
// wollen. Einmal je Abruf geladen, dann für alle Unterseiten befragt.
export async function ladeRobots(basis) {
  const seite = await holeSeite(new URL("/robots.txt", basis).href, { zeitgrenze: 4000 });
  if (!seite) return { gesperrt: [] };
  const gesperrt = [];
  let gilt = false;
  for (const zeile of seite.inhalt.split("\n")) {
    const text = zeile.split("#")[0].trim();
    const treffer = text.match(/^(user-agent|disallow)\s*:\s*(.*)$/i);
    if (!treffer) continue;
    const [, feld, wert] = treffer;
    if (feld.toLowerCase() === "user-agent") gilt = wert.trim() === "*";
    else if (gilt && wert.trim()) gesperrt.push(wert.trim());
  }
  return { gesperrt };
}

export function robotsErlaubt(robots, adresse) {
  const pfad = new URL(adresse).pathname;
  return !robots.gesperrt.some((regel) => pfad.startsWith(regel.replace(/\*$/, "")));
}

const ohneWww = (host) => host.replace(/^www\./, "");

async function adressenAusSitemap(basis) {
  const seite = await holeSeite(new URL("/sitemap.xml", basis).href, { zeitgrenze: 5000 });
  if (!seite) return [];
  return [...seite.inhalt.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((t) => t[1]);
}

function adressenAusLinks(basis, html) {
  const gefunden = [];
  for (const treffer of html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
    try {
      const ziel = new URL(treffer[1], basis);
      if (!/^https?:$/.test(ziel.protocol)) continue;
      if (ohneWww(ziel.host) !== ohneWww(new URL(basis).host)) continue;
      gefunden.push(ziel.href.split("#")[0]);
    } catch {}
  }
  return gefunden;
}

function nachVorzug(adressen) {
  const bewertet = [];
  for (const adresse of new Set(adressen)) {
    const pfad = decodeURIComponent(new URL(adresse).pathname).toLowerCase();
    const rang = GESUCHTE_PFADE.findIndex((wort) => pfad.includes(wort));
    if (rang >= 0) bewertet.push({ adresse, rang });
  }
  return bewertet.sort((a, b) => a.rang - b.rang).map((e) => e.adresse);
}

const pruefsumme = (text) =>
  createHash("sha1").update(text.replace(/\s+/g, " ").trim()).digest("hex");

const ENTITAETEN = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö", Uuml: "Ü",
  szlig: "ß", eacute: "é", ndash: "–", mdash: "—", hellip: "…",
  bdquo: "„", ldquo: "“", rdquo: "”", sbquo: "‚", euro: "€",
};

export function textAus(html) {
  let roh = html
    .replace(/<(script|style|noscript|svg|template)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  roh = roh.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (ganz, name) => {
    if (name[0] === "#") {
      const zahl = name[1] === "x" || name[1] === "X"
        ? parseInt(name.slice(2), 16)
        : parseInt(name.slice(1), 10);
      return Number.isFinite(zahl) ? String.fromCodePoint(zahl) : ganz;
    }
    return ENTITAETEN[name] ?? ganz;
  });

  return roh
    .split("\n")
    .map((zeile) => zeile.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

function titelAus(html) {
  const titel = html.match(/<title[^>]*>([\s\S]{1,200}?)<\/title>/i);
  if (!titel) return null;
  // „Garten- & Landschaftsbau Bremen — Knolle Harpstedt" → der Teil hinter dem Trenner ist
  // fast immer der Name, der Teil davor die Suchmaschinenbeschreibung.
  const teile = textAus(titel[1]).split(/\s[|–—-]\s/).map((t) => t.trim()).filter(Boolean);
  if (!teile.length) return null;
  return (teile.length > 1 ? teile[teile.length - 1] : teile[0]).slice(0, 80);
}

// Startseite plus bis zu vier aussagekräftige Unterseiten, als ein Text.
export async function liesBetrieb(domain, { maxUnterseiten = 4 } = {}) {
  const start = await findeErreichbareAdresse(domain);
  if (!start) return null;

  const basis = new URL(start.adresse).origin;
  const robots = await ladeRobots(basis);
  const startText = textAus(start.inhalt);
  if (startText.length < 200) return null;

  const kandidaten = nachVorzug([
    ...(await adressenAusSitemap(basis)),
    ...adressenAusLinks(start.adresse, start.inhalt),
  ]).filter((adresse) => robotsErlaubt(robots, adresse));

  const gesehen = new Set([pruefsumme(startText)]);
  const seiten = [{ adresse: start.adresse, text: startText }];

  for (const adresse of kandidaten) {
    if (seiten.length > maxUnterseiten) break;
    const seite = await holeSeite(adresse, { zeitgrenze: 6000 });
    if (!seite) continue;
    const text = textAus(seite.inhalt);
    if (text.length < 200) continue;
    const summe = pruefsumme(text);
    if (gesehen.has(summe)) continue; // Weiche 404: dieselbe Seite unter anderem Pfad.
    gesehen.add(summe);
    seiten.push({ adresse, text });
  }

  // Navigation und Fußzeile stehen auf jeder Seite und fressen die Hälfte des Platzes.
  // Was auf mindestens drei Seiten wortgleich vorkommt und kurz ist, ist Beiwerk.
  const haeufigkeit = new Map();
  for (const seite of seiten) {
    for (const zeile of new Set(seite.text.split("\n"))) {
      haeufigkeit.set(zeile, (haeufigkeit.get(zeile) || 0) + 1);
    }
  }
  const istBeiwerk = (zeile) =>
    seiten.length >= 3 && zeile.length < 60 && (haeufigkeit.get(zeile) || 0) >= 3;

  // Die Stellenseite trägt die Anzeige, die Startseite nur den Rahmen. Deshalb kommen die
  // gefundenen Unterseiten zuerst — wird der Text zu lang, fehlt hinten die Startseite und
  // nicht die Stellenbeschreibung.
  const [start_, ...unterseiten] = seiten;
  let gesamt = "";
  for (const seite of [...unterseiten, start_]) {
    const text = seite.text.split("\n").filter((z) => !istBeiwerk(z)).join("\n");
    if (text.length < 120) continue;
    const stueck = `## ${seite.adresse}\n${text}\n\n`;
    if (gesamt.length + stueck.length > MAXZEICHEN) {
      gesamt += stueck.slice(0, Math.max(0, MAXZEICHEN - gesamt.length));
      break;
    }
    gesamt += stueck;
  }

  return {
    basis,
    titel: titelAus(start.inhalt),
    seiten: seiten.map((s) => s.adresse),
    text: gesamt.trim(),
  };
}
