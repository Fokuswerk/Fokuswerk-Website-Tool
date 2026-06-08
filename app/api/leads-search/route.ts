import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export interface LeadResult {
  place_id:     string;
  name:         string;
  address:      string;
  city:         string;
  phone:        string | null;
  website:      string | null;
  rating:       number | null;
  rating_count: number | null;
  industry:     string | null;
  maps_url:     string;
  sources:      string[];   // ["google", "gelbeseiten"]
}

// ─── Google Places ────────────────────────────────────────────────────────────

const TYPES_MAP: Record<string, string> = {
  dentist: "Zahnarztpraxis", doctor: "Arztpraxis", hospital: "Klinik",
  physiotherapist: "Physiotherapie", restaurant: "Restaurant", food: "Gastronomie",
  lodging: "Hotel", real_estate_agency: "Immobilien", lawyer: "Rechtsanwalt",
  accounting: "Steuerberater", electrician: "Elektriker", plumber: "Sanitär",
  painter: "Maler", roofing_contractor: "Dachdecker", car_repair: "KFZ-Werkstatt",
  car_dealer: "Autohaus", gym: "Fitnessstudio", beauty_salon: "Kosmetikstudio",
  hair_care: "Friseur", spa: "Wellness", veterinary_care: "Tierarzt",
  pharmacy: "Apotheke", driving_school: "Fahrschule", insurance_agency: "Versicherung",
  bank: "Bank", bakery: "Bäckerei", florist: "Blumenladen", jewelry_store: "Juwelier",
};

function mapTypes(types: string[]): string | null {
  for (const t of types) if (TYPES_MAP[t]) return TYPES_MAP[t];
  return null;
}

async function searchGoogle(query: string, city: string, apiKey: string): Promise<LeadResult[]> {
  const searchQ = encodeURIComponent(city ? `${query} ${city}` : query);
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQ}&key=${apiKey}&language=de&region=de`,
    { signal: AbortSignal.timeout(10_000) }
  );
  const data = await res.json() as {
    status: string;
    results?: Array<{
      place_id: string; name: string; formatted_address: string;
      types: string[]; rating?: number; user_ratings_total?: number;
    }>;
  };

  if (data.status !== "OK" || !data.results?.length) return [];

  const results: LeadResult[] = [];
  await Promise.allSettled(
    data.results.slice(0, 12).map(async (place) => {
      try {
        const detailRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website,address_components,url&key=${apiKey}&language=de`,
          { signal: AbortSignal.timeout(6_000) }
        );
        const detail = await detailRes.json() as {
          status: string;
          result?: {
            formatted_phone_number?: string; website?: string; url?: string;
            address_components?: Array<{ long_name: string; types: string[] }>;
          };
        };
        const d = detail.result ?? {};
        const cityComp = d.address_components?.find(c =>
          c.types.includes("locality") || c.types.includes("administrative_area_level_2")
        );
        results.push({
          place_id:     place.place_id,
          name:         place.name,
          address:      place.formatted_address,
          city:         cityComp?.long_name ?? city ?? "",
          phone:        d.formatted_phone_number ?? null,
          website:      d.website ?? null,
          rating:       place.rating ?? null,
          rating_count: place.user_ratings_total ?? null,
          industry:     mapTypes(place.types),
          maps_url:     d.url ?? `https://maps.google.com/?place_id=${place.place_id}`,
          sources:      ["google"],
        });
      } catch { /* einzelne Fehler ignorieren */ }
    })
  );
  return results;
}

// ─── Gelbe Seiten ─────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase()
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
}

interface GelbeResult { name: string; phone?: string; website?: string; address?: string; city?: string; }

function parseGelbeSeiten(html: string, fallbackCity: string): GelbeResult[] {
  const results: GelbeResult[] = [];

  // JSON-LD (zuverlässiger)
  const jsonLdRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = jsonLdRe.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items as Record<string,unknown>[]) {
        const name = String(item.name ?? "").trim();
        if (!name || name.length < 2) continue;
        const type = String(item["@type"] ?? "");
        if (["WebSite","WebPage","BreadcrumbList","ItemList"].includes(type)) continue;
        const addr = (item.address ?? {}) as Record<string,string>;
        const phone = String(item.telephone ?? "").trim();
        const website = String(item.url ?? "").trim();
        if (!phone && !website) continue;
        results.push({
          name,
          phone:   phone   || undefined,
          website: website && !website.includes("gelbeseiten") ? website : undefined,
          address: String(addr.streetAddress ?? "").trim() || undefined,
          city:    String(addr.addressLocality ?? fallbackCity).trim(),
        });
      }
    } catch { /* skip */ }
  }
  if (results.length > 0) return results;

  // HTML-Fallback: article blocks
  const blockRe = /<article[^>]*>([\s\S]*?)<\/article>/gi;
  while ((m = blockRe.exec(html)) !== null) {
    const block = m[1];
    if (block.length < 50) continue;
    const nameM = block.match(/itemprop=["']name["'][^>]*>([^<]{2,80})</i)
                ?? block.match(/<h2[^>]*>([^<]{2,80})<\/h2>/i);
    const name = nameM?.[1]?.replace(/&amp;/g,"&").trim();
    if (!name || name.length < 2) continue;
    const phone = block.match(/href=["']tel:([+\d\s\-\/().%]{7,25})["']/i)?.[1]?.replace(/%2B/g,"+").replace(/%20/g," ");
    const website = block.match(/itemprop=["']url["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim()
                 ?? block.match(/href=["'](https?:\/\/(?!(?:www\.)?gelbeseiten)[^"']+)["']/i)?.[1]?.trim();
    const city = block.match(/itemprop=["']addressLocality["'][^>]*>([^<]+)</i)?.[1]?.trim() ?? fallbackCity;
    results.push({ name, phone, website, city });
  }
  return results;
}

async function searchGelbeSeiten(query: string, city: string): Promise<LeadResult[]> {
  try {
    const url = `https://www.gelbeseiten.de/suche/${slugify(query)}${city ? `/${slugify(city)}` : ""}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9",
        "Referer": "https://www.gelbeseiten.de",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    if (html.includes("captcha") || html.includes("Zugriff verweigert")) return [];

    return parseGelbeSeiten(html, city).slice(0, 15).map((r, i) => ({
      place_id:     `gs_${slugify(r.name)}_${i}`,
      name:         r.name,
      address:      r.address ?? "",
      city:         r.city ?? city,
      phone:        r.phone ?? null,
      website:      r.website ?? null,
      rating:       null,
      rating_count: null,
      industry:     query,
      maps_url:     url,
      sources:      ["gelbeseiten"],
    }));
  } catch {
    return [];
  }
}

// ─── Merge + Deduplizierung ───────────────────────────────────────────────────

function mergeResults(google: LeadResult[], gelbe: LeadResult[]): LeadResult[] {
  const merged = [...google];

  for (const g of gelbe) {
    // Duplikat-Check: gleicher Name (fuzzy) oder gleiche Telefonnummer
    const isDupe = merged.some(m =>
      (m.phone && g.phone && m.phone.replace(/\D/g,"") === g.phone.replace(/\D/g,"")) ||
      m.name.toLowerCase().replace(/\s+/g,"") === g.name.toLowerCase().replace(/\s+/g,"")
    );
    if (isDupe) {
      // Gelbe-Seiten Daten in bestehenden Eintrag mergen (z.B. Website ergänzen)
      const existing = merged.find(m =>
        m.name.toLowerCase().replace(/\s+/g,"") === g.name.toLowerCase().replace(/\s+/g,"")
      );
      if (existing) {
        if (!existing.website && g.website) existing.website = g.website;
        if (!existing.phone   && g.phone)   existing.phone   = g.phone;
        if (!existing.sources.includes("gelbeseiten")) existing.sources.push("gelbeseiten");
      }
    } else {
      merged.push(g);
    }
  }

  // Sortierung: Google-Ergebnisse mit Rating zuerst, dann Rest
  return merged.sort((a, b) => {
    if (a.rating && b.rating) return b.rating - a.rating;
    if (a.rating && !b.rating) return -1;
    if (!a.rating && b.rating) return 1;
    return 0;
  });
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const city  = searchParams.get("city")?.trim() ?? "";

  if (!query) return NextResponse.json({ error: "Suchbegriff fehlt" }, { status: 400 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // Beide Quellen parallel anfragen
  const [googleResults, gelbeResults] = await Promise.allSettled([
    apiKey ? searchGoogle(query, city, apiKey) : Promise.resolve([] as LeadResult[]),
    searchGelbeSeiten(query, city),
  ]);

  const google = googleResults.status === "fulfilled" ? googleResults.value : [];
  const gelbe  = gelbeResults.status  === "fulfilled" ? gelbeResults.value  : [];

  const results = mergeResults(google, gelbe).slice(0, 20);

  return NextResponse.json({
    results,
    sources: {
      google: google.length,
      gelbeseiten: gelbe.length,
    },
  });
}
