"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserClient, cmsAktiv } from "@/lib/supabase";
import { eingabeStil, Feld, Hinweis, knopfStil } from "../wache";

export default function Anmelden() {
  const router = useRouter();
  const [mail, setMail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [laeuft, setLaeuft] = useState(false);

  if (!cmsAktiv) {
    return (
      <Hinweis>
        Für diese Website ist noch keine Inhaltsverwaltung eingerichtet.
      </Hinweis>
    );
  }

  async function absenden(ereignis: React.FormEvent) {
    ereignis.preventDefault();
    setFehler("");
    setLaeuft(true);
    const { error } = await browserClient().auth.signInWithPassword({
      email: mail.trim(),
      password: passwort,
    });
    setLaeuft(false);
    if (error) {
      setFehler("E-Mail-Adresse oder Passwort stimmen nicht.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-sand-50 px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-sand-200 bg-paper p-8 sm:p-10">
        <h1 className="text-h3 text-ink">Inhalte pflegen</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
          Bitte melden Sie sich mit dem Zugang an, den Sie vom Verein bekommen
          haben.
        </p>

        <form onSubmit={absenden} className="mt-8 space-y-5">
          <Feld beschriftung="E-Mail">
            <input
              type="email"
              required
              autoComplete="username"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              className={eingabeStil}
            />
          </Feld>

          <Feld beschriftung="Passwort">
            <input
              type="password"
              required
              autoComplete="current-password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              className={eingabeStil}
            />
          </Feld>

          {fehler ? (
            <p className="rounded-lg bg-alarm-soft px-4 py-3 text-sm text-alarm">
              {fehler}
            </p>
          ) : null}

          <button type="submit" disabled={laeuft} className={`${knopfStil} w-full`}>
            {laeuft ? "Einen Moment …" : "Anmelden"}
          </button>
        </form>
      </div>
    </div>
  );
}
