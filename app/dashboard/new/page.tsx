"use client";

import Link from "next/link";
import { useState } from "react";
import SiteForm from "@/components/SiteForm";
import LeadSearch from "@/components/LeadSearch";
import type { LeadResult } from "@/app/api/leads-search/route";

type Mode = "search" | "manual";

export default function NewSitePage() {
  const [mode,    setMode]    = useState<Mode>("search");
  const [prefill, setPrefill] = useState<LeadResult | null>(null);

  function handleLeadSelect(lead: LeadResult) {
    setPrefill(lead);
    setMode("manual");
  }

  function handleBack() {
    setPrefill(null);
    setMode("search");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-5">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-700 transition"
            aria-label="Zurück"
          >
            <BackIcon />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Neue Website erstellen</h1>
            <p className="text-sm text-gray-400">
              {mode === "search"
                ? "Unternehmen suchen und automatisch vorausfüllen"
                : prefill
                  ? `${prefill.name} ausgewählt — oder manuell anpassen`
                  : "Manuell eingeben oder URL analysieren lassen"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-5">

        {/* ── Modus-Tabs ── */}
        <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm gap-1">
          <button
            onClick={() => setMode("search")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              mode === "search"
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <SearchTabIcon />
              Lead suchen
            </span>
          </button>
          <button
            onClick={() => { setMode("manual"); setPrefill(null); }}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              mode === "manual" && !prefill
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <EditTabIcon />
              Manuell eingeben
            </span>
          </button>
        </div>

        {/* ── Lead-Suche ── */}
        {mode === "search" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900">Unternehmen bei Google finden</h2>
              <p className="mt-1 text-sm text-gray-500">
                Suche nach Branche + Stadt — alle verfügbaren Daten (Website, Telefon, Bewertungen) werden automatisch übernommen.
              </p>
            </div>
            <LeadSearch onSelect={handleLeadSelect} />
          </div>
        )}

        {/* ── Lead ausgewählt: Bestätigung ── */}
        {mode === "manual" && prefill && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 flex items-start gap-3">
            <CheckIcon />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800">{prefill.name} ausgewählt</p>
              <p className="text-xs text-green-600 truncate">
                {[prefill.address, prefill.website ? prefill.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : null].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              onClick={handleBack}
              className="flex-shrink-0 text-xs font-medium text-green-700 hover:text-green-900 underline underline-offset-2"
            >
              Andere wählen
            </button>
          </div>
        )}

        {/* ── Formular ── */}
        {mode === "manual" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
            <SiteForm
              initialValues={prefill ? {
                company_name: prefill.name,
                industry:     prefill.industry ?? "",
                website:      prefill.website  ?? "",
                phone:        prefill.phone    ?? "",
                city:         prefill.city,
                address:      prefill.address,
              } : undefined}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function BackIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}
function SearchTabIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
    </svg>
  );
}
function EditTabIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487L19.5 7.125" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
