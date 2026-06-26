import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export interface CompanyDNA {
  // Wer sind die?
  business_identity: string;       // 2-3 Sätze: was machen sie, für wen, wo
  brand_voice: string;             // wie kommunizieren sie? formal/locker/technisch/warm
  tone_level: "formal" | "semi-formal" | "locker" | "persönlich";

  // Wie sprechen sie?
  key_phrases: string[];           // ihre eigenen Worte die sie immer verwenden
  communication_style: string;     // Beschreibung des Stils mit Beispielen

  // Was sagen Kunden?
  customer_language: string[];     // Worte/Sätze die Kunden verwenden
  customer_top_praise: string;     // was loben Kunden am meisten (1 Satz)
  customer_pain_solved: string;    // welches Problem lösen sie für Kunden

  // Positionierung
  unique_differentiators: string[];  // 2-3 echte Alleinstellungsmerkmale
  competitive_position: string;      // wie stehen sie im Vergleich zum Wettbewerb da

  // Schwächen & Chancen
  website_weaknesses: string[];    // was ist schlecht an ihrer aktuellen Präsenz
  biggest_opportunity: string;     // die eine größte Chance für die neue Website

  // Empfehlung
  recommended_tone: "warm-einfühlsam" | "modern-souverän" | "premium-exklusiv" | "lokal-persönlich" | "technisch-präzise";
  recommended_hero_angle: string;  // konkrete Headline-Richtung (nicht die fertige Headline)
  target_audience_profile: string; // wer sind die Kunden, was wollen sie
}

function buildAnalysisPrompt(input: {
  company_name: string;
  industry: string;
  city: string;
  website?: string | null;
  description?: string | null;
  about_text?: string | null;
  scraped_hero?: string | null;
  headings?: string[];
  service_pairs?: Array<{ title: string; description: string }>;
  google_reviews?: Array<{ author_name: string; rating: number; text: string }> | null;
  google_rating?: number | null;
  google_rating_count?: number | null;
  trust_signals?: string[];
  opening_hours?: string | null;
  team_members?: Array<{ name: string; title: string }>;
}): string {
  const reviewsText = input.google_reviews && input.google_reviews.length > 0
    ? input.google_reviews.map(r => `${r.rating}★ "${r.text.slice(0, 300)}" — ${r.author_name}`).join("\n")
    : "Keine Rezensionen verfügbar";

  const ratingInfo = input.google_rating
    ? `${input.google_rating}★ aus ${input.google_rating_count ?? "?"} Google-Bewertungen`
    : "";

  const serviceSample = input.service_pairs?.slice(0, 5)
    .map(p => `• ${p.title}: ${p.description.slice(0, 150)}`)
    .join("\n") ?? "";

  return `Du bist ein erfahrener Brand-Stratege und Copywriter. Analysiere dieses Unternehmen tiefgreifend — als würdest du es kennenlernen bevor du eine Website für sie baust.

UNTERNEHMEN: ${input.company_name}
BRANCHE: ${input.industry}
ORT: ${input.city || "Deutschland"}
WEBSITE: ${input.website || "keine"}
${ratingInfo ? `GOOGLE: ${ratingInfo}` : ""}
${input.opening_hours ? `ÖFFNUNGSZEITEN: ${input.opening_hours}` : ""}
${input.team_members?.length ? `TEAM: ${input.team_members.map(m => `${m.name}${m.title ? ` (${m.title})` : ""}`).join(", ")}` : ""}

AKTUELLE WEBSITE-HEADLINE:
${input.scraped_hero || "(nicht verfügbar)"}

SELBSTBESCHREIBUNG / META:
${input.description || "(nicht verfügbar)"}

ÜBER-UNS TEXT (Original):
${input.about_text?.slice(0, 600) || "(nicht verfügbar)"}

LEISTUNGEN (von der Website):
${serviceSample || "(nicht verfügbar)"}

WEBSITE-SEKTIONEN / STRUKTUR:
${input.headings?.slice(0, 10).join(" · ") || "(nicht verfügbar)"}

VERTRAUENSSIGNALE:
${input.trust_signals?.join(" | ") || "(keine)"}

GOOGLE-REZENSIONEN (was echte Kunden sagen):
${reviewsText}

═══════════════════════════════════════════════
AUFGABE: Erstelle eine tiefe Unternehmens-DNA-Analyse.

Beantworte diese Fragen präzise — nicht oberflächlich:
- Wie spricht dieses Unternehmen wirklich? (Tonalität, Formalität, Wortschatz)
- Welche Worte und Sätze sind IHRE eigenen? (nicht Standard-Marketing)
- Was sagen Kunden immer wieder? Welche Emotion steckt dahinter?
- Was macht sie wirklich anders als Wettbewerber in ${input.city || "der Region"}?
- Was ist der schwächste Punkt ihrer aktuellen Präsentation?
- Wenn du EINE Sache ändern würdest für maximale Wirkung — was wäre das?

Antworte NUR mit validem JSON, kein Markdown, kein erklärender Text:

{
  "business_identity": "string (2-3 Sätze: was genau, für wen, besonderes Merkmal)",
  "brand_voice": "string (wie kommunizieren sie — mit konkreten Beispielen aus dem Text)",
  "tone_level": "formal|semi-formal|locker|persönlich",
  "key_phrases": ["ihre eigene Formulierung 1", "Phrase 2", "Phrase 3"],
  "communication_style": "string (Beschreibung des Stils, 2-3 Sätze)",
  "customer_language": ["Wort/Satz den Kunden in Bewertungen nutzen 1", "2", "3"],
  "customer_top_praise": "string (was loben Kunden am meisten — 1 konkreter Satz)",
  "customer_pain_solved": "string (welches Problem lösen sie für Kunden)",
  "unique_differentiators": ["echter Alleinstellungsmerkmal 1", "2", "3"],
  "competitive_position": "string (wie stehen sie da im Vergleich zum Wettbewerb)",
  "website_weaknesses": ["konkreter Schwachpunkt 1", "2"],
  "biggest_opportunity": "string (die eine größte Chance für die neue Website)",
  "recommended_tone": "warm-einfühlsam|modern-souverän|premium-exklusiv|lokal-persönlich|technisch-präzise",
  "recommended_hero_angle": "string (konkrete Richtung für die Headline — z.B. 'Fokus auf Schnelligkeit und Verlässlichkeit, kein Stress für den Kunden')",
  "target_audience_profile": "string (wer sind die Kunden, was wollen sie, was hindert sie)"
}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY fehlt" }, { status: 500 });

  const body = await req.json() as Record<string, unknown>;

  const prompt = buildAnalysisPrompt({
    company_name:     (body.company_name as string) || "",
    industry:         (body.industry as string) || "",
    city:             (body.city as string) || "",
    website:          body.website as string | null,
    description:      body.description as string | null,
    about_text:       body.about_text as string | null,
    scraped_hero:     body.scraped_hero as string | null,
    headings:         body.headings as string[] | undefined,
    service_pairs:    body.service_pairs as Array<{ title: string; description: string }> | undefined,
    google_reviews:   body.google_reviews as Array<{ author_name: string; rating: number; text: string }> | null,
    google_rating:    body.google_rating as number | null,
    google_rating_count: body.google_rating_count as number | null,
    trust_signals:    body.trust_signals as string[] | undefined,
    opening_hours:    body.opening_hours as string | null,
    team_members:     body.team_members as Array<{ name: string; title: string }> | undefined,
  });

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model:      "claude-opus-4-5",
      max_tokens: 2000,
      system:     "Du bist ein erfahrener Brand-Stratege. Antworte ausschließlich mit validem JSON — kein Markdown, kein Text davor oder danach.",
      messages:   [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "{}";
    const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "Kein JSON in der Antwort" }, { status: 500 });

    const dna = JSON.parse(match[0]) as CompanyDNA;
    return NextResponse.json({ dna });

  } catch (err) {
    const msg = (err as Error).message || "Analyse fehlgeschlagen";
    console.error("[lead-analyze] Fehler:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
