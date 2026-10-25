import type { Metadata } from "next";
import localFont from "next/font/local";
import { Rahmen } from "@/components/layout/Rahmen";
import "./globals.css";

/*
 * Eine Schrift, nicht zwei — und keine Serife.
 *
 * Vier Schriften sind hier nacheinander durchgefallen: Outfit und Plus
 * Jakarta Sans (die Vorlagenschriften), dann Fraunces, dann Recia. Die
 * letzten beiden waren Serifen, und genau das war der Einwand: "dieses mit
 * den Serifen finde ich nicht gut." Zweimal gesagt, einmal zu spaet gehoert.
 *
 * Jetzt traegt Plein von Inga Ploennigs alles allein — eine Grotesk mit
 * Gewichten von 300 bis 900, also genug Abstufung fuer Ueberschrift, Text und
 * Masszahl. Eine einzige Schrift ist kein Mangel, sondern die Haltung, die
 * auch Telekom faehrt: wer nur einen Ton hat, kann sich nicht widersprechen.
 *
 * Selbst ausgeliefert aus src/schriften/, 30 KB, keine Anfrage nach aussen.
 * Lizenz daneben: ITF Free Font License, Selbsthosten ausdruecklich erlaubt.
 */
const plein = localFont({
  src: "../schriften/Plein-Variable.woff2",
  weight: "300 900",
  variable: "--schrift-warm",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Serienküche", template: "%s — Serienküche" },
  description:
    "Prototyp: Küchen planen, von der einzelnen Küche bis zur Serie im Wohnbauprojekt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${plein.variable}`}>
      <body>
        <Rahmen>{children}</Rahmen>
      </body>
    </html>
  );
}
