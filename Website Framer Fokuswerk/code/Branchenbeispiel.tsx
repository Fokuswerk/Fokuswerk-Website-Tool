import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useInView } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { Cockpit, MetaAnzeige, GoogleSuche, Trichter } from "./Arbeitsschau.tsx"

// Branchenbeispiel — eine Beispielkampagne je Branche: Google-Suchanzeige, Meta-Anzeige,
// Kampagnen-Cockpit und Trichter. Alle Werte kommen als JSON aus dem Feld „Daten“
// und sind Beispielwerte (in den Kacheln markiert).

interface BranchenbeispielProps {
    daten: string
    akzent: string
    style?: CSSProperties
}

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

function Kachel(props: { spalten: string; hoehe: number; verzug: number; statisch: boolean; kinder: (los: boolean) => ReactNode }) {
    const { spalten, hoehe, verzug, statisch, kinder } = props
    const ref = useRef<HTMLDivElement>(null)
    const imBild = useInView(ref, { once: true, amount: 0.3 })
    const los = statisch || imBild
    return (
        <motion.div
            ref={ref}
            initial={statisch ? false : { opacity: 0, y: 40 }}
            animate={los ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: verzug }}
            style={{
                gridColumn: spalten,
                height: hoehe,
                position: "relative",
                borderRadius: 16,
                padding: 20,
                boxSizing: "border-box",
                background: "linear-gradient(180deg, rgb(26,27,31) 0%, rgb(22,23,27) 100%)",
                boxShadow: "inset 0 1px 0 rgba(245,243,239,0.06), inset 0 0 0 1px rgba(245,243,239,0.06)",
                overflow: "hidden",
            }}
        >
            {kinder(los)}
        </motion.div>
    )
}

/**
 * Branchenbeispiel
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 920
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Branchenbeispiel(props: BranchenbeispielProps) {
    const { daten = "{}", akzent = "rgb(255, 90, 31)", style } = props
    const statisch = useIsStaticRenderer()
    const [ref, breite] = useBreite<HTMLDivElement>()
    let d: any = {}
    try {
        d = JSON.parse(daten || "{}")
    } catch {
        d = {}
    }
    const breit = breite >= 1000
    const g = d.google || {}
    const m = d.meta || {}
    const c = d.cockpit || {}
    const t = d.trichter || {}
    const hoch1 = breit ? 470 : 460
    const hoch2 = breit ? 440 : 470
    return (
        <div
            ref={ref}
            style={{
                ...style,
                width: "100%",
                display: "grid",
                gridTemplateColumns: breit ? "repeat(12, minmax(0, 1fr))" : "minmax(0, 1fr)",
                gap: 12,
            }}
        >
            <Kachel spalten={breit ? "span 7" : "1 / -1"} hoehe={hoch1} verzug={0} statisch={statisch} kinder={(los) => (
                <GoogleSuche los={los} akzent={akzent} beispiel titel={g.titel} firma={g.firma} suche={g.suche} domain={g.domain} headline={g.headline} beschreibung={g.beschreibung} links={g.links} werte={g.werte} />
            )} />
            <Kachel spalten={breit ? "span 5" : "1 / -1"} hoehe={breit ? hoch1 : 560} verzug={0.1} statisch={statisch} kinder={(los) => (
                <MetaAnzeige los={los} akzent={akzent} beispiel hoehe={breit ? hoch1 : 560} titel={m.titel} firma={m.firma} absender={m.absender} schlagzeile={m.schlagzeile} knopf={m.knopf} bild={m.bild} chips={m.chips} />
            )} />
            <Kachel spalten={breit ? "span 7" : "1 / -1"} hoehe={hoch2} verzug={0.05} statisch={statisch} kinder={(los) => (
                <Cockpit los={los} akzent={akzent} beispiel schmal={breite < 700} titel={c.titel} firma={c.firma} kpis={c.kpis} anfragen={c.anfragen} kosten={c.kosten} wochen={c.wochen} />
            )} />
            <Kachel spalten={breit ? "span 5" : "1 / -1"} hoehe={breit ? hoch2 : 380} verzug={0.15} statisch={statisch} kinder={(los) => (
                <Trichter los={los} akzent={akzent} beispiel titel={t.titel} firma={t.firma} stufen={t.stufen} />
            )} />
        </div>
    )
}

addPropertyControls(Branchenbeispiel, {
    daten: { type: ControlType.String, title: "Daten (JSON)", displayTextArea: true, defaultValue: "{}" },
    akzent: { type: ControlType.Color, title: "Akzent", defaultValue: "rgb(255, 90, 31)" },
})
