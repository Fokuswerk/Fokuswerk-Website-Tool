import type { Metadata } from "next";
import Link from "next/link";
import { ANBIETER, ANSCHRIFT, VERARBEITER, anbieterUnvollstaendig } from "@/lib/anbieter";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – Pflegegeld-Antrag",
  description: "Welche Daten diese Seite verarbeitet, wozu, auf welcher Grundlage und wie lange.",
};

export default function Seite() {
  const fehlt = anbieterUnvollstaendig();

  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="auge">Information nach Art. 13 DSGVO</div>
        <h1>Datenschutzerklärung</h1>
        <p className="vorspann abstand-s">
          Kurz vorweg: Der Rechner läuft in Ihrem Browser. Ihre Antworten zu Gesundheit und
          Selbständigkeit verlassen das Gerät nicht. Übertragen wird nur, was Sie selbst
          abschicken – und bei einer Anmeldung zusätzlich Ihr Ergebnis als Zahl.
        </p>

        {fehlt.length > 0 && (
          <div className="hinweis hinweis-signal abstand-m">
            <div className="hinweis-titel">Noch nicht ausgefüllt</div>
            Die Angaben zum Verantwortlichen fehlen ({fehlt.join(", ")}). Einzutragen in{" "}
            <code>src/lib/anbieter.ts</code>.
          </div>
        )}

        <h2 className="abstand-l">1. Verantwortlich</h2>
        <p>
          {ANSCHRIFT.map((zeile) => (
            <span key={zeile} style={{ display: "block" }}>{zeile}</span>
          ))}
          <span style={{ display: "block" }}>Telefon: {ANBIETER.telefon}</span>
          <span style={{ display: "block" }}>E-Mail: {ANBIETER.mail}</span>
        </p>
        <p className="quelle">
          Eine Datenschutzbeauftragte oder einen Datenschutzbeauftragten gibt es nicht; die
          Voraussetzungen des § 38 BDSG liegen nicht vor.
        </p>

        <h2 className="abstand-l">2. Was beim bloßen Aufrufen passiert</h2>
        <p>
          Beim Abruf der Seite überträgt Ihr Browser technisch notwendige Daten an den Server:
          IP-Adresse, Zeitpunkt, aufgerufene Adresse, übermittelnde Seite, Browser- und
          Betriebssystemkennung. Diese Server-Protokolle fallen bei unserem Hoster an und sind
          nötig, damit die Seite ausgeliefert werden kann und Angriffe erkennbar bleiben.
        </p>
        <p>
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 Buchstabe f DSGVO – berechtigtes
          Interesse am sicheren Betrieb.
        </p>
        <p>
          <strong>Keine Cookies für Besucherinnen und Besucher.</strong> Ein Cookie wird nur
          gesetzt, wenn sich jemand am internen Auswertungsbereich anmeldet. Für den Abruf der
          Seite ist keine Einwilligung nach § 25 TDDDG erforderlich, weil nichts gespeichert
          oder ausgelesen wird, was dafür nicht unbedingt erforderlich ist.
        </p>

        <h2 className="abstand-l">3. Der Rechner</h2>
        <p>
          Ihre Angaben zu Mobilität, Selbstversorgung, kognitiven Fähigkeiten, Verhalten,
          krankheitsbedingten Anforderungen und Alltagsleben werden{" "}
          <strong>ausschließlich in Ihrem Browser</strong> verarbeitet und dort gespeichert
          (<code>localStorage</code>), damit Sie unterbrechen und später weitermachen können.
          Sie werden nicht an uns übertragen. Sie löschen sie jederzeit über „Alle meine
          Angaben löschen“ im Rechner oder indem Sie die Browserdaten für diese Seite leeren.
        </p>

        <h2 className="abstand-l">4. Nutzungszahlen</h2>
        <p>
          Damit wir sehen, wo Menschen im Rechner abbrechen, melden wir einzelne Ereignisse:
          welche Seite aufgerufen wurde, dass ein Rechenvorgang begonnen oder beendet wurde,
          bei welcher Frage, und welche Knöpfe geklickt wurden. Dazu gehört eine{" "}
          <strong>zufällige Sitzungskennung</strong>, die in Ihrem Browser erzeugt wird
          (<code>sessionStorage</code>), beim Schließen des Tabs verfällt und keinen Bezug zu
          Ihrer Person hat. <strong>Angaben zu Ihrer Gesundheit werden dabei nicht
          übertragen.</strong>
        </p>
        <p>
          <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 Buchstabe f DSGVO – berechtigtes
          Interesse daran, die eigene Seite verständlich zu machen. Es findet kein Tracking über
          mehrere Seiten oder Sitzungen hinweg statt, es werden keine Profile gebildet und keine
          Daten an Werbenetzwerke gegeben.
        </p>
        <p>
          <strong>Speicherdauer:</strong> 12 Monate, danach Löschung.
        </p>

        <h2 className="abstand-l">5. Wenn Sie sich für eine Erinnerung anmelden</h2>
        <p>Dann speichern wir:</p>
        <ul className="marken-liste abstand-s">
          <li><span className="ziffer">01</span><span>Ihre E-Mail-Adresse und, falls angegeben, Ihren Namen.</span></li>
          <li><span className="ziffer">02</span><span>Den Anlass der Anmeldung und die Seite, von der sie kam.</span></li>
          <li>
            <span className="ziffer">03</span>
            <span>
              <strong>Ihr Ergebnis als Zahl</strong> – Punkte und Pflegegrad, nicht die
              einzelnen Antworten. Daraus lässt sich auf Ihren Gesundheitszustand schließen,
              es ist also eine Angabe nach Art. 9 DSGVO.
            </span>
          </li>
          <li>
            <span className="ziffer">04</span>
            <span>
              Zeitpunkt und IP-Adresse der Anmeldung <em>und</em> der Bestätigung. Nur damit
              lässt sich später belegen, dass die Einwilligung wirklich von Ihnen kam
              (Art. 7 Abs. 1 DSGVO).
            </span>
          </li>
        </ul>
        <p className="abstand-s">
          <strong>Rechtsgrundlage:</strong> Ihre Einwilligung nach Art. 6 Abs. 1 Buchstabe a
          und – für das Ergebnis – Art. 9 Abs. 2 Buchstabe a DSGVO. Die Einwilligung erteilen
          Sie mit dem Häkchen im Formular; sie wird erst wirksam, wenn Sie den Link in unserer
          Bestätigungsmail anklicken.
        </p>
        <p>
          <strong>Speicherdauer:</strong> Bestätigen Sie nicht innerhalb von sieben Tagen,
          löschen wir den Eintrag. Sonst bis zu Ihrem Widerruf, längstens bis zum Ende des
          Zwecks (Stichtag und Abschluss des Gesetzgebungsverfahrens).
        </p>
        <p>
          <strong>Widerruf:</strong> jederzeit formlos per Mail an {ANBIETER.mail}. Der Widerruf
          wirkt für die Zukunft; wir löschen den Eintrag danach vollständig.
        </p>

        <h2 className="abstand-l">6. Wer die Daten sonst noch verarbeitet</h2>
        <p>
          Wir geben keine Daten zu Werbezwecken weiter und verkaufen keine Adressen. Technisch
          beteiligt sind zwei Dienstleister, beide als Auftragsverarbeiter nach Art. 28 DSGVO:
        </p>
        <ul className="marken-liste abstand-s">
          <li>
            <span className="ziffer">01</span>
            <span>
              <strong>{VERARBEITER.hosting.name}</strong>, {VERARBEITER.hosting.sitz}.
              {" "}{VERARBEITER.hosting.zweck}. Die Auslieferung erfolgt aus der EU-Region;
              ein Zugriff aus den USA ist nicht ausgeschlossen. Grundlage dafür sind
              Standardvertragsklauseln nach Art. 46 Abs. 2 Buchstabe c DSGVO.
            </span>
          </li>
          <li>
            <span className="ziffer">02</span>
            <span>
              <strong>{VERARBEITER.datenbank.name}</strong>. {VERARBEITER.datenbank.zweck}.
              Die Daten liegen in {VERARBEITER.datenbank.region} und verlassen die EU nicht.
            </span>
          </li>
        </ul>

        <h2 className="abstand-l">7. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf <strong>Auskunft</strong> (Art. 15), <strong>Berichtigung</strong>{" "}
          (Art. 16), <strong>Löschung</strong> (Art. 17), <strong>Einschränkung</strong> (Art. 18),{" "}
          <strong>Datenübertragbarkeit</strong> (Art. 20) und <strong>Widerspruch</strong>{" "}
          (Art. 21 DSGVO). Eine erteilte Einwilligung können Sie jederzeit widerrufen,
          ohne dass die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung berührt wird.
        </p>
        <p>
          Eine Mail an {ANBIETER.mail} genügt für alles davon. Sie können sich außerdem bei
          einer Aufsichtsbehörde beschweren (Art. 77 DSGVO); zuständig ist die Behörde Ihres
          Wohnorts oder die am Sitz des Verantwortlichen.
        </p>

        <h2 className="abstand-l">8. Keine automatisierte Entscheidung</h2>
        <p>
          Der Rechner zeigt Ihnen ein Ergebnis an, trifft aber keine Entscheidung über Sie im
          Sinne von Art. 22 DSGVO. Über Ihren Pflegegrad entscheidet allein Ihre Pflegekasse
          auf Grundlage der Begutachtung durch den Medizinischen Dienst.
        </p>

        <p className="quelle abstand-l">
          Stand dieser Erklärung: 2. November 2026. Siehe auch{" "}
          <Link href="/impressum">Impressum</Link> und{" "}
          <Link href="/rechtliches">Rechtliches und Quellen</Link>.
        </p>
      </div>
    </main>
  );
}
