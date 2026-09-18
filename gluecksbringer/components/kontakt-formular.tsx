"use client";

import Link from "next/link";
import { useActionState } from "react";
import { nachrichtSenden, type FormularZustand } from "@/app/kontakt/actions";
import { PfeilRechts } from "./ui";

const start: FormularZustand = { status: "leer" };

const feldKlasse =
  "mt-2 w-full rounded-xl border border-sand-200 bg-paper px-4 py-3 text-[1rem] text-ink transition-colors duration-200 placeholder:text-ink-50/70 focus:border-sea focus:outline-none";

export function KontaktFormular() {
  const [zustand, absenden, laeuft] = useActionState(nachrichtSenden, start);

  if (zustand.status === "erfolg") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-sand-200 bg-sand-50 p-8 sm:p-10"
      >
        <p className="text-h3 text-ink">Vielen Dank!</p>
        <p className="mt-3 text-[1rem] leading-relaxed text-ink-70">
          {zustand.meldung ?? "Ihre Nachricht ist bei uns angekommen."}
        </p>
      </div>
    );
  }

  return (
    <form action={absenden} noValidate className="space-y-5">
      {zustand.status === "fehler" && zustand.meldung ? (
        <p
          role="alert"
          className="rounded-xl border border-alarm/30 bg-alarm-soft px-4 py-3 text-[0.9375rem] text-alarm"
        >
          {zustand.meldung}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="text-[0.9375rem] font-medium text-ink">
          Name <span aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-describedby={zustand.felder?.name ? "fehler-name" : undefined}
          className={feldKlasse}
        />
        {zustand.felder?.name ? (
          <p id="fehler-name" className="mt-1.5 text-sm text-glow">
            {zustand.felder.name}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="email"
          className="text-[0.9375rem] font-medium text-ink"
        >
          E-Mail <span aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-describedby={zustand.felder?.email ? "fehler-email" : undefined}
          className={feldKlasse}
        />
        {zustand.felder?.email ? (
          <p id="fehler-email" className="mt-1.5 text-sm text-glow">
            {zustand.felder.email}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="nachricht"
          className="text-[0.9375rem] font-medium text-ink"
        >
          Nachricht <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="nachricht"
          name="nachricht"
          rows={6}
          required
          aria-describedby={
            zustand.felder?.nachricht ? "fehler-nachricht" : undefined
          }
          className={`${feldKlasse} resize-y`}
        />
        {zustand.felder?.nachricht ? (
          <p id="fehler-nachricht" className="mt-1.5 text-sm text-glow">
            {zustand.felder.nachricht}
          </p>
        ) : null}
      </div>

      {/* Unsichtbares Feld gegen automatisierte Einträge */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="website">Bitte nicht ausfüllen</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex gap-3">
        <input
          id="einwilligung"
          name="einwilligung"
          type="checkbox"
          required
          className="mt-1 size-4 shrink-0 accent-[var(--color-glow)]"
          aria-describedby={
            zustand.felder?.einwilligung ? "fehler-einwilligung" : undefined
          }
        />
        <div>
          <label
            htmlFor="einwilligung"
            className="text-[0.9375rem] leading-relaxed text-ink-70"
          >
            Ich bin damit einverstanden, dass meine Angaben zur Beantwortung
            meiner Anfrage verarbeitet werden. Weitere Hinweise in der{" "}
            <Link
              href="/datenschutz"
              className="text-sea underline underline-offset-4"
            >
              Datenschutzerklärung
            </Link>
            .
          </label>
          {zustand.felder?.einwilligung ? (
            <p id="fehler-einwilligung" className="mt-1.5 text-sm text-glow">
              {zustand.felder.einwilligung}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={laeuft}
        className="group inline-flex items-center justify-center gap-2 rounded-full bg-glow px-7 py-3.5 text-[0.9375rem] font-semibold text-white transition-all duration-300 hover:bg-glow-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {laeuft ? "Wird gesendet …" : "Nachricht senden"}
        {laeuft ? null : (
          <PfeilRechts className="transition-transform duration-300 ease-[var(--ease-soft)] group-hover:translate-x-0.5" />
        )}
      </button>
    </form>
  );
}
