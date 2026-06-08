"use client";

import { useState } from "react";

export default function AdminBar({ slug, companyName }: { slug: string; companyName: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/site/${slug}` : `/site/${slug}`;

  function copy() {
    const fullUrl = `${window.location.origin}/site/${slug}`;
    navigator.clipboard.writeText(fullUrl).catch(() => {
      const input = document.createElement("input");
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="fixed top-0 inset-x-0 z-[9999] flex items-center gap-3 bg-gray-900/95 backdrop-blur-sm px-4 py-2 text-white text-xs shadow-lg">
      {/* Label */}
      <span className="rounded bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-gray-900 uppercase tracking-wide flex-shrink-0">
        Demo
      </span>

      {/* URL — klickbar, truncated */}
      <a
        href={`/site/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 truncate font-mono text-[11px] text-gray-300 hover:text-white transition min-w-0"
        title={`${typeof window !== "undefined" ? window.location.origin : ""}/site/${slug}`}
      >
        {typeof window !== "undefined" ? window.location.origin : ""}/site/{slug}
      </a>

      {/* Copy Button */}
      <button
        onClick={copy}
        className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
          copied
            ? "bg-green-500 text-white"
            : "bg-white text-gray-900 hover:bg-gray-100"
        }`}
      >
        {copied ? (
          <><CheckIcon /> Link kopiert!</>
        ) : (
          <><CopyIcon /> Link kopieren</>
        )}
      </button>

      {/* Dashboard Link */}
      <a
        href="/dashboard"
        className="flex-shrink-0 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:text-white hover:border-white/40 transition"
      >
        ← Dashboard
      </a>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
