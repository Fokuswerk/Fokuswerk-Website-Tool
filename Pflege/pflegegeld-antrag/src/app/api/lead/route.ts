import { NextResponse } from "next/server";
import { leadSchreiben } from "@/lib/speicher";

export const runtime = "nodejs";

type Eingang = {
  anlass?: string;
  mail?: string;
  name?: string;
  befund?: Record<string, unknown>;
  sitzung?: string;
};

const MAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Der Befund kann einen Pflegegrad enthalten, also eine Gesundheitsangabe nach
 * Art. 9 DSGVO. Deshalb nehmen wir daraus nur Zahlen und kurze Kennwerte an und
 * schreiben nichts davon in die Server-Logs.
 */
function befundSaeubern(roh: unknown): Record<string, string | number | null> {
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
  let daten: Eingang;
  try {
    daten = (await req.json()) as Eingang;
  } catch {
    return NextResponse.json({ ok: false, grund: "ungueltig" }, { status: 400 });
  }

  const mail = (daten.mail ?? "").trim().toLowerCase();
  if (!MAIL_MUSTER.test(mail)) {
    return NextResponse.json({ ok: false, grund: "mail" }, { status: 400 });
  }

  const anlass = (daten.anlass ?? "unbekannt").slice(0, 64);

  try {
    await leadSchreiben({
      zeit: new Date().toISOString(),
      anlass,
      mail,
      name: (daten.name ?? "").trim().slice(0, 120),
      befund: befundSaeubern(daten.befund),
      quelle: req.headers.get("referer")?.slice(0, 200) ?? null,
      sitzung: (daten.sitzung ?? "").slice(0, 48) || null,
      // Vor dem ersten Mailversand muss die Bestaetigungsmail laufen. Bis dahin
      // ist jeder Eintrag unbestaetigt, und das zeigt die Auswertung auch so an.
      bestaetigt: false,
    });
  } catch {
    // Lieber eine ehrliche Fehlermeldung als ein "Notiert." ins Leere.
    return NextResponse.json({ ok: false, grund: "speicher" }, { status: 503 });
  }

  // Bewusst ohne Adresse: ein Treffer im Log soll keine Person nennen.
  console.log(`LEAD eingegangen, Anlass ${anlass}`);

  return NextResponse.json({ ok: true });
}
