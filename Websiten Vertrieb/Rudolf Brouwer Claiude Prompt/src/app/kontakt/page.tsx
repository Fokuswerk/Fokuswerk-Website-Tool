import type { Metadata } from "next";
import Anlauf from "@/components/Anlauf";
import Status from "@/components/Status";
import Karte from "@/components/Karte";
import { Sektion, Kopfzeile, Seitenkopf, Knopf } from "@/components/Bausteine";
import { betrieb, zeitenText } from "@/lib/daten";

export const metadata: Metadata = {
  title: "Service und Kontakt",
  description:
    "Rudolf Brouwer GmbH, Oldenburger Straße 209, 26203 Wardenburg. Telefon 04407 8991, 24-Stunden-Notdienst, Öffnungszeiten und Anfahrt.",
  alternates: { canonical: "/kontakt" },
};

export default function Kontakt() {
  return (
    <>
      <Seitenkopf
        label="Service und Kontakt"
        titel="Rufen Sie an. Es geht jemand ran, der den Betrieb kennt."
        text="Für die Beratung bitten wir um eine vorherige Terminabsprache — dann nehmen wir uns die Zeit, die Ihr Vorhaben braucht."
        aktionen={
          <>
            <Knopf href={`tel:${betrieb.telefonRaw}`} extern>
              {betrieb.telefon}
            </Knopf>
            <Knopf href={`mailto:${betrieb.email}`} art="linie-hell" extern>
              {betrieb.email}
            </Knopf>
          </>
        }
      />

      <Sektion>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Kopfzeile nummer="01" label="Anschrift" titel={<>Am Ortseingang von Wardenburg.</>} />
            <Anlauf klasse="mt-10" verzug={60}>
              <address className="t-text not-italic text-tief/80">
                {betrieb.name}
                <br />
                {betrieb.strasse}
                <br />
                {betrieb.plz} {betrieb.ort}
              </address>
              <dl className="mt-8 divide-y divide-tief/12 border-y border-tief/12">
                <div className="flex justify-between gap-8 py-4">
                  <dt className="t-label text-mittel">Telefon</dt>
                  <dd>
                    <a href={`tel:${betrieb.telefonRaw}`} className="t-text t-zahl text-tief hover:text-kupfer">
                      {betrieb.telefon}
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between gap-8 py-4">
                  <dt className="t-label text-mittel">Fax</dt>
                  <dd className="t-text t-zahl text-tief/70">{betrieb.fax}</dd>
                </div>
                <div className="flex justify-between gap-8 py-4">
                  <dt className="t-label text-mittel">E-Mail</dt>
                  <dd>
                    <a href={`mailto:${betrieb.email}`} className="t-text text-tief hover:text-kupfer">
                      {betrieb.email}
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between gap-8 py-4">
                  <dt className="t-label text-mittel">Geschäftsführung</dt>
                  <dd className="t-text text-tief/70">{betrieb.geschaeftsfuehrer}</dd>
                </div>
              </dl>
            </Anlauf>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Kopfzeile nummer="02" label="Öffnungszeiten" titel={<>Wann wir da sind.</>} />
            <Anlauf klasse="mt-10" verzug={60}>
              <Status klasse="text-tief" />
              <dl className="mt-8 divide-y divide-tief/12 border-y border-tief/12">
                {zeitenText.map((z) => (
                  <div key={z.tage} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between sm:gap-8">
                    <dt className="t-label text-mittel">{z.tage}</dt>
                    <dd className="t-text t-zahl text-tief/80 sm:text-right">{z.zeit}</dd>
                  </div>
                ))}
              </dl>
              <p className="t-text mass mt-8 text-tief/70">
                Wir bitten um eine vorherige Terminabsprache, damit wir Sie umfassend beraten können.
              </p>
            </Anlauf>
          </div>
        </div>
      </Sektion>

      <Sektion dunkel>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <Kopfzeile
              dunkel
              nummer="03"
              label="Notdienst"
              titel={<>24 Stunden. Auch samstags, auch nachts.</>}
              text="Damit Sie nicht im Kalten sitzen: Bei einem Heizungsausfall kümmert sich unser Heizungsfachmann schnell um das Problem."
            />
          </div>
          <Anlauf klasse="lg:col-span-5 lg:col-start-9" verzug={80}>
            <a
              href={`tel:${betrieb.telefonRaw}`}
              className="t-zahl block font-semibold tracking-[-0.03em] text-papier transition-colors hover:text-kupfer"
              style={{ fontSize: "clamp(34px, 4.6vw, 56px)", lineHeight: 1 }}
            >
              {betrieb.telefon}
            </a>
            {/* TODO: vom Kunden bestätigen — eigene Notdienstnummer außerhalb der Öffnungszeiten? */}
          </Anlauf>
        </div>
      </Sektion>

      <Sektion>
        <Kopfzeile nummer="04" label="Anfahrt" titel={<>Oldenburger Straße 209, direkt an der Durchfahrt.</>} />
        <Anlauf klasse="mt-12" verzug={60}>
          <Karte />
        </Anlauf>
      </Sektion>
    </>
  );
}
