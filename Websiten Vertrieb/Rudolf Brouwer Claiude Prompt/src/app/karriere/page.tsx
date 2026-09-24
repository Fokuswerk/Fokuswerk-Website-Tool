import type { Metadata } from "next";
import Anlauf from "@/components/Anlauf";
import { Sektion, Kopfzeile, Seitenkopf, Knopf, Linienliste } from "@/components/Bausteine";
import { betrieb } from "@/lib/daten";

export const metadata: Metadata = {
  title: "Karriere — Anlagenmechaniker SHK und Ausbildung",
  description:
    "Offene Stellen bei der Rudolf Brouwer GmbH in Wardenburg: Anlagenmechaniker SHK und Schwimmbad, Kundendiensttechniker sowie ein Ausbildungsplatz zum 1. August 2026.",
  alternates: { canonical: "/karriere" },
};

const wirBieten = [
  "Unbefristeter Arbeitsvertrag",
  "Übertarifliche Bezahlung",
  "Sondergratifikation",
  "Betriebliche Altersvorsorge",
  "30 Tage Urlaub",
  "Freizeitausgleich von Überstunden",
  "Firmenwagen für den Weg zur Arbeit",
  "Kollegiales Arbeitsumfeld",
  "Flache Hierarchien, kurze Wege",
  "Eigenverantwortliches Arbeiten",
];

const anlagenmechaniker = [
  { titel: "Installation und Modernisierung", text: "Heizungsanlagen vom Kessel bis zum Heizkörper." },
  { titel: "Badsanierung", text: "Mit Fertigmontage — vom Rohbau bis zur Übergabe." },
  { titel: "Schwimmbadbau", text: "Becken, Technik und Wasseraufbereitung." },
];

const kundendienst = [
  { titel: "Wartung und Instandhaltung", text: "Reparatur und Störungsbeseitigung an Heizungsanlagen." },
  { titel: "Einweisung", text: "Sie zeigen den Kunden, wie die neue Anlage funktioniert." },
];

const profil = [
  "Abgeschlossene Ausbildung zum Anlagenmechaniker S/H/K",
  "Führerschein Klasse B",
  "Berufserfahrung in Heizung und Sanitär von Vorteil — Einsteiger sind willkommen",
  "Freude am Beruf, Kommunikationsfähigkeit, Kundenorientierung",
];

export default function Karriere() {
  return (
    <>
      <Seitenkopf
        label="Karriere"
        titel="Zwei Stellen und ein Ausbildungsplatz."
        text="Wir suchen Anlagenmechaniker für SHK und Schwimmbad sowie einen Kundendiensttechniker. Zum 1. August 2026 ist ein Ausbildungsplatz frei."
        aktionen={
          <>
            <Knopf href={`mailto:${betrieb.email}?subject=Bewerbung`} extern>
              Bewerbung schreiben
            </Knopf>
            <Knopf href={`tel:${betrieb.telefonRaw}`} art="linie-hell" extern>
              {betrieb.telefon}
            </Knopf>
          </>
        }
      />

      <Sektion>
        <Kopfzeile
          nummer="01"
          label="Was wir bieten"
          titel={<>30 Tage Urlaub, unbefristet, übertariflich.</>}
          text="Überstunden gleichen wir in Freizeit aus. Den Firmenwagen dürfen Sie für den Weg zur Arbeit nutzen."
        />
        <Anlauf klasse="mt-16" verzug={80}>
          <ul className="grid grid-cols-1 gap-x-8 border-t border-tief/20 sm:grid-cols-2 lg:grid-cols-3">
            {wirBieten.map((w) => (
              <li key={w} className="t-text border-b border-tief/12 py-4 text-tief/80">
                {w}
              </li>
            ))}
          </ul>
        </Anlauf>
      </Sektion>

      <Sektion dunkel>
        <Kopfzeile
          dunkel
          nummer="02"
          label="Anlagenmechaniker (m/w/d)"
          titel={<>SHK und Schwimmbad — kein Tag wie der andere.</>}
          text="Zur Verstärkung unseres Teams suchen wir zum nächstmöglichen Zeitpunkt."
        />
        <div className="mt-16">
          <Linienliste eintraege={anlagenmechaniker} dunkel spalten={3} />
        </div>

        <div className="mt-24">
          <Kopfzeile
            dunkel
            nummer="03"
            label="Kundendiensttechniker (m/w/d)"
            titel={<>Sie fahren raus, wenn etwas nicht läuft.</>}
          />
          <div className="mt-12">
            <Linienliste eintraege={kundendienst} dunkel spalten={2} />
          </div>
        </div>

        <Anlauf klasse="mt-24" verzug={80}>
          <div className="grid grid-cols-1 gap-12 border-t border-white/15 pt-12 lg:grid-cols-12 lg:gap-8">
            <p className="t-label text-papier/50 lg:col-span-5">Ihr Profil</p>
            <ul className="lg:col-span-6 lg:col-start-7">
              {profil.map((p) => (
                <li key={p} className="t-text flex gap-4 border-b border-white/10 py-4 text-papier/80">
                  <span aria-hidden className="mt-3 h-px w-4 shrink-0 bg-papier/30" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Anlauf>
      </Sektion>

      <Sektion>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Kopfzeile
              nummer="04"
              label="Ausbildung ab 1. August 2026"
              titel={<>Anlagenmechaniker für Sanitär-, Heizungs- und Klimatechnik.</>}
              text="Ein abwechslungsreicher, zukunftssicherer Beruf. Nach erfolgreichem Abschluss besteht die Chance auf Übernahme."
            />
          </div>
          <Anlauf klasse="lg:col-span-5 lg:col-start-8" verzug={100}>
            <p className="t-text mass text-tief/70">
              Wenn du Spaß am Umgang mit Kunden hast und teamfähig bist, bewirb dich. Vorab kannst du
              gerne ein Praktikum bei uns machen, um einen Einblick in den Beruf zu bekommen.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Knopf href={`mailto:${betrieb.email}?subject=Bewerbung%20Ausbildung`} extern>
                Bewerbung schreiben
              </Knopf>
              <Knopf href={`tel:${betrieb.telefonRaw}`} art="linie" extern>
                Anrufen
              </Knopf>
            </div>
            {/* TODO: vom Kunden bestätigen — ist der Ausbildungsplatz zum 01.08.2026 noch offen? */}
          </Anlauf>
        </div>
      </Sektion>

      <Sektion dunkel>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <Anlauf>
              <h2 className="t-h2 max-w-[18ch]">Bewerbung per Post, per E-Mail — oder ruf einfach an.</h2>
              <p className="t-text mass mt-6 text-papier/70">
                {betrieb.name} · {betrieb.strasse} · {betrieb.plz} {betrieb.ort}
              </p>
            </Anlauf>
          </div>
          <Anlauf klasse="lg:col-span-5 lg:col-start-9" verzug={80}>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Knopf href={`mailto:${betrieb.email}?subject=Bewerbung`} extern>
                {betrieb.email}
              </Knopf>
              <Knopf href={`tel:${betrieb.telefonRaw}`} art="linie-hell" extern>
                {betrieb.telefon}
              </Knopf>
            </div>
          </Anlauf>
        </div>
      </Sektion>
    </>
  );
}
