import type { Metadata } from "next";
import { ANBIETER, ANSCHRIFT, anbieterUnvollstaendig } from "@/lib/anbieter";

export const metadata: Metadata = {
  title: "Impressum – Pflegegeld-Antrag",
  description: "Anbieterkennzeichnung nach § 5 DDG.",
};

export default function Seite() {
  const fehlt = anbieterUnvollstaendig();

  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="auge">Anbieterkennzeichnung nach § 5 DDG</div>
        <h1>Impressum</h1>

        {fehlt.length > 0 && (
          <div className="hinweis hinweis-signal abstand-m">
            <div className="hinweis-titel">Noch nicht ausgefüllt</div>
            Es fehlen: {fehlt.join(", ")}. Einzutragen in <code>src/lib/anbieter.ts</code>.
            Solange darf die Seite nicht öffentlich erreichbar sein.
          </div>
        )}

        <h2 className="abstand-m">Anbieter</h2>
        <p>
          {ANSCHRIFT.map((zeile) => (
            <span key={zeile} style={{ display: "block" }}>{zeile}</span>
          ))}
        </p>

        <h2 className="abstand-m">Kontakt</h2>
        <p>
          <span style={{ display: "block" }}>Telefon: {ANBIETER.telefon}</span>
          <span style={{ display: "block" }}>E-Mail: {ANBIETER.mail}</span>
        </p>

        {(ANBIETER.ustId || ANBIETER.register) && (
          <>
            <h2 className="abstand-m">Eintragungen</h2>
            <p>
              {ANBIETER.register && (
                <span style={{ display: "block" }}>{ANBIETER.register}</span>
              )}
              {ANBIETER.ustId && (
                <span style={{ display: "block" }}>
                  Umsatzsteuer-Identifikationsnummer nach § 27a UStG: {ANBIETER.ustId}
                </span>
              )}
            </p>
          </>
        )}

        <h2 className="abstand-m">Verantwortlich für den Inhalt</h2>
        <p>Nach § 18 Abs. 2 MStV: {ANBIETER.inhaltlichVerantwortlich}</p>

        <h2 className="abstand-m">Streitbeilegung</h2>
        <p>
          Zur Teilnahme an einem Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle sind wir weder bereit noch verpflichtet
          (§ 36 VSBG). Die Plattform der EU-Kommission zur Online-Streitbeilegung wurde zum
          20. Juli 2025 eingestellt; ein Verweis darauf entfällt deshalb.
        </p>

        <h2 className="abstand-m">Was diese Seite ist – und was nicht</h2>
        <p>
          Pflegegeld-Antrag rechnet die Punkte des Begutachtungsinstruments nach den
          veröffentlichten Kriterien aus. Das ist <strong>keine Rechtsberatung</strong> und
          keine Prüfung des Einzelfalls. Verbindlich ist allein die Begutachtung durch den
          Medizinischen Dienst und der Bescheid Ihrer Pflegekasse. Kostenlose und unabhängige
          Beratung erhalten Sie bei der Pflegeberatung nach § 7a SGB XI, bei den
          Pflegestützpunkten und bei den Verbraucherzentralen.
        </p>
      </div>
    </main>
  );
}
