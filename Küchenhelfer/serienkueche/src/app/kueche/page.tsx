"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, FileUp, PencilLine, Printer, RotateCcw, RotateCw, ScanLine } from "lucide-react";
import { modul } from "@/data/module";
import { HOCH_H, OS_UK, rolleVon, ROLLE_NAME } from "@/lib/masse";
import { ARTEN, FOTO_QUELLE, FOTOS_LIZENZIERT, GERAETEFOTO_HINWEIS, geraet, geraeteFuer, markenFuer, MWST, PREISSTAND_GERAETE, QUELLEN, type GeraeteArt } from "@/data/geraete";
import { brutto, eur } from "@/lib/berechnung";
import {
  alleVorschlaege, alsKuechentyp, angleichen, ausBelegung, befundeZeile, drehungen, drehungName, FORMEN, kuechenwaende,
  planeKueche,
  austauschbar, befundeGesamt, ersetzePlan, istStauraum, tauschMoeglich, tauschPlan,
  pruefeAngaben, wandlaenge, WANDNAME, WANDNAME_DAT, zeilenBereich,
  type Raumform, type Strategie, type Vorschlag, type WandId,
} from "@/lib/planer";
import { herkunftVon, HERKUNFT_TEXT, schrittFolge, useKueche, type Feld, type Herkunft, type SchrittId } from "@/store/kueche";
import { Kuechenbild, Raumbild } from "@/components/warm/Kuechenbild";
import { Geraetebild, Schrankbild } from "@/components/warm/Geraetebild";

import { GrosseWahl, GrosseZahl, Karte, Notiz, Schieber, WKnopf } from "@/components/warm/Kit";
import { Massleiste } from "@/components/warm/Massleiste";
import { baueUnterlagen } from "@/lib/unterlagen";
import { FOTOS, GERAETEFOTOS, fotoUrl } from "@/data/fotos";
import NextImage from "next/image";
import { BeispielPlan, Planauflage, RAHMEN_START, type Rahmen } from "@/components/warm/Planauflage";
import { melde } from "@/components/ui/kit";

const ALLE_WAENDE: WandId[] = ["haupt", "links", "rechts", "gegenueber"];

/** Welche Rolle im Raum zu welcher Geräteart gehört — damit sich beim
    Aussuchen genau das Gerät im räumlichen Bild hervorheben lässt. */
const ART_ZU_ROLLE: Record<GeraeteArt, string> = {
  kuehlschrank: "kuehlschrank",
  kochfeld: "herd",
  backofen: "backofen",
  spuelmaschine: "spuelmaschine",
  dunstabzug: "dunstabzug",
};

/** An welchem Schrank das Gerät hängt. Steht keiner davon im Plan, sagen wir
    das auch, statt auf eine gelbe Markierung zu zeigen, die es nicht gibt. */
const ART_ZU_MODUL: Record<GeraeteArt, string[]> = {
  kuehlschrank: ["HK600", "KS600"],
  kochfeld: ["KF600"],
  backofen: ["HB600", "KF600"],
  spuelmaschine: ["GS600", "GS450"],
  dunstabzug: ["KF600"],
};

const ART_AKK: Record<GeraeteArt, string> = {
  kuehlschrank: "der Kühlschrank",
  kochfeld: "das Kochfeld",
  backofen: "der Backofen",
  spuelmaschine: "die Spülmaschine",
  dunstabzug: "der Dunstabzug",
};

/** Kurzer Name eines Moduls für die Positionsliste. */
function modulName(id: string): string {
  const r = ROLLE_NAME[rolleVon(id)];
  if (r) return r;
  if (id.startsWith("PBX:") || modul(id).kategorie === "blende") return "Passleiste";
  return modul(id).bezeichnung;
}

/** Die Legende unter einer Zeichnung: Nummer und Name, alles auf einer Linie. */
function Positionsliste({ ids, ab }: { ids: string[]; ab: number }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[12.5px] leading-none text-kohle-2">
      {ids.map((id, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="ziffern flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-linie-stark px-1 text-[10.5px] font-bold text-kohle">
            {ab + i}
          </span>
          {modulName(id)}
        </span>
      ))}
    </div>
  );
}

/** Was beim Öffnen eines einzelnen Prüfpunkts oben steht. */
/** Die Frage je Schritt — fuer die Ansage an Vorlesesoftware. */
const TITEL_FUER: Record<string, string> = {
  start: "Fangen wir mit deinem Raum an",
  quelle: "Wie willst du anfangen?",
  upload: "Lade deinen Grundriss hoch",
  pruefen: "Haben wir das richtig gelesen?",
  form: "An wie vielen Wänden soll die Küche stehen?",
  drehung: "Wie liegt die Küche im Raum?",
  breite: "Wie breit ist der Raum?",
  tiefe: "Und wie tief?",
  fensterJa: "Gibt es im Raum ein Fenster?",
  fenster: "Wo ist das Fenster?",
  tuer: "Wo ist die Tür?",
  wasser: "Wo kommt das Wasser aus der Wand?",
  "geraet-kuehlschrank": "Welchen Kühlschrank?",
  "geraet-kochfeld": "Worauf kochst du?",
  "geraet-backofen": "Welchen Backofen?",
  "geraet-spuelmaschine": "Spülmaschine?",
  "geraet-dunstabzug": "Und der Dunstabzug?",
  niveau: "Wie soll sie ausgestattet sein?",
  vorschlaege: "Das passt in deinen Raum",
  ergebnis: "Das ist deine Küche",
  unterlagen: "Das geht mit raus",
};

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

function Kopf({
  titel, satz, vor, anker,
}: {
  titel: string; satz?: string; vor?: string;
  /** Damit der Fokus nach einem Schrittwechsel hierher wandert. */
  anker?: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="warm-rein">
      {vor && <div className="vorzeile mb-3">{vor}</div>}
      <h1 ref={anker} tabIndex={-1} className="gross text-[31px] font-bold leading-[1.05] text-kohle outline-none sm:text-[40px]">{titel}</h1>
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
        <Kuechenbild typ={typ} variante={v.variante} zeileId={ersteZeile} hoehe={150} />
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
            {v.auchAls && (
              <div className="mt-1 text-[13px] text-kohle-3">
                In diesem Raum {v.auchAls.length > 1 ? "kommen auch" : "kommt auch"} „
                {v.auchAls.join("“ und „")}“ auf denselben Plan — der Platz lässt keine andere
                Aufteilung zu.
              </div>
            )}
          </div>
          <div className="gross shrink-0 text-right text-[23px] font-bold leading-none text-kohle">{eur(brutto(v.preis))}</div>
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


/** Ein nummerierter Abschnitt der Unterlagen. */
function Abschnitt({ nr, titel, satz, children }: { nr: string; titel: string; satz?: string; children: ReactNode }) {
  return (
    <section className="mt-12 break-inside-avoid border-t border-linie-warm pt-7">
      <div className="flex items-baseline gap-3">
        <span className="vorzeile ziffern">{nr}</span>
        <h2 className="gross text-[22px] font-bold leading-tight text-kohle sm:text-[26px]">{titel}</h2>
      </div>
      {satz && <p className="mt-2 text-[14px] text-kohle-2">{satz}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Schlichte Tabelle mit Haarlinien — lesbar am Bildschirm und auf Papier. */
function Tabelle({
  kopf, zeilen, rechts = [], fuss,
}: {
  kopf: string[];
  zeilen: string[][];
  /** Spalten, die rechtsbündig stehen. */
  rechts?: number[];
  fuss?: string[];
}) {
  const aus = (i: number) => (rechts.includes(i) ? "text-right" : "text-left");
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-[13.5px]">
        <thead>
          <tr>
            {kopf.map((k, i) => (
              <th key={k} className={`border-b border-kohle-3 pb-2 font-semibold text-kohle-3 ${aus(i)}`}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z, j) => (
            <tr key={j}>
              {z.map((c, i) => (
                <td key={i} className={`border-b border-linie-warm py-2 align-top text-kohle-2 ${aus(i)} ${rechts.includes(i) ? "ziffern whitespace-nowrap" : ""} ${i === 0 ? "ziffern pr-3 text-kohle" : "pr-3"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {fuss && (
          <tfoot>
            <tr>
              {fuss.map((c, i) => (
                <td key={i} className={`pt-2 font-semibold text-kohle ${aus(i)} ${rechts.includes(i) ? "ziffern" : ""}`}>{c}</td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

export default function Kuechenplaner() {
  const { raum, quelle, erkannt, schritt, gewaehlt, eigeneBelegung, setzeRaum, setzeGeraet, setzeNutz, setzeQuelle, uebernehmeErkennung, geheZu, weiter, zurueck, waehle, setzeBelegung, umstellungVerworfen, quittiereVerworfen, beruehrt, planArt, merkePlanArt, stand, standGesehen, quittiereStand, fremdstand, quittiereFremdstand, neu } = useKueche();
  const [details, setDetails] = useState(false);
  const [lauf, setLauf] = useState<number | null>(null);
  const [ansicht, setAnsicht] = useState<"raum" | "vorn" | "umstellen">("raum");
  /** Beim Umstellen angefasster Schrank: Zeile und Platz darin. */
  const [angefasst, setAngefasst] = useState<{ zeile: string; index: number } | null>(null);
  /** Warum der letzte Tausch nicht ging. */
  const [tauschGrund, setTauschGrund] = useState<string | null>(null);
  /** Markenfilter, je Geräteart gemerkt. null = alle.
      Ein Filter vom Kühlschrank darf nicht stillschweigend die Auswahl beim
      Kochfeld verengen — eine durchgehende Markenvorliebe soll man aber auch
      nicht fünfmal neu klicken müssen, deshalb je Art. */
  const [marken, setMarken] = useState<Partial<Record<GeraeteArt, string | null>>>({});
  /** Im Prüfschritt geöffneter Einzelwert. null heißt Übersicht. */
  const [offen, setOffen] = useState<string | null>(null);
  const [planBild, setPlanBild] = useState<string | null>(null);
  /** Laufende Uhr des nachgestellten Erkennungslaufs. */
  const laufUhr = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Laufnummer: nur der juengste Lauf darf den Stand noch anfassen. */
  const laufNr = useRef(0);
  /** Zuletzt erzeugte Objekt-Adresse, damit sie freigegeben werden kann. */
  const bildUrl = useRef<string | null>(null);

  // Verlaesst jemand die Seite mitten im Lauf, darf er nicht nachtraeglich
  // den Schritt umstellen — und die Objekt-Adresse muss zurueck.
  useEffect(() => () => {
    laufNr.current += 1;
    if (laufUhr.current) clearTimeout(laufUhr.current);
    if (bildUrl.current) URL.revokeObjectURL(bildUrl.current);
  }, []);
  const [rahmen, setRahmen] = useState<Rahmen>(RAHMEN_START);
  const feld = useRef<HTMLInputElement>(null);

  // Wer den Pruefschritt verlaesst, soll beim Zurueckkommen die Uebersicht
  // sehen und nicht in einem alten Einzelwert stehen.
  useEffect(() => { if (schritt !== "pruefen") setOffen(null); }, [schritt]);

  const folge = schrittFolge(raum, quelle);
  const pos = Math.max(0, folge.indexOf(schritt));
  const typ = useMemo(() => alsKuechentyp(raum), [raum]);
  const waende = kuechenwaende(raum);
  const brauchtPlan = schritt === "vorschlaege" || schritt === "ergebnis" || schritt === "unterlagen" || schritt === "start";
  const vorschlaege = useMemo(() => (brauchtPlan ? alleVorschlaege(raum) : []), [raum, brauchtPlan]);
  const moegliche = vorschlaege.filter((v) => v.moeglich);
  // Was als eigene Karte dasteht: Doppelungen nennt die verbliebene Karte.
  const karten = moegliche.filter((v) => !v.gleichWie);
  const empfehlung = [...karten].sort(
    (a, b) => b.arbeitsflaeche - a.arbeitsflaeche || a.wegZumWasser - b.wegZumWasser || a.preis - b.preis,
  )[0];
  // Eine früher gewählte Strategie kann inzwischen in einer anderen
  // aufgegangen sein — dann gilt die, in der sie aufging.
  const gewaehltRoh = moegliche.find((v) => v.strategie === gewaehlt);
  const grundVorschlag =
    (gewaehltRoh?.gleichWie
      ? karten.find((v) => v.strategie === gewaehltRoh.gleichWie)
      : gewaehltRoh) ?? empfehlung;

  /* Eine von Hand umgestellte Anordnung wird vollständig gespeichert und
     vollständig angezeigt. Vorher lagen nur die geänderten Zeilen im Zustand
     und wurden über einen frisch gerechneten Plan gelegt — dabei brachte der
     frische Plan seine eigene Spüle mit, und die Küche hatte zwei davon.
     Preis, Hängeschränke und Hinweise rechnen wir trotzdem neu, sonst
     stünden beim Umstellen falsche Zahlen da. */
  /* Der Schlüssel kann wandern: geht eine Strategie in einer anderen auf
     (gleichWie), liest die Seite unter deren Namen, gespeichert ist die
     Anordnung aber noch unter dem alten. Beide Namen meinen denselben Plan,
     also gelten beide. */
  const eigenerSchluessel = useMemo(() => {
    if (!grundVorschlag) return null;
    if (eigeneBelegung[grundVorschlag.strategie]) return grundVorschlag.strategie;
    const aufgegangen = vorschlaege.find(
      (v) => v.gleichWie === grundVorschlag.strategie && eigeneBelegung[v.strategie],
    );
    return aufgegangen?.strategie ?? grundVorschlag.strategie;
  }, [grundVorschlag, vorschlaege, eigeneBelegung]);
  const eigen = eigenerSchluessel ? eigeneBelegung[eigenerSchluessel] : undefined;
  const gewaehlterVorschlag = useMemo(() => {
    if (!grundVorschlag || !eigen) return grundVorschlag;
    return ausBelegung(raum, typ, grundVorschlag.strategie, eigen);
  }, [grundVorschlag, eigen, raum, typ]);
  // Was bei der angezeigten Strategie verloren ging, falls etwas verloren ging.
  const verworfenGrund = eigenerSchluessel ? umstellungVerworfen[eigenerSchluessel] : undefined;

  // Waehrend man Geraete aussucht, steht die Kueche daneben im Raum. Dafuer
  // genuegt ein einziger Plan — die ganze Auswahl zu rechnen waere Verschwendung.
  const geraeteArtJetzt = schritt.startsWith("geraet-") ? (schritt.slice(7) as GeraeteArt) : null;
  const brauchtVorschau = geraeteArtJetzt !== null || schritt === "fenster" || schritt === "tuer" || schritt === "wasser";
  const vorschau = useMemo(
    () => (brauchtVorschau ? planeKueche(raum, "arbeiten") : null),
    [brauchtVorschau, raum],
  );

  // "Neu" wirft fuenf Minuten Arbeit weg. Das darf kein einzelner Tipp auf
  // ein 13-Pixel-Symbol sein — der erste Tipp fragt, der zweite loescht.
  const [neuGefragt, setNeuGefragt] = useState(false);
  useEffect(() => {
    if (!neuGefragt) return;
    const uhr = setTimeout(() => setNeuGefragt(false), 4000);
    return () => clearTimeout(uhr);
  }, [neuGefragt]);
  const neuStarten = () => {
    if (!neuGefragt) { setNeuGefragt(true); return; }
    laufNr.current += 1;
    if (laufUhr.current) clearTimeout(laufUhr.current);
    if (bildUrl.current) URL.revokeObjectURL(bildUrl.current);
    bildUrl.current = null;
    setLauf(null);
    setPlanBild(null);
    setRahmen(RAHMEN_START);
    setOffen(null);
    setAngefasst(null);
    setNeuGefragt(false);
    neu();
  };

  // Im Grundrissweg gibt es keinen Schritt "breite" — dort fuehrt der Weg
  // zurueck auf die Pruefseite, mit der Breite schon aufgeklappt.
  /**
   * Hinweis auf einen Stand aus einer frueheren Sitzung.
   *
   * Wer wiederkommt, landete mitten in seiner alten Planung, ohne dass ihm
   * jemand sagte, dass es seine alte ist. Erst nach dem Mounten rendern,
   * sonst weicht der Server-Stand vom Browser-Stand ab.
   */
  const [montiert, setMontiert] = useState(false);
  useEffect(() => { setMontiert(true); }, []);

  /**
   * Nach jedem Schrittwechsel an den Anfang und auf die neue Frage.
   *
   * Die ganze Strecke ist eine Seite, es gibt keinen Routenwechsel: mit
   * Vorlesesoftware hoerte man nach "Weiter" nichts, der Fokus stand weiter
   * auf dem Knopf, waehrend der Inhalt darueber komplett getauscht war. Und
   * auf dem Handy blieb die Scrollposition stehen — man landete unten in der
   * Fusszeile des naechsten Schritts.
   */
  const ueberschrift = useRef<HTMLHeadingElement>(null);
  const ersterLauf = useRef(true);
  useEffect(() => {
    if (ersterLauf.current) { ersterLauf.current = false; return; }
    const sanft = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: sanft ? "smooth" : "auto" });
    ueberschrift.current?.focus({ preventScroll: true });
  }, [schritt]);
  const standText = (() => {
    if (!montiert || !stand || stand <= standGesehen || schritt === "start") return null;
    const alter = Date.now() - stand;
    if (alter < 1000 * 60 * 30) return null;
    const d = new Date(stand);
    const heute = new Date();
    const gleicherTag = d.toDateString() === heute.toDateString();
    return gleicherTag
      ? `von heute, ${d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr`
      : `vom ${d.toLocaleDateString("de-DE", { day: "2-digit", month: "long" })}`;
  })();

  /** Das Formular fuer die Anfrage. Vorher endete der staerkste Knopf der
      Seite in einer Meldung, die nach dreieinhalb Sekunden verschwand — ohne
      Kontakt kommt aus dem ganzen Weg kein einziger Interessent an. */
  const [anfrage, setAnfrage] = useState(false);
  const [abgeschickt, setAbgeschickt] = useState(false);
  const [kontakt, setKontakt] = useState({ name: "", mail: "", telefon: "", wann: "", text: "", ok: false });
  const anfrageFeld = useRef<HTMLInputElement>(null);
  const kontaktVoll = kontakt.name.trim().length > 1 && /.+@.+\..+/.test(kontakt.mail) && kontakt.ok;

  /** Ist ueberhaupt ein Backofen gewaehlt? */
  const ofenDa = geraet(raum.geraete.backofen).breite > 0;

  const masseAendern = () => {
    if (quelle === "plan") { geheZu("pruefen"); setOffen("breite"); }
    else geheZu("breite");
  };

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
    setzeBelegung(eigenerSchluessel!, { ...gewaehlterVorschlag.belegung, ...plan.belegung });
    setAngefasst(null);
    setTauschGrund(null);
  };

  /** Fortlaufende Positionsnummern über alle Zeilen hinweg. */
  const nummerAb = (zeileId: string) => {
    let n = 1;
    for (const z of typ.zeilen) {
      if (z.id === zeileId) return n;
      n += (gewaehlterVorschlag?.belegung[z.id] ?? []).length;
    }
    return n;
  };

  const zielMoeglich = (zeileId: string, index: number) =>
    !!angefasst && !!gewaehlterVorschlag &&
    tauschMoeglich(typ, gewaehlterVorschlag.belegung, angefasst, { zeile: zeileId, index });
  const hinweise = pruefeAngaben(raum);

  /**
   * Woher ein Wert stammt — als Text und als Vertrauensstufe.
   *
   * Vorher standen hier feste Saetze: "aus dem Plan gelesen" auch ueber
   * Standardwerten, die kein Plan geliefert hat, und unveraendert, nachdem
   * der Nutzer den Wert selbst eingetragen hatte.
   */
  const woher = (feld: Feld): { herkunft: string; sicher: boolean; stufe: Herkunft } => {
    const h = herkunftVon(feld, erkannt, beruehrt);
    return { herkunft: HERKUNFT_TEXT[h], sicher: h === "plan", stufe: h };
  };

  // Orientierung: wo im Ablauf stehe ich gerade. Ohne Start- und Ergebnisbild,
  // die sind keine Fragen.
  // Keine Gesamtzahl mehr: sie haengt von der Raumform und davon ab, ob es
  // ein Fenster gibt. Wer "Ueber Eck" waehlt, sah die Ziellinie von 17 auf 19
  // wegrutschen. Der Balken oben zeigt den Fortschritt, hier steht, woran man
  // gerade arbeitet.
  const ABSCHNITT: Array<[string, (id: string) => boolean]> = [
    // Der Auffangfall unten heisst "Dein Ergebnis". Ohne eigenen Eintrag fiel
    // die Startseite hinein, und Vorlesesoftware sagte dort "Dein Ergebnis:
    // Fangen wir mit deinem Raum an".
    ["Küche planen", (id) => id === "start"],
    ["Dein Raum", (id) => ["quelle", "upload", "pruefen", "form", "drehung", "breite", "tiefe", "fensterJa", "fenster", "tuer", "wasser"].includes(id) || id.startsWith("zeile-")],
    ["Deine Geräte", (id) => id.startsWith("geraet-")],
    ["Ausstattung", (id) => id === "niveau"],
    ["Dein Ergebnis", () => true],
  ];
  const schrittText = ABSCHNITT.find(([, passt]) => passt(schritt))![0];

  /* Die vier Stationen mit ihren echten Spannen. Sie kommen aus derselben
     Folge, durch die der Nutzer laeuft — nicht aus einer zweiten Liste, die
     irgendwann auseinanderlaeuft. "Kueche planen" ist die Startseite und
     zaehlt nicht mit. */
  const stationen = useMemo(() => {
    const zaehlbar: SchrittId[] = folge.filter((id) => id !== "start");
    const bisHier = zaehlbar.indexOf(schritt);
    /* Jeder Schritt gehoert zur ERSTEN passenden Station, so wie es die
       Einzelzuordnung oben auch macht. Filtert jede Station fuer sich, dann
       schluckt der Auffangfall "Dein Ergebnis" alle achtzehn. */
    const stationVon = (id: SchrittId) => ABSCHNITT.findIndex(([, passt]) => passt(id));
    const KURZ = ["Raum", "Geräte", "Ausstattung", "Ergebnis"];
    return ABSCHNITT.slice(1).map(([name], nr) => {
      const meine = zaehlbar.filter((id) => stationVon(id) === nr + 1);
      const erledigt = meine.filter((id) => zaehlbar.indexOf(id) < Math.max(0, bisHier)).length;
      const jetzt = meine.includes(schritt);
      const erster = meine[0];
      return {
        name,
        kurz: KURZ[nr] ?? name,
        gesamt: meine.length,
        erledigt: jetzt ? erledigt : erledigt + (meine.length && zaehlbar.indexOf(meine[meine.length - 1]) < bisHier ? 1 : 0),
        jetzt,
        // Zurueckspringen ja, vorspringen nein: was noch nicht beantwortet
        // ist, laesst sich nicht ueberspringen.
        hin: !jetzt && erster && zaehlbar.indexOf(erster) < bisHier ? () => geheZu(erster) : undefined,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folge, schritt]);

  const istStart = schritt === "start";
  const istErgebnis = schritt === "ergebnis";
  const istUnterlagen = schritt === "unterlagen";
  /* "Datei hierher ziehen" stand da, der Abwurf wurde aber nirgends
     angenommen — der Browser oeffnete die Datei daraufhin selbst und verliess
     den Planer. Derselbe Lauf gehoert an beide Wege, also steht er hier. */
  const [ueberDerKarte, setUeberDerKarte] = useState(false);
  const starteErkennung = (datei?: File) => {
                    // Nur Bilder lassen sich hier anzeigen; fuer PDF zeigen wir
                    // einen gezeichneten Beispielplan und sagen es dazu.
                    if (bildUrl.current) URL.revokeObjectURL(bildUrl.current);
                    bildUrl.current = datei && datei.type.startsWith("image/") ? URL.createObjectURL(datei) : null;
                    setPlanBild(bildUrl.current);
                    merkePlanArt(datei ? (datei.type.startsWith("image/") ? "bild" : "pdf") : null);
                    // Ein zweiter Upload darf den ersten Lauf nicht
                    // weiterlaufen lassen — sonst zaehlen zwei Laeufe hoch.
                    if (laufUhr.current) clearTimeout(laufUhr.current);
                    const meiner = ++laufNr.current;
                    setLauf(0);
                    let i = 0;
                    const weiterLauf = () => {
                      if (meiner !== laufNr.current) return;
                      i += 1;
                      if (i < 4) { setLauf(i); laufUhr.current = setTimeout(weiterLauf, 620); }
                      else {
                        laufUhr.current = null;
                        setLauf(null);
                        uebernehmeErkennung();
                        // Gezielt zum Pruefschritt, nicht "einen weiter": wer
                        // waehrend des Laufs selbst blaettert, landete sonst
                        // eine Station zu weit und musste zurueck.
                        geheZu("pruefen");
                      }
                    };
                    laufUhr.current = setTimeout(weiterLauf, 620);
  };

  const istVorschlaege = schritt === "vorschlaege";

  /* "Mit dem Tipp weiter" hat die Wahl bisher nicht festgeschrieben: gewaehlt
     blieb null, und angezeigt wurde einfach die jeweilige Empfehlung. Das
     geht gut, solange sich nichts aendert — aendert der Nutzer danach den
     Raum und die Empfehlung kippt auf eine andere Strategie, steht ploetzlich
     ein anderer Plan da, und eine Umstellung von Hand liegt unter einem
     Schluessel, den die Seite nicht mehr liest. */
  const weiterMitTipp = () => {
    if (istVorschlaege && !gewaehlt && empfehlung) waehle(empfehlung.strategie);
    weiter();
  };

  const breit = istErgebnis || istVorschlaege || istUnterlagen;

  const zeileWand = schritt.startsWith("zeile-") ? (schritt.slice(6) as WandId) : null;
  const geraeteArt = schritt.startsWith("geraet-") ? (schritt.slice(7) as GeraeteArt) : null;
  /**
   * Was ein Gerät am Preis der ganzen Küche ändert.
   *
   * Vorher stand dort der Aufpreis des Geräts gegenüber dem billigsten
   * derselben Art — und der hat mit dem Küchenpreis wenig zu tun. Ein
   * Kühlschrank in voller Höhe braucht einen Hochschrank für 428 EUR statt
   * eines Unterschranks für 238, nimmt dafür Arbeitsplatte weg und lässt
   * einen Hängeschrank entfallen. Das sind Hunderter, die unter einem Schild
   * mit "+96 EUR" verschwanden. Jetzt wird jede Möglichkeit einmal
   * durchgeplant und die Differenz zur jetzigen Wahl angezeigt.
   */
  const geraeteWirkung = useMemo(() => {
    if (!geraeteArt) return null;
    const strategie: Strategie = gewaehlt ?? "arbeiten";
    const jetzt = planeKueche(raum, strategie);
    // Was an der Küche ohne die Geräte hängt — daran erklärt sich, warum ein
    // billigeres Gerät die Küche teurer machen kann.
    const moebel = (v: Vorschlag) => v.kosten.gesamt - v.kosten.geraete;
    const aus = new Map<string, { delta: number | null; passt: boolean; moebel: number; wand: number }>();
    const jetztGeraet = geraet(raum.geraete[geraeteArt]);
    for (const g of geraeteFuer(geraeteArt)) {
      if (g.id === raum.geraete[geraeteArt]) { aus.set(g.id, { delta: 0, passt: jetzt.moeglich, moebel: 0, wand: 0 }); continue; }
      const probe = planeKueche(
        angleichen({ ...raum, geraete: { ...raum.geraete, [geraeteArt]: g.id } }),
        strategie,
      );
      /* Passt die aktuelle Wahl selbst nicht in den Raum, gibt es keinen
         Vergleichswert — aber die Frage, die der Nutzer dann hat, ist eine
         andere: womit geht es denn? Vorher trug in genau dieser Lage jede
         Karte das Schild "passt nicht in den Raum", auch die, die passt. */
      const geht = probe.moeglich && jetzt.moeglich;
      aus.set(g.id, {
        delta: geht ? brutto(probe.preis) - brutto(jetzt.preis) : null,
        passt: probe.moeglich,
        moebel: geht ? brutto(moebel(probe)) - brutto(moebel(jetzt)) : 0,
        wand: g.breite - jetztGeraet.breite,
      });
    }
    return aus;
  }, [geraeteArt, raum, gewaehlt]);

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
  // Auf diesen drei Schritten steht der Grundriss gross in der Hauptspalte —
  // daneben nochmal derselbe kleine waere doppelt gemoppelt.
  const planSchritt = schritt === "fenster" || schritt === "tuer" || schritt === "wasser";
  const geometrie = zeigeBild && !geraeteArt && !planSchritt && schritt !== "niveau" && schritt !== "quelle" && schritt !== "upload";
  const stufen = drehungen(raum.form);
  const dreh = () => setzeRaum({ ausrichtung: (raum.ausrichtung + 1) % stufen });

  // Die Uebersicht im Pruefschritt: ein Punkt je Angabe, mit Herkunft.
  const pruefpunkte = [
    {
      id: "form",
      titel: "Form der Küche",
      herkunft: "sagt der Plan nicht — entscheidest du",
      sicher: false,
      stufe: "annahme" as Herkunft,
      wert: FORMEN.find((f) => f.id === raum.form)!.titel,
    },
    { id: "breite", titel: "Raumbreite", ...woher("breite"), wert: `${Math.round(raum.breite / 10)} cm` },
    { id: "tiefe", titel: "Raumtiefe", ...woher("tiefe"), wert: `${Math.round(raum.tiefe / 10)} cm` },
    {
      id: "fenster",
      titel: "Fenster",
      ...woher("fenster"),
      wert: raum.fenster ? `${WANDNAME[raum.fenster.wand]} · ${Math.round(raum.fenster.breite / 10)} cm` : "keins",
    },
    { id: "tuer", titel: "Tür", ...woher("tuer"), wert: WANDNAME[raum.tuer.wand] },
    { id: "wasser", titel: "Wasseranschluss", ...woher("wasser"), wert: WANDNAME[raum.wasser.wand] },
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

  /* Der eigene Grundriss bleibt unter der Skizze stehen, solange die Sitzung
     laeuft. Ohne ihn ist die Skizze ein leeres Rechteck, und die Frage
     "wo sitzt das Fenster" laesst sich nicht beantworten, sondern nur raten. */
  const untergrund = quelle === "plan" && planBild ? { bild: planBild, rahmen } : null;

  const bildTafel = (
    <Karte className="px-4 py-4">
      <Raumbild raum={raum} hervorhebung={hervor} hoehe={226} untergrund={untergrund} />
      <p className="mt-3 border-t border-linie-warm pt-3 text-center text-[13px] leading-snug text-kohle-3">
        {hervor
          ? <>Schwarz markiert ist die <strong className="font-semibold text-kohle">{WANDNAME[hervor]}</strong>.</>
          : "Die hellen Bänder sind die Wände mit Küche, der Tropfen zeigt den Wasseranschluss."}
      </p>
      {geometrie && stufen > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-linie-warm pt-3">
          <span className="min-w-0 text-[13px] leading-snug text-kohle-2">{drehungName(raum.form, raum.ausrichtung)}</span>
          {drehKnopf}
        </div>
      )}
    </Karte>
  );

  // Das Geraet, das gerade gewaehlt wird, im Raum hervorgehoben: man sieht,
  // wohin es kommt, und nicht nur eine Liste von Modellen.
  // Neben dem Grundriss der Raum von innen: oben zieht man die Stelle hin,
  // daneben sieht man, was daraus wird.
  /* Passt nichts in den Raum, zeichnete die Vorschau einen leeren Raum unter
     die Zeile "So sieht der Raum mit dieser Kueche aus" — die Kueche war die
     leere Menge. Dort gehoert der Grund hin, nicht ein Bild. */
  const vorschauLeer = vorschau && !vorschau.moeglich ? (
    <Karte className="px-4 py-6">
      <Notiz ton="achtung">{vorschau.grund}</Notiz>
      <div className="mt-4 flex justify-center">
        <WKnopf onClick={masseAendern}>Maße ändern</WKnopf>
      </div>
    </Karte>
  ) : null;

  const raumTafel = planSchritt && vorschauLeer ? vorschauLeer : planSchritt && vorschau ? (
    <Karte className="overflow-hidden p-0">
      <Kuechenraum typ={typ} variante={vorschau.variante} hoehe={300} unterzeile={false} ofenGewaehlt={ofenDa} />
      <p className="border-t border-linie-warm px-4 py-3 text-center text-[13px] leading-snug text-kohle-3">
        So sieht der Raum mit dieser Küche aus — die Zeichnung links bestimmt, wo was steht.
      </p>
    </Karte>
  ) : null;

  const geraetTafel = geraeteArt && vorschauLeer ? vorschauLeer : geraeteArt && vorschau ? (
    <Karte className="overflow-hidden p-0">
      <Kuechenraum
        typ={typ}
        variante={vorschau.variante}
        hoehe={288}
        unterzeile={false}
        ofenGewaehlt={ofenDa}
        betont={ART_ZU_ROLLE[geraeteArt]}
      />
      <p className="border-t border-linie-warm px-4 py-3 text-center text-[13px] leading-snug text-kohle-3">
        {Object.values(vorschau.belegung).flat().some((id) => ART_ZU_MODUL[geraeteArt].includes(id))
          ? <>Gelb markiert ist der Platz, an dem <strong className="font-semibold text-kohle">{ART_AKK[geraeteArt]}</strong> steht.</>
          : "Deine Küche im Raum — dieses Gerät ist darin noch nicht vorgesehen."}
      </p>
    </Karte>
  ) : null;

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

  /** Der Grundriss gross und zum Anfassen: den Punkt an die Stelle ziehen,
      an der das Fenster, die Tür oder der Anschluss wirklich sitzt. Der
      Regler darunter bleibt für die letzten Zentimeter. */
  const ziehKarte = (was: "fenster" | "tuer" | "wasser", setze: (mm: number) => void) => (
    <Karte className="mt-4 overflow-hidden px-3 pb-3 pt-4">
      <Raumbild raum={raum} hervorhebung={hervor} hoehe={320} ziehen={{ was, setze }} untergrund={untergrund} />
      <p className="mt-2 border-t border-linie-warm pt-3 text-center text-[13px] leading-snug text-kohle-3">
        {untergrund
          ? "Dein Grundriss liegt darunter — zieh den Punkt dorthin, wo es im Plan sitzt."
          : "Den Punkt an die Wand ziehen, wo es wirklich sitzt."}
      </p>
    </Karte>
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
            <span className="gross hidden text-[15px] font-bold text-kohle sm:inline">Serienküche</span>
          </Link>
          {istStart ? (
            <div className="min-w-0 flex-1" />
          ) : (
            <Massleiste stationen={stationen} />
          )}
          <button
            onClick={neuStarten}
            aria-label={neuGefragt ? "Wirklich alles zurücksetzen" : "Alles zurücksetzen und neu beginnen"}
            className={`-mr-2 flex h-11 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] transition-colors ${
              neuGefragt ? "bg-kohle text-creme" : "text-kohle-3 hover:text-kohle-2"
            }`}
          >
            <RotateCcw size={14} strokeWidth={2} />
            <span className={neuGefragt ? "" : "hidden sm:inline"}>{neuGefragt ? "Wirklich?" : "Neu"}</span>
          </button>
        </div>
      </header>

      {/* Still fuer das Auge, hoerbar fuer Vorlesesoftware: was gerade
          gewechselt hat. */}
      <p aria-live="polite" className="sr-only">
        {schrittText}:{" "}
        {schritt === "vorschlaege" && karten.length === 0
          ? "Das passt hier so nicht"
          : TITEL_FUER[schritt] ?? ""}
      </p>

      <main className={`mx-auto px-5 pb-20 sm:px-8 ${breit ? "max-w-[1180px] pt-6" : istStart ? "max-w-[1180px] pt-6 sm:pt-10" : zeigeBild ? "max-w-[1180px] pt-0 lg:pt-7" : "max-w-[720px] pt-6"}`}>
        {/* Zwei Tabs auf derselben Planung: wer zuletzt tippt, gewinnt. Das
            laesst sich ohne Server nicht verhindern — aber es muss gesagt
            werden, bevor eine halbe Stunde Arbeit weg ist. */}
        {montiert && fremdstand && (
          <div className="nicht-drucken mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-butter-2 bg-butter-soft px-4 py-3">
            <span className="text-[13.5px] leading-snug text-kohle-2">
              In einem anderen Tab wird an derselben Küche geplant. Was du hier änderst, überschreibt
              den dortigen Stand.
            </span>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-[13px] font-semibold text-kohle underline underline-offset-2"
              >
                Den anderen Stand laden
              </button>
              <button
                type="button"
                onClick={quittiereFremdstand}
                className="text-[13px] text-kohle-2 underline underline-offset-2 hover:text-kohle"
              >
                Hier weitermachen
              </button>
            </div>
          </div>
        )}

        {standText && (
          <div className="nicht-drucken mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-butter-2 bg-butter-soft px-4 py-3">
            <span className="text-[13.5px] leading-snug text-kohle-2">
              Du planst an einem Stand {standText} weiter.
            </span>
            <div className="flex shrink-0 items-center gap-3">
              <button type="button" onClick={quittiereStand} className="text-[13px] font-semibold text-kohle underline underline-offset-2">
                Weiterplanen
              </button>
              {/* Derselbe Zwischenschritt wie oben — vorher sah es aus, als
                  tue der Knopf nichts: die Rueckfrage erschien am kleinen
                  Knopf in der Kopfzeile, nicht hier. */}
              <button
                type="button"
                onClick={neuStarten}
                className={`text-[13px] underline underline-offset-2 ${neuGefragt ? "font-semibold text-kohle" : "text-kohle-2 hover:text-kohle"}`}
              >
                {neuGefragt ? "Wirklich alles löschen?" : "Neu anfangen"}
              </button>
            </div>
          </div>
        )}

        {geometrie && bildStreifen}
        <div className={zeigeBild ? "lg:grid lg:grid-cols-[minmax(0,1fr)_372px] lg:items-start lg:gap-10" : ""}>
        <div className={zeigeBild ? "min-w-0 pt-5 lg:pt-0" : ""}>
        {istStart && (
          <div className="warm-rein grid items-center gap-10 pt-2 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-8">
            <div>
              <div className="vorzeile">Küche planen</div>
              <h1 className="gross gross-xl mt-3 max-w-[14ch] text-[40px] font-bold text-kohle sm:text-[58px]">
                Fangen wir mit deinem Raum an.
              </h1>
              <p className="mt-6 max-w-[46ch] text-[17.5px] leading-relaxed text-kohle-2">
                Ein paar Fragen zu Wänden, Fenster und Geräten. Daraus rechnen wir eine Küche,
                die wirklich passt — mit jedem Schrank, jedem Maß und einem Preis.
              </p>
              <div className="mt-9">
                <WKnopf art="primaer" gross onClick={weiter}>
                  Los geht’s
                  <ArrowRight size={18} strokeWidth={2.2} />
                </WKnopf>
              </div>
              <p className="mt-5 text-[13.5px] text-kohle-3">Etwa fünf Minuten. Kein Konto, kein Termin.</p>
            </div>

            {/* Die Karte liegt im Bild, nicht darunter: vorher hing sie zur
                Haelfte in der Leere unter dem Foto und sah kaputt aus. */}
            <div className="relative h-[clamp(300px,46vw,500px)] overflow-hidden rounded-[22px]">
              <NextImage
                src={fotoUrl(FOTOS.gruen, 1200)}
                alt={FOTOS.gruen.alt}
                width={1200}
                height={1500}
                priority
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
              {moegliche[0] && (
                <div className="flaeche flaeche-hoch absolute bottom-4 left-4 right-4 rounded-[16px] px-3.5 pb-2.5 pt-3 sm:left-auto sm:w-[252px]">
                  <div className="vorzeile mb-1.5">Beispiel, gerade gerechnet</div>
                  <Kuechenbild
                    typ={typ}
                    variante={moegliche[moegliche.length - 1].variante}
                    zeileId={typ.zeilen[0].id}
                    volleBreite
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {schritt === "quelle" && (
          <>
            <Kopf anker={ueberschrift} vor={schrittText} titel="Wie willst du anfangen?" satz="Beides führt zum selben Ergebnis — der eine Weg ist schneller, der andere braucht keinen Plan." />
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
            <Kopf anker={ueberschrift} vor={schrittText} titel="Lade deinen Grundriss hoch" satz="PDF oder Bild vom Wohnungsgrundriss. Wir lesen Wandlängen, Fenster und Tür heraus — und zeigen dir danach, was wir verstanden haben." />
            <div className="mt-7">
              <Karte
                className={`px-5 py-8 text-center transition-[outline-color] ${ueberDerKarte ? "outline-2 outline-dashed outline-offset-4 outline-kohle-3" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setUeberDerKarte(true); }}
                onDragLeave={() => setUeberDerKarte(false)}
                onDrop={(e) => { e.preventDefault(); setUeberDerKarte(false); starteErkennung(e.dataTransfer.files?.[0]); }}
              >
                <input
                  ref={feld}
                  type="file"
                  className="sr-only"
                  onChange={(e) => starteErkennung(e.target.files?.[0])}
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
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
                      <WKnopf onClick={() => feld.current?.click()}>Datei auswählen</WKnopf>
                      {/* Ohne diesen Weg fuehren zwei Klicks auf "Weiter" ohne
                          Datei in die Pruefseite, die dann Herkuenfte
                          behauptet, die es nicht gibt. */}
                      <button
                        type="button"
                        onClick={() => { setzeQuelle("fragen"); geheZu("form"); }}
                        className="text-[14px] text-kohle-2 underline underline-offset-2 hover:text-kohle"
                      >
                        Ich habe keinen Plan — dann fragt uns
                      </button>
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
              anker={ueberschrift}
              vor={schrittText}
              titel="Haben wir das richtig gelesen?"
              satz="Tipp auf einen Wert, um ihn zu ändern. Wandlängen lesen wir sicher — Fenster und Türen sind geschätzt."
            />
            <div className="mt-7">
              <Planauflage
                raum={raum}
                rahmen={rahmen}
                setzeRahmen={setRahmen}
                bild={planBild}
                kinder={<BeispielPlan />}
                setzeTiefe={(mm) => setzeRaum({ tiefe: mm, nutz: { ...raum.nutz, links: mm, rechts: mm } })}
              />
              <p className="mt-3 text-[13px] leading-snug text-kohle-3">
                {planBild
                  ? "Dein Plan mit unserer Lesart darüber. Wo im Bild dein Küchenraum liegt, erkennt keine Software sicher — zieh den Rahmen einmal passend, dann folgen Tiefe und Verhältnis von selbst."
                  : planArt === "pdf"
                    ? "Von einer PDF zeigen wir im Prototyp keine Vorschau, deshalb hier ein gezeichneter Beispielplan. Der Rahmen und alle Maße darauf sind deine echten Angaben."
                    : planArt === "bild"
                      ? "Die Datei aus deiner letzten Sitzung liegt nicht mehr vor — Dateien bleiben im Browser und werden nicht gespeichert. Hier steht deshalb ein gezeichneter Beispielplan; deine Maße sind erhalten."
                      : "Hier steht ein gezeichneter Beispielplan — eine Datei ist nie angekommen. Alle Maße darauf sind Annahmen, die du prüfen solltest."}
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
                    {/* Drei Stufen, drei Farben: gelesen ist gruen, selbst
                        geaendert neutral-dunkel, Annahme und Schaetzung
                        auffaellig — sonst sieht "von dir geaendert" aus wie
                        eine Planmessung. */}
                    <div
                      className={`mt-0.5 text-[12.5px] ${
                        z.stufe === "plan"
                          ? "font-medium text-salbei"
                          : z.stufe === "geaendert"
                            ? "font-semibold text-kohle"
                            : "font-semibold text-kohle-2"
                      }`}
                    >
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
                    {ziehKarte("fenster", (mm) => setzeRaum({ fenster: { ...raum.fenster!, von: mm } }))}
                    <div className="mt-4">
                      {wandWahl(raum.fenster.wand, (w) => setzeRaum({ fenster: { ...raum.fenster!, wand: w, von: 0 } }))}
                    </div>
                    {/* Die Breite stand nur als Zahl da — "Tipp auf einen
                        Wert, um ihn zu aendern" galt fuer sie also nicht. */}
                    <Karte className="mt-4 px-5 py-7">
                      <div className="mb-4 text-center text-[14px] text-kohle-2">Wie breit ist es?</div>
                      <GrosseZahl
                        wert={raum.fenster.breite}
                        setze={(mm) => setzeRaum({ fenster: { ...raum.fenster!, breite: mm } })}
                        min={40}
                        max={Math.round(wandlaenge(raum, raum.fenster.wand) / 10)}
                      />
                    </Karte>
                    <Karte className="mt-4 px-5 py-6">
                      <div className="mb-4 text-center text-[14px] text-kohle-2">Und wo an der Wand?</div>
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
                {ziehKarte("tuer", (mm) => setzeRaum({ tuer: { ...raum.tuer, von: mm } }))}
                <div className="mt-4">{wandWahl(raum.tuer.wand, (w) => setzeRaum({ tuer: { ...raum.tuer, wand: w, von: 0 } }))}</div>
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
                {ziehKarte("wasser", (mm) => setzeRaum({ wasser: { ...raum.wasser, von: mm } }))}
                <div className="mt-4">{wandWahl(raum.wasser.wand, (w) => setzeRaum({ wasser: { wand: w, von: 0 } }))}</div>
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
            <Kopf anker={ueberschrift} vor={schrittText} titel="An wie vielen Wänden soll die Küche stehen?" satz="Schau dich im Raum um. Du kannst das später jederzeit ändern." />
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
              anker={ueberschrift}
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
            <Kopf anker={ueberschrift} vor={schrittText} titel="Wie breit ist der Raum?" satz="Die Länge der Hauptwand, von Ecke zu Ecke." />
            <Karte className="mt-8 px-5 py-7">
              <GrosseZahl wert={raum.breite} setze={(mm) => setzeRaum({ breite: mm })} min={120} max={900} />
            </Karte>
          </>
        )}

        {schritt === "tiefe" && (
          <>
            <Kopf anker={ueberschrift} vor={schrittText} titel="Und wie tief?" satz="Von der Hauptwand bis zur Wand gegenüber. Daran hängt, wie viel Platz zum Stehen bleibt." />
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
            {(() => {
              /* Der Hoechstwert war die Wandlaenge — gerechnet wird aber nur
                 mit dem, was nach Ecke und Tuer uebrig bleibt. Die obere
                 Haelfte des Feldes hatte deshalb keine Wirkung, und "Ganze
                 Wand nutzen" trug eine Zahl ein, die nirgends ankam. */
              const wand = wandlaenge(raum, zeileWand);
              const nutzbar = zeilenBereich(raum, zeileWand).laenge;
              const knapp = nutzbar < wand - 50;
              return (
                <>
                  <Kopf
                    anker={ueberschrift}
                    vor={schrittText}
                    titel={`Wie lang wird die Zeile an der ${WANDNAME_DAT[zeileWand]}?`}
                    satz={
                      knapp
                        ? `Die Wand ist ${Math.round(wand / 10)} cm lang, nutzbar sind davon ${Math.round(nutzbar / 10)} cm — der Rest geht für Ecke oder Tür ab. Nimmt noch etwas Platz weg, trag hier weniger ein.`
                        : `Die Wand ist ${Math.round(wand / 10)} cm lang. Wenn eine Tür, ein Heizkörper oder ein Durchgang Platz wegnimmt, trag hier weniger ein.`
                    }
                  />
                  <Karte className="mt-8 px-5 py-7">
                    <GrosseZahl
                      wert={Math.min(raum.nutz[zeileWand], nutzbar)}
                      setze={(mm) => setzeNutz(zeileWand, mm)}
                      min={60}
                      max={Math.round(nutzbar / 10)}
                    />
                    <div className="mt-5 flex justify-center">
                      <WKnopf onClick={() => setzeNutz(zeileWand, nutzbar)}>
                        {knapp ? "Alles Nutzbare" : "Ganze Wand nutzen"}
                      </WKnopf>
                    </div>
                  </Karte>
                </>
              );
            })()}
          </>
        )}

        {schritt === "fensterJa" && (
          <>
            <Kopf anker={ueberschrift} vor={schrittText} titel="Gibt es im Raum ein Fenster?" satz="Vor einem Fenster darf nichts Hohes stehen und darüber hängt kein Schrank. Deshalb fragen wir." />
            <div className="mt-7">
              <GrosseWahl<"ja" | "nein">
                wert={raum.fenster ? "ja" : "nein"}
                setze={(v) =>
                  setzeRaum({
                    // Das Fenster gehoert an eine Wand mit Kueche — bei
                    // gedrehter Ecke ist das nicht die Hauptwand.
                    fenster: v === "ja"
                      ? (() => {
                          const w = kuechenwaende(raum)[0];
                          return { wand: w, von: Math.max(0, Math.round(wandlaenge(raum, w) / 2 - 600)), breite: 1200 };
                        })()
                      : null,
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
            <Kopf anker={ueberschrift} vor={schrittText} titel="Wo ist das Fenster?" satz="Zieh den Punkt an die Stelle — oder wähl darunter eine andere Wand." />
            <div className="mt-7">{ziehKarte("fenster", (mm) => setzeRaum({ fenster: { ...raum.fenster!, von: mm } }))}</div>
            <div className="mt-4">{wandWahl(raum.fenster.wand, (w) => setzeRaum({ fenster: { ...raum.fenster!, wand: w, von: 0 } }))}</div>
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
                <GrosseZahl
                  wert={raum.fenster.breite}
                  setze={(mm) => setzeRaum({ fenster: { ...raum.fenster!, breite: mm } })}
                  min={40}
                  max={Math.min(320, Math.round(wandlaenge(raum, raum.fenster.wand) / 10))}
                />
              </div>
            </Karte>
          </>
        )}

        {schritt === "tuer" && (
          <>
            <Kopf anker={ueberschrift} vor={schrittText} titel="Wo ist die Tür?" satz="Eine Tür darf nicht gegen einen Schrank schlagen — zieh den Punkt an die richtige Stelle." />
            <div className="mt-7">{ziehKarte("tuer", (mm) => setzeRaum({ tuer: { ...raum.tuer, von: mm } }))}</div>
            <div className="mt-4">{wandWahl(raum.tuer.wand, (w) => setzeRaum({ tuer: { ...raum.tuer, wand: w, von: 0 } }))}</div>
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
              anker={ueberschrift}
              vor={schrittText}
              titel="Wo kommt das Wasser aus der Wand?"
              satz="Schau unter die alte Spüle oder in die Ecke mit den Leitungen. Dort bleibt die Spüle am besten — sonst muss ein Installateur verlegen."
            />
            <div className="mt-7">{ziehKarte("wasser", (mm) => setzeRaum({ wasser: { ...raum.wasser, von: mm } }))}</div>
            <div className="mt-4">{wandWahl(raum.wasser.wand, (w) => setzeRaum({ wasser: { wand: w, von: 0 } }))}</div>
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
              <Kopf anker={ueberschrift} vor={schrittText} titel={info.frage} satz={info.hilfe} />

              <div className="vertieft relative mt-7 h-[clamp(140px,22vw,220px)] overflow-hidden rounded-[16px] bg-creme-2 ring-1 ring-black/[0.06]">
                <NextImage
                  src={fotoUrl(GERAETEFOTOS[geraeteArt], 1400)}
                  alt={GERAETEFOTOS[geraeteArt].alt}
                  width={1400}
                  height={700}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-kohle/85 via-kohle/80 via-70% to-transparent p-3 text-[11.5px] text-creme">
                  Beispielbild. Die Modelle darunter zeigen das Foto des Herstellers.
                </span>
              </div>

              {markenFuer(geraeteArt).length > 1 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[13px] text-kohle-3">Marke</span>
                  {[null, ...markenFuer(geraeteArt)].map((m) => (
                    <button
                      key={m ?? "alle"}
                      type="button"
                      onClick={() => setMarken((v) => ({ ...v, [geraeteArt]: m }))}
                      aria-pressed={(marken[geraeteArt] ?? null) === m}
                      className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                        (marken[geraeteArt] ?? null) === m ? "bg-kohle text-creme" : "flaeche text-kohle-2 hover:!border-kohle-3"
                      }`}
                    >
                      {m ?? "Alle"}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {geraeteFuer(geraeteArt)
                  // Das schon gewaehlte Geraet bleibt immer sichtbar, sonst
                  // verschwindet die eigene Wahl hinter dem Filter.
                  .filter((g) => {
                    const f = marken[geraeteArt] ?? null;
                    return !f || g.marke === f || g.marke === "—" || raum.geraete[geraeteArt] === g.id;
                  })
                  .map((g) => {
                    const aktiv = raum.geraete[geraeteArt] === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setzeGeraet(geraeteArt, g.id)}
                        aria-pressed={aktiv}
                        className={`warm-wahl flaeche rounded-[14px] p-4 text-left ${
                          aktiv ? "flaeche-hoch !border-kohle ring-1 ring-kohle" : "hover:!border-linie-stark"
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Das Herstellerfoto des Modells, wo es eines gibt —
                              sonst die Zeichnung, die zeigt, was für ein Gerät es ist. */}
                          <div className={`vertieft w-[104px] shrink-0 overflow-hidden rounded-[10px] ${g.foto ? "bg-papier" : "bg-creme-2"}`}>
                            {g.foto ? (
                              <NextImage
                                src={g.foto}
                                alt={`${g.marke} ${g.modell ?? g.name}`}
                                width={400}
                                height={320}
                                className="h-[86px] w-full object-contain p-1.5"
                                sizes="104px"
                              />
                            ) : (
                              <Geraetebild g={g} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="vorzeile">
                              {g.marke === "—" ? "ohne Gerät" : [g.marke, g.serie].filter(Boolean).join(" · ")}
                            </div>
                            <div className="gross mt-1 text-[16px] font-bold leading-tight text-kohle">{g.name}</div>
                            {g.modell && <div className="ziffern mt-0.5 text-[12.5px] text-kohle-3">{g.modell}</div>}
                            <div className="mt-1.5 text-[13.5px] leading-snug text-kohle-2">{g.satz}</div>
                          </div>
                        </div>

                        {g.daten && g.daten.length > 0 && (
                          <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-linie-warm pt-3">
                            {g.daten.map(([k, v]) => (
                              <div key={k} className="flex items-baseline justify-between gap-2 text-[12.5px]">
                                <dt className="shrink-0 text-kohle-3">{k}</dt>
                                <dd className="ziffern truncate text-right font-medium text-kohle-2">{v}</dd>
                              </div>
                            ))}
                          </dl>
                        )}

                        <div className="ziffern mt-3 flex items-baseline justify-between gap-3 border-t border-linie-warm pt-3 text-[13px]">
                          <span className="text-kohle-3">
                            {g.richtpreis > 0 ? `Gerät ca. ${eur(g.richtpreis)}` : "kein Gerät"}
                          </span>
                          {(() => {
                            const w = geraeteWirkung?.get(g.id);
                            if (!w) return null;
                            if (!w.passt) {
                              return <span className="font-semibold text-kohle-3">passt nicht in den Raum</span>;
                            }
                            if (aktiv) return <span className="font-semibold text-kohle">gewählt</span>;
                            if (w.delta === null) {
                              return <span className="font-semibold text-salbei">damit geht es</span>;
                            }
                            return (
                              <span className="font-semibold text-kohle">
                                {w.delta === 0 ? "gleicher Preis" : `${w.delta > 0 ? "+" : "−"}${eur(Math.abs(w.delta))}`}
                              </span>
                            );
                          })()}
                        </div>
                        {/* Ein billigeres Geraet kann die Kueche teurer machen: wird
                            Wand frei, stellt der Plan dort breitere Schraenke hin. Ohne
                            diesen Satz sieht die Zahl daneben nach einem Fehler aus. */}
                        {(() => {
                          const w = geraeteWirkung?.get(g.id);
                          if (!w || w.delta === null || aktiv) return null;
                          const geraeteDelta = g.richtpreis - geraet(raum.geraete[geraeteArt]).richtpreis;
                          if (geraeteDelta === 0 || Math.sign(geraeteDelta) === Math.sign(w.delta)) return null;
                          const cm = Math.abs(w.wand) / 10;
                          return (
                            <div className="mt-1.5 text-[12.5px] leading-snug text-kohle-3">
                              {geraeteDelta < 0 ? "Das Gerät ist günstiger, die Küche nicht" : "Das Gerät ist teurer, die Küche nicht"}
                              {": "}
                              {w.wand < 0
                                ? `es gibt ${cm} cm Wand frei, und dort stehen dann mehr Schränke`
                                : w.wand > 0
                                  ? `es nimmt ${cm} cm mehr Wand, und dort fehlt dann Schrank`
                                  : "die Schränke daneben fallen anders aus"}
                              {` — ${w.moebel > 0 ? "+" : "−"}${eur(Math.abs(w.moebel))} an Möbeln.`}
                            </div>
                          );
                        })()}
                      </button>
                    );
                  })}
              </div>

              {geraeteArt === "backofen" && geraet(raum.geraete.backofen).breite > 0 && (
                <Karte className="mt-5 px-5 py-5">
                  <div className="text-[15px] font-semibold text-kohle">Wo soll er hin?</div>
                  <div className="mt-3">
                    <GrosseWahl<"unten" | "hoch">
                      wert={raum.ofenHoch ? "hoch" : "unten"}
                      setze={(w) => setzeRaum({ ofenHoch: w === "hoch" })}
                      optionen={[
                        { id: "unten", titel: "Unter das Kochfeld", satz: "Der übliche Weg. Spart 60 cm Wand." },
                        { id: "hoch", titel: "Auf Griffhöhe", satz: "Rückenschonend. Braucht 60 cm Wand über die ganze Höhe." },
                      ]}
                    />
                  </div>
                </Karte>
              )}

              <div className="mt-5">
                <Notiz>
                  Echte Geräte mit ihrer Modellbezeichnung. Die Preise sind recherchierte
                  Straßenpreise, Stand {PREISSTAND_GERAETE} ({QUELLEN}) — Momentaufnahmen, keine
                  Einkaufskonditionen. Für ein echtes Angebot tritt die Preisliste des
                  Lieferanten an ihre Stelle. {FOTO_QUELLE}.
                  {!FOTOS_LIZENZIERT && <> {GERAETEFOTO_HINWEIS}</>}
                </Notiz>
              </div>
            </>
          );
        })()}

        {schritt === "niveau" && (
          <>
            <Kopf anker={ueberschrift} vor={schrittText} titel="Wie soll sie ausgestattet sein?" satz="Das entscheidet über Fronten, Auszüge und Beschläge — und schlägt auf Möbel und Montage, nicht auf die Geräte." />
            <div className="mt-7">
              <GrosseWahl<"einfach" | "mittel" | "gehoben">
                wert={raum.niveau}
                setze={(n) => setzeRaum({ niveau: n })}
                spalten={3}
                optionen={([
                  ["einfach", "Einfach", "Solide Fronten, Scharniere ohne Dämpfung.", "−18 %"],
                  ["mittel", "Mittel", "Gedämpfte Vollauszüge, bessere Fronten.", "Grundpreis"],
                  ["gehoben", "Gehoben", "Hochwertige Oberflächen, Technik im Detail.", "+35 %"],
                ] as const).map(([id, titel, satz, zusatz]) => ({
                  id,
                  titel,
                  satz,
                  zusatz: zusatz === "Grundpreis" ? zusatz : `${zusatz} auf Möbel und Montage`,
                }))}
              />
            </div>
          </>
        )}

        {istVorschlaege && (
          <>
            <div className="text-center">
              <h1 className="gross text-[29px] font-bold leading-[1.12] text-kohle sm:text-[36px]">
                {karten.length === 0 ? "Das passt hier so nicht." : "Das passt in deinen Raum."}
              </h1>
              <p className="mx-auto mt-3 max-w-[52ch] text-[16px] leading-relaxed text-kohle-2">
                {karten.length === 1
                  ? "In diesem Raum geht genau eine Aufteilung auf — der Platz lässt keine zweite zu. Auf den Zentimeter gerechnet und nach denselben Regeln geprüft."
                  : karten.length === 2
                    ? "Zwei Möglichkeiten, beide auf den Zentimeter gerechnet und nach denselben Regeln geprüft."
                    : "Drei Möglichkeiten, alle auf den Zentimeter gerechnet und nach denselben Regeln geprüft."}
              </p>
            </div>
            {verworfenGrund && (
              <div className="mx-auto mt-6 max-w-[620px]">
                <Notiz ton="achtung">
                  Deine Umstellung von Hand ist weg. {verworfenGrund} Wähl einen Vorschlag, dann
                  kannst du gleich wieder umstellen.{" "}
                  <button
                    type="button"
                    onClick={() => quittiereVerworfen(eigenerSchluessel!)}
                    className="font-semibold underline underline-offset-2"
                  >
                    Verstanden
                  </button>
                </Notiz>
              </div>
            )}
            {moegliche.length === 0 ? (
              <div className="mx-auto mt-8 max-w-[560px]">
                <Notiz ton="achtung">{vorschlaege[0]?.grund}</Notiz>
                <div className="mt-5 flex justify-center gap-3">
                  <WKnopf onClick={() => geheZu("geraet-spuelmaschine")}>Geräte ändern</WKnopf>
                  <WKnopf onClick={masseAendern}>Maße ändern</WKnopf>
                </div>
              </div>
            ) : (
              <div className={`mt-8 grid gap-5 ${karten.length > 2 ? "lg:grid-cols-3" : "sm:grid-cols-2"}`}>
                {karten.map((v) => (
                  <VorschlagKarte
                    key={v.strategie}
                    v={v}
                    typ={typ}
                    // Nach dem Zusammenlegen zeigt die Seite unter einem
                    // anderen Schluessel an als dem gewaehlten — markiert war
                    // dann gar keine Karte.
                    aktiv={grundVorschlag?.strategie === v.strategie}
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
                        onClick={() => { setAnsicht(id); setAngefasst(null); setTauschGrund(null); }}
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
                  <Kuechenraum typ={typ} variante={gewaehlterVorschlag.variante} hoehe={420} geraeteSchalter ofenGewaehlt={ofenDa} scrollen />
                )}

                {ansicht === "vorn" && (
                  <div className="space-y-2">
                    {typ.zeilen.map((z) => (
                      <div key={z.id}>
                        {typ.zeilen.length > 1 && (
                          <div className="mb-1 text-[12.5px] font-semibold text-kohle-3">{z.bezeichnung}</div>
                        )}
                        <Kuechenbild
                          typ={typ}
                          variante={gewaehlterVorschlag.variante}
                          zeileId={z.id}
                          hoehe={typ.zeilen.length > 1 ? 210 : 300}
                         
                          nummernAb={nummerAb(z.id)}
                        />
                        <Positionsliste ids={gewaehlterVorschlag.belegung[z.id] ?? []} ab={nummerAb(z.id)} />
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
                          onClick={() => { setzeBelegung(eigenerSchluessel!, {}); setAngefasst(null); setTauschGrund(null); }}
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
                      ofenGewaehlt={ofenDa}
                      umstellen={{
                        gewaehlt: angefasst,
                        onWaehle: (zeileId, index) => antippen(zeileId, index),
                        onLeer: () => { setAngefasst(null); setTauschGrund(null); },
                        moeglich: zielMoeglich,
                      }}
                    />

                    {/* Derselbe Weg mit der Tastatur. Im Raum laesst sich nur
                        mit dem Zeiger tippen — ohne diese Liste waere das
                        Herzstueck der Ergebnisseite fuer Tastatur und
                        Vorlesesoftware gar nicht bedienbar. */}
                    <div className="mt-4">
                      <div className="vorzeile mb-2">Oder hier: Platz wählen, dann Ziel wählen</div>
                      {typ.zeilen.map((z) => (
                        <div key={z.id} className="mt-2">
                          <div className="mb-1.5 text-[12.5px] text-kohle-3">{z.bezeichnung}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {(gewaehlterVorschlag.belegung[z.id] ?? []).map((id, i) => {
                              const dran = angefasst?.zeile === z.id && angefasst?.index === i;
                              const ziel = !!angefasst && !dran && zielMoeglich(z.id, i);
                              const nr = nummerAb(z.id) + i;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => antippen(z.id, i)}
                                  aria-pressed={dran}
                                  aria-label={`Platz ${nr}, ${modulName(id)}${dran ? ", angefasst" : ziel ? ", mögliches Ziel" : ""}`}
                                  className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[12.5px] transition-colors ${
                                    dran
                                      ? "bg-kohle text-creme"
                                      : ziel
                                        ? "border-2 border-butter bg-butter-soft text-kohle"
                                        : "flaeche text-kohle-2 hover:!border-kohle-3"
                                  }`}
                                >
                                  <span className="ziffern font-bold">{nr}</span>
                                  {modulName(id)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {angefasst && (() => {
                      const jetzt = (gewaehlterVorschlag.belegung[angefasst.zeile] ?? [])[angefasst.index];
                      if (!jetzt || !istStauraum(jetzt)) return null;
                      const optionen = austauschbar(jetzt)
                        .map((id) => {
                          const plan = ersetzePlan(typ, gewaehlterVorschlag.belegung, angefasst, id);
                          if ("grund" in plan) return null;
                          const neu = ausBelegung(raum, typ, grundVorschlag!.strategie, {
                            ...gewaehlterVorschlag.belegung, ...plan.belegung,
                          });
                          return { id, belegung: plan.belegung, delta: neu.preis - gewaehlterVorschlag.preis };
                        })
                        .filter((x): x is { id: string; belegung: Record<string, string[]>; delta: number } => !!x);

                      return (
                        <Karte className="mt-5 px-5 py-5">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div className="text-[15px] font-semibold text-kohle">
                              Hier steht: {modul(jetzt).bezeichnung}
                            </div>
                            <div className="ziffern text-[13px] text-kohle-3">
                              {Math.round((modul(jetzt).breite ?? 0) / 10)} cm breit
                            </div>
                          </div>
                          {optionen.length === 0 ? (
                            <p className="mt-2 text-[14px] text-kohle-2">
                              An dieser Stelle passt kein anderer Typ — die Zeile geht sonst nicht auf.
                            </p>
                          ) : (
                            <>
                              <p className="mt-1.5 text-[13.5px] text-kohle-2">
                                Anderer Typ an dieselbe Stelle. Der Preis ist der Unterschied für die
                                ganze Küche, Passleiste schon eingerechnet.
                              </p>
                              <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                                {optionen.map((o) => (
                                  <button
                                    key={o.id}
                                    type="button"
                                    onClick={() => {
                                      setzeBelegung(eigenerSchluessel!, { ...gewaehlterVorschlag.belegung, ...o.belegung });
                                      setTauschGrund(null);
                                    }}
                                    className="warm-wahl flaeche rounded-[12px] p-3 text-left hover:!border-linie-stark"
                                  >
                                    <div className="vertieft mb-2.5 overflow-hidden rounded-[8px] bg-creme-2">
                                      <Schrankbild id={o.id} />
                                    </div>
                                    <div className="text-[14px] font-semibold leading-tight text-kohle">
                                      {modul(o.id).bezeichnung}
                                    </div>
                                    <div className="ziffern mt-1.5 flex items-baseline justify-between gap-2 text-[12.5px]">
                                      <span className="text-kohle-3">{Math.round((modul(o.id).breite ?? 0) / 10)} cm</span>
                                      <span className="font-semibold text-kohle">
                                        {o.delta === 0 ? "gleicher Preis" : `${o.delta > 0 ? "+" : "−"}${eur(Math.abs(o.delta))}`}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </Karte>
                      );
                    })()}

                    {tauschGrund && (
                      <div className="mt-4">
                        <Notiz ton="achtung">{tauschGrund}</Notiz>
                      </div>
                    )}

                    <div className="mt-6 space-y-4">
                      {typ.zeilen.map((z) => {
                        const hin = befundeZeile(raum, typ, z.id, gewaehlterVorschlag.belegung[z.id] ?? []).map((b) => b.text);
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
                             
                              nummernAb={nummerAb(z.id)}
                              waehlbar
                              gewaehlt={angefasst?.zeile === z.id ? angefasst.index : null}
                              moeglich={angefasst ? (i) => zielMoeglich(z.id, i) : undefined}
                              onWaehle={(i) => antippen(z.id, i)}
                            />
                            <Positionsliste ids={gewaehlterVorschlag.belegung[z.id] ?? []} ab={nummerAb(z.id)} />
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
                      genau die Länge deiner Küchenzeile. Preis, Hängeschränke und Arbeitsfläche rechnen wir
                      sofort neu, und wenn eine Regel kippt, steht es direkt darunter.
                    </p>
                  </div>
                )}
              </div>
              <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
                <div>
                  {verworfenGrund && (
                  <div className="mb-4">
                    <Notiz ton="achtung">
                      Deine Umstellung von Hand ist weg. {verworfenGrund} Du kannst gleich wieder
                      umstellen.{" "}
                      <button
                        type="button"
                        onClick={() => quittiereVerworfen(eigenerSchluessel!)}
                        className="font-semibold underline underline-offset-2"
                      >
                        Verstanden
                      </button>
                    </Notiz>
                  </div>
                )}
                <div className="vorzeile">Komplett, mit Geräten und Montage, inkl. MwSt.</div>
                  <div className="gross ziffern mt-2 text-[44px] font-bold leading-none tracking-[-0.04em] text-kohle">{eur(brutto(gewaehlterVorschlag.preis))}</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* Beide Knoepfe fuehrten an dieselbe Stelle — nur der
                      staerkere versprach mehr. Jetzt springt er wirklich ins
                      Formular, der andere zeigt das Blatt. */}
                  <WKnopf art="primaer" gross onClick={() => { geheZu("unterlagen"); setAnfrage(true); }}>
                    Angebot anfordern
                  </WKnopf>
                  <WKnopf gross onClick={() => geheZu("unterlagen")}>Unterlagen ansehen</WKnopf>
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
                    <ul className="space-y-2.5 text-[14.5px]">
                      {(Object.keys(raum.geraete) as GeraeteArt[]).map((art) => {
                        const g = geraet(raum.geraete[art]);
                        return (
                          <li key={art} className="flex items-center gap-3">
                            {g.foto ? (
                              <NextImage
                                src={g.foto}
                                alt=""
                                width={200}
                                height={200}
                                className="vertieft h-11 w-11 shrink-0 rounded-[8px] bg-papier object-contain p-1"
                                sizes="44px"
                              />
                            ) : (
                              <span className="h-11 w-11 shrink-0 rounded-[8px] bg-creme-2" aria-hidden="true" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-kohle-2">{g.name}</span>
                              {g.modell && (
                                <span className="ziffern block truncate text-[12.5px] text-kohle-3">
                                  {[g.marke, g.modell].filter(Boolean).join(" ")}
                                </span>
                              )}
                            </span>
                            {/* In einer Aufstellung gehoert der Preis des Geraets, nicht
                                sein Abstand zum billigsten Modell derselben Art. */}
                            <span className="ziffern shrink-0 text-kohle-3">
                              {g.richtpreis > 0 ? eur(g.richtpreis) : "—"}
                            </span>
                          </li>
                        );
                      })}
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
                            {/* Millimeter gehoeren auf das Unterlagenblatt;
                                hier daneben stehen ueberall Zentimeter. */}
                            <span className="shrink-0 text-kohle-3">{Math.round((modul(id).breite ?? 0) / 10)} cm</span>
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
              <WKnopf art="klar" onClick={masseAendern}>Maße ändern</WKnopf>
            </div>
          </div>
        )}

        {istUnterlagen && gewaehlterVorschlag && (() => {
          const u = baueUnterlagen(raum, typ, gewaehlterVorschlag);
          const mm = (x: number) => x.toLocaleString("de-DE");
          return (
            <div className="warm-rein unterlagen">
              {/* Nur auf Papier: ein Briefkopf, damit das Blatt für sich steht,
                  und eine Fußzeile, die Chrome auf jeder Seite wiederholt. */}
              <div className="nur-drucken drucken-kopf">
                <div className="drucken-kopf-zeile">
                  <strong>Serienküche — Küchenplanung</strong>
                  <span>Vorgang {u.kopf.vorgang}</span>
                </div>
                <div className="drucken-kopf-zeile drucken-fein">
                  <span>Planungsunterlagen zur Angebotsanfrage · {u.kopf.form}, Ausstattung {u.kopf.niveau}</span>
                  <span>Erstellt {u.kopf.erstellt}</span>
                </div>
              </div>
              <div className="nur-drucken drucken-fuss">
                Serienküche · Vorgang {u.kopf.vorgang} · {u.kopf.erstellt} · Prototyp, kein verbindliches Angebot
              </div>

              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="nicht-drucken">
                  <div className="vorzeile">Unterlagen zur Anfrage</div>
                  <h1 className="gross gross-xl mt-3 text-[34px] font-bold text-kohle sm:text-[46px]">
                    Das geht mit raus.
                  </h1>
                  <p className="mt-4 max-w-[62ch] text-[16px] leading-relaxed text-kohle-2">
                    Alles darin stammt aus deinem Plan: die Positionsnummern sind dieselben wie in
                    der Zeichnung, die Maßkette ergibt die Länge deiner Küchenzeile, und die
                    Summe der Stückliste ist der Preis, der dir angezeigt wurde.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 nicht-drucken">
                  <WKnopf onClick={() => window.print()}>
                    <Printer size={16} strokeWidth={2} />
                    Drucken oder als PDF
                  </WKnopf>
                  <WKnopf art="primaer" onClick={() => { setAnfrage(true); setTimeout(() => anfrageFeld.current?.focus(), 60); }}>
                    Anfrage abschicken
                  </WKnopf>
                </div>
              </div>

              {/* Die Anfrage selbst. Ohne sie endet der ganze Weg im Nichts. */}
              {anfrage && (
                <Karte className="nicht-drucken mt-7 px-5 py-5 sm:px-7 sm:py-6">
                  {abgeschickt ? (
                    <div>
                      <div className="gross text-[20px] font-bold text-kohle">Deine Anfrage liegt vor.</div>
                      <p className="mt-2.5 max-w-[60ch] text-[15px] leading-relaxed text-kohle-2">
                        Vorgang <strong className="ziffern font-semibold text-kohle">{u.kopf.vorgang}</strong>.
                        Notiere dir die Nummer — darunter findet sich deine Planung wieder.
                        Diese Unterlagen gehen mit der Anfrage mit; druck sie dir am besten
                        zusätzlich aus.
                      </p>
                      <Notiz>
                        Prototyp: Es wird nichts verschickt und nichts gespeichert, was dein Gerät
                        verlässt. Im Betrieb ginge die Anfrage mit allen Unterlagen an den
                        Lieferanten, und du bekämst eine Bestätigung per E-Mail.
                      </Notiz>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => { e.preventDefault(); if (kontaktVoll) setAbgeschickt(true); }}
                    >
                      <div className="gross text-[20px] font-bold text-kohle">Wohin dürfen wir antworten?</div>
                      <p className="mt-2 max-w-[62ch] text-[14.5px] leading-relaxed text-kohle-2">
                        Mit der Anfrage gehen diese Unterlagen mit — Zeichnungen, Maße, Stückliste,
                        Anschlüsse und Zuschnitt. Du bindest dich damit nicht.
                      </p>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {([
                          ["name", "Name", "text", "Vor- und Nachname", true],
                          ["mail", "E-Mail", "email", "name@beispiel.de", true],
                          ["telefon", "Telefon (freiwillig)", "tel", "für Rückfragen", false],
                          ["wann", "Wann soll sie stehen? (freiwillig)", "text", "z. B. im Frühjahr", false],
                        ] as Array<[keyof typeof kontakt, string, string, string, boolean]>).map(([feld, label, typ, platz, pflicht], i) => (
                          <label key={feld} className="block">
                            <span className="mb-1.5 block text-[13px] font-semibold text-kohle-2">
                              {label}
                            </span>
                            <input
                              ref={i === 0 ? anfrageFeld : undefined}
                              type={typ}
                              required={pflicht}
                              value={String(kontakt[feld])}
                              onChange={(e) => setKontakt((k) => ({ ...k, [feld]: e.target.value }))}
                              placeholder={platz}
                              className="flaeche w-full rounded-[12px] px-3.5 py-2.5 text-[15px] text-kohle placeholder:text-kohle-3"
                            />
                          </label>
                        ))}
                      </div>
                      <label className="mt-4 block">
                        <span className="mb-1.5 block text-[13px] font-semibold text-kohle-2">
                          Noch etwas dazu? (freiwillig)
                        </span>
                        <textarea
                          value={kontakt.text}
                          onChange={(e) => setKontakt((k) => ({ ...k, text: e.target.value }))}
                          rows={3}
                          className="flaeche w-full rounded-[12px] px-3.5 py-2.5 text-[15px] text-kohle placeholder:text-kohle-3"
                          placeholder="Besonderheiten im Raum, Wünsche, Termine"
                        />
                      </label>
                      <label className="mt-4 flex items-start gap-3 text-[13.5px] leading-snug text-kohle-2">
                        <input
                          type="checkbox"
                          checked={kontakt.ok}
                          onChange={(e) => setKontakt((k) => ({ ...k, ok: e.target.checked }))}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-kohle"
                        />
                        <span>
                          Ich bin einverstanden, dass meine Angaben und meine Planung zur Bearbeitung
                          dieser Anfrage verwendet werden. Mehr dazu in der{" "}
                          <Link href="/datenschutz" className="font-semibold underline underline-offset-2">
                            Datenschutzerklärung
                          </Link>
                          .
                        </span>
                      </label>
                      <div className="mt-6 flex flex-wrap items-center gap-4">
                        <WKnopf art="primaer" gross typ="submit" aus={!kontaktVoll}>
                          Anfrage abschicken
                        </WKnopf>
                        <button type="button" onClick={() => setAnfrage(false)} className="text-[14px] text-kohle-3 hover:text-kohle-2">
                          Doch nicht
                        </button>
                      </div>
                    </form>
                  )}
                </Karte>
              )}

              <dl className="mt-9 grid gap-x-8 gap-y-2.5 border-t border-linie-warm pt-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Vorgang", u.kopf.vorgang],
                  ["Erstellt", u.kopf.erstellt],
                  ["Form", u.kopf.form],
                  ["Ausstattung", u.kopf.niveau],
                  ["Lieferant", u.kopf.lieferant],
                  ["Preisstand Möbel", `${u.kopf.preisstand}, gültig bis ${u.kopf.gueltigBis}`],
                  ["Preisstand Geräte", u.kopf.preisstandGeraete],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-linie-warm/70 pb-2 text-[13.5px]">
                    <dt className="shrink-0 text-kohle-3">{k}</dt>
                    <dd className="ziffern text-right text-kohle">{v}</dd>
                  </div>
                ))}
              </dl>

              <Abschnitt titel="Raum" nr="1">
                <dl className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {u.raum.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 border-b border-linie-warm/70 pb-2 text-[13.5px]">
                      <dt className="shrink-0 text-kohle-3">{k}</dt>
                      <dd className="ziffern text-right text-kohle">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Abschnitt>

              {/* Die Unterlagen verweisen auf „Positionsnummern wie in der
                  Zeichnung" — dann muss die Zeichnung auch dabei sein. */}
              <Abschnitt titel="Zeichnungen" nr="2" satz="Grundriss und jede Zeile von vorn, mit denselben Positionsnummern wie in den Tabellen.">
                <div className="flaeche rounded-[14px] px-4 py-4">
                  {/* Der Grundriss braucht nicht die volle Blattbreite — er
                      ist fast quadratisch und wuerde sonst eine Seite fuellen. */}
                  <div className="mx-auto max-w-[460px]">
                    <Raumbild raum={raum} volleBreite />
                  </div>
                  <p className="mt-2 border-t border-linie-warm pt-2 text-center text-[12.5px] text-kohle-3">
                    Grundriss, von oben. Gelb die Wände mit Küche, der Tropfen der Wasseranschluss.
                  </p>
                </div>
                <div className="mt-5 space-y-5">
                  {typ.zeilen.map((z) => (
                    <div key={z.id} className="flaeche break-inside-avoid rounded-[14px] px-4 py-4">
                      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
                        <div className="gross text-[15px] font-bold text-kohle">{z.bezeichnung}</div>
                        <div className="ziffern text-[12.5px] text-kohle-3">{mm(z.laenge)} mm</div>
                      </div>
                      <Kuechenbild
                        typ={typ}
                        variante={gewaehlterVorschlag.variante}
                        zeileId={z.id}
                        volleBreite
                        nummernAb={nummerAb(z.id)}
                      />
                    </div>
                  ))}
                </div>
              </Abschnitt>

              <Abschnitt titel="Maßketten" nr="3" satz="Jede Zeile von links nach rechts, Maße ab Zeilenanfang.">
                <div className="space-y-7">
                  {u.massketten.map((k) => (
                    <div key={k.zeileId}>
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div className="gross text-[16px] font-bold text-kohle">{k.wand}</div>
                        <div className="ziffern text-[13px] text-kohle-2">
                          Zeile {mm(k.laenge)} mm, beginnt {mm(k.start)} mm ab der Ecke
                        </div>
                      </div>
                      <Tabelle
                        kopf={["Pos", "Element", "von", "bis", "Breite"]}
                        rechts={[2, 3, 4]}
                        zeilen={k.positionen.map((p) => [
                          String(p.nr), p.name, `${mm(p.von)} mm`, `${mm(p.bis)} mm`, `${mm(p.breite)} mm`,
                        ])}
                        fuss={["", "Summe", "", "", `${mm(k.positionen.reduce((su, p) => su + p.breite, 0))} mm`]}
                      />
                      {!k.geht_auf && (
                        <div className="mt-2">
                          <Notiz ton="achtung">Diese Zeile geht rechnerisch nicht auf — vor dem Bestellen klären.</Notiz>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Abschnitt>

              {u.haenge.length > 0 && (
                <Abschnitt
                  titel="Hängeschränke"
                  nr="4"
                  satz={(() => {
                    // "je 600 mm breit" stand auch ueber einer Tabelle mit
                    // 600 und 450 — die Breiten stehen eine Zeile tiefer.
                    const breiten = [...new Set(u.haenge.map((h) => h.breite))].sort((a, b) => b - a);
                    const wie = breiten.length === 1
                      ? `je ${mm(breiten[0])} mm breit`
                      : breiten.map((b) => `${u.haenge.filter((h) => h.breite === b).length} × ${mm(b)} mm`).join(", ");
                    return `${u.haenge.length} Stück, ${wie}. Unterkante ${mm(OS_UK)} mm, Oberkante ${mm(HOCH_H)} mm über Fertigfußboden.`;
                  })()}
                >
                  <Tabelle
                    kopf={["Nr", "Wand", "von", "bis", "Breite"]}
                    rechts={[2, 3, 4]}
                    zeilen={u.haenge.map((h, i) => [
                      String(i + 1), h.wand, `${mm(h.von)} mm`, `${mm(h.bis)} mm`, `${mm(h.breite)} mm`,
                    ])}
                  />
                </Abschnitt>
              )}

              <Abschnitt titel="Geräte" nr="5" satz="Was eingebaut wird, wie es eingebaut wird und in welche Nische.">
                <Tabelle
                  kopf={["Gerät", "Modell", "Einbau", "Nische", "Platz in der Zeile"]}
                  zeilen={u.geraeteliste.map((g) => [g.bezeichnung, g.modell, g.einbau, g.nische, g.platz])}
                />
                <p className="mt-4 text-[13px] leading-relaxed text-kohle-3">
                  Nischenmaße sind die üblichen Normmaße der Bauart, nicht aus dem Datenblatt des
                  einzelnen Geräts. Vor der Bestellung gegen das Datenblatt halten.
                </p>
              </Abschnitt>

              <Abschnitt titel="Stückliste" nr="6" satz="Positionsnummern wie in der Zeichnung. Alle Preise netto.">
                <Tabelle
                  kopf={["Pos", "Bezeichnung", "Artikel", "Menge", "Einzel", "Summe"]}
                  rechts={[3, 4, 5]}
                  zeilen={u.liste.map((z) => [
                    z.pos, z.bezeichnung, z.artikel,
                    `${z.menge.toLocaleString("de-DE")} ${z.einheit}`,
                    eur(z.einzel), eur(z.summe),
                  ])}
                />
                <div className="mt-6 ml-auto max-w-[420px] space-y-2">
                  {u.summen.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-4 text-[14px]">
                      <span className="text-kohle-2">{k}</span>
                      <span className="ziffern text-kohle">{eur(v)}</span>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-4 border-t border-linie-stark pt-2.5 text-[14px]">
                    <span className="font-semibold text-kohle">Summe netto</span>
                    <span className="ziffern font-semibold text-kohle">{eur(u.netto)}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 text-[14px]">
                    <span className="text-kohle-2">zzgl. {Math.round(MWST * 100)} % Umsatzsteuer</span>
                    <span className="ziffern text-kohle">{eur(u.steuer)}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-kohle pt-2.5">
                    <span className="gross text-[16px] font-bold text-kohle">Endpreis</span>
                    <span className="gross ziffern text-[22px] font-bold text-kohle">{eur(u.gesamt)}</span>
                  </div>
                </div>
              </Abschnitt>

              <Abschnitt titel="Anschlüsse" nr="7" satz="Maße ab Zeilenanfang, Höhen über Fertigfußboden.">
                <Tabelle
                  kopf={["Anschluss", "Wand", "ab Anfang", "Höhe", "Hinweis"]}
                  rechts={[2, 3]}
                  zeilen={u.anschluesse.map((an) => [
                    an.art, an.wand, `${mm(an.abZeilenanfang)} mm`, `${mm(an.hoehe)} mm`, an.hinweis,
                  ])}
                />
              </Abschnitt>

              <Abschnitt titel="Zuschnitt" nr="8" satz="Arbeitsplatte, Passleisten und Sockel.">
                <Tabelle
                  kopf={["Platte", "Länge", "Tiefe", "Stärke", "Ausschnitte"]}
                  rechts={[1, 2, 3]}
                  zeilen={u.zuschnitt.platten.map((pl, i) => [
                    `${i + 1} · ${pl.wand}`,
                    `${mm(pl.laenge)} mm`,
                    `${mm(pl.tiefe)} mm`,
                    `${pl.staerke} mm`,
                    pl.ausschnitte.length === 0
                      ? "keine"
                      : pl.ausschnitte
                          .map((a) => `${a.was} ${a.breite}×${a.tiefe} mm, ab ${mm(a.abKante)} mm`)
                          .join(" · "),
                  ])}
                />
                {u.zuschnitt.leisten.length > 0 && (
                  <div className="mt-6">
                    <Tabelle
                      kopf={["Passleiste", "Breite", "Höhe"]}
                      rechts={[1, 2]}
                      zeilen={u.zuschnitt.leisten.map((l, i) => [
                        `${i + 1} · ${l.wand}`, `${mm(l.breite)} mm`, `${mm(l.hoehe)} mm`,
                      ])}
                    />
                  </div>
                )}
                <p className="ziffern mt-5 text-[13.5px] text-kohle-2">
                  Sockel: {u.zuschnitt.sockelLfm.toLocaleString("de-DE")} lfm, Höhe 150 mm.
                </p>
              </Abschnitt>

              <Abschnitt titel="Vor Ort prüfen" nr="9">
                <ul className="space-y-2.5">
                  {u.pruefen.map((t) => (
                    <li key={t} className="flex gap-3 text-[14.5px] leading-relaxed text-kohle-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-kohle-3" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Abschnitt>

              <Abschnitt titel="Weiteres Vorgehen" nr="10">
                <ol className="space-y-2.5 text-[14.5px] leading-relaxed text-kohle-2">
                  {[
                    "Diese Unterlagen gehen mit der Anfrage an den Lieferanten.",
                    "Der Lieferant bestätigt Verfügbarkeit und Preise oder meldet Abweichungen zurück.",
                    "Vor der Bestellung misst jemand den fertigen Raum nach und zeichnet das Aufmaß gegen.",
                    "Erst danach wird bestellt. Bis dahin ist nichts verbindlich.",
                  ].map((t, i) => (
                    <li key={t} className="flex gap-3">
                      <span className="ziffern shrink-0 font-semibold text-kohle">{i + 1}.</span>
                      {t}
                    </li>
                  ))}
                </ol>
                <div className="mt-9 grid gap-8 break-inside-avoid sm:grid-cols-2">
                  {["Aufmaß genommen am, Name", "Planung geprüft und freigegeben"].map((t) => (
                    <div key={t}>
                      <div className="h-11 border-b border-kohle-3" />
                      <div className="mt-2 text-[12.5px] text-kohle-3">{t}</div>
                    </div>
                  ))}
                </div>
              </Abschnitt>

              <div className="mt-10">
                <Notiz>
                  Prototyp: Modulpreise und Artikelnummern sind Demo-Werte eines gedachten
                  Partnerprogramms, Gerätepreise sind recherchierte Straßenpreise. Maße, Mengen,
                  Anschlusspunkte und Zuschnitte sind dagegen aus deinem Plan gerechnet.
                </Notiz>
              </div>
            </div>
          );
        })()}

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
          <>
            {/* Auf dem Handy lag "Weiter" bei den Geraeteschritten knapp
                anderthalb Bildschirme unter dem Falz. Dort laeuft die
                Fusszeile jetzt mit; ab 1024 px steht sie wie gehabt am Ende. */}
            <div className="nicht-drucken sticky bottom-0 z-20 -mx-5 mt-9 border-t border-black/[0.055] bg-creme/85 px-5 py-3 backdrop-blur-xl backdrop-saturate-150 sm:-mx-8 sm:px-8 lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <WKnopf art="klar" onClick={zurueck}>
                  <ArrowLeft size={16} strokeWidth={2.2} />
                  Zurück
                </WKnopf>
                {!istErgebnis && !istUnterlagen && (
                  <WKnopf art="primaer" onClick={weiterMitTipp} aus={istVorschlaege && moegliche.length === 0}>
                    {istVorschlaege ? (gewaehlt ? "Weiter" : "Mit dem Tipp weiter") : "Weiter"}
                    <ArrowRight size={17} strokeWidth={2.2} />
                  </WKnopf>
                )}
              </div>
            </div>

            <div className="nicht-drucken mt-9 hidden items-center justify-between gap-4 lg:flex">
              <WKnopf art="klar" onClick={zurueck}>
                <ArrowLeft size={16} strokeWidth={2.2} />
                Zurück
              </WKnopf>
              {!istErgebnis && !istUnterlagen && (
                <WKnopf art="primaer" gross onClick={weiterMitTipp} aus={istVorschlaege && moegliche.length === 0}>
                  {istVorschlaege ? (gewaehlt ? "Weiter" : "Mit dem Tipp weiter") : "Weiter"}
                  <ArrowRight size={18} strokeWidth={2.2} />
                </WKnopf>
              )}
            </div>
          </>
        )}
        </div>
        <aside className="hidden lg:sticky lg:top-[80px] lg:block">{geometrie ? bildTafel : (geraetTafel ?? raumTafel)}</aside>
        </div>
      </main>
    </div>
  );
}
