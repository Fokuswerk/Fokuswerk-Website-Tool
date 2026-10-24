"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, OrbitControls } from "@react-three/drei";
import { BoxGeometry, Vector3, type PerspectiveCamera } from "three";
import { baueSzene, type Kasten, type Marke, type Stoff } from "@/lib/szene";
import { RAUMHOEHE } from "@/lib/masse";
import type { Kuechentyp, Wandseite } from "@/lib/typen";
import type { VarianteRoh } from "@/data/varianten";

/**
 * Die geplante Küche als Raum, in den man hineinsieht und um den man
 * herumgehen kann.
 *
 * Die Körper kommen aus demselben Plan wie der Grundriss und die Ansicht von
 * vorn — jeder Schrank steht an seiner Stelle, jedes Gerät hat seine Breite.
 * Nichts daran ist Deko.
 *
 * Beleuchtet wird mit einem gebauten Studio statt mit einer Umgebungsdatei:
 * ein paar Leuchtflächen und ein Hauptlicht mit weichem Schatten. Das lädt
 * nichts nach und sieht an jedem Tag gleich aus.
 */

/** Millimeter zu Metern — three rechnet in Metern. */
const M = 0.001;

/** Wie sich ein Material im Licht verhält. */
const STOFFE: Record<Stoff | "sonst", { rauheit: number; metall: number }> = {
  boden: { rauheit: 0.72, metall: 0 },
  wand: { rauheit: 0.95, metall: 0 },
  front: { rauheit: 0.52, metall: 0 },
  korpus: { rauheit: 0.8, metall: 0 },
  platte: { rauheit: 0.34, metall: 0.04 },
  graphit: { rauheit: 0.42, metall: 0.18 },
  stahl: { rauheit: 0.22, metall: 0.72 },
  griff: { rauheit: 0.35, metall: 0.45 },
  glas: { rauheit: 0.1, metall: 0.1 },
  fenster: { rauheit: 0.08, metall: 0 },
  rahmen: { rauheit: 0.6, metall: 0 },
  tuer: { rauheit: 0.7, metall: 0 },
  sonst: { rauheit: 0.6, metall: 0 },
};

const hex = (c: [number, number, number]) =>
  `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;

export interface Umstellen {
  gewaehlt: { zeile: string; index: number } | null;
  onWaehle: (zeile: string, index: number) => void;
  /** Welche Plätze als Ziel in Frage kommen, solange einer angefasst ist. */
  moeglich?: (zeile: string, index: number) => boolean;
  /** Ob der letzte Zeigerweg ein Tippen war und kein Drehen. */
  klickOk: () => boolean;
}

function Koerper({
  k, umstellen, ueber, setzeUeber,
}: {
  k: Kasten;
  umstellen?: Umstellen;
  ueber?: boolean;
  setzeUeber?: (p: { zeile: string; index: number } | null) => void;
}) {
  const stoff = STOFFE[k.stoff ?? "sonst"];
  const istFenster = k.stoff === "fenster";
  const fassbar = !!umstellen && !!k.platz;
  const aktiv =
    fassbar && umstellen!.gewaehlt?.zeile === k.platz!.zeile && umstellen!.gewaehlt?.index === k.platz!.index;
  const ziel =
    fassbar && !aktiv && !!umstellen!.gewaehlt &&
    (umstellen!.moeglich ? umstellen!.moeglich(k.platz!.zeile, k.platz!.index) : true);

  return (
    <mesh
      position={[(k.x + k.bx / 2) * M, (k.z + k.bz / 2) * M, (k.y + k.by / 2) * M]}
      castShadow={!istFenster}
      receiveShadow
      onPointerOver={fassbar ? (e) => { e.stopPropagation(); setzeUeber?.(k.platz!); } : undefined}
      onPointerOut={fassbar ? () => setzeUeber?.(null) : undefined}
      onClick={
        fassbar
          ? (e) => {
              e.stopPropagation();
              if (!umstellen!.klickOk()) return;
              umstellen!.onWaehle(k.platz!.zeile, k.platz!.index);
            }
          : undefined
      }
    >
      <boxGeometry args={[k.bx * M, k.bz * M, k.by * M]} />
      <meshStandardMaterial
        color={hex(k.farbe)}
        roughness={stoff.rauheit}
        metalness={stoff.metall}
        emissive={
          istFenster ? "#d7e8f3"
          : aktiv ? "#b98a1e"
          : ueber ? "#6d6a60"
          : ziel ? "#3f7a58"
          : "#000000"
        }
        emissiveIntensity={istFenster ? 0.9 : aktiv ? 0.42 : ueber ? 0.2 : ziel ? 0.2 : 0}
      />
    </mesh>
  );
}

/** Feiner Umriss um einen angefassten Schrank. */
type Masse = { x: number; y: number; z: number; bx: number; by: number; bz: number };

function Umriss({ kaesten, farbe }: { kaesten: Masse[]; farbe: string }) {
  if (kaesten.length === 0) return null;
  const x0 = Math.min(...kaesten.map((k) => k.x));
  const x1 = Math.max(...kaesten.map((k) => k.x + k.bx));
  const y0 = Math.min(...kaesten.map((k) => k.y));
  const y1 = Math.max(...kaesten.map((k) => k.y + k.by));
  const z0 = Math.min(...kaesten.map((k) => k.z));
  const z1 = Math.max(...kaesten.map((k) => k.z + k.bz));
  return (
    <lineSegments position={[((x0 + x1) / 2) * M, ((z0 + z1) / 2) * M, ((y0 + y1) / 2) * M]}>
      <edgesGeometry args={[new BoxGeometry((x1 - x0) * M + 0.02, (z1 - z0) * M + 0.02, (y1 - y0) * M + 0.02)]} />
      <lineBasicMaterial color={farbe} transparent opacity={0.85} />
    </lineSegments>
  );
}

type Sicht = Record<Wandseite, boolean>;

/** Welche Wände man gerade von innen sieht. Ändert sich selten, deshalb
    nur dann neu setzen — sonst rechnet React in jedem Bild mit. */
function useSichtbareWaende(breite: number, tiefe: number): Sicht {
  const [sicht, setSicht] = useState<Sicht>({ nord: true, ost: true, sued: true, west: true });
  const letzte = useRef(sicht);
  useFrame(({ camera }) => {
    const x = camera.position.x / M;
    const z = camera.position.z / M;
    const neu: Sicht = { nord: z > 0, sued: z < tiefe, west: x > 0, ost: x < breite };
    const l = letzte.current;
    if (neu.nord !== l.nord || neu.sued !== l.sued || neu.west !== l.west || neu.ost !== l.ost) {
      letzte.current = neu;
      setSicht(neu);
    }
  });
  return sicht;
}

/** Schild an einem Gerät: ein Punkt, ein feiner Umriss, der Name. */
function Geraetemarke({ marke, stark = false }: { marke: Marke; stark?: boolean }) {
  const k = marke.kasten;
  return (
    <group>
      <lineSegments position={[(k.x + k.bx / 2) * M, (k.z + k.bz / 2) * M, (k.y + k.by / 2) * M]}>
        <edgesGeometry args={[new BoxGeometry(k.bx * M * 1.004, k.bz * M * 1.004, k.by * M * 1.004)]} />
        <lineBasicMaterial color={stark ? "#8a6410" : "#15140f"} transparent opacity={stark ? 0.95 : 0.38} />
      </lineSegments>
      <Html
        position={[marke.pos[0] * M, marke.pos[2] * M, marke.pos[1] * M]}
        center
        zIndexRange={[30, 10]}
        style={{ pointerEvents: "none" }}
      >
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-[0_2px_8px_rgba(21,20,15,.35)] backdrop-blur-sm ${
            stark ? "bg-butter text-kohle" : "bg-kohle/90 text-creme"
          }`}
        >
          {marke.name}
        </span>
      </Html>
    </group>
  );
}

function Raum({
  typ, variante, zeigeGeraete, umstellen, betont,
}: {
  typ: Kuechentyp; variante: VarianteRoh; zeigeGeraete: boolean; umstellen?: Umstellen;
  betont?: string;
}) {
  const szene = useMemo(() => baueSzene(typ, variante), [typ, variante]);
  const { breite, tiefe } = typ.raum;
  const sicht = useSichtbareWaende(breite, tiefe);
  const [ueber, setzeUeber] = useState<{ zeile: string; index: number } | null>(null);

  // Zeigerform nur so lange aendern, wie wirklich etwas unter dem Zeiger ist.
  useEffect(() => {
    if (!umstellen || !ueber) return;
    document.body.style.cursor = "pointer";
    return () => { document.body.style.cursor = ""; };
  }, [umstellen, ueber]);

  const teileVon = (p: { zeile: string; index: number } | null) =>
    p ? szene.kaesten.filter((k) => k.platz?.zeile === p.zeile && k.platz?.index === p.index) : [];

  /** Schild am angefassten oder überfahrenen Schrank: man soll sehen, was
      man da anfasst, ohne es aus der Form raten zu müssen. */
  const schild = (p: { zeile: string; index: number } | null, stark: boolean) => {
    const teile = teileVon(p);
    if (teile.length === 0) return null;
    const name = teile[0].platz?.name;
    if (!name) return null;
    const x = (Math.min(...teile.map((k) => k.x)) + Math.max(...teile.map((k) => k.x + k.bx))) / 2;
    const y = (Math.min(...teile.map((k) => k.y)) + Math.max(...teile.map((k) => k.y + k.by))) / 2;
    const z = Math.max(...teile.map((k) => k.z + k.bz));
    return (
      <Html position={[x * M, z * M + 0.12, y * M]} center zIndexRange={[40, 20]} style={{ pointerEvents: "none" }}>
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold shadow-[0_2px_8px_rgba(21,20,15,.35)] backdrop-blur-sm ${
            stark ? "bg-kohle text-creme" : "bg-kohle/70 text-creme"
          }`}
        >
          {name}
        </span>
      </Html>
    );
  };
  const bx = breite * M;
  const bz = tiefe * M;
  const bh = RAUMHOEHE * M;

  return (
    <>
      {/* Vier einzelne Wandflächen statt einer Kiste: ohne Decke, und jede
          ist nur von innen zu sehen — so steht die vordere Wand nie im Weg. */}
      {([
        { p: [bx / 2, bh / 2, 0], r: [0, 0, 0], b: bx },
        { p: [bx / 2, bh / 2, bz], r: [0, Math.PI, 0], b: bx },
        { p: [0, bh / 2, bz / 2], r: [0, Math.PI / 2, 0], b: bz },
        { p: [bx, bh / 2, bz / 2], r: [0, -Math.PI / 2, 0], b: bz },
      ] as const).map((w, i) => (
        <mesh key={i} position={w.p as unknown as [number, number, number]} rotation={w.r as unknown as [number, number, number]} receiveShadow>
          <planeGeometry args={[w.b, bh]} />
          <meshStandardMaterial color="#ece8e0" roughness={0.97} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[bx / 2, 0.002, bz / 2]} receiveShadow>
        <planeGeometry args={[bx, bz]} />
        <meshStandardMaterial color={hex([190, 162, 126])} roughness={0.66} />
      </mesh>

      {szene.waende
        .filter((w) => sicht[w.seite])
        .map((w) => (
          <group key={w.seite}>
            {w.kaesten.filter((k) => !k.id.startsWith("w-")).map((k) => <Koerper key={k.id} k={k} />)}
          </group>
        ))}

      {szene.kaesten.map((k) => (
        <Koerper
          key={k.id}
          k={k}
          umstellen={umstellen}
          ueber={!!ueber && k.platz?.zeile === ueber.zeile && k.platz?.index === ueber.index}
          setzeUeber={setzeUeber}
        />
      ))}

      {umstellen && <Umriss kaesten={teileVon(umstellen.gewaehlt)} farbe="#8a6410" />}
      {umstellen && !umstellen.gewaehlt && <Umriss kaesten={teileVon(ueber)} farbe="#4a473e" />}
      {umstellen && schild(umstellen.gewaehlt, true)}
      {umstellen && ueber && !(umstellen.gewaehlt?.zeile === ueber.zeile && umstellen.gewaehlt?.index === ueber.index) &&
        schild(ueber, false)}

      {/* Geräte benennen: sonst sieht man weiße Fronten und weiß nicht,
          hinter welcher der Backofen steckt. Nur die Wände, auf die man
          gerade schaut — sonst schweben Schilder vor der Küche. */}
      {/* Steht ein Gerät im Mittelpunkt — etwa weil man es gerade aussucht —,
          dann zeigen wir nur dieses, dafür aber unabhängig vom Blickwinkel. */}
      {zeigeGeraete &&
        szene.marken
          .filter((m) => (betont ? m.rolle === betont : sicht[m.wand]))
          .map((m) => <Geraetemarke key={m.id} marke={m} stark={!!betont} />)}
      {betont &&
        szene.marken
          .filter((m) => m.rolle === betont)
          .map((m) => <Umriss key={`u-${m.id}`} kaesten={[m.kasten]} farbe="#8a6410" />)}

      <ContactShadows
        position={[bx / 2, 0.005, bz / 2]}
        scale={Math.max(bx, bz) * 1.7}
        resolution={1024}
        blur={2.2}
        opacity={0.4}
        far={1.3}
        color="#2e2416"
      />
    </>
  );
}

/**
 * Hält den Abstand so, dass die Küche ins Bild passt — auf dem Handy ist das
 * Fenster hochkant und schmal, da muss die Kamera weiter weg.
 */
function Abstand({ ziel, richtung, groesse }: {
  ziel: [number, number, number];
  richtung: [number, number, number];
  groesse: number;
}) {
  const { camera, size } = useThree();
  useEffect(() => {
    const kam = camera as PerspectiveCamera;
    const seite = size.width / Math.max(1, size.height);
    const zuschlag = seite < 0.95 ? 1.52 : seite < 1.35 ? 1.24 : seite < 1.8 ? 1.08 : 1;
    const weit = (groesse * 0.92 + 1.55) * zuschlag;
    const z = new Vector3(...ziel);
    const r = new Vector3(...richtung).normalize();
    kam.position.copy(z).addScaledVector(r, weit);
    kam.position.y = 1.85 + (zuschlag - 1) * 0.55;
    kam.updateProjectionMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, groesse, richtung[0], richtung[2]]);
  return null;
}

function Licht() {
  return (
    <>
      {/* Grundhelligkeit, damit Ecken und Nischen Zeichnung behalten statt
          schwarz zuzulaufen. */}
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#fffaf2", "#cdbfa8", 0.62]} />
      <directionalLight
        position={[-4.5, 6.5, 5]}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-6}
        shadow-camera-far={32}
      />
      <directionalLight position={[5, 3.5, -3]} intensity={0.4} />
      <Environment resolution={256}>
        <Lightformer intensity={2.6} position={[0, 4.5, 2]} scale={[9, 4, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-5, 2.5, 1]} rotation-y={Math.PI / 2} scale={[7, 4, 1]} color="#fff6e8" />
        <Lightformer intensity={0.8} position={[5, 2, -2]} rotation-y={-Math.PI / 2} scale={[7, 4, 1]} color="#e8f0ff" />
        {/* Rückwurf vom Boden: wärmt die Unterseiten und hellt die Ecken auf. */}
        <Lightformer intensity={0.9} position={[0, -2, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} color="#eadcc4" />
      </Environment>
    </>
  );
}

export function Kuechenraum({
  typ,
  variante,
  hoehe = 440,
  rahmenGroesse,
  unterzeile = true,
  geraeteSchalter = false,
  umstellen,
  betont,
}: {
  typ: Kuechentyp;
  variante: VarianteRoh;
  hoehe?: number | string;
  /** Feste Bezugsgröße für den Kameraabstand in Metern. Ohne sie richtet
      sich der Abstand nach dem Raum — was springt, wenn der Raum sich
      während des Schiebens ändert. */
  rahmenGroesse?: number;
  unterzeile?: boolean;
  /** Schalter, um die Geräte zu benennen. */
  geraeteSchalter?: boolean;
  /** Schränke im Raum anfassen und tauschen. */
  umstellen?: {
    gewaehlt: { zeile: string; index: number } | null;
    onWaehle: (zeile: string, index: number) => void;
    moeglich?: (zeile: string, index: number) => boolean;
    /** Tippen ins Leere löst die Auswahl wieder. */
    onLeer?: () => void;
  };
  /** Ein Gerät hervorheben (Rolle, etwa "backofen"): nur dessen Schild steht
      im Raum, mit Umriss, damit man sieht, wo das Gerät hinkommt. */
  betont?: string;
}) {
  const [angefasst, setAngefasst] = useState(false);
  const [zeigeGeraete, setZeigeGeraete] = useState(true);

  // Drehen und Antippen am selben Ort: als Tippen zaehlt nur, was den Zeiger
  // kaum bewegt hat. Sonst waehlt jedes Drehen versehentlich einen Schrank.
  const zeiger = useRef({ x: 0, y: 0, gewandert: false });
  const klickOk = () => !zeiger.current.gewandert;
  const merkeStart = (e: React.PointerEvent) => {
    zeiger.current = { x: e.clientX, y: e.clientY, gewandert: false };
  };
  const merkeWeg = (e: React.PointerEvent) => {
    if (zeiger.current.gewandert) return;
    if (Math.hypot(e.clientX - zeiger.current.x, e.clientY - zeiger.current.y) > 6) {
      zeiger.current.gewandert = true;
    }
  };
  const { breite, tiefe } = typ.raum;

  // Von der Seite her schauen, an der die Küche steht — sonst sieht man
  // vor allem leere Wand.
  const blick = useMemo(() => {
    let rx = 0;
    let rz = 0;
    for (const z of typ.zeilen) {
      if (z.wand === "nord") rz += 1;
      if (z.wand === "sued") rz -= 1;
      if (z.wand === "west") rx += 1;
      if (z.wand === "ost") rx -= 1;
    }
    if (rx === 0 && rz === 0) rz = 1;
    const laenge = Math.hypot(rx, rz) || 1;
    const weit = Math.max(breite, tiefe) * M * 0.92 + 1.55;
    return {
      richtung: [rx / laenge, 0, rz / laenge] as [number, number, number],
      pos: [
        breite / 2 * M + (rx / laenge) * weit,
        1.85,
        tiefe / 2 * M + (rz / laenge) * weit,
      ] as [number, number, number],
      ziel: [breite / 2 * M, 1.05, tiefe / 2 * M] as [number, number, number],
    };
  }, [typ.zeilen, breite, tiefe]);

  return (
    <div>
      <div
        className="vertieft relative overflow-hidden rounded-[18px] bg-[#efebe3] ring-1 ring-black/[0.06]"
        style={{ height: hoehe, touchAction: "none" }}
        onPointerDown={(e) => { setAngefasst(true); merkeStart(e); }}
        onPointerMove={merkeWeg}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true }}
          camera={{ position: blick.pos, fov: 34, near: 0.1, far: 120 }}
          onPointerMissed={() => { if (umstellen && klickOk()) umstellen.onLeer?.(); }}
        >
          <color attach="background" args={["#efebe3"]} />
          <Abstand
            ziel={blick.ziel}
            richtung={blick.richtung}
            // Über Eck und in U-Form greift die Küche weiter um den Raum —
            // dann muss die Kamera etwas zurück, sonst stehen die Seitenzeilen
            // am Bildrand an.
            groesse={rahmenGroesse ?? Math.max(breite, tiefe) * M + (typ.zeilen.length - 1) * 0.38}
          />
          <Suspense fallback={null}>
            <Licht />
            <Raum
              typ={typ}
              variante={variante}
              zeigeGeraete={(geraeteSchalter && zeigeGeraete) || !!betont}
              betont={betont}
              umstellen={umstellen ? { ...umstellen, klickOk } : undefined}
            />
          </Suspense>
          <OrbitControls
            target={blick.ziel}
            enablePan={false}
            enableDamping
            dampingFactor={0.07}
            rotateSpeed={0.6}
            minPolarAngle={Math.PI * 0.16}
            maxPolarAngle={Math.PI * 0.495}
            minDistance={2.4}
            maxDistance={Math.max(breite, tiefe) * M * 2.4 + 3}
          />
        </Canvas>

        {/* Zarte Abdunklung an den Raendern: die Buehne wirkt wie ein
            Ausschnitt, nicht wie ein aufgeklebtes Bild. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 85% at 50% 32%, rgba(0,0,0,0) 52%, rgba(44,38,26,0.16) 100%)" }}
        />

        {!angefasst && (
          <span className="pointer-events-none absolute bottom-3.5 right-4 rounded-full bg-kohle/55 px-3 py-1 text-[11.5px] font-medium text-creme backdrop-blur-sm">
            Ziehen zum Drehen
          </span>
        )}
      </div>

      {(unterzeile || geraeteSchalter) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {geraeteSchalter && (
            <button
              type="button"
              onClick={() => setZeigeGeraete((v) => !v)}
              aria-pressed={zeigeGeraete}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                zeigeGeraete
                  ? "bg-kohle text-creme"
                  : "flaeche text-kohle-2 hover:!border-kohle-3"
              }`}
            >
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${zeigeGeraete ? "bg-creme" : "bg-kohle-3"}`} />
              Geräte benennen
            </button>
          )}
          {unterzeile && (
            <p className="text-[12.5px] text-kohle-3">
              Gerechnet, nicht gezeichnet: jeder Schrank steht so, wie er geliefert wird.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
