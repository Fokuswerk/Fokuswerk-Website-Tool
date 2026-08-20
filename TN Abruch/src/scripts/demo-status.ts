/**
 * Statusverwaltung des Demo-Backends.
 *
 * Es gibt keinen Server dahinter — die Website ist statisch. Damit sich im
 * Kundentermin trotzdem ein Ablauf durchspielen lässt („neu" → „kontaktiert" →
 * „Angebot"), merkt sich der Browser die Änderungen im localStorage. Beim
 * Produktivbetrieb ersetzt ein Datenbankaufruf diese Datei; die Oberfläche
 * bleibt, wie sie ist.
 */

const KEY = 'tn-demo-status';

type Store = Record<string, string>;

const read = (): Store => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
};

const write = (s: Store) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* Privater Modus o. Ä. — dann hält der Status eben nur bis zum Neuladen. */
  }
};

/**
 * Gemerkte Status auf alle Statusmarken der Seite anwenden.
 * `labels` bildet den Schlüssel auf die Beschriftung ab (neu → „Neu").
 */
export function applyStoredStatus(labels: Record<string, string>) {
  const store = read();
  document.querySelectorAll<HTMLElement>('[data-status-for]').forEach((pill) => {
    const status = store[pill.dataset.statusFor!];
    if (!status) return;
    pill.dataset.s = status;
    pill.textContent = labels[status] ?? status;
    // Damit der Filter der Listenansicht den geänderten Status mitbekommt.
    pill.closest('tr')?.setAttribute('data-status', status);
  });
}

/**
 * Statuswechsel auf der Detailseite verdrahten.
 * Erwartet ein <select data-status-select data-lead-id="…" data-labels="{…}">
 * und optional eine Bestätigungszeile [data-saved].
 */
export function initStatusControl() {
  const select = document.querySelector<HTMLSelectElement>('[data-status-select]');
  if (!select) return;

  const id = select.dataset.leadId!;
  const labels = JSON.parse(select.dataset.labels ?? '{}') as Record<string, string>;
  const pill = document.querySelector<HTMLElement>(`[data-status-for="${id}"]`);
  const saved = document.querySelector<HTMLElement>('[data-saved]');

  const paint = (value: string) => {
    if (!pill) return;
    pill.dataset.s = value;
    pill.textContent = labels[value] ?? value;
  };

  // Gemerkten Stand herstellen
  const stored = read()[id];
  if (stored) {
    select.value = stored;
    paint(stored);
  }

  select.addEventListener('change', () => {
    const next = read();
    next[id] = select.value;
    write(next);
    paint(select.value);

    if (saved) {
      saved.textContent = 'Gespeichert';
      window.setTimeout(() => { saved.textContent = ''; }, 2200);
    }
  });
}
