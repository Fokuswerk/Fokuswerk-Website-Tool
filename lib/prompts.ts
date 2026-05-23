/**
 * lib/prompts.ts
 * Zentrale Prompt-Bibliothek — alle Anthropic-Prompts als typisierte Funktionen.
 * Keine freien Fließtext-Antworten. Alle Outputs werden als JSON validiert.
 */

// ─── Input-Typen ──────────────────────────────────────────────────────────────

export interface ScrapedInput {
  company_name: string;
  industry?: string;
  description?: string;
  hero_text?: string;
  headings?: string[];
  scraped_services?: string[];
  service_pairs?: Array<{ title: string; description: string }>;
  service_descriptions?: string[];
  about_text?: string;
  team_members?: Array<{ name: string; title: string }>;
  opening_hours?: string;
  rating?: string;
  trust_signals?: string[];
  insurance_info?: string;
  founding_year?: string;
  faq_items?: Array<{ question: string; answer: string }>;
  area_served?: string;
  phone?: string;
  email?: string;
  address?: string;
  company_summary?: string;
  manual_location?: string;
  manual_phone?: string;
  manual_notes?: string;
  template?: string;
}

export interface BusinessBriefing {
  company_name: string;
  city: string;
  region: string;
  industry: string;
  usp: string;
  tone: string;
  audience_type: "B2C" | "B2B" | "mixed";
  target_audience: string;
  pain_points: string[];
  motivations: string[];
  confirmed_services: Array<{ title: string; source: "scraped" | "derived" }>;
  trust_signals_real: string[];
  safe_claims: string[];
  do_not_claim: string[];
  primary_seo_keyword: string;
  secondary_seo_keywords: string[];
  primary_cta: string;
  cta_urgency: string;
  tone_examples: string[];
  content_notes: string[];
}

// ─── Phase 1: Business-Briefing ───────────────────────────────────────────────
//  Extrahiert strukturiertes Unternehmenswissen aus Rohdaten.
//  Output: BusinessBriefing JSON — wird als Fundament für alle weiteren Phasen genutzt.

export function buildBriefingPrompt(input: ScrapedInput): string {
  const lines: string[] = [];

  lines.push(`Unternehmensname: ${input.company_name}`);
  if (input.industry)       lines.push(`Branche: ${input.industry}`);
  if (input.address || input.manual_location)
    lines.push(`Standort: ${input.address || input.manual_location}`);
  if (input.phone || input.manual_phone)
    lines.push(`Telefon: ${input.phone || input.manual_phone}`);
  if (input.email)          lines.push(`E-Mail: ${input.email}`);
  if (input.description)    lines.push(`Meta-Beschreibung: ${input.description}`);
  if (input.hero_text)      lines.push(`Hero-Text auf der Website: "${input.hero_text}"`);
  if (input.about_text)     lines.push(`Über-uns-Text: ${input.about_text.slice(0, 400)}`);
  if (input.company_summary) lines.push(`Website-Analyse: ${input.company_summary.slice(0, 600)}`);
  if (input.founding_year)  lines.push(`Gegründet: ${input.founding_year}`);
  if (input.opening_hours)  lines.push(`Öffnungszeiten: ${input.opening_hours}`);
  if (input.rating)         lines.push(`Bewertung: ${input.rating}`);
  if (input.insurance_info) lines.push(`Kasseninfo: ${input.insurance_info}`);
  if (input.area_served)    lines.push(`Einzugsgebiet: ${input.area_served}`);

  if (input.scraped_services?.length) {
    lines.push(`Leistungen von der Website (direkt extrahiert):\n${input.scraped_services.map((s, i) => `  ${i+1}. ${s}`).join("\n")}`);
  }
  if (input.service_pairs?.length) {
    lines.push(`Leistungen mit Beschreibung:\n${input.service_pairs.slice(0, 6).map(p => `  • ${p.title}: ${p.description.slice(0, 120)}`).join("\n")}`);
  }
  if (input.trust_signals?.length) {
    lines.push(`Vertrauenssignale von der Website: ${input.trust_signals.join(" | ")}`);
  }
  if (input.team_members?.length) {
    lines.push(`Team: ${input.team_members.map(m => m.name + (m.title ? ` (${m.title})` : "")).join(", ")}`);
  }
  if (input.faq_items?.length) {
    lines.push(`FAQ auf der Website: ${input.faq_items.slice(0, 3).map(f => f.question).join(" | ")}`);
  }
  if (input.manual_notes) lines.push(`Notizen: ${input.manual_notes}`);

  return `Du bist ein erfahrener Business-Analyst. Erstelle ein präzises Unternehmensbriefing aus den folgenden Rohdaten.

ROHDATEN:
${lines.join("\n")}

KRITISCHE REGELN:
1. Unterscheide IMMER zwischen gesicherten Fakten (von der Website) und abgeleiteten Annahmen
2. Erfinde NIEMALS: Jahreszahlen, Kundenzahlen, Zertifikate, Auszeichnungen, Preise
3. Wenn Gründungsjahr unbekannt: "founded_unknown" → safe_claim: "Langjährige Erfahrung"
4. Wenn Kundenzahl unbekannt: NICHT in confirmed_services, in do_not_claim: "X Kunden"
5. trust_signals_real: nur was explizit auf der Website steht
6. safe_claims: neutrale Aussagen die IMMER stimmen (keine Zahlen)
7. do_not_claim: alles was erfunden wäre — liste es explizit auf
8. Wenn keine Stadt erkennbar: city = "" (leer, nicht raten)

Antworte NUR mit validem JSON — keine Erklärungen, kein Markdown:

{
  "company_name": "string",
  "city": "string (Ort aus Adresse/Domain — leer wenn unbekannt)",
  "region": "string (Bundesland/Region — leer wenn unbekannt)",
  "industry": "string (konkret, z.B. 'Zahnarztpraxis' nicht 'Gesundheit')",
  "usp": "string (1 Satz, was dieses Unternehmen konkret besser macht — nicht generisch)",
  "tone": "string (z.B. 'warmherzig und professionell' oder 'direkt und bodenständig')",
  "audience_type": "B2C",
  "target_audience": "string (konkrete Beschreibung der Zielgruppe)",
  "pain_points": ["string", "string", "string"],
  "motivations": ["string", "string", "string"],
  "confirmed_services": [
    {"title": "string", "source": "scraped"}
  ],
  "trust_signals_real": ["string (nur echte, belegte Fakten)"],
  "safe_claims": ["string (neutrale Formulierungen ohne Zahlen)"],
  "do_not_claim": ["string (was NICHT behauptet werden darf)"],
  "primary_seo_keyword": "string (Leistung + Ort, z.B. 'Zahnarzt Oldenburg')",
  "secondary_seo_keywords": ["string", "string", "string"],
  "primary_cta": "string (passend zur Branche, z.B. 'Termin vereinbaren')",
  "cta_urgency": "string (1 Satz Dringlichkeit ohne Lügen)",
  "tone_examples": ["string (konkretes Beispiel wie ein Satz klingen soll)", "string"],
  "content_notes": ["string (wichtige Hinweise für die Texterstellung)"]
}`;
}

// ─── Phase 2: Website-Texte generieren ───────────────────────────────────────
//  Nutzt das Briefing als autoritativen Kontext.
//  Anti-Halluzination durch explizite do_not_claim-Regeln.

export function buildCopyPrompt(
  briefing: BusinessBriefing,
  confirmedServices: string[],
  servicePairs: Array<{ title: string; description: string }>,
  templateHint: string,
  hasRealTeam: boolean,
  isMedical: boolean,
): string {

  const serviceBlock = confirmedServices.length > 0
    ? `\n⚠️ DIESE LEISTUNGEN SIND PFLICHT (von der echten Website extrahiert — alle müssen im services-Array):\n${confirmedServices.map((s, i) => `  ${i+1}. ${s}`).join("\n")}\n`
    : "";

  const servicePairBlock = servicePairs.length > 0
    ? `\nORIGINALTEXT zu den Leistungen (nutze diese Infos für die Beschreibungen):\n${servicePairs.slice(0, 8).map(p => `  • ${p.title}: ${p.description.slice(0, 150)}`).join("\n")}\n`
    : "";

  const doNotClaimBlock = briefing.do_not_claim.length > 0
    ? `\n🚫 NIEMALS BEHAUPTEN (nicht durch Daten belegt):\n${briefing.do_not_claim.map(d => `  ✗ "${d}"`).join("\n")}\n`
    : "";

  const safeClaimsBlock = briefing.safe_claims.length > 0
    ? `\n✅ STATTDESSEN VERWENDEN (neutrale, immer wahre Aussagen):\n${briefing.safe_claims.map(s => `  ✓ "${s}"`).join("\n")}\n`
    : "";

  const teamBlock = isMedical
    ? `14. team_members: ${hasRealTeam
        ? "Nutze die echten Teammitglieder aus dem Briefing. Schreibe 1 authentische Bio-Satz pro Person."
        : "Leeres Array [] — keine Namen erfinden!"}`
    : "";

  const teamJsonField = isMedical ? `,
  "team_members": [{"name": "string", "title": "string", "bio": "string (1 Satz)"}]` : "";

  const faqExample = isMedical
    ? `[{"question": "Nehmen Sie auch Kassenpatienten an?", "answer": "..."}, ...]`
    : `[{"question": "Wie lange dauert ein Auftrag?", "answer": "..."}, ...]`;

  return `Du bist Deutschlands bester Conversion Copywriter und Local-SEO-Experte.

══════════ VERBINDLICHES UNTERNEHMENSBRIEFING ══════════
Unternehmen: ${briefing.company_name}
Branche: ${briefing.industry}
Ort: ${briefing.city}${briefing.region ? `, ${briefing.region}` : ""}
USP: ${briefing.usp}
Tonalität: ${briefing.tone}
Zielgruppe: ${briefing.target_audience}
Pain Points der Zielgruppe: ${briefing.pain_points.join(" | ")}
Motivationen: ${briefing.motivations.join(" | ")}
Primäres SEO-Keyword: ${briefing.primary_seo_keyword}
Sekundäre Keywords: ${briefing.secondary_seo_keywords.join(", ")}
CTA: ${briefing.primary_cta}
Dringlichkeit: ${briefing.cta_urgency}
Echte Trust-Signale: ${briefing.trust_signals_real.join(", ") || "keine gesicherten"}
Ton-Beispiele: ${briefing.tone_examples.join(" | ")}
Hinweise: ${briefing.content_notes.join(" | ")}
${doNotClaimBlock}${safeClaimsBlock}${serviceBlock}${servicePairBlock}
Template: ${templateHint}
══════════════════════════════════════════════════

STRIKTE REGELN:
1. ALLE Texte individuell auf dieses Unternehmen zugeschnitten — KEIN generisches Marketing
2. Standort "${briefing.city}" überall natürlich einbauen (Hero, Meta, About, FAQ)
3. Hero-Headline: max. 6 Wörter, konkret mit Branche/Ort — NICHT "Ihr Experte vor Ort"
4. Meta Title: 50-60 Zeichen mit Stadt + Hauptkeyword
5. Meta Description: 140-155 Zeichen — konkreter Nutzen + CTA
6. Services: ${confirmedServices.length > 0 ? `EXAKT ${confirmedServices.length} (die oben gelisteten Pflicht-Leistungen!)` : "5-6"} mit je 2-3 echten Sätzen
7. FAQ: 4-6 Fragen die ECHTE Zielgruppen-Fragen sind (nicht generisch)
8. Prozessschritte: 3-4 konkrete Schritte wie der Ablauf bei diesem Unternehmen ist
9. Stats: ${briefing.trust_signals_real.length > 0 ? "Nur echte Zahlen aus den Trust-Signalen" : "KEINE erfundenen Zahlen — nutze die safe_claims statt Stats-Block"}
10. Testimonials: 3 glaubwürdige Stimmen — konkreter Kontext, kein Werbesprech
11. local_seo_text: 2-3 Sätze natürlich mit Ort und Branche für SEO
12. Klingt es wie dieser Betrieb oder wie jeder andere? → Individuell schreiben!
13. About-Text: 3-4 Sätze — warum dieses Unternehmen, was macht es besonders
${teamBlock}

Antworte NUR mit validem JSON (kein Markdown, keine Erklärungen):

{
  "meta_title": "string (50-60 Zeichen, mit Ort)",
  "meta_description": "string (140-155 Zeichen)",
  "og_title": "string (60-70 Zeichen)",
  "og_description": "string (120-140 Zeichen)",
  "hero_badge": "string (kurzes Vertrauenssignal — nur wenn echt)",
  "hero_headline": "string (max. 6 Wörter, konkret)",
  "hero_subheadline": "string (max. 18 Wörter, Nutzen + Ort)",
  "cta_text": "string (2-4 Wörter)",
  "cta_secondary": "string",
  "services": [
    {"title": "string", "description": "string (2-3 vollständige echte Sätze)"}
  ],
  "benefits": [
    {"title": "string (3-4 Wörter)", "description": "string (1-2 Sätze)"}
  ],
  "stats": [
    {"value": "string (NUR echte Werte oder weglassen)", "label": "string"}
  ],
  "about_headline": "string",
  "about_text": "string (3-4 Sätze, individuell, mit Ort)",
  "about_highlight": "string (max. 12 Wörter)",
  "trust_badge": "string",
  "process_steps": [
    {"step": 1, "title": "string", "description": "string (1-2 Sätze)"},
    {"step": 2, "title": "string", "description": "string"},
    {"step": 3, "title": "string", "description": "string"}
  ],
  "faq_items": [
    {"question": "string (echte Zielgruppen-Frage)", "answer": "string (konkret, 2-3 Sätze)"}
  ],
  "local_seo_text": "string (2-3 Sätze mit Ort + Branche + Keyword)",
  "cta_section_headline": "string (5-8 Wörter)",
  "cta_section_text": "string (1-2 Sätze)",
  "testimonials": [
    {"name": "string (z.B. Klaus R.)", "role": "string (max. 5 Wörter, konkreter Kontext)", "text": "string (2-3 authentische Sätze)"},
    {"name": "string", "role": "string", "text": "string"},
    {"name": "string", "role": "string", "text": "string"}
  ]${teamJsonField},
  "data_sources": {
    "services": "scraped",
    "trust_signals": "scraped | derived",
    "stats": "scraped | omitted"
  }
}

Beispiel FAQ für diese Branche: ${faqExample}`;
}

// ─── Phase 3: Qualitäts-Review (pro Agent) ────────────────────────────────────

export type ReviewAgentType = "seo" | "customer" | "consultant" | "cro";

export function buildReviewPrompt(
  type: ReviewAgentType,
  briefing: BusinessBriefing,
  contentSnapshot: string,
): string {
  const context = `Unternehmen: ${briefing.company_name} | Branche: ${briefing.industry} | Ort: ${briefing.city} | Zielgruppe: ${briefing.target_audience}`;

  const prompts: Record<ReviewAgentType, string> = {
    seo: `Du bist Local-SEO-Experte für den deutschen Markt.
${context}

AKTUELLER CONTENT:
${contentSnapshot}

PRÜFE:
- Ort "${briefing.city}" in Hero, Meta Title, Meta Description, About, Local SEO Text?
- Primary Keyword "${briefing.primary_seo_keyword}" natürlich integriert?
- Meta Title 50-60 Zeichen mit Ort + Keyword + Marke?
- Meta Description 140-155 Zeichen mit konkretem Nutzen + CTA?
- Hero Headline konkret (Branche + Ort) oder zu generisch?
- local_seo_text vorhanden und mit echten Keywords?
- H1-Hierarchie logisch?

Antworte NUR mit JSON der verbesserten Felder (gleiche Keys, nur was wirklich besser ist):`,

    customer: `Du bist ein potenzieller ${briefing.target_audience} der gerade "${briefing.primary_seo_keyword}" googelt — kritisch, skeptisch, wenig Zeit.
${context}

AKTUELLER CONTENT:
${contentSnapshot}

PRÜFE (aus Kundensicht):
- Ist mir in 3 Sekunden klar was dieses Unternehmen für mich tut?
- Vertraue ich ihnen sofort? Warum / warum nicht?
- Ist der CTA verlockend oder austauschbar?
- Klingt es nach echten Menschen oder generiertem Text?
- Was würde mich abhalten zu klicken?
- Pain Points: ${briefing.pain_points.join(", ")} — werden diese adressiert?

Antworte NUR mit JSON der verbesserten Felder:`,

    consultant: `Du bist Senior-Unternehmensberater mit Fokus auf Positionierung.
${context}
USP: ${briefing.usp}

AKTUELLER CONTENT:
${contentSnapshot}

PRÜFE:
- Ist der USP "${briefing.usp}" klar erkennbar?
- Differenzierung: Warum dieses Unternehmen und nicht den Wettbewerb?
- Benefits: Wirklich differenzierend oder austauschbar?
- About Text: Klingt es nach einem echten Unternehmen mit Charakter?
- Hero Badge/Trust Badge: Glaubwürdig und spezifisch?

Antworte NUR mit JSON der verbesserten Felder:`,

    cro: `Du bist Conversion Rate Optimization Experte.
${context}
CTA: ${briefing.primary_cta} | Dringlichkeit: ${briefing.cta_urgency}

AKTUELLER CONTENT:
${contentSnapshot}

PRÜFE:
- Hero Headline: Trifft sie das stärkste Kaufmotiv?
- Subheadline: Verstärkt sie oder wiederholt sie?
- CTA-Text: Spezifisch, nutzenorientiert, ohne Risiko?
- Prozessschritte: Nehmen sie die Angst vor dem ersten Kontakt?
- FAQ: Beantworten sie echte Einwände der Zielgruppe?
- Testimonials: Konkret mit Ergebnis oder nur leeres Lob?
- CTA-Section: Ist der finale Call-to-Action unwiderstehlich?

Antworte NUR mit JSON der verbesserten Felder:`,
  };

  return prompts[type];
}

// ─── Phase 4: Revisions-Agent ─────────────────────────────────────────────────

export function buildRevisionPrompt(
  briefing: BusinessBriefing,
  original: Record<string, unknown>,
  feedback: {
    seo: Record<string, unknown>;
    customer: Record<string, unknown>;
    consultant: Record<string, unknown>;
    cro: Record<string, unknown>;
  },
  confirmedServices: string[],
): string {
  const serviceConstraint = confirmedServices.length > 0
    ? `\n⚠️ UNVERÄNDERLICH: services-Array MUSS diese ${confirmedServices.length} Leistungen enthalten:\n${confirmedServices.map((s, i) => `  ${i+1}. ${s}`).join("\n")}\nNur Beschreibungen dürfen verbessert werden — Titel sind gesperrt!\n`
    : "";

  return `Du bist Chef-Redakteur. Entscheide welche Expertenfeedbacks den Content wirklich verbessern.

VERBINDLICHES BRIEFING (darf nicht verletzt werden):
- Unternehmen: ${briefing.company_name} in ${briefing.city}
- Branche: ${briefing.industry}
- Ton: ${briefing.tone}
- DO NOT CLAIM: ${briefing.do_not_claim.join(", ") || "keine Einschränkungen"}
- SAFE CLAIMS: ${briefing.safe_claims.join(", ")}
${serviceConstraint}
ORIGINAL CONTENT:
${JSON.stringify(original, null, 2)}

FEEDBACK VON 4 EXPERTEN:
[SEO-Experte]: ${JSON.stringify(feedback.seo, null, 2)}
[Potenzieller Kunde]: ${JSON.stringify(feedback.customer, null, 2)}
[Unternehmensberater]: ${JSON.stringify(feedback.consultant, null, 2)}
[CRO-Experte]: ${JSON.stringify(feedback.cro, null, 2)}

ENTSCHEIDUNGSREGELN:
1. Übernimm Verbesserungen wenn ≥2 Experten ähnliches empfehlen ODER wenn klar stärker
2. Behalte Original wenn widersprüchlich oder schlechter
3. Briefing-Regeln (Ton, do_not_claim, safe_claims) schlagen IMMER Experten-Feedback
4. Alle Felder müssen im finalen Output sein (vollständiges JSON, gleiche Struktur)
5. Sprache: Deutsch, konkret, individuell für dieses Unternehmen — KEIN generisches Marketing

Antworte NUR mit dem vollständigen verbesserten JSON:`;
}
