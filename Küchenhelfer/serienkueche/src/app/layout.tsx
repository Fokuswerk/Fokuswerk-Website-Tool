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

export const metadata: Metadata = {
  title: "Serienküche",
  description:
    "Prototyp: Serienplanung von Einbauküchen für Wohnbauprojekte. Grundrisse einlesen, typisieren, planen, spezifizieren.",
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
