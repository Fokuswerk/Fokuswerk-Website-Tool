import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Outfit, Plus_Jakarta_Sans } from "next/font/google";
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
const archivo = Archivo({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--schrift-ui", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--schrift-data", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--schrift-gross", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--schrift-warm", display: "swap" });

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
    <html lang="de" className={`${archivo.variable} ${plexMono.variable} ${outfit.variable} ${jakarta.variable}`}>
      <body>
        <Rahmen>{children}</Rahmen>
      </body>
    </html>
  );
}
