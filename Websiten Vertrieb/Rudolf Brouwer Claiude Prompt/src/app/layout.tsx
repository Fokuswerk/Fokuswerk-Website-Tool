import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Kopf from "@/components/Kopf";
import Fuss from "@/components/Fuss";
import MobilLeiste from "@/components/MobilLeiste";
import { betrieb } from "@/lib/daten";

const grotesk = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--schrift-grotesk",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--schrift-mono",
  weight: ["400", "500"],
});

const basis = "https://brouwer-gmbh.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(basis),
  title: {
    default: "Brouwer GmbH — Bad, Heizung und Pool in Wardenburg",
    template: "%s — Brouwer GmbH, Wardenburg",
  },
  description:
    "Meisterbetrieb für Sanitär, Heizung und Schwimmbad in Wardenburg bei Oldenburg. Badsanierung aus einer Hand, Heizungsmodernisierung, 500 m² Ausstellung. Seit 1962.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: basis,
    siteName: "Rudolf Brouwer GmbH",
    title: "Brouwer GmbH — Bad, Heizung und Pool in Wardenburg",
    description:
      "Badsanierung aus einer Hand, Heizungsmodernisierung und Schwimmbadtechnik. Familienbetrieb in Wardenburg seit 1962.",
  },
  robots: { index: true, follow: true },
};

export const viewport = { themeColor: "#101a38" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${basis}/#betrieb`,
    name: betrieb.name,
    alternateName: "Brouwer GmbH",
    url: basis,
    telephone: betrieb.telefonRaw,
    faxNumber: "+4944075873",
    email: betrieb.email,
    foundingDate: "1962-01-22",
    address: {
      "@type": "PostalAddress",
      streetAddress: betrieb.strasse,
      postalCode: betrieb.plz,
      addressLocality: betrieb.ort,
      addressRegion: "Niedersachsen",
      addressCountry: "DE",
    },
    geo: { "@type": "GeoCoordinates", latitude: betrieb.geo.lat, longitude: betrieb.geo.lng },
    areaServed: ["Wardenburg", "Oldenburg", "Landkreis Oldenburg"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "08:30",
        closes: "12:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "14:00",
        closes: "17:00",
      },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday"], opens: "08:30", closes: "12:30" },
    ],
    makesOffer: [
      "Badsanierung", "Seniorengerechtes Bad", "Heizungsmodernisierung",
      "Wärmepumpe", "Solarthermie", "Schwimmbadbau", "Poolsanierung", "Wellness",
    ].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
  };

  return (
    <html lang="de" className={`${grotesk.variable} ${mono.variable}`}>
      <body>
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:bg-kupfer focus:px-6 focus:py-3 focus:text-papier"
        >
          Zum Inhalt springen
        </a>
        <Kopf />
        <main id="inhalt">{children}</main>
        <Fuss />
        <MobilLeiste />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
