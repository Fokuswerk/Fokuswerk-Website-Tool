import Link from "next/link";
import Lead from "@/components/Lead";

export const metadata = { title: "Begutachtungsmappe – Pflegegeld-Antrag" };

export default function Mappe() {
  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="auge">39 Euro, einmalig</div>
        <h1>Die Begutachtungsmappe</h1>
        <p className="vorspann" style={{ marginTop: 12 }}>
          Der Termin mit dem Medizinischen Dienst dauert etwa eine Stunde und entscheidet über
          mehrere hundert Euro im Monat. Die Mappe sorgt dafür, dass in dieser Stunde nichts
          vergessen wird.
        </p>

        <div className="hinweis hinweis-gelb abstand-m">
          <div className="hinweis-titel">Noch nicht freigeschaltet</div>
          Die Mappe ist vorbereitet, der Bezahlvorgang ist noch nicht angeschlossen. Lassen Sie
          sich vormerken, dann melden wir uns zum Start.
        </div>

        <h2 className="abstand-l">Was drin ist</h2>
        <ul className="marken-liste abstand-s">
          <li>
            <span className="ziffer">1</span>
            <span><strong>Pflegetagebuch für 14 Tage</strong>, vorbereitet auf die Kriterien, bei denen Ihre Punkte fehlen. Keine leere Vorlage, sondern Ihre Module.</span>
          </li>
          <li>
            <span className="ziffer">2</span>
            <span><strong>Checkliste für den Termin</strong>, Modul für Modul, mit den Formulierungen, auf die es bei der Begutachtung ankommt.</span>
          </li>
          <li>
            <span className="ziffer">3</span>
            <span><strong>Ihre Punkteübersicht</strong> nach beiden Rechtsständen, zum Beilegen und Mitnehmen.</span>
          </li>
          <li>
            <span className="ziffer">4</span>
            <span><strong>Was die Kasse zusätzlich zahlt</strong>, bezogen auf den Pflegegrad, der bei Ihnen in Betracht kommt.</span>
          </li>
        </ul>

        <h2 className="abstand-l">Warum das etwas bringt</h2>
        <p>
          2024 führten rund 18 Prozent der Erstbegutachtungen zu keiner Pflegebedürftigkeit. In der
          Begründung des Kabinettsentwurfs steht als Ursache, dass viele Menschen nicht gut genug
          darüber informiert sind, ob bei ihnen überhaupt Pflegebedürftigkeit vorliegt. Der
          häufigste Fehler im Termin ist nicht Übertreibung, sondern das Gegenteil: Angehörige
          halten Hilfe für normal, die als Unselbständigkeit zählt.
        </p>

        <div className="karte" style={{ marginTop: 10 }}>
          <h3>Was die Mappe nicht ist</h3>
          <p style={{ fontSize: "var(--t-4)", color: "var(--tinte-2)", margin: 0 }}>
            Keine Anleitung, Angaben zu übertreiben. Wer im Termin etwas behauptet, das nicht
            stimmt, riskiert den ganzen Antrag. Die Mappe hilft, vollständig zu sein, nicht
            großzügig.
          </p>
        </div>

        <div className="abstand-m">
          <Lead
            anlass="mappe-vormerken"
            titel="Mappe vormerken"
            text="Wir melden uns, sobald die Mappe erhältlich ist. Keine Vorauszahlung, keine Verpflichtung."
            knopf="Vormerken"
          />
        </div>

        <div className="knopf-reihe">
          <Link className="knopf knopf-zweit" href="/check">Zuerst die Punkte rechnen</Link>
        </div>
      </div>
    </main>
  );
}
