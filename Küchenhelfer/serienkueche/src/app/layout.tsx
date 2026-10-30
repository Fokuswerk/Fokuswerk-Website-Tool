import type { Metadata } from "next";
import localFont from "next/font/local";
import { Rahmen } from "@/components/layout/Rahmen";
import "./globals.css";

/*
 * Zwei Schriften, keine Serife.
 *
 * Vier Schriften sind hier nacheinander durchgefallen: Outfit und Plus
 * Jakarta Sans (die Vorlagenschriften), dann Fraunces, dann Recia. Die
 * letzten beiden waren Serifen, und genau das war der Einwand: "dieses mit
 * den Serifen finde ich nicht gut."
 *
 * Danach habe ich auf eine einzige Grotesk reduziert und das als Haltung
 * verkauft. Das war die falsche Lehre. "Keine Serifen" heisst nicht "eine
 * Schrift". Nachgemessen an den sechs eigenen Referenzseiten, aus deren
 * echtem CSS: alle sechs paaren zwei Schriften, vier davon Grotesk + Mono
 * (karosseriebau Archivo + Plex Mono, andre-henken Schibsted + Plex Mono,
 * bunjes Archivo + Plex Sans, glanzwerk Barlow + Switzer). Eine Seite mit
 * nur einer Schrift hat keine zweite Stimme fuer Masse und Zahlen — und
 * genau die braucht ein Werkzeug, das in Millimetern rechnet.
 *
 * Plein (Inga Ploennigs, ITF Free Font License) traegt Ueberschrift und Text.
 * Geist Mono (Vercel/basement.studio, SIL OFL) traegt alles Gemessene:
 * Masse, Preise, Artikelnummern, Etiketten. Keine von beiden ist eine
 * Google-Schrift, beide liegen in src/schriften/ und werden selbst
 * ausgeliefert — 89 KB zusammen, keine Anfrage nach aussen.
 *
 * Der Einwand gegen Monospace aus dem Tracking-Werkzeug galt einer
 * DURCHGEHENDEN Mono in 10-11 px, Terminal-Anmutung. Das hier ist das
 * Gegenteil: die Mono erscheint nur dort, wo wirklich gemessen wird.
 */
const plein = localFont({
  src: "../schriften/Plein-Variable.woff2",
  weight: "300 900",
  variable: "--schrift-warm",
  display: "swap",
});

/*
 * Und eine dritte, die nur die Schauseite traegt.
 *
 * Die Startseite ist jetzt in der Sprache von Aplomb gesetzt: kuehl,
 * mineralisch, Mass vor Schmuck. Dazu gehoert Switzer (Fontshare, frei fuer
 * kommerzielle Nutzung), selbst ausgeliefert wie die anderen beiden.
 *
 * Der Planer behaelt Plein und Geist Mono. Das ist kein Versehen: er soll
 * sich nicht aendern, und eine Strecke, an der sechzehn Fragen haengen,
 * baut man nicht um, waehrend man die Schauseite neu kleidet.
 */
const switzer = localFont({
  src: [
    { path: "../schriften/switzer-400.woff2", weight: "400", style: "normal" },
    { path: "../schriften/switzer-500.woff2", weight: "500", style: "normal" },
    { path: "../schriften/switzer-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--schrift-kalk",
  display: "swap",
});

const geistMono = localFont({
  src: "../schriften/GeistMono-Variable.woff2",
  weight: "300 700",
  variable: "--schrift-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Serienküche", template: "%s — Serienküche" },
  description:
    "Prototyp: Küchen planen, von der einzelnen Küche bis zur Serie im Wohnbauprojekt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${plein.variable} ${geistMono.variable} ${switzer.variable}`}>
      <body>
        <Rahmen>{children}</Rahmen>
      </body>
    </html>
  );
}
