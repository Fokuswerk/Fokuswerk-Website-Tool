import { addPropertyControls, ControlType } from "framer"
import { useEffect, useMemo, useRef, useState } from "react"

// Stellenanzeiger — das Werkzeug auf /stellenanzeige.
//
// Zweck ist nicht das Werkzeug, sondern der Lead: Am Ende stehen Name, E-Mail und Telefon
// eines Betriebs, der gerade jemanden sucht.
//
// Gebaut wie /sichtbarkeit (SeoAnalyse.tsx) — gleiche Marke, gleiche Bausteine, gleiche
// Seitenfolge. Die Komponente trägt die ganze Seite, nicht nur das Formular: Auftakt mit
// einem einzigen Feld, der Beweis, was herauskommt, Wiedererkennung, was man bekommt, der
// Ablauf, Fragen und Antworten, Abzweig. Auf dem Handy ist der Auftakt die ganze Seite —
// ein Feld, ein Knopf, drei Etiketten.
//
// Die Fragen arbeiten doppelt:
//   fachlich   — Beruf, Dringlichkeit, Zahl der Stellen und Stärken gehen in die Anzeige ein
//   vertrieblich — dieselben Antworten qualifizieren den Lead
//
// Der Vorlauf: Sobald Adresse und Beruf stehen, läuft die Erzeugung los, während der
// Besucher die restlichen Fragen beantwortet (`?vorlauf=1` am Endpunkt, Antwort nur
// { bereit, betrieb }). Der zweite Aufruf trifft den Zwischenspeicher und kommt sofort.
// Die halbe Minute verschwindet damit nicht aus der Technik, aber aus dem Erleben.
//
// Vertrag des Endpunkts:
//   POST /api/stellenanzeige[?vorlauf=1]
//   { domain, beruf, dringlichkeit, stellen, erfahrung, staerken[], newsletter,
//     kontakt: { name, email, telefon } }
//   200 → { betrieb, kanaele:[{id,name,wofuer,stuecke:[{titel,felder:[{etikett,wert,
//            grenze,grenzeArt}]}]}], fragen:[×4], budget }
//   422 → { fehler: "seite_nicht_lesbar" | "beruf_unklar" | … }

const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const TINTE = "#0e0f12"
const PAPIER = "#f5f3ef"
const REIN = "#ffffff"
const DUNKEL = "#17161b"
const SIGNAL = "#ff5a1f"
const SIGNAL_TIEF = "#d9440f"
// Markenorange erreicht als Kleintext den Kontrast nicht — dafür diese beiden.
const AKZENT_HELL = "#B84116"
const AKZENT_DUNKEL = "#FF7341"

const T60 = "rgba(14, 15, 18, 0.6)"
// ▲ Stand einmal auf 0.42 und ergab gegen Papier **2,76:1** — die Etiketten über den
// Anzeigen, die Nummern und der Budgethinweis waren damit unlesbar für jeden, der nicht
// bei bester Beleuchtung auf ein gutes Display schaut. 0.62 ergibt 5,2:1.
const T40 = "rgba(14, 15, 18, 0.62)"
const LINIE = "rgba(14, 15, 18, 0.1)"
const LINIE_FEST = "rgba(14, 15, 18, 0.16)"
const P70 = "rgba(245, 243, 239, 0.7)"
// ▲ Stand einmal auf 0.45 und ergab gegen den dunklen Grund **4,18:1** — betroffen war
// die zweite Zeile jeder Antwort, die Bildunterzeile der Zahlen und „Zurück". 0.56
// ergibt 5,1:1. Der Name bleibt, damit die Stellen auffindbar bleiben.
const P45 = "rgba(245, 243, 239, 0.56)"
const LINIE_D = "rgba(245, 243, 239, 0.1)"

const STIL = `
.fw-sa { --rand: 20px; }
@media (min-width: 810px) { .fw-sa { --rand: 32px; } }

/* Zahlenreihe im Auftakt: auf dem Handy untereinander mit Trennlinien nach oben,
   ab 810 px nebeneinander mit Trennlinien nach links. */
.fw-sa-zahlen { display: grid; grid-template-columns: 1fr; }
.fw-sa-zahlen > * { padding: 22px 0 4px; border-top: 1px solid rgba(245,243,239,0.1); }
@media (min-width: 810px) {
  .fw-sa-zahlen { grid-template-columns: repeat(3, 1fr); }
  .fw-sa-zahlen > * { padding: 26px 0 4px 34px; border-top: none; border-left: 1px solid rgba(245,243,239,0.1); }
  .fw-sa-zahlen > *:first-child { padding-left: 0; border-left: none; }
}

/* Drei Karten in zwei Spalten lassen rechts unten ein Loch. Zweispaltig deshalb nur
   im mittleren Bereich, und dort zieht sich die letzte Karte über beide Spalten, wenn
   sie allein in ihrer Zeile stünde. Ab 1000 px stehen alle drei nebeneinander: Sie sind
   drei Fassungen derselben Sache und gehören nebeneinander, nicht untereinander. */
.fw-sa-karten { display: grid; gap: 14px; grid-template-columns: 1fr; }
@media (min-width: 810px) { .fw-sa-karten { gap: 20px; grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 810px) and (max-width: 999.98px) {
  .fw-sa-karten > :last-child:nth-child(odd) { grid-column: 1 / -1; }
}
@media (min-width: 1000px) { .fw-sa-karten { gap: 20px; grid-template-columns: repeat(3, 1fr); } }

.fw-sa-drei { display: grid; gap: 28px; grid-template-columns: 1fr; }
/* Erst ab 1000 px dreispaltig — bei 810 px waren die Spalten 214 px breit und
   brachen den Fließtext auf 23 Zeichen je Zeile. */
@media (min-width: 1000px) { .fw-sa-drei { gap: 44px; grid-template-columns: repeat(3, 1fr); } }

/* Die Nummer steht auf dem Handy über dem Satz: Als Spalte nahm sie 33 von 335 px
   und drückte die Sätze auf 26 Zeichen je Zeile. */
.fw-sa-satz { display: block; }
.fw-sa-satz > span:last-child { display: block; margin-top: 6px; }
@media (min-width: 620px) {
  .fw-sa-satz { display: flex; gap: 16px; align-items: baseline; }
  .fw-sa-satz > span:last-child { margin-top: 0; }
}

.fw-sa-zwei { display: grid; gap: 32px; grid-template-columns: 1fr; }
/* Zweispaltig erst, wenn die Überschrift nicht dreizeilig mit kurzer Mittelzeile
   bricht — bei 810 px tat sie genau das. Lücke 20 px wie bei den Karten, damit die
   zweite Kante auf der Kartenkante sitzt. */
@media (min-width: 1000px) { .fw-sa-zwei { gap: 20px; grid-template-columns: 1fr 1fr; } }

/* Die Eingabe im Auftakt: untereinander, ab 620 px nebeneinander. */
.fw-sa-eingabe { display: grid; gap: 10px; grid-template-columns: 1fr; align-items: stretch; }
@media (min-width: 620px) { .fw-sa-eingabe { grid-template-columns: 1fr auto; gap: 12px; } }
/* Feld und Knopf standen nebeneinander auf 57 und 48 px — die Unterkanten lagen
   neun Pixel auseinander. Jetzt beide auf Feldhöhe. */
/* Mit Vorrang, weil die Pille ihre 48 px als Inline-Stil mitbringt und der sonst
   gewinnt. Ohne das blieben Feld und Knopf nebeneinander neun Pixel versetzt. */
.fw-sa-eingabe > * > button, .fw-sa-eingabe > * > a { min-height: 57px !important; height: 100%; }
.fw-sa-eingabe > * { display: flex; }

/* Platzhalter sind Text und brauchen denselben Kontrast — 0.4 ergab 3,57:1. */
.fw-sa p { text-wrap: pretty; }
.fw-sa input::placeholder { color: rgba(245,243,239,0.56); }
.fw-sa .hell input::placeholder { color: rgba(14,15,18,0.62); }
.fw-sa *:focus-visible { outline: 2px solid ${SIGNAL}; outline-offset: 2px; }
/* Der Finger bekommt sofort Antwort, nicht erst der Zustandswechsel. */
.fw-sa button:not(:disabled):active,
.fw-sa a:active { transform: scale(0.975); }
.fw-sa button, .fw-sa a[href] { transform: scale(1); transition: transform 160ms ease-out !important; -webkit-tap-highlight-color: transparent; }
.fw-sa button:not(:disabled):active, .fw-sa a:active { transition: transform 110ms ease-out !important; }

/* Ein Schritt kommt von unten und geht nicht einfach um. */
@keyframes fw-sa-auf { from { opacity: 0; transform: translate3d(0, 8px, 0) } to { opacity: 1; transform: none } }
.fw-sa-schritt { animation: fw-sa-auf 220ms cubic-bezier(.16,1,.3,1) both; }
/* Entprellung an der Schrittgrenze: Der frisch eingeblendete Schritt nimmt 320 ms lang
   keine Tipps an, sonst erledigt der zweite Tipp eines Doppeltipps die nächste Frage. */
@keyframes fw-sa-taub { from { pointer-events: none } to { pointer-events: auto } }
.fw-sa-schritt { animation: fw-sa-auf 220ms cubic-bezier(.16,1,.3,1) both, fw-sa-taub 320ms step-end both; }

/* Durchscheinendes Glas braucht einen Rückfall, sonst steht Text auf dem Verlauf. */
@media (prefers-reduced-transparency: reduce) {
  .fw-sa-glas { background: rgba(23,22,27,0.96) !important; backdrop-filter: none !important; }
}
@media (prefers-contrast: more) {
  .fw-sa-glas { background: #141317 !important; border-color: rgba(245,243,239,0.4) !important; }
}

@media (prefers-reduced-motion: reduce) {
  .fw-sa *, .fw-sa *::before, .fw-sa *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; }
  .fw-sa-schritt { animation: none; }
}
`

const BREIT = 1240
const RAND = "clamp(20px, 4vw, 32px)"
const LUFT = "clamp(80px, 10vw, 150px)"
const RADIUS_KARTE = 16
const RADIUS_FELD = 12

// ---------------------------------------------------------------------------
// Bausteine — dieselben wie auf /sichtbarkeit, damit beide Werkzeuge erkennbar
// aus einem Haus kommen.
// ---------------------------------------------------------------------------

function Versal({ children, farbe, style }: { children: any; farbe?: string; style?: any }) {
    return (
        <div
            style={{
                fontSize: 11, fontWeight: 500, lineHeight: 1, letterSpacing: "0.12em",
                textTransform: "uppercase", color: farbe || AKZENT_HELL, ...style,
            }}
        >
            {children}
        </div>
    )
}

function Pfeil({ farbe, groesse = 13 }: { farbe: string; groesse?: number }) {
    return (
        <svg
            width={groesse} height={groesse} viewBox="0 0 24 24" fill="none"
            aria-hidden style={{ flex: "0 0 auto", transition: "transform 180ms ease" }}
        >
            <path d="M5 12h13M12 5.5 18.5 12 12 18.5" stroke={farbe} strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function Pille({
    children, onClick, href, art = "voll", auf = "hell", weit = false, aus = false,
}: {
    children: any
    onClick?: () => void
    href?: string
    art?: "voll" | "linie"
    auf?: "hell" | "dunkel"
    weit?: boolean
    aus?: boolean
}) {
    const [ueber, setUeber] = useState(false)
    const dunkelGrund = auf === "dunkel"
    const voll = art === "voll"
    const grund = voll ? (dunkelGrund ? PAPIER : TINTE) : "transparent"
    const schrift = voll ? (dunkelGrund ? TINTE : PAPIER) : dunkelGrund ? PAPIER : TINTE
    const pfeilFarbe = voll ? (dunkelGrund ? SIGNAL_TIEF : SIGNAL) : dunkelGrund ? SIGNAL : SIGNAL_TIEF
    const gemeinsam = {
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        font: "inherit", fontSize: 15, fontWeight: 500, letterSpacing: "-0.015em",
        background: grund, color: schrift,
        border: voll ? "1px solid transparent" : `1px solid ${dunkelGrund ? LINIE_D : LINIE_FEST}`,
        padding: "14px 22px", minHeight: 48, borderRadius: 999,
        textDecoration: "none", cursor: aus ? "default" : "pointer",
        width: weit ? "100%" : "auto", opacity: aus ? 0.4 : 1,
        transition: "opacity 160ms ease, background 160ms ease",
    } as const
    const inhalt = (
        <>
            <span>{children}</span>
            <span style={{ display: "inline-flex", transform: ueber && !aus ? "translateX(3px)" : "none", transition: "transform 180ms ease" }}>
                <Pfeil farbe={pfeilFarbe} />
            </span>
        </>
    )
    if (href) {
        return (
            <a href={href} style={gemeinsam} onMouseEnter={() => setUeber(true)} onMouseLeave={() => setUeber(false)}>
                {inhalt}
            </a>
        )
    }
    return (
        <button
            type="button" onClick={onClick} disabled={aus} style={gemeinsam}
            onMouseEnter={() => setUeber(true)} onMouseLeave={() => setUeber(false)}
        >
            {inhalt}
        </button>
    )
}

function Etikett({ children, auf = "hell" }: { children: any; auf?: "hell" | "dunkel" }) {
    const dunkelGrund = auf === "dunkel"
    return (
        <span
            style={{
                display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 500,
                letterSpacing: "-0.01em", padding: "6px 11px", borderRadius: 999,
                border: `1px solid ${dunkelGrund ? LINIE_D : LINIE}`,
                color: dunkelGrund ? P70 : T60,
            }}
        >
            {children}
        </span>
    )
}

function Geisterwort({ children, auf = "hell" }: { children: any; auf?: "hell" | "dunkel" }) {
    return (
        <div
            aria-hidden
            style={{
                fontSize: "clamp(3.4rem, 12vw, 8.5rem)", lineHeight: 0.82, fontWeight: 500,
                letterSpacing: "-0.055em", whiteSpace: "nowrap",
                color: auf === "dunkel" ? "rgba(245,243,239,0.07)" : "rgba(14,15,18,0.055)",
                marginBottom: "-0.1em", userSelect: "none", pointerEvents: "none",
                maxWidth: "100%", overflow: "hidden",
            }}
        >
            {children}
        </div>
    )
}

function Nummer({ n, auf = "hell" }: { n: number; auf?: "hell" | "dunkel" }) {
    return (
        <span
            style={{
                fontSize: 11, fontWeight: 500, letterSpacing: "0.12em",
                color: auf === "dunkel" ? P45 : T40, fontVariantNumeric: "tabular-nums",
                flex: "0 0 auto",
            }}
        >
            {String(n).padStart(2, "0")}
        </span>
    )
}

function Notenstrich({ note, farbe = TINTE, grund = LINIE, hoehe = 3 }: { note: number | null; farbe?: string; grund?: string; hoehe?: number }) {
    return (
        <div style={{ height: hoehe, background: grund, borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max(2, Math.min(100, note ?? 0))}%`, background: farbe, borderRadius: 999, transition: "width 420ms ease" }} />
        </div>
    )
}

function Abschnitt({
    grund = PAPIER, children, geist, auf = "hell", luft = LUFT,
}: {
    grund?: string
    children: any
    geist?: string
    auf?: "hell" | "dunkel"
    luft?: string
}) {
    return (
        <section style={{ background: grund, paddingBlock: luft, paddingLeft: RAND, paddingRight: RAND }}>
            <div style={{ maxWidth: BREIT, margin: "0 auto" }}>
                {geist ? <Geisterwort auf={auf}>{geist}</Geisterwort> : null}
                {children}
            </div>
        </section>
    )
}

function H2({ children, auf = "hell" }: { children: any; auf?: "hell" | "dunkel" }) {
    return (
        <h2
            style={{
                margin: 0, fontSize: "clamp(1.9rem, 5vw, 3.5rem)", lineHeight: 1.06,
                letterSpacing: "-0.05em", fontWeight: 500,
                color: auf === "dunkel" ? PAPIER : TINTE,
                maxWidth: "20ch", textWrap: "balance" as any,
            }}
        >
            {children}
        </h2>
    )
}

function Lead({ children, auf = "hell", max = 58 }: { children: any; auf?: "hell" | "dunkel"; max?: number }) {
    return (
        <p
            style={{
                margin: "22px 0 0", fontSize: 17, lineHeight: 1.6, letterSpacing: "-0.008em",
                color: auf === "dunkel" ? P70 : T60, maxWidth: `${max}ch`,
            }}
        >
            {children}
        </p>
    )
}

function Feld({
    kennung, wert, setWert, platzhalter, auf = "dunkel", gross = false, onEnter, ...rest
}: any) {
    const dunkelGrund = auf === "dunkel"
    return (
        <input
            id={kennung}
            value={wert}
            placeholder={platzhalter}
            onChange={(e: any) => setWert(e.target.value)}
            onKeyDown={(e: any) => {
                if (e.key !== "Enter" || !onEnter) return
                e.preventDefault()
                e.target.blur()
                onEnter()
            }}
            style={{
                width: "100%", font: "inherit", fontSize: gross ? 17 : 16,
                letterSpacing: "-0.008em",
                color: dunkelGrund ? PAPIER : TINTE,
                background: dunkelGrund ? "rgba(245,243,239,0.06)" : "rgba(14,15,18,0.03)",
                border: `1px solid ${dunkelGrund ? "rgba(245,243,239,0.14)" : LINIE_FEST}`,
                borderRadius: gross ? 999 : RADIUS_FELD,
                padding: gross ? "17px 24px" : "14px 16px",
                minHeight: gross ? 56 : 50, boxSizing: "border-box", outlineOffset: 2,
            }}
            {...rest}
        />
    )
}

// Tippfeld mit Vorschlägen. Sechs Treffer, nicht acht: Acht waren auf 375 px fünf Reihen
// und haben den Weiter-Knopf unter den Rand geschoben.
//
// Der Volltreffer bleibt in der Liste stehen. Wer „Koch" fertig tippt und die Zeile dann
// verschwinden sieht, liest das als „gibt es nicht" — dabei ist es die gemeinte Bezeichnung.
function Tippfeld({ wert, setWert, platzhalter, vorschlaege, weiter, kennung, auf = "dunkel", ...rest }: any) {
    const [offen, setOffen] = useState(false)
    const treffer = useMemo(() => {
        const roh = normal(String(wert || ""))
        if (roh.length < 2) return []
        const vorn: string[] = []
        const drin: string[] = []
        for (const v of vorschlaege) {
            const k = normal(v)
            if (k.indexOf(roh) === 0) vorn.push(v)
            else if (k.indexOf(roh) > 0) drin.push(v)
        }
        return vorn.concat(drin).slice(0, 6)
    }, [wert, vorschlaege])
    const dunkelGrund = auf === "dunkel"

    return (
        <div>
            <Feld
                kennung={kennung} wert={wert} setWert={setWert} platzhalter={platzhalter} auf={auf}
                autoComplete="off"
                onEnter={() => { if (String(wert).trim().length >= 2) weiter() }}
                onFocus={() => setOffen(true)}
                onBlur={() => window.setTimeout(() => setOffen(false), 140)}
                {...rest}
            />
            {offen && treffer.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                    {treffer.map((v: string) => (
                        <button
                            key={v}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setWert(v); setOffen(false) }}
                            style={{
                                font: "inherit", fontSize: 14, fontWeight: 500, letterSpacing: "-0.01em",
                                color: dunkelGrund ? P70 : T60, background: "transparent",
                                border: `1px solid ${dunkelGrund ? LINIE_D : LINIE}`,
                                borderRadius: 999, padding: "11px 15px", minHeight: 44, cursor: "pointer",
                            }}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

function Antwortknopf({ text, neben, gewaehlt, mehrfach = false, onClick, auf = "dunkel" }: any) {
    const dunkelGrund = auf === "dunkel"
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
                font: "inherit", cursor: "pointer", borderRadius: RADIUS_FELD,
                background: gewaehlt
                    ? dunkelGrund ? "rgba(245,243,239,0.1)" : "rgba(14,15,18,0.05)"
                    : dunkelGrund ? "rgba(245,243,239,0.04)" : "rgba(14,15,18,0.025)",
                border: `1px solid ${gewaehlt ? (dunkelGrund ? "rgba(245,243,239,0.4)" : LINIE_FEST) : dunkelGrund ? LINIE_D : LINIE}`,
                padding: "15px 18px", minHeight: 60,
                transition: "border-color 140ms ease, background 140ms ease",
            }}
        >
            {/* Rund heißt: eine Antwort. Eckig heißt: mehrere möglich. */}
            <span
                aria-hidden
                style={{
                    width: 17, height: 17, borderRadius: mehrfach ? 5 : "50%", flex: "0 0 auto",
                    border: `1px solid ${gewaehlt ? (dunkelGrund ? PAPIER : TINTE) : dunkelGrund ? "rgba(245,243,239,0.46)" : LINIE_FEST}`,
                    background: gewaehlt ? (dunkelGrund ? PAPIER : TINTE) : "transparent",
                    boxShadow: gewaehlt ? `inset 0 0 0 3.5px ${dunkelGrund ? DUNKEL : PAPIER}` : "none",
                }}
            />
            <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 17, fontWeight: 500, letterSpacing: "-0.03em", color: dunkelGrund ? PAPIER : TINTE }}>
                    {text}
                </span>
                {neben ? (
                    <span style={{ display: "block", marginTop: 3, fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: dunkelGrund ? P45 : T40 }}>
                        {neben}
                    </span>
                ) : null}
            </span>
        </button>
    )
}

function Haken({ an, setAn, text, auf = "dunkel" }: any) {
    const dunkelGrund = auf === "dunkel"
    return (
        <label
            style={{
                display: "flex", gap: 13, alignItems: "flex-start", cursor: "pointer",
                fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em",
                color: dunkelGrund ? P70 : T60, padding: "4px 0", minHeight: 36,
            }}
        >
            <input
                type="checkbox"
                checked={an}
                onChange={(e) => setAn(e.target.checked)}
                style={{ width: 19, height: 19, flex: "0 0 auto", marginTop: 1, accentColor: dunkelGrund ? PAPIER : TINTE }}
            />
            <span>{text}</span>
        </label>
    )
}

// ---------------------------------------------------------------------------
// Herkunft und Messung
//
// Ohne das lässt sich der Trichter nicht bezahlen: Man sieht weder, welche Anzeige den
// Lead gebracht hat, noch an welchem Schritt die Leute abspringen. Beides passiert hier
// und nirgendwo sonst.
// ---------------------------------------------------------------------------

const HERKUNFT_SCHLUESSEL = "fw-herkunft"

// UTM-Werte und Klick-Kennungen stehen nur beim ersten Aufruf in der Adresse. Wer im
// Trichter eine Seite weiterklickt oder neu lädt, hätte sie sonst verloren — deshalb
// einmal lesen und für die Sitzung behalten.
function herkunftLesen() {
    if (typeof window === "undefined") return null
    try {
        const gemerkt = window.sessionStorage.getItem(HERKUNFT_SCHLUESSEL)
        const p = new URLSearchParams(window.location.search)
        const hat = (k: string) => (p.get(k) || "").trim().slice(0, 80)
        const klick =
            hat("gclid") || hat("fbclid") || hat("ttclid") || hat("msclkid") || hat("li_fat_id")
        const utmQuelle = hat("utm_source")
        if (!utmQuelle && !klick) return gemerkt ? JSON.parse(gemerkt) : null
        const h = {
            // Steht kein utm_source in der Adresse, verrät die Klick-Kennung das Netz.
            quelle:
                utmQuelle ||
                (hat("fbclid") ? "meta" : hat("gclid") ? "google" : hat("ttclid") ? "tiktok" : hat("msclkid") ? "microsoft" : "anzeige"),
            kampagne: hat("utm_campaign") || null,
            anzeige: hat("utm_content") || hat("utm_term") || klick || null,
            klick_id: klick || null,
            medium: hat("utm_medium") || null,
        }
        window.sessionStorage.setItem(HERKUNFT_SCHLUESSEL, JSON.stringify(h))
        return h
    } catch (e) {
        return null
    }
}

// Ein Ereignis je Schritt. Kein eigener Zähldienst: Was hier herausgeht, nimmt der
// Tag-Manager auf, wenn einer läuft, und sonst hört ein Skript auf der Seite mit.
// Google Analytics lädt erst nach der Einwilligung — `gtag` fehlt also oft, und das ist
// richtig so. Die Ereignisse gehen trotzdem raus und bleiben nachrüstbar.
function melde(name: string, daten: Record<string, any> = {}) {
    if (typeof window === "undefined") return
    const w = window as any
    try {
        w.dataLayer = w.dataLayer || []
        w.dataLayer.push({ event: name, werkzeug: "stellenanzeige", ...daten })
        if (typeof w.gtag === "function") w.gtag("event", name, { werkzeug: "stellenanzeige", ...daten })
        window.dispatchEvent(new CustomEvent("fw:" + name, { detail: daten }))
    } catch (e) {
        // Messung darf den Trichter nie aufhalten.
    }
}

// ---------------------------------------------------------------------------
// Inhalt
// ---------------------------------------------------------------------------

// Für den Vergleich alles kleinschreiben, Umlaute auflösen, Binde- und Leerzeichen weg:
// „kfz mecha", „Kfz-Mecha" und „KFZMECHA" sollen dasselbe finden.
function normal(w: string) {
    return w
        .toLowerCase()
        .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]/g, "")
}

// Bezeichnungen für die Vervollständigung. Bewusst breit — sechs feste Handwerksberufe
// sahen aus, als sei das Werkzeug nur dafür. Die Liste engt nichts ein: Wer etwas anderes
// sucht, tippt es zu Ende.
const BERUFE = [
    "Kfz-Mechatroniker", "Kfz-Mechaniker", "Kfz-Servicetechniker", "Karosseriebauer",
    "Fahrzeuglackierer", "Zweiradmechaniker", "Landmaschinenmechaniker", "Servicetechniker",
    "Industriemechaniker", "Zerspanungsmechaniker", "Schweißer", "Metallbauer", "Schlosser",
    "Maschinenbediener", "Mechatroniker", "Monteur",
    "Anlagenmechaniker SHK", "Heizungsbauer", "Sanitärinstallateur", "Elektroniker",
    "Elektriker", "Dachdecker", "Zimmerer", "Maurer", "Fliesenleger", "Trockenbauer",
    "Maler und Lackierer", "Stuckateur", "Bodenleger", "Glaser", "Tischler", "Schreiner",
    "Straßenbauer", "Bauhelfer", "Bauleiter", "Polier", "Gerüstbauer",
    "Landschaftsgärtner", "Gärtner", "Forstwirt", "Hausmeister", "Schornsteinfeger",
    "Koch", "Küchenhilfe", "Beikoch", "Küchenchef", "Servicekraft", "Kellner", "Barkeeper",
    "Restaurantfachmann", "Hotelfachmann", "Rezeptionist", "Zimmermädchen", "Bäcker",
    "Konditor", "Metzger", "Fleischer", "Verkäufer in der Bäckerei",
    "Pflegefachkraft", "Altenpfleger", "Gesundheits- und Krankenpfleger", "Pflegehelfer",
    "Medizinische Fachangestellte", "Zahnmedizinische Fachangestellte", "Zahntechniker",
    "Physiotherapeut", "Ergotherapeut", "Logopäde", "Hebamme", "Betreuungskraft",
    "Augenoptiker", "Hörakustiker", "Orthopädietechniker",
    "Verkäufer", "Einzelhandelskaufmann", "Bürokaufmann", "Bürokraft", "Buchhalter",
    "Steuerfachangestellte", "Sachbearbeiter", "Assistenz der Geschäftsführung",
    "Empfangskraft", "Vertriebsmitarbeiter", "Außendienstmitarbeiter", "Kundenberater",
    "Berufskraftfahrer", "LKW-Fahrer", "Auslieferungsfahrer", "Kurierfahrer", "Lagerist",
    "Fachkraft für Lagerlogistik", "Staplerfahrer", "Disponent", "Produktionshelfer",
    "Reinigungskraft", "Gebäudereiniger", "Glasreiniger", "Objektleiter",
    "Friseur", "Barbier", "Kosmetiker", "Nageldesigner", "Fußpfleger",
    "Erzieher", "Kinderpfleger", "Sozialpädagoge", "Pädagogische Fachkraft",
    "Mediengestalter", "Grafikdesigner", "Social-Media-Manager", "Online-Marketing-Manager",
    "Fachinformatiker", "IT-Systemadministrator", "Webentwickler", "Technischer Zeichner",
]

interface Frage {
    id: "beruf" | "dringlichkeit" | "stellen" | "erfahrung" | "staerken"
    art: "text" | "eine" | "mehrere"
    frage: string
    hinweis: string
    platzhalter?: string
    vorschlaege?: string[]
    optionen?: { wert: string; text: string; neben?: string }[]
}

const FRAGEN: Frage[] = [
    {
        id: "beruf",
        art: "text",
        frage: "Wen suchen Sie?",
        hinweis: "Die Bezeichnung, die in Ihrem Betrieb üblich ist. Sie steht später in der Überschrift der Anzeige — danach suchen die Leute.",
        platzhalter: "z. B. Kfz-Mechatroniker",
        vorschlaege: BERUFE,
    },
    {
        id: "dringlichkeit",
        art: "eine",
        frage: "Wie schnell muss die Stelle besetzt sein?",
        hinweis: "Das entscheidet über den Ton der Anzeige und über das Budget, das wir Ihnen nennen.",
        optionen: [
            { wert: "sofort", text: "So schnell wie möglich", neben: "Die Arbeit liegt schon da" },
            { wert: "wochen", text: "In den nächsten Wochen", neben: "Es drückt, aber es brennt nicht" },
            { wert: "planung", text: "Wir planen vor", neben: "Für die kommende Saison" },
        ],
    },
    {
        id: "stellen",
        art: "eine",
        frage: "Wie viele Stellen sind offen?",
        hinweis: "Für mehrere Stellen schreibt man anders — und das Budget sieht anders aus.",
        optionen: [
            { wert: "eine", text: "Eine", neben: "Eine Person, eine Aufgabe" },
            { wert: "zwei_drei", text: "Zwei bis drei", neben: "Das Team soll wachsen" },
            { wert: "mehr", text: "Mehr als drei", neben: "Wir bauen auf" },
        ],
    },
    {
        id: "erfahrung",
        art: "eine",
        frage: "Haben Sie schon einmal Anzeigen bei Facebook oder Instagram geschaltet?",
        hinweis: "Damit die Budgetzeile zu Ihrem Stand passt und nicht zu irgendeinem.",
        optionen: [
            { wert: "laeuft", text: "Ja, läuft gerade", neben: "Wir werben schon" },
            { wert: "probiert", text: "Schon probiert, hat wenig gebracht", neben: "Einmal versucht, dann gelassen" },
            { wert: "nie", text: "Noch nie", neben: "Bisher nur Stellenportale oder gar nichts" },
        ],
    },
    {
        id: "staerken",
        art: "mehrere",
        frage: "Was spricht bei Ihnen für die Stelle?",
        hinweis: "Mehreres möglich. Genau das steht später in den Anzeigen — statt „wir bieten ein nettes Team\".",
        optionen: [
            { wert: "bezahlung", text: "Bezahlung über dem Üblichen", neben: "Mehr als Tarif oder Ortsschnitt" },
            { wert: "feierabend", text: "Geregelter Feierabend", neben: "Keine Dauer-Überstunden" },
            { wert: "team", text: "Kleines, eingespieltes Team", neben: "Man kennt sich" },
            { wert: "technik", text: "Moderne Ausrüstung", neben: "Werkzeug und Maschinen auf Stand" },
            { wert: "aufstieg", text: "Weiterbildung und Aufstieg", neben: "Meister, Lehrgänge, mehr Verantwortung" },
            { wert: "sicherheit", text: "Sicherer Arbeitsplatz", neben: "Volle Auftragsbücher, unbefristet" },
            // Ohne diese Zeile musste ankreuzen, wer nichts davon bieten kann — und die
            // Behauptung stand danach in einer echten Stellenanzeige.
            { wert: "nichts", text: "Nichts davon trifft zu", neben: "Schreibt nur, was auf meiner Website steht" },
        ],
    },
]

const SCHRITT_ADRESSE = 0
const SCHRITT_KONTAKT = FRAGEN.length + 1
const SCHRITTE_GESAMT = FRAGEN.length + 2

const EINWILLIGUNGSTEXT =
    "Fokuswerk darf mir die Anzeigen schicken und sich zu dieser Anfrage melden. Jederzeit widerrufbar, die Angaben gehen an niemanden sonst."
const NEWSLETTER_TEXT =
    "Schickt mir außerdem, was bei anderen Betrieben funktioniert hat — ein paar Mal im Jahr, jederzeit abbestellbar. Freiwillig."

// Seit aus drei Anzeigen eine Mappe für drei Kanäle geworden ist, braucht die Antwort rund
// 70 bis 80 Sekunden (gemessen am 27.10.2026). Läuft der Vorlauf, ist sie beim Absenden
// meist schon fertig und es erscheint gar kein Ladetext. Die Marken müssen trotzdem zur
// echten Dauer passen: „Gleich fertig" nach 16 Sekunden war eine Lüge.
const LAUFTEXTE = [
    { ab: 0, text: "Wir lesen Ihre Website." },
    { ab: 8, text: "Wir sehen nach, was Ihren Betrieb ausmacht." },
    { ab: 20, text: "Wir schreiben die Anzeige für Kleinanzeigen." },
    { ab: 38, text: "Jetzt die Fassungen für Facebook und Instagram." },
    { ab: 55, text: "Zuletzt Ihre Karriereseite, das Drehbuch und die Anleitung." },
    { ab: 85, text: "Dauert heute etwas länger. Bitte bleiben Sie noch einen Moment." },
]

const FEHLERTEXTE: Record<string, { titel: string; hinweis: string; zurueck: number }> = {
    domain_fehlt: {
        titel: "Die Adresse Ihrer Website fehlt",
        hinweis: "Tragen Sie die Adresse ein, unter der Ihr Betrieb erreichbar ist.",
        zurueck: SCHRITT_ADRESSE,
    },
    beruf_fehlt: {
        titel: "Der gesuchte Beruf fehlt",
        hinweis: "Tragen Sie ein, wen Sie suchen — möglichst mit der üblichen Berufsbezeichnung.",
        zurueck: 1,
    },
    seite_nicht_lesbar: {
        titel: "Wir konnten diese Seite nicht abrufen",
        hinweis: "Stimmt die Adresse? Möglich ist auch, dass die Seite gerade nicht erreichbar ist oder hinter einem Schutz steht. Prüfen Sie die Schreibweise und versuchen Sie es noch einmal.",
        zurueck: SCHRITT_ADRESSE,
    },
    beruf_unklar: {
        titel: "Dieser Beruf passt nicht zu dem Betrieb auf dieser Seite",
        hinweis: "Prüfen Sie, ob Adresse und Beruf zusammengehören. Hilfreich ist die Bezeichnung, die in Ihrem Betrieb üblich ist — also „Kfz-Mechatroniker\" statt „Mitarbeiter\".",
        zurueck: 1,
    },
    zu_viele_abrufe: {
        titel: "Bitte in ein paar Minuten noch einmal",
        hinweis: "Von dieser Verbindung kamen gerade viele Anfragen. Das ist eine Bremse gegen Dauerfeuer, keine Sperre für Sie.",
        zurueck: -1,
    },
    modell: {
        titel: "Da ist bei uns etwas schiefgegangen",
        hinweis: "Bitte noch einmal versuchen. Bleibt es dabei, schreiben Sie uns kurz — dann schicken wir Ihnen die Anzeigen von Hand.",
        zurueck: -1,
    },
    netz: {
        titel: "Die Verbindung kam nicht zustande",
        hinweis: "Das lag an uns, nicht an Ihnen. Versuchen Sie es in einem Moment noch einmal.",
        zurueck: -1,
    },
}

// Der Endpunkt meldet mehrere Modellfehler (modell_nicht_erreichbar, modell_antwortet_nicht …).
// Für den Nutzer sind die alle dasselbe.
function fehlerText(code: string) {
    if (code && code.indexOf("modell") === 0) return FEHLERTEXTE.modell
    return FEHLERTEXTE[code] || FEHLERTEXTE.netz
}

// Ein Feld ist eine Eingabe, die der Betrieb irgendwo einträgt — ein Titel, ein
// Anzeigentext, ein Abschnitt seiner Karriereseite.
//
// grenzeArt "max"     — harte Grenze der Plattform. Darüber wird abgeschnitten.
// grenzeArt "schnitt" — dort blendet die Plattform „… mehr" ein. Längeres geht nicht
//                       verloren, es wird nur zunächst nicht gelesen.
interface Feld { etikett: string; wert: string; grenze?: number; grenzeArt?: "max" | "schnitt"; ohneKopie?: boolean }
interface Stueck { titel?: string | null; felder: Feld[] }
interface Kanal { id: string; name: string; wofuer: string; stuecke: Stueck[] }

interface Marktlage {
    gebiet: string
    stand: string
    berufsgruppe: string
    vakanzzeit: number
    vakanzzeitWort: string
    anteilDreiMonate: number | null
    arbeitsloseJe100: number | null
    knapp: boolean
    quelle: { text: string; link: string }
}

interface Ergebnis {
    betrieb: string
    // Amtliche Zahlen. Fehlt die Zuordnung zur Berufsgruppe, fehlt der ganze Block —
    // lieber nichts als eine Zahl aus der falschen Gruppe.
    marktlage?: Marktlage | null
    kanaele: Kanal[]
    // Anleitung, Drehbuch, Antworten, Wochenplan — gleiche Form wie ein Kanal, damit
    // dieselbe Darstellung greift. Älteren Ergebnissen fehlt das Feld.
    mappe?: Kanal[]
    fragen: string[]
    budget: string
}

// Echtes Ergebnis eines Durchlaufs, hier als Beweis, was herauskommt. Steht ausdrücklich
// als Beispiel da — es ist nicht die Seite des Besuchers.
const BEISPIEL: Ergebnis = {
    betrieb: "Knolle Garten- und Landschaftsbau",
    kanaele: [
        {
            id: "kleinanzeigen",
            name: "Kleinanzeigen",
            wofuer:
                "Kostenlos inserieren auf kleinanzeigen.de. Dort suchen Leute, die gerade wirklich " +
                "etwas Neues wollen — sachlich und vollständig geschrieben, nicht als Werbung.",
            stuecke: [
                {
                    titel: null,
                    felder: [
                        { etikett: "Titel", wert: "Landschaftsgärtner (m/w/d) in Harpstedt, ab sofort", grenze: 65, grenzeArt: "max" },
                        {
                            etikett: "Anzeigentext",
                            wert:
                                "Knolle in Harpstedt sucht ab sofort zwei bis drei Landschaftsgärtner (m/w/d). Die Arbeit liegt schon da.\n\n" +
                                "Gearbeitet wird im Großraum Bremen, Wildeshausen und Oldenburg: neue Privatgärten, Pflaster- und Natursteinarbeiten, Teich- und Schwimmteichbau.\n\n" +
                                "Der Betrieb bietet einen unbefristeten Arbeitsplatz, Werkzeug und Maschinen auf Stand und einen geregelten Feierabend ohne Dauer-Überstunden.\n\n" +
                                "[Bitte eintragen: Verdienst, z. B. \"ab 3.400 Euro brutto\"]\n\n" +
                                "Bewerben geht ohne Mappe: vier kurze Fragen, etwa zwei Minuten.",
                        },
                    ],
                },
            ],
        },
        {
            id: "meta",
            name: "Facebook und Instagram",
            wofuer:
                "Bezahlte Anzeige. Hier scrollt jemand, der gar nicht sucht — deshalb drei Fassungen " +
                "mit verschiedenen Aufhängern, die man gegeneinander laufen lässt.",
            stuecke: [
                {
                    titel: "Was die Stelle bietet",
                    felder: [
                        { etikett: "Primärtext", grenze: 125, grenzeArt: "schnitt", wert: "Bezahlung über dem Üblichen, Maschinen auf Stand und ein geregelter Feierabend.\n\nKnolle in Harpstedt sucht ab sofort zwei bis drei Landschaftsgärtner.\n\nVier Fragen, zwei Minuten, keine Mappe: So bewirbst du dich." },
                        { etikett: "Überschrift", wert: "Landschaftsgärtner in Harpstedt", grenze: 40, grenzeArt: "max" },
                        { etikett: "Beschreibung", wert: "Ab sofort, 2–3 Stellen", grenze: 30, grenzeArt: "max" },
                    ],
                },
                {
                    titel: "Die Arbeit",
                    felder: [
                        { etikett: "Primärtext", grenze: 125, grenzeArt: "schnitt", wert: "Natursteinmauern, Pflasterwege, Holzterrassen, Schwimmteiche: Das ist dein Arbeitsalltag bei Knolle.\n\nIm Privatgarten planst du dein Stück selbst.\n\nBeantworte vier Fragen, zwei Minuten reichen." },
                        { etikett: "Überschrift", wert: "Pflaster, Naturstein, Teichbau", grenze: 40, grenzeArt: "max" },
                        { etikett: "Beschreibung", wert: "Knolle, Harpstedt", grenze: 30, grenzeArt: "max" },
                    ],
                },
                {
                    titel: "Der Betrieb",
                    felder: [
                        { etikett: "Primärtext", grenze: 125, grenzeArt: "schnitt", wert: "Vierte Generation, über 100 Jahre, und die Arbeit liegt schon da: Knolle in Harpstedt.\n\nFür zwei bis drei Landschaftsgärtner ist ab sofort Platz.\n\nVier Fragen beantworten, zwei Minuten, fertig." },
                        { etikett: "Überschrift", wert: "Familienbetrieb in Harpstedt", grenze: 40, grenzeArt: "max" },
                        { etikett: "Beschreibung", wert: "Seit über 100 Jahren", grenze: 30, grenzeArt: "max" },
                    ],
                },
            ],
        },
        {
            id: "karriereseite",
            name: "Ihre eigene Seite",
            wofuer:
                "Die vollständige Fassung für Ihre Website. Sie bleibt stehen, wird bei Google " +
                "gefunden, und auf sie können alle anderen Kanäle verweisen.",
            stuecke: [
                {
                    titel: null,
                    felder: [
                        { etikett: "Überschrift", wert: "Landschaftsgärtner (m/w/d) in Harpstedt" },
                        { etikett: "Einleitung", wert: "Knolle in Harpstedt ist ein Familienbetrieb für Garten- und Landschaftsbau in vierter Generation. Gesucht werden ab sofort zwei bis drei Landschaftsgärtner (m/w/d)." },
                        { etikett: "Das machst du", wert: "Neuanlage privater Gärten\nPflaster- und Natursteinarbeiten\nBau von Teichen und Schwimmteichen\nSelbstständige Abwicklung von Baustellen" },
                        { etikett: "Das bringst du mit", wert: "Abgeschlossene Ausbildung in der Grünen Branche\nErfahrung in Pflaster- und Natursteinarbeiten\nFührerschein mindestens Klasse B/BE" },
                        { etikett: "Das bieten wir", wert: "[Bitte eintragen: Verdienst, z. B. \"ab 3.400 Euro brutto\"]\nBezahlung über dem Üblichen\nWerkzeug und Maschinen auf Stand\nGeregelter Feierabend, keine Dauer-Überstunden" },
                        { etikett: "So bewirbst du dich", wert: "Beantworte vier kurze Fragen zu deiner Tätigkeit, deiner Erfahrung, deinem Start und der Entfernung. Das dauert etwa zwei Minuten, eine Mappe brauchst du nicht." },
                    ],
                },
            ],
        },
    ],
    fragen: [
        "Haben Sie eine abgeschlossene Ausbildung im Garten- und Landschaftsbau?",
        "Besitzen Sie einen Führerschein der Klasse B?",
        "Ab wann könnten Sie anfangen?",
        "Wie erreichen wir Sie am besten?",
    ],
    budget: "Für zwei bis drei Stellen im Umkreis von Harpstedt rechnen Sie mit 15 bis 25 Euro am Tag über vier Wochen.",
}

const WIEDERERKENNEN = [
    "Die Anzeige steht seit sechs Wochen online. Zwei Bewerbungen, beide unpassend.",
    "Sie wissen, dass Sie bei Facebook und Instagram werben müssten, und schieben es seit Monaten.",
    "Der Text, der zuletzt funktioniert hat, ist fünf Jahre alt.",
    "Sie haben einmal eine Anzeige geschaltet. Es kam nichts, und keiner konnte sagen, warum.",
    "Die Aufträge sind da. Die Leute dafür nicht.",
    "Beim Schreiben kommt immer dasselbe heraus: „Wir bieten ein nettes Team und gute Bezahlung.\"",
]

const WAS_SIE_BEKOMMEN = [
    {
        titel: "Drei Kanäle, drei Fassungen",
        text: "Dieselbe Stelle für Kleinanzeigen, für Facebook und Instagram und für Ihre eigene Seite — jeweils in dem Format, das dort verlangt wird. Mit Zeichenzahl, damit nichts abgeschnitten wird.",
    },
    {
        titel: "Die Anleitung dazu",
        text: "Zehn Schritte durch den Werbeanzeigenmanager, mit Ihrem Ort, Ihrem Umkreis und Ihrem Tagesbudget. Dazu ein Drehbuch für ein Handyvideo in zwanzig Minuten und die ersten drei Antworten an Bewerber.",
    },
    {
        titel: "Vier Fragen für die Bewerbung",
        text: "Die Fragen, die im Formular stehen sollten, damit Sie nach der Bewerbung wissen, ob sich der Rückruf lohnt. Kein Lebenslauf nötig.",
    },
    {
        titel: "Eine Budgetzeile",
        text: "Was die Ausspielung in Ihrer Gegend ungefähr kostet, bezogen auf die Zahl der Stellen und die Dringlichkeit, die Sie angegeben haben.",
    },
    {
        titel: "Aus Ihrer Website, nicht aus dem Nichts",
        text: "Wir lesen vorher Ihre Seite: Leistungen, Orte, Ton. Was dort steht, steht in den Anzeigen. Deshalb klingen sie nach Ihnen und nicht nach Vorlage.",
    },
]

const ABLAUF = [
    { titel: "Adresse und Beruf", text: "Zwei Angaben. Während Sie die restlichen Fragen beantworten, liest das Werkzeug schon Ihre Seite." },
    { titel: "Vier Fragen", text: "Dringlichkeit, Zahl der Stellen, bisherige Erfahrung, Stärken der Stelle. Alles zum Antippen." },
    { titel: "Ergebnis", text: "Die Anzeigen stehen hier auf der Seite und kommen zusätzlich per Mail. Danach melden wir uns einmal — sagen Sie nein, war es das." },
]

const FAQ = [
    {
        frage: "Was kostet das?",
        antwort: "Nichts. Keine Anmeldung, kein Konto, keine Zahlungsdaten. Sie bekommen die Anzeigen auch dann, wenn daraus nie ein Auftrag wird.",
    },
    {
        frage: "Warum brauchen Sie meine Telefonnummer?",
        antwort: "Für den einen Anruf danach. Wir fragen, ob wir die Ausspielung übernehmen sollen. Sagen Sie nein, war es das — die Anzeigen behalten Sie.",
    },
    {
        frage: "Sind die Texte wirklich brauchbar oder nur Füllmaterial?",
        antwort: "Sie entstehen aus dem Inhalt Ihrer Website und aus Ihren Angaben, nicht aus einer Vorlage. Oben auf dieser Seite steht ein echtes Ergebnis — sehen Sie selbst, bevor Sie etwas eingeben.",
    },
    {
        frage: "Reicht die Anzeige allein, damit sich jemand meldet?",
        antwort: "Nein. Die Anzeige ist der kleinere Teil. Wer sie sieht, bei welchem Budget und wie die Bewerbung hereinkommt, entscheidet mehr. Deshalb steht am Ende eine Budgetzeile und keine Erfolgsgarantie.",
    },
    {
        frage: "Was passiert mit meinen Daten?",
        antwort: "Sie bleiben bei uns. Für die Texte wird der öffentliche Inhalt Ihrer Website an Anthropic übertragen — das steht in der Datenschutzerklärung. Weitergegeben wird nichts.",
    },
]

function Fortschritt({ schritt, auf = "dunkel" }: { schritt: number; auf?: "hell" | "dunkel" }) {
    // Der Balken zeigt denselben Stand wie die Zeile daneben. Vorher stand „Schritt 1 von 6"
    // neben „29 %" — das ist 2/7 und widerspricht der Zeile.
    const anteil = Math.round((schritt / (SCHRITTE_GESAMT - 1)) * 100)
    const dunkelGrund = auf === "dunkel"
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}>
                <Versal farbe={dunkelGrund ? P45 : T40}>Schritt {schritt} von {SCHRITTE_GESAMT - 1}</Versal>
            </div>
            <Notenstrich
                note={anteil} hoehe={2}
                farbe={dunkelGrund ? PAPIER : TINTE}
                grund={dunkelGrund ? LINIE_D : LINIE}
            />
        </div>
    )
}

// ---------------------------------------------------------------------------
// Das Blatt — die drei Anzeigen
//
// Es erscheint zweimal: oben angeschnitten als Beweis, was herauskommt, und als Ergebnis
// vollständig. Dieselbe Darstellung, damit Versprechen und Ergebnis erkennbar dasselbe sind.
// ---------------------------------------------------------------------------

function Absaetze({ text, farbe }: { text: string; farbe: string }) {
    return (
        <>
            {String(text || "").split("\n").map((z, i) =>
                z.trim() ? (
                    <p key={i} style={{ margin: i === 0 ? 0 : "10px 0 0", fontSize: 16, lineHeight: 1.62, letterSpacing: "-0.005em", color: farbe }}>
                        {z.trim()}
                    </p>
                ) : null
            )}
        </>
    )
}

// Der Teil eines Textes, den die Plattform ohne Klick zeigt. Statt „311 von 125 Zeichen —
// zu lang" zu melden (was falsch wäre: nichts geht verloren), wird der sichtbare Anfang
// dunkel und der Rest hell gesetzt. Man sieht dann sofort, ob der Aufhänger vorn steht.
// Wo die Plattform abschneidet, liegt selten eine Wortgrenze. Hart bei Zeichen 125 zu
// trennen las sich wie ein Tippfehler („Harpst … mehr edt"), deshalb zurück bis zum
// letzten Leerzeichen — nur wenn eines in Reichweite ist, sonst bleibt es hart.
function schnittstelle(text: string, grenze: number) {
    if (text.length <= grenze) return grenze
    const raum = text.lastIndexOf(" ", grenze)
    return raum > grenze - 18 ? raum : grenze
}

function Angeschnitten({ text, grenze }: { text: string; grenze: number }) {
    const voll = String(text || "")
    const schnitt = schnittstelle(voll, grenze)
    const absaetze = voll.split(/\n+/).filter(Boolean)
    let gelesen = 0
    return (
        <div style={{ display: "grid", gap: 10 }}>
            {absaetze.map((a, i) => {
                const start = gelesen
                gelesen += a.length + 1
                const rest = schnitt - start
                const sichtbar = rest <= 0 ? "" : a.slice(0, rest)
                const verdeckt = rest <= 0 ? a : a.slice(rest)
                return (
                    <p key={i} style={{ margin: 0, fontSize: 16, lineHeight: 1.62, letterSpacing: "-0.005em" }}>
                        {sichtbar ? <span style={{ color: TINTE }}>{sichtbar}</span> : null}
                        {sichtbar && verdeckt ? (
                            <span style={{ color: AKZENT_HELL, fontSize: 13, letterSpacing: "-0.01em" }}>{" … mehr "}</span>
                        ) : null}
                        {verdeckt ? <span style={{ color: T40 }}>{verdeckt}</span> : null}
                    </p>
                )
            })}
        </div>
    )
}

// Ein Eingabefeld der Zielplattform: Beschriftung, Zeichenzahl, Kopierknopf, Inhalt.
// Je Feld ein eigener Knopf, weil man sie drüben auch einzeln einträgt.
function FeldBlock({ feld, kopieren, kopiert }: { feld: Feld; kopieren: (t: string) => void; kopiert: boolean }) {
    const n = String(feld.wert || "").length
    const drueber = !!feld.grenze && feld.grenzeArt === "max" && n > feld.grenze
    const zaehler = !feld.grenze
        ? null
        : feld.grenzeArt === "max"
          ? n + " von " + feld.grenze + " Zeichen"
          : "sichtbar: die ersten " + feld.grenze + " Zeichen"

    return (
        <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <Versal farbe={T40}>{feld.etikett}</Versal>
                {zaehler ? (
                    <span style={{ fontSize: 12, letterSpacing: "-0.01em", color: drueber ? AKZENT_HELL : T40, fontVariantNumeric: "tabular-nums" }}>
                        {drueber ? zaehler + " — bitte kürzen" : zaehler}
                    </span>
                ) : null}
                {!feld.ohneKopie ? (
                <button
                    type="button"
                    onClick={() => kopieren(feld.wert)}
                    style={{
                        marginLeft: "auto", font: "inherit", fontSize: 12, fontWeight: 500,
                        letterSpacing: "-0.01em", color: kopiert ? AKZENT_HELL : T60,
                        background: "transparent", border: `1px solid ${LINIE}`, borderRadius: 999,
                        padding: "7px 13px", minHeight: 36, cursor: "pointer",
                    }}
                >
                    {kopiert ? "Kopiert" : "Kopieren"}
                </button>
                ) : null}
            </div>
            {feld.grenzeArt === "schnitt" && feld.grenze ? (
                <Angeschnitten text={feld.wert} grenze={feld.grenze} />
            ) : (
                <Absaetze text={feld.wert} farbe={TINTE} />
            )}
        </div>
    )
}

// Ein Block — ein Kanal oder ein Teil der Mappe. Beide haben dieselbe Form, deshalb
// dieselbe Darstellung: Name, wofür er da ist, darunter die Felder.
// Die Marktlage eröffnet den Bericht. Dunkel wie der Auftakt der Seite: Das hier ist
// keine Lieferung, sondern der Befund, gegen den die Lieferung antritt.
//
// Die Quellenzeile ist Pflicht, nicht Zierde: Die Statistik der BA erlaubt die Nutzung
// ihrer Daten mit Quellenangabe und Verlinkung. Nie ohne sie ausliefern.
function MarktlageKarte({ lage }: { lage: Marktlage }) {
    const zahl = (w: number | null) =>
        w === null || w === undefined ? "—" : String(w).replace(".", ",")

    return (
        <div
            style={{
                background: DUNKEL, borderRadius: RADIUS_KARTE,
                padding: "clamp(24px, 4vw, 38px)", color: PAPIER,
            }}
        >
            <Versal farbe={AKZENT_DUNKEL}>Die Lage in Ihrem Beruf</Versal>

            <div style={{ marginTop: 22, display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: "clamp(3.4rem, 11vw, 5.6rem)", lineHeight: 0.9, fontWeight: 500, letterSpacing: "-0.055em", fontVariantNumeric: "tabular-nums" }}>
                    {lage.vakanzzeit}
                </span>
                <span style={{ fontSize: 19, lineHeight: 1.35, letterSpacing: "-0.03em", color: P70, maxWidth: "24ch" }}>
                    Tage bleibt eine gemeldete Stelle in Ihrem Beruf im Schnitt offen
                </span>
            </div>

            <p style={{ margin: "20px 0 0", fontSize: 17, lineHeight: 1.55, letterSpacing: "-0.03em", color: PAPIER, maxWidth: "52ch" }}>
                Das sind {lage.vakanzzeitWort}. Wenn Sie seit Wochen suchen, liegt das nicht an
                Ihnen{lage.knapp ? " — auf 100 offene Stellen kommen nicht einmal 150 Arbeitslose, die dafür infrage kommen." : "."}
            </p>

            <div style={{ marginTop: 26, display: "grid", gap: 14 }}>
                {[
                    lage.anteilDreiMonate !== null
                        ? { wert: zahl(lage.anteilDreiMonate) + " %", text: "der gemeldeten Stellen stehen länger als drei Monate offen" }
                        : null,
                    lage.arbeitsloseJe100 !== null
                        ? { wert: zahl(lage.arbeitsloseJe100), text: "Arbeitslose kommen auf 100 offene Stellen" }
                        : null,
                ]
                    .filter(Boolean)
                    .map((z: any, i) => (
                        <div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline", borderTop: `1px solid ${LINIE_D}`, paddingTop: 14 }}>
                            <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.04em", minWidth: "4.5em", fontVariantNumeric: "tabular-nums" }}>
                                {z.wert}
                            </span>
                            <span style={{ fontSize: 15, lineHeight: 1.5, letterSpacing: "-0.02em", color: P70 }}>{z.text}</span>
                        </div>
                    ))}
            </div>

            <p style={{ margin: "24px 0 0", fontSize: 13, lineHeight: 1.55, letterSpacing: "-0.01em", color: P45 }}>
                {lage.berufsgruppe} · {lage.gebiet} · gleitende Jahresergebnisse {lage.stand}
                <br />
                <a href={lage.quelle.link} target="_blank" rel="noopener noreferrer" style={{ color: P45, textDecoration: "underline" }}>
                    {lage.quelle.text}
                </a>
                . Umrechnung in Monate von uns.
            </p>
        </div>
    )
}

function KanalKarte({
    kanal, nummer, kopiert, kopieren,
}: {
    kanal: Kanal
    nummer: number | null
    kopiert: string | null
    kopieren: (schluessel: string, name: string, text: string) => void
}) {
    const mehrereStuecke = (kanal.stuecke || []).length > 1
    return (
        <div style={{ background: REIN, border: `1px solid ${LINIE}`, borderRadius: RADIUS_KARTE, padding: "clamp(20px, 3vw, 30px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {nummer ? <Nummer n={nummer} /> : null}
                <Versal farbe={T40}>{kanal.name}</Versal>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.55, letterSpacing: "-0.02em", color: T60, maxWidth: "62ch" }}>
                {kanal.wofuer}
            </p>
            <div style={{ marginTop: 22, display: "grid", gap: 22 }}>
                {(kanal.stuecke || []).map((st, si) => (
                    <div
                        key={si}
                        style={
                            mehrereStuecke
                                ? { borderTop: `1px solid ${LINIE}`, paddingTop: 20, display: "grid", gap: 18 }
                                : { display: "grid", gap: 18 }
                        }
                    >
                        {st.titel ? (
                            <div style={{ fontSize: 17, lineHeight: 1.3, letterSpacing: "-0.03em", fontWeight: 500, color: TINTE }}>
                                {String.fromCharCode(65 + si)} · {st.titel}
                            </div>
                        ) : null}
                        {(st.felder || []).map((f, fi) => (
                            <FeldBlock
                                key={fi}
                                feld={f}
                                kopiert={kopiert === kanal.id + ":" + si + ":" + fi}
                                kopieren={(t) => kopieren(kanal.id + ":" + si + ":" + fi, kanal.id, t)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

function Blatt({
    ergebnis, beispiel = false, angeschnitten = false, endpunkt = "", beruf = "", domain = "",
}: {
    ergebnis: Ergebnis
    beispiel?: boolean
    angeschnitten?: boolean
    endpunkt?: string
    beruf?: string
    domain?: string
}) {
    const [kopiert, setKopiert] = useState<string | null>(null)
    const [pdfLage, setPdfLage] = useState<"ruhe" | "laeuft" | "fehler">("ruhe")

    // Das PDF wird erst auf Klick gesetzt. Es in jede Antwort zu packen hieße, 41 KB an
    // jeden zu schicken, auch an die vielen, die es nie öffnen.
    async function pdfHolen() {
        if (pdfLage === "laeuft" || !endpunkt) return
        setPdfLage("laeuft")
        try {
            const antwort = await fetch(endpunkt + "-pdf", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ ergebnis, beruf, domain }),
            })
            if (!antwort.ok) throw new Error("Status " + antwort.status)
            const blob = await antwort.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "Stellenausschreibung.pdf"
            document.body.appendChild(a)
            a.click()
            a.remove()
            // Erst nach dem Klick freigeben, sonst bricht der Download in Safari ab.
            window.setTimeout(() => URL.revokeObjectURL(url), 10000)
            melde("pdf_geladen")
            setPdfLage("ruhe")
        } catch (e) {
            setPdfLage("fehler")
        }
    }
    // Auf der Werkzeugseite steht das Beispiel als Beleg, nicht als Lieferung: ein Kanal
    // vollständig sagt mehr als von jedem ein Stück.
    const kanaele = angeschnitten ? (ergebnis.kanaele || []).slice(0, 1) : ergebnis.kanaele || []
    const mappe = angeschnitten ? [] : ergebnis.mappe || []

    function kopieren(schluessel: string, name: string, text: string) {
        try {
            navigator.clipboard.writeText(text)
            melde("feld_kopiert", { kanal: name })
            setKopiert(schluessel)
            window.setTimeout(() => setKopiert(null), 2000)
        } catch (e) {
            // Ohne Zwischenablage bleibt der Text markierbar. Kein Grund für eine Meldung.
        }
    }

    const karte = {
        background: REIN, border: `1px solid ${LINIE}`, borderRadius: RADIUS_KARTE,
        padding: "clamp(20px, 3vw, 30px)",
    }

    return (
        <div>
            {!angeschnitten && endpunkt ? (
                <div
                    style={{
                        marginBottom: 14, background: REIN, border: `1px solid ${LINIE}`,
                        borderRadius: RADIUS_KARTE, padding: "clamp(18px, 2.6vw, 24px)",
                        display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
                    }}
                >
                    <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                        <div style={{ fontSize: 17, lineHeight: 1.35, letterSpacing: "-0.03em", fontWeight: 500, color: TINTE }}>
                            Alles als PDF
                        </div>
                        <div style={{ marginTop: 5, fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: T60 }}>
                            {pdfLage === "fehler"
                                ? "Das hat gerade nicht geklappt. Das PDF liegt auch in Ihrer Mail."
                                : "Zum Ausdrucken oder Weiterleiten. Liegt auch in Ihrer Mail."}
                        </div>
                    </div>
                    <Pille onClick={pdfHolen}>
                        {pdfLage === "laeuft" ? "Wird gesetzt …" : "PDF herunterladen"}
                    </Pille>
                </div>
            ) : null}

            {!angeschnitten && ergebnis.marktlage ? (
                <div style={{ marginBottom: 14 }}>
                    <MarktlageKarte lage={ergebnis.marktlage} />
                </div>
            ) : null}

            <div style={{ display: "grid", gap: 14 }}>
                {kanaele.map((k, ki) => (
                    <KanalKarte key={k.id || ki} kanal={k} nummer={ki + 1} kopiert={kopiert} kopieren={kopieren} />
                ))}
            </div>

            {!angeschnitten ? (
                <>
                    {/* Die vier Fragen gehören zu den Texten: Sie sind das, worauf die
                        Anzeige zeigt. Deshalb hier und nicht am Ende. */}
                    <div style={{ ...karte, marginTop: 14 }}>
                        <Versal farbe={T40}>Vier Fragen für die Bewerbung</Versal>
                        <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.55, letterSpacing: "-0.02em", color: T60, maxWidth: "62ch" }}>
                            Statt Lebenslauf und Anschreiben. Das ist der Grund, warum sich jemand meldet,
                            der sich sonst nicht bewirbt.
                        </p>
                        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
                            {(ergebnis.fragen || []).map((f, i) => (
                                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <Nummer n={i + 1} />
                                    <span style={{ fontSize: 16, lineHeight: 1.62, letterSpacing: "-0.005em", color: TINTE }}>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {mappe.length ? (
                        <div style={{ marginTop: "clamp(34px, 5vw, 56px)" }}>
                            <Versal farbe={AKZENT_HELL}>Und so bringen Sie es an den Start</Versal>
                            <p style={{ margin: "14px 0 0", fontSize: 17, lineHeight: 1.58, letterSpacing: "-0.03em", color: T60, maxWidth: "58ch" }}>
                                Texte allein stellen niemanden ein. Ab hier steht, was damit zu tun ist —
                                jeder Schritt einmal, mit Ihren Werten.
                            </p>
                            <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
                                {mappe.map((k, ki) => (
                                    <KanalKarte key={k.id || ki} kanal={k} nummer={null} kopiert={kopiert} kopieren={kopieren} />
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div style={{ ...karte, marginTop: 14 }}>
                        <Versal farbe={T40}>Budget</Versal>
                        <div style={{ marginTop: 16 }}>
                            <Absaetze text={ergebnis.budget || ""} farbe={TINTE} />
                        </div>
                        <p style={{ margin: "16px 0 0", fontSize: 14, lineHeight: 1.55, letterSpacing: "-0.02em", color: T40 }}>
                            Richtwert aus Ihren Angaben, keine Zusage. Was wirklich nötig ist, hängt an Ort,
                            Beruf und Wettbewerb. Nur der bezahlte Kanal kostet Geld — Kleinanzeigen und
                            Ihre eigene Seite sind umsonst.
                        </p>
                    </div>
                </>
            ) : null}

            {beispiel ? (
                <p style={{ margin: "18px 0 0", fontSize: 13, lineHeight: 1.5, letterSpacing: "-0.02em", color: T40 }}>
                    Echtes Ergebnis eines Durchlaufs für einen anderen Betrieb — nicht Ihre Seite.
                </p>
            ) : null}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Die Komponente
// ---------------------------------------------------------------------------

// ── Übergabe an die Ergebnisseite ──────────────────────────────────────────────
// Dieselbe Mechanik wie in SeoAnalyse, mit eigenem Schlüssel. Bewusst doppelt statt
// geteilt: Zwei Framer-Code-Bausteine, die sich gegenseitig importieren, binden ihre
// Veröffentlichung aneinander — ein Fehler im einen legt den anderen lahm.
//
// Warum überhaupt ein Seitenwechsel: Google Ads zählt einen Abschluss am
// verlässlichsten über den Aufruf einer Seite, die man nur nach dem Absenden sieht.
// Das Ergebnis reist im sessionStorage mit, nicht in der Adresse — dort stünden die
// Anzeigentexte und die Mailadresse im Browserverlauf und in jedem Protokoll.
const UEBERGABE = "fw-stellen-ergebnis"
const UEBERGABE_FRIST = 30 * 60 * 1000

function uebergabeSchreiben(nutzlast: Record<string, any>) {
    try {
        sessionStorage.setItem(UEBERGABE, JSON.stringify({ ...nutzlast, zeit: Date.now() }))
        return true
    } catch (e) {
        return false
    }
}

function uebergabeLesen(): Record<string, any> | null {
    try {
        const roh = sessionStorage.getItem(UEBERGABE)
        if (!roh) return null
        const d = JSON.parse(roh)
        if (!d || typeof d.zeit !== "number" || Date.now() - d.zeit > UEBERGABE_FRIST) return null
        return d
    } catch (e) {
        return null
    }
}

interface StellenanzeigerProps {
    endpunkt?: string
    beispielZeigen?: boolean
    angebotLink?: string
    rolle?: "trichter" | "ergebnis"
    ergebnisSeite?: string
    werkzeugSeite?: string
    style?: any
}

export default function Stellenanzeiger(props: StellenanzeigerProps) {
    const {
        endpunkt = "https://fokuswerk-werkzeuge.vercel.app/api/stellenanzeige",
        beispielZeigen = false,
        angebotLink = "/kontakt",
        rolle = "trichter",
        ergebnisSeite = "/stellenanzeige/ergebnis",
        werkzeugSeite = "/stellenanzeige",
        style,
    } = props

    const aufErgebnisseite = rolle === "ergebnis"

    const [lage, setLage] = useState<"formular" | "laeuft" | "fertig" | "fehler">(
        // Auf der Ergebnisseite steht der Schlusszustand schon beim ersten Rendern, sonst
        // blitzte dort für einen Moment die erste Trichterfrage auf.
        rolle === "ergebnis" ? "fertig" : "formular",
    )
    const [schritt, setSchritt] = useState(SCHRITT_ADRESSE)
    const [domain, setDomain] = useState("")
    const [antworten, setAntworten] = useState<Record<string, any>>({})
    const [name, setName] = useState("")
    const [mail, setMail] = useState("")
    const [telefon, setTelefon] = useState("")
    const [einwilligung, setEinwilligung] = useState(false)
    const [newsletter, setNewsletter] = useState(false)
    const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null)
    const [fehler, setFehler] = useState("netz")
    const [beispiel, setBeispiel] = useState(false)
    const [sekunden, setSekunden] = useState(0)
    const [betriebName, setBetriebName] = useState("")
    // Was der Vorlauf gemeldet hat. Scheitert er, soll das sofort gesagt werden und nicht
    // erst nach dem letzten Schritt — sonst füllt jemand alles aus und erfährt am Ende,
    // dass es um nichts ging.
    const [vorlaufFehler, setVorlaufFehler] = useState("")
    // Was gerade fehlt. Wird vorgelesen (aria-live), damit niemand vor einem stummen
    // Knopf steht und rät.
    const [hinweis, setHinweis] = useState("")
    const herkunft = useRef<any>(null)
    useEffect(() => {
        herkunft.current = herkunftLesen()
        melde("trichter_gesehen", { herkunft: herkunft.current?.quelle || "direkt" })
    }, [])

    const frage = schritt >= 1 && schritt <= FRAGEN.length ? FRAGEN[schritt - 1] : null
    const kontaktSchritt = schritt === SCHRITT_KONTAKT
    const imTrichter = lage === "formular" ? schritt > SCHRITT_ADRESSE : lage !== "fertig"
    // Auf der Ergebnisseite ist der Schluss erreicht, auch bevor die Übergabe gelesen
    // ist: Sonst stünden darunter für einen Moment die Werbeabschnitte des Werkzeugs.
    const fertig = aufErgebnisseite || lage === "fertig"
    const kontaktVollstaendig = !!name.trim() && !!mail.trim() && !!telefon.trim() && einwilligung
    const laufText = LAUFTEXTE.filter((l) => sekunden >= l.ab).slice(-1)[0]?.text || LAUFTEXTE[0].text

    // ----- Nachführen -------------------------------------------------------
    //
    // Ohne Nachführen bleibt das Handy dort stehen, wo der Finger getippt hat: Die neue
    // Frage steht über dem sichtbaren Bereich, und der Trichter wirkt, als sei nichts
    // passiert. Mit zu viel Nachführen ruckt die Seite bei jeder Antwort. Also messen.
    const rahmen = useRef<HTMLDivElement | null>(null)
    const ersterLauf = useRef(true)

    function kopfhoehe() {
        try {
            let unten = 0
            const alle = document.body.querySelectorAll("div, nav, header")
            for (let i = 0; i < alle.length; i++) {
                const e = alle[i] as HTMLElement
                const pos = getComputedStyle(e).position
                if (pos !== "fixed" && pos !== "sticky") continue
                const r = e.getBoundingClientRect()
                if (r.top <= 2 && r.height > 24 && r.height < 220 && r.width > window.innerWidth * 0.8) {
                    unten = Math.max(unten, r.bottom)
                }
            }
            return unten
        } catch (e) {
            return 0
        }
    }

    function nachfuehren() {
        const k = rahmen.current
        if (!k) return
        const r = k.getBoundingClientRect()
        const kopf = kopfhoehe()
        const luft = 20
        const verdeckt = r.top < kopf + 4
        const zuTief = r.top > window.innerHeight * 0.55
        // Passt der Schritt nicht ins Bild, wird er nach oben angedockt — sonst stehen
        // die unteren Antworten unter der Kante, und wer dafür scrollt, wird beim
        // Antippen wieder zurückgeworfen.
        const ragtRaus = r.bottom > window.innerHeight && r.top > kopf + 16
        if (!verdeckt && !zuTief && !ragtRaus) return
        // ▲ KEIN `scrollTo({ behavior: "smooth" })`. Auf dieser Seite läuft Lenis als
        // Smooth-Scroll-Baustein, und der schluckt beide weichen Wege — `behavior: "smooth"`
        // ebenso wie `lenis.scrollTo(...)`. Nur die Zwei-Argument-Form kommt an.
        window.scrollTo(0, Math.max(0, window.scrollY + r.top - kopf - luft))
    }

    useEffect(() => {
        // Gemeldet wird jeder Schritt, auch der erste — sonst fehlt in der Auswertung
        // ausgerechnet die Stufe, an der die meisten abspringen.
        if (lage === "formular") {
            melde("trichter_schritt", {
                schritt,
                name: schritt === SCHRITT_ADRESSE ? "adresse" : schritt === SCHRITT_KONTAKT ? "kontakt" : FRAGEN[schritt - 1]?.id,
            })
        }
        // Nachgeführt wird erst ab dem zweiten Durchlauf: Beim Aufbau der Seite steht der
        // Trichter da, wo er hingehört.
        if (ersterLauf.current) {
            ersterLauf.current = false
            return
        }
        nachfuehren()
        // Zweiter Anlauf: Nach einem Textfeld schließt sich auf dem iPhone die Tastatur,
        // und iOS setzt die Scrollposition dabei selbst noch einmal.
        const t = window.setTimeout(nachfuehren, 420)
        return () => window.clearTimeout(t)
    }, [schritt, lage])

    // ----- Zähler für die Lauftexte -----------------------------------------
    useEffect(() => {
        if (lage !== "laeuft") return
        setSekunden(0)
        const t = window.setInterval(() => setSekunden((s) => s + 1), 1000)
        return () => window.clearInterval(t)
    }, [lage])

    // ----- Der Vorlauf ------------------------------------------------------
    //
    // Sobald Adresse und Beruf stehen, läuft die Erzeugung los, während der Besucher die
    // vier restlichen Fragen beantwortet. `?vorlauf=1` gibt nur den Betriebsnamen zurück,
    // nicht die Anzeigen — sonst stünde das ganze Ergebnis in der Antwort, bevor jemand
    // seine Daten eingetragen hat. Der zweite Aufruf trifft den Zwischenspeicher.
    const vorlaufLaeuft = useRef("")

    // Zweite Stufe des Vorlaufs. Sie läuft nach der letzten Frage, wenn Dringlichkeit,
    // Stellenzahl und Stärken feststehen — die gehen jetzt in die Anzeigen ein, und
    // vorher geschriebene Texte wären die falschen. Geschrieben wird, während der
    // Besucher Name, Mail und Nummer einträgt.
    const vorlaufZweiLaeuft = useRef("")

    function vorlaufZweiStarten() {
        const d = domain.trim()
        const b = String(antworten.beruf || "").trim()
        if (!d || b.length < 2) return
        const staerken = (antworten.staerken || []).filter((x: string) => x !== "nichts")
        const schluessel = [
            d.toLowerCase(), b.toLowerCase(),
            antworten.dringlichkeit || "-", antworten.stellen || "-",
            [...staerken].sort().join(",") || "-",
        ].join("|")
        if (vorlaufZweiLaeuft.current === schluessel) return
        vorlaufZweiLaeuft.current = schluessel
        fetch(endpunkt + "?vorlauf=2", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                domain: d,
                beruf: b,
                dringlichkeit: antworten.dringlichkeit,
                stellen: antworten.stellen,
                erfahrung: antworten.erfahrung,
                staerken,
            }),
        })
            .then((a) => a.json())
            .then((x) => {
                if (x && x.betrieb) setBetriebName(x.betrieb)
                if (x && x.fehler) setVorlaufFehler(String(x.fehler))
            })
            .catch(() => {
                // Scheitert der Vorlauf, schreibt der Hauptaufruf die Anzeigen. Dann
                // dauert es länger, kaputt ist nichts.
                vorlaufZweiLaeuft.current = ""
            })
    }

    function vorlaufStarten() {
        const d = domain.trim()
        const b = String(antworten.beruf || "").trim()
        if (!d || b.length < 2) return
        const schluessel = d.toLowerCase() + "|" + b.toLowerCase()
        if (vorlaufLaeuft.current === schluessel) return
        vorlaufLaeuft.current = schluessel
        fetch(endpunkt + "?vorlauf=1", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ domain: d, beruf: b }),
        })
            .then((a) => a.json())
            .then((x) => {
                if (x && x.betrieb) setBetriebName(x.betrieb)
                // Adresse nicht lesbar oder Beruf passt nicht zum Betrieb: Das ist jetzt
                // schon klar und wird beim nächsten Weiter gezeigt.
                if (x && x.fehler) setVorlaufFehler(String(x.fehler))
            })
            .catch(() => {
                // Netzfehler im Vorlauf sind kein Grund abzubrechen: Der echte Aufruf läuft
                // am Ende ohnehin und meldet dann einen richtigen Fehler.
            })
    }

    async function absenden() {
        setLage("laeuft")
        setBeispiel(false)
        try {
            // Kein Zeitlimit: Der Endpunkt darf bis zu 60 Sekunden brauchen, und ein eigener
            // Abbruch würde eine fertige Antwort wegwerfen.
            const antwort = await fetch(endpunkt, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    domain: domain.trim(),
                    beruf: String(antworten.beruf || "").trim(),
                    dringlichkeit: antworten.dringlichkeit,
                    stellen: antworten.stellen,
                    erfahrung: antworten.erfahrung,
                    // „Nichts davon" ist eine Fluchtoption für den Besucher, keine Angabe
                    // für den Text — sie geht nicht mit raus.
                    staerken: (antworten.staerken || []).filter((x: string) => x !== "nichts"),
                    newsletter,
                    kontakt: { name: name.trim(), email: mail.trim(), telefon: telefon.trim() },
                    herkunft: herkunft.current || undefined,
                }),
            })
            if (!antwort.ok) {
                const d = await antwort.json().catch(() => ({}))
                const code = d && d.fehler ? d.fehler : "netz"
                melde("trichter_fehler", { code })
                setFehler(code)
                setLage("fehler")
                return
            }
            const daten = await antwort.json()
            melde("trichter_abgeschlossen", {
                beruf: String(antworten.beruf || ""),
                dringlichkeit: antworten.dringlichkeit,
                stellen: antworten.stellen,
                herkunft: herkunft.current?.quelle || "direkt",
            })
            zurErgebnisseite(daten, false)
        } catch (e) {
            // Hier landet nur, wer den Endpunkt gar nicht erreicht: keine Verbindung, oder
            // der Türsteher (ORIGINS) lässt den Browser wortlos abblitzen.
            if (beispielZeigen) {
                zurErgebnisseite({ ...BEISPIEL, betrieb: domain.trim() || BEISPIEL.betrieb }, true)
            } else {
                setFehler("netz")
                setLage("fehler")
            }
        }
    }

    // Der Wechsel ist der Zweck. Scheitert die Übergabe — privates Fenster, gesperrter
    // Speicher —, bleibt das Ergebnis hier stehen statt auf einer leeren Seite.
    function zurErgebnisseite(daten: Ergebnis, istBeispiel: boolean) {
        setErgebnis(daten)
        setBeispiel(istBeispiel)
        setLage("fertig")
        if (aufErgebnisseite || !ergebnisSeite) return
        if (
            !uebergabeSchreiben({
                ergebnis: daten,
                beispiel: istBeispiel,
                mail: mail.trim(),
                // Für das PDF: Beruf und Adresse stehen im Deckblatt und in der Fußzeile.
                beruf: String(antworten.beruf || ""),
                domain: domain.trim(),
            })
        )
            return
        window.location.assign(ergebnisSeite)
    }

    // Auf der Ergebnisseite wird nichts geschrieben — die Anzeigen kommen aus der
    // Übergabe. Das Ereignis feuert nur bei einer echten Übergabe, nicht wenn jemand
    // die Adresse aus einem Lesezeichen aufruft: so ist es das genauere Signal.
    useEffect(() => {
        if (!aufErgebnisseite) return
        const d = uebergabeLesen()
        if (!d?.ergebnis) return
        setErgebnis(d.ergebnis as Ergebnis)
        setBeispiel(!!d.beispiel)
        if (typeof d.mail === "string") setMail(d.mail)
        if (typeof d.domain === "string") setDomain(d.domain)
        if (typeof d.beruf === "string") setAntworten((a) => ({ ...a, beruf: d.beruf }))
        melde("werkzeug_abschluss")
    }, [aufErgebnisseite])

    function nochmal() {
        setLage("formular")
        setSchritt(SCHRITT_ADRESSE)
        setErgebnis(null)
        setBetriebName("")
        setVorlaufFehler("")
        setBeispiel(false)
        vorlaufLaeuft.current = ""
        vorlaufZweiLaeuft.current = ""
    }

    // Nur grob: Es geht darum, einen Tippfehler zu fangen, nicht darum, Adressen zu
    // bewerten. Das macht der Endpunkt, der die Seite wirklich abruft.
    const mailOk = (w: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(w.trim())
    const telOk = (w: string) => (w.match(/\d/g) || []).length >= 6

    function weiterVonAdresse() {
        if (domain.trim().length < 3) {
            setHinweis("Tragen Sie die Adresse Ihrer Website ein, zum Beispiel ihre-firma.de")
            document.getElementById("fw-domain")?.focus()
            return
        }
        setHinweis("")
        setVorlaufFehler("")
        vorlaufLaeuft.current = ""
        vorlaufZweiLaeuft.current = ""
        setSchritt(1)
    }

    // Zurück zum Eingabefeld. Zwei-Argument-Form, weil Lenis die weichen Wege schluckt.
    function zumFeld() {
        const k = rahmen.current
        if (!k) return
        const kopf = kopfhoehe()
        window.scrollTo(0, Math.max(0, window.scrollY + k.getBoundingClientRect().top - kopf - 20))
        window.setTimeout(() => document.getElementById("fw-domain")?.focus(), 240)
        melde("zurueck_zum_feld")
    }

    function meldeFehlt(text: string, feld: string) {
        setHinweis(text)
        if (feld) document.getElementById(feld)?.focus()
    }

    function Zurueck({ auf = "dunkel" }: { auf?: "hell" | "dunkel" }) {
        return (
            <button
                type="button"
                onClick={() => setSchritt((s) => Math.max(SCHRITT_ADRESSE, s - 1))}
                style={{
                    font: "inherit", fontSize: 12, fontWeight: 500, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: auf === "dunkel" ? P45 : T40,
                    background: "none", border: "none", padding: "13px 0", cursor: "pointer", minHeight: 44,
                }}
            >
                Zurück
            </button>
        )
    }

    // ----- Der Rückruf ------------------------------------------------------
    //
    // Der wärmste Moment des ganzen Trichters ist die Sekunde, in der die Anzeigen
    // erscheinen. Vorher stand dort ein Link auf /kontakt — also ein Formular, das man
    // erst noch ausfüllt. Jetzt reicht ein Tipp auf ein Zeitfenster: Name, Nummer und
    // Betrieb liegen längst vor, es fehlt nur noch das Wann.
    // Die Zeitfenster richten sich nach dem Tag eines Handwerkers, nicht nach dem eines
    // Büros: Vormittags und nachmittags steht er auf der Baustelle und geht nicht ran.
    const FENSTER = [
        { wert: "gleich", text: "Gleich, ich bin am Handy" },
        { wert: "mittag", text: "In der Mittagspause" },
        { wert: "feierabend", text: "Nach Feierabend, ab 17 Uhr" },
        { wert: "frueh", text: "Morgen früh, vor 7:30 Uhr" },
    ]

    function Rueckruf() {
        const [fenster, setFenster] = useState("")
        const [stand, setStand] = useState<"offen" | "laeuft" | "fertig" | "fehler">("offen")

        function senden(gewaehlt: string) {
            if (!gewaehlt || stand === "laeuft") return
            setStand("laeuft")
            melde("rueckruf_gewuenscht", { fenster: gewaehlt })
            fetch(endpunkt.replace(/\/stellenanzeige.*$/, "/rueckruf"), {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(), email: mail.trim(), telefon: telefon.trim(),
                    domain: domain.trim(), betrieb: ergebnis?.betrieb || "",
                    beruf: String(antworten.beruf || ""), fenster: gewaehlt,
                    herkunft: herkunft.current || undefined,
                }),
            })
                // Ehrlich bleiben: „Rückruf eingetragen" darf nur stehen, wenn er
                // wirklich angekommen ist. Sonst wartet jemand auf einen Anruf, von dem
                // niemand weiß.
                .then((a) => setStand(a.ok ? "fertig" : "fehler"))
                .catch(() => setStand("fehler"))
        }

        if (stand === "fehler") {
            return (
                <div
                    style={{
                        marginTop: 30, padding: "clamp(20px, 3vw, 26px)", borderRadius: RADIUS_KARTE,
                        background: REIN, border: `1px solid ${LINIE}`,
                    }}
                >
                    <Versal>Das hat nicht geklappt</Versal>
                    <p style={{ margin: "12px 0 0", fontSize: 17, lineHeight: 1.6, letterSpacing: "-0.008em", color: TINTE }}>
                        Ihr Rückrufwunsch ist nicht bei uns angekommen. Rufen Sie durch:{" "}
                        <a href="tel:+4917663307587" style={{ color: AKZENT_HELL }}>0176 63307587</a>.
                    </p>
                </div>
            )
        }

        if (stand === "fertig") {
            return (
                <div
                    style={{
                        marginTop: 30, padding: "clamp(20px, 3vw, 26px)", borderRadius: RADIUS_KARTE,
                        background: REIN, border: `1px solid ${LINIE}`,
                    }}
                >
                    <Versal>Rückruf eingetragen</Versal>
                    <p style={{ margin: "12px 0 0", fontSize: 17, lineHeight: 1.6, letterSpacing: "-0.008em", color: TINTE }}>
                        Wir rufen Sie an: {FENSTER.find((f) => f.wert === fenster)?.text.toLowerCase()}, unter {telefon.trim()}.
                        Wir rufen von 0176 63307587 an — speichern Sie die Nummer, dann wissen Sie, wer dran ist.
                    </p>
                </div>
            )
        }

        return (
            <div
                style={{
                    marginTop: 30, padding: "clamp(22px, 3.2vw, 30px)", borderRadius: RADIUS_KARTE,
                    background: DUNKEL, color: PAPIER,
                }}
            >
                <Versal farbe={AKZENT_DUNKEL}>Und jetzt?</Versal>
                <div style={{ marginTop: 14, fontSize: 24, lineHeight: 1.2, letterSpacing: "-0.04em", fontWeight: 500 }}>
                    Die Texte stehen. Jetzt müssen sie noch die Richtigen sehen.
                </div>
                <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.62, letterSpacing: "-0.005em", color: P70, maxWidth: "52ch" }}>
                    Einstellen können Sie sie selbst. Auf Ihrer Firmenseite sehen den Text aber vor
                    allem die, die Sie schon kennen. Damit Gesellen im Umkreis ihn sehen, die Ihre
                    Seite nie besucht haben, muss die Anzeige gezielt geschaltet werden. Wenn wir das
                    machen sollen: zehn Minuten am Telefon, danach sagen Sie Ja oder Nein.
                </p>
                <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {FENSTER.map((f) => (
                        <button
                            key={f.wert}
                            type="button"
                            onClick={() => { setFenster(f.wert); senden(f.wert) }}
                            style={{
                                font: "inherit", fontSize: 15, fontWeight: 500, letterSpacing: "-0.015em",
                                color: fenster === f.wert ? TINTE : PAPIER,
                                background: fenster === f.wert ? PAPIER : "transparent",
                                border: `1px solid ${fenster === f.wert ? PAPIER : LINIE_D}`,
                                borderRadius: 999, padding: "13px 18px", minHeight: 48, cursor: "pointer",
                            }}
                        >
                            {f.text}
                        </button>
                    ))}
                </div>
                <p style={{ margin: "16px 0 0", fontSize: 13, lineHeight: 1.5, letterSpacing: "-0.01em", color: P45 }}>
                    Ein Tipp genügt — Ihre Nummer liegt uns vor. Unverbindlich, und sagen Sie
                    danach Nein, ruft keiner wieder an.
                </p>
            </div>
        )
    }

    // ----- Der Trichter -----------------------------------------------------

    function trichter() {
        if (lage === "laeuft") {
            return (
                <div>
                    <div style={{ fontSize: 19, lineHeight: 1.26, letterSpacing: "-0.04em", fontWeight: 500, color: PAPIER }}>
                        {laufText}
                    </div>
                    <div style={{ marginTop: 22 }}>
                        <Notenstrich note={Math.min(96, 16 + sekunden * 7)} hoehe={3} farbe={SIGNAL} grund={LINIE_D} />
                    </div>
                    <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: P45 }}>
                        {betriebName
                            ? "Geschrieben wird für: " + betriebName
                            : "Wir rufen Ihre Website ab. Das dauert einen Moment."}
                    </div>
                    {sekunden >= 35 ? (
                        <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${LINIE_D}` }}>
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, letterSpacing: "-0.01em", color: P70 }}>
                                Das dauert heute länger als sonst. Bleiben Sie kurz hier, die Anzeigen
                                erscheinen gleich auf dieser Seite. Zur Sicherheit schicken wir sie
                                Ihnen zusätzlich per Mail.
                            </p>
                            <div style={{ marginTop: 14 }}>
                                <Pille auf="dunkel" art="linie" onClick={() => { setLage("formular"); setSchritt(SCHRITT_KONTAKT) }}>
                                    Zurück zu Ihren Angaben
                                </Pille>
                            </div>
                        </div>
                    ) : null}
                </div>
            )
        }

        if (lage === "fehler") {
            const text = fehlerText(fehler)
            return (
                <div>
                    <div style={{ fontSize: 22, lineHeight: 1.3, letterSpacing: "-0.035em", fontWeight: 500, color: PAPIER }}>
                        {text.titel}
                    </div>
                    <p style={{ margin: "14px 0 0", fontSize: 17, lineHeight: 1.6, letterSpacing: "-0.008em", color: P70 }}>
                        {text.hinweis}
                    </p>
                    <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.6, letterSpacing: "-0.008em", color: P45, maxWidth: "48ch" }}>
                        Keine Website, oder klappt es einfach nicht? Rufen Sie durch unter{" "}
                        <a href="tel:+4917663307587" style={{ color: PAPIER }}>0176 63307587</a> — dann
                        schreiben wir die Anzeigen von Hand.
                    </p>
                    <div style={{ marginTop: 26 }}>
                        <Pille
                            auf="dunkel"
                            onClick={() => {
                                setLage("formular")
                                setSchritt(text.zurueck < 0 ? SCHRITT_KONTAKT : text.zurueck)
                                if (text.zurueck === SCHRITT_ADRESSE || text.zurueck === 1) {
                                    vorlaufLaeuft.current = ""
        vorlaufZweiLaeuft.current = ""
                                    setVorlaufFehler("")
                                    setBetriebName("")
                                }
                            }}
                        >
                            {text.zurueck === SCHRITT_ADRESSE ? "Adresse ändern" : text.zurueck === 1 ? "Beruf ändern" : "Noch einmal versuchen"}
                        </Pille>
                    </div>
                </div>
            )
        }

        // Schritt 0 — die Adresse. Ein Feld, nicht zwei: Bei zwei leeren Textfeldern als
        // Eröffnung springen die meisten ab, alles Weitere lässt sich antippen.
        if (schritt === SCHRITT_ADRESSE) {
            return (
                <div>
                    <div className="fw-sa-eingabe">
                        <div style={{ minWidth: 0 }}>
                            <label htmlFor="fw-domain" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                                Adresse Ihrer Website
                            </label>
                            <Feld
                                kennung="fw-domain" wert={domain} setWert={setDomain}
                                platzhalter="ihre-firma.de" auf="dunkel" gross
                                onEnter={weiterVonAdresse}
                                inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                                enterKeyHint="go"
                            />
                        </div>
                        {/* Unter 620 px steht der Knopf unter dem Feld und füllt die Zeile
                            ganz aus; darüber steht er daneben. Das regelt .fw-sa-eingabe. */}
                        <div style={{ minWidth: 0 }}>
                            <Pille auf="dunkel" onClick={weiterVonAdresse} weit>Anzeigen schreiben lassen</Pille>
                        </div>
                    </div>
                    <p aria-live="polite" style={{ margin: hinweis ? "14px 0 0" : 0, fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.01em", color: AKZENT_DUNKEL, minHeight: hinweis ? undefined : 0 }}>
                        {hinweis}
                    </p>
                    <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Etikett auf="dunkel">Aus Ihrer Website</Etikett>
                        <Etikett auf="dunkel">Kostenlos, kein Konto</Etikett>
                        <Etikett auf="dunkel">Danach ein Anruf, zehn Minuten</Etikett>
                    </div>
                </div>
            )
        }

        // Die fünf Fragen.
        if (frage) {
            const wert = antworten[frage.id]
            const mehrfachGewaehlt: string[] = Array.isArray(wert) ? wert : []
            const weiter = () => {
                if (frage.id === "beruf") {
                    setVorlaufFehler("")
                    vorlaufStarten()
                    setSchritt(schritt + 1)
                    return
                }
                // Letzte Frage: Jetzt stehen alle Antworten, jetzt lohnt das Schreiben.
                if (frage.id === "staerken") vorlaufZweiStarten()
                // Hat der Vorlauf schon gemeldet, dass Adresse oder Beruf nicht taugen,
                // wird das hier gesagt — nicht erst nach dem Kontaktschritt.
                if (vorlaufFehler) {
                    setFehler(vorlaufFehler)
                    setLage("fehler")
                    return
                }
                setSchritt(schritt + 1)
            }
            const kannWeiter =
                frage.art === "text"
                    ? String(wert || "").trim().length >= 2
                    : frage.art === "mehrere"
                      ? mehrfachGewaehlt.length > 0
                      : true

            return (
                <div>
                    <Fortschritt schritt={schritt} />
                    <div style={{ marginTop: 30 }}>
                        <div style={{ fontSize: 30, lineHeight: 1.16, letterSpacing: "-0.045em", fontWeight: 500, color: PAPIER }}>
                            {frage.frage}
                        </div>
                        <p style={{ margin: "13px 0 0", fontSize: 17, lineHeight: 1.6, letterSpacing: "-0.008em", color: P70, maxWidth: "46ch" }}>
                            {frage.hinweis}
                        </p>
                    </div>

                    <div style={{ marginTop: 26 }}>
                        {frage.art === "text" ? (
                            <Tippfeld
                                kennung={"fw-" + frage.id}
                                wert={wert || ""}
                                setWert={(w: string) => setAntworten({ ...antworten, [frage.id]: w })}
                                autoCorrect="off"
                                spellCheck={false}
                                enterKeyHint="next"
                                platzhalter={frage.platzhalter || ""}
                                vorschlaege={frage.vorschlaege || []}
                                weiter={weiter}
                            />
                        ) : (
                            <div style={{ display: "grid", gap: 10 }}>
                                {(frage.optionen || []).map((o) => {
                                    const gewaehlt = frage.art === "mehrere"
                                        ? mehrfachGewaehlt.indexOf(o.wert) >= 0
                                        : wert === o.wert
                                    return (
                                        <Antwortknopf
                                            key={o.wert}
                                            text={o.text}
                                            neben={o.neben}
                                            gewaehlt={gewaehlt}
                                            mehrfach={frage.art === "mehrere"}
                                            onClick={() => {
                                                if (frage.art === "mehrere") {
                                                    const neu = gewaehlt
                                                        ? mehrfachGewaehlt.filter((x) => x !== o.wert)
                                                        : mehrfachGewaehlt.concat([o.wert])
                                                    setAntworten({ ...antworten, [frage.id]: neu })
                                                    return
                                                }
                                                setAntworten({ ...antworten, [frage.id]: o.wert })
                                                // Einfachauswahl schaltet selbst weiter: ein Tipp,
                                                // ein Schritt. Ein Weiter-Knopf wäre ein zweiter.
                                                //
                                                // 240 statt 130 ms: Bei 130 ms war der Wechsel
                                                // vollzogen, bevor der Finger oben war, und der
                                                // zweite Tipp eines Doppeltipps beantwortete die
                                                // nächste Frage gleich mit. Die Auswahl bekommt
                                                // jetzt auch sichtbar Zeit (Farbübergang 140 ms).
                                                window.setTimeout(weiter, 240)
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 26, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                        <Zurueck />
                        {frage.art !== "eine" ? (
                            <div style={{ marginLeft: "auto" }}>
                                <Pille auf="dunkel" onClick={weiter} aus={!kannWeiter}>Weiter</Pille>
                            </div>
                        ) : null}
                    </div>

                    {betriebName ? (
                        <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${LINIE_D}`, display: "flex", gap: 10, alignItems: "center" }}>
                            <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: "#5FBE91", flex: "0 0 auto" }} />
                            <span style={{ fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: P70 }}>
                                Ihre Seite ist gelesen: {betriebName}. Die Anzeigen entstehen gerade.
                            </span>
                        </div>
                    ) : null}
                </div>
            )
        }

        // Kontaktschritt.
        return (
            <div>
                <Fortschritt schritt={schritt} />
                <div style={{ marginTop: 30 }}>
                    <div style={{ fontSize: 30, lineHeight: 1.16, letterSpacing: "-0.045em", fontWeight: 500, color: PAPIER }}>
                        Wohin schicken wir die Anzeigen?
                    </div>
                    <p style={{ margin: "13px 0 0", fontSize: 17, lineHeight: 1.6, letterSpacing: "-0.008em", color: P70, maxWidth: "48ch" }}>
                        Die Texte sehen Sie gleich hier auf der Seite. Zusätzlich kommen sie per Mail, damit
                        Sie sie nicht abschreiben müssen. Die Nummer brauchen wir für den einen Anruf danach:
                        Wir fragen, ob wir die Ausspielung übernehmen sollen. Sagen Sie nein, war es das.
                    </p>
                </div>

                <div style={{ marginTop: 26, display: "grid", gap: 10 }}>
                    <Feld kennung="fw-name" wert={name} setWert={setName} platzhalter="Ihr Name" autoComplete="name" />
                    <Feld kennung="fw-mail" wert={mail} setWert={setMail} platzhalter="E-Mail-Adresse" type="email" inputMode="email" autoComplete="email" />
                    <Feld kennung="fw-tel" wert={telefon} setWert={setTelefon} platzhalter="Telefonnummer" type="tel" inputMode="tel" autoComplete="tel" />
                </div>

                {/* Zwei Zwecke, zwei Häkchen. Die obere Einwilligung gilt der Antwort auf
                    diese Anfrage, die untere laufender Werbung. Zusammengelegt wäre keine
                    von beiden wirksam. */}
                <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
                    <Haken an={einwilligung} setAn={setEinwilligung} text={EINWILLIGUNGSTEXT} />
                    <Haken an={newsletter} setAn={setNewsletter} text={NEWSLETTER_TEXT} />
                </div>

                <p aria-live="polite" style={{ margin: hinweis ? "16px 0 0" : 0, fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.01em", color: AKZENT_DUNKEL }}>
                    {hinweis}
                </p>
                <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Etikett auf="dunkel">Kostenlos</Etikett>
                    <Etikett auf="dunkel">Keine Verpflichtung</Etikett>
                    <Etikett auf="dunkel">Die Texte gehören Ihnen</Etikett>
                </div>

                <div style={{ marginTop: 26, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                    <Zurueck />
                    <div style={{ marginLeft: "auto", flex: "1 1 220px", minWidth: 0 }}>
                        <Pille
                            auf="dunkel"
                            weit
                            onClick={() => {
                                // Ein gesperrter Knopf sagt nicht, was fehlt. Lieber
                                // bedienbar lassen und es benennen.
                                if (!name.trim()) return meldeFehlt("Ihr Name fehlt noch.", "fw-name")
                                if (!mailOk(mail)) return meldeFehlt("Die E-Mail-Adresse stimmt so nicht — dorthin gehen die Texte.", "fw-mail")
                                if (!telOk(telefon)) return meldeFehlt("Die Telefonnummer stimmt so nicht.", "fw-tel")
                                if (!einwilligung) return meldeFehlt("Ohne das erste Häkchen dürfen wir Ihnen nichts schicken.", "")
                                setHinweis("")
                                absenden()
                            }}
                        >
                            Anzeigen ansehen
                        </Pille>
                    </div>
                </div>
            </div>
        )
    }

    // ----- Die Seite --------------------------------------------------------

    return (
        <div className="fw-sa" style={{ ...style, fontFamily: SCHRIFT, background: PAPIER, color: TINTE, WebkitFontSmoothing: "antialiased" }}>
            <style dangerouslySetInnerHTML={{ __html: STIL }} />

            {/* ── 1 Auftakt ──────────────────────────────────────────────────────────
                Dunkel mit warmem Lichtschweif, wie die Startseite. Liegen die Anzeigen vor,
                wird der Grund hell: Texte gehören auf Papier. */}
            <section
                style={{
                    position: "relative", overflow: "hidden",
                    background: fertig
                        ? PAPIER
                        : `radial-gradient(118% 82% at 74% 14%, rgba(255,90,31,0.26) 0%, rgba(255,90,31,0.07) 36%, rgba(255,90,31,0) 66%),
                           radial-gradient(85% 70% at 12% 92%, rgba(255,90,31,0.1) 0%, rgba(255,90,31,0) 58%),
                           ${DUNKEL}`,
                    color: fertig ? TINTE : PAPIER,
                    // ▲ Der obere Rand muss größer sein als die feste Kopfleiste (76 px auf
                    // dem Handy, 88 px am Schreibtisch). Stand einmal auf 64 px — das
                    // Etikett „Kostenloses Werkzeug" lag damit unter 950 px Breite
                    // vollständig hinter der Leiste und war auf jedem Handy unsichtbar.
                    paddingTop: fertig ? "clamp(104px, 9vw, 128px)" : "clamp(104px, 10vw, 152px)",
                    paddingBottom: fertig ? "clamp(56px, 7vw, 104px)" : "clamp(64px, 8vw, 128px)",
                    paddingLeft: RAND, paddingRight: RAND,
                    transition: "background 320ms ease",
                }}
            >
                <div style={{ maxWidth: BREIT, margin: "0 auto", position: "relative" }}>
                    <Versal farbe={fertig ? AKZENT_HELL : AKZENT_DUNKEL}>
                        {ergebnis
                            ? "Ihre Anzeigen · gerade geschrieben"
                            : fertig
                              ? "Ihre Anzeigen"
                              : "Kostenloses Werkzeug"}
                    </Versal>

                    {/* Die H1 bleibt stehen, auch über dem Ergebnis: Im ausgelieferten HTML
                        ist die Lage immer „formular", dort steht also die richtige
                        Hauptüberschrift. Ein Tausch brächte nichts und flackerte nur. */}
                    <h1
                        style={{
                            margin: "26px 0 0", fontSize: "clamp(2.4rem, 7.4vw, 5.1rem)",
                            lineHeight: 1.05, letterSpacing: "-0.055em", fontWeight: 500,
                            maxWidth: "17ch", textWrap: "balance" as any,
                            color: fertig ? TINTE : PAPIER,
                        }}
                    >
                        Ihre Mitarbeitersuche, einmal komplett
                    </h1>

                    <p
                        style={{
                            margin: imTrichter && !fertig ? 0 : "26px 0 0",
                            fontSize: 19, lineHeight: 1.5,
                            letterSpacing: "-0.012em", color: fertig ? T60 : P70, maxWidth: "50ch",
                            // Im Trichter zusammenfalten: Die Einleitung hat ihre Arbeit
                            // getan, und ihre fünf Zeilen drücken die Antworten auf dem
                            // Handy unter die Bildkante.
                            maxHeight: imTrichter && !fertig ? 0 : 400,
                            opacity: imTrichter && !fertig ? 0 : 1,
                            overflow: "hidden",
                            transition: "max-height 260ms ease, opacity 180ms ease, margin 260ms ease",
                        }}
                    >
                        {fertig
                            ? "Die Texte für drei Kanäle, die vier Bewerberfragen — und darunter die Anleitung: welche Einstellungen, welches Budget, welches Video, und was Sie antworten, wenn sich jemand meldet."
                            : "Wir lesen Ihre Website und schreiben daraus die Ausschreibung für drei Kanäle. Dazu die Anleitung, wie Sie sie schalten: Einstellungen, Budget, ein Video-Drehbuch für zwanzig Minuten mit dem Handy und die ersten Antworten an Bewerber."}
                    </p>

                    <div
                        ref={rahmen}
                        // Die Marke sagt der Handlungsleiste, dass hier ein Formular steht,
                        // damit sie nicht über dem Absende-Knopf klebt.
                        data-fw-formular={!fertig ? "" : undefined}
                        className={imTrichter && !fertig ? "fw-sa-glas" : undefined}
                        style={{
                            marginTop: fertig ? 40 : 38,
                            maxWidth: fertig ? BREIT : imTrichter ? 640 : 760,
                            scrollMarginTop: 90,
                            // Glaskarte, sobald der Trichter läuft: durchscheinend mit
                            // Haarlinie, 16 px Radius — dasselbe Muster wie im Haus.
                            background: imTrichter && !fertig ? "rgba(245,243,239,0.05)" : "transparent",
                            border: imTrichter && !fertig ? `1px solid ${LINIE_D}` : "none",
                            borderRadius: imTrichter && !fertig ? RADIUS_KARTE : 0,
                            padding: imTrichter && !fertig ? "clamp(22px, 3.6vw, 34px)" : 0,
                            backdropFilter: imTrichter && !fertig ? "blur(14px)" : undefined,
                        }}
                    >
                        {fertig && ergebnis ? (
                            <div>
                                {beispiel ? (
                                    <div
                                        style={{
                                            marginBottom: 20, padding: "15px 18px", borderRadius: RADIUS_FELD,
                                            background: "rgba(184,65,22,0.06)", border: "1px solid rgba(184,65,22,0.25)",
                                            fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: AKZENT_HELL,
                                        }}
                                    >
                                        Das Werkzeug war gerade nicht erreichbar. Unten steht ein echtes Ergebnis
                                        für einen anderen Betrieb als Beispiel — nicht Ihres. Bitte später noch
                                        einmal versuchen.
                                    </div>
                                ) : null}
                                <Blatt
                                    ergebnis={ergebnis}
                                    beispiel={beispiel}
                                    endpunkt={beispiel ? "" : endpunkt}
                                    beruf={String(antworten.beruf || "")}
                                    domain={domain.trim()}
                                />
                                {!beispiel ? <Rueckruf /> : null}
                                {/* Wer hier steht, hat seine Texte. Ihm jetzt anzubieten, noch
                                    eine Stelle schreiben zu lassen, ist das kleinere Geschäft —
                                    und für ihn die kleinere Hilfe. Das Angebot heißt: Wir machen
                                    die Arbeit, die nach den Texten kommt. */}
                                <div style={{ marginTop: 26, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                                    <Pille href={angebotLink}>Das übernehmen wir für Sie</Pille>
                                    {aufErgebnisseite ? (
                                        <Pille art="linie" href={werkzeugSeite}>Noch eine Stelle</Pille>
                                    ) : (
                                        <Pille art="linie" onClick={nochmal}>Noch eine Stelle</Pille>
                                    )}
                                    {!beispiel ? (
                                        <span style={{ fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: T40 }}>
                                            Die Texte sind unterwegs an {mail.trim()}.
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        ) : fertig ? (
                            // Direkt aufgerufen, neues Fenster, abgelaufene Frist: Die Anzeigen
                            // sind trotzdem verschickt — das ist die Auskunft, die hier zählt.
                            <div>
                                <p style={{ margin: 0, fontSize: 17, lineHeight: 1.58, letterSpacing: "-0.03em", color: T60, maxWidth: "46ch" }}>
                                    Ihre Anzeigen sind fertig und an Ihre E-Mail-Adresse unterwegs.
                                    Hier auf der Seite stehen sie nur, solange das Fenster offen
                                    bleibt, in dem Sie sie angefordert haben.
                                </p>
                                <div style={{ marginTop: 26, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                                    <Pille href={angebotLink}>Über die Stelle sprechen</Pille>
                                    <Pille art="linie" href={werkzeugSeite}>Noch eine Stelle</Pille>
                                </div>
                            </div>
                        ) : (
                            <div className="fw-sa-schritt" key={lage + ":" + schritt}>
                                {trichter()}
                            </div>
                        )}
                    </div>

                    {/* Drei Zahlen offen zwischen Haarlinien — das Belegzahlen-Muster der
                        Startseite. Kein Kasten: Eine große Zahl braucht Raum. */}
                    {!imTrichter && !fertig ? (
                        <div className="fw-sa-zahlen" style={{ marginTop: "clamp(40px, 6vw, 76px)" }}>
                            {[
                                // Drei Spalten, drei Zahlen. Eine vierte stünde allein in
                                // der zweiten Reihe — dasselbe Loch wie bei den Karten.
                                { zahl: "3", label: "Kanäle, fertig formuliert", quelle: "Kleinanzeigen · Meta · Ihre Seite" },
                                { zahl: "10", label: "Schritte bis zur Anzeige", quelle: "mit Ihrem Ort und Ihrem Budget" },
                                { zahl: "0", label: "Euro, kein Konto", quelle: "die Texte behalten Sie in jedem Fall" },
                            ].map((b) => (
                                <div key={b.label} style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", lineHeight: 0.92, fontWeight: 500, letterSpacing: "-0.055em", color: PAPIER, fontVariantNumeric: "tabular-nums" }}>
                                        {b.zahl}
                                    </div>
                                    <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: P70 }}>{b.label}</div>
                                    <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.45, letterSpacing: "-0.01em", color: P45 }}>{b.quelle}</div>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            </section>

            {/* ── 2 Der Beweis ───────────────────────────────────────────────────────
                Direkt nach dem Auftakt gehört das Ergebnis, nicht die Methode. Liegen die
                echten Anzeigen vor, fällt der Abschnitt weg — sonst stünde dieselbe
                Darstellung zweimal auf einer Seite. */}
            {!fertig ? (
                <Abschnitt grund={PAPIER}>
                    <Versal>So sieht das Ergebnis aus</Versal>
                    <div style={{ marginTop: 22 }}>
                        <H2>Ein Kanal von dreien, aus einem echten Durchlauf</H2>
                        <Lead>
                            Das ist kein Entwurf für diese Seite, sondern das, was bei einem Betrieb
                            herausgekommen ist. Die Fassungen für Facebook und Instagram und für die
                            eigene Seite, die vier Bewerberfragen und die Budgetzeile stehen in Ihrem
                            eigenen Ergebnis.
                        </Lead>
                    </div>
                    <div style={{ marginTop: 36 }}>
                        <Blatt ergebnis={BEISPIEL} beispiel angeschnitten />
                    </div>
                    <div style={{ marginTop: 26, paddingTop: 20, borderTop: `1px solid ${LINIE}`, display: "flex", gap: 18, alignItems: "baseline", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "clamp(1.9rem, 4vw, 2.6rem)", lineHeight: 1, fontWeight: 500, letterSpacing: "-0.05em", color: TINTE, fontVariantNumeric: "tabular-nums" }}>
                            69
                        </span>
                        <span style={{ fontSize: 16, lineHeight: 1.62, letterSpacing: "-0.005em", color: T60, maxWidth: "46ch" }}>
                            Bewerbungen kamen bei Patio in Oldenburg über zwei Kampagnen herein.
                            Quelle: Auswertung des Kunden.{" "}
                            <a href="/arbeiten/patio-oldenburg" style={{ color: AKZENT_HELL }}>
                                Der Fall
                            </a>
                        </span>
                    </div>
                    <div style={{ marginTop: 30 }}>
                        <Pille onClick={zumFeld}>Meine Anzeigen schreiben lassen</Pille>
                    </div>
                </Abschnitt>
            ) : null}

            {/* ── 3 Wiedererkennung ──────────────────────────────────────────────── */}
            <Abschnitt grund={REIN} geist="Kennen Sie">
                <div className="fw-sa-zwei">
                    <div>
                        <Versal>Warum Sie hier sind</Versal>
                        <div style={{ marginTop: 22 }}>
                            <H2>Einer dieser Sätze trifft zu</H2>
                        </div>
                    </div>
                    <div style={{ display: "grid", gap: 0 }}>
                        {WIEDERERKENNEN.map((w, i) => (
                            <div
                                key={i}
                                className="fw-sa-satz"
                                style={{ padding: "20px 0", borderTop: i === 0 ? "none" : `1px solid ${LINIE}` }}
                            >
                                <Nummer n={i + 1} />
                                <span style={{ fontSize: 17, lineHeight: 1.6, letterSpacing: "-0.008em", color: TINTE }}>{w}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Abschnitt>

            {/* ── 4 Was Sie bekommen ─────────────────────────────────────────────── */}
            <Abschnitt grund={PAPIER} geist="Inhalt">
                <Versal>Was herauskommt</Versal>
                <div style={{ marginTop: 22 }}>
                    <H2>Vier Dinge, keine Folien</H2>
                </div>
                <div className="fw-sa-karten" style={{ marginTop: 40 }}>
                    {WAS_SIE_BEKOMMEN.map((k, i) => (
                        <div
                            key={k.titel}
                            style={{
                                background: REIN, border: `1px solid ${LINIE}`, borderRadius: RADIUS_KARTE,
                                padding: "clamp(22px, 3vw, 30px)",
                            }}
                        >
                            <Nummer n={i + 1} />
                            <div style={{ marginTop: 14, fontSize: 21, lineHeight: 1.25, letterSpacing: "-0.04em", fontWeight: 500, color: TINTE }}>
                                {k.titel}
                            </div>
                            <p style={{ margin: "12px 0 0", fontSize: 16, lineHeight: 1.62, letterSpacing: "-0.005em", color: T60 }}>
                                {k.text}
                            </p>
                        </div>
                    ))}
                </div>
            </Abschnitt>

            {/* ── 5 Ablauf ───────────────────────────────────────────────────────── */}
            <Abschnitt grund={REIN}>
                <Versal>Ablauf</Versal>
                <div style={{ marginTop: 22 }}>
                    <H2>Zwei Minuten, dann stehen die Texte</H2>
                </div>
                <div className="fw-sa-drei" style={{ marginTop: 40 }}>
                    {ABLAUF.map((s, i) => (
                        <div key={s.titel} style={{ paddingTop: 20, borderTop: `1px solid ${LINIE}` }}>
                            <Nummer n={i + 1} />
                            <div style={{ marginTop: 12, fontSize: 19, lineHeight: 1.3, letterSpacing: "-0.035em", fontWeight: 500, color: TINTE }}>
                                {s.titel}
                            </div>
                            <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.62, letterSpacing: "-0.005em", color: T60 }}>
                                {s.text}
                            </p>
                        </div>
                    ))}
                </div>
            </Abschnitt>

            {/* ── 6 Fragen und Antworten ─────────────────────────────────────────── */}
            <Abschnitt grund={PAPIER} geist="Fragen">
                <div className="fw-sa-zwei">
                    <div>
                        <Versal>Fragen und Antworten</Versal>
                        <div style={{ marginTop: 22 }}>
                            <H2>Was Betriebe vorher wissen wollen</H2>
                        </div>
                    </div>
                    <div>
                        {FAQ.map((f, i) => (
                            <div key={f.frage} style={{ padding: "22px 0", borderTop: i === 0 ? "none" : `1px solid ${LINIE}` }}>
                                <div style={{ fontSize: 18, lineHeight: 1.35, letterSpacing: "-0.035em", fontWeight: 500, color: TINTE }}>
                                    {f.frage}
                                </div>
                                <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.62, letterSpacing: "-0.005em", color: T60, maxWidth: "58ch" }}>
                                    {f.antwort}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </Abschnitt>

            {/* ── 7 Abzweig ──────────────────────────────────────────────────────── */}
            <Abschnitt grund={DUNKEL} auf="dunkel" luft="clamp(64px, 8vw, 118px)">
                <Versal farbe={AKZENT_DUNKEL}>Danach</Versal>
                <div style={{ marginTop: 22 }}>
                    <H2 auf="dunkel">Die Anzeige ist der kleinere Teil</H2>
                    <Lead auf="dunkel" max={54}>
                        Ob sich jemand meldet, entscheidet die Ausspielung: wer sie sieht, bei welchem
                        Budget, und wie die Bewerbung hereinkommt. Genau das machen wir für Betriebe im
                        Nordwesten. Die Texte oben bekommen Sie so oder so.
                    </Lead>
                </div>
                <div style={{ marginTop: 34, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Pille auf="dunkel" onClick={zumFeld}>Anzeigen schreiben lassen</Pille>
                    <Pille auf="dunkel" art="linie" href={angebotLink}>Projekt besprechen</Pille>
                </div>
            </Abschnitt>
        </div>
    )
}

addPropertyControls(Stellenanzeiger, {
    endpunkt: {
        type: ControlType.String,
        title: "Endpunkt",
        defaultValue: "https://fokuswerk-werkzeuge.vercel.app/api/stellenanzeige",
        description: "Zieladresse des Dienstes. Zieht später auf werkzeuge.fokuswerk.de um.",
    },
    beispielZeigen: {
        type: ControlType.Boolean,
        title: "Beispiel bei Ausfall",
        defaultValue: false,
        description: "Zeigt das Beispielergebnis, wenn der Endpunkt nicht erreichbar ist. Nur zum Entwerfen.",
    },
    angebotLink: {
        type: ControlType.String,
        title: "Abzweig",
        defaultValue: "/kontakt",
    },
    rolle: {
        type: ControlType.Enum,
        title: "Rolle",
        options: ["trichter", "ergebnis"],
        optionTitles: ["Werkzeug", "Ergebnisseite"],
        defaultValue: "trichter",
        description: "Auf der Ergebnisseite zeigt der Baustein nur das Ergebnis aus der Übergabe.",
    },
    ergebnisSeite: {
        type: ControlType.String,
        title: "Ziel danach",
        defaultValue: "/stellenanzeige/ergebnis",
        description: "Adresse, auf die nach dem Absenden gewechselt wird. Darauf zählt Google Ads.",
        hidden: (p: any) => p.rolle === "ergebnis",
    },
    werkzeugSeite: {
        type: ControlType.String,
        title: "Zurück zum Werkzeug",
        defaultValue: "/stellenanzeige",
        hidden: (p: any) => p.rolle !== "ergebnis",
    },
})
