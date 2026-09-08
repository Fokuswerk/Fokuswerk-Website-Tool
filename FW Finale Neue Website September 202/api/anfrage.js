/**
 * Nimmt das Kontaktformular entgegen und schickt es per Resend an das Postfach.
 * Erwartet die Umgebungsvariablen RESEND_API_KEY, ANFRAGE_VON und ANFRAGE_AN.
 */
export const config = { runtime: 'nodejs' };

const PFLICHT = ['betrieb', 'name', 'telefon', 'email'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ fehler: 'Methode nicht erlaubt' });
  }

  let daten = req.body;
  if (typeof daten === 'string') {
    try { daten = JSON.parse(daten); } catch { daten = {}; }
  }
  daten = daten || {};

  // Honigtopf: ausgefüllt heißt Bot. Wir antworten freundlich und tun nichts.
  if (daten.webseite) return res.status(200).json({ ok: true });

  const fehlend = PFLICHT.filter((f) => !String(daten[f] || '').trim());
  if (fehlend.length) return res.status(400).json({ fehler: 'Pflichtfelder fehlen', fehlend });

  const schluessel = process.env.RESEND_API_KEY;
  const von = process.env.ANFRAGE_VON || 'Website <website@fokuswerk.de>';
  const an = process.env.ANFRAGE_AN || 'contact@fokuswerk.de';
  if (!schluessel) {
    console.error('RESEND_API_KEY fehlt — Anfrage konnte nicht zugestellt werden.');
    return res.status(500).json({ fehler: 'Versand nicht konfiguriert' });
  }

  const sicher = (w) => String(w || '').replace(/[<>&]/g, (z) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[z]);

  const text = [
    `Betrieb:  ${daten.betrieb}`,
    `Name:     ${daten.name}`,
    `Telefon:  ${daten.telefon}`,
    `E-Mail:   ${daten.email}`,
    '',
    'Worum es geht:',
    String(daten.lage || '— keine Angabe —'),
  ].join('\n');

  try {
    const antwort = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${schluessel}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: von,
        to: [an],
        reply_to: String(daten.email),
        subject: `Anfrage über die Website — ${sicher(daten.betrieb)}`,
        text,
      }),
    });
    if (!antwort.ok) {
      console.error('Resend antwortete mit', antwort.status, await antwort.text());
      return res.status(502).json({ fehler: 'Versand fehlgeschlagen' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Versand fehlgeschlagen:', e);
    return res.status(502).json({ fehler: 'Versand fehlgeschlagen' });
  }
}
