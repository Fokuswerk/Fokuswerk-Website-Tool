"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileUp, PencilLine, RotateCcw, ScanLine } from "lucide-react";
import { modul } from "@/data/module";
import { ARTEN, geraet, geraeteFuer, type GeraeteArt } from "@/data/geraete";
import { eur } from "@/lib/berechnung";
import {
  alleVorschlaege, alsKuechentyp, FORMEN, kuechenwaende, pruefeAngaben,
  wandlaenge, WANDNAME, type Raumform, type Vorschlag, type WandId,
} from "@/lib/planer";
import { schrittFolge, useKueche } from "@/store/kueche";
import { Kuechenbild, Raumbild } from "@/components/warm/Kuechenbild";
import { Fortschritt, GrosseWahl, GrosseZahl, Karte, Notiz, Schieber, WKnopf } from "@/components/warm/Kit";
import { melde } from "@/components/ui/kit";

const ALLE_WAENDE: WandId[] = ["haupt", "links", "rechts", "gegenueber"];

function FormBild({ form }: { form: Raumform }) {
  const w = (d: string) => <path d={d} strokeWidth={9} strokeLinecap="round" className="stroke-butter" fill="none" />;
  return (
    <svg viewBox="0 0 90 58" className="h-[54px] w-full" aria-hidden="true">
      <rect x="5" y="5" width="80" height="48" rx="6" className="fill-creme" />
      {form === "eine-wand" && w("M12 12 H78")}
      {form === "ecke" && <>{w("M12 12 H78")}{w("M12 12 V42")}</>}
      {form === "zwei-waende" && <>{w("M12 12 H78")}{w("M12 46 H78")}</>}
      {form === "u-form" && <>{w("M12 12 H78")}{w("M12 12 V44")}{w("M78 12 V44")}</>}
    </svg>
  );
}

function Kopf({ titel, satz }: { titel: string; satz?: string }) {
  return (
    <div className="warm-rein">
      <h1 className="gross text-[29px] font-bold leading-[1.12] text-kohle sm:text-[36px]">{titel}</h1>
      {satz && <p className="mt-3 max-w-[50ch] text-[16px] leading-relaxed text-kohle-2">{satz}</p>}
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
  const ersteZeile = typ.zeilen[0]?.id ?? "Z-haupt";
  return (
    <Karte className={`overflow-hidden ${aktiv ? "ring-2 ring-kohle" : "shadow-[0_2px_12px_rgba(23,22,15,0.05)]"}`}>
      <div className="bg-creme-2/60 px-4 pt-4">
        <Kuechenbild typ={typ} variante={v.variante} zeileId={ersteZeile} hoehe={150} mitNamen={false} />
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
              {v.arbeitsflaeche > 0 ? `${Math.round(v.arbeitsflaeche / 10)} cm Arbeitsfläche` : "Spüle und Herd nebeneinander"}
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
  const { raum, quelle, erkannt, schritt, gewaehlt, setzeRaum, setzeGeraet, setzeNutz, setzeQuelle, uebernehmeErkennung, geheZu, weiter, zurueck, waehle, neu } = useKueche();
  const [details, setDetails] = useState(false);
  const [lauf, setLauf] = useState<number | null>(null);
  const feld = useRef<HTMLInputElement>(null);

  const folge = schrittFolge(raum, quelle);
  const pos = Math.max(0, folge.indexOf(schritt));
  const typ = useMemo(() => alsKuechentyp(raum), [raum]);
  const waende = kuechenwaende(raum);
  const brauchtPlan = schritt === "vorschlaege" || schritt === "ergebnis" || schritt === "start";
  const vorschlaege = useMemo(() => (brauchtPlan ? alleVorschlaege(raum) : []), [raum, brauchtPlan]);
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

  const zeileWand = schritt.startsWith("zeile-") ? (schritt.slice(6) as WandId) : null;
  const geraeteArt = schritt.startsWith("geraet-") ? (schritt.slice(7) as GeraeteArt) : null;
  const hervor: WandId | null =
    zeileWand ?? (schritt === "fenster" ? raum.fenster?.wand ?? null
      : schritt === "tuer" ? raum.tuer.wand
      : schritt === "wasser" ? raum.wasser.wand
      : null);

  const wandWahl = (wert: WandId, setze: (w: WandId) => void) => (
    <GrosseWahl<WandId>
      wert={wert}
      setze={setze}
      spalten={2}
      optionen={ALLE_WAENDE.map((w) => ({
        id: w,
        titel: WANDNAME[w].charAt(0).toUpperCase() + WANDNAME[w].slice(1),
        satz: waende.includes(w) ? "Hier steht Küche" : "Hier steht keine Küche",
      }))}
    />
  );

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
          <button onClick={neu} className="flex shrink-0 items-center gap-1.5 text-[13px] text-kohle-3 hover:text-kohle-2">
            <RotateCcw size={13} strokeWidth={2} />
            <span className="hidden sm:inline">Neu</span>
          </button>
        </div>
      </header>

      <main className={`mx-auto px-5 pb-20 pt-6 sm:px-8 ${breit ? "max-w-[1080px]" : "max-w-[720px]"}`}>
        {istStart && (
          <div className="warm-rein pt-4 text-center sm:pt-10">
            {moegliche[0] && (
              <div className="mx-auto mb-8 w-full max-w-[400px]">
                <Karte className="px-5 py-5 shadow-[0_10px_34px_rgba(23,22,15,0.07)]">
                  <Kuechenbild typ={typ} variante={moegliche[moegliche.length - 1].variante} zeileId={typ.zeilen[0].id} hoehe={150} mitNamen={false} />
                </Karte>
              </div>
            )}
            <h1 className="gross text-[33px] font-bold leading-[1.1] text-kohle sm:text-[42px]">
              Fangen wir mit deinem Raum an.
            </h1>
            <p className="mx-auto mt-4 max-w-[46ch] text-[17px] leading-relaxed text-kohle-2">
              Ein paar Fragen zu Wänden, Fenster und Geräten. Daraus rechnen wir eine Küche,
              die wirklich passt — mit jedem Schrank, jedem Maß und einem Preis.
            </p>
            <div className="mt-8">
              <WKnopf art="primaer" gross onClick={weiter}>
                Küche planen
                <ArrowRight size={18} strokeWidth={2.2} />
              </WKnopf>
            </div>
            <p className="mt-5 text-[13.5px] text-kohle-3">Etwa fünf Minuten. Kein Konto, kein Termin.</p>
          </div>
        )}

        {schritt === "quelle" && (
          <>
            <Kopf titel="Wie willst du anfangen?" satz="Beides führt zum selben Ergebnis — der eine Weg ist schneller, der andere braucht keinen Plan." />
            <div className="mt-7">
              <GrosseWahl<"fragen" | "plan">
                wert={quelle}
                setze={(q) => setzeQuelle(q)}
                optionen={[
                  { id: "fragen", titel: "Fragen beantworten", satz: "Zwölf kurze Fragen zu deinem Raum. Du brauchst nur einen Zollstock.", bild: <PencilLine size={26} strokeWidth={1.7} className="text-butter" /> },
                  { id: "plan", titel: "Grundriss hochladen", satz: "Hast du einen Wohnungsgrundriss? Wir lesen die Maße heraus, du prüfst sie nach.", bild: <ScanLine size={26} strokeWidth={1.7} className="text-butter" /> },
                ]}
              />
            </div>
          </>
        )}

        {schritt === "upload" && (
          <>
            <Kopf titel="Lade deinen Grundriss hoch" satz="PDF oder Bild vom Wohnungsgrundriss. Wir lesen Wandlängen, Fenster und Tür heraus — und zeigen dir danach, was wir verstanden haben." />
            <div className="mt-7">
              <Karte className="px-5 py-8 text-center">
                <input
                  ref={feld}
                  type="file"
                  className="sr-only"
                  onChange={() => {
                    setLauf(0);
                    let i = 0;
                    const weiterLauf = () => {
                      i += 1;
                      if (i < 4) { setLauf(i); setTimeout(weiterLauf, 620); }
                      else { setLauf(null); uebernehmeErkennung(); weiter(); }
                    };
                    setTimeout(weiterLauf, 620);
                  }}
                />
                {lauf === null ? (
                  <>
                    <FileUp size={26} strokeWidth={1.6} className="mx-auto text-kohle-3" />
                    <div className="mt-3 text-[15px] text-kohle-2">
                      Datei hierher ziehen oder{" "}
                      <button onClick={() => feld.current?.click()} className="font-semibold text-kohle underline underline-offset-2">
                        auswählen
                      </button>
                    </div>
                    <p className="mx-auto mt-3 max-w-[48ch] text-[13.5px] text-kohle-3">
                      In diesem Prototyp wird keine echte Datei gelesen. Es läuft ein nachgestellter
                      Erkennungslauf mit festen Beispielwerten.
                    </p>
                    <div className="mt-5">
                      <WKnopf onClick={() => feld.current?.click()}>Datei auswählen</WKnopf>
                    </div>
                  </>
                ) : (
                  <div className="mx-auto max-w-[360px] text-left">
                    <div className="h-[5px] w-full overflow-hidden rounded-full bg-creme-2">
                      <div className="h-full rounded-full bg-butter transition-[width] duration-500" style={{ width: `${((lauf + 1) / 4) * 100}%` }} />
                    </div>
                    <ol className="mt-4 space-y-2">
                      {["Plan gelesen", "Wände gefunden", "Fenster und Türen geschätzt", "Maße umgerechnet"].map((t, i) => (
                        <li key={t} className={`flex items-center gap-2.5 text-[14.5px] ${i <= lauf ? "text-kohle-2" : "text-kohle-3"}`}>
                          <span className={`w-4 text-right text-[13px] font-semibold ${i < lauf ? "text-salbei" : i === lauf ? "text-butter" : "text-kohle-3"}`}>
                            {i < lauf ? "\u2713" : i + 1}
                          </span>
                          {t}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </Karte>
            </div>
          </>
        )}

        {schritt === "pruefen" && (
          <>
            <Kopf
              titel="Haben wir das richtig gelesen?"
              satz="Wände kann ein Plan sauber hergeben. Fenster und Türen sind das Schwierigste daran — da schätzen wir, und du korrigierst."
            />
            <div className="mt-6 space-y-3">
              <Karte className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold text-kohle">An wie vielen Wänden soll die Küche stehen?</div>
                    <div className="text-[13px] font-semibold text-butter">sagt der Plan nicht — entscheidest du</div>
                  </div>
                </div>
                <div className="mt-3 border-t border-linie-warm pt-3">
                  <GrosseWahl<Raumform>
                    wert={raum.form}
                    setze={(f) => setzeRaum({ form: f })}
                    optionen={FORMEN.map((f) => ({ id: f.id, titel: f.titel, satz: f.erklaerung }))}
                  />
                  {raum.form === "ecke" && (
                    <div className="mt-3">
                      <GrosseWahl<"links" | "rechts">
                        wert={raum.seite}
                        setze={(x) => setzeRaum({ seite: x })}
                        optionen={[
                          { id: "links", titel: "Nach links" },
                          { id: "rechts", titel: "Nach rechts" },
                        ]}
                      />
                    </div>
                  )}
                </div>
              </Karte>

              <Karte className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold text-kohle">Raumbreite</div>
                    <div className="text-[13px] text-salbei">aus dem Plan gelesen</div>
                  </div>
                  <div className="num text-[18px] font-bold text-kohle">{Math.round(raum.breite / 10)} cm</div>
                </div>
                <div className="mt-3 border-t border-linie-warm pt-3">
                  <GrosseZahl wert={raum.breite} setze={(mm) => setzeRaum({ breite: mm })} min={120} max={900} />
                </div>
              </Karte>

              <Karte className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold text-kohle">Raumtiefe</div>
                    <div className="text-[13px] text-salbei">aus dem Plan gelesen</div>
                  </div>
                  <div className="num text-[18px] font-bold text-kohle">{Math.round(raum.tiefe / 10)} cm</div>
                </div>
                <div className="mt-3 border-t border-linie-warm pt-3">
                  <GrosseZahl wert={raum.tiefe} setze={(mm) => setzeRaum({ tiefe: mm })} min={150} max={900} />
                </div>
              </Karte>

              {raum.fenster && (
                <Karte className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-semibold text-kohle">Fenster an der Hauptwand</div>
                      <div className="text-[13px] font-semibold text-butter">geschätzt — bitte prüfen</div>
                    </div>
                    <div className="num text-[18px] font-bold text-kohle">{Math.round(raum.fenster.breite / 10)} cm breit</div>
                  </div>
                  <div className="mt-3 border-t border-linie-warm pt-3">
                    <Schieber
                      wert={raum.fenster.von}
                      max={Math.max(0, wandlaenge(raum, raum.fenster.wand) - raum.fenster.breite)}
                      setze={(mm) => setzeRaum({ fenster: { ...raum.fenster!, von: mm } })}
                      links="am Anfang"
                      rechts="am Ende"
                    />
                    <div className="mt-4 flex justify-center">
                      <WKnopf onClick={() => setzeRaum({ fenster: null })}>Es gibt gar kein Fenster</WKnopf>
                    </div>
                  </div>
                </Karte>
              )}

              <Karte className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold text-kohle">Tür</div>
                    <div className="text-[13px] font-semibold text-butter">geschätzt — bitte prüfen</div>
                  </div>
                  <div className="num text-[15px] text-kohle-2">{WANDNAME[raum.tuer.wand]}</div>
                </div>
                <div className="mt-3 border-t border-linie-warm pt-3">
                  {wandWahl(raum.tuer.wand, (w) => setzeRaum({ tuer: { ...raum.tuer, wand: w, von: 0 } }))}
                </div>
              </Karte>

              <Karte className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[15px] font-semibold text-kohle">Wasseranschluss</div>
                    <div className="text-[13px] font-semibold text-butter">im Plan nicht eingezeichnet — geraten</div>
                  </div>
                  <div className="num text-[15px] text-kohle-2">{WANDNAME[raum.wasser.wand]}</div>
                </div>
                <div className="mt-3 border-t border-linie-warm pt-3">
                  <Schieber
                    wert={raum.wasser.von}
                    max={wandlaenge(raum, raum.wasser.wand)}
                    setze={(mm) => setzeRaum({ wasser: { ...raum.wasser, von: mm } })}
                    links="am Anfang"
                    rechts="am Ende"
                  />
                </div>
              </Karte>
            </div>
            <div className="mt-5">
              <Notiz>
                Warum du das prüfen musst: Wandlängen stehen als Zahlen im Plan, die lesen wir
                sicher. Fenster und Türen sind gezeichnete Symbole — da liegt selbst gute
                Erkennung regelmäßig daneben. Ein Vorschlag auf falschen Öffnungen sähe richtig
                aus, ohne es zu sein.
              </Notiz>
            </div>
          </>
        )}

        {schritt === "form" && (
          <>
            <Kopf titel="An wie vielen Wänden soll die Küche stehen?" satz="Schau dich im Raum um. Du kannst das später jederzeit ändern." />
            <div className="mt-7">
              <GrosseWahl<Raumform>
                wert={raum.form}
                setze={(f) => setzeRaum({ form: f })}
                optionen={FORMEN.map((f) => ({ id: f.id, titel: f.titel, satz: f.erklaerung, bild: <FormBild form={f.id} /> }))}
              />
            </div>
          </>
        )}

        {schritt === "seite" && (
          <>
            <Kopf titel="Auf welcher Seite geht es um die Ecke?" satz="Stell dich in den Raum und schau auf die Hauptwand." />
            <div className="mt-7">
              <GrosseWahl<"links" | "rechts">
                wert={raum.seite}
                setze={(s) => setzeRaum({ seite: s })}
                optionen={[
                  { id: "links", titel: "Nach links", satz: "Die zweite Zeile läuft an der linken Wand entlang." },
                  { id: "rechts", titel: "Nach rechts", satz: "Die zweite Zeile läuft an der rechten Wand entlang." },
                ]}
              />
            </div>
          </>
        )}

        {schritt === "breite" && (
          <>
            <Kopf titel="Wie breit ist der Raum?" satz="Die Länge der Hauptwand, von Ecke zu Ecke." />
            <Karte className="mt-7 px-5 py-7">
              <GrosseZahl wert={raum.breite} setze={(mm) => setzeRaum({ breite: mm })} min={120} max={900} />
            </Karte>
          </>
        )}

        {schritt === "tiefe" && (
          <>
            <Kopf titel="Und wie tief?" satz="Von der Hauptwand bis zur Wand gegenüber. Daran hängt, wie viel Platz zum Stehen bleibt." />
            <Karte className="mt-7 px-5 py-7">
              <GrosseZahl wert={raum.tiefe} setze={(mm) => setzeRaum({ tiefe: mm })} min={150} max={900} />
            </Karte>
            {hinweise.length > 0 && (
              <div className="mt-5 space-y-2">{hinweise.map((h) => <Notiz key={h} ton="achtung">{h}</Notiz>)}</div>
            )}
          </>
        )}

        {zeileWand && (
          <>
            <Kopf
              titel={`Wie lang wird die Zeile an der ${WANDNAME[zeileWand]}?`}
              satz={`Die Wand ist ${Math.round(wandlaenge(raum, zeileWand) / 10)} cm lang. Wenn eine Tür, ein Heizkörper oder ein Durchgang Platz wegnimmt, trag hier weniger ein.`}
            />
            <Karte className="mt-7 px-5 py-7">
              <GrosseZahl
                wert={raum.nutz[zeileWand]}
                setze={(mm) => setzeNutz(zeileWand, mm)}
                min={60}
                max={Math.round(wandlaenge(raum, zeileWand) / 10)}
              />
              <div className="mt-5 flex justify-center">
                <WKnopf onClick={() => setzeNutz(zeileWand, wandlaenge(raum, zeileWand))}>
                  Ganze Wand nutzen
                </WKnopf>
              </div>
            </Karte>
          </>
        )}

        {schritt === "fensterJa" && (
          <>
            <Kopf titel="Gibt es im Raum ein Fenster?" satz="Vor einem Fenster darf nichts Hohes stehen und darüber hängt kein Schrank. Deshalb fragen wir." />
            <div className="mt-7">
              <GrosseWahl<"ja" | "nein">
                wert={raum.fenster ? "ja" : "nein"}
                setze={(v) =>
                  setzeRaum({
                    fenster: v === "ja" ? { wand: "haupt", von: Math.max(0, Math.round(raum.breite / 2 - 600)), breite: 1200 } : null,
                  })
                }
                optionen={[
                  { id: "ja", titel: "Ja", satz: "Wir halten die Stelle frei." },
                  { id: "nein", titel: "Nein", satz: "Dann passen Hängeschränke über die ganze Länge." },
                ]}
              />
            </div>
          </>
        )}

        {schritt === "fenster" && raum.fenster && (
          <>
            <Kopf titel="Wo ist das Fenster?" satz="Erst die Wand, dann die Stelle." />
            <div className="mt-7">{wandWahl(raum.fenster.wand, (w) => setzeRaum({ fenster: { ...raum.fenster!, wand: w, von: 0 } }))}</div>
            <Karte className="mt-4 px-5 py-6">
              <Schieber
                wert={raum.fenster.von}
                max={Math.max(0, wandlaenge(raum, raum.fenster.wand) - raum.fenster.breite)}
                setze={(mm) => setzeRaum({ fenster: { ...raum.fenster!, von: mm } })}
                links="am Anfang"
                rechts="am Ende"
              />
              <div className="mt-7 border-t border-linie-warm pt-6">
                <div className="mb-3 text-center text-[15px] font-semibold text-kohle">Wie breit ist es?</div>
                <GrosseZahl wert={raum.fenster.breite} setze={(mm) => setzeRaum({ fenster: { ...raum.fenster!, breite: mm } })} min={40} max={320} />
              </div>
            </Karte>
          </>
        )}

        {schritt === "tuer" && (
          <>
            <Kopf titel="Wo ist die Tür?" satz="Eine Tür darf nicht gegen einen Schrank schlagen." />
            <div className="mt-7">{wandWahl(raum.tuer.wand, (w) => setzeRaum({ tuer: { ...raum.tuer, wand: w, von: 0 } }))}</div>
            <Karte className="mt-4 px-5 py-6">
              <Schieber
                wert={raum.tuer.von}
                max={Math.max(0, wandlaenge(raum, raum.tuer.wand) - raum.tuer.breite)}
                setze={(mm) => setzeRaum({ tuer: { ...raum.tuer, von: mm } })}
                links="am Anfang"
                rechts="am Ende"
              />
            </Karte>
          </>
        )}

        {schritt === "wasser" && (
          <>
            <Kopf
              titel="Wo kommt das Wasser aus der Wand?"
              satz="Schau unter die alte Spüle oder in die Ecke mit den Leitungen. Dort bleibt die Spüle am besten — sonst muss ein Installateur verlegen."
            />
            <div className="mt-7">{wandWahl(raum.wasser.wand, (w) => setzeRaum({ wasser: { wand: w, von: 0 } }))}</div>
            <Karte className="mt-4 px-5 py-6">
              <Schieber
                wert={raum.wasser.von}
                max={wandlaenge(raum, raum.wasser.wand)}
                setze={(mm) => setzeRaum({ wasser: { ...raum.wasser, von: mm } })}
                links="am Anfang"
                rechts="am Ende"
              />
            </Karte>
            <div className="mt-4">
              <Notiz>Noch nichts vorhanden, weil neu gebaut wird? Dann setz den Punkt dorthin, wo die Spüle stehen soll.</Notiz>
            </div>
          </>
        )}

        {geraeteArt && (() => {
          const info = ARTEN.find((x) => x.art === geraeteArt)!;
          return (
            <>
              <Kopf titel={info.frage} satz={info.hilfe} />
              <div className="mt-7">
                <GrosseWahl<string>
                  wert={raum.geraete[geraeteArt]}
                  setze={(id) => setzeGeraet(geraeteArt, id)}
                  spalten={geraeteFuer(geraeteArt).length > 2 ? 3 : 2}
                  optionen={geraeteFuer(geraeteArt).map((g) => ({
                    id: g.id,
                    titel: g.name,
                    satz: `${g.satz}${g.aufpreis !== 0 ? `  ${g.aufpreis > 0 ? "+" : ""}${eur(g.aufpreis)}` : "  im Preis"}`,
                  }))}
                />
              </div>
            </>
          );
        })()}

        {schritt === "niveau" && (
          <>
            <Kopf titel="Wie soll sie ausgestattet sein?" satz="Das entscheidet über Fronten, Auszüge und Beschläge." />
            <div className="mt-7">
              <GrosseWahl<"einfach" | "mittel" | "gehoben">
                wert={raum.niveau}
                setze={(n) => setzeRaum({ niveau: n })}
                spalten={3}
                optionen={[
                  { id: "einfach", titel: "Einfach", satz: "Solide Fronten, Scharniere ohne Dämpfung." },
                  { id: "mittel", titel: "Mittel", satz: "Gedämpfte Vollauszüge, bessere Fronten." },
                  { id: "gehoben", titel: "Gehoben", satz: "Hochwertige Oberflächen, Technik im Detail." },
                ]}
              />
            </div>
          </>
        )}

        {istVorschlaege && (
          <>
            <div className="text-center">
              <h1 className="gross text-[29px] font-bold leading-[1.12] text-kohle sm:text-[36px]">Das passt in deinen Raum.</h1>
              <p className="mx-auto mt-3 max-w-[52ch] text-[16px] leading-relaxed text-kohle-2">
                Drei Möglichkeiten, alle auf den Zentimeter gerechnet und nach denselben Regeln geprüft.
              </p>
            </div>
            {moegliche.length === 0 ? (
              <div className="mx-auto mt-8 max-w-[560px]">
                <Notiz ton="achtung">{vorschlaege[0]?.grund}</Notiz>
                <div className="mt-5 flex justify-center gap-3">
                  <WKnopf onClick={() => geheZu("geraet-spuelmaschine")}>Geräte ändern</WKnopf>
                  <WKnopf onClick={() => geheZu("breite")}>Maße ändern</WKnopf>
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
              <h1 className="gross text-[31px] font-bold leading-[1.1] text-kohle sm:text-[40px]">Das ist deine Küche.</h1>
              <p className="mx-auto mt-3 max-w-[48ch] text-[16px] text-kohle-2">
                {gewaehlterVorschlag.titel} · {FORMEN.find((f) => f.id === raum.form)!.titel}
              </p>
            </div>

            <Karte className="mt-7 overflow-hidden shadow-[0_10px_40px_rgba(23,22,15,0.07)]">
              <div className="space-y-2 bg-creme-2/50 px-4 pt-6 sm:px-8">
                {typ.zeilen.map((z) => (
                  <div key={z.id}>
                    {typ.zeilen.length > 1 && (
                      <div className="mb-1 text-[12.5px] font-semibold text-kohle-3">{z.bezeichnung}</div>
                    )}
                    <Kuechenbild typ={typ} variante={gewaehlterVorschlag.variante} zeileId={z.id} hoehe={typ.zeilen.length > 1 ? 200 : 290} />
                  </div>
                ))}
              </div>
              <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
                <div>
                  <div className="text-[13px] font-semibold uppercase tracking-[0.07em] text-kohle-3">Komplett, mit Geräten und Montage</div>
                  <div className="gross mt-1 text-[42px] font-bold leading-none text-kohle">{eur(gewaehlterVorschlag.preis)}</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <WKnopf art="primaer" gross onClick={() => melde("Demo: Hier ginge die Anfrage raus.")}>Angebot anfordern</WKnopf>
                  <WKnopf gross onClick={() => window.print()}>Speichern</WKnopf>
                </div>
              </div>
            </Karte>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                ["Schränke", String(Object.values(gewaehlterVorschlag.belegung).flat().filter((m) => modul(m).kategorie !== "blende").length)],
                ["Hängeschränke", String(gewaehlterVorschlag.haengeschraenke)],
                ["Arbeitsfläche", `${Math.round(gewaehlterVorschlag.arbeitsflaeche / 10)} cm`],
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
                  <div className="warm-rein mt-4 border-t border-linie-warm pt-4">
                    <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.06em] text-kohle-3">Geräte</div>
                    <ul className="space-y-2 text-[14.5px]">
                      {(Object.keys(raum.geraete) as GeraeteArt[]).map((art) => (
                        <li key={art} className="flex items-baseline justify-between gap-4">
                          <span className="text-kohle-2">{geraet(raum.geraete[art]).name}</span>
                          <span className="shrink-0 text-kohle-3">
                            {geraet(raum.geraete[art]).aufpreis === 0 ? "im Preis" : `${geraet(raum.geraete[art]).aufpreis > 0 ? "+" : ""}${eur(geraet(raum.geraete[art]).aufpreis)}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-3 mt-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-kohle-3">Schränke</div>
                    <ul className="space-y-2 text-[14.5px]">
                      {Object.entries(gewaehlterVorschlag.belegung).flatMap(([zid, ids]) =>
                        ids.map((id, i) => (
                          <li key={`${zid}-${i}`} className="flex items-baseline justify-between gap-4">
                            <span className="text-kohle-2">
                              {modul(id).bezeichnung}
                              {typ.zeilen.length > 1 && (
                                <span className="ml-1.5 text-[12.5px] text-kohle-3">
                                  {typ.zeilen.find((z) => z.id === zid)?.bezeichnung}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 text-kohle-3">{modul(id).breite} mm</span>
                          </li>
                        )),
                      )}
                      <li className="flex items-baseline justify-between gap-4 border-t border-linie-warm pt-2.5">
                        <span className="text-kohle-2">Arbeitsplatte, Spüle, Sockel, Montage</span>
                        <span className="shrink-0 text-kohle-3">enthalten</span>
                      </li>
                    </ul>
                  </div>
                )}
              </Karte>
            </div>

            {gewaehlterVorschlag.achtungPunkte.length > 0 && (
              <div className="mt-5 space-y-2">
                {gewaehlterVorschlag.achtungPunkte.map((a) => <Notiz key={a} ton="achtung">{a}</Notiz>)}
              </div>
            )}

            <div className="mt-5">
              <Notiz>
                <strong className="font-semibold text-kohle">Bevor bestellt wird,</strong> misst jemand bei dir nach.
                Wände sind nie ganz gerade, und auf den letzten Zentimetern entscheidet sich, ob alle Türen
                schließen. Dein Plan bleibt — die Maße werden nur bestätigt.
              </Notiz>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <WKnopf onClick={() => geheZu("vorschlaege")}>Andere Variante</WKnopf>
              <WKnopf art="klar" onClick={() => geheZu("breite")}>Maße ändern</WKnopf>
            </div>
          </div>
        )}

        {!istStart && !breit && (
          <div className="mt-8">
            <Karte className="px-4 py-4">
              <Raumbild raum={raum} hervorhebung={hervor} hoehe={205} />
              <p className="mt-3 border-t border-linie-warm pt-3 text-center text-[13px] text-kohle-3">
                {hervor
                  ? `Schwarz markiert ist die ${WANDNAME[hervor]}.`
                  : "Gelb sind die Wände mit Küche, der Tropfen zeigt den Wasseranschluss."}
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
