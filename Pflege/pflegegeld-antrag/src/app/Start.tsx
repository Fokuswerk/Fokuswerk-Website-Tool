"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SCHNELL_FRAGEN, bewerte, MODUL_NAMEN, type Rohpunkte } from "@/lib/nba";
import { FAKTEN } from "@/lib/recht";
import Wahlgruppe from "@/components/Wahlgruppe";
import Lead from "@/components/Lead";
import Vertrauen from "@/components/Vertrauen";
import Schwellenband from "@/components/Schwellenband";
import Bild from "@/components/Bild";
import { Schloss, Paragraf, Uhr, Haken } from "@/components/Icon";
import { melden } from "@/lib/messen";

const GRAD_OPTIONEN = [
  "Noch keiner – wir überlegen gerade",
  "Antrag läuft, Bescheid steht aus",
  "Pflegegrad 1",
  "Pflegegrad 2",
  "Pflegegrad 3",
  "Pflegegrad 4",
  "Pflegegrad 5",
];

const GEWICHTE = [
  { nr: 1, name: "Mobilität", wert: 10 },
  { nr: 2, name: "Kognitive und kommunikative Fähigkeiten", wert: 15, geteilt: true },
  { nr: 3, name: "Verhaltensweisen und psychische Problemlagen", wert: 15, geteilt: true },
  { nr: 4, name: "Selbstversorgung", wert: 40 },
  { nr: 5, name: "Krankheits- und therapiebedingte Anforderungen", wert: 20 },
  { nr: 6, name: "Alltagsleben und soziale Kontakte", wert: 15 },
];

const WERKZEUGE = [
  { nr: "01", titel: "Genauer Punkterechner", text: "Alle amtlichen Kriterien, beide Rechtsstände nebeneinander.", ziel: "/check" },
  { nr: "02", titel: "Bescheid prüfen", text: "Punkte aus dem Gutachten eintragen und die Abweichung sehen.", ziel: "/bescheid" },
  { nr: "03", titel: "Leistungen vergleichen", text: "Was heute gezahlt wird und was ab Januar bleibt, in Euro im Monat.", ziel: "/reform" },
];

export default function Start({ tage }: { tage: number }) {
  const [schritt, setSchritt] = useState(0);
  /**
   * Waehrend die naechste Frage eingeblendet wird, nimmt die Gruppe keine
   * Eingabe an. Ohne diese Sperre beantwortet ein zweiter Tipp auf dieselbe
   * Stelle die naechste, noch ungesehene Frage - und genau das tut die
   * Zielgruppe haeufig.
   */
  const [uebergang, setUebergang] = useState(false);
  const [wahl, setWahl] = useState<Record<number, number>>({});
  const [gradWahl, setGradWahl] = useState<number | undefined>(undefined);

  const gesamtSchritte = SCHNELL_FRAGEN.length + 1;
  const fertig = schritt >= gesamtSchritte;
  /** Schritt 0 fragt den heutigen Pflegegrad, ab Schritt 1 folgen die Sachfragen. */
  const frageIndex = schritt - 1;

  const rohpunkte = useMemo<Rohpunkte>(() => {
    const r = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Rohpunkte;
    SCHNELL_FRAGEN.forEach((f, i) => {
      const w = wahl[i];
      if (w !== undefined) r[f.modul] = f.optionen[w].rohpunkte;
    });
    return r;
  }, [wahl]);

  /**
   * Sieben grobe Angaben können 65 Kriterien nicht ersetzen. Deshalb geben wir
   * einen Korridor aus statt einer einzelnen Stufe.
   */
  function korridor(grad: number): string {
    if (grad === 0) return "kein Pflegegrad";
    const unten = Math.max(1, grad - 1);
    const oben = Math.min(5, grad + 1);
    return unten === oben ? `Pflegegrad ${grad}` : `Pflegegrad ${unten} bis ${oben}`;
  }

  const alt = useMemo(() => bewerte(rohpunkte, "2026"), [rohpunkte]);
  const neu = useMemo(() => bewerte(rohpunkte, "2027"), [rohpunkte]);
  const aktuell = gradWahl === undefined ? null : gradWahl === 0 ? -1 : gradWahl === 1 ? -2 : gradWahl - 1;

  function waehle(i: number, index: number) {
    setWahl((w) => ({ ...w, [i]: index }));
  }
  function weiterZu(n: number) {
    setUebergang(true);
    setTimeout(() => {
      setSchritt((s) => Math.max(s, n));
      setUebergang(false);
    }, 260);
  }
  function antwort(i: number, index: number) {
    if (uebergang) return;
    setWahl((w) => ({ ...w, [i]: index }));
    melden("check_frage", { rechner: "schnell", frage: i + 2 });
    weiterZu(i + 2);
  }
  function gradAntwort(index: number) {
    if (uebergang) return;
    setGradWahl(index);
    melden("check_start", { rechner: "schnell" });
    weiterZu(1);
  }

  const lage = bewerteLage(alt.pflegegrad, neu.pflegegrad, aktuell, neu.bisNaechsteStufe);

  // Genau einmal melden, wenn das Ergebnis erscheint. Kein Inhalt, nur die Stufen.
  const gemeldet = useRef(false);
  useEffect(() => {
    if (!fertig || gemeldet.current) return;
    gemeldet.current = true;
    melden("check_fertig", {
      rechner: "schnell",
      grad_alt: alt.pflegegrad,
      grad_neu: neu.pflegegrad,
      verliert: alt.pflegegrad > neu.pflegegrad ? 1 : 0,
    });
  }, [fertig, alt.pflegegrad, neu.pflegegrad]);

  return (
    <main>
      {/* Bühne */}
      <section className="hero">
        <div className="huelle">
          <div className="hero-raster">
            <div>
              <div className="stichtag">
                <span className="punkt" aria-hidden="true" />
                {tage === 0
                  ? "Seit 1. Januar 2027 gelten neue Punktgrenzen"
                  : `Noch ${tage} Tage – bis zum 31. Dezember zählen die heutigen Punktgrenzen`}
              </div>
              <h1>Welcher Pflegegrad kommt für Ihren Angehörigen heraus?</h1>
              <p className="vorspann">
                Rechnen Sie es in 90 Sekunden aus – nach den amtlichen Kriterien, und zwar
                zweimal: nach heutigem Recht und nach den Punktgrenzen ab 1. Januar 2027. Für
                einen Antrag zählt das Recht vom Tag der Antragstellung.
              </p>
              <div className="knopf-reihe">
                <a className="knopf" href="#rechner">Pflegegrad berechnen</a>
                <Link className="knopf knopf-zweit" href="/bescheid">Bescheid prüfen</Link>
              </div>
            </div>
            <div className="hero-bild">
              <Bild
                name="hero"
                breiten={[900, 1500]}
                sizes="(min-width: 980px) 44vw, 100vw"
                hoehe={[1200, 1999]}
                alt="Die Hände einer älteren Person ruhen auf dem Griff eines Gehstocks"
                prioritaet
              />
            </div>
          </div>
            <ul className="vertrauensband">
              <li>
                <span className="icon"><Uhr size={17} /></span>
                <span>
                  <strong>90 Sekunden</strong>
                  <span className="klein">Sieben Fragen, keine Anmeldung</span>
                </span>
              </li>
              <li>
                <span className="icon"><Schloss size={17} /></span>
                <span>
                  <strong>Bleibt bei Ihnen</strong>
                  <span className="klein">Gerechnet wird im Browser</span>
                </span>
              </li>
              <li>
                <span className="icon"><Paragraf size={17} /></span>
                <span>
                  <strong>Amtliche Kriterien</strong>
                  <span className="klein">Anlage 1 zu § 15 SGB XI</span>
                </span>
              </li>
            </ul>
        </div>
      </section>

      {/* 01 — Rechner */}
      <section className="abschnitt" id="rechner">
        <div className="huelle">
          <span className="auge">Der Schnellcheck</span>
          <div className="spalten schmal-links">
            <div>
              <div>
                <h2>Sieben Fragen,<br />zwei Rechtsstände</h2>
                <p className="vorspann" style={{ marginTop: 22 }}>
                  Antworten Sie für einen durchschnittlichen Tag. Es zählt, was ohne Hilfe gelingt –
                  nicht, was an einem guten Tag möglich wäre.
                </p>
                <div className="rdg" style={{ marginTop: 34 }}>
                  Dies ist ein Rechner nach festen Regeln und keine Rechtsberatung. Es findet keine
                  Prüfung Ihres Einzelfalls statt. Die Berechnung läuft in Ihrem Browser, Angaben
                  zur Gesundheit werden nicht übertragen.
                </div>
              </div>
            </div>

            <div>
              {!fertig ? (
                <>
                  <div className="schritt-kopf">
                    <span className="schritt-zahl">
                      Frage {Math.min(schritt + 1, gesamtSchritte)} von {gesamtSchritte}
                    </span>
                    {schritt > 0 && (
                      <button type="button" onClick={() => setSchritt((s) => Math.max(0, s - 1))} className="knopf-still">
                        zurück
                      </button>
                    )}
                  </div>
                  <div
                    className="fortschritt"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={gesamtSchritte}
                    aria-valuenow={schritt}
                    aria-label="Fortschritt im Schnellcheck"
                  >
                    <div style={{ width: `${(schritt / gesamtSchritte) * 100}%` }} />
                  </div>
                  <p className="nur-vorlesen" role="status">
                    Frage {Math.min(schritt + 1, gesamtSchritte)} von {gesamtSchritte}
                  </p>

                  {schritt === 0 ? (
                    <div className={`auftritt${uebergang ? " uebergang" : ""}`} key="grad">
                      <div className="frage-nr" style={{ marginTop: 30 }}>Zum Einordnen</div>
                      <h3 className="frage-gross">Welcher Pflegegrad ist heute bewilligt?</h3>
                      <Wahlgruppe
                        name="Bewilligter Pflegegrad"
                        optionen={GRAD_OPTIONEN}
                        wert={gradWahl}
                        onWahl={setGradWahl}
                        onFestlegen={gradAntwort}
                      />
                    </div>
                  ) : (
                    <div className={`auftritt${uebergang ? " uebergang" : ""}`} key={schritt}>
                      <div className="frage-nr" style={{ marginTop: 30 }}>
                        Modul {SCHNELL_FRAGEN[frageIndex].modul} · {MODUL_NAMEN[SCHNELL_FRAGEN[frageIndex].modul]}
                      </div>
                      <h3 className="frage-gross">{SCHNELL_FRAGEN[frageIndex].frage}</h3>
                      <Wahlgruppe
                        name={SCHNELL_FRAGEN[frageIndex].frage}
                        optionen={SCHNELL_FRAGEN[frageIndex].optionen.map((o) => o.text)}
                        wert={wahl[frageIndex]}
                        onWahl={(i) => waehle(frageIndex, i)}
                        onFestlegen={(i) => antwort(frageIndex, i)}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="auftritt">
                  <div className="schritt-zahl" style={{ marginBottom: 20 }}>Schätzung aus sieben Angaben</div>
                  <div className="ergebnis-paar">
                    <div className="ergebnis-feld jetzt">
                      <div className="label">Antrag bis 31.12.2026</div>
                      <div className="zahl-gross">{alt.pflegegrad === 0 ? "–" : `PG ${alt.pflegegrad}`}</div>
                      <div className="zahl-zusatz">{alt.gesamtpunkte.toLocaleString("de-DE")} von 100 Punkten</div>
                    </div>
                    <div className="ergebnis-feld kuenftig">
                      <div className="label">Antrag ab 1.1.2027</div>
                      <div className="zahl-gross">{neu.pflegegrad === 0 ? "–" : `PG ${neu.pflegegrad}`}</div>
                      <div className="zahl-zusatz">{neu.gesamtpunkte.toLocaleString("de-DE")} von 100 Punkten</div>
                    </div>
                  </div>
                  <p className="korridor-hinweis">
                    Sieben Angaben können 65 Kriterien nicht ersetzen. Realistisch liegt das
                    Ergebnis bei einem Antrag noch in diesem Jahr im Bereich{" "}
                    <strong>{korridor(alt.pflegegrad)}</strong>, ab Januar bei{" "}
                    <strong>{korridor(neu.pflegegrad)}</strong>. Der genaue Rechner geht alle
                    Kriterien durch und engt das ein.
                  </p>

                  <div className={`hinweis ${lage.stil}`} style={{ marginTop: 34 }}>
                    <div className="hinweis-titel">{lage.titel}</div>
                    {lage.text}
                  </div>

                  <div className="knopf-reihe">
                    <Link className="knopf" href="/check">Jetzt genau rechnen</Link>
                    <Link className="knopf knopf-zweit" href="/antrag">
                      Nur den Antrag stellen
                    </Link>
                  </div>
                  <button
                    type="button"
                    className="knopf-still"
                    style={{ marginTop: 14 }}
                    onClick={() => { setSchritt(0); setWahl({}); setGradWahl(undefined); }}
                  >
                    Von vorn beginnen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 02 — Worum es geht */}
      <section className="abschnitt kalk strich-oben">
        <div className="huelle">
          <span className="auge">Worum es geht</span>
          <div className="spalten">
            <div>
              <h2>Eine Stunde am Küchentisch entscheidet über Jahre</h2>
            </div>
            <div>
              <p className="vorspann">
                Die Begutachtung dauert etwa eine Stunde. Was in dieser Stunde nicht zur Sprache
                kommt, taucht im Bescheid nicht auf – und fehlt dann jeden Monat.
              </p>
            </div>
          </div>
          <div className="kennzahlen" style={{ marginTop: "clamp(40px, 5vw, 76px)" }}>
            <div className="kennzahl">
              <span className="wert">347–990 €</span>
              <span className="bezeichnung">
                Pflegegeld im Monat, je nach Pflegegrad – Pflegegrad 1 bekommt keines. Ab 2027 sollen
                es nach dem Entwurf 380 bis 1.080 Euro sein.
              </span>
            </div>
            <div className="kennzahl">
              <span className="wert signal">18 %</span>
              <span className="bezeichnung">der Erstbegutachtungen endeten 2024 ohne Pflegegrad</span>
            </div>
            <div className="kennzahl">
              <span className="wert signal">22 %</span>
              <span className="bezeichnung">weniger anerkannte Erstbegutachtungen, wenn man die neuen Werte auf das heutige Versichertenkollektiv anwendet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Satz mit Bild */}
      <section className="abschnitt">
        <div className="huelle">
          <div className="bildblock">
            <div className="bildrahmen">
              <Bild
                name="gespraech"
                breiten={[760, 1300]}
                sizes="(min-width: 900px) 48vw, 100vw"
                hoehe={[507, 867]}
                alt="Eine ältere Frau erklärt im Gespräch am Tisch etwas mit der Hand"
              />
            </div>
            <div>
              <span className="auge auge-strich">Der häufigste Fehler</span>
              <h2>Nicht Übertreibung. Bescheidenheit.</h2>
              <p className="vorspann abstand-s">
                Angehörige halten für selbstverständlich, was im Gutachten als Unselbständigkeit
                zählt – das Richten der Medikamente, die Hand beim Aufstehen, das Erinnern an
                Termine. Genau diese Hilfe bringt die Punkte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — Was sich ändert */}
      <section className="abschnitt nacht">
        <div className="huelle">
          <span className="auge">Was zum 1. Januar 2027 gilt</span>
          <div className="spalten">
            <div><h2>Drei Änderungen, die zusammen wirken</h2></div>
            <div>
              <ul className="marken-liste">
                <li>
                  <span className="ziffer">01</span>
                  <span>
                    <strong>Höhere Schwellen.</strong> Pflegegrad 1 ab 15 statt 12,5 Punkten,
                    Pflegegrad 2 ab 30 statt 27, Pflegegrad 3 ab 50 statt 47,5.
                  </span>
                </li>
                <li>
                  <span className="ziffer">02</span>
                  <span>
                    <strong>Verschobene Punktspannen</strong> in den Modulen Mobilität,
                    Selbstversorgung und Alltagsleben. Dieselbe Hilfe ergibt dort weniger
                    gewichtete Punkte.
                  </span>
                </li>
                <li>
                  <span className="ziffer">03</span>
                  <span>
                    <strong>Keine Entscheidungsfrist</strong> von Januar bis April 2027. Die 25
                    Arbeitstage sind dann unbeachtlich – außer bei besonders dringlichem
                    Entscheidungsbedarf.
                  </span>
                </li>
              </ul>
              <p className="quelle" style={{ marginTop: 26 }}>{FAKTEN.verfahren.satz}</p>
            </div>
          </div>
        </div>
      </section>

      {/*
        Zwischenruf. Zwischen dem Ende des Schnellchecks und dem naechsten Knopf
        lagen 7.860 px - knapp zehn Handyschirme Lesestoff ohne eine einzige
        Moeglichkeit zu handeln. Genau hier, direkt nachdem klar wurde, dass sich
        die Grenzen verschieben, ist die Frage "und bei uns?" am lautesten.
        Bewusst anders gebaut als die uebrigen Baender: keine Augenbraue, keine
        Spalten, ein Satz und ein Knopf.
      */}
      <section className="zwischenruf">
        <div className="huelle">
          <div className="zwischenruf-reihe">
            <p>
              Und bei Ihrem Angehörigen?
              <span>90 Sekunden, beide Rechtsstände nebeneinander.</span>
            </p>
            <Link className="knopf" href="/check">Punkte ausrechnen</Link>
          </div>
        </div>
      </section>

      {/* 04 — Nachprüfbar */}
      <section className="abschnitt">
        <div className="huelle">
          <span className="auge auge-strich">Nachprüfbar</span>
          <div className="spalten schmal-links">
            <div>
              <h2>Die Grenzen verschieben sich, nicht Ihr Zustand</h2>
              <p className="vorspann" style={{ marginTop: 22 }}>{FAKTEN.schwellen.satz}</p>
            </div>
            <div>
              <Schwellenband />
            </div>
          </div>

          <div style={{ marginTop: "clamp(48px, 6vw, 92px)" }}>
            <Vertrauen />
            <div className="quellen-leiste">
              <a className="quellen-badge" href="https://www.gesetze-im-internet.de/sgb_11/anlage_2.html" target="_blank" rel="noopener noreferrer">
                <span className="marker" aria-hidden="true" />
                Anlage 2 zu § 15 SGB XI
              </a>
              <a className="quellen-badge" href="https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/Gesetze_und_Verordnungen/GuV/P/Kabinett-GE_Pflegeneuordnungsgesetz_PNOG.pdf" target="_blank" rel="noopener noreferrer">
                <span className="marker" aria-hidden="true" />
                Kabinettsentwurf PNOG
              </a>
              <span className="stempel">
                <Haken size={14} />
                Rechtsstand geprüft am 2. November 2026
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — Rechenweg */}
      <section className="abschnitt">
        <div className="huelle">
          <span className="auge auge-strich">Nichts Verstecktes</span>
          <div className="spalten schmal-links">
            <div>
              <h2>So wird gerechnet</h2>
              <p className="vorspann" style={{ marginTop: 22 }}>
                Sechs Module, jedes mit fester Gewichtung. Die Module 2 und 3 teilen sich ihren
                Anteil, gezählt wird nur der höhere Wert.
              </p>
            </div>
            <div>
              <div className="gewichte">
                {GEWICHTE.map((m) => (
                  <div className="gewicht" key={m.nr}>
                    <span className="gewicht-nr">0{m.nr}</span>
                    <span className="gewicht-name">
                      {m.name}
                      {m.geteilt && <span className="gewicht-notiz">geteilt</span>}
                    </span>
                    <span className="gewicht-balken" aria-hidden="true">
                      <span style={{ width: `${(m.wert / 40) * 100}%` }} />
                    </span>
                    <span className="gewicht-wert">{m.wert} %</span>
                  </div>
                ))}
              </div>
              <p className="quelle" style={{ marginTop: 22 }}>
                Gewichtung nach Anlage 2 zu § 15 SGB XI. Aus den Einzelpunkten je Modul wird ein
                Schweregrad, daraus die gewichteten Punkte, daraus die Summe bis 100.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 07 — Werkzeuge */}
      <section className="abschnitt himmelbett">
        <div className="huelle">
          <span className="auge auge-strich">Drei Werkzeuge</span>
          <h2 style={{ maxWidth: "16ch" }}>Rechnen, prüfen, vergleichen</h2>
          <div className="ablauf" style={{ marginTop: "clamp(32px, 4vw, 60px)" }}>
            {WERKZEUGE.map((w) => (
              <div className="ablauf-schritt" key={w.nr}>
                <span className="ablauf-nr">{w.nr}</span>
                <h3>{w.titel}</h3>
                <p style={{ marginBottom: 22 }}>{w.text}</p>
                <Link className="textlink" href={w.ziel}>Öffnen</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fragen und Antworten */}
      <section className="abschnitt">
        <div className="huelle">
          <div className="spalten schmal-links">
            <div>
              <span className="auge auge-strich">Häufige Fragen</span>
              <h2>Kurz beantwortet</h2>
              <p className="vorspann abstand-s">
                Wenn etwas fehlt, schreiben Sie uns. Wir nehmen die Frage auf.
              </p>
            </div>
            <div className="faq">
              <details>
                <summary>Was kostet die Berechnung?</summary>
                <div className="antwort">
                  <p>
                    Nichts. Es gibt keine Anmeldung, kein Konto und keine Kosten. Auch der
                    genaue Rechner und die Bescheidprüfung sind kostenlos.
                  </p>
                </div>
              </details>
              <details>
                <summary>Ersetzt das die Begutachtung durch den Medizinischen Dienst?</summary>
                <div className="antwort">
                  <p>
                    Nein. Verbindlich ist allein die Begutachtung und der Bescheid Ihrer
                    Pflegekasse. Dieser Rechner wendet dieselben Kriterien an, damit Sie wissen,
                    worauf es ankommt – er ersetzt weder Gutachten noch Rechtsberatung.
                  </p>
                </div>
              </details>
              <details>
                <summary>Warum bekomme ich zwei Ergebnisse?</summary>
                <div className="antwort">
                  <p>
                    Weil zum 1. Januar 2027 andere Punktgrenzen gelten sollen. Nach dem
                    Kabinettsentwurf zählt für einen Antrag das Recht vom Tag der
                    Antragstellung. Deshalb sehen Sie beide Stände nebeneinander.
                  </p>
                </div>
              </details>
              <details>
                <summary>Mein Angehöriger hat schon einen Pflegegrad. Kann der wegfallen?</summary>
                <div className="antwort">
                  <p>
                    Nach dem Entwurf nicht: Ein bestehender Pflegegrad kann nicht allein wegen
                    der neuen Schwellenwerte <em>und der neuen Bewertungssystematik</em> verloren
                    gehen. Wird die Person wieder selbständiger, schützt die Regel allerdings
                    nicht. Für eine Höherstufung zählt das Recht am Tag der Antragstellung – bei
                    einer Wiederholungsbegutachtung dagegen der Tag des Termins.
                  </p>
                </div>
              </details>
              <details>
                <summary>Was passiert mit meinen Angaben?</summary>
                <div className="antwort">
                  <p>
                    Sie bleiben in Ihrem Browser. Angaben zur gesundheitlichen Lage werden nicht
                    an uns übertragen. Nur wenn Sie ein Formular ausfüllen und zustimmen,
                    erreichen uns Ihre Kontaktdaten.
                  </p>
                </div>
              </details>
              <details>
                <summary>Wie lange dauert die Entscheidung der Pflegekasse?</summary>
                <div className="antwort">
                  <p>
                    Im Regelfall 25 Arbeitstage ab Eingang des Antrags. Nach dem Entwurf ist
                    diese Frist vom 1. Januar bis zum 30. April 2027 unbeachtlich – außer bei
                    „besonders dringlichem Entscheidungsbedarf“, dann bleiben es 25 Arbeitstage.
                    Nach welchen Kriterien das beurteilt wird, soll der Spitzenverband Bund der
                    Pflegekassen erst noch festlegen. Ein weiterer Grund, einen Antrag nicht in
                    den Januar zu schieben.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* 08 — Abschluss */}
      <section className="abschnitt nacht">
        <div className="huelle">
          <div className="spalten schmal-links">
            <div>
              {tage > 0 && (
                <div className="zaehler">
                  <b>{tage}</b>
                  <span>Tage bis zum Stichtag</span>
                </div>
              )}
              <h2>Der Antragstag entscheidet.<br />Nicht der Bescheidtag.</h2>
              <p className="vorspann" style={{ marginTop: 22 }}>
                Wer bis zum 31. Dezember 2026 beantragt, wird nach den heutigen Punktgrenzen
                bewertet. Prüfen Sie in anderthalb Minuten, ob das für Sie zählt.
              </p>
              <div className="knopf-reihe">
                <a className="knopf knopf-hell" href="#rechner">Kostenlos prüfen</a>
              </div>
            </div>
            <div>
              <Lead
                anlass="startseite"
                titel="Soll ich Sie an die Frist erinnern?"
                text="Eine Mail, wenn Bundestag und Bundesrat entschieden haben, und eine Erinnerung vor dem 31. Dezember. Sonst nichts."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function bewerteLage(
  gradAlt: number,
  gradNeu: number,
  aktuell: number | null,
  bisNaechste: number | null,
): { stil: string; titel: string; text: string } {
  if (gradAlt > gradNeu) {
    return {
      stil: "hinweis-signal",
      titel: "Für Sie entscheidet der Antragstag",
      text:
        `Nach heutigem Recht ergeben Ihre Angaben Pflegegrad ${gradAlt || "–"}, nach dem neuen Recht ` +
        `${gradNeu === 0 ? "keinen Pflegegrad" : `Pflegegrad ${gradNeu}`}. Ein Antrag, der noch 2026 gestellt wird, ` +
        "wird nach den heutigen Punktgrenzen bewertet. Das ist der Unterschied einer ganzen Stufe.",
    };
  }
  if (aktuell === -1 && gradAlt >= 1) {
    return {
      stil: "hinweis-signal",
      titel: "Der Antrag lohnt sich, und er lohnt sich jetzt",
      text:
        `Ihre Angaben liegen im Bereich von Pflegegrad ${gradAlt}. Für die Bewertung zählt das Recht am Tag ` +
        "der Antragstellung. Ab Januar gelten höhere Schwellen, und bis Ende April muss die Pflegekasse " +
        "keine Entscheidungsfrist einhalten.",
    };
  }
  if (aktuell !== null && aktuell > 0 && gradAlt > aktuell) {
    return {
      stil: "hinweis-signal",
      titel: `Ihre Angaben deuten auf mehr als Pflegegrad ${aktuell}`,
      text:
        `Gerechnet kommen Ihre Angaben auf Pflegegrad ${gradAlt}. Ein Höherstufungsantrag wird nach dem Recht ` +
        "am Antragstag bewertet – bis 31. Dezember also nach den heutigen Grenzen.",
    };
  }
  if (bisNaechste !== null && bisNaechste <= 5) {
    return {
      stil: "hinweis-gelb",
      titel: "Sie liegen dicht an der nächsten Stufe",
      text:
        `Es fehlen ${bisNaechste.toLocaleString("de-DE")} Punkte zur nächsthöheren Stufe. In dieser Lage entscheidet, ` +
        "ob jedes Kriterium vollständig erfasst ist. Der genaue Rechner geht alle durch.",
    };
  }
  if (aktuell !== null && aktuell > 0) {
    return {
      stil: "hinweis-gut",
      titel: "Ihr Pflegegrad fällt nicht wegen der Reform",
      text:
        "Nach dem Entwurf darf eine Neueinstufung den bestehenden Pflegegrad nicht allein wegen der " +
        "neuen Schwellenwerte und der neuen Bewertungssystematik kosten. Verliert die Person den Grad, " +
        "weil sie wieder selbständiger geworden ist, schützt die Regel nicht. Für eine Höherstufung " +
        "zählt der Tag der Antragstellung – bei einer Wiederholungsbegutachtung dagegen der Tag des Termins.",
    };
  }
  return {
    stil: "",
    titel: "Nach diesen sieben Angaben ändert sich nichts",
    text:
      "Das heißt nicht, dass die Reform an Ihnen vorbeigeht. Dieser Schnellcheck vergleicht nur die " +
      "Punktgrenzen. Die Reform verschiebt zusätzlich die Punktspannen in den Modulen 1, 4 und 6 – " +
      "dieselben Angaben ergeben dort künftig eine niedrigere Stufe. Das kann nur der genaue Rechner zeigen.",
  };
}
