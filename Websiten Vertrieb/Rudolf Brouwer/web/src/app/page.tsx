import Link from "next/link";
import Image from "next/image";
import Niveau from "@/components/Niveau";
import Auftritt from "@/components/Auftritt";
import Bild from "@/components/Bild";
import Projektberater from "@/components/Projektberater";
import { betrieb } from "@/daten/betrieb";
import { leistungen } from "@/daten/leistungen";

const belege = [
  { zahl: "1962", einheit: "", label: "Gegründet", satz: "Rudolf Brouwer beginnt am 22. Januar in der Garage seines Vaters in Nordmoslesfehn." },
  { zahl: "500", einheit: "m²", label: "Ausstellung", satz: "Bad und Pool zum Anfassen — in dieser Größe seit 1996, zuletzt 2020 umgebaut." },
  { zahl: "24", einheit: "h", label: "Notdienst", satz: "Fällt die Heizung am Wochenende aus, bleibt der Betrieb erreichbar." },
];

const aufgaben = [
  {
    nr: "01",
    fach: "Bad",
    frage: "Viele Gewerke. Viele Termine. Viele Ansprechpartner.",
    text: "Ein Bad zu erneuern heißt, fünf Handwerke in die richtige Reihenfolge zu bringen. Wer koordiniert, entscheidet über die Bauzeit.",
    loesung: "Brouwer plant die Reihenfolge und bestellt Maurer, Fliesenleger, Elektriker, Maler und Innenausbau selbst.",
  },
  {
    nr: "02",
    fach: "Heizung",
    frage: "Alte Anlage. Hohe Kosten. Unklare Entscheidung.",
    text: "Sechs Systeme kommen in Frage, jedes mit anderen Voraussetzungen. Die falsche Auslegung kostet zwanzig Jahre lang Geld.",
    loesung: "Vor der Technik steht die Rechnung: der tatsächliche Wärmebedarf des Gebäudes nach Wärmeschutzverordnung.",
  },
  {
    nr: "03",
    fach: "Pool",
    frage: "Viele Bauteile, die dauerhaft zusammenarbeiten müssen.",
    text: "Pumpe, Filter, Wärmetauscher und Wasseraufbereitung sind eine Anlage, kein Zubehör. Sie fällt dort aus, wo sie schlecht geplant wurde.",
    loesung: "Beheizt wird ein Pool von denselben Leuten, die seit Jahrzehnten Heizungen bauen.",
  },
];

const baeder = [
  { datei: "bad-02.webp", alt: "Fertiges Bad mit wandhängendem Waschtisch, Spiegelschrank und gemusterter Wand unter einer Dachschräge" },
  { datei: "bad-03.webp", alt: "Bad mit Doppelwaschtisch, beleuchtetem Spiegel und bodengleicher Dusche" },
  { datei: "bad-07.webp", alt: "Bad mit grau lackierten Möbeln, Doppelwaschtisch und Glasdusche" },
  { datei: "bad-08.webp", alt: "Doppelwaschtisch mit Holzablage und großem beleuchtetem Spiegel" },
  { datei: "bad-05.webp", alt: "Bad mit Handtuchheizkörper, bodengleicher Dusche und wandhängendem WC" },
];

export default function Startseite() {
  return (
    <>
      {/* ================= Hero ================= */}
      <section className="hero">
        <div className="bahn">
          <p className="marke hero-marke sacht">
            Bad · Heizung · Energie · Pool <span className="hero-ort">— Wardenburg</span>
          </p>

          <h1 className="hero-titel">
            <span className="zeile"><span style={{ "--verzug": "80ms" } as React.CSSProperties}>Erst ansehen.</span></span>
            <span className="zeile"><span style={{ "--verzug": "200ms" } as React.CSSProperties}>Dann entscheiden.</span></span>
          </h1>

          <div className="hero-linie sacht" style={{ "--verzug": "420ms" } as React.CSSProperties}>
            <p className="blei satz hero-blei">
              Über 500 Quadratmeter Ausstellung für Bad und Pool, am Ortseingang von {betrieb.ort}.
              Seit {betrieb.gruendung} plant, baut und wartet dieser Familienbetrieb Bäder, Heizungen
              und Schwimmbäder — und koordiniert die anderen Gewerke gleich mit.
            </p>
            <div className="hero-knoepfe">
              <Link href="/kontakt#anfrage" className="knopf">Projekt anfragen</Link>
              <Link href="/ausstellung" className="knopf knopf-still">Ausstellung ansehen</Link>
            </div>
          </div>

          {/* Triptychon: der Raum, das Detail, das Ergebnis */}
          <div className="hero-bilder">
            <figure className="hero-bild blende" style={{ "--verzug": "540ms" } as React.CSSProperties}>
              <Image src="/bilder/hero-raum.webp" alt="Blick in den Ausstellungsraum der Rudolf Brouwer GmbH mit Treppe und Duschabtrennungen" width={620} height={454} sizes="(max-width: 767px) 92vw, 41vw" priority />
              <figcaption className="marke">Der Raum</figcaption>
            </figure>
            <figure className="hero-bild blende" style={{ "--verzug": "660ms" } as React.CSSProperties}>
              <Image src="/bilder/hero-detail.webp" alt="Kupferrohre, Fittings und eine Rohrzange auf einer technischen Zeichnung" width={660} height={611} sizes="(max-width: 767px) 92vw, 32vw" priority />
              <figcaption className="marke">Das Detail</figcaption>
            </figure>
            <figure className="hero-bild blende" style={{ "--verzug": "780ms" } as React.CSSProperties}>
              <Image src="/bilder/hero-bad.webp" alt="Fertiggestelltes Badezimmer mit Doppelwaschtisch, Holzfront und beleuchtetem Spiegel" width={512} height={644} sizes="(max-width: 767px) 92vw, 23vw" />
              <figcaption className="marke">Das Ergebnis</figcaption>
            </figure>
          </div>

          {/* Belege auf der Niveaulinie */}
          <ul className="belege">
            {belege.map((b) => (
              <li key={b.label}>
                <span className="beleg-zahl jahr">{b.zahl}<span className="beleg-einheit">{b.einheit}</span></span>
                <span className="marke beleg-label">{b.label}</span>
                <span className="still beleg-satz">{b.satz}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= Die Aufgabe ================= */}
      <section className="takt kapitel-aufgabe">
        <div className="bahn">
          <Niveau marke="Wobei es klemmt" ziffer="01 / 05" />
          <div className="aufgabe-kopf">
            <h2 className="satz-eng">Bevor es um Technik geht, geht es um die Reihenfolge.</h2>
            <p className="still satz aufgabe-anriss">
              Drei Vorhaben, drei Arten von Ärger. Was sie gemeinsam haben: Sie scheitern selten
              an einem Bauteil, sondern an der Koordination.
            </p>
          </div>

          <ol className="aufgaben">
            {aufgaben.map((a, i) => (
              <Auftritt as="li" key={a.nr} verzug={i * 90}>
                <div className="aufgabe-zeile">
                  <span className="kennziffer aufgabe-nr">{a.nr}</span>
                  <span className="marke marke-akzent aufgabe-fach">{a.fach}</span>
                </div>
                <h3 className="aufgabe-frage">{a.frage}</h3>
                <p className="still aufgabe-text">{a.text}</p>
                <p className="aufgabe-loesung">{a.loesung}</p>
              </Auftritt>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= Leistungen ================= */}
      <section className="takt kapitel-leistungen">
        <div className="bahn">
          <Niveau marke="Was wir übernehmen" ziffer="02 / 05" />
          <h2 className="satz-eng leistungen-titel">
            Fünf Aufgaben, wie Kundinnen und Kunden sie stellen.
          </h2>

          <ul className="leistungsliste">
            {leistungen.map((l, i) => (
              <Auftritt as="li" key={l.weg} verzug={i * 60}>
                <Link href={l.weg} className="leistung">
                  <span className="leistung-nr kennziffer">{String(i + 1).padStart(2, "0")}</span>
                  <span className="leistung-mitte">
                    <span className="marke marke-akzent">{l.marke}</span>
                    <span className="leistung-titel">{l.titel}</span>
                    <span className="still leistung-anriss">{l.anriss}</span>
                    <span className="still leistung-gewerk">{l.gewerk}</span>
                  </span>
                  <span className="leistung-bild">
                    <Bild datei={l.bild} alt={l.alt} verhaeltnis="4 / 3" sizes="(max-width: 899px) 40vw, 260px" />
                  </span>
                  <span className="leistung-pfeil" aria-hidden="true">
                    <svg width="22" height="10" viewBox="0 0 22 10" fill="none"><path d="M0 5h20M16 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" /></svg>
                  </span>
                </Link>
              </Auftritt>
            ))}
          </ul>

          {/* Gebaute Bäder — echte Projekte, keine Musterbilder */}
          <div className="baeder">
            <div className="niveau baeder-kopf">
              <p className="marke">Gebaute Bäder</p>
              <span className="kennziffer">aus dem eigenen Auftragsbuch</span>
            </div>
            <ul className="baeder-band">
              {baeder.map((b, i) => (
                <Auftritt as="li" key={b.datei} verzug={i * 70}>
                  <Bild datei={b.datei} alt={b.alt} verhaeltnis="4 / 5" sizes="(max-width: 767px) 62vw, 18vw" />
                </Auftritt>
              ))}
            </ul>
            <p className="still baeder-fuss">
              Aufnahmen aus abgeschlossenen Bädern des Betriebs.
              {/* TODO: reale Referenz ergänzen — Ort, Jahr und Umfang je Bad vom Kunden erfragen. */}
            </p>
          </div>
        </div>
      </section>

      {/* ================= Die Ausstellung ================= */}
      <section className="takt kapitel-ausstellung">
        <div className="bahn">
          <Niveau marke="Der Unterschied" ziffer="03 / 05" />
          <div className="ausstellung-raster">
            <div className="ausstellung-text">
              <h2>Andere haben einen Konfigurator. Brouwer hat einen Raum.</h2>
              <p className="blei still ausstellung-blei">
                Über 500 Quadratmeter an der Oldenburger Straße, 2020 neu aufgeteilt in Sanitär-
                und Poolbereich. Fliesen, Armaturen, Möbel und Duschabtrennungen stehen dort in
                echter Größe — mit dem Licht, das sie später auch haben.
              </p>
              <ul className="liste-strich ausstellung-liste">
                <li><strong>Bad und Pool unter einem Dach.</strong> <span className="still">Zwei Bereiche, die sonst in zwei Betrieben liegen.</span></li>
                <li><strong>Beratung nach Termin.</strong> <span className="still">Damit jemand Zeit hat, statt zwischen zwei Baustellen zu erklären.</span></li>
                <li><strong>3D-Brille für die Planung.</strong> <span className="still">Sie gehen durch den Entwurf, bevor die erste Fliese fällt.</span></li>
              </ul>
              <Link href="/ausstellung" className="pfeil ausstellung-pfeil">
                Die Ausstellung ansehen
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" /></svg>
              </Link>
            </div>

            <div className="ausstellung-bilder">
              <Auftritt className="ausstellung-gross">
                <Bild datei="a-badbereich.webp" alt="Badbereich der Ausstellung mit Waschtisch, Spiegelschrank und Handtuchheizkörper" verhaeltnis="3 / 2" sizes="(max-width: 899px) 92vw, 46vw" />
              </Auftritt>
              <Auftritt verzug={90}>
                <Bild datei="a-wandtext.webp" alt="Wandbeschriftung in der Ausstellung mit einer Definition des Wortes Bad" verhaeltnis="3 / 2" sizes="(max-width: 899px) 45vw, 22vw" />
              </Auftritt>
              <Auftritt verzug={160}>
                <Bild datei="a-armatur.webp" alt="Armatur an einem Waschbecken in Nahaufnahme" verhaeltnis="3 / 2" sizes="(max-width: 899px) 45vw, 22vw" />
              </Auftritt>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Pool & Wellness ================= */}
      <section className="takt kapitel-pool auf-dunkel">
        <div className="bahn">
          <Niveau marke="Pool & Wellness" ziffer="04 / 05" />
          <div className="pool-kopf">
            <h2 className="pool-titel">
              Eine ruhige Fläche.<br />
              <span className="pool-unter">Darunter eine Anlage, die nie stillsteht.</span>
            </h2>
            <p className="still satz pool-blei">
              Oben Wasser, Licht und eine Kante aus Stein. Unten Pumpe, Filter, Wärmetauscher
              und Wasseraufbereitung, die dauerhaft zusammenarbeiten müssen. Der zweite Teil
              entscheidet, ob der erste hält.
            </p>
          </div>

          {/* Die Wasserlinie: dasselbe Motiv, hier als Wasseroberfläche */}
          <div className="wasserlinie" aria-hidden="true">
            <span className="wasserlinie-marke">Wasserlinie</span>
            <span className="wasserlinie-strich" />
          </div>

          <div className="pool-raster">
            <Auftritt className="pool-bild">
              <Bild datei="regendusche.webp" alt="Regendusche über dunklen Fliesen, fallendes Wasser" verhaeltnis="4 / 3" sizes="(max-width: 899px) 92vw, 56vw" />
            </Auftritt>

            <ul className="pool-liste">
              <li>
                <Bild datei="whirlpool.webp" alt="Whirlpool mit Massagedüsen und sprudelnder Wasseroberfläche" verhaeltnis="1 / 1" sizes="96px" klasse="pool-daumen" />
                <div>
                  <h3 className="pool-name">Whirlpool</h3>
                  <p className="still pool-text">Masterjet-Düsen, Bodengeysir, Minijets. Filtration und Massageanlage sitzen auf einer eigenen Technikpalette — das hält die Montage vor Ort kurz.</p>
                </div>
              </li>
              <li>
                <Bild datei="dampfdusche.webp" alt="Freistehende Dampfdusche mit gerundeter Glasfront" verhaeltnis="1 / 1" sizes="96px" klasse="pool-daumen" />
                <div>
                  <h3 className="pool-name">Dampfdusche</h3>
                  <p className="still pool-text">Morgens Dusche, abends Dampfbad — auf der Fläche einer normalen Dusche. Höchstens 50 Grad bei voller Luftfeuchte.</p>
                </div>
              </li>
              <li>
                <Bild datei="a-poolpflege.webp" alt="Regal mit Mitteln zur Wasserpflege im Poolbereich der Ausstellung" verhaeltnis="1 / 1" sizes="96px" klasse="pool-daumen" />
                <div>
                  <h3 className="pool-name">Wasser und Technik</h3>
                  <p className="still pool-text">Filteranlage, Wasseraufbereitung, Wärmetauscher, Abdeckung. Eine neue Filterpumpe kann einen erheblichen Teil des Stroms sparen, den die alte zieht.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="pool-fuss">
            <p className="still satz-eng">
              Der Schwimmbadbereich liegt bei der {betrieb.pool.name} an derselben Adresse.
              Ansprechpartner sind {betrieb.pool.ansprech}.
            </p>
            <Link href="/leistungen/pool-wellness" className="pfeil">
              Pool und Wellness im Detail
              <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= Projektberater ================= */}
      <section className="takt kapitel-berater">
        <div className="bahn">
          <Niveau marke="Wo fange ich an" ziffer="05 / 05" />
          <Projektberater />
        </div>
      </section>

      {/* ================= Seit 1962 ================= */}
      <section className="takt kapitel-jahr">
        <div className="bahn">
          <Niveau marke="Der Betrieb" ziffer="Wardenburg, Oldenburger Straße 209" />

          <div className="jahr-kopf">
            <span className="jahr jahr-zahl">1962</span>
            <p className="blei jahr-satz">
              gegründet in der Garage des Vaters, in Nordmoslesfehn.
              Zwei Jahre später arbeitet Hannelore Brouwer mit im Betrieb.
            </p>
          </div>

          <ol className="marken">
            <li>
              <span className="jahr marken-jahr">1966</span>
              <span className="marken-text">Umzug nach Wardenburg — zunächst in das alte Rathaus, mit Garage für die Werkstatt.</span>
            </li>
            <li>
              <span className="jahr marken-jahr">1973</span>
              <span className="marken-text">An den Ortseingang, in eine neu gebaute Halle. Dieselbe Adresse bis heute.</span>
            </li>
            <li>
              <span className="jahr marken-jahr">1996</span>
              <span className="marken-text">Die Ausstellung wird auf rund 500 Quadratmeter aufgestockt.</span>
            </li>
            <li>
              <span className="jahr marken-jahr">2020</span>
              <span className="marken-text">Neues Erscheinungsbild — und Umbau der Ausstellung in Sanitär- und Poolbereich.</span>
            </li>
          </ol>

          <Auftritt className="jahr-band">
            <Bild
              datei="chronik-schild.webp"
              alt="Firmenwagen von 1971 und das Firmenschild von 1962"
              verhaeltnis="20 / 9"
              sizes="(max-width: 767px) 92vw, 820px"
            />
            <div className="jahr-band-fuss">
              <p className="marke">Firmenwagen 1971 · Firmenschild 1962</p>
              <Link href="/unternehmen" className="pfeil">
                Die ganze Chronik
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true"><path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" /></svg>
              </Link>
            </div>
          </Auftritt>
        </div>
      </section>

      {/* ================= Karriere ================= */}
      <section className="kapitel-karriere">
        <div className="bahn">
          <div className="karriere-raster">
            <Auftritt className="karriere-bild">
              <Bild datei="team.webp" alt="Das Team der Rudolf Brouwer GmbH bei einer gemeinsamen Veranstaltung" verhaeltnis="4 / 3" sizes="(max-width: 899px) 92vw, 38vw" />
            </Auftritt>
            <div className="karriere-text">
              <p className="marke">Arbeiten bei Brouwer</p>
              <h2>Anlagenmechaniker, Kundendienst, Ausbildung.</h2>
              <p className="still satz karriere-blei">
                Unbefristeter Vertrag, übertarifliche Bezahlung, 30 Tage Urlaub, Freizeitausgleich
                für Überstunden — und mit dem Firmenwagen zur Arbeit. Wer erst einmal reinsehen
                will: Ein Praktikum ist ausdrücklich möglich.
              </p>
              <div className="karriere-knoepfe">
                <Link href="/karriere" className="knopf">Offene Stellen</Link>
                <Link href="/karriere/ausbildung" className="knopf knopf-still">Ausbildung</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Abschluss ================= */}
      <section className="kapitel-abschluss auf-dunkel">
        <div className="bahn">
          <div className="abschluss-raster">
            <div>
              <h2 className="abschluss-titel">Rufen Sie an. Das geht schneller als jedes Formular.</h2>
              <p className="still satz abschluss-blei">
                Für alles andere gibt es das Formular — mit Auswahl statt fünfzehn Pflichtfeldern.
              </p>
            </div>
            <div className="abschluss-aktionen">
              <a href={`tel:${betrieb.telefonRoh}`} className="abschluss-nummer">{betrieb.telefon}</a>
              <p className="marke abschluss-zeiten">
                Mo–Do 8.30–12.30 · 14.00–17.00 Uhr <span className="abschluss-trenn">·</span> Fr 8.30–12.30 Uhr
              </p>
              <Link href="/kontakt#anfrage" className="knopf abschluss-knopf">Projekt anfragen</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
