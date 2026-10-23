/**
 * Kleine Bilder für die Geräteauswahl.
 *
 * Gezeichnet in derselben Sprache wie die Ansicht von vorn: heller Korpus,
 * Graphit für Glas und Griffe. Sie zeigen, was man bekommt, ohne dass man
 * die Beschreibung lesen muss — und sie sind der Platz, an dem später die
 * echten Produktbilder der Hersteller stehen.
 */

import type { Geraet } from "@/data/geraete";

const B = 120;
const H = 92;

function Rahmen({ kinder }: { kinder: React.ReactNode }) {
  return (
    <svg viewBox={`0 0 ${B} ${H}`} className="h-[86px] w-full" aria-hidden="true">
      <rect x="0" y="0" width={B} height={H} rx="9" className="fill-creme-2" />
      {kinder}
    </svg>
  );
}

const korpus = "fill-papier stroke-kohle-3";
const glas = "fill-kohle";
const griff = "fill-kohle-2";

/** Arbeitsplatte als Bezugslinie, damit die Höhen vergleichbar wirken. */
function Platte({ y }: { y: number }) {
  return <rect x="14" y={y} width="92" height="4" rx="2" className="fill-kohle-3" />;
}

/**
 * Das Bild richtet sich nach dem, was das Gerät ist — nicht nach seiner
 * Kennung. So braucht ein neues Modell im Katalog kein neues Bild.
 */
export function Geraetebild({ g }: { g: Geraet }) {
  const leer = g.richtpreis === 0;

  if (g.art === "kuehlschrank") {
    if (leer || g.bau === "keiner") {
      return (
        <Rahmen
          kinder={
            <>
              <Platte y={44} />
              <rect x="40" y="48" width="40" height="36" rx="4" className={korpus} strokeWidth="1.4" strokeDasharray="4 4" />
              <path d="M52 62 H68" className="stroke-kohle-3" strokeWidth="2" strokeLinecap="round" />
            </>
          }
        />
      );
    }
    if (g.bau === "unterbau") {
      return (
        <Rahmen
          kinder={
            <>
              <Platte y={44} />
              <rect x="40" y="48" width="40" height="36" rx="4" className={korpus} strokeWidth="1.4" />
              <rect x="72" y="54" width="3" height="12" rx="1.5" className={griff} />
            </>
          }
        />
      );
    }
    return (
      <Rahmen
        kinder={
          <>
            <rect x="40" y="10" width="40" height="74" rx="4" className={korpus} strokeWidth="1.4" />
            <path d="M40 40 H80" className="stroke-kohle-3" strokeWidth="1.4" />
            <rect x="72" y="20" width="3" height="14" rx="1.5" className={griff} />
            <rect x="72" y="46" width="3" height="14" rx="1.5" className={griff} />
          </>
        }
      />
    );
  }

  if (g.art === "kochfeld") {
    const induktion = /induktion/i.test(g.name);
    return (
      <Rahmen
        kinder={
          <>
            <rect x="26" y="34" width="68" height="34" rx="5" className={glas} />
            {[42, 60, 78].map((cx, i) => (
              <circle key={cx} cx={cx} cy={i === 1 ? 46 : 54} r={i === 1 ? 7 : 6} fill="none" className="stroke-creme-2" strokeWidth="1.6" />
            ))}
            {induktion && <rect x="34" y="60" width="20" height="3" rx="1.5" className="fill-creme-2" />}
          </>
        }
      />
    );
  }

  if (g.art === "backofen") {
    if (leer) {
      return (
        <Rahmen
          kinder={
            <>
              <Platte y={36} />
              <rect x="34" y="42" width="52" height="42" rx="4" className={korpus} strokeWidth="1.4" strokeDasharray="4 4" />
              <path d="M48 62 H72" className="stroke-kohle-3" strokeWidth="2" strokeLinecap="round" />
            </>
          }
        />
      );
    }
    return (
      <Rahmen
        kinder={
          <>
            <rect x="34" y="18" width="52" height="58" rx="4" className={korpus} strokeWidth="1.4" />
            <rect x="39" y="32" width="42" height="30" rx="3" className={glas} />
            <rect x="42" y="24" width="36" height="3" rx="1.5" className={griff} />
          </>
        }
      />
    );
  }

  if (g.art === "spuelmaschine") {
    if (leer) {
      return (
        <Rahmen
          kinder={
            <>
              <Platte y={34} />
              <rect x="38" y="40" width="44" height="44" rx="4" className={korpus} strokeWidth="1.4" />
              <path d="M44 52 H76 M44 64 H76 M44 76 H76" className="stroke-kohle-3" strokeWidth="1.4" />
            </>
          }
        />
      );
    }
    const br = g.breite === 450 ? 32 : 44;
    return (
      <Rahmen
        kinder={
          <>
            <Platte y={34} />
            <rect x={(B - br) / 2} y="40" width={br} height="44" rx="4" className={korpus} strokeWidth="1.4" />
            <rect x={(B - br) / 2 + 4} y="45" width={br - 8} height="5" rx="2.5" className={griff} />
            <circle cx={B / 2} cy="66" r="7" fill="none" className="stroke-kohle-3" strokeWidth="1.4" />
            <path d={`M${B / 2} 59 v7 h5`} fill="none" className="stroke-kohle-3" strokeWidth="1.4" strokeLinecap="round" />
          </>
        }
      />
    );
  }

  // Dunstabzug
  if (leer) {
    return (
      <Rahmen
        kinder={
          <>
            <rect x="32" y="12" width="56" height="24" rx="4" className={korpus} strokeWidth="1.4" strokeDasharray="4 4" />
            <rect x="30" y="62" width="60" height="8" rx="3" className={glas} />
          </>
        }
      />
    );
  }
  return (
    <Rahmen
      kinder={
        <>
          <rect x="32" y="12" width="56" height="24" rx="4" className={korpus} strokeWidth="1.4" />
          <rect x="36" y="36" width="48" height="6" rx="3" className={griff} />
          <path d="M44 50 q4 -6 8 0 M60 50 q4 -6 8 0" fill="none" className="stroke-kohle-3" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="30" y="64" width="60" height="8" rx="3" className={glas} />
        </>
      }
    />
  );
}

/* ---------------------------------------------------------------- */

/**
 * Die Front eines Stauraumschranks. Zeigt auf einen Blick, ob sich eine Tür
 * öffnet, Auszüge herausfahren oder ein schmaler Apothekerauszug drinsteckt.
 */
export function Schrankbild({ id }: { id: string }) {
  const breit = id.endsWith("600") ? 72 : id.endsWith("450") ? 54 : 36;
  const x = (B - breit) / 2;
  const front = "fill-papier stroke-kohle-3";
  const fuge = "stroke-kohle-3";

  const faecher = (n: number) => {
    const h = 64 / n;
    return Array.from({ length: n }, (_, i) => (
      <g key={i}>
        <rect x={x + 2} y={14 + i * h + 2} width={breit - 4} height={h - 4} rx="2" className={front} strokeWidth="1.2" />
        <rect x={x + breit / 2 - 9} y={14 + i * h + h / 2 - 1.5} width="18" height="3" rx="1.5" className={griff} />
      </g>
    ));
  };

  return (
    <Rahmen
      kinder={
        <>
          <rect x={x} y="12" width={breit} height="68" rx="3" className={front} strokeWidth="1.4" />
          {(id === "UT600" || id === "UT450") && (
            <>
              <path d={`M${x + breit - 10} 26 V66`} className={fuge} strokeWidth="1.2" />
              <rect x={x + breit - 14} y="40" width="3" height="14" rx="1.5" className={griff} />
            </>
          )}
          {id === "US600" && faecher(2)}
          {id === "US450" && faecher(3)}
          {id === "US300" && faecher(2)}
          {(id === "AZ600" || id === "AZ300") && (
            <>
              <rect x={x + 5} y="17" width={breit - 10} height="58" rx="2" className="fill-creme-2 stroke-kohle-3" strokeWidth="1.2" />
              <path d={`M${x + breit / 2} 24 V68`} className={fuge} strokeWidth="1.2" strokeDasharray="3 3" />
              <rect x={x + breit / 2 - 10} y="44" width="20" height="3" rx="1.5" className={griff} />
            </>
          )}
          {id === "MU600" && (
            <>
              {faecher(2)}
              <path d={`M${x + 18} 50 h${breit - 36} l-3 18 h-${breit - 42} Z`} className="fill-creme-2 stroke-kohle-3" strokeWidth="1.2" />
              <path d={`M${x + 16} 50 h${breit - 32}`} className={fuge} strokeWidth="1.6" />
            </>
          )}
        </>
      }
    />
  );
}
