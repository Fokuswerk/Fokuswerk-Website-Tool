import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Erlaubte Ziele. Alles andere wird nicht weitergeleitet. */
const ZIELE = new Set([
  "treppenlift", "badumbau", "betreuung24", "tagespflege",
  "pflegedienst", "pflegebett", "hausnotruf", "alltagsbegleitung",
]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ziel = url.searchParams.get("ziel") ?? "";
  const modul = url.searchParams.get("modul") ?? "";

  if (!ZIELE.has(ziel)) {
    return NextResponse.redirect(new URL("/", url.origin), 302);
  }

  console.log(
    "KLICK",
    JSON.stringify({ zeit: new Date().toISOString(), ziel, modul, quelle: req.headers.get("referer") ?? null }),
  );

  const weiter = new URL("/anfrage", url.origin);
  weiter.searchParams.set("ziel", ziel);
  if (modul) weiter.searchParams.set("modul", modul);
  return NextResponse.redirect(weiter, 302);
}
