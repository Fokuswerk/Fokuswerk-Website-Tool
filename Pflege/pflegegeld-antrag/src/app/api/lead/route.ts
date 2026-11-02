import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { leadSchreiben } from "@/lib/speicher";
import { bestaetigungsMail, senden, versandScharf } from "@/lib/mail";

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

  // 32 Byte aus dem Zufallsgenerator des Betriebssystems. Ein ratbarer Token
  // waere eine Einladung, fremde Adressen zu bestaetigen - und damit genau die
  // Luecke, die Double Opt-in schliessen soll.
  const token = randomBytes(32).toString("hex");
  const gueltigBis = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Nachweis der Einwilligung nach Art. 7 Abs. 1 DSGVO. Vercel setzt die
  // echte Adresse in x-forwarded-for; der erste Eintrag ist der Client.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;

  try {
    await leadSchreiben({
      zeit: new Date().toISOString(),
      anlass,
      mail,
      name: (daten.name ?? "").trim().slice(0, 120),
      befund: befundSaeubern(daten.befund),
      quelle: req.headers.get("referer")?.slice(0, 200) ?? null,
      sitzung: (daten.sitzung ?? "").slice(0, 48) || null,
      bestaetigt: false,
      bestaetigungToken: token,
      tokenGueltigBis: gueltigBis,
      anmeldeIp: ip,
    });
  } catch {
    // Lieber eine ehrliche Fehlermeldung als ein "Notiert." ins Leere.
    return NextResponse.json({ ok: false, grund: "speicher" }, { status: 503 });
  }

  // Der Link muss auf die Adresse zeigen, unter der die Seite wirklich laeuft -
  // sonst fuehrt die Mail bei jeder Vorschau-Bereitstellung ins Leere.
  const basis =
    process.env.OEFFENTLICHE_ADRESSE?.replace(/\/$/, "") ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : new URL(req.url).origin);

  const stand = await senden(bestaetigungsMail(mail, `${basis}/bestaetigen?t=${token}`, anlass));

  // Bewusst ohne Adresse: ein Treffer im Log soll keine Person nennen.
  console.log(`LEAD eingegangen, Anlass ${anlass}, Bestaetigungsmail ${stand}`);

  // "trocken" ist kein Fehler fuer die Person vor dem Bildschirm - der Eintrag
  // steht, er wartet nur auf die Bestaetigung. Das Formular sagt genau das.
  return NextResponse.json({ ok: true, mail: stand });
}
