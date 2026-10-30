import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useInView, useReducedMotion, useMotionValue } from "framer-motion"
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

// Leistungsbühne — die drei Leistungen als Karten mit gezeichneten Szenen statt Stockfotos.
// Performance (groß, dunkel): Anzeigen-Stapel, der sich selbst durchblättert, dazu Kennzahlen.
// Websites (hell): echte Kundenseiten im Browser- und Handyrahmen, die langsam durchscrollen.
// Content (breit, flach): Filmstreifen mit Hochformat-Clips, der durchläuft.
// Alle Karten sind ganz klickbar und führen zur Leistungsseite. Werte in den Anzeigen sind
// Beispielwerte mit Beispielfirmen (markiert).

interface Leistung {
    marke: string
    titel: string
    text: string
    punkte: string
    link: string
    linkText: string
}

interface LeistungsbuehneProps {
    werbung: Leistung
    website: Leistung
    fotos: Leistung
    akzent: string
    beispielHinweis: boolean
    style?: CSSProperties
}

const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const PAPIER = "rgb(245, 243, 239)"
const TINTE = "rgb(14, 15, 18)"
const FLAECHE = "rgb(42, 42, 42)"
const GRAU = "rgb(53, 53, 53)" // Markengrau für dunkle Flächen (ersetzt Tinte als Fläche)
const HELL = "rgb(255, 255, 255)"
const SAND = "rgb(236, 233, 227)"
const KURVE = [0.22, 1, 0.36, 1] as const
const U = (id: string, w = 420) => `https://images.unsplash.com/${id}?crop=entropy&cs=srgb&fm=webp&ixlib=rb-4.1.0&q=70&w=${w}`

// Standbilder aus unseren eigenen Filmen (in Framer hochgeladen, 14.10.2026).
const ANZEIGE_WAV = "https://framerusercontent.com/images/YE5Wug2D69nh6vuSislY7xg21WA.jpg?scale-down-to=512"

const FILME = {
    wandscher: "https://framerusercontent.com/images/dLNwhTwthfhClRZXYh9ssRHb1I.jpg",
    patioBar: "https://framerusercontent.com/images/KFJhvU35SUv2NX4xlvJlXphlJh0.jpg?scale-down-to=1024",
    patioQuer: "https://framerusercontent.com/images/87Grnj77YGDMWb5slw77CWmG08o.jpg?scale-down-to=1024",
    thieme: "https://framerusercontent.com/images/taX1EdxFi6dzoDKEvtwkevkXCQk.jpg?scale-down-to=1024",
    zwillis: "https://framerusercontent.com/images/zdq7SpKfJOcu50ewz7gUrN2XbuY.jpg?scale-down-to=1024",
    euleLucid: "https://framerusercontent.com/images/1KzinGOD1FyMKn9hTGn8DiBrvqk.jpg?scale-down-to=1024",
    euleLeffers: "https://framerusercontent.com/images/cIBe4JyRXLPKr8m6nYqR29qmM4.jpg",
}

// Zwei Aufnahmen aus einer eigenen Fahrzeugproduktion. Sie laufen im Streifen als Fotos mit:
// kein Abspielknopf, keine Laufzeit — die Karte zeigt Fotos UND Videos.
const AUTOS = {
    halle: "https://framerusercontent.com/images/91BbbmW8PCYP80f0lJlQ3dKuIeI.jpg?scale-down-to=1024",
    heck: "https://framerusercontent.com/images/sTxvHfMH8fXNnysQwdSPhnjKcak.jpg?scale-down-to=1024",
}

const BILDER = {
    wav: "https://framerusercontent.com/images/ArC0EnCXXAPEbwWsXDR5b7YS2eg.webp?scale-down-to=1024",
    glanzwerk: "https://framerusercontent.com/images/D5H2GC4EWAAp7sGmDPH80jVOXB4.webp?scale-down-to=1024",
    // Handy-Ansicht von steinmetz-wandscher.de (echtes Kundenprojekt, Stand 14.10.2026).
    // Bewusst die Handy-Fassung: Die Karte verspricht "Fürs Handy gebaut", ein hineingequetschtes
    // Desktop-Layout im Telefonrahmen wäre das Gegenteil des Versprechens.
    wandscher: "https://framerusercontent.com/images/0FBtQOHljxrUb6isSeWD4GvBo.jpg?scale-down-to=1024",
}

// Bilder erst laden, wenn die Bühne näherkommt. CSS-Hintergründe lädt der Browser sonst sofort beim
// Seitenaufbau – PageSpeed rechnet alles, was vor dem ersten Inhalt startet, in den LCP ein.
// Schalter, ab wann Bilder geladen werden. Innerhalb der Leistungsbühne setzt ihn der
// Sichtbarkeits-Beobachter; andere Bausteine (Szenenkarte) müssen ihn selbst setzen.
export const BilderAn = createContext(false)
const LEER = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
const PLATZHALTER = "rgba(127,127,127,0.14)"
function useHintergrund(url: string): string {
    return useContext(BilderAn) ? `url(${url}) center/cover` : PLATZHALTER
}

const STANDARD: Record<"performance" | "websites" | "content", Leistung> = {
    performance: {
        marke: "Online-Werbung",
        titel: "Werbung, die Kunden bringt",
        text: "Anzeigen bei Google, Facebook und Instagram — für Anfragen, Termine oder neue Mitarbeiter.",
        punkte: "Google-Anzeigen · Facebook & Instagram · Mitarbeiter finden · Monatsbericht",
        link: "/leistungen/performance-marketing",
        linkText: "Mehr zur Online-Werbung",
    },
    websites: {
        marke: "Websites",
        titel: "Eine Website, die Anfragen bringt",
        text: "Modern, schnell und fürs Handy gebaut. Ihre Kunden finden Sie bei Google, verstehen sofort, was Sie anbieten — und melden sich.",
        punkte: "Webdesign · Bei Google gefunden werden · Fürs Handy gebaut · Pflege",
        link: "/leistungen/websites",
        linkText: "Mehr zu Websites",
    },
    content: {
        marke: "Fotos & Videos",
        titel: "Echte Bilder aus Ihrem Betrieb",
        text: "Wir kommen zu Ihnen und machen Fotos und Videos — für Ihre Website, Ihre Anzeigen und Social Media. Keine Stockfotos, die jeder schon kennt.",
        punkte: "Fotos · Videos & Reels · Social Media · Motive für Anzeigen",
        link: "/leistungen/content",
        linkText: "Mehr zu Fotos & Videos",
    },
}

function mitStandard(l: Partial<Leistung> | undefined, s: Leistung): Leistung {
    const o: any = { ...s }
    if (l) for (const k of Object.keys(s)) if ((l as any)[k]) o[k] = (l as any)[k]
    return o
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

function Pfeil(props: { farbe: string; aktiv: boolean }) {
    return (
        <span style={{ position: "relative", display: "inline-block", width: 34, height: 12, overflow: "hidden" }}>
            {[0, 1].map((k) => (
                <motion.svg
                    key={k}
                    width={34}
                    height={12}
                    viewBox="0 0 34 12"
                    fill="none"
                    style={{ position: "absolute", left: 0, top: 0 }}
                    initial={false}
                    animate={{ x: props.aktiv ? (k === 0 ? 40 : 0) : k === 0 ? 0 : -40 }}
                    transition={{ duration: 0.55, ease: KURVE }}
                >
                    <path d="M0 6h32M27 1l5 5-5 5" stroke={props.farbe} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
            ))}
        </span>
    )
}

function Beispiel(props: { hell?: boolean }) {
    return (
        <span
            style={{
                position: "absolute",
                right: 12,
                top: 12,
                zIndex: 5,
                fontSize: 9.5,
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: props.hell ? "rgba(14,15,18,0.4)" : "rgba(245,243,239,0.38)",
            }}
        >
            Beispiel
        </span>
    )
}

// ---------- Szene 1: Anzeigen-Stapel ----------

function GoogleKarte() {
    return (
        <div style={{ width: "100%", height: "100%", background: HELL, color: TINTE, padding: "14px 14px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 999, border: "1px solid rgba(14,15,18,0.1)", fontSize: 11, color: "rgba(14,15,18,0.7)" }}>
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                    <circle cx={11} cy={11} r={7} stroke="rgba(14,15,18,0.5)" strokeWidth={2.4} />
                    <path d="M16.5 16.5L21 21" stroke="rgba(14,15,18,0.5)" strokeWidth={2.4} strokeLinecap="round" />
                </svg>
                werkstatt westerstede
            </div>
            <div style={{ display: "grid", gap: 3, marginTop: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 600 }}>Gesponsert</span>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 18, background: "rgb(238,236,232)", display: "grid", placeItems: "center", fontSize: 8, fontWeight: 700 }}>W</span>
                    <div style={{ display: "grid", lineHeight: 1.15 }}>
                        <span style={{ fontSize: 10.5 }}>WAV Westerstede</span>
                        <span style={{ fontSize: 9.5, color: "rgba(14,15,18,0.55)" }}>wav-wst.de</span>
                    </div>
                </div>
                <span style={{ fontSize: 14, lineHeight: 1.25, color: "rgb(26, 13, 171)", letterSpacing: "-0.01em", marginTop: 3 }}>WAV Westerstede — Alles für Dein Auto. Aus einer Hand.</span>
                <span style={{ fontSize: 10.5, lineHeight: 1.45, color: "rgba(14,15,18,0.7)" }}>Freie Kfz-Werkstatt im Ammerland: Inspektion, Reparatur, Steinschlag und Autoglas. Für alle Marken.</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: "auto" }}>
                {["Termin anfragen", "Leistungen", "Steinschlag & Autoglas", "Karriere"].map((t) => (
                    <span key={t} style={{ fontSize: 10.5, color: "rgb(26, 13, 171)", padding: "7px 9px", borderRadius: 8, background: "rgb(245,244,241)" }}>
                        {t}
                    </span>
                ))}
            </div>
        </div>
    )
}

function StoryKarte(props: { akzent: string }) {
    // Die echte Stellenanzeige, die für WAV Westerstede bei Meta lief — kein Nachbau.
    return (
        <div style={{ position: "relative", width: "100%", height: "100%", background: TINTE, overflow: "hidden" }}>
            <img
                src={ANZEIGE_WAV}
                alt="Stellenanzeige für WAV Westerstede: Kfz-Mechatroniker in Vollzeit, Bewerbung in zwei Minuten"
                loading="lazy"
                decoding="async"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
        </div>
    )
}

export function Anzeigenstapel(props: { akzent: string; aktiv: boolean; los: boolean; schmal: boolean; statisch: boolean }) {
    const { akzent, aktiv, los, schmal, statisch } = props
    const reduziert = useReducedMotion()
    const karten = [<GoogleKarte key="g" />, <StoryKarte key="s" akzent={akzent} />]
    const [vorn, setVorn] = useState(0)
    useEffect(() => {
        if (statisch || reduziert || !los) return
        const t = window.setInterval(() => setVorn((v) => (v + 1) % karten.length), aktiv ? 1700 : 3400)
        return () => window.clearInterval(t)
    }, [statisch, reduziert, los, aktiv])

    // Belegte Zahlen aus dem Google-Ads-Konto von WAV Westerstede, 19.05.–12.10.2026.
    const kpis = [
        { l: "Kontaktaufnahmen", w: "439", d: "in fünf Monaten" },
        { l: "Kosten je Kontakt", w: "5,30 €", d: "Google Ads" },
        { l: "Werbebudget", w: "2.328 €", d: "gesamt" },
    ]
    const kb = schmal ? 196 : 228
    const kh = schmal ? 262 : 300
    return (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: schmal ? "center" : "space-between", padding: schmal ? "0 16px" : "0 30px 0 40px", boxSizing: "border-box" }}>
            <div style={{ position: "relative", width: kb + 40, height: kh + 26, flexShrink: 0 }}>
                {karten.map((k, i) => {
                    const pos = (i - vorn + karten.length) % karten.length
                    return (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{
                                x: pos * 20,
                                y: pos * -13,
                                scale: 1 - pos * 0.06,
                                rotate: pos === 0 ? -2 : pos * 3,
                                opacity: pos === 2 ? 0.55 : 1,
                                filter: `blur(${pos * 0.6}px) brightness(${1 - pos * 0.18})`,
                            }}
                            transition={{ duration: 0.8, ease: KURVE }}
                            style={{
                                position: "absolute",
                                left: 0,
                                bottom: 0,
                                width: kb,
                                height: kh,
                                borderRadius: 14,
                                overflow: "hidden",
                                zIndex: 10 - pos,
                                transformOrigin: "50% 100%",
                                boxShadow: "0 30px 50px -24px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
                            }}
                        >
                            {k}
                        </motion.div>
                    )
                })}
            </div>
            {!schmal && (
                <div style={{ display: "grid", gap: 10, width: 196 }}>
                    {kpis.map((k, i) => (
                        <motion.div
                            key={k.l}
                            initial={statisch ? false : { opacity: 0, x: 24 }}
                            animate={los ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.9, ease: KURVE, delay: 0.3 + i * 0.12 }}
                            style={{
                                padding: "13px 15px",
                                borderRadius: 12,
                                background: "rgba(245,243,239,0.045)",
                                border: "1px solid rgba(245,243,239,0.08)",
                                backdropFilter: "blur(8px)",
                                display: "grid",
                                gap: 4,
                            }}
                        >
                            <span style={{ fontSize: 10.5, color: "rgba(245,243,239,0.5)", letterSpacing: "0.01em" }}>{k.l}</span>
                            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                                <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.045em", color: PAPIER, fontVariantNumeric: "tabular-nums" }}>{k.w}</span>
                                <span style={{ fontSize: 10.5, fontWeight: 500, color: akzent }}>{k.d}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ---------- Szene 2: echte Seiten im Browser + Handy ----------

function Rolle(props: { bild: string; alt: string; hoehe: number; dauer: number; laeuft: boolean; statisch: boolean }) {
    const { bild, alt, hoehe, dauer, laeuft, statisch } = props
    const reduziert = useReducedMotion()
    const bilderAn = useContext(BilderAn)
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <motion.img
                src={bilderAn || statisch ? bild : LEER}
                alt={alt}
                draggable={false}
                loading="lazy"
                style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "auto", display: "block" }}
                initial={false}
                animate={statisch || reduziert || !laeuft ? { y: 0 } : { y: [0, -hoehe, 0] }}
                transition={statisch || reduziert || !laeuft ? { duration: 0.8, ease: KURVE } : { duration: dauer, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
            />
        </div>
    )
}

export function Seitenschau(props: { aktiv: boolean; los: boolean; schmal: boolean; statisch: boolean; akzent: string }) {
    const { aktiv, los, schmal, statisch, akzent } = props
    const laeuft = los
    return (
        <div style={{ position: "absolute", inset: 0 }}>
            {/* Browser */}
            <motion.div
                animate={{ y: aktiv ? -6 : 0 }}
                transition={{ duration: 0.7, ease: KURVE }}
                style={{
                    position: "absolute",
                    left: schmal ? 16 : 28,
                    right: schmal ? 56 : 84,
                    top: 26,
                    bottom: -30,
                    borderRadius: 12,
                    background: HELL,
                    boxShadow: "0 40px 60px -34px rgba(14,15,18,0.45), 0 0 0 1px rgba(14,15,18,0.07)",
                    overflow: "hidden",
                }}
            >
                <div style={{ height: 30, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", borderBottom: "1px solid rgba(14,15,18,0.07)", background: "rgb(250,249,247)" }}>
                    {["rgb(255,95,87)", "rgb(254,188,46)", "rgb(40,200,64)"].map((c) => (
                        <span key={c} style={{ width: 8, height: 8, borderRadius: 8, background: c, opacity: 0.8 }} />
                    ))}
                    <span style={{ marginLeft: 10, flex: 1, maxWidth: 220, height: 18, borderRadius: 6, background: "rgb(240,238,234)", fontSize: 9.5, color: "rgba(14,15,18,0.55)", display: "flex", alignItems: "center", padding: "0 8px", whiteSpace: "nowrap", overflow: "hidden" }}>wav-wst.de</span>
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 30, bottom: 0 }}>
                    <Rolle bild={BILDER.wav} alt="Website der Kfz-Werkstatt WAV Westerstede" hoehe={schmal ? 600 : 1000} dauer={aktiv ? 9 : 22} laeuft={laeuft} statisch={statisch} />
                </div>
            </motion.div>
            {/* Handy */}
            <motion.div
                animate={{ y: aktiv ? -14 : 0, rotate: aktiv ? -1 : 0 }}
                transition={{ duration: 0.7, ease: KURVE }}
                style={{
                    position: "absolute",
                    right: schmal ? 12 : 22,
                    bottom: schmal ? 14 : 18,
                    width: schmal ? 96 : 118,
                    height: schmal ? 196 : 240,
                    borderRadius: 20,
                    padding: 4,
                    background: "rgb(20, 20, 20)",
                    boxShadow: "0 30px 40px -20px rgba(14,15,18,0.55)",
                    zIndex: 2,
                }}
            >
                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 16, overflow: "hidden", background: HELL }}>
                    <Rolle bild={BILDER.wandscher} alt="Website des Steinmetzbetriebs Jan Wandscher auf dem Handy" hoehe={schmal ? 380 : 460} dauer={aktiv ? 8 : 18} laeuft={laeuft} statisch={statisch} />
                    <span style={{ position: "absolute", left: "50%", top: 5, width: 34, height: 9, marginLeft: -17, borderRadius: 9, background: TINTE }} />
                </div>
            </motion.div>
            {/* Merkmale — auf dem Handy nicht: dort stapeln sie sich über die Vorschau,
                und dieselben Punkte stehen als Liste in der Karte darunter. */}
            <div style={{ position: "absolute", left: 28, bottom: 20, display: schmal ? "none" : "flex", gap: 6, flexWrap: "wrap", maxWidth: 260, zIndex: 3 }}>
                {["Bei Google gefunden", "Fürs Handy gebaut", "Anfrage in zwei Klicks"].map((t, i) => (
                    <motion.span
                        key={t}
                        initial={statisch ? false : { opacity: 0, y: 10 }}
                        animate={los ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, ease: KURVE, delay: 0.25 + i * 0.1 }}
                        style={{
                            fontSize: 10.5,
                            fontWeight: 500,
                            letterSpacing: "-0.01em",
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: i === 2 ? akzent : "rgba(255,255,255,0.86)",
                            color: i === 2 ? HELL : TINTE,
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 8px 20px -12px rgba(14,15,18,0.4)",
                        }}
                    >
                        {t}
                    </motion.span>
                ))}
            </div>
        </div>
    )
}

// ---------- Szene 3: Filmstreifen ----------

export function Filmstreifen(props: { aktiv: boolean; schmal: boolean; statisch: boolean; akzent: string }) {
    const { aktiv, schmal, statisch, akzent } = props
    const reduziert = useReducedMotion()
    // Standbilder aus echten Filmen von uns, mit ihrer wirklichen Länge. Die Karte verspricht
    // "Keine Stockfotos" — dann darf hier auch keins laufen.
    const clips: { b: string; t: string; n: string; foto?: boolean }[] = [
        { b: FILME.wandscher, t: "0:53", n: "Steinmetz" },
        { b: FILME.patioBar, t: "0:34", n: "Bar" },
        { b: AUTOS.halle, t: "", n: "Sportwagen", foto: true },
        { b: FILME.thieme, t: "0:24", n: "Augenoptik" },
        { b: FILME.zwillis, t: "0:28", n: "Padel" },
        { b: AUTOS.heck, t: "", n: "Showroom", foto: true },
        { b: FILME.euleLucid, t: "0:46", n: "Club" },
        { b: FILME.euleLeffers, t: "0:47", n: "Kaufhaus" },
        { b: FILME.patioQuer, t: "0:25", n: "Gastronomie" },
    ]
    const w = schmal ? 118 : 150
    const h = Math.round((w * 16) / 9)
    const bilderAn = useContext(BilderAn)
    const gap = 10
    const reihe = [...clips, ...clips]
    const strecke = clips.length * (w + gap)
    const lauf = useMotionValue(0)
    useEffect(() => {
        if (statisch || reduziert) return
        let raf = 0
        let t0 = performance.now()
        const tempo = aktiv ? 12 : 34 // px/s
        const schritt = (t: number) => {
            const dt = Math.min(0.1, (t - t0) / 1000)
            t0 = t
            lauf.set((lauf.get() - dt * tempo) % strecke)
            raf = requestAnimationFrame(schritt)
        }
        raf = requestAnimationFrame(schritt)
        return () => cancelAnimationFrame(raf)
    }, [statisch, reduziert, aktiv, strecke])
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", display: "flex", alignItems: "center" }}>
            <motion.div style={{ display: "flex", gap, x: lauf, paddingLeft: 16 }}>
                {reihe.map((c, i) => (
                    <div key={i} style={{ position: "relative", width: w, height: h, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: bilderAn ? `url(${c.b}) center/cover` : PLATZHALTER, boxShadow: "0 20px 30px -20px rgba(0,0,0,0.6)" }}>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)" }} />
                        <span style={{ position: "absolute", left: 8, top: 8, fontSize: 9.5, fontWeight: 600, color: HELL, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.9 }}>{c.n}</span>
                        {!c.foto && <div style={{ position: "absolute", left: 8, right: 8, bottom: 9, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width={9} height={10} viewBox="0 0 9 10">
                                <path d="M0 0.8v8.4c0 .6.7 1 1.2.7l7-4.2c.5-.3.5-1.1 0-1.4l-7-4.2C.7-.2 0 .2 0 .8z" fill={HELL} />
                            </svg>
                            <span style={{ flex: 1, height: 2, borderRadius: 2, background: "rgba(255,255,255,0.3)", overflow: "hidden" }}>
                                <span style={{ display: "block", width: `${30 + ((i * 17) % 55)}%`, height: "100%", background: i % 3 === 0 ? akzent : HELL }} />
                            </span>
                            <span style={{ fontSize: 9.5, color: HELL, fontVariantNumeric: "tabular-nums" }}>{c.t}</span>
                        </div>}
                    </div>
                ))}
            </motion.div>
            {/* Aufnahme-Anzeige */}
            <div style={{ position: "absolute", right: 16, top: 14, zIndex: 2, display: "flex", alignItems: "center", gap: 7, padding: "6px 10px", borderRadius: 999, background: "rgba(14,15,18,0.62)", backdropFilter: "blur(10px)", color: HELL, fontSize: 10, fontWeight: 600, letterSpacing: "0.1em" }}>
                <motion.span
                    style={{ width: 7, height: 7, borderRadius: 7, background: akzent }}
                    animate={statisch || reduziert ? {} : { opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                />
                EIGENE PRODUKTION
            </div>
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, rgb(24,25,29) 0%, rgba(24,25,29,0) 8%, rgba(24,25,29,0) 92%, rgb(24,25,29) 100%)" }} />
        </div>
    )
}

// ---------- Karte ----------

function Karte(props: {
    l: Leistung
    nummer: string
    art: "dunkel" | "hell" | "sand"
    szene: (aktiv: boolean, los: boolean) => ReactNode
    bildHoehe: number
    quer: boolean
    akzent: string
    statisch: boolean
    verzug: number
    beispiel: boolean
    klein: boolean
    gridColumn: string
}) {
    const { l, nummer, art, szene, bildHoehe, quer, akzent, statisch, verzug, beispiel, klein, gridColumn } = props
    const ref = useRef<HTMLAnchorElement>(null)
    const imBild = useInView(ref, { once: true, amount: 0.25 })
    const los = statisch || imBild
    const [aktiv, setAktiv] = useState(false)
    const dunkel = art === "dunkel"
    const vorne = dunkel ? PAPIER : TINTE
    const grau = dunkel ? "rgba(245,243,239,0.56)" : "rgba(14,15,18,0.56)"
    const linie = dunkel ? "rgba(245,243,239,0.1)" : "rgba(14,15,18,0.09)"
    const flaeche = dunkel ? GRAU : art === "hell" ? HELL : SAND
    const buehne = dunkel ? FLAECHE : art === "hell" ? SAND : FLAECHE
    const punkte = l.punkte.split("·").map((s) => s.trim()).filter(Boolean)

    return (
        <motion.a
            ref={ref}
            href={l.link || undefined}
            onPointerEnter={() => setAktiv(true)}
            onPointerLeave={() => setAktiv(false)}
            onFocus={() => setAktiv(true)}
            onBlur={() => setAktiv(false)}
            initial={statisch ? false : { opacity: 0, y: 50 }}
            animate={los ? { opacity: 1, y: aktiv ? -4 : 0 } : {}}
            transition={{ duration: aktiv ? 0.5 : 1, ease: KURVE, delay: los && !aktiv ? verzug : 0 }}
            style={{
                gridColumn,
                position: "relative",
                display: "flex",
                flexDirection: quer ? "row" : "column",
                background: flaeche,
                color: vorne,
                borderRadius: 22,
                padding: 10,
                gap: quer ? 10 : 0,
                textDecoration: "none",
                boxShadow: dunkel ? "0 40px 80px -50px rgba(14,15,18,0.7)" : "0 30px 60px -44px rgba(14,15,18,0.35), 0 0 0 1px rgba(14,15,18,0.04)",
                cursor: "pointer",
                outline: "none",
                minWidth: 0,
            }}
        >
            <div
                style={{
                    position: "relative",
                    height: quer ? "auto" : bildHoehe,
                    minHeight: quer ? bildHoehe : undefined,
                    flex: quer ? "1 1 58%" : "0 0 auto",
                    order: quer ? 2 : 0,
                    borderRadius: 14,
                    background: buehne,
                    overflow: "hidden",
                    isolation: "isolate",
                }}
            >
                {dunkel || art === "sand" ? (
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: "linear-gradient(rgba(245,243,239,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,243,239,0.05) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />
                ) : null}
                {szene(aktiv, los)}
                {beispiel && <Beispiel hell={art === "hell"} />}
            </div>
            <div style={{ flex: quer ? "1 1 42%" : "1 1 auto", display: "flex", flexDirection: "column", gap: 14, padding: quer ? "22px 22px 18px 18px" : "26px 18px 14px", minWidth: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", color: akzent }}>{nummer}</span>
                {/* Leistungsname groß — auf einen Blick: Online-Werbung, Websites, Fotos & Videos */}
                <span role="heading" aria-level={3} style={{ fontSize: klein ? 34 : 44, fontWeight: 500, letterSpacing: "-0.05em", lineHeight: 1, marginTop: -4 }}>{l.marke}</span>
                <span style={{ fontSize: klein ? 18 : 20, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.2, maxWidth: 440, ...({ textWrap: "balance" } as any) }}>{l.titel}</span>
                <span style={{ fontSize: 15, lineHeight: 1.55, letterSpacing: "-0.015em", color: grau, maxWidth: 480 }}>{l.text}</span>
                <div style={{ flex: 1, minHeight: 6 }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {punkte.map((p) => (
                        <span key={p} style={{ fontSize: 12, fontWeight: 500, letterSpacing: "-0.01em", padding: "6px 11px", borderRadius: 999, border: `1px solid ${linie}`, color: vorne }}>
                            {p}
                        </span>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${linie}`, paddingTop: 14, marginTop: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em" }}>{l.linkText}</span>
                    <Pfeil farbe={aktiv ? akzent : vorne} aktiv={aktiv} />
                </div>
            </div>
        </motion.a>
    )
}

/**
 * Leistungsbühne
 *
 * @framerIntrinsicWidth 1176
 * @framerIntrinsicHeight 1100
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Leistungsbuehne(props: LeistungsbuehneProps) {
    const { akzent = "rgb(255, 90, 31)", beispielHinweis = true, style } = props
    const statisch = useIsStaticRenderer()
    const [ref, breite] = useBreite<HTMLDivElement>()
    const [bilderAn, setBilderAn] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el || typeof IntersectionObserver === "undefined") return setBilderAn(true)
        const io = new IntersectionObserver((e) => {
            if (e.some((x) => x.isIntersecting)) { setBilderAn(true); io.disconnect() }
        }, { rootMargin: "900px 0px" })
        io.observe(el)
        return () => io.disconnect()
    }, [])
    const perf = mitStandard(props.werbung, STANDARD.performance)
    const web = mitStandard(props.website, STANDARD.websites)
    const con = mitStandard(props.fotos, STANDARD.content)

    const gross = breite >= 1000
    const mittel = breite >= 700 && !gross
    const schmal = breite < 700

    return (
        <BilderAn.Provider value={bilderAn || statisch}>
        <div
            ref={ref}
            style={{
                ...style,
                width: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                gap: gross ? 20 : 14,
                fontFamily: SCHRIFT,
            }}
        >
            <Karte
                l={perf}
                nummer="01"
                art="dunkel"
                bildHoehe={gross ? 380 : schmal ? 330 : 360}
                quer={false}
                akzent={akzent}
                statisch={statisch}
                verzug={0}
                beispiel={false}
                klein={!gross}
                gridColumn={gross || mittel ? "span 6" : "span 12"}
                szene={(aktiv, los) => <Anzeigenstapel akzent={akzent} aktiv={aktiv} los={los} schmal={!gross || breite < 1100} statisch={statisch} />}
            />
            <Karte
                l={web}
                nummer="02"
                art="dunkel"
                bildHoehe={gross ? 380 : schmal ? 300 : 360}
                quer={false}
                akzent={akzent}
                statisch={statisch}
                verzug={0.1}
                beispiel={false}
                klein={!gross}
                gridColumn={gross || mittel ? "span 6" : "span 12"}
                szene={(aktiv, los) => <Seitenschau aktiv={aktiv} los={los} schmal={!gross} statisch={statisch} akzent={akzent} />}
            />
            <Karte
                l={con}
                nummer="03"
                art="dunkel"
                bildHoehe={gross ? 330 : schmal ? 280 : 320}
                quer={gross || mittel}
                akzent={akzent}
                statisch={statisch}
                verzug={0.15}
                beispiel={false}
                klein={!gross}
                gridColumn="span 12"
                szene={(aktiv) => <Filmstreifen aktiv={aktiv} schmal={!gross} statisch={statisch} akzent={akzent} />}
            />
        </div>
        </BilderAn.Provider>
    )
}

const leistungControls = (s: Leistung) => ({
    type: ControlType.Object,
    controls: {
        marke: { type: ControlType.String, title: "Marke", defaultValue: s.marke },
        titel: { type: ControlType.String, title: "Titel", defaultValue: s.titel },
        text: { type: ControlType.String, title: "Text", displayTextArea: true, defaultValue: s.text },
        punkte: { type: ControlType.String, title: "Punkte", defaultValue: s.punkte, description: "Mit · trennen" },
        link: { type: ControlType.Link, title: "Link", defaultValue: s.link },
        linkText: { type: ControlType.String, title: "Linktext", defaultValue: s.linkText },
    },
})

addPropertyControls(Leistungsbuehne, {
    werbung: { ...leistungControls(STANDARD.performance), title: "Werbung" } as any,
    website: { ...leistungControls(STANDARD.websites), title: "Website" } as any,
    fotos: { ...leistungControls(STANDARD.content), title: "Fotos & Videos" } as any,
    akzent: { type: ControlType.Color, title: "Akzent", defaultValue: "rgb(255, 90, 31)" },
    beispielHinweis: { type: ControlType.Boolean, title: "Beispiel-Hinweis", defaultValue: true },
})
