import Link from "next/link";

export const metadata = { title: "Seite nicht gefunden — Serienküche" };

export default function NichtGefunden() {
  return (
    <div className="warm flex min-h-screen items-center justify-center px-5">
      <div className="max-w-[48ch] text-center">
        <div className="vorzeile">Seite nicht gefunden</div>
        <h1 className="gross mt-3 text-[34px] font-bold text-kohle sm:text-[42px]">
          Hier ist nichts.
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-kohle-2">
          Die Adresse gibt es nicht — vielleicht ein Tippfehler, vielleicht hat sich etwas
          verschoben. Deine Planung ist davon unberührt, die liegt in deinem Browser.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/kueche"
            className="inline-flex items-center rounded-full bg-gradient-to-b from-[#3b382f] to-kohle px-6 py-3 text-[15.5px] font-semibold text-creme"
          >
            Zurück zur Planung
          </Link>
          <Link href="/" className="text-[15px] text-kohle-2 underline underline-offset-2 hover:text-kohle">
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
