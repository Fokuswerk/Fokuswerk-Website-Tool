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
//   200 → { betrieb, anzeigen:[{titel,text}×3], fragen:[×4], budget }
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

.fw-sa-karten { display: grid; gap: 14px; grid-template-columns: 1fr; }
@media (min-width: 810px) { .fw-sa-karten { gap: 20px; grid-template-columns: repeat(2, 1fr); } }

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

// Die Antwort braucht rund 30 Sekunden. Läuft der Vorlauf, ist sie meist schon da.
const LAUFTEXTE = [
    { ab: 0, text: "Wir lesen Ihre Website." },
    { ab: 7, text: "Wir sehen nach, was Ihren Betrieb ausmacht." },
    { ab: 16, text: "Wir schreiben die Anzeigen. Gleich fertig." },
    { ab: 32, text: "Dauert heute etwas länger. Bitte bleiben Sie noch einen Moment." },
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

interface Anzeige { titel: string; text: string }
interface Ergebnis {
    betrieb: string
    anzeigen: Anzeige[]
    fragen: string[]
    budget: string
}

// Echtes Ergebnis eines Durchlaufs, hier als Beweis, was herauskommt. Steht ausdrücklich
// als Beispiel da — es ist nicht die Seite des Besuchers.
const BEISPIEL: Ergebnis = {
    betrieb: "Knolle Garten- und Landschaftsbau",
    anzeigen: [
        {
            titel: "Landschaftsgärtner (m/w/d) in Harpstedt",
            text: "Wir bauen Gärten in Harpstedt und Umgebung.\nWas Sie bei uns finden: ein festes Team, Maschinen, die laufen, und Feierabend, wenn Feierabend ist.\nBewerbung in zwei Minuten, ohne Lebenslauf.",
        },
        {
            titel: "Kein Bock mehr auf Baustellen quer durch Niedersachsen?",
            text: "Bei uns sind die Fahrten kurz. Unsere Baustellen liegen im Umkreis.\nEingespieltes Team, moderne Maschinen, Bezahlung über dem Üblichen.\nMelden Sie sich — wir rufen zurück.",
        },
        {
            titel: "Landschaftsgärtner gesucht — Harpstedt",
            text: "Festanstellung, unbefristet, ab sofort.\nWir suchen zwei bis drei Leute für unser Team.\nSchreiben Sie uns, worauf Sie Lust haben. Den Rest klären wir im Gespräch.",
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
        titel: "Drei Anzeigentexte",
        text: "Drei verschiedene Anläufe auf dieselbe Stelle — einer sachlich, einer direkt, einer über das, was bei Ihnen anders ist. Sie können sie unverändert einstellen.",
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

function Blatt({ ergebnis, beispiel = false, angeschnitten = false }: { ergebnis: Ergebnis; beispiel?: boolean; angeschnitten?: boolean }) {
    const [kopiert, setKopiert] = useState<number | null>(null)
    const anzeigen = angeschnitten ? ergebnis.anzeigen.slice(0, 2) : ergebnis.anzeigen

    function kopieren(i: number, text: string) {
        try {
            navigator.clipboard.writeText(text)
            melde("anzeige_kopiert", { nummer: i + 1 })
            setKopiert(i)
            window.setTimeout(() => setKopiert(null), 2000)
        } catch (e) {
            // Ohne Zwischenablage bleibt der Text markierbar. Kein Grund für eine Meldung.
        }
    }

    return (
        <div>
            <div className="fw-sa-karten">
                {anzeigen.map((a, i) => (
                    <div
                        key={i}
                        style={{
                            background: REIN, border: `1px solid ${LINIE}`, borderRadius: RADIUS_KARTE,
                            padding: "clamp(20px, 3vw, 28px)", display: "flex", flexDirection: "column", gap: 14,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Nummer n={i + 1} />
                            <Versal farbe={T40}>Anzeige</Versal>
                        </div>
                        <div style={{ fontSize: 19, lineHeight: 1.3, letterSpacing: "-0.035em", fontWeight: 500, color: TINTE }}>
                            {a.titel}
                        </div>
                        <div style={{ flex: "1 1 auto" }}>
                            <Absaetze text={a.text} farbe={T60} />
                        </div>
                        {!angeschnitten ? (
                            <div>
                                <button
                                    type="button"
                                    onClick={() => kopieren(i, (a.titel ? a.titel + "\n\n" : "") + a.text)}
                                    style={{
                                        font: "inherit", fontSize: 12, fontWeight: 500, letterSpacing: "-0.01em",
                                        color: kopiert === i ? AKZENT_HELL : T60, background: "transparent",
                                        border: `1px solid ${LINIE}`, borderRadius: 999,
                                        padding: "9px 14px", minHeight: 40, cursor: "pointer",
                                    }}
                                >
                                    {kopiert === i ? "Kopiert" : "Text kopieren"}
                                </button>
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>

            {!angeschnitten ? (
                <div className="fw-sa-karten" style={{ marginTop: 14 }}>
                    <div style={{ background: REIN, border: `1px solid ${LINIE}`, borderRadius: RADIUS_KARTE, padding: "clamp(20px, 3vw, 28px)" }}>
                        <Versal farbe={T40}>Vier Fragen für die Bewerbung</Versal>
                        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                            {(ergebnis.fragen || []).map((f, i) => (
                                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <Nummer n={i + 1} />
                                    <span style={{ fontSize: 16, lineHeight: 1.62, letterSpacing: "-0.005em", color: TINTE }}>{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ background: REIN, border: `1px solid ${LINIE}`, borderRadius: RADIUS_KARTE, padding: "clamp(20px, 3vw, 28px)" }}>
                        <Versal farbe={T40}>Budget</Versal>
                        <div style={{ marginTop: 16 }}>
                            <Absaetze text={ergebnis.budget || ""} farbe={TINTE} />
                        </div>
                        <p style={{ margin: "16px 0 0", fontSize: 14, lineHeight: 1.55, letterSpacing: "-0.02em", color: T40 }}>
                            Richtwert aus Ihren Angaben, keine Zusage. Was wirklich nötig ist, hängt an Ort,
                            Beruf und Wettbewerb.
                        </p>
                    </div>
                </div>
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

interface StellenanzeigerProps {
    endpunkt?: string
    beispielZeigen?: boolean
    angebotLink?: string
    style?: any
}

export default function Stellenanzeiger(props: StellenanzeigerProps) {
    const {
        endpunkt = "https://fokuswerk-werkzeuge.vercel.app/api/stellenanzeige",
        beispielZeigen = false,
        angebotLink = "/kontakt",
        style,
    } = props

    const [lage, setLage] = useState<"formular" | "laeuft" | "fertig" | "fehler">("formular")
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
    const fertig = lage === "fertig"
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
            setErgebnis(await antwort.json())
            setLage("fertig")
            melde("trichter_abgeschlossen", {
                beruf: String(antworten.beruf || ""),
                dringlichkeit: antworten.dringlichkeit,
                stellen: antworten.stellen,
                herkunft: herkunft.current?.quelle || "direkt",
            })
        } catch (e) {
            // Hier landet nur, wer den Endpunkt gar nicht erreicht: keine Verbindung, oder
            // der Türsteher (ORIGINS) lässt den Browser wortlos abblitzen.
            if (beispielZeigen) {
                setErgebnis({ ...BEISPIEL, betrieb: domain.trim() || BEISPIEL.betrieb })
                setBeispiel(true)
                setLage("fertig")
            } else {
                setFehler("netz")
                setLage("fehler")
            }
        }
    }

    function nochmal() {
        setLage("formular")
        setSchritt(SCHRITT_ADRESSE)
        setErgebnis(null)
        setBetriebName("")
        setVorlaufFehler("")
        setBeispiel(false)
        vorlaufLaeuft.current = ""
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
                                Das dauert heute länger. Die Anzeigen kommen auch per Mail — Sie können
                                die Seite schließen.
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
                        {fertig ? "Ihre Anzeigen · gerade geschrieben" : "Kostenloses Werkzeug"}
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
                        Ihre Stellenanzeige, fertig geschrieben
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
                            ? "Drei Texte, vier Fragen für die Bewerbung, eine Budgetzeile. Stellen Sie die Texte unverändert ein oder ändern Sie, was nicht passt."
                            : "Wir lesen Ihre Website und schreiben daraus drei Anzeigentexte für Facebook und Instagram — dazu vier Fragen für die Bewerbung und eine Budgetzeile."}
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
                                <Blatt ergebnis={ergebnis} beispiel={beispiel} />
                                {!beispiel ? <Rueckruf /> : null}
                                <div style={{ marginTop: 26, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                                    <Pille art="linie" onClick={nochmal}>Noch eine Stelle</Pille>
                                    {!beispiel ? (
                                        <span style={{ fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: T40 }}>
                                            Die Texte sind unterwegs an {mail.trim()}.
                                        </span>
                                    ) : null}
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
                                { zahl: "3", label: "fertige Anzeigentexte", quelle: "zum Einstellen oder Ändern" },
                                { zahl: "4", label: "Fragen für die Bewerbung", quelle: "damit Sie wissen, wen Sie zurückrufen" },
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
                        <H2>Zwei von drei Texten, aus einem echten Durchlauf</H2>
                        <Lead>
                            Das ist kein Entwurf für diese Seite, sondern das, was bei einem Betrieb
                            herausgekommen ist. Der dritte Text, die vier Bewerberfragen und die
                            Budgetzeile stehen in Ihrem eigenen Ergebnis.
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
})
