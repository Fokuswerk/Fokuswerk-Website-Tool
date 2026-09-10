/** Bildmarke: Sucherwinkel um einen Punkt. Ohne Kachel, damit sie auf Bild,
 *  Hell und Dunkel gleich ruhig steht; der Punkt trägt die Hausfarbe. */
export default function Zeichen({ groesse = 22 }: { groesse?: number }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" aria-hidden="true">
      <path d="M1.5 6.5V1.5h5M18.5 6.5V1.5h-5M1.5 13.5v5h5M18.5 13.5v5h-5" />
      <rect x="8.1" y="8.1" width="3.8" height="3.8" fill="var(--accent)" stroke="none" />
    </svg>
  );
}
