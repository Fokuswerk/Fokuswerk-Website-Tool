"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { SiteStatus } from "@/lib/types";

const STATUS_OPTIONS: SiteStatus[] = ["Entwurf", "Gesendet", "Interessiert", "Gewonnen", "Abgelehnt"];

const STATUS_STYLES: Record<SiteStatus, { bg: string; text: string; dot: string }> = {
  Entwurf:      { bg: "bg-gray-100",   text: "text-gray-700",   dot: "bg-gray-400" },
  Gesendet:     { bg: "bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-500" },
  Interessiert: { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-500" },
  Gewonnen:     { bg: "bg-green-50",   text: "text-green-700",  dot: "bg-green-500" },
  Abgelehnt:    { bg: "bg-red-50",     text: "text-red-600",    dot: "bg-red-400" },
};

export default function StatusSelect({ siteId, currentStatus }: { siteId: string; currentStatus: SiteStatus }) {
  const [status, setStatus] = useState<SiteStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const st = STATUS_STYLES[status];

  async function handleChange(newStatus: SiteStatus) {
    if (newStatus === status || loading) return;
    setLoading(true);
    setStatus(newStatus);
    await supabase.from("sites").update({ status: newStatus }).eq("id", siteId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={e => handleChange(e.target.value as SiteStatus)}
        disabled={loading}
        className={`appearance-none cursor-pointer rounded-full pl-6 pr-6 py-1.5 text-xs font-medium border-0 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 transition-opacity ${st.bg} ${st.text} ${loading ? "opacity-60" : ""}`}
        aria-label="Status ändern"
      >
        {STATUS_OPTIONS.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <span className={`pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full ${st.dot}`} aria-hidden="true" />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-50">▾</span>
    </div>
  );
}
