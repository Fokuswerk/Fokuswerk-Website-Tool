"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { modul } from "@/data/module";
import { eur, zahl } from "@/lib/berechnung";
import {
  alleVorschlaege, alsKuechentyp, FORMEN, pruefeAngaben, STRATEGIEN,
  type Raumform, type Strategie, type Vorschlag,
} from "@/lib/planer";
import { useKueche, LETZTER_SCHRITT } from "@/store/kueche";
import { Grundriss } from "@/components/plan/Grundriss";
import { Ansicht } from "@/components/plan/Ansicht";
import { Auswahl, Frage, JaNein, MassFeld, Position, Schrittleiste } from "@/components/kueche/Felder";
import { Flaeche, Hinweisband, Knopf, Marke, Tabelle, Td, Th, melde } from "@/components/ui/kit";

const SCHRITTE = ["Form", "Maße", "Fenster & Tür", "Wünsche", "Vorschläge", "Ergebnis"];

function FormBild({ form }: { form: Raumform }) {
  const w = (d: string, stark?: boolean) => (
    <path d={d} fill="none" strokeWidth={stark ? 7 : 2.5} className={stark ? "stroke-accent" : "stroke-ink-3"} strokeLinecap="square" />
  );
  return (
    <svg viewBox="0 0 86 58" className="h-[50px] w-full" aria-hidden="true">
      {w("M6 6 H80 V52 H6 Z")}
      {form === "eine-wand" && w("M9 9 H77", true)}
      {form === "ecke" && <>{w("M9 9 H77", true)}{w("M9 9 V40", true)}</>}
      {form === "zwei-waende" && <>{w("M9 9 H77", true)}{w("M9 49 H77", true)}</>}
      {form === "u-form" && <>{w("M9 9 H77", true)}{w("M9 9 V44", true)}{w("M77 9 V44", true)}</>}
    </svg>
  );
}

function Zeichnung({ hoehe = 300 }: { hoehe?: number }) {
  const raum = useKueche((s) => s.raum);
  const typ = useMemo(() => alsKuechentyp(raum), [raum]);
  return (
    <Flaeche className="p-3">
      <Grundriss typ={typ} zeigeModule={false} hoehe={hoehe} />
      <p className="mt-2 border-t border-line-2 pt-2 text-[11.5px] leading-relaxed text-ink-3">
        Die Zeichnung entsteht aus Ihren Angaben. Blau ist die Wand, an der die Küche steht,
        das Kreuz zeigt den Wasseranschluss.
      </p>
    </Flaeche>
  );
}

function VorschlagKarte({ v, aktiv, empfohlen, waehlen }: { v: Vorschlag; aktiv: boolean; empfohlen?: boolean; waehlen: () => void }) {
  const raum = useKueche((s) => s.raum);
  const typ = useMemo(() => alsKuechentyp(raum), [raum]);

  if (!v.moeglich) {
    return (
      <Flaeche className="p-4">
        <div className="text-[14px] font-medium text-ink">{v.titel}</div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{v.grund}</p>
      </Flaeche>
    );
  }

  return (
    <Flaeche className={`p-4 ${aktiv ? "border-accent ring-1 ring-accent" : ""}`}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold text-ink">{v.titel}</span>
          {empfohlen && <Marke ton="good">Empfehlung</Marke>}
        </div>
        <div className="num text-[15px] font-medium text-ink">{eur(v.preis)}</div>
      </div>
      <p className="mt-0.5 text-[12.5px] text-ink-3">
        {STRATEGIEN.find((s) => s.id === v.strategie)!.satz}
      </p>

      <div className="mt-3 rounded-sm bg-ground p-2">
        <Ansicht typ={typ} variante={v.variante} zeileId="Z1" hoehe={160} />
      </div>

      <ul className="mt-3 space-y-1 border-t border-line-2 pt-3 text-[12.5px]">
        {v.gutPunkte.map((g) => (
          <li key={g} className="flex gap-2 text-ink-2">
            <span className="text-good">+</span>
            <span>{g}</span>
          </li>
        ))}
        {v.achtungPunkte.map((a) => (
          <li key={a} className="flex gap-2 text-ink-3">
            <span className="text-flag">!</span>
            <span>{a}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3.5">
        <Knopf art={aktiv ? "still" : "primaer"} deaktiviert={aktiv} onClick={waehlen}>
          {aktiv ? <><Check size={13} strokeWidth={2} />Ausgewählt</> : "Diese nehmen"}
        </Knopf>
      </div>
    </Flaeche>
  );
}

export default function EinzelneKueche() {
  const { raum, schritt, maxSchritt, gewaehlt, setzeRaum, setzeWunsch, geheZu, weiter, zurueck, waehle, neu } = useKueche();
  const typ = useMemo(() => alsKuechentyp(raum), [raum]);
  const vorschlaege = useMemo(() => (schritt >= 4 ? alleVorschlaege(raum) : []), [raum, schritt]);
  const hinweise = pruefeAngaben(raum);
  const zeilen = FORMEN.find((f) => f.id === raum.form)!.zeilen;
  const gewaehlterVorschlag = vorschlaege.find((v) => v.strategie === gewaehlt) ?? vorschlaege.find((v) => v.moeglich);

  // Welcher Vorschlag ist sachlich der beste: erst Arbeitsfläche, dann kurzer
  // Weg zum Wasser, dann Preis. Für jemanden, der zum ersten Mal plant, ist
  // eine begründete Empfehlung mehr wert als drei gleichwertige Karten.
  const moegliche = vorschlaege.filter((v) => v.moeglich);
  const empfehlung = [...moegliche].sort(
    (a, b) =>
      b.arbeitsflaeche - a.arbeitsflaeche ||
      a.wegZumWasser - b.wegZumWasser ||
      a.preis - b.preis,
  )[0];
  const alleGleich =
    moegliche.length > 1 &&
    moegliche.every(
      (v) =>
        v.preis === moegliche[0].preis &&
        v.arbeitsflaeche === moegliche[0].arbeitsflaeche &&
        v.wegZumWasser === moegliche[0].wegZumWasser,
    );

  const breitSchritt = schritt >= 4;

  return (
    <main className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-line bg-paper">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 17 17" aria-hidden="true">
              <rect x="0.75" y="0.75" width="15.5" height="15.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-ink" />
              <path d="M0.75 5.6 H16.25 M5.6 5.6 V16.25 M10.6 5.6 V16.25" stroke="currentColor" strokeWidth="1" className="text-accent" />
            </svg>
            <span className="text-[13.5px] font-semibold text-ink">Serienküche</span>
          </Link>
          <div className="hidden min-w-0 flex-1 md:block">
            <Schrittleiste schritte={SCHRITTE} aktiv={schritt} max={maxSchritt} geheZu={geheZu} />
          </div>
          <div className="num flex-1 text-[12px] text-ink-3 md:hidden">
            Schritt {schritt + 1} von {SCHRITTE.length}
            <span className="ml-1.5 text-ink-2">{SCHRITTE[schritt]}</span>
          </div>
          <button
            onClick={() => { neu(); melde("Von vorne begonnen."); }}
            className="flex shrink-0 items-center gap-1.5 text-[12px] text-ink-3 hover:text-ink-2"
          >
            <RotateCcw size={12} strokeWidth={1.7} />
            Von vorne
          </button>
        </div>
      </header>

      <div className={`mx-auto px-5 py-7 lg:px-8 ${breitSchritt ? "max-w-[1180px]" : "max-w-[1000px]"}`}>
        <div className={breitSchritt ? "" : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"}>
          <div className="min-w-0">
            {/* ---------------------------------------------- 0 Form */}
            {schritt === 0 && (
              <>
                <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">
                  Wie läuft die Küche durch den Raum?
                </h1>
                <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-2">
                  Schauen Sie sich den Raum an: An wie vielen Wänden soll etwas stehen? Wenn Sie
                  unsicher sind, nehmen Sie die einfachste Form — ändern lässt sich das später.
                </p>
                <div className="mt-5">
                  <Auswahl<Raumform>
                    wert={raum.form}
                    setze={(f) => setzeRaum({ form: f })}
                    spalten={4}
                    optionen={FORMEN.map((f) => ({
                      id: f.id,
                      titel: f.titel,
                      satz: f.erklaerung,
                      bild: <FormBild form={f.id} />,
                    }))}
                  />
                </div>
              </>
            )}

            {/* ---------------------------------------------- 1 Maße */}
            {schritt === 1 && (
              <>
                <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">
                  Wie groß ist der Raum?
                </h1>
                <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-2">
                  Messen Sie von Wand zu Wand, in Zentimetern. Auf ein paar Zentimeter kommt es
                  jetzt noch nicht an — vor der Bestellung wird ohnehin genau nachgemessen.
                </p>

                <Frage
                  titel="Länge der Hauptwand"
                  hilfe="Die Wand, an der die Küche vor allem stehen soll. Von Ecke zu Ecke messen."
                >
                  <MassFeld id="wandA" wert={raum.wandA} setze={(mm) => setzeRaum({ wandA: mm })} min={120} max={800} />
                </Frage>

                {zeilen > 1 && (
                  <Frage
                    titel={raum.form === "zwei-waende" ? "Länge der gegenüberliegenden Wand" : "Länge der zweiten Wand"}
                    hilfe={raum.form === "u-form" ? "Die beiden kurzen Wände links und rechts werden gleich lang angenommen." : undefined}
                  >
                    <MassFeld id="wandB" wert={raum.wandB} setze={(mm) => setzeRaum({ wandB: mm })} min={60} max={800} />
                  </Frage>
                )}

                <Frage
                  titel="Tiefe des Raums"
                  hilfe="Der Abstand von der Hauptwand bis zur gegenüberliegenden Wand. Davon hängt ab, wie viel Platz zum Stehen bleibt."
                >
                  <MassFeld id="tiefe" wert={raum.tiefe} setze={(mm) => setzeRaum({ tiefe: mm })} min={150} max={900} />
                </Frage>

                {hinweise.length > 0 && (
                  <div className="mt-6">
                    <Hinweisband titel="Das wird eng">
                      <ul className="space-y-1">
                        {hinweise.map((h) => <li key={h}>{h}</li>)}
                      </ul>
                    </Hinweisband>
                  </div>
                )}
              </>
            )}

            {/* ---------------------------------------------- 2 Öffnungen */}
            {schritt === 2 && (
              <>
                <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">
                  Fenster, Tür und Wasseranschluss
                </h1>
                <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-2">
                  Diese drei Dinge entscheiden mehr über die Küche als alles andere. Über einem
                  Fenster kann kein Oberschrank hängen, eine Tür darf nicht gegen einen Schrank
                  schlagen, und die Spüle bleibt am besten dort, wo das Wasser schon ist.
                </p>

                <Frage titel="Gibt es ein Fenster an der Küchenwand?">
                  <JaNein
                    wert={raum.fenster !== null}
                    setze={(v) => setzeRaum({ fenster: v ? { wand: "A", von: Math.round(raum.wandA / 2 - 600), breite: 1200 } : null })}
                    ja="Ja, an der Hauptwand"
                    nein="Nein"
                    jaSatz="Dort bleiben die Oberschränke weg."
                    neinSatz="Oberschränke über die ganze Länge möglich."
                  />
                  {raum.fenster && (
                    <div className="mt-3 space-y-3 rounded-sm border border-line bg-paper px-3 py-3">
                      <Position
                        id="fensterVon"
                        wert={raum.fenster.von}
                        max={Math.max(0, raum.wandA - raum.fenster.breite)}
                        setze={(mm) => setzeRaum({ fenster: { ...raum.fenster!, von: mm } })}
                        beschriftung="Wo beginnt das Fenster?"
                      />
                      <div>
                        <div className="mb-1 text-[12.5px] text-ink-2">Wie breit ist es?</div>
                        <MassFeld
                          id="fensterBreite"
                          wert={raum.fenster.breite}
                          setze={(mm) => setzeRaum({ fenster: { ...raum.fenster!, breite: mm } })}
                          min={40}
                          max={300}
                        />
                      </div>
                    </div>
                  )}
                </Frage>

                <Frage titel="Wo ist die Tür?" hilfe="Meistens in der Wand gegenüber der Küche.">
                  <Auswahl<"gegenueber" | "A" | "B">
                    wert={raum.tuer?.wand ?? "gegenueber"}
                    setze={(w) => setzeRaum({ tuer: { wand: w, von: raum.tuer?.von ?? 1500, breite: 885 } })}
                    spalten={3}
                    optionen={[
                      { id: "gegenueber", titel: "Gegenüber", satz: "In der Wand hinter einem" },
                      { id: "A", titel: "In der Küchenwand", satz: "Nimmt Platz von der Zeile weg" },
                      { id: "B", titel: "In der zweiten Wand" },
                    ]}
                  />
                  {raum.tuer && (
                    <div className="mt-3 rounded-sm border border-line bg-paper px-3 py-3">
                      <Position
                        id="tuerVon"
                        wert={raum.tuer.von}
                        max={Math.max(0, (raum.tuer.wand === "B" ? raum.wandB : raum.wandA) - raum.tuer.breite)}
                        setze={(mm) => setzeRaum({ tuer: { ...raum.tuer!, von: mm } })}
                        beschriftung="Wo beginnt die Tür?"
                      />
                    </div>
                  )}
                </Frage>

                <Frage
                  titel="Wo kommt heute das Wasser aus der Wand?"
                  hilfe="Schauen Sie unter die bisherige Spüle oder in die Ecke, in der die Leitungen sitzen. Wenn die Küche neu ist und noch nichts da ist, setzen Sie den Punkt dorthin, wo die Spüle stehen soll."
                >
                  {zeilen > 1 && (
                    <div className="mb-3">
                      <Auswahl<"A" | "B">
                        wert={raum.anschlussWand}
                        setze={(w) => setzeRaum({ anschlussWand: w })}
                        optionen={[
                          { id: "A", titel: "An der Hauptwand" },
                          { id: "B", titel: "An der zweiten Wand" },
                        ]}
                      />
                    </div>
                  )}
                  <div className="rounded-sm border border-line bg-paper px-3 py-3">
                    <Position
                      id="anschluss"
                      wert={raum.anschlussVon}
                      max={raum.anschlussWand === "B" ? raum.wandB : raum.wandA}
                      setze={(mm) => setzeRaum({ anschlussVon: mm })}
                      beschriftung="Abstand von der linken Ecke"
                    />
                  </div>
                </Frage>
              </>
            )}

            {/* ---------------------------------------------- 3 Wünsche */}
            {schritt === 3 && (
              <>
                <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">
                  Was soll hinein?
                </h1>
                <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-relaxed text-ink-2">
                  Spüle und Kochfeld sind immer dabei. Alles andere kostet Platz an der Wand —
                  deshalb fragen wir einzeln.
                </p>

                <Frage
                  titel="Geschirrspüler?"
                  hilfe="Braucht 60 cm neben der Spüle. Nachträglich einbauen geht nur, wenn dort ein Schrank weicht."
                >
                  <JaNein
                    wert={raum.wuensche.geschirrspueler}
                    setze={(v) => setzeWunsch({ geschirrspueler: v })}
                    jaSatz="60 cm werden reserviert"
                    neinSatz="Dafür mehr Stauraum"
                  />
                </Frage>

                <Frage
                  titel="Kühlschrank"
                  hilfe="Ein hoher Einbaukühlschrank nimmt 60 cm Wand über die volle Höhe — dort geht dann kein Oberschrank und keine Arbeitsfläche."
                >
                  <JaNein
                    wert={raum.wuensche.grosserKuehlschrank}
                    setze={(v) => setzeWunsch({ grosserKuehlschrank: v })}
                    ja="Großer Einbaukühlschrank"
                    nein="Kleiner, unter der Arbeitsplatte"
                    jaSatz="Volle Höhe, mehr Platz innen"
                    neinSatz="Arbeitsfläche bleibt durchgehend"
                  />
                </Frage>

                <Frage
                  titel="Backofen"
                  hilfe="Auf Griffhöhe muss man sich nicht bücken, kostet aber weitere 60 cm Wand über die volle Höhe."
                >
                  <JaNein
                    wert={raum.wuensche.backofenHoch}
                    setze={(v) => setzeWunsch({ backofenHoch: v })}
                    ja="Auf Griffhöhe im Hochschrank"
                    nein="Unter dem Kochfeld"
                    jaSatz="Rückenschonend, braucht 60 cm extra"
                    neinSatz="Spart Platz, der übliche Weg"
                  />
                </Frage>

                <Frage titel="Ausstattung">
                  <Auswahl<"einfach" | "mittel" | "gehoben">
                    wert={raum.wuensche.niveau}
                    setze={(n) => setzeWunsch({ niveau: n })}
                    spalten={3}
                    optionen={[
                      { id: "einfach", titel: "Einfach", satz: "Solide Fronten, Standardgeräte" },
                      { id: "mittel", titel: "Mittel", satz: "Gedämpfte Auszüge, bessere Geräte" },
                      { id: "gehoben", titel: "Gehoben", satz: "Hochwertige Fronten und Technik" },
                    ]}
                  />
                </Frage>
              </>
            )}

            {/* ---------------------------------------------- 4 Vorschläge */}
            {schritt === 4 && (
              <>
                <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">
                  Drei Möglichkeiten für Ihren Raum
                </h1>
                <p className="mt-1.5 max-w-[68ch] text-[13.5px] leading-relaxed text-ink-2">
                  Alle drei passen in den Raum, halten die Abstände ein und gehen auf den
                  Zentimeter auf. Sie unterscheiden sich darin, worauf sie Rücksicht nehmen.
                </p>

                {alleGleich && (
                  <p className="mt-3 max-w-[68ch] rounded-sm border border-line bg-paper px-3 py-2 text-[12.5px] leading-relaxed text-ink-2">
                    In diesem Raum ist so wenig Spielraum, dass alle drei auf dasselbe
                    hinauslaufen — gleiche Teile, gleicher Preis. Nehmen Sie einfach eine.
                  </p>
                )}
                {!alleGleich && empfehlung && (
                  <p className="mt-3 max-w-[68ch] rounded-sm border border-line bg-paper px-3 py-2 text-[12.5px] leading-relaxed text-ink-2">
                    Wenn Sie unsicher sind: <strong className="font-medium text-ink">{empfehlung.titel}</strong>.
                    {empfehlung.arbeitsflaeche > 0
                      ? ` Dort bleiben ${empfehlung.arbeitsflaeche} mm Arbeitsfläche zwischen Spüle und Herd — die Stelle, an der man tatsächlich schneidet und abstellt.`
                      : " In diesem Raum bleibt zwischen Spüle und Herd keine freie Fläche. Das ist eng, lässt sich bei dieser Wandlänge aber nicht vermeiden."}
                  </p>
                )}
                {vorschlaege.every((v) => !v.moeglich) ? (
                  <div className="mt-5">
                    <Hinweisband titel="So geht es nicht">
                      <p>{vorschlaege[0].grund}</p>
                      <div className="mt-3">
                        <Knopf onClick={() => geheZu(3)}>
                          <ArrowLeft size={13} strokeWidth={1.8} />
                          Wünsche ändern
                        </Knopf>
                      </div>
                    </Hinweisband>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    {vorschlaege.map((v) => (
                      <VorschlagKarte
                        key={v.strategie}
                        v={v}
                        aktiv={gewaehlt === v.strategie}
                        empfohlen={!alleGleich && empfehlung?.strategie === v.strategie}
                        waehlen={() => { waehle(v.strategie); melde(`„${v.titel}" ausgewählt.`); }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---------------------------------------------- 5 Ergebnis */}
            {schritt === 5 && gewaehlterVorschlag && gewaehlterVorschlag.moeglich && (
              <>
                <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">
                  Ihre Küche
                </h1>
                <p className="mt-1.5 max-w-[68ch] text-[13.5px] leading-relaxed text-ink-2">
                  {gewaehlterVorschlag.titel} · {FORMEN.find((f) => f.id === raum.form)!.titel} ·
                  Hauptwand {zahl(raum.wandA)} mm
                </p>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <Flaeche className="p-3">
                    <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">Von oben</div>
                    <Grundriss typ={typ} variante={gewaehlterVorschlag.variante} hoehe={240} />
                  </Flaeche>
                  <Flaeche className="p-3">
                    <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">Von vorn</div>
                    <Ansicht typ={typ} variante={gewaehlterVorschlag.variante} zeileId="Z1" hoehe={220} />
                  </Flaeche>
                </div>

                <div className="mt-4 grid grid-cols-2 border-y border-line sm:grid-cols-4">
                  {[
                    ["Preis", eur(gewaehlterVorschlag.preis)],
                    ["Schränke", String(Object.values(gewaehlterVorschlag.belegung).flat().length)],
                    ["Oberschränke", String(gewaehlterVorschlag.haengeschraenke)],
                    ["Arbeitsfläche", `${zahl(gewaehlterVorschlag.arbeitsflaeche)} mm`],
                  ].map(([a, b], i) => (
                    <div key={a} className={`px-4 py-3 ${i === 0 ? "" : "border-l border-line-2"}`}>
                      <div className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-3">{a}</div>
                      <div className="num mt-1 text-[19px] leading-none text-ink">{b}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h2 className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
                    Was Sie brauchen
                  </h2>
                  <Flaeche>
                    <Tabelle dicht>
                      <thead>
                        <tr>
                          <Th>Von links nach rechts</Th>
                          <Th rechts>Breite</Th>
                          <Th rechts>Preis</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(gewaehlterVorschlag.belegung).flatMap(([zeileId, ids]) =>
                          ids.map((id, i) => {
                            const m = modul(id);
                            return (
                              <tr key={`${zeileId}-${i}`}>
                                <Td>
                                  {m.bezeichnung}
                                  {Object.keys(gewaehlterVorschlag.belegung).length > 1 && (
                                    <span className="ml-1.5 text-[11px] text-ink-3">
                                      {typ.zeilen.find((z) => z.id === zeileId)?.bezeichnung}
                                    </span>
                                  )}
                                </Td>
                                <Td num rechts stumm>{m.breite} mm</Td>
                                <Td num rechts>{eur(m.preis)}</Td>
                              </tr>
                            );
                          }),
                        )}
                        <tr>
                          <Td>Oberschränke</Td>
                          <Td num rechts stumm>{gewaehlterVorschlag.haengeschraenke} × 600 mm</Td>
                          <Td num rechts>{eur(gewaehlterVorschlag.haengeschraenke * modul("HS600").preis)}</Td>
                        </tr>
                        <tr>
                          <Td>Arbeitsplatte, Sockel, Spüle, Geräte und Montage</Td>
                          <Td num rechts stumm>—</Td>
                          <Td num rechts stumm>im Preis enthalten</Td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <Td stumm>Alles zusammen</Td>
                          <Td />
                          <Td num rechts><strong>{eur(gewaehlterVorschlag.preis)}</strong></Td>
                        </tr>
                      </tfoot>
                    </Tabelle>
                  </Flaeche>
                </div>

                <div className="mt-5">
                  <Hinweisband titel="Bevor Sie bestellen">
                    Dieser Plan beruht auf Ihren Maßen. Wände sind selten ganz gerade, und auf
                    den letzten Zentimetern entscheidet sich, ob die Türen schließen. Nehmen Sie
                    den Plan mit zu einem Küchenbetrieb — der misst nach und bestellt dann. Was
                    Sie mitbringen, ist die halbe Arbeit: Form, Maße, Geräte und Teileliste
                    stehen schon.
                  </Hinweisband>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Knopf art="primaer" gross onClick={() => window.print()}>Plan ausdrucken</Knopf>
                  <Knopf onClick={() => geheZu(4)}>Andere Variante wählen</Knopf>
                  <Knopf art="klar" onClick={() => geheZu(1)}>Maße ändern</Knopf>
                </div>
              </>
            )}

            {schritt === 5 && (!gewaehlterVorschlag || !gewaehlterVorschlag.moeglich) && (
              <>
                <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">Noch kein Ergebnis</h1>
                <div className="mt-4">
                  <Hinweisband titel="In diesen Raum passt es so nicht">
                    <p>{vorschlaege[0]?.grund ?? "Bitte Maße und Wünsche prüfen."}</p>
                    <div className="mt-3 flex gap-2">
                      <Knopf onClick={() => geheZu(3)}>Wünsche ändern</Knopf>
                      <Knopf onClick={() => geheZu(1)}>Maße ändern</Knopf>
                    </div>
                  </Hinweisband>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
              <Knopf onClick={zurueck} deaktiviert={schritt === 0}>
                <ArrowLeft size={13} strokeWidth={1.8} />
                Zurück
              </Knopf>
              {schritt < LETZTER_SCHRITT ? (
                <Knopf
                  art="primaer"
                  gross
                  onClick={weiter}
                  deaktiviert={schritt === 4 && !gewaehlt && !vorschlaege.some((v) => v.moeglich)}
                >
                  {schritt === 3 ? "Vorschläge zeigen" : schritt === 4 ? "Weiter zum Ergebnis" : "Weiter"}
                  <ArrowRight size={14} strokeWidth={1.8} />
                </Knopf>
              ) : (
                <Marke ton="ok">Fertig</Marke>
              )}
            </div>
          </div>

          {/* Mitlaufende Zeichnung in den frühen Schritten */}
          {!breitSchritt && (
            <aside className="lg:sticky lg:top-[72px] lg:self-start">
              <Zeichnung />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
