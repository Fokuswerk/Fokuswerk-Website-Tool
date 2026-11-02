import { NextResponse } from "next/server";
import { auswertungLesen } from "@/lib/speicher";
import { angemeldet, passwortGesetzt } from "@/lib/zugang";
import { demoAuswertung } from "@/lib/demodaten";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function feld(w: unknown): string {
  const s = String(w ?? "");
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const schutz = passwortGesetzt();
  if (schutz && !(await angemeldet())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const a = schutz ? await auswertungLesen(90) : demoAuswertung(30);

  const kopf = ["Eingang", "Name", "E-Mail", "Anlass", "Quelle", "Befund", "Bestaetigt"];
  const zeilen = a.leads.map((l) =>
    [
      new Date(l.zeit).toLocaleString("de-DE"),
      l.name,
      l.mail,
      l.anlass,
      l.quelle ?? "",
      Object.entries(l.befund ?? {}).map(([k, v]) => `${k}=${v}`).join(" "),
      l.bestaetigt ? "ja" : "offen",
    ].map(feld).join(";"),
  );
  // Semikolon und BOM, damit Excel es direkt richtig öffnet
  const csv = "﻿" + [kopf.join(";"), ...zeilen].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}${a.demo ? "-demo" : ""}.csv"`,
    },
  });
}
