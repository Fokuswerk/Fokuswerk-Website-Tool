import { berechne, bewerte, KRITERIEN, punkteGruppeA, punkteGruppeB, schwaechstesModul, groesstesBedarfsmodul, GRUPPE_A, GRUPPE_B, type Antworten } from "./nba.ts";

let geprueft = 0;
let fehler = 0;

function gleich(was: string, ist: unknown, soll: unknown) {
  geprueft++;
  if (JSON.stringify(ist) !== JSON.stringify(soll)) {
    fehler++;
    console.error(`  FEHLER  ${was}\n          ist:  ${JSON.stringify(ist)}\n          soll: ${JSON.stringify(soll)}`);
  } else {
    console.log(`  ok      ${was} = ${JSON.stringify(ist)}`);
  }
}

function alle(wahl: number): Antworten {
  const a: Antworten = {};
  for (const k of KRITERIEN) a[k.id] = Math.min(wahl, k.optionen.length - 1);
  return a;
}

console.log("\n1) Niemand ist beeinträchtigt: keine Punkte, kein Pflegegrad");
{
  const a = alle(0);
  const alt = berechne(a, "2026");
  const neu = berechne(a, "2027");
  gleich("Gesamtpunkte 2026", alt.gesamtpunkte, 0);
  gleich("Pflegegrad 2026", alt.pflegegrad, 0);
  gleich("Pflegegrad 2027", neu.pflegegrad, 0);
}

console.log("\n2) Alles auf der letzten Stufe: 100 Punkte, Pflegegrad 5");
{
  const a = alle(3);
  const alt = berechne(a, "2026");
  const neu = berechne(a, "2027");
  gleich("Einzelpunkte Modul 1", alt.module[0].einzelpunkte, 15);
  gleich("Einzelpunkte Modul 2", alt.module[1].einzelpunkte, 33);
  gleich("Einzelpunkte Modul 3", alt.module[2].einzelpunkte, 65);
  gleich("Einzelpunkte Modul 4", alt.module[3].einzelpunkte, 51);
  // Modul 5 auf Stufe 3: je Kriterium einmal taeglich bzw. mehrmals woechentlich.
  // Gruppe A 7 Massnahmen/Tag -> 2, Gruppe B 1,71/Tag -> 2, 5.12-5.15 -> 6, 5.16 -> 3
  gleich("Einzelpunkte Modul 5", alt.module[4].einzelpunkte, 13);
  gleich("Einzelpunkte Modul 6", alt.module[5].einzelpunkte, 18);
  gleich("Gesamtpunkte 2026", alt.gesamtpunkte, 100);
  gleich("Gesamtpunkte 2027", neu.gesamtpunkte, 100);
  gleich("Pflegegrad 2026", alt.pflegegrad, 5);
  gleich("Pflegegrad 2027", neu.pflegegrad, 5);
  gleich("keine naechste Stufe", alt.bisNaechsteStufe, null);
}

console.log("\n3) Modul 4 mit genau 8 Einzelpunkten: die Reform kostet eine ganze Stufe");
{
  // 4.1 bis 4.6 je ueberwiegend selbstaendig (1 Punkt) = 6, 4.9 Trinken ueberwiegend selbstaendig = 2
  const a: Antworten = { "4.1":1, "4.2":1, "4.3":1, "4.4":1, "4.5":1, "4.6":1, "4.9":1 };
  const alt = berechne(a, "2026");
  const neu = berechne(a, "2027");
  gleich("Einzelpunkte Modul 4", alt.module[3].einzelpunkte, 8);
  gleich("Schweregrad Modul 4 nach altem Recht", alt.module[3].schweregrad, 2);
  gleich("Schweregrad Modul 4 nach neuem Recht", neu.module[3].schweregrad, 1);
  gleich("gewichtete Punkte alt", alt.module[3].gewichtetePunkte, 20);
  gleich("gewichtete Punkte neu", neu.module[3].gewichtetePunkte, 10);
  gleich("Pflegegrad 2026", alt.pflegegrad, 1);
  gleich("Pflegegrad 2027", neu.pflegegrad, 0);
}

console.log("\n4) Gleicher Mensch, 28,75 Punkte: 2026 Pflegegrad 2, 2027 Pflegegrad 1");
{
  const a: Antworten = {
    // Modul 1: 4 Einzelpunkte, in beiden Faellen Schweregrad 2
    "1.1":1, "1.2":1, "1.3":1, "1.4":1,
    // Modul 2: 3 Einzelpunkte, Schweregrad 1
    "2.2":1, "2.3":1, "2.5":1,
    // Modul 4: 13 Einzelpunkte, in beiden Faellen Schweregrad 2
    "4.1":1, "4.2":1, "4.3":1, "4.4":2, "4.5":1, "4.6":2, "4.7":1, "4.9":1, "4.10":1,
  };
  const alt = berechne(a, "2026");
  const neu = berechne(a, "2027");
  gleich("Einzelpunkte Modul 1", alt.module[0].einzelpunkte, 4);
  gleich("Einzelpunkte Modul 2", alt.module[1].einzelpunkte, 3);
  // 4.1-4.3 je 1, 4.4 = 2, 4.5 = 1, 4.6 = 2, 4.7 = 1, dazu 4.9 und 4.10 doppelt gewichtet je 2
  gleich("Einzelpunkte Modul 4", alt.module[3].einzelpunkte, 13);
  gleich("Gesamtpunkte beide Rechtsstaende", [alt.gesamtpunkte, neu.gesamtpunkte], [28.75, 28.75]);
  gleich("Pflegegrad 2026", alt.pflegegrad, 2);
  gleich("Pflegegrad 2027", neu.pflegegrad, 1);
  gleich("fehlende Punkte zu Pflegegrad 2 im neuen Recht", neu.bisNaechsteStufe, 1.25);
}

console.log("\n5) Modul 1 mit 6 Punkten und Modul 6 mit 1 Punkt: verschobene Grenzen");
{
  const a: Antworten = { "1.1":2, "1.2":2, "1.3":2, "6.3":1 };
  const alt = berechne(a, "2026");
  const neu = berechne(a, "2027");
  gleich("Modul 1 Einzelpunkte", alt.module[0].einzelpunkte, 6);
  gleich("Modul 1 gewichtet alt", alt.module[0].gewichtetePunkte, 7.5);
  gleich("Modul 1 gewichtet neu", neu.module[0].gewichtetePunkte, 5);
  gleich("Modul 6 Einzelpunkte", alt.module[5].einzelpunkte, 1);
  gleich("Modul 6 gewichtet alt", alt.module[5].gewichtetePunkte, 3.75);
  gleich("Modul 6 gewichtet neu", neu.module[5].gewichtetePunkte, 0);
}

console.log("\n6) Modul 3 schlaegt Modul 2: nur der hoehere Wert zaehlt, und nur einmal");
{
  // Modul 2: 2 Einzelpunkte (Schweregrad 1), Modul 3: 7 Einzelpunkte (Schweregrad 4)
  const a: Antworten = { "2.2":1, "2.3":1, "3.1":3, "3.2":1, "3.8":1 };
  const e = berechne(a, "2026");
  gleich("Modul 2 Einzelpunkte", e.module[1].einzelpunkte, 2);
  gleich("Modul 3 Einzelpunkte", e.module[2].einzelpunkte, 7);
  gleich("Modul 2 gewichtet", e.module[1].gewichtetePunkte, 0);
  gleich("Modul 3 gewichtet", e.module[2].gewichtetePunkte, 15);
  gleich("Gesamtpunkte", e.gesamtpunkte, 15);
  gleich("Pflegegrad 2026", e.pflegegrad, 1);
}

console.log("\n7) Inkontinenz-Tor: 4.11 und 4.12 zaehlen nur mit Feststellung");
{
  const ohne: Antworten = { "4.11":3, "4.12":3 };
  const mit: Antworten = { "4.inko":1, "4.11":3, "4.12":3 };
  gleich("ohne Feststellung", berechne(ohne, "2026").module[3].einzelpunkte, 0);
  gleich("mit Feststellung", berechne(mit, "2026").module[3].einzelpunkte, 6);
}

console.log("\n8) Sondenernaehrung: teilweise zaehlt hoeher als vollstaendig (so steht es im Gesetz)");
{
  gleich("teilweise", berechne({ "4.13":1 }, "2026").module[3].einzelpunkte, 6);
  gleich("vollstaendig", berechne({ "4.13":2 }, "2026").module[3].einzelpunkte, 3);
}

console.log("\n9) Modul 5: Haeufigkeiten werden erst addiert, dann uebersetzt");
{
  // nur woechentliche Arztbesuche: 4,3 -> 1 Einzelpunkt
  gleich("woechentlich Arzt", berechne({ "5.13":2 }, "2026").module[4].einzelpunkte, 1);
  // monatlich Arzt (1,0) liegt unter 4,3 -> 0 Einzelpunkte
  gleich("monatlich Arzt", berechne({ "5.13":1 }, "2026").module[4].einzelpunkte, 0);
  // taegliche technikintensive Massnahme: 60 -> 6 Einzelpunkte
  gleich("taeglich technikintensiv", berechne({ "5.12":3 }, "2026").module[4].einzelpunkte, 6);
  // Medikamente dreimal taeglich: 1 Einzelpunkt, Schweregrad 1, 5 gewichtete Punkte
  // 5.1 einmal pro Woche: 1/7 Massnahme pro Tag, das bleibt unter einmal taeglich
  gleich("Medikation woechentlich", berechne({ "5.1":1 }, "2026").module[4].einzelpunkte, 0);
  // 5.1 dreimal taeglich: 3 Massnahmen -> genau noch 1 Einzelpunkt
  gleich("Medikation dreimal taeglich", berechne({ "5.1":5 }, "2026").module[4].einzelpunkte, 1);
  const m = berechne({ "5.1":5 }, "2026");
  gleich("Medikation gewichtet", m.module[4].gewichtetePunkte, 5);
}

console.log("\n9b) Modul 5: die Gruppen bilden EINEN Wert, nicht einen je Kriterium");
{
  // Anlage 1: Summe der Massnahmen ueber 5.1 bis 5.7, dann erst Einzelpunkte.
  gleich("Gruppe A unter einmal taeglich", punkteGruppeA(0.99), 0);
  gleich("Gruppe A einmal taeglich", punkteGruppeA(1), 1);
  gleich("Gruppe A dreimal taeglich", punkteGruppeA(3), 1);
  gleich("Gruppe A knapp darueber", punkteGruppeA(3.01), 2);
  gleich("Gruppe A achtmal taeglich", punkteGruppeA(8), 2);
  gleich("Gruppe A mehr als achtmal", punkteGruppeA(8.01), 3);
  gleich("Gruppe B unter einmal woechentlich", punkteGruppeB(0.14), 0);
  gleich("Gruppe B einmal woechentlich", punkteGruppeB(1 / 7), 1);
  gleich("Gruppe B einmal taeglich", punkteGruppeB(1), 2);
  gleich("Gruppe B dreimal taeglich", punkteGruppeB(3), 3);

  // Sieben Kriterien einzeln auf "einmal taeglich": 7 Massnahmen, nicht 7 Punkte
  const sieben: Antworten = {};
  for (const id of GRUPPE_A) sieben[id] = 3;
  gleich("sieben mal einmal taeglich", berechne(sieben, "2026").module[4].einzelpunkte, 2);

  // Alles in Modul 5 auf das Hoechste: 3 + 3 + 6 + 3 = 15, mehr gibt das Gesetz nicht her
  const hoch: Antworten = {};
  for (const id of GRUPPE_A) hoch[id] = 6;
  for (const id of GRUPPE_B) hoch[id] = 5;
  hoch["5.12"] = 3; hoch["5.13"] = 3; hoch["5.14"] = 3; hoch["5.15"] = 3; hoch["5.16"] = 3;
  gleich("Modul 5 gesetzliches Maximum", berechne(hoch, "2026").module[4].einzelpunkte, 15);
  gleich("Modul 5 gewichtet maximal", berechne(hoch, "2026").module[4].gewichtetePunkte, 20);
}

console.log("\n10) Schwellenwerte exakt an der Kante");
{
  // Modul 4 Schweregrad 3 = 30 Punkte, Modul 1 Schweregrad 4 = 10 -> 40 Punkte
  const a: Antworten = {
    "1.1":3, "1.2":3, "1.3":3, "1.4":3, "1.5":3,
    "4.1":2, "4.2":2, "4.3":2, "4.4":2, "4.5":2, "4.6":2, "4.7":2, "4.8":1, "4.9":1,
  };
  const alt = berechne(a, "2026");
  gleich("Modul 4 Einzelpunkte", alt.module[3].einzelpunkte, 19);
  gleich("Modul 4 Schweregrad alt (19 ist genau die Kante)", alt.module[3].schweregrad, 3);
  gleich("Modul 4 Schweregrad neu (19 liegt unter 25)", berechne(a, "2027").module[3].schweregrad, 2);
  gleich("Gesamt alt", alt.gesamtpunkte, 40);
  gleich("Gesamt neu", berechne(a, "2027").gesamtpunkte, 30);
  gleich("Pflegegrad alt", alt.pflegegrad, 2);
  gleich("Pflegegrad neu", berechne(a, "2027").pflegegrad, 2);
}


console.log("\n11) Hebel und Bedarf sind nicht dasselbe");
{
  // Alles am Maximum: es gibt keine Luecke mehr, auch nicht in der Gruppe 2/3
  const voll = bewerte({ 1: 15, 2: 0, 3: 20, 4: 54, 5: 15, 6: 18 }, "2026");
  gleich("volle Punktzahl", voll.gesamtpunkte, 100);
  gleich("Bedarf liegt nicht bei Modul 2", schwaechstesModul(voll) !== 2, true);

  // Modul 4 am Anschlag, sonst nichts: die groesste Luecke hat Modul 5 (20 Punkte),
  // der groesste Bedarf liegt bei Modul 4. Genau diese beiden duerfen nicht
  // verwechselt werden - sonst bekommt jemand ohne Mobilitaetsproblem einen
  // Treppenlift angeboten.
  const e = bewerte({ 1: 0, 2: 0, 3: 0, 4: 54, 5: 0, 6: 0 }, "2026");
  gleich("Hebel ist das Modul mit der groessten Luecke", schwaechstesModul(e), 5);
  gleich("Bedarf ist das staerkste Modul", groesstesBedarfsmodul(e), 4);

  // Umgekehrt: nur Mobilitaet eingeschraenkt -> Bedarf bei Modul 1
  const m = bewerte({ 1: 15, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, "2026");
  gleich("Bedarf bei Mobilitaet", groesstesBedarfsmodul(m), 1);
}

console.log(`\n${fehler === 0 ? "ALLES GRUEN" : "NICHT GRUEN"}: ${geprueft - fehler} von ${geprueft} Pruefungen bestanden.\n`);
if (fehler > 0) process.exit(1);
