import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, AnimatePresence, LayoutGroup, useInView, useReducedMotion } from "framer-motion"
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react"

// Arbeitsschau — Schaufenster aus Performance-, Website- und Content-Elementen in einem
// Bento-Raster mit Filter. Performance ist der Schwerpunkt: Cockpit mit Wochenkurve,
// Meta-Anzeige, Google-Suchergebnis, Trichter, Kosten je Anfrage, Recruiting.
// Die Performance-Kacheln zeigen Beispielwerte und Beispielfirmen (markiert).

type Art = "performance" | "websites" | "content"
type Filter = "alle" | Art

interface ArbeitsschauProps {
    start: Filter
    beispielHinweis: boolean
    akzent: string
    style?: CSSProperties
}

const KURVE = [0.22, 1, 0.36, 1] as const
const CSSKURVE = "cubic-bezier(0.22, 1, 0.36, 1)"
const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const PAPIER = "rgb(245, 243, 239)"
const TINTE = "rgb(14, 15, 18)"
const FLAECHE = "rgb(42, 42, 42)"
const LINIE = "rgba(245, 243, 239, 0.08)"
const GRAU = "rgba(245, 243, 239, 0.52)"
const BILD = (id: string, w = 560) => `https://images.unsplash.com/${id}?crop=entropy&cs=srgb&fm=webp&ixlib=rb-4.1.0&q=70&w=${w}`

// ---------- Hilfen ----------

function zahl(n: number, stellen = 0) {
    return n.toLocaleString("de-DE", { minimumFractionDigits: stellen, maximumFractionDigits: stellen })
}

function Zaehler(props: { bis: number; stellen?: number; vor?: string; nach?: string; los: boolean; dauer?: number; verzug?: number }) {
    const { bis, stellen = 0, vor = "", nach = "", los, dauer = 1.6, verzug = 0 } = props
    const reduziert = useReducedMotion()
    const [wert, setWert] = useState(reduziert ? bis : 0)
    useEffect(() => {
        if (reduziert) return setWert(bis)
        if (!los) return
        let raf = 0
        const beginn = performance.now() + verzug * 1000
        const schritt = (t: number) => {
            const p = Math.min(1, Math.max(0, (t - beginn) / (dauer * 1000)))
            setWert(bis * (1 - Math.pow(1 - p, 4)))
            if (p < 1) raf = requestAnimationFrame(schritt)
        }
        raf = requestAnimationFrame(schritt)
        return () => cancelAnimationFrame(raf)
    }, [los, bis, reduziert])
    return (
        <>
            {vor}
            {zahl(wert, stellen)}
            {nach}
        </>
    )
}

// glatte Kurve durch Punkte (Catmull-Rom → Bézier)
function kurve(p: [number, number][]) {
    if (p.length < 2) return ""
    let d = `M ${p[0][0]} ${p[0][1]}`
    for (let i = 0; i < p.length - 1; i++) {
        const a = p[i - 1] || p[i]
        const b = p[i]
        const c = p[i + 1]
        const e = p[i + 2] || c
        const t = 0.18
        d += ` C ${b[0] + (c[0] - a[0]) * t} ${b[1] + (c[1] - a[1]) * t}, ${c[0] - (e[0] - b[0]) * t} ${c[1] - (e[1] - b[1]) * t}, ${c[0]} ${c[1]}`
    }
    return d
}

function useMass<T extends HTMLElement>() {
    const ref = useRef<T>(null)
    const [m, setM] = useState({ b: 0, h: 0 })
    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => setM({ b: el.clientWidth, h: el.clientHeight }))
        ro.observe(el)
        setM({ b: el.clientWidth, h: el.clientHeight })
        return () => ro.disconnect()
    }, [])
    return [ref, m] as const
}

const text = (s: number, farbe = PAPIER, gewicht = 500, extra: CSSProperties = {}): CSSProperties => ({
    fontFamily: SCHRIFT,
    fontWeight: gewicht,
    fontSize: s,
    letterSpacing: s >= 20 ? "-0.045em" : s >= 14 ? "-0.02em" : "0.02em",
    lineHeight: s >= 20 ? 1.05 : 1.35,
    color: farbe,
    margin: 0,
    ...extra,
})
const etikett: CSSProperties = { ...text(10.5, GRAU), letterSpacing: "0.14em", textTransform: "uppercase" }

// ---------- Kachel-Hülle ----------

function Kopf(props: { art: Art; titel: string; firma: string; beispiel: boolean; akzent: string; hell?: boolean }) {
    const { art, titel, firma, beispiel, akzent, hell } = props
    const farbe = art === "performance" ? akzent : art === "websites" ? "rgb(140, 170, 255)" : "rgb(120, 214, 170)"
    const name = art === "performance" ? "Werbung" : art === "websites" ? "Website" : "Fotos & Videos"
    return (
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                <span style={{ ...etikett, display: "inline-flex", alignItems: "center", gap: 7, color: hell ? "rgba(245,243,239,0.8)" : GRAU }}>
                    <span style={{ width: 6, height: 6, borderRadius: 9, background: farbe, boxShadow: `0 0 12px ${farbe}` }} />
                    {name}
                </span>
                <span style={{ ...text(17, PAPIER), lineHeight: 1.2, ...(hell ? { textShadow: "0 1px 10px rgba(0,0,0,0.6)" } : {}), ...({ textWrap: "balance" } as any) }}>{titel}</span>
                <span style={{ ...text(12.5, hell ? "rgba(245,243,239,0.85)" : GRAU), lineHeight: 1.4, maxWidth: 420, ...(hell ? { textShadow: "0 1px 8px rgba(0,0,0,0.55)" } : {}) }}>{firma}</span>
            </div>
            {beispiel ? (
                <span style={{ ...etikett, fontSize: 9, padding: "5px 8px", borderRadius: 99, border: `1px solid ${LINIE}`, color: "rgba(245,243,239,0.4)", whiteSpace: "nowrap" }}>Beispiel</span>
            ) : null}
        </div>
    )
}

// ---------- Performance: Cockpit ----------

const WOCHEN_STD = ["KW 27", "KW 28", "KW 29", "KW 30", "KW 31", "KW 32", "KW 33", "KW 34", "KW 35", "KW 36", "KW 37", "KW 38"]
const ANFRAGEN_STD = [5, 7, 6, 9, 11, 10, 13, 15, 14, 17, 19, 22]
const KOSTEN_STD = [44, 38, 40, 31, 27, 29, 23, 21, 22, 19, 17, 15.4]

export interface KpiDaten { l: string; w: number; s?: number; n?: string; d: string }
export function Cockpit(props: { los: boolean; akzent: string; beispiel: boolean; schmal: boolean; titel?: string; firma?: string; kpis?: KpiDaten[]; anfragen?: number[]; kosten?: number[]; wochen?: string[] }) {
    const { los, akzent, beispiel, schmal } = props
    const ANFRAGEN = props.anfragen ?? ANFRAGEN_STD
    const KOSTEN = props.kosten ?? KOSTEN_STD
    const WOCHEN = props.wochen ?? WOCHEN_STD
    const [ref, m] = useMass<HTMLDivElement>()
    const [zeiger, setZeiger] = useState<number | null>(null)
    const b = Math.max(10, m.b)
    const h = Math.max(10, m.h)
    const oben = 14
    const unten = 26
    const maxA = Math.max(...ANFRAGEN) * 1.1
    const maxK = Math.max(...KOSTEN) * 1.15
    const pts = ANFRAGEN.map((v, i): [number, number] => [(i / (ANFRAGEN.length - 1)) * b, oben + (1 - v / maxA) * (h - oben - unten)])
    const ptsK = KOSTEN.map((v, i): [number, number] => [(i / (KOSTEN.length - 1)) * b, oben + (1 - v / maxK) * (h - oben - unten)])
    const linie = kurve(pts)
    const flaeche = `${linie} L ${b} ${h - unten} L 0 ${h - unten} Z`
    const kpis: KpiDaten[] = props.kpis ?? [
        { l: "Anfragen", w: 148, n: "", d: "+64 %" },
        { l: "Kosten je Anfrage", w: 18.4, s: 2, n: " €", d: "−41 %" },
        { l: "Werbebudget", w: 2720, n: " €", d: "12 Wochen" },
        { l: "Aufträge", w: 43, n: "", d: "29 % Abschluss" },
    ]
    const gid = "ck" + akzent.replace(/\D/g, "")
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>
            <Kopf art="performance" titel={props.titel ?? "Ihr Monatsbericht auf einen Blick"} firma={props.firma ?? "Werkstatt Harms: Die Anfragen pro Woche steigen, die Kosten pro Anfrage sinken."} beispiel={beispiel} akzent={akzent} />
            <div style={{ display: "grid", gridTemplateColumns: schmal ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10 }}>
                {kpis.map((k, i) => (
                    <div key={i} style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(245,243,239,0.035)", boxShadow: `inset 0 0 0 1px ${LINIE}` }}>
                        <div style={{ ...etikett, fontSize: 9.5 }}>{k.l}</div>
                        <div style={{ ...text(schmal ? 22 : 26), marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
                            <Zaehler bis={k.w} stellen={k.s || 0} nach={k.n} los={los} verzug={0.1 * i} />
                        </div>
                        <div style={{ ...text(11.5, i < 2 ? akzent : GRAU), marginTop: 4 }}>{k.d}</div>
                    </div>
                ))}
            </div>
            <div
                ref={ref}
                onPointerMove={(e) => {
                    const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                    const i = Math.round(((e.clientX - r.left) / r.width) * (ANFRAGEN.length - 1))
                    setZeiger(Math.max(0, Math.min(ANFRAGEN.length - 1, i)))
                }}
                onPointerLeave={() => setZeiger(null)}
                style={{ position: "relative", flex: 1, minHeight: 150, cursor: "crosshair" }}
            >
                {m.b > 0 ? (
                    <svg width={b} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                        <defs>
                            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={akzent} stopOpacity="0.32" />
                                <stop offset="100%" stopColor={akzent} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
                            <line key={i} x1={0} x2={b} y1={oben + f * (h - oben - unten)} y2={oben + f * (h - oben - unten)} stroke={LINIE} strokeDasharray={i === 4 ? "0" : "2 5"} />
                        ))}
                        <motion.path d={flaeche} fill={`url(#${gid})`} initial={{ opacity: 0 }} animate={{ opacity: los ? 1 : 0 }} transition={{ duration: 1.2, delay: 0.9 }} />
                        <motion.path d={kurve(ptsK)} fill="none" stroke="rgba(245,243,239,0.45)" strokeWidth={1.4} strokeDasharray="4 5" initial={{ pathLength: 0 }} animate={{ pathLength: los ? 1 : 0 }} transition={{ duration: 1.8, ease: KURVE, delay: 0.3 }} />
                        <motion.path d={linie} fill="none" stroke={akzent} strokeWidth={2.4} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: los ? 1 : 0 }} transition={{ duration: 1.8, ease: KURVE }} />
                        {WOCHEN.map((w, i) =>
                            i % (schmal ? 3 : 2) === 0 ? (
                                <text key={w} x={pts[i][0]} y={h - 6} textAnchor={i === 0 ? "start" : "middle"} style={{ fontFamily: SCHRIFT, fontSize: 10, fill: "rgba(245,243,239,0.4)" }}>
                                    {w}
                                </text>
                            ) : null
                        )}
                        {zeiger !== null ? (
                            <g>
                                <line x1={pts[zeiger][0]} x2={pts[zeiger][0]} y1={oben} y2={h - unten} stroke="rgba(245,243,239,0.25)" />
                                <circle cx={pts[zeiger][0]} cy={pts[zeiger][1]} r={5} fill={TINTE} stroke={akzent} strokeWidth={2} />
                                <circle cx={ptsK[zeiger][0]} cy={ptsK[zeiger][1]} r={3.5} fill={PAPIER} />
                            </g>
                        ) : (
                            <motion.circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={5} fill={akzent} initial={{ scale: 0 }} animate={{ scale: los ? [1, 1.6, 1] : 0 }} transition={{ duration: 2, repeat: Infinity, delay: 1.8 }} />
                        )}
                    </svg>
                ) : null}
                {zeiger !== null ? (
                    <div
                        style={{
                            position: "absolute",
                            left: Math.min(Math.max(0, pts[zeiger][0] - 70), b - 150),
                            top: -6,
                            width: 150,
                            padding: "9px 11px",
                            borderRadius: 10,
                            background: "rgba(14,15,18,0.86)",
                            backdropFilter: "blur(10px)",
                            boxShadow: `inset 0 0 0 1px ${LINIE}, 0 12px 30px rgba(0,0,0,0.4)`,
                            pointerEvents: "none",
                        }}
                    >
                        <div style={{ ...etikett, fontSize: 9 }}>{WOCHEN[zeiger]}</div>
                        <div style={{ ...text(13), marginTop: 6, display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: akzent }}>Anfragen</span>
                            <span>{ANFRAGEN[zeiger]}</span>
                        </div>
                        <div style={{ ...text(13), marginTop: 3, display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: GRAU }}>€ je Anfrage</span>
                            <span>{zahl(KOSTEN[zeiger], 2)}</span>
                        </div>
                    </div>
                ) : null}
                <div style={{ position: "absolute", right: 0, top: -2, display: "flex", gap: 14 }}>
                    <span style={{ ...text(11, GRAU), display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 14, height: 2, background: akzent, borderRadius: 2 }} />
                        Anfragen / Woche
                    </span>
                    <span style={{ ...text(11, GRAU), display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 14, height: 0, borderTop: "2px dashed rgba(245,243,239,0.5)" }} />€ je Anfrage
                    </span>
                </div>
            </div>
        </div>
    )
}

// ---------- Performance: Meta-Anzeige ----------
// Nachbau einer Instagram-Anzeige im Feed, nicht als Story: Kopfzeile mit Profilbild, Name und
// „Gesponsert", darunter das Motiv im Hochformat 4:5, der Handlungsbalken über die volle Breite,
// die Aktionsleiste und der Bildtext. Die alte Fassung war ein Handy-Rahmen mit Knopf im Bild —
// das sieht niemand als Instagram-Anzeige.

function IGIcon(props: { art: "herz" | "kommentar" | "senden" | "merken"; farbe: string }) {
    const { art, farbe } = props
    const gemein = { fill: "none", stroke: farbe, strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
    if (art === "herz")
        return (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 20.5C12 20.5 2.8 15.2 2.8 8.9A4.9 4.9 0 0 1 12 6.4a4.9 4.9 0 0 1 9.2 2.5c0 6.3-9.2 11.6-9.2 11.6Z" {...gemein} />
            </svg>
        )
    if (art === "kommentar")
        return (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 11.6a8.4 8.4 0 0 1-12.3 7.5L3.2 20.8l1.7-5.4A8.4 8.4 0 1 1 21 11.6Z" {...gemein} />
            </svg>
        )
    if (art === "senden")
        return (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21.4 2.6 10.6 13.4M21.4 2.6l-6.9 19-3.9-8.2-8.2-3.9 19-6.9Z" {...gemein} />
            </svg>
        )
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.5 21 12 16.4 5.5 21V4.6a1.6 1.6 0 0 1 1.6-1.6h9.8a1.6 1.6 0 0 1 1.6 1.6V21Z" {...gemein} />
        </svg>
    )
}

export interface ChipDaten { l: string; w: string; x: number; y: number; d: number; akz?: boolean }
export function MetaAnzeige(props: { los: boolean; akzent: string; beispiel: boolean; hoehe: number; titel?: string; firma?: string; absender?: string; schlagzeile?: string; knopf?: string; bild?: string; chips?: { l: string; w: string; akz?: boolean }[] }) {
    const { los, akzent, beispiel } = props
    const [ref, m] = useMass<HTMLDivElement>()
    const eng = m.b > 0 && m.b < 420
    const lage = [{ x: -0.95, y: 0.2, d: 0 }, { x: 0.95, y: 0.5, d: 0.4 }, { x: -0.95, y: 0.8, d: 0.8 }]
    const chips: ChipDaten[] = (props.chips ?? [
        { l: "Reichweite", w: "48.200" },
        { l: "Klickrate", w: "2,1 %" },
        { l: "Anfragen", w: "36", akz: true },
    ]).slice(0, 3).map((c, i) => ({ ...c, ...lage[i] }))
    const absender = props.absender ?? "Dachtechnik Freese"
    const konto = absender.toLowerCase().replace(/[^a-zäöüß0-9]+/g, "")
    const schlagzeile = props.schlagzeile ?? "Neues Dach vor dem Winter?"
    // Der Post darf nie höher werden als die Kachel — sonst schiebt er sich über deren Kopf.
    // Kopfzeile, Handlungsbalken und Aktionsleiste brauchen zusammen rund 190 px; der Rest
    // bleibt dem Motiv, und daraus ergibt sich die Breite. Auf dem Handy ist es quadratisch,
    // auf breiten Flächen das hochkante 4:5.
    const verhaeltnis = eng ? 1 : 1.25
    const ausHoehe = m.h > 0 ? (m.h - 208) / verhaeltnis : 9999
    const postB = Math.round(Math.max(200, Math.min(eng ? (m.b || 320) : 330, ausHoehe)))

    const TINTE_IG = "rgb(28, 28, 30)"
    const GRAU_IG = "rgba(28, 28, 30, 0.55)"
    const KANTE_IG = "rgba(28, 28, 30, 0.1)"

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
            <Kopf art="performance" titel={props.titel ?? "So sieht Ihre Anzeige bei Instagram aus"} firma={props.firma ?? "Dachtechnik Freese: 48.200 Menschen erreicht, 36 Anfragen."} beispiel={beispiel} akzent={akzent} />
            <div ref={ref} style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0, overflow: "hidden" }}>
                <motion.div
                    initial={{ y: 22, opacity: 0 }}
                    animate={los ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 1, ease: KURVE }}
                    style={{
                        position: "relative",
                        width: postB,
                        maxWidth: "100%",
                        background: "rgb(255, 255, 255)",
                        borderRadius: 14,
                        overflow: "hidden",
                        boxShadow: "0 40px 70px -34px rgba(0,0,0,0.75)",
                        fontFamily: SCHRIFT,
                    }}
                >
                    {/* Kopfzeile des Beitrags */}
                    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 99, padding: 2, background: "linear-gradient(45deg, #F9CE34, #EE2A7B, #6228D7)", flexShrink: 0 }}>
                            <div style={{ width: "100%", height: "100%", borderRadius: 99, background: akzent, display: "flex", alignItems: "center", justifyContent: "center", ...text(12, "rgb(255,255,255)", 700) }}>
                                {absender.slice(0, 1)}
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                            <span style={{ ...text(13, TINTE_IG, 600), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{absender}</span>
                            <span style={text(12, GRAU_IG, 400)}>Gesponsert</span>
                        </div>
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                            {[6, 12, 18].map((cx) => (
                                <circle key={cx} cx={cx} cy={12} r={1.6} fill={TINTE_IG} />
                            ))}
                        </svg>
                    </div>
                    {/* Motiv im Hochformat 4:5 */}
                    <div style={{ position: "relative", width: "100%", aspectRatio: eng ? "1 / 1" : "4 / 5", background: "#eee" }}>
                        <img src={props.bild ?? BILD("photo-1691571026798-1c5819901996")} alt="Beispielmotiv" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    {/* Handlungsbalken */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 12px", background: "rgba(28,28,30,0.04)", borderTop: `1px solid ${KANTE_IG}`, borderBottom: `1px solid ${KANTE_IG}` }}>
                        <span style={text(13, TINTE_IG, 600)}>{props.knopf ?? "Angebot anfordern"}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M9 5l7 7-7 7" fill="none" stroke={GRAU_IG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    {/* Aktionsleiste und Bildtext */}
                    <div style={{ padding: "9px 12px 13px", display: "flex", flexDirection: "column", gap: 7 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                                <IGIcon art="herz" farbe={TINTE_IG} />
                                <IGIcon art="kommentar" farbe={TINTE_IG} />
                                <IGIcon art="senden" farbe={TINTE_IG} />
                            </div>
                            <IGIcon art="merken" farbe={TINTE_IG} />
                        </div>
                        <span style={text(13, TINTE_IG, 600)}>Gefällt 1.248 Mal</span>
                        <span style={{ ...text(13, TINTE_IG, 400), lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                            <span style={text(13, TINTE_IG, 600)}>{konto}</span> {schlagzeile}
                        </span>
                    </div>
                </motion.div>
                {!eng && chips.map((c, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={los ? { opacity: 1, scale: 1, y: [0, -6, 0] } : {}}
                        transition={{ opacity: { delay: 0.6 + c.d, duration: 0.6 }, scale: { delay: 0.6 + c.d, duration: 0.6 }, y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: c.d } }}
                        style={{
                            position: "absolute",
                            left: `calc(50% + ${c.x * 185}px)`,
                            top: `${c.y * 100}%`,
                            transform: "translate(-50%, -50%)",
                            padding: "9px 12px",
                            borderRadius: 12,
                            background: "rgba(22,23,27,0.72)",
                            backdropFilter: "blur(14px)",
                            WebkitBackdropFilter: "blur(14px)",
                            boxShadow: `inset 0 0 0 1px rgba(245,243,239,0.12), 0 18px 40px -16px rgba(0,0,0,0.7)`,
                            whiteSpace: "nowrap",
                        }}
                    >
                        <div style={{ ...etikett, fontSize: 9 }}>{c.l}</div>
                        <div style={{ ...text(18, c.akz ? akzent : PAPIER), marginTop: 4 }}>{c.w}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

// ---------- Performance: Google-Suche ----------

export function GoogleSuche(props: { los: boolean; akzent: string; beispiel: boolean; titel?: string; firma?: string; suche?: string; domain?: string; headline?: string; beschreibung?: string; links?: string[]; werte?: { l: string; w: number; s: number; n: string }[] }) {
    const { los, akzent, beispiel } = props
    const domain = props.domain ?? "harms-motorgeraete.de › werkstatt"
    const werte = props.werte ?? [
        { l: "Klickrate", w: 9.4, s: 1, n: " %" },
        { l: "Ø Klickpreis", w: 1.12, s: 2, n: " €" },
        { l: "Anfragen", w: 58, s: 0, n: "" },
    ]
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14 }}>
            <Kopf art="performance" titel={props.titel ?? "Ganz oben bei Google"} firma={props.firma ?? "Motorgeräte Harms erscheint zuerst, wenn jemand in Oldenburg nach einer Reparatur sucht."} beispiel={beispiel} akzent={akzent} />
            <motion.div
                initial={{ y: 18, opacity: 0 }}
                animate={los ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.9, ease: KURVE, delay: 0.1 }}
                style={{ borderRadius: 14, background: "rgb(250, 250, 249)", padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 10 }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 99, boxShadow: "inset 0 0 0 1px rgba(14,15,18,0.12)" }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="5" stroke="rgba(14,15,18,0.5)" strokeWidth="1.6" />
                        <path d="M11 11l3.5 3.5" stroke="rgba(14,15,18,0.5)" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <span style={text(12.5, "rgba(14,15,18,0.75)")}>{props.suche ?? "rasenmäher reparatur oldenburg"}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={text(11, TINTE, 600)}>Gesponsert</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 18, height: 18, borderRadius: 99, background: "rgba(14,15,18,0.08)", display: "inline-flex", alignItems: "center", justifyContent: "center", ...text(9, TINTE, 700) }}>{domain.slice(0, 1).toUpperCase()}</span>
                        <span style={text(11.5, "rgba(14,15,18,0.7)")}>{domain}</span>
                    </div>
                    <span style={text(16.5, "rgb(26, 13, 171)", 500, { letterSpacing: "-0.01em", lineHeight: 1.25 })}>{props.headline ?? "Motorgeräte-Werkstatt Oldenburg — Termin in 48 Stunden"}</span>
                    <span style={text(12, "rgba(14,15,18,0.66)", 500, { letterSpacing: "0" })}>{props.beschreibung ?? "Rasenmäher, Aufsitzmäher, Motorsägen. Abholservice im Umkreis von 25 km. Jetzt Termin sichern."}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(props.links ?? ["Termin buchen", "Abholservice", "Ersatzteile"]).map((s) => (
                        <span key={s} style={{ ...text(11, "rgb(26, 13, 171)"), padding: "5px 10px", borderRadius: 99, boxShadow: "inset 0 0 0 1px rgba(14,15,18,0.12)" }}>{s}</span>
                    ))}
                </div>
            </motion.div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: "auto" }}>
                {werte.map((w, i) => (
                    <div key={i} style={{ borderTop: `1px solid ${LINIE}`, paddingTop: 10 }}>
                        <div style={{ ...etikett, fontSize: 9.5 }}>{w.l}</div>
                        <div style={{ ...text(22, i === 2 ? akzent : PAPIER), marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                            <Zaehler bis={w.w} stellen={w.s} nach={w.n} los={los} verzug={0.3 + i * 0.1} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ---------- Performance: Trichter ----------

export function Trichter(props: { los: boolean; akzent: string; beispiel: boolean; titel?: string; firma?: string; stufen?: { l: string; w: number; anteil: number; q?: string }[] }) {
    const { los, akzent, beispiel } = props
    // Auf dem Handy passte "Impressionen" nicht in die 22-%-Spalte und lief unter den Balken.
    // Dort steht die Beschriftung deshalb über dem Balken, der bekommt die volle Breite.
    const [ref, m] = useMass<HTMLDivElement>()
    const eng = m.b > 0 && m.b < 420
    const stufen: { l: string; w: number; anteil: number; q?: string }[] = props.stufen ?? [
        { l: "Impressionen", w: 184300, anteil: 1 },
        { l: "Klicks", w: 5120, anteil: 0.62, q: "2,8 %" },
        { l: "Anfragen", w: 212, anteil: 0.36, q: "4,1 %" },
        { l: "Aufträge", w: 61, anteil: 0.2, q: "28,8 %" },
    ]
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16 }}>
            <Kopf art="performance" titel={props.titel ?? "Von der Anzeige bis zum Auftrag"} firma={props.firma ?? "Praxis Lindenhof: Wie viele Menschen die Anzeige sahen, klickten, anfragten — und Patient wurden."} beispiel={beispiel} akzent={akzent} />
            <div ref={ref} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: eng ? 12 : 14 }}>
                {stufen.map((s, i) => (
                    <div key={i} style={eng ? { display: "grid", gap: 5 } : { display: "grid", gridTemplateColumns: "clamp(70px, 22%, 96px) 1fr 48px", alignItems: "center", gap: 10 }}>
                        {eng ? (
                            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                                <span style={text(12, GRAU)}>{s.l}</span>
                                {s.q ? <span style={{ ...text(12, PAPIER), fontVariantNumeric: "tabular-nums" }}>{s.q}</span> : null}
                            </span>
                        ) : (
                            <span style={text(12.5, GRAU)}>{s.l}</span>
                        )}
                        <div style={{ position: "relative", height: eng ? 34 : 40, borderRadius: 10, background: "rgba(245,243,239,0.04)", overflow: "hidden" }}>
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: los ? `${s.anteil * 100}%` : "0%" }}
                                transition={{ duration: 1.3, ease: KURVE, delay: 0.15 * i }}
                                style={{
                                    height: "100%",
                                    borderRadius: 10,
                                    background: i === stufen.length - 1 ? akzent : `linear-gradient(90deg, rgba(245,243,239,${0.2 - i * 0.03}), rgba(245,243,239,${0.1 - i * 0.02}))`,
                                }}
                            />
                            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", ...text(13, PAPIER, 600), whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}>
                                <Zaehler bis={s.w} los={los} verzug={0.15 * i} />
                            </span>
                        </div>
                        {eng ? null : <span style={{ ...text(12, s.q ? PAPIER : "transparent"), textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.q || "·"}</span>}
                    </div>
                ))}
            </div>
            <span style={text(11.5, GRAU)}>{eng ? "Prozentwert: Anteil der Vorstufe, der weiterkommt." : "Rechte Spalte: Anteil der Vorstufe, der weiterkommt."}</span>
        </div>
    )
}

// ---------- Performance: Kosten je Anfrage ----------

function KostenBalken(props: { los: boolean; akzent: string; beispiel: boolean }) {
    const { los, akzent, beispiel } = props
    const monate = [["Apr", 64], ["Mai", 48], ["Jun", 37], ["Jul", 29], ["Aug", 24], ["Sep", 21]] as const
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14 }}>
            <Kopf art="performance" titel="Jede Anfrage wird günstiger" firma="Optik am Wall: Weil wir jeden Monat nachsteuern, sinken die Kosten pro Anfrage." beispiel={beispiel} akzent={akzent} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ ...text(40, akzent), fontVariantNumeric: "tabular-nums" }}>
                    <Zaehler bis={67} vor="−" nach=" %" los={los} />
                </span>
                <span style={text(12.5, GRAU)}>in sechs Monaten</span>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 8, minHeight: 110 }}>
                {monate.map(([m, v], i) => (
                    <div key={m} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 7 }}>
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: los ? 1 : 0 }} transition={{ delay: 0.6 + i * 0.08 }} style={{ ...text(11, i === 5 ? akzent : GRAU), fontVariantNumeric: "tabular-nums" }}>
                            {v} €
                        </motion.span>
                        <motion.div
                            initial={{ height: "0%" }}
                            animate={{ height: los ? `${(v / 64) * 78}%` : "0%" }}
                            transition={{ duration: 1.1, ease: KURVE, delay: i * 0.08 }}
                            style={{ width: "100%", borderRadius: 7, background: i === 5 ? akzent : `rgba(245,243,239,${0.1 + i * 0.02})` }}
                        />
                        <span style={text(11, GRAU)}>{m}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ---------- Performance: Recruiting ----------

function Recruiting(props: { los: boolean; akzent: string; beispiel: boolean }) {
    const { los, akzent, beispiel } = props
    const tage = [0, 2, 3, 6, 8, 9, 12, 14, 17, 19, 21, 24, 26, 27, 29, 31, 32, 34, 35, 36, 37]
    const b = 200
    const h = 56
    const pts = tage.map((v, i): [number, number] => [(i / (tage.length - 1)) * b, h - (v / 37) * h])
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>
            <Kopf art="performance" titel="Neue Mitarbeiter über Instagram" firma="Autohaus Meinen: Stellenanzeige dort, wo Mechatroniker scrollen." beispiel={beispiel} akzent={akzent} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ ...text(11.5, PAPIER), padding: "6px 10px", borderRadius: 99, background: "rgba(245,243,239,0.06)", boxShadow: `inset 0 0 0 1px ${LINIE}` }}>Kfz-Mechatroniker (m/w/d)</span>
                <span style={{ ...text(11.5, GRAU), padding: "6px 10px", borderRadius: 99, boxShadow: `inset 0 0 0 1px ${LINIE}` }}>14,60 € je Bewerbung</span>
                <span style={{ ...text(11.5, GRAU), padding: "6px 10px", borderRadius: 99, boxShadow: `inset 0 0 0 1px ${LINIE}` }}>21.400 erreicht</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: "auto" }}>
                <div>
                    <div style={{ ...text(46), fontVariantNumeric: "tabular-nums" }}>
                        <Zaehler bis={37} los={los} dauer={2} />
                    </div>
                    <div style={text(12.5, GRAU)}>Bewerbungen in 21 Tagen</div>
                </div>
                <svg width="46%" viewBox={`0 0 ${b} ${h + 4}`} style={{ overflow: "visible" }}>
                    <motion.path d={kurve(pts)} fill="none" stroke={akzent} strokeWidth={2.2} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: los ? 1 : 0 }} transition={{ duration: 2, ease: KURVE }} />
                </svg>
            </div>
        </div>
    )
}

// ---------- Websites ----------

function Browser(props: { bild: string; alt: string; adresse: string; titel: string; firma: string; firmaEng?: string; merkmale: string[]; akzent: string; link: string }) {
    const { bild, alt, adresse, titel, firma, merkmale, akzent, link } = props
    const [ueber, setUeber] = useState(false)
    // Auf dem Handy gibt es kein Überfahren: der Hinweis würde ins Leere laufen und der
    // Öffnen-Knopf bliebe unsichtbar — niemand sähe, dass die Karte zur Website führt.
    const [ref, m] = useMass<HTMLAnchorElement>()
    const eng = m.b > 0 && m.b < 420
    const zeigKnopf = ueber || eng
    return (
        <a
            ref={ref}
            href={link}
            target="_blank"
            rel="noopener"
            onPointerEnter={() => setUeber(true)}
            onPointerLeave={() => setUeber(false)}
            style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14, textDecoration: "none" }}
        >
            <Kopf art="websites" titel={titel} firma={eng && props.firmaEng ? props.firmaEng : firma} beispiel={false} akzent={akzent} />
            <div style={{ position: "relative", flex: 1, minHeight: 160, borderRadius: 12, overflow: "hidden", boxShadow: `inset 0 0 0 1px ${LINIE}, 0 30px 60px -30px rgba(0,0,0,0.7)`, background: "rgb(30,31,35)" }}>
                <div style={{ height: 30, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", background: "rgb(30,31,35)", borderBottom: `1px solid ${LINIE}` }}>
                    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                        <span key={c} style={{ width: 8, height: 8, borderRadius: 9, background: c, opacity: 0.8 }} />
                    ))}
                    <span style={{ ...text(11, GRAU), marginLeft: 10, padding: "3px 10px", borderRadius: 6, background: "rgba(245,243,239,0.06)" }}>{adresse}</span>
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 30, bottom: 0, overflow: "hidden" }}>
                    <img
                        src={bild}
                        alt={alt}
                        loading="lazy"
                        style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            transform: ueber ? "translateY(calc(-100% + 100px))" : "translateY(0)",
                            transition: `transform ${ueber ? 7 : 1.2}s ${ueber ? "linear" : CSSKURVE}`,
                        }}
                    />
                </div>
                <div style={{ position: "absolute", left: 10, bottom: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {merkmale.map((m) => (
                        <span key={m} style={{ ...text(11, PAPIER), padding: "6px 10px", borderRadius: 99, background: "rgba(14,15,18,0.72)", backdropFilter: "blur(10px)", boxShadow: `inset 0 0 0 1px rgba(245,243,239,0.12)` }}>{m}</span>
                    ))}
                </div>
                <div style={{ position: "absolute", right: 12, bottom: 12, width: 40, height: 40, borderRadius: 99, background: akzent, display: "flex", alignItems: "center", justifyContent: "center", transform: zeigKnopf ? "scale(1)" : "scale(0.6)", opacity: zeigKnopf ? 1 : 0, transition: `all 0.5s ${CSSKURVE}` }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4 12L12 4M12 4H5.5M12 4V10.5" stroke={TINTE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </a>
    )
}

// ---------- Content ----------

function Reel(props: { los: boolean; akzent: string; beispiel: boolean }) {
    const { los, akzent, beispiel } = props
    return (
        <div style={{ position: "relative", height: "100%", margin: -20, borderRadius: 16, overflow: "hidden" }}>
            <img src={BILD("photo-1758767355046-1986dda2d967", 800)} alt="Beispielmotiv Werkstatt" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.62) 16%, rgba(0,0,0,0.18) 34%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.85) 100%)" }} />
            <div style={{ position: "absolute", left: 20, right: 20, top: 20 }}>
                <Kopf art="content" titel="Videos aus dem Arbeitsalltag" firma="Werkstatt Harms: kurze Clips für Instagram und Anzeigen." beispiel={beispiel} akzent={akzent} hell />
            </div>
            <motion.div
                animate={los ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", left: "50%", top: "50%", width: 58, height: 58, marginLeft: -29, marginTop: -29, borderRadius: 99, background: "rgba(245,243,239,0.18)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "inset 0 0 0 1px rgba(245,243,239,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                <svg width="18" height="18" viewBox="0 0 16 16">
                    <path d="M5 3.5v9l7.5-4.5z" fill={PAPIER} />
                </svg>
            </motion.div>
            <div style={{ position: "absolute", left: 20, right: 20, bottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <div style={{ ...text(30), fontVariantNumeric: "tabular-nums" }}>
                            <Zaehler bis={128.4} stellen={1} nach="K" los={los} />
                        </div>
                        <div style={text(12, "rgba(245,243,239,0.7)")}>Aufrufe</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={text(20)}>71 %</div>
                        <div style={text(12, "rgba(245,243,239,0.7)")}>Ø angesehen</div>
                    </div>
                </div>
                <div style={{ height: 3, borderRadius: 3, background: "rgba(245,243,239,0.2)", overflow: "hidden" }}>
                    <motion.div animate={los ? { width: ["0%", "100%"] } : {}} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} style={{ height: "100%", background: PAPIER }} />
                </div>
            </div>
        </div>
    )
}

function Fotoserie(props: { akzent: string; beispiel: boolean }) {
    const { akzent, beispiel } = props
    const [ueber, setUeber] = useState(false)
    const bilder = [BILD("photo-1544164560-adac3045edb2", 500), BILD("photo-1776728016975-45f2197c0d2a", 500), BILD("photo-1608613304899-ea8098577e38", 500)]
    return (
        <div onPointerEnter={() => setUeber(true)} onPointerLeave={() => setUeber(false)} style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>
            <Kopf art="content" titel="Echte Fotos statt Stockbilder" firma="Tischlerei Wübbens: 64 Motive an einem Tag vor Ort." beispiel={beispiel} akzent={akzent} />
            <div style={{ position: "relative", flex: 1, minHeight: 150 }}>
                {bilder.map((src, i) => {
                    const r = (i - 1) * (ueber ? 9 : 5)
                    const x = (i - 1) * (ueber ? 34 : 16)
                    return (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: "42%",
                                aspectRatio: "4 / 5",
                                transform: `translate(calc(-50% + ${x}%), -50%) rotate(${r}deg)`,
                                transition: `transform 0.8s ${CSSKURVE}`,
                                borderRadius: 10,
                                overflow: "hidden",
                                zIndex: i === 1 ? 3 : 1,
                                boxShadow: "0 24px 40px -16px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(245,243,239,0.1)",
                            }}
                        >
                            <img src={src} alt="Beispielmotiv Handwerk" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ---------- Raster ----------

interface Kachel {
    id: string
    art: Art
    d: [number, number]
    t: [number, number]
    p: number
    bild?: boolean
    inhalt: (k: { los: boolean; akzent: string; beispiel: boolean; hoehe: number; schmal: boolean }) => ReactNode
}

const KACHELN: Kachel[] = [
    { id: "cockpit", art: "performance", d: [7, 3], t: [6, 3], p: 545, inhalt: (k) => <Cockpit {...k} /> },
    { id: "meta", art: "performance", d: [5, 3], t: [3, 3], p: 700, inhalt: (k) => <MetaAnzeige {...k} /> },
    { id: "google", art: "performance", d: [5, 3], t: [3, 3], p: 510, inhalt: (k) => <GoogleSuche {...k} /> },
    { id: "trichter", art: "performance", d: [7, 3], t: [6, 3], p: 480, inhalt: (k) => <Trichter {...k} /> },
    {
        id: "wav", art: "websites", d: [5, 3], t: [6, 3], p: 400,
        inhalt: (k) => <Browser bild="https://framerusercontent.com/images/ArC0EnCXXAPEbwWsXDR5b7YS2eg.webp" alt="Website WAV Westerstede" adresse="wav-wst.de" titel="Website für WAV Westerstede" firma="Kfz-Werkstatt — live unter wav-wst.de. Zum Durchscrollen überfahren." firmaEng="Kfz-Werkstatt — live unter wav-wst.de. Tippen öffnet die Seite." merkmale={["Anfragen über Formular & Anruf", "Mobil zuerst"]} akzent={k.akzent} link="https://wav-wst.de/" />,
    },
    { id: "reel", art: "content", d: [3, 3], t: [3, 3], p: 520, bild: true, inhalt: (k) => <Reel {...k} /> },
    { id: "kosten", art: "performance", d: [4, 3], t: [3, 3], p: 410, inhalt: (k) => <KostenBalken {...k} /> },
    { id: "recruiting", art: "performance", d: [4, 2], t: [3, 2], p: 320, inhalt: (k) => <Recruiting {...k} /> },
    { id: "fotos", art: "content", d: [4, 2], t: [3, 2], p: 320, inhalt: (k) => <Fotoserie {...k} /> },
    {
        id: "kaemper", art: "websites", d: [4, 2], t: [6, 2], p: 340,
        inhalt: (k) => <Browser bild="https://framerusercontent.com/images/vsrW4ZDFYyTO5QmW2LTvfyfwko.webp" alt="Website Hotel Kämper" adresse="kaemper.vercel.app" titel="Website für Hotel Kämper" firma="Hotel mit Direktbuchung — Entwurf." merkmale={["Direktbuchung"]} akzent={k.akzent} link="https://kaemper.vercel.app/" />,
    },
]

const FILTER: { id: Filter; text: string }[] = [
    { id: "alle", text: "Alle" },
    { id: "performance", text: "Werbung" },
    { id: "websites", text: "Websites" },
    { id: "content", text: "Fotos & Videos" },
]

function Schalter(props: { wert: Filter; setWert: (f: Filter) => void; akzent: string; schmal?: boolean }) {
    const { wert, setWert, schmal = false } = props
    return (
        <LayoutGroup id="arbeitsschau-filter">
            <div role="tablist" aria-label="Arbeiten filtern" style={{ display: "inline-flex", padding: 4, borderRadius: 999, background: "rgba(245,243,239,0.06)", boxShadow: `inset 0 0 0 1px rgba(245,243,239,0.1)`, backdropFilter: "blur(14px)", maxWidth: "100%", overflowX: "auto", scrollbarWidth: "none" }}>
                {FILTER.map((f) => {
                    const an = wert === f.id
                    const n = f.id === "alle" ? KACHELN.length : KACHELN.filter((k) => k.art === f.id).length
                    return (
                        <button
                            key={f.id}
                            role="tab"
                            aria-selected={an}
                            type="button"
                            onClick={() => setWert(f.id)}
                            style={{ all: "unset", position: "relative", cursor: "pointer", padding: schmal ? "11px 11px 12px" : "11px 18px 12px", borderRadius: 999, display: "inline-flex", alignItems: "flex-start", gap: 5, flexShrink: 0, whiteSpace: "nowrap", WebkitTapHighlightColor: "transparent" }}
                        >
                            {an ? <motion.span layoutId="arbeitsschau-marke" transition={{ type: "spring", stiffness: 380, damping: 34 }} style={{ position: "absolute", inset: 0, borderRadius: 999, background: PAPIER }} /> : null}
                            <span style={{ position: "relative", ...text(schmal ? 13.5 : 14.5, an ? TINTE : "rgba(245,243,239,0.72)"), lineHeight: 1, whiteSpace: "nowrap", transition: "color 0.4s" }}>{f.text}</span>
                            {schmal ? null : <span style={{ position: "relative", fontFamily: SCHRIFT, fontSize: 10, fontWeight: 500, color: an ? "rgba(14,15,18,0.5)" : "rgba(245,243,239,0.4)", marginTop: -2 }}>{String(n).padStart(2, "0")}</span>}
                        </button>
                    )
                })}
            </div>
        </LayoutGroup>
    )
}

function Feld(props: { k: Kachel; spalten: number; reihe: number; schmal: boolean; akzent: string; beispiel: boolean; statisch: boolean; index: number }) {
    const { k, spalten, reihe, schmal, akzent, beispiel, statisch, index } = props
    const ref = useRef<HTMLDivElement>(null)
    const imBild = useInView(ref, { once: true, amount: 0.3 })
    const los = statisch || imBild
    const span = spalten === 12 ? k.d : spalten === 6 ? k.t : [1, 1]
    const hoehe = schmal ? k.p : span[1] * reihe + (span[1] - 1) * 12
    return (
        <motion.div
            ref={ref}
            layout
            initial={statisch ? false : { opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
            transition={{ duration: 0.8, ease: KURVE, delay: statisch ? 0 : Math.min(index, 6) * 0.05, layout: { duration: 0.7, ease: KURVE } }}
            style={{
                gridColumn: schmal ? "1 / -1" : `span ${span[0]}`,
                gridRow: schmal ? undefined : `span ${span[1]}`,
                height: hoehe,
                position: "relative",
                borderRadius: 16,
                padding: 20,
                boxSizing: "border-box",
                background: `linear-gradient(180deg, rgb(48,48,48) 0%, ${FLAECHE} 100%)`,
                boxShadow: `inset 0 1px 0 rgba(245,243,239,0.06), inset 0 0 0 1px rgba(245,243,239,0.06)`,
                overflow: "hidden",
            }}
        >
            {k.inhalt({ los, akzent, beispiel, hoehe, schmal: schmal || span[0] <= 4 })}
        </motion.div>
    )
}

/**
 * Arbeitsschau
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 1600
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Arbeitsschau(props: ArbeitsschauProps) {
    const { start = "alle", beispielHinweis = true, akzent = "rgb(255, 90, 31)", style } = props
    const statisch = useIsStaticRenderer()
    const [filter, setFilter] = useState<Filter>(start)
    const [ref, m] = useMass<HTMLDivElement>()
    useEffect(() => setFilter(start), [start])
    const breite = m.b || 1200
    const spalten = breite >= 1000 ? 12 : breite >= 640 ? 6 : 1
    const schmal = spalten === 1
    const reihe = spalten === 12 ? 138 : 150
    const liste = useMemo(() => KACHELN.filter((k) => filter === "alle" || k.art === filter), [filter])

    return (
        <div ref={ref} style={{ ...style, position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <Schalter wert={filter} setWert={setFilter} akzent={akzent} schmal={breite < 520} />
            <div
                style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: `repeat(${spalten}, minmax(0, 1fr))`,
                    gridAutoRows: schmal ? "auto" : reihe,
                    gridAutoFlow: "row dense",
                    gap: 12,
                }}
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {liste.map((k, i) => (
                        <Feld key={k.id} k={k} index={i} spalten={spalten} reihe={reihe} schmal={schmal} akzent={akzent} beispiel={beispielHinweis} statisch={statisch} />
                    ))}
                </AnimatePresence>
            </div>
            {beispielHinweis ? (
                <p style={{ ...text(12.5, "rgba(245,243,239,0.4)"), textAlign: "center", maxWidth: 560 }}>
                    Die Websites sind echte Kundenprojekte. Firmen und Zahlen in den Werbe- und Foto-Kacheln sind Beispiele — so sieht es aus, wenn wir für Sie arbeiten.
                </p>
            ) : null}
        </div>
    )
}

addPropertyControls(Arbeitsschau, {
    start: {
        type: ControlType.Enum,
        title: "Start",
        options: ["alle", "performance", "websites", "content"],
        optionTitles: ["Alle", "Performance", "Websites", "Content"],
        defaultValue: "alle",
    },
    beispielHinweis: { type: ControlType.Boolean, title: "Beispiel-Hinweis", defaultValue: true },
    akzent: { type: ControlType.Color, title: "Akzent", defaultValue: "rgb(255, 90, 31)" },
})
