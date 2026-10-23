"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Vector3, type Group, type PerspectiveCamera } from "three";
import { baueSzene, type Kasten, type Stoff } from "@/lib/szene";
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

function Koerper({ k }: { k: Kasten }) {
  const stoff = STOFFE[k.stoff ?? "sonst"];
  const istFenster = k.stoff === "fenster";
  return (
    <mesh
      position={[(k.x + k.bx / 2) * M, (k.z + k.bz / 2) * M, (k.y + k.by / 2) * M]}
      castShadow={!istFenster}
      receiveShadow
    >
      <boxGeometry args={[k.bx * M, k.bz * M, k.by * M]} />
      <meshStandardMaterial
        color={hex(k.farbe)}
        roughness={stoff.rauheit}
        metalness={stoff.metall}
        emissive={istFenster ? "#d7e8f3" : "#000000"}
        emissiveIntensity={istFenster ? 0.9 : 0}
      />
    </mesh>
  );
}

/** Was in einer Wand steckt, verschwindet mit ihr, sobald man davorsteht. */
function Wandteile({
  seite, breite, tiefe, kaesten,
}: {
  seite: Wandseite; breite: number; tiefe: number; kaesten: Kasten[];
}) {
  const gruppe = useRef<Group>(null);
  const { camera } = useThree();
  useFrame(() => {
    if (!gruppe.current) return;
    const x = camera.position.x / M;
    const z = camera.position.z / M;
    gruppe.current.visible =
      seite === "nord" ? z > 0
      : seite === "sued" ? z < tiefe
      : seite === "west" ? x > 0
      : x < breite;
  });
  return (
    <group ref={gruppe}>
      {kaesten.map((k) => <Koerper key={k.id} k={k} />)}
    </group>
  );
}

function Raum({ typ, variante }: { typ: Kuechentyp; variante: VarianteRoh }) {
  const szene = useMemo(() => baueSzene(typ, variante), [typ, variante]);
  const { breite, tiefe } = typ.raum;
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

      {szene.waende.map((w) => (
        <Wandteile
          key={w.seite}
          seite={w.seite}
          breite={breite}
          tiefe={tiefe}
          kaesten={w.kaesten.filter((k) => !k.id.startsWith("w-"))}
        />
      ))}

      {szene.kaesten.map((k) => <Koerper key={k.id} k={k} />)}

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
}: {
  typ: Kuechentyp;
  variante: VarianteRoh;
  hoehe?: number | string;
  /** Feste Bezugsgröße für den Kameraabstand in Metern. Ohne sie richtet
      sich der Abstand nach dem Raum — was springt, wenn der Raum sich
      während des Schiebens ändert. */
  rahmenGroesse?: number;
  unterzeile?: boolean;
}) {
  const [angefasst, setAngefasst] = useState(false);
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
        className="relative overflow-hidden rounded-[18px] bg-[#efebe3]"
        style={{ height: hoehe, touchAction: "none" }}
        onPointerDown={() => setAngefasst(true)}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true }}
          camera={{ position: blick.pos, fov: 34, near: 0.1, far: 120 }}
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
            <Raum typ={typ} variante={variante} />
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

        {!angefasst && (
          <span className="pointer-events-none absolute bottom-3.5 right-4 rounded-full bg-kohle/55 px-3 py-1 text-[11.5px] font-medium text-creme backdrop-blur-sm">
            Ziehen zum Drehen
          </span>
        )}
      </div>

      {unterzeile && (
        <p className="mt-3 text-center text-[12.5px] text-kohle-3">
          Gerechnet, nicht gezeichnet: jeder Schrank steht hier so, wie er geliefert wird.
        </p>
      )}
    </div>
  );
}
