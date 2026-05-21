import Link from "next/link";
import SiteForm from "@/components/SiteForm";

export default function NewSitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-5">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-700 transition"
            aria-label="Zurück"
          >
            <BackIcon />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Neue Website erstellen</h1>
            <p className="text-sm text-gray-400">URL eingeben → alles andere wird automatisch generiert</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
          <SiteForm />
        </div>
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
