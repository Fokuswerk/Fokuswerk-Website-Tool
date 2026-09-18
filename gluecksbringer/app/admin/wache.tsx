"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { browserClient, cmsAktiv } from "@/lib/supabase";

/**
 * Rahmen für alle Seiten der Inhaltsverwaltung.
 *
 * Prüft, ob jemand angemeldet ist, und leitet sonst zur Anmeldung. Der
 * eigentliche Schutz liegt in Supabase: ohne Anmeldung lässt die Datenbank
 * keine Änderungen zu, egal was der Browser versucht.
 */

const MENUE = [
  { href: "/admin", text: "Übersicht" },
  { href: "/admin/beitraege", text: "Beiträge" },
  { href: "/admin/galerie", text: "Galerie" },
];

export function Wache({
  titel,
  children,
}: {
  titel: string;
  /** Bekommt den angemeldeten Zugang übergeben. */
  children: (client: SupabaseClient) => ReactNode;
}) {
  const router = useRouter();
  const pfad = usePathname();
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [zustand, setZustand] = useState<"prueft" | "offen" | "zu">("prueft");
  const [wer, setWer] = useState("");

  useEffect(() => {
    if (!cmsAktiv) {
      setZustand("zu");
      return;
    }
    const c = browserClient();
    setClient(c);
    c.auth.getUser().then(({ data }) => {
      if (data.user) {
        setWer(data.user.email ?? "");
        setZustand("offen");
      } else {
        router.replace("/admin/anmelden");
      }
    });
  }, [router]);

  if (!cmsAktiv) {
    return (
      <Hinweis>
        Für diese Website ist noch keine Inhaltsverwaltung eingerichtet. In der
        Datei <code>README.md</code> steht, welche zwei Angaben dafür nötig sind.
      </Hinweis>
    );
  }

  if (zustand !== "offen" || !client) {
    return <Hinweis>Einen Moment …</Hinweis>;
  }

  return (
    <div className="min-h-dvh bg-sand-50">
      <header className="border-b border-sand-200 bg-paper">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-6">
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
              Inhalte pflegen
            </span>
            <nav className="flex gap-1">
              {MENUE.map((punkt) => {
                const aktiv =
                  punkt.href === "/admin"
                    ? pfad === "/admin"
                    : pfad.startsWith(punkt.href);
                return (
                  <Link
                    key={punkt.href}
                    href={punkt.href}
                    className={`rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors ${
                      aktiv
                        ? "bg-ink text-paper"
                        : "text-ink-70 hover:bg-sand-100 hover:text-ink"
                    }`}
                  >
                    {punkt.text}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4 text-sm text-ink-50">
            <Link href="/" className="hover:text-ink">
              Zur Website
            </Link>
            <span className="hidden sm:inline">{wer}</span>
            <button
              type="button"
              onClick={async () => {
                await client.auth.signOut();
                router.replace("/admin/anmelden");
              }}
              className="rounded-full border border-sand-300 px-4 py-2 font-medium text-ink transition-colors hover:border-ink/40"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main className="shell py-10 sm:py-14">
        <h1 className="text-h2 text-ink">{titel}</h1>
        <div className="mt-8">{children(client)}</div>
      </main>
    </div>
  );
}

export function Hinweis({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-sand-50 px-6">
      <p className="max-w-md text-center text-[1.0625rem] leading-relaxed text-ink-70">
        {children}
      </p>
    </div>
  );
}

/** Einheitliche Bausteine für die Formulare. */
export function Feld({
  beschriftung,
  hinweis,
  children,
}: {
  beschriftung: string;
  hinweis?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{beschriftung}</span>
      {hinweis ? (
        <span className="mt-1 block text-sm text-ink-50">{hinweis}</span>
      ) : null}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export const eingabeStil =
  "w-full rounded-lg border border-sand-300 bg-paper px-4 py-3 text-[1rem] text-ink outline-none transition-colors focus:border-sea";

export const knopfStil =
  "inline-flex items-center justify-center gap-2 rounded-full bg-glow px-5 py-3 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-glow-deep disabled:cursor-not-allowed disabled:opacity-50";

export const knopfLeiseStil =
  "inline-flex items-center justify-center gap-2 rounded-full border border-sand-300 px-5 py-3 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-50";
