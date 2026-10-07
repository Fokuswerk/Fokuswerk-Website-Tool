import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useAnimationControls, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties } from "react"

// Vorspann — Ladeanimation beim ersten Öffnen der Seite (liegt im Layout, erscheint nur beim
// echten Laden, nicht bei Seitenwechseln). Dunkle Fläche, das Logo zieht aus der Unschärfe scharf,
// orange Autofokus-Klammern rasten darum ein. Eine feine Linie zeigt den tatsächlichen Ladestand
// der Bilder, mindestens aber eine kurze Mindestzeit. Danach fährt die Fläche nach oben weg und
// gibt das Signal „fokuswerk:vorspann-ende“, auf das die Einblendungen im Auftakt warten.
// Beim zweiten Laden in derselben Sitzung läuft eine kurze Fassung. Notaus per CSS nach 5 s.
//
// Flüssig auf dem Handy: alle Bewegungen laufen als transform-/opacity-Animation (Motion gibt sie
// an die Grafikkarte ab), Ladebalken und Prozentzahl werden direkt am Element gesetzt statt über
// React-State — kein Neuzeichnen der Komponente alle 60 ms, während die Seite hydriert.
// Ladezeit (LCP): gewartet wird höchstens 0,3 s über die Mindestzeit hinaus, nicht mehr bis 3,8 s.

interface VorspannProps {
    logo: string
    akzent: string
    grund: string
    mindestzeit: number
    style?: CSSProperties
}

const KURVE = [0.76, 0, 0.24, 1] as const

declare global {
    interface Window {
        __vorspannEnde?: boolean
    }
}

function melden() {
    if (typeof window === "undefined") return
    window.__vorspannEnde = true
    window.dispatchEvent(new Event("fokuswerk:vorspann-ende"))
}

/**
 * Vorspann
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Vorspann(props: VorspannProps) {
    const {
        logo = "https://framerusercontent.com/images/42gH3mHn5IlpD08SdYTVCXNlUvA.png",
        akzent = "rgb(255, 90, 31)",
        grund = "rgb(53, 53, 53)",
        mindestzeit = 1.1,
        style,
    } = props
    const statisch = useIsStaticRenderer()
    const reduziert = useReducedMotion()
    const balken = useRef<HTMLDivElement>(null)
    const zahl = useRef<HTMLSpanElement>(null)
    const stand = useRef(0)
    const [weg, setWeg] = useState(false)
    const [aus, setAus] = useState(false)
    const klammer = useAnimationControls()
    const logoSteuer = useAnimationControls()
    const kurz = useRef(false)

    // Scrollen sperren, solange der Vorspann steht (wird beim Wegfahren wieder freigegeben)
    useEffect(() => {
        if (statisch || typeof document === "undefined") return
        const html = document.documentElement
        // Die graue Vorfläche aus dem Custom Code (steht ab dem ersten Bild, bevor JS läuft)
        // übergibt an den Vorspann – sonst blitzt beim Laden kurz die Seite auf.
        html.classList.add("fw-vorspann-da")
        if (!weg) {
            html.style.overflow = "hidden"
            window.scrollTo(0, 0)
        } else html.style.overflow = ""
        return () => {
            html.style.overflow = ""
        }
    }, [statisch, weg])

    useEffect(() => {
        if (statisch || typeof window === "undefined") return
        try {
            kurz.current = sessionStorage.getItem("fokuswerk-vorspann") === "1"
            sessionStorage.setItem("fokuswerk-vorspann", "1")
        } catch {
            kurz.current = false
        }
        const minimal = reduziert ? 0.3 : kurz.current ? 0.5 : mindestzeit
        const setzen = (wert: number) => {
            if (wert <= stand.current) return
            stand.current = wert
            if (balken.current) balken.current.style.transform = `scaleX(${wert.toFixed(3)})`
            if (zahl.current) zahl.current.textContent = `FOKUS ${String(Math.round(wert * 100)).padStart(3, " ")} %`
        }
        const start = performance.now()
        let fertigGeladen = document.readyState === "complete"
        const beiLoad = () => (fertigGeladen = true)
        window.addEventListener("load", beiLoad)

        // Ladestand: Anteil geladener Bilder im ersten Bildschirm + Dokumentstatus
        let aktiv = true
        const messen = () => {
            if (!aktiv) return
            const bilder = Array.from(document.images).filter((i) => {
                const r = i.getBoundingClientRect()
                return r.top < window.innerHeight * 1.5 && r.width > 0
            })
            const geladen = bilder.filter((i) => i.complete).length
            const anteilBilder = bilder.length ? geladen / bilder.length : 1
            const zeit = Math.min(1, (performance.now() - start) / (minimal * 1000))
            const ziel = Math.min(zeit, fertigGeladen ? 1 : Math.min(0.92, 0.25 + anteilBilder * 0.7))
            setzen(ziel)
            if (zeit >= 1 && (fertigGeladen || anteilBilder >= 1 || performance.now() - start > minimal * 1000 + 300)) {
                aktiv = false
                setzen(1)
                window.setTimeout(() => setWeg(true), reduziert ? 0 : 80)
                return
            }
            window.setTimeout(messen, 80)
        }
        messen()
        return () => {
            aktiv = false
            window.removeEventListener("load", beiLoad)
        }
    }, [statisch, reduziert, mindestzeit])

    // Einlauf: Logo zieht scharf, Klammern rasten ein
    useEffect(() => {
        if (statisch) return
        const lauf = async () => {
            if (reduziert) {
                logoSteuer.set({ opacity: 1, transform: "scale(1)" })
                klammer.set({ opacity: 1, transform: "scale(1)" })
                return
            }
            const d = kurz.current ? 0.3 : 0.7
            logoSteuer.start({ opacity: 1, transform: "scale(1)", transition: { duration: d, ease: [0.16, 1, 0.3, 1] } })
            // Einrasten mit leichtem Überschwingen – als Kurve statt Feder, damit es auf der GPU läuft
            await klammer.start({ opacity: 1, transform: "scale(1)", transition: { delay: d * 0.45, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] } })
            await klammer.start({ opacity: [1, 0.25, 1, 0.25, 1], transition: { duration: kurz.current ? 0.2 : 0.36 } })
        }
        lauf()
    }, [statisch, reduziert])

    // Auslauf: Klammern weiten sich, Fläche fährt nach oben weg.
    // Bewusst ohne blur und clipPath: beide zwingen den Browser zum Neuzeichnen auf dem
    // Hauptthread, und genau das ruckelte auf dem Handy, während die Seite noch lud.
    useEffect(() => {
        if (!weg) return
        klammer.start({ opacity: 0, transform: "scale(1.5)", transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } })
        logoSteuer.start({ opacity: 0, transform: "scale(0.94)", transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } })
        // Einblendungen der Seite schon starten, während die Fläche wegfährt
        const t = window.setTimeout(melden, reduziert ? 0 : 200)
        return () => window.clearTimeout(t)
    }, [weg, reduziert])

    if (statisch || aus) return null

    return (
        <motion.div
            aria-hidden="true"
            data-vorspann="an"
            initial={{ transform: "translateY(0%)" }}
            animate={weg ? { transform: "translateY(-100%)" } : { transform: "translateY(0%)" }}
            transition={{ duration: reduziert ? 0.3 : 0.75, ease: KURVE, delay: reduziert ? 0 : 0.12 }}
            onAnimationComplete={() => {
                if (weg) {
                    setAus(true)
                    melden()
                }
            }}
            style={{
                ...style,
                position: "fixed",
                inset: 0,
                zIndex: 2147483000,
                background: grund,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: weg ? "none" : "auto",
                willChange: "transform",
                animation: "fokuswerkVorspannNotaus 0.4s ease 5s forwards",
            }}
        >
            <style>{`@keyframes fokuswerkVorspannNotaus { to { opacity: 0; visibility: hidden; pointer-events: none; } }`}</style>
            {/* feines Punktraster wie im Abschluss */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "radial-gradient(circle, rgba(245,243,239,0.9) 1px, transparent 1.6px)",
                    backgroundSize: "22px 22px",
                    opacity: 0.05,
                    maskImage: "radial-gradient(ellipse 55% 55% at 50% 50%, black 0%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse 55% 55% at 50% 50%, black 0%, transparent 75%)",
                }}
            />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
                <div style={{ position: "relative", width: "min(46vw, 240px)", aspectRatio: "2465 / 960" }}>
                    {/* Logo als Maske statt <img>: sieht gleich aus (einfarbiges PNG), zählt aber nicht als
                        größtes Element der Seite — sonst misst Google die Ladezeit am Vorspann statt am Inhalt */}
                    <motion.div
                        initial={{ opacity: 0, transform: "scale(1.06)" }}
                        animate={logoSteuer}
                        style={{
                            willChange: "transform, opacity",
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgb(245, 243, 239)",
                            WebkitMaskImage: `url(${logo})`,
                            maskImage: `url(${logo})`,
                            WebkitMaskSize: "contain",
                            maskSize: "contain",
                            WebkitMaskRepeat: "no-repeat",
                            maskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                            maskPosition: "center",
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, transform: "scale(1.6)" }}
                        animate={klammer}
                        style={{ willChange: "transform, opacity", position: "absolute", left: "-14%", right: "-14%", top: "-24%", bottom: "-24%" }}
                    >
                        {(["lo", "ro", "lu", "ru"] as const).map((pos) => (
                            <span
                                key={pos}
                                style={{
                                    position: "absolute",
                                    width: 18,
                                    height: 18,
                                    borderColor: akzent,
                                    borderStyle: "solid",
                                    borderWidth: 0,
                                    ...(pos[0] === "l" ? { left: 0, borderLeftWidth: 2 } : { right: 0, borderRightWidth: 2 }),
                                    ...(pos[1] === "o" ? { top: 0, borderTopWidth: 2 } : { bottom: 0, borderBottomWidth: 2 }),
                                }}
                            />
                        ))}
                    </motion.div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 160, height: 1, background: "rgba(245,243,239,0.14)", overflow: "hidden" }}>
                        <div ref={balken} style={{ height: "100%", width: "100%", background: akzent, transformOrigin: "0% 50%", transform: "scaleX(0)", transition: "transform 0.3s ease-out", willChange: "transform" }} />
                    </div>
                    <span
                        ref={zahl}
                        style={{
                            fontFamily: "Inter, 'Inter Placeholder', system-ui, sans-serif",
                            fontSize: 10.5,
                            fontWeight: 500,
                            letterSpacing: "0.2em",
                            color: "rgba(245,243,239,0.45)",
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        {"FOKUS   0 %"}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}

addPropertyControls(Vorspann, {
    logo: { type: ControlType.String, title: "Logo-URL", defaultValue: "https://framerusercontent.com/images/42gH3mHn5IlpD08SdYTVCXNlUvA.png" },
    akzent: { type: ControlType.Color, title: "Akzent", defaultValue: "rgb(255, 90, 31)" },
    grund: { type: ControlType.Color, title: "Grund", defaultValue: "rgb(53, 53, 53)" },
    mindestzeit: { type: ControlType.Number, title: "Mindestzeit", defaultValue: 1.1, min: 0.3, max: 4, step: 0.1, unit: "s" },
})
