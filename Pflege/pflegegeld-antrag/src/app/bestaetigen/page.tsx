import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { leadBestaetigen, type BestaetigungsErgebnis } from "@/lib/speicher";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anmeldung bestätigen – Pflegegeld-Antrag",
  robots: { index: false, follow: false },
};

/**
 * Was der Besucher je Ausgang liest. Jeder Fall nennt den nächsten Schritt;
 * eine Fehlermeldung ohne Ausweg ist für jemanden, der gerade auf einen Link
 * in einer Mail geklickt hat, eine Sackgasse.
 */
const TEXTE: Record<BestaetigungsErgebnis, { titel: string; text: string; stil: string }> = {
  bestaetigt: {
    titel: "Danke, das war's.",
    text:
      "Ihre Anmeldung ist bestätigt. Wir melden uns zum Stichtag und wenn Bundestag und " +
      "Bundesrat über den Entwurf entschieden haben. Sonst nicht.",
    stil: "hinweis-gut",
  },
  "schon-bestaetigt": {
    titel: "War schon bestätigt.",
    text: "Sie stehen bereits auf der Liste. Sie müssen nichts weiter tun.",
    stil: "hinweis-gut",
  },
  abgelaufen: {
    titel: "Der Link ist abgelaufen.",
    text:
      "Bestätigungslinks gelten sieben Tage. Melden Sie sich einfach noch einmal an, dann " +
      "schicken wir einen neuen.",
    stil: "hinweis-gelb",
  },
  unbekannt: {
    titel: "Diesen Link kennen wir nicht.",
    text:
      "Möglicherweise wurde er beim Kopieren abgeschnitten, oder die Anmeldung ist schon " +
      "gelöscht. Melden Sie sich gern noch einmal an.",
    stil: "hinweis-gelb",
  },
  fehler: {
    titel: "Das hat gerade nicht geklappt.",
    text:
      "Ein technisches Problem auf unserer Seite – an Ihrer Anmeldung liegt es nicht. " +
      "Bitte versuchen Sie den Link später noch einmal.",
    stil: "hinweis-signal",
  },
};

export default async function Seite({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const kopf = await headers();
  const ip = (kopf.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;

  const ergebnis: BestaetigungsErgebnis = t ? await leadBestaetigen(t, ip) : "unbekannt";
  const { titel, text, stil } = TEXTE[ergebnis];

  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="auge">Anmeldung</div>
        <h1>{titel}</h1>
        <div className={`hinweis ${stil} abstand-m`}>{text}</div>

        <div className="knopf-reihe abstand-m">
          <Link className="knopf" href="/">Zur Startseite</Link>
          {(ergebnis === "abgelaufen" || ergebnis === "unbekannt") && (
            <Link className="knopf knopf-zweit" href="/#erinnerung">Noch einmal anmelden</Link>
          )}
        </div>

        <p className="quelle abstand-l">
          Sie können die Anmeldung jederzeit widerrufen – eine Mail genügt, danach löschen wir
          den Eintrag.
        </p>
      </div>
    </main>
  );
}
