import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;

// Proxy für Google Places Fotos — hält API-Key server-seitig versteckt
// und cached aggressiv (1 Jahr) damit jedes Foto nur einmal geladen wird.
export async function GET(req: NextRequest) {
  const ref   = req.nextUrl.searchParams.get("ref");
  const width = req.nextUrl.searchParams.get("w") ?? "1600";

  if (!ref) return NextResponse.json({ error: "ref fehlt" }, { status: 400 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Kein API-Key" }, { status: 500 });

  try {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${width}&photo_reference=${encodeURIComponent(ref)}&key=${apiKey}`;
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10_000) });

    if (!res.ok) return NextResponse.json({ error: "Foto nicht gefunden" }, { status: 404 });

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":  contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch fehlgeschlagen" }, { status: 500 });
  }
}
