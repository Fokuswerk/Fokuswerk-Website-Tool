import Link from "next/link";
import Image from "next/image";
import Status from "./Status";
import { betrieb } from "@/lib/daten";

export default function Hero() {
  return (
    <section className="auf-dunkel relative flex min-h-[100svh] flex-col overflow-hidden bg-tiefer pb-[72px] text-papier md:pb-0">
      {/* Vollflächiges Bild, dunkel abgedeckt */}
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/fotos/hero-dusche.jpg"
          alt=""
          fill
          priority
          quality={84}
          sizes="100vw"
          className="stufe scale-x-[-1] object-cover object-center"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(92deg, rgba(11,18,41,.94) 0%, rgba(11,18,41,.80) 30%, rgba(16,26,56,.42) 62%, rgba(16,26,56,.22) 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: "linear-gradient(to top, rgba(11,18,41,.92), transparent)" }}
        />
      </div>

      <div className="huelle relative flex flex-1 items-end pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="bahn">
          <p className="stufe t-label text-papier/60" style={{ animationDelay: "160ms" }}>
            Seit {betrieb.gegruendet} in {betrieb.ort}
          </p>

          <h1 className="stufe t-h1 mt-6 max-w-[16ch]" style={{ animationDelay: "280ms" }}>
            Ihr Bad. Ihre Heizung.
            <br />
            <span className="text-kupfer">Ein Ansprechpartner.</span>
          </h1>

          <p className="stufe t-text mass mt-8 text-papier/80" style={{ animationDelay: "400ms" }}>
            Vom ersten Entwurf bis zur Endreinigung koordinieren wir jedes Gewerk selbst.
          </p>

          <div
            className="stufe mt-10 flex flex-col gap-4 sm:flex-row"
            style={{ animationDelay: "500ms" }}
          >
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center rounded-kante bg-kupfer px-8 py-4 font-medium text-papier transition-colors hover:bg-[#a95d2e]"
            >
              Termin vereinbaren
            </Link>
            <a
              href={`tel:${betrieb.telefonRaw}`}
              className="t-zahl inline-flex items-center justify-center rounded-kante border border-papier/30 px-8 py-4 font-medium text-papier transition-colors hover:border-papier/70"
            >
              {betrieb.telefon}
            </a>
          </div>
        </div>
      </div>

      <div
        className="stufe huelle relative border-t border-white/15"
        style={{ animationDelay: "620ms" }}
      >
        <div className="bahn grid grid-cols-1 gap-4 py-6 md:grid-cols-3 md:items-center md:gap-8">
          <Status klasse="text-papier/80" />
          <p className="t-label hidden text-papier/50 md:block md:justify-self-center">
            <span className="t-zahl">{betrieb.ausstellungQm}</span> m² Ausstellung Bad &amp; Pool
          </p>
          <p className="t-label hidden text-papier/50 md:block md:justify-self-end">
            {betrieb.strasse} · {betrieb.ort}
          </p>
        </div>
      </div>
    </section>
  );
}
