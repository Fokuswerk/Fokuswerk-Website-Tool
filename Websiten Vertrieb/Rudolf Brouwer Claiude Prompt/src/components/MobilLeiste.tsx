import Link from "next/link";
import { betrieb } from "@/lib/daten";

export default function MobilLeiste() {
  return (
    <div className="auf-dunkel fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-white/10 bg-tiefer md:hidden">
      <a
        href={`tel:${betrieb.telefonRaw}`}
        className="t-label t-zahl flex h-[72px] items-center justify-center gap-2 text-papier"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6.6 3h-.9A2.7 2.7 0 0 0 3 5.7c0 8.4 6.9 15.3 15.3 15.3a2.7 2.7 0 0 0 2.7-2.7v-.9a1.5 1.5 0 0 0-1.1-1.4l-3-.8a1.5 1.5 0 0 0-1.6.6l-.8 1.2a12 12 0 0 1-5.4-5.4l1.2-.8a1.5 1.5 0 0 0 .6-1.6l-.8-3A1.5 1.5 0 0 0 6.6 3Z"/></svg> {betrieb.telefon}
      </a>
      <Link
        href="/kontakt"
        className="t-label flex h-[72px] items-center justify-center bg-kupfer text-papier"
      >
        Termin
      </Link>
    </div>
  );
}
