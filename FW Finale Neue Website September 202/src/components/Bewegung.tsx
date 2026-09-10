'use client';

import { useEffect } from 'react';

/**
 * Ein Beobachter, eine Bildschleife, sonst nichts.
 *
 * - [data-reveal] / [data-draw] schalten beim Eintritt auf "shown"
 * - [data-split] zerlegt seine Ueberschrift einmalig in Woerter und laesst
 *   sie gestaffelt einsteigen
 * - [data-zahl] zaehlt hoch, sobald der Wert sichtbar wird
 * - [data-tilt] neigt sich zum Zeiger; die Bewegung selbst macht CSS
 */
export default function Bewegung() {
  useEffect(() => {
    const ruhe = window.matchMedia('(prefers-reduced-motion: reduce)');

    // --- Ueberschriften in Woerter zerlegen -------------------------------
    // Vor dem Beobachter, damit die Woerter schon in der Maske stehen.
    const zerlegen = (el: HTMLElement) => {
      if (el.dataset.zerlegt) return;
      el.dataset.zerlegt = '1';
      let i = 0;
      const gehen = (knoten: Node) => {
        for (const kind of Array.from(knoten.childNodes)) {
          if (kind.nodeType === Node.TEXT_NODE) {
            const text = kind.textContent ?? '';
            if (!text.trim()) continue;
            const teil = document.createDocumentFragment();
            for (const stueck of text.split(/(\s+)/)) {
              if (!stueck) continue;
              if (/^\s+$/.test(stueck)) { teil.append(stueck); continue; }
              const wort = document.createElement('span');
              wort.className = 'wort';
              const innen = document.createElement('span');
              innen.style.setProperty('--i', String(i++));
              innen.textContent = stueck;
              wort.append(innen);
              teil.append(wort);
            }
            kind.parentNode?.replaceChild(teil, kind);
          } else if (kind.nodeType === Node.ELEMENT_NODE) {
            const e = kind as HTMLElement;
            // Das kursive Wort bleibt als Ganzes stehen, es traegt den Marker.
            if (e.classList.contains('kursiv')) {
              const wort = document.createElement('span');
              wort.className = 'wort';
              const innen = document.createElement('span');
              innen.style.setProperty('--i', String(i++));
              e.parentNode?.insertBefore(wort, e);
              innen.append(e);
              wort.append(innen);
              continue;
            }
            gehen(kind);
          }
        }
      };
      gehen(el);
    };

    document.querySelectorAll<HTMLElement>('[data-split]').forEach(zerlegen);

    // Gestaffelte Einblendungen tragen ihre Verzögerung als --reveal-delay in
    // Millisekunden. Die Scroll-Fassung staffelt über die Strecke statt über
    // die Zeit: 25 ms werden zu einem Prozent Versatz, höchstens zwölf.
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      const ms = parseFloat(el.style.getPropertyValue('--reveal-delay'));
      if (ms > 0) el.style.setProperty('--versatz', `${Math.min(ms / 25, 12)}%`);
    });

    if (ruhe.matches) {
      document
        .querySelectorAll<HTMLElement>('[data-reveal], [data-split], [data-draw]')
        .forEach((el) => el.setAttribute(el.dataset.split !== undefined ? 'data-split' : el.dataset.draw !== undefined ? 'data-draw' : 'data-reveal', 'shown'));
      document.querySelectorAll<HTMLElement>('[data-zahl]').forEach((el) => {
        el.textContent = zahlText(Number(el.dataset.zahl), el);
      });
      return;
    }

    // --- Erscheinen -------------------------------------------------------
    const zurueckhalten = (el: HTMLElement) =>
      document.documentElement.hasAttribute('data-auftakt') && el.closest('.titel-zone') !== null;

    const zeigen = (el: HTMLElement) => {
      if (el.dataset.reveal !== undefined) el.dataset.reveal = 'shown';
      if (el.dataset.split !== undefined) el.dataset.split = 'shown';
      if (el.dataset.draw !== undefined) el.dataset.draw = 'shown';
      if (el.dataset.zahl !== undefined) zaehlen(el);
      beobachter.unobserve(el);
    };

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          // Hinter der Blende des Auftakts nichts einblenden — sonst ist die
          // Headline schon fertig, bevor jemand sie sieht. Freigabe kommt per
          // Ereignis, siehe unten.
          if (zurueckhalten(el)) continue;
          zeigen(el);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    );

    document
      .querySelectorAll<HTMLElement>('[data-reveal], [data-split], [data-draw], [data-zahl]')
      .forEach((el) => beobachter.observe(el));

    // Die Blende fährt hoch: alles, was in der Titelbühne schon im Bild steht,
    // jetzt einblenden. Der Rest kommt beim Scrollen über den Beobachter.
    const freigeben = () => {
      document
        .querySelectorAll<HTMLElement>(
          '.titel-zone [data-reveal], .titel-zone [data-split], .titel-zone [data-draw], .titel-zone [data-zahl]',
        )
        .forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) zeigen(el);
        });
    };
    window.addEventListener('fw-auftakt-weg', freigeben);

    // --- Szenen: Scrollfortschritt als Variable ---------------------------
    // --p laeuft von 0 (Element betritt das Bild von unten) bis 1 (Element
    // hat die Bildmitte erreicht). Geschrieben wird nur eine Zahl; die
    // Bewegung selbst macht CSS.
    const szenen = Array.from(document.querySelectorAll<HTMLElement>('[data-szene]'));
    let szenenLaeuft = false;
    const szenenMessen = () => {
      szenenLaeuft = false;
      const h = window.innerHeight;
      for (const el of szenen) {
        const r = el.getBoundingClientRect();
        // „lang" laeuft ueber den gesamten Durchlauf des Elements durchs Bild,
        // sonst ist der Fortschritt bei Erreichen der Bildmitte erschoepft.
        const roh =
          el.dataset.szene === 'lang'
            ? (h - r.top) / (h + r.height)
            : (h - r.top) / (h * 0.85);
        const p = Math.max(0, Math.min(1, roh));
        el.style.setProperty('--p', p.toFixed(4));
      }
    };
    const szenenPlanen = () => {
      if (szenenLaeuft) return;
      szenenLaeuft = true;
      requestAnimationFrame(szenenMessen);
    };
    if (szenen.length && !ruhe.matches) {
      szenenMessen();
      window.addEventListener('scroll', szenenPlanen, { passive: true });
      window.addEventListener('resize', szenenPlanen);
    } else {
      szenen.forEach((el) => el.style.setProperty('--p', '1'));
    }

    // --- Neigung ----------------------------------------------------------
    const geneigte = Array.from(document.querySelectorAll<HTMLElement>('[data-tilt]'));
    const zeiger = window.matchMedia('(hover: hover) and (pointer: fine)');
    const aufZeiger = (ev: PointerEvent) => {
      if (!zeiger.matches) return;
      for (const el of geneigte) {
        const r = el.getBoundingClientRect();
        const drin =
          ev.clientX > r.left - 80 && ev.clientX < r.right + 80 &&
          ev.clientY > r.top - 80 && ev.clientY < r.bottom + 80;
        if (!drin) {
          el.classList.remove('ist-live');
          el.style.setProperty('--rx', '0deg');
          el.style.setProperty('--ry', '0deg');
          continue;
        }
        el.classList.add('ist-live');
        const staerke = Number(el.dataset.tilt || 4);
        const x = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const y = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2);
        el.style.setProperty('--rx', `${(x * staerke).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(-y * staerke).toFixed(2)}deg`);
      }
    };
    if (geneigte.length) window.addEventListener('pointermove', aufZeiger, { passive: true });

    return () => {
      beobachter.disconnect();
      window.removeEventListener('fw-auftakt-weg', freigeben);
      window.removeEventListener('pointermove', aufZeiger);
      window.removeEventListener('scroll', szenenPlanen);
      window.removeEventListener('resize', szenenPlanen);
    };
  }, []);

  return null;
}

function zahlText(wert: number, el: HTMLElement) {
  const stellen = Number(el.dataset.nachkomma ?? 0);
  return wert.toLocaleString('de-DE', {
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen,
  });
}

function zaehlen(el: HTMLElement) {
  const ziel = Number(el.dataset.zahl);
  if (!Number.isFinite(ziel)) return;
  const dauer = Number(el.dataset.dauer ?? 1400);
  const start = performance.now();
  const schritt = (jetzt: number) => {
    const p = Math.min(1, (jetzt - start) / dauer);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = zahlText(ziel * e, el);
    if (p < 1) requestAnimationFrame(schritt);
    else el.textContent = zahlText(ziel, el);
  };
  requestAnimationFrame(schritt);
}
