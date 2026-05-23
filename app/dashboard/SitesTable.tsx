"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Site, SiteStatus } from "@/lib/types";
import { scoreColor } from "@/lib/quality-score";
import CopyLinkButton from "./CopyLinkButton";
import DeleteButton from "./DeleteButton";
import StatusSelect from "./StatusSelect";

const TEMPLATE_LABELS: Record<string, string> = {
  premium:          "Standard",
  "arzt-modern":    "Arzt · Modern",
  arzt:             "Arzt · Klassisch",
  handwerk:         "Handwerk · Modern",
  "handwerk-lokal": "Handwerk · Klassisch",
  local:            "Local",
  minimal:          "Minimal",
};

function relativeDate(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return "Heute";
  if (diff === 1) return "Gestern";
  if (diff < 7)  return `vor ${diff} Tagen`;
  if (diff < 30) return `vor ${Math.floor(diff / 7)} Wo.`;
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export default function SitesTable({ sites }: { sites: Site[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(s =>
      s.company_name.toLowerCase().includes(q) ||
      (s.industry || "").toLowerCase().includes(q) ||
      (s.slug || "").toLowerCase().includes(q) ||
      (s.status || "").toLowerCase().includes(q) ||
      (TEMPLATE_LABELS[s.template] || "").toLowerCase().includes(q)
    );
  }, [query, sites]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Table header with search */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/70 px-5 py-3.5">
        <p className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          {filtered.length === sites.length
            ? `${sites.length} ${sites.length === 1 ? "Website" : "Websites"}`
            : `${filtered.length} von ${sites.length} Websites`}
        </p>
        <div className="relative w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Suchen…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Suche löschen"
            >
              <XSmallIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-gray-100">
              <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Unternehmen</th>
              <th scope="col" className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:table-cell">Branche</th>
              <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
              <th scope="col" className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 md:table-cell">Template</th>
              <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Demo-Link</th>
              <th scope="col" className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 xl:table-cell">Qualität</th>
              <th scope="col" className="hidden px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400 lg:table-cell">Erstellt</th>
              <th scope="col" className="px-5 py-3" aria-label="Aktionen" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                  Keine Einträge für „{query}" gefunden.
                </td>
              </tr>
            ) : (
              filtered.map(site => (
                <tr key={site.id} className="group transition-colors hover:bg-gray-50/60">

                  {/* Company */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: site.primary_color || "#374151" }}
                        aria-hidden="true"
                      >
                        {site.company_name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold leading-snug text-gray-900">
                          {site.company_name}
                        </div>
                        <div className="truncate font-mono text-[11px] text-gray-400">
                          /site/{site.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Industry */}
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <span className="text-sm text-gray-600">{site.industry || <span className="text-gray-300">—</span>}</span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusSelect siteId={site.id} currentStatus={site.status as SiteStatus} />
                  </td>

                  {/* Template */}
                  <td className="hidden px-5 py-4 md:table-cell">
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                      {TEMPLATE_LABELS[site.template] || site.template || "Premium"}
                    </span>
                  </td>

                  {/* Demo link */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <CopyLinkButton slug={site.slug} />
                      <a
                        href={`/site/${site.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${site.company_name} öffnen`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2"
                      >
                        <ExternalIcon />
                      </a>
                    </div>
                  </td>

                  {/* Quality score */}
                  <td className="hidden px-5 py-4 xl:table-cell">
                    {(() => {
                      const score = site.ai_content?.quality_score;
                      if (score == null) return <span className="text-xs text-gray-300">—</span>;
                      return (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>
                            {score}
                          </span>
                          <span className="text-xs text-gray-400">/100</span>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Date */}
                  <td className="hidden px-5 py-4 lg:table-cell">
                    <span className="text-xs text-gray-400">{relativeDate(site.created_at)}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/dashboard/${site.id}/edit`}
                        aria-label={`${site.company_name} bearbeiten`}
                        title="Bearbeiten"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2"
                      >
                        <PencilIcon />
                      </Link>
                      <DeleteButton siteId={site.id} companyName={site.company_name} iconOnly />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function XSmallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}
