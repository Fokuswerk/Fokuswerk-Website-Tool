/**
 * Eine Feder, keine Ablaufzeit.
 *
 * Eine fest getaktete Bewegung kann auf nichts mehr antworten: sie läuft ihre
 * 300 ms ab, egal was der Finger inzwischen tut. Eine Feder hat kein Ende,
 * sondern ein Ziel — ein neues Ziel ändert nur die Richtung, die Bewegung
 * selbst reißt nicht ab.
 *
 * Gerechnet wird in den zwei Größen, die man beim Entwerfen auch denkt:
 *
 * - `daempfung` — wie weit sie überschwingt. 1 heißt: gar nicht, sie legt
 *   sich sauber ans Ziel. Darunter schwingt sie über; je kleiner, desto mehr.
 * - `antwort` — wie schnell sie am Ziel ankommt, in Sekunden. Das ist keine
 *   Dauer: wie lange sie wirklich braucht, ergibt sich aus beidem zusammen.
 *
 * Für eine Schublade sind 0,8 und 0,3 s richtig — sie kommt mit Schwung aus
 * der Geste, also darf sie ein Stück überschwingen.
 */
export type Federlauf = {
  /** Wo sie gerade steht — auch mitten im Lauf ablesbar. */
  wert: () => number;
  /** Wie schnell sie gerade ist, in Einheiten je Sekunde. */
  tempo: () => number;
  /** Anhalten, ohne ans Ziel zu springen. */
  halt: () => void;
};

export function feder({
  von,
  tempo = 0,
  ziel,
  daempfung = 1,
  antwort = 0.4,
  bei,
  fertig,
}: {
  von: number;
  tempo?: number;
  ziel: number;
  daempfung?: number;
  antwort?: number;
  bei: (wert: number) => void;
  fertig?: () => void;
}): Federlauf {
  const w = (2 * Math.PI) / antwort;
  let x = von;
  let v = tempo;
  let zuletzt = performance.now();
  let bild = 0;
  let laeuft = true;

  const schritt = (jetzt: number) => {
    if (!laeuft) return;
    // Ein ausgelassenes Einzelbild darf die Feder nicht aufschaukeln: der
    // Zeitschritt wird gedeckelt und in kleine Stücke zerlegt.
    const dt = Math.min(0.064, (jetzt - zuletzt) / 1000);
    zuletzt = jetzt;
    const teile = Math.max(1, Math.ceil(dt / 0.004));
    const h = dt / teile;
    for (let i = 0; i < teile; i++) {
      const a = -w * w * (x - ziel) - 2 * daempfung * w * v;
      v += a * h;
      x += v * h;
    }
    if (Math.abs(x - ziel) < 0.4 && Math.abs(v) < 14) {
      x = ziel;
      v = 0;
      laeuft = false;
      bei(x);
      fertig?.();
      return;
    }
    bei(x);
    bild = requestAnimationFrame(schritt);
  };

  bild = requestAnimationFrame(schritt);

  return {
    wert: () => x,
    tempo: () => v,
    halt: () => {
      laeuft = false;
      cancelAnimationFrame(bild);
    },
  };
}

/**
 * Wohin eine Bewegung von allein auslaufen würde.
 *
 * Nicht die Stelle, an der der Finger loslässt, entscheidet, sondern die,
 * an der das Geworfene zur Ruhe käme — sonst fällt ein kurzer, schneller
 * Schnipser unter den Tisch, obwohl er eindeutig gemeint war. Dieselbe
 * Rechnung, mit der auch eine Seite ausrollt.
 */
export function auslauf(tempo: number, bremse = 0.998): number {
  return (tempo / 1000) * bremse / (1 - bremse);
}

/**
 * Widerstand jenseits der Grenze.
 *
 * Hart anzuschlagen liest sich wie eingefroren. Je weiter man über die
 * Grenze hinauszieht, desto weniger folgt die Fläche — sie hört nicht auf
 * zu antworten, sie sagt nur: hier ist nichts mehr.
 */
export function gummiband(ueber: number, mass: number, k = 0.55): number {
  return (ueber * mass * k) / (mass + k * Math.abs(ueber));
}

/** Will der Nutzer keine Bewegung sehen? */
export function ruhigGestellt(): boolean {
  return typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}
