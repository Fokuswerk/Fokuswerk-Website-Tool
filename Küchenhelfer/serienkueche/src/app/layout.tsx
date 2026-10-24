import type { Metadata } from "next";
import { Archivo, Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Rahmen } from "@/components/layout/Rahmen";

/**
 * Die Schriften liegen beim eigenen Server.
 *
 * Vorher wurden sie bei jedem Seitenaufruf von fonts.googleapis.com geholt —
 * damit übertrug jeder Besucher der Verbraucherseite seine IP-Adresse an
 * Google. next/font lädt sie beim Bauen herunter und liefert sie von der
 * eigenen Domain aus; es wird kein Netz zu Google mehr aufgebaut.
 */
/* Der Bautraegerbereich bleibt sachlich: Archivo und eine echte Monospace
   fuer Masse und Artikelnummern. Da gehoert das hin. */
const archivo = Archivo({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--schrift-ui", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--schrift-data", display: "swap" });

/* Der Privatkundenbereich hatte Outfit und Plus Jakarta Sans — die zwei
   Schriften, die auf jeder zweiten vorlagengebauten Seite stehen. Technisch
   einwandfrei und genau deshalb ohne Gesicht.
   Fraunces ist eine veraenderliche Serif mit Achsen fuer optische Groesse,
   Weichheit und Eigenwilligkeit: sie wirkt gezeichnet, nicht generiert, und
   passt zu Holz, Stein und Essen. Instrument Sans daneben traegt den Text,
   schmal genug fuer lange deutsche Woerter. */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--schrift-gross",
  display: "swap",
});
const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--schrift-warm",
  display: "swap",
});

/* Der Titel galt frueher ueberall — auch auf den Privatkundenseiten stand
   damit "Serienplanung fuer Wohnbauprojekte" im Browsertab und in jeder
   geteilten Vorschau. Die beiden Bereiche bekommen eigene Titel ueber ihre
   eigenen `metadata`; hier steht nur noch, was fuer beide gilt. */
export const metadata: Metadata = {
  title: { default: "Serienküche", template: "%s — Serienküche" },
  description:
    "Prototyp: Küchen planen, von der einzelnen Küche bis zur Serie im Wohnbauprojekt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${archivo.variable} ${plexMono.variable} ${fraunces.variable} ${instrument.variable}`}>
      <body>
        <Rahmen>{children}</Rahmen>
      </body>
    </html>
  );
}
