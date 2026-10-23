import type { Metadata } from "next";
import "./globals.css";
import { Rahmen } from "@/components/layout/Rahmen";
import { Torwaechter } from "@/components/warm/Torwaechter";

export const metadata: Metadata = {
  title: "Serienküche",
  description:
    "Prototyp: Serienplanung von Einbauküchen für Wohnbauprojekte. Grundrisse einlesen, typisieren, planen, spezifizieren.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Torwaechter />
        <Rahmen>{children}</Rahmen>
      </body>
    </html>
  );
}
