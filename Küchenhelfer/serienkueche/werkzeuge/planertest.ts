import { alleVorschlaege, alsKuechentyp, kuechenwaende, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";
import { belegungsbreite, modul } from "@/data/module";
import { platzierung } from "@/lib/berechnung";
import { eur } from "@/lib/berechnung";

const r = (teil: Partial<Raumangaben>): Raumangaben => ({ ...STANDARD_RAUM, ...teil });

const faelle: Array<{ name: string; raum: Raumangaben }> = [
  { name: "Eine Wand 3,40 m", raum: STANDARD_RAUM },
  { name: "Fenster ganz links", raum: r({ fenster: { wand: "haupt", von: 0, breite: 1200 } }) },
  { name: "Fenster links versetzt", raum: r({ fenster: { wand: "haupt", von: 300, breite: 1200 } }) },
  { name: "Kein Fenster", raum: r({ fenster: null }) },
  { name: "Kurze Wand 2,40 m", raum: r({ breite: 2400, nutz: { ...STANDARD_RAUM.nutz, haupt: 2400 }, fenster: null }) },
  { name: "Zu kurz 1,60 m", raum: r({ breite: 1600, nutz: { ...STANDARD_RAUM.nutz, haupt: 1600 }, fenster: null }) },
  { name: "Ecke links, Zeilen 3,40 / 1,80", raum: r({ form: "ecke", seite: "links", nutz: { ...STANDARD_RAUM.nutz, links: 1800 } }) },
  { name: "U-Form, links 1,80 / rechts 2,40", raum: r({ form: "u-form", nutz: { haupt: 3400, links: 1800, rechts: 2400, gegenueber: 3400 } }) },
  { name: "Schmale Spuelmaschine, kleiner Kuehlschrank", raum: r({ breite: 2400, nutz: { ...STANDARD_RAUM.nutz, haupt: 2400 }, fenster: null, geraete: { ...STANDARD_RAUM.geraete, spuelmaschine: "gs-45", kuehlschrank: "kuehl-klein" } }) },
  { name: "Backofen hoch, Induktion", raum: r({ breite: 4200, nutz: { ...STANDARD_RAUM.nutz, haupt: 4200 }, geraete: { ...STANDARD_RAUM.geraete, backofen: "ofen-hoch", kochfeld: "kf-induktion" } }) },
];

let fehler = 0;
for (const f of faelle) {
  console.log(`\n--- ${f.name} ---`);
  const typ = alsKuechentyp(f.raum);
  for (const v of alleVorschlaege(f.raum)) {
    if (!v.moeglich) { console.log(`  ${v.titel.padEnd(14)} NICHT MOEGLICH`); continue; }

    for (const z of typ.zeilen) {
      const b = belegungsbreite(v.belegung[z.id] ?? []);
      if (b !== z.laenge) { console.log(`  !! ${v.titel} ${z.id}: ${b} statt ${z.laenge}`); fehler++; }
    }

    // Regel: nichts Hohes vor dem Fenster, Kochfeld nicht an der Wandkante
    for (const z of typ.zeilen) {
      const fe = typ.oeffnungen.find((o) => o.art === "fenster" && o.wand === z.wand);
      for (const p of platzierung(v.variante, z.id)) {
        const m = modul(p.modulId);
        if (fe) {
          const von = fe.von - z.start, bis = fe.von + fe.breite - z.start;
          if (m.kategorie === "hochschrank" && p.von < bis && p.bis > von) {
            console.log(`  !! ${v.titel}: ${m.bezeichnung} vor dem Fenster (${p.von}-${p.bis})`); fehler++;
          }
        }
        if (p.modulId === "KF600" && Math.min(p.von, z.laenge - p.bis) < 300) {
          console.log(`  !! ${v.titel}: Kochfeld nur ${Math.min(p.von, z.laenge - p.bis)} mm von der Kante`); fehler++;
        }
      }
    }

    const z1 = typ.zeilen[0].id;
    console.log(`  ${v.titel.padEnd(14)} ${eur(v.preis).padStart(9)}  Arbeitsfl. ${String(v.arbeitsflaeche).padStart(4)}  OS ${v.haengeschraenke}  ${(v.belegung[z1] || []).join(" ")}`);
  }
}
console.log(fehler === 0 ? "\nAlle Regeln eingehalten, alle Zeilen gehen auf." : `\n${fehler} FEHLER`);
