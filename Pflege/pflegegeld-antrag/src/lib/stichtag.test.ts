import { stichtagslage } from "./stichtag.ts";
import { BETRAEGE_2026, BETRAEGE_2027 } from "./leistungen.ts";

let geprueft = 0;
let fehler = 0;

function gleich(was: string, ist: unknown, soll: unknown) {
  geprueft++;
  if (JSON.stringify(ist) !== JSON.stringify(soll)) {
    fehler++;
    console.error(`  FEHLER  ${was}\n          ist  ${JSON.stringify(ist)}\n          soll ${JSON.stringify(soll)}`);
  } else {
    console.log(`  ok      ${was} = ${JSON.stringify(soll)}`);
  }
}

console.log("\n1) Gleicher Pflegegrad — der Antragstag aendert nichts");
for (const g of [0, 1, 2, 3, 4, 5]) {
  const l = stichtagslage(g, g);
  gleich(`Pflegegrad ${g} gegen ${g}: kein Unterschied`, [l.machtUnterschied, l.proMonat], [false, 0]);
}

console.log("\n2) Der Unterschied wird mit den Saetzen ab 2027 gerechnet, nicht mit den heutigen");
{
  // Pflegegrad 3 gegen 2: nach dem Entwurf 630 gegen 380.
  const l = stichtagslage(3, 2);
  gleich("Pflegegrad 3 gegen 2 je Monat", l.proMonat, BETRAEGE_2027.pflegegeld[2] - BETRAEGE_2027.pflegegeld[1]);
  gleich("das sind 250 Euro", l.proMonat, 250);
  gleich("ueber fuenf Jahre", l.fuenfJahre, 250 * 60);
  const falschGerechnet = BETRAEGE_2027.pflegegeld[2] - BETRAEGE_2026.pflegegeld[2];
  gleich(
    "nicht die Differenz zwischen altem und neuem Satz",
    l.proMonat !== falschGerechnet,
    true,
  );
}

console.log("\n3) Pflegegrad 1 gegen keinen: der Grad unterscheidet sich, das Geld nicht");
{
  const l = stichtagslage(1, 0);
  gleich("es ist ein Unterschied", l.machtUnterschied, true);
  gleich("aber kein Geld", l.proMonat, 0);
  gleich("und das wird als solches erkannt", l.nurSachleistung, true);
}

console.log("\n4) Pflegegrad 2 gegen keinen: voller Betrag");
{
  const l = stichtagslage(2, 0);
  gleich("je Monat der volle Satz fuer Pflegegrad 2", l.proMonat, 380);
  gleich("nicht als reiner Sachleistungsfall", l.nurSachleistung, false);
}

console.log("\n5) Der Stichtag kann nie zum Nachteil wirken");
{
  // Die Schwellen steigen, also kann der frueh ermittelte Grad nie niedriger
  // sein als der spaete. Ein negativer Betrag waere ein Rechenfehler.
  let alleNichtNegativ = true;
  for (let f = 0; f <= 5; f++) {
    for (let s = 0; s <= f; s++) {
      if (stichtagslage(f, s).proMonat < 0) alleNichtNegativ = false;
    }
  }
  gleich("kein negativer Betrag, wenn frueh >= spaet", alleNichtNegativ, true);
}

console.log("\n6) Jeder Pflegegrad liefert einen Betrag aus der Tabelle");
for (let g = 1; g <= 5; g++) {
  gleich(
    `Pflegegrad ${g} gegen keinen = Tabellenwert`,
    stichtagslage(g, 0).proMonat,
    BETRAEGE_2027.pflegegeld[g - 1],
  );
}

console.log(
  fehler === 0
    ? `\nALLES GRUEN: ${geprueft} von ${geprueft} Pruefungen bestanden.\n`
    : `\nNICHT GRUEN: ${fehler} von ${geprueft} Pruefungen fehlgeschlagen.\n`,
);
process.exit(fehler === 0 ? 0 : 1);
