import "server-only";
import { bildAdresse, cmsAktiv } from "@/lib/supabase";
import { lesenClient } from "@/lib/supabase-server";
import { beitraege as eingebauteBeitraege, type Beitrag } from "./aktuelles";
import { galerie as eingebauteGalerie, type GalerieJahr } from "./galerie";

/**
 * Inhalte einsammeln – aus der Verwaltung und aus den mitgelieferten Dateien.
 *
 * Grundsatz: die eingebauten Inhalte in `aktuelles.ts` und `galerie.ts`
 * bleiben immer bestehen. Was der Verein selbst anlegt, kommt dazu.
 * Ein Beitrag aus der Verwaltung mit demselben `slug` ersetzt den
 * eingebauten – so lässt sich auch Bestehendes überarbeiten, ohne dass
 * jemand an den Quelltext muss.
 *
 * Ist keine Verwaltung eingerichtet, verhält sich die Seite exakt so wie
 * vorher. Das ist der Normalfall, solange die Zugänge noch fehlen.
 */

type BeitragZeile = {
  slug: string;
  titel: string;
  kategorie: string;
  datum: string;
  teaser: string;
  bild_pfad: string | null;
  bild_breite: number | null;
  bild_hoehe: number | null;
  bild_alt: string;
  inhalt: unknown;
};

type GalerieZeile = {
  jahr: string;
  pfad: string;
  breite: number;
  hoehe: number;
  alt: string;
  unterschrift: string | null;
  einpassen: boolean;
  sortierung: number;
};

const MONATE = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/** Aus 2026-11-17 wird "November 2026". */
function datumLabel(datum: string) {
  const [jahr, monat] = datum.split("-");
  const index = Number(monat) - 1;
  return MONATE[index] ? `${MONATE[index]} ${jahr}` : jahr;
}

function bild(pfad: string, breite: number | null, hoehe: number | null) {
  return { src: bildAdresse(pfad), width: breite ?? 1600, height: hoehe ?? 1200 };
}

async function zeilenHolen<T>(tabelle: string, aufbereiten: (rohdaten: unknown[]) => T) {
  try {
    const client = lesenClient();
    const { data, error } = await client
      .from(tabelle)
      .select("*")
      .order(tabelle === "beitraege" ? "datum" : "jahr", { ascending: false });
    if (error) throw error;
    return aufbereiten(data ?? []);
  } catch (fehler) {
    // Die Website soll auch dann stehen, wenn die Verwaltung gerade klemmt.
    console.error(`Inhalte aus ${tabelle} konnten nicht geladen werden:`, fehler);
    return null;
  }
}

/** Alle Beiträge, neueste zuerst. */
export async function beitraegeLaden(): Promise<Beitrag[]> {
  if (!cmsAktiv) return eingebauteBeitraege;

  const ausVerwaltung = await zeilenHolen("beitraege", (rohdaten) =>
    (rohdaten as BeitragZeile[])
      .filter((zeile) => zeile.bild_pfad)
      .map<Beitrag>((zeile) => ({
        slug: zeile.slug,
        titel: zeile.titel,
        kategorie: zeile.kategorie,
        datum: zeile.datum,
        datumLabel: datumLabel(zeile.datum),
        teaser: zeile.teaser,
        bild: bild(zeile.bild_pfad!, zeile.bild_breite, zeile.bild_hoehe),
        bildAlt: zeile.bild_alt,
        inhalt: Array.isArray(zeile.inhalt) ? (zeile.inhalt as Beitrag["inhalt"]) : [],
      })),
  );

  if (!ausVerwaltung) return eingebauteBeitraege;

  const eigeneSlugs = new Set(ausVerwaltung.map((b) => b.slug));
  return [...ausVerwaltung, ...eingebauteBeitraege.filter((b) => !eigeneSlugs.has(b.slug))].sort(
    (a, b) => b.datum.localeCompare(a.datum),
  );
}

/** Die Galerie, nach Jahren gruppiert, neueste zuerst. */
export async function galerieLaden(): Promise<GalerieJahr[]> {
  if (!cmsAktiv) return eingebauteGalerie;

  const ausVerwaltung = await zeilenHolen("galerie_bilder", (rohdaten) =>
    (rohdaten as GalerieZeile[])
      .slice()
      .sort((a, b) => a.sortierung - b.sortierung)
      .map((zeile) => ({
        jahr: zeile.jahr,
        bild: bild(zeile.pfad, zeile.breite, zeile.hoehe),
        alt: zeile.alt,
        unterschrift: zeile.unterschrift ?? undefined,
        einpassen: zeile.einpassen,
      })),
  );

  if (!ausVerwaltung || ausVerwaltung.length === 0) return eingebauteGalerie;

  const jahre = new Map<string, GalerieJahr>();
  for (const jahr of eingebauteGalerie) {
    jahre.set(jahr.jahr, { ...jahr, bilder: [...jahr.bilder] });
  }
  for (const eintrag of ausVerwaltung) {
    const vorhanden = jahre.get(eintrag.jahr);
    const bildEintrag = {
      bild: eintrag.bild,
      alt: eintrag.alt,
      unterschrift: eintrag.unterschrift,
      einpassen: eintrag.einpassen,
    };
    if (vorhanden) vorhanden.bilder.unshift(bildEintrag);
    else jahre.set(eintrag.jahr, { jahr: eintrag.jahr, bilder: [bildEintrag] });
  }

  return [...jahre.values()].sort((a, b) => b.jahr.localeCompare(a.jahr));
}

/** Gesamtzahl der Galeriebilder – steht als Angabe über der Galerie. */
export async function galerieAnzahl(jahre: GalerieJahr[]) {
  return jahre.reduce((summe, jahr) => summe + jahr.bilder.length, 0);
}
