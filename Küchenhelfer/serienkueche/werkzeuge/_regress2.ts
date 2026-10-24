import { STANDARD_RAUM, planeKueche, alsKuechentyp, platteLaenge } from "@/lib/planer";
import { baueUnterlagen } from "@/lib/unterlagen";

for (const ks of ["ks-bosch-kur21", "ks-siemens-ki81"]) {
  const raum = { ...STANDARD_RAUM, geraete: { ...STANDARD_RAUM.geraete, kuehlschrank: ks } };
  const typ = alsKuechentyp(raum);
  const v = planeKueche(raum, "arbeiten");
  const u = baueUnterlagen(raum, typ, v);
  const ap = u.liste.find((z) => z.artikel === "AP-SL-600-M");
  const zuschnitt = u.zuschnitt.platten.map((p) => p.laenge);
  console.log(ks, "| Stueckliste AP lfm:", ap?.menge, "| Zuschnitt Stuecke mm:", zuschnitt,
    "| Summe Zuschnitt:", zuschnitt.reduce((s, x) => s + x, 0), "| platteLaenge:", platteLaenge(typ, v.belegung));
}
