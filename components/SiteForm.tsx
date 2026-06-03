"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { SiteTemplate } from "@/lib/types";

// Ein einziges exzellentes Template — adaptiert sich automatisch nach Branche
const TEMPLATE: SiteTemplate = "premium";

const CREATE_STEPS = [
  "Website wird analysiert…",
  "Erster Entwurf wird erstellt…",
  "SEO · Kunde · Berater · Marketing prüfen…",
  "Experten-Feedback wird ausgewertet…",
  "Inhalte werden finalisiert…",
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

interface InitialValues {
  company_name?: string;
  industry?: string;
  website?: string;
  phone?: string;
  city?: string;
  address?: string;
}

export default function SiteForm({ initialValues }: { initialValues?: InitialValues }) {
  const router = useRouter();

  const [companyName, setCompanyName]     = useState(initialValues?.company_name ?? "");
  const [industry, setIndustry]           = useState(initialValues?.industry ?? "");
  const [slug, setSlug]                   = useState(initialValues?.company_name ? toSlug(initialValues.company_name) : "");
  const [oldWebsiteUrl, setOldWebsiteUrl] = useState(initialValues?.website ?? "");
  const [phone, setPhone]                 = useState(initialValues?.phone ?? "");
  const [city, setCity]                   = useState(initialValues?.city ?? initialValues?.address ?? "");
  const [notes, setNotes]                 = useState("");
  const [primaryColor, setPrimaryColor]   = useState("#2563eb");
  const template: SiteTemplate           = TEMPLATE;

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
      const res  = await fetch("/api/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, company_name: companyName || undefined }) });
      const data = await res.json();
      if (data.error) { setScrapeMsg({ type: "err", text: "Analyse fehlgeschlagen – bitte manuell ausfüllen." }); return; }

      if (data.title && !companyName)  handleCompanyName(data.title);
      if (data.suggested_industry)     setIndustry(data.suggested_industry);
      if (data.primary_color)          setPrimaryColor(data.primary_color);
      setScrapedCtx(data);
      setScraped(!!data.primary_color);
      const serviceCount   = Array.isArray(data.scraped_services) ? data.scraped_services.length : 0;
      const pairCount      = Array.isArray(data.service_pairs)    ? data.service_pairs.length    : 0;
      const teamCount      = Array.isArray(data.team_members)     ? data.team_members.length     : 0;
      const reviewCount = Array.isArray(data.google_reviews) ? data.google_reviews.length : 0;
      const photoCount  = Array.isArray(data.google_photos)  ? data.google_photos.length  : 0;
      const hints = [
        serviceCount > 0 ? `${serviceCount} Leistungen` : null,
        pairCount    > 0 ? `${pairCount} mit Beschreibung` : null,
        data.primary_color ? "Farbe" : null,
        data.phone         ? "Tel." : null,
        data.opening_hours ? "Öffnungszeiten" : null,
        teamCount    > 0 ? `${teamCount} Teammitgl.` : null,
        photoCount   > 0 ? `${photoCount} echte Fotos` : null,
        data.rating || data.google_rating ? `${data.google_rating ?? data.rating}★` : null,
        reviewCount  > 0 ? `${reviewCount} Google-Rezensionen` : null,
      ].filter(Boolean).join(" · ");
      setScrapeMsg({ type: "ok", text: `✓ Analysiert${hints ? ` — ${hints}` : ""}` });
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

      // Manuell eingegebene Infos als Kontext für die KI aufbauen
      const manualSummary = !oldWebsiteUrl && (phone || city || notes)
        ? [
            `Unternehmensname: "${companyName}"`,
            industry && `Branche: ${industry}`,
            city     && `Standort: ${city}`,
            phone    && `Telefon: ${phone}`,
            notes    && `Hinweise: ${notes}`,
          ].filter(Boolean).join(". ")
        : null;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name:        companyName,
          industry:            industry || scrapedCtx?.suggested_industry,
          description:         scrapedCtx?.description,
          old_website_url:     oldWebsiteUrl || null,
          scraped_headings:      scrapedCtx?.headings,
          scraped_subheadings:   scrapedCtx?.subheadings,
          scraped_services:      scrapedCtx?.scraped_services,
          service_pairs:         scrapedCtx?.service_pairs,
          service_descriptions:  scrapedCtx?.service_descriptions,
          scraped_hero:          scrapedCtx?.hero_text,
          company_summary:       scrapedCtx?.company_summary || manualSummary,
          // Rich new fields
          about_text:          scrapedCtx?.about_text,
          team_members:        scrapedCtx?.team_members,
          opening_hours:       scrapedCtx?.opening_hours,
          rating:              scrapedCtx?.rating,
          trust_signals:       scrapedCtx?.trust_signals,
          insurance_info:      scrapedCtx?.insurance_info,
          area_served:         scrapedCtx?.area_served,
          founding_year:       scrapedCtx?.founding_year,
          faq_items:           scrapedCtx?.faq_items,
          // Contact data for quality score
          phone:               (scrapedCtx?.phone as string) || (!oldWebsiteUrl ? phone : undefined),
          email:               scrapedCtx?.email,
          address:             scrapedCtx?.address,
          logo_url:            scrapedCtx?.logo_url,
          manual_location:     !oldWebsiteUrl ? city   : undefined,
          manual_phone:        !oldWebsiteUrl ? phone  : undefined,
          manual_notes:        !oldWebsiteUrl ? notes  : undefined,
          template,
          // Google Places Daten — echte Kundenstimmen für bessere KI-Texte
          google_reviews:      scrapedCtx?.google_reviews  ?? null,
          google_rating:       scrapedCtx?.google_rating   ?? null,
          google_rating_count: scrapedCtx?.google_rating_count ?? null,
        }),
      });

      clearInterval(stepTimer);
      setStep(CREATE_STEPS.length - 1);

      // Non-JSON-Response abfangen (z.B. Vercel-Timeout gibt plain text zurück)
      let data: Record<string, unknown> = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server-Fehler ${res.status}: Timeout oder interner Fehler. Bitte nochmal versuchen.`);
      }
      if (!res.ok || data.error) throw new Error((data.error as string) || "KI-Generierung fehlgeschlagen.");

      // Slug-Konflikt vermeiden: bei Duplikat automatisch Suffix anhängen
      let baseSlug = slug || toSlug(companyName);
      // Kürzen falls zu lang
      if (baseSlug.length > 60) baseSlug = baseSlug.slice(0, 60).replace(/-+$/, "");
      let finalSlug = baseSlug;
      let attempt = 0;
      while (true) {
        const { data: existing } = await supabase
          .from("sites").select("id").eq("slug", finalSlug).maybeSingle();
        if (!existing) break;
        attempt++;
        finalSlug = `${baseSlug}-${attempt}`;
      }

      const { data: inserted, error: dbError } = await supabase
        .from("sites")
        .insert({
          company_name:    companyName,
          slug:            finalSlug,
          industry:        industry || (scrapedCtx?.suggested_industry as string) || "",
          old_website_url: oldWebsiteUrl || null,
          contact_person:  (scrapedCtx?.contact_person as string) || null,
          phone:           (scrapedCtx?.phone as string) || phone || null,
          whatsapp:        null,
          email:           (scrapedCtx?.email   as string) || null,
          address:         (scrapedCtx?.address as string) || (city ? city : null),
          primary_color:   primaryColor,
          logo_url:        (scrapedCtx?.logo_url as string) || null,
          // Echte Google-Fotos des Unternehmens — Foto 0 = Hero, Foto 1 = About
          hero_image_url:  Array.isArray(scrapedCtx?.google_photos) && (scrapedCtx.google_photos as string[]).length > 0
            ? (scrapedCtx.google_photos as string[])[0] : null,
          about_image_url: Array.isArray(scrapedCtx?.google_photos) && (scrapedCtx.google_photos as string[]).length > 1
            ? (scrapedCtx.google_photos as string[])[1] : null,
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
        <p className="mb-6 text-sm text-gray-500">{companyName}</p>

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

      {/* 3b. Manuelle Infos — nur wenn keine URL eingegeben */}
      {!oldWebsiteUrl && (
        <div className="space-y-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Infos vom Anruf
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="f-phone" className={lbl}>Telefon</label>
              <input
                id="f-phone"
                className={inp}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0541 123456"
                type="tel"
              />
            </div>
            <div>
              <label htmlFor="f-city" className={lbl}>Ort</label>
              <input
                id="f-city"
                className={inp}
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Rostrup"
              />
            </div>
          </div>
          <div>
            <label htmlFor="f-notes" className={lbl}>
              Notiz <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="f-notes"
              className={inp}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="z. B. Familiengeführt, seit 1998, macht auch Catering…"
            />
          </div>
        </div>
      )}

      {/* 4. Color — compact row */}
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
