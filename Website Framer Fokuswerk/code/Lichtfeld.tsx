import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion"
import { useEffect, useRef, type CSSProperties } from "react"

// Lichtfeld — Hintergrund für dunkle Abschlussflächen. Ein Punktraster, das nur dort aufleuchtet,
// wo ein warmer Lichtkegel liegt. Der Kegel folgt dem Zeiger (gefedert) über die ganze Fläche des
// Elternelements, auch wenn Text und Knöpfe darüber liegen. Ohne Zeiger (Handy, Tastatur) wandert
// er langsam von selbst. Dazu ein zweiter, großer Schein, der gegenläufig driftet.

interface LichtfeldProps {
    farbe: string
    raster: number
    punkt: number
    radius: number
    staerke: number
    style?: CSSProperties
}

/**
 * Lichtfeld
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 600
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Lichtfeld(props: LichtfeldProps) {
    const { farbe = "rgb(255, 90, 31)", raster = 22, punkt = 1.2, radius = 380, staerke = 0.55, style } = props
    const statisch = useIsStaticRenderer()
    const reduziert = useReducedMotion()
    const ref = useRef<HTMLDivElement>(null)
    const mx = useMotionValue(0.72)
    const my = useMotionValue(0.4)
    const x = useSpring(mx, { stiffness: 70, damping: 20, mass: 0.8 })
    const y = useSpring(my, { stiffness: 70, damping: 20, mass: 0.8 })

    useEffect(() => {
        if (statisch || typeof window === "undefined") return
        const el = ref.current
        const flaeche = (el?.parentElement as HTMLElement | null) ?? el
        if (!el || !flaeche) return
        let zuletzt = 0
        let raf = 0
        let t0 = performance.now()
        const bewegung = (e: PointerEvent) => {
            const r = flaeche.getBoundingClientRect()
            if (e.clientY < r.top - 80 || e.clientY > r.bottom + 80) return
            zuletzt = performance.now()
            mx.set((e.clientX - r.left) / Math.max(1, r.width))
            my.set((e.clientY - r.top) / Math.max(1, r.height))
        }
        // Eigenbewegung, solange kein Zeiger da war (oder seit 2,5 s keiner)
        const lauf = (t: number) => {
            raf = requestAnimationFrame(lauf)
            if (reduziert || t - zuletzt < 2500) return
            const s = (t - t0) / 1000
            mx.set(0.5 + Math.sin(s * 0.35) * 0.32)
            my.set(0.5 + Math.sin(s * 0.53 + 1.3) * 0.28)
        }
        window.addEventListener("pointermove", bewegung, { passive: true })
        raf = requestAnimationFrame(lauf)
        return () => {
            window.removeEventListener("pointermove", bewegung)
            cancelAnimationFrame(raf)
        }
    }, [statisch, reduziert])

    const px = useTransform(x, (v: number) => `${(v * 100).toFixed(2)}%`)
    const py = useTransform(y, (v: number) => `${(v * 100).toFixed(2)}%`)
    const maske = useTransform([px, py] as any, ([a, b]: string[]) => `radial-gradient(${radius}px circle at ${a} ${b}, black 0%, rgba(0,0,0,0.35) 45%, transparent 75%)`)
    const kegel = useTransform([px, py] as any, ([a, b]: string[]) => `radial-gradient(${Math.round(radius * 1.3)}px circle at ${a} ${b}, ${mitAlpha(farbe, 0.22 * staerke)} 0%, ${mitAlpha(farbe, 0.06 * staerke)} 40%, transparent 70%)`)
    const gegen = useTransform([x, y] as any, ([a, b]: number[]) => `radial-gradient(900px circle at ${((1 - a) * 100).toFixed(1)}% ${(100 - b * 40).toFixed(1)}%, ${mitAlpha(farbe, 0.1 * staerke)} 0%, transparent 60%)`)

    const punkte = `radial-gradient(circle, rgba(245,243,239,0.9) ${punkt}px, transparent ${punkt + 0.6}px)`

    return (
        <div ref={ref} aria-hidden="true" style={{ ...style, position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            <motion.div style={{ position: "absolute", inset: 0, background: gegen }} />
            <motion.div style={{ position: "absolute", inset: 0, background: kegel }} />
            {/* Grundraster, sehr leise */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: punkte, backgroundSize: `${raster}px ${raster}px`, opacity: 0.06 }} />
            {/* beleuchtetes Raster */}
            <motion.div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: punkte,
                    backgroundSize: `${raster}px ${raster}px`,
                    opacity: 0.55 * staerke + 0.1,
                    maskImage: maske,
                    WebkitMaskImage: maske,
                }}
            />
        </div>
    )
}

function mitAlpha(farbe: string, a: number) {
    const m = farbe.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/)
    if (!m) return farbe
    return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${Math.max(0, Math.min(1, a)).toFixed(3)})`
}

addPropertyControls(Lichtfeld, {
    farbe: { type: ControlType.Color, title: "Farbe", defaultValue: "rgb(255, 90, 31)" },
    raster: { type: ControlType.Number, title: "Raster", defaultValue: 22, min: 8, max: 60, step: 1, unit: "px" },
    punkt: { type: ControlType.Number, title: "Punkt", defaultValue: 1.2, min: 0.5, max: 4, step: 0.1, unit: "px" },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 380, min: 100, max: 900, step: 10, unit: "px" },
    staerke: { type: ControlType.Number, title: "Stärke", defaultValue: 0.55, min: 0, max: 1, step: 0.05 },
})
