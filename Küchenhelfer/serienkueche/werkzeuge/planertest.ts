import { alleVorschlaege, planeKueche, pruefeAngaben, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { belegungsbreite } from "@/data/module";
import { alsKuechentyp } from "@/lib/planer";
import { eur } from "@/lib/berechnung";

const faelle: Array<{ name: string; raum: Raumangaben }> = [
  { name: "Standard 3,20 m eine Wand", raum: STANDARD_RAUM },
  { name: "Kurze Wand 2,40 m, alles gewuenscht", raum: { ...STANDARD_RAUM, wandA: 2400, fenster: null } },
  { name: "Zu kurz 1,60 m", raum: { ...STANDARD_RAUM, wandA: 1600, fenster: null } },
  { name: "Lange Wand 4,80 m", raum: { ...STANDARD_RAUM, wandA: 4800 } },
  { name: "Ecke 3,00 + 1,80", raum: { ...STANDARD_RAUM, form: "ecke", wandA: 3000, wandB: 1800 } },
  { name: "Zwei Waende, enger Gang", raum: { ...STANDARD_RAUM, form: "zwei-waende", wandA: 3000, wandB: 2400, tiefe: 2300 } },
  { name: "Ohne Spuelmaschine, kleiner Kuehlschrank", raum: { ...STANDARD_RAUM, wandA: 2400, fenster: null, wuensche: { ...STANDARD_RAUM.wuensche, geschirrspueler: false, grosserKuehlschrank: false } } },
];

let fehler = 0;
for (const f of faelle) {
  console.log(`\n--- ${f.name} ---`);
  const warn = pruefeAngaben(f.raum);
  if (warn.length) console.log("  Hinweise vorab: " + warn.join(" | "));
  const typ = alsKuechentyp(f.raum);
  for (const v of alleVorschlaege(f.raum)) {
    if (!v.moeglich) { console.log(`  ${v.titel.padEnd(14)} NICHT MOEGLICH: ${v.grund}`); continue; }
    // Invariante: jede Zeile geht exakt auf
    for (const z of typ.zeilen) {
      const b = belegungsbreite(v.belegung[z.id] ?? []);
      if (b !== z.laenge) { console.log(`  !! ${v.titel} Zeile ${z.id}: ${b} statt ${z.laenge}`); fehler++; }
    }
    console.log(`  ${v.titel.padEnd(14)} ${eur(v.preis).padStart(9)}  Arbeitsfl. ${String(v.arbeitsflaeche).padStart(4)}  Weg ${String(v.wegZumWasser).padStart(4)}  OS ${v.haengeschraenke}  Module: ${(v.belegung["Z1"]||[]).join(" ")}`);
  }
}
console.log(fehler === 0 ? "\nAlle Zeilen gehen exakt auf." : `\n${fehler} FEHLER`);
