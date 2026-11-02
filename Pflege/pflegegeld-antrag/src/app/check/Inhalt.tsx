"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  KRITERIEN, berechne, MODUL_NAMEN, schwaechstesModul, groesstesBedarfsmodul,
  type Antworten, type ModulId, type Ergebnis,
} from "@/lib/nba";
import { punkte, BETRAEGE_2026, BETRAEGE_2027 } from "@/lib/leistungen";
import { angeboteFuer } from "@/lib/partner";
import Wahlgruppe from "@/components/Wahlgruppe";
import Lead from "@/components/Lead";
import { melden } from "@/lib/messen";

const MODULE: ModulId[] = [1, 2, 3, 4, 5, 6];
const STELLE = "pflegegeld-antrag.stelle";
const SPEICHER = "pflegegeld-antrag.antworten";

const MODUL_EINLEITUNG: Record<ModulId, string> = {
  1: "Es geht nur um die Bewegung, nicht um die Gründe. Gewertet wird, was ohne Hilfe gelingt.",
  2: "Gefragt ist die Fähigkeit, nicht die Tagesform. Nehmen Sie, was an einem durchschnittlichen Tag gilt.",
  3: "Hier zählt die Häufigkeit. Gewertet wird nur, was tatsächlich Unterstützung oder Aufsicht nötig macht. Auch diese Fragen gehen ins Persönliche – niemand außer Ihnen liest die Antworten.",
  4: "Dieser Teil zählt am stärksten. Nehmen Sie sich Zeit und denken Sie an jede Handreichung, die Ihnen längst selbstverständlich ist. Die Fragen gehen ins Persönliche – niemand außer Ihnen liest die Antworten.",
  5: "Hier zählt die Anzahl der Maßnahmen, nicht eine Stufe. Gewertet wird nur, was die Person nicht selbst erledigen kann.",
  6: "Es geht darum, wie viel vom Tag die Person selbst gestaltet.",
};

/**
 * Was der Pflegegrad monatlich an Pflegegeld bedeutet - das ist die Zahl, wegen
 * der jemand hier ist. Pflegegrad 1 bekommt keines, nur den Entlastungsbetrag;
 * das muss dastehen, sonst liest sich eine fehlende Zahl wie ein Fehler. Die
 * Betraege ab 2027 stehen bisher nur im Kabinettsentwurf, also mit Hinweis.
 */
function geldsatz(grad: number, stand: "alt" | "neu") {
  if (grad === 0) return "Kein Anspruch auf Pflegegeld";
  const betrag = (stand === "alt" ? BETRAEGE_2026 : BETRAEGE_2027).pflegegeld[grad - 1];
  if (betrag === 0) {
    return stand === "alt"
      ? "Kein Pflegegeld, 131 € Entlastungsbetrag"
      : "Kein Pflegegeld, 175 € Sozialraumbudget (Entwurf)";
  }
  return `${betrag} € im Monat${stand === "neu" ? " (Entwurf)" : ""}`;
}

export default function Inhalt_Check() {
  const [index, setIndex] = useState(0);
  const [a, setA] = useState<Antworten>({});
  const [geladen, setGeladen] = useState(false);
  const [fehlend, setFehlend] = useState<string[]>([]);
  /** Ziel fuer den Fokus nach einem Modulwechsel. */
  const kopf = useRef<HTMLHeadingElement>(null);
  const ersterAufbau = useRef(true);

  useEffect(() => {
    try {
      const roh = localStorage.getItem(SPEICHER);
      if (roh) setA(JSON.parse(roh) as Antworten);
    } catch {}
    setGeladen(true);
  }, []);

  /** Wo jemand aufgehoert hat - sonst beginnt jeder Besuch wieder bei Modul 1. */
  useEffect(() => {
    if (!geladen) return;
    try { localStorage.setItem(STELLE, String(index)); } catch {}
  }, [index, geladen]);

  useEffect(() => {
    if (!geladen) return;
    try { localStorage.setItem(SPEICHER, JSON.stringify(a)); } catch {}
  }, [a, geladen]);

  /**
   * Jeder Teil bekommt eine eigene Adresse (#teil-3). Ohne das verlaesst der
   * Zurueck-Knopf des Browsers mitten im Rechner die ganze Seite - und das ist
   * nach vierzig beantworteten Fragen der sichere Abbruch.
   */
  useEffect(() => {
    const ausHash = () => {
      const treffer = /^#teil-(\d+)$/.exec(window.location.hash);
      let n = treffer ? Number(treffer[1]) - 1 : 0;
      // Ohne Adresse (Lesezeichen, Mail) dort weitermachen, wo zuletzt Schluss war
      if (!treffer && ersterAufbau.current) {
        try {
          const gemerkt = Number(localStorage.getItem(STELLE));
          if (Number.isFinite(gemerkt) && gemerkt > 0) n = gemerkt;
        } catch {}
      }
      ersterAufbau.current = false;
      setIndex(Math.min(Math.max(n, 0), MODULE.length));
    };
    ausHash();
    window.addEventListener("hashchange", ausHash);
    return () => window.removeEventListener("hashchange", ausHash);
  }, []);

  /** Schreibt den Schritt in die Adresse, ohne einen neuen Eintrag anzulegen. */
  function geheZu(n: number, neuerEintrag = true) {
    const ziel = `#teil-${n + 1}`;
    if (window.location.hash !== ziel) {
      if (neuerEintrag) window.history.pushState(null, "", ziel);
      else window.history.replaceState(null, "", ziel);
    }
    setIndex(n);
  }

  const fertig = index >= MODULE.length;
  const modul = MODULE[Math.min(index, MODULE.length - 1)];
  const kriterien = useMemo(
    () => KRITERIEN.filter((k) => k.modul === modul && sichtbar(k.id, a)),
    [modul, a],
  );

  const alt = useMemo(() => berechne(a, "2026"), [a]);
  const neu = useMemo(() => berechne(a, "2027"), [a]);

  function setzen(id: string, w: number) {
    setA((alt) => {
      // Die erste Antwort ueberhaupt ist der Start des Rechners.
      if (Object.keys(alt).length === 0) melden("check_start", { rechner: "genau" });
      return { ...alt, [id]: w };
    });
    setFehlend((f) => f.filter((x) => x !== id));
  }

  /**
   * Abkürzung je Modul: setzt alle sichtbaren Kriterien auf die erste Option. In
   * jedem Modul bedeutet diese "selbständig" bzw. "entfällt", also null Punkte.
   */
  function alleUnauffaellig() {
    const bereitsBeantwortet = KRITERIEN.filter(
      (k) => k.modul === modul && sichtbar(k.id, a) && a[k.id] !== undefined && a[k.id] !== 0,
    ).length;
    if (bereitsBeantwortet > 0) {
      const sicher = window.confirm(
        `${bereitsBeantwortet} Ihrer Antworten in diesem Teil werden dabei auf „kein Hilfebedarf“ gesetzt. Fortfahren?`,
      );
      if (!sicher) return;
    }
    const neu: Antworten = { ...a };
    for (const k of KRITERIEN) if (k.modul === modul) neu[k.id] = 0;
    setA(neu);
    setFehlend([]);
  }

  /** Alles im Browser gespeicherte löschen. */
  function allesLoeschen() {
    if (!window.confirm("Alle Ihre Angaben in diesem Browser löschen? Das lässt sich nicht rückgängig machen.")) return;
    try { localStorage.removeItem(SPEICHER); localStorage.removeItem(STELLE); } catch {}
    setA({});
    geheZu(0, false);
    setFehlend([]);
    window.scrollTo({ top: 0 });
  }

  function weiter() {
    const offen = kriterien.filter((k) => a[k.id] === undefined).map((k) => k.id);
    if (offen.length > 0) {
      setFehlend(offen);
      const el = document.getElementById(`k-${offen[0]}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      (el?.querySelector("button") as HTMLButtonElement | null)?.focus();
      return;
    }
    setFehlend([]);
    // Welches Modul geschafft wurde, ohne eine einzige Antwort zu uebertragen.
    melden("check_frage", { rechner: "genau", modul });
    geheZu(index + 1);
    window.scrollTo({ top: 0 });
  }

  // Nach jedem Teilwechsel den Fokus auf die Ueberschrift. Dieser Hook MUSS vor
  // jedem vorzeitigen return stehen, sonst aendert sich die Zahl der Hooks
  // zwischen zwei Renders und React bricht ab.
  //
  // Der Teil, den man leicht falsch macht: `ersterAufbau` taugt hier nicht als
  // Wache. Der Hash-Effekt setzt die Marke schon beim Aufbau auf false, waehrend
  // dieser Effekt wegen `geladen === false` noch aussetzt. Beim naechsten Lauf
  // ist die Marke weg und die Ueberschrift bekommt den Fokus, obwohl niemand
  // geblaettert hat - auf dem iPhone liegt dann beim Laden ein Rahmen um
  // "Mobilitaet". Deshalb merken wir uns den zuletzt gezeigten Teil und
  // fokussieren nur bei einem echten Wechsel.
  const zuletztGezeigt = useRef<number | null>(null);
  useEffect(() => {
    if (!geladen) return;
    if (zuletztGezeigt.current === null) {
      zuletztGezeigt.current = index;
      return;
    }
    if (zuletztGezeigt.current === index) return;
    zuletztGezeigt.current = index;
    kopf.current?.focus({ preventScroll: true });
  }, [index, geladen]);

  if (!geladen) return <main className="band"><div className="huelle-schmal" role="status">Lädt …</div></main>;

  if (fertig) return <Auswertung alt={alt} neu={neu} a={a} zurueck={() => geheZu(MODULE.length - 1)} />;

  const beantwortet = KRITERIEN.filter((k) => sichtbar(k.id, a) && a[k.id] !== undefined).length;
  const gesamt = KRITERIEN.filter((k) => sichtbar(k.id, a)).length;

  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="schritt-kopf">
          <span className="schritt-zahl">
            Modul {index + 1} von 6 · {beantwortet} von {gesamt} Kriterien
          </span>
          {index > 0 && (
            <button type="button" onClick={() => { geheZu(index - 1); window.scrollTo({ top: 0 }); }}
              className="knopf-still">
              zurück
            </button>
          )}
        </div>
        <div className="fortschritt" style={{ marginBottom: 18 }}>
          <div style={{ width: `${(beantwortet / gesamt) * 100}%` }} />
        </div>

        <h1 className="nur-vorlesen">Pflegegrad genau berechnen</h1>
        <span className="auge auge-strich">Zählt {gewichtung(modul)} des Ergebnisses</span>
        <h2 ref={kopf} tabIndex={-1}>{MODUL_NAMEN[modul]}</h2>
        <p className="nur-vorlesen" role="status">
          Teil {index + 1} von {MODULE.length}: {MODUL_NAMEN[modul]}
        </p>
        <p className="vorspann" style={{ marginTop: 12 }}>{MODUL_EINLEITUNG[modul]}</p>

        {index === 0 && (
          <div className="hinweis hinweis-gelb abstand-s">
            <div className="hinweis-titel">Nicht für Kinder bis 18 Monate</div>
            Für Säuglinge und Kleinkinder bis 18 Monate gilt ein eigenes Verfahren: In Modul 4
            ersetzt ein einzelnes Kriterium alle anderen, und schon ab 12,5 Punkten gibt es
            Pflegegrad 2 statt 1 (§ 15 Abs. 7 SGB XI). Dieser Rechner bildet das nicht ab und
            würde ein zu niedriges Ergebnis zeigen. Stellen Sie den Antrag in diesem Fall direkt –
            die <Link href="/antrag">Anleitung dafür</Link> gilt unverändert.
          </div>
        )}

        {index === 0 && (
          <div className="hinweis abstand-s">
            <div className="hinweis-titel">Sie können jederzeit aufhören</div>
            Insgesamt {gesamt} Fragen in sechs Teilen, zusammen etwa zehn bis fünfzehn Minuten.
            Jede Antwort wird sofort in diesem Browser gesichert, zusammen mit der Stelle, an der
            Sie aufgehört haben. Beim nächsten Aufruf geht es dort weiter – solange Sie denselben
            Browser benutzen und die Daten nicht löschen.
          </div>
        )}

        <div className="knopf-reihe" style={{ marginBottom: 6 }}>
          <button type="button" className="knopf knopf-zweit" onClick={alleUnauffaellig}>
            {modul === 3 || modul === 5 ? "Nichts davon kommt vor" : "Hier klappt alles ohne Hilfe"}
          </button>
        </div>

        {(modul === 1 || modul === 2 || modul === 4 || modul === 6) && (
          <details className="erklaerung abstand-s">
            <summary>Was bedeuten „überwiegend selbständig“ und „überwiegend unselbständig“?</summary>
            <div className="antwort">
              <p>
                Gemeint ist immer, wie viel <strong>Sie</strong> übernehmen müssen – nicht, wie
                anstrengend es ist. Am Beispiel Waschen:
              </p>
              <ul>
                <li>
                  <strong>Selbständig:</strong> schafft es allein. Auch dann, wenn es langsam geht
                  oder ein Hilfsmittel gebraucht wird.
                </li>
                <li>
                  <strong>Überwiegend selbständig:</strong> Sie legen alles bereit, erinnern daran
                  oder helfen bei einzelnen Handgriffen – den Rest macht sie oder er selbst.
                </li>
                <li>
                  <strong>Überwiegend unselbständig:</strong> Sie übernehmen den größeren Teil,
                  einzelne Handgriffe gelingen noch allein.
                </li>
                <li>
                  <strong>Unselbständig:</strong> Sie übernehmen alles, auch wenn mitgeholfen wird.
                </li>
              </ul>
              <p style={{ marginBottom: 0 }}>
                Erinnern, Anleiten und Beaufsichtigen zählen mit. Wer ohne Aufforderung nicht
                anfängt, ist nicht selbständig.
              </p>
            </div>
          </details>
        )}

        {modul === 5 && (
          <div className="hinweis abstand-s">
            <div className="hinweis-titel">Warum hier nach Anzahlen gefragt wird</div>
            Anlage 1 zu § 15 SGB XI zählt in diesem Teil nicht einzelne Antworten, sondern alle
            Maßnahmen zusammen: Tabletten, Spritzen, Messungen und Hilfsmittel aus den ersten
            sieben Fragen werden zu einer Zahl pro Tag addiert, die vier Fragen zur Wundversorgung
            zu einer zweiten. Erst diese Summen ergeben Punkte. Deshalb macht es einen
            Unterschied, ob dreimal oder viermal am Tag Tabletten gegeben werden.
            <br />
            <br />
            Wochenangaben teilen wir durch sieben, Monatsangaben durch 30 – genau so rechnet der
            Gutachter. „Mehr als dreimal täglich“ rechnen wir mit sechs Maßnahmen.
          </div>
        )}

        {fehlend.length > 0 && (
          <div className="hinweis hinweis-signal abstand-s" role="alert">
            <div className="hinweis-titel">
              {fehlend.length === 1 ? "Eine Frage ist noch offen" : `${fehlend.length} Fragen sind noch offen`}
            </div>
            Sie sind unten rot gekennzeichnet.
          </div>
        )}

        <div className="karte abstand-s">
          {kriterien.map((k, i) => (
            <div className="frage" id={`k-${k.id}`} key={k.id}>
              <div className="frage-nr">Frage {i + 1} von {kriterien.length}</div>
              <div className="frage-titel">{k.titel}</div>
              <div className="frage-hilfe">{k.hilfe}</div>
              <Wahlgruppe name={k.titel} optionen={k.optionen} wert={a[k.id]} onWahl={(w) => setzen(k.id, w)} />
              {fehlend.includes(k.id) && (
                <p style={{ color: "var(--signal)", fontSize: "var(--t-5)", margin: "10px 0 0", fontWeight: 600 }}>
                  Bitte noch beantworten.
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="knopf-reihe">
          <button type="button" className="knopf" onClick={weiter}>
            {index === MODULE.length - 1 ? "Ergebnis anzeigen" : "Weiter zu Modul " + (modul + 1)}
          </button>
        </div>

        <p className="quelle abstand-s">
          Kriterien und Punktwerte nach Anlage 1 zu § 15 SGB XI. Ihre Angaben bleiben in diesem
          Browser und werden nicht an uns übertragen.{" "}
          <button type="button" className="knopf-still" onClick={allesLoeschen} style={{ display: "inline" }}>
            Alle meine Angaben in diesem Browser löschen
          </button>
        </p>
      </div>
    </main>
  );
}

/** Inkontinenz-Folgekriterien erst zeigen, wenn das Tor gesetzt ist. */
function sichtbar(id: string, a: Antworten): boolean {
  if (id === "4.11" || id === "4.12") return (a["4.inko"] ?? 0) >= 1;
  return true;
}

function gewichtung(m: ModulId): string {
  if (m === 1) return "10 Prozent";
  if (m === 2 || m === 3) return "15 Prozent, gemeinsam";
  if (m === 4) return "40 Prozent";
  if (m === 5) return "20 Prozent";
  return "15 Prozent";
}

function Auswertung({ alt, neu, a, zurueck }: { alt: Ergebnis; neu: Ergebnis; a: Antworten; zurueck: () => void }) {
  const gemeldet = useRef(false);
  useEffect(() => {
    if (gemeldet.current) return;
    gemeldet.current = true;
    melden("check_fertig", {
      rechner: "genau",
      grad_alt: alt.pflegegrad,
      grad_neu: neu.pflegegrad,
      verliert: alt.pflegegrad > neu.pflegegrad ? 1 : 0,
    });
  }, [alt.pflegegrad, neu.pflegegrad]);

  const hebel = schwaechstesModul(alt);
  // Angebote richten sich nach dem gemessenen Bedarf, nicht nach der Punktluecke
  const angebote = angeboteFuer(groesstesBedarfsmodul(alt));
  const verliert = alt.pflegegrad > neu.pflegegrad;
  // Nur Kriterien, die der Nutzer gesehen und mit null beantwortet hat.
  const offeneImHebel = KRITERIEN.filter(
    (k) => k.modul === hebel && k.id !== "4.inko" && sichtbar(k.id, a) && a[k.id] === 0,
  );

  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="auge">Ergebnis nach allen amtlichen Kriterien</div>
        <h1>
          {verliert ? "Der Antragstag entscheidet über eine Stufe" : "Ihre Punkte im Vergleich"}
        </h1>

        <div className="ergebnis-paar abstand-m">
          <div className="ergebnis-feld jetzt">
            <div className="label">Antrag bis 31.12.2026</div>
            <div className="zahl-gross">{alt.pflegegrad === 0 ? "–" : `PG ${alt.pflegegrad}`}</div>
            <div className="zahl-zusatz">{punkte(alt.gesamtpunkte)} von 100 Punkten</div>
            <div className="zahl-geld">{geldsatz(alt.pflegegrad, "alt")}</div>
          </div>
          <div className="ergebnis-feld kuenftig">
            <div className="label">Antrag ab 1.1.2027</div>
            <div className="zahl-gross">{neu.pflegegrad === 0 ? "–" : `PG ${neu.pflegegrad}`}</div>
            <div className="zahl-zusatz">{punkte(neu.gesamtpunkte)} von 100 Punkten</div>
            <div className="zahl-geld">{geldsatz(neu.pflegegrad, "neu")}</div>
          </div>
        </div>

        {verliert && (
          <div className="hinweis hinweis-signal abstand-s">
            <div className="hinweis-titel">Gleiche Angaben, unterschiedliche Stufe</div>
            Nach heutigem Recht {alt.pflegegrad === 0 ? "kein Pflegegrad" : `Pflegegrad ${alt.pflegegrad}`}, nach neuem Recht{" "}
            {neu.pflegegrad === 0 ? "kein Pflegegrad" : `Pflegegrad ${neu.pflegegrad}`}. Maßgeblich ist das Recht am Tag
            der Antragstellung.
          </div>
        )}
        {!verliert && neu.bisNaechsteStufe !== null && neu.bisNaechsteStufe <= 5 && (
          <div className="hinweis hinweis-gelb abstand-s">
            <div className="hinweis-titel">Knapp unter der nächsten Stufe</div>
            Es fehlen {punkte(neu.bisNaechsteStufe)} Punkte zu Pflegegrad {neu.naechsteStufe}. Prüfen Sie die
            Kriterien im Modul {hebel} noch einmal.
          </div>
        )}

        <h2 className="abstand-l">Jedes Modul einzeln</h2>
        <p style={{ color: "var(--tinte-2)", fontSize: "var(--t-4)" }}>
          Gelb markiert sind die Module, in denen dieselben Einzelpunkte künftig weniger gewichtete
          Punkte ergeben.
        </p>
        <div className="tabelle-huelle" style={{ marginTop: 10 }}>
          <table className="daten">
            <thead>
              <tr>
                <th>Modul</th>
                <th>Einzelpunkte</th>
                <th>heute gewichtet</th>
                <th>ab 2027</th>
              </tr>
            </thead>
            <tbody>
              {alt.module.map((m, i) => {
                const n = neu.module[i];
                const geaendert = m.gewichtetePunkte !== n.gewichtetePunkte;
                return (
                  <tr key={m.modul} className={geaendert ? "geaendert" : undefined}>
                    <td>
                      <strong>{m.modul}</strong> {MODUL_NAMEN[m.modul]}
                      {m.modul === 2 && m.ausModul3 && (
                        <div className="quelle">zählt nicht, Modul 3 ist höher</div>
                      )}
                      {m.modul === 3 && m.ausModul3 && (
                        <div className="quelle">zählt für die Module 2 und 3</div>
                      )}
                    </td>
                    <td className="zahl">{m.einzelpunkte}</td>
                    <td className="zahl">{punkte(m.gewichtetePunkte)}</td>
                    <td className={`zahl ${geaendert ? "minus" : ""}`}>{punkte(n.gewichtetePunkte)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td>Gesamt</td>
                <td className="zahl">—</td>
                <td className="zahl">{punkte(alt.gesamtpunkte)}</td>
                <td className="zahl">{punkte(neu.gesamtpunkte)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="knopf-reihe">
          <button type="button" className="knopf knopf-zweit" onClick={() => window.print()}>
            Ergebnis ausdrucken
          </button>
          <button type="button" className="knopf knopf-zweit" onClick={zurueck}>
            Angaben ändern
          </button>
        </div>

        <h2 className="abstand-l">Wo noch Punkte fehlen könnten</h2>
        <div className="karte" style={{ marginTop: 10 }}>
          <h3>Modul {hebel}: {MODUL_NAMEN[hebel]}</h3>
          <p style={{ color: "var(--tinte-2)", fontSize: "var(--t-4)" }}>
            Hier ist rechnerisch der größte Abstand zum möglichen Höchstwert dieses Moduls. Das
            heißt nicht, dass dort etwas fehlt – es heißt nur, dass eine zweite Überlegung sich
            hier am ehesten auszahlt. <strong>Ändern Sie nichts, was nicht stimmt.</strong> Bei
            der Begutachtung wird nachgefragt, und eine Angabe, die nicht trägt, schadet dem
            ganzen Antrag.
          </p>
          {offeneImHebel.length > 0 && (
            <>
              <p style={{ fontSize: "var(--t-4)", marginBottom: 6 }}>
                <strong>Diese Punkte haben Sie mit „keine Hilfe nötig" beantwortet.</strong> Wenn
                Sie dabei etwas doch regelmäßig übernehmen, lohnt ein zweiter Blick:
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: "var(--t-4)", color: "var(--tinte-2)" }}>
                {offeneImHebel.slice(0, 6).map((k) => (
                  <li key={k.id}>{k.titel}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <h2 className="abstand-l">Was jetzt hilft</h2>
        <div className="gitter gitter-2" style={{ marginTop: 10 }}>
          <div className="karte">
            <h3>Begutachtungsmappe</h3>
            <p style={{ color: "var(--tinte-2)", fontSize: "var(--t-4)" }}>
              Pflegetagebuch, Modul-Checkliste und Vorbereitung auf den Termin, aus Ihren Angaben
              erzeugt.
            </p>
            <div className="preis">39 €</div>
            <div className="preis-zusatz">einmalig, sofort als PDF</div>
            <Link className="knopf" href="/mappe" style={{ marginTop: 12 }}>Mappe ansehen</Link>
          </div>
          <div className="karte">
            <h3>Bescheid schon da?</h3>
            <p style={{ color: "var(--tinte-2)", fontSize: "var(--t-4)" }}>
              Tragen Sie die Punkte aus dem Gutachten ein. Wir zeigen, wo die Abweichung zu Ihren
              Angaben liegt.
            </p>
            <div className="preis">kostenlos</div>
            <div className="preis-zusatz">Widerspruch nur bei Erfolg 350 €</div>
            <Link className="knopf knopf-zweit" href="/bescheid" style={{ marginTop: 12 }}>Bescheid prüfen</Link>
          </div>
        </div>

        {angebote.length > 0 && (
          <>
            <h2 className="abstand-l">Passend zu Ihrem Befund</h2>
            <p style={{ color: "var(--tinte-2)", fontSize: "var(--t-4)" }}>
              Diese Vorschläge folgen aus dem Modul mit dem größten Hilfebedarf. Für vermittelte
              Anfragen erhalten wir eine Vergütung. Das ändert nichts an der Berechnung.
            </p>
            {angebote.map((o) => (
              <div className="karte" key={o.id}>
                <h3>{o.titel}</h3>
                <p style={{ fontSize: "var(--t-4)", marginBottom: 6 }}>{o.grund}</p>
                <p style={{ fontSize: "var(--t-4)", color: "var(--tinte-2)", marginBottom: 12 }}>
                  <strong>Kasse:</strong> {o.kasse}
                </p>
                <a className="knopf knopf-zweit" href={`/api/klick?ziel=${o.id}&modul=${hebel}`} rel="nofollow sponsored">
                  Unverbindlich anfragen
                </a>
              </div>
            ))}
          </>
        )}

        <div className="abstand-l">
          <Lead
            anlass="ergebnis-genau"
            titel="Ergebnis aufbewahren und an die Frist erinnert werden"
            text="Wir schicken Ihnen eine Erinnerung vor dem 31. Dezember und melden, sobald das Gesetz beschlossen ist."
            befund={{
              pflegegradAlt: alt.pflegegrad,
              pflegegradNeu: neu.pflegegrad,
              punkteAlt: alt.gesamtpunkte,
              punkteNeu: neu.gesamtpunkte,
              hebelmodul: hebel,
            }}
          />
        </div>

        <div className="rdg abstand-m">
          Diese Berechnung wendet feste Regeln auf Ihre Eingaben an und ist keine Prüfung Ihres
          Einzelfalls und keine Rechtsberatung. Verbindlich ist allein die Begutachtung durch den
          Medizinischen Dienst. Die Werte für 2027 beruhen auf dem Regierungsentwurf vom
          30. September 2026 und können sich im parlamentarischen Verfahren noch ändern.
        </div>
      </div>
    </main>
  );
}
