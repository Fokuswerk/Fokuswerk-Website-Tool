"use client";

import Link from "next/link";
import { Wache } from "./wache";

const BEREICHE = [
  {
    href: "/admin/beitraege",
    titel: "Beiträge",
    text: "Neuigkeiten für die Seite „Aktuelles“ schreiben, ändern oder zurückziehen.",
  },
  {
    href: "/admin/galerie",
    titel: "Galerie",
    text: "Fotos hochladen, beschriften und nach Jahren einsortieren.",
  },
];

export default function AdminStart() {
  return (
    <Wache titel="Willkommen">
      {() => (
        <div className="grid gap-5 sm:grid-cols-2">
          {BEREICHE.map((bereich) => (
            <Link
              key={bereich.href}
              href={bereich.href}
              className="group rounded-2xl border border-sand-200 bg-paper p-7 transition-colors hover:border-ink/25"
            >
              <h2 className="text-h3 text-ink">{bereich.titel}</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-70">
                {bereich.text}
              </p>
            </Link>
          ))}

          <p className="text-[0.9375rem] leading-relaxed text-ink-70 sm:col-span-2">
            Alles, was hier gespeichert wird, steht sofort auf der Website.
            Beiträge erscheinen erst, wenn sie auf „veröffentlicht“ stehen –
            vorher können Sie in Ruhe daran arbeiten.
          </p>
        </div>
      )}
    </Wache>
  );
}
