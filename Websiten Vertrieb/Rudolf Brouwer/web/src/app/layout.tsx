import type { Metadata } from "next";
import { Archivo, Newsreader } from "next/font/google";
import "./globals.css";
import Kopfleiste from "@/components/Kopfleiste";
import Fusszeile from "@/components/Fusszeile";
import LeisteUnten from "@/components/LeisteUnten";
import { betrieb, basisUrl, indexierbar } from "@/daten/betrieb";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-archivo",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(basisUrl),
  title: {
    default: "Rudolf Brouwer — Bad, Heizung & Pool in Wardenburg",
    template: "%s | Rudolf Brouwer, Wardenburg",
  },
  description:
    "Meisterbetrieb für Bad, Heizung, Energie und Schwimmbad in Wardenburg bei Oldenburg. Seit 1962 in Familienhand, mit über 500 m² eigener Ausstellung und 24-Stunden-Heizungsnotdienst.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: betrieb.name,
    url: basisUrl,
    title: "Rudolf Brouwer — Bad, Heizung & Pool in Wardenburg",
    description:
      "Meisterbetrieb für Bad, Heizung, Energie und Schwimmbad. Seit 1962 in Wardenburg, über 500 m² Ausstellung.",
    images: [{ url: "/bilder/a-panorama.webp", width: 1000, height: 500, alt: "Ausstellungsraum der Rudolf Brouwer GmbH in Wardenburg" }],
  },
  robots: indexierbar ? { index: true, follow: true } : { index: false, follow: false, nocache: true },
};

export const viewport = { themeColor: "#F2F0EC", width: "device-width", initialScale: 1 };

const betriebSchema = {
  "@context": "https://schema.org",
  "@type": ["HVACBusiness", "PlumbingBusiness"],
  "@id": `${basisUrl}/#betrieb`,
  name: betrieb.name,
  alternateName: "Brouwer",
  url: basisUrl,
  telephone: betrieb.telefon,
  faxNumber: betrieb.fax,
  email: betrieb.mail,
  foundingDate: "1962-01-22",
  founder: { "@type": "Person", name: betrieb.gruender },
  image: `${basisUrl}/bilder/gebaeude.webp`,
  logo: `${basisUrl}/bilder/logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: betrieb.strasse,
    postalCode: betrieb.plz,
    addressLocality: betrieb.ort,
    addressCountry: betrieb.land,
  },
  geo: { "@type": "GeoCoordinates", latitude: betrieb.breite, longitude: betrieb.laenge },
  openingHoursSpecification: betrieb.zeitenSchema,
  vatID: betrieb.ustId,
  areaServed: { "@type": "Place", name: `${betrieb.ort}, Oldenburg` },
  makesOffer: [
    "Badsanierung", "Badplanung", "Seniorengerechter Badumbau",
    "Heizungsmodernisierung", "Heizungswartung", "Heizungsnotdienst",
    "Solarthermie", "Schwimmbadtechnik", "Poolsanierung",
  ].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${archivo.variable} ${newsreader.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(betriebSchema) }}
        />
        <Kopfleiste />
        <main id="inhalt">{children}</main>
        <Fusszeile />
        <LeisteUnten />
      </body>
    </html>
  );
}
