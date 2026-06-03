"use client";

import { useState, useEffect, useRef } from "react";
import type { Site, AIContent, StatItem, ServiceItem, BenefitItem, SiteTemplate, TestimonialItem, TeamMemberItem } from "@/lib/types";

// ─── Scroll reveal hook ──────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("is-visible"); obs.unobserve(el); } },
      { threshold: 0.06, rootMargin: "0px 0px -48px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Industry-matched hero image ─────────────────────────────────────────────
function getHeroImage(industry: string): string {
  const q = (industry || "").toLowerCase();
  if (q.match(/zahn|dental|arzt|praxis|klinik/))    return "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/restaurant|gastro|café|cafe|küche|catering/)) return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/sanitär|heizung|wärmepumpe|rohr|klempner/))   return "https://images.unsplash.com/photo-1581092334651-ddf19d979f6f?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/handwerk|bau|elektro|maler|dachdeck/))        return "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/fahrschule|führerschein|fahren/))             return "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/friseur|beauty|kosmetik|haar|spa|wellness/))  return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/immobilien|makler/))   return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/fitness|sport|gym|yoga/)) return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/anwalt|recht|kanzlei/))  return "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/steuer|finanz|buchhalter/)) return "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/auto|kfz|werkstatt/))    return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/physio|therapie|gesundheit/)) return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/garten|landschaft/))     return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/reinigung/))             return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/tierarzt|tier|vet/))     return "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/optiker|brillen/))       return "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1920&q=85";
  if (q.match(/hotel|pension|unterkunft/)) return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85";
  return "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=85";
}

function getAboutImage(industry: string): string {
  const q = (industry || "").toLowerCase();
  if (q.match(/zahn|dental|arzt|praxis/)) return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=85";
  if (q.match(/restaurant|gastro|café|cafe/)) return "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=85";
  if (q.match(/sanitär|heizung|wärmepumpe/)) return "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=85";
  if (q.match(/handwerk|bau/))           return "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85";
  if (q.match(/fahrschule|führerschein/)) return "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=85";
  if (q.match(/friseur|beauty/))         return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85";
  if (q.match(/fitness|sport/))          return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=85";
  if (q.match(/anwalt|recht/))           return "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=85";
  if (q.match(/auto|kfz/))              return "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=900&q=85";
  return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=85";
}

// ─── Sicherer Bild-Selektor — Google-Proxy-URLs werden ignoriert ─────────────
// Verhindert dass falsche Google Place Photos von alten generierten Sites
// angezeigt werden. /api/place-photo URLs = potenziell falscher Eintrag → Fallback.
function getSafeImageUrl(stored: string | null | undefined, industry: string, type: "hero" | "about" = "hero"): string {
  if (stored && !stored.includes("/api/place-photo") && !stored.includes("place-photo")) {
    return stored; // Manuell hochgeladenes Bild → immer verwenden
  }
  return type === "about" ? getAboutImage(industry) : getHeroImage(industry);
}

// Stable number from a slug string — used to rotate images so each site looks different
function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

// Returns 4 industry-matched images for gallery strips and service card headers.
// seed rotates the array so different sites show different images.
function getGalleryImages(industry: string, seed = 0): string[] {
  const q = (industry || "").toLowerCase();
  let imgs: string[];
  if (q.match(/zahn|dental/)) imgs = [
    "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1588776814546-1ffce7f7b3b0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559839697-b89e6c73d5f0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1612538498456-e861c2c66d1d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=800&q=80",
  ];
  else if (q.match(/arzt|praxis|klinik|physio/)) imgs = [
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584982751601-97dea52f738c?auto=format&fit=crop&w=800&q=80",
  ];
  else if (q.match(/restaurant|gastro|café|cafe|küche|catering/)) imgs = [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80",
  ];
  else if (q.match(/sanitär|heizung|wärmepumpe|rohr|klempner/)) imgs = [
    "https://images.unsplash.com/photo-1581092334651-ddf19d979f6f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  ];
  else if (q.match(/fahrschule|führerschein|fahren/)) imgs = [
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=800&q=80",
  ];
  else if (q.match(/handwerk|bau|elektro|maler|dachdeck/)) imgs = [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  ];
  else if (q.match(/friseur|beauty|kosmetik|haar|spa|wellness/)) imgs = [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
  ];
  else if (q.match(/fitness|sport|gym|yoga/)) imgs = [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80",
  ];
  else if (q.match(/anwalt|recht|kanzlei|steuer|finanz/)) imgs = [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80",
  ];
  else if (q.match(/immobilien|makler/)) imgs = [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
  ];
  else imgs = [
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=800&q=80",
  ];
  const offset = seed % imgs.length;
  return offset === 0 ? imgs : [...imgs.slice(offset), ...imgs.slice(0, offset)];
}

// Industry-specific fallback services — shown when AI data is missing
function getDefaultServices(industry: string): ServiceItem[] {
  const q = (industry || "").toLowerCase();
  if (q.match(/zahnarzt|dental/)) return [
    { title: "Prophylaxe & Reinigung", description: "Professionelle Zahnreinigung und individuelle Prophylaxe für langfristig gesunde Zähne. Wir entfernen Plaque und Zahnstein gründlich und schonend." },
    { title: "Zahnfüllungen & Restauration", description: "Hochwertige Füllungen aus Komposit oder Keramik – ästhetisch, langlebig und zahnfarbend angepasst für ein natürliches Ergebnis." },
    { title: "Zahnersatz & Prothetik", description: "Individuell angefertigter Zahnersatz von Kronen und Brücken bis zu Veneers für ein natürliches und schönes Lächeln." },
    { title: "Implantologie", description: "Dauerhafte Zahnlückenversorgung durch Implantate – wir begleiten Sie von der Planung bis zur finalen Versorgung." },
    { title: "Kinderzahnheilkunde", description: "Einfühlsame Zahnbehandlung für Kinder in stressfreier Umgebung. Wir legen den Grundstein für lebenslang gesunde Zähne." },
    { title: "Bleaching & Ästhetik", description: "Professionelles Zahn-Bleaching für ein strahlendes Lächeln – sicher, schonend und mit nachhaltigen Ergebnissen." },
  ];
  if (q.match(/handwerk|bau|sanitär|elektro|maler|dachdeck/)) return [
    { title: "Beratung & Planung", description: "Individuelle Vor-Ort-Beratung und professionelle Projektplanung mit transparenter Kostenübersicht – ohne versteckte Gebühren." },
    { title: "Fachgerechte Ausführung", description: "Alle Arbeiten werden von qualifizierten Fachkräften mit modernstem Werkzeug und geprüften Materialien ausgeführt." },
    { title: "Wartung & Service", description: "Regelmäßige Wartung und schneller Reparaturservice für den dauerhaften Betrieb Ihrer Anlagen und Systeme." },
    { title: "Notfallservice 24/7", description: "Rund-um-die-Uhr-Notfallservice bei dringenden Problemen – wir sind schnell zur Stelle, auch an Wochenenden." },
    { title: "Modernisierung & Sanierung", description: "Energieeffiziente Modernisierungen und vollständige Sanierungen nach aktuellen technischen Standards und Normen." },
    { title: "Abnahme & Dokumentation", description: "Sorgfältige Abnahme mit lückenloser Dokumentation aller ausgeführten Arbeiten – für Ihre rechtliche Sicherheit." },
  ];
  if (q.match(/restaurant|gastro|café|cafe/)) return [
    { title: "Frühstück & Brunch", description: "Täglich frisch zubereitetes Frühstück mit regionalen Zutaten. Genießen Sie den perfekten, entspannten Start in den Tag." },
    { title: "Mittagstisch", description: "Wechselnde Tagesgerichte mit frischen, saisonalen Zutaten – schnell, lecker und zu fairen Preisen für die Mittagspause." },
    { title: "À-la-Carte-Menü", description: "Sorgfältig zusammengestellte Gerichte aus besten Zutaten. Genießen Sie kulinarische Vielfalt in entspannter Atmosphäre." },
    { title: "Catering & Events", description: "Professionelles Catering für Firmenevents, Hochzeiten und Feiern – maßgeschneidert für Ihren besonderen Anlass." },
    { title: "Takeaway & Lieferung", description: "Alle unsere Speisen auch zum Mitnehmen oder zur Lieferung. Frisch zubereitet und liebevoll verpackt für Sie." },
    { title: "Reservierungen", description: "Tischreservierungen für Gruppen und besondere Anlässe auf Anfrage – wir richten uns nach Ihren Wünschen." },
  ];
  if (q.match(/friseur|beauty|kosmetik|haar|spa|wellness/)) return [
    { title: "Haarschnitt & Styling", description: "Professionelle Haarschnitte und Stylings, individuell auf Ihre Wünsche und Haarstruktur abgestimmt." },
    { title: "Farbe & Coloration", description: "Von natürlichen Highlights bis zu kräftigen Tönen – unsere Coloristen setzen Ihre Wunschfarbe perfekt um." },
    { title: "Pflegebehandlungen", description: "Intensive Pflegebehandlungen für gesundes, glänzendes Haar. Wir verwenden hochwertige Produkte führender Marken." },
    { title: "Make-up & Styling", description: "Professionelles Make-up für Hochzeiten, Events und besondere Anlässe – für Ihren perfekten Auftritt." },
    { title: "Kosmetische Behandlungen", description: "Gesichtsbehandlungen, Peelings und Anti-Aging-Pflege für strahlende, gepflegte Haut." },
    { title: "Maniküre & Nails", description: "Professionelle Nagelpflege und kreative Nail-Art – für schöne Hände, die auffallen." },
  ];
  return [
    { title: "Beratung & Konzept", description: "Persönliche Beratung und maßgeschneiderte Konzepte für Ihre individuelle Situation – wir hören zu und entwickeln die beste Lösung." },
    { title: "Professionelle Umsetzung", description: "Fachgerechte Umsetzung durch erfahrene Spezialisten mit höchsten Qualitätsstandards und modernen Methoden." },
    { title: "Betreuung & Support", description: "Kompetente Betreuung während und nach dem Auftrag. Wir stehen Ihnen als zuverlässiger Ansprechpartner zur Verfügung." },
    { title: "Qualitätssicherung", description: "Strenge Qualitätskontrollen garantieren dauerhaft hervorragende Ergebnisse – Ihre Zufriedenheit ist unser Maßstab." },
    { title: "Flexible Lösungen", description: "Maßgeschneiderte Angebote, die sich Ihren Bedürfnissen und Ihrem Budget anpassen. Kein Projekt ist zu groß oder zu klein." },
    { title: "Langfristige Partnerschaft", description: "Wir denken nicht kurzfristig. Aufgebautes Vertrauen und nachhaltiger Erfolg stehen im Mittelpunkt unserer Arbeit." },
  ];
}

const DEFAULT_BENEFITS: BenefitItem[] = [
  { title: "Langjährige Erfahrung", description: "Jahrelange Expertise und ein eingespieltes Team sprechen für unsere Qualität und Verlässlichkeit." },
  { title: "Persönliche Betreuung", description: "Individuelle Beratung und ein fester Ansprechpartner – wir nehmen uns Zeit für Ihr Anliegen." },
  { title: "Faire Preise", description: "Transparente Kostenstruktur ohne versteckte Gebühren. Qualität muss nicht teuer sein." },
  { title: "Schnelle Reaktion", description: "Kurze Reaktionszeiten und zeitnahe Umsetzung – wir wissen, dass Ihre Zeit wertvoll ist." },
];

// Keine erfundenen Stats — nur echte Daten aus dem Scraper werden angezeigt
function getDefaultStats(_template: string, _industry: string): StatItem[] {
  return []; // Lieber nichts als falsche Zahlen
}

// Ist das ein medizinisches / Gesundheits-Unternehmen?
function isMedicalIndustry(industry: string): boolean {
  return /zahn|dental|arzt|praxis|klinik|physio|therapeut|orthopäd|psycho|psychiatr|derm|kardio|augenarzt|hno|chirurg|hausarzt|frauenarzt/i.test(industry || "");
}

// ─── Logo ────────────────────────────────────────────────────────────────────
function SiteLogo({ site, color, white = false }: { site: Site; color: string; white?: boolean }) {
  const [err, setErr] = useState(false);
  const domain = site.old_website_url
    ? site.old_website_url.replace(/^https?:\/\//, "").split("/")[0]
    : null;
  const logoSrc = site.logo_url || (domain ? `https://logo.clearbit.com/${domain}` : null);

  if (logoSrc && !err) {
    return (
      <img
        src={logoSrc}
        alt={site.company_name}
        className={`h-8 w-auto max-w-[160px] object-contain ${white ? "brightness-0 invert" : ""}`}
        onError={() => setErr(true)}
      />
    );
  }

  const initials = site.company_name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
        style={{ backgroundColor: white ? "rgba(255,255,255,0.25)" : color }}
        aria-hidden="true"
      >
        {initials}
      </div>
      <span
        className={`text-base font-bold tracking-tight leading-none ${white ? "text-white" : "text-gray-900"}`}
      >
        {site.company_name}
      </span>
    </div>
  );
}

// ─── Contact form (real Supabase submission) ─────────────────────────────────
function ContactForm({ color, siteId, siteSlug }: { color: string; siteId: string; siteSlug: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, site_id: siteId, site_slug: siteSlug }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Fehler");
      setSent(true);
    } catch (err) {
      setError((err as Error).message || "Fehler beim Senden. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-green-50 px-8 py-16 text-center ring-1 ring-green-100">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircleIcon className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-900">Nachricht gesendet!</h3>
      <p className="max-w-xs text-gray-600">Wir melden uns schnellstmöglich bei Ihnen. Vielen Dank für Ihre Anfrage.</p>
    </div>
  );

  const inp = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-0";
  const lbl = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className={lbl}>Name *</label>
          <input id="cf-name" required className={inp} placeholder="Max Mustermann" value={form.name}
            onChange={update("name")} style={{ "--tw-ring-color": color } as React.CSSProperties} />
        </div>
        <div>
          <label htmlFor="cf-phone" className={lbl}>Telefon</label>
          <input id="cf-phone" type="tel" className={inp} placeholder="+49 89 123456" value={form.phone}
            onChange={update("phone")} style={{ "--tw-ring-color": color } as React.CSSProperties} />
        </div>
      </div>
      <div>
        <label htmlFor="cf-email" className={lbl}>E-Mail *</label>
        <input id="cf-email" required type="email" className={inp} placeholder="ihre@email.de" value={form.email}
          onChange={update("email")} style={{ "--tw-ring-color": color } as React.CSSProperties} />
      </div>
      <div>
        <label htmlFor="cf-msg" className={lbl}>Nachricht *</label>
        <textarea id="cf-msg" required rows={4} className={inp} placeholder="Wie können wir Ihnen helfen?"
          value={form.message} onChange={update("message")} style={{ "--tw-ring-color": color } as React.CSSProperties} />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <p className="text-xs text-gray-500">
        Mit dem Absenden stimmen Sie der{" "}
        <a href={`/site/${siteSlug}/datenschutz`} className="underline underline-offset-2 hover:text-gray-700">Datenschutzerklärung</a> zu.
      </p>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        {loading ? "Wird gesendet…" : "Nachricht senden →"}
      </button>
    </form>
  );
}

// ─── Shared footer ────────────────────────────────────────────────────────────
function SharedFooter({ site, color }: { site: Site; color: string }) {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <SiteLogo site={site} color={color} />
            {site.industry && <p className="mt-1.5 text-sm text-gray-500">{site.industry}</p>}
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-600">
              Professionell, zuverlässig und persönlich – wir sind Ihr kompetenter Partner.
            </p>
            <div className="mt-5 flex gap-2" aria-label="Kontakt-Links">
              {site.phone && (
                <a href={`tel:${site.phone}`} aria-label="Anrufen"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: color }}>
                  <PhoneIcon className="h-4 w-4" />
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`} aria-label="E-Mail senden"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: color }}>
                  <MailIcon className="h-4 w-4" />
                </a>
              )}
              {site.whatsapp && (
                <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: "#25D366" }}>
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-800">Navigation</h3>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {site.services?.length > 0 && <li><a href="#leistungen" className="transition hover:text-gray-900">Leistungen</a></li>}
              {site.about_text && <li><a href="#ueber-uns" className="transition hover:text-gray-900">Über uns</a></li>}
              <li><a href="#kontakt" className="transition hover:text-gray-900">Kontakt</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-800">Kontakt</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {site.phone && <li><a href={`tel:${site.phone}`} className="transition hover:text-gray-900">{site.phone}</a></li>}
              {site.email && <li><a href={`mailto:${site.email}`} className="transition hover:text-gray-900">{site.email}</a></li>}
              {site.address && <li className="leading-relaxed">{site.address}</li>}
            </ul>
            <h3 className="mb-3 mt-7 text-xs font-semibold uppercase tracking-wider text-gray-800">Rechtliches</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href={`/site/${site.slug}/impressum`} className="transition hover:text-gray-900">Impressum</a></li>
              <li><a href={`/site/${site.slug}/datenschutz`} className="transition hover:text-gray-900">Datenschutz</a></li>
              <li><a href={`/site/${site.slug}/agb`} className="transition hover:text-gray-900">AGB</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-8 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.company_name}. Alle Rechte vorbehalten.</p>
          <div className="flex gap-5">
            <a href={`/site/${site.slug}/impressum`} className="transition hover:text-gray-700">Impressum</a>
            <a href={`/site/${site.slug}/datenschutz`} className="transition hover:text-gray-700">Datenschutz</a>
            <a href={`/site/${site.slug}/agb`} className="transition hover:text-gray-700">AGB</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Mobile sticky CTA ───────────────────────────────────────────────────────
function MobileCta({ site, color }: { site: Site; color: string }) {
  if (!site.phone) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-sm gap-3">
        <a href={`tel:${site.phone}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
          <PhoneIcon className="h-4 w-4" /> Anrufen
        </a>
        {site.whatsapp ? (
          <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
            target="_blank" rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-700">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
        ) : (
          <a href="#kontakt"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-700">
            Schreiben
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Floating WhatsApp ───────────────────────────────────────────────────────
function FloatingWhatsApp({ whatsapp }: { whatsapp: string }) {
  return (
    <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
      target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
      className="fixed bottom-[88px] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-xl text-white transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:bottom-8"
      style={{ backgroundColor: "#25D366" }}>
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 1 — PREMIUM (dark photo hero, editorial sections)
// ════════════════════════════════════════════════════════════════════════════

type TplProps = {
  site: Site; color: string; ai: AIContent;
  services: ServiceItem[]; benefits: BenefitItem[]; stats: StatItem[];
  isMedical?: boolean;
};

function PremiumNav({ site, color }: { site: Site; color: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    { href: "#leistungen", label: "Leistungen", show: true },
    { href: "#ueber-uns",  label: "Über uns",   show: !!site.about_text },
    { href: "#kontakt",    label: "Kontakt",    show: true },
  ].filter(l => l.show);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#hero" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg p-1 -ml-1">
          <SiteLogo site={site} color={color} white={!scrolled} />
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Hauptnavigation">
          {navLinks.map(l => (
            <a key={l.href} href={l.href}
              className={`text-sm font-medium transition hover:opacity-100 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 ${
                scrolled ? "text-gray-600 hover:text-gray-900 focus-visible:ring-gray-400" : "text-white/75 hover:text-white focus-visible:ring-white/50"
              }`}>
              {l.label}
            </a>
          ))}
        </nav>

        {site.phone && (
          <a href={`tel:${site.phone}`}
            className={`hidden md:inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              scrolled
                ? "text-white hover:opacity-90 focus-visible:ring-offset-white"
                : "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            }`}
            style={scrolled ? { backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties : undefined}>
            <PhoneIcon className="h-3.5 w-3.5" />
            {site.phone}
          </a>
        )}

        <button
          className={`md:hidden rounded-lg p-2 transition focus-visible:outline-none focus-visible:ring-2 ${
            scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
          }`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-3 shadow-xl">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {l.label}
            </a>
          ))}
          {site.phone && (
            <a href={`tel:${site.phone}`}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}>
              <PhoneIcon className="h-4 w-4" /> {site.phone}
            </a>
          )}
        </div>
      )}
    </header>
  );
}

function PremiumHero({ site, color, ai, stats }: TplProps) {
  return (
    <section id="hero" className="relative flex min-h-[85vh] flex-col justify-center overflow-hidden" aria-label="Hero">
      <div className="absolute inset-0" aria-hidden="true">
        <img src={getSafeImageUrl(site.hero_image_url, site.industry)} alt="" className="h-full w-full object-cover" fetchPriority="high" />
        {/* Centered vignette: darker edges, lighter center-ish for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/40" />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-8 py-28 sm:px-12 lg:px-16">
        {(ai?.hero_badge || ai?.trust_badge) && (
          <div className="anim-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
            <span className="text-sm font-medium text-white">{ai.hero_badge || ai.trust_badge}</span>
          </div>
        )}

        <h1 className="anim-fade-up anim-delay-100 mb-6 max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {site.hero_headline || site.company_name}
        </h1>

        <p className="anim-fade-up anim-delay-200 mb-10 max-w-lg text-lg leading-relaxed text-white/80 sm:text-xl">
          {site.hero_subheadline}
        </p>

        <div className="anim-fade-up anim-delay-300 flex flex-wrap items-center gap-4">
          <a href="#kontakt"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white shadow-xl transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ backgroundColor: color }}>
            {site.cta_text || "Jetzt anfragen"}
            <ArrowRightIcon className="h-4 w-4" />
          </a>
          {ai?.cta_secondary && (
            <a href="#leistungen"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
              {ai.cta_secondary}
            </a>
          )}
          {site.phone && (
            <a href={`tel:${site.phone}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white/50">
              <PhoneIcon className="h-4 w-4" />
              {site.phone}
            </a>
          )}
        </div>

        {ai?.hero_detail && (
          <p className="anim-fade-up anim-delay-400 mt-6 max-w-md text-sm leading-relaxed text-white/65">
            {ai.hero_detail}
          </p>
        )}

        {stats.length > 0 && (
          <div className="anim-fade-up anim-delay-400 mt-16 grid max-w-xl grid-cols-2 gap-x-12 gap-y-6 border-t border-white/15 pt-10 sm:grid-cols-4 sm:max-w-3xl" aria-label="Kennzahlen">
            {stats.map((s, i) => (
              <div key={i} className="text-left">
                <div className="text-2xl font-bold text-white sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-white/55">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PremiumBenefits({ site, benefits, color }: { site: Site; benefits: BenefitItem[]; color: string }) {
  const ref = useReveal();
  const icons = ["⚡", "🎯", "🔒", "💎", "🚀", "✅"];
  return (
    <section id="vorteile" className="bg-white py-20 sm:py-28" aria-labelledby="benefits-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <header className="mb-14">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Ihre Vorteile</p>
          <h2 id="benefits-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Warum {site.company_name}?
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} group rounded-2xl border border-gray-100 bg-gray-50 p-6 transition hover:border-gray-200 hover:bg-white hover:shadow-sm`}>
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-transform group-hover:scale-105"
                aria-hidden="true"
                style={{ backgroundColor: `${color}18` }}>
                {icons[i % icons.length]}
              </div>
              <h3 className="mb-2 text-base font-semibold text-gray-900">{b.title}</h3>
              {b.description && <p className="text-sm leading-relaxed text-gray-600">{b.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumServices({ services, color, site, isMedical }: { services: ServiceItem[]; color: string; site: Site; isMedical?: boolean }) {
  const ref = useReveal();
  const ai = site.ai_content as AIContent;
  // Echte Google-Fotos für Service-Karten nutzen (ab Foto 2), Rest mit Unsplash auffüllen
  const googlePhotos = (ai as unknown as Record<string, unknown>)?.google_service_photos as string[] | undefined;
  const stockImgs    = getGalleryImages(site.industry || "", slugHash(site.slug));
  const autoImgs     = googlePhotos && googlePhotos.length > 0
    ? [...googlePhotos, ...stockImgs]
    : stockImgs;
  return (
    <section id="leistungen" className="bg-gray-50 py-20 sm:py-28" aria-labelledby="services-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Leistungen</p>
          <h2 id="services-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {isMedical ? "Unser Behandlungsangebot" : "Was wir für Sie tun"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={i}
              className={`reveal group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl reveal-delay-${Math.min(i + 1, 6)}`}
            >
              {/* Image header */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={autoImgs[i % autoImgs.length]}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  aria-hidden="true"
                  onError={(e) => {
                    const fallbacks = autoImgs.filter((_, j) => j !== i % autoImgs.length);
                    (e.currentTarget as HTMLImageElement).src = fallbacks[i % fallbacks.length] || autoImgs[0];
                    (e.currentTarget as HTMLImageElement).onerror = null;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent" />
                <span
                  className="absolute bottom-3 right-4 select-none text-5xl font-black leading-none text-white/15"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              {/* Text */}
              <div className="flex flex-col p-6">
                <div className="mb-4 h-0.5 w-8 rounded-full transition-all duration-300 group-hover:w-16" style={{ backgroundColor: color }} aria-hidden="true" />
                <h3 className="mb-3 text-lg font-semibold text-gray-900">{s.title}</h3>
                {s.description && <p className="flex-1 text-sm leading-relaxed text-gray-600">{s.description}</p>}
                {s.highlight && (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold" style={{ backgroundColor: `${color}12`, color }}>
                    <span aria-hidden="true">✓</span> {s.highlight}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Horizontal image strip — shown between sections for visual depth
function GalleryStrip({ industry, seed = 0, className = "" }: { industry: string; seed?: number; className?: string }) {
  const imgs = getGalleryImages(industry, seed);
  return (
    <div className={`flex gap-4 overflow-hidden px-4 sm:gap-5 sm:px-8 ${className}`} aria-hidden="true">
      {imgs.map((src, i) => (
        <div
          key={i}
          className={`h-44 flex-1 overflow-hidden rounded-2xl sm:h-56 ${i === 0 ? "hidden sm:block" : ""} ${i === 3 ? "hidden lg:block" : ""}`}
        >
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

function PremiumAbout({ site, color, ai }: { site: Site; color: string; ai: AIContent }) {
  const ref = useReveal();
  return (
    <section id="ueber-uns" className="overflow-hidden bg-white" aria-labelledby="about-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          <div className="relative min-h-[360px] lg:col-span-3 lg:min-h-[560px]">
            <img
              src={getSafeImageUrl(site.about_image_url, site.industry || "", "about")}
              alt={`Team ${site.company_name}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {ai?.about_highlight && (
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/96 p-5 shadow-xl backdrop-blur-sm lg:right-10">
                <div className="mb-2 flex gap-0.5 text-amber-400" aria-label="5 Sterne">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4" />)}
                </div>
                <p className="text-sm font-semibold italic text-gray-800">„{ai.about_highlight}"</p>
                <p className="mt-1.5 text-xs font-medium" style={{ color }}>— {site.company_name}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center px-8 py-14 lg:col-span-2 lg:px-14 lg:py-20">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Über uns</p>
            <h2 id="about-heading" className="mb-5 text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl">
              {ai?.about_headline || site.company_name}
            </h2>
            <p className="mb-6 text-base leading-relaxed text-gray-700">{site.about_text}</p>

            {ai?.about_points && ai.about_points.length > 0 && (
              <ul className="mb-8 space-y-2" aria-label="Merkmale">
                {ai.about_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-white text-[10px] font-black" style={{ backgroundColor: color }} aria-hidden="true">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-2.5">
              {[
                { icon: <MapPinIcon className="h-4 w-4" />, label: site.address, href: undefined, show: !!site.address },
                { icon: <PhoneIcon className="h-4 w-4" />, label: site.phone, href: `tel:${site.phone}`, show: !!site.phone },
                { icon: <MailIcon className="h-4 w-4" />, label: site.email, href: `mailto:${site.email}`, show: !!site.email },
              ].filter(i => i.show).map((item, i) => {
                const cls = "flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";
                const inner = <><span className="text-gray-500" aria-hidden="true">{item.icon}</span><span className="truncate">{item.label}</span></>;
                return item.href
                  ? <a key={i} href={item.href} className={cls}>{inner}</a>
                  : <div key={i} className={cls.replace("hover:bg-gray-100", "")}>{inner}</div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumProcess({ color, isMedical }: { color: string; isMedical?: boolean }) {
  const ref = useReveal();
  const steps = isMedical ? [
    { icon: "📞", n: "01", title: "Termin vereinbaren", desc: "Rufen Sie uns einfach an oder nutzen Sie das Kontaktformular. Wir finden schnell einen passenden Termin – auch kurzfristig und ohne lange Wartezeit." },
    { icon: "🩺", n: "02", title: "Ausführliche Untersuchung", desc: "Beim ersten Termin nehmen wir uns Zeit für Sie. Wir hören zu, untersuchen gründlich und beantworten alle Ihre Fragen – ohne Zeitdruck." },
    { icon: "✅", n: "03", title: "Individuelle Behandlung", desc: "Auf Basis der Untersuchung erarbeiten wir gemeinsam Ihren persönlichen Behandlungsplan – transparent, verständlich und ganz auf Sie zugeschnitten." },
  ] : [
    { icon: "💬", n: "01", title: "Kostenlose Anfrage", desc: "Kontaktieren Sie uns per Telefon, WhatsApp oder Formular. Wir melden uns in der Regel innerhalb von 24 Stunden persönlich bei Ihnen." },
    { icon: "🤝", n: "02", title: "Persönliche Beratung", desc: "In einem unverbindlichen Gespräch besprechen wir Ihre Situation und erstellen ein maßgeschneidertes, transparentes Angebot." },
    { icon: "✅", n: "03", title: "Professionelle Umsetzung", desc: "Nach Ihrer Freigabe beginnen wir sofort. Sie werden regelmäßig über den Fortschritt informiert und sind jederzeit eingebunden." },
  ];
  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="process-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>So funktioniert's</p>
        <h2 id="process-heading" className="mb-14 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">In 3 Schritten zum Ergebnis</h2>

        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="absolute left-[3.5rem] right-[3.5rem] top-10 hidden h-px sm:block"
            style={{ background: `linear-gradient(90deg, transparent 0%, ${color}35 20%, ${color}35 80%, transparent 100%)` }}
            aria-hidden="true" />
          {steps.map((step, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} relative rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100`}>
              <div className="mb-5 flex items-center gap-4">
                <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${color}15` }} aria-hidden="true">
                  {step.icon}
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
                    style={{ backgroundColor: color }}>{i + 1}</span>
                </div>
              </div>
              <h3 className="mb-2.5 text-base font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumCtaBand({ site, color, ai }: { site: Site; color: string; ai: AIContent }) {
  const ctaHeadline = ai?.cta_section_headline || "Bereit für den nächsten Schritt?";
  const ctaText = ai?.cta_section_text || "Kontaktieren Sie uns noch heute – wir freuen uns auf Ihre Anfrage und melden uns innerhalb von 24 Stunden bei Ihnen.";
  return (
    <section className="relative overflow-hidden py-20 sm:py-28" style={{ backgroundColor: color }} aria-label="Jetzt handeln">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {ctaHeadline}
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-white/85">{ctaText}</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {site.phone && (
            <a href={`tel:${site.phone}`}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-9 py-4 text-base font-bold shadow-xl transition hover:scale-[1.02] active:scale-95 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
              style={{ color }}>
              <PhoneIcon className="h-5 w-5" />
              {site.phone}
            </a>
          )}
          <a href="#kontakt"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-9 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
            Kontaktformular
          </a>
        </div>
        {site.whatsapp && (
          <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-white/65 transition hover:text-white focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white/50">
            <WhatsAppIcon className="h-5 w-5" />
            Oder direkt auf WhatsApp schreiben
          </a>
        )}
      </div>
    </section>
  );
}

function PremiumContact({ site, color }: { site: Site; color: string }) {
  const ref = useReveal();
  return (
    <section id="kontakt" className="bg-white py-20 sm:py-28" aria-labelledby="contact-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Kontakt</p>
            <h2 id="contact-heading" className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Wir sind für Sie da</h2>
            <p className="mb-10 text-base leading-relaxed text-gray-600">Wir antworten auf alle Anfragen innerhalb von 24 Stunden. Bei dringenden Anliegen erreichen Sie uns am schnellsten telefonisch.</p>

            <div className="space-y-3">
              {site.phone && (
                <a href={`tel:${site.phone}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-gray-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }} aria-hidden="true">
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Telefon</p>
                    <p className="text-base font-semibold text-gray-900">{site.phone}</p>
                  </div>
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-gray-200 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }} aria-hidden="true">
                    <MailIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">E-Mail</p>
                    <p className="text-base font-semibold text-gray-900">{site.email}</p>
                  </div>
                </a>
              )}
              {site.address && (
                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }} aria-hidden="true">
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Adresse</p>
                    <p className="text-base font-semibold text-gray-900">{site.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-8 ring-1 ring-gray-100">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Nachricht senden</h3>
            <ContactForm color={color} siteId={site.id} siteSlug={site.slug} />
          </div>
        </div>
      </div>
    </section>
  );
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { name: "Michael S.", role: "Zufriedener Kunde", text: "Absolut professionell und zuverlässig. Die Arbeit wurde pünktlich und in hervorragender Qualität erledigt. Ich bin rundum begeistert und kann es uneingeschränkt weiterempfehlen!" },
  { name: "Sandra K.", role: "Kundin seit 2 Jahren", text: "Von der ersten Kontaktaufnahme bis zum Abschluss war alles einwandfrei. Faire Preise und das Ergebnis hat meine Erwartungen übertroffen. Klare Empfehlung!" },
  { name: "Thomas B.", role: "Stammkunde", text: "Schnelle Reaktion und immer freundlich – genau so stellt man sich einen zuverlässigen Partner vor. Ich komme immer wieder gerne und empfehle das Team weiter." },
];

const DEFAULT_PATIENT_TESTIMONIALS: TestimonialItem[] = [
  { name: "Maria S.", role: "Patientin seit 5 Jahren", text: "Ich war lange Zeit sehr ängstlich beim Zahnarzt. Hier wurde ich so einfühlsam betreut, dass ich keine Angst mehr habe. Das Team ist herzlich und die Behandlung schmerzfrei." },
  { name: "Klaus R.", role: "Patient", text: "Endlich eine Praxis, die sich wirklich Zeit nimmt. Alle Fragen wurden geduldig beantwortet, die Behandlung war professionell und ich bin mit dem Ergebnis sehr zufrieden." },
  { name: "Andrea M.", role: "Familienpatientin", text: "Wir kommen mit der ganzen Familie hierher – auch die Kinder fühlen sich wohl. Das Praxisteam ist unglaublich freundlich und erklärt alles verständlich. Absolute Empfehlung!" },
];

function PremiumFaq({ color, site, isMedical }: { color: string; site: Site; isMedical?: boolean }) {
  const ai = (site.ai_content as AIContent);
  const items = ai?.faq_items;
  if (!items || items.length === 0) return null;

  const ref = useReveal();
  const [open, setOpen] = useState<number | null>(0);
  const label = isMedical ? "Häufige Fragen" : "FAQ";
  const heading = isMedical ? "Ihre Fragen — unsere Antworten" : "Häufige Fragen";

  return (
    <section className="bg-gray-50 py-20 sm:py-28" aria-labelledby="faq-heading">
      <div ref={ref} className="reveal mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>{label}</p>
          <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{heading}</h2>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-sm"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-sm font-semibold text-gray-900 sm:text-base">{item.question}</span>
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300"
                  style={{ backgroundColor: color, transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
                  aria-hidden="true"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>
              </button>
              {open === i && (
                <div className="border-t border-gray-100 px-6 pb-6 pt-4">
                  <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumTestimonials({ color, site, isMedical }: { color: string; site: Site; isMedical?: boolean }) {
  const ref = useReveal();
  // Priority: manually saved → AI-generated from ai_content → industry fallback
  const aiGenerated = (site.ai_content as AIContent)?.testimonials;
  const fallback = isMedical ? DEFAULT_PATIENT_TESTIMONIALS : DEFAULT_TESTIMONIALS;
  const reviews = site.testimonials?.length === 3
    ? site.testimonials
    : (aiGenerated?.length === 3 ? aiGenerated : fallback);
  const sectionLabel = isMedical ? "Patientenstimmen" : "Kundenstimmen";
  const sectionHeading = isMedical ? "Was unsere Patienten sagen" : "Was unsere Kunden sagen";
  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="premium-reviews-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>{sectionLabel}</p>
            <h2 id="premium-reviews-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {sectionHeading}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-5 w-5" />)}
            <span className="ml-1.5 text-sm font-semibold text-gray-700">5,0 / 5,0</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {reviews.map((r, i) => (
            <figure
              key={i}
              className={`reveal reveal-delay-${i + 1} flex flex-col rounded-2xl bg-gray-50 p-8 ring-1 ring-gray-100`}
            >
              <div className="mb-5 flex gap-0.5 text-amber-400" aria-label="5 Sterne">
                {[...Array(5)].map((_, j) => <StarIcon key={j} className="h-4 w-4" />)}
              </div>
              <blockquote className="flex-1">
                <p className="text-base leading-relaxed text-gray-700">„{r.text}"</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumTemplate(props: TplProps) {
  const { site, color, ai, services, benefits, isMedical } = props;
  return (
    <div className="min-h-screen bg-white antialiased">
      <PremiumNav site={site} color={color} />
      <PremiumHero {...props} />
      <GalleryStrip industry={site.industry || ""} seed={slugHash(site.slug)} className="py-4 bg-white" />
      {benefits.length > 0 && <PremiumBenefits site={site} benefits={benefits} color={color} />}
      <PremiumServices services={services} color={color} site={site} isMedical={isMedical} />
      {site.about_text && <PremiumAbout site={site} color={color} ai={ai} />}
      <PremiumProcess color={color} isMedical={isMedical} />
      <PremiumFaq color={color} site={site} isMedical={isMedical} />
      <PremiumTestimonials color={color} site={site} isMedical={isMedical} />
      <PremiumCtaBand site={site} color={color} ai={ai} />
      <PremiumContact site={site} color={color} />
      <SharedFooter site={site} color={color} />
      <MobileCta site={site} color={color} />
      {site.whatsapp && <FloatingWhatsApp whatsapp={site.whatsapp} />}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 2 — LOCAL (warm, light, community feel)
// ════════════════════════════════════════════════════════════════════════════

function LocalNav({ site, color }: { site: Site; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm" role="banner">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#hero" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg p-1 -ml-1"
          style={{ "--tw-ring-color": color } as React.CSSProperties}>
          <SiteLogo site={site} color={color} />
        </a>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Hauptnavigation">
          {[
            { href: "#leistungen", label: "Leistungen" },
            { href: "#ueber-uns",  label: "Über uns", show: !!site.about_text },
            { href: "#kontakt",    label: "Kontakt" },
          ].filter(l => l.show !== false).map(l => (
            <a key={l.href} href={l.href}
              className="text-sm font-medium text-gray-600 transition hover:text-gray-900 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2"
              style={{ "--tw-ring-color": color } as React.CSSProperties}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {site.phone && (
            <a href={`tel:${site.phone}`}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
              <PhoneIcon className="h-3.5 w-3.5" />
              Anrufen
            </a>
          )}
        </div>

        <button className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2"
          onClick={() => setOpen(!open)} aria-label={open ? "Menü schließen" : "Menü öffnen"} aria-expanded={open}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-3">
          {[["#leistungen","Leistungen"],["#ueber-uns","Über uns"],["#kontakt","Kontakt"]].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {label}
            </a>
          ))}
          {site.phone && (
            <a href={`tel:${site.phone}`}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}>
              <PhoneIcon className="h-4 w-4" /> {site.phone}
            </a>
          )}
        </div>
      )}
    </header>
  );
}

function LocalHero({ site, color, ai, stats }: TplProps) {
  const heroImg = site.hero_image_url || getHeroImage(site.industry);
  return (
    <section id="hero" className="relative min-h-[85vh] overflow-hidden" aria-label="Hero">
      <div className="grid min-h-[85vh] grid-cols-1 lg:grid-cols-[45fr_55fr]">

        {/* Left: solid brand color panel with content */}
        <div className="relative flex flex-col justify-center px-8 py-16 sm:px-12 lg:px-14" style={{ backgroundColor: color }}>
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 left-6 h-64 w-64 rounded-full bg-white/5" />
          </div>

          <div className="relative">
            {(ai?.hero_badge || ai?.trust_badge) && (
              <div className="anim-fade-up mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-white/80" aria-hidden="true" />
                <span className="text-sm font-medium text-white">{ai.hero_badge || ai.trust_badge}</span>
              </div>
            )}

            <h1 className="anim-fade-up anim-delay-100 mb-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {site.hero_headline || site.company_name}
            </h1>

            <p className="anim-fade-up anim-delay-200 mb-8 max-w-sm text-base leading-relaxed text-white/85 sm:text-lg">
              {site.hero_subheadline}
            </p>

            <div className="anim-fade-up anim-delay-300 flex flex-col gap-3 sm:flex-row">
              <a href="#kontakt"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold shadow-lg transition hover:bg-gray-50 active:scale-95 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                style={{ color }}>
                {site.cta_text || "Jetzt anfragen"}
              </a>
              {site.phone && (
                <a href={`tel:${site.phone}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
                  <PhoneIcon className="h-4 w-4" />
                  {site.phone}
                </a>
              )}
            </div>

            {/* Stats — clean 2×2 grid below CTAs */}
            {stats.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/20 pt-8">
                {stats.slice(0, 4).map((s, i) => (
                  <div key={i}>
                    <div className="text-xl font-bold text-white sm:text-2xl">{s.value}</div>
                    <div className="mt-0.5 text-xs text-white/65">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: photo — full height, clearly visible */}
        <div className="relative hidden lg:block">
          <img src={heroImg} alt="" className="h-full w-full object-cover" fetchPriority="high" />
          {/* Thin gradient where panel meets photo */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r to-transparent" style={{ backgroundImage: `linear-gradient(to right, ${color}60, transparent)` }} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function LocalTrust({ color }: { color: string }) {
  const signals = ["Geprüfte Qualität", "Persönliche Betreuung", "Faire Preise", "Schnelle Reaktion"];
  return (
    <div className="border-b border-gray-100 bg-white py-5" aria-label="Vertrauenssignale">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {signals.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: color }} aria-hidden="true">
                <CheckSmallIcon className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LocalServices({ services, color, site }: { services: ServiceItem[]; color: string; site: Site }) {
  const ref = useReveal();
  const ai = site.ai_content as AIContent;
  const autoImgs = getGalleryImages(site.industry || "", slugHash(site.slug));
  return (
    <section id="leistungen" className="bg-white py-20 sm:py-28" aria-labelledby="local-services-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Leistungen</p>
          <h2 id="local-services-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Was wir anbieten</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-gray-600">Professionelle Leistungen für Ihre Bedürfnisse — zuverlässig und zu fairen Preisen.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={i}
              className={`reveal group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg reveal-delay-${Math.min(i + 1, 6)}`}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={ai?.service_images?.[i] || autoImgs[i % autoImgs.length]}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div
                  className="absolute bottom-3 left-4 flex h-8 w-8 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  <CheckSmallIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="mb-2 text-base font-semibold text-gray-900">{s.title}</h3>
                {s.description && <p className="text-sm leading-relaxed text-gray-600">{s.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalBenefits({ benefits, color }: { benefits: BenefitItem[]; color: string }) {
  const ref = useReveal();
  const nums = ["01", "02", "03", "04"];
  return (
    <section className="bg-gray-50 py-20 sm:py-28" aria-labelledby="local-benefits-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Unsere Stärken</p>
          <h2 id="local-benefits-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Warum unsere Kunden uns vertrauen</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} group relative overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-gray-100 transition hover:shadow-md`}>
              <span className="mb-4 block text-3xl font-black tabular-nums" style={{ color: `${color}30` }} aria-hidden="true">{nums[i % 4]}</span>
              <h3 className="mb-2 text-base font-semibold text-gray-900">{b.title}</h3>
              {b.description && <p className="text-sm leading-relaxed text-gray-600">{b.description}</p>}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" style={{ backgroundColor: color }} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalAbout({ site, color, ai }: { site: Site; color: string; ai: AIContent }) {
  const ref = useReveal();
  return (
    <section id="ueber-uns" className="bg-gray-50 py-20 sm:py-28" aria-labelledby="local-about-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Über uns</p>
            <h2 id="local-about-heading" className="mb-5 text-3xl font-bold tracking-tight text-gray-900">
              {ai?.about_headline || site.company_name}
            </h2>
            <p className="mb-8 text-base leading-relaxed text-gray-700">{site.about_text}</p>
            {ai?.about_highlight && (
              <blockquote className="mb-8 border-l-4 py-1 pl-5" style={{ borderColor: color }}>
                <p className="text-base italic text-gray-500">„{ai.about_highlight}"</p>
              </blockquote>
            )}
            <a href="#kontakt"
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
              Jetzt Kontakt aufnehmen
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-3xl">
              <img src={site.about_image_url || getAboutImage(site.industry || "")} alt={`Team ${site.company_name}`}
                className="aspect-[4/3] w-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LocalTestimonials({ color, site }: { color: string; site: Site }) {
  const ref = useReveal();
  // Priority: manually saved → AI-generated → generic fallback
  const aiGenerated = (site.ai_content as AIContent)?.testimonials;
  const source = site.testimonials?.length === 3
    ? site.testimonials
    : (aiGenerated?.length === 3 ? aiGenerated : DEFAULT_TESTIMONIALS);
  const reviews = source.map(r => ({ text: r.text, name: r.name, rating: 5 }));
  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="reviews-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Bewertungen</p>
          <h2 id="reviews-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Das sagen unsere Kunden</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={i} className={`reveal reveal-delay-${i + 1} rounded-2xl bg-gray-50 p-7`}>
              <div className="mb-4 flex gap-1 text-amber-400" aria-label={`${r.rating} von 5 Sternen`}>
                {[...Array(r.rating)].map((_, j) => <StarIcon key={j} className="h-4 w-4" />)}
              </div>
              <blockquote>
                <p className="mb-4 text-sm leading-relaxed text-gray-700">„{r.text}"</p>
              </blockquote>
              <figcaption className="text-sm font-semibold text-gray-900">{r.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalContact({ site, color }: { site: Site; color: string }) {
  const ref = useReveal();
  return (
    <section id="kontakt" className="bg-white py-20 sm:py-28" aria-labelledby="local-contact-heading">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Kontakt</p>
          <h2 id="local-contact-heading" className="mb-3 text-3xl font-bold tracking-tight text-gray-900">Kontaktieren Sie uns</h2>
          <p className="text-base text-gray-600">Wir freuen uns auf Ihre Anfrage und melden uns innerhalb von 24 Stunden.</p>
        </div>

        {/* Split card: colored left panel + form right */}
        <div className="overflow-hidden rounded-3xl shadow-sm ring-1 ring-gray-100 lg:grid lg:grid-cols-5">
          {/* Left colored panel */}
          <div className="p-8 sm:p-10 lg:col-span-2" style={{ backgroundColor: color }}>
            <h3 className="mb-8 text-xl font-bold text-white">Direkt Kontakt aufnehmen</h3>
            <div className="space-y-6">
              {site.phone && (
                <a href={`tel:${site.phone}`} className="flex items-start gap-4 text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white/60">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <PhoneIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Telefon</p>
                    <p className="mt-0.5 font-semibold">{site.phone}</p>
                  </div>
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`} className="flex items-start gap-4 text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white/60">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <MailIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/60">E-Mail</p>
                    <p className="mt-0.5 font-semibold break-all">{site.email}</p>
                  </div>
                </a>
              )}
              {site.address && (
                <div className="flex items-start gap-4 text-white/90">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <MapPinIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Adresse</p>
                    <p className="mt-0.5 font-semibold leading-relaxed">{site.address}</p>
                  </div>
                </div>
              )}
              {/* Fallback when no contact info */}
              {!site.phone && !site.email && !site.address && (
                <p className="text-white/70 text-sm">Füllen Sie das Formular aus – wir melden uns schnellstmöglich.</p>
              )}
            </div>
            {/* Decorative circles */}
            <div className="mt-10 flex gap-2 opacity-20" aria-hidden="true">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`rounded-full bg-white ${i === 0 ? "h-8 w-8" : i === 1 ? "h-5 w-5" : "h-3 w-3"}`} />
              ))}
            </div>
          </div>
          {/* Right: form */}
          <div className="bg-white p-8 sm:p-10 lg:col-span-3">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Nachricht senden</h3>
            <ContactForm color={color} siteId={site.id} siteSlug={site.slug} />
          </div>
        </div>
      </div>
    </section>
  );
}

function LocalCtaBand({ site, color, ai }: { site: Site; color: string; ai: AIContent }) {
  const ctaHeadline = ai?.cta_section_headline || "Bereit für den nächsten Schritt?";
  const ctaText = ai?.cta_section_text || "Kontaktieren Sie uns noch heute – wir freuen uns auf Ihre Anfrage und melden uns innerhalb von 24 Stunden bei Ihnen.";
  return (
    <section className="relative overflow-hidden py-16 sm:py-20" style={{ backgroundColor: color }} aria-label="Jetzt handeln">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">{ctaHeadline}</h2>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/85">{ctaText}</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {site.phone && (
            <a href={`tel:${site.phone}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold shadow-lg transition hover:scale-[1.02] active:scale-95 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
              style={{ color }}>
              <PhoneIcon className="h-4 w-4" />
              {site.phone}
            </a>
          )}
          <a href="#kontakt"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
            Nachricht senden
          </a>
        </div>
        {site.whatsapp && (
          <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white/50">
            <WhatsAppIcon className="h-4 w-4" />
            Oder direkt auf WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}

function LocalTemplate(props: TplProps) {
  const { site, color, ai, services, benefits } = props;
  return (
    <div className="min-h-screen bg-white antialiased">
      <LocalNav site={site} color={color} />
      <LocalHero {...props} />
      <LocalTrust color={color} />
      <LocalServices services={services} color={color} site={site} />
      <GalleryStrip industry={site.industry || ""} seed={slugHash(site.slug)} className="py-4 bg-gray-50" />
      {benefits.length > 0 && <LocalBenefits benefits={benefits} color={color} />}
      {site.about_text && <LocalAbout site={site} color={color} ai={ai} />}
      <LocalTestimonials color={color} site={site} />
      <LocalCtaBand site={site} color={color} ai={ai} />
      <LocalContact site={site} color={color} />
      <SharedFooter site={site} color={color} />
      <MobileCta site={site} color={color} />
      {site.whatsapp && <FloatingWhatsApp whatsapp={site.whatsapp} />}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 3 — MINIMAL (editorial, lots of whitespace)
// ════════════════════════════════════════════════════════════════════════════

function MinimalNav({ site, color }: { site: Site; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white" role="banner">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 border-b border-gray-100">
        <a href="#hero" className="focus-visible:outline-none focus-visible:ring-2 rounded-lg p-1 -ml-1"
          style={{ "--tw-ring-color": color } as React.CSSProperties}>
          <SiteLogo site={site} color={color} />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Hauptnavigation">
          {[
            { href: "#leistungen", label: "Leistungen" },
            { href: "#ueber-uns",  label: "Über uns", show: !!site.about_text },
            { href: "#kontakt",    label: "Kontakt" },
          ].filter(l => l.show !== false).map(l => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-gray-500 transition hover:text-gray-900 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2">
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#kontakt"
          className="hidden md:inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ borderColor: color, color, "--tw-ring-color": color } as React.CSSProperties}>
          {site.cta_text || "Anfragen"}
        </a>

        <button className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100" onClick={() => setOpen(!open)}
          aria-label={open ? "Menü schließen" : "Menü öffnen"} aria-expanded={open}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-b border-gray-100 bg-white px-5 py-3">
          {[["#leistungen","Leistungen"],["#ueber-uns","Über uns"],["#kontakt","Kontakt"]].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">{label}</a>
          ))}
        </div>
      )}
    </header>
  );
}

function MinimalHero({ site, color, ai, stats }: TplProps) {
  const heroImg = site.hero_image_url || getHeroImage(site.industry || "");
  return (
    <section id="hero" className="overflow-hidden bg-white" aria-label="Hero">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
        {/* Split: left content / right image */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left */}
          <div>
            <div className="anim-fade-up mb-5 h-1 w-10 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
            {ai?.hero_badge && (
              <p className="anim-fade-up mb-5 text-sm font-semibold tracking-wide" style={{ color }}>{ai.hero_badge}</p>
            )}
            <h1 className="anim-fade-up anim-delay-100 mb-6 text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {site.hero_headline || site.company_name}
            </h1>
            <p className="anim-fade-up anim-delay-200 mb-8 max-w-lg text-lg leading-relaxed text-gray-600">
              {site.hero_subheadline}
            </p>
            <div className="anim-fade-up anim-delay-300 flex flex-wrap items-center gap-4">
              <a href="#kontakt"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
                {site.cta_text || "Jetzt anfragen"}
                <ArrowRightIcon className="h-4 w-4" />
              </a>
              {ai?.cta_secondary && (
                <a href="#leistungen" className="text-sm font-medium text-gray-500 underline underline-offset-4 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:rounded">
                  {ai.cta_secondary}
                </a>
              )}
            </div>
            {(site.phone || site.email) && (
              <div className="anim-fade-up anim-delay-400 mt-8 flex flex-wrap items-center gap-6 border-t border-gray-100 pt-8">
                {site.phone && (
                  <a href={`tel:${site.phone}`} className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2">
                    <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                    {site.phone}
                  </a>
                )}
                {site.email && (
                  <a href={`mailto:${site.email}`} className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2">
                    <MailIcon className="h-4 w-4" aria-hidden="true" />
                    {site.email}
                  </a>
                )}
              </div>
            )}
          </div>
          {/* Right: image panel */}
          <div className="relative hidden lg:block">
            {/* Subtle accent behind image */}
            <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: color }} aria-hidden="true" />
            <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5">
              <img
                src={heroImg}
                alt=""
                className="aspect-[4/3] w-full object-cover"
                fetchPriority="high"
              />
              {/* Floating trust badge */}
              <div className="absolute bottom-5 left-5 rounded-2xl bg-white/95 px-4 py-3.5 shadow-lg backdrop-blur-sm ring-1 ring-gray-100">
                <div className="mb-1 flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-3.5 w-3.5" />)}
                </div>
                <div className="text-sm font-bold text-gray-900">5,0 · Sehr gut</div>
                <div className="text-xs text-gray-500">Kundenbewertungen</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        {stats.length > 0 && (
          <div className="mt-14 grid grid-cols-2 gap-8 border-t border-gray-100 pt-10 sm:grid-cols-4" aria-label="Kennzahlen">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-gray-900 sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MinimalServices({ services, color, site }: { services: ServiceItem[]; color: string; site: Site }) {
  const ref = useReveal();
  const ai = site.ai_content as AIContent;
  const autoImgs = getGalleryImages(site.industry || "", slugHash(site.slug));
  return (
    <section id="leistungen" className="border-t border-gray-100 bg-white py-16 sm:py-24" aria-labelledby="minimal-services-heading">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-6">
        <div className="mb-16">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Leistungen</p>
          <h2 id="minimal-services-heading" className="text-3xl font-bold text-gray-900 sm:text-4xl">Was wir für Sie tun</h2>
        </div>
        <div className="grid grid-cols-1 gap-0 divide-y divide-gray-100">
          {services.map((s, i) => (
            <div
              key={i}
              className={`reveal group flex items-start gap-6 py-8 sm:gap-10 reveal-delay-${Math.min(i + 1, 6)}`}
            >
              <div className="w-8 flex-shrink-0 pt-1">
                <span className="text-lg font-bold tabular-nums" style={{ color }}>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{s.title}</h3>
                {s.description && <p className="text-base leading-relaxed text-gray-600">{s.description}</p>}
              </div>
              <div className="hidden h-24 w-36 flex-shrink-0 overflow-hidden rounded-xl sm:block lg:w-44">
                <img
                  src={ai?.service_images?.[i] || autoImgs[i % autoImgs.length]}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MinimalAbout({ site, color, ai }: { site: Site; color: string; ai: AIContent }) {
  const ref = useReveal();
  return (
    <section id="ueber-uns" className="bg-white" aria-labelledby="minimal-about-heading">
      {/* Full-width image strip */}
      <div className="relative h-56 overflow-hidden sm:h-72">
        <img
          src={site.about_image_url || getAboutImage(site.industry || "")}
          alt={`${site.company_name} — Team`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" aria-hidden="true" />
      </div>

      <div className="py-20 sm:py-28">
        <div ref={ref} className="reveal mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Über uns</p>
              <h2 id="minimal-about-heading" className="text-3xl font-bold text-gray-900">
                {ai?.about_headline || site.company_name}
              </h2>
            </div>
            <div className="lg:col-span-2">
              <p className="mb-6 text-lg leading-relaxed text-gray-700">{site.about_text}</p>
              {ai?.about_highlight && (
                <p className="mb-6 text-2xl font-bold leading-tight" style={{ color }}>
                  „{ai.about_highlight}"
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-6 border-t border-gray-100 pt-6">
                {site.phone && (
                  <a href={`tel:${site.phone}`} className="flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-gray-900 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2">
                    <PhoneIcon className="h-4 w-4" aria-hidden="true" /> {site.phone}
                  </a>
                )}
                {site.email && (
                  <a href={`mailto:${site.email}`} className="flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-gray-900 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2">
                    <MailIcon className="h-4 w-4" aria-hidden="true" /> {site.email}
                  </a>
                )}
                {site.address && (
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4" aria-hidden="true" /> {site.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MinimalCta({ site, color, ai }: { site: Site; color: string; ai: AIContent }) {
  return (
    <section className="border-t border-b border-gray-100 bg-gray-50 py-16 sm:py-20" aria-label="Call to Action">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            {ai?.cta_section_headline && (
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{ai.cta_section_headline}</h2>
            )}
            {ai?.cta_section_text && (
              <p className="mt-4 text-lg text-gray-600">{ai.cta_section_text}</p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            {site.phone && (
              <a href={`tel:${site.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold text-white transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
                <PhoneIcon className="h-4 w-4" />
                {site.phone}
              </a>
            )}
            <a href="#kontakt"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-7 py-3.5 text-base font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2">
              Schreiben Sie uns
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function MinimalContact({ site, color }: { site: Site; color: string }) {
  const ref = useReveal();
  return (
    <section id="kontakt" className="bg-gray-50 py-16 sm:py-24" aria-labelledby="minimal-contact-heading">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Kontakt</p>
          <h2 id="minimal-contact-heading" className="text-3xl font-bold text-gray-900">Jetzt Kontakt aufnehmen</h2>
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-6">
            {site.phone && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Telefon</p>
                <a href={`tel:${site.phone}`} className="flex items-center gap-2 text-base font-semibold text-gray-900 transition hover:opacity-70">
                  <span className="flex-shrink-0" style={{ color }}><PhoneIcon className="h-4 w-4" /></span>
                  {site.phone}
                </a>
              </div>
            )}
            {site.email && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">E-Mail</p>
                <a href={`mailto:${site.email}`} className="flex items-center gap-2 text-base font-semibold text-gray-900 transition hover:opacity-70 break-all">
                  <span className="flex-shrink-0" style={{ color }}><MailIcon className="h-4 w-4" /></span>
                  {site.email}
                </a>
              </div>
            )}
            {site.address && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Adresse</p>
                <p className="flex items-start gap-2 text-base font-semibold text-gray-900">
                  <span className="mt-0.5 flex-shrink-0" style={{ color }}><MapPinIcon className="h-4 w-4" /></span>
                  <span className="leading-relaxed">{site.address}</span>
                </p>
              </div>
            )}
          </div>
          <div className="lg:col-span-2 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <ContactForm color={color} siteId={site.id} siteSlug={site.slug} />
          </div>
        </div>
      </div>
    </section>
  );
}

function MinimalTestimonials({ color, site }: { color: string; site: Site }) {
  const ref = useReveal();
  const aiGenerated = (site.ai_content as AIContent)?.testimonials;
  const reviews = site.testimonials?.length === 3
    ? site.testimonials
    : (aiGenerated?.length === 3 ? aiGenerated : DEFAULT_TESTIMONIALS);
  return (
    <section className="border-t border-gray-100 bg-white py-16 sm:py-24" aria-labelledby="minimal-reviews-heading">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-6">
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Kundenstimmen</p>
            <h2 id="minimal-reviews-heading" className="text-3xl font-bold text-gray-900">Was unsere Kunden sagen</h2>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 flex-shrink-0">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4" />)}
            <span className="ml-1 text-sm font-semibold text-gray-700">5,0</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={i} className={`reveal reveal-delay-${i + 1}`}>
              <div className="mb-4 flex gap-0.5 text-amber-400">
                {[...Array(5)].map((_, j) => <StarIcon key={j} className="h-3.5 w-3.5" />)}
              </div>
              <blockquote className="mb-6">
                <p className="text-base leading-relaxed text-gray-700">„{r.text}"</p>
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-gray-100 pt-5">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                >
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function MinimalTemplate(props: TplProps) {
  const { site, color, ai, services } = props;
  return (
    <div className="min-h-screen bg-white antialiased">
      <MinimalNav site={site} color={color} />
      <MinimalHero {...props} />
      <GalleryStrip industry={site.industry || ""} seed={slugHash(site.slug)} className="py-4 bg-white" />
      <MinimalServices services={services} color={color} site={site} />
      {site.about_text && <MinimalAbout site={site} color={color} ai={ai} />}
      <MinimalTestimonials color={color} site={site} />
      <MinimalCta site={site} color={color} ai={ai} />
      <MinimalContact site={site} color={color} />
      <SharedFooter site={site} color={color} />
      <MobileCta site={site} color={color} />
      {site.whatsapp && <FloatingWhatsApp whatsapp={site.whatsapp} />}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 4 — ARZT (Warm & Trust — Arztpraxis Vertrauen)
// ════════════════════════════════════════════════════════════════════════════

function ArztNav({ site, color }: { site: Site; color: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const navLinks = [
    { href: "#leistungen", label: "Leistungen" },
    { href: "#team", label: "Team" },
    { href: "#kontakt", label: "Kontakt" },
  ];
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-sm border-b border-gray-100" : "bg-white border-b border-gray-100"}`} role="banner">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#hero" className="focus-visible:outline-none focus-visible:ring-2 rounded-lg p-1 -ml-1" style={{ "--tw-ring-color": color } as React.CSSProperties}>
          <SiteLogo site={site} color={color} />
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Hauptnavigation">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 transition hover:text-gray-900 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2" style={{ "--tw-ring-color": color } as React.CSSProperties}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {site.phone && (
            <a href={`tel:${site.phone}`}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
              <PhoneIcon className="h-3.5 w-3.5" />
              Termin vereinbaren
            </a>
          )}
        </div>
        <button className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2"
          onClick={() => setOpen(!open)} aria-label={open ? "Menü schließen" : "Menü öffnen"} aria-expanded={open}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-3">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">{l.label}</a>
          ))}
          {site.phone && (
            <a href={`tel:${site.phone}`} className="mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: color }}>
              <PhoneIcon className="h-4 w-4" /> {site.phone}
            </a>
          )}
        </div>
      )}
    </header>
  );
}

function ArztHero({ site, color, ai }: TplProps) {
  const heroImg = site.hero_image_url || getHeroImage(site.industry || "");
  return (
    <section id="hero" className="relative min-h-[85vh] overflow-hidden" aria-label="Hero">
      {/* Full-screen photo */}
      <div className="absolute inset-0" aria-hidden="true">
        <img src={heroImg} alt="" className="h-full w-full object-cover" fetchPriority="high" />
        {/* Light gradient from left — keeps photo visible on right, readable text on left */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/70 to-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
      </div>

      <div className="relative flex min-h-[85vh] items-center">
        <div className="mx-auto w-full max-w-7xl px-8 py-24 sm:px-12 lg:px-16">
          <div className="max-w-xl">
            {(ai?.hero_badge || ai?.trust_badge) ? (
              <div className="anim-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">{ai.hero_badge || ai.trust_badge}</span>
              </div>
            ) : (
              <div className="anim-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700">Kassenärztlich zugelassen</span>
              </div>
            )}

            <h1 className="anim-fade-up anim-delay-100 mb-6 text-5xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              {site.hero_headline || site.company_name}
            </h1>

            <p className="anim-fade-up anim-delay-200 mb-9 text-lg leading-relaxed text-gray-700 sm:text-xl">
              {site.hero_subheadline}
            </p>

            <div className="anim-fade-up anim-delay-300 flex flex-wrap items-center gap-4">
              <a href="#kontakt"
                className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-xl transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
                Termin vereinbaren
                <ArrowRightIcon className="h-4 w-4" />
              </a>
              {site.phone && (
                <a href={`tel:${site.phone}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-6 py-4 text-base font-semibold text-gray-800 backdrop-blur-sm transition hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:rounded focus-visible:ring-2">
                  <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                  {site.phone}
                </a>
              )}
            </div>

            {/* Opening hours pill */}
            <div className="anim-fade-up anim-delay-400 mt-8 inline-flex items-center gap-2.5 rounded-2xl border border-gray-200 bg-white/80 px-5 py-3 backdrop-blur-sm">
              <span className="text-base leading-none">🕐</span>
              <span className="text-sm font-medium text-gray-700">Mo–Fr 8–18 Uhr · Sa nach Vereinbarung</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArztTrustStrip({ color }: { color: string }) {
  const signals = ["Alle Kassen", "15+ Jahre Erfahrung", "Modernste Technik", "Diskrete Behandlung"];
  return (
    <div className="border-y border-gray-100 bg-gray-50 py-5" aria-label="Vertrauenssignale">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {signals.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color }} aria-hidden="true">
                <CheckSmallIcon className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArztServices({ services, color, site }: { services: ServiceItem[]; color: string; site: Site }) {
  const ref = useReveal();
  const isDental = /zahn|dental/i.test(site.industry || "");
  const serviceIcons = isDental
    ? ["🦷", "🪥", "😁", "✨", "👶", "🔬", "🏥", "💎"]
    : ["🩺", "💊", "🩻", "🔬", "🫀", "💉", "🩹", "🔬"];
  return (
    <section id="leistungen" className="bg-white py-20 sm:py-28" aria-labelledby="arzt-services-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Leistungen</p>
          <h2 id="arzt-services-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Unsere medizinischen Leistungen</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-gray-600">Wir bieten Ihnen umfassende medizinische Versorgung auf höchstem Niveau.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article key={i} className={`reveal group rounded-3xl bg-gray-50 p-7 ring-1 ring-gray-100 transition-all duration-300 hover:bg-white hover:shadow-lg hover:ring-gray-200 reveal-delay-${Math.min(i + 1, 6)}`}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: `${color}18` }} aria-hidden="true">
                {serviceIcons[i % serviceIcons.length]}
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">{s.title}</h3>
              {s.description && <p className="text-sm leading-relaxed text-gray-600">{s.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArztTeam({ site, color, ai }: { site: Site; color: string; ai: AIContent }) {
  const ref = useReveal();
  // Only show real team members extracted by AI — never invent people
  const members: TeamMemberItem[] = ai?.team_members?.filter(m => m.name?.trim()).slice(0, 4) ?? [];
  // If no real team data, show a minimal team placeholder card instead
  if (members.length === 0) {
    return (
      <section id="team" className="bg-gray-50 py-16 sm:py-20" aria-labelledby="arzt-team-heading">
        <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl bg-white p-10 shadow-sm ring-1 ring-gray-100 sm:flex-row">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Unser Team</p>
              <h2 id="arzt-team-heading" className="mb-2 text-2xl font-bold text-gray-900">Persönliche Betreuung</h2>
              <p className="max-w-md text-base text-gray-600">Unser erfahrenes Team steht Ihnen mit Herzlichkeit und Fachkompetenz zur Seite. Wir nehmen uns Zeit für Sie.</p>
            </div>
            <a href="#kontakt"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-2xl px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: color }}>
              Termin vereinbaren <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="team" className="bg-gray-50 py-20 sm:py-28" aria-labelledby="arzt-team-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Unser Team</p>
          <h2 id="arzt-team-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Ihre Ansprechpartner</h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-gray-600">Menschen, die sich mit Herz für Ihre Gesundheit einsetzen.</p>
        </div>
        <div className={`grid grid-cols-1 gap-6 ${members.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : "sm:grid-cols-3"} ${members.length === 4 ? "lg:grid-cols-4" : ""}`}>
          {members.map((m, i) => {
            const initials = m.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={i} className={`reveal reveal-delay-${i + 1} rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100`}>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: color }} aria-hidden="true">
                  {initials}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900">{m.name}</h3>
                <p className="mb-4 text-sm font-medium" style={{ color }}>{m.title}</p>
                {m.bio && <p className="text-sm leading-relaxed text-gray-600">{m.bio}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ArztTestimonials({ color, site }: { color: string; site: Site }) {
  const ref = useReveal();
  const aiGenerated = (site.ai_content as AIContent)?.testimonials;
  const reviews = site.testimonials?.length === 3
    ? site.testimonials
    : (aiGenerated?.length === 3 ? aiGenerated : DEFAULT_PATIENT_TESTIMONIALS);
  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="arzt-reviews-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Patientenstimmen</p>
          <h2 id="arzt-reviews-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Was unsere Patienten sagen</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={i} className={`reveal reveal-delay-${i + 1} rounded-3xl bg-gray-50 p-8 ring-1 ring-gray-100`}>
              <div className="mb-5 flex gap-0.5 text-amber-400" aria-label="5 Sterne">
                {[...Array(5)].map((_, j) => <StarIcon key={j} className="h-4 w-4" />)}
              </div>
              <blockquote className="mb-6">
                <p className="text-base leading-relaxed text-gray-700">„{r.text}"</p>
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: color }} aria-hidden="true">
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArztKarriere({ site, color }: { site: Site; color: string }) {
  const ref = useReveal();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));
  const perks = [
    { icon: "❤️", label: "Herzliches Miteinander" },
    { icon: "💶", label: "Faire Vergütung" },
    { icon: "📚", label: "Regelmäßige Fortbildungen" },
    { icon: "⏰", label: "Flexible Arbeitszeiten" },
  ];
  const inp = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-0";
  const lbl = "mb-1.5 block text-sm font-medium text-gray-700";
  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: `${color}0d` }} aria-labelledby="arzt-karriere-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Karriere</p>
            <h2 id="arzt-karriere-heading" className="mb-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Werden Sie Teil unseres Teams</h2>
            <p className="mb-8 text-base leading-relaxed text-gray-600">
              Wir sind ein aufgeschlossenes Praxisteam und freuen uns immer über engagierte Verstärkung — ob erfahren oder als Berufseinsteiger/in. Schreiben Sie uns einfach.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {perks.map((p, i) => (
                <div key={i} className={`reveal reveal-delay-${i + 1} flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100`}>
                  <span className="text-xl" aria-hidden="true">{p.icon}</span>
                  <span className="text-sm font-medium text-gray-800">{p.label}</span>
                </div>
              ))}
            </div>
            {site.email && (
              <p className="mt-6 text-sm text-gray-500">
                Oder direkt per E-Mail:{" "}
                <a href={`mailto:${site.email}`} className="font-medium underline underline-offset-2 transition hover:opacity-70" style={{ color }}>{site.email}</a>
              </p>
            )}
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Initiativbewerbung</h3>
            {sent ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-green-50 px-6 py-12 text-center ring-1 ring-green-100">
                <CheckCircleIcon className="mb-3 h-10 w-10 text-green-600" />
                <p className="font-semibold text-gray-900">Bewerbung erhalten!</p>
                <p className="mt-1 text-sm text-gray-600">Wir melden uns schnellstmöglich bei Ihnen.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4" noValidate>
                <div>
                  <label className={lbl}>Name *</label>
                  <input required className={inp} placeholder="Ihr vollständiger Name" value={form.name} onChange={update("name")} style={{ "--tw-ring-color": color } as React.CSSProperties} />
                </div>
                <div>
                  <label className={lbl}>E-Mail *</label>
                  <input required type="email" className={inp} placeholder="ihre@email.de" value={form.email} onChange={update("email")} style={{ "--tw-ring-color": color } as React.CSSProperties} />
                </div>
                <div>
                  <label className={lbl}>Kurze Vorstellung *</label>
                  <textarea required rows={4} className={inp} placeholder="Was bringen Sie mit? Was suchen Sie?" value={form.message} onChange={update("message")} style={{ "--tw-ring-color": color } as React.CSSProperties} />
                </div>
                <button type="submit" className="w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
                  Bewerbung absenden →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArztContact({ site, color }: { site: Site; color: string }) {
  const ref = useReveal();
  const hours = [
    { day: "Montag–Freitag", time: "08:00 – 18:00 Uhr" },
    { day: "Samstag", time: "09:00 – 13:00 Uhr" },
    { day: "Sonntag", time: "Geschlossen" },
  ];
  return (
    <section id="kontakt" className="bg-gray-50 py-20 sm:py-28" aria-labelledby="arzt-contact-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Kontakt</p>
            <h2 id="arzt-contact-heading" className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Wir sind für Sie da</h2>
            <p className="mb-8 text-base leading-relaxed text-gray-600">Vereinbaren Sie noch heute Ihren Termin – telefonisch, per E-Mail oder über unser Kontaktformular.</p>
            <div className="mb-8 space-y-3">
              {site.phone && (
                <a href={`tel:${site.phone}`} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }}><PhoneIcon className="h-5 w-5" /></div>
                  <div><p className="text-xs font-medium uppercase tracking-wider text-gray-500">Telefon</p><p className="text-base font-semibold text-gray-900">{site.phone}</p></div>
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }}><MailIcon className="h-5 w-5" /></div>
                  <div><p className="text-xs font-medium uppercase tracking-wider text-gray-500">E-Mail</p><p className="text-base font-semibold text-gray-900">{site.email}</p></div>
                </a>
              )}
              {site.address && (
                <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }}><MapPinIcon className="h-5 w-5" /></div>
                  <div><p className="text-xs font-medium uppercase tracking-wider text-gray-500">Adresse</p><p className="text-base font-semibold text-gray-900">{site.address}</p></div>
                </div>
              )}
            </div>
            {/* Opening hours table */}
            <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Öffnungszeiten</h3>
              <div className="space-y-2.5">
                {hours.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{h.day}</span>
                    <span className={h.time === "Geschlossen" ? "text-gray-400" : "font-semibold text-gray-900"}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Termin anfragen</h3>
            <ContactForm color={color} siteId={site.id} siteSlug={site.slug} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ArztTemplate(props: TplProps) {
  const { site, color, ai, services } = props;
  return (
    <div className="min-h-screen bg-white antialiased">
      <ArztNav site={site} color={color} />
      <ArztHero {...props} />
      <ArztTrustStrip color={color} />
      <ArztServices services={services} color={color} site={site} />
      <ArztTeam site={site} color={color} ai={ai} />
      <ArztTestimonials color={color} site={site} />
      <ArztKarriere site={site} color={color} />
      <ArztContact site={site} color={color} />
      <SharedFooter site={site} color={color} />
      <MobileCta site={site} color={color} />
      {site.whatsapp && <FloatingWhatsApp whatsapp={site.whatsapp} />}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 5 — ARZT MODERN (Premium patients, specialist, cutting-edge)
// ════════════════════════════════════════════════════════════════════════════

function ArztModernNav({ site, color }: { site: Site; color: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-sm" : "bg-transparent"}`} role="banner">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#hero" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg p-1 -ml-1">
          <SiteLogo site={site} color={color} white={!scrolled} />
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Hauptnavigation">
          {[
            { href: "#leistungen", label: "Leistungen" },
            { href: "#team", label: "Team" },
            { href: "#kontakt", label: "Kontakt" },
          ].map(l => (
            <a key={l.href} href={l.href}
              className={`text-sm font-medium transition hover:opacity-100 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/75 hover:text-white"}`}>
              {l.label}
            </a>
          ))}
        </nav>
        {site.phone && (
          <a href={`tel:${site.phone}`}
            className={`hidden md:inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${scrolled ? "text-white hover:opacity-90" : "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"}`}
            style={scrolled ? { backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties : undefined}>
            <PhoneIcon className="h-3.5 w-3.5" />
            Termin buchen
          </a>
        )}
        <button className={`md:hidden rounded-lg p-2 transition focus-visible:outline-none focus-visible:ring-2 ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}
          onClick={() => setOpen(!open)} aria-label={open ? "Menü schließen" : "Menü öffnen"} aria-expanded={open}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-3 shadow-xl">
          {[["#leistungen","Leistungen"],["#team","Team"],["#kontakt","Kontakt"]].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">{label}</a>
          ))}
          {site.phone && (
            <a href={`tel:${site.phone}`} className="mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: color }}>
              <PhoneIcon className="h-4 w-4" /> {site.phone}
            </a>
          )}
        </div>
      )}
    </header>
  );
}

function ArztModernHero({ site, color, ai, stats }: TplProps) {
  return (
    <section id="hero" className="relative flex min-h-screen flex-col justify-center overflow-hidden" aria-label="Hero">
      <div className="absolute inset-0" aria-hidden="true">
        <img src={site.hero_image_url || getHeroImage(site.industry || "")} alt="" className="h-full w-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/75 via-gray-900/65 to-gray-900/80" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-8 py-28 sm:px-12 lg:px-16">
        {/* Trust badges row — left aligned */}
        <div className="anim-fade-up mb-8 flex flex-wrap items-center gap-3">
          {["🏥 Privatarzt", "✓ Zertifiziert", "⭐ Top-Bewertungen"].map((badge, i) => (
            <span key={i} className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {badge}
            </span>
          ))}
        </div>
        <h1 className="anim-fade-up anim-delay-100 mb-6 max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {site.hero_headline || site.company_name}
        </h1>
        <p className="anim-fade-up anim-delay-200 mb-10 max-w-xl text-xl leading-relaxed text-white/80">
          {site.hero_subheadline}
        </p>
        <div className="anim-fade-up anim-delay-300 flex flex-wrap items-center gap-4">
          <a href="#kontakt"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white shadow-xl transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ backgroundColor: color }}>
            Termin buchen
            <ArrowRightIcon className="h-4 w-4" />
          </a>
          <a href="#leistungen"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
            Unsere Leistungen
          </a>
          {site.phone && (
            <a href={`tel:${site.phone}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white/50">
              <PhoneIcon className="h-4 w-4" />
              {site.phone}
            </a>
          )}
        </div>
        {stats.length > 0 && (
          <div className="anim-fade-up anim-delay-400 mt-16 grid max-w-3xl grid-cols-2 gap-x-12 gap-y-6 border-t border-white/15 pt-10 sm:grid-cols-4" aria-label="Kennzahlen">
            {stats.map((s, i) => (
              <div key={i} className="text-left">
                <div className="text-2xl font-bold text-white sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-white/55">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ArztModernStats({ stats }: { stats: StatItem[] }) {
  return (
    <section className="bg-gray-900 py-12" aria-label="Praxis-Kennzahlen">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-white sm:text-4xl">{s.value}</div>
              <div className="mt-1.5 text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArztModernServices({ services, color, site }: { services: ServiceItem[]; color: string; site: Site }) {
  const ref = useReveal();
  const ai = site.ai_content as AIContent;
  const autoImgs = getGalleryImages(site.industry || "", slugHash(site.slug));
  return (
    <section id="leistungen" className="bg-white py-20 sm:py-28" aria-labelledby="arzt-modern-services-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Leistungen</p>
          <h2 id="arzt-modern-services-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Medizinische Excellence</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article key={i} className={`reveal group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl reveal-delay-${Math.min(i + 1, 6)}`}>
              <div className="relative h-52 overflow-hidden">
                <img src={ai?.service_images?.[i] || autoImgs[i % autoImgs.length]} alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />
                <h3 className="absolute bottom-4 left-5 right-4 text-lg font-bold leading-snug text-white">{s.title}</h3>
              </div>
              <div className="p-6">
                {s.description && <p className="text-sm leading-relaxed text-gray-600">{s.description}</p>}
                <div className="mt-4 h-0.5 w-8 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArztModernTech({ color }: { color: string }) {
  const ref = useReveal();
  const techs = [
    { icon: "🔬", title: "Digitale Diagnostik", desc: "Modernste bildgebende Verfahren und digitale Auswertungsmethoden für präzise Diagnosen in kürzester Zeit." },
    { icon: "💻", title: "Elektronische Patientenakte", desc: "Volldigitalisierte Prozesse für maximale Effizienz und lückenlose Dokumentation Ihrer Gesundheitshistorie." },
    { icon: "🧬", title: "Innovative Therapieverfahren", desc: "Zugang zu neuesten medizinischen Erkenntnissen und zugelassenen Behandlungsmethoden auf internationalem Niveau." },
  ];
  return (
    <section className="bg-gray-50 py-20 sm:py-28" aria-labelledby="arzt-modern-tech-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Technologie</p>
          <h2 id="arzt-modern-tech-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Modernste Diagnostik &amp; Therapie</h2>
        </div>
        <div className="space-y-8">
          {techs.map((t, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center ${i % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}>
              <div className={`rounded-3xl bg-white p-10 shadow-sm ring-1 ring-gray-100 ${i % 2 !== 0 ? "lg:order-2" : ""}`}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ backgroundColor: `${color}15` }} aria-hidden="true">{t.icon}</div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">{t.title}</h3>
                <p className="text-base leading-relaxed text-gray-600">{t.desc}</p>
              </div>
              <div className={`h-48 rounded-3xl lg:h-64 ${i % 2 !== 0 ? "lg:order-1" : ""}`} style={{ backgroundColor: `${color}08` }} aria-hidden="true">
                <div className="flex h-full items-center justify-center text-7xl opacity-30">{t.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArztModernTeam({ site, color, ai }: { site: Site; color: string; ai: AIContent }) {
  const ref = useReveal();
  const members: TeamMemberItem[] = ai?.team_members?.filter(m => m.name?.trim()).slice(0, 4) ?? [];
  if (members.length === 0) return null; // Don't show section with fake people
  return (
    <section id="team" className="bg-white py-20 sm:py-28" aria-labelledby="arzt-modern-team-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Unser Team</p>
          <h2 id="arzt-modern-team-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Experten für Ihre Gesundheit</h2>
        </div>
        <div className={`grid grid-cols-1 gap-6 ${members.length <= 2 ? "sm:grid-cols-2 max-w-2xl" : "sm:grid-cols-3"} ${members.length === 4 ? "lg:grid-cols-4" : ""}`}>
          {members.map((m, i) => {
            const initials = m.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={i} className={`reveal reveal-delay-${i + 1} group rounded-3xl bg-gray-900 p-8 text-center transition hover:-translate-y-1 hover:shadow-xl`}>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg ring-4 ring-white/10"
                  style={{ backgroundColor: color }} aria-hidden="true">{initials}</div>
                <h3 className="mb-1 text-lg font-semibold text-white">{m.name}</h3>
                <p className="mb-4 text-sm font-medium" style={{ color }}>{m.title}</p>
                {m.bio && <p className="text-sm leading-relaxed text-gray-400">{m.bio}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ArztModernTestimonials({ color, site }: { color: string; site: Site }) {
  const ref = useReveal();
  const aiGenerated = (site.ai_content as AIContent)?.testimonials;
  const reviews = site.testimonials?.length === 3
    ? site.testimonials
    : (aiGenerated?.length === 3 ? aiGenerated : DEFAULT_PATIENT_TESTIMONIALS);
  return (
    <section className="bg-gray-50 py-20 sm:py-28" aria-labelledby="arzt-modern-reviews-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Patientenstimmen</p>
            <h2 id="arzt-modern-reviews-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Was Patienten sagen</h2>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-5 w-5" />)}
            <span className="ml-1.5 text-sm font-semibold text-gray-700">5,0</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={i} className={`reveal reveal-delay-${i + 1} flex flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100`}>
              <div className="mb-5 flex gap-0.5 text-amber-400"><StarIcon className="h-4 w-4" /><StarIcon className="h-4 w-4" /><StarIcon className="h-4 w-4" /><StarIcon className="h-4 w-4" /><StarIcon className="h-4 w-4" /></div>
              <blockquote className="flex-1"><p className="text-base leading-relaxed text-gray-700">„{r.text}"</p></blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: color }} aria-hidden="true">{r.name[0]}</div>
                <div><p className="text-sm font-semibold text-gray-900">{r.name}</p><p className="text-xs text-gray-500">{r.role}</p></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArztModernKarriere({ site, color }: { site: Site; color: string }) {
  return (
    <section className="relative overflow-hidden py-20" style={{ backgroundColor: color }} aria-label="Karriere">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/60">Karriere</p>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Werden Sie Teil unserer Praxis</h2>
        <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
          Wir suchen engagierte Fachkräfte, die mit Leidenschaft und Expertise unsere Patienten begleiten. MFA, Arzthelfer/in und Auszubildende willkommen.
        </p>
        <a href={`mailto:${site.email || ""}`}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold shadow-xl transition hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2"
          style={{ color }}>
          Jetzt bewerben
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function ArztModernContact({ site, color }: { site: Site; color: string }) {
  const ref = useReveal();
  const hours = [
    { day: "Mo–Fr", time: "08:00 – 18:00 Uhr" },
    { day: "Sa", time: "09:00 – 13:00 Uhr" },
    { day: "So", time: "Geschlossen" },
  ];
  return (
    <section id="kontakt" className="bg-white py-20 sm:py-28" aria-labelledby="arzt-modern-contact-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Kontakt</p>
            <h2 id="arzt-modern-contact-heading" className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Termin vereinbaren</h2>
            <p className="mb-8 text-base leading-relaxed text-gray-600">Wir freuen uns auf Ihren Kontakt. Unser Team beantwortet Anfragen innerhalb von 24 Stunden.</p>
            <div className="mb-8 space-y-3">
              {site.phone && (
                <a href={`tel:${site.phone}`} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4 transition hover:bg-gray-100">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }}><PhoneIcon className="h-5 w-5" /></div>
                  <div><p className="text-xs font-medium uppercase tracking-wider text-gray-500">Telefon</p><p className="text-base font-semibold text-gray-900">{site.phone}</p></div>
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4 transition hover:bg-gray-100">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }}><MailIcon className="h-5 w-5" /></div>
                  <div><p className="text-xs font-medium uppercase tracking-wider text-gray-500">E-Mail</p><p className="text-base font-semibold text-gray-900">{site.email}</p></div>
                </a>
              )}
              {site.address && (
                <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: color }}><MapPinIcon className="h-5 w-5" /></div>
                  <div><p className="text-xs font-medium uppercase tracking-wider text-gray-500">Adresse</p><p className="text-base font-semibold text-gray-900">{site.address}</p></div>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-gray-100 p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Öffnungszeiten</h3>
              {hours.map((h, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-50 py-2.5 last:border-0 text-sm">
                  <span className="font-medium text-gray-700">{h.day}</span>
                  <span className={h.time === "Geschlossen" ? "text-gray-400" : "font-semibold text-gray-900"}>{h.time}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-gray-50 p-8 ring-1 ring-gray-100">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Nachricht senden</h3>
            <ContactForm color={color} siteId={site.id} siteSlug={site.slug} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ArztModernTemplate(props: TplProps) {
  const { site, color, ai, services, stats } = props;
  return (
    <div className="min-h-screen bg-white antialiased">
      <ArztModernNav site={site} color={color} />
      <ArztModernHero {...props} />
      <ArztModernStats stats={stats} />
      <ArztModernServices services={services} color={color} site={site} />
      <ArztModernTech color={color} />
      <ArztModernTeam site={site} color={color} ai={ai} />
      <ArztModernTestimonials color={color} site={site} />
      <ArztModernKarriere site={site} color={color} />
      <ArztModernContact site={site} color={color} />
      <SharedFooter site={site} color={color} />
      <MobileCta site={site} color={color} />
      {site.whatsapp && <FloatingWhatsApp whatsapp={site.whatsapp} />}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 6 — HANDWERK (Bold & Reliable — customer + employee acquisition)
// ════════════════════════════════════════════════════════════════════════════

function HandwerkNav({ site, color }: { site: Site; color: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-sm" : "bg-transparent"}`} role="banner">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#hero" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg p-1 -ml-1">
          <SiteLogo site={site} color={color} white={!scrolled} />
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Hauptnavigation">
          {[
            { href: "#leistungen", label: "Leistungen" },
            { href: "#referenzen", label: "Referenzen" },
            { href: "#kontakt", label: "Kontakt" },
          ].map(l => (
            <a key={l.href} href={l.href}
              className={`text-sm font-medium transition hover:opacity-100 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"}`}>
              {l.label}
            </a>
          ))}
        </nav>
        {site.phone && (
          <a href={`tel:${site.phone}`}
            className={`hidden md:inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${scrolled ? "text-white hover:opacity-90" : "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"}`}
            style={scrolled ? { backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties : undefined}>
            <PhoneIcon className="h-3.5 w-3.5" />
            {site.phone}
          </a>
        )}
        <button className={`md:hidden rounded-lg p-2 transition focus-visible:outline-none focus-visible:ring-2 ${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}
          onClick={() => setOpen(!open)} aria-label={open ? "Menü schließen" : "Menü öffnen"} aria-expanded={open}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-3 shadow-xl">
          {[["#leistungen","Leistungen"],["#referenzen","Referenzen"],["#kontakt","Kontakt"]].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">{label}</a>
          ))}
          {site.phone && (
            <a href={`tel:${site.phone}`} className="mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: color }}>
              <PhoneIcon className="h-4 w-4" /> {site.phone}
            </a>
          )}
        </div>
      )}
    </header>
  );
}

function HandwerkHero({ site, color, ai }: TplProps) {
  return (
    <section id="hero" className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden" aria-label="Hero">
      <div className="absolute inset-0" aria-hidden="true">
        <img src={site.hero_image_url || getHeroImage(site.industry || "")} alt="" className="h-full w-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-8 py-28 sm:px-12 lg:px-16">
        {/* Prominent phone */}
        {site.phone && (
          <a href={`tel:${site.phone}`}
            className="anim-fade-up mb-6 inline-flex items-center gap-3 text-3xl font-black text-white transition hover:opacity-80 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white/50">
            <PhoneIcon className="h-7 w-7" />
            {site.phone}
          </a>
        )}
        <h1 className="anim-fade-up anim-delay-100 mb-6 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {site.hero_headline || site.company_name}
        </h1>
        <p className="anim-fade-up anim-delay-200 mb-10 max-w-lg text-lg leading-relaxed text-white/80 sm:text-xl">
          {site.hero_subheadline}
        </p>
        <div className="anim-fade-up anim-delay-300 flex flex-wrap items-center gap-4">
          <a href="#kontakt"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-xl transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ backgroundColor: color }}>
            Kostenlos anfragen
            <ArrowRightIcon className="h-4 w-4" />
          </a>
          <a href="#referenzen"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
            Referenzen ansehen
          </a>
        </div>
        {/* Trust row */}
        <div className="anim-fade-up anim-delay-400 mt-10 flex flex-wrap items-center gap-6">
          {["Festpreisgarantie", "10 Jahre Garantie", "TÜV-zertifiziert"].map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckSmallIcon className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-white">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HandwerkEmergency({ site, color }: { site: Site; color: string }) {
  const isRelevant = !!(site.industry || "").toLowerCase().match(/sanitär|elektro|klima|heiz|gas|rohre|wasser/);
  if (!site.phone || !isRelevant) return null;
  return (
    <div className="bg-orange-600 py-4" role="alert" aria-label="Notfallservice">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-white">
          <span className="text-lg font-black">⚡ 24/7 Notfallservice — Wir sind für Sie da</span>
          <a href={`tel:${site.phone}`}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-sm font-bold transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            style={{ color: "#ea580c" }}>
            <PhoneIcon className="h-4 w-4" />
            {site.phone}
          </a>
        </div>
      </div>
    </div>
  );
}

function HandwerkServices({ services, color, site }: { services: ServiceItem[]; color: string; site: Site }) {
  const ref = useReveal();
  const ai = site.ai_content as AIContent;
  const autoImgs = getGalleryImages(site.industry || "", slugHash(site.slug));
  return (
    <section id="leistungen" className="bg-white py-20 sm:py-28" aria-labelledby="handwerk-services-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-widest" style={{ color }}>Leistungen</p>
          <h2 id="handwerk-services-heading" className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">Was wir für Sie tun</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article key={i} className={`reveal group overflow-hidden rounded-2xl bg-gray-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl reveal-delay-${Math.min(i + 1, 6)}`}>
              <div className="relative h-48 overflow-hidden">
                <img src={ai?.service_images?.[i] || autoImgs[i % autoImgs.length]} alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" loading="lazy" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-lg font-bold text-white">{s.title}</h3>
                {s.description && <p className="mb-4 text-sm leading-relaxed text-gray-400">{s.description}</p>}
                <a href="#kontakt" className="inline-flex items-center gap-1 text-sm font-semibold transition hover:gap-2" style={{ color }}>
                  Mehr erfahren <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HandwerkGallery({ site }: { site: Site }) {
  const ref = useReveal();
  const imgs = getGalleryImages(site.industry || "", slugHash(site.slug));
  // Use 6 images — duplicate if needed
  const galleryImgs = imgs.length >= 6 ? imgs.slice(0, 6) : [...imgs, ...imgs, ...imgs].slice(0, 6);
  return (
    <section id="referenzen" className="bg-gray-50 py-20 sm:py-28" aria-labelledby="handwerk-gallery-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 id="handwerk-gallery-heading" className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">Unsere Arbeit spricht für sich</h2>
          <p className="mt-3 text-base text-gray-600">Einblicke in abgeschlossene Projekte und realisierte Arbeiten.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImgs.map((src, i) => (
            <div key={i} className={`reveal reveal-delay-${Math.min(i + 1, 6)} group overflow-hidden rounded-2xl`}>
              <img src={src} alt="" className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HandwerkBenefits({ benefits, color }: { benefits: BenefitItem[]; color: string }) {
  const ref = useReveal();
  const icons = ["🏆", "🔧", "📋", "⚡"];
  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="handwerk-benefits-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 id="handwerk-benefits-heading" className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">Warum Kunden uns wählen</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} rounded-2xl bg-gray-50 p-7 text-center`}>
              <div className="mb-4 flex h-14 w-14 mx-auto items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${color}18` }} aria-hidden="true">
                {icons[i % icons.length]}
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900">{b.title}</h3>
              {b.description && <p className="text-sm leading-relaxed text-gray-600">{b.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HandwerkTestimonials({ color, site }: { color: string; site: Site }) {
  const ref = useReveal();
  const aiGenerated = (site.ai_content as AIContent)?.testimonials;
  const reviews = site.testimonials?.length === 3
    ? site.testimonials
    : (aiGenerated?.length === 3 ? aiGenerated : DEFAULT_TESTIMONIALS);
  return (
    <section className="bg-gray-900 py-20 sm:py-28" aria-labelledby="handwerk-reviews-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-widest" style={{ color }}>Kundenstimmen</p>
          <h2 id="handwerk-reviews-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl">Was unsere Kunden sagen</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={i} className={`reveal reveal-delay-${i + 1} rounded-2xl bg-gray-800 p-8`}>
              <div className="mb-5 flex gap-0.5 text-amber-400">{[...Array(5)].map((_, j) => <StarIcon key={j} className="h-4 w-4" />)}</div>
              <blockquote className="mb-6"><p className="text-base leading-relaxed text-gray-300">„{r.text}"</p></blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: color }} aria-hidden="true">{r.name[0]}</div>
                <div><p className="text-sm font-semibold text-white">{r.name}</p><p className="text-xs text-gray-500">{r.role}</p></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function HandwerkRecruitment({ color }: { color: string }) {
  const ref = useReveal();
  const positions = [
    { title: "Geselle/in", desc: "Für alle Gewerke · Vollzeit" },
    { title: "Azubi", desc: "Ausbildungsstelle · Ab September" },
    { title: "Helfer/in", desc: "Unterstützung im Tagesgeschäft · Vollzeit" },
  ];
  const benefits = ["Faire Bezahlung", "Moderne Werkzeuge", "Weiterbildung", "Kollegiales Team"];
  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: `${color}0d` }} aria-labelledby="handwerk-recruitment-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="mb-2.5 text-xs font-bold uppercase tracking-widest" style={{ color }}>Jobs</p>
            <h2 id="handwerk-recruitment-heading" className="mb-5 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">Wir suchen Verstärkung</h2>
            <p className="mb-8 text-base leading-relaxed text-gray-600">Wir wachsen und suchen engagierte Kolleginnen und Kollegen, die mit uns anpacken wollen.</p>
            <div className="space-y-3">
              {positions.map((p, i) => (
                <a key={i} href="#kontakt" className={`reveal reveal-delay-${i + 1} flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1`}>
                  <div>
                    <p className="font-bold text-gray-900">{p.title}</p>
                    <p className="text-sm text-gray-500">{p.desc}</p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Was wir bieten</h3>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color }} aria-hidden="true">
                    <CheckSmallIcon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-base font-medium text-gray-800">{b}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-gray-100 pt-8">
              <a href="#kontakt"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
                Jetzt bewerben
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HandwerkContact({ site, color }: { site: Site; color: string }) {
  const ref = useReveal();
  return (
    <section id="kontakt" className="bg-white py-20 sm:py-28" aria-labelledby="handwerk-contact-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-2.5 text-xs font-bold uppercase tracking-widest" style={{ color }}>Kontakt</p>
            <h2 id="handwerk-contact-heading" className="mb-3 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">Jetzt anfragen</h2>
            <p className="mb-8 text-base leading-relaxed text-gray-600">Schildern Sie uns Ihr Anliegen — wir melden uns innerhalb von 24 Stunden mit einem unverbindlichen Angebot.</p>
            {site.phone && (
              <a href={`tel:${site.phone}`}
                className="mb-6 flex items-center gap-4 rounded-2xl py-5 px-6 text-white shadow-xl transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
                <PhoneIcon className="h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Jetzt anrufen</p>
                  <p className="text-xl font-black">{site.phone}</p>
                </div>
              </a>
            )}
            <div className="space-y-3">
              {site.email && (
                <a href={`mailto:${site.email}`} className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 text-gray-700 transition hover:bg-gray-100">
                  <MailIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  <span className="text-sm font-medium">{site.email}</span>
                </a>
              )}
              {site.address && (
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 text-gray-700">
                  <MapPinIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  <span className="text-sm font-medium">{site.address}</span>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-gray-50 p-8 ring-1 ring-gray-100">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Kostenlose Anfrage</h3>
            <ContactForm color={color} siteId={site.id} siteSlug={site.slug} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HandwerkTemplate(props: TplProps) {
  const { site, color, ai, services, benefits } = props;
  return (
    <div className="min-h-screen bg-white antialiased">
      <HandwerkNav site={site} color={color} />
      <HandwerkHero {...props} />
      <HandwerkEmergency site={site} color={color} />
      <HandwerkServices services={services} color={color} site={site} />
      <HandwerkGallery site={site} />
      {benefits.length > 0 && <HandwerkBenefits benefits={benefits} color={color} />}
      <HandwerkTestimonials color={color} site={site} />
      <HandwerkRecruitment color={color} />
      <HandwerkContact site={site} color={color} />
      <SharedFooter site={site} color={color} />
      <MobileCta site={site} color={color} />
      {site.whatsapp && <FloatingWhatsApp whatsapp={site.whatsapp} />}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  TEMPLATE 7 — HANDWERK LOKAL (Family business, local community feel)
// ════════════════════════════════════════════════════════════════════════════

function HandwerkLokalNav({ site, color }: { site: Site; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm" role="banner">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#hero" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg p-1 -ml-1"
          style={{ "--tw-ring-color": color } as React.CSSProperties}>
          <SiteLogo site={site} color={color} />
        </a>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Hauptnavigation">
          {[
            { href: "#leistungen", label: "Leistungen" },
            { href: "#ueber-uns", label: "Über uns" },
            { href: "#kontakt", label: "Kontakt" },
          ].map(l => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-gray-600 transition hover:text-gray-900 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2"
              style={{ "--tw-ring-color": color } as React.CSSProperties}>{l.label}</a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {site.phone && (
            <a href={`tel:${site.phone}`}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
              <PhoneIcon className="h-3.5 w-3.5" />
              Anrufen
            </a>
          )}
        </div>
        <button className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2"
          onClick={() => setOpen(!open)} aria-label={open ? "Menü schließen" : "Menü öffnen"} aria-expanded={open}>
          {open ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-3">
          {[["#leistungen","Leistungen"],["#ueber-uns","Über uns"],["#kontakt","Kontakt"]].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">{label}</a>
          ))}
          {site.phone && (
            <a href={`tel:${site.phone}`} className="mt-2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: color }}>
              <PhoneIcon className="h-4 w-4" /> {site.phone}
            </a>
          )}
        </div>
      )}
    </header>
  );
}

function HandwerkLokalHero({ site, color, ai }: TplProps) {
  const heroImg = site.hero_image_url || getHeroImage(site.industry || "");
  const stats = ai?.stats || [];
  return (
    <section id="hero" className="relative min-h-[90vh] overflow-hidden" aria-label="Hero">
      {/* Full-bleed background photo */}
      <img
        src={heroImg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      {/* Dark gradient — heavy from left, fades to subtle on right */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" aria-hidden="true" />
      {/* Subtle bottom vignette for grounding */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />

      {/* Content */}
      <div className="relative flex min-h-[90vh] flex-col justify-center px-8 py-24 sm:px-12 lg:px-20">
        <div className="max-w-2xl">
          {/* Local badge */}
          <div className="anim-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <MapPinIcon className="h-3.5 w-3.5 text-white/70" aria-hidden="true" />
            <span className="text-sm font-medium text-white/90">
              {site.address ? site.address.split(",")[0] : "Ihr lokaler Fachbetrieb"}
            </span>
          </div>

          <h1 className="anim-fade-up anim-delay-100 mb-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {site.hero_headline || site.company_name}
          </h1>
          <p className="anim-fade-up anim-delay-200 mb-9 max-w-lg text-lg leading-relaxed text-white/80">
            {site.hero_subheadline}
          </p>

          {/* CTAs */}
          <div className="anim-fade-up anim-delay-300 flex flex-col gap-3 sm:flex-row">
            <a
              href="#kontakt"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              style={{ backgroundColor: color }}
            >
              {site.cta_text || "Kostenlos anfragen"}
            </a>
            {site.phone && (
              <a
                href={`tel:${site.phone}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <PhoneIcon className="h-4 w-4" />
                {site.phone}
              </a>
            )}
          </div>

          {/* Trust strip */}
          {stats.length > 0 && (
            <div className="anim-fade-up anim-delay-400 mt-10 flex flex-wrap gap-6 border-t border-white/15 pt-8">
              {stats.slice(0, 3).map((s, i) => (
                <div key={i}>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-xs font-medium text-white/60">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-40" aria-hidden="true">
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}

function HandwerkLokalTrust({ color }: { color: string }) {
  const signals = [
    { emoji: "📍", label: "In Ihrer Region" },
    { emoji: "👨‍👩‍👧", label: "Familienbetrieb" },
    { emoji: "🤝", label: "Persönlicher Kontakt" },
    { emoji: "⚡", label: "Schnelle Reaktion" },
  ];
  return (
    <div className="border-b border-gray-100 bg-white py-5" aria-label="Vertrauenssignale">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {signals.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">{s.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HandwerkLokalServices({ services, color, site }: { services: ServiceItem[]; color: string; site: Site }) {
  const ref = useReveal();
  const ai = site.ai_content as AIContent;
  const autoImgs = getGalleryImages(site.industry || "", slugHash(site.slug));
  return (
    <section id="leistungen" className="bg-white py-20 sm:py-28" aria-labelledby="hw-lokal-services-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Leistungen</p>
          <h2 id="hw-lokal-services-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Handwerk mit Herz</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-gray-600">Zuverlässige handwerkliche Leistungen aus einer Hand — für Privat und Gewerbe.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article key={i} className={`reveal group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg reveal-delay-${Math.min(i + 1, 6)}`}>
              <div className="relative h-40 overflow-hidden">
                <img src={ai?.service_images?.[i] || autoImgs[i % autoImgs.length]} alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ backgroundColor: color }} aria-hidden="true">
                  <CheckSmallIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="mb-2 text-base font-semibold text-gray-900">{s.title}</h3>
                {s.description && <p className="text-sm leading-relaxed text-gray-600">{s.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HandwerkLokalGeschichte({ site, color, ai }: { site: Site; color: string; ai: AIContent }) {
  const ref = useReveal();
  return (
    <section id="ueber-uns" className="bg-gray-50 py-20 sm:py-28" aria-labelledby="hw-lokal-about-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Unsere Geschichte</p>
            <h2 id="hw-lokal-about-heading" className="mb-5 text-3xl font-bold leading-snug tracking-tight text-gray-900 sm:text-4xl">
              {ai?.about_headline || `${site.company_name} — Ihr lokaler Partner`}
            </h2>
            {site.about_text && <p className="mb-6 text-base leading-relaxed text-gray-700">{site.about_text}</p>}
            {ai?.about_highlight && (
              <blockquote className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="mb-3 flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4" />)}
                </div>
                <p className="text-base font-semibold italic text-gray-800">„{ai.about_highlight}"</p>
                <p className="mt-2 text-sm font-medium" style={{ color }}>— {site.company_name}</p>
              </blockquote>
            )}
            <a href="#kontakt"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
              Jetzt Kontakt aufnehmen
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-3xl shadow-xl">
              <img src={site.about_image_url || getAboutImage(site.industry || "")} alt={`Team ${site.company_name}`}
                className="aspect-[4/3] w-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HandwerkLokalGallery({ site }: { site: Site }) {
  const ref = useReveal();
  const imgs = getGalleryImages(site.industry || "", slugHash(site.slug));
  const galleryImgs = imgs.length >= 4 ? imgs.slice(0, 4) : [...imgs, ...imgs].slice(0, 4);
  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="hw-lokal-gallery-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <h2 id="hw-lokal-gallery-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Unsere Arbeiten</h2>
          <p className="mt-3 text-base text-gray-600">Stolze Referenzen aus Ihrer Nachbarschaft.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {galleryImgs.map((src, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} group overflow-hidden rounded-2xl`}>
              <img src={src} alt="" className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-72" loading="lazy" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HandwerkLokalTestimonials({ color, site }: { color: string; site: Site }) {
  const ref = useReveal();
  const aiGenerated = (site.ai_content as AIContent)?.testimonials;
  const reviews = site.testimonials?.length === 3
    ? site.testimonials
    : (aiGenerated?.length === 3 ? aiGenerated : DEFAULT_TESTIMONIALS);
  return (
    <section className="bg-gray-50 py-20 sm:py-28" aria-labelledby="hw-lokal-reviews-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Bewertungen</p>
          <h2 id="hw-lokal-reviews-heading" className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Zufriedene Kunden aus der Region</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {reviews.map((r, i) => (
            <figure key={i} className={`reveal reveal-delay-${i + 1} rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100`}>
              <div className="mb-4 flex gap-1 text-amber-400">{[...Array(5)].map((_, j) => <StarIcon key={j} className="h-4 w-4" />)}</div>
              <blockquote className="mb-4"><p className="text-sm leading-relaxed text-gray-700">„{r.text}"</p></blockquote>
              <figcaption className="text-sm font-semibold text-gray-900">{r.name}</figcaption>
              <p className="text-xs text-gray-500">{r.role}</p>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function HandwerkLokalAusbildung({ site, color }: { site: Site; color: string }) {
  const ref = useReveal();
  const benefits = [
    "Praxisnahe Ausbildung von Anfang an",
    "Persönliche Betreuung durch erfahrene Kollegen",
    "Faire Ausbildungsvergütung",
    "Gute Übernahmechancen nach Abschluss",
    "Moderne Werkzeuge und Arbeitskleidung gestellt",
  ];
  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: `${color}0d` }} aria-labelledby="hw-lokal-ausbildung-heading">
      <div ref={ref} className="reveal mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 shadow-sm ring-1 ring-gray-100">
              <span className="text-xl" aria-hidden="true">🎓</span>
              <span className="text-sm font-semibold text-gray-800">Ausbildungsplatz verfügbar</span>
            </div>
            <h2 id="hw-lokal-ausbildung-heading" className="mb-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Wir bilden aus!
            </h2>
            <p className="mb-8 text-base leading-relaxed text-gray-600">
              Starte deine Karriere im Handwerk bei uns. Als Familienbetrieb legen wir besonders viel Wert auf eine persönliche und praxisnahe Ausbildung.
            </p>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <div key={i} className={`reveal reveal-delay-${i + 1} flex items-center gap-3`}>
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: color }} aria-hidden="true">
                    <CheckSmallIcon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100 text-center">
            <div className="mb-5 text-6xl" aria-hidden="true">🔧</div>
            <h3 className="mb-3 text-2xl font-bold text-gray-900">Interesse geweckt?</h3>
            <p className="mb-8 text-base text-gray-600">
              Wir freuen uns auf deine Bewerbung! Ruf uns einfach an oder schick uns eine Nachricht.
            </p>
            {site.phone && (
              <a href={`tel:${site.phone}`}
                className="mb-4 flex items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold text-white shadow-lg transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}>
                <PhoneIcon className="h-5 w-5" />
                {site.phone}
              </a>
            )}
            <a href="#kontakt"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2">
              Jetzt bewerben →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HandwerkLokalContact({ site, color }: { site: Site; color: string }) {
  const ref = useReveal();
  return (
    <section id="kontakt" className="bg-white py-20 sm:py-28" aria-labelledby="hw-lokal-contact-heading">
      <div ref={ref} className="reveal mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color }}>Kontakt</p>
          <h2 id="hw-lokal-contact-heading" className="mb-3 text-3xl font-bold tracking-tight text-gray-900">Sprechen Sie uns an</h2>
          <p className="text-base text-gray-600">Wir kommen zu Ihnen — persönlich, pünktlich, zuverlässig.</p>
        </div>
        <div className="overflow-hidden rounded-3xl shadow-sm ring-1 ring-gray-100 lg:grid lg:grid-cols-5">
          <div className="p-8 sm:p-10 lg:col-span-2" style={{ backgroundColor: color }}>
            <h3 className="mb-8 text-xl font-bold text-white">Hier finden Sie uns</h3>
            <div className="space-y-6">
              {site.address && (
                <div className="flex items-start gap-4 text-white/90">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15"><MapPinIcon className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Adresse</p>
                    <p className="mt-0.5 font-semibold leading-relaxed">{site.address}</p>
                  </div>
                </div>
              )}
              {site.phone && (
                <a href={`tel:${site.phone}`} className="flex items-start gap-4 text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white/60">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15"><PhoneIcon className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Telefon</p>
                    <p className="mt-0.5 font-semibold">{site.phone}</p>
                  </div>
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`} className="flex items-start gap-4 text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-white/60">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15"><MailIcon className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/60">E-Mail</p>
                    <p className="mt-0.5 font-semibold break-all">{site.email}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
          <div className="bg-white p-8 sm:p-10 lg:col-span-3">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Nachricht senden</h3>
            <ContactForm color={color} siteId={site.id} siteSlug={site.slug} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HandwerkLokalTemplate(props: TplProps) {
  const { site, color, ai, services } = props;
  return (
    <div className="min-h-screen bg-white antialiased">
      <HandwerkLokalNav site={site} color={color} />
      <HandwerkLokalHero {...props} />
      <HandwerkLokalTrust color={color} />
      <HandwerkLokalServices services={services} color={color} site={site} />
      <HandwerkLokalGeschichte site={site} color={color} ai={ai} />
      <HandwerkLokalGallery site={site} />
      <HandwerkLokalTestimonials color={color} site={site} />
      <HandwerkLokalAusbildung site={site} color={color} />
      <HandwerkLokalContact site={site} color={color} />
      <SharedFooter site={site} color={color} />
      <MobileCta site={site} color={color} />
      {site.whatsapp && <FloatingWhatsApp whatsapp={site.whatsapp} />}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════

export default function GeneratedSite({ site }: { site: Site }) {
  const color = site.primary_color || "#2563eb";
  const ai = (site.ai_content || {}) as AIContent;
  const isMedical = isMedicalIndustry(site.industry || "");

  // Services: ai_content.services_detailed → site.services titles → industry fallback (always ≥ 3)
  const rawServices: ServiceItem[] = ai?.services_detailed?.length
    ? ai.services_detailed
    : (site.services || []).map(s => ({ title: s, description: "" }));
  const services: ServiceItem[] = rawServices.length >= 3
    ? rawServices
    : [...rawServices, ...getDefaultServices(site.industry || "").slice(0, Math.max(3, 6) - rawServices.length)];

  // Benefits: ai_content → site.benefits titles → DEFAULT_BENEFITS (always ≥ 3)
  const rawBenefits: BenefitItem[] = ai?.benefits_detailed?.length
    ? ai.benefits_detailed
    : (site.benefits || []).map(b => ({ title: b, description: "" }));
  const benefits: BenefitItem[] = rawBenefits.length >= 3
    ? rawBenefits
    : [...rawBenefits, ...DEFAULT_BENEFITS.slice(0, 4 - rawBenefits.length)];

  // Keine erfundenen Stats — nur aus echten Scraper-Daten
  const stats: StatItem[] = ai?.stats?.length ? ai.stats : [];

  const props: TplProps = { site, color, ai, services, benefits, stats, isMedical };

  // Ein einziges exzellentes Template — adaptiert sich automatisch nach Branche
  return <PremiumTemplate {...props} />;
}


// ════════════════════════════════════════════════════════════════════════════
//  ICONS
// ════════════════════════════════════════════════════════════════════════════

function PhoneIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>;
}
function MailIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
}
function MapPinIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
}
function WhatsAppIcon({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
}
function ArrowRightIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>;
}
function MenuIcon() {
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
}
function XIcon() {
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
}
function StarIcon({ className }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
}
function CheckCircleIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function CheckSmallIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>;
}
