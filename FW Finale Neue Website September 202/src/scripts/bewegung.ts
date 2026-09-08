/**
 * Bewegung — Reveals, Parallaxe, Zahlen-Count-up.
 * Ein IntersectionObserver, eine rAF-Schleife. Kein Framework.
 */
const ruhe = window.matchMedia('(prefers-reduced-motion: reduce)');

function reveals() {
  const ziele = document.querySelectorAll<HTMLElement>('[data-auf], [data-zoom], [data-zeilen]');
  if (!ziele.length) return;

  if (ruhe.matches) {
    ziele.forEach((el) => el.classList.add('ist-da'));
    return;
  }

  const beobachter = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add('ist-da');
        zaehlen(el);
        beobachter.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  );

  ziele.forEach((el) => beobachter.observe(el));
}

/** Zahlen laufen von 0 auf den Zielwert. Tabellenziffern verhindern Breitensprünge. */
function zaehlen(wurzel: HTMLElement) {
  const felder = wurzel.matches('[data-zahl]')
    ? [wurzel]
    : Array.from(wurzel.querySelectorAll<HTMLElement>('[data-zahl]'));

  for (const feld of felder) {
    const ziel = Number(feld.dataset.zahl);
    if (!Number.isFinite(ziel)) continue;
    if (ruhe.matches) { feld.textContent = formatieren(ziel, feld); return; }

    const dauer = 1200;
    const start = performance.now();
    const schritt = (jetzt: number) => {
      const p = Math.min(1, (jetzt - start) / dauer);
      const e = 1 - Math.pow(1 - p, 3);
      feld.textContent = formatieren(ziel * e, feld);
      if (p < 1) requestAnimationFrame(schritt);
      else feld.textContent = formatieren(ziel, feld);
    };
    requestAnimationFrame(schritt);
  }
}

function formatieren(wert: number, feld: HTMLElement) {
  const stellen = Number(feld.dataset.nachkomma ?? 0);
  return wert.toLocaleString('de-DE', {
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen,
  });
}

/** Sehr zurückhaltende Parallaxe: maximal ±40 px, nur auf Zeigergeräten. */
function parallaxe() {
  if (ruhe.matches) return;
  if (!window.matchMedia('(min-width: 48rem)').matches) return;

  const ziele = Array.from(document.querySelectorAll<HTMLElement>('[data-parallaxe]'));
  if (!ziele.length) return;

  let laeuft = false;
  const rechnen = () => {
    laeuft = false;
    const h = window.innerHeight;
    for (const el of ziele) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > h + 200) continue;
      const weg = Number(el.dataset.parallaxe || 40);
      const mitte = r.top + r.height / 2;
      const anteil = (mitte - h / 2) / (h / 2 + r.height / 2);
      const bild = el.querySelector<HTMLElement>('img');
      if (bild) bild.style.setProperty('--schub', `${(-anteil * weg).toFixed(2)}px`);
    }
  };
  const planen = () => {
    if (laeuft) return;
    laeuft = true;
    requestAnimationFrame(rechnen);
  };
  window.addEventListener('scroll', planen, { passive: true });
  window.addEventListener('resize', planen);
  rechnen();
}

reveals();
parallaxe();
