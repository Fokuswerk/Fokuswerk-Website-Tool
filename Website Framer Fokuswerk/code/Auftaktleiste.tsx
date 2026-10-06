import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties } from "react"

// Auftaktleiste — unterer Rand des Auftakts: links ein Scroll-Hinweis mit wandernder Linie,
// rechts drei belegte Ergebnisse aus echten Projekten, die beim Laden hochzählen.
// Werte stammen aus den Case Studies (Bestand.md / Case-Studies.md).

declare global {
    interface Window {
        __vorspannEnde?: boolean
    }
}

// Wartet, bis der Vorspann (Ladeanimation) weg ist — gibt es keinen, sofort
function nachVorspann(fn: () => void): () => void {
    if (typeof window === "undefined") return () => {}
    const laeuft = !!document.querySelector('[data-vorspann="an"]') && !window.__vorspannEnde
    if (!laeuft) {
        fn()
        return () => {}
    }
    let erledigt = false
    const los = () => {
        if (erledigt) return
        erledigt = true
        fn()
    }
    window.addEventListener("fokuswerk:vorspann-ende", los, { once: true })
    const notaus = window.setTimeout(los, 6000)
    return () => {
        window.removeEventListener("fokuswerk:vorspann-ende", los)
        window.clearTimeout(notaus)
    }
}

interface Beleg {
    wert: number
    vor: string
    nach: string
    text: string
    kunde: string
}

interface AuftaktleisteProps {
    belege: Beleg[]
    hinweis: string
    akzent: string
    style?: CSSProperties
}

const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const PAPIER = "rgb(245, 243, 239)"

const STANDARD: Beleg[] = [
    { wert: 156, vor: "+", nach: " %", text: "mehr Buchungen", kunde: "Zwillis Padel" },
    { wert: 69, vor: "", nach: "", text: "Bewerbungen", kunde: "Patio" },
    { wert: 72, vor: "+", nach: " %", text: "länger auf der Website", kunde: "WinHadi" },
]

function Zahl(props: { b: Beleg; verzug: number; statisch: boolean }) {
    const { b, verzug, statisch } = props
    const reduziert = useReducedMotion()
    const [w, setW] = useState(statisch || reduziert ? b.wert : 0)
    useEffect(() => {
        if (statisch || reduziert) return
        let raf = 0
        let start = 0
        const lauf = (t: number) => {
            const p = Math.max(0, Math.min(1, (t - start) / 1600))
            setW(Math.round(b.wert * (1 - Math.pow(1 - p, 4))))
            if (p < 1) raf = requestAnimationFrame(lauf)
        }
        const ab = nachVorspann(() => {
            start = performance.now() + verzug * 1000
            raf = requestAnimationFrame(lauf)
        })
        return () => {
            ab()
            cancelAnimationFrame(raf)
        }
    }, [b.wert, verzug, statisch, reduziert])
    return (
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {b.vor}
            {w.toLocaleString("de-DE")}
            {b.nach}
        </span>
    )
}

/**
 * Auftaktleiste
 *
 * @framerIntrinsicWidth 1240
 * @framerIntrinsicHeight 90
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Auftaktleiste(props: AuftaktleisteProps) {
    const { hinweis = "Scrollen", akzent = "rgb(255, 90, 31)", style } = props
    const statisch = useIsStaticRenderer()
    const reduziert = useReducedMotion()
    const ref = useRef<HTMLDivElement>(null)
    const [breite, setBreite] = useState(1240)
    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => setBreite(el.clientWidth || 1240))
        ro.observe(el)
        setBreite(el.clientWidth || 1240)
        return () => ro.disconnect()
    }, [])
    const schmal = breite < 700
    // Drei Belege nebeneinander lassen auf dem Handy je rund 120 px — der dritte wurde dort
    // abgeschnitten. Zwei haben Platz, und dieselben Zahlen stehen weiter unten im Abschnitt
    // „Ergebnisse" noch einmal in Ruhe.
    const belege = (props.belege && props.belege.length ? props.belege : STANDARD).slice(0, schmal ? 2 : 3)
    const [los, setLos] = useState(statisch)
    useEffect(() => (statisch ? undefined : nachVorspann(() => setLos(true))), [statisch])

    return (
        <div
            ref={ref}
            style={{
                ...style,
                width: "100%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 24,
                fontFamily: SCHRIFT,
                color: PAPIER,
                borderTop: "1px solid rgba(245,243,239,0.14)",
                paddingTop: schmal ? 16 : 22,
            }}
        >
            {!schmal && (
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(245,243,239,0.55)" }}>
                    <span style={{ position: "relative", width: 1, height: 38, background: "rgba(245,243,239,0.18)", overflow: "hidden" }}>
                        <motion.span
                            style={{ position: "absolute", left: 0, width: 1, height: 14, background: akzent }}
                            initial={{ top: -14 }}
                            animate={statisch || reduziert ? { top: 12 } : { top: [-14, 38] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
                        />
                    </span>
                    {hinweis}
                </div>
            )}
            <div style={{ display: "flex", gap: schmal ? 0 : 0, width: schmal ? "100%" : "auto" }}>
                {belege.map((b, i) => (
                    <motion.div
                        key={i}
                        initial={statisch ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
                        animate={los ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.9, delay: 0.9 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            flex: schmal ? 1 : "0 0 auto",
                            minWidth: 0,
                            padding: schmal ? "0 10px" : "0 28px",
                            borderLeft: i === 0 ? "none" : "1px solid rgba(245,243,239,0.14)",
                            paddingLeft: i === 0 ? 0 : schmal ? 10 : 28,
                            paddingRight: i === belege.length - 1 ? 0 : undefined,
                            display: "grid",
                            gap: 4,
                        }}
                    >
                        <span style={{ fontSize: schmal ? 22 : 30, fontWeight: 500, letterSpacing: "-0.05em", lineHeight: 1 }}>
                            <Zahl b={b} verzug={1 + i * 0.12} statisch={statisch} />
                        </span>
                        <span style={{ fontSize: schmal ? 11 : 12.5, lineHeight: 1.3, color: "rgba(245,243,239,0.72)", letterSpacing: "-0.01em" }}>{b.text}</span>
                        <span style={{ fontSize: schmal ? 9.5 : 10.5, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,243,239,0.42)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.kunde}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

addPropertyControls(Auftaktleiste, {
    belege: {
        type: ControlType.Array,
        title: "Belege",
        maxCount: 3,
        control: {
            type: ControlType.Object,
            controls: {
                wert: { type: ControlType.Number, title: "Wert", defaultValue: 100 },
                vor: { type: ControlType.String, title: "Vor", defaultValue: "" },
                nach: { type: ControlType.String, title: "Nach", defaultValue: "" },
                text: { type: ControlType.String, title: "Text", defaultValue: "" },
                kunde: { type: ControlType.String, title: "Kunde", defaultValue: "" },
            },
        },
        defaultValue: STANDARD,
    },
    hinweis: { type: ControlType.String, title: "Hinweis", defaultValue: "Scrollen" },
    akzent: { type: ControlType.Color, title: "Akzent", defaultValue: "rgb(255, 90, 31)" },
})
