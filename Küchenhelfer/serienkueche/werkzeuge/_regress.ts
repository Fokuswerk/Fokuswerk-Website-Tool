import { STANDARD_RAUM, planeKueche, alsKuechentyp, platteLaenge, freieFlaeche, haengemodule, haengeplaetze, pflichtmodule, uebernimmUmstellung, ausBelegung, alleVorschlaege, angleichen } from "@/lib/planer";
import { modul, belegungsbreite } from "@/data/module";
import { rolleVon } from "@/lib/masse";

const raum = { ...STANDARD_RAUM, geraete: { ...STANDARD_RAUM.geraete, kuehlschrank: "ks-bosch-kur21" } };
console.log("pflichtmodule:", pflichtmodule(raum));
const p = planeKueche(raum, "arbeiten");
console.log("moeglich", p.moeglich, p.grund ?? "");
const typ = alsKuechentyp(raum);
console.log("belegung:", JSON.stringify(p.belegung));
const gesamtBreite = Object.values(p.belegung).flat().reduce((s, id) => s + (modul(id).breite ?? 0), 0);
console.log("Summe Korpusbreiten:", gesamtBreite, " Zeilenlaenge:", typ.zeilen.reduce((s,z)=>s+z.laenge,0));
console.log("platteLaenge:", platteLaenge(typ, p.belegung));
console.log("rolleVon KS600:", rolleVon("KS600"));
console.log("haengeplaetze:", haengeplaetze(typ, p.belegung).length, "haengemodule:", JSON.stringify(haengemodule(typ, p.belegung)), "feld haengeschraenke:", p.haengeschraenke);
console.log("arbeitsflaeche:", p.arbeitsflaeche);
console.log("kosten:", JSON.stringify(p.kosten));

// Gegenprobe mit Hochkuehlschrank
const raum2 = { ...STANDARD_RAUM, geraete: { ...STANDARD_RAUM.geraete, kuehlschrank: "ks-siemens-ki81" } };
const p2 = planeKueche(raum2, "arbeiten");
const typ2 = alsKuechentyp(raum2);
console.log("\n[hoch] belegung:", JSON.stringify(p2.belegung), "platte:", platteLaenge(typ2, p2.belegung));
