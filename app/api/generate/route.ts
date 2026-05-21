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
    company_summary,
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
  const contextParts = [
    description && `Beschreibung: ${description}`,
    company_summary && `Website-Analyse: ${company_summary}`,
    scraped_hero && `Aktueller Hero-Text der alten Website: "${scraped_hero}"`,
    scraped_headings?.length && `Sektionen auf der alten Website: ${(scraped_headings as string[]).slice(0, 6).join(" | ")}`,
    scraped_subheadings?.length && `Unterüberschriften (mögliche Leistungen): ${(scraped_subheadings as string[]).slice(0, 8).join(" | ")}`,
  ].filter(Boolean);

  // For medical/handwerk templates, extract team members if website data available
  const teamExtractionRule = isMedical
    ? `14. team_members: Extrahiere ECHTE Teammitglieder aus den Website-Daten wenn vorhanden (Ärzte, Praxisinhaber, Fachkräfte). Wenn keine realen Namen erkennbar, gib ein leeres Array zurück []. KEINE erfundenen Namen! Format: Name (Dr./Prof. wenn zutreffend), Titel/Fachgebiet, 1 Satz Bio.`
    : "";

  const teamJsonField = isMedical ? `,
  "team_members": [
    { "name": "string (echter Name aus Website-Daten oder leer lassen)", "title": "string (Fachgebiet/Funktion)", "bio": "string (1 Satz)" }
  ]` : "";

  // Medical testimonials need patient-specific roles
  const testimonialGuidance = isMedical
    ? `Zahnarzt/Arzt: Rollen wie "Patientin seit 4 Jahren", "Patient aus Bad Zwischenahn", "Langjähriger Patient", "Mutter von 3 Kindern", "Stammpatient". KEIN "Patientin mit Familienangehörigen" oder ähnlicher Unsinn!`
    : isHandwerk
    ? `Handwerk: Rollen wie "Hausbesitzer aus Hamburg", "Vermieter", "Renovierungskunde", "Eigenheim-Besitzer aus [Stadt]". Konkret, lokal, authentisch.`
    : `Branchenspezifisch: Rolle = kurzer konkreter Kontext (max. 5 Wörter), kein generisches "Zufriedener Kunde"`;

  const prompt = `Du bist Deutschlands bester Conversion Copywriter und Local-SEO-Experte.
Analysiere die vorhandenen Website-Daten gründlich und erstelle maßgeschneiderte Inhalte.

AUFTRAG:
- Unternehmensname: ${company_name}
- Branche: ${industry || "nicht angegeben"}
- Template-Kontext: ${templateHint}
- Tonalität: ${tone}
${contextParts.length ? `\nVORHANDENE WEBSITE-DATEN (nutze diese intensiv!):\n${contextParts.join("\n")}` : ""}

STRIKTE REGELN:
1. Generiere EXAKT 5-6 Services mit je 2-3 Sätzen Beschreibung (PFLICHT!)
2. Generiere EXAKT 4 Benefits mit je 1-2 Sätzen
3. Alle Texte auf Deutsch — konkret, branchenspezifisch, KEINE leeren Floskeln
4. Hero-Headline: max. 6 Wörter, kraftvoll, konkret (z.B. "Ihr Zahnarzt in München" — NICHT "Ihr Experte vor Ort")
5. Stats: realistisch, glaubwürdig (keine Phantasiezahlen)
6. CTA passend zur Branche — Zahnarzt: "Termin vereinbaren", Handwerk: "Kostenlos anfragen"
7. About-Text: 3-4 Sätze, persönlich, mit Stadt/Region wenn bekannt
8. Meta Title: exakt 50-60 Zeichen mit Stadt wenn bekannt
9. Meta Description: 140-155 Zeichen mit konkretem Nutzen und CTA
10. WICHTIGSTE REGEL: Leistungen der alten Website EXAKT übernehmen und ausformulieren — nicht erfinden!
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
    { "title": "string", "description": "string (2-3 vollständige Sätze)" },
    { "title": "string", "description": "string (2-3 vollständige Sätze)" },
    { "title": "string", "description": "string (2-3 vollständige Sätze)" },
    { "title": "string", "description": "string (2-3 vollständige Sätze)" },
    { "title": "string", "description": "string (2-3 vollständige Sätze)" }
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
    // Use the most capable model for industry-specific templates
    const model = (isMedical || isHandwerk) ? "claude-opus-4-5" : "claude-sonnet-4-6";
    const message = await client.messages.create({
      model,
      max_tokens: 4500,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(cleaned);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Kein JSON in der Antwort gefunden");
      data = JSON.parse(jsonMatch[0]);
    }

    // ── Normalize services ───────────────────────────────────────────────────
    let services_detailed: Array<{ title: string; description: string }> =
      Array.isArray(data.services)
        ? data.services.map((s: unknown) =>
            typeof s === "string" ? { title: s, description: "" } : s as { title: string; description: string }
          )
        : [];

    // Enforce minimum 3 services — add industry fallbacks if needed
    const auto_filled: string[] = [];
    if (services_detailed.length < 3) {
      const fallbacks = getIndustryFallbackServices(industry || "");
      const needed = 3 - services_detailed.length;
      services_detailed = [
        ...services_detailed,
        ...fallbacks.slice(0, needed),
      ];
      auto_filled.push(`${needed} Leistung(en) automatisch aus Branchenvorlage ergänzt`);
    }
    // Ensure every service has a non-empty description
    services_detailed = services_detailed.map(s => ({
      title: s.title || "Leistung",
      description: s.description || "Professionelle Leistung mit höchsten Qualitätsstandards.",
    }));

    // ── Normalize benefits ───────────────────────────────────────────────────
    let benefits_detailed: Array<{ title: string; description: string }> =
      Array.isArray(data.benefits)
        ? data.benefits.map((b: unknown) =>
            typeof b === "string" ? { title: b, description: "" } : b as { title: string; description: string }
          )
        : [];

    if (benefits_detailed.length < 3) {
      const genericBenefits = [
        { title: "Langjährige Erfahrung", description: "Jahrelange Expertise garantieren höchste Qualität und verlässliche Ergebnisse." },
        { title: "Persönliche Betreuung", description: "Individuelle Beratung und ständige Erreichbarkeit für Ihre Anliegen." },
        { title: "Faire Preise", description: "Transparente Kostenstruktur ohne versteckte Gebühren — Qualität zu fairen Konditionen." },
        { title: "Schnelle Reaktion", description: "Kurze Reaktionszeiten und zeitnahe Umsetzung Ihrer Anfragen." },
      ];
      while (benefits_detailed.length < 3) {
        benefits_detailed.push(genericBenefits[benefits_detailed.length] ?? genericBenefits[0]);
      }
      if (!auto_filled.some(s => s.includes("Vorteil"))) {
        auto_filled.push("Benefits automatisch ergänzt");
      }
    }

    // ── Normalize stats ──────────────────────────────────────────────────────
    const stats = Array.isArray(data.stats) ? data.stats : [
      { value: "500+", label: "Zufriedene Kunden" },
      { value: "10",   label: "Jahre Erfahrung" },
      { value: "98%",  label: "Weiterempfehlungsrate" },
      { value: "24h",  label: "Reaktionszeit" },
    ];

    // ── Fallback texts ───────────────────────────────────────────────────────
    const about_text = (data.about_text as string) ||
      `${company_name} steht für Qualität, Verlässlichkeit und persönliche Betreuung. Mit langjähriger Erfahrung in der Branche bieten wir unseren Kunden erstklassige Leistungen zu fairen Preisen. Unser engagiertes Team setzt alles daran, Ihre Wünsche professionell und termingerecht umzusetzen. Wir freuen uns auf Ihre Anfrage!`;

    const hero_headline = (data.hero_headline as string) || company_name;
    const hero_subheadline = (data.hero_subheadline as string) ||
      `Professionelle ${industry || "Dienstleistungen"} — persönlich, zuverlässig und zu fairen Preisen.`;

    // ── Normalize testimonials ───────────────────────────────────────────────
    const testimonials = Array.isArray(data.testimonials) && data.testimonials.length === 3
      ? (data.testimonials as Array<{ name: string; role: string; text: string }>)
      : null;

    // ── Normalize team members (medical templates only) ──────────────────────
    const team_members = isMedical && Array.isArray(data.team_members) && data.team_members.length > 0
      ? (data.team_members as Array<{ name: string; title: string; bio: string }>).filter(m => m.name?.trim())
      : null;

    return NextResponse.json({
      meta_title: (data.meta_title as string) || `${company_name} — ${industry || "Ihr Experte"}`,
      meta_description: (data.meta_description as string) || `${company_name}: Professionelle ${industry || "Leistungen"} mit persönlicher Betreuung. Jetzt unverbindlich anfragen!`,
      hero_headline,
      hero_subheadline,
      cta_text: (data.cta_text as string) || "Jetzt anfragen",
      about_text,
      services: services_detailed.map(s => s.title),
      benefits: benefits_detailed.map(b => b.title),
      testimonials,
      auto_filled,
      ai_content: {
        hero_badge: data.hero_badge,
        cta_secondary: data.cta_secondary,
        services_detailed,
        benefits_detailed,
        stats,
        about_headline: (data.about_headline as string) || `Über ${company_name}`,
        about_highlight: data.about_highlight,
        trust_badge: data.trust_badge,
        cta_section_headline: data.cta_section_headline,
        cta_section_text: data.cta_section_text,
        ...(team_members && team_members.length > 0 ? { team_members } : {}),
      },
    });
  } catch (e) {
    console.error("Generate error:", e);
    return NextResponse.json({ error: "KI-Generierung fehlgeschlagen. Bitte API-Key und Guthaben prüfen." }, { status: 500 });
  }
}
