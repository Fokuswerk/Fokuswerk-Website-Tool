import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { DEFAULT_IMPRESSUM } from "@/lib/legalTemplates";
import type { Site } from "@/lib/types";

interface Props { params: Promise<{ slug: string }> }

async function getData(slug: string) {
  const [siteRes, settingsRes] = await Promise.all([
    supabase.from("sites").select("*").eq("slug", slug).single(),
    supabase.from("settings").select("value").eq("key", "impressum_template").single(),
  ]);
  return { site: siteRes.data as Site | null, template: settingsRes.data?.value || DEFAULT_IMPRESSUM };
}

function interpolate(template: string, site: Site) {
  return template
    .replace(/{company_name}/g, site.company_name)
    .replace(/{address}/g, site.address ?? "")
    .replace(/{contact_person}/g, site.contact_person ?? "")
    .replace(/{phone}/g, site.phone ?? "")
    .replace(/{email}/g, site.email ?? "");
}

export const dynamic = "force-dynamic";

export default async function ImpressumPage({ params }: Props) {
  const { slug } = await params;
  const { site, template } = await getData(slug);
  if (!site) notFound();
  const color = site.primary_color || "#2563eb";
  const content = interpolate(template, site);

  return <LegalPage site={site} color={color} title="Impressum" content={content} slug={slug} />;
}

function LegalPage({ site, color, title, content, slug }: { site: Site; color: string; title: string; content: string; slug: string }) {
  const lines = content.split("\n");
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href={`/site/${slug}`} className="text-xl font-black tracking-tight" style={{ color }}>{site.company_name}</Link>
          <Link href={`/site/${slug}`} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← Zurück zur Website</Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-10 text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
        <div className="prose prose-gray max-w-none">
          {lines.map((line, i) => {
            if (line.startsWith("## ")) return <h2 key={i} className="mt-8 mb-3 text-xl font-bold text-gray-900">{line.slice(3)}</h2>;
            if (line.startsWith("# ")) return null;
            if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-gray-900">{line.slice(2, -2)}</p>;
            if (line === "") return <br key={i} />;
            return <p key={i} className="text-gray-600 leading-relaxed">{line}</p>;
          })}
        </div>
      </main>
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} {site.company_name} —{" "}
        <Link href={`/site/${slug}/datenschutz`} className="hover:text-gray-600">Datenschutz</Link>
        {" · "}
        <Link href={`/site/${slug}/agb`} className="hover:text-gray-600">AGB</Link>
      </footer>
    </div>
  );
}
