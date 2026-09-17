import Image from "next/image";
import Link from "next/link";
import { bilder } from "@/content/bilder";
import { navigation, verein } from "@/content/verein";
import { Welle } from "./marke";
import { PfeilRechts } from "./ui";

const rechtliches = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-paper sm:mt-32">
      <Welle
        className="absolute inset-x-0 -top-px h-6 w-[200%] text-paper sm:h-8"
        aria-hidden="true"
      />

      <div className="shell relative pt-24 pb-12 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10">
          <div className="max-w-sm">
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.025em]">
              Glücksbringer <span className="text-mist">am Meer</span> e.V.
            </p>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-paper/65">
              {verein.beschreibung}
            </p>

            <div className="mt-7 flex items-center gap-3">
              <a
                href={verein.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-full border border-paper/20 transition-colors duration-300 hover:border-paper/50 hover:bg-paper/10"
              >
                <span className="sr-only">
                  Glücksbringer am Meer auf Facebook
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="size-[1.1rem]"
                >
                  <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3-.04-1.3-.13-2.45-.13-2.4 0-4.05 1.47-4.05 4.18V9.9H7.5V13h2.7v8h3.3Z" />
                </svg>
              </a>
              <a
                href={verein.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-full border border-paper/20 transition-colors duration-300 hover:border-paper/50 hover:bg-paper/10"
              >
                <span className="sr-only">
                  Glücksbringer am Meer auf Instagram
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="size-[1.15rem]"
                >
                  <rect
                    x="3.5"
                    y="3.5"
                    width="17"
                    height="17"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3.7"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <circle cx="17" cy="7" r="1.15" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          <nav aria-label="Footer-Navigation">
            <h2 className="text-xs font-semibold tracking-[0.14em] text-mist uppercase">
              Seiten
            </h2>
            <ul className="mt-5 space-y-3 text-[0.9375rem]">
              {navigation.map((eintrag) => (
                <li key={eintrag.href}>
                  <Link
                    href={eintrag.href}
                    className="text-paper/75 transition-colors duration-200 hover:text-paper"
                  >
                    {eintrag.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/unterstuetzen"
                  className="text-paper/75 transition-colors duration-200 hover:text-paper"
                >
                  Unterstützen
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold tracking-[0.14em] text-mist uppercase">
              Kontakt
            </h2>
            <address className="mt-5 space-y-1 text-[0.9375rem] leading-relaxed text-paper/75 not-italic">
              <p>{verein.name}</p>
              <p>{verein.anschrift.strasse}</p>
              <p>
                {verein.anschrift.plz} {verein.anschrift.ort}
              </p>
              <p className="pt-2">
                <a
                  href={`mailto:${verein.email}`}
                  className="underline decoration-paper/30 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper"
                >
                  {verein.email}
                </a>
              </p>
            </address>

            <Link
              href="/unterstuetzen"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 text-[0.9375rem] font-semibold text-ink transition-colors duration-300 hover:bg-mist"
            >
              Jetzt spenden
              <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-paper/12 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Image
              src={bilder.puck}
              alt=""
              aria-hidden="true"
              width={40}
              height={77}
              className="h-14 w-auto opacity-90"
            />
            <p className="pb-1 text-xs leading-relaxed text-paper/50">
              © {new Date().getFullYear()} {verein.name}
              <br />
              {verein.register}
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-paper/60">
            {rechtliches.map((eintrag) => (
              <li key={eintrag.href}>
                <Link
                  href={eintrag.href}
                  className="transition-colors hover:text-paper"
                >
                  {eintrag.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
