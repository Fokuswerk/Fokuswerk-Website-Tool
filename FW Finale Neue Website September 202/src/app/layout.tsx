import type { Metadata, Viewport } from 'next';
import { Archivo, DM_Mono, Instrument_Serif } from 'next/font/google';
import Bewegung from '@/components/Bewegung';
import Intro from '@/components/Intro';
import Kopf from '@/components/seite/Kopf';
import Fuss from '@/components/seite/Fuss';
import { marke } from '@/lib/inhalt';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});
const mono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
  weight: ['400', '500'],
});
const instrument = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
  weight: '400',
  style: 'italic',
});

const basis = process.env.NEXT_PUBLIC_SITE_URL || 'https://fokuswerk.de';

export const metadata: Metadata = {
  metadataBase: new URL(basis),
  title: {
    default: 'Fokuswerk — ein Drehtag, zwei laufende Kampagnen',
    template: '%s | Fokuswerk',
  },
  description:
    'Wir drehen einen halben Tag in Ihrem Betrieb und machen daraus laufende Kampagnen für Mitarbeiter und Kunden. Belegt: 550 € Budget, 68 Bewerbungen, Mechatroniker nach 14 Tagen.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Fokuswerk',
    url: basis,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#fbfaf9',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${archivo.variable} ${mono.variable} ${instrument.variable}`}>
      <head>
        {/* Ob der Auftakt läuft, fällt hier, vor dem ersten Bild — sonst blitzt
            die Seite kurz auf, bevor die Blende eingehängt ist. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('fw-auftakt')!=='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-auftakt','laeuft')}}catch(e){}",
          }}
        />
      </head>
      <body>
        <a href="#inhalt" className="nur-sr">Zum Inhalt springen</a>
        <Kopf />
        <main id="inhalt">{children}</main>
        <Fuss />
        <Bewegung />
        <Intro />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: 'Fokuswerk',
              url: basis,
              telephone: marke.telefon,
              email: marke.mail,
              address: {
                '@type': 'PostalAddress',
                streetAddress: marke.strasse,
                postalCode: marke.plz,
                addressLocality: marke.ort,
                addressCountry: 'DE',
              },
              vatID: marke.ustId,
              areaServed: 'Nordwest-Niedersachsen',
            }),
          }}
        />
      </body>
    </html>
  );
}
