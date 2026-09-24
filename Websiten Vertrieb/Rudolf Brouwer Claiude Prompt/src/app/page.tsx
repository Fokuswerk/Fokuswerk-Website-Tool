import Link from "next/link";
import Hero from "@/components/Hero";
import Anlauf from "@/components/Anlauf";
import Zahl from "@/components/Zahl";
import Status from "@/components/Status";
import { Sektion, Kopfzeile, Knopf, Bildband, Foto } from "@/components/Bausteine";
import { betrieb, leistungen, zeitenText } from "@/lib/daten";

const gewerke = [
  "Sanitärinstallation",
  "Heizung",
  "Elektroarbeiten",
  "Maurerarbeiten",
  "Fliesenlegen",
  "Malerarbeiten",
  "Innenausbau",
  "Endreinigung",
];

const ablauf = [
  { nr: "01", titel: "Beraten", text: "Im Haus, in der Ausstellung oder bei Ihnen vor Ort. Ihr Bad sehen Sie vorab durch die 3D-Badbrille." },
  { nr: "02", titel: "Planen", text: "Wir rechnen den Wärmebedarf, zeichnen das Bad und stellen die Förderanträge." },
  { nr: "03", titel: "Ausführen", text: "Alle Gewerke nach Plan. Sanierung ohne Staub — wir setzen eine eigene Absauganlage ein." },
  { nr: "04", titel: "Übergeben", text: "Fixpreis und Fixtermin gelten. Nach der Endreinigung übernehmen wir die Wartung." },
];

export default function Start() {
  return (
    <>
      <Hero />

      {/* Das Versprechen */}
      <Sektion>
        <Kopfzeile
          nummer="01"
          label="Alles aus einer Hand"
          titel={<>Eine Badsanierung berührt acht Gewerke. Sie führen keines davon.</>}
          text="Fliesenleger, Elektriker, Maler, Innenausbau — wir beauftragen und koordinieren alle. Ein Angebot, ein Termin, ein Ansprechpartner."
        />

        <Anlauf klasse="mt-16" verzug={80}>
          <ul className="flex flex-wrap gap-x-8 gap-y-4 border-y border-tief/12 py-8">
            {gewerke.map((g) => (
              <li key={g} className="t-label text-tief/60">
                {g}
              </li>
            ))}
          </ul>
        </Anlauf>

        <ol className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-4">
          {ablauf.map((s, i) => (
            <Anlauf als="li" key={s.nr} verzug={i * 80} klasse="border-t border-tief/20 pt-6">
              <p className="t-label t-zahl text-kupfer">{s.nr}</p>
              <h3 className="t-karte mt-4">{s.titel}</h3>
              <p className="t-text mt-4 text-tief/70">{s.text}</p>
            </Anlauf>
          ))}
        </ol>
      </Sektion>

      {/* Leistungen */}
      <Sektion dunkel id="leistungen">
        <Kopfzeile
          dunkel
          nummer="02"
          label="Leistungen"
          titel={<>Fünf Sparten, ein Betrieb — seit 1962.</>}
          text="Bad, Heizung, Solarthermie, Schwimmbad und Wellness. Dass wir alles selbst machen, merken Sie spätestens, wenn der Pool beheizt werden soll."
        />

        <ul className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-kante bg-white/15 md:grid-cols-6">
          {leistungen.map((l, i) => (
            <Anlauf
              als="li"
              key={l.slug}
              verzug={i * 60}
              klasse={`bg-tief ${i < 2 ? "md:col-span-3" : "md:col-span-2"}`}
            >
              <Link
                href={`/${l.slug}`}
                className="group flex h-full flex-col p-8 transition-colors hover:bg-tiefer md:p-10"
              >
                <p className="t-label t-zahl text-papier/40">{l.nummer}</p>
                <h3 className="t-h3 mt-6">{l.titel}</h3>
                <p className="t-text mt-4 text-papier/60">{l.zeile}</p>
                <p className="t-text mass mt-6 text-papier/75">{l.text}</p>
                <ul className="mt-8 space-y-2">
                  {l.punkte.map((p) => (
                    <li key={p} className="t-text flex gap-4 text-papier/60">
                      <span aria-hidden className="mt-3 h-px w-4 shrink-0 bg-papier/30" />
                      {p}
                    </li>
                  ))}
                </ul>
                <span className="t-label mt-auto pt-10 text-papier/70 transition-colors group-hover:text-kupfer">
                  {l.titel} ansehen →
                </span>
              </Link>
            </Anlauf>
          ))}
        </ul>
      </Sektion>

      <Bildband
        bild="/fotos/band-planung.jpg"
        alt="Kupferrohre, Fittinge und eine Rohrzange auf einem Installationsplan"
        unterschrift="Gerechnet, gezeichnet und gebaut im selben Haus."
        position="center 45%"
      />

      {/* Ausstellung */}
      <Sektion id="ausstellung">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Kopfzeile
              nummer="03"
              label="Ausstellung Wardenburg"
              titel={
                <>
                  <span className="t-zahl">
                    <Zahl bis={betrieb.ausstellungQm} />
                  </span>{" "}
                  Quadratmeter, die man nicht im Katalog blättern kann.
                </>
              }
              text="Bad und Pool in einer Halle, seit 2020 umgebaut. Kommen Sie nach Terminabsprache — dann hat jemand Zeit für Sie."
            />
            <Anlauf klasse="mt-10" verzug={80}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Knopf href="/kontakt">Termin vereinbaren</Knopf>
                <Knopf href="/ausstellung" art="linie">
                  Ausstellung ansehen
                </Knopf>
              </div>
            </Anlauf>
          </div>

          <Anlauf klasse="lg:col-span-5" verzug={120}>
            <Foto
              bild="/fotos/ausstellung-sitzbereich.jpg"
              alt="Blick in die Ausstellung der Brouwer GmbH mit Sitzecke, Duschkabine und Badkojen"
              verhaeltnis="16/9"
              groesse="(min-width: 1024px) 42vw, 100vw"
            />
          </Anlauf>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              bild: "/fotos/ausstellung-doppelwaschtisch.jpg",
              alt: "Doppelwaschtisch mit Aufsatzbecken, beleuchtetem Spiegel und Duschabtrennung in der Ausstellung",
              text: "Badkojen zum Anfassen",
            },
            {
              bild: "/fotos/ausstellung-heizung.jpg",
              alt: "Heizkessel und Heizkörper der Marke Brötje in der Ausstellung",
              text: "Heiztechnik im Schnitt",
            },
            {
              bild: "/fotos/ausstellung-poolpflege.jpg",
              alt: "Regal mit Wasserpflegemitteln und Pooltestern in der Ausstellung",
              text: "Wasserpflege für den Pool",
            },
          ].map((f, i) => (
            <Anlauf als="li" key={f.bild} verzug={i * 80}>
              <Foto bild={f.bild} alt={f.alt} verhaeltnis="16/9" groesse="(min-width: 768px) 30vw, 100vw" />
              <p className="t-label mt-4 text-mittel">{f.text}</p>
            </Anlauf>
          ))}
        </ul>
      </Sektion>

      <Bildband
        bild="/fotos/band-armatur.jpg"
        alt="Verchromte Kreuzgriff-Armatur an einem weißen Waschbecken"
        unterschrift="Was Sie täglich anfassen, wählen Sie bei uns selbst aus."
      />

      {/* Notdienst und Kontakt */}
      <Sektion dunkel id="kontakt">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Kopfzeile
              dunkel
              nummer="04"
              label="Notdienst und Kontakt"
              titel={<>Heizung ausgefallen — und es ist Samstag.</>}
              text="Unser Notdienst läuft 24 Stunden. Den Rest der Woche erreichen Sie uns zu den Öffnungszeiten, am besten mit Termin."
            />
            <Anlauf klasse="mt-10" verzug={80}>
              <a
                href={`tel:${betrieb.telefonRaw}`}
                className="t-zahl block font-semibold tracking-[-0.03em] text-papier transition-colors hover:text-kupfer"
                style={{ fontSize: "clamp(34px, 4.6vw, 56px)", lineHeight: 1 }}
              >
                {betrieb.telefon}
              </a>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Knopf href="/kontakt">Termin vereinbaren</Knopf>
                <Knopf href={`mailto:${betrieb.email}`} art="linie-hell" extern>
                  {betrieb.email}
                </Knopf>
              </div>
            </Anlauf>
          </div>

          <Anlauf klasse="lg:col-span-5 lg:col-start-9" verzug={120}>
            <Status klasse="text-papier/80" />
            <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {zeitenText.map((z) => (
                <div key={z.tage} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between sm:gap-8">
                  <dt className="t-label text-papier/50">{z.tage}</dt>
                  <dd className="t-text t-zahl text-papier/85 sm:text-right">{z.zeit}</dd>
                </div>
              ))}
            </dl>
            <address className="t-text mt-8 not-italic text-papier/70">
              {betrieb.name}
              <br />
              {betrieb.strasse}
              <br />
              {betrieb.plz} {betrieb.ort}
            </address>
          </Anlauf>
        </div>
      </Sektion>
    </>
  );
}
