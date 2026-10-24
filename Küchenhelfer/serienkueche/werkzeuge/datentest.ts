/* Prueft, dass abgeleitete Masse ihrer eigenen Regel folgen. */
import { KUECHENTYPEN } from "@/data/projekt";
import { arbeitshoeheVon, sockelZu, AP_OK, KORPUS, PLATTE } from "@/lib/masse";
import { anschluesse } from "@/lib/ableitung";
import { variantenFuer } from "@/lib/berechnung";
import { bewegungsflaeche } from "@/lib/berechnung";

let fehler = 0;
const sage = (gut: boolean, text: string) => {
  if (!gut) { fehler++; console.log("  FEHLER " + text); } else console.log("  ok     " + text);
};

for (const t of KUECHENTYPEN) {
  const tiefe = t.attribute.raumtiefe?.wert ?? 0;
  const g = t.attribute.gangbreite, b = t.attribute.bewegungsflaeche;
  if (g) sage(g.wert === tiefe - 1200, `${t.id} Gangbreite ${g.wert} = ${tiefe} - 1200`);
  if (b) sage(b.wert === tiefe - 600, `${t.id} Bewegungsflaeche ${b.wert} = ${tiefe} - 600`);
  const ap = arbeitshoeheVon(t);
  sage(sockelZu(ap) + KORPUS + PLATTE === ap, `${t.id} Sockel ${sockelZu(ap)} + ${KORPUS} + ${PLATTE} = ${ap}`);
  sage(sockelZu(ap) >= 60, `${t.id} Sockel ${sockelZu(ap)} mm baubar`);
  const sd = anschluesse(variantenFuer(t.id)[0], t).filter((a) => a.art === "steckdose");
  for (const s of sd) sage(s.hoehe === ap + 240, `${t.id} ${s.bezeichnung} auf ${s.hoehe} (Arbeitshoehe ${ap} + 240)`);
  sage(bewegungsflaeche(t) === t.raum.tiefe - (t.grundform === "zweizeilig" ? 1200 : 600),
       `${t.id} bewegungsflaeche() = ${bewegungsflaeche(t)}`);
}
console.log(fehler === 0 ? "\nAlle abgeleiteten Masse folgen ihrer Regel." : `\n${fehler} Abweichungen.`);
process.exit(fehler === 0 ? 0 : 1);
