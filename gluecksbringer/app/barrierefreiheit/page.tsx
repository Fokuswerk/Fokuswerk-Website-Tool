import type { Metadata } from "next";
import { verein } from "@/content/verein";

export const metadata: Metadata = {
  title: "Barrierefreiheit",
  description:
    "Erklärung zur Barrierefreiheit der Website der Glücksbringer am Meer e.V.: angestrebter Standard, geprüfte Punkte und wie Sie uns Probleme melden.",
  alternates: { canonical: "/barrierefreiheit" },
  robots: { index: true, follow: false },
};

/**
 * Erklärung zur Barrierefreiheit.
 *
 * Der Verein ist dazu gesetzlich nicht verpflichtet – weder als öffentliche
 * Stelle noch nach dem Barrierefreiheitsstärkungsgesetz, das Kleinstunter-
 * nehmen und Vereine ohne entgeltliches Angebot ausnimmt. Die Seite ist
 * trotzdem danach gebaut und geprüft, und diese Erklärung sagt, woran man
 * sich dabei gehalten hat.
 */
export default function Barrierefreiheit() {
  return (
    <section className="shell-narrow pt-32 pb-8 sm:pt-36 lg:pt-40">
      <p className="eyebrow">Barrierefreiheit</p>
      <h1 className="mt-5 text-h1 text-ink">
        Diese Seite soll für alle bedienbar sein.
      </h1>

      <div className="prose-gam mt-12">
        <p>
          Wir sammeln Geld für Kinder, denen sonst etwas fehlen würde. Dann wäre
          es schlecht, wenn ausgerechnet unsere Website Menschen ausschließt –
          etwa weil sie nicht sehen, keine Maus benutzen oder die Schrift größer
          stellen müssen. Deshalb ist diese Seite von Anfang an darauf gebaut
          und wird regelmäßig daraufhin geprüft.
        </p>

        <h2>Was wir anstreben</h2>
        <p>
          Maßstab sind die <strong>Web Content Accessibility Guidelines (WCAG)
          in der Fassung 2.2, Stufe AA</strong> – derselbe Standard, den auch
          die BITV&nbsp;2.0 für öffentliche Stellen vorschreibt. Nach unserer
          eigenen Prüfung erfüllt die Seite diesen Standard.
        </p>
        <p>
          Gesetzlich verpflichtet sind wir dazu nicht: Wir sind keine
          öffentliche Stelle, und das Barrierefreiheitsstärkungsgesetz nimmt
          kleine Vereine ohne entgeltliches Angebot ausdrücklich aus. Wir halten
          uns trotzdem daran, weil es zu dem passt, was wir tun.
        </p>

        <h2>Was das konkret bedeutet</h2>
        <ul>
          <li>
            <strong>Ohne Maus bedienbar.</strong> Jede Schaltfläche, jeder Link
            und jedes Formularfeld lässt sich mit der Tabulatortaste erreichen.
            Wo der Fokus gerade steht, ist deutlich zu sehen. Ganz oben führt
            eine Sprungmarke direkt zum Inhalt, damit man sich nicht durch das
            Menü arbeiten muss.
          </li>
          <li>
            <strong>Vorlesbar.</strong> Alle Bilder haben eine Beschreibung,
            Überschriften sind in der richtigen Reihenfolge verschachtelt, und
            Bereiche wie Navigation, Inhalt und Fußzeile sind ausgezeichnet.
            Schmückendes – etwa unser Maskottchen Puck – wird bewusst übersprungen.
          </li>
          <li>
            <strong>Lesbare Kontraste.</strong> Alle Texte erreichen mindestens
            das von WCAG geforderte Verhältnis, Bedienelemente ebenso.
          </li>
          <li>
            <strong>Vergrößerbar.</strong> Die Seite bleibt bei 200&nbsp;%
            Vergrößerung vollständig lesbar, ohne dass man waagerecht scrollen
            muss. Auch wenn Sie Zeilen- und Buchstabenabstände im Browser
            erhöhen, bleibt alles sichtbar.
          </li>
          <li>
            <strong>Ruhig, wenn Sie es möchten.</strong> Wer im Betriebssystem
            „Bewegung reduzieren“ eingestellt hat, bekommt die Seite ohne
            Animationen. Nichts bewegt sich dauerhaft von selbst.
          </li>
          <li>
            <strong>Große Schaltflächen.</strong> Was man antippen soll, ist
            groß genug dafür – auch auf dem Telefon.
          </li>
        </ul>

        <h2>Wie wir das prüfen</h2>
        <p>
          Vor jeder Veröffentlichung läuft eine automatische Prüfung (axe) über
          alle Seiten, in zwei Browsern und in zwei Bildschirmbreiten. Dazu
          kommen Dinge, die sich nicht automatisch prüfen lassen: Bedienung nur
          mit der Tastatur, Vergrößerung, veränderte Textabstände und die
          Verständlichkeit der Bildbeschreibungen.
        </p>
        <p>
          Automatische Prüfungen finden allerdings nur einen Teil der möglichen
          Probleme. Wenn Sie auf etwas stoßen, das Ihnen den Zugang erschwert,
          sagen Sie uns bitte Bescheid.
        </p>

        <h2>Wo es noch hakt</h2>
        <p>
          Die Fotos stammen aus unserem Archiv und sind über die Jahre mit
          Handykameras entstanden. Einzelne ältere Aufnahmen sind unscharf oder
          dunkel – inhaltlich beschrieben sind sie trotzdem alle.
        </p>
        <p>
          Unsere Beiträge sind in normalem Deutsch geschrieben, nicht in
          Leichter Sprache. Wenn Sie etwas nicht verstehen, erklären wir es
          Ihnen gern – am Telefon oder in einer Mail.
        </p>

        <h2>Probleme melden</h2>
        <p>
          Schreiben Sie uns an{" "}
          <a href={`mailto:${verein.email}`}>{verein.email}</a> oder über unser{" "}
          <a href="/kontakt">Kontaktformular</a>. Bitte nennen Sie, um welche
          Seite es geht und was nicht funktioniert hat. Wir melden uns und
          bessern nach.
        </p>
        <p>
          Sie erreichen uns auch per Post: {verein.name},{" "}
          {verein.anschrift.strasse}, {verein.anschrift.plz}{" "}
          {verein.anschrift.ort}.
        </p>

        <p className="text-sm">Stand dieser Erklärung: Oktober 2026.</p>
      </div>
    </section>
  );
}
