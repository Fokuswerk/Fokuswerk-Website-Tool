"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { bereinigeGeraete, STANDARD_GERAETE, type GeraeteArt, type Geraetewahl } from "@/data/geraete";
import {
  angleichen, kuechenwaende, passtUeberhaupt, planeKueche, STANDARD_RAUM, uebernimmUmstellung,
  type Raumangaben, type Strategie, type WandId,
} from "@/lib/planer";

/**
 * Der Weg für Privatkunden: viele kleine Schritte mit je einer Entscheidung.
 * Die Folge wird aus den Angaben berechnet — wer über Eck plant, wird nach
 * der Seite gefragt, wer kein Fenster hat, nicht nach dessen Platz.
 */

export type SchrittId =
  | "start" | "quelle" | "upload" | "pruefen" | "form" | "drehung"
  | "breite" | "tiefe"
  | `zeile-${WandId}`
  | "fensterJa" | "fenster"
  | "tuer" | "wasser" | "raum"
  | `geraet-${GeraeteArt}`
  | "niveau" | "vorschlaege" | "ergebnis" | "unterlagen";

/**
 * Beide Wege stellen dieselben Fragen.
 *
 * Vorher endete der Grundrissweg in einer einzigen Seite mit sechs Werten
 * untereinander, jeder zum Aufklappen. Das ist keine Strecke, das ist ein
 * Formular: man sieht sechs Aufgaben auf einmal und keiner Zeile an, ob sie
 * erledigt ist. Jetzt läuft auch der Grundrissweg Frage für Frage — nur mit
 * dem Plan im Rücken und einer gelesenen Zahl schon im Feld. Die Wandlängen
 * je Zeile bleiben ihm erspart, die stehen im Plan.
 */
export function schrittFolge(raum: Raumangaben, quelle: Quelle): SchrittId[] {
  const f: SchrittId[] = ["start", "quelle"];
  if (quelle === "plan") f.push("upload", "pruefen");
  f.push("form");
  if (raum.form !== "eine-wand") f.push("drehung");
  f.push("breite", "tiefe");
  if (quelle === "fragen") for (const w of kuechenwaende(raum)) f.push(`zeile-${w}` as SchrittId);
  f.push("fensterJa");
  if (raum.fenster) f.push("fenster");
  f.push("tuer", "wasser", "raum");
  f.push(
    "geraet-kuehlschrank", "geraet-kochfeld", "geraet-backofen",
    "geraet-spuelmaschine", "geraet-dunstabzug",
    "niveau", "vorschlaege", "ergebnis", "unterlagen",
  );
  return f;
}

export type Quelle = "fragen" | "plan";

/**
 * Alle Schritte in ihrer natürlichen Ordnung — unabhängig davon, welche in
 * der aktuellen Folge vorkommen.
 *
 * Die Folge baut sich nach jeder Antwort neu. Wer den Raum dreht, dessen
 * Schritt `zeile-links` kann daraus verschwinden; `indexOf` gab dann −1, und
 * aus −1 wurde stillschweigend Schritt 0 — die Startseite. Mit dieser Ordnung
 * findet sich stattdessen der nächstgelegene Schritt, den es noch gibt.
 */
const ORDNUNG: SchrittId[] = [
  "start", "quelle", "upload", "pruefen", "form", "drehung", "breite", "tiefe",
  "zeile-haupt", "zeile-links", "zeile-rechts", "zeile-gegenueber",
  "fensterJa", "fenster", "tuer", "wasser", "raum",
  "geraet-kuehlschrank", "geraet-kochfeld", "geraet-backofen",
  "geraet-spuelmaschine", "geraet-dunstabzug",
  "niveau", "vorschlaege", "ergebnis", "unterlagen",
];

/** Wo der Schritt in der aktuellen Folge steht — oder wo er stünde. */
function stelleIn(folge: SchrittId[], schritt: SchrittId, richtung: 1 | -1): number {
  const i = folge.indexOf(schritt);
  if (i >= 0) return i;
  const rang = ORDNUNG.indexOf(schritt);
  if (rang < 0) return richtung === 1 ? 0 : folge.length - 1;
  if (richtung === 1) {
    const naechster = folge.findIndex((x) => ORDNUNG.indexOf(x) >= rang);
    return naechster >= 0 ? naechster - 1 : folge.length - 1;
  }
  let vorher = -1;
  folge.forEach((x, j) => { if (ORDNUNG.indexOf(x) <= rang) vorher = j; });
  return vorher >= 0 ? vorher + 1 : 0;
}

export interface KuecheState {
  raum: Raumangaben;
  quelle: Quelle;
  /** Ist der simulierte Erkennungslauf schon gelaufen. */
  erkannt: boolean;
  schritt: SchrittId;
  gewaehlt: Strategie | null;
  /** Vom Nutzer von Hand umgestellte Belegung, je Vorschlag. */
  eigeneBelegung: Record<string, Record<string, string[]>>;
  /** Je Strategie der Grund, warum ihre Umstellung verworfen wurde. Leer,
      solange nichts verloren ging. */
  umstellungVerworfen: Record<string, string>;
  /** Welche Felder der Nutzer selbst gesetzt hat. */
  beruehrt: Feld[];
  /** Welche Fragen hinter ihm liegen — auch die, bei denen er den
      vorgeschlagenen Wert stehen gelassen hat. */
  bestaetigt: Feld[];
  /** Was im Upload-Schritt ankam. */
  planArt: Planart;
  /** Zeitpunkt der letzten Änderung, als Millisekunden. */
  stand: number;
  /** Bis wann der Nutzer den wiederhergestellten Stand zur Kenntnis genommen hat. */
  standGesehen: number;
  /** Hat ein anderer Tab denselben Stand weitergeschrieben? */

  setzeQuelle: (q: Quelle) => void;
  uebernehmeErkennung: () => void;
  setzeRaum: (teil: Partial<Raumangaben>) => void;
  setzeGeraet: (art: GeraeteArt, id: string) => void;
  setzeNutz: (wand: WandId, mm: number) => void;
  geheZu: (id: SchrittId) => void;
  weiter: () => void;
  zurueck: () => void;
  waehle: (s: Strategie) => void;
  setzeBelegung: (schluessel: string, belegung: Record<string, string[]>) => void;
  /** Die Meldung über die verworfene Umstellung wegnehmen. */
  quittiereVerworfen: (strategie?: string) => void;
  /** Welche Art Datei hochgeladen wurde — damit nach einer alten Sitzung
      erklärt werden kann, warum die Vorschau fehlt. */
  merkePlanArt: (art: Planart) => void;
  /** Den Hinweis auf den wiederhergestellten Stand wegnehmen. */
  quittiereStand: () => void;
  /** Den Hinweis auf den anderen Tab wegnehmen. */
  neu: () => void;
}

/** Was im Upload-Schritt ankam. */
export type Planart = null | "bild" | "pdf";

/**
 * Woher ein Wert stammt.
 *
 * Die Prüfseite behauptete feste Herkünfte — "aus dem Plan gelesen" stand auch
 * über Standardwerten, die kein Plan geliefert hat, und blieb stehen, nachdem
 * der Nutzer den Wert selbst geändert hatte.
 */
export type Herkunft = "plan" | "geschaetzt" | "geraten" | "geaendert" | "annahme" | "bestaetigt";

/** Welche Felder der Nutzer selbst angefasst hat. */
export type Feld = "breite" | "tiefe" | "fenster" | "tuer" | "wasser" | "form";

/** Welche Frage welche Angabe abnimmt — fuer "hast du das schon gesehen?". */
const FELD_VON_SCHRITT: Partial<Record<SchrittId, Feld>> = {
  form: "form",
  breite: "breite",
  tiefe: "tiefe",
  fensterJa: "fenster",
  fenster: "fenster",
  tuer: "tuer",
  wasser: "wasser",
};

export function herkunftVon(
  feld: Feld,
  erkannt: boolean,
  beruehrt: Feld[],
  bestaetigt: Feld[] = [],
): Herkunft {
  if (beruehrt.includes(feld)) return "geaendert";
  /* Wer den vorgeschlagenen Wert stehen laesst, hat ihn trotzdem gesehen und
     mit "Weiter" abgenickt. Vorher stand ueber jeder solchen Angabe weiter
     "Annahme — sag uns den echten Wert", auch direkt nachdem er sie
     bestaetigt hatte. */
  if (bestaetigt.includes(feld)) return "bestaetigt";
  if (!erkannt) return "annahme";
  if (feld === "breite" || feld === "tiefe") return "plan";
  if (feld === "wasser") return "geraten";
  if (feld === "form") return "annahme";
  return "geschaetzt";
}

export const HERKUNFT_TEXT: Record<Herkunft, string> = {
  plan: "aus dem Plan gelesen",
  geschaetzt: "geschätzt — bitte prüfen",
  geraten: "im Plan nicht eingezeichnet — geraten",
  geaendert: "von dir geändert",
  annahme: "Annahme — sag uns den echten Wert",
  bestaetigt: "von dir bestätigt",
};

/** Was der simulierte Erkennungslauf aus einem Plan liest. */
export const ERKANNT: Raumangaben = {
  ...STANDARD_RAUM,
  breite: 3620,
  tiefe: 2740,
  nutz: { haupt: 3620, links: 2740, rechts: 2740, gegenueber: 3620 },
  fenster: { wand: "haupt", von: 1850, breite: 1180 },
  tuer: { wand: "gegenueber", von: 420, breite: 885 },
  wasser: { wand: "haupt", von: 2890 },
};

const ANFANG = {
  raum: STANDARD_RAUM,
  quelle: "fragen" as Quelle,
  erkannt: false,
  schritt: "start" as SchrittId,
  gewaehlt: null as Strategie | null,
  eigeneBelegung: {} as Record<string, Record<string, string[]>>,
  /** Welche Felder der Nutzer selbst gesetzt hat. */
  beruehrt: [] as Feld[],
  /** Welche Fragen er schon durchlaufen hat. */
  bestaetigt: [] as Feld[],
  /** Was hochgeladen wurde; bleibt erhalten, das Bild selbst nicht. */
  planArt: null as Planart,
  /** Wann zuletzt etwas geändert wurde — für "Dein Stand von …". */
  stand: 0,
  standGesehen: 0,
  /** Je Strategie der Grund, warum ihre Umstellung verworfen wurde.
      Still zu verwerfen ist das Aergerlichste: man stellt seine Schraenke
      um, verschiebt die Tuer, und der eigene Plan ist spurlos weg. */
  umstellungVerworfen: {} as Record<string, string>,
};

/**
 * Die von Hand umgestellten Küchen über eine Änderung retten.
 *
 * Vorher wurden sie hier unbesehen weggeworfen — bei jeder Änderung, auch
 * bei der Ausstattungsstufe, die an der Geometrie nichts dreht. Jetzt wird
 * jede gespeicherte Anordnung gegen den neuen Raum geprüft: was gültig
 * bleibt, bleibt; was nicht, wird mit Begründung verworfen.
 *
 * Die Prüfung ist billig genug für einen Setter — sie rechnet keinen Plan,
 * sondern misst eine fertige Anordnung gegen die neue Geometrie.
 */
function rette(
  s: Pick<KuecheState, "eigeneBelegung" | "umstellungVerworfen">,
  neu: Raumangaben,
): Pick<KuecheState, "eigeneBelegung" | "umstellungVerworfen"> {
  const schluessel = Object.keys(s.eigeneBelegung);
  if (schluessel.length === 0) return { eigeneBelegung: {}, umstellungVerworfen: s.umstellungVerworfen };

  /* Wird der Raum gerade unplanbar — ein Gerät zu breit für jede Wand —,
     liefert der Planer gar keine Belegung mehr. Dann ist die Geometrie nicht
     schuld, und die Umstellung wird nicht angetastet: nimmt der Nutzer das
     Gerät zurück, ist seine Anordnung wieder da. */
  if (!passtUeberhaupt(neu)) {
    return { eigeneBelegung: s.eigeneBelegung, umstellungVerworfen: s.umstellungVerworfen };
  }

  const behalten: Record<string, Record<string, string[]>> = {};
  // Eine ungelesene Meldung darf die nächste Änderung überleben.
  const verworfen = { ...s.umstellungVerworfen };
  for (const k of schluessel) {
    const r = uebernimmUmstellung(neu, s.eigeneBelegung[k]);
    if ("grund" in r) verworfen[k] = r.grund;
    else { behalten[k] = r.belegung; delete verworfen[k]; }
  }
  return { eigeneBelegung: behalten, umstellungVerworfen: verworfen };
}

/**
 * Gespeicherte Umstellungen auf vollständige Anordnungen bringen.
 *
 * Früher lagen hier nur die geänderten Zeilen, und angezeigt wurde
 * `{ ...frischerPlan.belegung, ...fragment }`. Genau diese Mischung ist die
 * Fehlerquelle, die wir loswerden wollen — also wird sie beim Laden einmal
 * aufgelöst. Der gespeicherte Raum ist derselbe, zu dem die Fragmente
 * gehören, deshalb geht das genau einmal und genau richtig.
 */
function vervollstaendige(
  raum: Raumangaben,
  gespeichert: Record<string, Record<string, string[]>> | undefined,
): Record<string, Record<string, string[]>> {
  if (!gespeichert) return {};
  const zeilen = kuechenwaende(raum).map((w) => `Z-${w}`);
  const aus: Record<string, Record<string, string[]>> = {};
  for (const [k, fragment] of Object.entries(gespeichert)) {
    if (!fragment || typeof fragment !== "object") continue;
    if (zeilen.every((z) => Array.isArray(fragment[z]))) { aus[k] = fragment; continue; }
    const plan = planeKueche(raum, k as Strategie);
    if (!plan.moeglich) continue;
    aus[k] = { ...plan.belegung, ...fragment };
  }
  /* Und dann durch dieselbe Pruefung wie jeder andere Weg. Dies war der
     einzige Schreibweg in die eigene Belegung, der daran vorbeiging: was
     aus einer aelteren Fassung kam, wurde ungeprueft uebernommen. */
  const geprueft: Record<string, Record<string, string[]>> = {};
  for (const [k, b] of Object.entries(aus)) {
    const r = uebernimmUmstellung(raum, b);
    if (!("grund" in r)) geprueft[k] = r.belegung;
  }
  return geprueft;
}

const SPEICHERNAME = "serienkueche-einzel-v6";

export const useKueche = create<KuecheState>()(
  persist(
    (set) => ({
      ...ANFANG,

      setzeRaum: (teil) =>
        set((s) => {
          const felder: Feld[] = [];
          for (const k of Object.keys(teil) as Array<keyof Raumangaben>) {
            if (k === "breite" || k === "tiefe" || k === "fenster" || k === "tuer" || k === "wasser" || k === "form") {
              felder.push(k as Feld);
            }
          }
          const raum = angleichen({ ...s.raum, ...teil });
          return {
            raum,
            beruehrt: [...new Set([...s.beruehrt, ...felder])],
            stand: Date.now(),
            ...rette(s, raum),
          };
        }),

      setzeGeraet: (art, id) =>
        set((s) => {
          const raum = { ...s.raum, geraete: { ...s.raum.geraete, [art]: id } as Geraetewahl };
          return { raum, stand: Date.now(), ...rette(s, raum) };
        }),

      setzeNutz: (wand, mm) =>
        set((s) => {
          // Ab hier gilt die Handeingabe, nicht mehr die Ableitung aus der Tür.
          const raum = angleichen({ ...s.raum, nutzHand: true, nutz: { ...s.raum.nutz, [wand]: mm } });
          return { raum, stand: Date.now(), ...rette(s, raum) };
        }),

      setzeQuelle: (q) => set({ quelle: q, stand: Date.now() }),

      uebernehmeErkennung: () =>
        // Auch dieser Weg schreibt den Raum — und loeschte die Umstellung
        // bisher ohne ein Wort. Er geht durch dieselbe Rettung wie alle
        // anderen.
        set((s) => {
          /* Ein Grundriss sagt etwas ueber Waende, Fenster, Tuer und
             Anschluss — nicht darueber, welchen Kuehlschrank jemand will.
             Vorher setzte dieser Weg auch Geraete und Ausstattungsstufe
             zurueck: wer die Fragen schon beantwortet hatte und dann doch
             den Plan hochlud, fand fuenf Geraetewahlen geloescht. */
          const raum = angleichen({
            ...s.raum,
            breite: ERKANNT.breite,
            tiefe: ERKANNT.tiefe,
            nutz: { ...ERKANNT.nutz },
            nutzHand: false,
            form: ERKANNT.form,
            ausrichtung: ERKANNT.ausrichtung,
            fenster: ERKANNT.fenster,
            tuer: { ...ERKANNT.tuer },
            wasser: { ...ERKANNT.wasser },
          });
          return {
            raum,
            erkannt: true,
            // Was der Lauf geliefert hat, gilt als nicht von Hand geaendert
            // und auch als noch nicht abgenickt — genau darum geht es ja.
            beruehrt: [],
            bestaetigt: [],
            stand: Date.now(),
            ...rette(s, raum),
          };
        }),

      geheZu: (id) => set({ schritt: id, stand: Date.now() }),

      weiter: () =>
        set((s) => {
          const f = schrittFolge(s.raum, s.quelle);
          /* "Gibt es ein Fenster?" beantwortet die Frage nach dem Fenster
             nur dann ganz, wenn es keins gibt. Gibt es eins, kommt die
             Stelle erst im naechsten Schritt — vorher stand dort schon
             "von dir bestaetigt", bevor man sie gesehen hatte. */
          const feld = s.schritt === "fensterJa" && s.raum.fenster ? undefined : FELD_VON_SCHRITT[s.schritt];
          return {
            schritt: f[Math.min(f.length - 1, stelleIn(f, s.schritt, 1) + 1)],
            bestaetigt: feld ? [...new Set([...s.bestaetigt, feld])] : s.bestaetigt,
            stand: Date.now(),
          };
        }),

      zurueck: () =>
        set((s) => {
          const f = schrittFolge(s.raum, s.quelle);
          return { schritt: f[Math.max(0, stelleIn(f, s.schritt, -1) - 1)], stand: Date.now() };
        }),

      waehle: (g) => set({ gewaehlt: g, stand: Date.now() }),

      setzeBelegung: (schluessel, belegung) =>
        set((s) => {
          const verworfen = { ...s.umstellungVerworfen };
          delete verworfen[schluessel];
          // "Wieder wie vorgeschlagen" schickt eine leere Belegung. Die als
          // eigene Anordnung zu speichern hiesse: eine Kueche ohne Schraenke.
          const eigene = { ...s.eigeneBelegung };
          if (Object.keys(belegung).length === 0) delete eigene[schluessel];
          else eigene[schluessel] = belegung;
          return { eigeneBelegung: eigene, umstellungVerworfen: verworfen, stand: Date.now() };
        }),

      quittiereVerworfen: (strategie) =>
        set((s) => {
          if (!strategie) return { umstellungVerworfen: {} };
          const verworfen = { ...s.umstellungVerworfen };
          delete verworfen[strategie];
          return { umstellungVerworfen: verworfen };
        }),

      merkePlanArt: (art) => set({ planArt: art, stand: Date.now() }),

      // Nicht den Stand loeschen, sondern merken, bis wann er gesehen ist.
      // Vorher war die Uhrzeit im Band die des letzten Maszes statt die der
      // letzten Aenderung, und ein Wegklicken schaltete das Band fuer immer
      // ab — auch nach Wochen und ganz anderer Arbeit.
      quittiereStand: () => set((s) => ({ standGesehen: s.stand })),


      neu: () =>
        set({
          ...ANFANG,
          raum: { ...STANDARD_RAUM, nutz: { ...STANDARD_RAUM.nutz }, geraete: { ...STANDARD_GERAETE } },
          eigeneBelegung: {},
        }),
    }),
    {
      name: SPEICHERNAME,
      /* Erst im Browser laden, nicht schon beim ersten Rendern. Sonst rendert
         der Server den Anfangszustand und der Browser sofort den
         gespeicherten — React meldet einen Unterschied, und je nach Stand
         blitzt kurz der falsche Schritt auf. Die Seite ruft rehydrate() in
         ihrem montiert-Effekt. */
      skipHydration: true,
      // Ein Plan aus einer älteren Sitzung kann Geräte nennen, die es nicht
      // mehr gibt. Beim Laden einmal geradeziehen, statt daran zu scheitern.
      merge: (gespeichert, jetzt) => {
        const alt = gespeichert as Partial<KuecheState> | undefined;
        if (!alt?.raum) return { ...jetzt, ...alt } as KuecheState;
        const raum = angleichen({ ...STANDARD_RAUM, ...alt.raum, geraete: bereinigeGeraete(alt.raum.geraete) });
        /* Ein gespeicherter Schritt kann in der jetzigen Folge fehlen — etwa
           "zeile-links", wenn die Form inzwischen auf eine Wand steht. Die
           Seite fragte dann nach einer Wand, an der keine Kueche steht, und
           der eingetragene Wert blieb ohne Wirkung. */
        const folge = schrittFolge(raum, alt.quelle ?? "fragen");
        const schritt = alt.schritt && folge.includes(alt.schritt)
          ? alt.schritt
          : folge[Math.max(0, Math.min(folge.length - 1, stelleIn(folge, alt.schritt ?? "start", -1)))];
        return {
          ...jetzt,
          ...alt,
          raum,
          schritt,
          eigeneBelegung: vervollstaendige(raum, alt.eigeneBelegung),
          // Die Meldung war einmal ein Ja-Nein-Wert.
          umstellungVerworfen:
            alt.umstellungVerworfen && typeof alt.umstellungVerworfen === "object"
              ? alt.umstellungVerworfen
              : {},
        } as KuecheState;
      },
    },
  ),
);

/**
 * Zwei Tabs auf derselben Planung.
 *
 * Beide schreiben in denselben Speicher, und wer zuletzt tippt, gewinnt —
 * der aeltere Tab kannte den neueren Stand nicht und hat ihn beim ersten
 * "Weiter" ueberschrieben. Eine halbe Stunde Arbeit, weg, ohne ein Wort.
 * Verhindern laesst sich das nicht ohne einen Server. Sagen schon.
 *
 * Nur stand die Warnung selbst im gespeicherten Zustand — und DAS war der
 * eigentliche Schaden. zustand schreibt bei JEDEM set() den vollstaendigen
 * Zustand in den Speicher. Die Zeile "ich habe einen fremden Stand bemerkt"
 * hat also genau den Stand ueberschrieben, vor dessen Verlust sie warnte.
 * Nachgemessen: der neuere Stand war in derselben Millisekunde weg, "Den
 * anderen Stand laden" lud danach wieder den eigenen, und weil jeder Tab auf
 * das Schreiben des anderen antwortet, schaukelte sich das hoch — 1354
 * Schreibvorgaenge in drei Sekunden ohne eine einzige Eingabe. Auf dem Handy
 * heisst das: heisses Geraet, zaeher Planer, und welcher Stand am Ende im
 * Speicher liegt, ist Zufall.
 *
 * Deshalb liegt die Warnung jetzt in einem eigenen Store, der nichts
 * speichert. Sie sagt Bescheid und fasst nichts an.
 */
export const useFremdstand = create<{ fremd: boolean; quittiere: () => void }>()((set) => ({
  fremd: false,
  quittiere: () => set({ fremd: false }),
}));

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== SPEICHERNAME || !e.newValue) return;
    if (useKueche.getState().schritt === "start") return;
    useFremdstand.setState({ fremd: true });
  });
}
