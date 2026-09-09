import Link from 'next/link';
import { marke, navigation } from '@/lib/inhalt';

export default function Fuss() {
  return (
    <footer className="band pb-10 pt-16">
      <div className="schale">
        <div className="flex flex-wrap items-start justify-between gap-10 border-b border-rule pb-12">
          <p className="max-w-[22ch] text-[length:var(--text-2xl)] font-bold tracking-[-0.035em]">
            Fokuswerk, Oldenburg.
          </p>
          <div className="flex flex-wrap gap-12">
            <nav className="grid gap-2 text-sm" aria-label="Fußmenü">
              {navigation.map((n) => (
                <Link key={n.pfad} href={n.pfad} className="text-ink-2 transition-colors hover:text-ink">
                  {n.titel}
                </Link>
              ))}
            </nav>
            <div className="grid gap-2 text-sm">
              <a href={`tel:${marke.telefon}`} className="font-mono">{marke.telefonText}</a>
              <a href={`mailto:${marke.mail}`} className="text-ink-2">{marke.mail}</a>
              <p className="text-ink-3">{marke.strasse}<br />{marke.plz} {marke.ort}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4 pt-6 text-xs text-ink-3">
          <p>© {new Date().getFullYear()} {marke.firma}</p>
          <div className="flex gap-6">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
