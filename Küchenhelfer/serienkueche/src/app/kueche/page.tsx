"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, FileUp, PencilLine, RotateCcw, RotateCw, ScanLine } from "lucide-react";
import { modul } from "@/data/module";
import { ARTEN, geraet, geraeteFuer, type GeraeteArt } from "@/data/geraete";
import { eur } from "@/lib/berechnung";
import {
  alleVorschlaege, alsKuechentyp, ausBelegung, befundeZeile, drehungen, drehungName, FORMEN, kuechenwaende,
  befundeGesamt, tauschMoeglich, tauschPlan,
  pruefeAngaben, wandlaenge, WANDNAME, type Raumform, type Vorschlag, type WandId,
} from "@/lib/planer";
import { schrittFolge, useKueche } from "@/store/kueche";
import { Kuechenbild, Raumbild } from "@/components/warm/Kuechenbild";
import { Geraetebild } from "@/components/warm/Geraetebild";

import { Fortschritt, GrosseWahl, GrosseZahl, Karte, Notiz, Schieber, WKnopf } from "@/components/warm/Kit";
import { BeispielPlan, Planauflage, RAHMEN_START, type Rahmen } from "@/components/warm/Planauflage";
import { melde } from "@/components/ui/kit";

const ALLE_WAENDE: WandId[] = ["haupt", "links", "rechts", "gegenueber"];

/** Was beim Öffnen eines einzelnen Prüfpunkts oben steht. */
const EDIT_TITEL: Record<string, string> = {
  form: "An wie vielen Wänden soll die Küche stehen?",
  breite: "Wie breit ist der Raum?",
  tiefe: "Und wie tief?",
  fenster: "Wo sitzt das Fenster?",
  tuer: "Und die Tür?",
  wasser: "Wo kommt das Wasser aus der Wand?",
};

const EDIT_SATZ: Record<string, string> = {
  form: "Das sagt kein Plan — das entscheidest du.",
  breite: "Die Länge der Hauptwand, von Ecke zu Ecke.",
  tiefe: "Von der Hauptwand bis zur Wand gegenüber.",
  fenster: "Vor einem Fenster darf nichts Hohes stehen. Deshalb zählt die Stelle.",
  tuer: "Vor der Tür muss Platz bleiben, damit sie aufgeht.",
  wasser: "Schau unter die alte Spüle oder in die Ecke mit den Leitungen. Dort bleibt die Spüle am besten.",
};

// Das räumliche Bild läuft nur im Browser: ein Renderer hat auf dem Server
// nichts zu zeichnen, und der Code soll erst laden, wenn er gebraucht wird.
const Kuechenraum = dynamic(
  () => import("@/components/warm/Kuechenraum").then((m) => m.Kuechenraum),
  {
    ssr: false,
    loading: () => <div className="h-[420px] animate-pulse rounded-[18px] bg-creme-2" />,
  },
);

const SKIZZE: Record<WandId, string> = {
  haupt: "M13 13 H77",
  rechts: "M77 13 V45",
  gegenueber: "M13 45 H77",
  links: "M13 13 V45",
};

/** Der Raum von oben, gelb die Wände mit Küche. Zeigt die Form und ihre Drehung. */
function RaumSkizze({ form, ausrichtung }: { form: Raumform; ausrichtung: number }) {
  return (
    <svg viewBox="0 0 90 58" className="h-[54px] w-full" aria-hidden="true">
      <rect x="5" y="5" width="80" height="48" rx="6" className="fill-creme" />
      {kuechenwaende({ form, ausrichtung }).map((w) => (
        <path key={w} d={SKIZZE[w]} strokeWidth={9} strokeLinecap="round" className="stroke-kohle-2" fill="none" />
      ))}
    </svg>
  );
}

function Kopf({ titel, satz, vor }: { titel: string; satz?: string; vor?: string }) {
  return (
    <div className="warm-rein">
      {vor && <div className="vorzeile mb-3">{vor}</div>}
      <h1 className="gross text-[31px] font-bold leading-[1.05] text-kohle sm:text-[40px]">{titel}</h1>
      {satz && <p className="mt-4 max-w-[52ch] text-[16.5px] leading-relaxed text-kohle-2">{satz}</p>}
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
    <Karte className={`overflow-hidden ${aktiv ? "flaeche-hoch !border-kohle ring-1 ring-kohle" : ""}`}>
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
              <span className="mt-[1px] shrink-0 font-bold text-kohle">!</span>
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
  const { raum, quelle, erkannt, schritt, gewaehlt, eigeneBelegung, setzeRaum, setzeGeraet, setzeNutz, setzeQuelle, uebernehmeErkennung, geheZu, weiter, zurueck, waehle, setzeBelegung, neu } = useKueche();
  const [details, setDetails] = useState(false);
  const [lauf, setLauf] = useState<number | null>(null);
  const [ansicht, setAnsicht] = useState<"raum" | "vorn" | "umstellen">("raum");
  /** Beim Umstellen angefasster Schrank: Zeile und Platz darin. */
  const [angefasst, setAngefasst] = useState<{ zeile: string; index: number } | null>(null);
  /** Warum der letzte Tausch nicht ging. */
  const [tauschGrund, setTauschGrund] = useState<string | null>(null);
  /** Im Prüfschritt geöffneter Einzelwert. null heißt Übersicht. */
  const [offen, setOffen] = useState<string | null>(null);
  const [planBild, setPlanBild] = useState<string | null>(null);
  const [rahmen, setRahmen] = useState<Rahmen>(RAHMEN_START);
  const feld = useRef<HTMLInputElement>(null);

  // Wer den Pruefschritt verlaesst, soll beim Zurueckkommen die Uebersicht
  // sehen und nicht in einem alten Einzelwert stehen.
  useEffect(() => { if (schritt !== "pruefen") setOffen(null); }, [schritt]);

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
  const grundVorschlag = moegliche.find((v) => v.strategie === gewaehlt) ?? empfehlung;

  // Von Hand umgestellt wird nur getauscht, die Breite bleibt also stimmen.
  // Alles andere — Preis, Hängeschränke, Hinweise — rechnen wir neu, sonst
  // stünden beim Umstellen falsche Zahlen da.
  const eigen = grundVorschlag ? eigeneBelegung[grundVorschlag.strategie] : undefined;
  const gewaehlterVorschlag = useMemo(() => {
    if (!grundVorschlag || !eigen) return grundVorschlag;
    return ausBelegung(raum, typ, grundVorschlag.strategie, { ...grundVorschlag.belegung, ...eigen });
  }, [grundVorschlag, eigen, raum, typ]);

  const antippen = (zeileId: string, index: number) => {
    if (!gewaehlterVorschlag) return;
    const ziel = { zeile: zeileId, index };
    if (!angefasst) { setAngefasst(ziel); setTauschGrund(null); return; }
    if (angefasst.zeile === zeileId && angefasst.index === index) {
      setAngefasst(null); setTauschGrund(null); return;
    }
    const plan = tauschPlan(typ, gewaehlterVorschlag.belegung, angefasst, ziel);
    if ("grund" in plan) {
      // Geht nicht — den Grund nennen und den neuen Schrank anfassen,
      // damit man nicht erst abwaehlen muss.
      setTauschGrund(plan.grund);
      setAngefasst(ziel);
      return;
    }
    setzeBelegung(grundVorschlag!.strategie, { ...(eigen ?? {}), ...plan.belegung });
    setAngefasst(null);
    setTauschGrund(null);
  };

  const zielMoeglich = (zeileId: string, index: number) =>
    !!angefasst && !!gewaehlterVorschlag &&
    tauschMoeglich(typ, gewaehlterVorschlag.belegung, angefasst, { zeile: zeileId, index });
  const hinweise = pruefeAngaben(raum);

  // Orientierung: wo im Ablauf stehe ich gerade. Ohne Start- und Ergebnisbild,
  // die sind keine Fragen.
  const gesamt = Math.max(1, folge.length - 2);
  const schrittText = `Schritt ${Math.min(gesamt, Math.max(1, pos))} von ${gesamt}`;

  const istStart = schritt === "start";
  const istErgebnis = schritt === "ergebnis";
  const istVorschlaege = schritt === "vorschlaege";
  const breit = istErgebnis || istVorschlaege;

  const zeileWand = schritt.startsWith("zeile-") ? (schritt.slice(6) as WandId) : null;
  const geraeteArt = schritt.startsWith("geraet-") ? (schritt.slice(7) as GeraeteArt) : null;
  const wandVon = (was: string | null): WandId | null =>
    was === "fenster" ? raum.fenster?.wand ?? null
    : was === "tuer" ? raum.tuer.wand
    : was === "wasser" ? raum.wasser.wand
    : null;

  const hervor: WandId | null =
    zeileWand ?? (schritt === "pruefen" ? wandVon(offen) : wandVon(schritt));

  // Die Zeichnung begleitet jede Frage, statt unter ihr zu liegen: wer eine
  // Zahl aendert, sieht die Wirkung sofort, ohne zu scrollen.
  // Die Spalte bleibt auf allen Fragen stehen, damit die Breite nicht
  // springt — gezeichnet wird aber nur, wo der Raum etwas zu sagen hat.
  const zeigeBild = !istStart && !breit;
  const geometrie = zeigeBild && !geraeteArt && schritt !== "niveau" && schritt !== "quelle" && schritt !== "upload";
  const stufen = drehungen(raum.form);
  const dreh = () => setzeRaum({ ausrichtung: (raum.ausrichtung + 1) % stufen });

  // Die Uebersicht im Pruefschritt: ein Punkt je Angabe, mit Herkunft.
  const pruefpunkte = [
    {
      id: "form",
      titel: "Form der Küche",
      herkunft: "sagt der Plan nicht — entscheidest du",
      sicher: false,
      wert: FORMEN.find((f) => f.id === raum.form)!.titel,
    },
    { id: "breite", titel: "Raumbreite", herkunft: "aus dem Plan gelesen", sicher: true, wert: `${Math.round(raum.breite / 10)} cm` },
    { id: "tiefe", titel: "Raumtiefe", herkunft: "aus dem Plan gelesen", sicher: true, wert: `${Math.round(raum.tiefe / 10)} cm` },
    {
      id: "fenster",
      titel: "Fenster",
      herkunft: "geschätzt — bitte prüfen",
      sicher: false,
      wert: raum.fenster ? `${WANDNAME[raum.fenster.wand]} · ${Math.round(raum.fenster.breite / 10)} cm` : "keins",
    },
    { id: "tuer", titel: "Tür", herkunft: "geschätzt — bitte prüfen", sicher: false, wert: WANDNAME[raum.tuer.wand] },
    { id: "wasser", titel: "Wasseranschluss", herkunft: "im Plan nicht eingezeichnet — geraten", sicher: false, wert: WANDNAME[raum.wasser.wand] },
  ];

  const drehKnopf = (
    <button
      type="button"
      onClick={dreh}
      className="flaeche flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-kohle transition hover:!border-kohle-3"
    >
      <RotateCw size={13} strokeWidth={2.3} />
      Drehen
    </button>
  );

  // Im langen Pruefschritt waeren vier volle Karten zu viel — hier reicht die
  // Skizze als Knopf, der Satz darunter sagt, was gewaehlt ist.
  const drehReihe = (
    <div>
      <div className={`grid gap-2 ${stufen === 2 ? "grid-cols-2" : "grid-cols-4"}`}>
        {Array.from({ length: stufen }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setzeRaum({ ausrichtung: i })}
            aria-pressed={i === raum.ausrichtung}
            aria-label={drehungName(raum.form, i)}
            className={`rounded-[14px] border-2 p-1.5 transition ${
              i === raum.ausrichtung ? "border-kohle bg-papier" : "border-transparent bg-creme hover:bg-creme-2"
            }`}
          >
            <RaumSkizze form={raum.form} ausrichtung={i} />
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-[13px] text-kohle-2">
        {drehungName(raum.form, raum.ausrichtung).replace(/^./, (c) => c.toUpperCase())}
      </p>
    </div>
  );

  const bildTafel = (
    <Karte className="px-4 py-4">
      <Raumbild raum={raum} hervorhebung={hervor} hoehe={226} />
      <p className="mt-3 border-t border-linie-warm pt-3 text-center text-[13px] leading-snug text-kohle-3">
        {hervor
          ? <>Schwarz markiert ist die <strong className="font-semibold text-kohle">{WANDNAME[hervor]}</strong>.</>
          : "Gelb sind die Wände mit Küche, der Tropfen zeigt den Wasseranschluss."}
      </p>
      {geometrie && stufen > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-linie-warm pt-3">
          <span className="min-w-0 text-[13px] leading-snug text-kohle-2">{drehungName(raum.form, raum.ausrichtung)}</span>
          {drehKnopf}
        </div>
      )}
    </Karte>
  );

  const bildStreifen = (
    <div className="sticky top-[57px] z-10 -mx-5 bg-creme/80 px-5 pb-3 pt-2.5 backdrop-blur-xl backdrop-saturate-150 sm:-mx-8 sm:px-8 lg:hidden">
      <div className="flaeche flex items-center gap-3 rounded-[16px] py-2 pl-2 pr-3">
        <div className="w-[96px] shrink-0">
          <Raumbild raum={raum} hervorhebung={hervor} hoehe={66} />
        </div>
        <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-kohle-3">
          {hervor
            ? <>Schwarz: <strong className="font-semibold text-kohle">{WANDNAME[hervor]}</strong></>
            : "Dein Raum von oben"}
        </p>
        {geometrie && stufen > 1 && drehKnopf}
      </div>
    </div>
  );

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
      <header className="sticky top-0 z-20 border-b border-black/[0.055] bg-creme/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-[56px] max-w-[1180px] items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 17 17" aria-hidden="true">
              <rect x="0.75" y="0.75" width="15.5" height="15.5" rx="3" fill="none" strokeWidth="1.4" className="stroke-kohle" />
              <path d="M0.75 5.6 H16.25" strokeWidth="1.4" className="stroke-kohle-3" />
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

      <main className={`mx-auto px-5 pb-20 sm:px-8 ${breit ? "max-w-[1080px] pt-6" : zeigeBild ? "max-w-[1180px] pt-0 lg:pt-7" : "max-w-[720px] pt-6"}`}>
        {geometrie && bildStreifen}
        <div className={zeigeBild ? "lg:grid lg:grid-cols-[minmax(0,1fr)_372px] lg:items-start lg:gap-10" : ""}>
        <div className={zeigeBild ? "min-w-0 pt-5 lg:pt-0" : ""}>
        {istStart && (
          <div className="warm-rein pt-4 text-center sm:pt-10">
            {moegliche[0] && (
              <div className="mx-auto mb-8 w-full max-w-[400px]">
                <Karte className="px-5 py-5">
                  <Kuechenbild typ={typ} variante={moegliche[moegliche.length - 1].variante} zeileId={typ.zeilen[0].id} hoehe={150} mitNamen={false} />
                </Karte>
              </div>
            )}
            <h1 className="gross gross-xl text-[38px] font-bold text-kohle sm:text-[54px]">
              Fangen wir mit deinem Raum an.
            </h1>
            <p className="mx-auto mt-6 max-w-[48ch] text-[17.5px] leading-relaxed text-kohle-2">
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
            <Kopf vor={schrittText} titel="Wie willst du anfangen?" satz="Beides führt zum selben Ergebnis — der eine Weg ist schneller, der andere braucht keinen Plan." />
            <div className="mt-7">
              <GrosseWahl<"fragen" | "plan">
                wert={quelle}
                setze={(q) => setzeQuelle(q)}
                optionen={[
                  { id: "fragen", titel: "Fragen beantworten", satz: "Ein paar kurze Fragen zu deinem Raum. Du brauchst nur einen Zollstock.", bild: <PencilLine size={26} strokeWidth={1.7} className="text-kohle-2" /> },
                  { id: "plan", titel: "Grundriss hochladen", satz: "Hast du einen Wohnungsgrundriss? Wir lesen die Maße heraus, du prüfst sie nach.", bild: <ScanLine size={26} strokeWidth={1.7} className="text-kohle-2" /> },
                ]}
              />
            </div>
          </>
        )}

        {schritt === "upload" && (
          <>
            <Kopf vor={schrittText} titel="Lade deinen Grundriss hoch" satz="PDF oder Bild vom Wohnungsgrundriss. Wir lesen Wandlängen, Fenster und Tür heraus — und zeigen dir danach, was wir verstanden haben." />
            <div className="mt-7">
              <Karte className="px-5 py-8 text-center">
                <input
                  ref={feld}
                  type="file"
                  className="sr-only"
                  onChange={(e) => {
                    const datei = e.target.files?.[0];
                    // Nur Bilder lassen sich hier anzeigen; fuer PDF zeigen wir
                    // einen gezeichneten Beispielplan und sagen es dazu.
                    setPlanBild(datei && datei.type.startsWith("image/") ? URL.createObjectURL(datei) : null);
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
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-linie-warm">
                      <div className="h-full rounded-full bg-kohle transition-[width] duration-500" style={{ width: `${((lauf + 1) / 4) * 100}%` }} />
                    </div>
                    <ol className="mt-4 space-y-2">
                      {["Plan gelesen", "Wände gefunden", "Fenster und Türen geschätzt", "Maße umgerechnet"].map((t, i) => (
                        <li key={t} className={`flex items-center gap-2.5 text-[14.5px] ${i <= lauf ? "text-kohle-2" : "text-kohle-3"}`}>
                          <span className={`w-4 text-right text-[13px] font-semibold ${i < lauf ? "text-salbei" : i === lauf ? "text-kohle" : "text-kohle-3"}`}>
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

        {schritt === "pruefen" && !offen && (
          <>
            <Kopf
              vor={schrittText}
              titel="Haben wir das richtig gelesen?"
              satz="Tipp auf einen Wert, um ihn zu ändern. Wandlängen lesen wir sicher — Fenster und Türen sind geschätzt."
            />
            <div className="mt-7">
              <Planauflage raum={raum} rahmen={rahmen} setzeRahmen={setRahmen} bild={planBild} kinder={<BeispielPlan />} />
              <p className="mt-3 text-[13px] leading-snug text-kohle-3">
                {planBild
                  ? "Dein Plan mit unserer Lesart darüber. Wo im Bild dein Küchenraum liegt, erkennt keine Software sicher — zieh den Rahmen einmal passend, dann sitzt jede Zahl an der richtigen Wand."
                  : "Von einer PDF zeigen wir im Prototyp keine Vorschau, deshalb hier ein gezeichneter Beispielplan. Der Rahmen und alle Maße darauf sind deine echten Angaben."}
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[16px] flaeche">
              {pruefpunkte.map((z, i) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setOffen(z.id)}
                  className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-creme/70 ${
                    i > 0 ? "border-t border-linie-warm" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[15.5px] font-semibold text-kohle">{z.titel}</div>
                    <div className={`mt-0.5 text-[12.5px] ${z.sicher ? "font-medium text-salbei" : "font-semibold text-kohle-2"}`}>
                      {z.herkunft}
                    </div>
                  </div>
                  <div className="ziffern shrink-0 text-right text-[14.5px] text-kohle-2">{z.wert}</div>
                  <ChevronRight size={17} strokeWidth={2.2} className="shrink-0 text-kohle-3" />
                </button>
              ))}
            </div>

            <div className="mt-6">
              <Notiz>
                Warum du das prüfen musst: Wandlängen stehen als Zahlen im Plan, die lesen wir
                sicher. Fenster und Türen sind gezeichnete Symbole — da liegt selbst gute
                Erkennung regelmäßig daneben. Ein Vorschlag auf falschen Öffnungen sähe richtig
                aus, ohne es zu sein.
              </Notiz>
            </div>
          </>
        )}

        {schritt === "pruefen" && offen && (
          <>
            <Kopf
              vor={pruefpunkte.find((z) => z.id === offen)?.herkunft}
              titel={EDIT_TITEL[offen]}
              satz={EDIT_SATZ[offen]}
            />

            {offen === "form" && (
              <div className="mt-7">
                <GrosseWahl<Raumform>
                  wert={raum.form}
                  setze={(f) => setzeRaum({ form: f })}
                  optionen={FORMEN.map((f) => ({ id: f.id, titel: f.titel, satz: f.erklaerung, bild: <RaumSkizze form={f.id} ausrichtung={raum.ausrichtung} /> }))}
                />
                {stufen > 1 && (
                  <Karte className="mt-4 px-5 py-5">
                    <div className="mb-3 text-[14px] text-kohle-2">Und wie liegt sie im Raum?</div>
                    {drehReihe}
                  </Karte>
                )}
              </div>
            )}

            {offen === "breite" && (
              <Karte className="mt-8 px-5 py-7">
                <GrosseZahl wert={raum.breite} setze={(mm) => setzeRaum({ breite: mm })} min={120} max={900} />
              </Karte>
            )}

            {offen === "tiefe" && (
              <Karte className="mt-8 px-5 py-7">
                <GrosseZahl wert={raum.tiefe} setze={(mm) => setzeRaum({ tiefe: mm })} min={150} max={900} />
              </Karte>
            )}

            {offen === "fenster" && (
              <div className="mt-7">
                {raum.fenster ? (
                  <>
                    {wandWahl(raum.fenster.wand, (w) => setzeRaum({ fenster: { ...raum.fenster!, wand: w, von: 0 } }))}
                    <Karte className="mt-4 px-5 py-6">
                      <div className="ziffern mb-4 text-center text-[15px] text-kohle-2">
                        {Math.round(raum.fenster.breite / 10)} cm breit
                      </div>
                      <Schieber
                        wert={raum.fenster.von}
                        max={Math.max(0, wandlaenge(raum, raum.fenster.wand) - raum.fenster.breite)}
                        setze={(mm) => setzeRaum({ fenster: { ...raum.fenster!, von: mm } })}
                        links="am Anfang"
                        rechts="am Ende"
                      />
                    </Karte>
                    <div className="mt-5 flex justify-center">
                      <WKnopf onClick={() => setzeRaum({ fenster: null })}>Es gibt gar kein Fenster</WKnopf>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center">
                    <WKnopf
                      art="primaer"
                      onClick={() => setzeRaum({ fenster: { wand: kuechenwaende(raum)[0], von: 0, breite: 1200 } })}
                    >
                      Doch, es gibt ein Fenster
                    </WKnopf>
                  </div>
                )}
              </div>
            )}

            {offen === "tuer" && (
              <div className="mt-7">
                {wandWahl(raum.tuer.wand, (w) => setzeRaum({ tuer: { ...raum.tuer, wand: w, von: 0 } }))}
                <Karte className="mt-4 px-5 py-6">
                  <Schieber
                    wert={raum.tuer.von}
                    max={Math.max(0, wandlaenge(raum, raum.tuer.wand) - raum.tuer.breite)}
                    setze={(mm) => setzeRaum({ tuer: { ...raum.tuer, von: mm } })}
                    links="am Anfang"
                    rechts="am Ende"
                  />
                </Karte>
              </div>
            )}

            {offen === "wasser" && (
              <div className="mt-7">
                {wandWahl(raum.wasser.wand, (w) => setzeRaum({ wasser: { wand: w, von: 0 } }))}
                <Karte className="mt-4 px-5 py-6">
                  <Schieber
                    wert={raum.wasser.von}
                    max={wandlaenge(raum, raum.wasser.wand)}
                    setze={(mm) => setzeRaum({ wasser: { ...raum.wasser, von: mm } })}
                    links="am Anfang"
                    rechts="am Ende"
                  />
                </Karte>
                <div className="mt-5">
                  <Notiz>Der Anschluss darf auch an einer Wand ohne Küche liegen — dann rechnen wir den Weg dorthin mit.</Notiz>
                </div>
              </div>
            )}
          </>
        )}

        {schritt === "form" && (
          <>
            <Kopf vor={schrittText} titel="An wie vielen Wänden soll die Küche stehen?" satz="Schau dich im Raum um. Du kannst das später jederzeit ändern." />
            <div className="mt-7">
              <GrosseWahl<Raumform>
                wert={raum.form}
                setze={(f) => setzeRaum({ form: f })}
                optionen={FORMEN.map((f) => ({ id: f.id, titel: f.titel, satz: f.erklaerung, bild: <RaumSkizze form={f.id} ausrichtung={0} /> }))}
              />
            </div>
          </>
        )}

        {schritt === "drehung" && (
          <>
            <Kopf
              vor={schrittText}
              titel={raum.form === "u-form" ? "Wohin ist das U offen?" : "Wie liegt die Küche im Raum?"}
              satz="Dreh sie so, wie es bei dir aussieht. Die Zeichnung zeigt dir deinen Raum von oben."
            />
            <div className="mt-7">
              <GrosseWahl<number>
                wert={raum.ausrichtung}
                setze={(a) => setzeRaum({ ausrichtung: a })}
                spalten={2}
                optionen={Array.from({ length: stufen }, (_, i) => {
                  const n = drehungName(raum.form, i);
                  return {
                    id: i,
                    titel: n.charAt(0).toUpperCase() + n.slice(1),
                    bild: <RaumSkizze form={raum.form} ausrichtung={i} />,
                  };
                })}
              />
            </div>
          </>
        )}

        {schritt === "breite" && (
          <>
            <Kopf vor={schrittText} titel="Wie breit ist der Raum?" satz="Die Länge der Hauptwand, von Ecke zu Ecke." />
            <Karte className="mt-8 px-5 py-7">
              <GrosseZahl wert={raum.breite} setze={(mm) => setzeRaum({ breite: mm })} min={120} max={900} />
            </Karte>
          </>
        )}

        {schritt === "tiefe" && (
          <>
            <Kopf vor={schrittText} titel="Und wie tief?" satz="Von der Hauptwand bis zur Wand gegenüber. Daran hängt, wie viel Platz zum Stehen bleibt." />
            <Karte className="mt-8 px-5 py-7">
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
              vor={schrittText}
              titel={`Wie lang wird die Zeile an der ${WANDNAME[zeileWand]}?`}
              satz={`Die Wand ist ${Math.round(wandlaenge(raum, zeileWand) / 10)} cm lang. Wenn eine Tür, ein Heizkörper oder ein Durchgang Platz wegnimmt, trag hier weniger ein.`}
            />
            <Karte className="mt-8 px-5 py-7">
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
            <Kopf vor={schrittText} titel="Gibt es im Raum ein Fenster?" satz="Vor einem Fenster darf nichts Hohes stehen und darüber hängt kein Schrank. Deshalb fragen wir." />
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
            <Kopf vor={schrittText} titel="Wo ist das Fenster?" satz="Erst die Wand, dann die Stelle." />
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
            <Kopf vor={schrittText} titel="Wo ist die Tür?" satz="Eine Tür darf nicht gegen einen Schrank schlagen." />
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
              vor={schrittText}
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
              <Kopf vor={schrittText} titel={info.frage} satz={info.hilfe} />
              <div className="mt-7">
                <GrosseWahl<string>
                  wert={raum.geraete[geraeteArt]}
                  setze={(id) => setzeGeraet(geraeteArt, id)}
                  spalten={geraeteFuer(geraeteArt).length > 2 ? 3 : 2}
                  optionen={geraeteFuer(geraeteArt).map((g) => ({
                    id: g.id,
                    titel: g.name,
                    satz: g.satz,
                    zusatz: g.aufpreis === 0 ? "im Preis" : `${g.aufpreis > 0 ? "+" : "−"}${eur(Math.abs(g.aufpreis))}`,
                    bild: <Geraetebild id={g.id} />,
                  }))}
                />
              </div>
            </>
          );
        })()}

        {schritt === "niveau" && (
          <>
            <Kopf vor={schrittText} titel="Wie soll sie ausgestattet sein?" satz="Das entscheidet über Fronten, Auszüge und Beschläge." />
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
              <h1 className="gross gross-xl text-[36px] font-bold text-kohle sm:text-[52px]">Das ist deine Küche.</h1>
              <p className="mx-auto mt-4 max-w-[48ch] text-[16.5px] text-kohle-2">
                {gewaehlterVorschlag.titel} · {FORMEN.find((f) => f.id === raum.form)!.titel}
              </p>
            </div>

            <Karte className="mt-8 overflow-hidden flaeche-hoch">
              <div className="bg-creme-2/40 px-4 pb-5 pt-5 sm:px-7">
                <div className="mb-5 flex justify-center">
                  <div className="vertieft inline-flex rounded-full bg-creme-2 p-1">
                    {([["raum", "Räumlich"], ["vorn", "Von vorn"], ["umstellen", "Umstellen"]] as const).map(([id, t]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => { setAnsicht(id); setAngefasst(null); }}
                        aria-pressed={ansicht === id}
                        className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition sm:px-4 sm:text-[13.5px] ${
                          ansicht === id
                            ? "bg-gradient-to-b from-white to-[#fbfaf7] text-kohle shadow-[0_1px_2px_rgba(21,20,15,.1),0_3px_8px_-3px_rgba(21,20,15,.22),inset_0_1px_0_#fff]"
                            : "text-kohle-2 hover:text-kohle"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {ansicht === "raum" && (
                  <Kuechenraum typ={typ} variante={gewaehlterVorschlag.variante} hoehe={420} geraeteSchalter />
                )}

                {ansicht === "vorn" && (
                  <div className="space-y-2">
                    {typ.zeilen.map((z) => (
                      <div key={z.id}>
                        {typ.zeilen.length > 1 && (
                          <div className="mb-1 text-[12.5px] font-semibold text-kohle-3">{z.bezeichnung}</div>
                        )}
                        <Kuechenbild typ={typ} variante={gewaehlterVorschlag.variante} zeileId={z.id} hoehe={typ.zeilen.length > 1 ? 200 : 290} />
                      </div>
                    ))}
                  </div>
                )}

                {ansicht === "umstellen" && (
                  <div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[14px] text-kohle-2">
                        {angefasst
                          ? "Jetzt auf den Platz tippen, an den er soll. Mögliche Plätze sind markiert."
                          : "Tipp einen Schrank an — im Raum oder in der Ansicht — dann den Platz, an den er soll."}
                      </p>
                      {eigen && Object.keys(eigen).length > 0 && (
                        <button
                          type="button"
                          onClick={() => { setzeBelegung(grundVorschlag!.strategie, {}); setAngefasst(null); setTauschGrund(null); }}
                          className="flex items-center gap-1.5 text-[13.5px] font-semibold text-kohle-2 transition-colors hover:text-kohle"
                        >
                          <RotateCcw size={13} strokeWidth={2.2} />
                          Wieder wie vorgeschlagen
                        </button>
                      )}
                    </div>

                    <Kuechenraum
                      typ={typ}
                      variante={gewaehlterVorschlag.variante}
                      hoehe={400}
                      unterzeile={false}
                      umstellen={{
                        gewaehlt: angefasst,
                        onWaehle: (zeileId, index) => antippen(zeileId, index),
                        onLeer: () => { setAngefasst(null); setTauschGrund(null); },
                        moeglich: zielMoeglich,
                      }}
                    />

                    {tauschGrund && (
                      <div className="mt-4">
                        <Notiz ton="achtung">{tauschGrund}</Notiz>
                      </div>
                    )}

                    <div className="mt-6 space-y-4">
                      {typ.zeilen.map((z) => {
                        const hin = befundeZeile(raum, typ, z.id, gewaehlterVorschlag.belegung[z.id] ?? []);
                        return (
                          <div key={z.id}>
                            {typ.zeilen.length > 1 && (
                              <div className="mb-1 text-[12.5px] font-semibold text-kohle-3">{z.bezeichnung}</div>
                            )}
                            <Kuechenbild
                              typ={typ}
                              variante={gewaehlterVorschlag.variante}
                              zeileId={z.id}
                              hoehe={typ.zeilen.length > 1 ? 230 : 300}
                              waehlbar
                              gewaehlt={angefasst?.zeile === z.id ? angefasst.index : null}
                              moeglich={angefasst ? (i) => zielMoeglich(z.id, i) : undefined}
                              onWaehle={(i) => antippen(z.id, i)}
                            />
                            {hin.length > 0 && (
                              <div className="mt-2 space-y-1.5">
                                {hin.map((h) => <Notiz key={h} ton="achtung">{h}</Notiz>)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {(() => {
                      const quer = befundeGesamt(raum, typ, gewaehlterVorschlag.belegung);
                      if (quer.length === 0) return null;
                      return (
                        <div className="mt-4 space-y-1.5">
                          {quer.map((h) => <Notiz key={h} ton="achtung">{h}</Notiz>)}
                        </div>
                      );
                    })()}

                    <p className="mt-5 text-[12.5px] leading-relaxed text-kohle-3">
                      Getauscht wird immer Platz gegen Platz — so bleibt die Summe der Breiten
                      genau deine Wandlänge. Preis, Hängeschränke und Arbeitsfläche rechnen wir
                      sofort neu, und wenn eine Regel kippt, steht es direkt darunter.
                    </p>
                  </div>
                )}
              </div>
              <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
                <div>
                  <div className="vorzeile">Komplett, mit Geräten und Montage</div>
                  <div className="gross ziffern mt-2 text-[44px] font-bold leading-none tracking-[-0.04em] text-kohle">{eur(gewaehlterVorschlag.preis)}</div>
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
                  <div className="vorzeile">{a}</div>
                  <div className="gross ziffern mt-2 text-[26px] font-bold leading-none text-kohle">{b}</div>
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

        {schritt === "pruefen" && offen && (
          <div className="mt-9 flex items-center justify-between gap-4">
            <WKnopf art="klar" onClick={() => setOffen(null)}>
              <ArrowLeft size={16} strokeWidth={2.2} />
              Zur Übersicht
            </WKnopf>
            <WKnopf art="primaer" gross onClick={() => setOffen(null)}>
              Passt so
              <Check size={18} strokeWidth={2.4} />
            </WKnopf>
          </div>
        )}

        {!istStart && !(schritt === "pruefen" && offen) && (
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
        </div>
        <aside className="hidden lg:sticky lg:top-[80px] lg:block">{geometrie ? bildTafel : null}</aside>
        </div>
      </main>
    </div>
  );
}
