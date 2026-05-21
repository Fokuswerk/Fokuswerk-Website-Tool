import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SiteEditCms from "@/components/SiteEditCms";
import DeleteButton from "@/app/dashboard/DeleteButton";
import type { Site } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

async function getSite(id: string): Promise<Site | null> {
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Site;
}

export const dynamic = "force-dynamic";

export default async function EditSitePage({ params }: Props) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-700 transition"
              aria-label="Zurück"
            >
              <BackIcon />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{site.company_name}</h1>
              <p className="text-sm text-gray-400">Website bearbeiten</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/site/${site.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <ExternalIcon />
              Vorschau
            </a>
            <DeleteButton siteId={site.id} companyName={site.company_name} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">
        <SiteEditCms site={site} />
      </main>
    </div>
  );
}

function BackIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}
