import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties } from "react"

// Leistungsfelder — drei auswählbare Felder (Prinzip Homy „Our Services“), ruhiger gebaut:
// Die Inhalte haben ihre Endbreite von Anfang an und werden beim Aufziehen nur freigelegt,
// statt umzubrechen. Überblendungen sind gestaffelt, Flächen gleiten. Auf schmalen
// Bildschirmen wird daraus ein Akkordeon.

interface Bild {
    src?: string
    srcSet?: string
    alt?: string
}

interface Feld {
    marke?: string
    kurztitel?: string
    titel?: string
    text?: string
    leistungen?: string
    bild?: Bild
}

interface LeistungsfelderProps {
    felder: Feld[]
    start: number
    anteil: number
    abstand: number
    radius: number
    dunkel: string
    hell: string
    hellHover: string
    textHell: string
    textDunkel: string
    akzent: string
    style?: CSSProperties
}

const STANDARD: Feld[] = [
    {
        marke: "Performance Marketing",
        kurztitel: "Performance",
        titel: "Kampagnen, die Anfragen bringen",
        text: "Meta und Google Ads für Anfragen, Bewerbungen und Verkäufe. Mit Tracking, das am Monatsende zeigt, was ein Auftrag tatsächlich gekostet hat.",
        leistungen: "Meta Ads · Google Ads · Kampagnenstrategie · Leadgenerierung · Tracking · Conversion-Optimierung",
        bild: { src: "https://framerusercontent.com/images/OSy9xnJMKJd7tiAguEUK4SQ9e4.jpg?scale-down-to=1024", alt: "Auswertung einer Kampagne" },
    },
    {
        marke: "Websites & digitale Systeme",
        kurztitel: "Websites",
        titel: "Seiten, die verkaufen statt zu repräsentieren",
        text: "Unternehmenswebsites und Landingpages, die auf Anfragen hin gebaut sind — technisch sauber, schnell und für Google wie für KI-Assistenten auffindbar.",
        leistungen: "Webdesign · Development · Landingpages · SEO · Local SEO · GEO · Customer Journey",
        bild: { src: "https://framerusercontent.com/images/r3QYK4OUE5KpRluELHXsYlm2g.jpg?scale-down-to=1024", alt: "Website Glanzwerk" },
    },
    {
        marke: "Content & Brand",
        kurztitel: "Content",
        titel: "Material, das beides füttert",
        text: "Foto, Video und Social Content aus eigener Produktion — als Rohstoff für Website und Anzeigen, nicht als Selbstzweck.",
        leistungen: "Content-Strategie · Produktion · Social Media · Foto & Video · Kampagnenmotive",
        bild: { src: "https://framerusercontent.com/images/xwE0W3OKmnzH3VwnzldtOoj4OB4.jpg?scale-down-to=1024", alt: "Dreh in einem Lokal" },
    },
]

const KURVE = "cubic-bezier(0.22, 1, 0.36, 1)"
const SANFT = "cubic-bezier(0.65, 0, 0.35, 1)"
const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"

function nummer(i: number) {
    return "." + String(i + 1).padStart(2, "0")
}

/**
 * Leistungsfelder
 *
 * @framerIntrinsicWidth 1240
 * @framerIntrinsicHeight 600
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Leistungsfelder(props: LeistungsfelderProps) {
    const {
        felder,
        start = 0,
        anteil = 2.6,
        abstand = 12,
        radius = 18,
        dunkel = "rgb(14, 15, 18)",
        hell = "rgb(235, 232, 226)",
        hellHover = "rgb(226, 222, 215)",
        textHell = "rgb(245, 243, 239)",
        textDunkel = "rgb(14, 15, 18)",
        akzent = "rgb(255, 90, 31)",
        style,
    } = props

    const quelle = felder && felder.length > 0 ? felder : STANDARD
    const liste: Feld[] = quelle.map((f, i) => {
        const s = STANDARD[i % STANDARD.length]
        return {
            marke: f?.marke || s.marke,
            kurztitel: f?.kurztitel || s.kurztitel,
            titel: f?.titel || s.titel,
            text: f?.text || s.text,
            leistungen: f?.leistungen || s.leistungen,
            bild: f?.bild?.src ? f.bild : s.bild,
        }
    })
    const n = liste.length

    const istStatisch = useIsStaticRenderer()
    const reduziert = useReducedMotion() ?? false
    const reduziertRef = useRef(reduziert)
    reduziertRef.current = reduziert
    const huelleRef = useRef<HTMLDivElement>(null)
    const [breite, setBreite] = useState(1240)
    const [hoehe, setHoehe] = useState(600)
    const [aktiv, setAktiv] = useState(Math.min(Math.max(0, start), n - 1))
    const [ueber, setUeber] = useState<number | null>(null)
    const [zahlenAus, setZahlenAus] = useState(false)
    const [zahlAktiv, setZahlAktiv] = useState(aktiv)
    const schmal = breite < 760
    const ersterLauf = useRef(true)

    // Beim Wechsel blenden die Ziffern kurz aus, springen unsichtbar an ihren Endplatz und
    // kommen erst wieder, wenn die Felder ausgezogen sind — so läuft nie eine Ziffer über Text.
    useEffect(() => {
        if (ersterLauf.current) {
            ersterLauf.current = false
            return
        }
        if (reduziertRef.current) {
            setZahlAktiv(aktiv)
            return
        }
        setZahlenAus(true)
        const umsetzen = window.setTimeout(() => setZahlAktiv(aktiv), 200)
        const zeigen = window.setTimeout(() => setZahlenAus(false), 860)
        return () => {
            window.clearTimeout(umsetzen)
            window.clearTimeout(zeigen)
        }
    }, [aktiv])

    useEffect(() => {
        const el = huelleRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => {
            setBreite(el.clientWidth || 1240)
            setHoehe(el.clientHeight || 600)
        })
        ro.observe(el)
        setBreite(el.clientWidth || 1240)
        setHoehe(el.clientHeight || 600)
        return () => ro.disconnect()
    }, [schmal])

    const t = (s: number) => (reduziert || istStatisch ? "0s" : `${s}s`)
    const frei = Math.max(0, breite - abstand * (n - 1))
    const offenBreite = (frei * anteil) / (anteil + (n - 1))
    const zuBreite = frei / (anteil + (n - 1))

    // ---------- Schmal: Akkordeon ----------
    if (schmal) {
        return (
            <div ref={huelleRef} style={{ ...style, position: "relative", width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                {liste.map((f, i) => {
                    const an = aktiv === i
                    return (
                        <div key={i} style={{ borderRadius: radius, overflow: "hidden", background: an ? dunkel : hell, transition: `background-color ${t(0.6)} ${KURVE}` }}>
                            <button
                                type="button"
                                aria-expanded={an}
                                onClick={() => setAktiv(i)}
                                style={{ all: "unset", boxSizing: "border-box", width: "100%", cursor: "pointer", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "20px 20px 18px", gap: 12 }}
                            >
                                <span style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: an ? "rgba(245,243,239,0.56)" : "rgba(14,15,18,0.45)", transition: `color ${t(0.5)} ${KURVE}` }}>{f.marke}</span>
                                    <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 24, letterSpacing: "-0.045em", lineHeight: 1.1, color: an ? textHell : textDunkel, transition: `color ${t(0.5)} ${KURVE}` }}>{f.kurztitel}</span>
                                </span>
                                <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 44, letterSpacing: "-0.06em", lineHeight: 0.9, color: an ? akzent : "rgba(14,15,18,0.16)", transition: `color ${t(0.5)} ${KURVE}` }}>{nummer(i)}</span>
                            </button>
                            <div style={{ display: "grid", gridTemplateRows: an ? "1fr" : "0fr", transition: `grid-template-rows ${t(0.7)} ${KURVE}` }}>
                                <div style={{ overflow: "hidden", minHeight: 0 }}>
                                    <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 14, opacity: an ? 1 : 0, transition: `opacity ${t(0.5)} ${KURVE} ${an ? "0.15s" : "0s"}` }}>
                                        <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 22, letterSpacing: "-0.04em", lineHeight: 1.15, color: textHell }}>{f.titel}</span>
                                        <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 16, letterSpacing: "-0.02em", lineHeight: 1.55, color: "rgba(245,243,239,0.66)" }}>{f.text}</span>
                                        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10", borderRadius: Math.max(0, radius - 8), overflow: "hidden", marginTop: 4 }}>
                                            <img src={f.bild?.src} srcSet={f.bild?.srcSet} alt={f.bild?.alt || ""} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                                        </div>
                                        {f.leistungen ? <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 13, letterSpacing: "-0.01em", lineHeight: 1.6, color: "rgba(245,243,239,0.5)" }}>{f.leistungen}</span> : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    // ---------- Breit: Felder nebeneinander ----------
    const innen = 32
    const bildHoehe = Math.max(160, Math.round(hoehe * 0.46))

    return (
        <div
            ref={huelleRef}
            role="tablist"
            aria-label="Leistungen"
            style={{ ...style, position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "row", gap: abstand }}
        >
            {liste.map((f, i) => {
                const an = aktiv === i
                const hov = ueber === i && !an
                const zahlAn = zahlAktiv === i
                return (
                    <div
                        key={i}
                        role="tab"
                        aria-selected={an}
                        tabIndex={0}
                        onClick={() => setAktiv(i)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setAktiv(i) }
                            if (e.key === "ArrowRight") setAktiv((i + 1) % n)
                            if (e.key === "ArrowLeft") setAktiv((i - 1 + n) % n)
                        }}
                        onPointerEnter={() => setUeber(i)}
                        onPointerLeave={() => setUeber((u) => (u === i ? null : u))}
                        style={{
                            position: "relative",
                            flex: `${an ? anteil : 1} 1 0px`,
                            minWidth: 0,
                            height: "100%",
                            borderRadius: radius,
                            overflow: "hidden",
                            cursor: an ? "default" : "pointer",
                            background: an ? dunkel : hov ? hellHover : hell,
                            transition: `flex-grow ${t(0.95)} ${SANFT}, background-color ${t(0.6)} ${KURVE}`,
                            outline: "none",
                        }}
                    >
                        {/* Ziffer oben rechts — sitzt in einer Box mit der Endbreite des Feldes */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                top: innen - 6,
                                left: 0,
                                width: zahlAn ? offenBreite : zuBreite,
                                paddingRight: innen - 4,
                                boxSizing: "border-box",
                                display: "flex",
                                justifyContent: "flex-end",
                                pointerEvents: "none",
                                userSelect: "none",
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: SCHRIFT,
                                    fontWeight: 500,
                                    fontSize: 96,
                                    letterSpacing: "-0.065em",
                                    lineHeight: 0.9,
                                    whiteSpace: "nowrap",
                                    color: zahlAn ? textHell : hov ? "rgba(14,15,18,0.24)" : "rgba(14,15,18,0.14)",
                                    opacity: zahlenAus ? 0 : 1,
                                    transform: zahlenAus ? "translateY(10px)" : hov ? "translateY(-4px)" : "translateY(0px)",
                                    transition: zahlenAus
                                        ? `opacity ${t(0.18)} ${KURVE}, transform ${t(0.18)} ${KURVE}, color 0s`
                                        : `opacity ${t(0.55)} ${KURVE}, transform ${t(0.7)} ${KURVE}, color ${t(0.6)} ${KURVE}`,
                                }}
                            >
                                {nummer(i)}
                            </span>
                        </div>

                        {/* Zu: Kurztitel unten links, feste Breite */}
                        <div
                            aria-hidden={an}
                            style={{
                                position: "absolute",
                                left: innen,
                                bottom: innen,
                                width: Math.max(120, zuBreite - innen * 2),
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                opacity: an ? 0 : 1,
                                transform: an ? "translateY(10px)" : "translateY(0px)",
                                transition: an
                                    ? `opacity ${t(0.2)} ${KURVE}, transform ${t(0.3)} ${KURVE}`
                                    : `opacity ${t(0.45)} ${KURVE} ${t(0.45)}, transform ${t(0.7)} ${KURVE} ${t(0.4)}`,
                                pointerEvents: "none",
                            }}
                        >
                            <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(14,15,18,0.45)" }}>{f.marke}</span>
                            <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 30, letterSpacing: "-0.045em", lineHeight: 1.12, color: textDunkel }}>{f.kurztitel}</span>
                        </div>

                        {/* Offen: Inhalt in Endbreite, wird nur freigelegt */}
                        <div
                            aria-hidden={!an}
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: offenBreite,
                                height: "100%",
                                opacity: an ? 1 : 0,
                                transition: an ? `opacity ${t(0.6)} ${KURVE} ${t(0.5)}` : `opacity ${t(0.18)} ${KURVE}`,
                                pointerEvents: an ? "auto" : "none",
                            }}
                        >
                            <div style={{ position: "absolute", left: innen, top: innen, right: 160, display: "flex", flexDirection: "column", gap: 18 }}>
                                <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: akzent }}>{f.marke}</span>
                                <span
                                    style={{
                                        fontFamily: SCHRIFT,
                                        fontWeight: 500,
                                        fontSize: 30,
                                        letterSpacing: "-0.045em",
                                        lineHeight: 1.12,
                                        color: textHell,
                                        maxWidth: 440,
                                        transform: an ? "translateY(0px)" : "translateY(12px)",
                                        transition: `transform ${t(0.9)} ${KURVE} ${an ? t(0.5) : "0s"}`,
                                    }}
                                >
                                    {f.titel}
                                </span>
                                <span
                                    style={{
                                        fontFamily: SCHRIFT,
                                        fontWeight: 500,
                                        fontSize: 17,
                                        letterSpacing: "-0.025em",
                                        lineHeight: 1.55,
                                        color: "rgba(245,243,239,0.64)",
                                        maxWidth: 460,
                                        transform: an ? "translateY(0px)" : "translateY(12px)",
                                        transition: `transform ${t(0.9)} ${KURVE} ${an ? t(0.58) : "0s"}`,
                                    }}
                                >
                                    {f.text}
                                </span>
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    left: 12,
                                    right: 12,
                                    bottom: 12,
                                    height: bildHoehe,
                                    borderRadius: Math.max(0, radius - 6),
                                    overflow: "hidden",
                                }}
                            >
                                <img
                                    src={f.bild?.src}
                                    srcSet={f.bild?.srcSet}
                                    alt={f.bild?.alt || ""}
                                    loading="lazy"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        transform: an ? "scale(1)" : "scale(1.08)",
                                        transition: `transform ${t(1.4)} ${KURVE}`,
                                    }}
                                />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,15,18,0) 45%, rgba(14,15,18,0.72) 100%)" }} />
                                {f.leistungen ? (
                                    <div style={{ position: "absolute", left: 20, right: 20, bottom: 18, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {f.leistungen.split("·").map((l, k) => (
                                            <span
                                                key={k}
                                                style={{
                                                    fontFamily: SCHRIFT,
                                                    fontWeight: 500,
                                                    fontSize: 13,
                                                    letterSpacing: "-0.01em",
                                                    color: textHell,
                                                    padding: "7px 12px",
                                                    borderRadius: 999,
                                                    background: "rgba(14,15,18,0.42)",
                                                    backdropFilter: "blur(10px)",
                                                    WebkitBackdropFilter: "blur(10px)",
                                                    border: "1px solid rgba(245,243,239,0.14)",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {l.trim()}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

addPropertyControls(Leistungsfelder, {
    felder: {
        type: ControlType.Array,
        title: "Felder",
        maxCount: 4,
        control: {
            type: ControlType.Object,
            controls: {
                marke: { type: ControlType.String, title: "Marke", defaultValue: "Leistung" },
                kurztitel: { type: ControlType.String, title: "Kurztitel", defaultValue: "Leistung" },
                titel: { type: ControlType.String, title: "Titel", defaultValue: "" },
                text: { type: ControlType.String, title: "Text", displayTextArea: true, defaultValue: "" },
                leistungen: { type: ControlType.String, title: "Leistungen", defaultValue: "" },
                bild: { type: ControlType.ResponsiveImage, title: "Bild" },
            },
        },
        defaultValue: STANDARD.map((f) => ({ marke: f.marke, kurztitel: f.kurztitel })),
    },
    start: { type: ControlType.Number, title: "Start", defaultValue: 0, min: 0, max: 3, step: 1, displayStepper: true },
    anteil: { type: ControlType.Number, title: "Anteil offen", defaultValue: 2.6, min: 1.5, max: 4, step: 0.1 },
    abstand: { type: ControlType.Number, title: "Abstand", defaultValue: 12, min: 0, max: 40, step: 1, unit: "px" },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 18, min: 0, max: 40, step: 1, unit: "px" },
    dunkel: { type: ControlType.Color, title: "Fläche offen", defaultValue: "rgb(14, 15, 18)" },
    hell: { type: ControlType.Color, title: "Fläche zu", defaultValue: "rgb(235, 232, 226)" },
    hellHover: { type: ControlType.Color, title: "Fläche zu Hover", defaultValue: "rgb(226, 222, 215)" },
    textHell: { type: ControlType.Color, title: "Text hell", defaultValue: "rgb(245, 243, 239)" },
    textDunkel: { type: ControlType.Color, title: "Text dunkel", defaultValue: "rgb(14, 15, 18)" },
    akzent: { type: ControlType.Color, title: "Akzent", defaultValue: "rgb(255, 90, 31)" },
})
