import { FAKTEN } from "@/lib/recht";

/** Nur die Absaetze, die woertlich so im Entwurf stehen. */
const WORTLAUT = [FAKTEN.antragstagEntscheidet, FAKTEN.bestandsschutz, FAKTEN.fristAusgesetzt];

export const metadata = { title: "Rechtliches und Quellen – Pflegegeld-Antrag" };

const QUELLEN: { was: string; wo: string; link?: string }[] = [
  {
    was: "Kriterien und Einzelpunkte des Begutachtungsinstruments",
    wo: "Anlage 1 zu § 15 SGB XI",
    link: "https://www.gesetze-im-internet.de/sgb_11/anlage_1.html",
  },
  {
    was: "Gewichtung der Module und Punktspannen, heutige Fassung",
    wo: "Anlage 2 zu § 15 SGB XI",
    link: "https://www.gesetze-im-internet.de/sgb_11/anlage_2.html",
  },
  {
    was: "Neue Punktspannen, Schwellenwerte, Budgets und Übergangsregelung",
    wo: "Kabinettsentwurf des Pflegeneuordnungsgesetzes vom 30. September 2026",
    link: "https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/Gesetze_und_Verordnungen/GuV/P/Kabinett-GE_Pflegeneuordnungsgesetz_PNOG.pdf",
  },
  {
    was: "Leistungsbeträge 2026",
    wo: "Übersicht des Bundesgesundheitsministeriums, Stand 4. November 2025",
    link: "https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/P/Pflegeversicherung_Leistungsbeitraege/Uebersicht_Leistungsbetraege_2026.pdf",
  },
  {
    was: "Rechner mit Frage-und-Antwort-Schema sind keine Rechtsdienstleistung",
    wo: "Bundesgerichtshof, Urteil vom 9. September 2021, I ZR 113/20",
    link: "https://www.brak.de/newsroom/news/bgh-vertragsdokumente-generator-smartlaw-zulaessig/",
  },
  {
    was: "Zurückweisung eines Pflegeberaters als Bevollmächtigtem im Widerspruchsverfahren nicht beanstandet (Schwerbehindertenrecht, Sachfrage nicht entschieden)",
    wo: "Bundessozialgericht, Beschluss vom 13. Juli 2018, B 9 SB 89/17 B",
    link: "https://rewis.io/urteile/urteil/vtn-13-07-2018-b-9-sb-8917-b/",
  },
];

export default function Rechtliches() {
  return (
    <main className="band">
      <div className="huelle-schmal">
        <h1>Rechtliches und Quellen</h1>

        <h2 className="abstand-l">Was dieses Angebot ist</h2>
        <p>
          Pflegegeld-Antrag ist ein Rechner. Er wendet die amtlichen Kriterien und Punktwerte des
          Begutachtungsinstruments auf Ihre Eingaben an, nach festen Regeln und in beiden
          Rechtsständen. Es findet keine Prüfung Ihres Einzelfalls statt, es wird nichts rechtlich
          bewertet, und es wird keine Rechtsberatung erbracht. Verbindlich ist allein die
          Begutachtung durch den Medizinischen Dienst und der Bescheid Ihrer Pflegekasse.
        </p>
        <p>
          Kostenlose und unabhängige Beratung erhalten Sie bei der Pflegeberatung nach § 7a SGB XI,
          bei den Pflegestützpunkten und bei den Verbraucherzentralen.
        </p>

        <h2 className="abstand-l">Ihre Daten</h2>
        <p>
          Alle Angaben zur gesundheitlichen Lage werden ausschließlich in Ihrem Browser verarbeitet.
          Sie werden nicht an uns übertragen. Der genaue Rechner speichert Ihre Zwischenstände im
          lokalen Speicher Ihres Browsers, damit Sie später weitermachen können; Sie können diesen
          Speicher jederzeit über die Einstellungen Ihres Browsers löschen.
        </p>
        <p>
          Nur wenn Sie ein Formular ausfüllen und ausdrücklich zustimmen, erreichen uns Ihre
          Kontaktdaten sowie die Kennzahlen, die im Formular genannt sind. Gesundheitsangaben
          übermitteln wir dabei nicht.
        </p>

        <h2 className="abstand-l">Vergütung</h2>
        <p>
          Für Anfragen, die wir an Anbieter vermitteln, erhalten wir eine Vergütung. Das beeinflusst
          die Berechnung nicht. Welche Vorschläge erscheinen, richtet sich nach dem Modul mit dem
          größten Hilfebedarf, nicht nach der Höhe der Vergütung.
        </p>

        <h2 className="abstand-l">Stand des Gesetzgebungsverfahrens</h2>
        <div className="hinweis hinweis-gelb">
          <div className="hinweis-titel">Die Werte für 2027 sind noch nicht beschlossen</div>
          {FAKTEN.verfahren.satz} Alle mit „ab 2027“ oder „laut Entwurf“ bezeichneten Angaben
          stammen aus dem Kabinettsentwurf und können sich im parlamentarischen Verfahren ändern.
        </div>

        <h2 className="abstand-l">Die tragenden Sätze im Wortlaut</h2>
        <p className="vorspann" style={{ marginTop: 10 }}>
          Diese drei Absätze entscheiden alles, was auf dieser Seite steht. Sie sind unverändert
          aus dem Kabinettsentwurf übernommen – nachlesbar im Entwurfstext des
          Bundesgesundheitsministeriums, Artikel 1 Nummer 86.
        </p>
        <div className="karte abstand-s">
          {WORTLAUT.map((f, i) => (
            <blockquote className="zitat" key={f.fundstelle} style={i === 0 ? { marginTop: 0 } : undefined}>
              <p>{f.satz}</p>
              <cite className="quelle">{f.fundstelle}</cite>
            </blockquote>
          ))}
        </div>

        <div className="hinweis hinweis-gelb abstand-s">
          <div className="hinweis-titel">Wichtig für alle, die schon einen Pflegegrad haben</div>
          {FAKTEN.wiederholung.satz}
          <br />
          <span className="quelle">{FAKTEN.wiederholung.fundstelle}</span>
        </div>

        <h2 className="abstand-l">Quellen</h2>
        <ul style={{ paddingLeft: 20 }}>
          {QUELLEN.map((q) => (
            <li key={q.was} style={{ marginBottom: 10, fontSize: "var(--t-4)" }}>
              {q.was}
              <br />
              {q.link ? (
                <a href={q.link} target="_blank" rel="noopener noreferrer">{q.wo}</a>
              ) : (
                <span className="quelle">{q.wo}</span>
              )}
            </li>
          ))}
        </ul>

        <h2 className="abstand-l">Anbieter und Datenschutz</h2>
        <p>
          Wer hinter dieser Seite steht, steht im <a href="/impressum">Impressum</a>. Was an
          Daten verarbeitet wird, wozu und wie lange, steht in der{" "}
          <a href="/datenschutz">Datenschutzerklärung</a> – einschließlich des Punktes, der hier
          am meisten zählt: Ihre Antworten zu Gesundheit und Selbständigkeit verlassen Ihren
          Browser nicht.
        </p>
      </div>
    </main>
  );
}
