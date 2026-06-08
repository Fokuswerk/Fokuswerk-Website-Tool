import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Site, SiteStatus } from "@/lib/types";
import SitesTable from "./SitesTable";
import LogoutButton from "./LogoutButton";

async function getSites(): Promise<Site[]> {
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Site[];
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let sites: Site[] = [];
  let fetchError: string | null = null;

  try {
    sites = await getSites();
  } catch (e) {
    fetchError = (e as Error).message;
  }

  const byStatus = {
    Entwurf:      sites.filter(s => s.status === "Entwurf").length,
    Gesendet:     sites.filter(s => s.status === "Gesendet").length,
    Interessiert: sites.filter(s => s.status === "Interessiert").length,
    Gewonnen:     sites.filter(s => s.status === "Gewonnen").length,
    Abgelehnt:    sites.filter(s => s.status === "Abgelehnt").length,
  };

  const closedTotal = byStatus.Gewonnen + byStatus.Abgelehnt;
  const winRate     = closedTotal > 0 ? Math.round(byStatus.Gewonnen / closedTotal * 100) : null;
  const activeDeals = byStatus.Gesendet + byStatus.Interessiert;

  return (
    <div className="min-h-screen bg-[#f7f8fa] font-sans antialiased">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-sm font-black text-white">
              W
            </div>
            <div>
              <span className="text-base font-bold text-gray-900">Website Tool</span>
              <span className="ml-2 hidden text-xs text-gray-400 sm:inline">Sales Pipeline</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/leads"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
            >
              Leads
            </Link>
            <Link
              href="/dashboard/legal"
              className="rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            >
              Rechtliches
            </Link>
            <LogoutButton />
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <span className="text-base leading-none">+</span>
              Neue Website
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl space-y-5 px-6 py-8">

        {/* ── Error ── */}
        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <strong>Verbindungsfehler:</strong> {fetchError}
          </div>
        )}

        {/* ── Empty state ── */}
        {sites.length === 0 && !fetchError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-28 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-2xl font-black text-white">
              W
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Pipeline ist leer</h2>
            <p className="mb-7 max-w-xs text-sm text-gray-500">
              Erstelle deine erste Demo-Website für einen Lead und starte die Sales-Pipeline.
            </p>
            <Link
              href="/dashboard/new"
              className="rounded-xl bg-gray-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
              Erste Website erstellen
            </Link>
          </div>
        )}

        {sites.length > 0 && (
          <>
            {/* ── Pipeline card ── */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Sales Pipeline
              </p>

              <div className="mb-5 flex items-center">
                {[
                  { name: "Entwurf" as SiteStatus,      count: byStatus.Entwurf,      dot: "bg-gray-300",  num: "text-gray-700"  },
                  { name: "Gesendet" as SiteStatus,     count: byStatus.Gesendet,     dot: "bg-blue-500",  num: "text-blue-700"  },
                  { name: "Interessiert" as SiteStatus, count: byStatus.Interessiert, dot: "bg-amber-500", num: "text-amber-700" },
                  { name: "Gewonnen" as SiteStatus,     count: byStatus.Gewonnen,     dot: "bg-green-500", num: "text-green-700" },
                ].map((stage, i, arr) => (
                  <div key={stage.name} className="flex flex-1 items-center">
                    <div className="flex-1 text-center">
                      <div className={`text-3xl font-black tabular-nums ${stage.num}`}>
                        {stage.count}
                      </div>
                      <div className="mt-1.5 flex items-center justify-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${stage.dot}`} aria-hidden="true" />
                        <span className="text-xs font-medium text-gray-500">{stage.name}</span>
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                    )}
                  </div>
                ))}

                {byStatus.Abgelehnt > 0 && (
                  <>
                    <div className="mx-5 h-10 w-px bg-gray-200" />
                    <div className="text-center">
                      <div className="text-2xl font-bold tabular-nums text-red-400">{byStatus.Abgelehnt}</div>
                      <div className="mt-1.5 flex items-center justify-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-300" aria-hidden="true" />
                        <span className="text-xs text-gray-400">Abgelehnt</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Progress bar */}
              <div className="flex h-1.5 overflow-hidden rounded-full bg-gray-100 gap-px">
                {byStatus.Entwurf > 0 && (
                  <div className="rounded-full bg-gray-300" style={{ width: `${byStatus.Entwurf / sites.length * 100}%` }} />
                )}
                {byStatus.Gesendet > 0 && (
                  <div className="rounded-full bg-blue-400" style={{ width: `${byStatus.Gesendet / sites.length * 100}%` }} />
                )}
                {byStatus.Interessiert > 0 && (
                  <div className="rounded-full bg-amber-400" style={{ width: `${byStatus.Interessiert / sites.length * 100}%` }} />
                )}
                {byStatus.Gewonnen > 0 && (
                  <div className="rounded-full bg-green-500" style={{ width: `${byStatus.Gewonnen / sites.length * 100}%` }} />
                )}
                {byStatus.Abgelehnt > 0 && (
                  <div className="rounded-full bg-red-300" style={{ width: `${byStatus.Abgelehnt / sites.length * 100}%` }} />
                )}
              </div>
            </div>

            {/* ── KPI cards ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiCard label="Websites gesamt" value={sites.length}        color="text-gray-900" />
              <KpiCard label="Aktive Deals"     value={activeDeals}        color="text-blue-600" />
              <KpiCard label="Gewonnen"          value={byStatus.Gewonnen} color="text-green-600" />
              <KpiCard
                label="Win Rate"
                value={winRate !== null ? `${winRate} %` : "—"}
                color={winRate !== null && winRate >= 50 ? "text-green-600" : "text-gray-500"}
                sub={closedTotal > 0 ? `${closedTotal} abgeschlossen` : "Noch keine Entscheidung"}
              />
            </div>

            {/* ── Table ── */}
            <SitesTable sites={sites} />
          </>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

