"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { seitenErneuern } from "../aktualisieren";
import { knopfLeiseStil, knopfStil, Wache } from "../wache";

type Zeile = {
  id: string;
  slug: string;
  titel: string;
  datum: string;
  kategorie: string;
  veroeffentlicht: boolean;
};

export default function BeitraegeVerwaltung() {
  return <Wache titel="Beiträge">{(client) => <Liste client={client} />}</Wache>;
}

function Liste({ client }: { client: SupabaseClient }) {
  const [zeilen, setZeilen] = useState<Zeile[]>([]);
  const [laedt, setLaedt] = useState(true);
  const [fehler, setFehler] = useState("");

  const holen = useCallback(async () => {
    setLaedt(true);
    const { data, error } = await client
      .from("beitraege")
      .select("id, slug, titel, datum, kategorie, veroeffentlicht")
      .order("datum", { ascending: false });
    if (error) setFehler(error.message);
    setZeilen((data as Zeile[]) ?? []);
    setLaedt(false);
  }, [client]);

  useEffect(() => {
    holen();
  }, [holen]);

  async function umschalten(zeile: Zeile) {
    const { error } = await client
      .from("beitraege")
      .update({ veroeffentlicht: !zeile.veroeffentlicht })
      .eq("id", zeile.id);
    if (error) setFehler(error.message);
    await holen();
    await seitenErneuern();
  }

  async function loeschen(zeile: Zeile) {
    if (!confirm(`„${zeile.titel}“ wirklich löschen?`)) return;
    const { error } = await client.from("beitraege").delete().eq("id", zeile.id);
    if (error) setFehler(error.message);
    await holen();
    await seitenErneuern();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-[0.9375rem] leading-relaxed text-ink-70">
          Hier stehen die Beiträge, die Sie selbst geschrieben haben. Die
          Beiträge, die schon auf der Website waren, bleiben bestehen, auch
          wenn sie in dieser Liste nicht auftauchen.
        </p>
        <Link href="/admin/beitraege/neu" className={knopfStil}>
          Neuer Beitrag
        </Link>
      </div>

      {fehler ? (
        <p className="rounded-lg bg-glow-soft px-4 py-3 text-sm text-glow-deep">
          {fehler}
        </p>
      ) : null}

      {laedt ? (
        <p className="text-ink-50">Wird geladen …</p>
      ) : zeilen.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sand-300 px-6 py-12 text-center text-[1.0625rem] text-ink-70">
          Noch kein eigener Beitrag. Legen Sie oben rechts den ersten an.
        </p>
      ) : (
        <ul className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-paper">
          {zeilen.map((zeile) => (
            <li
              key={zeile.id}
              className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold tracking-[0.1em] text-sea uppercase">
                  <span>{zeile.kategorie}</span>
                  <span aria-hidden="true" className="h-px w-5 bg-sand-300" />
                  <time className="text-ink-50 tabular-nums">{zeile.datum}</time>
                  {!zeile.veroeffentlicht ? (
                    <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[0.65rem] text-ink-70">
                      Entwurf
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 text-[1.0625rem] font-semibold text-ink">
                  {zeile.titel}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => umschalten(zeile)}
                  className={knopfLeiseStil}
                >
                  {zeile.veroeffentlicht ? "Zurückziehen" : "Veröffentlichen"}
                </button>
                <Link href={`/admin/beitraege/${zeile.id}`} className={knopfLeiseStil}>
                  Bearbeiten
                </Link>
                <button
                  type="button"
                  onClick={() => loeschen(zeile)}
                  className={knopfLeiseStil}
                >
                  Löschen
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
