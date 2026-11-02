import { NextResponse } from "next/server";
import { SCHLEUSE_KEKS, schleusenPasswort, schleusenMerkmal, gleich } from "@/lib/schleuse";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let daten: { passwort?: string };
  try {
    daten = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!gleich(daten.passwort ?? "", schleusenPasswort())) {
    // Leichte Bremse gegen Durchprobieren
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const antwort = NextResponse.json({ ok: true });
  antwort.cookies.set(SCHLEUSE_KEKS, await schleusenMerkmal(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return antwort;
}
