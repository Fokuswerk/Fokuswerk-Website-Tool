import Link from "next/link";
import Lead from "@/components/Lead";

export const metadata = { title: "Widerspruch gegen den Pflegegrad – Pflegegeld-Antrag" };

export default function Widerspruch() {
  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="auge">Nur bei Erfolg 350 Euro</div>
        <h1>Wenn der Pflegegrad zu niedrig ist</h1>
        <p className="vorspann" style={{ marginTop: 12 }}>
          Ein Widerspruch wirkt zurück: Wird er anerkannt, zahlt die Pflegekasse rückwirkend ab
          dem Beginn des Monats, in dem der Antrag gestellt wurde (§ 33 Abs. 1 SGB XI). Die Frist
          beträgt einen Monat ab Bekanntgabe des Bescheids (§ 84 Abs. 1 SGG) – bei Zustellung per
          Post gilt der Bescheid drei Tage nach Aufgabe als bekanntgegeben. Fehlt die
          Rechtsbehelfsbelehrung oder ist sie falsch, haben Sie ein Jahr Zeit (§ 66 Abs. 2 SGG).
        </p>

        <div className="hinweis hinweis-gelb abstand-m">
          <div className="hinweis-titel">Noch nicht freigeschaltet</div>
          Für diesen Weg muss die Zusammenarbeit mit einer Kanzlei stehen. Solange nehmen wir Fälle
          nur auf und melden uns, sobald wir sie weitergeben können.
        </div>

        <h2 className="abstand-l">So läuft es</h2>
        <ul className="marken-liste abstand-s">
          <li>
            <span className="ziffer">1</span>
            <span><strong>Sie prüfen den Bescheid</strong> mit unserem Rechner. Dauert fünf Minuten und kostet nichts.</span>
          </li>
          <li>
            <span className="ziffer">2</span>
            <span><strong>Wir sichern die Frist.</strong> Ein Satz genügt, um den Widerspruch fristgerecht einzulegen. Den können Sie selbst schreiben, wir sagen Ihnen, wie.</span>
          </li>
          <li>
            <span className="ziffer">3</span>
            <span><strong>Eine Kanzlei übernimmt die Begründung.</strong> Sie fordert das Gutachten an und bewertet es. Das ist Rechtsberatung und darf nur sie machen.</span>
          </li>
          <li>
            <span className="ziffer">4</span>
            <span><strong>Erfolg: 350 Euro an uns</strong>, inklusive Umsatzsteuer. Kein Erfolg: nichts. Die Anwaltskosten holt die Kanzlei nach § 63 SGB X bei der Pflegekasse – allerdings nur, soweit der Widerspruch Erfolg hat und die Kasse die Zuziehung eines Anwalts als notwendig ansieht (§ 63 Abs. 1 und 2 SGB X). Bei Teilerfolg wird anteilig erstattet, den Rest tragen Sie.</span>
          </li>
        </ul>

        <h2 className="abstand-l">Was wir ausdrücklich nicht tun</h2>
        <div className="karte">
          <p style={{ fontSize: "var(--t-4)", margin: 0 }}>
            Wir begründen keinen Widerspruch und bewerten Ihren Fall nicht rechtlich. Das
            Bundessozialgericht hat die Zurückweisung eines Renten- und Pflegeberaters als
            Bevollmächtigtem im Widerspruchsverfahren nicht beanstandet; es ging dabei um das
            Schwerbehindertenrecht (Beschluss vom 13. Juli 2018, B 9 SB 89/17 B). Die Sachfrage
            hat das Gericht nicht entschieden – die Beschwerde war unzulässig. Wir gehen davon
            aus, dass für das Pflegegradverfahren dasselbe gilt, und halten uns deshalb heraus.
            Unsere Leistung ist die Organisation: prüfen, Frist im Blick behalten, Unterlagen
            sortieren, an die Kanzlei übergeben.
          </p>
        </div>

        <div className="hinweis abstand-s">
          <div className="hinweis-titel">Der kostenlose Weg</div>
          Den Widerspruch können Sie selbst einlegen, formlos und ohne Begründung, um die Frist zu
          wahren. Beratung gibt es kostenlos bei der Pflegeberatung nach § 7a SGB XI, beim
          Pflegestützpunkt und bei den Verbraucherzentralen. Sozialverbände begründen Widersprüche
          für ihre Mitglieder.
        </div>

        <div className="abstand-m">
          <Lead
            anlass="widerspruch-fall"
            titel="Fall aufnehmen"
            text="Wir prüfen die Zahlen, melden uns mit einer Einschätzung zur Größe der Abweichung und sagen, ob sich der Weg lohnt."
            knopf="Fall einreichen"
          />
        </div>

        <div className="knopf-reihe">
          <Link className="knopf knopf-zweit" href="/bescheid">Erst den Bescheid prüfen</Link>
        </div>
      </div>
    </main>
  );
}
