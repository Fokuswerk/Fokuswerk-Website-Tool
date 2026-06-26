import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;

export interface WebsiteQuality {
  score: number;          // 0-100: 100 = sehr schlecht (bester Lead)
  notes: string[];        // Gründe
  builder: string | null; // erkanntes CMS/Builder
  has_ssl: boolean;
  is_mobile: boolean;
  age_estimate: "sehr alt (vor 2015)" | "alt (2015-2019)" | "aktuell (2020+)" | "unbekannt";
  is_good_lead: boolean;  // score >= 50
}

// ─── Builder-Erkennung ────────────────────────────────────────────────────────

const BUILDERS: Array<{ name: string; pattern: RegExp }> = [
  { name: "Jimdo",        pattern: /jimdo\.com|jimdostatic|jimdosite/i },
  { name: "Wix",          pattern: /wix\.com|wixstatic|wixsite/i },
  { name: "Squarespace",  pattern: /squarespace\.com|sqspcdn/i },
  { name: "Weebly",       pattern: /weebly\.com|weeblycloud/i },
  { name: "1&1 IONOS",    pattern: /ionos\.de|1und1\.de|homepage-baukasten|websitebuilder\.ionos/i },
  { name: "GoDaddy",      pattern: /godaddy\.com|godaddysites/i },
  { name: "Strikingly",   pattern: /strikingly\.com/i },
  { name: "WordPress.com",pattern: /wordpress\.com/i },
  { name: "homepage-baukasten", pattern: /homepage-baukasten|sitebuilder/i },
];

function detectBuilder(html: string, url: string): string | null {
  const combined = html + " " + url;
  for (const b of BUILDERS) {
    if (b.pattern.test(combined)) return b.name;
  }
  return null;
}

// ─── Alter schätzen ───────────────────────────────────────────────────────────

function estimateAge(html: string): WebsiteQuality["age_estimate"] {
  // Copyright-Jahr in Footer
  const yearMatch = html.match(/(?:©|copyright|&copy;)\s*(\d{4})/i);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;

  // CSS-Frameworks und Tech-Indikatoren
  const hasBootstrap3 = /bootstrap[^"]*(?:3\.|3\.3|3\.4)/i.test(html);
  const hasOldJQuery  = /jquery[^"]*(?:1\.|2\.)/i.test(html) || /jquery\.min\.js/i.test(html);
  const hasTableLayout = (html.match(/<table/gi) ?? []).length > 5;
  const hasModernFramework = /react|vue|angular|next\.js|nuxt/i.test(html);
  const hasModernCSS = /grid|flexbox|css-modules|tailwind/i.test(html);

  if (year) {
    if (year < 2015) return "sehr alt (vor 2015)";
    if (year < 2020) return "alt (2015-2019)";
    return "aktuell (2020+)";
  }

  if (hasTableLayout || hasBootstrap3) return "sehr alt (vor 2015)";
  if (hasOldJQuery && !hasModernFramework) return "alt (2015-2019)";
  if (hasModernFramework || hasModernCSS) return "aktuell (2020+)";

  return "unbekannt";
}

// ─── Qualitäts-Score berechnen ────────────────────────────────────────────────

function scoreWebsite(params: {
  html: string;
  url: string;
  has_ssl: boolean;
  is_mobile: boolean;
  builder: string | null;
  age: WebsiteQuality["age_estimate"];
}): { score: number; notes: string[] } {
  let score = 0;
  const notes: string[] = [];

  // Website-Builder → schlechteste Basis für SEO
  if (params.builder) {
    score += 35;
    notes.push(`Läuft auf ${params.builder} — schlechte SEO-Basis, keine individuelle Domain-Stärke`);
  }

  // Kein SSL
  if (!params.has_ssl) {
    score += 20;
    notes.push("Kein HTTPS — von Google abgewertet, Besucher sehen Sicherheitswarnung");
  }

  // Kein Mobile
  if (!params.is_mobile) {
    score += 20;
    notes.push("Nicht mobiloptimiert — 70% der Besucher kommen vom Handy");
  }

  // Alter
  if (params.age === "sehr alt (vor 2015)") {
    score += 20;
    notes.push("Design veraltet (vor 2015) — wirkt unprofessionell, schreckt Kunden ab");
  } else if (params.age === "alt (2015-2019)") {
    score += 10;
    notes.push("Design veraltet (2015-2019) — nicht mehr zeitgemäß");
  }

  // Kein strukturiertes Schema
  if (!params.html.includes("application/ld+json")) {
    score += 5;
    notes.push("Kein strukturiertes Daten-Schema — Google findet Infos schwerer");
  }

  // Kein Analytics
  if (!/google-analytics|gtag|gtm\.|_ga/i.test(params.html)) {
    score += 5;
    notes.push("Kein Analytics — Betreiber weiß nicht wie viele Besucher die Seite hat");
  }

  // Kein Meta-Description
  if (!/meta[^>]+name=["']description["']/i.test(params.html)) {
    score += 5;
    notes.push("Fehlende Meta-Description — Google zeigt generischen Text in Suchergebnissen");
  }

  // Keine Social-Links
  if (!/instagram|facebook|linkedin/i.test(params.html)) {
    score += 5;
    notes.push("Keine Social-Media Präsenz verlinkt");
  }

  return { score: Math.min(score, 100), notes };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { url } = await req.json() as { url?: string };
  if (!url) return NextResponse.json({ error: "URL fehlt" }, { status: 400 });

  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  let hasSSL = fullUrl.startsWith("https://"); // Fallback bis Redirect bekannt

  try {
    const res = await fetch(fullUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(8_000),
      redirect: "follow",
    });

    // SSL nach finalem Redirect prüfen (nicht nach Input-URL — die ist oft HTTP)
    hasSSL = res.url.startsWith("https://");

    const html = await res.text();
    const isMobile = /viewport/i.test(html) && /width=device-width/i.test(html);
    const builder  = detectBuilder(html, fullUrl);
    const age      = estimateAge(html);
    const { score, notes } = scoreWebsite({ html, url: fullUrl, has_ssl: hasSSL, is_mobile: isMobile, builder, age });

    const result: WebsiteQuality = {
      score,
      notes,
      builder,
      has_ssl:      hasSSL,
      is_mobile:    isMobile,
      age_estimate: age,
      is_good_lead: score >= 40,
    };

    return NextResponse.json(result);

  } catch {
    // URL nicht erreichbar → schlechte Website = guter Lead
    return NextResponse.json({
      score:        80,
      notes:        ["Website nicht erreichbar oder sehr langsam — kritischer Nachteil"],
      builder:      null,
      has_ssl:      hasSSL,
      is_mobile:    false,
      age_estimate: "unbekannt",
      is_good_lead: true,
    } as WebsiteQuality);
  }
}
