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
  { name: "Ecke links, Zeilen 3,40 / 1,80", raum: r({ form: "ecke", nutz: { ...STANDARD_RAUM.nutz, links: 1800 } }) },
  { name: "Ecke gedreht nach rechts", raum: r({ form: "ecke", ausrichtung: 1, nutz: { ...STANDARD_RAUM.nutz, rechts: 1800 } }) },
  { name: "U-Form offen nach links", raum: r({ form: "u-form", ausrichtung: 1, nutz: { haupt: 3400, links: 2400, rechts: 1800, gegenueber: 3400 } }) },
  { name: "Zwei Waende quer gedreht", raum: r({ form: "zwei-waende", ausrichtung: 1, tiefe: 3200, nutz: { haupt: 3400, links: 3200, rechts: 3200, gegenueber: 3400 }, fenster: null }) },
  { name: "U-Form, Tuer auf der rechten Zeile", raum: r({ form: "u-form", breite: 3620, tiefe: 2740, nutz: { haupt: 3620, links: 2740, rechts: 2740, gegenueber: 3620 }, tuer: { wand: "rechts", von: 1600, breite: 885 } }) },
  { name: "Ecke, Tuer mitten auf der Hauptwand", raum: r({ form: "ecke", breite: 4200, tiefe: 2800, nutz: { haupt: 4200, links: 2800, rechts: 2800, gegenueber: 4200 }, fenster: null, tuer: { wand: "haupt", von: 1500, breite: 885 } }) },
  { name: "Eine Wand an der rechten Seite", raum: r({ form: "eine-wand", ausrichtung: 1, tiefe: 3400, nutz: { ...STANDARD_RAUM.nutz, rechts: 3400 }, fenster: { wand: "rechts", von: 1800, breite: 1100 }, wasser: { wand: "rechts", von: 2600 } }) },
  { name: "U-Form, links 1,80 / rechts 2,40", raum: r({ form: "u-form", nutz: { haupt: 3400, links: 1800, rechts: 2400, gegenueber: 3400 } }) },
  { name: "Schmale Spuelmaschine, kleiner Kuehlschrank", raum: r({ breite: 2400, nutz: { ...STANDARD_RAUM.nutz, haupt: 2400 }, fenster: null, geraete: { ...STANDARD_RAUM.geraete, spuelmaschine: "gs-siemens-sr61", kuehlschrank: "ks-bosch-kur21" } }) },
  { name: "Backofen hoch, Induktion", raum: r({ breite: 4200, nutz: { ...STANDARD_RAUM.nutz, haupt: 4200 }, geraete: { ...STANDARD_RAUM.geraete, backofen: "bo-siemens-hb774", kochfeld: "kf-bosch-pug611" } }) },
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

    // Regel: die Zeile darf nicht durch die Tuer laufen
    for (const z of typ.zeilen) {
      const t = typ.oeffnungen.find((o) => o.art === "tuer" && o.wand === z.wand);
      if (!t) continue;
      const bis = z.start + z.laenge;
      if (z.start < t.von + t.breite && bis > t.von) {
        console.log(`  !! ${v.titel} ${z.id}: Zeile ${z.start}-${bis} laeuft durch die Tuer ${t.von}-${t.von + t.breite}`);
        fehler++;
      }
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
