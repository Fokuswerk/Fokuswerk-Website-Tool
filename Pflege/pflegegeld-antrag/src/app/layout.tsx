import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Outfit } from "next/font/google";
import Kopf from "@/components/Kopf";
import Marke from "@/components/Marke";
import "./globals.css";
import Seitenmessung from "@/components/Seitenmessung";

const text = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-text",
});

const display = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Pflegegeld-Antrag – Pflegegrad nach altem und neuem Recht berechnen",
  description:
    "Rechnet die Punkte des Begutachtungsinstruments nach der heutigen Rechtslage und nach den Schwellenwerten, die zum 1. Januar 2027 gelten sollen. Mit amtlichen Kriterien, ohne Anmeldung.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Pflegegeld-Antrag – Pflegegrad vor und nach der Reform",
    description:
      "Ab 1. Januar 2027 gelten neue Punktgrenzen. Dieser Rechner zeigt beide Rechtsstände nebeneinander.",
    locale: "de_DE",
    type: "website",
    images: [{ url: "/vorschau.jpg", width: 1200, height: 630,
               alt: "Pflegegeld-Antrag – Welcher Pflegegrad kommt heraus?" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/vorschau.jpg"],
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#10242f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${text.variable} ${display.variable}`}>
      <body>
        <a className="sprunglink" href="#inhalt">Zum Inhalt springen</a>
        <Kopf />
        <Seitenmessung />
        <div id="inhalt">{children}</div>
        <footer className="fuss">
          <div className="huelle">
            <Marke alsLink={false} />
            <nav className="fuss-nav">
              <Link href="/antrag">Antrag stellen</Link>
              <Link href="/check">Punkterechner</Link>
              <Link href="/bescheid">Bescheid prüfen</Link>
              <Link href="/reform">Leistungsvergleich</Link>
              <Link href="/mappe">Begutachtungsmappe</Link>
              <Link href="/rechtliches">Rechtliches und Quellen</Link>
              <Link href="/impressum">Impressum</Link>
              <Link href="/datenschutz">Datenschutz</Link>
            </nav>
            <p style={{ maxWidth: "58ch" }}>
              Pflegegeld-Antrag ist ein Rechner, keine Behörde und keine Rechtsberatung. Die
              Berechnung läuft vollständig in Ihrem Browser. Ihre Antworten bleiben in diesem
              Browser gespeichert, damit Sie später weitermachen können – Sie können sie im
              Rechner jederzeit löschen. Keine einzige Angabe zur Gesundheit wird an uns
              übertragen. Wir zählen nur, welche Seite aufgerufen und ob ein Rechner begonnen
              oder beendet wurde, ohne Inhalte und ohne Cookie.
            </p>
            <p className="quelle" style={{ marginBottom: 0 }}>
              Grundlage: Anlage 1 und 2 zu § 15 SGB XI sowie der Kabinettsentwurf des
              Pflegeneuordnungsgesetzes vom 30. September 2026. Die Werte für 2027 stehen noch
              nicht endgültig fest.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
