import { pruefeBelegungen, projektsumme, kennzahlen, preis, variantenFuer, eur } from "@/lib/berechnung";
import { KUECHENTYPEN, WOHNUNGEN, typFuer } from "@/data/projekt";
import { STANDARDWAHL } from "@/data/varianten";

const fehler = pruefeBelegungen();
console.log(fehler.length === 0 ? "Belegungen: alle Zeilen gehen exakt auf" : "FEHLER:\n" + fehler.join("\n"));

console.log("\nWohnungen je Typ:");
let n = 0;
for (const t of KUECHENTYPEN) {
  n += t.wohnungen.length;
  console.log(`  ${t.id}  ${String(t.wohnungen.length).padStart(2)} WE  ${t.bezeichnung}  (gespiegelt: ${t.gespiegelt.length})`);
}
console.log(`  Summe: ${n} von ${WOHNUNGEN.length}`);

console.log("\nVarianten je Typ (Preis / Stauraum / Arbeitsfl. / Weg / Bewertung):");
for (const t of KUECHENTYPEN) {
  for (const v of variantenFuer(t.id)) {
    const k = kennzahlen(v, t);
    console.log(
      `  ${v.id.padEnd(8)} ${v.schwerpunkt.padEnd(10)} ${eur(k.preis).padStart(10)}  ${String(k.stauraum).padStart(4)} l  ${String(k.arbeitsflaeche).padStart(5)} mm  ${String(k.installationsweg).padStart(5)} mm  ${String(k.bewertung).padStart(3)}`,
    );
  }
}

const p = projektsumme(STANDARDWAHL);
console.log("\nProjektsumme mit Standardwahl:");
for (const z of p.jeTyp) {
  console.log(`  ${z.typId}  ${z.variantId.padEnd(8)} ${String(z.anzahl).padStart(2)} x ${eur(z.einzel).padStart(10)} = ${eur(z.summe).padStart(12)}`);
}
console.log(`  GESAMT: ${eur(p.gesamt)}  (Richtwert aus dem Briefing: 203.200 EUR)`);
console.log(`  Positionen in der Projektstueckliste: ${p.positionen.length}`);
