"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteEditCms from "@/components/SiteEditCms";
import type { Site } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  company_name: string;
  industry: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  maps_url: string | null;
  sources: string[];
  google_rating: number | null;
  google_rating_count: number | null;
  website_score: number | null;
  website_score_notes: string[] | null;
  website_builder: string | null;
  website_has_ssl: boolean | null;
  website_is_mobile: boolean | null;
  website_age_estimate: string | null;
  price_min: number | null;
  price_max: number | null;
  price_reasoning: string | null;
  status: string;
  call_notes: string | null;
  generated_site_id: string | null;
  sale_price: number | null;
  dna: Record<string, unknown> | null;
  contacted_at: string | null;
  won_at: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  neu: "Neu", analysiert: "Analysiert", zu_kontaktieren: "Zu kontaktieren",
  kontaktiert: "Kontaktiert", interessiert: "Interessiert", demo_erstellt: "Demo erstellt",
  angebot: "Angebot", gewonnen: "Gewonnen ✓", verloren: "Verloren",
};

// ─── Haupt-Page ───────────────────────────────────────────────────────────────

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatingDna, setGeneratingDna] = useState(false);
  const [generatingSite, setGeneratingSite] = useState(false);
  const [genStep, setGenStep] = useState(0); // 0=idle 1=scraping 2=generating 3=saving
  const [siteSlug, setSiteSlug] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<Site | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then(r => r.json())
      .then(d => {
        setLead(d.lead);
        setNotes(d.lead?.call_notes ?? "");
        setSalePrice(d.lead?.sale_price?.toString() ?? "");
        setSiteSlug(d.lead?.sites?.slug ?? null);
        const sid = d.lead?.sites?.id ?? null;
        setSiteId(sid);
        setLoading(false);
        if (sid) {
          const { supabase } = await import("@/lib/supabaseClient");
          const { data: site } = await supabase.from("sites").select("*").eq("id", sid).single();
          if (site) setSiteData(site as Site);
        }
      });
  }, [id]);

  async function patch(updates: Partial<Lead>) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const d = await res.json() as { lead?: Lead };
    if (d.lead) setLead(d.lead);
  }

  async function saveNotes() {
    setSaving(true);
    await patch({ call_notes: notes });
    setSaving(false);
  }

  async function saveSalePrice() {
    const price = parseInt(salePrice);
    if (!isNaN(price) && price > 0) {
      await patch({ sale_price: price, status: "gewonnen", won_at: new Date().toISOString() });
    }
  }

  async function analyzeCompany() {
    if (!lead) return;
    setGeneratingDna(true);
    try {
      let scrapedData: Record<string, unknown> = {};
      if (lead.website) {
        const sr = await fetch("/api/scrape", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: lead.website, company_name: lead.company_name }),
        });
        if (sr.ok) scrapedData = await sr.json();
      }

      const ar = await fetch("/api/lead-analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: lead.company_name, industry: lead.industry, city: lead.city,
          website: lead.website, description: scrapedData.description,
          about_text: scrapedData.about_text, scraped_hero: scrapedData.hero_text,
          headings: scrapedData.headings, service_pairs: scrapedData.service_pairs,
          google_reviews: scrapedData.google_reviews,
          google_rating: scrapedData.google_rating ?? lead.google_rating,
          google_rating_count: scrapedData.google_rating_count ?? lead.google_rating_count,
          trust_signals: scrapedData.trust_signals,
        }),
      });
      const { dna } = await ar.json();
      await patch({ dna, status: "zu_kontaktieren" });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGeneratingDna(false);
    }
  }

  async function generateDemoSite() {
    if (!lead) return;
    setGeneratingSite(true);
    setGenStep(1);
    try {
      // Scrape + Generate
      let scrapedData: Record<string, unknown> = {};
      if (lead.website) {
        const sr = await fetch("/api/scrape", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: lead.website, company_name: lead.company_name }),
        });
        if (sr.ok) scrapedData = await sr.json();
      }

      setGenStep(2);
      const gr = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: lead.company_name,
          industry: lead.industry || scrapedData.suggested_industry,
          description: scrapedData.description,
          old_website_url: lead.website,
          scraped_services: scrapedData.scraped_services,
          service_pairs: scrapedData.service_pairs,
          about_text: scrapedData.about_text,
          team_members: scrapedData.team_members,
          opening_hours: scrapedData.opening_hours,
          rating: scrapedData.rating,
          trust_signals: scrapedData.trust_signals,
          faq_items: scrapedData.faq_items,
          phone: lead.phone,
          address: lead.address || lead.city,
          scraped_hero: scrapedData.hero_text,
          google_reviews: scrapedData.google_reviews,
          google_rating: scrapedData.google_rating ?? lead.google_rating,
          google_rating_count: scrapedData.google_rating_count ?? lead.google_rating_count,
          company_dna: lead.dna,
          template: "premium",
        }),
      });

      const genData = await gr.json() as Record<string, unknown>;
      if (!gr.ok) throw new Error((genData.error as string) || "Generierung fehlgeschlagen");

      setGenStep(3);
      // Slug erstellen
      const baseSlug = lead.company_name.toLowerCase()
        .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
        .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0, 60);

      // Site speichern
      const { supabase } = await import("@/lib/supabaseClient");

      let finalSlug = baseSlug;
      let attempt = 0;
      while (true) {
        const { data: ex } = await supabase.from("sites").select("id").eq("slug", finalSlug).maybeSingle();
        if (!ex) break;
        finalSlug = `${baseSlug}-${++attempt}`;
      }

      const { data: site, error: dbErr } = await supabase.from("sites").insert({
        company_name: lead.company_name,
        slug: finalSlug,
        industry: (lead.industry || genData.industry || "Dienstleistung") as string,
        old_website_url: lead.website,
        phone: lead.phone,
        address: lead.address || lead.city,
        primary_color: (scrapedData.primary_color as string) || "#2563eb",
        logo_url: (scrapedData.logo_url as string) || null,
        template: "premium",
        status: "Entwurf",
        hero_headline: genData.hero_headline ?? "",
        hero_subheadline: genData.hero_subheadline ?? "",
        cta_text: genData.cta_text ?? "Jetzt anfragen",
        services: genData.services ?? [],
        benefits: genData.benefits ?? [],
        about_text: genData.about_text ?? null,
        meta_title: genData.meta_title ?? null,
        meta_description: genData.meta_description ?? null,
        ai_content: genData.ai_content ?? null,
        testimonials: genData.testimonials ?? null,
      }).select("id, slug").single();

      if (dbErr || !site) throw new Error(dbErr?.message || "Fehler beim Speichern");

      setSiteSlug(site.slug);
      setSiteId(site.id);
      const { supabase: sb } = await import("@/lib/supabaseClient");
      const { data: fullSite } = await sb.from("sites").select("*").eq("id", site.id).single();
      if (fullSite) setSiteData(fullSite as Site);
      await patch({ generated_site_id: site.id, status: "demo_erstellt" });

    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGeneratingSite(false);
      setGenStep(0);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-sm text-gray-400 animate-pulse">Lead wird geladen…</div>
    </div>
  );

  if (!lead) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-sm text-red-500">Lead nicht gefunden</div>
    </div>
  );

  const dna = lead.dna as Record<string, unknown> | null;
  const scoreColor = (lead.website_score ?? 0) >= 60 ? "text-red-600 bg-red-50" : (lead.website_score ?? 0) >= 40 ? "text-amber-600 bg-amber-50" : "text-green-600 bg-green-50";

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/dashboard/leads" className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
            <span className="text-sm font-medium hidden sm:inline">Leads</span>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900">{lead.company_name}</h1>
              {lead.industry && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">{lead.industry}</span>}
              <select
                value={lead.status}
                onChange={e => patch({ status: e.target.value })}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:outline-none"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-400 flex-wrap">
              {lead.city && <span>📍 {lead.city}</span>}
              {lead.phone && <a href={`tel:${lead.phone}`} className="text-blue-500 hover:underline">📞 {lead.phone}</a>}
              {lead.google_rating && <span className="text-amber-500">★ {lead.google_rating} ({lead.google_rating_count})</span>}
              {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate max-w-[200px]">🌐 {lead.website.replace(/^https?:\/\//,"")}</a>}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LINKE SPALTE ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Website Preview */}
          {lead.website && (
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3">
                <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-red-300"/><div className="h-3 w-3 rounded-full bg-amber-300"/><div className="h-3 w-3 rounded-full bg-green-300"/></div>
                <span className="flex-1 rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-400 truncate">{lead.website}</span>
                {lead.website_score !== null && (
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${scoreColor}`}>
                    Website-Score: {lead.website_score}/100
                  </span>
                )}
              </div>
              <iframe
                src={lead.website}
                className="w-full h-64 border-0"
                sandbox="allow-same-origin"
                loading="lazy"
                title={`${lead.company_name} Website`}
              />
              {lead.website_score_notes && lead.website_score_notes.length > 0 && (
                <div className="border-t border-gray-100 px-5 py-3 space-y-1">
                  {lead.website_score_notes.map((n, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">→</span> {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* KI-Analyse */}
          {!dna ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
              <p className="mb-1 font-medium text-gray-700 text-sm">Noch keine KI-Analyse</p>
              <p className="mb-5 text-xs text-gray-400">Claude analysiert Website, Google Reviews, Tonalität und Positionierung</p>
              <button
                onClick={analyzeCompany}
                disabled={generatingDna}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {generatingDna ? <span className="animate-spin">◌</span> : "✦"}
                {generatingDna ? "Analyse läuft…" : "Unternehmen analysieren"}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">✦ KI-Unternehmens-Analyse</h3>
                <button onClick={analyzeCompany} disabled={generatingDna} className="text-[11px] text-indigo-500 hover:text-indigo-700">
                  {generatingDna ? "…" : "Neu analysieren"}
                </button>
              </div>

              {String(dna.business_identity) && (
                <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Unternehmens-Identität</p>
                <p className="text-sm text-gray-700">{String(dna.business_identity)}</p></div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {!!dna.customer_top_praise && (
                  <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                    <p className="mb-1 text-[10px] font-semibold text-gray-400 uppercase">Was Kunden loben</p>
                    <p className="text-xs text-green-800">{String(dna.customer_top_praise)}</p>
                  </div>
                )}
                {!!dna.biggest_opportunity && (
                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                    <p className="mb-1 text-[10px] font-semibold text-gray-400 uppercase">Größte Chance</p>
                    <p className="text-xs text-amber-800">{String(dna.biggest_opportunity)}</p>
                  </div>
                )}
              </div>

              {(dna.key_phrases as string[] | undefined)?.length && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Ihre Schlüsselbegriffe</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(dna.key_phrases as string[]).map((p, i) => (
                      <span key={i} className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs text-gray-700">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {(dna.unique_differentiators as string[] | undefined)?.length && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Alleinstellungsmerkmale</p>
                  {(dna.unique_differentiators as string[]).map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-700 mb-1">
                      <span className="text-green-500 flex-shrink-0">✓</span> {d}
                    </div>
                  ))}
                </div>
              )}

              {!!dna.recommended_hero_angle && (
                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                  <p className="mb-1 text-[10px] font-semibold text-gray-400 uppercase">Empfohlene Headline-Richtung</p>
                  <p className="text-xs text-indigo-800 font-medium">{String(dna.recommended_hero_angle)}</p>
                </div>
              )}
            </div>
          )}

          {/* Eingebetteter Website-Editor */}
          {siteData && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setEditorOpen(o => !o)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50/60 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">✏️</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Website bearbeiten</p>
                    <p className="text-xs text-gray-400">{siteData.hero_headline || "Demo-Website anpassen"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/site/${siteData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                  >
                    Vorschau ↗
                  </a>
                  <span className={`text-xs font-medium transition ${editorOpen ? "text-gray-400" : "text-blue-600"}`}>
                    {editorOpen ? "Schließen ✕" : "Öffnen →"}
                  </span>
                </div>
              </button>
              {editorOpen && (
                <div className="border-t border-gray-100 px-6 py-6">
                  <SiteEditCms site={siteData} />
                </div>
              )}
            </div>
          )}

          {/* Anruf-Notizen */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-gray-900 text-sm">📞 Anruf-Notizen</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="Gesprächsnotizen, Reaktion, nächste Schritte…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-400 focus:outline-none resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button onClick={saveNotes} disabled={saving}
                className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50">
                {saving ? "Gespeichert ✓" : "Speichern"}
              </button>
            </div>
          </div>
        </div>

        {/* ── RECHTE SPALTE ── */}
        <div className="space-y-5">

          {/* Preis-Einschätzung */}
          {(lead.price_min || lead.price_max) && (
            <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
              <h3 className="mb-3 font-semibold text-gray-900 text-sm">💰 Preis-Einschätzung</h3>
              <div className="text-3xl font-black text-green-700 tabular-nums">
                {lead.price_min?.toLocaleString("de")}–{lead.price_max?.toLocaleString("de")}€
              </div>
              <p className="mt-1 text-xs text-green-600">Empfehlung: {Math.round(((lead.price_min ?? 0) + (lead.price_max ?? 0)) / 2 / 50) * 50}€</p>
              {lead.price_reasoning && (
                <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">{lead.price_reasoning}</p>
              )}
            </div>
          )}

          {/* Demo-Website */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-gray-900 text-sm">🌐 Demo-Website</h3>

            {siteSlug ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
                  <p className="text-xs font-semibold text-green-700">✓ Demo erstellt</p>
                  <a href={`/site/${siteSlug}`} target="_blank" rel="noopener noreferrer"
                    className="mt-1 block text-xs text-green-600 hover:underline truncate">
                    /site/{siteSlug}
                  </a>
                </div>
                {siteId && (
                  <Link
                    href={`/dashboard/${siteId}/edit?from=/dashboard/leads/${id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-700"
                  >
                    ✏️ Website bearbeiten
                  </Link>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/site/${siteSlug}`);
                  }}
                  className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Link kopieren
                </button>
                <button
                  onClick={generateDemoSite}
                  disabled={generatingSite}
                  className="w-full rounded-xl bg-gray-100 py-2.5 text-xs font-medium text-gray-500 transition hover:bg-gray-200 disabled:opacity-50"
                >
                  Neu generieren
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">Website für diesen Lead generieren und als Demo-Link versenden</p>
                {generatingSite ? (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                    {/* Schritte */}
                    <div className="space-y-2">
                      {[
                        { step: 1, label: "Website analysieren" },
                        { step: 2, label: "KI-Inhalte generieren" },
                        { step: 3, label: "Website speichern" },
                      ].map(({ step, label }) => (
                        <div key={step} className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-all ${
                            genStep > step ? "bg-green-500 text-white" :
                            genStep === step ? "bg-gray-900 text-white" :
                            "bg-gray-200 text-gray-400"
                          }`}>
                            {genStep > step ? "✓" : step}
                          </div>
                          <span className={`text-xs transition-colors ${
                            genStep > step ? "text-green-600 line-through" :
                            genStep === step ? "text-gray-900 font-medium" :
                            "text-gray-400"
                          }`}>{label}</span>
                          {genStep === step && <span className="text-gray-400 animate-pulse text-xs">…</span>}
                        </div>
                      ))}
                    </div>
                    {/* Fortschrittsbalken */}
                    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-900 transition-all duration-700 ease-out"
                        style={{ width: `${genStep === 1 ? 15 : genStep === 2 ? 50 : genStep === 3 ? 85 : 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 text-center">Dauert ~30–60 Sekunden</p>
                  </div>
                ) : (
                  <button
                    onClick={generateDemoSite}
                    className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    ✦ Demo-Website erstellen
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Verkaufspreis eintragen */}
          {lead.status !== "verloren" && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-semibold text-gray-900 text-sm">✓ Verkauft?</h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                  <input
                    type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)}
                    placeholder={`${Math.round(((lead.price_min ?? 1000) + (lead.price_max ?? 2000)) / 2 / 50) * 50}`}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-7 pr-3 py-2.5 text-sm focus:bg-white focus:border-gray-400 focus:outline-none"
                  />
                </div>
                <button onClick={saveSalePrice} className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700">
                  Gewonnen
                </button>
              </div>
              {lead.sale_price && (
                <p className="mt-2 text-xs text-green-600 font-semibold">✓ Verkauft für {lead.sale_price.toLocaleString("de")}€</p>
              )}
            </div>
          )}

          {/* Aktionen */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <h3 className="mb-3 font-semibold text-gray-900 text-sm">Aktionen</h3>
            {lead.phone && (
              <a href={`tel:${lead.phone}`}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                📞 <span>{lead.phone}</span>
              </a>
            )}
            {lead.maps_url && (
              <a href={lead.maps_url} target="_blank" rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                🗺️ <span>Google Maps öffnen</span>
              </a>
            )}
            {lead.website && (
              <a href={lead.website} target="_blank" rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50">
                🌐 <span>Aktuelle Website</span>
              </a>
            )}
            <button
              onClick={async () => {
                if (confirm("Lead löschen?")) {
                  await fetch(`/api/leads/${id}`, { method: "DELETE" });
                  router.push("/dashboard/leads");
                }
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-red-100 px-4 py-3 text-sm text-red-500 transition hover:bg-red-50"
            >
              🗑️ <span>Lead löschen</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
