"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DeleteButton({
  siteId,
  companyName,
  iconOnly = false,
}: {
  siteId: string;
  companyName: string;
  iconOnly?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("sites").delete().eq("id", siteId);
    if (error) {
      alert(`Fehler beim Löschen: ${error.message}`);
      setDeleting(false);
      setConfirming(false);
      return;
    }
    router.refresh();
    router.push("/dashboard");
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 whitespace-nowrap">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
        >
          {deleting ? "…" : "✓ Löschen"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2"
        >
          ✕
        </button>
      </div>
    );
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`${companyName} löschen`}
        title="Löschen"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
      >
        <TrashIcon />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`${companyName} löschen`}
      className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-200 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
    >
      Löschen
    </button>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}
