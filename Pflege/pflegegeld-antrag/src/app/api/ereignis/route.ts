import { NextResponse } from "next/server";
import { ereignisSchreiben } from "@/lib/speicher";
import type { EreignisArt } from "@/lib/typen";

export const runtime = "nodejs";

const ERLAUBT: EreignisArt[] = ["seite", "check_start", "check_frage", "check_fertig", "lead", "klick"];

/** Nur Zahlen und kurze Zeichenketten, niemals freier Text aus Formularen. */
function werteSaeubern(roh: unknown): Record<string, string | number | null> {
  if (!roh || typeof roh !== "object") return {};
  const sauber: Record<string, string | number | null> = {};
  let anzahl = 0;
  for (const [k, v] of Object.entries(roh as Record<string, unknown>)) {
    if (anzahl >= 12) break;
    const schluessel = k.slice(0, 32);
    if (typeof v === "number" && Number.isFinite(v)) sauber[schluessel] = v;
    else if (typeof v === "string") sauber[schluessel] = v.slice(0, 64);
    else if (v === null) sauber[schluessel] = null;
    anzahl++;
  }
  return sauber;
}

export async function POST(req: Request) {
  let daten: { art?: string; pfad?: string; sitzung?: string; werte?: unknown };
  try {
    daten = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const art = daten.art as EreignisArt;
  if (!ERLAUBT.includes(art)) return NextResponse.json({ ok: false, grund: "art" }, { status: 400 });

  const sitzung = (daten.sitzung ?? "").toString().slice(0, 48);
  if (!sitzung) return NextResponse.json({ ok: false, grund: "sitzung" }, { status: 400 });

  await ereignisSchreiben({
    zeit: new Date().toISOString(),
    art,
    pfad: (daten.pfad ?? "/").toString().slice(0, 120),
    sitzung,
    werte: werteSaeubern(daten.werte),
  });

  return new NextResponse(null, { status: 204 });
}
