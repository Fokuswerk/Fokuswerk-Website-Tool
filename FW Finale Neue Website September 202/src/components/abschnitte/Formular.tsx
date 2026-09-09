'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Pfeil from '@/components/ui/Pfeil';
import { marke } from '@/lib/inhalt';

export default function Formular() {
  const router = useRouter();
  const [sendet, setSendet] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function absenden(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    setSendet(true);
    setFehler(null);
    try {
      const antwort = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!antwort.ok) throw new Error(String(antwort.status));
      router.push('/danke');
    } catch {
      setSendet(false);
      setFehler(
        `Das Senden hat gerade nicht geklappt. Rufen Sie uns an unter ${marke.telefonText} oder schreiben Sie an ${marke.mail} — wir melden uns umgehend.`,
      );
    }
  }

  return (
    <form onSubmit={absenden} noValidate className="grid gap-5">
      <Feld name="betrieb" label="Betrieb" autoComplete="organization" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Feld name="name" label="Ihr Name" autoComplete="name" />
        <Feld name="telefon" label="Telefon" type="tel" autoComplete="tel" />
      </div>
      <Feld name="email" label="E-Mail" type="email" autoComplete="email" />

      <label className="grid gap-2">
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-3">
          Worum geht es? <span className="normal-case tracking-normal">(optional)</span>
        </span>
        <textarea
          name="lage"
          rows={4}
          placeholder="Zum Beispiel: seit acht Monaten eine Stelle offen, zwei Bühnen, Termine drei Wochen im Voraus."
          className="fw-eingabe resize-y"
        />
      </label>

      {/* Honigtopf */}
      <p className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="webseite">Bitte leer lassen</label>
        <input id="webseite" name="webseite" tabIndex={-1} autoComplete="off" />
      </p>

      <p className="text-sm leading-[1.6] text-ink-3">
        Wir melden uns innerhalb eines Werktags. Ihre Angaben verwenden wir
        ausschließlich zur Beantwortung dieser Anfrage.
      </p>

      <button type="submit" className="akt justify-self-start" disabled={sendet}>
        {sendet ? 'Wird gesendet …' : 'Anfrage senden'}
        {!sendet && <Pfeil />}
      </button>

      {fehler && (
        <p role="alert" className="rounded-[var(--radius-sm)] border px-4 py-3 text-sm"
           style={{ borderColor: 'var(--color-warn)', color: 'var(--color-warn)' }}>
          {fehler}
        </p>
      )}
    </form>
  );
}

function Feld({
  name, label, type = 'text', autoComplete,
}: { name: string; label: string; type?: string; autoComplete?: string }) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-3">{label}</span>
      <input name={name} type={type} autoComplete={autoComplete} required className="fw-eingabe" />
    </label>
  );
}
