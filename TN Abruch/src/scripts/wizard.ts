/**
 * Mehrschritt-Formular — genutzt von Projektanfrage und Kurzbewerbung.
 *
 * Ohne JavaScript bleibt das Formular ein einziges langes Formular und lässt sich
 * ganz normal abschicken. Erst wenn dieses Skript läuft, wird daraus ein Ablauf in
 * Schritten. Deshalb wird `show()` auch erst hier zum ersten Mal aufgerufen.
 *
 * Erwartete Auszeichnung:
 *   form[data-wizard]            das Formular
 *     data-done="/pfad/danke/"   Ziel nach erfolgreichem Versand
 *     data-preselect="feldname"  optional: Feld, das aus ?feldname=… vorbelegt wird
 *   fieldset.fs                  ein Schritt
 *   [data-step-dot]              Fortschrittsanzeige
 *   [data-next] / [data-prev]    Navigation
 *   [data-form-status]           Statuszeile für Fehlermeldungen
 *
 * Pflichtfelder sind in beiden Formularen dieselben: Name, ein Rückweg
 * (Telefon oder E-Mail) und die Einwilligung.
 */

export function initWizard(root: ParentNode = document) {
  const form = root.querySelector<HTMLFormElement>('[data-wizard]');
  if (!form) return;

  const steps = [...form.querySelectorAll<HTMLFieldSetElement>('.fs')];
  const dots = [...form.querySelectorAll<HTMLElement>('[data-step-dot]')];
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const done = form.dataset.done ?? '/';
  let current = 0;
  let attempted = false;   // Live-Prüfung erst nach dem ersten Absendeversuch

  const show = (i: number, moved = true) => {
    current = i;
    steps.forEach((s, n) => (s.hidden = n !== i));
    dots.forEach((d, n) => {
      d.classList.toggle('is-active', n === i);
      d.classList.toggle('is-done', n < i);
    });
    if (!moved) return;

    // Kein eigener Scroll: der Fokus auf das erste Feld holt es bei Bedarf
    // von selbst ins Bild — sofort und nur so weit wie nötig.
    steps[i].querySelector<HTMLElement>('input, select, textarea, button')?.focus();
  };

  const setError = (id: string, msg: string | null, field?: HTMLElement) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg ?? '';
    el.hidden = !msg;
    field?.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  /**
   * Prüft den letzten Schritt.
   *
   * `moveFocus` nur beim Absenden setzen. Wird der Fokus auch bei der Prüfung
   * nach dem Verlassen eines Feldes gesetzt, springt er dem Nutzer beim nächsten
   * Klick vorweg zurück ins fehlerhafte Feld — der Klick auf die Einwilligung
   * geht dabei verloren und muss wiederholt werden.
   */
  const validateLast = (moveFocus = false) => {
    let ok = true;
    const name = form.elements.namedItem('name') as HTMLInputElement;
    const tel = form.elements.namedItem('telefon') as HTMLInputElement;
    const mail = form.elements.namedItem('email') as HTMLInputElement;
    const consent = form.elements.namedItem('einwilligung') as HTMLInputElement;

    if (!name.value.trim()) { setError('err-name', 'Bitte tragen Sie Ihren Namen ein.', name); ok = false; }
    else setError('err-name', null, name);

    if (!tel.value.trim() && !mail.value.trim()) {
      setError('err-kontakt', 'Wir brauchen eine Telefonnummer oder eine E-Mail-Adresse.', mail);
      ok = false;
    } else if (mail.value.trim() && !mail.checkValidity()) {
      setError('err-kontakt', 'Diese E-Mail-Adresse sieht nicht vollständig aus.', mail);
      ok = false;
    } else setError('err-kontakt', null, mail);

    if (!consent.checked) { setError('err-consent', 'Ohne diese Einwilligung dürfen wir die Anfrage nicht bearbeiten.'); ok = false; }
    else setError('err-consent', null);

    if (!ok && moveFocus) {
      const target = form.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?? (consent.checked ? null : consent);
      target?.focus();
    }
    return ok;
  };

  show(0, false);
  form.querySelectorAll('[data-next]').forEach((b) =>
    b.addEventListener('click', () => show(Math.min(current + 1, steps.length - 1))),
  );
  form.querySelectorAll('[data-prev]').forEach((b) =>
    b.addEventListener('click', () => show(Math.max(current - 1, 0))),
  );

  // Fehler räumen sich beim Korrigieren auf — aber erst, nachdem einmal
  // abgeschickt wurde. Sonst springen Meldungen ein, während jemand noch tippt,
  // verschieben das Layout und schlucken den nächsten Klick.
  ['name', 'telefon', 'email'].forEach((n) => {
    const el = form.elements.namedItem(n) as HTMLInputElement;
    el?.addEventListener('blur', () => { if (attempted) validateLast(); });
  });
  (form.elements.namedItem('einwilligung') as HTMLInputElement)
    ?.addEventListener('change', () => { if (attempted) validateLast(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    attempted = true;
    if (!validateLast(true)) return;

    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const original = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Wird gesendet …';
    if (status) { status.textContent = ''; status.removeAttribute('data-tone'); }

    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      if (!res.ok) throw new Error(String(res.status));
      location.href = done;
    } catch {
      if (status) {
        status.dataset.tone = 'error';
        status.innerHTML =
          'Das Formular konnte gerade nicht übermittelt werden. Bitte rufen Sie an ' +
          '(<a href="tel:+494221802561" class="num">04221 80 25 61</a>) oder schreiben Sie an ' +
          '<a href="mailto:info@tn-abbruch.de">info@tn-abbruch.de</a>.';
      }
      submit.disabled = false;
      submit.textContent = original;
    }
  });

  /**
   * Vorbelegung aus der URL, z. B. ?leistung=Schadstoffsanierung oder
   * ?position=Bauhelfer. Trifft der Wert kein Feld, passiert schlicht nichts.
   */
  const field = form.dataset.preselect;
  if (field) {
    const pre = new URL(location.href).searchParams.get(field);
    if (pre) {
      form.querySelectorAll<HTMLInputElement>(`input[name="${field}"]`).forEach((c) => {
        if (c.value === pre) c.checked = true;
      });
    }
  }
}
