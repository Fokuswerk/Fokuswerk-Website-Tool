import Link from "next/link";
import Image from "next/image";
import Anlauf from "./Anlauf";

/* Abschnitt — hell oder dunkel, Abstand oben wie unten identisch */
export function Sektion({
  dunkel = false,
  id,
  children,
  klasse = "",
}: {
  dunkel?: boolean;
  id?: string;
  children: React.ReactNode;
  klasse?: string;
}) {
  return (
    <section
      id={id}
      className={`sektion ${dunkel ? "auf-dunkel bg-tief text-papier" : "bg-papier text-tief"} ${klasse}`}
    >
      <div className="huelle">
        <div className="bahn">{children}</div>
      </div>
    </section>
  );
}

/* Abschnittskopf: kleine Nummer, Versalienzeile, Aussage, höchstens zwei Sätze */
export function Kopfzeile({
  nummer,
  label,
  titel,
  text,
  dunkel = false,
}: {
  nummer?: string;
  label?: string;
  titel: React.ReactNode;
  text?: string;
  dunkel?: boolean;
}) {
  return (
    <Anlauf>
      {(nummer || label) && (
        <p className={`t-label flex items-baseline gap-4 ${dunkel ? "text-papier/50" : "text-mittel"}`}>
          {nummer && <span className="t-zahl">{nummer}</span>}
          {label && <span>{label}</span>}
        </p>
      )}
      <h2 className="t-h2 mt-6 max-w-[20ch]">{titel}</h2>
      {text && (
        <p className={`t-text mass mt-6 ${dunkel ? "text-papier/70" : "text-tief/70"}`}>{text}</p>
      )}
    </Anlauf>
  );
}

/* Hauptaktion */
export function Knopf({
  href,
  children,
  art = "voll",
  extern = false,
}: {
  href: string;
  children: React.ReactNode;
  art?: "voll" | "linie" | "linie-hell";
  extern?: boolean;
}) {
  const stil =
    art === "voll"
      ? "bg-kupfer text-papier hover:bg-[#a95d2e]"
      : art === "linie-hell"
        ? "border border-papier/30 text-papier hover:border-papier/70"
        : "border border-tief/25 text-tief hover:border-tief/60";
  const klasse = `inline-flex items-center justify-center rounded-kante px-8 py-4 font-medium transition-colors ${stil}`;
  if (extern)
    return (
      <a href={href} className={klasse} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  return (
    <Link href={href} className={klasse}>
      {children}
    </Link>
  );
}

/* Vollflächiges Bildband mit höchstens einer Bildunterschrift */
export function Bildband({
  bild,
  alt,
  unterschrift,
  hoch = false,
  position = "center",
}: {
  bild: string;
  alt: string;
  unterschrift?: string;
  hoch?: boolean;
  position?: string;
}) {
  return (
    <section className="auf-dunkel relative w-full overflow-hidden bg-tiefer">
      <div className={`relative w-full ${hoch ? "h-[72svh] min-h-[480px]" : "h-[56svh] min-h-[360px]"}`}>
        <Image
          src={bild}
          alt={alt}
          fill
          sizes="100vw"
          quality={82}
          className="object-cover"
          style={{ objectPosition: position }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(11,18,41,.94) 0%, rgba(11,18,41,.74) 46%, rgba(11,18,41,.66) 100%)",
          }}
        />
        {unterschrift && (
          <div className="huelle absolute inset-x-0 bottom-0 pb-10 md:pb-14">
            <div className="bahn">
              <Anlauf>
                <p className="t-h3 max-w-[22ch] text-papier">{unterschrift}</p>
              </Anlauf>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* Foto in festem Seitenverhältnis — nie gestreckt, nie über die Quellgröße hinaus */
export function Foto({
  bild,
  alt,
  verhaeltnis = "16/9",
  groesse = "(min-width: 1024px) 40vw, 100vw",
  position = "center",
  klasse = "",
}: {
  bild: string;
  alt: string;
  verhaeltnis?: string;
  groesse?: string;
  position?: string;
  klasse?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-kante bg-papier-2 ${klasse}`}
      style={{ aspectRatio: verhaeltnis }}
    >
      <Image
        src={bild}
        alt={alt}
        fill
        sizes={groesse}
        quality={82}
        className="object-cover"
        style={{ objectPosition: position }}
      />
    </div>
  );
}

/* Kopfband einer Unterseite — dunkle Markenfläche, kein hochgezogenes Kleinbild */
export function Seitenkopf({
  label,
  titel,
  text,
  aktionen,
}: {
  label: string;
  titel: string;
  text?: string;
  aktionen?: React.ReactNode;
}) {
  return (
    <section className="auf-dunkel relative overflow-hidden bg-tiefer text-papier">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px)",
            backgroundSize: "88px 88px",
            maskImage: "radial-gradient(110% 100% at 80% 10%, #000 0%, transparent 74%)",
            WebkitMaskImage: "radial-gradient(110% 100% at 80% 10%, #000 0%, transparent 74%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(85% 75% at 84% 4%, rgba(56,92,190,.34) 0%, rgba(11,18,41,0) 64%)",
          }}
        />
      </div>

      <div className="huelle relative">
        <div className="bahn flex min-h-[52svh] flex-col justify-end pb-16 pt-40 md:pb-24 md:pt-48">
          <p className="stufe t-label text-papier/60" style={{ animationDelay: "80ms" }}>
            {label}
          </p>
          <h1 className="stufe t-h1 mt-6 max-w-[18ch]" style={{ animationDelay: "180ms" }}>
            {titel}
          </h1>
          {text && (
            <p className="stufe t-text mass mt-8 text-papier/75" style={{ animationDelay: "280ms" }}>
              {text}
            </p>
          )}
          {aktionen && (
            <div className="stufe mt-10 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: "380ms" }}>
              {aktionen}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* Ruhiger Abschluss jeder Unterseite */
export function Abschluss({
  titel,
  text,
}: {
  titel: string;
  text: string;
}) {
  return (
    <Sektion dunkel>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
        <div className="lg:col-span-7">
          <Anlauf>
            <h2 className="t-h2 max-w-[18ch]">{titel}</h2>
            <p className="t-text mass mt-6 text-papier/70">{text}</p>
          </Anlauf>
        </div>
        <Anlauf klasse="lg:col-span-5 lg:col-start-9" verzug={80}>
          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
            <Knopf href="/kontakt">Termin vereinbaren</Knopf>
            <Knopf href="tel:+49440788991" art="linie-hell" extern>
              04407 8991
            </Knopf>
          </div>
        </Anlauf>
      </div>
    </Sektion>
  );
}

/* Liste mit dünner Linie — für Merkmale, Bestandteile, Systeme */
export function Linienliste({
  eintraege,
  dunkel = false,
  spalten = 2,
}: {
  eintraege: { titel: string; text?: string }[];
  dunkel?: boolean;
  spalten?: 2 | 3;
}) {
  return (
    <ul
      className={`grid grid-cols-1 gap-x-8 ${spalten === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
    >
      {eintraege.map((e, i) => (
        <Anlauf
          als="li"
          key={e.titel}
          verzug={i * 60}
          klasse={`border-t py-6 ${dunkel ? "border-white/15" : "border-tief/15"}`}
        >
          <h3 className="t-karte">{e.titel}</h3>
          {e.text && (
            <p className={`t-text mt-3 ${dunkel ? "text-papier/65" : "text-tief/65"}`}>{e.text}</p>
          )}
        </Anlauf>
      ))}
    </ul>
  );
}
