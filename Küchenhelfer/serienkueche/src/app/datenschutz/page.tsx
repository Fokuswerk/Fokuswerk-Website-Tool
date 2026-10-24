import Link from "next/link";
import { Rechtsseite, Platzhalter } from "@/components/warm/Rechtsseite";

export const metadata = { title: "Datenschutz — Serienküche" };

export default function Datenschutz() {
  return (
    <Rechtsseite titel="Datenschutzerklärung" vor="Informationen nach Art. 13 DSGVO">
      <h2>Verantwortlich</h2>
      <p>
        <Platzhalter>Firmenname</Platzhalter>, <Platzhalter>Anschrift</Platzhalter>,{" "}
        <Platzhalter>adresse@beispiel.de</Platzhalter>. Die vollständigen Angaben stehen im{" "}
        <Link href="/impressum">Impressum</Link>.
      </p>

      <h2>Was dieses Werkzeug speichert</h2>
      <p>
        Deine Planung — Raummaße, Fenster, Tür, Wasseranschluss, Gerätewahl und die Reihenfolge der
        Schränke — bleibt im Speicher deines Browsers (localStorage). Sie wird dort abgelegt, damit
        du die Seite verlassen und später weiterplanen kannst, und sie verlässt dein Gerät nicht.
        Du löschst sie mit „Neu“ oben rechts in der Fragestrecke oder indem du die Websitedaten in
        deinem Browser löschst. Ein Konto gibt es nicht.
      </p>

      <h2>Hochgeladene Grundrisse</h2>
      <p>
        Eine Datei, die du im Schritt „Grundriss hochladen“ auswählst, wird nur im Browser
        angezeigt und nicht übertragen. In diesem Prototyp liest keine Software den Plan aus; es
        läuft ein nachgestellter Erkennungslauf mit festen Beispielwerten.
      </p>

      <h2>Server-Logdateien</h2>
      <p>
        Beim Aufruf der Seite überträgt dein Browser technisch notwendige Daten an den Server, auf
        dem diese Seite liegt: IP-Adresse, Zeitpunkt, aufgerufene Adresse, Browser- und
        Betriebssystemkennung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, berechtigtes
        Interesse am sicheren Betrieb. Gehostet wird bei{" "}
        <Platzhalter>Hoster und Anschrift</Platzhalter>; mit dem Hoster besteht ein Vertrag zur
        Auftragsverarbeitung nach Art. 28 DSGVO. Speicherdauer:{" "}
        <Platzhalter>Anzahl</Platzhalter> Tage.
      </p>

      <h2>Schriften und Bilder</h2>
      <p>
        Die Schriften liegen auf demselben Server wie die Seite; es wird keine Verbindung zu Google
        Fonts aufgebaut. Die Beispielfotos der Räume werden von Unsplash geladen
        (Unsplash Inc., USA) — dabei überträgt dein Browser seine IP-Adresse dorthin. Die
        Produktfotos der Geräte liegen auf unserem Server.
      </p>

      <h2>Keine Verfolgung</h2>
      <p>
        Diese Seite setzt keine Analyse- oder Werbe-Werkzeuge ein, verwendet keine Cookies zu
        diesem Zweck und zeigt deshalb auch kein Einwilligungsfenster.
      </p>

      <h2>Wenn du ein Angebot anforderst</h2>
      <p>
        Dann verarbeiten wir die Daten, die du im Formular angibst, sowie deine Planung, um dir ein
        Angebot zu machen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, Maßnahmen vor
        Vertragsschluss. Aufbewahrung, solange der Vorgang läuft, danach im Rahmen der
        handels- und steuerrechtlichen Fristen.
      </p>

      <h2>Deine Rechte</h2>
      <ul>
        <li>Auskunft über die zu dir gespeicherten Daten (Art. 15)</li>
        <li>Berichtigung (Art. 16) und Löschung (Art. 17)</li>
        <li>Einschränkung der Verarbeitung (Art. 18)</li>
        <li>Datenübertragbarkeit (Art. 20)</li>
        <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21)</li>
        <li>
          Beschwerde bei einer Aufsichtsbehörde (Art. 77), zum Beispiel bei der für{" "}
          <Platzhalter>Bundesland</Platzhalter> zuständigen Stelle
        </li>
      </ul>

      <p className="hinweis">
        Dieses Werkzeug ist ein Prototyp. Solange hier Platzhalter stehen, wird die Seite nicht
        öffentlich betrieben.
      </p>
    </Rechtsseite>
  );
}
