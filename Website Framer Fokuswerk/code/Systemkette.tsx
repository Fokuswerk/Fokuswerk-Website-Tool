import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useScroll, useTransform, useSpring, useReducedMotion, type MotionValue } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

// Systemkette — die Positionierung als eine Rechnung, nicht als vier Kästen.
//
// Vorgeschichte: Bis 15.10.2026 standen hier vier gleich große Karten mit Mini-Grafiken und
// erfundenen Werten („12.480", „4 von 100", „41", „ein Drittel"), die beim Scrollen aus einer
// verstreuten Lage einrasteten. Rückmeldung: „finde ich noch nicht so mega geil." Drei Gründe,
// die das erklären: vier gleich gewichtete Karten sind ein Standardraster; die Mini-Grafiken
// zeigten nichts Echtes; und vor allem rechneten die vier Zahlen nicht miteinander — sie standen
// beziehungslos nebeneinander, obwohl der Abschnitt gerade behauptet, dass alles ineinandergreift.
//
// Jetzt: eine Achse mit vier Knoten, auf der eine einzige Kette durchrechnet —
// 215.321 Einblendungen → 3,3 % klicken → 7.051 Besucher → 6,2 % melden sich → 439 Anfragen →
// 2.328 € Budget → 5,30 € je Anfrage. Alle Werte aus einem echten Google-Ads-Konto
// (WAV Westerstede, 19.05.–12.10.2026, siehe Fallstudien-Material.md). Beim Scrollen wächst die
// Linie von links nach rechts durch die Knoten; die Stationen kommen in derselben Reihenfolge.
// Nicht sticky: die Bewegung hängt nur an der Position des Blocks im Fenster.

interface Glied {
    titel: string
    text: string
    wert: string
    einheit: string
    uebergang?: string
}

interface SystemketteProps {
    stufen: Glied[]
    akzent: string
    quelle: string
    beispielHinweis: boolean
    style?: CSSProperties
}

const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const PAPIER = "rgb(245, 243, 239)"
const MARKENGRAU = "rgb(53, 53, 53)"
const LINIE = "rgba(245, 243, 239, 0.09)"
const GRAU = "rgba(245, 243, 239, 0.5)"
const LEISE = "rgba(245, 243, 239, 0.34)"

const STANDARD: Glied[] = [
    {
        titel: "Gesehen werden",
        text: "Die Anzeige läuft bei Google und Instagram — dort, wo Ihre Kunden gerade suchen.",
        wert: "215.321",
        einheit: "Einblendungen",
        uebergang: "3,3 % klicken",
    },
    {
        titel: "Überzeugen",
        text: "In Sekunden klarmachen, warum ausgerechnet Sie — 97 % der Besucher kamen vom Handy.",
        wert: "7.051",
        einheit: "Besucher auf der Seite",
        uebergang: "6,2 % melden sich",
    },
    {
        titel: "Anfrage bekommen",
        text: "Anruf, Formular oder WhatsApp — und wir sehen, welche Anzeige die Anfrage gebracht hat.",
        wert: "439",
        einheit: "Anfragen",
        uebergang: "2.328 € Budget",
    },
    {
        titel: "Besser werden",
        text: "Was Anfragen bringt, bekommt mehr Budget. Was nichts bringt, fliegt raus.",
        wert: "5,30 €",
        einheit: "je Anfrage",
    },
]

const QUELLE_STANDARD = "Google Ads für WAV Westerstede · 19.05.–12.10.2026"

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

// ---------- Achse: Knoten und wachsende Linie ----------

function Knoten(props: { i: number; letzter: boolean; p: MotionValue<number>; akzent: string; statisch: boolean }) {
    const { i, letzter, p, akzent, statisch } = props
    const an = useTransform(p, (v: number) => (statisch ? 1 : weich((v - (0.1 + i * 0.22)) / 0.2)))
    const fuellung = useTransform(an, (v: number) => (v > 0.5 ? akzent : "rgba(245,243,239,0.18)"))
    const hof = useTransform(an, (v: number) => `0 0 0 ${(v * 5).toFixed(2)}px rgba(255,90,31,0.16)`)
    const strich = useTransform(p, (v: number) => (statisch ? 1 : weich((v - (0.18 + i * 0.22)) / 0.22)))
    return (
        <div style={{ height: 26, display: "flex", alignItems: "center", gap: 0 }}>
            <motion.span style={{ width: 9, height: 9, borderRadius: 9, background: fuellung, boxShadow: hof, flexShrink: 0 }} />
            {!letzter && (
                <span style={{ flex: 1, height: 1, background: LINIE, position: "relative", overflow: "hidden" }}>
                    <motion.span
                        style={{ position: "absolute", inset: 0, background: akzent, transformOrigin: "0% 50%", scaleX: strich }}
                    />
                </span>
            )}
        </div>
    )
}

function Strecke(props: { i: number; p: MotionValue<number>; akzent: string; statisch: boolean }) {
    const { i, p, akzent, statisch } = props
    const strich = useTransform(p, (v: number) => (statisch ? 1 : weich((v - (0.2 + i * 0.22)) / 0.22)))
    return (
        <div style={{ height: 26, display: "flex", alignItems: "center" }}>
            <span style={{ flex: 1, height: 1, background: LINIE, position: "relative", overflow: "hidden" }}>
                <motion.span style={{ position: "absolute", inset: 0, background: akzent, transformOrigin: "0% 50%", scaleX: strich }} />
            </span>
        </div>
    )
}

// ---------- Handy: eine Zeile je Schritt ----------
// Vorgeschichte: erst vier scrollgesteuerte Karten (zu wuchtig, ruckelte), dann eine Zeitleiste
// mit Kreisen. Beides las sich wie ein technisches Schaubild. Jetzt: links was passiert, rechts
// was dabei herauskommt, dazwischen die Umrechnung auf einer feinen Linie.

function KompaktKette(props: { liste: Glied[]; akzent: string; fussnote: string; statisch: boolean; reduziert: boolean }) {
    const { liste, akzent, fussnote, statisch, reduziert } = props
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
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "baseline", columnGap: 14, padding: "13px 0", borderTop: i === 0 ? "none" : `1px solid ${LINIE}` }}>
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
                    </div>
                    {g.uebergang && (
                        <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 2 }}>
                            <span style={{ width: 1, height: 14, background: akzent, opacity: 0.7, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, letterSpacing: "0.04em", color: LEISE }}>{g.uebergang}</span>
                        </div>
                    )}
                </motion.div>
            ))}
            {fussnote && (
                <div style={{ marginTop: 16, fontSize: 10.5, letterSpacing: "0.06em", color: "rgba(245,243,239,0.3)" }}>{fussnote}</div>
            )}
        </div>
    )
}

/**
 * Systemkette
 *
 * @framerIntrinsicWidth 1176
 * @framerIntrinsicHeight 420
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Systemkette(props: SystemketteProps) {
    const { stufen: glieder, akzent = "rgb(255, 90, 31)", quelle, beispielHinweis = false, style } = props
    const statisch = useIsStaticRenderer()
    const reduziert = useReducedMotion() ?? false
    const [huelle, breite] = useBreite<HTMLDivElement>()
    const schmal = breite < 820
    const liste = (glieder && glieder.length ? glieder : STANDARD)
        .slice(0, 4)
        .map((g, i) => ({ ...STANDARD[i], ...Object.fromEntries(Object.entries(g || {}).filter(([, v]) => v !== undefined && v !== "")) })) as Glied[]
    const fussnote = beispielHinweis ? "Beispielwerte" : quelle || QUELLE_STANDARD

    const { scrollYProgress } = useScroll({ target: huelle, offset: ["start 1", "start 0.55"] })
    const federnd = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
    const fest = reduziert || statisch
    const p = fest ? scrollYProgress : federnd
    const pp = useTransform(p, (v: number) => (fest ? 1 : v))

    if (schmal)
        return (
            <div
                ref={huelle}
                style={{
                    ...style,
                    position: "relative",
                    width: "100%",
                    background: MARKENGRAU,
                    borderRadius: 20,
                    padding: "22px 18px 20px",
                    boxSizing: "border-box",
                    fontFamily: SCHRIFT,
                    overflow: "hidden",
                    color: PAPIER,
                }}
            >
                <KompaktKette liste={liste} akzent={akzent} fussnote={fussnote} statisch={statisch} reduziert={reduziert} />
            </div>
        )

    const spalten = "1fr 92px 1fr 92px 1fr 92px 1fr"
    const zellen: ReactNode[] = []
    liste.forEach((g, i) => {
        const spalte = i * 2 + 1
        const an = 0.08 + i * 0.22
        const erscheint = {
            initial: fest ? false : ({ opacity: 0, y: 10 } as const),
            whileInView: fest ? undefined : ({ opacity: 1, y: 0 } as const),
            viewport: { once: true, amount: 0.4 } as const,
            transition: { duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        }
        zellen.push(
            <motion.div key={"n" + i} {...erscheint} style={{ gridColumn: spalte, gridRow: 1, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", color: akzent }}>
                {String(i + 1).padStart(2, "0")}
            </motion.div>,
            <motion.div
                key={"t" + i}
                {...erscheint}
                style={{ gridColumn: spalte, gridRow: 2, fontSize: 19, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.2, color: PAPIER, paddingTop: 10, ...({ textWrap: "balance" } as any) }}
            >
                {g.titel}
            </motion.div>,
            <motion.div
                key={"x" + i}
                {...erscheint}
                style={{ gridColumn: spalte, gridRow: 3, fontSize: 13.5, lineHeight: 1.5, letterSpacing: "-0.01em", color: GRAU, paddingTop: 8, paddingRight: 12, paddingBottom: 18 }}
            >
                {g.text}
            </motion.div>,
            <div key={"k" + i} style={{ gridColumn: spalte, gridRow: 4 }}>
                <Knoten i={i} letzter={i === liste.length - 1} p={pp} akzent={akzent} statisch={fest} />
            </div>,
            <motion.div
                key={"w" + i}
                initial={fest ? false : { opacity: 0, y: 6 }}
                whileInView={fest ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{ gridColumn: spalte, gridRow: 5, fontSize: 40, fontWeight: 500, letterSpacing: "-0.055em", lineHeight: 1.05, color: PAPIER, fontVariantNumeric: "tabular-nums", paddingTop: 12 }}
            >
                {g.wert}
            </motion.div>,
            <motion.div
                key={"e" + i}
                {...erscheint}
                style={{ gridColumn: spalte, gridRow: 6, fontSize: 12.5, letterSpacing: "-0.005em", color: GRAU, paddingTop: 6 }}
            >
                {g.einheit}
            </motion.div>
        )
        if (i < liste.length - 1) {
            const zwischen = i * 2 + 2
            zellen.push(
                <motion.div
                    key={"u" + i}
                    initial={fest ? false : { opacity: 0 }}
                    whileInView={fest ? undefined : { opacity: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: 0.25 + i * 0.12 }}
                    style={{
                        gridColumn: zwischen,
                        gridRow: 3,
                        alignSelf: "end",
                        textAlign: "center",
                        fontSize: 11,
                        letterSpacing: "0.03em",
                        color: LEISE,
                        paddingBottom: 7,
                        whiteSpace: "nowrap",
                    }}
                >
                    {g.uebergang}
                </motion.div>,
                <div key={"s" + i} style={{ gridColumn: zwischen, gridRow: 4 }}>
                    <Strecke i={i} p={pp} akzent={akzent} statisch={fest} />
                </div>
            )
        }
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
                padding: "30px 34px 32px",
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
            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 24,
                    marginBottom: 26,
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                }}
            >
                <span style={{ color: akzent, whiteSpace: "nowrap" }}>Alles greift ineinander</span>
                <span style={{ color: "rgba(245,243,239,0.32)", letterSpacing: "0.06em", textTransform: "none", textAlign: "right" }}>{fussnote}</span>
            </div>
            <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: spalten, gridTemplateRows: "auto auto 1fr auto auto auto", alignItems: "start" }}>
                {zellen}
            </div>
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
                uebergang: { type: ControlType.String, title: "Übergang" },
            },
        },
        defaultValue: STANDARD,
    },
    akzent: { type: ControlType.Color, title: "Akzent", defaultValue: "rgb(255, 90, 31)" },
    quelle: { type: ControlType.String, title: "Quelle", defaultValue: QUELLE_STANDARD },
    beispielHinweis: { type: ControlType.Boolean, title: "Beispiel-Hinweis", defaultValue: false },
})
