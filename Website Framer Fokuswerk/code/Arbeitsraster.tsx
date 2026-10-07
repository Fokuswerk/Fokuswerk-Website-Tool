import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties } from "react"

// Arbeitsraster — zwei Ansichten hinter einem Umschalter: „Websites“ und „Kampagnen“.
//
// Websites: sechs Arbeiten im 3×2-Raster (Prinzip der Spector-Projektgalerie).
// Die überfahrene Kachel wächst in ihrer Reihe auf die doppelte Breite der Nachbarn, ihre
// Reihe auf rund zwei Drittel der Höhe. Unten mittig erscheinen Titel und Ort, oben rechts
// ein runder Pfeil-Knopf. Auf Touch-Geräten: erstes Tippen öffnet, zweites Tippen führt
// zur Seite. Auf schmalen Bildschirmen stehen die Kacheln untereinander.
//
// Kampagnen: je Kunde eine Anzeigenvorschau im Handyrahmen und drei belegte Kennzahlen, die beim
// Einblenden hochzählen. Breit vier Spalten, schmaler eine wischbare Reihe mit Einrasten.

interface Bild {
    src?: string
    srcSet?: string
    alt?: string
}

interface Arbeit {
    bild?: Bild
    titel?: string
    ort?: string
    link?: string
}

interface Kennzahl {
    wert?: string
    text?: string
}

interface Kampagne {
    kunde?: string
    art?: string
    logo?: Bild
    motiv?: Bild
    schlagzeile?: string
    knopf?: string
    zahl1?: string
    text1?: string
    zahl2?: string
    text2?: string
    zahl3?: string
    text3?: string
}

interface ArbeitsrasterProps {
    arbeiten: Arbeit[]
    kampagnen: Kampagne[]
    start: "websites" | "kampagnen"
    beispielHinweis: boolean
    spalten: number
    abstand: number
    radius: number
    wachstum: number
    reihenAnteil: number
    titelFarbe: string
    knopfFarbe: string
    bildPosition: "top" | "center"
    style?: CSSProperties
}

const STANDARD: Arbeit[] = [
    { titel: "WAV Westerstede", ort: "Kfz-Werkstatt · Westerstede", link: "https://wav-wst.de/", bild: { src: "https://framerusercontent.com/images/ArC0EnCXXAPEbwWsXDR5b7YS2eg.webp", alt: "Website WAV Westerstede" } },
    { titel: "Glanzwerk", ort: "Gebäudereinigung · Oldenburg", link: "https://glanzwerk-oldenburg.vercel.app/", bild: { src: "https://framerusercontent.com/images/CvrD2aQ0C2DY3Ce023o77gXDQ.webp", alt: "Website Glanzwerk" } },
    { titel: "Wohnwagen Scharein", ort: "Wohnwagenhandel · Großefehn", link: "https://wohnwagen-scharein.vercel.app/", bild: { src: "https://framerusercontent.com/images/b9skVAhwPZ5x9dCX59VRWCiNUc.webp", alt: "Website Wohnwagen Scharein" } },
    { titel: "Karosseriebau Heinz", ort: "Karosseriebau · Großheide", link: "https://karosseriebau-heinz.vercel.app/", bild: { src: "https://framerusercontent.com/images/gmJirqTU26tEnuBJ2nCpuazxw.webp", alt: "Website Karosseriebau Heinz" } },
    { titel: "Andre Henken", ort: "Heizung, Bad, Elektro · Oldenburg", link: "https://andre-henken-website.vercel.app/", bild: { src: "https://framerusercontent.com/images/kM3r4Y9YBrNBYnJ7cIiI1aoXc.webp", alt: "Website Andre Henken" } },
    { titel: "Hotel Kämper", ort: "Hotel & Restaurant · Bad Zwischenahn", link: "https://kaemper.vercel.app/", bild: { src: "https://framerusercontent.com/images/vsrW4ZDFYyTO5QmW2LTvfyfwko.webp", alt: "Website Hotel Kämper" } },
]

const KAMPAGNEN: Kampagne[] = [
    {
        kunde: "Zwillis Padel",
        art: "Social & Content · Sport, Oldenburg",
        logo: { src: "https://framerusercontent.com/images/un5qWoV4NXGEowgSuUw3npjfSw.png", alt: "Zwillis Padel" },
        motiv: { src: "https://images.unsplash.com/photo-1763560836998-bdeb531e8541?crop=entropy&cs=srgb&fm=webp&ixlib=rb-4.1.0&q=70&w=600", alt: "Padel bei Nacht" },
        schlagzeile: "Heute Abend noch ein Platz frei?",
        knopf: "Platz buchen",
        zahl1: "+156 %", text1: "Buchungen",
        zahl2: "+90 %", text2: "Website-Aufrufe",
        zahl3: "45K", text3: "Views",
    },
    {
        kunde: "Patio",
        art: "Recruiting · Gastronomie, Oldenburg",
        logo: { src: "https://framerusercontent.com/images/b5FitHUfK0WXOC82nswyopSXAE4.png", alt: "Patio" },
        motiv: { src: "https://images.unsplash.com/photo-1574071318537-1c5c7f4b570d?crop=entropy&cs=srgb&fm=webp&ixlib=rb-4.1.0&q=70&w=600", alt: "Barkeeper schenkt ein" },
        schlagzeile: "Hinter die Bar, die man kennt.",
        knopf: "Jetzt bewerben",
        zahl1: "69", text1: "Bewerbungen",
        zahl2: "290K", text2: "Aufrufe",
        zahl3: "+632 %", text3: "Engagement",
    },
    {
        kunde: "WinHadi",
        art: "Content & Website · Hospitality",
        logo: { src: "https://framerusercontent.com/images/lpvKNedYoddiG0Hgipp3ZIcaNhc.png", alt: "WinHadi" },
        motiv: { src: "https://images.unsplash.com/photo-1779172131227-4df63a00627e?crop=entropy&cs=srgb&fm=webp&ixlib=rb-4.1.0&q=70&w=600", alt: "Lounge am Abend" },
        schlagzeile: "Ankommen, wo es ruhig wird.",
        knopf: "Mehr erfahren",
        zahl1: "+45 %", text1: "Buchungen",
        zahl2: "+38 %", text2: "Klickrate",
        zahl3: "+72 %", text3: "Verweildauer",
    },
    {
        kunde: "Hotel Alte Werft",
        art: "Foto & Video · Hotel, Papenburg",
        logo: { src: "https://framerusercontent.com/images/4LLFl4HNCVq8Sy51vAuMn8jlpRg.png", alt: "Hotel Alte Werft" },
        motiv: { src: "https://images.unsplash.com/photo-1761152058291-cf84e2bfb1e7?crop=entropy&cs=srgb&fm=webp&ixlib=rb-4.1.0&q=70&w=600", alt: "Beleuchtetes Ufer bei Nacht" },
        schlagzeile: "Ein Abend an der Werft.",
        knopf: "Zimmer buchen",
        zahl1: "+42 %", text1: "Website-Aufrufe",
        zahl2: "+27 %", text2: "Buchungen",
        zahl3: "+35 %", text3: "Verweildauer",
    },
]

const KURVE = "cubic-bezier(0.22, 1, 0.36, 1)"
const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const PAPIER = "rgb(245, 243, 239)"
const TINTE = "rgb(14, 15, 18)"

function Raster(props: ArbeitsrasterProps) {
    const {
        arbeiten,
        spalten = 3,
        abstand = 4,
        radius = 10,
        wachstum = 2,
        reihenAnteil = 0.64,
        titelFarbe = "rgb(245, 243, 239)",
        knopfFarbe = "rgb(255, 90, 31)",
        bildPosition = "top",
        style,
    } = props

    const quelle = arbeiten && arbeiten.length > 0 ? arbeiten : STANDARD
    const liste: Arbeit[] = quelle.map((a, i) => {
        const s = STANDARD[i % STANDARD.length]
        return {
            titel: a?.titel || s.titel,
            ort: a?.ort || s.ort,
            link: a?.link || s.link,
            bild: a?.bild?.src ? a.bild : s.bild,
        }
    })

    const istStatisch = useIsStaticRenderer()
    const reduziert = useReducedMotion() ?? false
    const huelleRef = useRef<HTMLDivElement>(null)
    const [breite, setBreite] = useState(1240)
    const [aktiv, setAktiv] = useState<number | null>(null)
    const [touch, setTouch] = useState(false)
    const schmal = breite < 700

    useEffect(() => {
        const el = huelleRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => setBreite(el.clientWidth || 1240))
        ro.observe(el)
        setBreite(el.clientWidth || 1240)
        if (typeof window !== "undefined" && window.matchMedia) setTouch(window.matchMedia("(hover: none)").matches)
        return () => ro.disconnect()
    }, [schmal])

    const sp = Math.max(1, Math.min(4, Math.round(spalten)))
    const reihen: Arbeit[][] = []
    for (let i = 0; i < liste.length; i += sp) reihen.push(liste.slice(i, i + sp))
    const aktivReihe = aktiv === null ? -1 : Math.floor(aktiv / sp)
    const dauer = reduziert ? "0s" : "0.75s"

    const karte = (a: Arbeit, i: number, flex: number | null) => {
        const an = aktiv === i || schmal
        const kannHover = !touch && !schmal && !istStatisch
        return (
            <a
                key={i}
                href={a.link}
                target="_blank"
                rel="noopener"
                aria-label={`${a.titel}${a.ort ? " — " + a.ort : ""} (öffnet in neuem Tab)`}
                onPointerEnter={(e) => { if (kannHover && e.pointerType === "mouse") setAktiv(i) }}
                onFocus={() => setAktiv(i)}
                onClick={(e) => {
                    if ((touch && !schmal) && aktiv !== i) {
                        e.preventDefault()
                        setAktiv(i)
                    }
                }}
                style={{
                    position: "relative",
                    display: "block",
                    flex: flex === null ? undefined : `${flex} 1 0px`,
                    minWidth: 0,
                    height: schmal ? Math.round(breite * 0.68) : "100%",
                    borderRadius: radius,
                    overflow: "hidden",
                    transition: `flex-grow ${dauer} ${KURVE}`,
                    textDecoration: "none",
                    background: "rgb(20, 21, 24)",
                    outline: "none",
                    WebkitTapHighlightColor: "transparent",
                }}
            >
                <img
                    src={a.bild?.src}
                    srcSet={a.bild?.srcSet}
                    alt={a.bild?.alt || a.titel || ""}
                    loading="lazy"
                    draggable={false}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: bildPosition === "top" ? "center top" : "center center",
                        transform: an ? "scale(1)" : "scale(1.04)",
                        filter: an || aktiv === null ? "brightness(1)" : "brightness(0.78)",
                        transition: `transform 1.1s ${KURVE}, filter 0.6s ${KURVE}`,
                    }}
                />
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: "58%",
                        background: "linear-gradient(180deg, rgba(14,15,18,0) 0%, rgba(14,15,18,0.55) 55%, rgba(14,15,18,0.86) 100%)",
                        opacity: an ? 1 : 0,
                        transition: `opacity 0.6s ${KURVE}`,
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: schmal ? 20 : 30,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        padding: "0 20px",
                        textAlign: "center",
                        color: titelFarbe,
                        opacity: an ? 1 : 0,
                        transform: an ? "translateY(0px)" : "translateY(14px)",
                        transition: `opacity 0.5s ${KURVE} ${an ? "0.12s" : "0s"}, transform 0.7s ${KURVE} ${an ? "0.1s" : "0s"}`,
                        pointerEvents: "none",
                    }}
                >
                    <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: schmal ? 24 : 32, letterSpacing: "-0.045em", lineHeight: 1.05, whiteSpace: "nowrap" }}>
                        {a.titel}
                    </span>
                    {a.ort ? (
                        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 14, letterSpacing: "-0.01em", opacity: 0.72, whiteSpace: "nowrap" }}>
                            {a.ort}
                        </span>
                    ) : null}
                </div>
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        width: 48,
                        height: 48,
                        borderRadius: 999,
                        background: knopfFarbe,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: an && !schmal ? 1 : 0,
                        transform: an && !schmal ? "scale(1) rotate(0deg)" : "scale(0.6) rotate(-45deg)",
                        transition: `opacity 0.45s ${KURVE}, transform 0.6s ${KURVE}`,
                        pointerEvents: "none",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 12L12 4M12 4H5.5M12 4V10.5" stroke="rgb(14,15,18)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </a>
        )
    }

    if (schmal) {
        return (
            <div ref={huelleRef} style={{ ...style, position: "relative", width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                {liste.map((a, i) => karte(a, i, null))}
            </div>
        )
    }

    return (
        <div
            ref={huelleRef}
            onPointerLeave={(e) => { if (e.pointerType === "mouse") setAktiv(null) }}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: abstand,
            }}
        >
            {reihen.map((reihe, r) => {
                const rf = aktivReihe === -1 ? 1 : aktivReihe === r ? reihenAnteil / (1 - reihenAnteil) : 1
                return (
                    <div
                        key={r}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: abstand,
                            flex: `${rf} 1 0px`,
                            minHeight: 0,
                            transition: `flex-grow ${dauer} ${KURVE}`,
                        }}
                    >
                        {reihe.map((a, j) => {
                            const i = r * sp + j
                            const f = aktiv === null || aktivReihe !== r ? 1 : aktiv === i ? wachstum : 1
                            return karte(a, i, f)
                        })}
                    </div>
                )
            })}
        </div>
    )
}

// ---------- Kampagnen ----------

// "+156 %" → { vor: "+", zahl: 156, nach: " %" }
function zerlegen(wert: string) {
    const m = wert.match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/)
    if (!m) return { vor: "", zahl: NaN, nach: wert, stellen: 0 }
    const roh = m[2].replace(",", ".")
    return { vor: m[1], zahl: Number(roh), nach: m[3], stellen: roh.includes(".") ? roh.split(".")[1].length : 0 }
}

function Zaehler(props: { wert: string; los: boolean; verzug: number; reduziert: boolean }) {
    const { wert, los, verzug, reduziert } = props
    const teile = zerlegen(wert)
    const [anzeige, setAnzeige] = useState(reduziert || isNaN(teile.zahl) ? teile.zahl : 0)
    useEffect(() => {
        if (isNaN(teile.zahl)) return
        if (reduziert) {
            setAnzeige(teile.zahl)
            return
        }
        if (!los) {
            setAnzeige(0)
            return
        }
        let raf = 0
        const beginn = performance.now() + verzug * 1000
        const dauer = 1500
        const schritt = (jetzt: number) => {
            const t = Math.min(1, Math.max(0, (jetzt - beginn) / dauer))
            const e = 1 - Math.pow(1 - t, 4)
            setAnzeige(teile.zahl * e)
            if (t < 1) raf = requestAnimationFrame(schritt)
        }
        raf = requestAnimationFrame(schritt)
        return () => cancelAnimationFrame(raf)
    }, [los, wert, verzug, reduziert])
    if (isNaN(teile.zahl)) return <>{wert}</>
    const text = anzeige.toFixed(teile.stellen).replace(".", ",")
    return (
        <>
            {teile.vor}
            {text}
            {teile.nach}
        </>
    )
}

function Pfeilchen(props: { farbe: string }) {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke={props.farbe} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function Anzeige(props: { k: Kampagne; breite: number; hoehe: number; gehoben: boolean; beispiel: boolean; radius: number }) {
    const { k, breite, hoehe, gehoben, beispiel, radius } = props
    const r = Math.round(breite * 0.11)
    return (
        <div
            style={{
                position: "relative",
                width: breite,
                height: hoehe,
                borderRadius: r,
                padding: 5,
                boxSizing: "border-box",
                background: "linear-gradient(160deg, rgba(245,243,239,0.22), rgba(245,243,239,0.05) 40%, rgba(245,243,239,0.12))",
                boxShadow: gehoben
                    ? "0 40px 70px -30px rgba(0,0,0,0.75), 0 0 0 1px rgba(245,243,239,0.08)"
                    : "0 24px 50px -30px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,243,239,0.06)",
                transform: gehoben ? "translateY(-10px) rotate(-1.2deg)" : "translateY(0px) rotate(0deg)",
                transition: `transform 0.8s ${KURVE}, box-shadow 0.8s ${KURVE}`,
                flexShrink: 0,
            }}
        >
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: r - 5, overflow: "hidden", background: "rgb(24,25,28)" }}>
                <img
                    src={k.motiv?.src}
                    srcSet={k.motiv?.srcSet}
                    alt={k.motiv?.alt || ""}
                    loading="lazy"
                    draggable={false}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: gehoben ? "scale(1.06)" : "scale(1)",
                        transition: `transform 1.4s ${KURVE}`,
                    }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.78) 100%)" }} />
                {/* Kopf wie im Feed */}
                <div style={{ position: "absolute", left: 12, right: 12, top: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 999, background: PAPIER, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                        {k.logo?.src ? <img src={k.logo.src} alt={`Logo ${k.kunde ?? ""}`.trim()} loading="lazy" decoding="async" style={{ width: "78%", height: "78%", objectFit: "contain" }} /> : null}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                        <span style={{ fontFamily: SCHRIFT, fontWeight: 600, fontSize: 12.5, letterSpacing: "-0.01em", color: PAPIER, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.kunde}</span>
                        <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 11, color: "rgba(245,243,239,0.7)" }}>Gesponsert</span>
                    </div>
                    <span style={{ fontFamily: SCHRIFT, fontSize: 16, lineHeight: 1, color: "rgba(245,243,239,0.8)", letterSpacing: "0.05em" }}>···</span>
                </div>
                {/* Schlagzeile und Knopf */}
                <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    {k.schlagzeile ? (
                        <span style={{ fontFamily: SCHRIFT, fontWeight: 600, fontSize: Math.max(15, Math.round(breite * 0.068)), letterSpacing: "-0.035em", lineHeight: 1.12, color: PAPIER }}>
                            {k.schlagzeile}
                        </span>
                    ) : null}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            borderRadius: Math.max(8, radius),
                            background: "rgba(245,243,239,0.94)",
                        }}
                    >
                        <span style={{ fontFamily: SCHRIFT, fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em", color: TINTE }}>{k.knopf || "Mehr erfahren"}</span>
                        <Pfeilchen farbe={TINTE} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function KampagnenAnsicht(props: {
    liste: Kampagne[]
    breite: number
    hoehe: number
    aktivAnsicht: boolean
    radius: number
    akzent: string
    beispiel: boolean
    reduziert: boolean
    touch: boolean
}) {
    const { liste, breite, hoehe, aktivAnsicht, radius, akzent, beispiel, reduziert, touch } = props
    const huelle = useRef<HTMLDivElement>(null)
    const [imBild, setImBild] = useState(false)
    const [ueber, setUeber] = useState<number | null>(null)

    useEffect(() => {
        const el = huelle.current
        if (!el || typeof IntersectionObserver === "undefined") return
        const io = new IntersectionObserver((e) => setImBild(e.some((x) => x.isIntersecting)), { threshold: 0.25 })
        io.observe(el)
        return () => io.disconnect()
    }, [])

    const los = aktivAnsicht && imBild
    const spalten = breite >= 1060 ? liste.length : 0 // 0 = wischbare Reihe
    const abstand = 12
    const karteBreite = spalten ? (breite - abstand * (spalten - 1)) / spalten : Math.min(320, Math.round(breite * 0.8))
    const innen = 18
    const textHoehe = 236
    const kartenHoehe = spalten ? hoehe : Math.max(520, Math.min(hoehe || 600, 640))
    const verfuegbar = kartenHoehe - textHoehe - innen * 2
    let telBreite = Math.min(karteBreite - innen * 2 - 6, Math.round((verfuegbar * 9) / 16))
    telBreite = Math.max(150, telBreite)
    const telHoehe = Math.round((telBreite * 16) / 9)

    const karte = (k: Kampagne, i: number) => {
        const gehoben = ueber === i
        const gedimmt = ueber !== null && ueber !== i
        const zahlen = [
            { wert: k.zahl1, text: k.text1 },
            { wert: k.zahl2, text: k.text2 },
            { wert: k.zahl3, text: k.text3 },
        ].filter((z) => z.wert)
        return (
            <div
                key={i}
                onPointerEnter={(e) => { if (e.pointerType === "mouse" && !touch) setUeber(i) }}
                onPointerLeave={(e) => { if (e.pointerType === "mouse") setUeber((u) => (u === i ? null : u)) }}
                style={{
                    position: "relative",
                    flex: spalten ? "1 1 0px" : `0 0 ${karteBreite}px`,
                    minWidth: 0,
                    height: kartenHoehe,
                    borderRadius: radius + 4,
                    background: "linear-gradient(180deg, rgb(26,27,31) 0%, rgb(19,20,23) 100%)",
                    boxShadow: "inset 0 1px 0 rgba(245,243,239,0.06), 0 0 0 1px rgba(245,243,239,0.05)",
                    padding: innen,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    overflow: "hidden",
                    scrollSnapAlign: spalten ? undefined : breite < 700 ? "center" : "start",
                    opacity: gedimmt ? 0.55 : 1,
                    transition: `opacity 0.6s ${KURVE}`,
                }}
            >
                {/* Lichtschein hinter dem Telefon */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: innen + telHoehe * 0.45,
                        width: telBreite * 1.6,
                        height: telBreite * 1.6,
                        transform: "translate(-50%, -50%)",
                        borderRadius: 999,
                        background: `radial-gradient(closest-side, ${akzent.replace("rgb(", "rgba(").replace(")", ", 0.22)")}, rgba(0,0,0,0))`,
                        opacity: gehoben ? 1 : 0.35,
                        transition: `opacity 0.8s ${KURVE}`,
                        pointerEvents: "none",
                    }}
                />
                <div style={{ position: "relative", flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, paddingBottom: 16 }}>
                    <Anzeige k={k} breite={telBreite} hoehe={telHoehe} gehoben={gehoben} beispiel={beispiel} radius={radius} />
                    {beispiel ? (
                        <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(245,243,239,0.32)" }}>BEISPIELMOTIV</span>
                    ) : null}
                </div>
                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: akzent }}>{k.art}</span>
                        <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 24, letterSpacing: "-0.045em", lineHeight: 1.1, color: PAPIER }}>{k.kunde}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {zahlen.map((z, j) => (
                            <div
                                key={j}
                                style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    padding: "9px 0",
                                    borderTop: "1px solid rgba(245,243,239,0.1)",
                                }}
                            >
                                <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 13, letterSpacing: "-0.01em", color: "rgba(245,243,239,0.56)" }}>{z.text}</span>
                                <span style={{ fontFamily: SCHRIFT, fontWeight: 500, fontSize: 22, letterSpacing: "-0.05em", lineHeight: 1, color: PAPIER, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                                    <Zaehler wert={z.wert || ""} los={los} verzug={0.12 * i + 0.08 * j} reduziert={reduziert} />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={huelle}
            onPointerLeave={(e) => { if (e.pointerType === "mouse") setUeber(null) }}
            style={{
                position: "relative",
                width: "100%",
                height: spalten ? "100%" : "auto",
                display: "flex",
                flexDirection: "row",
                gap: abstand,
                overflowX: spalten ? "visible" : "auto",
                scrollSnapType: spalten ? undefined : "x mandatory",
                paddingInline: spalten || breite >= 700 ? 0 : Math.max(0, Math.round((breite - karteBreite) / 2)),
                boxSizing: "border-box",
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
                overscrollBehaviorX: "contain",
            }}
        >
            {liste.map((k, i) => karte(k, i))}
        </div>
    )
}

// ---------- Umschalter ----------

function Schalter(props: { wert: "websites" | "kampagnen"; setWert: (w: "websites" | "kampagnen") => void; anzahl: [number, number]; reduziert: boolean }) {
    const { wert, setWert, anzahl, reduziert } = props
    const refs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)]
    const [marke, setMarke] = useState({ left: 4, width: 120 })
    const index = wert === "websites" ? 0 : 1
    useEffect(() => {
        const messen = () => {
            const b = refs[index].current
            if (b) setMarke({ left: b.offsetLeft, width: b.offsetWidth })
        }
        messen()
        const t = window.setTimeout(messen, 300)
        return () => window.clearTimeout(t)
    }, [index])
    const eintraege: { id: "websites" | "kampagnen"; text: string; n: number }[] = [
        { id: "websites", text: "Websites", n: anzahl[0] },
        { id: "kampagnen", text: "Kampagnen", n: anzahl[1] },
    ]
    return (
        <div
            role="tablist"
            aria-label="Arbeiten filtern"
            style={{
                position: "relative",
                display: "inline-flex",
                padding: 4,
                borderRadius: 999,
                background: "rgba(245,243,239,0.06)",
                boxShadow: "inset 0 0 0 1px rgba(245,243,239,0.1)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: 4,
                    bottom: 4,
                    left: marke.left,
                    width: marke.width,
                    borderRadius: 999,
                    background: PAPIER,
                    boxShadow: "0 8px 20px -10px rgba(0,0,0,0.6)",
                    transition: reduziert ? "none" : `left 0.6s ${KURVE}, width 0.6s ${KURVE}`,
                }}
            />
            {eintraege.map((e, i) => {
                const an = wert === e.id
                return (
                    <button
                        key={e.id}
                        ref={refs[i]}
                        role="tab"
                        aria-selected={an}
                        type="button"
                        onClick={() => setWert(e.id)}
                        style={{
                            all: "unset",
                            position: "relative",
                            zIndex: 1,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "flex-start",
                            gap: 6,
                            padding: "11px 22px 12px",
                            borderRadius: 999,
                            fontFamily: SCHRIFT,
                            fontWeight: 500,
                            fontSize: 15,
                            letterSpacing: "-0.03em",
                            lineHeight: 1,
                            color: an ? TINTE : "rgba(245,243,239,0.72)",
                            transition: `color 0.45s ${KURVE}`,
                            WebkitTapHighlightColor: "transparent",
                        }}
                    >
                        {e.text}
                        <span style={{ fontSize: 10, letterSpacing: "0.04em", opacity: an ? 0.55 : 0.45, marginTop: -2, fontVariantNumeric: "tabular-nums" }}>
                            {String(e.n).padStart(2, "0")}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

// ---------- Hülle ----------

/**
 * Arbeitsraster
 *
 * @framerIntrinsicWidth 1240
 * @framerIntrinsicHeight 900
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Arbeitsraster(props: ArbeitsrasterProps) {
    const { kampagnen, start = "websites", beispielHinweis = true, knopfFarbe = "rgb(255, 90, 31)", radius = 10, style } = props
    const [ansicht, setAnsicht] = useState<"websites" | "kampagnen">(start === "kampagnen" ? "kampagnen" : "websites")
    const reduziert = useReducedMotion() ?? false
    const huelle = useRef<HTMLDivElement>(null)
    const [mass, setMass] = useState({ b: 1240, h: 900 })
    const [touch, setTouch] = useState(false)

    useEffect(() => {
        const el = huelle.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => setMass({ b: el.clientWidth || 1240, h: el.clientHeight || 900 }))
        ro.observe(el)
        setMass({ b: el.clientWidth || 1240, h: el.clientHeight || 900 })
        if (typeof window !== "undefined" && window.matchMedia) setTouch(window.matchMedia("(hover: none)").matches)
        return () => ro.disconnect()
    }, [])

    const quelle = kampagnen && kampagnen.length > 0 ? kampagnen : KAMPAGNEN
    const liste: Kampagne[] = quelle.map((k, i) => {
        const s = KAMPAGNEN[i % KAMPAGNEN.length]
        return {
            ...s,
            ...Object.fromEntries(Object.entries(k || {}).filter(([, v]) => v !== undefined && v !== "" && !(typeof v === "object" && !(v as Bild).src))),
        } as Kampagne
    })
    const anzahlWebsites = props.arbeiten && props.arbeiten.length > 0 ? props.arbeiten.length : STANDARD.length
    const schmal = mass.b < 700
    const kopf = 72
    const flaeche = Math.max(300, mass.h - kopf)
    const t = reduziert ? "0s" : "0.75s"

    const ebene = (an: boolean): CSSProperties => ({
        position: schmal ? "relative" : "absolute",
        inset: schmal ? undefined : 0,
        display: schmal && !an ? "none" : "block",
        opacity: an ? 1 : 0,
        transform: an ? "translateY(0px) scale(1)" : "translateY(18px) scale(0.985)",
        filter: an ? "blur(0px)" : "blur(8px)",
        pointerEvents: an ? "auto" : "none",
        transition: `opacity ${t} ${KURVE}, transform ${t} ${KURVE}, filter ${t} ${KURVE}`,
    })

    return (
        <div ref={huelle} style={{ ...style, position: "relative", width: "100%", height: schmal ? "auto" : "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ height: kopf, flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
                <Schalter wert={ansicht} setWert={setAnsicht} anzahl={[anzahlWebsites, liste.length]} reduziert={reduziert} />
            </div>
            <div style={{ position: "relative", width: "100%", height: schmal ? "auto" : flaeche }}>
                <div style={ebene(ansicht === "websites")} aria-hidden={ansicht !== "websites"}>
                    <Raster {...props} style={undefined} />
                </div>
                <div style={ebene(ansicht === "kampagnen")} aria-hidden={ansicht !== "kampagnen"}>
                    <KampagnenAnsicht
                        liste={liste}
                        breite={mass.b}
                        hoehe={schmal ? 620 : flaeche}
                        aktivAnsicht={ansicht === "kampagnen"}
                        radius={radius}
                        akzent={knopfFarbe}
                        beispiel={beispielHinweis}
                        reduziert={reduziert}
                        touch={touch}
                    />
                </div>
            </div>
        </div>
    )
}

addPropertyControls(Arbeitsraster, {
    arbeiten: {
        type: ControlType.Array,
        title: "Arbeiten",
        maxCount: 12,
        control: {
            type: ControlType.Object,
            controls: {
                titel: { type: ControlType.String, title: "Titel", defaultValue: "Projekt" },
                ort: { type: ControlType.String, title: "Zeile", defaultValue: "" },
                link: { type: ControlType.Link, title: "Link" },
                bild: { type: ControlType.ResponsiveImage, title: "Bild" },
            },
        },
        defaultValue: STANDARD.map((a) => ({ titel: a.titel, ort: a.ort })),
    },
    kampagnen: {
        type: ControlType.Array,
        title: "Kampagnen",
        maxCount: 6,
        control: {
            type: ControlType.Object,
            controls: {
                kunde: { type: ControlType.String, title: "Kunde", defaultValue: "Kunde" },
                art: { type: ControlType.String, title: "Art", defaultValue: "" },
                logo: { type: ControlType.ResponsiveImage, title: "Logo" },
                motiv: { type: ControlType.ResponsiveImage, title: "Motiv" },
                schlagzeile: { type: ControlType.String, title: "Schlagzeile", defaultValue: "" },
                knopf: { type: ControlType.String, title: "Knopf", defaultValue: "" },
                zahl1: { type: ControlType.String, title: "Zahl 1", defaultValue: "" },
                text1: { type: ControlType.String, title: "Text 1", defaultValue: "" },
                zahl2: { type: ControlType.String, title: "Zahl 2", defaultValue: "" },
                text2: { type: ControlType.String, title: "Text 2", defaultValue: "" },
                zahl3: { type: ControlType.String, title: "Zahl 3", defaultValue: "" },
                text3: { type: ControlType.String, title: "Text 3", defaultValue: "" },
            },
        },
        defaultValue: KAMPAGNEN.map((k) => ({ kunde: k.kunde })),
    },
    start: { type: ControlType.Enum, title: "Start", options: ["websites", "kampagnen"], optionTitles: ["Websites", "Kampagnen"], defaultValue: "websites", displaySegmentedControl: true },
    beispielHinweis: { type: ControlType.Boolean, title: "Beispiel-Hinweis", defaultValue: true },
    spalten: { type: ControlType.Number, title: "Spalten", defaultValue: 3, min: 1, max: 4, step: 1, displayStepper: true },
    abstand: { type: ControlType.Number, title: "Abstand", defaultValue: 4, min: 0, max: 40, step: 1, unit: "px" },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 10, min: 0, max: 40, step: 1, unit: "px" },
    wachstum: { type: ControlType.Number, title: "Wachstum", defaultValue: 2, min: 1, max: 4, step: 0.1 },
    reihenAnteil: { type: ControlType.Number, title: "Reihenanteil", defaultValue: 0.64, min: 0.5, max: 0.85, step: 0.01 },
    titelFarbe: { type: ControlType.Color, title: "Titelfarbe", defaultValue: "rgb(245, 243, 239)" },
    knopfFarbe: { type: ControlType.Color, title: "Knopffarbe", defaultValue: "rgb(255, 90, 31)" },
    bildPosition: { type: ControlType.Enum, title: "Bildausschnitt", options: ["top", "center"], optionTitles: ["Oben", "Mitte"], defaultValue: "top", displaySegmentedControl: true },
})
