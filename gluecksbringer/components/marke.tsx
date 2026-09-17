import Link from "next/link";

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
      className={`group inline-flex items-baseline gap-2 ${className}`}
    >
      <span className="font-[family-name:var(--font-display)] text-[0.9875rem] leading-none font-semibold tracking-[-0.02em] text-ink min-[400px]:text-[1.0625rem] sm:text-[1.1875rem]">
        Glücksbringer
        <span className="relative ml-[0.3em] text-sea">
          am&nbsp;Meer
          <Welle className="absolute -bottom-[0.3em] left-0 h-[0.2em] w-full text-glow/55 transition-transform duration-500 ease-[var(--ease-soft)] group-hover:translate-y-[1px]" />
        </span>
      </span>
      <span className="hidden text-[0.65rem] font-medium tracking-[0.08em] text-ink-50 uppercase min-[420px]:inline">
        e.V.
      </span>
    </Link>
  );
}
