/**
 * Serverless-Funktion für die Kurzbewerbung (Vercel, Node-Runtime).
 *
 * Bewusst anspruchsloser als die Projektanfrage: Pflicht sind nur Position, Name
 * und eine Telefonnummer. Lebenslauf ist optional — wer keinen zur Hand hat, soll
 * trotzdem abschicken können.
 */

import {
  readForm, isTrapped, collectRows, collectAttachments,
  mailConfig, sendMail, finish,
} from './_lib.js';

export const config = { api: { bodyParser: false } };

const MAX_CV_BYTES = 8 * 1024 * 1024;

const FIELD_LABELS = {
  position: 'Position',
  erfahrung: 'Erfahrung',
  fuehrerschein: 'Führerschein',
  wohnort: 'Wohnort / PLZ',
  verfuegbar: 'Verfügbar ab',
  name: 'Name',
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

  if (isTrapped(form)) return res.status(200).json({ ok: true });

  const name = String(form.get('name') ?? '').trim();
  const telefon = String(form.get('telefon') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const position = String(form.get('position') ?? '').trim();

  if (!name) return res.status(400).json({ error: 'Name fehlt.' });
  if (!telefon && !email) return res.status(400).json({ error: 'Telefon oder E-Mail wird benötigt.' });
  if (!form.get('einwilligung')) return res.status(400).json({ error: 'Einwilligung fehlt.' });

  const cfg = mailConfig();
  if (!cfg) return res.status(503).json({ error: 'Der Versand ist derzeit nicht konfiguriert.' });

  let attachments;
  try {
    attachments = await collectAttachments(form, 'lebenslauf', MAX_CV_BYTES);
  } catch (err) {
    if (err.code === 'TOO_LARGE') {
      return res.status(413).json({ error: 'Die Datei ist größer als 8 MB.' });
    }
    throw err;
  }

  try {
    await sendMail({
      config: cfg,
      subject: `Bewerbung: ${name}${position ? ` — ${position}` : ''}`,
      heading: 'Kurzbewerbung über tn-abbruch.de',
      rows: collectRows(form, FIELD_LABELS),
      replyTo: email,
      attachments,
    });
  } catch (err) {
    console.error('Versand fehlgeschlagen:', err);
    return res.status(502).json({ error: 'Der Versand ist fehlgeschlagen.' });
  }

  return finish(req, res, '/karriere/danke/');
}
