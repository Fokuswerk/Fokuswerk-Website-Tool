import type { Metadata } from "next";
import Link from "next/link";
import Abschrift from "@/components/Abschrift";
import Lead from "@/components/Lead";
import { Uhr, Paragraf, Haken, Schloss } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Pflegegrad beantragen – so geht es",
  description:
    "Der Antrag auf Pflegegrad ist formlos möglich. Ein Satz genügt, entscheidend ist das Datum. Hier steht, wie es geht und was danach passiert.",
};

const MUSTER = `Sehr geehrte Damen und Herren,

hiermit beantrage ich die Feststellung von Pflegebedürftigkeit
und die Gewährung von Leistungen der Pflegeversicherung für:

Name:                 [Vor- und Nachname]
Geburtsdatum:         [TT.MM.JJJJ]
Versichertennummer:   [steht auf der Versichertenkarte]
Anschrift:            [Straße, PLZ, Ort]

Die Pflege findet zu Hause statt.

Bitte bestätigen Sie mir den Eingang dieses Antrags
und das Datum der Antragstellung schriftlich.

Mit freundlichen Grüßen

[Ort], [Datum]
[Name und Unterschrift]
[Telefonnummer für Rückfragen]`;

export default function Antrag() {
  return (
    <main>
      <section className="abschnitt">
        <div className="huelle-mitte">
          <span className="auge">Ohne Formular, ohne Begründung</span>
          <h1>Der Antrag ist ein Satz</h1>
          <p className="vorspann abstand-s">
            Für den Antrag brauchen Sie kein Formular, kein Attest und keine Begründung. Ein
            Anruf bei der Pflegekasse genügt. Alles Weitere – Unterlagen, Begutachtung,
            Entscheidung – kommt danach. Entscheidend ist allein, dass der Antrag gestellt ist.
          </p>

          <ul className="vertrauensband abstand-m">
            <li>
              <span className="icon"><Uhr size={17} /></span>
              <span>
                <strong>Fünf Minuten</strong>
                <span className="klein">Ein Anruf reicht</span>
              </span>
            </li>
            <li>
              <span className="icon"><Paragraf size={17} /></span>
              <span>
                <strong>Formlos gültig</strong>
                <span className="klein">§ 33 Abs. 1 SGB XI, § 9 SGB X</span>
              </span>
            </li>
            <li>
              <span className="icon"><Schloss size={17} /></span>
              <span>
                <strong>Nichts zu verlieren</strong>
                <span className="klein">Ein Antrag kostet nichts</span>
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="abschnitt himmelbett">
        <div className="huelle-mitte">
          <span className="auge">Warum das Datum zählt</span>
          <h2>Zweimal entscheidet der Tag der Antragstellung</h2>

          <div className="gitter gitter-2 abstand-m">
            <div className="karte">
              <h3>Das Geld läuft ab dem Antragsmonat</h3>
              <p className="text-leise">
                Leistungen werden ab Antragstellung gewährt. Wird der Antrag später gestellt als
                in dem Monat, in dem die Pflegebedürftigkeit eingetreten ist, gibt es sie ab dem
                Beginn des Monats der Antragstellung. Jeder Monat, den Sie warten, ist
                verloren – auch wenn die Begutachtung erst Wochen später stattfindet.
              </p>
              <p className="quelle">§ 33 Abs. 1 Satz 2 und 3 SGB XI</p>
            </div>
            <div className="karte">
              <h3>Das Recht gilt vom Antragstag</h3>
              <p className="text-leise">
                Nach dem Kabinettsentwurf wird die Pflegebedürftigkeit nach dem Recht beurteilt,
                das am Tag der Antragstellung gilt. Ein Erstantrag bis zum 31. Dezember 2026 wird
                deshalb nach den heutigen, niedrigeren Punktgrenzen bewertet – selbst wenn die
                Begutachtung erst 2027 stattfindet. Bei einer Wiederholungsbegutachtung zählt
                dagegen der Tag des Termins.
              </p>
              <p className="quelle">§ 142b Abs. 1 SGB XI in der Fassung des Kabinettsentwurfs</p>
            </div>
          </div>
        </div>
      </section>

      <section className="abschnitt">
        <div className="huelle-mitte">
          <span className="auge">Drei Wege</span>
          <h2>So stellen Sie den Antrag</h2>

          <ol className="schritte abstand-m" style={{ gridTemplateColumns: "1fr" }}>
            <li>
              <span className="schritt-nr">01</span>
              <h3>Anrufen – der schnellste Weg</h3>
              <p>
                Die Pflegekasse sitzt bei der Krankenkasse. Die Nummer steht auf der
                Versichertenkarte. Sagen Sie: „Ich möchte für meine Mutter einen Pflegegrad
                beantragen." Mehr ist nicht nötig. Notieren Sie sich Datum, Uhrzeit und den Namen
                der Person am Telefon – und bitten Sie um eine schriftliche Bestätigung.
              </p>
            </li>
            <li>
              <span className="schritt-nr">02</span>
              <h3>Schreiben – wenn Sie es schwarz auf weiß wollen</h3>
              <p>
                Ein formloser Brief oder eine Mail genügt. Den Text finden Sie unten. Schicken Sie
                ihn am besten so, dass Sie den Eingang belegen können.
              </p>
            </li>
            <li>
              <span className="schritt-nr">03</span>
              <h3>Online – über das Portal Ihrer Kasse</h3>
              <p>
                Die meisten Kassen haben ein Antragsformular im Kundenbereich. Es ist länger als
                nötig, funktioniert aber und liefert sofort eine Bestätigung.
              </p>
            </li>
          </ol>

          <h2 className="abstand-l">Der Text zum Kopieren</h2>
          <p className="text-leise abstand-s" style={{ maxWidth: "62ch" }}>
            Sie stellen den Antrag in eigenem Namen. Setzen Sie die eckigen Klammern ein und
            schicken Sie ihn an Ihre Pflegekasse. Wenn Sie für jemand anderen schreiben, legen Sie
            eine Vollmacht bei oder lassen Sie die pflegebedürftige Person mit unterschreiben.
          </p>
          <Abschrift text={MUSTER} />
        </div>
      </section>

      <section className="abschnitt himmelbett">
        <div className="huelle-mitte">
          <span className="auge">Danach</span>
          <h2>Was passiert, wenn der Antrag draußen ist</h2>

          <ol className="schritte abstand-m" style={{ gridTemplateColumns: "1fr" }}>
            <li>
              <span className="schritt-nr">01</span>
              <h3>Die Kasse schickt Unterlagen</h3>
              <p>
                Meist kommt ein Fragebogen. Den füllen Sie in Ruhe aus – der Antrag ist zu diesem
                Zeitpunkt längst gestellt, das Datum steht.
              </p>
            </li>
            <li>
              <span className="schritt-nr">02</span>
              <h3>Der Medizinische Dienst meldet sich zur Begutachtung</h3>
              <p>
                Der Termin findet zu Hause statt und dauert etwa eine Stunde. Darauf können Sie
                sich vorbereiten – dafür ist unser genauer Rechner da.
              </p>
            </li>
            <li>
              <span className="schritt-nr">03</span>
              <h3>Der Bescheid kommt – spätestens nach 25 Arbeitstagen</h3>
              <p>
                Braucht die Kasse länger und hat sie das zu vertreten, stehen Ihnen 70 Euro für
                jede begonnene Woche Verzögerung zu. Die Kasse muss das von sich aus zahlen und
                Sie sogar darauf hinweisen (§ 18c Abs. 5 SGB XI). Kein Anspruch besteht, wenn die
                Person bereits in vollstationärer Pflege mindestens Pflegegrad 2 hat.
              </p>
            </li>
          </ol>
          <p className="quelle abstand-s">
            § 18c Abs. 1 und Abs. 5 SGB XI. Nach dem Kabinettsentwurf ist diese Frist vom
            1. Januar bis 30. April 2027 unbeachtlich; nur bei besonders dringlichem
            Entscheidungsbedarf bleibt es bei 25 Arbeitstagen (§ 142b Abs. 3 SGB XI-E). Ein
            weiterer Grund, nicht in den Januar zu rutschen.
          </p>

          <div className="hinweis hinweis-gut abstand-m">
            <div className="hinweis-titel">Was Sie jetzt noch nicht brauchen</div>
            Keine Atteste, keine Arztberichte, kein Pflegetagebuch, keine Begründung. Nichts davon
            gehört zum Antrag. Wer darauf wartet, verliert Wochen.
          </div>

          <div className="knopf-reihe">
            <Link className="knopf" href="/check">Vor dem Termin genau rechnen</Link>
            <Link className="knopf knopf-zweit" href="/">Erst prüfen, ob sich der Stichtag lohnt</Link>
          </div>
        </div>
      </section>

      <section className="abschnitt">
        <div className="huelle-mitte">
          <Lead
            anlass="antrag"
            titel="Erinnerung vor dem 31. Dezember"
            text="Wir schreiben Ihnen einmal rechtzeitig vor dem Stichtag und melden uns, sobald Bundestag und Bundesrat entschieden haben."
          />
          <div className="rdg abstand-m">
            <Haken size={14} /> Diese Seite erklärt ein Verfahren und stellt keinen Antrag für
            Sie. Sie ist keine Rechtsberatung. Kostenlose und unabhängige Beratung erhalten Sie
            bei der Pflegeberatung nach § 7a SGB XI, bei den Pflegestützpunkten und bei den
            Verbraucherzentralen.
          </div>
        </div>
      </section>
    </main>
  );
}
