"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Site, SiteTemplate, SiteStatus, ServiceItem, TestimonialItem, AIContent } from "@/lib/types";

type SectionId = "hero" | "services" | "about" | "testimonials" | "design" | "contact" | "seo" | "legal";
type SaveFn = (updates: Partial<Site>) => Promise<boolean>;

interface SectionProps { site: Site; editing: SectionId | null; onEdit: (id: SectionId | null) => void; onSave: SaveFn; }

const inp = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const lbl = "block text-sm font-medium text-gray-700 mb-1.5";
const STATUS_OPTIONS: SiteStatus[] = ["Entwurf", "Gesendet", "Interessiert", "Gewonnen", "Abgelehnt"];
const TEMPLATES: { id: SiteTemplate; label: string; desc: string; group: string }[] = [
  // Arztpraxis
  { id: "arzt",        label: "Praxis Vertrauen",  desc: "Split-Hero, Team, Öffnungszeiten — warm",   group: "🏥 Arztpraxis" },
  { id: "arzt-modern", label: "Praxis Excellence", desc: "Dark Hero, Technik-Highlights, Premium",    group: "🏥 Arztpraxis" },
  // Handwerk
  { id: "handwerk",        label: "Handwerk Stark", desc: "Bold Hero, Galerie, Notfallband",           group: "🔧 Handwerk" },
  { id: "handwerk-lokal",  label: "Handwerk Lokal", desc: "Familienbetrieb-Feel, Ausbildung",          group: "🔧 Handwerk" },
  // Universal
  { id: "premium",  label: "Premium",  desc: "Dark Hero, elegant, universal",     group: "⚙️ Universal" },
  { id: "local",    label: "Local",    desc: "Farbiger Split-Hero, lokal",        group: "⚙️ Universal" },
  { id: "minimal",  label: "Minimal",  desc: "Weißer Hintergrund, clean",        group: "⚙️ Universal" },
];

// ── Section wrapper ──────────────────────────────────────────────────────────

function SectionCard({
  id, title, icon, editing, onEdit, preview, children, saving,
}: {
  id: SectionId; title: string; icon: string; editing: SectionId | null;
  onEdit: (id: SectionId | null) => void; preview: React.ReactNode; children: React.ReactNode; saving?: boolean;
}) {
  const isOpen = editing === id;
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => onEdit(isOpen ? null : id)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-gray-50/60"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg leading-none">{icon}</span>
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        <span className={`text-xs font-medium transition ${isOpen ? "text-gray-400" : "text-blue-600"}`}>
          {isOpen ? "Schließen ✕" : "Bearbeiten →"}
        </span>
      </button>

      {!isOpen && (
        <div className="border-t border-gray-50 px-6 pb-4 pt-3 text-sm text-gray-500">{preview}</div>
      )}
      {isOpen && (
        <div className="border-t border-gray-100 px-6 py-6">
          {children}
          {saving && <p className="mt-4 text-xs text-gray-400">Speichern…</p>}
        </div>
      )}
    </div>
  );
}

function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
    >
      {saving ? "Speichern…" : "Änderungen speichern"}
    </button>
  );
}

// ── Image upload component ────────────────────────────────────────────────────

function ImageUpload({
  value,
  onChange,
  siteId,
  label,
  placeholder = "https://images.unsplash.com/...",
}: {
  value: string;
  onChange: (url: string) => void;
  siteId: string;
  label: string;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type & size (max 5 MB)
    if (!file.type.startsWith("image/")) { setUploadError("Nur Bilder erlaubt."); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError("Max. 5 MB."); return; }

    setUploading(true);
    setUploadError(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${siteId}/${Date.now()}.${ext}`;

      // Try upload — if bucket missing, create it first then retry once
      let uploadResult = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
      if (uploadResult.error?.message?.toLowerCase().includes("bucket")) {
        await supabase.storage.createBucket("site-images", { public: true, fileSizeLimit: 5242880 });
        uploadResult = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
      }
      if (uploadResult.error) throw uploadResult.error;

      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      const msg = (err as Error).message || "";
      if (msg.toLowerCase().includes("bucket") || msg.toLowerCase().includes("not found")) {
        setUploadError("Storage-Bucket fehlt. Bitte in Supabase → Storage → neuen Bucket 'site-images' (Public) erstellen, dann erneut versuchen.");
      } else {
        setUploadError(msg || "Upload fehlgeschlagen.");
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label className={lbl}>
        {label} <span className="font-normal text-gray-400">(leer = automatisch)</span>
      </label>

      {/* Image preview */}
      {value && (
        <div className="mb-2 flex items-center gap-3">
          <img src={value} alt="" className="h-16 w-24 rounded-xl object-cover ring-1 ring-gray-200" />
          <button type="button" onClick={() => onChange("")} className="text-xs text-red-400 hover:text-red-600">
            Entfernen ✕
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {/* URL input */}
        <input
          className={`${inp} flex-1`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
          {uploading ? "Lädt…" : "Hochladen"}
        </button>
      </div>

      {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Hero section ─────────────────────────────────────────────────────────────

function HeroSection({ site, editing, onEdit, onSave }: SectionProps) {
  const [headline, setHeadline] = useState(site.hero_headline);
  const [subheadline, setSubheadline] = useState(site.hero_subheadline);
  const [ctaText, setCtaText] = useState(site.cta_text);
  const [heroImageUrl, setHeroImageUrl] = useState(site.hero_image_url ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave({ hero_headline: headline, hero_subheadline: subheadline, cta_text: ctaText, hero_image_url: heroImageUrl || null });
    setSaving(false);
  }

  return (
    <SectionCard id="hero" title="Hero-Bereich" icon="🎯" editing={editing} onEdit={onEdit} saving={saving}
      preview={<p className="truncate font-medium text-gray-800">{site.hero_headline}</p>}
    >
      <div className="space-y-4">
        <div>
          <label className={lbl}>Headline</label>
          <input className={inp} value={headline} onChange={e => setHeadline(e.target.value)} />
        </div>
        <div>
          <label className={lbl}>Subheadline</label>
          <textarea rows={2} className={inp} value={subheadline} onChange={e => setSubheadline(e.target.value)} />
        </div>
        <div>
          <label className={lbl}>CTA-Button Text</label>
          <input className={inp} value={ctaText} onChange={e => setCtaText(e.target.value)} />
        </div>
        <ImageUpload
          siteId={site.id}
          label="Hintergrundbild"
          value={heroImageUrl}
          onChange={setHeroImageUrl}
        />
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  );
}

// ── Services section ──────────────────────────────────────────────────────────

function ServicesSection({ site, editing, onEdit, onSave }: SectionProps) {
  const aiContent = site.ai_content as AIContent;
  const aiServices = aiContent?.services_detailed;
  const initial: ServiceItem[] = aiServices?.length
    ? aiServices
    : (site.services || []).map(s => ({ title: s, description: "" }));
  const [services, setServices] = useState<ServiceItem[]>(initial.length ? initial : [{ title: "", description: "" }]);
  const [serviceImages, setServiceImages] = useState<string[]>(aiContent?.service_images ?? []);
  const [saving, setSaving] = useState(false);

  function update(i: number, field: keyof ServiceItem, val: string) {
    setServices(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  }
  function updateImage(i: number, url: string) {
    setServiceImages(prev => {
      const next = [...prev];
      next[i] = url;
      return next;
    });
  }
  function addRow() { setServices(prev => [...prev, { title: "", description: "" }]); }
  function removeRow(i: number) {
    setServices(prev => prev.filter((_, idx) => idx !== i));
    setServiceImages(prev => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    const filled = services.filter(s => s.title);
    const cleanImages = serviceImages.filter(Boolean);
    const newAi: AIContent = {
      ...(site.ai_content || {}),
      services_detailed: filled,
      service_images: cleanImages.length ? cleanImages : undefined,
    };
    await onSave({ ai_content: newAi, services: filled.map(s => s.title) });
    setSaving(false);
  }

  return (
    <SectionCard id="services" title="Leistungen" icon="⚙️" editing={editing} onEdit={onEdit} saving={saving}
      preview={
        <div className="flex flex-wrap gap-1.5">
          {(aiServices?.length ? aiServices : (site.services || [])).slice(0, 4).map((s, i) => (
            <span key={i} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
              {typeof s === "string" ? s : (s as ServiceItem).title}
            </span>
          ))}
          {(aiServices?.length ?? site.services?.length ?? 0) > 4 && (
            <span className="text-xs text-gray-400">+{(aiServices?.length ?? site.services?.length ?? 0) - 4} weitere</span>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {services.map((s, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Leistung {i + 1}</span>
              {services.length > 1 && (
                <button type="button" onClick={() => removeRow(i)} className="text-xs text-red-400 hover:text-red-600">Entfernen</button>
              )}
            </div>
            <div className="space-y-3">
              <input className={inp} placeholder="Titel" value={s.title} onChange={e => update(i, "title", e.target.value)} />
              <textarea rows={2} className={inp} placeholder="Beschreibung" value={s.description} onChange={e => update(i, "description", e.target.value)} />
              <ImageUpload
                siteId={site.id}
                label="Bild für diese Leistung"
                value={serviceImages[i] ?? ""}
                onChange={url => updateImage(i, url)}
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={addRow} className="text-sm text-blue-600 hover:text-blue-800">+ Leistung hinzufügen</button>
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  );
}

// ── About section ─────────────────────────────────────────────────────────────

function AboutSection({ site, editing, onEdit, onSave }: SectionProps) {
  const [aboutText, setAboutText] = useState(site.about_text ?? "");
  const [aboutImageUrl, setAboutImageUrl] = useState(site.about_image_url ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave({ about_text: aboutText || null, about_image_url: aboutImageUrl || null });
    setSaving(false);
  }

  return (
    <SectionCard id="about" title="Über uns" icon="🏢" editing={editing} onEdit={onEdit} saving={saving}
      preview={site.about_text
        ? <p className="line-clamp-2">{site.about_text}</p>
        : <span className="italic text-gray-400">Kein Text hinterlegt</span>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={lbl}>Über-uns-Text</label>
          <textarea rows={6} className={inp} value={aboutText} onChange={e => setAboutText(e.target.value)} placeholder="Beschreiben Sie Ihr Unternehmen…" />
        </div>
        <ImageUpload
          siteId={site.id}
          label="Über-uns Bild"
          value={aboutImageUrl}
          onChange={setAboutImageUrl}
        />
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  );
}

// ── Testimonials section ──────────────────────────────────────────────────────

const DEFAULT_T: TestimonialItem[] = [
  { name: "Michael S.", role: "Zufriedener Kunde", text: "Absolut professionell und zuverlässig. Die Arbeit wurde pünktlich und in hervorragender Qualität erledigt. Sehr empfehlenswert!" },
  { name: "Sandra K.", role: "Kundin seit 2 Jahren", text: "Von der ersten Kontaktaufnahme bis zum Abschluss war alles einwandfrei. Kompetente Beratung, faire Preise und ein tolles Ergebnis." },
  { name: "Thomas B.", role: "Stammkunde", text: "Schnelle Reaktion und immer freundlich – genau so stellt man sich einen zuverlässigen Partner vor. Klare Empfehlung!" },
];

function TestimonialsSection({ site, editing, onEdit, onSave }: SectionProps) {
  // Priority: saved testimonials → AI-generated (from ai_content) → generic defaults
  const aiGenerated = (site.ai_content as AIContent)?.testimonials;
  const init = site.testimonials?.length === 3
    ? site.testimonials
    : (aiGenerated?.length === 3 ? aiGenerated : DEFAULT_T);
  const [items, setItems] = useState<TestimonialItem[]>(init);
  const [saving, setSaving] = useState(false);

  function update(i: number, field: keyof TestimonialItem, val: string) {
    setItems(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  }

  async function save() {
    setSaving(true);
    await onSave({ testimonials: items });
    setSaving(false);
  }

  return (
    <SectionCard id="testimonials" title="Kundenstimmen" icon="⭐" editing={editing} onEdit={onEdit} saving={saving}
      preview={
        <div className="flex gap-4">
          {items.map((t, i) => <span key={i} className="text-xs text-gray-600">„{t.text.slice(0, 40)}…" — {t.name}</span>)}
        </div>
      }
    >
      <div className="space-y-5">
        {items.map((t, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Bewertung {i + 1}</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={lbl}>Name</label>
                <input className={inp} value={t.name} onChange={e => update(i, "name", e.target.value)} placeholder="Maria M." />
              </div>
              <div>
                <label className={lbl}>Rolle / Kontext</label>
                <input className={inp} value={t.role} onChange={e => update(i, "role", e.target.value)} placeholder="Patientin seit 2 Jahren" />
              </div>
            </div>
            <div>
              <label className={lbl}>Bewertungstext</label>
              <textarea rows={3} className={inp} value={t.text} onChange={e => update(i, "text", e.target.value)} />
            </div>
          </div>
        ))}
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  );
}

// ── Design section ────────────────────────────────────────────────────────────

function DesignSection({ site, editing, onEdit, onSave }: SectionProps) {
  const [template, setTemplate] = useState<SiteTemplate>(site.template ?? "premium");
  const [color, setColor] = useState(site.primary_color ?? "#2563eb");
  const [logoUrl, setLogoUrl] = useState(site.logo_url ?? "");
  const [status, setStatus] = useState<SiteStatus>(site.status);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave({ template, primary_color: color, logo_url: logoUrl || null, status });
    setSaving(false);
  }

  return (
    <SectionCard id="design" title="Design & Status" icon="🎨" editing={editing} onEdit={onEdit} saving={saving}
      preview={
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: site.primary_color }} />
            <span>{site.primary_color}</span>
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize">{site.template}</span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs">{site.status}</span>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <label className={lbl}>Template</label>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map(t => (
              <button key={t.id} type="button" onClick={() => setTemplate(t.id)}
                className={`rounded-xl border-2 p-3 text-left transition ${template === t.id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 hover:border-gray-300"}`}
              >
                <p className={`text-sm font-semibold ${template === t.id ? "text-white" : "text-gray-900"}`}>{t.label}</p>
                <p className={`mt-0.5 text-xs ${template === t.id ? "text-white/70" : "text-gray-500"}`}>{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={lbl}>Primärfarbe</label>
          <div className="flex gap-3">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-gray-200 p-1" />
            <input className={`${inp} flex-1`} value={color} onChange={e => setColor(e.target.value)} />
          </div>
        </div>
        <ImageUpload
          siteId={site.id}
          label="Logo"
          value={logoUrl}
          onChange={setLogoUrl}
          placeholder="https://..."
        />
        <div>
          <label className={lbl}>Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${status === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >{s}</button>
            ))}
          </div>
        </div>
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  );
}

// ── Contact section ───────────────────────────────────────────────────────────

function ContactSection({ site, editing, onEdit, onSave }: SectionProps) {
  const [phone, setPhone] = useState(site.phone ?? "");
  const [email, setEmail] = useState(site.email ?? "");
  const [address, setAddress] = useState(site.address ?? "");
  const [whatsapp, setWhatsapp] = useState(site.whatsapp ?? "");
  const [contactPerson, setContactPerson] = useState(site.contact_person ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave({ phone: phone || null, email: email || null, address: address || null, whatsapp: whatsapp || null, contact_person: contactPerson || null });
    setSaving(false);
  }

  return (
    <SectionCard id="contact" title="Kontaktdaten" icon="📞" editing={editing} onEdit={onEdit} saving={saving}
      preview={
        <div className="flex gap-4 text-sm">
          {site.phone && <span>{site.phone}</span>}
          {site.email && <span>{site.email}</span>}
          {site.address && <span className="truncate max-w-xs">{site.address}</span>}
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={lbl}>Ansprechpartner</label>
          <input className={inp} value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Max Müller" />
        </div>
        <div>
          <label className={lbl}>Telefon</label>
          <input type="tel" className={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+49 89 123456" />
        </div>
        <div>
          <label className={lbl}>E-Mail</label>
          <input type="email" className={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="info@firma.de" />
        </div>
        <div>
          <label className={lbl}>WhatsApp</label>
          <input type="tel" className={inp} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+49 170 123456" />
        </div>
        <div className="sm:col-span-2">
          <label className={lbl}>Adresse</label>
          <input className={inp} value={address} onChange={e => setAddress(e.target.value)} placeholder="Musterstraße 1, 80331 München" />
        </div>
        <div className="sm:col-span-2">
          <SaveBtn onClick={save} saving={saving} />
        </div>
      </div>
    </SectionCard>
  );
}

// ── SEO section ───────────────────────────────────────────────────────────────

function SeoSection({ site, editing, onEdit, onSave }: SectionProps) {
  const [metaTitle, setMetaTitle] = useState(site.meta_title ?? "");
  const [metaDesc, setMetaDesc] = useState(site.meta_description ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave({ meta_title: metaTitle || null, meta_description: metaDesc || null });
    setSaving(false);
  }

  return (
    <SectionCard id="seo" title="SEO & Meta-Tags" icon="🔍" editing={editing} onEdit={onEdit} saving={saving}
      preview={
        <div>
          <p className="font-medium text-gray-800 truncate">{site.meta_title || <span className="italic text-gray-400">Kein Titel</span>}</p>
          {site.meta_description && <p className="mt-0.5 truncate text-xs">{site.meta_description}</p>}
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={lbl}>Meta Title</label>
          <input className={inp} value={metaTitle} onChange={e => setMetaTitle(e.target.value)} />
          <p className={`mt-1 text-xs ${metaTitle.length > 60 ? "text-red-500" : "text-gray-400"}`}>{metaTitle.length}/60</p>
        </div>
        <div>
          <label className={lbl}>Meta Description</label>
          <textarea rows={3} className={inp} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} />
          <p className={`mt-1 text-xs ${metaDesc.length > 155 ? "text-red-500" : "text-gray-400"}`}>{metaDesc.length}/155</p>
        </div>
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  );
}

// ── Legal section ─────────────────────────────────────────────────────────────

function LegalSection({ site, editing, onEdit, onSave }: SectionProps) {
  const [agbText, setAgbText] = useState(site.agb_text ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave({ agb_text: agbText || null });
    setSaving(false);
  }

  return (
    <SectionCard id="legal" title="AGB" icon="📄" editing={editing} onEdit={onEdit} saving={saving}
      preview={
        agbText
          ? <p className="line-clamp-1 text-xs">{agbText.slice(0, 80)}…</p>
          : <span className="text-xs italic text-gray-400">Standard-AGB aktiv</span>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-500">Leer lassen = globale Standard-AGB. Markdown wird unterstützt (<code className="rounded bg-gray-100 px-1">##</code> für Abschnitte, <code className="rounded bg-gray-100 px-1">{"{company_name}"}</code> wird ersetzt).</p>
        <textarea rows={12} className={inp} value={agbText} onChange={e => setAgbText(e.target.value)}
          placeholder={"# Allgemeine Geschäftsbedingungen\n\n## §1 Geltungsbereich\n…"} />
        <SaveBtn onClick={save} saving={saving} />
      </div>
    </SectionCard>
  );
}

// ── Regenerate section ────────────────────────────────────────────────────────

function RegenerateCard({ site }: { site: Site }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRegenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: site.company_name,
          industry: site.industry,
          old_website_url: site.old_website_url,
          template: site.template,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Fehler");
      await supabase.from("sites").update({
        hero_headline: data.hero_headline,
        hero_subheadline: data.hero_subheadline,
        cta_text: data.cta_text,
        services: data.services ?? [],
        benefits: data.benefits ?? [],
        about_text: data.about_text,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        ai_content: data.ai_content,
      }).eq("id", site.id);
      setDone(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-800">KI-Inhalte neu generieren</p>
        <p className="text-xs text-gray-500 mt-0.5">Überschreibt Headlines, Leistungen, Über-uns und Meta-Tags mit frischen KI-Inhalten.</p>
        {done && <p className="mt-1 text-xs font-medium text-green-600">✓ Inhalte aktualisiert</p>}
        {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
      </div>
      <button type="button" onClick={handleRegenerate} disabled={loading}
        className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50">
        {loading ? "Generiere…" : "Neu generieren"}
      </button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function SiteEditCms({ site }: { site: Site }) {
  const [editing, setEditing] = useState<SectionId | null>(null);
  const [siteData, setSiteData] = useState(site);
  const router = useRouter();

  async function saveSection(updates: Partial<Site>): Promise<boolean> {
    const { error } = await supabase.from("sites").update(updates).eq("id", siteData.id);
    if (!error) {
      setSiteData(prev => ({ ...prev, ...updates }));
      router.refresh();
    }
    return !error;
  }

  const props = { site: siteData, editing, onEdit: setEditing, onSave: saveSection };

  return (
    <div className="space-y-3">
      <HeroSection {...props} />
      <ServicesSection {...props} />
      <AboutSection {...props} />
      <TestimonialsSection {...props} />
      <DesignSection {...props} />
      <ContactSection {...props} />
      <SeoSection {...props} />
      <LegalSection {...props} />
      <RegenerateCard site={siteData} />
    </div>
  );
}
