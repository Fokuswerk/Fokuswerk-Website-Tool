import Link from "next/link";
import Image from "next/image";
import Status from "./Status";
import { betrieb, zeitenText, leistungen } from "@/lib/daten";

export default function Fuss() {
  return (
    <footer className="auf-dunkel bg-tiefer text-papier">
      <div className="huelle">
        <div className="bahn grid grid-cols-1 gap-12 py-24 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Image
              src="/logo-brouwer.png"
              alt="Rudolf Brouwer GmbH"
              width={300}
              height={121}
              className="h-10 w-auto brightness-0 invert"
            />
            <p className="t-text mass mt-8 text-papier/70">
              Familienbetrieb für Sanitär, Heizung und Schwimmbad in Wardenburg bei Oldenburg.
              Gegründet {betrieb.gegruendet}.
            </p>
            <Status klasse="mt-8 text-papier/80" />
          </div>

          <nav className="md:col-span-3" aria-label="Leistungen">
            <p className="t-label text-papier/40">Leistungen</p>
            <ul className="mt-6 space-y-4">
              {leistungen.map((l) => (
                <li key={l.slug}>
                  <Link href={`/${l.slug}`} className="t-text text-papier/80 transition-colors hover:text-kupfer">
                    {l.titel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="t-label text-papier/40">Kontakt</p>
            <address className="mt-6 not-italic">
              <p className="t-text text-papier/80">
                {betrieb.name}
                <br />
                {betrieb.strasse}
                <br />
                {betrieb.plz} {betrieb.ort}
              </p>
              <p className="mt-4">
                <a href={`tel:${betrieb.telefonRaw}`} className="t-text t-zahl text-papier transition-colors hover:text-kupfer">
                  {betrieb.telefon}
                </a>
                <br />
                <a href={`mailto:${betrieb.email}`} className="t-text text-papier transition-colors hover:text-kupfer">
                  {betrieb.email}
                </a>
              </p>
            </address>
            <dl className="mt-8 space-y-2">
              {zeitenText.map((z) => (
                <div key={z.tage} className="flex flex-col">
                  <dt className="t-label text-papier/40">{z.tage}</dt>
                  <dd className="t-text t-zahl text-papier/80">{z.zeit}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="bahn flex flex-col gap-4 border-t border-white/10 py-8 md:flex-row md:items-center md:justify-between">
          <p className="t-label text-papier/40">
            © {new Date().getFullYear()} {betrieb.name}
          </p>
          <nav aria-label="Rechtliches" className="flex flex-wrap gap-8">
            <Link href="/partner" className="t-label text-papier/60 transition-colors hover:text-papier">
              Partner
            </Link>
            <Link href="/impressum" className="t-label text-papier/60 transition-colors hover:text-papier">
              Impressum
            </Link>
            <Link href="/datenschutz" className="t-label text-papier/60 transition-colors hover:text-papier">
              Datenschutz
            </Link>
          </nav>
        </div>
      </div>
      <div className="h-[72px] md:hidden" />
    </footer>
  );
}
