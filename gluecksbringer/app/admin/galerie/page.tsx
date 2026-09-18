"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { bildAdresse } from "@/lib/supabase";
import { seitenErneuern } from "../aktualisieren";
import { bildAufbereiten, dateinameBauen } from "../hilfen";
import {
  eingabeStil,
  Feld,
  knopfLeiseStil,
  knopfStil,
  Wache,
} from "../wache";

type Eintrag = {
  id: string;
  jahr: string;
  pfad: string;
  breite: number;
  hoehe: number;
  alt: string;
  unterschrift: string | null;
  einpassen: boolean;
  sortierung: number;
};

export default function GalerieVerwaltung() {
  return <Wache titel="Galerie">{(client) => <Inhalt client={client} />}</Wache>;
}

function Inhalt({ client }: { client: SupabaseClient }) {
  const [bilder, setBilder] = useState<Eintrag[]>([]);
  const [jahr, setJahr] = useState(String(new Date().getFullYear()));
  const [laedt, setLaedt] = useState(true);
  const [fortschritt, setFortschritt] = useState("");
  const [fehler, setFehler] = useState("");
  const dateiFeld = useRef<HTMLInputElement>(null);

  const holen = useCallback(async () => {
    setLaedt(true);
    const { data, error } = await client
      .from("galerie_bilder")
      .select("*")
      .order("jahr", { ascending: false })
      .order("sortierung", { ascending: true });
    if (error) setFehler(error.message);
    setBilder((data as Eintrag[]) ?? []);
    setLaedt(false);
  }, [client]);

  useEffect(() => {
    holen();
  }, [holen]);

  async function hochladen(dateien: FileList | null) {
    if (!dateien?.length) return;
    setFehler("");
    const liste = Array.from(dateien);

    for (const [nummer, datei] of liste.entries()) {
      setFortschritt(`Lade Bild ${nummer + 1} von ${liste.length} …`);
      try {
        const fertig = await bildAufbereiten(datei);
        const pfad = dateinameBauen(`galerie/${jahr}`, datei.name, fertig.endung);

        const { error: ladefehler } = await client.storage
          .from("bilder")
          .upload(pfad, fertig.datei, {
            contentType: fertig.endung === "png" ? "image/png" : "image/jpeg",
            cacheControl: "31536000",
          });
        if (ladefehler) throw ladefehler;

        const { error: schreibfehler } = await client.from("galerie_bilder").insert({
          jahr,
          pfad,
          breite: fertig.breite,
          hoehe: fertig.hoehe,
          alt: "",
          sortierung: bilder.length + nummer,
        });
        if (schreibfehler) throw schreibfehler;
      } catch (problem) {
        setFehler(
          `„${datei.name}“ konnte nicht hochgeladen werden: ${
            problem instanceof Error ? problem.message : "unbekannter Fehler"
          }`,
        );
      }
    }

    setFortschritt("");
    if (dateiFeld.current) dateiFeld.current.value = "";
    await holen();
    await seitenErneuern();
  }

  async function aendern(id: string, felder: Partial<Eintrag>) {
    setBilder((alte) =>
      alte.map((b) => (b.id === id ? { ...b, ...felder } : b)),
    );
    const { error } = await client.from("galerie_bilder").update(felder).eq("id", id);
    if (error) setFehler(error.message);
    else await seitenErneuern();
  }

  async function loeschen(eintrag: Eintrag) {
    if (!confirm("Dieses Bild wirklich von der Website nehmen?")) return;
    await client.storage.from("bilder").remove([eintrag.pfad]);
    const { error } = await client
      .from("galerie_bilder")
      .delete()
      .eq("id", eintrag.id);
    if (error) setFehler(error.message);
    await holen();
    await seitenErneuern();
  }

  const jahre = [...new Set(bilder.map((b) => b.jahr))].sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-sand-200 bg-paper p-7 sm:p-8">
        <h2 className="text-h3 text-ink">Fotos hochladen</h2>
        <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink-70">
          Sie können mehrere Bilder auf einmal auswählen. Große Handyfotos
          werden automatisch verkleinert – Sie müssen vorher nichts vorbereiten.
        </p>

        <div className="mt-6 grid gap-5 sm:max-w-md">
          <Feld beschriftung="Jahr" hinweis="Unter dieser Überschrift erscheinen die Bilder.">
            <input
              value={jahr}
              onChange={(e) => setJahr(e.target.value)}
              className={eingabeStil}
            />
          </Feld>

          <div>
            <input
              ref={dateiFeld}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => hochladen(e.target.files)}
              className="block w-full text-[0.9375rem] text-ink-70 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-3 file:text-[0.9375rem] file:font-semibold file:text-paper hover:file:bg-ink/85"
            />
          </div>
        </div>

        {fortschritt ? (
          <p className="mt-5 text-[0.9375rem] font-medium text-sea">{fortschritt}</p>
        ) : null}
        {fehler ? (
          <p className="mt-5 rounded-lg bg-alarm-soft px-4 py-3 text-sm text-alarm">
            {fehler}
          </p>
        ) : null}
      </section>

      {laedt ? (
        <p className="text-ink-50">Bilder werden geladen …</p>
      ) : bilder.length === 0 ? (
        <p className="text-[1.0625rem] text-ink-70">
          Hier stehen die Fotos, die Sie selbst hochladen. Die Bilder aus dem
          Archiv, die schon auf der Website sind, bleiben davon unberührt.
        </p>
      ) : (
        jahre.map((j) => (
          <section key={j}>
            <h2 className="text-h3 text-ink tabular-nums">{j}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {bilder
                .filter((b) => b.jahr === j)
                .map((eintrag) => (
                  <article
                    key={eintrag.id}
                    className="overflow-hidden rounded-2xl border border-sand-200 bg-paper"
                  >
                    {/* Vorschau bewusst ohne next/image: hier zählt nur, dass
                        man erkennt, welches Bild man gerade beschriftet. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bildAdresse(eintrag.pfad)}
                      alt=""
                      className="aspect-[4/3] w-full bg-sand-100 object-cover"
                    />
                    <div className="space-y-4 p-5">
                      <Feld
                        beschriftung="Bildunterschrift"
                        hinweis="Steht sichtbar unter dem Foto. Kann leer bleiben."
                      >
                        <input
                          defaultValue={eintrag.unterschrift ?? ""}
                          onBlur={(e) =>
                            aendern(eintrag.id, {
                              unterschrift: e.target.value || null,
                            })
                          }
                          className={eingabeStil}
                        />
                      </Feld>

                      <Feld
                        beschriftung="Bildbeschreibung"
                        hinweis="Für blinde Besucher und Suchmaschinen: Was ist zu sehen?"
                      >
                        <input
                          defaultValue={eintrag.alt}
                          onBlur={(e) => aendern(eintrag.id, { alt: e.target.value })}
                          className={eingabeStil}
                        />
                      </Feld>

                      <label className="flex items-start gap-3 text-[0.9375rem] text-ink-70">
                        <input
                          type="checkbox"
                          checked={eintrag.einpassen}
                          onChange={(e) =>
                            aendern(eintrag.id, { einpassen: e.target.checked })
                          }
                          className="mt-1 size-4 accent-sea"
                        />
                        <span>
                          Ganz zeigen statt zuschneiden
                          <span className="block text-sm text-ink-50">
                            Für Plakate und Zeichnungen.
                          </span>
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => loeschen(eintrag)}
                        className={`${knopfLeiseStil} w-full`}
                      >
                        Bild entfernen
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))
      )}

      <p>
        <a href="/galerie" target="_blank" rel="noopener noreferrer" className={knopfStil}>
          Galerie auf der Website ansehen
        </a>
      </p>
    </div>
  );
}
