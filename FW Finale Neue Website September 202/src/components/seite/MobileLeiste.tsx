'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Pfeil from '@/components/ui/Pfeil';
import { cta, marke } from '@/lib/inhalt';

/**
 * Feste Leiste auf dem Handy: anrufen oder Gespräch vereinbaren. Erscheint
 * erst nach dem ersten Bildschirm, damit sie den Titelbereich nicht
 * beschneidet, und fehlt auf /kontakt, wo sie mit dem Formular konkurrieren
 * würde. Ein Teil dieser Zielgruppe greift lieber zum Telefon.
 */
export default function MobileLeiste() {
  const pfad = usePathname();
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    const pruefen = () => setSichtbar(window.scrollY > window.innerHeight * 0.75);
    pruefen();
    window.addEventListener('scroll', pruefen, { passive: true });
    return () => window.removeEventListener('scroll', pruefen);
  }, []);

  if (pfad.startsWith('/kontakt')) return null;

  return (
    <div
      aria-hidden={!sichtbar}
      data-sichtbar={sichtbar ? '' : undefined}
      className="mobil-leiste fixed inset-x-0 bottom-0 z-40 border-t border-rule md:hidden"
      style={{
        background: 'color-mix(in srgb, var(--color-paper) 94%, transparent)',
        backdropFilter: 'blur(14px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.3)',
      }}
    >
      <div className="flex items-stretch gap-2 px-4 pt-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <a
          href={`tel:${marke.telefon}`}
          tabIndex={sichtbar ? 0 : -1}
          className="akt akt-still flex-1 !px-3"
          aria-label={`Anrufen: ${marke.telefonText}`}
        >
          Anrufen
        </a>
        <Link href={cta.ziel} tabIndex={sichtbar ? 0 : -1} className="akt flex-[1.5] whitespace-nowrap !px-3 text-[0.84rem]">
          {cta.text}
          <Pfeil groesse={12} />
        </Link>
      </div>
    </div>
  );
}
