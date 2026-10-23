/**
 * Kleine Bilder für die Geräteauswahl.
 *
 * Gezeichnet in derselben Sprache wie die Ansicht von vorn: heller Korpus,
 * Graphit für Glas und Griffe. Sie zeigen, was man bekommt, ohne dass man
 * die Beschreibung lesen muss — und sie sind der Platz, an dem später die
 * echten Produktbilder der Hersteller stehen.
 */

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

export function Geraetebild({ id }: { id: string }) {
  switch (id) {
    /* ---------------- Kühlschrank ---------------- */
    case "kuehl-gross":
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
    case "kuehl-klein":
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
    case "kuehl-keiner":
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

    /* ---------------- Kochfeld ---------------- */
    case "kf-ceran":
    case "kf-induktion":
      return (
        <Rahmen
          kinder={
            <>
              <rect x="26" y="34" width="68" height="34" rx="5" className={glas} />
              {[42, 60, 78].map((cx, i) => (
                <circle key={cx} cx={cx} cy={i === 1 ? 46 : 54} r={i === 1 ? 7 : 6} fill="none" className="stroke-creme-2" strokeWidth="1.6" />
              ))}
              {id === "kf-induktion" && (
                <rect x="34" y="60" width="20" height="3" rx="1.5" className="fill-creme-2" />
              )}
            </>
          }
        />
      );
    case "kf-gas":
      return (
        <Rahmen
          kinder={
            <>
              <rect x="26" y="34" width="68" height="34" rx="5" className={glas} />
              {[44, 76].map((cx) => (
                <g key={cx}>
                  <circle cx={cx} cy="51" r="9" fill="none" className="stroke-creme-2" strokeWidth="1.6" />
                  <path d={`M${cx - 9} 51 H${cx + 9} M${cx} 42 V60`} className="stroke-creme-2" strokeWidth="1.6" />
                </g>
              ))}
            </>
          }
        />
      );

    /* ---------------- Backofen ---------------- */
    case "ofen-unten":
      return (
        <Rahmen
          kinder={
            <>
              <rect x="34" y="26" width="52" height="8" rx="3" className={glas} />
              <Platte y={36} />
              <rect x="34" y="42" width="52" height="42" rx="4" className={korpus} strokeWidth="1.4" />
              <rect x="39" y="48" width="42" height="26" rx="3" className={glas} />
              <rect x="42" y="78" width="36" height="3" rx="1.5" className={griff} />
            </>
          }
        />
      );
    case "ofen-hoch":
    case "ofen-dampf":
      return (
        <Rahmen
          kinder={
            <>
              <rect x="40" y="10" width="40" height="74" rx="4" className={korpus} strokeWidth="1.4" />
              <rect x="44" y="30" width="32" height="24" rx="3" className={glas} />
              <rect x="46" y="25" width="28" height="3" rx="1.5" className={griff} />
              {id === "ofen-dampf" && (
                <path d="M53 20 q3 -5 6 0 M63 20 q3 -5 6 0" fill="none" className="stroke-kohle-3" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </>
          }
        />
      );

    /* ---------------- Spülmaschine ---------------- */
    case "gs-60":
    case "gs-45": {
      const br = id === "gs-60" ? 44 : 32;
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
    case "gs-keine":
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

    /* ---------------- Dunstabzug ---------------- */
    case "da-esse":
      return (
        <Rahmen
          kinder={
            <>
              <path d="M44 12 H76 V30 L86 40 H34 L44 30 Z" className={korpus} strokeWidth="1.4" />
              <rect x="34" y="40" width="52" height="4" rx="2" className={griff} />
              <rect x="30" y="62" width="60" height="8" rx="3" className={glas} />
            </>
          }
        />
      );
    case "da-flach":
      return (
        <Rahmen
          kinder={
            <>
              <rect x="32" y="12" width="56" height="24" rx="4" className={korpus} strokeWidth="1.4" />
              <rect x="36" y="36" width="48" height="6" rx="3" className={griff} />
              <path d="M44 48 q4 -6 8 0 M60 48 q4 -6 8 0" fill="none" className="stroke-kohle-3" strokeWidth="1.6" strokeLinecap="round" />
              <rect x="30" y="62" width="60" height="8" rx="3" className={glas} />
            </>
          }
        />
      );
    case "da-keiner":
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

    default:
      return <Rahmen kinder={<rect x="40" y="30" width="40" height="40" rx="4" className={korpus} strokeWidth="1.4" />} />;
  }
}
