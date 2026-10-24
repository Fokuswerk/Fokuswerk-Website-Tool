import { alleVorschlaege, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { modul } from "@/data/module";

const r = (t: Partial<Raumangaben>): Raumangaben => ({ ...STANDARD_RAUM, ...t });
const wand = (L: number, extra: Partial<Raumangaben> = {}) =>
  r({ breite: L, nutz: { ...STANDARD_RAUM.nutz, haupt: L }, fenster: null, ...extra });

console.log("=== 1) Bricht die Kappung die Regel 'Spuelmaschine neben die Spuele'? ===");
for (const L of [4600, 5000, 5200, 5600, 5800, 6200, 6800, 7400, 8000, 8600]) {
  const v = planeKueche(wand(L), "arbeiten");
  const ids = v.belegung["Z-haupt"] ?? [];
  const iSp = ids.indexOf("SP600"), iGs = ids.indexOf("GS600"), iKf = ids.indexOf("KF600");
  const mm = (i: number) => ids.slice(0, i).reduce((s, m) => s + (modul(m).breite ?? 0), 0);
  console.log(
    `  ${L} mm (${ids.length} Mod.): Spuele bei ${mm(iSp)} mm, Spuelmaschine bei ${mm(iGs)} mm` +
    ` -> Abstand ${Math.abs(iSp - iGs)} Plaetze${Math.abs(iSp - iGs) > 1 ? "  ** REGEL GEBROCHEN **" : ""}` +
    `   Kochfeld bei ${mm(iKf)} mm`,
  );
}

console.log("\n=== 2) Warm gemessen (JIT warm, wie beim Ziehen am Regler) ===");
function warm(f: () => unknown, runden: number): number {
  for (let i = 0; i < 3; i++) f();
  const t = process.hrtime.bigint();
  for (let i = 0; i < runden; i++) f();
  return Number(process.hrtime.bigint() - t) / 1e6 / runden;
}
console.log("  Hero-Regler (MIN 2500 .. MAX 4600, Schritt 100): je Raststelle ein planeKueche");
let summe = 0;
for (let L = 2500; L <= 4600; L += 100) {
  const ms = warm(() => planeKueche(wand(L, { tiefe: 2500, fenster: L >= 3000 ? { wand: "haupt" as const, von: Math.round(L * 0.55), breite: 1100 } : null, wasser: { wand: "haupt" as const, von: Math.round(L * 0.78) } }), "arbeiten"), 5);
  summe += ms;
  if (L >= 4000 || L === 2500 || L === 3400) console.log(`    ${L} mm: ${ms.toFixed(1)} ms`);
}
console.log(`    Ein Zug ueber die ganze Skala (22 Raststellen): ${summe.toFixed(0)} ms Rechenzeit`);

console.log("\n  /kueche, warm:");
for (const L of [4600, 5000, 5600, 7000, 8200, 8600]) {
  const a = warm(() => planeKueche(wand(L), "arbeiten"), 3);
  const b = warm(() => alleVorschlaege(wand(L)), 2);
  console.log(`    ${L} mm: planeKueche ${a.toFixed(0).padStart(4)} ms   alleVorschlaege ${b.toFixed(0).padStart(5)} ms`);
}

console.log("\n=== 3) Speicher: wie gross wird die Kandidatenliste? ===");
for (const L of [4600, 5600, 8200]) {
  if (global.gc) global.gc();
  const vor = process.memoryUsage().heapUsed;
  let spitze = vor;
  const uhr = setInterval(() => { spitze = Math.max(spitze, process.memoryUsage().heapUsed); }, 1);
  planeKueche(wand(L), "arbeiten");
  clearInterval(uhr);
  console.log(`  ${L} mm: Heap-Spitze +${((spitze - vor) / 1024 / 1024).toFixed(0)} MB`);
}

console.log("\n=== 4) Ofen hoch + Unterbaukuehlschrank: mehr unterscheidbare Typen ===");
for (const L of [4000, 4600, 5000]) {
  const raum = wand(L, { ofenHoch: true, geraete: { ...STANDARD_RAUM.geraete, spuelmaschine: "gs-siemens-sr61" } });
  const a = warm(() => planeKueche(raum, "arbeiten"), 2);
  const ids = planeKueche(raum, "arbeiten").belegung["Z-haupt"] ?? [];
  console.log(`  ${L} mm, Ofen hoch + 45er GS (${ids.length} Mod.): ${a.toFixed(0)} ms`);
}
