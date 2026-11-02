import type { Auswertung, Ereignis, Kennzahlen, Lead, Tageswert } from "./typen";
import { demoAuswertung } from "./demodaten";

/**
 * Datenschicht. Schreibt und liest über die REST-Schnittstelle von Supabase,
 * sobald SUPABASE_URL und SUPABASE_DIENSTSCHLUESSEL gesetzt sind.
 * Ohne diese Angaben liefert die Auswertung Demo-Daten und Schreibvorgänge
 * landen nur im Protokoll — die Oberfläche weist darauf hin.
 */

const URL_BASIS = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SCHLUESSEL = process.env.SUPABASE_DIENSTSCHLUESSEL;

export function datenbankVorhanden(): boolean {
  return Boolean(URL_BASIS && SCHLUESSEL);
}

async function rest(pfad: string, init: RequestInit = {}): Promise<Response> {
  if (!datenbankVorhanden()) throw new Error("Keine Datenbank hinterlegt");
  return fetch(`${URL_BASIS}/rest/v1/${pfad}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: SCHLUESSEL as string,
      authorization: `Bearer ${SCHLUESSEL}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

export async function ereignisSchreiben(e: Ereignis): Promise<void> {
  if (!datenbankVorhanden()) {
    console.log("EREIGNIS", JSON.stringify(e));
    return;
  }
  const antwort = await rest("ereignisse", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({ zeit: e.zeit, art: e.art, pfad: e.pfad, sitzung: e.sitzung, werte: e.werte ?? {} }),
  });
  if (!antwort.ok) console.error("Ereignis nicht gespeichert:", antwort.status, await antwort.text());
}

export async function leadSchreiben(l: Lead): Promise<void> {
  if (!datenbankVorhanden()) {
    // Ohne Datenbank gibt es nichts zu speichern. Die Adresse gehoert nicht ins
    // Log, deshalb steht hier nur, dass ein Eintrag kam. Der Fehler muss nach
    // oben durch: ein Formular, das "Notiert." sagt, waehrend die Adresse
    // verfaellt, ist schlimmer als eine Fehlermeldung.
    console.warn(`Kein Datenbankziel: Lead (${l.anlass}) wurde NICHT gespeichert.`);
    throw new Error("kein-speicherziel");
  }
  const antwort = await rest("leads", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({
      zeit: l.zeit, anlass: l.anlass, mail: l.mail, name: l.name,
      befund: l.befund ?? {}, quelle: l.quelle, sitzung: l.sitzung ?? null,
      bestaetigt: l.bestaetigt ?? false,
    }),
  });
  if (!antwort.ok) {
    console.error("Lead nicht gespeichert:", antwort.status, await antwort.text());
    throw new Error("speichern-fehlgeschlagen");
  }
}

function leerzahlen(): Kennzahlen {
  return {
    besucher: 0, seitenaufrufe: 0, checksGestartet: 0, checksBeendet: 0,
    leads: 0, klicks: 0, startquote: 0, abschlussquote: 0, leadquote: 0,
  };
}

/** Liest Ereignisse und Leads und rechnet daraus die Auswertung. */
export async function auswertungLesen(tage = 30): Promise<Auswertung> {
  if (!datenbankVorhanden()) return demoAuswertung(tage);

  const ab = new Date();
  ab.setDate(ab.getDate() - tage);
  const abISO = ab.toISOString();

  try {
    const [eAntwort, lAntwort] = await Promise.all([
      rest(`ereignisse?zeit=gte.${abISO}&select=zeit,art,pfad,sitzung,werte&order=zeit.desc&limit=50000`),
      rest(`leads?zeit=gte.${abISO}&select=id,zeit,anlass,mail,name,befund,quelle,sitzung&order=zeit.desc&limit=500`),
    ]);
    if (!eAntwort.ok || !lAntwort.ok) throw new Error(`REST ${eAntwort.status}/${lAntwort.status}`);

    const ereignisse = (await eAntwort.json()) as Ereignis[];
    const leads = (await lAntwort.json()) as Lead[];

    const sitzungen = new Set<string>();
    const starter = new Set<string>();
    const beender = new Set<string>();
    let seitenaufrufe = 0;
    let klicks = 0;
    const proTag = new Map<string, { besucher: Set<string>; leads: number }>();
    const proFrage = new Map<number, Set<string>>();

    for (const e of ereignisse) {
      const tag = e.zeit.slice(0, 10);
      if (!proTag.has(tag)) proTag.set(tag, { besucher: new Set(), leads: 0 });
      proTag.get(tag)!.besucher.add(e.sitzung);
      sitzungen.add(e.sitzung);
      if (e.art === "seite") seitenaufrufe++;
      if (e.art === "check_start") starter.add(e.sitzung);
      if (e.art === "check_fertig") beender.add(e.sitzung);
      if (e.art === "klick") klicks++;
      if (e.art === "check_frage") {
        const nr = Number(e.werte?.frage ?? 0);
        if (nr > 0) {
          if (!proFrage.has(nr)) proFrage.set(nr, new Set());
          proFrage.get(nr)!.add(e.sitzung);
        }
      }
    }
    for (const l of leads) {
      const tag = l.zeit.slice(0, 10);
      if (!proTag.has(tag)) proTag.set(tag, { besucher: new Set(), leads: 0 });
      proTag.get(tag)!.leads++;
    }

    const besucher = sitzungen.size;
    const kennzahlen: Kennzahlen = {
      besucher,
      seitenaufrufe,
      checksGestartet: starter.size,
      checksBeendet: beender.size,
      leads: leads.length,
      klicks,
      startquote: besucher ? starter.size / besucher : 0,
      abschlussquote: starter.size ? beender.size / starter.size : 0,
      leadquote: besucher ? leads.length / besucher : 0,
    };

    const verlauf: Tageswert[] = [...proTag.entries()]
      .map(([tag, v]) => ({ tag, besucher: v.besucher.size, leads: v.leads }))
      .sort((a, b) => (a.tag < b.tag ? -1 : 1));

    const anzahlProAnlass = new Map<string, number>();
    for (const l of leads) anzahlProAnlass.set(l.anlass, (anzahlProAnlass.get(l.anlass) ?? 0) + 1);

    const trichter = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
      schritt: `Frage ${n}`,
      anzahl: proFrage.get(n)?.size ?? 0,
    }));

    return {
      demo: false,
      stand: new Date().toISOString(),
      kennzahlen,
      verlauf,
      anlaesse: [...anzahlProAnlass.entries()]
        .map(([anlass, anzahl]) => ({ anlass, anzahl }))
        .sort((a, b) => b.anzahl - a.anzahl),
      leads,
      trichter,
    };
  } catch (fehler) {
    console.error("Auswertung konnte nicht gelesen werden:", fehler);
    return { ...demoAuswertung(tage), demo: true, kennzahlen: { ...leerzahlen() }, leads: [] };
  }
}
