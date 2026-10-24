import {
  alleVorschlaege, angleichen, planeKueche, STANDARD_RAUM,
  pflichtmodule, type Raumangaben, type Strategie,
} from "@/lib/planer";
import { modul } from "@/data/module";
import { geraeteFuer, STANDARD_GERAETE } from "@/data/geraete";

const r = (teil: Partial<Raumangaben>): Raumangaben => ({ ...STANDARD_RAUM, ...teil });

const fak: number[] = [1];
for (let i = 1; i <= 25; i++) fak[i] = fak[i - 1] * i;

/** Zahl der unterscheidbaren Reihenfolgen, analytisch. */
function perms(ids: string[]): number {
  const z = new Map<string, number>();
  for (const m of ids) z.set(m, (z.get(m) ?? 0) + 1);
  let p = fak[ids.length];
  for (const n of z.values()) p /= fak[n];
  return p;
}

// --- Nachbau von fuellung/verteile, nur um die Modulliste zu sehen ---
const FUELLER: Record<string, [string, string, string]> = {
  guenstig: ["UT600", "UT450", "US300"],
  stauraum: ["AZ600", "US450", "AZ300"],
  arbeiten: ["US600", "US450", "US300"],
};
function fuellungNach(rest: number, strat: string): string[] {
  const [breit, schmal, schmaler] = FUELLER[strat];
  const stufen: Array<[number, string]> = [[600, breit], [450, schmal], [300, schmaler]];
  let beste = [0, 0, 0], bestBelegt = -1, besteTeile = Infinity;
  for (let a = 0; a * 600 <= rest; a++)
    for (let b = 0; a * 600 + b * 450 <= rest; b++)
      for (let c = 0; a * 600 + b * 450 + c * 300 <= rest; c++) {
        const belegt = a * 600 + b * 450 + c * 300, teile = a + b + c;
        if (belegt > bestBelegt || (belegt === bestBelegt && teile < besteTeile)) {
          bestBelegt = belegt; besteTeile = teile; beste = [a, b, c];
        }
      }
  const aus = stufen.flatMap(([, id], i) => Array<string>(beste[i]).fill(id));
  if (rest - bestBelegt > 0) aus.push(`PBX:${rest - bestBelegt}`);
  return aus;
}
const breiteVon = (ids: string[]) => ids.reduce((s, id) => s + (modul(id).breite ?? 0), 0);

console.log("=== A) Kandidatenzahl einer EINZELNEN Zeile, Strategie arbeiten ===");
console.log("Standardgeraete (SP600,KF600,HK600,GS600), Rest per fuellung\n");
let maxP = 0, maxL = 0, maxMod: string[] = [];
const ueber: Array<[number, number, number]> = [];
for (let L = 1200; L <= 9000; L += 100) {
  const pflicht = ["SP600", "KF600", "HK600", "GS600"];
  const rest = L - breiteVon(pflicht);
  if (rest < 0) continue;
  const mods = [...pflicht, ...fuellungNach(rest, "arbeiten")];
  const p = perms(mods);
  if (p > maxP) { maxP = p; maxL = L; maxMod = mods; }
  if (p > 400000) ueber.push([L, p, mods.length]);
}
console.log(`Maximum: ${maxL} mm -> ${maxP.toLocaleString("de-DE")} Reihenfolgen, ${maxMod.length} Module`);
console.log(`  ${maxMod.join(" ")}`);
console.log(`Laengen ueber der Grenze 400.000: ${ueber.length} von 79 Rasterstellen`);
console.log("  erste:", ueber.slice(0, 6).map(([l, p, n]) => `${l}mm=${p.toLocaleString("de-DE")} (${n} Mod.)`).join(", "));
console.log("  groesste:", ueber.slice().sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l, p, n]) => `${l}mm=${p.toLocaleString("de-DE")} (${n} Mod.)`).join(", "));

console.log("\n=== B) Zeit fuer planeKueche, eine Wand ===");
function zeit(f: () => unknown, runden = 1): number {
  const t = process.hrtime.bigint();
  for (let i = 0; i < runden; i++) f();
  return Number(process.hrtime.bigint() - t) / 1e6 / runden;
}
for (const L of [2400, 3400, 4000, 4600, 5000, 5200, 5600, 6000, 6600, 7000, 7600, 8200, 9000]) {
  const raum = r({ breite: L, nutz: { ...STANDARD_RAUM.nutz, haupt: L }, fenster: null });
  const ms = zeit(() => planeKueche(raum, "arbeiten"));
  const ms3 = zeit(() => alleVorschlaege(raum));
  const v = planeKueche(raum, "arbeiten");
  const n = (v.belegung["Z-haupt"] ?? []).length;
  console.log(`  ${L} mm  ${n.toString().padStart(2)} Module  planeKueche ${ms.toFixed(1).padStart(8)} ms   alleVorschlaege ${ms3.toFixed(1).padStart(8)} ms`);
}

console.log("\n=== C) U-Form, drei lange Zeilen ===");
for (const [b, t] of [[3400, 2800], [4600, 3400], [6000, 4000], [9000, 9000]] as const) {
  const raum = r({ form: "u-form", breite: b, tiefe: t, nutz: { haupt: b, links: t, rechts: t, gegenueber: b }, fenster: null });
  const ms = zeit(() => planeKueche(raum, "arbeiten"));
  const ms3 = zeit(() => alleVorschlaege(raum));
  console.log(`  U ${b}/${t}/${t}  planeKueche ${ms.toFixed(1).padStart(9)} ms   alleVorschlaege ${ms3.toFixed(1).padStart(9)} ms`);
}

console.log("\n=== D) Geraeteschritt: ein Plan je Option + Vorschau ===");
for (const [b, t] of [[3400, 2800], [4600, 2800], [5000, 2800], [6000, 4000]] as const) {
  const raum0 = r({ breite: b, tiefe: t, nutz: { ...STANDARD_RAUM.nutz, haupt: b }, fenster: null });
  for (const art of ["kuehlschrank", "spuelmaschine"] as const) {
    const opts = geraeteFuer(art);
    const ms = zeit(() => {
      planeKueche(raum0, "arbeiten");            // jetzt
      for (const g of opts) {
        if (g.id === raum0.geraete[art]) continue;
        planeKueche(angleichen({ ...raum0, geraete: { ...raum0.geraete, [art]: g.id } }), "arbeiten");
      }
      planeKueche(raum0, "arbeiten");            // vorschau
    });
    console.log(`  ${b}/${t} ${art.padEnd(14)} ${opts.length} Optionen -> ${ms.toFixed(1).padStart(9)} ms Renderblockade`);
  }
}

console.log("\n=== E) Wo die Grenze 400.000 wirklich greift (abgeschnitten?) ===");
for (const L of [4600, 5000, 5200, 5600, 6200, 7000]) {
  const raum = r({ breite: L, nutz: { ...STANDARD_RAUM.nutz, haupt: L }, fenster: null });
  const v = planeKueche(raum, "arbeiten");
  const ids = v.belegung["Z-haupt"] ?? [];
  console.log(`  ${L} mm: ${perms(ids).toLocaleString("de-DE")} Reihenfolgen bei ${ids.length} Modulen -> ${perms(ids) > 400000 ? "ABGESCHNITTEN" : "vollstaendig"}`);
}
