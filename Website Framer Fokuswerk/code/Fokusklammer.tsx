import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useAnimationControls, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties } from "react"

// Fokusklammer — Autofokus-Klammern wie im Kamerasucher, die sich auf ein Wort der Überschrift
// legen. Sucht das Wort im Text des Elternelements (die Überschrift bleibt echter Text), misst es
// und zeichnet vier Eckwinkel darum. Ablauf: Klammern erscheinen weit, fahren auf das Wort zu,
// rasten mit kleinem Überschwinger ein, blinken zweimal (Fokus bestätigt). Danach stellt die
// „Kamera“ alle paar Sekunden sanft nach. Kein Etikett — es überlappte die Zeile darüber. Folgt dem Wort, auch wenn die Zeile beim Scrollen driftet.

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

interface FokusklammerProps {
    wort: string
    farbe: string
    verzoegerung: number
    style?: CSSProperties
}

interface Kasten {
    x: number
    y: number
    b: number
    h: number
}

let _canvas: HTMLCanvasElement | null = null
function messCanvas(): CanvasRenderingContext2D | null {
    if (typeof document === "undefined") return null
    if (!_canvas) _canvas = document.createElement("canvas")
    return _canvas.getContext("2d")
}

function findeWort(wurzel: HTMLElement, wort: string, ausser: HTMLElement | null): Range | null {
    const gang = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT)
    let n: Node | null
    while ((n = gang.nextNode())) {
        if (ausser && ausser.contains(n)) continue
        const t = n.textContent || ""
        const i = t.indexOf(wort)
        if (i >= 0) {
            const r = document.createRange()
            r.setStart(n, i)
            r.setEnd(n, i + wort.length)
            return r
        }
    }
    return null
}

/**
 * Fokusklammer
 *
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 120
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function Fokusklammer(props: FokusklammerProps) {
    const { wort = "System.", farbe = "rgb(255, 90, 31)", verzoegerung = 1.5, style } = props
    const statisch = useIsStaticRenderer()
    const reduziert = useReducedMotion()
    const ref = useRef<HTMLDivElement>(null)
    const [kasten, setKasten] = useState<Kasten | null>(null)
    const steuer = useAnimationControls()
    const [bereit, setBereit] = useState(false)

    // Wort suchen und fortlaufend vermessen (die Zeile bewegt sich beim Scrollen)
    useEffect(() => {
        if (statisch || typeof window === "undefined") return
        const el = ref.current
        if (!el) return
        let raf = 0
        let alt = ""
        const einmal = () => {
            const huelle = el.parentElement as HTMLElement | null
            // Die Überschrift liegt neben dem Baustein im selben Rahmen
            const rahmen = (huelle?.parentElement as HTMLElement | null) ?? huelle
            if (!rahmen) return
            const range = findeWort(rahmen, wort, huelle)
            if (!range) return
            const r = range.getBoundingClientRect()
            const o = el.getBoundingClientRect()
            if (r.width === 0) return
            // Nur die sichtbaren Buchstaben einrahmen (Versalhöhe bis Grundlinie), nicht die ganze
            // Zeilenbox — sonst ragen die Klammern bei enger Überschrift in die Zeile darüber.
            let k = { x: r.left - o.left, y: r.top - o.top, b: r.width, h: r.height }
            const textEl = (range.startContainer.parentElement as HTMLElement | null) ?? rahmen
            const cs = getComputedStyle(textEl)
            const ctx = messCanvas()
            if (ctx) {
                ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
                const m = ctx.measureText(wort)
                const oben = m.fontBoundingBoxAscent - m.actualBoundingBoxAscent
                const hoehe = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
                if (isFinite(oben) && hoehe > 0) k = { x: k.x, y: k.y + oben, b: k.b, h: hoehe }
            }
            const s = `${Math.round(k.x)}|${Math.round(k.y)}|${Math.round(k.b)}|${Math.round(k.h)}`
            if (s !== alt) {
                alt = s
                setKasten(k)
            }
        }
        const messen = () => {
            raf = requestAnimationFrame(messen)
            einmal()
        }
        raf = requestAnimationFrame(messen)
        // zusätzlich direkt messen — rAF läuft in Hintergrund-Tabs nicht
        const timer = [0, 120, 600, 1500].map((ms) => window.setTimeout(einmal, ms))
        window.addEventListener("resize", einmal)
        return () => {
            cancelAnimationFrame(raf)
            timer.forEach((t) => window.clearTimeout(t))
            window.removeEventListener("resize", einmal)
        }
    }, [statisch, wort])

    // Einrasten, dann gelegentlich nachstellen
    useEffect(() => {
        if (statisch || !kasten || bereit) return
        setBereit(true)
    }, [kasten, statisch, bereit])

    useEffect(() => {
        if (!bereit) return
        let aus = false
        let abmelden = () => {}
        const ablauf = async () => {
            if (reduziert) {
                await steuer.start({ opacity: 1, scale: 1, transition: { duration: 0.3, delay: verzoegerung } })
                return
            }
            await steuer.start({ opacity: 0, scale: 1.6, transition: { duration: 0 } })
            await steuer.start({ opacity: 1, scale: 1, transition: { delay: verzoegerung, type: "spring", stiffness: 260, damping: 16, mass: 0.9 } })
            await steuer.start({ opacity: [1, 0.25, 1, 0.25, 1], transition: { duration: 0.5, times: [0, 0.2, 0.45, 0.7, 1] } })
            while (!aus) {
                await new Promise((r) => setTimeout(r, 6500))
                if (aus) break
                await steuer.start({ scale: 1.12, opacity: 0.55, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } })
                await steuer.start({ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 18 } })
            }
        }
        abmelden = nachVorspann(() => {
            if (!aus) ablauf()
        })
        return () => {
            aus = true
            abmelden()
        }
    }, [bereit, reduziert, verzoegerung])

    const luft = kasten ? Math.max(6, Math.round(kasten.h * 0.14)) : 8
    const arm = kasten ? Math.max(10, Math.round(kasten.h * 0.22)) : 14
    const staerke = 2
    const ecke = (pos: "lo" | "ro" | "lu" | "ru"): CSSProperties => ({
        position: "absolute",
        width: arm,
        height: arm,
        borderColor: farbe,
        borderStyle: "solid",
        borderWidth: 0,
        ...(pos === "lo" ? { left: 0, top: 0, borderLeftWidth: staerke, borderTopWidth: staerke } : {}),
        ...(pos === "ro" ? { right: 0, top: 0, borderRightWidth: staerke, borderTopWidth: staerke } : {}),
        ...(pos === "lu" ? { left: 0, bottom: 0, borderLeftWidth: staerke, borderBottomWidth: staerke } : {}),
        ...(pos === "ru" ? { right: 0, bottom: 0, borderRightWidth: staerke, borderBottomWidth: staerke } : {}),
    })

    return (
        <div ref={ref} aria-hidden="true" style={{ ...style, position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
            {kasten && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={steuer}
                    style={{
                        position: "absolute",
                        left: kasten.x - luft,
                        top: kasten.y - luft,
                        width: kasten.b + luft * 2,
                        height: kasten.h + luft * 2,
                        transformOrigin: "50% 50%",
                    }}
                >
                    <span style={ecke("lo")} />
                    <span style={ecke("ro")} />
                    <span style={ecke("lu")} />
                    <span style={ecke("ru")} />
                </motion.div>
            )}
        </div>
    )
}

addPropertyControls(Fokusklammer, {
    wort: { type: ControlType.String, title: "Wort", defaultValue: "System." },
    farbe: { type: ControlType.Color, title: "Farbe", defaultValue: "rgb(255, 90, 31)" },
    verzoegerung: { type: ControlType.Number, title: "Verzögerung", defaultValue: 1.5, min: 0, max: 5, step: 0.1, unit: "s" },
})
