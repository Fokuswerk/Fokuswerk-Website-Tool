import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServicePair   { title: string; description: string }
interface TeamMember    { name: string; title: string }
interface FaqItem       { question: string; answer: string }

// ─── Basic helpers ────────────────────────────────────────────────────────────

function extractMeta(html: string, name: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return null;
}

function resolveUrl(src: string, baseUrl: URL): string {
  if (!src || src.startsWith("data:")) return "";
  if (src.startsWith("http")) return src;
  if (src.startsWith("//")) return `${baseUrl.protocol}${src}`;
  if (src.startsWith("/")) return `${baseUrl.protocol}//${baseUrl.hostname}${src}`;
  return `${baseUrl.protocol}//${baseUrl.hostname}/${src}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
}

function cleanPhone(raw: string): string | null {
  const cleaned = raw.replace(/[^\d\+\s\-\(\)\/]/g, "").replace(/\s+/g, " ").trim();
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15) return null;
  return cleaned.slice(0, 20);
}

const GENERIC_PAGE_NAMES = new Set([
  "startseite", "home", "willkommen", "welcome", "index", "main",
  "über uns", "about", "kontakt", "contact", "impressum", "datenschutz",
  "news", "blog", "aktuelles", "angebot", "leistungen", "services",
]);

function smartTitle(raw: string): string {
  const parts = raw.split(/\s*[|\-–—]\s*/);
  if (parts.length >= 2) {
    const first = parts[0].trim();
    const last  = parts[parts.length - 1].trim();
    if (GENERIC_PAGE_NAMES.has(first.toLowerCase())) return last;
    if (GENERIC_PAGE_NAMES.has(last.toLowerCase())) return first;
    return first;
  }
  return raw.trim();
}

// ─── JSON-LD extraction ───────────────────────────────────────────────────────

interface LdResult {
  name: string | null; telephone: string | null; email: string | null;
  streetAddress: string | null; addressLocality: string | null; postalCode: string | null;
  logo: string | null; description: string | null;
  openingHours: string[] | null; geo: string | null;
  foundingYear: string | null; numberOfEmployees: string | null;
  areaServed: string | null; priceRange: string | null;
  aggregateRating: { ratingValue: string; reviewCount: string } | null;
  faqItems: FaqItem[];
}

function extractJsonLd(html: string): LdResult {
  const result: LdResult = {
    name: null, telephone: null, email: null,
    streetAddress: null, addressLocality: null, postalCode: null,
    logo: null, description: null, openingHours: null, geo: null,
    foundingYear: null, numberOfEmployees: null, areaServed: null,
    priceRange: null, aggregateRating: null, faqItems: [],
  };

  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const obj = JSON.parse(block[1].trim());
      const items: unknown[] = [];
      if (Array.isArray(obj?.["@graph"])) items.push(...obj["@graph"]);
      else if (Array.isArray(obj)) items.push(...obj);
      else items.push(obj);

      for (const item of items) {
        if (typeof item !== "object" || !item) continue;
        const d = item as Record<string, unknown>;
        const type = (d["@type"] as string || "").toLowerCase();

        if (!result.name && typeof d.name === "string" && d.name.length > 1)
          result.name = d.name.trim();

        if (!result.telephone && typeof d.telephone === "string")
          result.telephone = cleanPhone(d.telephone);

        if (!result.email && typeof d.email === "string" && d.email.includes("@"))
          result.email = d.email.trim();

        const addr = d.address as Record<string, unknown> | undefined;
        if (addr) {
          if (!result.streetAddress && typeof addr.streetAddress === "string")
            result.streetAddress = addr.streetAddress.trim();
          if (!result.addressLocality && typeof addr.addressLocality === "string")
            result.addressLocality = addr.addressLocality.trim();
          if (!result.postalCode && typeof addr.postalCode === "string")
            result.postalCode = addr.postalCode.trim();
        }

        const logo = d.logo as Record<string, unknown> | string | undefined;
        if (!result.logo) {
          if (typeof logo === "string") result.logo = logo;
          else if (logo && typeof (logo as Record<string, unknown>).url === "string")
            result.logo = (logo as Record<string, unknown>).url as string;
        }

        if (!result.description && typeof d.description === "string" && d.description.length > 20)
          result.description = d.description.trim().slice(0, 400);

        // Opening hours
        if (!result.openingHours && d.openingHours) {
          const oh = d.openingHours;
          if (Array.isArray(oh)) result.openingHours = oh as string[];
          else if (typeof oh === "string") result.openingHours = [oh];
        }

        // Geo coordinates
        const geo = d.geo as Record<string, unknown> | undefined;
        if (!result.geo && geo && geo.latitude && geo.longitude)
          result.geo = `${geo.latitude},${geo.longitude}`;

        // Founding year
        if (!result.foundingYear && typeof d.foundingDate === "string")
          result.foundingYear = d.foundingDate.slice(0, 4);

        // Area served
        if (!result.areaServed && typeof d.areaServed === "string")
          result.areaServed = d.areaServed;

        // Price range
        if (!result.priceRange && typeof d.priceRange === "string")
          result.priceRange = d.priceRange;

        // Aggregate rating
        const ar = d.aggregateRating as Record<string, unknown> | undefined;
        if (!result.aggregateRating && ar && ar.ratingValue) {
          result.aggregateRating = {
            ratingValue: String(ar.ratingValue),
            reviewCount: String(ar.reviewCount || ""),
          };
        }

        // FAQ items
        if (type === "faqpage" && Array.isArray(d.mainEntity)) {
          for (const q of d.mainEntity as Record<string, unknown>[]) {
            const question = typeof q.name === "string" ? q.name.trim() : "";
            const answerObj = q.acceptedAnswer as Record<string, unknown> | undefined;
            const answer = typeof answerObj?.text === "string" ? stripHtml(answerObj.text).slice(0, 200) : "";
            if (question && answer) result.faqItems.push({ question, answer });
          }
        }
      }
    } catch { /* skip malformed */ }
  }
  return result;
}

// ─── Opening hours extractor ──────────────────────────────────────────────────

function extractOpeningHours(html: string): string | null {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  // Pattern: "Mo – Fr: 08:00 – 17:00 Uhr" and variants
  const hourPattern = /(?:Mo(?:ntag)?|Di(?:enstag)?|Mi(?:ttwoch)?|Do(?:nnerstag)?|Fr(?:eitag)?|Sa(?:mstag)?|So(?:nntag)?)\s*[–\-bis]+\s*(?:Mo(?:ntag)?|Di(?:enstag)?|Mi(?:ttwoch)?|Do(?:nnerstag)?|Fr(?:eitag)?|Sa(?:mstag)?|So(?:nntag)?)?\s*:?\s*\d{1,2}[:.]\d{2}\s*(?:–|bis|-)\s*\d{1,2}[:.]\d{2}\s*(?:Uhr)?/gi;
  const matches = [...plain.matchAll(hourPattern)].map(m => m[0].trim()).slice(0, 6);
  if (matches.length > 0) return matches.join(" | ");

  // JSON-LD style: "Mo-Fr 08:00-17:00"
  const shortPattern = /(?:Mo|Di|Mi|Do|Fr|Sa|So)(?:-(?:Mo|Di|Mi|Do|Fr|Sa|So))?\s+\d{2}:\d{2}-\d{2}:\d{2}/gi;
  const shortMatches = [...plain.matchAll(shortPattern)].map(m => m[0]).slice(0, 6);
  if (shortMatches.length > 0) return shortMatches.join(" | ");

  return null;
}

// ─── Team member extractor ────────────────────────────────────────────────────

function extractTeamMembers(html: string): TeamMember[] {
  const members: TeamMember[] = [];
  const seen = new Set<string>();

  // Pattern 1: Dr./Prof. names in headings or paragraphs
  const namePattern = /(?:Dr\.|Prof\.|Dr\.-Ing\.|Dipl\.-|M\.Sc\.|MBA|LL\.M\.)\s+[A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+){0,2}/g;
  const plain = stripHtml(html);
  for (const m of plain.matchAll(namePattern)) {
    const name = m[0].trim();
    if (!seen.has(name) && name.length < 60) {
      seen.add(name);
      // Try to find title in surrounding text (simplistic)
      members.push({ name, title: "" });
    }
  }

  // Pattern 2: <h3> or <h4> inside a team/staff section
  const teamSectionRe = /(?:team|mitarbeiter|praxisteam|unser.{0,10}team|über uns)/i;
  const sectionMatches = [...html.matchAll(/<(?:section|div)[^>]*(?:class|id)=["'][^"']*(?:team|staff|mitarbeiter|about)[^"']*["'][^>]*>([\s\S]{0,3000}?)<\/(?:section|div)>/gi)];

  for (const sec of sectionMatches) {
    if (!teamSectionRe.test(sec[0].slice(0, 100))) continue;
    const hMatches = [...sec[1].matchAll(/<h[3-4][^>]*>([\s\S]*?)<\/h[3-4]>/gi)];
    for (const h of hMatches) {
      const name = stripHtml(h[1]).trim();
      if (name.length > 3 && name.length < 60 && !seen.has(name) && /[A-ZÄÖÜ]/.test(name)) {
        seen.add(name);
        members.push({ name, title: "" });
      }
    }
  }

  return members.slice(0, 8);
}

// ─── Trust signal extractor ───────────────────────────────────────────────────

function extractTrustSignals(html: string, ldResult: LdResult): string[] {
  const signals: string[] = [];
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  // Years in business
  const yearMatch = plain.match(/(?:seit|since|gegründet|founded|bereits)\s+(?:dem\s+)?(?:Jahr\s+)?(\d{4})/i);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    const currentYear = new Date().getFullYear();
    if (year > 1900 && year < currentYear) {
      signals.push(`Seit ${year} — ${currentYear - year} Jahre Erfahrung`);
    }
  }

  // JSON-LD founding year
  if (ldResult.foundingYear && !signals.length) {
    const year = parseInt(ldResult.foundingYear);
    const currentYear = new Date().getFullYear();
    if (year > 1900 && year < currentYear) {
      signals.push(`Gegründet ${year} (${currentYear - year} Jahre)`);
    }
  }

  // Ratings
  if (ldResult.aggregateRating) {
    const { ratingValue, reviewCount } = ldResult.aggregateRating;
    signals.push(`${ratingValue} Sterne${reviewCount ? ` aus ${reviewCount} Bewertungen` : ""}`);
  }

  // Patient/customer count mentions
  const patientMatch = plain.match(/(?:über|more than|bereits)?\s*(\d[\d.,]*)\s*(?:\+)?\s*(?:Patienten|Kunden|Mandanten|Fälle|Behandlungen|zufriedene|Kunden)/i);
  if (patientMatch) signals.push(`${patientMatch[1]}+ ${patientMatch[2] || "Kunden"}`);

  // Certifications
  const certPattern = /(?:TÜV|ISO\s*\d+|DIN\s*\d+|zertifiziert|akkreditiert|ausgezeichnet|award|preis|zertifikat)/gi;
  for (const m of plain.matchAll(certPattern)) {
    const snippet = plain.slice(Math.max(0, (m.index || 0) - 10), (m.index || 0) + 60).trim();
    if (snippet.length > 10) signals.push(snippet.replace(/\s+/g, " "));
    if (signals.length >= 6) break;
  }

  // Insurance types (medical)
  if (/kassenarzt|kassenzulassung|gesetzlich|privat\s?patient|alle kassen/i.test(plain)) {
    const insuranceMatch = plain.match(/(?:kassenarzt|alle\s+gesetzlichen\s+Krankenkassen|privat\s*und\s*kassenpatient)/i);
    if (insuranceMatch) signals.push(insuranceMatch[0]);
  }

  // Price range from JSON-LD
  if (ldResult.priceRange) signals.push(`Preisklasse: ${ldResult.priceRange}`);

  return [...new Set(signals)].slice(0, 6);
}

// ─── Content pair extractor (heading + following paragraphs) ──────────────────

function extractContentPairs(html: string): ServicePair[] {
  const pairs: ServicePair[] = [];

  // Tokenize: extract all h2/h3 and p elements in document order
  const tokenRe = /<(h[23]|p)([^>]*)>([\s\S]*?)<\/(h[23]|p)>/gi;
  const tokens: Array<{ tag: string; text: string }> = [];
  for (const m of html.matchAll(tokenRe)) {
    const text = stripHtml(m[3]).trim();
    if (text.length > 2) tokens.push({ tag: m[1], text });
  }

  let currentHeading = "";
  const pendingParas: string[] = [];

  const flush = () => {
    if (currentHeading && pendingParas.length) {
      const desc = pendingParas.filter(p => p.length > 20).slice(0, 3).join(" ").slice(0, 400);
      if (desc.length > 30) pairs.push({ title: currentHeading, description: desc });
    }
    pendingParas.length = 0;
  };

  for (const token of tokens) {
    if (token.tag === "h2" || token.tag === "h3") {
      flush();
      currentHeading = token.text;
    } else if (token.tag === "p" && currentHeading) {
      if (token.text.length > 20) pendingParas.push(token.text);
    }
  }
  flush();

  return pairs;
}

// ─── FAQ extractor (HTML-based fallback) ─────────────────────────────────────

function extractFaq(html: string): FaqItem[] {
  const items: FaqItem[] = [];

  // Look for FAQ-like sections: question in strong/dt/h3/h4, answer in p/dd
  const faqBlockRe = /<(?:details|div)[^>]*(?:class|id)=["'][^"']*(?:faq|häufig|question|accordion)[^"']*["'][^>]*>([\s\S]{0,2000}?)<\/(?:details|div)>/gi;

  for (const block of html.matchAll(faqBlockRe)) {
    const inner = block[1];
    const qMatch = inner.match(/<(?:summary|strong|h[3-5]|dt)[^>]*>([\s\S]*?)<\/(?:summary|strong|h[3-5]|dt)>/i);
    const aMatch = inner.match(/<(?:p|dd|div)[^>]*>([\s\S]*?)<\/(?:p|dd|div)>/i);
    if (qMatch && aMatch) {
      const question = stripHtml(qMatch[1]).trim();
      const answer   = stripHtml(aMatch[1]).trim().slice(0, 200);
      if (question.length > 8 && answer.length > 15) {
        items.push({ question, answer });
      }
    }
    if (items.length >= 5) break;
  }

  return items;
}

// ─── Rating/review extractor ──────────────────────────────────────────────────

function extractRating(html: string, ldResult: LdResult): string | null {
  if (ldResult.aggregateRating) {
    const { ratingValue, reviewCount } = ldResult.aggregateRating;
    return reviewCount
      ? `${ratingValue}/5 Sterne (${reviewCount} Bewertungen)`
      : `${ratingValue}/5 Sterne`;
  }

  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const ratingMatch = plain.match(/(\d[.,]\d)\s*(?:von|out of|\/)\s*5?\s*(?:Stern|Star|★)/i);
  if (ratingMatch) return `${ratingMatch[1]}/5 Sterne`;

  const googleMatch = plain.match(/Google[^.]{0,30}(\d[.,]\d)\s*(?:Sterne|Stern|★)/i);
  if (googleMatch) return `Google: ${googleMatch[1]}/5 Sterne`;

  return null;
}

// ─── Insurance/payment info ───────────────────────────────────────────────────

function extractInsuranceInfo(html: string): string | null {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (/alle\s+gesetzlichen\s+krankenkassen/i.test(plain)) return "Alle gesetzlichen Krankenkassen";
  if (/privat\s*-?\s*und\s*kassenpatient/i.test(plain)) return "Privat- und Kassenpatienten";
  if (/kassenärztlich\s+zugelassen|kassenzulassung/i.test(plain)) return "Kassenärztlich zugelassen";
  if (/privatpatient/i.test(plain) && !/kassenpatient/i.test(plain)) return "Schwerpunkt Privatpatienten";
  return null;
}

// ─── Primary color extraction ────────────────────────────────────────────────

function isUsableRgb(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2 / 255;
  const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
  if (lightness > 0.88 || lightness < 0.06) return false;
  if (saturation < 0.15) return false;
  return true;
}

function isUsableColor(hex: string): boolean {
  const h = hex.replace("#", "").toLowerCase();
  if (h.length === 3) {
    return isUsableRgb(parseInt(h[0]+h[0],16), parseInt(h[1]+h[1],16), parseInt(h[2]+h[2],16));
  }
  if (h.length === 6) {
    return isUsableRgb(parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16));
  }
  return false;
}

function firstHex(text: string): string | null {
  const m = text.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/);
  return m ? m[0] : null;
}

function extractPrimaryColor(html: string): string | null {
  // 1. theme-color meta
  const themeMeta = extractMeta(html, "theme-color");
  if (themeMeta) {
    const hex = firstHex(themeMeta);
    if (hex && isUsableColor(hex)) return hex;
  }

  const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  const css = styleBlocks.map(m => m[1]).join("\n");

  // 2a. CSS custom properties
  const varPattern = /--(?:color-)?(?:primary|brand|accent|main|theme|highlight|corporate)(?:-color|-bg)?[\s\S]{0,6}:\s*(#[0-9a-fA-F]{3,6})/gi;
  for (const m of css.matchAll(varPattern)) {
    if (isUsableColor(m[1])) return m[1];
  }

  // 2b. Button/CTA background
  const btnPattern = /(?:\.btn(?:-primary)?|\.button(?:-primary)?|\.cta|\.wp-block-button|a\.btn)[^{]{0,80}\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi;
  for (const m of css.matchAll(btnPattern)) {
    if (isUsableColor(m[1])) return m[1];
  }

  // 2c. Link color
  const linkPattern = /(?:^|[\s,{])a(?:\s*,\s*a)?[^{]{0,20}\{[^}]*color:\s*(#[0-9a-fA-F]{3,6})/gm;
  for (const m of css.matchAll(linkPattern)) {
    if (isUsableColor(m[1])) return m[1];
  }

  // 2d. Header/nav background
  const navPattern = /(?:header|\.header|#header|nav|\.nav|\.navbar|\.site-header)[^{]{0,40}\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi;
  for (const m of css.matchAll(navPattern)) {
    if (isUsableColor(m[1])) return m[1];
  }

  // 3. Inline styles
  const inlinePattern = /<(?:header|nav|button|a)[^>]+style=["'][^"']*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi;
  for (const m of html.matchAll(inlinePattern)) {
    if (isUsableColor(m[1])) return m[1];
  }

  return null;
}

// ─── Industry detection ───────────────────────────────────────────────────────

function detectIndustry(text: string): string | null {
  const t = text.toLowerCase();
  if (t.match(/zahnarzt|dental|zahn|kieferorthopädie|implantolog/)) return "Zahnarzt";
  if (t.match(/physiotherap|krankengymnastik|osteopath/)) return "Physiotherapie";
  if (t.match(/arzt|praxis|medizin|klinik|gesundheit|allgemeinmedizin/)) return "Arztpraxis";
  if (t.match(/café|cafe|kaffee|bäckerei|konditorei/)) return "Café & Bäckerei";
  if (t.match(/restaurant|gastronom|speisekar|küche|bistro|wirtshaus/)) return "Gastronomie";
  if (t.match(/catering|event.*küche|hochzeit.*essen/)) return "Catering";
  if (t.match(/elektriker|elektroinstallation|elektrotechnik/)) return "Elektrotechnik";
  if (t.match(/sanitär|heizung|klempner|rohrleitung/)) return "Sanitär & Heizung";
  if (t.match(/maler|lackier|malermeister|fassade/)) return "Malerbetrieb";
  if (t.match(/dachdeck|dachsanierung/)) return "Dachdeckerei";
  if (t.match(/schlosser|metallbau|schweißerei/)) return "Metallbau";
  if (t.match(/\bhandwerk\b|bauunternehm|baumeister|bauservice/)) return "Handwerk & Bau";
  if (t.match(/friseur|frisör|hairstylist|haarschnitt|barbershop/)) return "Friseur";
  if (t.match(/kosmetik|beauty|nagel|wellness|spa|visagist/)) return "Beauty & Wellness";
  if (t.match(/immobilien|makler|hausverwaltung/)) return "Immobilien";
  if (t.match(/rechtsanwalt|anwalt|kanzlei|jurist|notar/)) return "Rechtsanwalt";
  if (t.match(/steuerberater|steuerkanzlei|buchhalter/)) return "Steuerberatung";
  if (t.match(/versicherung|versicherungsmakler/)) return "Versicherungen";
  if (t.match(/fitnessstudio|gym|fitness|personal.?training/)) return "Fitness & Sport";
  if (t.match(/yoga|pilates|tanzschule/)) return "Yoga & Tanz";
  if (t.match(/kfz|autowerkstatt|autohaus|reifenservice/)) return "KFZ-Werkstatt";
  if (t.match(/reinigung|gebäudereinigung|putzservice/)) return "Gebäudereinigung";
  if (t.match(/garten|landschaftsbau|gartenpflege/)) return "Garten & Landschaft";
  if (t.match(/softwareentwicklung|webentwicklung|it-service|it-dienstleistung/)) return "IT & Software";
  if (t.match(/marketing|werbeagentur|digitalagentur|seo.?agentur/)) return "Marketing & Agentur";
  if (t.match(/tierarzt|tierpflege|hundesalon/)) return "Tierdienstleistungen";
  if (t.match(/umzug|spedition|transport|kurierdienst/)) return "Transport & Umzug";
  if (t.match(/fotograf|fotostudio|videograf|filmproduktion/)) return "Fotografie & Film";
  return null;
}

// ─── Structural heading filter ────────────────────────────────────────────────

// Exakter Match (ganzer Titel ist strukturell)
const STRUCTURAL_EXACT = /^(kontakt|öffnungszeiten?|sprechzeiten?|über uns|über mich|impressum|datenschutz|willkommen|news|blog|jobs|karriere|partner|anfahrt|galerie|bildergalerie|zertifikat|testimonial|häufige fragen|faq|newsletter|fotos|welcome|startseite|home|weiterlesen|mehr erfahren|alle leistungen|jetzt buchen|termin online|online termin|benefits?|vorteile|warum wir|unser team|das team|team|zfa|mfa|zfa\/mfa|zahnmedizinische fachangestellte?|medizinische fachangestellte?|rezeption|sekretariat|praxisteam|anmeldung|empfang|referenzen|bewertungen|kundenstimmen|patientenstimmen|lob|feedback|hygiene|corona|covid|aktuell|aktuelles|neuigkeiten|presse|medien|auszeichnung|award|information|informationen|downloads?|formulare?|rechtliches|agb|cookie|ausbildung|azubi|auszubildende?|praktikum|stellenangebot|offene stellen|karriere|jobs)$/i;

// Präfix-Match (Titel BEGINNT mit strukturellem Begriff)
const STRUCTURAL_PREFIX = /^(aufnahmebogen|praxisrundgang|wir freuen|wir heißen|wir begrüß|wir stellen|wir suchen|herzlich willkommen|ihr weg|der weg zu|so finden sie|kontaktieren sie|schreiben sie|rufen sie an|aus der praxis|das sagen|was sagen|mehr\s+infos|mehr\s+dazu|lesen\s+sie|erfahren\s+sie|stellenangebot|stellenanzeige|ausbildung|ausbildungsplatz|auszubildende|azubi|praktikum|praktikant|bewerbung|bewerben|mitarbeiter gesucht|offene stellen|karriere bei|jetzt bewerben|wir bilden|wir suchen verstärkung|werden sie teil|google bewertung|wichtige hinweise|neupatient|new patient|erstbesuch|praxisbesuch|ihr besuch|der besuch|ihr erste|ihre erste|ihr zahnarzt|ihre zahnarzt|ihr arzt|willkommen bei|empfehlung|zur\s)/i;

// Begriffe die IRGENDWO im Titel vorkommen dürfen nie als Leistung durchgehen
const STRUCTURAL_CONTAINS = /\b(zfa|mfa|auszubildende?|azubi|stellenangebot|praktikum|bewerbung|ausbildungsplatz|bewerben|wir bilden aus|zahnmedizinische fachangestellte?|medizinische fachangestellte?)\b/i;

// Kombinierter Filter
function isStructural(heading: string): boolean {
  const h = heading.trim();
  return STRUCTURAL_EXACT.test(h) || STRUCTURAL_PREFIX.test(h) || STRUCTURAL_CONTAINS.test(h);
}

// Legacy export für bestehende Aufrufe
const STRUCTURAL = { test: (h: string) => isStructural(h) };

// ─── Apify RAG Web Browser (Fallback für JS-heavy Sites) ─────────────────────

interface ApifyResult { markdown?: string; text?: string; url?: string }

async function fetchWithApify(url: string): Promise<string | null> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~rag-web-browser/run-sync-get-dataset-items?token=${token}&timeout=45`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUrls: [{ url }],
          maxCrawlPages: 1,
          outputFormats: ["markdown"],
          proxyConfiguration: { useApifyProxy: true },
        }),
        signal: AbortSignal.timeout(50_000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json() as ApifyResult[];
    return data[0]?.markdown || data[0]?.text || null;
  } catch {
    return null;
  }
}

// Extrahiert Klartext aus Markdown (entfernt #, **, Links etc.)
function markdownToText(md: string): string {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, "")      // Bilder
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links → Linktext
    .replace(/#{1,6}\s*/g, "")             // Überschriften
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1") // Fett/Kursiv
    .replace(/`[^`]+`/g, "")              // Code
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Extrahiert Service-Überschriften aus Markdown
function extractMarkdownServices(md: string): string[] {
  const services: string[] = [];
  const lines = md.split("\n");
  for (const line of lines) {
    const m = line.match(/^#{2,3}\s+(.+)$/);
    if (m) {
      const title = m[1].replace(/\*+/g, "").trim();
      if (title.length > 3 && title.length < 100 && !STRUCTURAL.test(title)) {
        services.push(title);
      }
    }
  }
  return [...new Set(services)].slice(0, 20);
}

// Extrahiert Content-Pairs aus Markdown (Überschrift + nachfolgender Text)
function extractMarkdownPairs(md: string): ServicePair[] {
  const pairs: ServicePair[] = [];
  const blocks = md.split(/\n(?=#{2,3}\s)/);
  for (const block of blocks) {
    const headingMatch = block.match(/^#{2,3}\s+(.+)/);
    if (!headingMatch) continue;
    const title = headingMatch[1].replace(/\*+/g, "").trim();
    if (title.length < 4 || title.length > 100 || STRUCTURAL.test(title)) continue;
    const rest = block.replace(/^#{2,3}\s+.+\n?/, "").trim();
    const description = markdownToText(rest).slice(0, 400);
    if (description.length > 30) pairs.push({ title, description });
  }
  return pairs.slice(0, 12);
}

// ─── Fetch helper with timeout ────────────────────────────────────────────────

async function fetchPage(url: string, timeoutMs = 6000): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.5",
      },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url, company_name: company_name_param } = body as { url: string; company_name?: string };
  if (!url) return NextResponse.json({ error: "URL fehlt" }, { status: 400 });

  let baseUrl: URL;
  try {
    baseUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return NextResponse.json({ error: "Ungültige URL" }, { status: 400 });
  }

  // ── Apify + Homepage parallel starten ───────────────────────────────────────
  // Apify läuft IMMER parallel — gibt Markdown auch wenn HTML-Scraper gut funktioniert
  const [homeHtml, apifyMarkdown] = await Promise.all([
    fetchPage(baseUrl.href, 12000),
    fetchWithApify(baseUrl.href),
  ]);

  if (!safeHomeHtml && !apifyMarkdown) {
    return NextResponse.json({ error: "Website konnte nicht geladen werden." }, { status: 422 });
  }

  const safeHomeHtml = safeHomeHtml ?? "";
  const origin = `${baseUrl.protocol}//${baseUrl.hostname}`;

  // ── Try sitemap.xml first — best way to discover all pages ──────────────────
  async function getSitemapUrls(): Promise<string[]> {
    const sitemapUrls = [
      `${origin}/sitemap.xml`,
      `${origin}/sitemap_index.xml`,
      `${origin}/sitemap/`,
    ];
    for (const sUrl of sitemapUrls) {
      try {
        const r = await fetch(sUrl, { signal: AbortSignal.timeout(4000), headers: { "User-Agent": "Mozilla/5.0" } });
        if (!r.ok) continue;
        const text = await r.text();
        const urls = [...text.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/gi)].map(m => m[1].trim());
        if (urls.length > 0) return urls.filter(u => u.startsWith(origin));
      } catch { /* skip */ }
    }
    return [];
  }

  // ── Discover subpage URLs from nav links ─────────────────────────────────────
  // Very broad patterns — better to match too much than too little
  const NAV_SERVICE_RE = /leistung|behandlung|service|angebot|therapie|speziali|eingriff|portfolio|diagnostik|vorsorge|untersuchung|spektrum|praxisleistung|gesundheit|medizin|leistungsangebot|leistungs-|praxis-leistung|unser.*angebot|was.*wir.*machen|unser.*angebot/i;
  const NAV_ABOUT_RE   = /über\s*uns|über\s*mich|team|praxis|kanzlei|unternehmen|wir\s*sind|about|die-praxis|praxisteam|wir-über|wir-stellen|wir-sind/i;
  const NAV_CONTACT_RE = /kontakt|contact|öffnungszeit|sprechzeit|anfahrt|erreichbarkeit/i;

  const navLinks = [...safeHomeHtml.matchAll(/<a[^>]+href=["']([^"'#?\s][^"'?\s]*)["'][^>]*>([\s\S]*?)<\/a>/gi)];

  const serviceUrls: string[] = [];
  const aboutUrls:   string[] = [];
  const contactUrls: string[] = [];

  for (const m of navLinks) {
    const href = m[1];
    const text = stripHtml(m[2]);
    const resolved = resolveUrl(href, baseUrl);
    if (!resolved.startsWith(origin) || resolved === baseUrl.href) continue;

    if (NAV_SERVICE_RE.test(text) || NAV_SERVICE_RE.test(href)) {
      if (!serviceUrls.includes(resolved)) serviceUrls.push(resolved);
    } else if (NAV_ABOUT_RE.test(text) || NAV_ABOUT_RE.test(href)) {
      if (!aboutUrls.includes(resolved)) aboutUrls.push(resolved);
    } else if (NAV_CONTACT_RE.test(text) || NAV_CONTACT_RE.test(href)) {
      if (!contactUrls.includes(resolved)) contactUrls.push(resolved);
    }
  }

  // ── Sitemap discovery (parallel with above) ──────────────────────────────────
  const sitemapUrls = await getSitemapUrls();

  // Filter sitemap URLs into categories
  const SERVICE_PATH_RE = /leistung|behandlung|service|angebot|therapie|speziali|eingriff|diagnostik|vorsorge|untersuchung|spektrum|gesundheit|medizin/i;
  const ABOUT_PATH_RE   = /ueber-uns|ueber-mich|about|team|praxis(?!-leistung)|praxisteam|die-praxis/i;
  const CONTACT_PATH_RE = /kontakt|contact|oeffnungszeit|sprechzeit|anfahrt/i;

  for (const u of sitemapUrls) {
    const path = new URL(u).pathname;
    if (SERVICE_PATH_RE.test(path) && !serviceUrls.includes(u)) serviceUrls.push(u);
    else if (ABOUT_PATH_RE.test(path) && !aboutUrls.includes(u)) aboutUrls.push(u);
    else if (CONTACT_PATH_RE.test(path) && !contactUrls.includes(u)) contactUrls.push(u);
  }

  // ── Comprehensive fallback paths (German web reality) ────────────────────────
  const commonService = [
    // Generic
    "/leistungen/", "/leistungen", "/behandlungen/", "/behandlungen",
    "/services/", "/angebot/", "/unser-angebot/",
    // Medical specific
    "/leistungsspektrum/", "/behandlungsspektrum/", "/praxisleistungen/",
    "/medizinische-leistungen/", "/diagnostik/", "/vorsorge/", "/vorsorgeuntersuchungen/",
    "/spezialgebiete/", "/gesundheitsleistungen/", "/hausaerztliche-leistungen/",
    "/leistungen-und-angebote/", "/unser-leistungsspektrum/", "/praxis-leistungen/",
    // Handwerk
    "/unsere-leistungen/", "/unsere-arbeiten/", "/referenzen/", "/taetigkeiten/",
    // Other
    "/portfolio/", "/was-wir-machen/", "/angebote/",
  ].map(p => `${origin}${p}`);

  const commonAbout = [
    "/ueber-uns/", "/ueber-uns", "/about/", "/about-us/",
    "/team/", "/praxis/", "/die-praxis/", "/kanzlei/",
    "/praxisteam/", "/wir-ueber-uns/", "/das-team/",
    "/unser-team/", "/unternehmen/",
  ].map(p => `${origin}${p}`);

  const commonContact = [
    "/kontakt/", "/kontakt", "/contact/",
    "/oeffnungszeiten/", "/sprechzeiten/", "/erreichbarkeit/",
  ].map(p => `${origin}${p}`);

  const dedupe = (arr: string[], extra: string[]) => [...new Set([...arr, ...extra])];

  // Prioritize nav-detected URLs (most reliable), then sitemap, then guesses
  const toFetchService = dedupe(serviceUrls, commonService).slice(0, 5);
  const toFetchAbout   = dedupe(aboutUrls,   commonAbout).slice(0, 3);
  const toFetchContact = dedupe(contactUrls, commonContact).slice(0, 3);

  // ── Parallel fetch all subpages ──────────────────────────────────────────────
  const [serviceResults, aboutResults, contactResults] = await Promise.all([
    Promise.allSettled(toFetchService.map(u => fetchPage(u, 6000))),
    Promise.allSettled(toFetchAbout.map(u => fetchPage(u, 5000))),
    Promise.allSettled(toFetchContact.map(u => fetchPage(u, 5000))),
  ]);

  const serviceHtmls = serviceResults.map(r => r.status === "fulfilled" && r.value ? r.value : null).filter(Boolean) as string[];
  const aboutHtmls   = aboutResults.map(r => r.status === "fulfilled" && r.value ? r.value : null).filter(Boolean) as string[];
  const contactHtmls = contactResults.map(r => r.status === "fulfilled" && r.value ? r.value : null).filter(Boolean) as string[];

  // ── Parse homepage ────────────────────────────────────────────────────────────
  const ld = extractJsonLd(safeHomeHtml);

  // Company name
  const ogSiteName = extractMeta(safeHomeHtml, "og:site_name");
  const rawTitle   = safeHomeHtml.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || null;
  let title: string | null =
    ld.name ||
    (ogSiteName && !GENERIC_PAGE_NAMES.has(ogSiteName.toLowerCase()) ? ogSiteName : null) ||
    (rawTitle ? smartTitle(rawTitle) : null);
  if (title && (title.length > 80 || title.length < 2)) title = null;

  // Description
  const description =
    ld.description ||
    extractMeta(safeHomeHtml, "description") ||
    extractMeta(safeHomeHtml, "og:description") ||
    null;

  // H1
  const h1Raw = safeHomeHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "";
  const h1    = stripHtml(h1Raw).slice(0, 150) || null;

  // Phone
  let phone: string | null = ld.telephone || null;
  if (!phone) {
    for (const m of safeHomeHtml.matchAll(/href=["']tel:([^"'\s]+)["']/gi)) {
      const c = cleanPhone(decodeURIComponent(m[1]));
      if (c) { phone = c; break; }
    }
  }
  if (!phone) {
    const pt = safeHomeHtml.replace(/<[^>]+>/g, " ");
    const lm = pt.match(/(?:Tel(?:efon)?\.?|Fon|Telefonnummer|Rufnummer)\s*[:.]?\s*((?:\+49|0)[0-9\s\-\(\)\/]{6,18})/i);
    if (lm?.[1]) phone = cleanPhone(lm[1]);
  }
  if (!phone) {
    const pt = safeHomeHtml.replace(/<[^>]+>/g, " ");
    const im = pt.match(/(\+49\s?[\d\s\-\(\)\/]{6,16})/);
    if (im?.[1]) phone = cleanPhone(im[1]);
  }

  // Also try contact page for phone
  if (!phone) {
    for (const html of contactHtmls) {
      for (const m of html.matchAll(/href=["']tel:([^"'\s]+)["']/gi)) {
        const c = cleanPhone(decodeURIComponent(m[1]));
        if (c) { phone = c; break; }
      }
      if (phone) break;
    }
  }

  // Email
  const SPAM_EMAILS = /noreply|no-reply|example\.|@sentry|@webpack|your@|test@|admin@.*\.js/i;
  let email: string | null = null;
  if (ld.email && !SPAM_EMAILS.test(ld.email)) email = ld.email;
  if (!email) {
    for (const m of safeHomeHtml.matchAll(/href=["']mailto:([^"'\s?]+)["']/gi)) {
      const c = m[1].trim().toLowerCase();
      if (c.includes("@") && !SPAM_EMAILS.test(c)) { email = c; break; }
    }
  }
  if (!email) {
    const em = safeHomeHtml.match(/\b([a-zA-Z0-9._%+\-]{2,40}@[a-zA-Z0-9.\-]{2,30}\.[a-zA-Z]{2,6})\b/);
    if (em?.[1] && !SPAM_EMAILS.test(em[1])) email = em[1].toLowerCase();
  }

  // Address
  let address: string | null = null;
  if (ld.streetAddress || ld.postalCode) {
    const parts = [ld.streetAddress, [ld.postalCode, ld.addressLocality].filter(Boolean).join(" ")].filter(Boolean);
    address = parts.join(", ");
  }
  if (!address) {
    const pt = safeHomeHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const sm = pt.match(/([A-ZÄÖÜ][a-zäöüß]+(?:straße|str\.|gasse|weg|allee|platz|ring|damm|chaussee|steig)\.?\s+\d+\s?[a-zA-Z]?)/i);
    const pm = pt.match(/\b(\d{5})\s+((?:[A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\-]+)(?:\s+[a-zA-ZäöüÄÖÜß\-]+){0,2}?)(?=\s*(?:\d|,|;|\n|\r|Tel|Fax|E-Mail|Öffnung|Mo\.|Di\.|www\.|http|$))/);
    const plzStr = pm ? `${pm[1]} ${pm[2].trim()}` : null;
    if (sm && plzStr) address = `${sm[0].trim()}, ${plzStr}`;
    else if (plzStr) address = plzStr;
    else if (sm) address = sm[0].trim();
  }

  // Primary color
  const themeColor = extractPrimaryColor(safeHomeHtml);

  // Logo
  let logoUrl: string | null = null;
  if (ld.logo) logoUrl = resolveUrl(ld.logo, baseUrl) || null;
  if (!logoUrl) {
    const logoPatterns = [
      /<img[^>]+(?:class|id)=["'][^"']*\blogo\b[^"']*["'][^>]+src=["']([^"'\s>]+)["']/i,
      /<img[^>]+src=["']([^"'\s>]+)["'][^>]+(?:class|id)=["'][^"']*\blogo\b[^"']*["']/i,
      /<img[^>]+alt=["'][^"']*(?:logo|logotype)[^"']*["'][^>]+src=["']([^"'\s>]+)["']/i,
      /<img[^>]+src=["']([^"'\s>]*\/(?:logo|brand|logotype)[^"'\s>]*)["']/i,
      /<link[^>]+rel=["']apple-touch-icon(?:-precomposed)?["'][^>]+href=["']([^"'\s>]+)["']/i,
    ];
    for (const p of logoPatterns) {
      const m = safeHomeHtml.match(p);
      if (m?.[1]) { logoUrl = resolveUrl(m[1], baseUrl) || null; if (logoUrl) break; }
    }
  }

  // OG image
  const ogImage = extractMeta(safeHomeHtml, "og:image") || null;

  // Headings from homepage — apply STRUCTURAL filter to avoid nav/admin headings in AI context
  const h2Matches = [...safeHomeHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  const headings = h2Matches
    .map(m => stripHtml(m[1]))
    .filter(h => h.length > 3 && h.length < 120 && !STRUCTURAL.test(h.trim()))
    .slice(0, 10);

  const h3Matches = [...safeHomeHtml.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];
  const homeSubheadings = h3Matches
    .map(m => stripHtml(m[1]))
    .filter(h => h.length > 3 && h.length < 100 && !STRUCTURAL.test(h.trim()))
    .slice(0, 20);

  // ── Extract rich data from service pages ──────────────────────────────────────
  const allServiceHeadings: string[] = [];
  const allServicePairs: ServicePair[] = [];
  const allServiceDescriptions: string[] = [];

  for (const spHtml of serviceHtmls) {
    // Headings
    const spH2 = [...spHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => stripHtml(m[1])).filter(h => h.length > 3 && h.length < 100);
    const spH3 = [...spHtml.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => stripHtml(m[1])).filter(h => h.length > 3 && h.length < 100);
    allServiceHeadings.push(...spH2, ...spH3);

    // Content pairs (heading + text)
    const pairs = extractContentPairs(spHtml);
    allServicePairs.push(...pairs);

    // Paragraphs
    const spP = [...spHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => stripHtml(m[1]).slice(0, 200)).filter(p => p.length > 40);
    allServiceDescriptions.push(...spP.slice(0, 8));
  }

  // ── Extract about/team page data ──────────────────────────────────────────────
  let aboutText: string | null = null;
  let teamMembers: TeamMember[] = [];

  for (const abHtml of aboutHtmls) {
    // About text: grab first substantial paragraphs
    if (!aboutText) {
      const paras = [...abHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        .map(m => stripHtml(m[1]).trim())
        .filter(p => p.length > 50 && !/impressum|datenschutz|cookie/i.test(p))
        .slice(0, 3);
      if (paras.length) aboutText = paras.join(" ").slice(0, 600);
    }

    // Team members
    const members = extractTeamMembers(abHtml);
    teamMembers.push(...members);
  }

  // Also try homepage for team members
  if (!teamMembers.length) teamMembers = extractTeamMembers(safeHomeHtml);
  teamMembers = [...new Map(teamMembers.map(m => [m.name, m])).values()].slice(0, 6);

  // ── Opening hours (homepage + contact page) ───────────────────────────────────
  let openingHours: string | null = null;

  // From JSON-LD first
  if (ld.openingHours?.length) {
    openingHours = ld.openingHours.join(" | ");
  }

  // From homepage text
  if (!openingHours) openingHours = extractOpeningHours(safeHomeHtml);

  // From contact pages
  if (!openingHours) {
    for (const cHtml of contactHtmls) {
      openingHours = extractOpeningHours(cHtml);
      if (openingHours) break;
    }
  }

  // ── FAQ ───────────────────────────────────────────────────────────────────────
  let faqItems: FaqItem[] = ld.faqItems || [];
  if (!faqItems.length) faqItems = extractFaq(safeHomeHtml);

  // ── Rating/social proof ───────────────────────────────────────────────────────
  const rating = extractRating(safeHomeHtml, ld);

  // ── Trust signals ─────────────────────────────────────────────────────────────
  const trustSignals = extractTrustSignals(safeHomeHtml, ld);

  // ── Insurance info ────────────────────────────────────────────────────────────
  const insuranceInfo = extractInsuranceInfo(safeHomeHtml);

  // ── Deduplicate and filter service headings ───────────────────────────────────
  let rawServices = [...new Set([...homeSubheadings, ...allServiceHeadings])]
    .filter(h => !STRUCTURAL.test(h.trim()) && h.length > 3 && h.length < 100);

  // Filter service pairs too
  let filteredPairs = allServicePairs
    .filter(p => !STRUCTURAL.test(p.title.trim()) && p.title.length > 3 && p.description.length > 20)
    .slice(0, 12);

  // ── Apify-Ergebnisse immer mergen (läuft seit Anfang parallel) ───────────────
  if (apifyMarkdown) {
    const mdServices = extractMarkdownServices(apifyMarkdown);
    const mdPairs    = extractMarkdownPairs(apifyMarkdown);

    rawServices = [...new Set([...rawServices, ...mdServices])];
    filteredPairs = [
      ...filteredPairs,
      ...mdPairs.filter(p => !filteredPairs.some(e => e.title === p.title)),
    ].slice(0, 12);

    if (!aboutText) {
      const plainText = markdownToText(apifyMarkdown);
      const firstPara = plainText.split("\n\n").find(p => p.length > 80 && !/^(tel|fax|e-mail|email|öffnung|kontakt)/i.test(p));
      if (firstPara) aboutText = firstPara.slice(0, 600);
    }
  }

  // ── Industry detection ────────────────────────────────────────────────────────
  const allText = [title, description, h1, ...headings.slice(0, 5), ...rawServices.slice(0, 8)].filter(Boolean).join(" ");
  const suggested_industry = detectIndustry(allText);

  // ── Google Places: Reviews + Rating ──────────────────────────────────────────
  // Liefert bis zu 5 echte Kundenbewertungen für bessere KI-Texte.
  // Schlägt lautlos fehl wenn kein API-Key oder kein Treffer.

  interface GoogleReview { author_name: string; rating: number; text: string; relative_time_description: string; }
  let googleReviews:     GoogleReview[] = [];
  let googleRating:      number | null  = null;
  let googleRatingCount: number | null  = null;
  let googlePlaceId:     string | null  = null;
  let googlePhotoUrls:   string[]       = [];   // echte Fotos des Unternehmens

  const gKey = process.env.GOOGLE_PLACES_API_KEY;
  if (gKey) {
    try {
      const searchName = title || company_name_param || "";
      const searchCity = ld.addressLocality || "";
      const searchQ    = encodeURIComponent([searchName, searchCity].filter(Boolean).join(" "));
      const searchUrl  = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQ}&key=${gKey}&language=de&region=de`;

      const searchRes  = await fetch(searchUrl, { signal: AbortSignal.timeout(8_000) });
      const searchData = await searchRes.json() as { status: string; results?: Array<{ place_id: string; rating?: number; user_ratings_total?: number }> };

      if (searchData.status === "OK" && searchData.results?.[0]) {
        const first = searchData.results[0];
        googlePlaceId     = first.place_id;
        googleRating      = first.rating              ?? null;
        googleRatingCount = first.user_ratings_total  ?? null;

        // Fotos + Reviews in einem Aufruf
        const detailUrl  = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=reviews,rating,user_ratings_total,photos&key=${gKey}&language=de&reviews_sort=most_relevant`;
        const detailRes  = await fetch(detailUrl, { signal: AbortSignal.timeout(8_000) });
        const detailData = await detailRes.json() as {
          status: string;
          result?: {
            reviews?: GoogleReview[];
            rating?: number;
            user_ratings_total?: number;
            photos?: Array<{ photo_reference: string; width: number; height: number }>;
          };
        };

        if (detailData.status === "OK" && detailData.result) {
          googleRating      = detailData.result.rating              ?? googleRating;
          googleRatingCount = detailData.result.user_ratings_total  ?? googleRatingCount;
          googleReviews     = (detailData.result.reviews ?? [])
            .filter(r => r.text && r.text.length > 20)
            .slice(0, 5);

          // Echte Fotos des Unternehmens → als Proxy-URL aufbereiten
          // Bevorzuge Querformat-Fotos (besser für Hero/About)
          const photos = (detailData.result.photos ?? [])
            .sort((a, b) => (b.width / b.height) - (a.width / a.height)) // breiteste zuerst
            .slice(0, 6);

          googlePhotoUrls = photos.map(p =>
            `/api/place-photo?ref=${encodeURIComponent(p.photo_reference)}&w=1600`
          );
        }
      }
    } catch {
      // Google Places fehlt oder Fehler → kein Problem, weiter ohne
    }
  }

  // ── Company summary for AI ────────────────────────────────────────────────────
  const summaryParts: string[] = [
    title            && `Unternehmensname: "${title}"`,
    suggested_industry && `Branche: ${suggested_industry}`,
    description      && `Selbstbeschreibung: "${description.slice(0, 300)}"`,
    h1 && h1 !== title && h1.length > 8 && `Hauptbotschaft auf der Website: "${h1}"`,
    headings.length  > 0 && `Sektionen Startseite: ${headings.slice(0, 6).join(" · ")}`,
    rawServices.length > 0 && `Leistungen (aus Website extrahiert): ${rawServices.slice(0, 15).join(" · ")}`,
    filteredPairs.length > 0 && `Leistungen mit Beschreibung: ${filteredPairs.slice(0, 5).map(p => `${p.title}: ${p.description.slice(0, 100)}`).join(" | ")}`,
    allServiceDescriptions.length > 0 && `Weitere Infos von Leistungsseite: ${allServiceDescriptions.slice(0, 4).join(" | ")}`,
    aboutText        && `Über das Unternehmen: ${aboutText.slice(0, 300)}`,
    teamMembers.length > 0 && `Team: ${teamMembers.map(m => m.name + (m.title ? ` (${m.title})` : "")).join(", ")}`,
    openingHours     && `Öffnungszeiten: ${openingHours}`,
    rating           && `Bewertungen: ${rating}`,
    trustSignals.length > 0 && `Vertrauenssignale: ${trustSignals.join(" | ")}`,
    insuranceInfo    && `Kassen/Privat: ${insuranceInfo}`,
    ld.areaServed    && `Einzugsgebiet: ${ld.areaServed}`,
    faqItems.length  > 0 && `Häufige Fragen: ${faqItems.slice(0, 3).map(f => f.question).join(" · ")}`,
  ].filter(Boolean) as string[];

  const company_summary = summaryParts.length > 0 ? summaryParts.join(". ") : null;

  return NextResponse.json({
    // Core business data
    title,
    description,
    phone,
    email,
    address,

    // Visual
    primary_color: themeColor,
    logo_url:      logoUrl,
    og_image:      ogImage,

    // Content
    hero_text:    h1,
    headings,
    subheadings:  rawServices,

    // Services (the gold)
    scraped_services:      rawServices.slice(0, 15),
    service_pairs:         filteredPairs,
    service_descriptions:  allServiceDescriptions.slice(0, 10),

    // Rich context
    about_text:     aboutText,
    team_members:   teamMembers.length > 0 ? teamMembers : null,
    opening_hours:  openingHours,
    rating,
    trust_signals:  trustSignals.length > 0 ? trustSignals : null,
    insurance_info: insuranceInfo,
    faq_items:      faqItems.length > 0 ? faqItems.slice(0, 5) : null,
    area_served:    ld.areaServed || null,
    founding_year:  ld.foundingYear || null,

    // Meta
    domain:             baseUrl.hostname,
    suggested_industry,
    company_summary,

    // Google Places — echte Kundenbewertungen + Fotos
    google_reviews:      googleReviews.length > 0 ? googleReviews : null,
    google_rating:       googleRating,
    google_rating_count: googleRatingCount,
    google_place_id:     googlePlaceId,
    google_photos:       googlePhotoUrls.length > 0 ? googlePhotoUrls : null,

    // Apify Fallback-Info
    apify_used: !!apifyMarkdown,
  });
}
