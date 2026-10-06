import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useScroll, useTransform, useSpring, useReducedMotion, type MotionValue } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

// Systemkette — die Aussage der Positionierung als Grafik: Vier Bausteine liegen zuerst verstreut
// und blass da („einzelne Maßnahmen“). Beim Durchscrollen gleiten sie in eine Reihe, eine orange
// Linie verbindet sie der Reihe nach, die Kennzahlen zählen hoch — aus Einzelteilen wird eine Kette.
// Ist sie geschlossen, läuft ein Lichtpunkt von der Anzeige bis zum Auftrag. Nicht sticky: die
// Bewegung hängt nur an der Position der Karte im Fenster. Werte sind Beispielwerte.

interface Glied {
    titel: string
    text: string
    wert: string
    einheit: string
}

interface SystemketteProps {
    stufen: Glied[]
    akzent: string
    beispielHinweis: boolean
    style?: CSSProperties
}

const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const PAPIER = "rgb(245, 243, 239)"
const TINTE = "rgb(14, 15, 18)"
const FLAECHE = "rgb(42, 42, 42)"
const MARKENGRAU = "rgb(53, 53, 53)" // Markengrau für dunkle Flächen (ersetzt Tinte als Fläche)
const LINIE = "rgba(245, 243, 239, 0.09)"
const GRAU = "rgba(245, 243, 239, 0.5)"

const STANDARD: Glied[] = [
    { titel: "Gesehen werden", text: "Ihre Anzeige erscheint bei Google und Instagram — bei Leuten in Ihrer Region, die gerade suchen.", wert: "12.480", einheit: "Menschen sehen die Anzeige" },
    { titel: "Überzeugen", text: "Ihre Website zeigt in Sekunden, warum Sie die richtige Wahl sind — auch auf dem Handy.", wert: "3,4 %", einheit: "der Besucher melden sich" },
    { titel: "Anfrage bekommen", text: "Anruf, Formular oder WhatsApp: Wir sehen, welche Anzeige welche Anfrage gebracht hat.", wert: "41", einheit: "Anfragen im Monat" },
    { titel: "Besser werden", text: "Was funktioniert, bekommt mehr Budget. Was nicht funktioniert, fliegt raus.", wert: "−38 %", einheit: "Kosten pro Anfrage" },
]

// Verstreute Ausgangslage je Baustein: x, y (px), Drehung (°)
const STREU: [number, number, number][] = [
    [-46, 64, -7],
    [34, -58, 5],
    [-28, 72, 6],
    [52, -44, -6],
]

function useBreite<T extends HTMLElement>() {
    const ref = useRef<T>(null)
    const [b, setB] = useState(1200)
    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => setB(el.clientWidth || 1200))
        ro.observe(el)
        setB(el.clientWidth || 1200)
        return () => ro.disconnect()
    }, [])
    return [ref, b] as const
}

const klemm = (v: number) => Math.max(0, Math.min(1, v))
const weich = (v: number) => {
    const x = klemm(v)
    return x * x * (3 - 2 * x)
}

// ---------- kleine Grafiken je Baustein ----------

function Mini(props: { i: number; akzent: string; an: MotionValue<number> }) {
    const { i, akzent, an } = props
    const breite = useTransform(an, (v: number) => `${Math.round(weich(v) * 100)}%`)
    if (i === 0)
        return (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Google", "Instagram"].map((t, k) => (
                    <motion.span
                        key={t}
                        style={{
                            fontSize: 11,
                            fontWeight: 500,
                            letterSpacing: "-0.01em",
                            color: PAPIER,
                            padding: "5px 10px",
                            borderRadius: 999,
                            border: `1px solid ${LINIE}`,
                            background: "rgba(245,243,239,0.04)",
                            opacity: useTransform(an, [k * 0.2, 0.5 + k * 0.2], [0.3, 1]),
                        }}
                    >
                        {t}
                    </motion.span>
                ))}
            </div>
        )
    if (i === 1)
        return (
            <div style={{ borderRadius: 8, border: `1px solid ${LINIE}`, overflow: "hidden", background: "rgba(245,243,239,0.03)" }}>
                <div style={{ display: "flex", gap: 4, padding: "6px 8px", borderBottom: `1px solid ${LINIE}` }}>
                    {[0, 1, 2].map((k) => (
                        <span key={k} style={{ width: 5, height: 5, borderRadius: 9, background: "rgba(245,243,239,0.22)" }} />
                    ))}
                </div>
                <div style={{ padding: "8px 8px 9px", display: "grid", gap: 5 }}>
                    <div style={{ height: 6, width: "72%", borderRadius: 3, background: "rgba(245,243,239,0.28)" }} />
                    <div style={{ height: 4, width: "90%", borderRadius: 3, background: "rgba(245,243,239,0.12)" }} />
                    <motion.div style={{ height: 12, width: 54, borderRadius: 6, background: akzent, opacity: useTransform(an, [0.3, 0.9], [0.25, 1]) }} />
                </div>
            </div>
        )
    if (i === 2)
        return (
            <div style={{ display: "grid", gap: 6 }}>
                {[
                    ["Instagram", 0.48],
                    ["Google", 0.37],
                    ["Direkt", 0.15],
                ].map(([l, a], k) => (
                    <div key={l as string} style={{ display: "grid", gridTemplateColumns: "58px 1fr", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10.5, color: GRAU, letterSpacing: "0.02em" }}>{l}</span>
                        <div style={{ height: 5, borderRadius: 3, background: "rgba(245,243,239,0.07)", overflow: "hidden" }}>
                            <motion.div style={{ height: "100%", borderRadius: 3, background: k === 0 ? akzent : "rgba(245,243,239,0.45)", width: useTransform(an, (v: number) => `${Math.round(weich((v - k * 0.12) / 0.7) * (a as number) * 100)}%`) }} />
                        </div>
                    </div>
                ))}
            </div>
        )
    return (
        <svg viewBox="0 0 120 40" width="100%" height={40} style={{ display: "block", overflow: "visible" }}>
            <path d="M2 8 C 20 10, 30 14, 44 18 S 70 26, 84 30 S 108 34, 118 35" fill="none" stroke="rgba(245,243,239,0.12)" strokeWidth={2} strokeLinecap="round" />
            <motion.path
                d="M2 8 C 20 10, 30 14, 44 18 S 70 26, 84 30 S 108 34, 118 35"
                fill="none"
                stroke={akzent}
                strokeWidth={2}
                strokeLinecap="round"
                style={{ pathLength: useTransform(an, [0.1, 1], [0, 1]) }}
            />
            <motion.circle cx={118} cy={35} r={3.2} fill={akzent} style={{ opacity: useTransform(an, [0.85, 1], [0, 1]) }} />
        </svg>
    )
}

// ---------- ein Baustein ----------

function Baustein(props: { g: Glied; i: number; p: MotionValue<number>; akzent: string; schmal: boolean; statisch: boolean }) {
    const { g, i, p, akzent, schmal, statisch } = props
    const [sx, sy, sr] = STREU[i % STREU.length]
    // gestaffeltes Einrasten: Baustein i kommt zwischen a und b an
    const a = 0.05 + i * 0.1
    const b = a + 0.42
    const t = useTransform(p, (v: number) => (statisch ? 1 : weich((v - a) / (b - a))))
    const x = useTransform(t, (v: number) => (schmal ? sx * 0.5 : sx) * (1 - v))
    const y = useTransform(t, (v: number) => (schmal ? 0 : sy) * (1 - v))
    const rotate = useTransform(t, (v: number) => sr * (1 - v))
    const scale = useTransform(t, [0, 1], [0.92, 1])
    const opacity = useTransform(t, [0, 1], [0.42, 1])
    const filter = useTransform(t, (v: number) => `blur(${((1 - v) * 3).toFixed(2)}px)`)
    // Innenleben (Kennzahl, Mini-Grafik) folgt, sobald das Glied angeschlossen ist
    const an = useTransform(p, (v: number) => (statisch ? 1 : klemm((v - (0.45 + i * 0.1)) / 0.35)))
    const rand = useTransform(an, (v: number) => `1px solid ${v > 0.02 ? `rgba(255, 90, 31, ${(0.12 + v * 0.38).toFixed(3)})` : LINIE}`)
    const ziffer = useTransform(an, (v: number) => (v > 0.5 ? akzent : GRAU))
    const kennzahl = useTransform(an, [0, 1], [0.25, 1])

    return (
        <motion.div
            style={{
                x,
                y,
                rotate,
                scale,
                opacity,
                filter,
                position: "relative",
                zIndex: 2,
                background: FLAECHE,
                border: rand,
                borderRadius: 16,
                padding: schmal ? "20px 20px 18px" : "22px 22px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                minHeight: schmal ? 0 : 318,
                boxShadow: "0 30px 60px -30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(245,243,239,0.05)",
                boxSizing: "border-box",
            }}
        >
            <motion.span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", color: ziffer }}>{String(i + 1).padStart(2, "0")}</motion.span>
            <div style={{ display: "grid", gap: 8 }}>
                <span style={{ fontSize: schmal ? 19 : 20, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.15, color: PAPIER, ...({ textWrap: "balance" } as any) }}>{g.titel}</span>
                <span style={{ fontSize: 13.5, lineHeight: 1.5, letterSpacing: "-0.01em", color: GRAU }}>{g.text}</span>
            </div>
            <div style={{ flex: 1, minHeight: schmal ? 0 : 12 }} />
            <Mini i={i} akzent={akzent} an={an} />
            <motion.div style={{ opacity: kennzahl, borderTop: `1px solid ${LINIE}`, paddingTop: 12, display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.05em", color: PAPIER, fontVariantNumeric: "tabular-nums" }}>{g.wert}</span>
                <span style={{ fontSize: 12, color: GRAU, letterSpacing: "-0.005em" }}>{g.einheit}</span>
            </motion.div>
        </motion.div>
    )
}

// ---------- Handy: zweispaltige Aufstellung statt Diagramm ----------
// Vorgeschichte: erst vier scrollgesteuerte Karten (zu wuchtig, ruckelte), dann eine Zeitleiste
// mit Kreisen, Verbindungslinie und je drei Textgrößen pro Schritt. Auch die las sich wie ein
// technisches Schaubild — vier verschachtelte Blöcke, zwei Etiketten in der Kopfzeile.
// Jetzt: eine Zeile je Schritt. Links was passiert, rechts was dabei herauskommt, dazwischen
// eine feine Linie. Keine Kreise, keine Verschachtelung, ein Etikett.

function KompaktKette(props: { liste: Glied[]; akzent: string; beispielHinweis: boolean; statisch: boolean; reduziert: boolean }) {
    const { liste, akzent, beispielHinweis, statisch, reduziert } = props
    const ruhig = statisch || reduziert
    return (
        <div style={{ position: "relative" }}>
            <div style={{ marginBottom: 16, fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: akzent }}>
                Alles greift ineinander
            </div>
            {liste.map((g, i) => (
                <motion.div
                    key={i}
                    initial={ruhig ? false : { opacity: 0, y: 8 }}
                    whileInView={ruhig ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        alignItems: "baseline",
                        columnGap: 14,
                        padding: "13px 0",
                        borderTop: i === 0 ? "none" : `1px solid ${LINIE}`,
                    }}
                >
                    <span style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.25, color: PAPIER }}>
                            <span style={{ color: akzent, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", marginRight: 8, verticalAlign: "1px" }}>
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            {g.titel}
                        </span>
                        <span style={{ display: "block", fontSize: 12.5, lineHeight: 1.35, letterSpacing: "-0.005em", color: GRAU, marginTop: 2 }}>{g.einheit}</span>
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.04em", color: PAPIER, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", textAlign: "right" }}>
                        {g.wert}
                    </span>
                </motion.div>
            ))}
            {beispielHinweis && (
                <div style={{ marginTop: 14, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(245,243,239,0.3)" }}>
                    Beispielwerte
                </div>
            )}
        </div>
    )
}

// ---------- Verbindung zwischen zwei Bausteinen ----------

function Verbindung(props: { i: number; p: MotionValue<number>; akzent: string; schmal: boolean; statisch: boolean; geschlossen: boolean }) {
    const { i, p, akzent, schmal, statisch, geschlossen } = props
    const reduziert = useReducedMotion()
    const a = 0.42 + i * 0.1
    const f = useTransform(p, (v: number) => (statisch ? 1 : weich((v - a) / 0.2)))
    const skala = schmal ? { scaleY: f } : { scaleX: f }
    const punkt = useTransform(f, [0.9, 1], [0, 1])
    return (
        <div
            aria-hidden="true"
            style={{
                position: "relative",
                zIndex: 1,
                ...(schmal ? { width: 2, height: 28, margin: "0 auto" } : { height: 2, width: "100%", alignSelf: "center" }),
                background: "rgba(245,243,239,0.08)",
                borderRadius: 2,
            }}
        >
            <motion.div style={{ position: "absolute", inset: 0, background: akzent, borderRadius: 2, transformOrigin: schmal ? "50% 0%" : "0% 50%", ...skala }} />
            <motion.div
                style={{
                    position: "absolute",
                    ...(schmal ? { left: "50%", bottom: -4, marginLeft: -4 } : { top: "50%", right: -4, marginTop: -4 }),
                    width: 8,
                    height: 8,
                    borderRadius: 8,
                    background: akzent,
                    boxShadow: `0 0 0 4px rgba(255,90,31,0.18)`,
                    opacity: punkt,
                }}
            />
            {geschlossen && !reduziert && (
                <motion.div
                    style={{
                        position: "absolute",
                        ...(schmal ? { left: "50%", width: 6, height: 18, marginLeft: -3 } : { top: "50%", height: 6, width: 22, marginTop: -3 }),
                        borderRadius: 6,
                        background: `radial-gradient(closest-side, rgba(255,255,255,0.95), ${akzent} 60%, rgba(255,90,31,0))`,
                        filter: "blur(0.5px)",
                    }}
                    initial={schmal ? { top: "-20%", opacity: 0 } : { left: "-20%", opacity: 0 }}
                    animate={schmal ? { top: ["-20%", "110%"], opacity: [0, 1, 1, 0] } : { left: ["-20%", "110%"], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.6, delay: i * 0.75 }}
                />
            )}
        </div>
    )
}

/**
 * Systemkette
 *
 * @framerIntrinsicWidth 1176
 * @framerIntrinsicHeight 520
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Systemkette(props: SystemketteProps) {
    const { stufen: glieder, akzent = "rgb(255, 90, 31)", beispielHinweis = true, style } = props
    const statisch = useIsStaticRenderer()
    const reduziert = useReducedMotion() ?? false
    const [huelle, breite] = useBreite<HTMLDivElement>()
    const schmal = breite < 820
    const liste = (glieder && glieder.length ? glieder : STANDARD).slice(0, 4).map((g, i) => ({ ...STANDARD[i], ...Object.fromEntries(Object.entries(g || {}).filter(([, v]) => v)) })) as Glied[]

    const { scrollYProgress } = useScroll({ target: huelle, offset: ["start 1", "start 0.5"] })
    const federnd = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
    const p = reduziert || statisch ? scrollYProgress : federnd
    const fest = reduziert || statisch
    const pp = useTransform(p, (v: number) => (fest ? 1 : v))

    const [geschlossen, setGeschlossen] = useState(false)
    useEffect(() => pp.on("change", (v: number) => setGeschlossen((alt) => (v > 0.97 ? true : v < 0.6 ? false : alt))), [pp])

    const zustandEinzeln = useTransform(pp, [0.2, 0.55], [1, 0])
    const zustandSystem = useTransform(pp, [0.75, 0.98], [0, 1])

    if (schmal)
        return (
            <div ref={huelle} style={{ ...style, position: "relative", width: "100%", background: MARKENGRAU, borderRadius: 20, padding: "22px 18px 20px", boxSizing: "border-box", fontFamily: SCHRIFT, overflow: "hidden", color: PAPIER }}>
                <KompaktKette liste={liste} akzent={akzent} beispielHinweis={beispielHinweis} statisch={statisch} reduziert={reduziert} />
            </div>
        )

    const spalten = "1fr 28px 1fr 28px 1fr 28px 1fr"
    const kinder: ReactNode[] = []
    liste.forEach((g, i) => {
        kinder.push(<Baustein key={"b" + i} g={g} i={i} p={pp} akzent={akzent} schmal={schmal} statisch={fest} />)
        if (i < liste.length - 1) kinder.push(<Verbindung key={"v" + i} i={i} p={pp} akzent={akzent} schmal={schmal} statisch={fest} geschlossen={geschlossen} />)
    })

    return (
        <div
            ref={huelle}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                background: MARKENGRAU,
                borderRadius: 24,
                padding: schmal ? "22px 16px 20px" : "30px 30px 26px",
                boxSizing: "border-box",
                fontFamily: SCHRIFT,
                overflow: "hidden",
                color: PAPIER,
            }}
        >
            {/* feines Raster im Hintergrund */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `linear-gradient(${LINIE} 1px, transparent 1px), linear-gradient(90deg, ${LINIE} 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                    maskImage: "radial-gradient(ellipse 70% 70% at 50% 45%, black 20%, transparent 80%)",
                    WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 45%, black 20%, transparent 80%)",
                    opacity: 0.55,
                    pointerEvents: "none",
                }}
            />
            {/* Kopfzeile: Einzelteile → System */}
            <div style={{ position: "relative", zIndex: 3, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: schmal ? 18 : 30, fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                <div style={{ position: "relative", height: 14, flex: 1 }}>
                    <motion.span style={{ position: "absolute", left: 0, top: 0, color: GRAU, opacity: zustandEinzeln, whiteSpace: "nowrap" }}>Jedes Teil für sich</motion.span>
                    <motion.span style={{ position: "absolute", left: 0, top: 0, color: akzent, opacity: zustandSystem, whiteSpace: "nowrap" }}>{schmal ? "Alles greift ineinander" : "Alles greift ineinander · von der Anzeige bis zum Auftrag"}</motion.span>
                </div>
                {beispielHinweis && <span style={{ color: "rgba(245,243,239,0.32)", whiteSpace: "nowrap" }}>Beispielwerte</span>}
            </div>
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: spalten, gap: schmal ? 0 : 0, alignItems: "stretch" }}>{kinder}</div>
        </div>
    )
}

addPropertyControls(Systemkette, {
    stufen: {
        type: ControlType.Array,
        title: "Stufen",
        maxCount: 4,
        control: {
            type: ControlType.Object,
            controls: {
                titel: { type: ControlType.String, title: "Titel" },
                text: { type: ControlType.String, title: "Text", displayTextArea: true },
                wert: { type: ControlType.String, title: "Wert" },
                einheit: { type: ControlType.String, title: "Einheit" },
            },
        },
        defaultValue: STANDARD,
    },
    akzent: { type: ControlType.Color, title: "Akzent", defaultValue: "rgb(255, 90, 31)" },
    beispielHinweis: { type: ControlType.Boolean, title: "Beispiel-Hinweis", defaultValue: true },
})
