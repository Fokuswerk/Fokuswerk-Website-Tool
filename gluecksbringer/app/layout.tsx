import type { Metadata, Viewport } from "next";
import { Figtree, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteUrl, verein } from "@/content/verein";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-figtree",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Glücksbringer am Meer e.V. – Hilfe für Kinder in Bad Zwischenahn",
    template: "%s | Glücksbringer am Meer e.V.",
  },
  description:
    "Ehrenamtlicher Verein aus Bad Zwischenahn: Seit 2011 setzen wir uns für Kinder ein, deren Familien wenig haben – mit dem Wunschbaum am Meer, Hilfe zur Einschulung und Sommerglücksgutscheinen.",
  keywords: [
    "Glücksbringer am Meer",
    "Wunschbaum am Meer",
    "Bad Zwischenahn",
    "Verein",
    "Kinder",
    "Spenden",
    "Ehrenamt",
  ],
  authors: [{ name: verein.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    siteName: verein.name,
    title: "Glücksbringer am Meer e.V. – Hilfe für Kinder in Bad Zwischenahn",
    description:
      "Seit 2011 schenken wir Kindern in Bad Zwischenahn ein Stück Glück. Ehrenamtlich, aus der Gemeinde, allein durch Spenden finanziert.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glücksbringer am Meer e.V.",
    description:
      "Seit 2011 schenken wir Kindern in Bad Zwischenahn ein Stück Glück – ehrenamtlich und allein durch Spenden finanziert.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#fcfaf6",
  colorScheme: "light",
};

const organisationSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: verein.name,
  alternateName: "Glücksbringer am Meer",
  url: siteUrl,
  email: verein.email,
  description: verein.beschreibung,
  foundingDate: "2011",
  address: {
    "@type": "PostalAddress",
    streetAddress: verein.anschrift.strasse,
    postalCode: verein.anschrift.plz,
    addressLocality: verein.anschrift.ort,
    addressRegion: "Niedersachsen",
    addressCountry: "DE",
  },
  areaServed: { "@type": "Place", name: "Bad Zwischenahn" },
  sameAs: [verein.social.facebook, verein.social.instagram],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${figtree.variable} ${inter.variable}`}>
      <body className="min-h-dvh antialiased">
        <script
          type="application/ld+json"
          // Statisches, selbst erzeugtes Schema-Objekt – keine Nutzereingaben.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organisationSchema),
          }}
        />
        <SiteHeader />
        <main id="inhalt">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
