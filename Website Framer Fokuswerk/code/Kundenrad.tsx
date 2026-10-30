import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useMotionValue, useTransform, animate, useReducedMotion, type MotionValue } from "framer-motion"
import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react"

// Kundenrad — die Kundenlogos auf einem 3D-Ring (Prinzip des Spector-Karussells).
// Die Logos werden so oft wiederholt, bis der Ring dicht besetzt ist; der Radius ergibt sich
// aus Kartenbreite + Abstand, die vordere Karte steht in Originalgröße.
// Dreht sich langsam von selbst, lässt sich greifen und drehen, Trackpad seitlich dreht mit,
// Scrollen der Seite gibt dem Rad einen kleinen Schubs. Hinten liegende Logos werden unscharf
// und blass. Überfahren hält das Rad nicht an (das wirkte beim Scrollen wie ein Hänger).

interface Bild {
    src?: string
    srcSet?: string
    alt?: string
}

interface Logo {
    bild?: Bild
    name?: string
}

interface KundenradProps {
    logos: Logo[]
    radius: number
    abstand: number
    perspektive: number
    unschaerfe: number
    kartenBreite: number
    kartenHoehe: number
    tempo: number
    richtung: "links" | "rechts"
    scrollSchub: number
    graustufen: boolean
    flaeche: string
    hinweis: boolean
    hinweisFarbe: string
    style?: CSSProperties
}

const STANDARD: Logo[] = [
    { name: "WAV Westerstede", bild: { src: "https://framerusercontent.com/images/ovYXtpdpa5coqVaUBagVbnyeWG8.png", alt: "WAV Westerstede" } },
    { name: "Zwillis Padel", bild: { src: "https://framerusercontent.com/images/un5qWoV4NXGEowgSuUw3npjfSw.png?scale-down-to=1024", alt: "Zwillis Padel" } },
    { name: "Between the Sheets", bild: { src: "https://framerusercontent.com/images/T82jIhno8JIhUbjsFmJrpnvDns.png?scale-down-to=1024", alt: "Between the Sheets" } },
    { name: "WinHadi", bild: { src: "https://framerusercontent.com/images/lpvKNedYoddiG0Hgipp3ZIcaNhc.png?scale-down-to=1024", alt: "WinHadi" } },
    { name: "oh ton", bild: { src: "https://framerusercontent.com/images/EXbRgAhznVjB26ayY7mqIeoArY.png", alt: "oh ton" } },
    { name: "Praxis für Zahnheilkunde", bild: { src: "https://framerusercontent.com/images/yOJ7kT1oBU9msfgNVFVZnpQ86Vw.png", alt: "Praxis für Zahnheilkunde Bad Zwischenahn" } },
    { name: "Optik am Haarenufer", bild: { src: "https://framerusercontent.com/images/HkiJfOlOLDgzeGlw4sDYGSZBY.png", alt: "Optik am Haarenufer" } },
    { name: "Thieme Augenoptik", bild: { src: "https://framerusercontent.com/images/WfCSCZPXfaAXp2VPZE0PBufC8yQ.png", alt: "Thieme Augenoptik und Hörakustik" } },
    { name: "Jan Wandscher", bild: { src: "https://framerusercontent.com/images/sl4zvA1YqIxvdAmMeCyFDq85iUA.png", alt: "Steinmetz Jan Wandscher" } },
    { name: "Patio", bild: { src: "https://framerusercontent.com/images/b5FitHUfK0WXOC82nswyopSXAE4.png?scale-down-to=1024", alt: "Patio" } },
    { name: "Vapiano", bild: { src: "https://framerusercontent.com/images/z2d8x39K5Hik4HhDviq1nzXxblw.svg", alt: "Vapiano" } },
    { name: "Eule Oldenburg", bild: { src: "https://framerusercontent.com/images/hwiHxUn4sk0sKntMVFfGOBrFXyM.png?scale-down-to=1024", alt: "Eule Oldenburg" } },
    { name: "Al Pappagallo", bild: { src: "https://framerusercontent.com/images/ARTw4kJp7Srb7GQRCqUUlt5m8.png?scale-down-to=1024", alt: "Ristorante Al Pappagallo" } },
    { name: "Aschenbeck & Aschenbeck", bild: { src: "https://framerusercontent.com/images/xiEi5GbJLK1IefRbTXjpOhJddBA.png", alt: "Aschenbeck & Aschenbeck Projektentwicklung" } },
    { name: "Universität Oldenburg", bild: { src: "https://framerusercontent.com/images/ocpMb1uBS9G1MX8JFLQQ4EeyAqg.svg", alt: "Carl von Ossietzky Universität Oldenburg" } },
    { name: "Hotel Alte Werft", bild: { src: "https://framerusercontent.com/images/4LLFl4HNCVq8Sy51vAuMn8jlpRg.png", alt: "Hotel Alte Werft" } },
]

const HAND =
    "M21.8636 2.36424C21.174 2.36324 20.4953 2.53598 19.89 2.86651C19.6713 2.18908 19.2815 1.57954 18.7582 1.09688C18.235 0.614216 17.596 0.274761 16.9032 0.0857452C16.2103 -0.052057 15.487 -0.0338894 14.8032 0.164098C14.1195 0.362085 13.4984 0.733191 13 1.24151C12.4249 0.654556 11.688 0.252193 10.8833 0.0857452C10.0786 -0.0807031 9.24254 -0.00369412 8.48178 0.306951C7.72102 0.617595 7.07002 1.1478 6.61182 1.82993C6.15361 2.51207 5.90897 3.31523 5.90909 4.13697V7.09151H4.13636C3.03933 7.09151 1.98723 7.52731 1.21151 8.30303C0.435794 9.07875 0 10.1308 0 11.2279V13.0006C0 16.4484 1.36964 19.755 3.80761 22.193C6.24559 24.631 9.55219 26.0006 13 26.0006C16.4478 26.0006 19.7544 24.631 22.1924 22.193C24.6304 19.755 26 16.4484 26 13.0006V6.50061C26 5.40357 25.5642 4.35147 24.7885 3.57575C24.0128 2.80004 22.9607 2.36424 21.8636 2.36424ZM23.6364 13.0006C23.6364 15.8215 22.5158 18.5269 20.521 20.5217C18.5263 22.5164 15.8209 23.637 13 23.637C10.1791 23.637 7.47366 22.5164 5.47896 20.5217C3.48425 18.5269 2.36364 15.8215 2.36364 13.0006V11.2279C2.36364 10.7577 2.55041 10.3068 2.88286 9.97437C3.21531 9.64192 3.66621 9.45515 4.13636 9.45515H5.90909V13.0006C5.90909 13.314 6.0336 13.6146 6.25524 13.8363C6.47687 14.0579 6.77747 14.1824 7.09091 14.1824C7.40435 14.1824 7.70495 14.0579 7.92658 13.8363C8.14821 13.6146 8.27273 13.314 8.27273 13.0006V4.13697C8.27273 3.66681 8.4595 3.21591 8.79195 2.88346C9.1244 2.55101 9.5753 2.36424 10.0455 2.36424C10.5156 2.36424 10.9665 2.55101 11.299 2.88346C11.6314 3.21591 11.7273 3.66681 11.7273 4.13697V8.27333C11.7273 8.58677 11.8518 8.88737 12.0734 9.109C12.2951 9.33064 12.6466 9.45515 13 9.45515C13.3134 9.45515 13.614 9.33064 13.8357 9.109C14.0573 8.88737 14.1818 8.58677 14.1818 8.27333V4.13697C14.1818 3.66681 14.3686 3.21591 14.701 2.88346C15.0335 2.55101 15.4844 2.36424 15.9545 2.36424C16.4247 2.36424 16.8756 2.55101 17.2081 2.88346C17.5405 3.21591 17.7273 3.66681 17.7273 4.13697V8.27333C17.7273 8.58677 17.8518 8.88737 18.0734 9.109C18.2951 9.33064 18.5957 9.45515 18.9091 9.45515C19.2225 9.45515 19.5231 9.33064 19.7448 9.109C19.9664 8.88737 20.0909 8.58677 20.0909 8.27333V6.50061C20.0909 6.03045 20.2777 5.57955 20.6101 5.2471C20.9426 4.91465 21.3935 4.72788 21.8636 4.72788C22.3338 4.72788 22.7847 4.91465 23.1171 5.2471C23.4496 5.57955 23.6364 6.03045 23.6364 6.50061V13.0006Z"
const PFEIL_L =
    "M6.65723 0.292744C7.04778 -0.097482 7.68087 -0.0976804 8.07129 0.292744C8.46172 0.683169 8.46152 1.31626 8.07129 1.70681L3.41407 6.36403H29C29.5523 6.36403 30 6.81175 30 7.36403C30 7.91632 29.5523 8.36403 29 8.36403H3.41407L8.07129 13.0213C8.46152 13.4118 8.46172 14.0449 8.07129 14.4353C7.68087 14.8257 7.04778 14.8256 6.65723 14.4353L0.292969 8.07106C-0.0975651 7.68054 -0.0975651 7.04753 0.292969 6.657L6.65723 0.292744Z"
const PFEIL_R =
    "M23.3428 0.292744C22.9522 -0.097482 22.3191 -0.0976804 21.9287 0.292744C21.5383 0.683169 21.5385 1.31626 21.9287 1.70681L26.5859 6.36403H1C0.447716 6.36403 0 6.81175 0 7.36403C0 7.91632 0.447716 8.36403 1 8.36403H26.5859L21.9287 13.0213C21.5385 13.4118 21.5383 14.0449 21.9287 14.4353C22.3191 14.8257 22.9522 14.8256 23.3428 14.4353L29.707 8.07106C30.0976 7.68054 30.0976 7.04753 29.707 6.657L23.3428 0.292744Z"

// Logos werden höchstens ~380 px breit gezeigt, die Originale sind 2500 × 1000 px (bis 67 KB je Logo).
// Framer liefert per scale-down-to eine verkleinerte Fassung (~5 KB). Ohne srcSet, sonst wählt der
// Browser mangels sizes-Angabe wieder das Original. Bewusst ohne loading="lazy" (3D-Ring, iOS lädt sonst nie).
function klein(src?: string): string | undefined {
    if (!src || !src.includes("framerusercontent.com/images/")) return src
    const basis = src.split("?")[0]
    return `${basis}?scale-down-to=512`
}

function Karte(props: {
    index: number
    winkel: number
    drehung: MotionValue<number>
    radius: number
    breite: number
    hoehe: number
    unschaerfe: number
    graustufen: boolean
    flaeche: string
    logo: Logo
}) {
    const { winkel, drehung, radius, breite, hoehe, unschaerfe, graustufen, flaeche, logo } = props
    const cosVon = (h: number) => Math.cos(((h + winkel) * Math.PI) / 180)
    // Vorne scharf und farbig, zur Seite hin weich, unscharf und grau; abgewandte Karten sind weg.
    const filter = useTransform(drehung, (h: number) => {
        const c = cosVon(h)
        const b = Math.max(0, 1 - c) * unschaerfe * 0.6
        const g = graustufen ? Math.min(1, Math.max(0, (0.97 - c) * 5)) : 0
        return `grayscale(${g.toFixed(2)}) blur(${b.toFixed(2)}px)`
    })
    const opacity = useTransform(drehung, (h: number) => {
        const c = cosVon(h)
        const x = Math.max(0, Math.min(1, (c + 0.05) / 0.6))
        return x * x * (3 - 2 * x)
    })
    const pad = Math.round(Math.min(breite, hoehe) * 0.2)
    return (
        <motion.div
            role="group"
            aria-label={logo.name || logo.bild?.alt || "Kunde"}
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: breite,
                height: hoehe,
                transform: `translate(-50%, -50%) rotateY(${winkel}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                opacity,
                filter,
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: Math.round(hoehe * 0.14),
                    background: flaeche,
                    boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(14,15,18,0.05), 0 30px 60px -34px rgba(14,15,18,0.35), 0 10px 22px -16px rgba(14,15,18,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: `${pad}px ${Math.round(pad * 1.3)}px`,
                    boxSizing: "border-box",
                }}
            >
                <img
                    src={klein(logo.bild?.src)}
                    alt={logo.bild?.alt || logo.name || ""}
                    draggable={false}
                    decoding="async"
                    fetchPriority="low"
                    style={{ width: "100%", height: "100%", objectFit: "contain", userSelect: "none", pointerEvents: "none" }}
                />
            </div>
        </motion.div>
    )
}

/**
 * Kundenrad
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 420
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Kundenrad(props: KundenradProps) {
    const {
        logos,
        radius = 560,
        abstand = 32,
        perspektive = 1800,
        unschaerfe = 6,
        kartenBreite = 280,
        kartenHoehe = 150,
        tempo = 1.5,
        richtung = "links",
        scrollSchub = 0.12,
        graustufen = true,
        flaeche = "rgba(255, 255, 255, 0.82)",
        hinweis = true,
        hinweisFarbe = "rgba(14, 15, 18, 0.35)",
        style,
    } = props

    // Eigene Logos nur, wenn im Feld tatsächlich Bilder gesetzt sind — sonst die feste Liste
    const eigene = (logos || []).filter((l) => l?.bild?.src)
    const liste: Logo[] = eigene.length > 0 ? eigene : STANDARD
    // Ring dicht besetzen: mindestens 14 Plätze, immer ein Vielfaches der Logoanzahl
    const wiederholung = Math.max(1, Math.ceil(14 / Math.max(1, liste.length)))
    const plaetze: Logo[] = Array.from({ length: liste.length * wiederholung }, (_, i) => liste[i % liste.length])
    const anzahl = Math.max(3, plaetze.length)
    const schritt = 360 / anzahl
    const istStatisch = useIsStaticRenderer()
    const reduziert = useReducedMotion() ?? false

    const huelleRef = useRef<HTMLDivElement>(null)
    const drehung = useMotionValue(0)
    const [breite, setBreite] = useState(1200)
    const [greift, setGreift] = useState(false)
    const [benutzt, setBenutzt] = useState(false)
    const [aktiv, setAktiv] = useState(0)

    const zustand = useRef({
        modus: "auto" as "auto" | "halt" | "zug" | "rast",
        schub: 0,
        zugX: 0,
        proben: [] as { t: number; h: number }[],
        letzterScroll: 0,
    })
    const rastAnim = useRef<{ stop: () => void } | null>(null)
    const radTimer = useRef<number | null>(null)

    // Größen je nach verfügbarer Breite
    const massstab = breite < 810 ? 0.6 : breite < 1100 ? 0.84 : 1
    const kb = kartenBreite * massstab
    const kh = kartenHoehe * massstab
    const luecke = abstand * (breite < 810 ? 0.6 : 1)
    const r = Math.round((anzahl * (kb + luecke)) / (2 * Math.PI)) || radius
    const persp = breite < 810 ? 1000 : breite < 1100 ? 1500 : perspektive
    const blur = breite < 810 ? Math.min(3.5, unschaerfe) : unschaerfe
    // Grad pro Pixel, bei dem die vordere Karte genau unter dem Finger mitläuft
    const gradProPixel = 180 / (Math.PI * r)

    useEffect(() => {
        const el = huelleRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => setBreite(el.clientWidth || 1200))
        ro.observe(el)
        setBreite(el.clientWidth || 1200)
        return () => ro.disconnect()
    }, [])

    useEffect(() => drehung.on("change", (h: number) => {
        const i = ((((Math.round(-h / schritt) % anzahl) + anzahl) % anzahl) % liste.length)
        setAktiv((alt) => (alt === i ? alt : i))
    }), [drehung, schritt, anzahl])

    const rasten = useCallback((ziel: number, tempo = 0, weich = false) => {
        rastAnim.current?.stop()
        zustand.current.modus = "rast"
        if (reduziert) {
            drehung.set(ziel)
            zustand.current.modus = "halt"
            return
        }
        rastAnim.current = animate(drehung, ziel, {
            type: "spring",
            velocity: tempo,
            stiffness: weich ? 60 : 80,
            damping: weich ? 18 : 17,
            mass: 1,
            restDelta: 0.01,
            onComplete: () => {
                if (zustand.current.modus !== "rast") return
                zustand.current.modus = "halt"
                // nach kurzer Pause dreht es von selbst weiter
                window.setTimeout(() => {
                    if (zustand.current.modus === "halt") zustand.current.modus = "auto"
                }, 2200)
            },
        })
    }, [drehung, reduziert])

    // Endlosschleife: Eigendrehung + Scrollschub
    useEffect(() => {
        if (istStatisch || typeof window === "undefined") return
        let raf = 0
        let zuletzt = performance.now()
        let sichtbar = true
        const grund = ((String(richtung).toLowerCase() === "rechts" ? -1 : 1) * 360 * tempo) / 60000
        const el = huelleRef.current
        const io = el
            ? new IntersectionObserver((e) => { sichtbar = e.some((x) => x.isIntersecting) }, { threshold: 0 })
            : null
        if (el && io) io.observe(el)
        zustand.current.letzterScroll = window.scrollY
        const beiScroll = () => {
            const y = window.scrollY
            const dy = y - zustand.current.letzterScroll
            zustand.current.letzterScroll = y
            if (zustand.current.modus === "auto" && sichtbar && !reduziert) {
                // gedeckelt: schnelles Wischen soll das Rad nicht durchdrehen lassen
                const neu = zustand.current.schub + dy * scrollSchub
                zustand.current.schub = Math.max(-10, Math.min(10, neu))
            }
        }
        window.addEventListener("scroll", beiScroll, { passive: true })
        const lauf = (jetzt: number) => {
            raf = requestAnimationFrame(lauf)
            const dt = Math.min(64, jetzt - zuletzt)
            zuletzt = jetzt
            if (!sichtbar) return
            const z = zustand.current
            if (z.modus === "auto") {
                let d = reduziert ? 0 : grund * dt
                if (Math.abs(z.schub) > 0.01) {
                    const teil = z.schub * (1 - Math.pow(0.95, dt / 16.667))
                    z.schub -= teil
                    d += teil
                } else z.schub = 0
                if (d !== 0) drehung.set(drehung.get() + d)
            }
        }
        raf = requestAnimationFrame(lauf)
        return () => {
            cancelAnimationFrame(raf)
            io?.disconnect()
            window.removeEventListener("scroll", beiScroll)
        }
    }, [istStatisch, richtung, tempo, scrollSchub, reduziert, drehung])

    // Greifen und Ziehen: die vordere Karte läuft 1:1 unter dem Finger, beim Loslassen
    // nimmt das Rad den Schwung mit und federt auf die nächste Karte.
    useEffect(() => {
        if (!greift) return
        const beiBewegung = (e: PointerEvent) => {
            const z = zustand.current
            const jetzt = performance.now()
            const dx = e.clientX - z.zugX
            z.zugX = e.clientX
            const h = drehung.get() + dx * gradProPixel
            drehung.set(h)
            z.proben.push({ t: jetzt, h })
            while (z.proben.length > 2 && jetzt - z.proben[0].t > 100) z.proben.shift()
        }
        const beiEnde = () => {
            setGreift(false)
            const z = zustand.current
            const jetzt = performance.now()
            let tempo = 0
            const erste = z.proben[0]
            const letzte = z.proben[z.proben.length - 1]
            if (erste && letzte && letzte.t > erste.t && jetzt - letzte.t < 80) {
                tempo = ((letzte.h - erste.h) / (letzte.t - erste.t)) * 1000
            }
            tempo = Math.max(-720, Math.min(720, tempo))
            const ziel = Math.round((drehung.get() + tempo * 0.32) / schritt) * schritt
            rasten(ziel, tempo)
            window.setTimeout(() => {
                if (zustand.current.modus !== "zug") zustand.current.modus = "auto"
            }, 1600)
        }
        window.addEventListener("pointermove", beiBewegung, { passive: true })
        window.addEventListener("pointerup", beiEnde)
        window.addEventListener("pointercancel", beiEnde)
        return () => {
            window.removeEventListener("pointermove", beiBewegung)
            window.removeEventListener("pointerup", beiEnde)
            window.removeEventListener("pointercancel", beiEnde)
        }
    }, [greift, drehung, schritt, rasten, gradProPixel])

    const beiDruck = (e: React.PointerEvent) => {
        if (istStatisch) return
        if (e.pointerType === "mouse" && e.button !== 0) return
        rastAnim.current?.stop()
        const z = zustand.current
        z.modus = "zug"
        z.zugX = e.clientX
        z.proben = [{ t: performance.now(), h: drehung.get() }]
        setGreift(true)
        setBenutzt(true)
    }


    const beiRad = (e: React.WheelEvent) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 1) return
        rastAnim.current?.stop()
        zustand.current.modus = "halt"
        drehung.set(drehung.get() - e.deltaX * gradProPixel)
        setBenutzt(true)
        if (radTimer.current !== null) window.clearTimeout(radTimer.current)
        radTimer.current = window.setTimeout(() => {
            radTimer.current = null
            rasten(Math.round(drehung.get() / schritt) * schritt, 0, true)
        }, 160)
    }

    const beiTaste = (e: React.KeyboardEvent) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
        e.preventDefault()
        setBenutzt(true)
        const basis = Math.round(drehung.get() / schritt) * schritt
        rasten(basis + (e.key === "ArrowLeft" ? schritt : -schritt), 0, true)
    }

    return (
        <div
            ref={huelleRef}
            role="region"
            aria-roledescription="Karussell"
            aria-label="Ausgewählte Kunden"
            tabIndex={0}
            onPointerDown={beiDruck}
            onWheel={beiRad}
            onKeyDown={beiTaste}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                perspective: `${persp}px`,
                overflow: "visible",
                cursor: greift ? "grabbing" : "grab",
                touchAction: "pan-y",
                userSelect: "none",
                WebkitUserSelect: "none",
                outline: "none",
            }}
        >
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }} aria-live="polite">
                {`${liste[aktiv % liste.length]?.name ?? ""} — ${(aktiv % liste.length) + 1} von ${liste.length}. Pfeiltasten drehen das Rad.`}
            </span>
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "46%",
                    width: 1,
                    height: 1,
                    transformStyle: "preserve-3d",
                    transform: `translateZ(${-r}px)`,
                }}
                aria-hidden="true"
            >
            <motion.div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: 1,
                    height: 1,
                    transformStyle: "preserve-3d",
                    rotateY: drehung,
                }}
            >
                {plaetze.map((logo, i) => (
                    <Karte
                        key={i}
                        index={i}
                        winkel={i * schritt}
                        drehung={drehung}
                        radius={r}
                        breite={kb}
                        hoehe={kh}
                        unschaerfe={blur}
                        graustufen={graustufen}
                        flaeche={flaeche}
                        logo={logo}
                    />
                ))}
            </motion.div>
            </div>
            {hinweis && (
                <motion.div
                    aria-hidden="true"
                    initial={false}
                    animate={{ opacity: benutzt ? 0 : 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: "absolute",
                        left: "50%",
                        bottom: breite < 810 ? 8 : 20,
                        transform: "translateX(-50%)",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        pointerEvents: "none",
                    }}
                >
                    <motion.svg width={26} height={13} viewBox="0 0 30 15" fill="none" style={{ transformOrigin: "right center" }} animate={reduziert || istStatisch ? {} : { scale: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                        <path d={PFEIL_L} fill={hinweisFarbe} />
                    </motion.svg>
                    <motion.div style={{ display: "flex" }} animate={reduziert || istStatisch ? {} : { x: [-6, 6, -6], rotate: [-8, 8, -8] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                        <svg width={22} height={22} viewBox="0 0 26 26" fill="none">
                            <path d={HAND} fill={hinweisFarbe} />
                        </svg>
                    </motion.div>
                    <motion.svg width={26} height={13} viewBox="0 0 30 15" fill="none" style={{ transformOrigin: "left center" }} animate={reduziert || istStatisch ? {} : { scale: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                        <path d={PFEIL_R} fill={hinweisFarbe} />
                    </motion.svg>
                </motion.div>
            )}
        </div>
    )
}

addPropertyControls(Kundenrad, {
    logos: {
        type: ControlType.Array,
        title: "Logos",
        maxCount: 16,
        control: {
            type: ControlType.Object,
            controls: {
                name: { type: ControlType.String, title: "Name", defaultValue: "Kunde" },
                bild: { type: ControlType.ResponsiveImage, title: "Logo" },
            },
        },
        defaultValue: STANDARD.map((l) => ({ name: l.name })),
    },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 560, min: 150, max: 900, step: 10, unit: "px", hidden: () => true },
    abstand: { type: ControlType.Number, title: "Abstand", defaultValue: 32, min: 0, max: 200, step: 2, unit: "px" },
    perspektive: { type: ControlType.Number, title: "Tiefe", defaultValue: 1800, min: 300, max: 4000, step: 50, unit: "px" },
    unschaerfe: { type: ControlType.Number, title: "Unschärfe", defaultValue: 6, min: 0, max: 20, step: 0.5, unit: "px" },
    kartenBreite: { type: ControlType.Number, title: "Logo Breite", defaultValue: 280, min: 80, max: 600, step: 10, unit: "px" },
    kartenHoehe: { type: ControlType.Number, title: "Logo Höhe", defaultValue: 150, min: 40, max: 300, step: 4, unit: "px" },
    tempo: { type: ControlType.Number, title: "Tempo", defaultValue: 1.5, min: 0, max: 6, step: 0.1 },
    richtung: { type: ControlType.Enum, title: "Richtung", options: ["links", "rechts"], optionTitles: ["Links", "Rechts"], defaultValue: "links", displaySegmentedControl: true },
    scrollSchub: { type: ControlType.Number, title: "Scrollschub", defaultValue: 0.12, min: 0, max: 0.6, step: 0.01 },
    graustufen: { type: ControlType.Boolean, title: "Graustufen", defaultValue: true },
    flaeche: { type: ControlType.Color, title: "Kartenfläche", defaultValue: "rgba(255, 255, 255, 0.82)" },
    hinweis: { type: ControlType.Boolean, title: "Zieh-Hinweis", defaultValue: true },
    hinweisFarbe: { type: ControlType.Color, title: "Hinweisfarbe", defaultValue: "rgba(14, 15, 18, 0.35)", hidden: (p: Partial<KundenradProps>) => !p.hinweis },
})
