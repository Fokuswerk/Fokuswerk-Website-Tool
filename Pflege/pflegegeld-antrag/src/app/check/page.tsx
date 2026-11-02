import type { Metadata } from "next";
import Inhalt from "./Inhalt";

export const metadata: Metadata = {
  title: "Pflegegrad genau berechnen – Pflegegeld-Antrag",
  description: "Alle amtlichen Kriterien aus Anlage 1 zu § 15 SGB XI, gerechnet nach heutigem Recht und nach den Punktgrenzen ab 2027.",
};

export default function Seite() {
  return (
    <>
      <noscript>
        <main className="band">
          <div className="huelle-schmal">
            <h1>Der Rechner braucht JavaScript</h1>
            <p className="vorspann" style={{ marginTop: 12 }}>
              Die Berechnung läuft vollständig in Ihrem Browser – dafür braucht es JavaScript.
              Bitte schalten Sie es für diese Seite ein. Den Antrag können Sie auch ohne Rechner
              stellen: <a href="/antrag">So geht der Antrag</a>.
            </p>
          </div>
        </main>
      </noscript>
      <Inhalt />
    </>
  );
}
