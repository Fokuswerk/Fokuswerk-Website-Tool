import type { Metadata } from "next";
import localFont from "next/font/local";
import { Rahmen } from "@/components/layout/Rahmen";
import "./globals.css";

/*
 * Die Schriften liegen im Projekt, nicht bei Google.
 *
 * Vorher kamen alle vier ueber next/font/google — Archivo, IBM Plex Mono,
 * Fraunces und Instrument Sans, zusammen 437 KB in 18 Dateien. Fraunces war
 * davon die breiteste von 32 gemessenen Schriften: bei gleicher Lesegroesse
 * lief sie rund 21 Prozent breiter als der Ersatz, was bei deutschen
 * Komposita wie "Spuelenunterschrank" sofort auffaellt.
 *
 * Jetzt zwei veraenderliche Schriften der Indian Type Foundry, selbst
 * ausgeliefert: Recia von Carlos de Toro fuer Ueberschriften und alle
 * laufenden Zahlen (sie hat echte Tabellenziffern), Plein von Inga
 * Ploennigs fuer den Text — eine deutsche Gestalterin, und das merkt man an
 * den langen Woertern. Zusammen 65 KB in zwei Dateien, und beim Laden der
 * Seite geht keine einzige Anfrage mehr nach aussen.
 *
 * Die Lizenz liegt daneben: ITF Free Font License, Selbsthosten ausdruecklich
 * erlaubt und empfohlen.
 */
const recia = localFont({
  src: "../schriften/Recia-Variable.woff2",
  weight: "300 700",
  variable: "--schrift-gross",
  display: "swap",
});
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
    <html lang="de" className={`${recia.variable} ${plein.variable}`}>
      <body>
        <Rahmen>{children}</Rahmen>
      </body>
    </html>
  );
}
