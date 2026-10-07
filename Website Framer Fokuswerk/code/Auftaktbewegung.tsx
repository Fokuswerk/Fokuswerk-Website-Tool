import type { ComponentType } from "react"
import { useEffect, useRef, useState } from "react"
import { animate, useMotionValue, useScroll, useTransform, useSpring, useReducedMotion, type MotionValue } from "framer-motion"

// Auftaktbewegung — Einblenden und scrollgebundene Tiefe im Auftakt (Overrides).
// Beim Laden steigen Kennerzeile, die zwei Zeilen der Überschrift, Untertitel und Knöpfe
// gestaffelt aus der Unschärfe. Beim Runterscrollen zieht sich der ganze Auftakt wie eine Karte
// nach hinten zurück (kleiner, runde Ecken), das Foto zoomt gegenläufig hinein und wird dunkler,
// die Zeilen driften mit unterschiedlichem Tempo auseinander und lösen sich unscharf auf.
// Der Kundenbereich schiebt sich als Blatt darüber (liegt im Layout, nicht hier).
// Fortschritt p = 0 oben, 1 nach einer Fensterhöhe Scrollweg.

// Auf dem Handy wird aus dem Schärfezug ein Einblenden über die Deckkraft: ein scrollgebundener
// blur() zwingt den Browser bei jedem Bild zum Neuzeichnen mehrerer Textzeilen — genau das
// ruckelte beim ersten Wischen. x, y und opacity laufen dagegen auf der GPU.
function useSchmal(): boolean {
    // Bewusst mit false starten: der Startwert muss auf Server und Client gleich sein,
    // sonst gibt es einen Hydration-Mismatch. Der Effekt korrigiert gleich nach dem Mount.
    const [schmal, setSchmal] = useState(false)
    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return
        const mq = window.matchMedia("(max-width: 809px)")
        const an = () => setSchmal(mq.matches)
        an()
        mq.addEventListener?.("change", an)
        return () => mq.removeEventListener?.("change", an)
    }, [])
    return schmal
}

function useFortschritt(): MotionValue<number> {
    const { scrollY } = useScroll()
    const [hoehe, setHoehe] = useState(900)
    useEffect(() => {
        const messen = () => setHoehe(window.innerHeight || 900)
        messen()
        window.addEventListener("resize", messen)
        return () => window.removeEventListener("resize", messen)
    }, [])
    const roh = useTransform(scrollY, (y: number) => Math.max(0, Math.min(1, y / hoehe)))
    // leicht gefedert, damit es beim Wischen auf dem Handy nicht ruckt
    return useSpring(roh, { stiffness: 520, damping: 60, mass: 0.3 })
}


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

// Einblenden beim Laden: 0 → 1 nach Verzögerung (erst wenn die Ladeanimation weg ist).
// Server und erstes Rendern starten bei 1 (fertiger Zustand): Ist das Gerät langsam und der
// Vorspann (reines HTML/CSS) schon weg, bevor Framer hochgefahren ist, steht der Text einfach da –
// kein unscharfer Zwischenstand, kein später Einblender. Läuft der Vorspann noch, wird unter ihm
// auf 0 gesetzt und danach eingeblendet. Bei Seitenwechseln innerhalb der Seite läuft es wie gehabt.
let hydriert = false
function useEinblenden(verzoegerung: number): MotionValue<number> {
    const beiHydration = useRef(!hydriert)
    const e = useMotionValue(beiHydration.current ? 1 : 0)
    useEffect(() => {
        hydriert = true
        let a: { stop: () => void } | null = null
        const laeuft = !!document.querySelector('[data-vorspann="an"]') && !window.__vorspannEnde
        if (beiHydration.current && !laeuft) return // Vorspann schon vorbei: fertig stehen lassen
        e.set(0)
        const ab = nachVorspann(() => {
            a = animate(e, 1, { duration: 1.5, delay: verzoegerung, ease: [0.16, 1, 0.3, 1] })
        })
        return () => {
            ab()
            a?.stop()
        }
    }, [])
    return e
}

interface Zeile {
    verzoegerung: number // Einblenden
    hoch: number // px nach oben bei p = 1
    seit: number // px seitlich bei p = 1
    weg: [number, number] // p-Bereich, in dem ausgeblendet wird
    unschaerfe: number // px bei vollständigem Ausblenden
}

function zeilenOverride(z: Zeile) {
    return (Component: ComponentType<any>): ComponentType<any> =>
        (props: any) => {
            const p = useFortschritt()
            const e = useEinblenden(z.verzoegerung)
            const reduziert = useReducedMotion()
            const schmal = useSchmal()
            const y = useTransform([p, e] as any, ([pv, ev]: number[]) => pv * -z.hoch + (1 - ev) * 34)
            const x = useTransform(p, (pv: number) => pv * z.seit)
            const opacity = useTransform([p, e] as any, ([pv, ev]: number[]) => {
                const t = Math.max(0, Math.min(1, (pv - z.weg[0]) / (z.weg[1] - z.weg[0])))
                // Auf breiten Flächen übernimmt die Unschärfe das Einblenden und die Deckkraft
                // bleibt 1, damit der Text sofort als gezeichnet zählt (LCP). Auf dem Handy gibt
                // es keine Unschärfe, dort blendet die Deckkraft ein — aber ab 8 %, nicht ab 0:
                // Text mit Deckkraft 0 gilt als nicht gezeichnet (LCP). Unter dem Vorspann sieht man es nicht.
                return schmal ? (0.08 + 0.92 * ev) * (1 - t) : 1 - t
            })
            const filter = useTransform([p, e] as any, ([pv, ev]: number[]) => {
                const t = Math.max(0, Math.min(1, (pv - z.weg[0]) / (z.weg[1] - z.weg[0])))
                // Einblenden wie ein Schärfezug: aus starker Unschärfe in den Fokus
                const b = t * z.unschaerfe + (1 - ev) * 20
                return `blur(${b.toFixed(2)}px)`
            })
            if (reduziert) return <Component {...props} />
            return <Component {...props} style={{ ...props.style, x, y, opacity, filter: schmal ? "none" : filter }} />
        }
}

export function withAuftaktKenner(Component: ComponentType<any>): ComponentType<any> {
    return zeilenOverride({ verzoegerung: 0.15, hoch: 90, seit: 0, weg: [0, 0.22], unschaerfe: 0 })(Component)
}
export function withAuftaktZeile1(Component: ComponentType<any>): ComponentType<any> {
    return zeilenOverride({ verzoegerung: 0.26, hoch: 140, seit: 0, weg: [0.04, 0.34], unschaerfe: 4 })(Component)
}
export function withAuftaktZeile2(Component: ComponentType<any>): ComponentType<any> {
    return zeilenOverride({ verzoegerung: 0.38, hoch: 100, seit: 0, weg: [0.08, 0.38], unschaerfe: 4 })(Component)
}
export function withAuftaktUntertitel(Component: ComponentType<any>): ComponentType<any> {
    return zeilenOverride({ verzoegerung: 0.5, hoch: 60, seit: 0, weg: [0, 0.2], unschaerfe: 0 })(Component)
}
export function withAuftaktKnoepfe(Component: ComponentType<any>): ComponentType<any> {
    return zeilenOverride({ verzoegerung: 0.62, hoch: 50, seit: 0, weg: [0, 0.18], unschaerfe: 0 })(Component)
}

// Der ganze Auftakt (sticky): tritt zurück wie eine Karte
export function withAuftaktFlaeche(Component: ComponentType<any>): ComponentType<any> {
    return (props: any) => {
        const p = useFortschritt()
        const reduziert = useReducedMotion()
        const scale = useTransform(p, [0, 1], [1, 0.92])
        const borderRadius = useTransform(p, [0, 0.6], [0, 28])
        // 100svh statt 100vh: auf dem iPhone rechnet 100vh mit eingeklappter Adressleiste, dann
        // verschwindet der untere Rand des Auftakts (die drei Ergebnisse) hinter Safaris Leiste
        const hoehe = { minHeight: "100svh" }
        if (reduziert) return <Component {...props} style={{ ...props.style, ...hoehe }} />
        return <Component {...props} style={{ ...props.style, ...hoehe, scale, borderRadius, transformOrigin: "50% 38%" }} />
    }
}

// Foto: zoomt gegenläufig hinein und wird dunkler
export function withAuftaktBild(Component: ComponentType<any>): ComponentType<any> {
    return (props: any) => {
        const p = useFortschritt()
        const reduziert = useReducedMotion()
        const scale = useTransform(p, [0, 1], [1.04, 1.14])
        const y = useTransform(p, [0, 1], [0, 40])
        const filter = useTransform(p, (v: number) => `brightness(${(1 - v * 0.4).toFixed(3)})`)
        if (reduziert) return <Component {...props} />
        return <Component {...props} style={{ ...props.style, scale, y, filter }} />
    }
}

// Netz: weicht mit dem Foto zurück
export function withAuftaktNetz(Component: ComponentType<any>): ComponentType<any> {
    return (props: any) => {
        const p = useFortschritt()
        const opacity = useTransform(p, [0, 0.35], [1, 0])
        return <Component {...props} style={{ ...props.style, opacity }} />
    }
}

// Fokus-Klammern: gehen als Erstes, damit nie scharfe Klammern über unscharfem Text stehen
export function withAuftaktKlammer(Component: ComponentType<any>): ComponentType<any> {
    return (props: any) => {
        const p = useFortschritt()
        const opacity = useTransform(p, [0.01, 0.12], [1, 0])
        return <Component {...props} style={{ ...props.style, opacity }} />
    }
}
