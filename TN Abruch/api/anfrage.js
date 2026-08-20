/**
 * Serverless-Funktion für das Anfrageformular (Vercel, Node-Runtime).
 *
 * Die Website selbst ist statisch. Nur dieser Endpunkt und /api/bewerbung laufen
 * serverseitig — sie nehmen das Formular entgegen und schicken es als E-Mail an
 * das Postfach. Der gemeinsame Unterbau steht in api/_lib.js.
 *
 * Ist RESEND_API_KEY nicht gesetzt, antwortet der Endpunkt mit 503 — das Formular
 * zeigt dann Telefonnummer und E-Mail-Adresse als Ausweichweg an.
 */

import {
  readForm, isTrapped, collectRows, collectAttachments,
  mailConfig, sendMail, finish,
} from './_lib.js';

export const config = { api: { bodyParser: false } };

const FIELD_LABELS = {
  leistung: 'Leistung',
  objektart: 'Objektart',
  ort: 'Ort / PLZ',
  baujahr: 'Baujahr',
  menge: 'Fläche / Volumen',
  zeitraum: 'Wunschzeitraum',
  schadstoff: 'Schadstoffverdacht',
  gutachten: 'Gutachten vorhanden',
  name: 'Name',
  firma: 'Firma',
  telefon: 'Telefon',
  email: 'E-Mail',
  nachricht: 'Nachricht',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = await readForm(req);
  if (!form) return res.status(400).json({ error: 'Formulardaten konnten nicht gelesen werden.' });

  // Spamfalle: still verwerfen, ohne Hinweis zu geben.
  if (isTrapped(form)) return res.status(200).json({ ok: true });

  const name = String(form.get('name') ?? '').trim();
  const telefon = String(form.get('telefon') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();

  if (!name) return res.status(400).json({ error: 'Name fehlt.' });
  if (!telefon && !email) return res.status(400).json({ error: 'Telefon oder E-Mail wird benötigt.' });
  if (!form.get('einwilligung')) return res.status(400).json({ error: 'Einwilligung fehlt.' });

  const cfg = mailConfig();
  if (!cfg) return res.status(503).json({ error: 'Der Versand ist derzeit nicht konfiguriert.' });

  let attachments;
  try {
    attachments = await collectAttachments(form, 'dateien');
  } catch (err) {
    if (err.code === 'TOO_LARGE') {
      return res.status(413).json({ error: 'Die Anhänge sind zusammen größer als 15 MB.' });
    }
    throw err;
  }

  const ort = String(form.get('ort') ?? '').trim();

  try {
    await sendMail({
      config: cfg,
      subject: `Projektanfrage: ${name}${ort ? ` — ${ort}` : ''}`,
      heading: 'Projektanfrage über tn-abbruch.de',
      rows: collectRows(form, FIELD_LABELS),
      replyTo: email,
      attachments,
    });
  } catch (err) {
    console.error('Versand fehlgeschlagen:', err);
    return res.status(502).json({ error: 'Der Versand ist fehlgeschlagen.' });
  }

  return finish(req, res, '/kontakt/danke/');
}
