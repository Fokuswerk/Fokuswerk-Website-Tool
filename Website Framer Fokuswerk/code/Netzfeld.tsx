import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties } from "react"

// Netzfeld — gleichmäßiges Dreiecksgitter über dem Auftaktbild.
// Aufbau nach dem Spector-Prinzip: Die Linienhelligkeit folgt der Helligkeit des Fotos,
// am Zeiger wölbt sich das Netz radial auf (wie eine Kugel unter einem Tuch) und die
// Linien in der Nähe hellen auf. Ohne Zeiger steht das Netz vollkommen ruhig.

interface Bild {
    src?: string
    srcSet?: string
    alt?: string
}

interface NetzfeldProps {
    bild?: Bild
    abstand: number
    linienstaerke: number
    farbe: string
    minDeckkraft: number
    maxDeckkraft: number
    helligkeit: number
    dunkelSchwelle: number
    woelbung: number
    radius: number
    nachlauf: number
    beschriftung: boolean
    woerter: string[]
    schriftgroesse: number
    labelfarbe: string
    einblenden: number
    verzoegerung: number
    style?: CSSProperties
}

type Punkt = {
    ax: number
    ay: number
    cx: number
    cy: number
    tx: number
    ty: number
    h: number
}

type Verbindung = { a: number; b: number; basis: number }

const RAND = 120

function farbeZuRgb(farbe: string): [number, number, number] {
    if (typeof document === "undefined") return [245, 243, 239]
    const el = document.createElement("div")
    el.style.color = farbe
    el.style.display = "none"
    document.body.appendChild(el)
    const c = getComputedStyle(el).color
    document.body.removeChild(el)
    const m = c.match(/(\d+(?:\.\d+)?)/g)
    if (!m || m.length < 3) return [245, 243, 239]
    return [parseFloat(m[0]), parseFloat(m[1]), parseFloat(m[2])]
}

// Nachbarschaft wie bei Spector: je Punkt die sechs nächsten Punkte im Umkreis von
// 1,8 Rasterabständen. Auf dem Quadratraster ergibt das vier Kanten plus zwei Diagonalen.
function verbindungenBauen(
    punkte: Punkt[],
    abstandPx: number,
    dunkel: number,
    hell: number,
    minD: number,
    maxD: number
): Verbindung[] {
    const c = abstandPx * 1.8
    const l = c * c
    const zellen = new Map<string, number[]>()
    punkte.forEach((p, i) => {
        const k = `${Math.floor(p.ax / c)},${Math.floor(p.ay / c)}`
        let arr = zellen.get(k)
        if (!arr) {
            arr = []
            zellen.set(k, arr)
        }
        arr.push(i)
    })
    const gesehen = new Set<string>()
    const out: Verbindung[] = []
    const spanne = maxD - minD
    punkte.forEach((p, a) => {
        const zx = Math.floor(p.ax / c)
        const zy = Math.floor(p.ay / c)
        const kandidaten: { i: number; d: number }[] = []
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                const arr = zellen.get(`${zx + dx},${zy + dy}`)
                if (!arr) continue
                for (const j of arr) {
                    if (j === a) continue
                    const q = punkte[j]
                    const ex = q.ax - p.ax
                    const ey = q.ay - p.ay
                    const d = ex * ex + ey * ey
                    if (d <= l) kandidaten.push({ i: j, d })
                }
            }
        }
        kandidaten.sort((x, y) => x.d - y.d)
        const n = Math.min(6, kandidaten.length)
        for (let k = 0; k < n; k++) {
            const j = kandidaten[k].i
            const lo = Math.min(a, j)
            const hi = Math.max(a, j)
            const key = lo + "|" + hi
            if (gesehen.has(key)) continue
            gesehen.add(key)
            const h = Math.min((punkte[lo].h + punkte[hi].h) / 2, hell)
            const basis =
                h <= dunkel ? minD : minD + ((h - dunkel) / (hell - dunkel)) * spanne
            out.push({ a: lo, b: hi, basis })
        }
    })
    return out
}

/**
 * Netzfeld
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Netzfeld(props: NetzfeldProps) {
    const {
        bild,
        abstand = 40,
        linienstaerke = 0.9,
        farbe = "rgb(245, 243, 239)",
        minDeckkraft = 0.04,
        maxDeckkraft = 0.9,
        helligkeit = 250,
        dunkelSchwelle = 10,
        woelbung = 60,
        radius = 350,
        nachlauf = 0.1,
        beschriftung = true,
        woerter = ["META ADS", "GOOGLE ADS", "WEBSITE", "LANDINGPAGE", "TRACKING", "SEO", "CONTENT", "ANFRAGE"],
        schriftgroesse = 14,
        labelfarbe = "rgb(245, 243, 239)",
        einblenden = 1,
        verzoegerung = 0.6,
        style,
    } = props

    const istStatisch = useIsStaticRenderer()
    const reduziert = useReducedMotion() ?? false
    const huelleRef = useRef<HTMLDivElement>(null)
    const leinwandRef = useRef<HTMLCanvasElement>(null)
    const [bereit, setBereit] = useState(false)
    const bildSrc = bild?.src ?? ""
    const woerterKey = (woerter || []).join("|")

    useEffect(() => {
        const huelle = huelleRef.current
        const lw = leinwandRef.current
        if (!huelle || !lw || typeof window === "undefined") return
        // Auf Touch-Geräten/Handy gibt es keinen Zeiger – das Netz stand dort nur still, kostete aber
        // beim Laden Bild-Dekodierung, Helligkeitsmessung und Triangulierung (Blockierzeit). Aus.
        if (window.matchMedia?.("(hover: none), (max-width: 809.98px)").matches) return
        const ctx = lw.getContext("2d", { alpha: true })
        if (!ctx) return

        let aktiv = true
        const istSafari =
            /Safari/i.test(navigator.userAgent) && !/Chrome|CriOS|Chromium|Edg/i.test(navigator.userAgent)
        const dpr = Math.min(window.devicePixelRatio || 1, istSafari ? 1.5 : 2)
        const lo = Math.min(minDeckkraft, maxDeckkraft)
        const hi = Math.max(minDeckkraft, maxDeckkraft)
        const [r, g, b] = farbeZuRgb(farbe)
        const [lr, lg, lb] = farbeZuRgb(labelfarbe)
        const liste = (woerter || []).filter((w) => w && w.trim().length > 0)

        let punkte: Punkt[] = []
        let verbindungen: Verbindung[] = []
        let deckkraft = new Float32Array(0)
        let breite = 0
        let hoehe = 0
        let probe: { daten: Uint8ClampedArray; w: number; h: number } | null = null
        let bildEl: HTMLImageElement | null = null

        const zeiger = { x: 0, y: 0 }
        const glatt = { x: 0, y: 0 }
        const etikett = { x: 0, y: 0 }
        const letzterWechsel = { x: 0, y: 0 }
        const letzterClient = { x: -1, y: -1, gueltig: false }
        let wortIndex = 0
        let hover = false
        let schonDa = false
        let laeuft = false
        let sichtbar = true
        let raf = 0
        let zuletzt = 0
        let weg: number | null = null
        let neubau: number | null = null

        function probeAnlegen() {
            probe = null
            if (!bildEl || !bildEl.complete || bildEl.naturalWidth === 0 || breite === 0) return
            const k = Math.min(1, 480 / breite)
            const sw = Math.max(1, Math.round(breite * k))
            const sh = Math.max(1, Math.round(hoehe * k))
            const c2 = document.createElement("canvas")
            c2.width = sw
            c2.height = sh
            const x2 = c2.getContext("2d", { willReadFrequently: true } as CanvasRenderingContext2DSettings)
            if (!x2) return
            const iw = bildEl.naturalWidth
            const ih = bildEl.naturalHeight
            const ia = iw / ih
            const ba = sw / sh
            let dw = sw
            let dh = sh
            let ox = 0
            let oy = 0
            if (ia > ba) {
                dh = sh
                dw = sh * ia
                ox = (sw - dw) / 2
            } else {
                dw = sw
                dh = sw / ia
                oy = (sh - dh) / 2
            }
            try {
                x2.drawImage(bildEl, ox, oy, dw, dh)
                probe = { daten: x2.getImageData(0, 0, sw, sh).data, w: sw, h: sh }
            } catch {
                probe = null
            }
        }

        function helligkeitBei(x: number, y: number) {
            if (!probe) return 70
            const sx = Math.min(breite - 1, Math.max(0, x / dpr - RAND))
            const sy = Math.min(hoehe - 1, Math.max(0, y / dpr - RAND))
            const px = Math.min(probe.w - 1, Math.round((sx / breite) * probe.w))
            const py = Math.min(probe.h - 1, Math.round((sy / hoehe) * probe.h))
            const i = (py * probe.w + px) * 4
            return (probe.daten[i] + probe.daten[i + 1] + probe.daten[i + 2]) / 3
        }

        function zeichnen(mitEtikett: boolean) {
            ctx!.clearRect(0, 0, lw!.width, lw!.height)
            const spanne = hi - lo
            if (spanne <= 0 || verbindungen.length === 0) return
            const faecher: number[][] = []
            for (let k = 0; k < 50; k++) faecher.push([])
            for (let i = 0; i < verbindungen.length; i++) {
                const k = Math.min(49, Math.max(0, Math.floor(((deckkraft[i] - lo) / spanne) * 50)))
                faecher[k].push(i)
            }
            for (let k = 0; k < 50; k++) {
                const f = faecher[k]
                if (f.length === 0) continue
                ctx!.strokeStyle = `rgba(${r},${g},${b},${(lo + ((k + 0.5) / 50) * spanne).toFixed(3)})`
                ctx!.beginPath()
                for (const i of f) {
                    const v = verbindungen[i]
                    const p = punkte[v.a]
                    const q = punkte[v.b]
                    ctx!.moveTo(p.cx, p.cy)
                    ctx!.lineTo(q.cx, q.cy)
                }
                ctx!.stroke()
            }
            if (mitEtikett && liste.length > 0) {
                const dx = etikett.x - letzterWechsel.x
                const dy = etikett.y - letzterWechsel.y
                if (dx * dx + dy * dy > (22 * dpr) ** 2) {
                    wortIndex = (wortIndex + 1) % liste.length
                    letzterWechsel.x = etikett.x
                    letzterWechsel.y = etikett.y
                }
                ctx!.save()
                ctx!.font = `${schriftgroesse * dpr}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
                ctx!.fillStyle = `rgb(${lr},${lg},${lb})`
                ctx!.textBaseline = "middle"
                ctx!.fillText(liste[wortIndex % liste.length], etikett.x + 16 * dpr, etikett.y)
                ctx!.restore()
            }
        }

        function aufbauen() {
            breite = huelle!.clientWidth
            hoehe = huelle!.clientHeight
            if (breite === 0 || hoehe === 0) return
            const w = Math.round((breite + 2 * RAND) * dpr)
            const h = Math.round((hoehe + 2 * RAND) * dpr)
            lw!.width = w
            lw!.height = h
            lw!.style.width = `${breite + 2 * RAND}px`
            lw!.style.height = `${hoehe + 2 * RAND}px`
            ctx!.lineWidth = linienstaerke
            ctx!.lineCap = "round"
            probeAnlegen()
            const te = Math.max(6, Math.round(abstand * dpr))
            const xs: number[] = []
            const ys: number[] = []
            for (let x = 0; x < w; x += te) xs.push(x)
            if (xs[xs.length - 1] !== w - 1) xs.push(w - 1)
            for (let y = 0; y < h; y += te) ys.push(y)
            if (ys[ys.length - 1] !== h - 1) ys.push(h - 1)
            punkte = []
            for (const y of ys) {
                for (const x of xs) {
                    const hh = Math.max(13, helligkeitBei(x, y))
                    punkte.push({ ax: x, ay: y, cx: x, cy: y, tx: x, ty: y, h: hh })
                }
            }
            verbindungen = verbindungenBauen(punkte, te, dunkelSchwelle, helligkeit, lo, hi)
            deckkraft = new Float32Array(verbindungen.length)
            for (let i = 0; i < verbindungen.length; i++) deckkraft[i] = verbindungen[i].basis
            zeichnen(false)
        }

        function stoppen() {
            laeuft = false
            if (raf) cancelAnimationFrame(raf)
            raf = 0
        }

        function starten() {
            if (laeuft || !aktiv || istStatisch) return
            laeuft = true
            zuletzt = performance.now()
            raf = requestAnimationFrame(schritt)
        }

        function faktor(f: number, dt: number) {
            return 1 - Math.pow(1 - f, dt / 16.667)
        }

        function schritt(jetzt: number) {
            if (!aktiv || !laeuft) return
            raf = requestAnimationFrame(schritt)
            const dt = Math.min(64, Math.max(1, jetzt - zuletzt))
            zuletzt = jetzt
            if (!sichtbar || punkte.length === 0) return
            const wirkt = hover && !reduziert
            const m = reduziert ? 1 : Math.min(nachlauf * 1.5, 0.2)
            const fm = faktor(m, dt)
            const fe = faktor(m * 0.4, dt)
            glatt.x += (zeiger.x - glatt.x) * fm
            glatt.y += (zeiger.y - glatt.y) * fm
            etikett.x += (zeiger.x - etikett.x) * fe
            etikett.y += (zeiger.y - etikett.y) * fe
            const v = radius * dpr
            const kappe = abstand * dpr * 1.5
            const hin = faktor(0.15, dt)
            const zurueck = faktor(0.08, dt)
            let bewegt = false
            for (const p of punkte) {
                let verschoben = false
                if (wirkt) {
                    const dx = p.ax - glatt.x
                    const dy = p.ay - glatt.y
                    const d = Math.sqrt(dx * dx + dy * dy)
                    if (d < v && d > 0) {
                        const a = 1 - d / v
                        const o = a * a * (3 - 2 * a)
                        const s = Math.min(o * woelbung * dpr, kappe)
                        const w = Math.atan2(dy, dx)
                        p.tx = p.ax + Math.cos(w) * s
                        p.ty = p.ay + Math.sin(w) * s
                        verschoben = true
                    } else {
                        p.tx = p.ax
                        p.ty = p.ay
                    }
                } else {
                    p.tx = p.ax
                    p.ty = p.ay
                }
                const f = verschoben ? hin : zurueck
                p.cx += (p.tx - p.cx) * f
                p.cy += (p.ty - p.cy) * f
                const ex = p.cx - p.ax
                const ey = p.cy - p.ay
                if (ex * ex + ey * ey > 0.25) bewegt = true
            }
            let ruhig = true
            const auf = faktor(0.08, dt)
            const ab = faktor(0.04, dt)
            for (let i = 0; i < verbindungen.length; i++) {
                const vb = verbindungen[i]
                const p = punkte[vb.a]
                const q = punkte[vb.b]
                const rx = q.ax - p.ax
                const ry = q.ay - p.ay
                const kx = q.cx - p.cx
                const ky = q.cy - p.cy
                const ruh = Math.sqrt(rx * rx + ry * ry)
                const akt = Math.sqrt(kx * kx + ky * ky)
                const dehnung = ruh > 0 ? akt / ruh : 1
                const gd = dehnung > 1.15 ? Math.max(0.2, 1 - (dehnung - 1.15) * 2.5) : 1
                const mx = (p.cx + q.cx) * 0.5
                const my = (p.cy + q.cy) * 0.5
                const dd = Math.sqrt((mx - glatt.x) ** 2 + (my - glatt.y) ** 2)
                let hellig = 1
                if (wirkt && dd < v) {
                    const e = 1 - dd / v
                    hellig = 1 + e * e * 2
                }
                const ziel = Math.min(hi, Math.max(lo, vb.basis * gd * hellig))
                const diff = ziel - deckkraft[i]
                if (Math.abs(diff) > 0.001) {
                    deckkraft[i] += diff * (diff > 0 ? auf : ab)
                    ruhig = false
                }
            }
            zeichnen(wirkt && beschriftung)
            if (!wirkt && !bewegt && ruhig) {
                zeichnen(false)
                stoppen()
            }
        }

        function pruefen(cx: number, cy: number) {
            const rr = huelle!.getBoundingClientRect()
            const innen = cx >= rr.left && cx <= rr.right && cy >= rr.top && cy <= rr.bottom
            if (innen) {
                zeiger.x = (cx - rr.left + RAND) * dpr
                zeiger.y = (cy - rr.top + RAND) * dpr
                if (weg !== null) {
                    clearTimeout(weg)
                    weg = null
                }
                if (!hover) {
                    hover = true
                    if (!schonDa) {
                        schonDa = true
                        glatt.x = zeiger.x
                        glatt.y = zeiger.y
                        etikett.x = zeiger.x
                        etikett.y = zeiger.y
                        letzterWechsel.x = zeiger.x
                        letzterWechsel.y = zeiger.y
                    }
                }
                starten()
            } else if (hover && weg === null) {
                weg = window.setTimeout(() => {
                    weg = null
                    hover = false
                    starten()
                }, 150)
            }
        }

        function beiZeiger(e: PointerEvent) {
            if (e.pointerType === "touch") return
            letzterClient.x = e.clientX
            letzterClient.y = e.clientY
            letzterClient.gueltig = true
            pruefen(e.clientX, e.clientY)
        }

        function beiScroll() {
            if (letzterClient.gueltig) pruefen(letzterClient.x, letzterClient.y)
        }

        function beiVerlassen() {
            letzterClient.gueltig = false
            if (hover) {
                hover = false
                starten()
            }
        }

        aufbauen()
        if (!istStatisch) {
            requestAnimationFrame(() => {
                if (aktiv) setBereit(true)
            })
        }

        if (bildSrc) {
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.decoding = "async"
            img.onload = () => {
                if (!aktiv) return
                bildEl = img
                aufbauen()
            }
            let quelle = bildSrc
            try {
                const u = new URL(bildSrc)
                if (/framerusercontent\.com$/.test(u.hostname)) {
                    u.search = ""
                    u.searchParams.set("scale-down-to", "1024")
                }
                quelle = u.toString()
            } catch {
                quelle = bildSrc
            }
            img.src = quelle
        }

        const ro = new ResizeObserver(() => {
            if (neubau !== null) clearTimeout(neubau)
            neubau = window.setTimeout(() => {
                neubau = null
                if (!aktiv) return
                const nb = huelle!.clientWidth
                const nh = huelle!.clientHeight
                if (Math.abs(nb - breite) < 2 && Math.abs(nh - hoehe) < 2) return
                aufbauen()
            }, 120)
        })
        ro.observe(huelle)

        const io = new IntersectionObserver(
            (eintraege) => {
                sichtbar = eintraege.some((e) => e.isIntersecting)
                if (sichtbar && hover) starten()
            },
            { threshold: 0 }
        )
        io.observe(huelle)

        if (!istStatisch && !reduziert) {
            window.addEventListener("pointermove", beiZeiger, { passive: true })
            window.addEventListener("scroll", beiScroll, { passive: true })
            document.documentElement.addEventListener("pointerleave", beiVerlassen)
            window.addEventListener("blur", beiVerlassen)
        }

        return () => {
            aktiv = false
            stoppen()
            if (weg !== null) clearTimeout(weg)
            if (neubau !== null) clearTimeout(neubau)
            ro.disconnect()
            io.disconnect()
            window.removeEventListener("pointermove", beiZeiger)
            window.removeEventListener("scroll", beiScroll)
            document.documentElement.removeEventListener("pointerleave", beiVerlassen)
            window.removeEventListener("blur", beiVerlassen)
        }
    }, [
        bildSrc,
        abstand,
        linienstaerke,
        farbe,
        minDeckkraft,
        maxDeckkraft,
        helligkeit,
        dunkelSchwelle,
        woelbung,
        radius,
        nachlauf,
        beschriftung,
        woerterKey,
        schriftgroesse,
        labelfarbe,
        istStatisch,
        reduziert,
    ])

    return (
        <div
            ref={huelleRef}
            aria-hidden="true"
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                pointerEvents: "none",
            }}
        >
            <canvas
                ref={leinwandRef}
                style={{
                    position: "absolute",
                    left: -RAND,
                    top: -RAND,
                    display: "block",
                    opacity: istStatisch || bereit ? 1 : 0,
                    transition: istStatisch || reduziert ? "none" : `opacity ${einblenden}s ease-out ${verzoegerung}s`,
                }}
            />
        </div>
    )
}

addPropertyControls(Netzfeld, {
    bild: {
        type: ControlType.ResponsiveImage,
        title: "Bild (Helligkeit)",
    },
    abstand: { type: ControlType.Number, title: "Raster", defaultValue: 40, min: 15, max: 100, step: 1, unit: "px" },
    linienstaerke: { type: ControlType.Number, title: "Linie", defaultValue: 0.9, min: 0.3, max: 3, step: 0.1, unit: "px" },
    farbe: { type: ControlType.Color, title: "Linienfarbe", defaultValue: "rgb(245, 243, 239)" },
    minDeckkraft: { type: ControlType.Number, title: "Dunkle Linien", defaultValue: 0.04, min: 0, max: 0.5, step: 0.01 },
    maxDeckkraft: { type: ControlType.Number, title: "Helle Linien", defaultValue: 0.9, min: 0.05, max: 1, step: 0.01 },
    helligkeit: { type: ControlType.Number, title: "Helligkeit", defaultValue: 250, min: 50, max: 255, step: 5 },
    dunkelSchwelle: { type: ControlType.Number, title: "Dunkelgrenze", defaultValue: 10, min: 0, max: 120, step: 1 },
    woelbung: { type: ControlType.Number, title: "Wölbung", defaultValue: 60, min: 0, max: 160, step: 1, unit: "px" },
    radius: { type: ControlType.Number, title: "Radius", defaultValue: 350, min: 50, max: 700, step: 10, unit: "px" },
    nachlauf: { type: ControlType.Number, title: "Nachlauf", defaultValue: 0.1, min: 0.01, max: 0.5, step: 0.01 },
    beschriftung: { type: ControlType.Boolean, title: "Etikett", defaultValue: true },
    woerter: {
        type: ControlType.Array,
        title: "Wörter",
        control: { type: ControlType.String },
        defaultValue: ["META ADS", "GOOGLE ADS", "WEBSITE", "LANDINGPAGE", "TRACKING", "SEO", "CONTENT", "ANFRAGE"],
        maxCount: 16,
        hidden: (p: Partial<NetzfeldProps>) => !p.beschriftung,
    },
    schriftgroesse: {
        type: ControlType.Number,
        title: "Etikett Größe",
        defaultValue: 14,
        min: 8,
        max: 32,
        step: 1,
        unit: "px",
        hidden: (p: Partial<NetzfeldProps>) => !p.beschriftung,
    },
    labelfarbe: {
        type: ControlType.Color,
        title: "Etikett Farbe",
        defaultValue: "rgb(245, 243, 239)",
        hidden: (p: Partial<NetzfeldProps>) => !p.beschriftung,
    },
    einblenden: { type: ControlType.Number, title: "Einblenden", defaultValue: 1, min: 0, max: 4, step: 0.1, unit: "s" },
    verzoegerung: { type: ControlType.Number, title: "Verzögerung", defaultValue: 0.6, min: 0, max: 4, step: 0.1, unit: "s" },
})
