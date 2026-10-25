/* Haelt der Plan still, wenn jemand die Wand zieht?
   Acht Richter haben unabhaengig behauptet, besteAnordnung sei ein globaler
   Optimierer ohne Gedaechtnis und wuerfle bei jedem Millimeter die halbe
   Zeile neu. Das ist die Gegenprobe. */
import { MODULE } from "@/data/module";
import { angleichen, planeKueche, passeAn, zieheAn, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";

const raum = (breite: number): Raumangaben =>
  angleichen({ ...STANDARD_RAUM, form: "eine-wand", breite, tiefe: 2600,
    nutz: { haupt: breite, links: 2800, rechts: 2800, gegenueber: breite } });

const MODULBREITE: Record<string, number> = Object.fromEntries(MODULE.filter((m) => m.breite).map((m) => [m.id, m.breite as number]));

const VON = 2400, BIS = 4800, SCHRITT = 10;
const folgen: string[][] = [];
const laengen: number[] = [];
for (let b = VON; b <= BIS; b += SCHRITT) {
  const v = planeKueche(raum(b), "arbeiten");
  const ids: string[] = Object.values(v?.belegung ?? {}).flat();
  folgen.push(ids); laengen.push(b);
}

/* 1. Wieviel bleibt von einem Schritt zum naechsten an derselben Stelle stehen? */
let bruch = 0, summeStabil = 0, maxSprung = 0;
for (let i = 1; i < folgen.length; i++) {
  const a = folgen[i - 1], c = folgen[i];
  let gleich = 0;
  while (gleich < a.length && gleich < c.length && a[gleich] === c[gleich]) gleich++;
  const anteil = a.length ? gleich / a.length : 1;
  summeStabil += anteil;
  if (anteil < 0.5) bruch++;
  if (a.length !== c.length || anteil < 1) {
    const geaendert = Math.max(a.length, c.length) - gleich;
    if (geaendert > maxSprung) maxSprung = geaendert;
  }
}
const schritte = folgen.length - 1;

/* 2. Wo landet die Passleiste? */
const plaetze = { links: 0, mitte: 0, rechts: 0, keine: 0 };
for (const f of folgen) {
  const i = f.findIndex((m) => m.startsWith("PBX:"));
  if (i < 0) plaetze.keine++;
  else if (i === 0) plaetze.links++;
  else if (i === f.length - 1) plaetze.rechts++;
  else plaetze.mitte++;
}

/* 3. Wieviele verschiedene Modulfolgen ueberhaupt? */
const verschieden = new Set(folgen.map((f) => f.map((m) => m.split(":")[0]).join("|"))).size;

/* 4. Und was macht passeAn stattdessen? */
const start = folgen[Math.floor(folgen.length / 2)];
let passtDurch = 0, passtNicht = 0, stabilMitPasseAn = 0;
for (let d = -400; d <= 400; d += 10) {
  const r = passeAn(start, d);
  if (!r) { passtNicht++; continue; }
  passtDurch++;
  let gleich = 0;
  while (gleich < start.length && gleich < r.length && start[gleich] === r[gleich]) gleich++;
  stabilMitPasseAn += start.length ? gleich / start.length : 1;
}

console.log(`Wandlaengen ${VON}-${BIS} mm in ${SCHRITT}-mm-Schritten: ${folgen.length} Plaene, ${schritte} Ziehschritte\n`);
console.log("MIT planeKueche bei jedem Schritt (so war es gedacht):");
console.log(`  im Mittel bleiben ${(summeStabil / schritte * 100).toFixed(1)} % der Zeile an ihrem Platz`);
console.log(`  bei ${bruch} von ${schritte} Schritten bricht mehr als die Haelfte weg`);
console.log(`  groesster Einzelsprung: ${maxSprung} Module auf einmal`);
console.log(`  verschiedene Modulfolgen ueber die Spanne: ${verschieden}`);
console.log(`  Passleiste steht links ${plaetze.links}x, mittig ${plaetze.mitte}x, rechts ${plaetze.rechts}x, gar nicht ${plaetze.keine}x\n`);
console.log("MIT passeAn (nur das Ende anpassen):");
console.log(`  im Mittel bleiben ${(stabilMitPasseAn / Math.max(1, passtDurch) * 100).toFixed(1)} % an ihrem Platz`);
console.log(`  ${passtDurch} von ${passtDurch + passtNicht} Schritten gehen durch, ${passtNicht} nicht`);


/* 5. Und zieheAn ueber die ganze Spanne, ausgehend von einem Plan. */
const basis = folgen[0];
const basisBreite = laengen[0];
let zStabil = 0, zDurch = 0, zNicht = 0, zMaxWechsel = 0;
let vorher = basis;
const summe = (ids: string[]) => ids.reduce((s, m) => {
  const b = m.startsWith("PBX:") ? Number(m.slice(4)) : null;
  return s + (b ?? 0);
}, 0);
for (let b = VON; b <= BIS; b += SCHRITT) {
  const r = zieheAn(basis, b - basisBreite);
  if (!r) { zNicht++; continue; }
  zDurch++;
  let gleich = 0;
  while (gleich < vorher.length && gleich < r.length && vorher[gleich] === r[gleich]) gleich++;
  zStabil += vorher.length ? gleich / vorher.length : 1;
  const wechsel = Math.max(vorher.length, r.length) - gleich;
  if (wechsel > zMaxWechsel) zMaxWechsel = wechsel;
  vorher = r;
}
console.log("\nMIT zieheAn (Reihenfolge eingefroren, nur das Ende waechst):");
console.log(`  im Mittel bleiben ${(zStabil / Math.max(1, zDurch) * 100).toFixed(1)} % an ihrem Platz`);
console.log(`  ${zDurch} von ${zDurch + zNicht} Wandlaengen gehen durch`);
console.log(`  groesster Einzelwechsel: ${zMaxWechsel} Module`);

/* 6. Stimmt die Breite am Ende wirklich? */
let falsch = 0, geprueft = 0;
for (let b = VON; b <= BIS; b += SCHRITT) {
  const r = zieheAn(basis, b - basisBreite);
  if (!r) continue;
  geprueft++;
  const ist = r.reduce((s, m) => s + (m.startsWith("PBX:") ? Number(m.slice(4)) : (MODULBREITE[m] ?? 0)), 0);
  if (ist !== b) { if (falsch < 3) console.log(`    FEHLER bei ${b}: Summe ${ist}`); falsch++; }
}
console.log(`  Breitenprobe: ${geprueft - falsch} von ${geprueft} Laengen gehen exakt auf`);
