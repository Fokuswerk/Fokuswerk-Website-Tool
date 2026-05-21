"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { SiteTemplate } from "@/lib/types";

// ─── Active templates (local + minimal hidden) ────────────────────────────────
const TEMPLATE_LABELS: Record<SiteTemplate, string> = {
  premium:          "Standard",
  "arzt-modern":    "Arzt · Modern",
  arzt:             "Arzt · Klassisch",
  handwerk:         "Handwerk · Modern",
  "handwerk-lokal": "Handwerk · Klassisch",
  local:            "Local",    // hidden
  minimal:          "Minimal",  // hidden
};

const ACTIVE_TEMPLATES: SiteTemplate[] = [
  "premium", "arzt-modern", "arzt", "handwerk", "handwerk-lokal",
];

type Sector = "arzt" | "handwerk" | null;
type Variant = "modern" | "klassisch";

const SECTOR_TEMPLATES: Record<"arzt" | "handwerk", Record<Variant, SiteTemplate>> = {
  arzt:     { modern: "arzt-modern",    klassisch: "arzt"           },
  handwerk: { modern: "handwerk",       klassisch: "handwerk-lokal" },
};

function detectSector(industry: string): Sector {
  const q = (industry || "").toLowerCase();
  if (q.match(/arzt|zahnarzt|praxis|klinik|medizin|orthopäd|derm|kardio|psycho|therapeut|psychiatr|augenarzt|hausarzt|frauenarzt|hno|chirurg/))
    return "arzt";
  if (q.match(/handwerk|sanitär|elektro|maler|dachdeck|bau|installateur|tischler|schlosser|klempner|heizung|kfz|zimmerer|fliesenleger|garten|reinigung/))
    return "handwerk";
  return null;
}

const CREATE_STEPS = [
  "Website wird analysiert…",
  "Branche wird erkannt…",
  "Texte werden erstellt…",
  "Leistungen werden aufbereitet…",
  "SEO wird generiert…",
  "Qualitätscheck läuft…",
  "Website wird gespeichert…",
];

function toSlug(v: string) {
  return v.toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const inp = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20";
const lbl = "block text-sm font-medium text-gray-800 mb-1.5";

export default function SiteForm() {
  const router = useRouter();

  const [companyName, setCompanyName]     = useState("");
  const [industry, setIndustry]           = useState("");
  const [slug, setSlug]                   = useState("");
  const [oldWebsiteUrl, setOldWebsiteUrl] = useState("");
  const [primaryColor, setPrimaryColor]   = useState("#2563eb");
  const [template, setTemplate]           = useState<SiteTemplate>("premium");
  const [variant, setVariant]             = useState<Variant>("modern");

  const [scraping, setScraping]     = useState(false);
  const [scraped, setScraped]       = useState(false);
  const [scrapeMsg, setScrapeMsg]   = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [scrapedCtx, setScrapedCtx] = useState<Record<string, unknown> | null>(null);
  const scrapeTimer                 = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [creating, setCreating] = useState(false);
  const [step, setStep]         = useState(0);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [savedId, setSavedId]     = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [copyDone, setCopyDone]   = useState(false);

  // Re-derive template whenever industry or variant changes
  useEffect(() => {
    const sector = detectSector(industry);
    if (sector) {
      setTemplate(SECTOR_TEMPLATES[sector][variant]);
    } else {
      setTemplate("premium");
    }
  }, [industry, variant]);

  // Auto-scrape 1 s after URL typed
  useEffect(() => {
    if (!oldWebsiteUrl) return;
    clearTimeout(scrapeTimer.current);
    scrapeTimer.current = setTimeout(() => runScrape(oldWebsiteUrl), 1000);
    return () => clearTimeout(scrapeTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldWebsiteUrl]);

  function handleCompanyName(v: string) {
    setCompanyName(v);
    setSlug(toSlug(v));
  }

  async function runScrape(url: string) {
    setScraping(true);
    setScrapeMsg(null);
    try {
      const res  = await fetch("/api/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (data.error) { setScrapeMsg({ type: "err", text: "Analyse fehlgeschlagen – bitte manuell ausfüllen." }); return; }

      if (data.title && !companyName)  handleCompanyName(data.title);
      if (data.suggested_industry)     setIndustry(data.suggested_industry);
      if (data.primary_color)          setPrimaryColor(data.primary_color);
      setScrapedCtx(data);
      setScraped(!!data.primary_color);
      const hints = [
        data.suggested_industry,
        data.primary_color ? `Farbe erkannt` : null,
        data.phone ? "Telefon erkannt" : null,
      ].filter(Boolean).join(" · ");
      setScrapeMsg({ type: "ok", text: `✓ Analysiert${hints ? ` · ${hints}` : ""}` });
    } catch {
      setScrapeMsg({ type: "err", text: "Analyse fehlgeschlagen." });
    } finally {
      setScraping(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName) { setError("Bitte Unternehmensnamen eingeben."); return; }
    setCreating(true);
    setError(null);
    setStep(0);

    const stepTimer = setInterval(() => setStep(s => Math.min(s + 1, CREATE_STEPS.length - 2)), 2200);

    try {
      if (oldWebsiteUrl && !scraped) await runScrape(oldWebsiteUrl);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name:        companyName,
          industry:            industry || scrapedCtx?.suggested_industry,
          description:         scrapedCtx?.company_summary,
          old_website_url:     oldWebsiteUrl || null,
          scraped_headings:    scrapedCtx?.headings,
          scraped_subheadings: scrapedCtx?.subheadings,
          scraped_hero:        scrapedCtx?.hero_text,
          company_summary:     scrapedCtx?.company_summary,
          template,
        }),
      });

      clearInterval(stepTimer);
      setStep(CREATE_STEPS.length - 1);

      if (!res.ok) throw new Error("KI-Generierung fehlgeschlagen.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const finalSlug = slug || toSlug(companyName);
      const { data: inserted, error: dbError } = await supabase
        .from("sites")
        .insert({
          company_name:    companyName,
          slug:            finalSlug,
          industry:        industry || (scrapedCtx?.suggested_industry as string) || "",
          old_website_url: oldWebsiteUrl || null,
          contact_person:  (scrapedCtx?.contact_person as string) || null,
          phone:           (scrapedCtx?.phone          as string) || null,
          whatsapp:        null,
          email:           (scrapedCtx?.email          as string) || null,
          address:         (scrapedCtx?.address        as string) || null,
          primary_color:   primaryColor,
          logo_url:        (scrapedCtx?.logo_url       as string) || null,
          template,
          status:          "Entwurf",
          hero_headline:    data.hero_headline    ?? "",
          hero_subheadline: data.hero_subheadline ?? "",
          cta_text:         data.cta_text         ?? "Jetzt anfragen",
          services:         data.services         ?? [],
          benefits:         data.benefits         ?? [],
          about_text:       data.about_text       ?? null,
          meta_title:       data.meta_title       ?? null,
          meta_description: data.meta_description ?? null,
          ai_content:       data.ai_content       ?? null,
          testimonials:     data.testimonials     ?? null,
        })
        .select("id")
        .single();

      if (dbError) throw new Error(dbError.message);
      setSavedSlug(finalSlug);
      setSavedId(inserted?.id ?? null);
    } catch (err) {
      setError((err as Error).message || "Fehler beim Erstellen.");
    } finally {
      clearInterval(stepTimer);
      setCreating(false);
    }
  }

  function handleCopyLink() {
    if (!savedSlug) return;
    navigator.clipboard.writeText(`${window.location.origin}/site/${savedSlug}`).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2500);
    });
  }

  function getMailtoLink() {
    if (!savedSlug || typeof window === "undefined") return "#";
    const link = `${window.location.origin}/site/${savedSlug}`;
    const subject = encodeURIComponent(`Ihre Demo-Website – ${companyName}`);
    const body = encodeURIComponent(
      `Guten Tag,\n\nwie besprochen habe ich eine Demo-Website für Sie erstellt – schauen Sie gerne mal rein:\n\n${link}\n\nIch freue mich auf Ihr Feedback und melde mich in Kürze bei Ihnen.\n\nMit freundlichen Grüßen`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  }

  const sector = detectSector(industry);

  // ── Success screen ───────────────────────────────────────────────────────────
  if (savedSlug) {
    const siteUrl = typeof window !== "undefined" ? `${window.location.origin}/site/${savedSlug}` : `/site/${savedSlug}`;
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="mb-1 text-2xl font-bold text-gray-900">Website erstellt!</h2>
        <p className="mb-1 text-sm text-gray-500">{companyName}</p>
        <p className="mb-6 text-xs text-gray-400">{TEMPLATE_LABELS[template]}</p>

        {/* Link display */}
        <div className="mb-6 w-full max-w-sm truncate rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-mono text-xs text-gray-500">
          {siteUrl}
        </div>

        <div className="flex w-full max-w-sm flex-col gap-2.5">
          {/* Mail — primary CTA */}
          <a
            href={getMailtoLink()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            <MailIcon className="h-4 w-4" />
            Per Mail versenden
          </a>

          {/* Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3.5 text-sm font-semibold transition ${
              copyDone
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {copyDone ? "✓ Link kopiert!" : "Link kopieren"}
          </button>

          {/* Preview */}
          <a
            href={`/site/${savedSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            Vorschau ansehen →
          </a>

          {savedId && (
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${savedId}/edit`)}
              className="rounded-xl border border-gray-200 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              Inhalte anpassen
            </button>
          )}

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="py-3 text-xs text-gray-400 transition hover:text-gray-600"
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleCreate} className="space-y-6">

      {/* 1. URL */}
      <div>
        <label htmlFor="f-url" className={lbl}>
          Bestehende Website{" "}
          <span className="font-normal text-gray-400">(optional – wird automatisch analysiert)</span>
        </label>
        <div className="relative flex items-center">
          <input
            id="f-url"
            className={`${inp} pr-10`}
            value={oldWebsiteUrl}
            onChange={e => setOldWebsiteUrl(e.target.value)}
            placeholder="https://alte-seite.de"
            type="url"
          />
          {scraping && <span className="absolute right-3 text-gray-400"><Spinner /></span>}
        </div>
        {scrapeMsg && (
          <p className={`mt-1.5 text-xs font-medium ${scrapeMsg.type === "ok" ? "text-green-700" : "text-amber-600"}`}>
            {scrapeMsg.text}
          </p>
        )}
      </div>

      {/* 2. Company name */}
      <div>
        <label htmlFor="f-name" className={lbl}>Unternehmensname *</label>
        <input
          id="f-name"
          required
          className={inp}
          value={companyName}
          onChange={e => handleCompanyName(e.target.value)}
          placeholder="Zahnarztpraxis Müller"
        />
      </div>

      {/* 3. Industry — drives template auto-selection */}
      <div>
        <label htmlFor="f-industry" className={lbl}>Branche *</label>
        <input
          id="f-industry"
          required
          className={inp}
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          placeholder="z. B. Zahnarztpraxis, Elektriker, Maler…"
        />
      </div>

      {/* 4. Template — auto-suggested, minimal UI */}
      <div>
        <label className={lbl}>Template</label>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">{TEMPLATE_LABELS[template]}</p>
              <p className="text-xs text-gray-400">
                {sector === "arzt"     && "Optimiert für Arztpraxen"}
                {sector === "handwerk" && "Optimiert für Handwerksbetriebe"}
                {!sector               && "Universell – für alle anderen Branchen"}
              </p>
            </div>
            {/* Modern / Klassisch toggle — only shown for sector-specific templates */}
            {sector && (
              <div className="flex flex-shrink-0 rounded-full border border-gray-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setVariant("modern")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    variant === "modern" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Modern
                </button>
                <button
                  type="button"
                  onClick={() => setVariant("klassisch")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    variant === "klassisch" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Klassisch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Manual override — collapsed by default */}
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer select-none text-gray-400 hover:text-gray-600">
            Manuell wählen
          </summary>
          <div className="mt-2 grid grid-cols-1 gap-1.5">
            {ACTIVE_TEMPLATES.map(id => (
              <button
                key={id}
                type="button"
                onClick={() => setTemplate(id)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  template === id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{TEMPLATE_LABELS[id]}</span>
                {template === id && <span className="text-xs opacity-60">✓</span>}
              </button>
            ))}
          </div>
        </details>
      </div>

      {/* 5. Color — compact row */}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={primaryColor}
          onChange={e => setPrimaryColor(e.target.value)}
          className="h-10 w-10 flex-shrink-0 cursor-pointer rounded-lg border border-gray-200 p-1"
          title="Primärfarbe"
        />
        <div>
          <p className="text-sm font-medium text-gray-800">Primärfarbe</p>
          <p className="text-xs text-gray-400">
            {scraped ? "✓ Automatisch erkannt" : oldWebsiteUrl ? "Nicht erkannt – bitte anpassen" : "Bitte anpassen"} · {primaryColor}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      {creating ? (
        <div className="flex items-center gap-4 rounded-2xl bg-gray-900 px-7 py-5">
          <Spinner className="h-5 w-5 text-white" />
          <div>
            <p className="text-sm font-semibold text-white">{CREATE_STEPS[step]}</p>
            <div className="mt-2 flex gap-1">
              {CREATE_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-white" : "bg-white/20"}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="submit"
          className="w-full rounded-xl bg-gray-900 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Website automatisch erstellen →
        </button>
      )}
    </form>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
