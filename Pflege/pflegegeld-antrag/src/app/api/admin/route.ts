import { NextResponse } from "next/server";
import { KEKS_NAME, merkmal, passwortGesetzt } from "@/lib/zugang";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!passwortGesetzt()) {
    return NextResponse.json({ ok: false, grund: "kein-passwort" }, { status: 400 });
  }
  let daten: { passwort?: string; abmelden?: boolean };
  try {
    daten = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const antwort = NextResponse.json({ ok: true });

  if (daten.abmelden) {
    antwort.cookies.set(KEKS_NAME, "", { maxAge: 0, path: "/" });
    return antwort;
  }

  if (daten.passwort !== process.env.ADMIN_PASSWORT) {
    // Leichte Bremse gegen Durchprobieren
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ ok: false, grund: "falsch" }, { status: 401 });
  }

  antwort.cookies.set(KEKS_NAME, merkmal(process.env.ADMIN_PASSWORT as string), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return antwort;
}
