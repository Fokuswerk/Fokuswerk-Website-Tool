import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  buildBriefingPrompt,
  buildCopyPrompt,
  type BusinessBriefing,
  type ScrapedInput,
} from "@/lib/prompts";
import { calculateQualityScore } from "@/lib/quality-score";
import type { ServiceItem, BenefitItem, StatItem, TestimonialItem, TeamMemberItem, FaqItem, ProcessStep } from "@/lib/types";

export const maxDuration = 60;

const client = new Anthropic();

// ─── Template-Kontext ────────────────────────────────────────────────────────

function getTemplateHint(template: string): string {
  const hints: Record<string, string> = {
    "arzt":         "Arztpraxis Vertrauen. Warm, beruhigend, patientenfreundlich. Angstabbau, Einfühlsamkeit, kurze Wartezeiten. CTA: 'Termin vereinbaren'. Öffnungszeiten + Kassenarztzulassung als Vertrauenssignal.",
    "arzt-modern":  "Arztpraxis Excellence. Modern, kompetent, premium. Modernste Technik, Fachexpertise, Privatpatienten-Atmosphäre. CTA: 'Termin buchen'.",
    "handwerk":     "Handwerk Stark. Direkt, zuverlässig. Festpreis, schnelle Reaktion, Qualitätsarbeit. CTA: 'Kostenlos anfragen'. Keine blumige Sprache.",
    "handwerk-lokal": "Handwerk Lokal. Familienbetrieb, Region, persönliche Beziehung, Verlässlichkeit. CTA: 'Jetzt anfragen'.",
    "local":        "Local Business. Kundennähe, Bewertungen, Vertrauen. CTAs direkt (Anrufen, Termin).",
    "minimal":      "Minimal/Editorial. Präzise, kurz, kein Werbesprech. Wenige starke Argumente.",
    "premium":      "Premium Corporate. Hochwertig, editorial. Starke Value Propositions.",
  };
  return hints[template] || hints["premium"];
}

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
    { title: "Prophylaxe & Zahnreinigung", description: "Professionelle Zahnreinigung und individuelle Prophylaxe für langfristig gesunde Zähne." },
    { title: "Zahnfüllungen & Restaurationen", description: "Hochwertige Zahnfüllungen aus Komposit oder Keramik — ästhetisch und langlebig." },
    { title: "Zahnersatz & Prothetik", description: "Individuell angefertigter Zahnersatz für ein natürliches und schönes Lächeln." },
    { title: "Implantologie", description: "Dauerhafte Zahnlückenfüllung durch Zahnimplantate von der Planung bis zur Versorgung." },
    { title: "Kinderzahnheilkunde", description: "Einfühlsame Zahnbehandlung für Kinder in entspannter, stressfreier Umgebung." },
  ];
  if (q.match(/arzt|praxis|hausarzt|allgemein/)) return [
    { title: "Allgemeinmedizin", description: "Umfassende hausärztliche Versorgung für alle Altersgruppen — Diagnose, Behandlung, Prävention." },
    { title: "Vorsorgeuntersuchungen", description: "Check-Up-Programme und Früherkennungsuntersuchungen für Ihre langfristige Gesundheit." },
    { title: "Impfberatung & Impfungen", description: "Aktueller Impfschutz nach STIKO-Empfehlung — für Reisen und alltäglichen Schutz." },
    { title: "Chronische Erkrankungen", description: "Langfristige Betreuung und Management chronischer Erkrankungen wie Diabetes und Bluthochdruck." },
    { title: "Labordiagnostik", description: "Blutuntersuchungen und Labordiagnostik für eine präzise Diagnose." },
  ];
  if (q.match(/handwerk|bau|sanitär|elektro|maler/)) return [
    { title: "Beratung & Planung", description: "Persönliche Beratung vor Ort und professionelle Planung Ihres Projekts. Transparente Kosten." },
    { title: "Fachgerechte Ausführung", description: "Alle Arbeiten durch qualifizierte Fachkräfte mit modernstem Equipment und Materialien." },
    { title: "Wartung & Instandhaltung", description: "Regelmäßige Wartung für den dauerhaften Betrieb — termingerecht und verlässlich." },
    { title: "Notfallservice", description: "Schnelle Hilfe bei dringenden Problemen — auch am Wochenende erreichbar." },
    { title: "Sanierung & Modernisierung", description: "Energieeffiziente Sanierungen nach aktuellen Standards — für mehr Komfort und Wertsteigerung." },
  ];
  return [
    { title: "Erstberatung", description: "Persönliche Beratung zu Ihrem Anliegen — individuell, unverbindlich und auf Ihre Situation zugeschnitten." },
    { title: "Professionelle Umsetzung", description: "Fachgerechte Durchführung durch erfahrene Spezialisten mit höchsten Qualitätsansprüchen." },
    { title: "Nachbetreuung", description: "Kompetenter Support auch nach Abschluss — wir stehen Ihnen als verlässlicher Partner zur Seite." },
  ];
}

// ─── Haupthandler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let currentPhase = "init";

  try {
    const body = await req.json();
    const {
      company_name,
      industry,
      description,
      old_website_url,
      scraped_headings,
      scraped_hero,
      scraped_subheadings,
      scraped_services,
      service_pairs,
      service_descriptions,
      about_text,
      team_members: scraped_team,
      opening_hours,
      rating,
      trust_signals,
      insurance_info,
      area_served,
      founding_year,
      faq_items: scraped_faq,
      company_summary,
      manual_location,
      manual_phone,
      manual_notes,
      template,
      phone,
      email,
      address,
      logo_url,
    } = body;

    if (!company_name) {
      return NextResponse.json({ error: "Unternehmensname fehlt" }, { status: 400 });
    }

    const hasWebsite = !!old_website_url;
    const isMedical  = !!(template || "").match(/^arzt/);

    // ── Confirmed services (höchste Priorität) ────────────────────────────────
    const confirmedServices: string[] =
      Array.isArray(scraped_services) && scraped_services.length > 0
        ? scraped_services as string[]
        : Array.isArray(scraped_subheadings) && scraped_subheadings.length > 0
        ? scraped_subheadings as string[]
        : [];

    const confirmedPairs: Array<{ title: string; description: string }> =
      Array.isArray(service_pairs) && service_pairs.length > 0
        ? service_pairs as Array<{ title: string; description: string }>
        : [];

    const hasRealTeam = Array.isArray(scraped_team) && (scraped_team as Array<{ name: string; title: string }>).length > 0;

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 1: BUSINESS-BRIEFING
    // ══════════════════════════════════════════════════════════════════════════
    currentPhase = "briefing";

    const scrapedInput: ScrapedInput = {
      company_name,
      industry,
      description,
      hero_text: scraped_hero,
      headings:  scraped_headings,
      scraped_services: confirmedServices,
      service_pairs:    confirmedPairs,
      service_descriptions: service_descriptions as string[] | undefined,
      about_text:    about_text as string | undefined,
      team_members:  scraped_team as Array<{ name: string; title: string }> | undefined,
      opening_hours: opening_hours as string | undefined,
      rating:        rating as string | undefined,
      trust_signals: trust_signals as string[] | undefined,
      insurance_info: insurance_info as string | undefined,
      founding_year:  founding_year as string | undefined,
      faq_items:     scraped_faq as Array<{ question: string; answer: string }> | undefined,
      area_served:   area_served as string | undefined,
      phone:         phone as string | undefined,
      email:         email as string | undefined,
      address:       address as string | undefined,
      company_summary: company_summary as string | undefined,
      manual_location: !hasWebsite ? (manual_location as string | undefined) : undefined,
      manual_phone:    !hasWebsite ? (manual_phone as string | undefined) : undefined,
      manual_notes:    !hasWebsite ? (manual_notes as string | undefined) : undefined,
      template,
    };

    let briefing: BusinessBriefing;

    try {
      const briefingMsg = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: buildBriefingPrompt(scrapedInput) }],
      });
      const rawBriefing = parseJSON(
        briefingMsg.content[0].type === "text" ? briefingMsg.content[0].text : "{}"
      );
      briefing = rawBriefing as unknown as BusinessBriefing;

      if (!briefing.company_name) briefing.company_name = company_name;
      if (!briefing.safe_claims)  briefing.safe_claims = ["Persönliche Beratung", "Direkte Ansprechpartner", "Strukturierter Ablauf"];
      if (!briefing.do_not_claim) briefing.do_not_claim = [];
      if (!briefing.confirmed_services) briefing.confirmed_services = [];
      if (!briefing.primary_cta) briefing.primary_cta = isMedical ? "Termin vereinbaren" : "Jetzt anfragen";
      if (!briefing.city) briefing.city = manual_location || "";
      if (!briefing.pain_points) briefing.pain_points = [];
      if (!briefing.motivations) briefing.motivations = [];
      if (!briefing.secondary_seo_keywords) briefing.secondary_seo_keywords = [];
      if (!briefing.tone_examples) briefing.tone_examples = [];
      if (!briefing.content_notes) briefing.content_notes = [];
      if (!briefing.trust_signals_real) briefing.trust_signals_real = [];
      if (!briefing.primary_seo_keyword) briefing.primary_seo_keyword = `${industry || "Dienstleister"} ${manual_location || ""}`.trim();
      if (!briefing.cta_urgency) briefing.cta_urgency = "Jetzt Kontakt aufnehmen";
      if (!briefing.usp) briefing.usp = `${company_name} — persönliche Beratung`;
      if (!briefing.tone) briefing.tone = "professionell und freundlich";
      if (!briefing.industry) briefing.industry = industry || "Dienstleistung";
      if (!briefing.audience_type) briefing.audience_type = "B2C";
      if (!briefing.target_audience) briefing.target_audience = "Kunden in der Region";

    } catch (briefingErr) {
      console.error("[Phase 1 briefing error]", briefingErr instanceof Error ? briefingErr.message : briefingErr);
      // Fallback-Briefing
      briefing = {
        company_name,
        city:        manual_location || "",
        region:      "",
        industry:    industry || "Dienstleistung",
        usp:         `${company_name} — persönliche Beratung und professionelle Umsetzung`,
        tone:        "professionell und freundlich",
        audience_type: "B2C",
        target_audience: "Privat- und Geschäftskunden in der Region",
        pain_points:  ["Schnelle und zuverlässige Lösung", "Gutes Preis-Leistungs-Verhältnis"],
        motivations:  ["Qualität", "Verlässlichkeit"],
        confirmed_services: confirmedServices.map(s => ({ title: s, source: "scraped" as const })),
        trust_signals_real: (trust_signals as string[] | null) || [],
        safe_claims:  ["Persönliche Beratung", "Direkte Ansprechpartner", "Klare Kommunikation"],
        do_not_claim: [],
        primary_seo_keyword: `${industry || "Dienstleister"} ${manual_location || ""}`.trim(),
        secondary_seo_keywords: [],
        primary_cta:  isMedical ? "Termin vereinbaren" : "Jetzt anfragen",
        cta_urgency:  "Jetzt Kontakt aufnehmen",
        tone_examples: [],
        content_notes: [],
      };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 2: WEBSITE-TEXTE GENERIEREN
    // Sonnet für alle Templates — zuverlässig unter 60s
    // ══════════════════════════════════════════════════════════════════════════
    currentPhase = "copy";

    const templateHint = getTemplateHint(template || "premium");

    const copyPrompt = buildCopyPrompt(
      briefing,
      confirmedServices,
      confirmedPairs,
      templateHint,
      hasRealTeam,
      isMedical,
    );

    const copyMsg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: copyPrompt }],
    });

    const data = parseJSON(
      copyMsg.content[0].type === "text" ? copyMsg.content[0].text : "{}"
    );

    // ══════════════════════════════════════════════════════════════════════════
    // OUTPUT NORMALISIERUNG
    // ══════════════════════════════════════════════════════════════════════════
    currentPhase = "normalization";

    const auto_filled: string[] = [];

    // Services
    let services_detailed: ServiceItem[] = Array.isArray(data.services)
      ? (data.services as unknown[]).map(s =>
          typeof s === "string" ? { title: s, description: "" } : s as ServiceItem
        )
      : [];

    const hasRealScrapedServices = confirmedServices.length > 0;

    if (services_detailed.length < 3) {
      const fallbacks = getFallbackServices(industry || briefing.industry || "");
      const needed = 5 - services_detailed.length;
      services_detailed = [...services_detailed, ...fallbacks.slice(0, needed)];
      auto_filled.push(`${Math.max(0, 5 - services_detailed.length)} Leistung(en) aus Branchenvorlage ergänzt`);
    }

    services_detailed = services_detailed.map(s => ({
      title:       s.title || "Leistung",
      description: s.description || "Professionelle Leistung mit höchsten Qualitätsstandards.",
    }));

    // Benefits
    let benefits_detailed: BenefitItem[] = Array.isArray(data.benefits)
      ? (data.benefits as unknown[]).map(b =>
          typeof b === "string" ? { title: b, description: "" } : b as BenefitItem
        )
      : [];

    if (benefits_detailed.length < 3) {
      const genericBenefits: BenefitItem[] = [
        { title: "Persönliche Beratung", description: "Individuelle Beratung auf Ihre Situation zugeschnitten." },
        { title: "Klare Kommunikation", description: "Transparente Prozesse und direkte Ansprechpartner." },
        { title: "Strukturierter Ablauf", description: "Professionelles Vorgehen von der ersten Anfrage bis zum Abschluss." },
        { title: "Verlässlichkeit", description: "Termine werden eingehalten, Zusagen werden gehalten." },
      ];
      while (benefits_detailed.length < 3) {
        benefits_detailed.push(genericBenefits[benefits_detailed.length] ?? genericBenefits[0]);
      }
    }

    // Stats — nur wenn echte Daten vorhanden
    const rawStats = Array.isArray(data.stats) ? data.stats as StatItem[] : [];
    const stats = rawStats.filter(s => s.value && s.label && s.value !== "string").slice(0, 4);

    // FAQ
    const faq_items: FaqItem[] = Array.isArray(data.faq_items)
      ? (data.faq_items as FaqItem[]).filter(f => f.question && f.answer).slice(0, 6)
      : Array.isArray(scraped_faq)
      ? (scraped_faq as FaqItem[]).slice(0, 4)
      : [];

    // Process steps
    const process_steps: ProcessStep[] = Array.isArray(data.process_steps)
      ? (data.process_steps as ProcessStep[]).filter(s => s.title && s.description).slice(0, 4)
      : [];

    // Team
    const team_members = isMedical && Array.isArray(data.team_members)
      ? (data.team_members as TeamMemberItem[]).filter(m => m.name?.trim())
      : null;

    // Testimonials
    const testimonials = Array.isArray(data.testimonials) && (data.testimonials as TestimonialItem[]).length >= 3
      ? (data.testimonials as TestimonialItem[]).slice(0, 3)
      : null;

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 3: QUALITY SCORE (deterministisch, kein API-Call)
    // ══════════════════════════════════════════════════════════════════════════
    currentPhase = "quality-score";

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
      phone:            phone as string | null,
      email:            email as string | null,
      address:          address as string | null,
      logo_url:         logo_url as string | null,
      opening_hours:    opening_hours as string | null,
      rating:           rating as string | null,
      trust_signals:    trust_signals as string[] | null,
      has_real_scraped_services: hasRealScrapedServices,
      city:             briefing.city,
      company_name,
      template,
    });

    // ── Finale Antwort ─────────────────────────────────────────────────────

    return NextResponse.json({
      meta_title:       (data.meta_title       as string) || `${company_name} — ${industry || "Ihr Experte"}`,
      meta_description: (data.meta_description as string) || `${company_name}: Persönliche Beratung und professionelle Leistungen. Jetzt anfragen!`,
      hero_headline:    (data.hero_headline    as string) || company_name,
      hero_subheadline: (data.hero_subheadline as string) || `Professionelle ${industry || "Dienstleistungen"} — persönlich und zuverlässig.`,
      cta_text:         (data.cta_text         as string) || briefing.primary_cta || "Jetzt anfragen",
      about_text:       (data.about_text       as string) || `${company_name} steht für Qualität und persönliche Beratung.`,
      services:         services_detailed.map(s => s.title),
      benefits:         benefits_detailed.map(b => b.title),
      testimonials,
      auto_filled,

      ai_content: {
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
        data_sources:     {
          services:      hasRealScrapedServices ? "scraped" : "derived",
          trust_signals: (trust_signals as string[] | null)?.length ? "scraped" : "fallback",
          team:          hasRealTeam ? "scraped" : "fallback",
          opening_hours: opening_hours ? "scraped" : "fallback",
        },
      },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Generate error in phase '${currentPhase}']:`, msg);

    if (msg.includes("timeout") || msg.includes("AbortError") || msg.includes("504")) {
      return NextResponse.json(
        { error: `Generierung dauerte zu lange (Phase: ${currentPhase}). Bitte nochmals versuchen.` },
        { status: 504 }
      );
    }

    if (msg.toLowerCase().includes("api") || msg.includes("401") || msg.includes("403")) {
      return NextResponse.json(
        { error: "API-Key ungültig oder kein Guthaben. Bitte API-Key prüfen." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `KI-Generierung fehlgeschlagen (Phase: ${currentPhase}). Details: ${msg.slice(0, 100)}` },
      { status: 500 }
    );
  }
}
