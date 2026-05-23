import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { calculateQualityScore } from "@/lib/quality-score";
import type { ServiceItem, BenefitItem, StatItem, TestimonialItem, TeamMemberItem, FaqItem, ProcessStep } from "@/lib/types";

export const maxDuration = 60;

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

function buildPrompt(input: {
  company_name: string;
  industry: string;
  location: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  about_text?: string;
  services: string[];
  service_pairs: Array<{ title: string; description: string }>;
  trust_signals: string[];
  opening_hours?: string;
  rating?: string;
  team_members: Array<{ name: string; title: string }>;
  faq_scraped: Array<{ question: string; answer: string }>;
  is_medical: boolean;
  has_real_team: boolean;
}): string {

  // ── Vorfilter: nur echte Leistungen durchlassen ──────────────────────────────
  const SERVICE_BLACKLIST = /^(benefits?|vorteile|warum wir|unser team|team|zfa|mfa|aufnahmebogen|neupatient|anmeldung|empfang|rezeption|willkommen|herzlich willkommen|wir freuen|ihr besuch|praxisrundgang|galerie|aktuelles|news|blog|karriere|jobs|stellenangebot|wir suchen|bewerbung|kontakt|öffnungszeiten|sprechzeiten|anfahrt|impressum|datenschutz|cookie|downloads?|formulare?|links?|über uns|über mich|praxisteam|das team|testimonial|bewertungen|kundenstimmen|patientenstimmen|hygiene|corona|covid|presse|referenzen|auszeichnung|awards?|unsere praxis|die praxis|praxisphilosophie|unsere werte|vision|mission|philosophie|leitbild|informationen|hinweise|ergebnisse|statistik|statistiken|zahlen|views|reichweite|impressionen|konten|follower)/i;

  const validServices = input.services.filter(s => s && s.length > 2 && !SERVICE_BLACKLIST.test(s.trim()));
  const validPairs    = input.service_pairs.filter(p => p.title && !SERVICE_BLACKLIST.test(p.title.trim()));

  // ── Kontextblöcke aufbauen ───────────────────────────────────────────────────
  const dataLines: string[] = [
    `Unternehmen: ${input.company_name}`,
    `Branche: ${input.industry}`,
  ];
  if (input.location)      dataLines.push(`Standort: ${input.location}`);
  if (input.phone)         dataLines.push(`Telefon: ${input.phone}`);
  if (input.email)         dataLines.push(`E-Mail: ${input.email}`);
  if (input.address)       dataLines.push(`Adresse: ${input.address}`);
  if (input.description)   dataLines.push(`Bestehende Selbstbeschreibung: ${input.description.slice(0, 400)}`);
  if (input.about_text)    dataLines.push(`Über-uns-Text (Rohfassung): ${input.about_text.slice(0, 500)}`);
  if (input.opening_hours) dataLines.push(`Öffnungszeiten: ${input.opening_hours}`);
  if (input.rating)        dataLines.push(`Bewertung: ${input.rating}`);
  if (input.trust_signals.length) dataLines.push(`Vertrauenssignale: ${input.trust_signals.join(" | ")}`);

  const serviceBlock = validServices.length > 0
    ? `\n\nBESTÄTIGTE LEISTUNGEN von der echten Website (NUR diese — 1:1 Titel übernehmen, Beschreibungen texten):\n${validServices.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}`
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

  return `Du bist ein Senior Brand-Stratege, UX-Direktor, CRO-Spezialist und erfahrener Website-Texter auf Agentur-Niveau (vergleichbar mit einer 15.000€+ Website-Produktion).

Deine Aufgabe: Erstelle Website-Inhalte, die wirken, als wären sie wochenlang von einem Spezialisten-Team individuell für dieses Unternehmen entwickelt worden — nicht wie ein austauschbares Template.

══════════════════════════════════════════════════
SCHRITT 1 — UNTERNEHMENSANALYSE (intern durchführen)
══════════════════════════════════════════════════
Analysiere zuerst gründlich:
• Was verkauft dieses Unternehmen WIRKLICH? Welche konkreten Probleme löst es?
• Welche Emotion kauft der ${patientOrKunde}? (Sicherheit? Vertrauen? Gesundheit? Bequemlichkeit? Status?)
• Was unterscheidet dieses Unternehmen in ${ort} von der Konkurrenz?
• Welche Tonalität passt exakt? → wähle eine: Warm & einfühlsam / Modern & kompetent / Premium & exklusiv / Lokal & persönlich / Technisch & präzise
• Was ist der stärkste Conversion-Trigger für diese Zielgruppe?
• Welche Einwände haben ${patientOrKunde} — und wie kann die Website diese entkräften?

UNTERNEHMENSDATEN:
${dataLines.join("\n")}${serviceBlock}${pairBlock}${teamBlock}${faqBlock}

══════════════════════════════════════════════════
SCHRITT 2 — LEISTUNGEN: NUR ECHTE DIENSTLEISTUNGEN
══════════════════════════════════════════════════
Leistungen müssen: konkret, buchbar, branchenspezifisch, realistisch sein.

✅ ERLAUBT — echte, buchbare Leistungen:
  Zahnarzt: Prophylaxe, Implantologie, Bleaching, Zahnersatz, Invisalign, Kinderzahnheilkunde
  Handwerk: Sanitärinstallation, Badezimmersanierung, Heizungswartung, Rohrbau
  Allgemein: konkrete Behandlungen, Eingriffe, Installationen, Beratungen

❌ NIEMALS — das sind KEINE Leistungen:
  • Verwaltung: Aufnahmebogen, Anmeldung, Neupatient, Empfang, Rezeption
  • Personal: ZFA, MFA, Assistenz, Stellenangebot, Ausbildungsplatz
  • Allgemeines: Team, Benefits, Vorteile, Über uns, Praxisphilosophie, Warum wir
  • Navigation: Willkommen, Wir freuen uns, Ihr Besuch, Kontakt, Öffnungszeiten
  • Ergebnisse/Zahlen: Views, Reichweite, Follower, Statistiken, Bewertungen

${validServices.length > 0
    ? `→ PFLICHT: Verwende genau diese ${validServices.length} bestätigten Leistungen. Titel exakt so, nur Beschreibungen schreiben.`
    : `→ Leite 5-7 logische, konkrete Leistungen aus Branche "${input.industry}" ab. Keine abstrakten Begriffe.`}

══════════════════════════════════════════════════
SCHRITT 3 — AGENTUR-QUALITÄT BEIM TEXTEN
══════════════════════════════════════════════════
ABSOLUT VERBOTEN:
✗ Generische Floskeln: "Ihr zuverlässiger Partner", "höchste Qualität", "maßgeschneiderte Lösungen"
✗ Inhalte die für 100 andere Unternehmen genauso passen würden
✗ Zahlen/Stats die NICHT aus den Daten oben stammen → stats: [] (lieber leer als erfunden!)
✗ Testimonials die wie generierte KI-Texte klingen

PFLICHT — jedes Element muss individuell wirken:
✓ Hero-Headline: spezifisch für DIESES Unternehmen in ${ort} — max. 7 Wörter, kein Werbesprech
✓ About-Text: Was macht es einzigartig? Persönlichkeit, Geschichte, konkreter Mehrwert
✓ Services: Jede Beschreibung beantwortet "Was bringt mir das konkret?" — 2-3 präzise Sätze
✓ Benefits: Echte Differenzierungsmerkmale, nicht "persönliche Beratung" und "faire Preise"
✓ FAQ: Fragen die ${patientOrKunde} wirklich stellen — ehrliche, informative Antworten
✓ Testimonials: Spezifisch, mit konkreten Details, authentisch klingend — Rolle z.B. "${testimonialRole}"

SEO-ANFORDERUNGEN:
• meta_title: exakt 52-58 Zeichen | Keyword + Ort | z.B. "Zahnarzt ${ort} | Praxisname"
• meta_description: exakt 145-155 Zeichen | konkreter Nutzen + handlungsauslösender CTA
• Ort "${ort}" in Hero-Headline und Local-SEO-Text natürlich integrieren

Antworte AUSSCHLIESSLICH mit validem JSON (kein Text davor/danach):

{
  "brand_positioning": "string (1 Satz: Was macht dieses Unternehmen einzigartig?)",
  "meta_title": "string (52-58 Zeichen)",
  "meta_description": "string (145-155 Zeichen)",
  "hero_badge": "string (kurzes, konkretes Vertrauenssignal — z.B. 'Seit 1998 in ${ort}')",
  "hero_headline": "string (max. 7 Wörter, Ort integrieren wenn möglich)",
  "hero_subheadline": "string (max. 20 Wörter, konkreter Nutzen)",
  "cta_text": "string (handlungsauslösend, branchenspezifisch)",
  "cta_secondary": "string (sanfterer zweiter CTA)",
  "services": [{"title": "string", "description": "string (2-3 präzise Sätze, echter Nutzen)"}],
  "benefits": [{"title": "string (3-5 Wörter, konkret)", "description": "string (1-2 Sätze, differenzierend)"}],
  "stats": [{"value": "string", "label": "string"}],
  "about_headline": "string (individuell, nicht generisch)",
  "about_text": "string (3 Sätze: Was, Wie, Warum gerade hier)",
  "about_highlight": "string (max. 12 Wörter, stärkstes Alleinstellungsmerkmal)",
  "trust_badge": "string",
  "process_steps": [
    {"step": 1, "title": "string", "description": "string (konkret, was passiert wann)"},
    {"step": 2, "title": "string", "description": "string"},
    {"step": 3, "title": "string", "description": "string"}
  ],
  "faq_items": [
    {"question": "string (echte ${patientOrKunde}frage)", "answer": "string (ehrlich, informativ, 2-3 Sätze)"},
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"}
  ],
  "local_seo_text": "string (2-3 Sätze: lokal, natürliche Keywords, Vertrauen)",
  "cta_section_headline": "string (überzeugend, nicht generisch)",
  "cta_section_text": "string (1-2 Sätze, letzter Push zur Handlung)",
  "testimonials": [
    {"name": "string", "role": "string", "text": "string (spezifisch, authentisch, 2-3 Sätze)"},
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
      services:      confirmedServices,
      service_pairs: confirmedPairs,
      trust_signals: trust_signals || [],
      opening_hours,
      rating,
      team_members:  scraped_team || [],
      faq_scraped:   faq_items_scraped || [],
      is_medical:    isMedical,
      has_real_team: hasRealTeam,
    });

    const msg = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const data = parseJSON(
      msg.content[0].type === "text" ? msg.content[0].text : "{}"
    );

    // ── Output normalisieren ────────────────────────────────────────────────

    const auto_filled: string[] = [];
    const hasRealScrapedServices = confirmedServices.length > 0;

    // Blacklist: Titel die KEINE echten Leistungen sind
    const NON_SERVICE_PATTERNS = /^(anmeldung|empfang|über uns|warum|unser ansatz|praxisphilosophie|unsere werte|patientenorientierung|ihr lächeln|willkommen|kontakt|team|öffnungszeiten|termin|philosophie|vision|mission)/i;

    let services_detailed: ServiceItem[] = Array.isArray(data.services)
      ? (data.services as unknown[])
          .map(s => typeof s === "string" ? { title: s, description: "" } : s as ServiceItem)
          .filter(s => s.title && s.title.length > 2 && !NON_SERVICE_PATTERNS.test(s.title.trim()))
      : [];

    // Wenn scraped services vorhanden waren aber AI hat sie ignoriert → erzwingen
    if (confirmedServices.length > 0 && services_detailed.length < confirmedServices.length) {
      const existingTitles = new Set(services_detailed.map(s => s.title.toLowerCase()));
      for (const title of confirmedServices) {
        if (!existingTitles.has(title.toLowerCase())) {
          services_detailed.push({ title, description: "Professionelle Behandlung mit modernen Methoden und höchsten Qualitätsstandards." });
        }
      }
    }

    if (services_detailed.length < 3) {
      const fallbacks = getFallbackServices(industry);
      services_detailed = [...services_detailed, ...fallbacks.slice(0, 5 - services_detailed.length)];
      auto_filled.push("Leistungen aus Branchenvorlage ergänzt");
    }

    services_detailed = services_detailed.map(s => ({
      title:       s.title || "Leistung",
      description: s.description || "Professionelle Leistung mit höchsten Qualitätsstandards.",
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

    const faq_items: FaqItem[] = Array.isArray(data.faq_items)
      ? (data.faq_items as FaqItem[]).filter(f => f.question && f.answer).slice(0, 6)
      : Array.isArray(faq_items_scraped) ? faq_items_scraped.slice(0, 4) : [];

    const process_steps: ProcessStep[] = Array.isArray(data.process_steps)
      ? (data.process_steps as ProcessStep[]).filter(s => s.title && s.description).slice(0, 4)
      : [];

    const team_members = isMedical && Array.isArray(data.team_members)
      ? (data.team_members as TeamMemberItem[]).filter(m => m.name?.trim())
      : null;

    const testimonials = Array.isArray(data.testimonials) && (data.testimonials as TestimonialItem[]).length >= 3
      ? (data.testimonials as TestimonialItem[]).slice(0, 3)
      : null;

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
        hero_badge:           data.hero_badge,
        cta_secondary:        data.cta_secondary,
        services_detailed,
        benefits_detailed,
        stats:                stats.length > 0 ? stats : undefined,
        about_headline:       (data.about_headline as string) || `Über ${company_name}`,
        about_highlight:      data.about_highlight,
        trust_badge:          data.trust_badge,
        cta_section_headline: data.cta_section_headline,
        cta_section_text:     data.cta_section_text,
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
