import Link from "next/link";
import { Puck } from "./puck";

/** Handgezeichnete Wellenlinie – das wiederkehrende Motiv der Marke. */
export function Welle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 8"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={className}
    >
      <path
        d="M1 5.2c6.5-4.6 13-4.6 19.5 0s13 4.6 19.5 0 13-4.6 19.5 0 13 4.6 19.5 0 13-4.6 19.5 0 13 4.6 19.5 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Vierblättriges Kleeblatt – aus dem bisherigen Auftritt des Vereins. */
export function Kleeblatt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M16 15.5c-1.6-3-1-6.1 1-7.6 2.2-1.6 5.2-.5 5.9 2 .8 2.8-2 5.3-6.9 5.6Z"
        fill="currentColor"
      />
      <path
        d="M16.5 16c3-1.6 6.1-1 7.6 1 1.6 2.2.5 5.2-2 5.9-2.8.8-5.3-2-5.6-6.9Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M16 16.5c1.6 3 1 6.1-1 7.6-2.2 1.6-5.2.5-5.9-2-.8-2.8 2-5.3 6.9-5.6Z"
        fill="currentColor"
      />
      <path
        d="M15.5 16c-3 1.6-6.1 1-7.6-1-1.6-2.2-.5-5.2 2-5.9 2.8-.8 5.3 2 5.6 6.9Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M16.4 17.4c1.6 2.9 2 6.2 1.3 9.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wortmarke({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`group inline-flex items-center gap-2 sm:gap-2.5 ${className}`}
    >
      {/* Puck steht in der Kopfleiste – das Zeichen, das der Verein seit 2011 benutzt. */}
      <Puck
        variante="kopf"
        className="h-9 w-auto shrink-0 transition-transform duration-500 ease-[var(--ease-soft)] group-hover:-translate-y-0.5 group-hover:rotate-[-4deg] sm:h-8"
      />
      {/* Auf schmalen Schirmen zweizeilig, damit die Marke neben Puck und der
          Schaltfläche Platz behält; ab 640 px steht sie wieder in einer Zeile. */}
      <span className="flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-display)] text-[0.9375rem] leading-[1.12] font-semibold tracking-[-0.02em] text-ink sm:text-[1.1875rem] sm:leading-none">
          Glücksbringer
          <br className="sm:hidden" />
          <span className="relative text-sea sm:ml-[0.3em]">
            am&nbsp;Meer
            <Welle className="absolute -bottom-[0.28em] left-0 h-[0.2em] w-full text-glow/55 transition-transform duration-500 ease-[var(--ease-soft)] group-hover:translate-y-[1px]" />
          </span>
        </span>
        <span className="hidden text-[0.65rem] font-medium tracking-[0.08em] text-ink-50 uppercase sm:inline">
          e.V.
        </span>
      </span>
    </Link>
  );
}
