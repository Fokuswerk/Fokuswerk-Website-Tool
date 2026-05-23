/**
 * lib/quality-score.ts
 * Berechnet einen objektiven Qualitätsscore für generierte Websites.
 * Kein API-Call — rein datenbasiert, deterministisch, schnell.
 */

import type { FaqItem, ProcessStep, ServiceItem, TeamMemberItem } from "./types";

interface ScoreInput {
  // Content
  hero_headline?: string;
  hero_subheadline?: string;
  about_text?: string;
  meta_title?: string;
  meta_description?: string;
  services_detailed?: ServiceItem[];
  faq_items?: FaqItem[];
  process_steps?: ProcessStep[];
  team_members?: TeamMemberItem[];
  local_seo_text?: string;
  // Scraped data quality
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  logo_url?: string | null;
  opening_hours?: string | null;
  rating?: string | null;
  trust_signals?: string[] | null;
  has_real_scraped_services?: boolean;
  // Context
  city?: string;
  company_name?: string;
  template?: string;
}

interface QualityResult {
  score: number;          // 0–100
  warnings: string[];     // Probleme die behoben werden sollten
  info: string[];         // positive Hinweise
  breakdown: Record<string, number>; // Punkte pro Kriterium (für Debugging)
}

// ─── Fallback-Service-Titel (diese deuten auf generic Fallback hin) ──────────
const GENERIC_SERVICE_TITLES = new Set([
  "Beratung & Konzept",
  "Professionelle Umsetzung",
  "Betreuung & Support",
  "Qualitätssicherung",
  "Flexible Lösungen",
  "Langfristige Partnerschaft",
  "Beratung & Planung",
  "Fachgerechte Ausführung",
  "Wartung & Instandhaltung",
  "Notfallservice",
  "Modernisierung & Sanierung",
  "Abnahme & Dokumentation",
]);

const GENERIC_HERO_PATTERNS = [
  /ihr experte vor ort/i,
  /kompetent und zuverlässig/i,
  /qualität hat einen namen/i,
  /wir sind für sie da/i,
  /herzlich willkommen/i,
  /professionell und erfahren/i,
];

export function calculateQualityScore(input: ScoreInput): QualityResult {
  const warnings: string[] = [];
  const info: string[] = [];
  const breakdown: Record<string, number> = {};

  let total = 0;
  const MAX = 100;

  // ── 1. Services (30 Punkte) ────────────────────────────────────────────────
  const services = input.services_detailed || [];
  const serviceCount = services.length;
  const realServices = services.filter(s => !GENERIC_SERVICE_TITLES.has(s.title));
  const servicesWithDesc = services.filter(s => s.description && s.description.length > 40);

  // Anzahl (max 15 Punkte)
  const serviceCountPts = Math.min(serviceCount * 3, 15);
  breakdown["services_count"] = serviceCountPts;
  total += serviceCountPts;

  if (serviceCount === 0) {
    warnings.push("Keine Leistungen erkannt — bitte manuell ergänzen.");
  } else if (serviceCount < 3) {
    warnings.push(`Nur ${serviceCount} Leistung(en) erkannt — mindestens 3 empfohlen.`);
  } else {
    info.push(`${serviceCount} Leistungen erkannt.`);
  }

  // Echtheit (max 10 Punkte)
  const realPts = input.has_real_scraped_services ? 10 : realServices.length > 0 ? 5 : 0;
  breakdown["services_real"] = realPts;
  total += realPts;

  if (!input.has_real_scraped_services && realServices.length === 0) {
    warnings.push("Leistungen wurden aus Branchenvorlage ergänzt — bitte auf Richtigkeit prüfen.");
  }

  // Beschreibungsqualität (max 5 Punkte)
  const descPts = servicesWithDesc.length >= 3 ? 5 : servicesWithDesc.length * 1;
  breakdown["services_descriptions"] = descPts;
  total += descPts;

  // ── 2. Kontaktdaten (20 Punkte) ───────────────────────────────────────────
  const phonePts = input.phone ? 8 : 0;
  const emailPts = input.email ? 5 : 0;
  const addressPts = input.address ? 7 : 0;

  breakdown["contact_phone"] = phonePts;
  breakdown["contact_email"] = emailPts;
  breakdown["contact_address"] = addressPts;
  total += phonePts + emailPts + addressPts;

  if (!input.phone && !input.email) {
    warnings.push("Keine Kontaktdaten (Telefon/E-Mail) gefunden — kritisch für Conversion.");
  } else if (!input.phone) {
    warnings.push("Telefonnummer nicht erkannt.");
  }
  if (!input.address) {
    warnings.push("Adresse nicht erkannt — wichtig für lokale SEO.");
  }

  // ── 3. Hero & Headline-Qualität (15 Punkte) ───────────────────────────────
  const headline = input.hero_headline || "";
  const isGeneric = GENERIC_HERO_PATTERNS.some(p => p.test(headline));
  const hasCity = input.city && headline.toLowerCase().includes(input.city.toLowerCase());
  const hasName = input.company_name && headline.toLowerCase().includes(
    input.company_name.toLowerCase().split(" ")[0].toLowerCase()
  );
  const hasSubline = (input.hero_subheadline || "").length > 20;

  const heroPts = isGeneric ? 0
    : headline.length < 5 ? 0
    : (hasCity || hasName) ? 10
    : headline.length > 10 ? 6 : 3;

  breakdown["hero_headline"] = heroPts;
  breakdown["hero_subheadline"] = hasSubline ? 5 : 0;
  total += heroPts + (hasSubline ? 5 : 0);

  if (isGeneric) {
    warnings.push("Hero-Headline klingt generisch — sollte spezifischer sein.");
  } else if (!hasCity && !hasName && headline.length > 5) {
    warnings.push("Hero-Headline enthält weder Ort noch Unternehmensname.");
  }

  // ── 4. SEO-Felder (10 Punkte) ─────────────────────────────────────────────
  const metaTitlePts = input.meta_title && input.meta_title.length >= 40 ? 5 : input.meta_title ? 2 : 0;
  const metaDescPts  = input.meta_description && input.meta_description.length >= 100 ? 5 : input.meta_description ? 2 : 0;

  breakdown["meta_title"] = metaTitlePts;
  breakdown["meta_description"] = metaDescPts;
  total += metaTitlePts + metaDescPts;

  if (!input.meta_title) warnings.push("Meta Title fehlt — wichtig für SEO.");
  if (!input.meta_description) warnings.push("Meta Description fehlt — wichtig für SEO.");

  // ── 5. Reichhaltige Content-Sektionen (15 Punkte) ─────────────────────────
  const aboutPts   = (input.about_text || "").length > 100 ? 4 : 0;
  const faqPts     = (input.faq_items || []).length >= 3 ? 5 : (input.faq_items || []).length * 1;
  const processPts = (input.process_steps || []).length >= 3 ? 4 : 0;
  const seoTextPts = (input.local_seo_text || "").length > 50 ? 2 : 0;

  breakdown["about_text"] = aboutPts;
  breakdown["faq_items"] = faqPts;
  breakdown["process_steps"] = processPts;
  breakdown["local_seo_text"] = seoTextPts;
  total += aboutPts + faqPts + processPts + seoTextPts;

  if (!input.faq_items?.length) {
    warnings.push("Kein FAQ-Bereich — hilft bei SEO und Vertrauen.");
  }
  if (!input.process_steps?.length) {
    warnings.push("Kein Ablauf-Bereich — wichtig für Vertrauen und Conversion.");
  }
  if (!input.about_text) {
    warnings.push("Kein Über-uns-Text generiert.");
  }

  // ── 6. Vertrauen & Extras (10 Punkte) ─────────────────────────────────────
  const logoPts    = input.logo_url ? 3 : 0;
  const hoursPts   = input.opening_hours ? 3 : 0;
  const ratingPts  = input.rating ? 2 : 0;
  const teamPts    = (input.team_members || []).length > 0 ? 2 : 0;

  breakdown["logo"] = logoPts;
  breakdown["opening_hours"] = hoursPts;
  breakdown["rating"] = ratingPts;
  breakdown["team"] = teamPts;
  total += logoPts + hoursPts + ratingPts + teamPts;

  if (!input.logo_url) {
    warnings.push("Logo nicht erkannt — wird durch Fallback ersetzt.");
  } else {
    info.push("Logo erkannt.");
  }
  if (input.opening_hours) {
    info.push("Öffnungszeiten erkannt.");
  }
  if (input.rating) {
    info.push(`Bewertung erkannt: ${input.rating}`);
  }

  // ── Normalisierung & positive Rückmeldungen ───────────────────────────────
  const score = Math.min(Math.round(total), MAX);

  if (score >= 80) info.push("Sehr gute Datenbasis — Website sollte hochwertig wirken.");
  else if (score >= 60) info.push("Gute Datenbasis — einige Felder könnten noch verbessert werden.");
  else if (score < 40) warnings.push("Datenbasis dünn — Website wird generisch wirken. Bitte manuell prüfen.");

  return { score, warnings, info, breakdown };
}

// ─── Score-Farbe für UI ───────────────────────────────────────────────────────

export function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-500";
}

export function scoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}
