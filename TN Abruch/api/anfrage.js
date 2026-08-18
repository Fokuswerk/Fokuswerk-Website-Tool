/**
 * Serverless-Funktion für das Anfrageformular (Vercel, Node-Runtime).
 *
 * Die Website selbst ist statisch. Nur dieser eine Endpunkt läuft serverseitig —
 * er nimmt das Formular entgegen und schickt es als E-Mail an das Postfach.
 *
 * Benötigte Umgebungsvariablen:
 *   RESEND_API_KEY   API-Schlüssel von resend.com
 *   ANFRAGE_TO       Zieladresse, z. B. info@tn-abbruch.de
 *   ANFRAGE_FROM     verifizierte Absenderadresse, z. B. website@tn-abbruch.de
 *
 * Ist RESEND_API_KEY nicht gesetzt, antwortet der Endpunkt mit 503 — das Formular
 * zeigt dann Telefonnummer und E-Mail-Adresse als Ausweichweg an.
 */

export const config = { api: { bodyParser: false } };

const MAX_TOTAL_BYTES = 15 * 1024 * 1024;

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

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return res.status(400).json({ error: 'Formulardaten konnten nicht gelesen werden.' });
  }

  // Spamfalle: von Menschen nie ausgefüllt. Still verwerfen, ohne Hinweis zu geben.
  if (String(form.get('webseite') ?? '').trim()) {
    return res.status(200).json({ ok: true });
  }

  const name = String(form.get('name') ?? '').trim();
  const telefon = String(form.get('telefon') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();

  if (!name) return res.status(400).json({ error: 'Name fehlt.' });
  if (!telefon && !email) return res.status(400).json({ error: 'Telefon oder E-Mail wird benötigt.' });
  if (!form.get('einwilligung')) return res.status(400).json({ error: 'Einwilligung fehlt.' });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ANFRAGE_TO || 'info@tn-abbruch.de';
  const from = process.env.ANFRAGE_FROM;
  if (!apiKey || !from) {
    return res.status(503).json({ error: 'Der Versand ist derzeit nicht konfiguriert.' });
  }

  // Feldwerte einsammeln, Mehrfachauswahl zusammenführen
  const rows = [];
  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const values = form.getAll(key).map((v) => String(v).trim()).filter(Boolean);
    if (values.length) rows.push([label, values.join(', ')]);
  }

  // Anhänge, begrenzt auf 15 MB insgesamt
  const attachments = [];
  let bytes = 0;
  for (const file of form.getAll('dateien')) {
    if (typeof file === 'string' || !file?.size) continue;
    bytes += file.size;
    if (bytes > MAX_TOTAL_BYTES) {
      return res.status(413).json({ error: 'Die Anhänge sind zusammen größer als 15 MB.' });
    }
    attachments.push({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()).toString('base64'),
    });
  }

  const text = rows.map(([l, v]) => `${l}: ${v}`).join('\n');
  const html =
    '<h2 style="font:600 16px system-ui">Projektanfrage über tn-abbruch.de</h2>' +
    '<table style="font:14px system-ui;border-collapse:collapse">' +
    rows
      .map(
        ([l, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">${escapeHtml(l)}</td>` +
          `<td style="padding:4px 0">${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`,
      )
      .join('') +
    '</table>';

  const subject = `Projektanfrage: ${name}${form.get('ort') ? ` — ${form.get('ort')}` : ''}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        html,
        reply_to: email || undefined,
        attachments: attachments.length ? attachments : undefined,
      }),
    });
    if (!r.ok) throw new Error(await r.text());
  } catch (err) {
    console.error('Versand fehlgeschlagen:', err);
    return res.status(502).json({ error: 'Der Versand ist fehlgeschlagen.' });
  }

  // Ohne JavaScript landet der Browser hier auf der Dankeseite
  const wantsHtml = String(req.headers.accept ?? '').includes('text/html');
  if (wantsHtml) {
    res.setHeader('Location', '/kontakt/danke/');
    return res.status(303).end();
  }
  return res.status(200).json({ ok: true });
}
