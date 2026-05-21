import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Normalize a phone string: remove junk, enforce sane length */
function cleanPhone(raw: string): string | null {
  const cleaned = raw.replace(/[^\d\+\s\-\(\)\/]/g, "").replace(/\s+/g, " ").trim();
  // Must have at least 7 digits and be <= 20 chars
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15) return null;
  return cleaned.slice(0, 20);
}

/** Parse all JSON-LD blocks, return merged object of useful fields */
function extractJsonLd(html: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    name: null, telephone: null, email: null,
    streetAddress: null, addressLocality: null, postalCode: null,
    logo: null, description: null,
  };

  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const raw = block[1].trim();
      // Handle @graph arrays
      const parsed: unknown[] = [];
      const obj = JSON.parse(raw);
      if (Array.isArray(obj?.["@graph"])) parsed.push(...obj["@graph"]);
      else if (Array.isArray(obj)) parsed.push(...obj);
      else parsed.push(obj);

      for (const item of parsed) {
        if (typeof item !== "object" || !item) continue;
        const d = item as Record<string, unknown>;

        // Company name
        if (!result.name && typeof d.name === "string" && d.name.length > 1) {
          result.name = d.name.trim();
        }
        // Phone
        if (!result.telephone && typeof d.telephone === "string") {
          result.telephone = cleanPhone(d.telephone);
        }
        // Email
        if (!result.email && typeof d.email === "string" && d.email.includes("@")) {
          result.email = d.email.trim();
        }
        // Address
        const addr = d.address as Record<string, unknown> | undefined;
        if (addr && typeof addr === "object") {
          if (!result.streetAddress && typeof addr.streetAddress === "string")
            result.streetAddress = addr.streetAddress.trim();
          if (!result.addressLocality && typeof addr.addressLocality === "string")
            result.addressLocality = addr.addressLocality.trim();
          if (!result.postalCode && typeof addr.postalCode === "string")
            result.postalCode = addr.postalCode.trim();
        }
        // Logo
        const logo = d.logo as Record<string, unknown> | string | undefined;
        if (!result.logo) {
          if (typeof logo === "string") result.logo = logo;
          else if (typeof logo === "object" && logo && typeof (logo as Record<string, unknown>).url === "string")
            result.logo = (logo as Record<string, unknown>).url as string;
        }
        // Description
        if (!result.description && typeof d.description === "string" && d.description.length > 20) {
          result.description = d.description.trim().slice(0, 300);
        }
      }
    } catch {
      // Malformed JSON-LD — skip
    }
  }
  return result;
}

// Generic page names that should NOT be used as company name
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
    // If first part looks generic, take the last part (most specific)
    if (GENERIC_PAGE_NAMES.has(first.toLowerCase())) return last;
    // If last part looks generic, take first
    if (GENERIC_PAGE_NAMES.has(last.toLowerCase())) return first;
    // Default: first part is usually the company name
    return first;
  }
  return raw.trim();
}

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

// ─── Primary color extraction ────────────────────────────────────────────────

/** Reject colors that are basically white, black or neutral gray */
function isUsableColor(hex: string): boolean {
  const h = hex.replace("#", "").toLowerCase();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return isUsableRgb(r, g, b);
  }
  if (h.length === 6) {
    return isUsableRgb(
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    );
  }
  return false;
}

function isUsableRgb(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2 / 255;
  const saturation = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
  // Reject: too light (>0.88), too dark (<0.06), or too gray (sat <0.15)
  if (lightness > 0.88 || lightness < 0.06) return false;
  if (saturation < 0.15) return false;
  return true;
}

function firstHex(text: string): string | null {
  const m = text.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/);
  return m ? m[0] : null;
}

function extractPrimaryColor(html: string): string | null {
  // 1. theme-color meta tag
  const themeMeta = extractMeta(html, "theme-color");
  if (themeMeta) {
    const hex = firstHex(themeMeta);
    if (hex && isUsableColor(hex)) return hex;
  }

  // 2. All <style> block CSS text
  const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  const css = styleBlocks.map(m => m[1]).join("\n");

  // 2a. CSS custom properties with brand/primary names
  const varPattern = /--(?:color-)?(?:primary|brand|accent|main|theme|highlight|corporate)(?:-color|-bg)?[\s\S]{0,6}:\s*(#[0-9a-fA-F]{3,6})/gi;
  for (const m of css.matchAll(varPattern)) {
    if (isUsableColor(m[1])) return m[1];
  }

  // 2b. Button / CTA background colors (very reliable brand color signal)
  const btnPattern = /(?:\.btn(?:-primary)?|\.button(?:-primary)?|\.cta|[^{]*:root[^{]*|a\.btn)[^{]{0,60}\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi;
  for (const m of css.matchAll(btnPattern)) {
    if (isUsableColor(m[1])) return m[1];
  }

  // 2c. Header / nav background color
  const navPattern = /(?:header|\.header|#header|nav|\.nav|\.navbar|\.site-header)[^{]{0,30}\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi;
  for (const m of css.matchAll(navPattern)) {
    if (isUsableColor(m[1])) return m[1];
  }

  // 3. Inline style attributes on nav/header/button elements
  const inlinePattern = /<(?:header|nav|button|a)[^>]+style=["'][^"']*background(?:-color)?:\s*(#[0-9a-fA-F]{3,6})/gi;
  for (const m of html.matchAll(inlinePattern)) {
    if (isUsableColor(m[1])) return m[1];
  }

  return null;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL fehlt" }, { status: 400 });

  let baseUrl: URL;
  try {
    baseUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return NextResponse.json({ error: "Ungültige URL" }, { status: 400 });
  }

  try {
    const res = await fetch(baseUrl.href, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.5",
      },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Website antwortet mit Status ${res.status}` }, { status: 422 });
    }
    const html = await res.text();

    // ── 1. JSON-LD (most reliable structured source) ─────────────────────
    const ld = extractJsonLd(html);

    // ── 2. Company name ───────────────────────────────────────────────────
    // Priority: JSON-LD name → og:site_name → smart title parse
    const ogSiteName = extractMeta(html, "og:site_name");
    const rawTitle   = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || null;

    let title: string | null =
      ld.name ||
      (ogSiteName && !GENERIC_PAGE_NAMES.has(ogSiteName.toLowerCase()) ? ogSiteName : null) ||
      (rawTitle ? smartTitle(rawTitle) : null);

    // Sanity: discard if too long (likely a tagline) or too short
    if (title && (title.length > 80 || title.length < 2)) title = null;

    // ── 3. Description ────────────────────────────────────────────────────
    const description =
      ld.description ||
      extractMeta(html, "description") ||
      extractMeta(html, "og:description") ||
      null;

    // ── 4. H1 — hero text candidate ───────────────────────────────────────
    const h1Raw = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "";
    const h1 = stripHtml(h1Raw).slice(0, 150) || null;

    // ── 5. Phone ──────────────────────────────────────────────────────────
    // Priority: JSON-LD telephone → tel: href links → labeled text → +49 pattern
    let phone: string | null = ld.telephone || null;

    if (!phone) {
      // tel: href links are the most accurate source
      const telLinks = [...html.matchAll(/href=["']tel:([^"'\s]+)["']/gi)];
      for (const m of telLinks) {
        const candidate = cleanPhone(decodeURIComponent(m[1]));
        if (candidate) { phone = candidate; break; }
      }
    }

    if (!phone) {
      // Labeled text: "Tel.", "Telefon:", "Fon:", "T:"
      const plainText = html.replace(/<[^>]+>/g, " ");
      const labeled = plainText.match(
        /(?:Tel(?:efon)?\.?|Fon|Telefonnummer|Rufnummer)\s*[:.]?\s*((?:\+49|0)[0-9\s\-\(\)\/]{6,18})/i
      );
      if (labeled?.[1]) phone = cleanPhone(labeled[1]);
    }

    if (!phone) {
      // +49 international pattern as last resort
      const plainText = html.replace(/<[^>]+>/g, " ");
      const intl = plainText.match(/(\+49\s?[\d\s\-\(\)\/]{6,16})/);
      if (intl?.[1]) phone = cleanPhone(intl[1]);
    }

    // ── 6. Email ──────────────────────────────────────────────────────────
    // Priority: JSON-LD → mailto: href → text search
    const SPAM_EMAILS = /noreply|no-reply|example\.|@sentry|@webpack|your@|test@|admin@.*\.js/i;
    let email: string | null = null;

    if (ld.email && !SPAM_EMAILS.test(ld.email)) {
      email = ld.email;
    }

    if (!email) {
      const mailtoLinks = [...html.matchAll(/href=["']mailto:([^"'\s?]+)["']/gi)];
      for (const m of mailtoLinks) {
        const candidate = m[1].trim().toLowerCase();
        if (candidate.includes("@") && !SPAM_EMAILS.test(candidate)) {
          email = candidate;
          break;
        }
      }
    }

    if (!email) {
      // Text fallback — only accept common patterns, not obfuscated or CDN emails
      const emailMatch = html.match(/\b([a-zA-Z0-9._%+\-]{2,40}@[a-zA-Z0-9.\-]{2,30}\.[a-zA-Z]{2,6})\b/);
      if (emailMatch?.[1] && !SPAM_EMAILS.test(emailMatch[1])) {
        email = emailMatch[1].toLowerCase();
      }
    }

    // ── 7. Address ────────────────────────────────────────────────────────
    let address: string | null = null;

    // From JSON-LD
    if (ld.streetAddress || ld.postalCode) {
      const parts = [ld.streetAddress, [ld.postalCode, ld.addressLocality].filter(Boolean).join(" ")].filter(Boolean);
      address = parts.join(", ");
    }

    if (!address) {
      const plainText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      // Match "Straßenname Hausnummer" patterns
      const streetM = plainText.match(
        /([A-ZÄÖÜ][a-zäöüß]+(?:straße|str\.|gasse|weg|allee|platz|ring|damm|chaussee|steig)\.?\s+\d+\s?[a-zA-Z]?)/i
      );
      // PLZ + city — stop before digit, Tel/Fax/E-Mail, or double-space (paragraph)
      // Non-greedy {0,2}? with lookahead prevents "Oldenburg Telefon 0174…" bleeding in
      const plzM = plainText.match(
        /\b(\d{5})\s+((?:[A-ZÄÖÜ][a-zA-ZäöüÄÖÜß\-]+)(?:\s+[a-zA-ZäöüÄÖÜß\-]+){0,2}?)(?=\s*(?:\d|,|;|\n|\r|Tel|Fax|E-Mail|Öffnung|Mo\.|Di\.|www\.|http|$))/
      );
      const plzStr = plzM ? `${plzM[1]} ${plzM[2].trim()}` : null;

      if (streetM && plzStr) {
        address = `${streetM[0].trim()}, ${plzStr}`;
      } else if (plzStr) {
        address = plzStr;
      } else if (streetM) {
        address = streetM[0].trim();
      }
    }

    // ── 8. Primary color — multi-source extraction ────────────────────────
    const themeColor = extractPrimaryColor(html);

    // ── 9. Logo ───────────────────────────────────────────────────────────
    // Priority: JSON-LD logo → specific img patterns → apple-touch-icon → og:image
    // NOTE: we do NOT use og:image as logo — it's usually a page hero image
    let logoUrl: string | null = null;

    if (ld.logo) {
      logoUrl = resolveUrl(ld.logo, baseUrl) || null;
    }

    if (!logoUrl) {
      const patterns: RegExp[] = [
        // img with class/id containing "logo"
        /<img[^>]+(?:class|id)=["'][^"']*\blogo\b[^"']*["'][^>]+src=["']([^"'\s>]+)["']/i,
        /<img[^>]+src=["']([^"'\s>]+)["'][^>]+(?:class|id)=["'][^"']*\blogo\b[^"']*["']/i,
        // img with alt containing "logo" or company indicator
        /<img[^>]+alt=["'][^"']*(?:logo|logotype)[^"']*["'][^>]+src=["']([^"'\s>]+)["']/i,
        // img src path contains /logo or /brand
        /<img[^>]+src=["']([^"'\s>]*\/(?:logo|brand|logotype)[^"'\s>]*)["']/i,
        // SVG use or inline logo reference
        /<link[^>]+rel=["']apple-touch-icon(?:-precomposed)?["'][^>]+href=["']([^"'\s>]+)["']/i,
      ];
      for (const p of patterns) {
        const m = html.match(p);
        if (m?.[1]) {
          const candidate = resolveUrl(m[1], baseUrl);
          if (candidate) { logoUrl = candidate; break; }
        }
      }
    }

    // ── 10. OG image (separate from logo — used for hero background) ──────
    const ogImage = extractMeta(html, "og:image") || null;

    // ── 11. Headings for service/content detection ────────────────────────
    const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    const headings = h2Matches
      .map(m => stripHtml(m[1]))
      .filter(h => h.length > 3 && h.length < 120)
      .slice(0, 10);

    const h3Matches = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];
    const subheadings = h3Matches
      .map(m => stripHtml(m[1]))
      .filter(h => h.length > 3 && h.length < 100)
      .slice(0, 15);

    // ── 12. Industry detection ────────────────────────────────────────────
    const allText = [title, description, h1, ...headings.slice(0, 5), ...subheadings.slice(0, 6)].filter(Boolean).join(" ");
    const suggested_industry = detectIndustry(allText);

    // ── 13. Company summary for AI ────────────────────────────────────────
    const summaryParts = [
      title && `Unternehmensname: "${title}"`,
      suggested_industry && `Branche: ${suggested_industry}`,
      description && `Selbstbeschreibung: "${description.slice(0, 250)}"`,
      h1 && h1 !== title && h1.length > 8 && `Hauptbotschaft auf der Website: "${h1}"`,
      headings.length > 0 && `Bereiche/Themen auf der Website: ${headings.slice(0, 6).join(" · ")}`,
      subheadings.length > 2 && `Mögliche Leistungen (Unterüberschriften): ${subheadings.slice(0, 8).join(" · ")}`,
    ].filter(Boolean);
    const company_summary = summaryParts.length > 0 ? summaryParts.join(". ") : null;

    return NextResponse.json({
      title,
      description,
      phone,
      email,
      address,
      primary_color: themeColor,
      logo_url: logoUrl,
      og_image: ogImage,
      hero_text: h1,
      headings,
      subheadings,
      domain: baseUrl.hostname,
      suggested_industry,
      company_summary,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timeout") || msg.includes("abort")) {
      return NextResponse.json({ error: "Timeout – Website antwortet zu langsam." }, { status: 422 });
    }
    console.error("Scrape error:", msg);
    return NextResponse.json({ error: "Website konnte nicht analysiert werden." }, { status: 422 });
  }
}
