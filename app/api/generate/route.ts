import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

function getToneForIndustry(industry: string): string {
  const q = (industry || "").toLowerCase();
  if (q.match(/arzt|zahnarzt|praxis|klinik|gesundheit|physio/))
    return "Seriös, einfühlsam und vertrauenswürdig. Patienten müssen sich gut aufgehoben fühlen.";
  if (q.match(/anwalt|rechts|kanzlei|notar/))
    return "Professionell, kompetent, diskret. Mandanten schätzen Klarheit und Verlässlichkeit.";
  if (q.match(/steuer|buchhalter|finanz|versicherung/))
    return "Verlässlich, kompetent, nahbar. Komplexe Themen einfach erklärt.";
  if (q.match(/restaurant|gastro|café|cafe|bäck|catering/))
    return "Warm, einladend, appetitlich. Emotionaler und atmosphärischer Stil.";
  if (q.match(/handwerk|bau|sanitär|elektro|maler|dachdeck/))
    return "Direkt, zuverlässig, bodenständig. Qualität und Verlässlichkeit betonen.";
  if (q.match(/friseur|beauty|kosmetik|wellness|spa/))
    return "Einladend, modern, ästhetisch. Wohlfühlatmosphäre und persönliche Betreuung.";
  if (q.match(/fitness|sport|gym|yoga|personal training/))
    return "Motivierend, energetisch, modern. Ziele, Transformation und Community betonen.";
  if (q.match(/immobilien|makler/))
    return "Seriös, kompetent, persönlich. Vertrauen bei großen Entscheidungen aufbauen.";
  if (q.match(/it|software|tech|digital|web|agentur/))
    return "Modern, präzise, lösungsorientiert. Technische Kompetenz klar kommunizieren.";
  return "Professionell, freundlich, direkt. Kompetenz und Kundennähe betonen.";
}

/** Returns industry-specific service fallbacks if AI produces too few */
function getIndustryFallbackServices(industry: string): Array<{ title: string; description: string }> {
  const q = (industry || "").toLowerCase();
  if (q.match(/zahnarzt|dental/)) return [
    { title: "Prophylaxe & Zahnreinigung", description: "Professionelle Zahnreinigung und individuelle Prophylaxe für langfristig gesunde Zähne. Wir entfernen Plaque und Zahnstein gründlich und schonend." },
    { title: "Zahnfüllungen & Restaurationen", description: "Hochwertige Zahnfüllungen aus Komposit oder Keramik – ästhetisch, langlebig und zahnfarbend angepasst." },
    { title: "Zahnersatz & Prothetik", description: "Individuell angefertigter Zahnersatz – von Kronen und Brücken bis zu Veneers. Für ein natürliches und schönes Lächeln." },
    { title: "Implantologie", description: "Dauerhafte Zahnlückenfüllung durch Zahnimplantate. Wir begleiten Sie von der Planung bis zur abschließenden Versorgung." },
    { title: "Kinderzahnheilkunde", description: "Einfühlsame Zahnbehandlung für Kinder in einer angenehmen, stressfreien Umgebung. Wir legen Grundstein für gesunde Zähne fürs Leben." },
    { title: "Zahnaufhellung (Bleaching)", description: "Professionelles Bleaching für ein strahlendes Lächeln. Sicher, schonend und mit nachhaltig weißen Ergebnissen." },
  ];
  if (q.match(/handwerk|bau|sanitär|elektro|maler/)) return [
    { title: "Beratung & Planung", description: "Individuelle Beratung vor Ort und professionelle Planung Ihres Projekts. Transparente Kosten, klare Abläufe." },
    { title: "Fachgerechte Ausführung", description: "Alle Arbeiten werden von qualifizierten Fachkräften mit modernsten Werkzeugen und Materialien ausgeführt." },
    { title: "Wartung & Instandhaltung", description: "Regelmäßige Wartung und schnelle Instandhaltung für den dauerhaften Betrieb Ihrer Anlagen." },
    { title: "Notfallservice", description: "24-Stunden-Notfallservice bei dringenden Problemen. Wir sind schnell zur Stelle – auch am Wochenende." },
    { title: "Modernisierung & Sanierung", description: "Energieeffiziente Modernisierungen und vollständige Sanierungen nach aktuellen Standards." },
    { title: "Abnahme & Dokumentation", description: "Sorgfältige Abnahme und lückenlose Dokumentation aller ausgeführten Arbeiten – für Ihre Sicherheit." },
  ];
  if (q.match(/restaurant|gastro|café/)) return [
    { title: "Frühstück & Brunch", description: "Täglich frisch zubereitetes Frühstück mit regionalen Zutaten. Genießen Sie den perfekten Start in den Tag." },
    { title: "Mittagstisch", description: "Wechselnde Tagesgerichte mit frischen, saisonalen Zutaten. Schnell, lecker und zu fairen Preisen." },
    { title: "À-la-Carte-Menü", description: "Sorgfältig zusammengestellte Gerichte aus besten Zutaten. Genießen Sie kulinarische Vielfalt in entspannter Atmosphäre." },
    { title: "Catering & Events", description: "Professionelles Catering für Firmenevents, Hochzeiten und private Feiern. Maßgeschneidert für Ihren besonderen Anlass." },
    { title: "Reservierungen", description: "Tischreservierungen für Gruppen und besondere Anlässe. Kontaktieren Sie uns für individuelle Arrangements." },
    { title: "Takeaway & Lieferung", description: "Alle unsere Speisen auch zum Mitnehmen. Frisch zubereitet und liebevoll verpackt für Ihr Zuhause." },
  ];
  // Generic fallback for any industry
  return [
    { title: "Beratung & Konzept", description: "Persönliche Beratung und maßgeschneiderte Konzepte für Ihre individuelle Situation. Wir hören zu und entwickeln die beste Lösung." },
    { title: "Professionelle Umsetzung", description: "Fachgerechte Umsetzung durch erfahrene Spezialisten mit höchsten Qualitätsstandards und modernen Methoden." },
    { title: "Betreuung & Support", description: "Kompetente Betreuung während und nach dem Auftrag. Wir stehen Ihnen jederzeit als zuverlässiger Ansprechpartner zur Verfügung." },
    { title: "Qualitätssicherung", description: "Strenge Qualitätskontrollen sichern dauerhaft hervorragende Ergebnisse. Ihre Zufriedenheit ist unser Maßstab." },
    { title: "Flexible Lösungen", description: "Maßgeschneiderte Angebote, die sich Ihren Bedürfnissen und Ihrem Budget anpassen. Kein Projekt ist zu groß oder zu klein." },
    { title: "Langfristige Partnerschaft", description: "Wir denken nicht nur kurz-, sondern langfristig. Aufgebautes Vertrauen und nachhaltiger Erfolg stehen im Mittelpunkt." },
  ];
}

export async function POST(req: NextRequest) {
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
    faq_items,
    company_summary,
    manual_location,
    manual_phone,
    manual_notes,
    template,
  } = await req.json();

  if (!company_name) {
    return NextResponse.json({ error: "Unternehmensname fehlt" }, { status: 400 });
  }

  const tone = getToneForIndustry(industry || "");
  const isMedical = !!(template || "").match(/^arzt/);
  const isHandwerk = !!(template || "").match(/^handwerk/);

  const templateHint = template === "local"
    ? "Template: Local Business. Betone Kundennähe, lokale Verwurzelung, Bewertungen und Vertrauen. CTAs sehr direkt (Anrufen, Termin buchen)."
    : template === "minimal"
    ? "Template: Minimal/Editorial. Klare, präzise Sprache. Headlines sehr kurz und prägnant. Kein Werbesprech. Wenige, aber starke Argumente."
    : template === "arzt"
    ? "Template: Arztpraxis Vertrauen. Warm, beruhigend, patientenfreundlich. Betone: Angstabbau, Einfühlsamkeit, kurze Wartezeiten, modernes Ambiente. CTA: 'Termin vereinbaren'. Öffnungszeiten und Kassenarztzulassung sind wichtige Vertrauenssignale."
    : template === "arzt-modern"
    ? "Template: Arztpraxis Excellence. Modern, kompetent, premium. Betone: Modernste Technik, Fachexpertise, Privatpatienten-Atmosphäre, zertifizierte Verfahren. Klingt exzellent und professionell. CTA: 'Termin buchen'."
    : template === "handwerk"
    ? "Template: Handwerk Stark. Direkt, zuverlässig, stark. Betone: Telefonnummer, Festpreisgarantie, schnelle Reaktion, Qualitätsarbeit, Referenzen. CTA: 'Kostenlos anfragen'. Keine blumige Sprache — klar und vertrauenswürdig."
    : template === "handwerk-lokal"
    ? "Template: Handwerk Lokal. Familienbetrieb, Nahbarkeit, lokale Verwurzelung. Betone: Generationen, Region, persönliche Beziehung, Verlässlichkeit. Warm und authentisch. CTA: 'Jetzt anfragen'."
    : "Template: Premium Corporate. Professionell, hochwertig, editorial. Starke Value Propositions und klarer Marken-Charakter.";

  // Build context from all available data
  const hasWebsite = !!old_website_url;

  // Confirmed real services from the actual website (highest priority)
  const confirmedServices: string[] = Array.isArray(scraped_services) && scraped_services.length > 0
    ? scraped_services as string[]
    : Array.isArray(scraped_subheadings) && scraped_subheadings.length > 0
    ? (scraped_subheadings as string[])
    : [];

  const confirmedServiceBlock = confirmedServices.length > 0
    ? `\n⚠️ ECHTE LEISTUNGEN — von der tatsächlichen Website extrahiert (MÜSSEN alle in den services-Array!):\n${confirmedServices.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}\nDiese Leistungen NICHT ersetzen, NICHT weglassen, NICHT durch andere tauschen!\n`
    : "";

  // Type helpers
  interface ScrapedPair { title: string; description: string }
  interface ScrapedTeam { name: string; title: string }
  interface ScrapedFaq  { question: string; answer: string }

  const contextParts = [
    description && `Selbstbeschreibung: ${description}`,
    company_summary && `Website-Analyse (komplett): ${company_summary}`,
    scraped_hero && `Aktueller Hero-Text auf der Website: "${scraped_hero}"`,
    scraped_headings?.length && `Sektionen auf der Startseite: ${(scraped_headings as string[]).slice(0, 6).join(" | ")}`,

    // Rich service data
    Array.isArray(service_pairs) && (service_pairs as ScrapedPair[]).length > 0 &&
      `Leistungen mit Originalbeschreibung:\n${(service_pairs as ScrapedPair[]).slice(0, 8).map((p: ScrapedPair) => `  • ${p.title}: ${p.description.slice(0, 150)}`).join("\n")}`,
    Array.isArray(service_descriptions) && (service_descriptions as string[]).length > 0 &&
      `Weitere Texte von der Leistungsseite: ${(service_descriptions as string[]).slice(0, 4).join(" | ")}`,

    // Company background
    about_text && `Über das Unternehmen (von der Website): ${(about_text as string).slice(0, 400)}`,
    founding_year && `Gegründet: ${founding_year}`,
    area_served && `Einzugsgebiet: ${area_served}`,

    // Team
    Array.isArray(scraped_team) && (scraped_team as ScrapedTeam[]).length > 0 &&
      `Team (echte Namen von der Website): ${(scraped_team as ScrapedTeam[]).map((m: ScrapedTeam) => m.name + (m.title ? ` — ${m.title}` : "")).join(", ")}`,

    // Operational details
    opening_hours && `Öffnungszeiten: ${opening_hours}`,
    insurance_info && `Kassen/Privat: ${insurance_info}`,
    rating && `Kundenbewertungen: ${rating}`,

    // Trust
    Array.isArray(trust_signals) && (trust_signals as string[]).length > 0 &&
      `Vertrauenssignale: ${(trust_signals as string[]).join(" | ")}`,

    // FAQ
    Array.isArray(faq_items) && (faq_items as ScrapedFaq[]).length > 0 &&
      `Häufige Fragen (von der Website): ${(faq_items as ScrapedFaq[]).slice(0, 3).map((f: ScrapedFaq) => `Q: ${f.question} → A: ${f.answer.slice(0, 100)}`).join(" | ")}`,

    // Manual fields (no-website case)
    !hasWebsite && manual_location && `Standort: ${manual_location}`,
    !hasWebsite && manual_phone    && `Telefon: ${manual_phone}`,
    !hasWebsite && manual_notes    && `Zusätzliche Infos: ${manual_notes}`,
  ].filter(Boolean);

  // For medical/handwerk templates, use scraped or extract team members
  const hasRealTeam = Array.isArray(scraped_team) && (scraped_team as Array<{name:string;title:string}>).length > 0;
  const teamExtractionRule = isMedical
    ? `14. team_members: ${hasRealTeam
        ? `Nutze die ECHTEN Teammitglieder aus den Website-Daten (bereits extrahiert im Kontext oben). Schreibe eine kurze, authentische Bio (1 Satz) pro Person. Format: Name exakt wie angegeben, Titel/Fachgebiet, 1 Satz Bio.`
        : `Wenn ECHTE Namen aus den Website-Daten erkennbar sind, nutze sie. Sonst: leeres Array []. NIEMALS Namen erfinden!`}`
    : "";

  const teamJsonField = isMedical ? `,
  "team_members": [
    { "name": "string (echter Name — nur wenn aus Website-Daten vorhanden)", "title": "string (Fachgebiet/Funktion)", "bio": "string (1 authentischer Satz)" }
  ]` : "";

  // Medical testimonials need patient-specific roles
  const testimonialGuidance = isMedical
    ? `Zahnarzt/Arzt: Rollen wie "Patientin seit 4 Jahren", "Patient aus Bad Zwischenahn", "Langjähriger Patient", "Mutter von 3 Kindern", "Stammpatient". KEIN "Patientin mit Familienangehörigen" oder ähnlicher Unsinn!`
    : isHandwerk
    ? `Handwerk: Rollen wie "Hausbesitzer aus Hamburg", "Vermieter", "Renovierungskunde", "Eigenheim-Besitzer aus [Stadt]". Konkret, lokal, authentisch.`
    : `Branchenspezifisch: Rolle = kurzer konkreter Kontext (max. 5 Wörter), kein generisches "Zufriedener Kunde"`;

  const prompt = `Du bist Deutschlands bester Conversion Copywriter und Local-SEO-Experte.
${hasWebsite
  ? "Analysiere die vorhandenen Website-Daten gründlich und erstelle maßgeschneiderte Inhalte."
  : "Dieses Unternehmen hat noch keine Website. Erstelle authentische, branchentypische Inhalte basierend auf den vorliegenden Infos. Nutze lokale Signale (Ort, Region) für SEO und Vertrauen."
}

AUFTRAG:
- Unternehmensname: ${company_name}
- Branche: ${industry || "nicht angegeben"}
- Template-Kontext: ${templateHint}
- Tonalität: ${tone}
${contextParts.length ? `\n${hasWebsite ? "VORHANDENE WEBSITE-DATEN (nutze diese intensiv!)" : "VERFÜGBARE INFORMATIONEN"}:\n${contextParts.join("\n")}` : ""}
${confirmedServiceBlock}
STRIKTE REGELN:
1. Generiere EXAKT ${confirmedServices.length > 0 ? `${confirmedServices.length} Services (die unten gelisteten echten Leistungen!)` : "5-6 Services"} mit je 2-3 Sätzen Beschreibung (PFLICHT!)
2. Generiere EXAKT 4 Benefits mit je 1-2 Sätzen
3. Alle Texte auf Deutsch — konkret, branchenspezifisch, KEINE leeren Floskeln
4. Hero-Headline: max. 6 Wörter, kraftvoll, konkret (z.B. "Ihr Zahnarzt in München" — NICHT "Ihr Experte vor Ort")
5. Stats: realistisch, glaubwürdig (keine Phantasiezahlen)
6. CTA passend zur Branche — Zahnarzt: "Termin vereinbaren", Handwerk: "Kostenlos anfragen"
7. About-Text: 3-4 Sätze, persönlich, mit Stadt/Region wenn bekannt
8. Meta Title: exakt 50-60 Zeichen mit Stadt wenn bekannt
9. Meta Description: 140-155 Zeichen mit konkretem Nutzen und CTA
10. ${confirmedServices.length > 0 ? `🚨 ABSOLUTES MUSS: Die ${confirmedServices.length} oben gelisteten echten Leistungen ALLE im services-Array — in gleicher Reihenfolge, nichts weglassen, nichts ersetzen!` : "WICHTIGSTE REGEL: Leistungen der alten Website EXAKT übernehmen und ausformulieren — nicht erfinden!"}
11. cta_section_headline: Knackig, 5-8 Wörter, direkte Ansprache
12. cta_section_text: 1-2 motivierende Sätze
13. testimonials: 3 glaubwürdige Stimmen. ${testimonialGuidance}. Namen: kurze Initialen (z.B. "Klaus R."). Texte: 2-3 authentische Sätze, konkret, kein "Ich empfehle wärmstens"!
${teamExtractionRule}

Antworte NUR mit validem JSON, OHNE Markdown oder Code-Blöcke:

{
  "meta_title": "string (50-60 Zeichen)",
  "meta_description": "string (140-155 Zeichen)",
  "hero_badge": "string (kurzes Vertrauenssignal)",
  "hero_headline": "string (max. 6 Wörter)",
  "hero_subheadline": "string (max. 18 Wörter)",
  "cta_text": "string (2-4 Wörter, branchenspezifisch)",
  "cta_secondary": "string",
  "services": [
${confirmedServices.length > 0
  ? confirmedServices.map(s => `    { "title": "${s}", "description": "string (2-3 vollständige Sätze — schreibe diese Beschreibung aus!)" }`).join(",\n")
  : `    { "title": "string", "description": "string (2-3 vollständige Sätze)" },
    { "title": "string", "description": "string (2-3 vollständige Sätze)" },
    { "title": "string", "description": "string (2-3 vollständige Sätze)" },
    { "title": "string", "description": "string (2-3 vollständige Sätze)" },
    { "title": "string", "description": "string (2-3 vollständige Sätze)" }`}
  ],
  "benefits": [
    { "title": "string (3-4 Wörter)", "description": "string (1-2 Sätze)" },
    { "title": "string (3-4 Wörter)", "description": "string (1-2 Sätze)" },
    { "title": "string (3-4 Wörter)", "description": "string (1-2 Sätze)" },
    { "title": "string (3-4 Wörter)", "description": "string (1-2 Sätze)" }
  ],
  "stats": [
    { "value": "string", "label": "string" },
    { "value": "string", "label": "string" },
    { "value": "string", "label": "string" },
    { "value": "string", "label": "string" }
  ],
  "about_headline": "string",
  "about_text": "string (3-4 vollständige Sätze)",
  "about_highlight": "string (max. 12 Wörter)",
  "trust_badge": "string",
  "cta_section_headline": "string",
  "cta_section_text": "string (1-2 Sätze)",
  "testimonials": [
    { "name": "string (z.B. Klaus R.)", "role": "string (max. 5 Wörter, konkreter Kontext)", "text": "string (2-3 Sätze)" },
    { "name": "string", "role": "string", "text": "string" },
    { "name": "string", "role": "string", "text": "string" }
  ]${teamJsonField}
}`;

  try {
    // ── Pass 1: Initial generation ───────────────────────────────────────────
    const genModel = (isMedical || isHandwerk) ? "claude-opus-4-5" : "claude-sonnet-4-6";
    const genMsg = await client.messages.create({
      model: genModel,
      max_tokens: 4500,
      messages: [{ role: "user", content: prompt }],
    });
    const initial = parseJSON(genMsg.content[0].type === "text" ? genMsg.content[0].text : "{}");

    // ── Pass 2: Parallel quality reviews ────────────────────────────────────
    const reviewContext = `
Unternehmensname: ${company_name}
Branche: ${industry || "unbekannt"}
${manual_location || (contextParts.find(p => typeof p === "string" && p.includes("Standort")) ?? "")}
`;

    const contentSnapshot = JSON.stringify({
      hero_headline:    initial.hero_headline,
      hero_subheadline: initial.hero_subheadline,
      hero_badge:       initial.hero_badge,
      meta_title:       initial.meta_title,
      meta_description: initial.meta_description,
      cta_text:         initial.cta_text,
      about_text:       initial.about_text,
      benefits:         initial.benefits,
      testimonials:     initial.testimonials,
      services:         Array.isArray(initial.services)
        ? initial.services.slice(0, 3).map((s: unknown) =>
            typeof s === "object" && s !== null ? (s as Record<string, unknown>).title : s
          )
        : [],
    });

    const [seoFeedback, customerFeedback, consultantFeedback, croFeedback] = await Promise.all([

      // ── Agent 1: SEO-Experte ────────────────────────────────────────────────
      client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 900,
        messages: [{
          role: "user",
          content: `Du bist Local-SEO-Experte für den deutschen Markt. Analysiere diesen Website-Content und gib gezielte Verbesserungen zurück.
${reviewContext}

AKTUELLER CONTENT:
${contentSnapshot}

PRÜFE:
- Lokale Signale: Ort/Stadt/Region klar erkennbar?
- Keyword-Integration: Branchenbegriffe natürlich eingebettet?
- Meta Title (50-60 Zeichen): Mit Ort, Hauptkeyword, Markenname?
- Meta Description (140-155 Zeichen): Konkreter Nutzen + CTA + Keyword?
- Hero Headline: Konkret mit Branche/Ort oder zu generisch?
- About Text: Enthält Ort/Region und authentische Differenzierung?

Antworte NUR mit JSON — nur verbesserte Felder (gleiche Keys):
{ "meta_title": "...", "hero_headline": "...", ... }`,
        }],
      }).then(m => parseJSON(m.content[0].type === "text" ? m.content[0].text : "{}")),

      // ── Agent 2: Potenzieller Kunde ────────────────────────────────────────
      client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 900,
        messages: [{
          role: "user",
          content: `Du bist ein potenzieller Kunde der aktiv eine ${industry || "Dienstleistung"} sucht — kritisch, ungeduldig, skeptisch.
${reviewContext}

AKTUELLER CONTENT:
${contentSnapshot}

PRÜFE (aus echter Kundensicht):
- Ist das Angebot in 3 Sekunden klar?
- Vertraue ich diesem Unternehmen sofort?
- Klingt es menschlich oder wie generierter Text?
- Ist der CTA verlockend oder austauschbar?
- Sind die Testimonials glaubwürdig oder klingen sie fake?
- Was würde mich abhalten zu klicken?

Antworte NUR mit JSON — nur verbesserte Felder:
{ "hero_subheadline": "...", "cta_text": "...", ... }`,
        }],
      }).then(m => parseJSON(m.content[0].type === "text" ? m.content[0].text : "{}")),

      // ── Agent 3: Unternehmensberater ───────────────────────────────────────
      client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 900,
        messages: [{
          role: "user",
          content: `Du bist Senior-Unternehmensberater mit Fokus auf Positionierung und Markenaufbau.
${reviewContext}

AKTUELLER CONTENT:
${contentSnapshot}

PRÜFE (strategische Perspektive):
- USP: Ist das Alleinstellungsmerkmal klar und überzeugend?
- Positionierung: Premium, günstig, lokal, spezialisiert — kommt das rüber?
- Benefits: Sind die Vorteile wirklich differenzierend oder austauschbar?
- About Text: Klingt es nach einem echten Unternehmen mit Geschichte?
- Hero Badge/Trust Badge: Schafft es sofort Glaubwürdigkeit?
- Gesamteindruck: Würde ich als Unternehmer diesem Betrieb vertrauen?

Antworte NUR mit JSON — nur verbesserte Felder:
{ "about_text": "...", "hero_badge": "...", "benefits": [...], ... }`,
        }],
      }).then(m => parseJSON(m.content[0].type === "text" ? m.content[0].text : "{}")),

      // ── Agent 4: Marketing & CRO-Experte ──────────────────────────────────
      client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 900,
        messages: [{
          role: "user",
          content: `Du bist Marketingexperte mit Schwerpunkt Conversion Rate Optimization (CRO) und Copywriting.
${reviewContext}

AKTUELLER CONTENT:
${contentSnapshot}

PRÜFE (Marketing & Conversion):
- Headline: Nutzt sie das stärkste Kaufmotiv der Zielgruppe?
- Subheadline: Verstärkt sie die Headline oder wiederholt sie sie nur?
- CTA: Ist er spezifisch, nutzenorientiert, ohne Risiko?
- Social Proof: Sind Testimonials konkret mit Ergebnis, nicht nur Lob?
- Dringlichkeit/Verknappung: Gibt es einen Grund jetzt zu handeln?
- CTA-Section: Ist der finale Call-to-Action unwiderstehlich?
- Leistungen: Sind sie aus Kundenperspektive formuliert (Nutzen, nicht Eigenschaft)?

Antworte NUR mit JSON — nur verbesserte Felder:
{ "cta_text": "...", "cta_section_headline": "...", "testimonials": [...], ... }`,
        }],
      }).then(m => parseJSON(m.content[0].type === "text" ? m.content[0].text : "{}")),

    ]);

    // ── Pass 3: Revisions-Agent — alle Feedbacks synthestisieren ────────────
    const revisionMsg = await client.messages.create({
      model: (isMedical || isHandwerk) ? "claude-opus-4-5" : "claude-sonnet-4-6",
      max_tokens: 4500,
      messages: [{
        role: "user",
        content: `Du bist Chef-Redakteur und entscheidest, welche Expertenfeedbacks den Content wirklich verbessern.

ORIGINAL CONTENT:
${JSON.stringify(initial, null, 2)}

FEEDBACK VON 4 EXPERTEN:

[SEO-Experte]:
${JSON.stringify(seoFeedback, null, 2)}

[Potenzieller Kunde]:
${JSON.stringify(customerFeedback, null, 2)}

[Unternehmensberater]:
${JSON.stringify(consultantFeedback, null, 2)}

[Marketing & CRO-Experte]:
${JSON.stringify(croFeedback, null, 2)}

DEINE AUFGABE:
- Übernimm Verbesserungen wenn mehrere Experten ähnliches empfehlen ODER wenn eine Verbesserung klar stärker ist
- Behalte das Original wenn Feedback widersprüchlich oder schlechter ist
- Alle Felder müssen im finalen Output enthalten sein (vollständiges JSON)
- Keine neuen Felder erfinden — gleiche Struktur wie Original
- Sprache: Deutsch, authentisch, branchenspezifisch, nicht generisch
${confirmedServices.length > 0 ? `\n⚠️ UNVERÄNDERLICH: Der services-Array MUSS diese ${confirmedServices.length} echten Leistungen enthalten (in dieser Reihenfolge):\n${confirmedServices.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}\nKein Experten-Feedback darf diese Leistungen ersetzen oder entfernen — nur Beschreibungen verbessern!\n` : ""}
Antworte NUR mit dem vollständigen verbesserten JSON:`,
      }],
    });
    const revised = parseJSON(revisionMsg.content[0].type === "text" ? revisionMsg.content[0].text : "{}");

    // Merge: revision wins, fall back to initial for missing fields
    const data: Record<string, unknown> = { ...initial, ...revised };

    // ── Normalize output ─────────────────────────────────────────────────────
    const auto_filled: string[] = [];

    let services_detailed: Array<{ title: string; description: string }> =
      Array.isArray(data.services)
        ? data.services.map((s: unknown) =>
            typeof s === "string" ? { title: s, description: "" } : s as { title: string; description: string }
          )
        : [];

    if (services_detailed.length < 3) {
      const fallbacks = getIndustryFallbackServices(industry || "");
      const needed = 3 - services_detailed.length;
      services_detailed = [...services_detailed, ...fallbacks.slice(0, needed)];
      auto_filled.push(`${needed} Leistung(en) aus Branchenvorlage ergänzt`);
    }
    services_detailed = services_detailed.map(s => ({
      title: s.title || "Leistung",
      description: s.description || "Professionelle Leistung mit höchsten Qualitätsstandards.",
    }));

    let benefits_detailed: Array<{ title: string; description: string }> =
      Array.isArray(data.benefits)
        ? data.benefits.map((b: unknown) =>
            typeof b === "string" ? { title: b, description: "" } : b as { title: string; description: string }
          )
        : [];

    if (benefits_detailed.length < 3) {
      const genericBenefits = [
        { title: "Langjährige Erfahrung", description: "Jahrelange Expertise garantiert höchste Qualität." },
        { title: "Persönliche Betreuung", description: "Individuelle Beratung und ständige Erreichbarkeit." },
        { title: "Faire Preise", description: "Transparente Kosten ohne versteckte Gebühren." },
        { title: "Schnelle Reaktion", description: "Kurze Reaktionszeiten und zeitnahe Umsetzung." },
      ];
      while (benefits_detailed.length < 3) {
        benefits_detailed.push(genericBenefits[benefits_detailed.length] ?? genericBenefits[0]);
      }
      auto_filled.push("Benefits ergänzt");
    }

    const stats = Array.isArray(data.stats) ? data.stats : [
      { value: "500+", label: "Zufriedene Kunden" },
      { value: "10",   label: "Jahre Erfahrung" },
      { value: "98%",  label: "Weiterempfehlungsrate" },
      { value: "24h",  label: "Reaktionszeit" },
    ];

    const about_text = (data.about_text as string) ||
      `${company_name} steht für Qualität, Verlässlichkeit und persönliche Betreuung. Mit langjähriger Erfahrung bieten wir erstklassige Leistungen zu fairen Preisen. Unser Team setzt alles daran, Ihre Wünsche professionell umzusetzen.`;

    const hero_headline    = (data.hero_headline    as string) || company_name;
    const hero_subheadline = (data.hero_subheadline as string) ||
      `Professionelle ${industry || "Dienstleistungen"} — persönlich, zuverlässig und zu fairen Preisen.`;

    const testimonials = Array.isArray(data.testimonials) && data.testimonials.length >= 3
      ? (data.testimonials as Array<{ name: string; role: string; text: string }>).slice(0, 3)
      : null;

    const team_members = isMedical && Array.isArray(data.team_members) && data.team_members.length > 0
      ? (data.team_members as Array<{ name: string; title: string; bio: string }>).filter(m => m.name?.trim())
      : null;

    return NextResponse.json({
      meta_title:       (data.meta_title       as string) || `${company_name} — ${industry || "Ihr Experte"}`,
      meta_description: (data.meta_description as string) || `${company_name}: Professionelle ${industry || "Leistungen"} mit persönlicher Betreuung. Jetzt anfragen!`,
      hero_headline,
      hero_subheadline,
      cta_text:   (data.cta_text   as string) || "Jetzt anfragen",
      about_text,
      services:   services_detailed.map(s => s.title),
      benefits:   benefits_detailed.map(b => b.title),
      testimonials,
      auto_filled,
      ai_content: {
        hero_badge:           data.hero_badge,
        cta_secondary:        data.cta_secondary,
        services_detailed,
        benefits_detailed,
        stats,
        about_headline:       (data.about_headline as string) || `Über ${company_name}`,
        about_highlight:      data.about_highlight,
        trust_badge:          data.trust_badge,
        cta_section_headline: data.cta_section_headline,
        cta_section_text:     data.cta_section_text,
        ...(team_members && team_members.length > 0 ? { team_members } : {}),
      },
    });

  } catch (e) {
    console.error("Generate error:", e);
    return NextResponse.json({ error: "KI-Generierung fehlgeschlagen. Bitte API-Key und Guthaben prüfen." }, { status: 500 });
  }
}

// ── Helper: robust JSON parser ────────────────────────────────────────────────
function parseJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try { return JSON.parse(match[0]); } catch { return {}; }
  }
}
