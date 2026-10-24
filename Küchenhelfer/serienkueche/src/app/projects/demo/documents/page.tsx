"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileUp, Upload } from "lucide-react";
import { DOKUMENTE } from "@/data/projekt";
import { useDemo } from "@/store/demo";
import type { Dokument } from "@/lib/typen";
import {
  Abschnitt, Flaeche, Hinweisband, Inhalt, Knopf, Marke,
  Seitenkopf, Tabelle, Td, Th, melde,
} from "@/components/ui/kit";

const SCHRITTE = [
  "Hochgeladen",
  "Dateiformat geprüft",
  "Geometrie eingelesen",
  "Räume zugeordnet",
  "Prüfung erforderlich",
];

const MARKEN: Record<Dokument["status"], { ton: "ok" | "flag" | "mute"; text: string }> = {
  verarbeitet: { ton: "ok", text: "verarbeitet" },
  pruefung: { ton: "flag", text: "Prüfung nötig" },
  "nicht-lesbar": { ton: "flag", text: "nicht lesbar" },
  neu: { ton: "mute", text: "neu" },
};

export default function Unterlagen() {
  const { eigeneDokumente, fuegeDokumentHinzu } = useDemo();
  const [lauf, setLauf] = useState<{ name: string; schritt: number } | null>(null);
  const [ueber, setUeber] = useState(false);
  const feld = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const verarbeite = useCallback(
    (name: string) => {
      setLauf({ name, schritt: 0 });
      let i = 0;
      const weiter = () => {
        i += 1;
        if (i < SCHRITTE.length) {
          setLauf({ name, schritt: i });
          timer.current = setTimeout(weiter, 620);
        } else {
          const endung = name.split(".").pop()?.toLowerCase() ?? "";
          const lesbar = ["pdf", "dxf", "dwg", "ifc"].includes(endung);
          fuegeDokumentHinzu({
            id: `U${Date.now()}`,
            name,
            // Vorher hiess alles Unbekannte "Rasterbild" — auch eine
            // Tabelle oder ein Textdokument.
            format: lesbar ? endung.toUpperCase() : endung ? endung.toUpperCase() : "ohne Endung",
            groesse: "—",
            datum: new Date().toLocaleDateString("de-DE"),
            urheber: "Demo-Upload",
            status: lesbar ? "pruefung" : "nicht-lesbar",
            zuordnung: lesbar ? "noch nicht zugeordnet" : "keine",
            hinweis: lesbar
              ? "Simulierte Verarbeitung. In dieser Demo wird keine echte Datei interpretiert."
              : "Ohne Vektorebene nicht verarbeitbar. Rasterpläne sind nicht Teil des Funktionsumfangs.",
          });
          setLauf(null);
          melde(lesbar ? `${name} aufgenommen, Prüfung erforderlich.` : `${name} hat keine Vektorebene.`);
        }
      };
      timer.current = setTimeout(weiter, 620);
    },
    [fuegeDokumentHinzu],
  );

  const alle = [...eigeneDokumente, ...DOKUMENTE];

  return (
    <>
      <Seitenkopf
        titel="Unterlagen"
        kontext={`${alle.length} Dokumente · Architektenpläne, Schnitte, TGA und Baubeschreibung`}
        aktionen={<Knopf art="primaer" onClick={() => feld.current?.click()}><Upload size={14} strokeWidth={1.8} />Unterlage hinzufügen</Knopf>}
      />

      <Inhalt>
        <Abschnitt titel="Hinzufügen">
          <div
            onDragOver={(e) => { e.preventDefault(); setUeber(true); }}
            onDragLeave={() => setUeber(false)}
            onDrop={(e) => {
              e.preventDefault();
              setUeber(false);
              const f = e.dataTransfer.files?.[0];
              if (f) verarbeite(f.name);
            }}
            className={`rounded-md border border-dashed px-6 py-7 text-center transition-colors ${
              ueber ? "border-accent bg-accent-soft" : "border-line bg-paper"
            }`}
          >
            <input
              ref={feld}
              id="upload"
              type="file"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) verarbeite(f.name);
                e.target.value = "";
              }}
            />
            {lauf ? (
              <div className="mx-auto max-w-[460px] text-left">
                <div className="num mb-2 flex items-center justify-between text-[12.5px]">
                  <span className="truncate text-ink">{lauf.name}</span>
                  <span className="text-ink-3">{lauf.schritt + 1} / {SCHRITTE.length}</span>
                </div>
                <div className="laufband relative h-[3px] w-full overflow-hidden rounded-full bg-line-2">
                  <div
                    className="h-full bg-accent transition-[width] duration-500"
                    style={{ width: `${((lauf.schritt + 1) / SCHRITTE.length) * 100}%` }}
                  />
                </div>
                <ol className="mt-3 space-y-1">
                  {SCHRITTE.map((s, i) => (
                    <li key={s} className={`flex items-center gap-2 text-[12px] ${i <= lauf.schritt ? "text-ink-2" : "text-ink-3"}`}>
                      <span className={`num w-4 text-right ${i < lauf.schritt ? "text-good" : i === lauf.schritt ? "text-accent" : "text-ink-3"}`}>
                        {i < lauf.schritt ? "✓" : i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-[11.5px] text-flag">Demo-Verarbeitung. Es wird keine echte Datei gelesen.</p>
              </div>
            ) : (
              <>
                <FileUp size={20} strokeWidth={1.5} className="mx-auto text-ink-3" />
                <div className="mt-2 text-[13px] text-ink-2">
                  Datei hierher ziehen oder{" "}
                  <button onClick={() => feld.current?.click()} className="text-accent underline underline-offset-2">
                    auswählen
                  </button>
                </div>
                <p className="mx-auto mt-1.5 max-w-[56ch] text-[12px] text-ink-3">
                  Vektor-PDF, DXF, DWG und IFC werden gelesen. Rasterbilder und Scans sind nicht Teil des
                  Funktionsumfangs — die Erkennung gezeichneter Symbole ist zu unzuverlässig.
                </p>
              </>
            )}
          </div>
        </Abschnitt>

        <Abschnitt titel="Dokumente">
          <Flaeche>
            <Tabelle>
              <thead>
                <tr>
                  <Th>Datei</Th>
                  <Th>Format</Th>
                  <Th nebensache>Urheber</Th>
                  <Th>Datum</Th>
                  <Th>Zuordnung</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {alle.map((d) => {
                  const m = MARKEN[d.status];
                  return (
                    <tr key={d.id} className="align-top hover:bg-ground">
                      <Td>
                        <div className="num text-ink">{d.name}</div>
                        {d.hinweis && <div className="mt-0.5 max-w-[48ch] text-[11.5px] text-ink-3">{d.hinweis}</div>}
                      </Td>
                      <Td num stumm>{d.format}</Td>
                      <Td stumm nebensache>{d.urheber}</Td>
                      <Td num stumm>{d.datum}</Td>
                      <Td stumm>{d.zuordnung}</Td>
                      <Td><Marke ton={m.ton}>{m.text}</Marke></Td>
                    </tr>
                  );
                })}
              </tbody>
            </Tabelle>
          </Flaeche>
        </Abschnitt>

        <Abschnitt titel="Was aus den Unterlagen gelesen wird">
          <Hinweisband art="ruhig" titel="Vektorebene statt Bilderkennung">
            Architektenpläne aus Revit, ArchiCAD oder AutoCAD enthalten eine Vektorebene mit Linien,
            Blöcken, Layernamen und Maßketten. Daraus wird die Geometrie deterministisch gelesen.
            Sprachmodelle kommen nur dort zum Einsatz, wo sie stark sind: Layernamen zuordnen,
            Schriftfeld und Legende lesen, Raumstempel zuordnen. Für Geometrie und für das Zählen
            von Türen und Fenstern werden sie ausdrücklich nicht verwendet.
          </Hinweisband>
        </Abschnitt>
      </Inhalt>
    </>
  );
}
