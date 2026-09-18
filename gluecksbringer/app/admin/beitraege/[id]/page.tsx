"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { bildAdresse } from "@/lib/supabase";
import { seitenErneuern } from "../../aktualisieren";
import { adresseAus, bildAufbereiten, dateinameBauen, heute } from "../../hilfen";
import {
  eingabeStil,
  Feld,
  knopfLeiseStil,
  knopfStil,
  Wache,
} from "../../wache";

/** Die Blockarten, die sich hier schreiben lassen. */
type Block =
  | { typ: "absatz"; text: string }
  | { typ: "ueberschrift"; text: string }
  | { typ: "hinweis"; text: string }
  | { typ: "liste"; punkte: string[] }
  | { typ: "bild"; bild: { src: string; width: number; height: number }; alt: string; unterschrift?: string };

type Beitrag = {
  id?: string;
  slug: string;
  titel: string;
  kategorie: string;
  datum: string;
  teaser: string;
  bild_pfad: string | null;
  bild_breite: number | null;
  bild_hoehe: number | null;
  bild_alt: string;
  inhalt: Block[];
  veroeffentlicht: boolean;
};

const LEER: Beitrag = {
  slug: "",
  titel: "",
  kategorie: "Aus dem Verein",
  datum: heute(),
  teaser: "",
  bild_pfad: null,
  bild_breite: null,
  bild_hoehe: null,
  bild_alt: "",
  inhalt: [{ typ: "absatz", text: "" }],
  veroeffentlicht: false,
};

const KATEGORIEN = ["Aus dem Verein", "Wunschbaum", "Aktion", "Danke"];

export default function BeitragBearbeiten() {
  return (
    <Wache titel="Beitrag">{(client) => <Formular client={client} />}</Wache>
  );
}

function Formular({ client }: { client: SupabaseClient }) {
  const router = useRouter();
  const parameter = useParams<{ id: string }>();
  const istNeu = parameter.id === "neu";

  // Nach dem ersten Speichern arbeiten wir mit der vergebenen Kennung weiter,
  // ohne die Seite zu wechseln – sonst verschwindet die Rückmeldung sofort.
  const [kennung, setKennung] = useState(istNeu ? "" : parameter.id);
  const [beitrag, setBeitrag] = useState<Beitrag>(LEER);
  const [laedt, setLaedt] = useState(!istNeu);
  const [meldung, setMeldung] = useState("");
  const [fehler, setFehler] = useState("");
  const [speichert, setSpeichert] = useState(false);
  const [adresseVonHand, setAdresseVonHand] = useState(!istNeu);

  const holen = useCallback(async () => {
    if (istNeu) return;
    const { data, error } = await client
      .from("beitraege")
      .select("*")
      .eq("id", parameter.id)
      .single();
    if (error) setFehler(error.message);
    if (data) setBeitrag({ ...(data as Beitrag), inhalt: data.inhalt ?? [] });
    setLaedt(false);
  }, [client, istNeu, parameter.id]);

  useEffect(() => {
    holen();
  }, [holen]);

  function setzen(felder: Partial<Beitrag>) {
    setBeitrag((alt) => ({ ...alt, ...felder }));
  }

  function bloeckeSetzen(neu: Block[]) {
    setzen({ inhalt: neu });
  }

  async function bildHochladen(datei: File, ziel: "aufmacher" | number) {
    setFehler("");
    setMeldung("Bild wird hochgeladen …");
    try {
      const fertig = await bildAufbereiten(datei);
      const pfad = dateinameBauen("beitraege", datei.name, fertig.endung);
      const { error } = await client.storage.from("bilder").upload(pfad, fertig.datei, {
        contentType: fertig.endung === "png" ? "image/png" : "image/jpeg",
        cacheControl: "31536000",
      });
      if (error) throw error;

      if (ziel === "aufmacher") {
        setzen({ bild_pfad: pfad, bild_breite: fertig.breite, bild_hoehe: fertig.hoehe });
      } else {
        const neu = [...beitrag.inhalt];
        neu[ziel] = {
          typ: "bild",
          bild: { src: bildAdresse(pfad), width: fertig.breite, height: fertig.hoehe },
          alt: (neu[ziel] as { alt?: string }).alt ?? "",
        };
        bloeckeSetzen(neu);
      }
      setMeldung("");
    } catch (problem) {
      setMeldung("");
      setFehler(
        problem instanceof Error ? problem.message : "Das Bild ließ sich nicht hochladen.",
      );
    }
  }

  async function speichern() {
    setFehler("");
    const slug = beitrag.slug || adresseAus(beitrag.titel);
    if (!beitrag.titel.trim()) return setFehler("Bitte einen Titel eingeben.");
    if (!slug) return setFehler("Bitte eine Adresse eingeben.");
    if (!beitrag.bild_pfad) return setFehler("Bitte ein Aufmacherbild hochladen.");

    setSpeichert(true);
    const datensatz = {
      slug,
      titel: beitrag.titel.trim(),
      kategorie: beitrag.kategorie,
      datum: beitrag.datum,
      teaser: beitrag.teaser.trim(),
      bild_pfad: beitrag.bild_pfad,
      bild_breite: beitrag.bild_breite,
      bild_hoehe: beitrag.bild_hoehe,
      bild_alt: beitrag.bild_alt.trim(),
      inhalt: beitrag.inhalt.filter(
        (block) => !("text" in block) || block.text.trim().length > 0,
      ),
      veroeffentlicht: beitrag.veroeffentlicht,
    };

    const { data, error } = kennung
      ? await client
          .from("beitraege")
          .update(datensatz)
          .eq("id", kennung)
          .select("id")
          .single()
      : await client.from("beitraege").insert(datensatz).select("id").single();

    setSpeichert(false);
    if (error) {
      setFehler(
        error.code === "23505"
          ? "Diese Adresse ist schon vergeben. Bitte eine andere wählen."
          : error.message,
      );
      return;
    }

    if (!kennung && data) {
      setKennung(data.id);
      // Adresse anpassen, ohne die Seite neu zu laden.
      window.history.replaceState(null, "", `/admin/beitraege/${data.id}`);
    }
    setzen({ slug });
    await seitenErneuern();
    setMeldung(
      beitrag.veroeffentlicht
        ? "Gespeichert und auf der Website sichtbar."
        : "Als Entwurf gespeichert – noch nicht auf der Website.",
    );
  }

  if (laedt) return <p className="text-ink-50">Wird geladen …</p>;

  return (
    <div className="max-w-3xl space-y-8 pb-24">
      {/* ------------------------------------------------------- Eckdaten -- */}
      <section className="space-y-5 rounded-2xl border border-sand-200 bg-paper p-7 sm:p-8">
        <Feld beschriftung="Titel">
          <input
            value={beitrag.titel}
            onChange={(e) => {
              const titel = e.target.value;
              setzen(
                adresseVonHand
                  ? { titel }
                  : { titel, slug: adresseAus(titel) },
              );
            }}
            className={eingabeStil}
          />
        </Feld>

        <Feld
          beschriftung="Adresse"
          hinweis={`Die Seite ist später erreichbar unter /aktuelles/${beitrag.slug || "…"}`}
        >
          <input
            value={beitrag.slug}
            onChange={(e) => {
              setAdresseVonHand(true);
              setzen({ slug: adresseAus(e.target.value) });
            }}
            className={eingabeStil}
          />
        </Feld>

        <div className="grid gap-5 sm:grid-cols-2">
          <Feld beschriftung="Kategorie">
            <select
              value={beitrag.kategorie}
              onChange={(e) => setzen({ kategorie: e.target.value })}
              className={eingabeStil}
            >
              {[...new Set([...KATEGORIEN, beitrag.kategorie])].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </Feld>

          <Feld beschriftung="Datum">
            <input
              type="date"
              value={beitrag.datum}
              onChange={(e) => setzen({ datum: e.target.value })}
              className={eingabeStil}
            />
          </Feld>
        </div>

        <Feld
          beschriftung="Anreißer"
          hinweis="Zwei bis drei Sätze. Stehen in der Übersicht unter dem Titel."
        >
          <textarea
            rows={3}
            value={beitrag.teaser}
            onChange={(e) => setzen({ teaser: e.target.value })}
            className={`${eingabeStil} resize-y leading-relaxed`}
          />
        </Feld>
      </section>

      {/* ---------------------------------------------------- Aufmacher ---- */}
      <section className="space-y-5 rounded-2xl border border-sand-200 bg-paper p-7 sm:p-8">
        <h2 className="text-h3 text-ink">Aufmacherbild</h2>

        {beitrag.bild_pfad ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bildAdresse(beitrag.bild_pfad)}
            alt=""
            className="aspect-[3/2] w-full rounded-xl bg-sand-100 object-cover"
          />
        ) : (
          <p className="rounded-xl border border-dashed border-sand-300 px-6 py-10 text-center text-[0.9375rem] text-ink-50">
            Noch kein Bild ausgewählt.
          </p>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const datei = e.target.files?.[0];
            if (datei) bildHochladen(datei, "aufmacher");
          }}
          className="block w-full text-[0.9375rem] text-ink-70 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-3 file:text-[0.9375rem] file:font-semibold file:text-paper hover:file:bg-ink/85"
        />

        <Feld
          beschriftung="Bildbeschreibung"
          hinweis="Für blinde Besucher und Suchmaschinen: Was ist auf dem Bild zu sehen?"
        >
          <input
            value={beitrag.bild_alt}
            onChange={(e) => setzen({ bild_alt: e.target.value })}
            className={eingabeStil}
          />
        </Feld>
      </section>

      {/* ------------------------------------------------------- Inhalt ---- */}
      <section className="space-y-5 rounded-2xl border border-sand-200 bg-paper p-7 sm:p-8">
        <h2 className="text-h3 text-ink">Text</h2>

        {beitrag.inhalt.map((block, index) => (
          <BlockZeile
            key={index}
            block={block}
            index={index}
            anzahl={beitrag.inhalt.length}
            aendern={(neu) => {
              const liste = [...beitrag.inhalt];
              liste[index] = neu;
              bloeckeSetzen(liste);
            }}
            verschieben={(richtung) => {
              const ziel = index + richtung;
              if (ziel < 0 || ziel >= beitrag.inhalt.length) return;
              const liste = [...beitrag.inhalt];
              [liste[index], liste[ziel]] = [liste[ziel], liste[index]];
              bloeckeSetzen(liste);
            }}
            entfernen={() =>
              bloeckeSetzen(beitrag.inhalt.filter((_, i) => i !== index))
            }
            bildWaehlen={(datei) => bildHochladen(datei, index)}
          />
        ))}

        <div className="flex flex-wrap gap-2 border-t border-sand-200 pt-5">
          {(
            [
              ["absatz", "Absatz"],
              ["ueberschrift", "Zwischenüberschrift"],
              ["liste", "Aufzählung"],
              ["hinweis", "Hervorgehobener Satz"],
              ["bild", "Bild"],
            ] as const
          ).map(([typ, beschriftung]) => (
            <button
              key={typ}
              type="button"
              onClick={() =>
                bloeckeSetzen([
                  ...beitrag.inhalt,
                  typ === "liste"
                    ? { typ: "liste", punkte: [""] }
                    : typ === "bild"
                      ? {
                          typ: "bild",
                          bild: { src: "", width: 0, height: 0 },
                          alt: "",
                        }
                      : { typ, text: "" },
                ])
              }
              className={knopfLeiseStil}
            >
              + {beschriftung}
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ Speichern -- */}
      <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl border border-sand-200 bg-paper/95 p-5 backdrop-blur">
        <label className="flex items-center gap-3 text-[0.9375rem] text-ink">
          <input
            type="checkbox"
            checked={beitrag.veroeffentlicht}
            onChange={(e) => setzen({ veroeffentlicht: e.target.checked })}
            className="size-5 accent-sea"
          />
          Auf der Website zeigen
        </label>

        <button
          type="button"
          onClick={speichern}
          disabled={speichert}
          className={knopfStil}
        >
          {speichert ? "Wird gespeichert …" : "Speichern"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/beitraege")}
          className={knopfLeiseStil}
        >
          Zurück zur Liste
        </button>

        {meldung ? <span className="text-[0.9375rem] text-sea">{meldung}</span> : null}
        {fehler ? (
          <span className="text-[0.9375rem] text-alarm">{fehler}</span>
        ) : null}
      </div>
    </div>
  );
}

function BlockZeile({
  block,
  index,
  anzahl,
  aendern,
  verschieben,
  entfernen,
  bildWaehlen,
}: {
  block: Block;
  index: number;
  anzahl: number;
  aendern: (neu: Block) => void;
  verschieben: (richtung: -1 | 1) => void;
  entfernen: () => void;
  bildWaehlen: (datei: File) => void;
}) {
  const NAMEN: Record<Block["typ"], string> = {
    absatz: "Absatz",
    ueberschrift: "Zwischenüberschrift",
    hinweis: "Hervorgehobener Satz",
    liste: "Aufzählung",
    bild: "Bild",
  };

  return (
    <div className="rounded-xl border border-sand-200 bg-sand-50 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold tracking-[0.1em] text-sea uppercase">
          {NAMEN[block.typ]}
        </span>
        <div className="flex gap-1">
          <KleinKnopf onClick={() => verschieben(-1)} deaktiviert={index === 0}>
            ↑
          </KleinKnopf>
          <KleinKnopf
            onClick={() => verschieben(1)}
            deaktiviert={index === anzahl - 1}
          >
            ↓
          </KleinKnopf>
          <KleinKnopf onClick={entfernen}>Entfernen</KleinKnopf>
        </div>
      </div>

      {block.typ === "liste" ? (
        <div className="space-y-2">
          {block.punkte.map((punkt, i) => (
            <input
              key={i}
              value={punkt}
              onChange={(e) => {
                const punkte = [...block.punkte];
                punkte[i] = e.target.value;
                aendern({ ...block, punkte });
              }}
              className={eingabeStil}
            />
          ))}
          <button
            type="button"
            onClick={() => aendern({ ...block, punkte: [...block.punkte, ""] })}
            className="text-[0.9375rem] font-semibold text-sea hover:text-glow"
          >
            + Punkt
          </button>
        </div>
      ) : block.typ === "bild" ? (
        <div className="space-y-4">
          {block.bild.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.bild.src}
              alt=""
              className="max-h-64 w-full rounded-lg bg-sand-100 object-contain"
            />
          ) : null}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const datei = e.target.files?.[0];
              if (datei) bildWaehlen(datei);
            }}
            className="block w-full text-[0.9375rem] text-ink-70 file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-paper"
          />
          <input
            placeholder="Bildbeschreibung"
            value={block.alt}
            onChange={(e) => aendern({ ...block, alt: e.target.value })}
            className={eingabeStil}
          />
          <input
            placeholder="Bildunterschrift (kann leer bleiben)"
            value={block.unterschrift ?? ""}
            onChange={(e) =>
              aendern({ ...block, unterschrift: e.target.value || undefined })
            }
            className={eingabeStil}
          />
        </div>
      ) : (
        <textarea
          rows={block.typ === "absatz" ? 4 : 2}
          value={block.text}
          onChange={(e) => aendern({ ...block, text: e.target.value })}
          className={`${eingabeStil} resize-y leading-relaxed`}
        />
      )}
    </div>
  );
}

function KleinKnopf({
  children,
  onClick,
  deaktiviert,
}: {
  children: React.ReactNode;
  onClick: () => void;
  deaktiviert?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deaktiviert}
      className="rounded-full border border-sand-300 px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink/40 disabled:opacity-35"
    >
      {children}
    </button>
  );
}
