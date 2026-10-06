import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useEffect, useId, useRef, useState, type CSSProperties } from "react"

// Glaskante — flüssiges Glas am unteren Fensterrand.
// Progressive Unschärfe nach dem Bungee-Prinzip (jede Schicht doppelt so unscharf wie die vorige,
// Maskenband wandert nach unten), dazu Sättigung/Aufhellung wie bei Apples Glas, eine Tönung, die
// die Farbe des Abschnitts darunter übernimmt, und in Chromium eine leichte Lichtbrechung, durch die
// der Inhalt beim Durchscrollen wie unter Wasser zieht. Die Schichten ragen seitlich über den Rand,
// damit die Unschärfe an den Kanten keine dunklen Säume zieht.

interface GlaskanteProps {
    schichten: number
    unschaerfe: number
    saettigung: number
    helligkeit: number
    toenung: number
    anpassen: boolean
    grundfarbe: string
    brechung: number
    style?: CSSProperties
}

const UEBERSTAND = 64

function maske(von: number, voll: number, bis: number, ende: number) {
    const p = (v: number) => `${Math.max(0, Math.min(100, v)).toFixed(2)}%`
    return `linear-gradient(to bottom, rgba(0,0,0,0) ${p(von)}, rgba(0,0,0,1) ${p(voll)}, rgba(0,0,0,1) ${p(bis)}, rgba(0,0,0,0) ${p(ende)})`
}

function mitMaske(m: string): CSSProperties {
    return { maskImage: m, WebkitMaskImage: m }
}

function mitFilter(f: string): CSSProperties {
    return { backdropFilter: f, WebkitBackdropFilter: f } as CSSProperties
}

// "rgb(12, 13, 14)" / "rgba(…)" → [r, g, b, a]
function farbwerte(css: string): [number, number, number, number] | null {
    const m = css.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/)
    if (!m) return null
    return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])]
}

function istChromium() {
    if (typeof navigator === "undefined") return false
    const brands = (navigator as any).userAgentData?.brands as { brand: string }[] | undefined
    if (brands) return brands.some((b) => /Chromium/i.test(b.brand))
    return /Chrome\//.test(navigator.userAgent)
}

/**
 * Glaskante
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 200
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Glaskante(props: GlaskanteProps) {
    const {
        schichten = 8,
        unschaerfe = 32,
        saettigung = 1.7,
        helligkeit = 1.06,
        toenung = 0.45,
        anpassen = true,
        grundfarbe = "rgb(243, 242, 238)",
        brechung = 14,
        style,
    } = props

    const statisch = useIsStaticRenderer()
    const filterId = "glaskante-" + useId().replace(/[^a-zA-Z0-9_-]/g, "")
    const [farbe, setFarbe] = useState(grundfarbe)
    const [chromium, setChromium] = useState(false)
    const huelle = useRef<HTMLDivElement>(null)

    useEffect(() => setChromium(istChromium()), [])

    // Farbe des Abschnitts direkt über der Unterkante lesen und als Tönung übernehmen.
    useEffect(() => {
        if (statisch || !anpassen || typeof window === "undefined") return
        let raf = 0
        let letzte = ""
        const messen = () => {
            raf = 0
            const breite = window.innerWidth
            const y = window.innerHeight - 8
            let el = document.elementFromPoint(breite / 2, y) as HTMLElement | null
            let gefunden: string | null = null
            while (el && el !== document.body && el !== document.documentElement) {
                if (el.getBoundingClientRect().width >= breite * 0.9) {
                    const w = farbwerte(getComputedStyle(el).backgroundColor)
                    if (w && w[3] > 0.5) {
                        gefunden = `rgb(${w[0]}, ${w[1]}, ${w[2]})`
                        break
                    }
                }
                el = el.parentElement
            }
            const neu = gefunden ?? grundfarbe
            if (neu !== letzte) {
                letzte = neu
                setFarbe(neu)
            }
        }
        const anstossen = () => {
            if (!raf) raf = requestAnimationFrame(messen)
        }
        messen()
        window.addEventListener("scroll", anstossen, { passive: true })
        window.addEventListener("resize", anstossen)
        const nachLaden = window.setTimeout(anstossen, 1200)
        return () => {
            window.removeEventListener("scroll", anstossen)
            window.removeEventListener("resize", anstossen)
            window.clearTimeout(nachLaden)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [statisch, anpassen, grundfarbe])

    // Am Seitenende blendet das Glas aus, damit die Fußzeile ganz unten lesbar bleibt; ganz oben
    // ebenfalls, damit der Auftakt (Kennzahlen am unteren Rand) frei steht.
    useEffect(() => {
        if (statisch || typeof window === "undefined") return
        let raf = 0
        const pruefen = () => {
            raf = 0
            const el = huelle.current
            if (!el) return
            const doc = document.documentElement
            const rest = Math.max(doc.scrollHeight, document.body.scrollHeight) - (window.scrollY + window.innerHeight)
            const hoehe = Math.max(120, el.clientHeight || 200) * 1.4
            const x = Math.max(0, Math.min(1, rest / hoehe))
            // ganz oben (Auftakt) noch kein Glas — es blendet erst beim Scrollen ein
            const y = Math.max(0, Math.min(1, (window.scrollY - 60) / 220))
            const unten = x * x * (3 - 2 * x)
            const oben = y * y * (3 - 2 * y)
            el.style.opacity = (unten * oben).toFixed(3)
        }
        const anstossen = () => {
            if (!raf) raf = requestAnimationFrame(pruefen)
        }
        pruefen()
        window.addEventListener("scroll", anstossen, { passive: true })
        window.addEventListener("resize", anstossen)
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(anstossen) : null
        ro?.observe(document.body)
        return () => {
            window.removeEventListener("scroll", anstossen)
            window.removeEventListener("resize", anstossen)
            ro?.disconnect()
            if (raf) cancelAnimationFrame(raf)
        }
    }, [statisch])

    const n = Math.max(3, Math.round(schichten))
    const schritt = 100 / (n + 1)
    const ebene: CSSProperties = {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: -UEBERSTAND,
        right: -UEBERSTAND,
        pointerEvents: "none",
    }

    // Auf der Arbeitsfläche nur eine ruhige Vorschau zeigen.
    if (statisch) {
        return (
            <div
                aria-hidden="true"
                style={{
                    ...style,
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(to bottom, rgba(243,242,238,0) 0%, rgba(243,242,238,${toenung}) 100%)`,
                }}
            />
        )
    }

    const schichtenListe = Array.from({ length: n }, (_, i) => {
        const blur = unschaerfe / Math.pow(2, n - 1 - i)
        const letzte = i === n - 1
        const m = letzte
            ? maske(i * schritt, (i + 1) * schritt, 100, 100)
            : maske(i * schritt, (i + 1) * schritt, (i + 2) * schritt, (i + 3) * schritt)
        return <div key={i} style={{ ...ebene, ...mitFilter(`blur(${blur.toFixed(3)}px)`), ...mitMaske(m) }} />
    })

    const w = farbwerte(farbe) ?? [243, 242, 238, 1]
    const rgb = `${w[0]}, ${w[1]}, ${w[2]}`
    const dunkel = 0.299 * w[0] + 0.587 * w[1] + 0.114 * w[2] < 110

    return (
        <div ref={huelle} aria-hidden="true" style={{ ...style, position: "relative", width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", transition: "opacity 0.25s linear" }}>
            {chromium && brechung > 0 && (
                <>
                    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
                        <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                            <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.018" numOctaves="2" seed="7" result="welle" />
                            <feGaussianBlur in="welle" stdDeviation="2" result="glatt" />
                            <feDisplacementMap in="SourceGraphic" in2="glatt" scale={brechung} xChannelSelector="R" yChannelSelector="G" />
                        </filter>
                    </svg>
                    <div
                        style={{
                            ...ebene,
                            ...mitFilter(`url(#${filterId})`),
                            ...mitMaske("linear-gradient(to bottom, rgba(0,0,0,0) 15%, rgba(0,0,0,1) 60%, rgba(0,0,0,1) 100%)"),
                        }}
                    />
                </>
            )}
            {schichtenListe}
            {/* Sättigung und Licht: macht aus Milchglas „flüssiges“ Glas */}
            <div
                style={{
                    ...ebene,
                    ...mitFilter(`saturate(${saettigung}) brightness(${dunkel ? 1 : helligkeit})`),
                    ...mitMaske("linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,1) 100%)"),
                }}
            />
            {/* Tönung in der Farbe des Abschnitts darunter */}
            <div
                style={{
                    ...ebene,
                    backgroundColor: `rgb(${rgb})`,
                    opacity: dunkel ? toenung * 0.85 : toenung,
                    transition: "background-color 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                    ...mitMaske("linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.45) 62%, rgba(0,0,0,1) 100%)"),
                }}
            />
        </div>
    )
}

addPropertyControls(Glaskante, {
    schichten: { type: ControlType.Number, title: "Schichten", defaultValue: 8, min: 3, max: 12, step: 1 },
    unschaerfe: { type: ControlType.Number, title: "Unschärfe", defaultValue: 32, min: 4, max: 64, step: 1, unit: "px" },
    saettigung: { type: ControlType.Number, title: "Sättigung", defaultValue: 1.7, min: 1, max: 3, step: 0.05 },
    helligkeit: { type: ControlType.Number, title: "Helligkeit", defaultValue: 1.06, min: 0.8, max: 1.3, step: 0.01 },
    toenung: { type: ControlType.Number, title: "Tönung", defaultValue: 0.45, min: 0, max: 1, step: 0.01 },
    anpassen: { type: ControlType.Boolean, title: "Farbe folgt", defaultValue: true },
    grundfarbe: { type: ControlType.Color, title: "Grundfarbe", defaultValue: "rgb(243, 242, 238)" },
    brechung: { type: ControlType.Number, title: "Brechung", defaultValue: 14, min: 0, max: 60, step: 1, description: "Nur Chrome/Edge. 0 = aus." },
})
