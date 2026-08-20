/**
 * Gemeinsamer Unterbau der Formular-Endpunkte (Projektanfrage, Kurzbewerbung).
 *
 * Dateien mit führendem Unterstrich werden von Vercel nicht als Route
 * veröffentlicht — dies ist ein reines Hilfsmodul.
 *
 * Benötigte Umgebungsvariablen:
 *   RESEND_API_KEY   API-Schlüssel von resend.com
 *   ANFRAGE_TO       Zieladresse, z. B. info@tn-abbruch.de
 *   ANFRAGE_FROM     verifizierte Absenderadresse, z. B. website@tn-abbruch.de
 */

export const MAX_TOTAL_BYTES = 15 * 1024 * 1024;

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Formulardaten lesen. Gibt null zurück, wenn der Body unbrauchbar ist. */
export async function readForm(req) {
  try {
    return await req.formData();
  } catch {
    return null;
  }
}

/** Spamfalle: von Menschen nie ausgefüllt. */
export const isTrapped = (form) => Boolean(String(form.get('webseite') ?? '').trim());

/** Beschriftete Feldwerte in der Reihenfolge der Labels einsammeln. */
export function collectRows(form, labels) {
  const rows = [];
  for (const [key, label] of Object.entries(labels)) {
    const values = form.getAll(key).map((v) => String(v).trim()).filter(Boolean);
    if (values.length) rows.push([label, values.join(', ')]);
  }
  return rows;
}

/**
 * Anhänge einsammeln und begrenzen.
 * Wirft bei Überschreitung — der Aufrufer antwortet dann mit 413.
 */
export async function collectAttachments(form, field, maxBytes = MAX_TOTAL_BYTES) {
  const attachments = [];
  let bytes = 0;
  for (const file of form.getAll(field)) {
    if (typeof file === 'string' || !file?.size) continue;
    bytes += file.size;
    if (bytes > maxBytes) {
      const err = new Error('too-large');
      err.code = 'TOO_LARGE';
      throw err;
    }
    attachments.push({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()).toString('base64'),
    });
  }
  return attachments;
}

/** Ist der Versand überhaupt konfiguriert? */
export const mailConfig = () => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ANFRAGE_FROM;
  const to = process.env.ANFRAGE_TO || 'info@tn-abbruch.de';
  return apiKey && from ? { apiKey, from, to } : null;
};

/** Zeilen als schlichte Tabelle versenden. Wirft bei Fehlschlag. */
export async function sendMail({ config, subject, heading, rows, replyTo, attachments }) {
  const text = rows.map(([l, v]) => `${l}: ${v}`).join('\n');
  const html =
    `<h2 style="font:600 16px system-ui">${escapeHtml(heading)}</h2>` +
    '<table style="font:14px system-ui;border-collapse:collapse">' +
    rows
      .map(
        ([l, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">${escapeHtml(l)}</td>` +
          `<td style="padding:4px 0">${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`,
      )
      .join('') +
    '</table>';

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      subject,
      text,
      html,
      reply_to: replyTo || undefined,
      attachments: attachments?.length ? attachments : undefined,
    }),
  });
  if (!r.ok) throw new Error(await r.text());
}

/** Ohne JavaScript soll der Browser auf der Dankeseite landen. */
export function finish(req, res, redirectTo) {
  if (String(req.headers.accept ?? '').includes('text/html')) {
    res.setHeader('Location', redirectTo);
    return res.status(303).end();
  }
  return res.status(200).json({ ok: true });
}
