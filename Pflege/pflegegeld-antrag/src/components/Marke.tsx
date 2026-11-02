import Link from "next/link";

/** Zeichen, Flagge, Wortmarke. */
export default function Marke({ alsLink = true }: { alsLink?: boolean }) {
  const inhalt = (
    <>
      <span className="zeichen" aria-hidden="true">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 20.5s-7.2-4.3-7.2-9.6a4.1 4.1 0 0 1 7.2-2.7 4.1 4.1 0 0 1 7.2 2.7c0 5.3-7.2 9.6-7.2 9.6Z"
            stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flagge" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="wortmarke-text">Pflegegeld-Antrag</span>
    </>
  );
  if (!alsLink) return <span className="wortmarke">{inhalt}</span>;
  return <Link href="/" className="wortmarke">{inhalt}</Link>;
}
