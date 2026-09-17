import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type ButtonVariante = "primaer" | "sekundaer" | "hell";

const basis =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.9375rem] font-semibold tracking-[-0.01em] transition-all duration-300 ease-[var(--ease-soft)] active:scale-[0.98] sm:px-7 sm:py-3.5";

const varianten: Record<ButtonVariante, string> = {
  primaer:
    "bg-glow text-white shadow-[0_1px_2px_rgba(16,41,59,0.16)] hover:bg-glow-deep",
  sekundaer:
    "border border-ink/15 bg-transparent text-ink hover:border-ink/35 hover:bg-ink/[0.03]",
  hell: "bg-paper text-ink hover:bg-white",
};

export function ButtonLink({
  href,
  variante = "primaer",
  className = "",
  children,
  ...rest
}: {
  href: string;
  variante?: ButtonVariante;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className">) {
  const extern = href.startsWith("http") || href.startsWith("mailto:");

  if (extern) {
    return (
      <a
        href={href}
        className={`${basis} ${varianten[variante]} ${className}`}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={`${basis} ${varianten[variante]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function PfeilRechts({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`size-[1.05em] shrink-0 ${className}`}
    >
      <path
        d="M4 10h11m0 0-4.2-4.2M15 10l-4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Abschnittsmarke im Editorial-Stil: "01 — Wer wir sind" */
export function Abschnittsmarke({
  nummer,
  children,
  className = "",
}: {
  nummer?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`eyebrow ${className}`}>
      {nummer ? (
        <>
          <span className="text-glow tabular-nums">{nummer}</span>
          <span aria-hidden="true" className="h-px w-6 bg-sand-300" />
        </>
      ) : null}
      <span>{children}</span>
    </p>
  );
}

/** Feine Trennlinie zwischen den Kapiteln der Seite. */
export function Trennlinie({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-sand-200 ${className}`} />;
}
