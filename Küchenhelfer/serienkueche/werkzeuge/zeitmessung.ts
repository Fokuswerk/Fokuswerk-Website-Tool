/* Wie lange rechnet der Planer? Gemessen, nicht geschaetzt. */
import { angleichen, planeKueche, STANDARD_RAUM, type Raumangaben } from "@/lib/planer";

const raum = (breite: number, form: Raumangaben["form"] = "eine-wand"): Raumangaben =>
  angleichen({ ...STANDARD_RAUM, form, breite, tiefe: form === "eine-wand" ? 2600 : 2800,
    nutz: { haupt: breite, links: 2800, rechts: 2800, gegenueber: breite } });

const faelle: Array<[string, Raumangaben]> = [
  ["3,40 m eine Wand", raum(3400)],
  ["4,60 m eine Wand", raum(4600)],
  ["5,20 m eine Wand", raum(5200)],
  ["5,80 m eine Wand", raum(5800)],
  ["6,40 m eine Wand", raum(6400)],
  ["3,60 m ueber Eck", raum(3600, "ecke")],
  ["4,20 m U-Form", raum(4200, "u-form")],
];

console.log("Fall".padEnd(22), "ms/Plan".padStart(9), "Module".padStart(8), "moeglich");
for (const [name, r] of faelle) {
  const t0 = performance.now();
  let n = 0, mod = 0, ok = true;
  for (let i = 0; i < 5; i++) {
    const v = planeKueche({ ...r, breite: r.breite + i }, "arbeiten");
    n++;
    mod = Object.values(v.belegung).flat().length;
    ok = ok && v.moeglich;
  }
  const ms = (performance.now() - t0) / n;
  console.log(name.padEnd(22), ms.toFixed(1).padStart(9), String(mod).padStart(8), ok ? "ja" : "NEIN");
}
