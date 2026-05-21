"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const KEYS = ["impressum_template", "datenschutz_template", "agb_template"] as const;
type Key = (typeof KEYS)[number];

const LABELS: Record<Key, string> = {
  impressum_template: "Impressum",
  datenschutz_template: "Datenschutzerklärung",
  agb_template: "AGB",
};

export default function LegalPage() {
  const [values, setValues] = useState<Record<Key, string>>({
    impressum_template: "",
    datenschutz_template: "",
    agb_template: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<Key>("impressum_template");

  useEffect(() => {
    supabase.from("settings").select("key,value").in("key", [...KEYS]).then(({ data }) => {
      if (data) {
        const map: Partial<Record<Key, string>> = {};
        data.forEach(row => { map[row.key as Key] = row.value; });
        setValues(v => ({ ...v, ...map }));
      }
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    for (const key of KEYS) {
      await supabase.from("settings").upsert({ key, value: values[key], updated_at: new Date().toISOString() });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-5">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-700 transition-colors">
            <BackIcon />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Rechtliche Texte</h1>
            <p className="text-sm text-gray-400">Globale Vorlagen — gelten für alle generierten Websites</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {KEYS.map(key => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === key ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                {LABELS[key]}
              </button>
            ))}
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">Lädt…</div>
            ) : (
              <>
                <div className="mb-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                  <strong>Verfügbare Variablen:</strong> {"{company_name}"} · {"{address}"} · {"{contact_person}"} · {"{phone}"} · {"{email}"}
                </div>
                <textarea
                  rows={20}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={values[activeTab]}
                  onChange={e => setValues(v => ({ ...v, [activeTab]: e.target.value }))}
                />
              </>
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-gray-100 px-8 py-5">
            <button onClick={handleSave} disabled={saving || loading}
              className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50">
              {saving ? "Speichern…" : "Speichern"}
            </button>
            {saved && <span className="text-sm text-green-600 font-medium">✓ Gespeichert — gilt jetzt für alle Websites</span>}
          </div>
        </div>
      </main>
    </div>
  );
}

function BackIcon() {
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>;
}
