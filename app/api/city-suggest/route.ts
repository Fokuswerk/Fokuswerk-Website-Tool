import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 10;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return NextResponse.json({ results: [] });

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&types=(cities)&components=country:de&language=de&key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json() as {
      predictions?: Array<{
        description: string;
        structured_formatting: { main_text: string; secondary_text: string };
        place_id: string;
      }>;
    };

    const results = (data.predictions ?? []).slice(0, 6).map(p => ({
      label: p.structured_formatting.main_text,
      description: p.description,
      place_id: p.place_id,
    }));

    return NextResponse.json({ results }, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
