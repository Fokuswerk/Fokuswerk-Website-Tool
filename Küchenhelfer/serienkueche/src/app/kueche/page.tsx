"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronDown, RotateCcw, Sparkles } from "lucide-react";
import { modul } from "@/data/module";
import { eur } from "@/lib/berechnung";
import { alleVorschlaege, alsKuechentyp, FORMEN, pruefeAngaben, type Raumform, type Vorschlag } from "@/lib/planer";
import { schrittFolge, useKueche } from "@/store/kueche";
import { Kuechenbild, Raumbild } from "@/components/warm/Kuechenbild";
import { Fortschritt, GrosseWahl, GrosseZahl, Karte, Notiz, Schieber, WKnopf } from "@/components/warm/Kit";
import { melde } from "@/components/ui/kit";

function FormBild({ form }: { form: Raumform }) {
  const wand = (d: string) => (
    <path d={d} strokeWidth={9} strokeLinecap="round" className="stroke-butter" fill="none" />
  );
  return (
    <svg viewBox="0 0 90 58" className="h-[54px] w-full" aria-hidden="true">
      <rect x="5" y="5" width="80" height="48" rx="6" className="fill-creme" />
      {form === "eine-wand" && wand("M12 12 H78")}
      {form === "ecke" && <>{wand("M12 12 H78")}{wand("M12 12 V42")}</>}
      {form === "zwei-waende" && <>{wand("M12 12 H78")}{wand("M12 46 H78")}</>}
      {form === "u-form" && <>{wand("M12 12 H78")}{wand("M12 12 V44")}{wand("M78 12 V44")}</>}
    </svg>
  );
}

function Kopf({ titel, satz }: { titel: string; satz?: string }) {
  return (
    <div className="warm-rein">
      <h1 className="gross text-[30px] font-bold leading-[1.12] text-kohle sm:text-[38px]">{titel}</h1>
      {satz && <p className="mt-3 max-w-[48ch] text-[16px] leading-relaxed text-kohle-2">{satz}</p>}
    </div>
  );
}

function VorschlagKarte({
  v, typ, aktiv, empfohlen, waehlen,
}: {
  v: Vorschlag;
  typ: ReturnType<typeof alsKuechentyp>;
  aktiv: boolean;
  empfohlen: boolean;
  waehlen: () => void;
}) {
  return (
    <Karte className={`overflow-hidden ${aktiv ? "ring-2 ring-kohle" : "shadow-[0_2px_12px_rgba(23,22,15,0.05)]"}`}>
      <div className="bg-creme-2/60 px-4 pt-4">
        <Kuechenbild typ={typ} variante={v.variante} hoehe={150} mitNamen={false} />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="gross text-[20px] font-bold text-kohle">{v.titel}</span>
              {empfohlen && (
                <span className="rounded-full bg-salbei-soft px-2.5 py-[3px] text-[11.5px] font-semibold text-salbei">
                  Unser Tipp
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[14px] text-kohle-2">
              {v.arbeitsflaeche > 0
                ? `${Math.round(v.arbeitsflaeche / 10)} cm Platz zum Arbeiten`
                : "Spüle und Herd nebeneinander"}
            </div>
          </div>
          <div className="gross shrink-0 text-right text-[23px] font-bold leading-none text-kohle">{eur(v.preis)}</div>
        </div>

        <ul className="mt-4 space-y-2 border-t border-linie-warm pt-4 text-[14px] leading-snug">
          {v.gutPunkte.slice(0, 2).map((g) => (
            <li key={g} className="flex gap-2.5 text-kohle-2">
              <Check size={15} strokeWidth={2.4} className="mt-[3px] shrink-0 text-salbei" />
              <span>{g}</span>
            </li>
          ))}
          {v.achtungPunkte.slice(0, 1).map((a) => (
            <li key={a} className="flex gap-2.5 text-kohle-3">
              <span className="mt-[1px] shrink-0 font-bold text-butter">!</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <WKnopf art={aktiv ? "still" : "primaer"} onClick={waehlen}>
            {aktiv ? <><Check size={15} strokeWidth={2.4} />Ausgewählt</> : "Die nehme ich"}
          </WKnopf>
        </div>
      </div>
    </Karte>
  );
}

export default function Kuechenplaner() {
  const { raum, schritt, gewaehlt, setzeRaum, setzeWunsch, geheZu, weiter, zurueck, waehle, neu } = useKueche();
  const [details, setDetails] = useState(false);

  const folge = schrittFolge(raum);
  const pos = Math.max(0, folge.indexOf(schritt));
  const typ = useMemo(() => alsKuechentyp(raum), [raum]);
  const brauchtVorschlaege = schritt === "vorschlaege" || schritt === "ergebnis" || schritt === "start";
  const vorschlaege = useMemo(() => (brauchtVorschlaege ? alleVorschlaege(raum) : []), [raum, brauchtVorschlaege]);
  const moegliche = vorschlaege.filter((v) => v.moeglich);
  const empfehlung = [...moegliche].sort(
    (a, b) => b.arbeitsflaeche - a.arbeitsflaeche || a.wegZumWasser - b.wegZumWasser || a.preis - b.preis,
  )[0];
  const gewaehlterVorschlag = moegliche.find((v) => v.strategie === gewaehlt) ?? empfehlung;
  const hinweise = pruefeAngaben(raum);

  const istStart = schritt === "start";
  const istErgebnis = schritt === "ergebnis";
  const istVorschlaege = schritt === "vorschlaege";
  const breit = istErgebnis || istVorschlaege;

  return (
    <div className="warm min-h-full">
      <header className="sticky top-0 z-20 bg-creme/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center gap-4 px-5 pb-3 pt-4 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 17 17" aria-hidden="true">
              <rect x="0.75" y="0.75" width="15.5" height="15.5" rx="3" fill="none" strokeWidth="1.4" className="stroke-kohle" />
              <path d="M0.75 5.6 H16.25" strokeWidth="1.4" className="stroke-butter" />
            </svg>
            <span className="gross text-[15px] font-bold text-kohle">Serienküche</span>
          </Link>
          <div className="min-w-0 flex-1">
            <Fortschritt wert={(pos + 1) / folge.length} />
          </div>
          <button
            onClick={neu}
            className="flex shrink-0 items-center gap-1.5 text-[13px] text-kohle-3 transition-colors hover:text-kohle-2"
          >
            <RotateCcw size={13} strokeWidth={2} />
            <span className="hidden sm:inline">Von vorne</span>
          </button>
        </div>
      </header>

      <main className={`mx-auto px-5 pb-20 pt-6 sm:px-8 ${breit ? "max-w-[1080px]" : "max-w-[720px]"}`}>
        {istStart && (
          <div className="warm-rein pt-4 text-center sm:pt-10">
            {moegliche[0] && (
              <div className="mx-auto mb-8 w-full max-w-[400px]">
                <Karte className="px-5 py-5 shadow-[0_10px_34px_rgba(23,22,15,0.07)]">
                  <Kuechenbild typ={typ} variante={moegliche[moegliche.length - 1].variante} hoehe={150} mitNamen={false} />
                </Karte>
              </div>
            )}
            <h1 className="gross text-[34px] font-bold leading-[1.1] text-kohle sm:text-[44px]">
              Lass uns deine Küche planen.
            </h1>
            <p className="mx-auto mt-4 max-w-[44ch] text-[17px] leading-relaxed text-kohle-2">
              Ein paar Fragen zu deinem Raum, mehr braucht es nicht. Du musst nichts über Küchen
              wissen — die Maße, die Abstände und was neben was darf, übernehmen wir.
            </p>
            <div className="mt-8">
              <WKnopf art="primaer" gross onClick={weiter}>
                Los geht&rsquo;s
                <ArrowRight size={18} strokeWidth={2.2} />
              </WKnopf>
            </div>
            <p className="mt-5 text-[13.5px] text-kohle-3">Dauert etwa drei Minuten.</p>
          </div>
        )}

        {schritt === "form" && (
          <>
            <Kopf
              titel="An wie vielen Wänden soll die Küche stehen?"
              satz="Schau dich im Raum um. Wenn du unsicher bist, nimm die erste — ändern kannst du das jederzeit."
            />
            <div className="mt-7">
              <GrosseWahl<Raumform>
                wert={raum.form}
                setze={(f) => setzeRaum({ form: f })}
                spalten={2}
                optionen={FORMEN.map((f) => ({ id: f.id, titel: f.titel, satz: f.erklaerung, bild: <FormBild form={f.id} /> }))}
              />
            </div>
          </>
        )}

        {schritt === "wandA" && (
          <>
            <Kopf titel="Wie lang ist die Wand?" satz="Die Wand, an der die Küche vor allem stehen soll. Von einer Ecke zur anderen." />
            <Karte className="mt-7 px-5 py-7">
              <GrosseZahl wert={raum.wandA} setze={(mm) => setzeRaum({ wandA: mm })} min={120} max={800} />
            </Karte>
          </>
        )}

        {schritt === "wandB" && (
          <>
            <Kopf
              titel={raum.form === "zwei-waende" ? "Und die Wand gegenüber?" : "Und die zweite Wand?"}
              satz={raum.form === "u-form" ? "Die beiden kurzen Wände nehmen wir gleich lang an." : "Auch von Ecke zu Ecke."}
            />
            <Karte className="mt-7 px-5 py-7">
              <GrosseZahl wert={raum.wandB} setze={(mm) => setzeRaum({ wandB: mm })} min={60} max={800} />
            </Karte>
          </>
        )}

        {schritt === "tiefe" && (
          <>
            <Kopf titel="Wie tief ist der Raum?" satz="Von der Küchenwand bis zur Wand gegenüber. Daran hängt, wie viel Platz zum Stehen bleibt." />
            <Karte className="mt-7 px-5 py-7">
              <GrosseZahl wert={raum.tiefe} setze={(mm) => setzeRaum({ tiefe: mm })} min={150} max={900} />
            </Karte>
            {hinweise.length > 0 && (
              <div className="mt-5 space-y-2">
                {hinweise.map((h) => <Notiz key={h} ton="achtung">{h}</Notiz>)}
              </div>
            )}
          </>
        )}

        {schritt === "fensterJa" && (
          <>
            <Kopf titel="Ist in der Küchenwand ein Fenster?" satz="Über einem Fenster können keine Hängeschränke hängen — deshalb fragen wir." />
            <div className="mt-7">
              <GrosseWahl<"ja" | "nein">
                wert={raum.fenster ? "ja" : "nein"}
                setze={(v) =>
                  setzeRaum({
                    fenster: v === "ja" ? { wand: "A", von: Math.max(0, Math.round(raum.wandA / 2 - 600)), breite: 1200 } : null,
                  })
                }
                optionen={[
                  { id: "ja", titel: "Ja, da ist ein Fenster", satz: "Wir lassen die Schränke darüber weg." },
                  { id: "nein", titel: "Nein, die Wand ist zu", satz: "Dann passen Hängeschränke über die ganze Länge." },
                ]}
              />
            </div>
          </>
        )}

        {schritt === "fensterWo" && raum.fenster && (
          <>
            <Kopf titel="Wo sitzt das Fenster?" satz="Schieb es ungefähr dorthin, wo es in echt ist." />
            <Karte className="mt-7 px-5 py-6">
              <Schieber
                wert={raum.fenster.von}
                max={Math.max(0, raum.wandA - raum.fenster.breite)}
                setze={(mm) => setzeRaum({ fenster: { ...raum.fenster!, von: mm } })}
                links="ganz links"
                rechts="ganz rechts"
              />
              <div className="mt-7 border-t border-linie-warm pt-6">
                <div className="mb-3 text-center text-[15px] font-semibold text-kohle">Wie breit ist es?</div>
                <GrosseZahl
                  wert={raum.fenster.breite}
                  setze={(mm) => setzeRaum({ fenster: { ...raum.fenster!, breite: mm } })}
                  min={40}
                  max={300}
                />
              </div>
            </Karte>
          </>
        )}

        {schritt === "tuer" && (
          <>
            <Kopf titel="Wo ist die Tür?" satz="Eine Tür darf nicht gegen einen Schrank schlagen. Meistens ist sie in der Wand gegenüber." />
            <div className="mt-7">
              <GrosseWahl<"gegenueber" | "A" | "B">
                wert={raum.tuer?.wand ?? "gegenueber"}
                setze={(w) => setzeRaum({ tuer: { wand: w, von: raum.tuer?.von ?? 1500, breite: 885 } })}
                spalten={3}
                optionen={[
                  { id: "gegenueber", titel: "Gegenüber", satz: "Hinter dir, wenn du an der Küche stehst" },
                  { id: "A", titel: "In der Küchenwand", satz: "Nimmt Platz von der Zeile weg" },
                  { id: "B", titel: "In der Seitenwand" },
                ]}
              />
              {raum.tuer && (
                <Karte className="mt-4 px-5 py-5">
                  <Schieber
                    wert={raum.tuer.von}
                    max={Math.max(0, (raum.tuer.wand === "B" ? raum.wandB : raum.wandA) - raum.tuer.breite)}
                    setze={(mm) => setzeRaum({ tuer: { ...raum.tuer!, von: mm } })}
                    links="links"
                    rechts="rechts"
                  />
                </Karte>
              )}
            </div>
          </>
        )}

        {schritt === "wasser" && (
          <>
            <Kopf
              titel="Wo kommt das Wasser aus der Wand?"
              satz="Schau unter die alte Spüle oder in die Ecke mit den Leitungen. Die Spüle bleibt am besten dort — sonst muss ein Installateur neu verlegen."
            />
            <Karte className="mt-7 px-5 py-6">
              <Schieber
                wert={raum.anschlussVon}
                max={raum.anschlussWand === "B" ? raum.wandB : raum.wandA}
                setze={(mm) => setzeRaum({ anschlussVon: mm })}
                links="linke Ecke"
                rechts="rechte Ecke"
              />
            </Karte>
            <div className="mt-4">
              <Notiz>Noch gar nichts da, weil alles neu gebaut wird? Dann schieb den Punkt dorthin, wo die Spüle stehen soll.</Notiz>
            </div>
          </>
        )}

        {schritt === "spuelmaschine" && (
          <>
            <Kopf titel="Soll eine Spülmaschine rein?" satz="Sie braucht 60 cm neben der Spüle. Später nachrüsten geht nur, wenn dafür ein Schrank weicht." />
            <div className="mt-7">
              <GrosseWahl<"ja" | "nein">
                wert={raum.wuensche.geschirrspueler ? "ja" : "nein"}
                setze={(v) => setzeWunsch({ geschirrspueler: v === "ja" })}
                optionen={[
                  { id: "ja", titel: "Ja, unbedingt", satz: "60 cm werden dafür reserviert." },
                  { id: "nein", titel: "Nein, brauche ich nicht", satz: "Dafür 60 cm mehr Stauraum." },
                ]}
              />
            </div>
          </>
        )}

        {schritt === "kuehl" && (
          <>
            <Kopf
              titel="Wie groß soll der Kühlschrank sein?"
              satz="Ein hoher Kühlschrank nimmt 60 cm Wand über die ganze Höhe. Dort gibt es dann keine Arbeitsfläche und keinen Hängeschrank."
            />
            <div className="mt-7">
              <GrosseWahl<"gross" | "klein">
                wert={raum.wuensche.grosserKuehlschrank ? "gross" : "klein"}
                setze={(v) => setzeWunsch({ grosserKuehlschrank: v === "gross" })}
                optionen={[
                  { id: "gross", titel: "Groß und hoch", satz: "Viel Platz innen, man muss sich nicht bücken." },
                  { id: "klein", titel: "Klein, unter der Platte", satz: "Die Arbeitsfläche läuft durch." },
                ]}
              />
            </div>
          </>
        )}

        {schritt === "ofen" && (
          <>
            <Kopf titel="Wo soll der Backofen hin?" satz="Auf Griffhöhe musst du dich nicht bücken — das kostet aber nochmal 60 cm Wand." />
            <div className="mt-7">
              <GrosseWahl<"hoch" | "unten">
                wert={raum.wuensche.backofenHoch ? "hoch" : "unten"}
                setze={(v) => setzeWunsch({ backofenHoch: v === "hoch" })}
                optionen={[
                  { id: "unten", titel: "Unter dem Herd", satz: "Der übliche Weg, spart Platz." },
                  { id: "hoch", titel: "Auf Griffhöhe", satz: "Rückenschonend, braucht 60 cm extra." },
                ]}
              />
            </div>
          </>
        )}

        {schritt === "niveau" && (
          <>
            <Kopf titel="Wie soll sie ausgestattet sein?" satz="Das entscheidet vor allem über Fronten, Auszüge und Geräte." />
            <div className="mt-7">
              <GrosseWahl<"einfach" | "mittel" | "gehoben">
                wert={raum.wuensche.niveau}
                setze={(n) => setzeWunsch({ niveau: n })}
                spalten={3}
                optionen={[
                  { id: "einfach", titel: "Einfach", satz: "Solide Fronten, Standardgeräte" },
                  { id: "mittel", titel: "Mittel", satz: "Gedämpfte Auszüge, bessere Geräte" },
                  { id: "gehoben", titel: "Gehoben", satz: "Hochwertige Fronten und Technik" },
                ]}
              />
            </div>
          </>
        )}

        {istVorschlaege && (
          <>
            <div className="text-center">
              <h1 className="gross text-[30px] font-bold leading-[1.12] text-kohle sm:text-[38px]">
                Das passt in deinen Raum.
              </h1>
              <p className="mx-auto mt-3 max-w-[50ch] text-[16px] leading-relaxed text-kohle-2">
                Drei Möglichkeiten, alle auf den Zentimeter ausgerechnet. Such dir eine aus.
              </p>
            </div>
            {moegliche.length === 0 ? (
              <div className="mx-auto mt-8 max-w-[560px]">
                <Notiz ton="achtung">{vorschlaege[0]?.grund}</Notiz>
                <div className="mt-5 flex justify-center gap-3">
                  <WKnopf onClick={() => geheZu("spuelmaschine")}>Wünsche ändern</WKnopf>
                  <WKnopf onClick={() => geheZu("wandA")}>Maße ändern</WKnopf>
                </div>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {moegliche.map((v) => (
                  <VorschlagKarte
                    key={v.strategie}
                    v={v}
                    typ={typ}
                    aktiv={gewaehlt === v.strategie}
                    empfohlen={empfehlung?.strategie === v.strategie}
                    waehlen={() => { waehle(v.strategie); weiter(); }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {istErgebnis && gewaehlterVorschlag && (
          <div className="warm-rein">
            <div className="text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-salbei-soft px-3.5 py-1.5 text-[13px] font-semibold text-salbei">
                <Sparkles size={14} strokeWidth={2.2} />
                Fertig
              </div>
              <h1 className="gross text-[32px] font-bold leading-[1.1] text-kohle sm:text-[40px]">Das ist deine Küche.</h1>
            </div>

            <Karte className="mt-7 overflow-hidden shadow-[0_10px_40px_rgba(23,22,15,0.07)]">
              <div className="bg-creme-2/50 px-4 pt-6 sm:px-8">
                <Kuechenbild typ={typ} variante={gewaehlterVorschlag.variante} hoehe={290} />
              </div>
              <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
                <div>
                  <div className="text-[13px] font-semibold uppercase tracking-[0.07em] text-kohle-3">
                    Komplett, mit Geräten und Montage
                  </div>
                  <div className="gross mt-1 text-[42px] font-bold leading-none text-kohle">{eur(gewaehlterVorschlag.preis)}</div>
                  <div className="mt-1.5 text-[14px] text-kohle-3">
                    {gewaehlterVorschlag.titel} · {Math.round(raum.wandA / 10)} cm Wand
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <WKnopf art="primaer" gross onClick={() => melde("Demo: Hier würde die Anfrage rausgehen.")}>
                    Angebot anfordern
                  </WKnopf>
                  <WKnopf gross onClick={() => window.print()}>Speichern</WKnopf>
                </div>
              </div>
            </Karte>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                ["Schränke", String(Object.values(gewaehlterVorschlag.belegung).flat().filter((m) => modul(m).kategorie !== "blende").length)],
                ["Hängeschränke", String(gewaehlterVorschlag.haengeschraenke)],
                ["Platz zum Arbeiten", `${Math.round(gewaehlterVorschlag.arbeitsflaeche / 10)} cm`],
              ].map(([a, b]) => (
                <Karte key={a} className="px-5 py-4">
                  <div className="text-[13.5px] text-kohle-3">{a}</div>
                  <div className="gross mt-1 text-[26px] font-bold leading-none text-kohle">{b}</div>
                </Karte>
              ))}
            </div>

            <div className="mt-5">
              <Karte className="px-5 py-5 sm:px-7">
                <button onClick={() => setDetails(!details)} className="flex w-full items-center justify-between gap-3 text-left">
                  <span className="gross text-[17px] font-bold text-kohle">Was alles drin ist</span>
                  <ChevronDown size={18} strokeWidth={2.2} className={`shrink-0 text-kohle-3 transition-transform ${details ? "rotate-180" : ""}`} />
                </button>
                {details && (
                  <ul className="warm-rein mt-4 space-y-2.5 border-t border-linie-warm pt-4">
                    {Object.values(gewaehlterVorschlag.belegung).flat().map((id, i) => {
                      const m = modul(id);
                      return (
                        <li key={`${id}-${i}`} className="flex items-baseline justify-between gap-4 text-[14.5px]">
                          <span className="text-kohle-2">{m.bezeichnung}</span>
                          <span className="shrink-0 text-kohle-3">{m.breite} mm</span>
                        </li>
                      );
                    })}
                    <li className="flex items-baseline justify-between gap-4 border-t border-linie-warm pt-2.5 text-[14.5px]">
                      <span className="text-kohle-2">Hängeschränke</span>
                      <span className="shrink-0 text-kohle-3">{gewaehlterVorschlag.haengeschraenke} Stück</span>
                    </li>
                    <li className="flex items-baseline justify-between gap-4 text-[14.5px]">
                      <span className="text-kohle-2">Arbeitsplatte, Spüle, Geräte, Montage</span>
                      <span className="shrink-0 text-kohle-3">enthalten</span>
                    </li>
                  </ul>
                )}
              </Karte>
            </div>

            <div className="mt-5">
              <Notiz>
                <strong className="font-semibold text-kohle">Bevor wirklich bestellt wird,</strong> misst jemand bei
                dir nach. Wände sind nie ganz gerade, und auf den letzten Zentimetern entscheidet sich, ob alle
                Türen schließen. Dein Plan bleibt — die Maße werden nur bestätigt.
              </Notiz>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <WKnopf onClick={() => geheZu("vorschlaege")}>Andere Variante</WKnopf>
              <WKnopf art="klar" onClick={() => geheZu("wandA")}>Maße ändern</WKnopf>
            </div>
          </div>
        )}

        {!istStart && !breit && (
          <div className="mt-8">
            <Karte className="px-4 py-4">
              <Raumbild typ={typ} hoehe={190} />
              <p className="mt-3 border-t border-linie-warm pt-3 text-center text-[13px] text-kohle-3">
                So sieht dein Raum bisher aus — gelb ist die Wand mit der Küche, der Tropfen zeigt den Wasseranschluss.
              </p>
            </Karte>
          </div>
        )}

        {!istStart && (
          <div className="mt-9 flex items-center justify-between gap-4">
            <WKnopf art="klar" onClick={zurueck}>
              <ArrowLeft size={16} strokeWidth={2.2} />
              Zurück
            </WKnopf>
            {!istErgebnis && (
              <WKnopf art="primaer" gross onClick={weiter} aus={istVorschlaege && moegliche.length === 0}>
                {istVorschlaege ? (gewaehlt ? "Weiter" : "Mit dem Tipp weiter") : "Weiter"}
                <ArrowRight size={18} strokeWidth={2.2} />
              </WKnopf>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
