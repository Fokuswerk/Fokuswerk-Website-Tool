"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { LeadResult } from "@/app/api/leads-search/route";
import type { WebsiteQuality } from "@/app/api/website-quality/route";
import type { PriceEstimate } from "@/app/api/lead-price/route";

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  neu:               { label: "Neu",            color: "bg-gray-100 text-gray-600" },
  analysiert:        { label: "Analysiert",      color: "bg-blue-50 text-blue-700" },
  zu_kontaktieren:   { label: "Zu kontaktieren", color: "bg-amber-50 text-amber-700" },
  kontaktiert:       { label: "Kontaktiert",     color: "bg-purple-50 text-purple-700" },
  interessiert:      { label: "Interessiert",    color: "bg-indigo-50 text-indigo-700" },
  demo_erstellt:     { label: "Demo erstellt",   color: "bg-cyan-50 text-cyan-700" },
  angebot:           { label: "Angebot",         color: "bg-orange-50 text-orange-700" },
  gewonnen:          { label: "Gewonnen ✓",      color: "bg-green-100 text-green-700" },
  verloren:          { label: "Verloren",        color: "bg-red-50 text-red-500" },
};

interface SavedLead {
  id: string;
  company_name: string;
  industry: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  google_rating: number | null;
  google_rating_count: number | null;
  website_score: number | null;
  website_builder: string | null;
  price_min: number | null;
  price_max: number | null;
  price_reasoning: string | null;
  status: keyof typeof STATUS_CONFIG;
  dna: Record<string, unknown> | null;
  generated_site_id: string | null;
  sale_price: number | null;
  created_at: string;
}

// ─── Score Badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const color = score >= 60 ? "bg-red-100 text-red-700" : score >= 40 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-600";
  const label = score >= 60 ? "🔥 Sehr schlecht" : score >= 40 ? "⚠ Veraltet" : "✓ OK";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>{label}</span>;
}

// ─── Search Result Row ────────────────────────────────────────────────────────

function SearchResultRow({
  result, onSave, saving,
}: {
  result: LeadResult & { quality?: WebsiteQuality | null; price?: PriceEstimate | null; checking?: boolean };
  onSave: (r: typeof result) => void;
  saving: boolean;
}) {
  return (
    <div className="group flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200 hover:shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{result.name}</span>
          {result.industry && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{result.industry}</span>}
          {result.quality && <ScoreBadge score={result.quality.score} />}
          {result.checking && <span className="text-[10px] text-gray-400 animate-pulse">Website wird geprüft…</span>}
        </div>
        <div className="mt-1 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-400">{result.city}</span>
          {result.phone && <span className="text-xs text-gray-500">{result.phone}</span>}
          {result.website && (
            <a href={result.website} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline truncate max-w-[200px]">
              {result.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          )}
          {result.rating && (
            <span className="text-xs text-amber-500 font-medium">★ {result.rating} <span className="text-gray-400 font-normal">({result.rating_count})</span></span>
          )}
        </div>
        {result.quality?.notes && result.quality.notes.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {result.quality.notes.slice(0, 2).map((n, i) => (
              <span key={i} className="text-[10px] text-red-600 bg-red-50 rounded px-1.5 py-0.5">{n}</span>
            ))}
          </div>
        )}
        {result.price && (
          <p className="mt-1 text-[11px] text-green-700 font-medium">
            Preisrahmen: {result.price.min.toLocaleString("de")}–{result.price.max.toLocaleString("de")}€ · Empfehlung: {result.price.recommended.toLocaleString("de")}€
          </p>
        )}
      </div>
      <button
        onClick={() => onSave(result)}
        disabled={saving}
        className="flex-shrink-0 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
      >
        {saving ? "…" : "Speichern →"}
      </button>
    </div>
  );
}

// ─── Saved Lead Row ───────────────────────────────────────────────────────────

function SavedLeadRow({ lead, onStatusChange }: { lead: SavedLead; onStatusChange: (id: string, status: string) => void }) {
  const statusCfg = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.neu;
  return (
    <Link href={`/dashboard/leads/${lead.id}`}
      className="group flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:border-gray-200 hover:shadow-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{lead.company_name}</span>
          {lead.industry && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{lead.industry}</span>}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
          {lead.website_score !== null && <ScoreBadge score={lead.website_score} />}
        </div>
        <div className="mt-1 flex items-center gap-3 flex-wrap text-xs text-gray-400">
          {lead.city && <span>{lead.city}</span>}
          {lead.phone && <span>{lead.phone}</span>}
          {lead.google_rating && <span className="text-amber-500">★ {lead.google_rating}</span>}
          {lead.price_min && lead.price_max && (
            <span className="text-green-600 font-medium">
              {lead.price_min.toLocaleString("de")}–{lead.price_max.toLocaleString("de")}€
            </span>
          )}
          {lead.sale_price && (
            <span className="text-green-700 font-bold">✓ Verkauft für {lead.sale_price.toLocaleString("de")}€</span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2" onClick={e => e.preventDefault()}>
        <select
          value={lead.status}
          onChange={e => { e.stopPropagation(); onStatusChange(lead.id, e.target.value); }}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 focus:outline-none"
          onClick={e => e.stopPropagation()}
        >
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>
    </Link>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "text-gray-900" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── Haupt-Page ───────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [query,   setQuery]   = useState("");
  const [city,    setCity]    = useState("");
  const [results, setResults] = useState<(LeadResult & { quality?: WebsiteQuality | null; price?: PriceEstimate | null; checking?: boolean })[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savedLeads, setSavedLeads] = useState<SavedLead[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("alle");

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(d => setSavedLeads(d.leads ?? []));
  }, []);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    setResults([]);
    try {
      const params = new URLSearchParams({ q: query });
      if (city.trim()) params.set("city", city.trim());
      const res = await fetch(`/api/leads-search?${params}`);
      const data = await res.json() as { results?: LeadResult[]; error?: string };
      if (data.error) throw new Error(data.error);
      const found = (data.results ?? []).filter(r => r.website || r.phone);
      setResults(found.map(r => ({ ...r, checking: !!r.website })));
      for (const lead of found) checkLeadQuality(lead);
    } catch (err) {
      setSearchError((err as Error).message);
    } finally {
      setSearching(false);
    }
  }

  async function checkLeadQuality(lead: LeadResult) {
    if (!lead.website) return;
    try {
      const [qualityRes, priceRes] = await Promise.allSettled([
        fetch("/api/website-quality", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: lead.website }),
        }).then(r => r.json()) as Promise<WebsiteQuality>,
        fetch("/api/lead-price", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: lead.name, industry: lead.industry, city: lead.city,
            google_rating: lead.rating, google_rating_count: lead.rating_count,
          }),
        }).then(r => r.json()) as Promise<PriceEstimate>,
      ]);
      const quality = qualityRes.status === "fulfilled" ? qualityRes.value : null;
      const price   = priceRes.status  === "fulfilled" ? priceRes.value  : null;
      setResults(prev => prev.map(r =>
        r.place_id === lead.place_id ? { ...r, quality, price, checking: false } : r
      ));
    } catch {
      setResults(prev => prev.map(r =>
        r.place_id === lead.place_id ? { ...r, checking: false } : r
      ));
    }
  }

  async function saveLead(result: typeof results[0]) {
    setSavingId(result.place_id);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name:        result.name,
          industry:            result.industry,
          city:                result.city,
          address:             result.address,
          phone:               result.phone,
          website:             result.website,
          maps_url:            result.maps_url,
          sources:             result.sources,
          google_place_id:     result.place_id?.startsWith("gs_") ? null : result.place_id,
          google_rating:       result.rating,
          google_rating_count: result.rating_count,
          website_score:       result.quality?.score ?? null,
          website_score_notes: result.quality?.notes ?? null,
          website_builder:     result.quality?.builder ?? null,
          website_has_ssl:     result.quality?.has_ssl ?? null,
          website_is_mobile:   result.quality?.is_mobile ?? null,
          website_age_estimate: result.quality?.age_estimate ?? null,
          price_min:           result.price?.min ?? null,
          price_max:           result.price?.max ?? null,
          price_reasoning:     result.price?.reasoning ?? null,
          status:              "analysiert",
        }),
      });
      const data = await res.json() as { lead?: SavedLead; error?: string };
      if (data.error) throw new Error(data.error);
      if (data.lead) setSavedLeads(prev => [data.lead!, ...prev]);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  async function changeStatus(id: string, status: string) {
    setSavedLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as SavedLead["status"] } : l));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  const filteredLeads = statusFilter === "alle"
    ? savedLeads
    : savedLeads.filter(l => l.status === statusFilter);

  const gewonnen   = savedLeads.filter(l => l.status === "gewonnen");
  const revenue    = gewonnen.reduce((s, l) => s + (l.sale_price ?? 0), 0);
  const avgRevenue = gewonnen.length > 0 ? Math.round(revenue / gewonnen.length) : 0;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-900 text-xs font-black text-white">W</div>
            <span className="text-base font-bold text-gray-900">Website Tool</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/dashboard/pipeline"
              className="rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800">
              Pipeline
            </Link>
            <Link href="/dashboard/legal"
              className="rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800">
              Rechtliches
            </Link>
            <Link href="/dashboard/new"
              className="ml-2 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700">
              <span className="text-base leading-none">+</span> Neue Website
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-6 py-8 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Leads gesamt"      value={savedLeads.length} color="text-gray-900" />
          <StatCard label="Aktiv"             value={savedLeads.filter(l => !["gewonnen","verloren"].includes(l.status)).length} color="text-blue-600" />
          <StatCard label="Verkauft"          value={gewonnen.length}   color="text-green-600"
            sub={revenue > 0 ? `${revenue.toLocaleString("de")}€ gesamt` : undefined} />
          <StatCard label="Ø Verkaufspreis"
            value={avgRevenue > 0 ? `${avgRevenue.toLocaleString("de")}€` : "—"}
            color={avgRevenue > 0 ? "text-green-700" : "text-gray-400"}
            sub={gewonnen.length > 0 ? `aus ${gewonnen.length} Abschlüssen` : "Noch kein Abschluss"} />
        </div>

        {/* ── Haupt-Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LINKE SPALTE: Suche ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-1 font-semibold text-gray-900 text-sm">Betriebe finden</h2>
              <p className="mb-4 text-xs text-gray-400">Google Places + Gelbe Seiten · Website-Qualität wird automatisch geprüft</p>
              <form onSubmit={search} className="space-y-2">
                <input
                  type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Branche (Zahnarzt, Sanitär, Friseur…)"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:bg-white focus:border-gray-400 focus:outline-none"
                />
                <input
                  type="text" value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Stadt / Region"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:bg-white focus:border-gray-400 focus:outline-none"
                />
                <button
                  type="submit" disabled={searching || !query.trim()}
                  className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
                >
                  {searching ? "Suche läuft…" : "Betriebe suchen"}
                </button>
              </form>
              {searchError && <p className="mt-3 text-xs text-red-600">{searchError}</p>}
            </div>

            {results.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 px-1">{results.length} Ergebnisse · 🔥 = schlechte Website = guter Lead</p>
                {results
                  .sort((a, b) => (b.quality?.score ?? 0) - (a.quality?.score ?? 0))
                  .map(r => (
                    <SearchResultRow key={r.place_id} result={r} onSave={saveLead} saving={savingId === r.place_id} />
                  ))}
              </div>
            )}
          </div>

          {/* ── RECHTE SPALTE: Gespeicherte Leads ── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {["alle", ...Object.keys(STATUS_CONFIG)].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    statusFilter === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {s === "alle"
                    ? `Alle (${savedLeads.length})`
                    : `${STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label} (${savedLeads.filter(l => l.status === s).length})`}
                </button>
              ))}
            </div>

            {filteredLeads.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <p className="text-sm font-medium text-gray-500">
                  {savedLeads.length === 0
                    ? "Suche nach Betrieben und speichere die besten Leads hier"
                    : `Keine Leads mit Status "${statusFilter}"`}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLeads.map(lead => (
                  <SavedLeadRow key={lead.id} lead={lead} onStatusChange={changeStatus} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
