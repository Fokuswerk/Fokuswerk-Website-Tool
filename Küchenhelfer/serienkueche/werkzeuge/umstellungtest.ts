/*
 * Prueft die Rettung einer von Hand umgestellten Kueche ueber eine Aenderung.
 *
 * Zwei Fragen: Wird gerettet, was gerettet gehoert? Und ist alles, was
 * gerettet wird, danach noch eine baubare Kueche?
 */
import {
  alsKuechentyp, angleichen, ausBelegung, befundeZeile, fensterzone, hartePruefung, pflichtmodule,
  planeKueche, STANDARD_RAUM, tauschPlan, uebernimmUmstellung,
  type Raumangaben, type Strategie,
} from "@/lib/planer";
import { belegungsbreite, istBekanntesModul, modul } from "@/data/module";

let fehler = 0;
const sage = (gut: boolean, text: string) => {
  if (!gut) { fehler++; console.log("  FEHLER " + text); } else console.log("  ok     " + text);
};

/** Haelt die gerettete Belegung, was der Planer von jeder Belegung verlangt? */
function baubar(raum: Raumangaben, belegung: Record<string, string[]>): string | null {
  const typ = alsKuechentyp(raum);
  const zeilen = typ.zeilen.map((z) => z.id).sort();
  const da = Object.keys(belegung).sort();
  if (zeilen.join() !== da.join()) return `Zeilen ${da.join(",")} statt ${zeilen.join(",")}`;
  for (const z of typ.zeilen) {
    const ids = belegung[z.id];
    for (const id of ids) if (!istBekanntesModul(id)) return `unbekanntes Modul ${id}`;
    const b = belegungsbreite(ids);
    if (b !== z.laenge) return `${z.id}: ${b} mm statt ${z.laenge} mm`;
    /* Harte Regeln duerfen von Hand gebrochen sein — aber dann muss es
       in den Hinweisen stehen. */
    const h = hartePruefung(ids, z.laenge, fensterzone(typ, z));
    if (h && befundeZeile(raum, typ, z.id, ids).length === 0) {
      return `${z.id}: ${h} — und kein Hinweis dazu`;
    }
  }
  const alle = Object.values(belegung).flat();
  for (const m of pflichtmodule(raum)) {
    const soll = pflichtmodule(raum).filter((x) => x === m).length;
    const ist = alle.filter((x) => x === m).length;
    if (soll !== ist) return `${m} ${ist}x statt ${soll}x`;
  }
  for (const m of ["SP600", "KF600", "HK600", "KS600", "HB600", "GS600", "GS450"]) {
    if (!pflichtmodule(raum).includes(m) && alle.includes(m)) return `${m} steht noch drin, gehoert aber nicht mehr dazu`;
  }
  return null;
}

/** Eine Umstellung von Hand: die ersten beiden Schraenke der laengsten Zeile tauschen. */
function stelleUm(raum: Raumangaben, s: Strategie): Record<string, string[]> | null {
  const typ = alsKuechentyp(raum);
  const v = planeKueche(raum, s);
  if (!v.moeglich) return null;
  const zeile = [...typ.zeilen].sort((a, b) => b.laenge - a.laenge)[0];
  const ids = v.belegung[zeile.id] ?? [];
  // Zwei gleich breite Nachbarn tauschen — so stellt auch ein Nutzer um,
  // und es bricht keine Regel, die vorher gehalten hat.
  for (let i = 0; i < ids.length - 1; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      if (modul(ids[i]).breite !== modul(ids[j]).breite) continue;
      if (ids[i] === ids[j]) continue;
      const t = tauschPlan(typ, v.belegung, { zeile: zeile.id, index: i }, { zeile: zeile.id, index: j });
      if ("grund" in t) continue;
      const neu = { ...v.belegung, ...t.belegung };
      if (hartePruefung(neu[zeile.id], zeile.laenge, fensterzone(typ, zeile)) === null) return neu;
    }
  }
  return v.belegung;
}

const AENDERUNGEN: Array<{ name: string; mach: (r: Raumangaben) => Raumangaben; mussHalten?: boolean }> = [
  { name: "Ausstattungsstufe gehoben", mach: (r) => ({ ...r, niveau: "gehoben" }), mussHalten: true },
  { name: "Dunstabzug gewechselt", mach: (r) => ({ ...r, geraete: { ...r.geraete, dunstabzug: "da-siemens-li67" } }), mussHalten: true },
  { name: "Wasseranschluss an die andere Wand", mach: (r) => ({ ...r, wasser: { ...r.wasser, von: 300 } }), mussHalten: true },
  { name: "Spuelmaschine 60 auf 45 cm", mach: (r) => ({ ...r, geraete: { ...r.geraete, spuelmaschine: "gs-siemens-sr61" } }) },
  { name: "Spuelmaschine ganz weg", mach: (r) => ({ ...r, geraete: { ...r.geraete, spuelmaschine: "gs-keine" } }) },
  { name: "Kuehlschrank hoch auf Unterbau", mach: (r) => ({ ...r, geraete: { ...r.geraete, kuehlschrank: "ks-bosch-kur21" } }) },
  { name: "Backofen nach oben", mach: (r) => ({ ...r, ofenHoch: true }) },
  { name: "Wand 2 cm laenger", mach: (r) => angleichen({ ...r, breite: r.breite + 20 }) },
  { name: "Wand 40 cm kuerzer", mach: (r) => angleichen({ ...r, breite: r.breite - 400 }) },
  { name: "Fenster verschoben", mach: (r) => (r.fenster ? angleichen({ ...r, fenster: { ...r.fenster, von: Math.max(0, r.fenster.von - 600) } }) : r) },
  { name: "Form auf Ecke", mach: (r) => angleichen({ ...r, form: "ecke" }) },
  { name: "Gedreht", mach: (r) => angleichen({ ...r, ausrichtung: (r.ausrichtung + 1) % 4 }) },
];

const BASIS: Array<{ name: string; raum: Raumangaben }> = [
  { name: "Eine Wand 3,40 m", raum: STANDARD_RAUM },
  { name: "Ueber Eck 3,60/2,80", raum: angleichen({ ...STANDARD_RAUM, form: "ecke", breite: 3600, tiefe: 2800 }) },
  { name: "U-Form 3,60/2,70", raum: angleichen({ ...STANDARD_RAUM, form: "u-form", breite: 3600, tiefe: 2700 }) },
  { name: "Zwei Waende 3,20/2,60", raum: angleichen({ ...STANDARD_RAUM, form: "zwei-waende", breite: 3200, tiefe: 2600 }) },
];

let gerettet = 0, verworfen = 0;
for (const b of BASIS) {
  console.log(`\n--- ${b.name} ---`);
  for (const s of ["guenstig", "stauraum", "arbeiten"] as const) {
    const eigen = stelleUm(b.raum, s);
    if (!eigen) continue;
    const start = baubar(b.raum, eigen);
    sage(start === null, `${s}: Ausgangsanordnung ist baubar${start ? " — " + start : ""}`);
    for (const ae of AENDERUNGEN) {
      const neu = ae.mach(b.raum);
      if (JSON.stringify(neu) === JSON.stringify(b.raum)) continue;
      const r = uebernimmUmstellung(neu, eigen);
      if ("grund" in r) {
        verworfen++;
        if (ae.mussHalten) sage(false, `${s} / ${ae.name}: haette halten muessen — "${r.grund}"`);
        if (!r.grund.endsWith(".")) sage(false, `${s} / ${ae.name}: Grund ohne Punkt — "${r.grund}"`);
        continue;
      }
      gerettet++;
      const schlecht = baubar(neu, r.belegung);
      sage(schlecht === null, `${s} / ${ae.name}: gerettet und baubar${schlecht ? " — " + schlecht : ""}`);
      // Und die Rechnung muss damit durchlaufen, ohne zu werfen.
      try {
        const v = ausBelegung(neu, alsKuechentyp(neu), s, r.belegung);
        sage(v.preis > 0, `${s} / ${ae.name}: Preis ${v.preis} EUR`);
      } catch (e) {
        sage(false, `${s} / ${ae.name}: ausBelegung wirft — ${(e as Error).message}`);
      }
    }
  }
}

console.log(`\n${gerettet} gerettet, ${verworfen} mit Begruendung verworfen.`);
console.log(fehler === 0 ? "Keine Beanstandung." : `${fehler} Beanstandungen.`);
process.exit(fehler === 0 ? 0 : 1);
