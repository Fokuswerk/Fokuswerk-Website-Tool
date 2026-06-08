import { NextRequest, NextResponse } from "next/server";

export interface PriceEstimate {
  min: number;
  max: number;
  recommended: number;
  reasoning: string;
  confidence: "hoch" | "mittel" | "niedrig";
  selling_argument: string;  // konkretes Argument für den Anruf
}

// Basis-Preise nach Branche (in EUR, einmalig)
const INDUSTRY_BASE: Record<string, { min: number; max: number; label: string }> = {
  zahnarzt:   { min: 1800, max: 4500, label: "Zahnarztpraxis" },
  arzt:       { min: 1500, max: 3500, label: "Arztpraxis" },
  zahnarztpraxis: { min: 1800, max: 4500, label: "Zahnarztpraxis" },
  arztpraxis: { min: 1500, max: 3500, label: "Arztpraxis" },
  physiotherapie: { min: 1200, max: 2800, label: "Physiotherapie" },
  klinik:     { min: 2500, max: 6000, label: "Klinik" },
  sanitär:    { min: 900,  max: 2200, label: "Sanitär/Heizung" },
  heizung:    { min: 900,  max: 2200, label: "Heizung" },
  handwerk:   { min: 800,  max: 2000, label: "Handwerk" },
  elektriker: { min: 800,  max: 1800, label: "Elektriker" },
  maler:      { min: 700,  max: 1600, label: "Maler" },
  dachdecker: { min: 800,  max: 1800, label: "Dachdecker" },
  fahrschule: { min: 900,  max: 2200, label: "Fahrschule" },
  restaurant: { min: 1200, max: 3000, label: "Restaurant" },
  friseur:    { min: 800,  max: 1800, label: "Friseur" },
  kosmetik:   { min: 800,  max: 1800, label: "Kosmetik" },
  fitnessstudio: { min: 1500, max: 3500, label: "Fitnessstudio" },
  immobilien: { min: 2000, max: 5000, label: "Immobilien" },
  anwalt:     { min: 2000, max: 5000, label: "Rechtsanwalt" },
  steuerberater: { min: 1800, max: 4000, label: "Steuerberater" },
  kfz:        { min: 900,  max: 2200, label: "KFZ-Werkstatt" },
  autohaus:   { min: 2000, max: 5000, label: "Autohaus" },
  tierarzt:   { min: 1200, max: 2800, label: "Tierarzt" },
  default:    { min: 800,  max: 2000, label: "Dienstleistung" },
};

function getIndustryBase(industry: string): { min: number; max: number; label: string } {
  const q = (industry || "").toLowerCase();
  for (const [key, val] of Object.entries(INDUSTRY_BASE)) {
    if (key !== "default" && q.includes(key)) return val;
  }
  return INDUSTRY_BASE.default;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    company_name?: string;
    industry?: string;
    city?: string;
    google_rating?: number | null;
    google_rating_count?: number | null;
    website_score?: number | null;   // 0-100: höher = schlechtere aktuelle Website
    website_builder?: string | null;
    dna?: {
      unique_differentiators?: string[];
      competitive_position?: string;
    } | null;
  };

  const base = getIndustryBase(body.industry ?? "");
  let min = base.min;
  let max = base.max;
  const reasons: string[] = [];

  // ── Bewertungsanzahl → Unternehmensgröße ───────────────────────────────────
  const count = body.google_rating_count ?? 0;
  if (count > 200) {
    min = Math.round(min * 1.4);
    max = Math.round(max * 1.5);
    reasons.push(`${count} Google-Bewertungen → etabliertes Unternehmen mit stabilem Kundenstamm`);
  } else if (count > 80) {
    min = Math.round(min * 1.2);
    max = Math.round(max * 1.3);
    reasons.push(`${count} Google-Bewertungen → aktives Unternehmen mit guter Reichweite`);
  } else if (count > 30) {
    reasons.push(`${count} Google-Bewertungen → solides lokales Unternehmen`);
  } else if (count > 0) {
    min = Math.round(min * 0.85);
    max = Math.round(max * 0.9);
    reasons.push(`Nur ${count} Google-Bewertungen → eher kleines Unternehmen`);
  }

  // ── Google-Rating → Qualitätssignal ────────────────────────────────────────
  const rating = body.google_rating ?? 0;
  if (rating >= 4.5) {
    max = Math.round(max * 1.15);
    reasons.push(`${rating}★ Bewertung → qualitätsbewusstes Unternehmen, investiert in Image`);
  } else if (rating < 4.0 && rating > 0) {
    min = Math.round(min * 0.85);
    reasons.push(`${rating}★ Bewertung → eher preissensitiv`);
  }

  // ── Website-Qualität → Dringlichkeit ───────────────────────────────────────
  const wsScore = body.website_score ?? 0;
  if (wsScore >= 60) {
    min = Math.round(min * 1.1);
    reasons.push("Sehr schlechte aktuelle Website → hoher Handlungsdruck");
  }
  if (body.website_builder) {
    reasons.push(`Nutzt ${body.website_builder} → weiß wie unbefriedigend Baukasten-Sites sind`);
  }

  // ── Stadtgröße ─────────────────────────────────────────────────────────────
  const city = (body.city ?? "").toLowerCase();
  const bigCity = /münchen|berlin|hamburg|köln|frankfurt|stuttgart|düsseldorf|dortmund|essen|bremen/i.test(city);
  const mediumCity = /hannover|nürnberg|leipzig|dresden|bochum|wuppertal|bielefeld|bonn|mannheim|karlsruhe/i.test(city);
  if (bigCity) {
    min = Math.round(min * 1.2);
    max = Math.round(max * 1.3);
    reasons.push(`Großstadt (${body.city}) → höheres Preisniveau`);
  } else if (mediumCity) {
    min = Math.round(min * 1.1);
    max = Math.round(max * 1.15);
  }

  const recommended = Math.round((min + max) / 2 / 50) * 50; // auf 50€ runden

  // ── Verkaufs-Argument ──────────────────────────────────────────────────────
  let selling_argument = `Für ${body.company_name ?? "dieses Unternehmen"} empfehlen wir einen Einstiegspreis von ${recommended}€. `;

  if (wsScore >= 60) {
    selling_argument += `Die aktuelle Website verliert Kunden — eine neue zahlt sich durch 2-3 Neukunden im Monat aus.`;
  } else if (body.website_builder) {
    selling_argument += `${body.website_builder}-Seiten ranken bei Google schlecht — mit einer professionellen Site gewinnen sie mehr Anfragen.`;
  } else if (rating >= 4.5) {
    selling_argument += `Mit ${rating}★ haben sie ein exzellentes Produkt — das verdient eine Website die das zeigt.`;
  } else {
    selling_argument += `Eine neue Website amortisiert sich bereits im ersten Monat durch mehr Sichtbarkeit.`;
  }

  const confidence: PriceEstimate["confidence"] =
    (count > 30 && rating > 0) ? "hoch" : count > 0 ? "mittel" : "niedrig";

  const reasoning = [
    `${base.label}: ${base.min}–${base.max}€ Basis`,
    ...reasons,
  ].join(" · ");

  return NextResponse.json({
    min,
    max,
    recommended,
    reasoning,
    confidence,
    selling_argument,
  } as PriceEstimate);
}
