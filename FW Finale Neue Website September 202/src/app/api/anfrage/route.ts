import { NextResponse } from 'next/server';

const PFLICHT = ['betrieb', 'name', 'telefon', 'email'] as const;

export async function POST(anfrage: Request) {
  let daten: Record<string, string>;
  try {
    daten = (await anfrage.json()) as Record<string, string>;
  } catch {
    return NextResponse.json({ fehler: 'Ungültige Anfrage' }, { status: 400 });
  }

  // Honigtopf: ausgefüllt heißt Bot. Wir antworten freundlich und tun nichts.
  if (daten.webseite) return NextResponse.json({ ok: true });

  const fehlend = PFLICHT.filter((f) => !String(daten[f] ?? '').trim());
  if (fehlend.length) {
    return NextResponse.json({ fehler: 'Pflichtfelder fehlen', fehlend }, { status: 400 });
  }

  const schluessel = process.env.RESEND_API_KEY;
  const an = process.env.ANFRAGE_AN || 'contact@fokuswerk.de';
  const von = process.env.ANFRAGE_VON || 'Website <website@fokuswerk.de>';

  if (!schluessel) {
    // Ohne Schlüssel geht die Anfrage verloren. Das darf nicht still passieren:
    // Das Formular zeigt dann Telefonnummer und E-Mail als Ausweichweg.
    console.error('RESEND_API_KEY fehlt — Anfrage nicht zustellbar', daten);
    return NextResponse.json({ fehler: 'Zustellung nicht eingerichtet' }, { status: 500 });
  }

  const zeilen = [
    `Betrieb: ${daten.betrieb}`,
    `Name: ${daten.name}`,
    `Telefon: ${daten.telefon}`,
    `E-Mail: ${daten.email}`,
    '',
    daten.lage ? `Lage:\n${daten.lage}` : '(keine weiteren Angaben)',
  ].join('\n');

  const antwort = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${schluessel}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: von,
      to: [an],
      reply_to: daten.email,
      subject: `Anfrage über die Website — ${daten.betrieb}`,
      text: zeilen,
    }),
  });

  if (!antwort.ok) {
    console.error('Resend antwortet mit', antwort.status, await antwort.text());
    return NextResponse.json({ fehler: 'Versand fehlgeschlagen' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
