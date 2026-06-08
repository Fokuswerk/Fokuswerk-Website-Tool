"use client";

import Link from "next/link";
import { useState } from "react";
import SiteForm from "@/components/SiteForm";
import LeadSearch from "@/components/LeadSearch";
import type { LeadResult } from "@/app/api/leads-search/route";
import type { CompanyDNA } from "@/app/api/lead-analyze/route";

type Stage = "search" | "analyze" | "create";

// ─── Analyse-Karte ────────────────────────────────────────────────────────────
function DnaCard({ dna }: { dna: CompanyDNA }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs">
          <SparklesIcon />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">Unternehmens-Analyse</h3>
        <span className="ml-auto text-[11px] text-indigo-500 font-medium bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5">KI-generiert</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DnaBlock label="Wer sie sind" value={dna.business_identity} />
        <DnaBlock label="Größte Chance" value={dna.biggest_opportunity} color="green" />
        <DnaBlock label="Was Kunden loben" value={dna.customer_top_praise} />
        <DnaBlock label="Headline-Richtung" value={dna.recommended_hero_angle} color="indigo" />
      </div>

      {dna.key_phrases?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ihre eigenen Schlüsselbegriffe</p>
          <div className="flex flex-wrap gap-1.5">
            {dna.key_phrases.map((p, i) => (
              <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{p}</span>
            ))}
          </div>
        </div>
      )}

      {dna.unique_differentiators?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Alleinstellungsmerkmale</p>
          <ul className="space-y-1">
            {dna.unique_differentiators.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 text-green-500">✓</span> {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {dna.website_weaknesses?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Schwächen der aktuellen Präsenz</p>
          <ul className="space-y-1">
            {dna.website_weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-amber-400">→</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 px-4 py-3">
        <span className="text-xs text-gray-500">Empfohlener Ton:</span>
        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full px-2.5 py-0.5">{dna.recommended_tone}</span>
      </div>
    </div>
  );
}

function DnaBlock({ label, value, color = "gray" }: { label: string; value?: string; color?: "gray" | "green" | "indigo" }) {
  if (!value) return null;
  const bg = color === "green" ? "bg-green-50 border-green-100" : color === "indigo" ? "bg-indigo-50 border-indigo-100" : "bg-gray-50 border-gray-100";
  const text = color === "green" ? "text-green-800" : color === "indigo" ? "text-indigo-800" : "text-gray-700";
  return (
    <div className={`rounded-xl border p-3 ${bg}`}>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`text-xs leading-relaxed ${text}`}>{value}</p>
    </div>
  );
}

// ─── Haupt-Page ───────────────────────────────────────────────────────────────
export default function NewSitePage() {
  const [stage,   setStage]   = useState<Stage>("search");
  const [lead,    setLead]    = useState<LeadResult | null>(null);
  const [dna,     setDna]     = useState<CompanyDNA | null>(null);
  const [scraped, setScraped] = useState<Record<string, unknown> | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  async function handleLeadSelect(selected: LeadResult) {
    setLead(selected);
    setDna(null);
    setScraped(null);
    setAnalyzeError(null);
    setStage("analyze");
    setAnalyzing(true);

    try {
      // 1. Website scrapen (falls vorhanden) — parallel zur DNA-Analyse
      let scrapedData: Record<string, unknown> = {};
      if (selected.website) {
        try {
          const scrapeRes = await fetch("/api/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: selected.website, company_name: selected.name }),
          });
          if (scrapeRes.ok) scrapedData = await scrapeRes.json();
        } catch { /* scrape optional */ }
      }
      setScraped(scrapedData);

      // 2. Company DNA Analyse
      const analyzeRes = await fetch("/api/lead-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name:   selected.name,
          industry:       selected.industry ?? "",
          city:           selected.city,
          website:        selected.website,
          description:    scrapedData.description,
          about_text:     scrapedData.about_text,
          scraped_hero:   scrapedData.hero_text,
          headings:       scrapedData.headings,
          service_pairs:  scrapedData.service_pairs,
          google_reviews: scrapedData.google_reviews,
          google_rating:  (scrapedData.google_rating as number) ?? selected.rating,
          google_rating_count: (scrapedData.google_rating_count as number) ?? selected.rating_count,
          trust_signals:  scrapedData.trust_signals,
          opening_hours:  scrapedData.opening_hours,
          team_members:   scrapedData.team_members,
        }),
      });

      if (!analyzeRes.ok) throw new Error("Analyse fehlgeschlagen");
      const { dna: result } = await analyzeRes.json() as { dna: CompanyDNA };
      setDna(result);

    } catch (err) {
      setAnalyzeError((err as Error).message || "Analyse fehlgeschlagen");
    } finally {
      setAnalyzing(false);
    }
  }

  function proceedToCreate() {
    setStage("create");
  }

  function backToSearch() {
    setStage("search");
    setLead(null);
    setDna(null);
    setScraped(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-5">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 transition" aria-label="Zurück">
            <BackIcon />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Neue Website erstellen</h1>
            <p className="text-sm text-gray-400">
              {stage === "search" && "Lead suchen via Google Places + Gelbe Seiten"}
              {stage === "analyze" && (analyzing ? `${lead?.name} wird analysiert…` : `Analyse: ${lead?.name}`)}
              {stage === "create" && `Website für ${lead?.name}`}
            </p>
          </div>

          {/* Progress steps */}
          <div className="ml-auto hidden sm:flex items-center gap-1.5">
            {[
              { n: 1, label: "Suchen",    active: stage === "search"  },
              { n: 2, label: "Analysieren", active: stage === "analyze" },
              { n: 3, label: "Generieren", active: stage === "create"  },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-1.5">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition ${
                  s.active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
                }`}>{s.n}</div>
                <span className={`text-xs font-medium hidden md:inline ${s.active ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
                {i < 2 && <span className="text-gray-200 mx-0.5">›</span>}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-5">

        {/* ── STAGE 1: Lead suchen ── */}
        {stage === "search" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900">Unternehmen finden</h2>
              <p className="mt-1 text-sm text-gray-500">
                Sucht parallel bei <strong>Google Places</strong> + <strong>Gelbe Seiten</strong> — alle Daten werden automatisch übernommen und analysiert.
              </p>
            </div>
            <LeadSearch onSelect={handleLeadSelect} />

            <div className="mt-6 border-t border-gray-100 pt-5">
              <button
                onClick={() => setStage("create")}
                className="text-sm text-gray-400 hover:text-gray-600 transition"
              >
                Ohne Suche manuell eingeben →
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 2: Analyse ── */}
        {stage === "analyze" && (
          <>
            {/* Lead-Badge */}
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex items-center gap-3 shadow-sm">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white text-xs font-bold">
                {lead?.name.slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{lead?.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {[lead?.industry, lead?.city, lead?.website?.replace(/^https?:\/\//,"").replace(/\/$/,"")].filter(Boolean).join(" · ")}
                </p>
              </div>
              {lead?.rating && (
                <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                  ★ {lead.rating}
                  {lead.rating_count && <span className="text-gray-400 text-xs font-normal">({lead.rating_count})</span>}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {lead?.sources.map(s => (
                  <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{s}</span>
                ))}
              </div>
              <button onClick={backToSearch} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 flex-shrink-0">
                Andere wählen
              </button>
            </div>

            {/* Analyse läuft */}
            {analyzing && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                  <LoaderIcon />
                </div>
                <p className="font-semibold text-indigo-900 text-sm">Unternehmen wird analysiert…</p>
                <p className="mt-1 text-xs text-indigo-600">Website scrapen · Google Reviews lesen · Tonalität erkennen · Positionierung analysieren</p>
              </div>
            )}

            {/* Fehler */}
            {analyzeError && !analyzing && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
                <p className="text-sm text-red-700">{analyzeError} — Website wird trotzdem generiert.</p>
                <button onClick={proceedToCreate} className="mt-3 text-sm font-semibold text-red-600 hover:text-red-800">
                  Trotzdem weiter →
                </button>
              </div>
            )}

            {/* Analyse fertig */}
            {dna && !analyzing && (
              <>
                <DnaCard dna={dna} />
                <button
                  onClick={proceedToCreate}
                  className="w-full rounded-xl bg-gray-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-gray-700 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <SparklesIcon />
                  Auf Basis dieser Analyse Website generieren
                </button>
              </>
            )}
          </>
        )}

        {/* ── STAGE 3: Formular ── */}
        {stage === "create" && (
          <>
            {lead && (
              <div className="rounded-xl border border-green-100 bg-green-50 px-5 py-3 flex items-center gap-3">
                <CheckIcon />
                <p className="flex-1 text-sm font-medium text-green-800">
                  {lead.name}
                  {dna && <span className="ml-2 text-xs text-green-600 font-normal">· Analyse eingebaut</span>}
                </p>
                <button onClick={backToSearch} className="text-xs text-green-600 hover:text-green-800 underline underline-offset-2">
                  Andere wählen
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
              <SiteForm
                initialValues={lead ? {
                  company_name: lead.name,
                  industry:     lead.industry ?? "",
                  website:      lead.website  ?? "",
                  phone:        lead.phone    ?? "",
                  city:         lead.city,
                  address:      lead.address,
                } : undefined}
                companyDna={dna}
                scrapedContext={scraped}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function BackIcon() {
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>;
}
function SparklesIcon() {
  return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>;
}
function LoaderIcon() {
  return <svg className="h-6 w-6 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/></svg>;
}
function CheckIcon() {
  return <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
}
