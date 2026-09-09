export default function Pfeil({ groesse = 14 }: { groesse?: number }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 14 14" fill="none"
         stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M1.5 7h11M8 2.5 12.5 7 8 11.5" />
    </svg>
  );
}
