import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import GeneratedSite from "@/components/GeneratedSite";
import AdminBar from "@/components/AdminBar";
import type { Site } from "@/lib/types";

interface Props { params: Promise<{ slug: string }> }

async function getSite(slug: string): Promise<Site | null> {
  const { data } = await supabase.from("sites").select("*").eq("slug", slug).single();
  return (data as Site) ?? null;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) return { title: "Nicht gefunden" };

  const title = site.meta_title || `${site.company_name} – ${site.industry || "Ihr lokaler Experte"}`;
  const description = site.meta_description || site.hero_subheadline || `${site.company_name} – professionelle Leistungen. Jetzt Kontakt aufnehmen.`;

  const initials = site.company_name.split(/\s+/).map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const color = encodeURIComponent(site.primary_color || "#1f2937");
  const svgFavicon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='${color}'/><text x='50' y='68' font-family='system-ui,sans-serif' font-size='48' font-weight='900' text-anchor='middle' fill='white'>${initials}</text></svg>`;
  const faviconHref = site.logo_url || svgFavicon;

  return {
    title,
    description,
    icons: { icon: faviconHref, apple: faviconHref },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "de_DE",
      siteName: site.company_name,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function SitePage({ params }: Props) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) notFound();
  return (
    <>
      <AdminBar slug={slug} companyName={site.company_name} />
      {/* Abstand damit Admin-Bar die Website nicht überdeckt */}
      <div style={{ paddingTop: "40px" }}>
        <GeneratedSite site={site} />
      </div>
    </>
  );
}
