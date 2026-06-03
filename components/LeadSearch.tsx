"use client";

import { useState, useRef } from "react";
import type { LeadResult } from "@/app/api/leads-search/route";

interface Props {
  onSelect: (lead: LeadResult) => void;
}

export default function LeadSearch({ onSelect }: Props) {
  const [query,   setQuery]   = useState("");
  const [city,    setCity]    = useState("");
  const [results, setResults] = useState<LeadResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(false);

    try {
      const params = new URLSearchParams({ q: query });
      if (city.trim()) params.set("city", city.trim());
      const res = await fetch(`/api/leads-search?${params}`);
      const data = await res.json() as { results?: LeadResult[]; error?: string };
      if (data.error) throw new Error(data.error);
      setResults(data.results ?? []);
      setSearched(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Suchleiste */}
      <form onSubmit={search} className="flex gap-2">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Branche (z.B. Zahnarzt, Friseur, KFZ-Werkstatt…)"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-0 transition"
          />
        </div>
        <div className="w-44">
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Stadt"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-0 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50 active:scale-95"
        >
          {loading
            ? <Spinner />
            : <SearchIcon />
          }
          Suchen
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      {/* Ergebnisse */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">{results.length} Ergebnisse — Klicken zum Auswählen</p>
          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
            {results.map(lead => (
              <button
                key={lead.place_id}
                onClick={() => onSelect(lead)}
                className="group w-full rounded-xl border border-gray-100 bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{lead.name}</span>
                      {lead.industry && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          {lead.industry}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-gray-400">{lead.address}</p>
                    <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                      {lead.rating && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <StarIcon /> {lead.rating} <span className="text-gray-400 font-normal">({lead.rating_count})</span>
                        </span>
                      )}
                      {lead.website && (
                        <span className="text-xs text-blue-500 truncate max-w-[180px]">
                          {lead.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="text-xs text-gray-400">{lead.phone}</span>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-lg bg-gray-900 px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    Auswählen →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-sm text-gray-400 text-center py-4">
          Keine Ergebnisse für „{query}{city ? ` in ${city}` : ""}". Anderen Begriff versuchen.
        </p>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-3 w-3 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
      <path d="M10 1l2.39 7.26H19l-5.31 3.86 2.03 7.14L10 15.27l-5.72 3.99 2.03-7.14L1 8.26h6.61z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
    </svg>
  );
}
