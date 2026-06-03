import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;

export interface LeadResult {
  place_id:    string;
  name:        string;
  address:     string;
  city:        string;
  phone:       string | null;
  website:     string | null;
  rating:      number | null;
  rating_count: number | null;
  industry:    string | null;
  maps_url:    string;
}

const TYPES_MAP: Record<string, string> = {
  dentist:           "Zahnarztpraxis",
  doctor:            "Arztpraxis",
  hospital:          "Klinik",
  physiotherapist:   "Physiotherapie",
  restaurant:        "Restaurant",
  food:              "Gastronomie",
  lodging:           "Hotel",
  real_estate_agency:"Immobilien",
  lawyer:            "Rechtsanwalt",
  accounting:        "Steuerberater",
  electrician:       "Elektriker",
  plumber:           "Sanitär",
  painter:           "Maler",
  roofing_contractor:"Dachdecker",
  car_repair:        "KFZ-Werkstatt",
  car_dealer:        "Autohaus",
  gym:               "Fitnessstudio",
  beauty_salon:      "Kosmetikstudio",
  hair_care:         "Friseur",
  spa:               "Wellness",
  veterinary_care:   "Tierarzt",
  pharmacy:          "Apotheke",
  driving_school:    "Fahrschule",
  insurance_agency:  "Versicherung",
  bank:              "Bank",
  bakery:            "Bäckerei",
  florist:           "Blumenladen",
  jewelry_store:     "Juwelier",
};

function mapTypes(types: string[]): string | null {
  for (const t of types) {
    if (TYPES_MAP[t]) return TYPES_MAP[t];
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query  = searchParams.get("q")?.trim();
  const city   = searchParams.get("city")?.trim();

  if (!query) return NextResponse.json({ error: "Suchbegriff fehlt" }, { status: 400 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY fehlt" }, { status: 500 });

  try {
    // 1. Text Search
    const searchQ   = encodeURIComponent(city ? `${query} ${city}` : query);
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQ}&key=${apiKey}&language=de&region=de`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(10_000) });
    const searchData = await searchRes.json() as {
      status: string;
      results?: Array<{
        place_id: string; name: string; formatted_address: string;
        types: string[]; rating?: number; user_ratings_total?: number;
        geometry: { location: { lat: number; lng: number } };
      }>;
    };

    if (searchData.status !== "OK" || !searchData.results?.length) {
      return NextResponse.json({ results: [] });
    }

    // 2. Fetch details for top 10 (phone + website)
    const topResults = searchData.results.slice(0, 10);
    const detailed: LeadResult[] = [];

    await Promise.allSettled(
      topResults.map(async (place) => {
        try {
          const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,website,address_components,url&key=${apiKey}&language=de`;
          const detailRes  = await fetch(detailUrl, { signal: AbortSignal.timeout(6_000) });
          const detailData = await detailRes.json() as {
            status: string;
            result?: {
              formatted_phone_number?: string;
              website?: string;
              url?: string;
              address_components?: Array<{ long_name: string; types: string[] }>;
            };
          };

          const d = detailData.result ?? {};
          const cityComp = d.address_components?.find(c =>
            c.types.includes("locality") || c.types.includes("administrative_area_level_2")
          );

          detailed.push({
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
          });
        } catch {
          // einzelne Detail-Fehler ignorieren
        }
      })
    );

    // Sortiere nach Rating (höchste zuerst)
    detailed.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return NextResponse.json({ results: detailed });

  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
