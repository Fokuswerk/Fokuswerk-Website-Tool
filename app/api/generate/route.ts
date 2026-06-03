import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calculateQualityScore } from "@/lib/quality-score";
import type { ServiceItem, BenefitItem, StatItem, TestimonialItem, TeamMemberItem, FaqItem, ProcessStep } from "@/lib/types";

export const maxDuration = 300; // Vercel Pro: bis zu 300s erlaubt

// ─── Robuster JSON-Parser ────────────────────────────────────────────────────

function parseJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try { return JSON.parse(cleaned); }
  catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try { return JSON.parse(match[0]); } catch { return {}; }
  }
}

// ─── Fallback-Services nach Branche ─────────────────────────────────────────

function getFallbackServices(industry: string): ServiceItem[] {
  const q = (industry || "").toLowerCase();
  if (q.match(/zahnarzt|dental/)) return [
    { title: "Prophylaxe & Zahnreinigung", description: "Professionelle Zahnreinigung für langfristig gesunde Zähne." },
    { title: "Zahnfüllungen & Restaurationen", description: "Hochwertige Füllungen aus Komposit oder Keramik." },
    { title: "Zahnersatz & Prothetik", description: "Individuell angefertigter Zahnersatz für ein natürliches Lächeln." },
    { title: "Implantologie", description: "Dauerhafte Zahnlückenfüllung durch Implantate." },
    { title: "Kinderzahnheilkunde", description: "Einfühlsame Zahnbehandlung für Kinder." },
  ];
  if (q.match(/arzt|praxis|hausarzt|allgemein/)) return [
    { title: "Allgemeinmedizin", description: "Umfassende hausärztliche Versorgung für alle Altersgruppen." },
    { title: "Vorsorgeuntersuchungen", description: "Check-Up-Programme und Früherkennungsuntersuchungen." },
    { title: "Impfberatung & Impfungen", description: "Aktueller Impfschutz nach STIKO-Empfehlung." },
    { title: "Chronische Erkrankungen", description: "Langfristige Betreuung bei Diabetes, Bluthochdruck und mehr." },
    { title: "Labordiagnostik", description: "Blutuntersuchungen für eine präzise Diagnose." },
  ];
  if (q.match(/handwerk|bau|sanitär|elektro|maler/)) return [
    { title: "Beratung & Planung", description: "Persönliche Beratung und professionelle Projektplanung." },
    { title: "Fachgerechte Ausführung", description: "Alle Arbeiten durch qualifizierte Fachkräfte." },
    { title: "Wartung & Instandhaltung", description: "Regelmäßige Wartung für dauerhaften Betrieb." },
    { title: "Notfallservice", description: "Schnelle Hilfe bei dringenden Problemen." },
    { title: "Sanierung & Modernisierung", description: "Energieeffiziente Sanierungen nach aktuellen Standards." },
  ];
  return [
    { title: "Erstberatung", description: "Persönliche Beratung — individuell und unverbindlich." },
    { title: "Professionelle Umsetzung", description: "Fachgerechte Durchführung durch erfahrene Spezialisten." },
    { title: "Nachbetreuung", description: "Kompetenter Support als verlässlicher Partner." },
  ];
}

// ─── Haupt-Prompt — Agentur-Niveau ──────────────────────────────────────────

interface GoogleReviewInput { author_name: string; rating: number; text: string; relative_time_description?: string; }

function buildPrompt(input: {
  company_name: string;
  industry: string;
  location: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  about_text?: string;
  scraped_hero?: string;
  services: string[];
  service_pairs: Array<{ title: string; description: string }>;
  trust_signals: string[];
  opening_hours?: string;
  rating?: string;
  team_members: Array<{ name: string; title: string }>;
  faq_scraped: Array<{ question: string; answer: string }>;
  is_medical: boolean;
  has_real_team: boolean;
  google_reviews?: GoogleReviewInput[] | null;
  google_rating?: number | null;
  google_rating_count?: number | null;
}): string {

  // ── Vorfilter: nur echte Leistungen durchlassen ──────────────────────────────
  // Enthält — diese Begriffe IRGENDWO im Titel → kein Service
  const SERVICE_CONTAINS_BLACKLIST = /\b(zfa|mfa|auszubildende?|azubi|stellenangebot|praktikum|bewerbung|ausbildungsplatz|zahnmedizinische fachangestellte?|medizinische fachangestellte?)\b/i;

  // Beginnt mit — diese Präfixe → kein Service
  const SERVICE_BLACKLIST = /^(benefits?|vorteile|warum wir|unser team|team|zfa|mfa|aufnahmebogen|neupatient|anmeldung|empfang|rezeption|willkommen|herzlich willkommen|wir freuen|ihr besuch|praxisrundgang|galerie|aktuelles|news|blog|karriere|jobs|stellenangebot|wir suchen|bewerbung|auszubildende|ausbildung|ausbildungsplatz|azubi|praktikum|kontakt|öffnungszeiten|sprechzeiten|anfahrt|impressum|datenschutz|cookie|downloads?|formulare?|links?|über uns|über mich|praxisteam|das team|testimonial|bewertungen|kundenstimmen|patientenstimmen|hygiene|corona|covid|presse|referenzen|auszeichnung|awards?|unsere praxis|die praxis|praxisphilosophie|unsere werte|vision|mission|philosophie|leitbild|informationen|hinweise|ergebnisse|statistik|statistiken|zahlen|views|reichweite|impressionen|konten|follower)/i;

  const validServices = input.services.filter(s =>
    s && s.length > 2
    && !SERVICE_BLACKLIST.test(s.trim())
    && !SERVICE_CONTAINS_BLACKLIST.test(s.trim())
  );
  const validPairs = input.service_pairs.filter(p =>
    p.title
    && !SERVICE_BLACKLIST.test(p.title.trim())
    && !SERVICE_CONTAINS_BLACKLIST.test(p.title.trim())
  );

  // ── Kontextblöcke aufbauen ───────────────────────────────────────────────────
  const dataLines: string[] = [
    `Unternehmen: ${input.company_name}`,
    `Branche: ${input.industry}`,
  ];
  if (input.location)      dataLines.push(`Standort: ${input.location}`);
  if (input.phone)         dataLines.push(`Telefon: ${input.phone}`);
  if (input.email)         dataLines.push(`E-Mail: ${input.email}`);
  if (input.address)       dataLines.push(`Adresse: ${input.address}`);
  if (input.scraped_hero)   dataLines.push(`Haupt-Headline der alten Website: "${input.scraped_hero}"`);
  if (input.description)   dataLines.push(`Selbstbeschreibung/Meta: ${input.description.slice(0, 400)}`);
  if (input.about_text)    dataLines.push(`Über-uns-Text (Originalton): ${input.about_text.slice(0, 600)}`);
  if (input.opening_hours) dataLines.push(`Öffnungszeiten: ${input.opening_hours}`);
  if (input.rating)        dataLines.push(`Bewertung: ${input.rating}`);
  if (input.trust_signals.length) dataLines.push(`Vertrauenssignale: ${input.trust_signals.join(" | ")}`);

  const serviceBlock = validServices.length > 0
    ? `\n\nROHDATEN — Überschriften von der echten Website (ungefiltert, du entscheidest als Profi was davon eine echte Leistung ist):\n${validServices.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}`
    : "";

  const pairBlock = validPairs.length > 0
    ? `\n\nLeistungsdetails von der Website (als Inspiration nutzen, NICHT blind kopieren):\n${validPairs.slice(0, 8).map(p => `  • ${p.title}: ${p.description.slice(0, 200)}`).join("\n")}`
    : "";

  const teamBlock = input.has_real_team
    ? `\n\nTeammitglieder: ${input.team_members.map(m => m.name + (m.title ? ` (${m.title})` : "")).join(", ")}`
    : "";

  const faqBlock = input.faq_scraped.length > 0
    ? `\n\nEchte Fragen von der Website: ${input.faq_scraped.slice(0, 4).map(f => f.question).join(" | ")}`
    : "";

  const isMedical      = input.is_medical;
  const patientOrKunde = isMedical ? "Patienten" : "Kunden";
  const testimonialRole = isMedical ? "Patient seit X Jahren" : "Kunde";
  const teamJsonField  = input.is_medical
    ? `,\n  "team_members": [{"name": "string", "title": "string", "bio": "string (1 authentischer Satz)"}]`
    : "";

  const ort = input.location || "der Region";

  return `Du bist ein Senior Brand-Stratege, UX-Direktor, CRO-Spezialist und Cheftexter auf Agentur-Niveau. Vergleichbar mit einer 15.000€+ Website-Produktion bei einer deutschen Top-Agentur.

Aufgabe: Erstelle vollständige, tiefe Website-Inhalte — so individuell, spezifisch und hochwertig, als hätte ein Team von Spezialisten wochenlang nur für dieses eine Unternehmen gearbeitet.

Qualitätsniveau: Jeder Satz muss so klingen, als wäre er exklusiv für DIESES Unternehmen an DIESEM Ort geschrieben. Kein Satz darf für ein anderes Unternehmen passen.

══════════════════════════════════════════════════
PHASE 1 — TIEFE UNTERNEHMENSANALYSE
══════════════════════════════════════════════════
Führe zuerst intern eine vollständige Analyse durch:

IDENTITÄT: Was ist das Wesen dieses Unternehmens? Nicht was es tut — sondern wofür es steht.
ZIELGRUPPE: Wer sind die ${patientOrKunde}? Was bewegt sie? Was hindert sie, jetzt anzurufen?
EMOTION: Welche Emotion kaufen ${patientOrKunde} wirklich? (Sicherheit? Vertrauen? Stolz? Erleichterung?)
DIFFERENZIERUNG: Was kann kein anderer in ${ort} so gut? Auch wenn es nicht explizit steht — leite es intelligent ab.
TONALITÄT: Welche Stimme passt perfekt? Wähle exakt eine: Warm & einfühlsam / Modern & souverän / Premium & exklusiv / Lokal & persönlich / Technisch & präzise
EINWÄNDE: Welche Bedenken haben ${patientOrKunde}? Wie entkräftet die Website jeden einzelnen?
CONVERSION: Was ist der stärkste Grund, JETZT Kontakt aufzunehmen statt morgen?

UNTERNEHMENSDATEN:
${dataLines.join("\n")}${serviceBlock}${pairBlock}${teamBlock}${faqBlock}
${(() => {
  const reviews = input.google_reviews;
  if (!reviews || reviews.length === 0) return "";
  const ratingLine = input.google_rating
    ? `Google: ${input.google_rating}★ aus ${input.google_rating_count ?? "?"} Bewertungen`
    : "";
  const reviewLines = reviews
    .map(r => `  ${r.rating}★ "${r.text.slice(0, 280).replace(/\n+/g, " ")}" — ${r.author_name}`)
    .join("\n");
  return `
══════════════════════════════════════════════════
ECHTE GOOGLE-REZENSIONEN — Was Kunden wirklich sagen
══════════════════════════════════════════════════
${ratingLine}

${reviewLines}

Analysiere diese Rezensionen sorgfältig:
① Was loben Kunden konkret? → Diese Stärken in Benefits, About-Text und Services direkt aufgreifen
② Welche Sprache verwenden echte Kunden? (z.B. "entspannt", "kein Stress", "super erklärt") → Genau diese Worte und diesen Tonfall im Text verwenden
③ Was schätzen sie am Erlebnis? → Daraus den emotionalen Kern der Website ableiten
④ Gibt es wiederkehrende Themen? → Das stärkste davon als hero_detail oder about_highlight verwenden
WICHTIG: Diese Rezensionen sind Gold — sie zeigen exakt was Neukunden überzeugt. Nutze sie, nicht erfinde sie.`;
})()}

══════════════════════════════════════════════════
STIMM-ANALYSE — Wie spricht dieses Unternehmen?
══════════════════════════════════════════════════
Bevor du schreibst, analysiere die Sprache dieses Unternehmens anhand der Rohdaten oben:

① TONALITÄT: Schreibt das Unternehmen eher formal (Sie, sachlich, distanziert) oder persönlich (Du/ihr, locker, nahbar)? Schreibe genauso — nur besser.
② SCHLÜSSELWÖRTER: Welche Begriffe verwendet das Unternehmen selbst immer wieder? Diese Worte gehören ihnen — übernimm sie bewusst.
③ VERSPRECHEN: Welche impliziten oder expliziten Versprechen machen sie? Z.B. "keine Wartezeiten", "modernste Technik", "für die ganze Familie". Diese Positionierung ausbauen, nicht erfinden.
④ IDENTITÄT: Was unterscheidet dieses Unternehmen von seinen Mitbewerbern in ${ort}? Auch wenn es nicht explizit steht — leite es aus dem Gesamtbild ab.
${(input.scraped_hero || input.description) ? `
Die bisherige Headline lautet: "${input.scraped_hero || input.description?.slice(0, 100)}"
→ Schreibe eine BESSERE Version davon — stärker, lokaler, überzeugender. Nicht ersetzen sondern verbessern.` : ""}

══════════════════════════════════════════════════
PHASE 2 — LEISTUNGEN: PROFESSIONELLES URTEIL GEFRAGT
══════════════════════════════════════════════════
Eine Leistung ist etwas, wofür ein ${patientOrKunde === "Patienten" ? "Patient" : "Kunde"} einen Termin bucht oder direkt bezahlt.

Teste jeden Eintrag aus den Rohdaten: "Kann man das buchen / behandeln lassen / kaufen?"
→ JA  → echte Leistung, in die Website aufnehmen
→ NEIN → strukturelles Element der alten Website, ignorieren

Beispiele für KEINE Leistungen (erkennst du als Profi sofort):
• Stellenanzeigen & Ausbildung: "ZFA gesucht", "Auszubildende zur ZFA", "Ausbildungsplatz", "Azubi", "Wir bilden aus"
• Navigation & Struktur: "Kontakt", "Anfahrt", "Öffnungszeiten", "Impressum", "Downloads"
• Über das Team: "Unser Team", "Praxisteam", "Über uns", "Über mich", "Philosophie"
• Marketing-Floskeln: "Willkommen", "Herzlich Willkommen", "Wir freuen uns auf Ihren Besuch"
• Formulare & Verwaltung: "Aufnahmebogen", "Neupatient", "Anmeldung", "Empfang"

Du brauchst keine vollständige Verbotsliste — du erkennst als Profi sofort was buchbar ist und was nicht.

${validServices.length > 0
    ? `→ Prüfe die ${validServices.length} Rohdaten-Einträge oben und wähle nur die echten Leistungen aus. Ergänze mit branchenspezifischen Fachleistungen falls nötig. Ziel: 6-10 konkrete, buchbare Leistungen.`
    : `→ Leite 6-10 konkrete, buchbare Leistungen aus "${input.industry}" ab. Präzise Fachbegriffe verwenden.`}

══════════════════════════════════════════════════
PHASE 3 — TEXTEN AUF HÖCHSTEM NIVEAU
══════════════════════════════════════════════════

DER UNIQUENESS-TEST — für JEDEN Satz den du schreibst:
Frage dich: "Könnte dieser Satz auch auf der Website von [beliebigem anderen ${input.industry} in Deutschland] stehen?"
→ JA  → zu generisch. Neu schreiben mit spezifischem Bezug zu ${input.company_name}, ${ort} oder der echten Story.
→ NEIN → gut, weiter.

VERBOTEN — diese Formulierungen sind gesperrt:
✗ "zuverlässiger Partner" / "Ihr Partner für" / "kompetentes Team" / "höchste Qualität"
✗ "maßgeschneidert" / "individuell" / "professionell" (ohne konkreten Beleg)
✗ "Wir freuen uns auf Ihren Besuch" / "Herzlich Willkommen"
✗ Erfundene Statistiken oder Zahlen → stats = [] wenn nicht aus Rohdaten bekannt
✗ Testimonials ohne konkrete Situation: "Sehr zufrieden, immer wieder gerne" → wertlos
✗ Karriere/Jobs in cta_section_headline oder cta_section_text

GEFORDERT — was jede Sektion leisten muss:
✓ hero_headline: Eine Aussage die SCHOCKIERT oder ÜBERRASCHT — nicht beschreibt. Ort "${ort}" natürlich integriert. Max. 7 Wörter.
✓ hero_subheadline: Der stärkste Grund JETZT anzurufen. Konkret, keine Versprechen.
✓ Services: 4-5 Sätze pro Leistung. Satz 1: Was ist es konkret? Satz 2: Wie fühlt es sich an? Satz 3: Was ändert sich für den ${patientOrKunde === "Patienten" ? "Patienten" : "Kunden"} danach? Satz 4: Was macht es hier besonders?
✓ Benefits: Echte Differenzierer, keine Selbstverständlichkeiten. "Pünktlichkeit" ist keine Differenzierung. "Abendtermine bis 20 Uhr" schon.
✓ About: Eine GESCHICHTE — wann, warum, wie. Was das Unternehmen antreibt. Was sie anders machen als alle anderen.
✓ Testimonials: Konkrete Situation schildern. Name + Kontext. "Nach 3 Jahren Angst vor dem Zahnarzt..." nicht "Sehr nettes Team."
✓ FAQ: Die Fragen die jeder stellt aber niemand offen beantwortet. Ehrlich, ausführlich.

SEO (exakt einhalten):
• meta_title: exakt 52-58 Zeichen | z.B. "Zahnarzt ${ort} | ${input.company_name}"
• meta_description: exakt 145-155 Zeichen | konkreter Nutzen + Handlungsaufforderung
• hero_headline: "${ort}" integriert, max. 7 Wörter, überraschend ehrlich

══════════════════════════════════════════════════
PHASE 4 — SELBST-REVIEW (bevor du JSON ausgibst)
══════════════════════════════════════════════════
Prüfe jeden Satz deines Outputs gegen diese Fragen:
✗ Steht irgendwo "zuverlässiger Partner", "höchste Qualität", "maßgeschneidert", "kompetentes Team"? → streichen, neu formulieren
✗ Könnte dieser Satz genauso gut für einen Konkurrenten in ${ort} stehen? → zu generisch, spezifischer werden
✗ Ist der Ort "${ort}" in hero_headline und mindestens einmal in meta_title enthalten? → falls nicht, ergänzen
✗ Sind die Testimonials wirklich spezifisch? (Konkrete Situation, echte Details) → sonst überarbeiten
✗ Klingt der about_text wie eine echte Geschichte? (Nicht "Wir sind seit X Jahren tätig...") → sonst neu
✗ Steht in cta_section_headline oder cta_section_text irgendwas über Jobs, Karriere oder Stellen? → sofort streichen und durch Patienten-/Kunden-CTA ersetzen
${input.google_reviews && input.google_reviews.length > 0
  ? "✗ Habe ich die Sprache und Stärken aus den echten Google-Rezensionen aufgegriffen? → falls nicht, mindestens 2-3 authentische Formulierungen einbauen"
  : ""}

Erst nach dieser Prüfung das JSON ausgeben.

Antworte AUSSCHLIESSLICH mit einem einzigen validen JSON-Objekt. Kein erklärender Text davor oder danach.

{
  "brand_positioning": "string (1 präziser Satz: Was macht ${input.company_name} einzigartig — konkret, nicht generisch)",
  "brand_tone": "string (eine der 5 Tonalitäten: warm-einfühlsam | modern-souverän | premium-exklusiv | lokal-persönlich | technisch-präzise)",
  "meta_title": "string (exakt 52-58 Zeichen)",
  "meta_description": "string (exakt 145-155 Zeichen, endet mit Handlungsaufforderung)",
  "hero_badge": "string (konkretes Vertrauenssignal, z.B. 'Seit 1998 in ${ort}' oder Bewertungshinweis)",
  "hero_headline": "string (max. 7 Wörter, ${ort} integriert, ehrlich und konkret)",
  "hero_subheadline": "string (max. 25 Wörter, stärkster Nutzen für ${patientOrKunde})",
  "hero_detail": "string (1-2 Sätze ergänzende Information direkt unter dem Hero — was sie im ersten Gespräch erwartet)",
  "cta_text": "string (primärer CTA — handlungsauslösend, branchenspezifisch)",
  "cta_secondary": "string (sekundärer CTA — sanfter, für Zögernde)",
  "services": [
    {
      "title": "string (exakter Leistungsname)",
      "description": "string (4-5 Sätze: Was ist es? Was passiert konkret? Welchen Nutzen hat der ${patientOrKunde === "Patienten" ? "Patient" : "Kunde"}? Was unterscheidet diese Leistung hier?)",
      "highlight": "string (1 Satz: der wichtigste Vorteil dieser Leistung)"
    }
  ],
  "benefits": [
    {"title": "string (3-5 Wörter, echter Differenzierer)", "description": "string (2-3 Sätze, konkret und glaubwürdig — keine Selbstverständlichkeiten)"}
  ],
  "stats": [{"value": "string", "label": "string"}],
  "about_headline": "string (individuell, weckt Neugier, kein Standard)",
  "about_text": "string (5-6 Sätze: Geschichte/Hintergrund, was antreibt, was man anders macht, warum ${ort}, was man dem ${patientOrKunde === "Patienten" ? "Patienten" : "Kunden"} verspricht)",
  "about_highlight": "string (max. 15 Wörter: stärkstes Zitat oder Versprechen für die Hervorhebung)",
  "about_points": [
    "string (konkretes Merkmal — 1 Satz)",
    "string",
    "string",
    "string"
  ],
  "trust_badge": "string (kurzes, starkes Vertrauenssignal)",
  "process_steps": [
    {"step": 1, "title": "string", "description": "string (2-3 Sätze: was genau passiert, wann, wie schnell)"},
    {"step": 2, "title": "string", "description": "string (2-3 Sätze)"},
    {"step": 3, "title": "string", "description": "string (2-3 Sätze)"},
    {"step": 4, "title": "string", "description": "string (2-3 Sätze: was danach kommt, Follow-up, Ergebnis)"}
  ],
  "faq_items": [
    {"question": "string (echte ${patientOrKunde}frage die wirklich gestellt wird)", "answer": "string (3-4 ehrliche, informative Sätze)"},
    {"question": "string", "answer": "string (3-4 Sätze)"},
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"}
  ],
  "local_seo_text": "string (3-4 Sätze: ${ort}-Bezug, natürliche lokale Keywords, Community-Verbundenheit)",
  "cta_section_headline": "string (überzeugend, motiviert ${patientOrKunde} zum Anruf/Termin — KEIN Karriere-/Jobinhalt, ausschließlich für ${patientOrKunde} die buchen/anfragen wollen)",
  "cta_section_text": "string (2-3 Sätze, letzter emotionaler Push für ${patientOrKunde} — was passiert wenn man jetzt anruft/bucht — NIEMALS 'Wir suchen Mitarbeiter' oder Stellenangebote)",
  "testimonials": [
    {"name": "string (echter Vorname + Nachnamenskürzel, z.B. 'Maria S.')", "role": "string (z.B. '${testimonialRole}')", "text": "string (3-4 Sätze: spezifisch, konkrete Details, klingt wie ein echter Mensch)"},
    {"name": "string", "role": "string", "text": "string (3-4 Sätze)"},
    {"name": "string", "role": "string", "text": "string"},
    {"name": "string", "role": "string", "text": "string"},
    {"name": "string", "role": "string", "text": "string"}
  ]${teamJsonField}
}`;
}

// ─── Haupthandler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY nicht konfiguriert. Bitte in Vercel Environment Variables eintragen." },
        { status: 500 }
      );
    }

    const body = await req.json() as Record<string, unknown>;
    const company_name   = body.company_name as string | undefined;
    const industry       = (body.industry as string) || "Dienstleistung";
    const description    = body.description as string | undefined;
    const old_website_url = body.old_website_url as string | undefined;
    const scraped_headings   = body.scraped_headings as string[] | undefined;
    const scraped_hero       = body.scraped_hero as string | undefined;
    const scraped_subheadings = body.scraped_subheadings as string[] | undefined;
    const scraped_services   = body.scraped_services as string[] | undefined;
    const service_pairs      = body.service_pairs as Array<{ title: string; description: string }> | undefined;
    const service_descriptions = body.service_descriptions as string[] | undefined;
    const about_text     = body.about_text as string | undefined;
    const scraped_team   = body.team_members as Array<{ name: string; title: string }> | undefined;
    const opening_hours  = body.opening_hours as string | undefined;
    const rating         = body.rating as string | undefined;
    const trust_signals  = body.trust_signals as string[] | undefined;
    const insurance_info = body.insurance_info as string | undefined;
    const area_served    = body.area_served as string | undefined;
    const founding_year  = body.founding_year as string | undefined;
    const faq_items_scraped = body.faq_items as Array<{ question: string; answer: string }> | undefined;
    const company_summary = body.company_summary as string | undefined;
    const manual_location = body.manual_location as string | undefined;
    const manual_phone   = body.manual_phone as string | undefined;
    const manual_notes   = body.manual_notes as string | undefined;
    const template       = (body.template as string) || "premium";
    const phone          = body.phone as string | undefined;
    const email          = body.email as string | undefined;
    const address        = body.address as string | undefined;
    const logo_url       = body.logo_url as string | undefined;
    const google_reviews      = body.google_reviews as GoogleReviewInput[] | null | undefined;
    const google_rating       = body.google_rating as number | null | undefined;
    const google_rating_count = body.google_rating_count as number | null | undefined;

    if (!company_name) {
      return NextResponse.json({ error: "Unternehmensname fehlt" }, { status: 400 });
    }

    const hasWebsite = !!old_website_url;
    // Medizin aus Branche erkennen — nicht aus Template-Name
    const isMedical = /zahn|dental|arzt|praxis|klinik|physio|therapeut|orthopäd|psycho|psychiatr|derm|kardio|augenarzt|hno|chirurg|hausarzt|frauenarzt/i.test(industry);

    const confirmedServices: string[] =
      Array.isArray(scraped_services) && scraped_services.length > 0 ? scraped_services
      : Array.isArray(scraped_subheadings) && scraped_subheadings.length > 0 ? scraped_subheadings
      : [];

    const confirmedPairs = Array.isArray(service_pairs) && service_pairs.length > 0
      ? service_pairs : [];

    const hasRealTeam = Array.isArray(scraped_team) && scraped_team.length > 0;

    const location = address || (hasWebsite ? "" : manual_location || "") || area_served || "";

    // ── Anthropic API Call ──────────────────────────────────────────────────
    const client = new Anthropic({ apiKey });

    const prompt = buildPrompt({
      company_name,
      industry,
      location,
      phone:         phone || (!hasWebsite ? manual_phone : undefined),
      email,
      address,
      description,
      about_text,
      scraped_hero,
      services:      confirmedServices,
      service_pairs: confirmedPairs,
      trust_signals: trust_signals || [],
      opening_hours,
      rating,
      team_members:  scraped_team || [],
      faq_scraped:   faq_items_scraped || [],
      is_medical:    isMedical,
      has_real_team: hasRealTeam,
      google_reviews:      google_reviews      || null,
      google_rating:       google_rating       ?? null,
      google_rating_count: google_rating_count ?? null,
    });

    // Streaming-Aufruf — hält Vercel-Verbindung am Leben während Opus generiert
    const stream = await client.messages.stream({
      model: "claude-opus-4-5",
      max_tokens: 12000,
      system: "Du bist ein Senior Brand-Stratege und Cheftexter einer deutschen Premium-Webagentur. Du schreibst ausschließlich auf Deutsch. Du lieferst ausschließlich valides JSON — kein erklärender Text, keine Markdown-Blöcke, kein Kommentar. Nur das JSON-Objekt selbst.",
      messages: [{ role: "user", content: prompt }],
    });

    const finalMsg = await stream.finalMessage();
    const data = parseJSON(
      finalMsg.content[0]?.type === "text" ? finalMsg.content[0].text : "{}"
    );

    // ── Output normalisieren ────────────────────────────────────────────────

    const auto_filled: string[] = [];
    const hasRealScrapedServices = confirmedServices.length > 0;

    // Dritte Sicherheitsebene: filtert den AI-Output — Titel die KEINE echten Leistungen sind
    const NON_SERVICE_STARTS = /^(anmeldung|empfang|über uns|warum|unser ansatz|praxisphilosophie|unsere werte|patientenorientierung|ihr lächeln|willkommen|kontakt|team|öffnungszeiten|termin|philosophie|vision|mission|vorteile|benefits|warum wir|news|aktuelles|karriere|jobs|ausbildung|auszubildende|azubi|praktikum|stellenangebot|bewerbung|ausbildungsplatz|zfa|mfa)/i;
    const NON_SERVICE_CONTAINS = /\b(zfa|mfa|auszubildende?|azubi|stellenangebot|praktikum|bewerbung|ausbildungsplatz|zahnmedizinische fachangestellte?)\b/i;

    let services_detailed: ServiceItem[] = Array.isArray(data.services)
      ? (data.services as unknown[])
          .map(s => typeof s === "string" ? { title: s, description: "" } : s as ServiceItem)
          .filter(s =>
            s.title
            && s.title.length > 2
            && !NON_SERVICE_STARTS.test(s.title.trim())
            && !NON_SERVICE_CONTAINS.test(s.title.trim())
          )
      : [];

    if (services_detailed.length < 3) {
      const fallbacks = getFallbackServices(industry);
      services_detailed = [...services_detailed, ...fallbacks.slice(0, 5 - services_detailed.length)];
      auto_filled.push("Leistungen aus Branchenvorlage ergänzt");
    }

    services_detailed = services_detailed.map(s => ({
      title:       s.title || "Leistung",
      description: s.description || "Professionelle Leistung mit höchsten Qualitätsstandards.",
      ...(s.highlight ? { highlight: s.highlight } : {}),
    }));

    let benefits_detailed: BenefitItem[] = Array.isArray(data.benefits)
      ? (data.benefits as unknown[]).map(b =>
          typeof b === "string" ? { title: b, description: "" } : b as BenefitItem
        )
      : [];

    if (benefits_detailed.length < 3) {
      const generic: BenefitItem[] = [
        { title: "Persönliche Beratung", description: "Individuell auf Ihre Situation zugeschnitten." },
        { title: "Klare Kommunikation", description: "Transparente Prozesse und direkte Ansprechpartner." },
        { title: "Verlässlichkeit", description: "Termine werden eingehalten, Zusagen gehalten." },
      ];
      while (benefits_detailed.length < 3) {
        benefits_detailed.push(generic[benefits_detailed.length] ?? generic[0]);
      }
    }

    const rawStats = Array.isArray(data.stats) ? data.stats as StatItem[] : [];
    const stats = rawStats.filter(s => s.value && s.label && s.value !== "string").slice(0, 4);

    // FAQ: bis zu 8 — prefer AI output, fallback zu scraped
    const faq_items: FaqItem[] = Array.isArray(data.faq_items)
      ? (data.faq_items as FaqItem[]).filter(f => f.question && f.answer).slice(0, 8)
      : Array.isArray(faq_items_scraped) ? faq_items_scraped.slice(0, 6) : [];

    // Prozess: bis zu 4 Schritte
    const process_steps: ProcessStep[] = Array.isArray(data.process_steps)
      ? (data.process_steps as ProcessStep[]).filter(s => s.title && s.description).slice(0, 4)
      : [];

    const team_members = isMedical && Array.isArray(data.team_members)
      ? (data.team_members as TeamMemberItem[]).filter(m => m.name?.trim())
      : null;

    // Testimonials: bis zu 5
    const testimonials = Array.isArray(data.testimonials) && (data.testimonials as TestimonialItem[]).length >= 3
      ? (data.testimonials as TestimonialItem[]).slice(0, 5)
      : null;

    // Neue reiche Felder
    const about_points = Array.isArray(data.about_points) ? (data.about_points as string[]).filter(Boolean).slice(0, 4) : [];
    const brand_tone   = (data.brand_tone as string) || undefined;
    const hero_detail  = (data.hero_detail as string) || undefined;

    // ── CTA-Karriere-Filter: verhindert Job-/Stellenanzeigen im CTA-Band ────
    const KARRIERE_PATTERN = /\b(karriere|stellenangebot|stellen|bewerben|bewerbung|wir suchen|fachkräfte|mitarbeiter\s*gesucht|mfa|zfa|auszubildende|azubi|ärztehelfer|praxishelfer|ausbildungsplatz|jetzt bewerben|teil unseres teams)\b/i;
    const ctaHeadlineRaw = (data.cta_section_headline as string) || "";
    const ctaTextRaw     = (data.cta_section_text as string)     || "";
    const cta_section_headline = KARRIERE_PATTERN.test(ctaHeadlineRaw) ? undefined : (ctaHeadlineRaw || undefined);
    const cta_section_text     = KARRIERE_PATTERN.test(ctaTextRaw)     ? undefined : (ctaTextRaw     || undefined);

    // ── Quality Score ───────────────────────────────────────────────────────

    const qualityResult = calculateQualityScore({
      hero_headline:    (data.hero_headline as string) || "",
      hero_subheadline: (data.hero_subheadline as string) || "",
      about_text:       (data.about_text as string) || "",
      meta_title:       (data.meta_title as string) || "",
      meta_description: (data.meta_description as string) || "",
      services_detailed,
      faq_items,
      process_steps,
      team_members:     team_members || [],
      local_seo_text:   (data.local_seo_text as string) || "",
      phone:            phone || null,
      email:            email || null,
      address:          address || null,
      logo_url:         logo_url || null,
      opening_hours:    opening_hours || null,
      rating:           rating || null,
      trust_signals:    trust_signals || null,
      has_real_scraped_services: hasRealScrapedServices,
      city:             location,
      company_name,
      template,
    });

    return NextResponse.json({
      meta_title:       (data.meta_title as string)       || `${company_name} — ${industry}`,
      meta_description: (data.meta_description as string) || `${company_name}: Professionelle ${industry}-Leistungen. Jetzt anfragen!`,
      hero_headline:    (data.hero_headline as string)    || company_name,
      hero_subheadline: (data.hero_subheadline as string) || `Professionelle ${industry} — persönlich und zuverlässig.`,
      cta_text:         (data.cta_text as string)         || (isMedical ? "Termin vereinbaren" : "Jetzt anfragen"),
      about_text:       (data.about_text as string)       || `${company_name} steht für Qualität und persönliche Beratung.`,
      services:         services_detailed.map(s => s.title),
      benefits:         benefits_detailed.map(b => b.title),
      testimonials,
      auto_filled,

      ai_content: {
        brand_positioning:    data.brand_positioning,
        brand_tone,
        hero_badge:           data.hero_badge,
        hero_detail,
        cta_secondary:        data.cta_secondary,
        services_detailed,
        benefits_detailed,
        stats:                stats.length > 0 ? stats : undefined,
        about_headline:       (data.about_headline as string) || `Über ${company_name}`,
        about_highlight:      data.about_highlight,
        about_points:         about_points.length > 0 ? about_points : undefined,
        trust_badge:          data.trust_badge,
        cta_section_headline: cta_section_headline,
        cta_section_text:     cta_section_text,
        faq_items:            faq_items.length > 0 ? faq_items : undefined,
        process_steps:        process_steps.length > 0 ? process_steps : undefined,
        local_seo_text:       data.local_seo_text as string | undefined,
        og_title:             data.og_title as string | undefined,
        og_description:       data.og_description as string | undefined,
        ...(team_members && team_members.length > 0 ? { team_members } : {}),
        quality_score:    qualityResult.score,
        quality_warnings: qualityResult.warnings,
        quality_info:     qualityResult.info,
        data_sources: {
          services:      hasRealScrapedServices ? "scraped" : "derived",
          trust_signals: (trust_signals?.length ?? 0) > 0 ? "scraped" : "fallback",
          team:          hasRealTeam ? "scraped" : "fallback",
          opening_hours: opening_hours ? "scraped" : "fallback",
        },
      },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Generate error]:", msg);
    return NextResponse.json(
      { error: `Generierung fehlgeschlagen: ${msg.slice(0, 120)}` },
      { status: 500 }
    );
  }
}
