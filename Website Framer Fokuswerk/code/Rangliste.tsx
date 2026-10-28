import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"

// Die Ortsrangliste — das Werkzeug auf /rangliste.
//
// Zielgruppe ist der Betrieb, der Neukunden will. Anders als bei /seo-analyse geht es
// nicht um seine Website, sondern um seinen Markt: Wie viele Betriebe seiner Art gibt es
// am Ort, wo steht er darin, und wer von ihnen wirbt.
//
// ──────────────────────────────────────────────────────────────────────────────────────
// Warum der Trichter so herum läuft
//
// Die Zahlen des Ortes stehen VOR der Dateneingabe. Das ist die ganze Mechanik dieses
// Werkzeugs: Wer liest „In Westerstede sind 14 Werkstätten, eine hat 278 Bewertungen,
// eine hat 1", hat eine Frage, die er sich selbst nicht beantworten kann — und sieht
// gleich darunter die Namen seiner Nachbarn, mit seinem eigenen mittendrin. Es fehlt
// genau eine Zeile: seine.
//
// Deshalb gibt der Endpunkt im Vorlauf die Marktzahlen und die NAMEN heraus, aber keine
// Ränge und keine Zahlen je Betrieb. Die Namen stehen alphabetisch, nicht nach Rang —
// sonst verriete die Reihenfolge schon die Rangliste.
//
// Gemessen statt geschrieben, wie beim Schwesterwerkzeug: Jede Zahl stammt aus einem
// Abruf, den der Betrieb nachprüfen kann. Er kennt in einem Ort mit vierzehn Werkstätten
// zehn davon persönlich.
// ──────────────────────────────────────────────────────────────────────────────────────
//
// Vertrag des Endpunkts:
//   POST /api/rangliste
//   Vorlauf (?vorlauf=1): { gewerk, ort }
//     200 → { bereit, anzahl, bewertungenGesamt, hoechste, niedrigste, ohneWebsite,
//             nichtUebernommen, werbendeUmKunden, namen[] }
//   Voll: { gewerk, ort, betrieb, kontakt:{name,email,telefon}, newsletter, herkunft }
//     200 → { betrieb, gewerk, ort, geprueft, einordnung, raenge, markt, eigen,
//             liste[], befunde[], anzeigen }
//   422 → { fehler: "zu_wenige_betriebe" | "betrieb_unbekannt" | … }

// --- Haus-Werte, gemessen an der Startseite -------------------------------------------
const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const TINTE = "#0e0f12"
const PAPIER = "#f5f3ef"
const REIN = "#ffffff"
const DUNKEL = "#17161b"
const SIGNAL = "#ff5a1f"
const SIGNAL_TIEF = "#d9440f"
const AKZENT_HELL = "#B84116"
const AKZENT_DUNKEL = "#FF7341"

const T60 = "rgba(14, 15, 18, 0.6)"
const T40 = "rgba(14, 15, 18, 0.42)"
const LINIE = "rgba(14, 15, 18, 0.1)"
const LINIE_FEST = "rgba(14, 15, 18, 0.16)"
const P70 = "rgba(245, 243, 239, 0.7)"
const P45 = "rgba(245, 243, 239, 0.45)"
const LINIE_D = "rgba(245, 243, 239, 0.1)"

const GUT = "#1F6B4A"
const LUECKE = "#8A6A1F"
const MANGEL = "#A8321B"
const GUT_D = "#5FBE91"
const LUECKE_D = "#D9B057"
const MANGEL_D = "#FF8A6B"

const BREIT = 1240
const RAND = "clamp(20px, 4vw, 32px)"
const LUFT = "clamp(80px, 10vw, 150px)"
const RADIUS_FELD = 12
const RADIUS_KARTE = 16

const farbeZu = (art: string, dunkel: boolean) =>
    art === "gut" ? (dunkel ? GUT_D : GUT)
        : art === "luecke" ? (dunkel ? LUECKE_D : LUECKE)
            : dunkel ? MANGEL_D : MANGEL

const WORT_ZU = { gut: "Das spricht für Sie", luecke: "Lücke", mangel: "Kostet Sie Plätze" }

const STIL = `
.fw-rl { --rand: 20px; }
@media (min-width: 810px) { .fw-rl { --rand: 32px; } }

.fw-rl-zahlen { display: grid; grid-template-columns: 1fr; }
.fw-rl-zahlen > * { padding: 22px 0 4px; border-top: 1px solid rgba(245,243,239,0.1); }
@media (min-width: 620px) {
  .fw-rl-zahlen { grid-template-columns: repeat(2, 1fr); }
  .fw-rl-zahlen > * { padding: 26px 0 4px 34px; border-top: none; border-left: 1px solid rgba(245,243,239,0.1); }
  .fw-rl-zahlen > *:nth-child(2n+1) { padding-left: 0; border-left: none; }
}
@media (min-width: 1000px) {
  .fw-rl-zahlen { grid-template-columns: repeat(4, 1fr); }
  .fw-rl-zahlen > *:nth-child(2n+1) { padding-left: 34px; border-left: 1px solid rgba(245,243,239,0.1); }
  .fw-rl-zahlen > *:first-child { padding-left: 0; border-left: none; }
}

.fw-rl-zwei { display: grid; gap: 32px; grid-template-columns: 1fr; }
@media (min-width: 810px) { .fw-rl-zwei { gap: 64px; grid-template-columns: 1fr 1.1fr; } }

.fw-rl-karten { display: grid; gap: 14px; grid-template-columns: 1fr; }
@media (min-width: 810px) { .fw-rl-karten { gap: 20px; grid-template-columns: repeat(3, 1fr); } }

/* Die Namensliste im Trichter: eine Spalte auf dem Handy, zwei ab 620. Mehr nicht —
   bei drei Spalten sucht das Auge den eigenen Namen länger, als es ihn liest. */
.fw-rl-namen { display: grid; gap: 8px; grid-template-columns: 1fr; }
@media (min-width: 620px) { .fw-rl-namen { grid-template-columns: repeat(2, 1fr); } }

/* Die Rangtabelle. Auf dem Handy fallen Schnitt und Fotos weg — sie tragen den Befund
   nicht, und sechs Spalten auf 375 px sind unlesbar. */
.fw-rl-zeile { display: grid; align-items: center; gap: 10px;
  grid-template-columns: 26px 1fr 58px 64px; }
.fw-rl-nurbreit { display: none; }
@media (min-width: 810px) {
  .fw-rl-zeile { grid-template-columns: 30px 1fr 64px 54px 50px 70px 74px; gap: 12px; }
  .fw-rl-nurbreit { display: block; }
}

.fw-rl button, .fw-rl a[href], .fw-rl label, .fw-rl input { touch-action: manipulation; }
.fw-rl button, .fw-rl a[href] { transition: transform 110ms cubic-bezier(.2,0,0,1), background-color 140ms ease, border-color 140ms ease, opacity 140ms ease; }
.fw-rl button:active:not(:disabled), .fw-rl a[href]:active { transform: scale(0.978); }
.fw-rl .fw-antwort:active { transform: scale(0.988); }

.fw-karte-dunkel {
  border: 1px solid rgba(245,243,239,0.07);
  border-top-color: rgba(245,243,239,0.16);
  background-image: linear-gradient(rgba(245,243,239,0.045), rgba(245,243,239,0) 140px);
  box-shadow: 0 2px 4px rgba(0,0,0,.2), 0 20px 44px -22px rgba(0,0,0,.5);
}
.fw-karte-hell {
  border-top-color: rgba(255,255,255,0.9);
  background-image: linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0) 120px);
  box-shadow: 0 1px 2px rgba(14,15,18,.04), 0 8px 24px -12px rgba(14,15,18,.14);
}

.fw-trichter { display: flex; flex-direction: column; }
@media (max-width: 809.98px) {
  .fw-trichter { min-height: min(62vh, 560px); padding-bottom: calc(var(--fw-ew-platz, 0px) + 8px); }
}

.fw-rl input::placeholder { color: rgba(245,243,239,0.4); }
.fw-rl *:focus-visible { outline: 2px solid ${SIGNAL}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .fw-rl *, .fw-rl *::before, .fw-rl *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; }
}
`

// --- Inhalte ---------------------------------------------------------------------------

const GEWERKE = [
    "Autowerkstatt", "Dachdecker", "Elektriker", "Maler", "Sanitär", "Tischlerei",
]

const ORTE = [
    "Oldenburg", "Westerstede", "Bad Zwischenahn", "Delmenhorst", "Wardenburg",
    "Ganderkesee", "Varel", "Rastede", "Edewecht", "Hude", "Wildeshausen", "Jever",
    "Wilhelmshaven", "Leer", "Emden", "Aurich", "Bremen", "Cloppenburg",
]

const WIESO = [
    {
        titel: "Es ist gezählt, nicht geschätzt",
        text: "Jede Zahl stammt aus dem öffentlichen Google-Profil des jeweiligen Betriebs und aus Metas eigener Werbebibliothek. Sie können jede einzelne nachschlagen.",
    },
    {
        titel: "Mit Namen, nicht anonym",
        text: "In der Liste stehen die Betriebe Ihres Ortes so, wie Sie sie kennen. Bewertet wird nur Ihr eigener Eintrag — über die anderen stehen Zahlen da, kein Urteil.",
    },
    {
        titel: "Sie bekommen es als PDF",
        text: "Vier Seiten mit der vollständigen Liste, den Befunden zu Ihrem Profil, der Anzeigenlage im Ort und den Quellen. Zum Ausdrucken und Weiterreichen.",
    },
]

const FAQ = [
    {
        frage: "Woher kommen die Zahlen?",
        antwort:
            "Aus zwei öffentlichen Quellen: den Google-Unternehmensprofilen der Betriebe an Ihrem Ort und der Meta-Werbebibliothek, Metas eigenem Verzeichnis aller geschalteten Anzeigen. Beide sind für jeden einsehbar — wir zählen nur zusammen, was ohnehin dasteht.",
    },
    {
        frage: "Warum steht mein Wettbewerber mit Namen drin?",
        antwort:
            "Weil die Liste sonst nichts wert wäre. Eine anonyme Rangliste kann niemand nachprüfen. Es stehen nur Zahlen daneben, die jeder selbst nachschlagen kann — und kein Urteil über fremde Betriebe. Bewertet wird ausschließlich Ihr eigener Eintrag.",
    },
    {
        frage: "Was kostet das?",
        antwort:
            "Nichts. Wir machen Websites und Werbung für Betriebe aus der Gegend, und dies ist die ehrlichste Art zu zeigen, dass wir hinschauen, bevor wir reden. Was Sie mit der Auswertung machen, ist Ihre Sache.",
    },
    {
        frage: "Mein Betrieb steht nicht in der Liste.",
        antwort:
            "Dann führt Google ihn unter einer anderen Kategorie oder gar nicht. Beides ist ein Befund für sich — melden Sie sich, dann schauen wir nach.",
    },
]

// --- Bausteine -------------------------------------------------------------------------

function Versal({ children, farbe, style }: any) {
    return (
        <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1, letterSpacing: "0.12em", textTransform: "uppercase", color: farbe || AKZENT_HELL, ...style }}>
            {children}
        </div>
    )
}

function Pfeil({ farbe, groesse = 13 }: any) {
    return (
        <svg width={groesse} height={groesse} viewBox="0 0 24 24" fill="none" aria-hidden style={{ flex: "0 0 auto", transition: "transform 180ms ease" }}>
            <path d="M5 12h13M12 5.5 18.5 12 12 18.5" stroke={farbe} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function Pille({ children, onClick, href, art = "voll", auf = "hell", weit = false, aus = false, typ = "button" }: any) {
    const [ueber, setUeber] = useState(false)
    const d = auf === "dunkel"
    const voll = art === "voll"
    const gemeinsam: any = {
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        font: "inherit", fontSize: 15, fontWeight: 500, letterSpacing: "-0.015em",
        background: voll ? (d ? PAPIER : TINTE) : "transparent",
        color: voll ? (d ? TINTE : PAPIER) : d ? PAPIER : TINTE,
        border: voll ? "1px solid transparent" : `1px solid ${d ? LINIE_D : LINIE_FEST}`,
        padding: "14px 22px", minHeight: 48, borderRadius: 999,
        textDecoration: "none", cursor: aus ? "default" : "pointer",
        width: weit ? "100%" : "auto", opacity: aus ? 0.4 : 1,
    }
    const inhalt = (
        <>
            <span>{children}</span>
            <span style={{ display: "inline-flex", transform: ueber && !aus ? "translateX(3px)" : "none", transition: "transform 180ms ease" }}>
                <Pfeil farbe={voll ? (d ? SIGNAL_TIEF : SIGNAL) : d ? SIGNAL : SIGNAL_TIEF} />
            </span>
        </>
    )
    if (href) return <a href={href} style={gemeinsam} onMouseEnter={() => setUeber(true)} onMouseLeave={() => setUeber(false)}>{inhalt}</a>
    return (
        <button type={typ} onClick={onClick} disabled={aus} style={gemeinsam} onMouseEnter={() => setUeber(true)} onMouseLeave={() => setUeber(false)}>
            {inhalt}
        </button>
    )
}

function Etikett({ children, auf = "hell" }: any) {
    const d = auf === "dunkel"
    return (
        <span style={{ display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 500, letterSpacing: "-0.01em", padding: "6px 11px", borderRadius: 999, border: `1px solid ${d ? LINIE_D : LINIE}`, color: d ? P70 : T60 }}>
            {children}
        </span>
    )
}

function Geisterwort({ children, auf = "hell" }: any) {
    return (
        <div aria-hidden style={{ fontSize: "clamp(3.4rem, 12vw, 8.5rem)", lineHeight: 0.82, fontWeight: 500, letterSpacing: "-0.055em", whiteSpace: "nowrap", color: auf === "dunkel" ? "rgba(245,243,239,0.07)" : "rgba(14,15,18,0.055)", marginBottom: "-0.26em", userSelect: "none", pointerEvents: "none", maxWidth: "100%", overflow: "hidden" }}>
            {children}
        </div>
    )
}

function Abschnitt({ grund = PAPIER, children, geist, auf = "hell", luft = LUFT, id }: any) {
    return (
        <section id={id} style={{ background: grund, paddingBlock: luft, paddingLeft: RAND, paddingRight: RAND }}>
            <div style={{ maxWidth: BREIT, margin: "0 auto" }}>
                {geist ? <Geisterwort auf={auf}>{geist}</Geisterwort> : null}
                {children}
            </div>
        </section>
    )
}

function H2({ children, auf = "hell" }: any) {
    return (
        <h2 style={{ margin: 0, fontSize: "clamp(1.9rem, 5vw, 3.5rem)", lineHeight: 1.0, letterSpacing: "-0.05em", fontWeight: 500, color: auf === "dunkel" ? PAPIER : TINTE, maxWidth: "20ch", textWrap: "balance" as any }}>
            {children}
        </h2>
    )
}

function Lead({ children, auf = "hell", max = 58 }: any) {
    return (
        <p style={{ margin: "22px 0 0", fontSize: 17, lineHeight: 1.58, letterSpacing: "-0.03em", color: auf === "dunkel" ? P70 : T60, maxWidth: `${max}ch` }}>
            {children}
        </p>
    )
}

function Notenstrich({ note, farbe = TINTE, grund = LINIE, hoehe = 3 }: any) {
    return (
        <div style={{ height: hoehe, background: grund, borderRadius: 999, overflow: "hidden" }}>
            <motion.div style={{ height: "100%", background: farbe, borderRadius: 999 }} initial={false}
                animate={{ width: `${Math.max(2, Math.min(100, note ?? 0))}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }} />
        </div>
    )
}

function Feld({ kennung, wert, setWert, platzhalter, auf = "dunkel", gross = false, onEnter, ...rest }: any) {
    const d = auf === "dunkel"
    return (
        <input
            id={kennung} value={wert} placeholder={platzhalter}
            onChange={(e: any) => setWert(e.target.value)}
            onKeyDown={(e: any) => {
                if (e.key !== "Enter" || !onEnter) return
                e.preventDefault()
                // Erst die Tastatur schliessen, dann weiter: iOS setzt die Scrollposition
                // beim Schliessen noch einmal selbst und ueberschreibt sonst die Korrektur.
                e.target.blur()
                onEnter()
            }}
            style={{
                width: "100%", font: "inherit", fontSize: gross ? 17 : 16, letterSpacing: "-0.03em",
                color: d ? PAPIER : TINTE,
                background: d ? "rgba(245,243,239,0.06)" : "rgba(14,15,18,0.03)",
                border: `1px solid ${d ? "rgba(245,243,239,0.14)" : LINIE_FEST}`,
                borderRadius: gross ? 999 : RADIUS_FELD,
                padding: gross ? "17px 24px" : "14px 16px",
                minHeight: gross ? 56 : 50, boxSizing: "border-box", outlineOffset: 2,
            }}
            {...rest}
        />
    )
}

// Sechs Vorschlaege, nicht acht: Acht waren auf 375 px fuenf Reihen und haben den
// Weiter-Knopf unter den Rand geschoben.
function Tippfeld({ wert, setWert, platzhalter, vorschlaege, weiter, kennung }: any) {
    const [offen, setOffen] = useState(false)
    const treffer = useMemo(() => {
        const roh = String(wert || "").trim().toLowerCase()
        if (!roh) return vorschlaege.slice(0, 6)
        const vorn: string[] = []
        const drin: string[] = []
        for (const v of vorschlaege) {
            const k = v.toLowerCase()
            if (k.startsWith(roh)) vorn.push(v)
            else if (k.includes(roh)) drin.push(v)
        }
        return [...vorn, ...drin].slice(0, 6)
    }, [wert, vorschlaege])
    const zeigen = offen && treffer.length > 0 && !treffer.some((t: string) => t.toLowerCase() === String(wert).trim().toLowerCase())
    return (
        <div>
            <Feld kennung={kennung} wert={wert} setWert={setWert} platzhalter={platzhalter}
                onEnter={() => { if (String(wert).trim().length >= 2) weiter() }}
                onFocus={() => setOffen(true)}
                onBlur={() => window.setTimeout(() => setOffen(false), 140)} />
            {zeigen ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                    {treffer.map((v: string) => (
                        <button key={v} type="button" onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setWert(v); setOffen(false) }}
                            style={{ font: "inherit", fontSize: 12, fontWeight: 500, letterSpacing: "-0.01em", color: P70, background: "transparent", border: `1px solid ${LINIE_D}`, borderRadius: 999, padding: "9px 13px", minHeight: 38, cursor: "pointer" }}>
                            {v}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

function Antwortknopf({ text, neben, gewaehlt, onClick }: any) {
    return (
        <button type="button" className="fw-antwort" onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
                font: "inherit", cursor: "pointer", borderRadius: RADIUS_FELD,
                background: gewaehlt ? "rgba(245,243,239,0.1)" : "rgba(245,243,239,0.04)",
                border: `1px solid ${gewaehlt ? "rgba(245,243,239,0.4)" : LINIE_D}`,
                padding: "15px 18px", minHeight: 60,
                transition: "border-color 140ms ease, background 140ms ease",
            }}>
            <span aria-hidden style={{
                width: 17, height: 17, borderRadius: "50%", flex: "0 0 auto",
                border: `1px solid ${gewaehlt ? PAPIER : "rgba(245,243,239,0.3)"}`,
                background: gewaehlt ? PAPIER : "transparent",
                boxShadow: gewaehlt ? `inset 0 0 0 3.5px ${DUNKEL}` : "none",
            }} />
            <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 17, fontWeight: 500, letterSpacing: "-0.03em", color: PAPIER }}>{text}</span>
                {neben ? <span style={{ display: "block", marginTop: 3, fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: P45 }}>{neben}</span> : null}
            </span>
        </button>
    )
}

const SCHRITTE_GESAMT = 5

function Fortschritt({ schritt }: { schritt: number }) {
    const vonWievielen = SCHRITTE_GESAMT - 1
    const anteil = Math.round((schritt / vonWievielen) * 100)
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}>
                <Versal farbe={P45}>Schritt {schritt} von {vonWievielen}</Versal>
                <Versal farbe={P45}>{anteil} %</Versal>
            </div>
            <Notenstrich note={anteil} hoehe={2} farbe={PAPIER} grund={LINIE_D} />
        </div>
    )
}

function Haken({ an, setAn, text }: any) {
    return (
        <label style={{ display: "flex", gap: 13, alignItems: "flex-start", cursor: "pointer", fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: P70, padding: "4px 0", minHeight: 36 }}>
            <input type="checkbox" checked={an} onChange={(e) => setAn(e.target.checked)}
                style={{ width: 19, height: 19, flex: "0 0 auto", marginTop: 1, accentColor: PAPIER }} />
            <span>{text}</span>
        </label>
    )
}

// --- Die Rangtabelle --------------------------------------------------------------------

function Kopfzelle({ children, rechts, nurBreit }: any) {
    return (
        <div className={nurBreit ? "fw-rl-nurbreit" : undefined}
            style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: T40, textAlign: rechts ? "right" : "left" }}>
            {children}
        </div>
    )
}

function Rangzeile({ b, eigen }: any) {
    const stift = eigen ? 600 : 500
    const tinte = eigen ? TINTE : "rgba(14,15,18,0.78)"
    return (
        <div className="fw-rl-zeile"
            style={{
                padding: "11px 12px", marginInline: -12, borderRadius: 8,
                background: eigen ? "rgba(184,65,22,0.07)" : "transparent",
                boxShadow: eigen ? `inset 2.5px 0 0 ${AKZENT_HELL}` : "none",
                borderBottom: `1px solid rgba(14,15,18,0.055)`,
            }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: eigen ? AKZENT_HELL : T40, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{b.platz}</div>
            <div style={{ fontSize: 14, fontWeight: stift, letterSpacing: "-0.02em", color: tinte, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
            <div style={{ fontSize: 14, fontWeight: stift, color: tinte, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b.bewertungen}</div>
            <div className="fw-rl-nurbreit" style={{ fontSize: 14, color: T60, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {b.schnitt != null ? String(b.schnitt.toFixed(1)).replace(".", ",") : "—"}
            </div>
            <div className="fw-rl-nurbreit" style={{ fontSize: 14, color: b.fotos === 0 ? MANGEL : T60, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b.fotos}</div>
            <div className="fw-rl-nurbreit" style={{ fontSize: 13, color: b.website ? GUT : MANGEL, textAlign: "right" }}>{b.website ? "ja" : "fehlt"}</div>
            <div style={{ fontSize: 13, color: b.anzeigen?.length ? GUT : T40, textAlign: "right" }}>
                {b.anzeigen?.length ? (b.anzeigen.every((a: any) => a.personal) ? "Stellen" : "ja") : "keine"}
            </div>
        </div>
    )
}

function BefundKarte({ b }: any) {
    const farbe = farbeZu(b.art, false)
    return (
        <div style={{
            borderRadius: RADIUS_KARTE, padding: "20px 22px",
            background: b.art === "gut" ? "rgba(31,107,74,0.045)" : b.art === "luecke" ? "rgba(138,106,31,0.05)" : "rgba(168,50,27,0.045)",
            boxShadow: `inset 3px 0 0 ${farbe}`,
        }}>
            <Versal farbe={farbe} style={{ fontSize: 10 }}>{WORT_ZU[b.art] || "Befund"}</Versal>
            <div style={{ margin: "9px 0 0", fontSize: 19, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.26, color: TINTE }}>{b.titel}</div>
            {b.messwert ? <div style={{ margin: "7px 0 0", fontSize: 13, lineHeight: 1.5, letterSpacing: "-0.015em", color: T40 }}>{b.messwert}</div> : null}
            <p style={{ margin: "11px 0 0", fontSize: 15, lineHeight: 1.6, letterSpacing: "-0.025em", color: "rgba(14,15,18,0.78)" }}>{b.klartext}</p>
            {b.folge ? <div style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em", color: AKZENT_HELL }}>{b.folge}</div> : null}
        </div>
    )
}

// --- Die Komponente ----------------------------------------------------------------------

export default function Rangliste(props: any) {
    const {
        endpunkt = "https://fokuswerk-werkzeuge.vercel.app/api/rangliste",
        style,
    } = props

    const [schritt, setSchritt] = useState(0)
    const [gewerk, setGewerk] = useState("")
    const [ort, setOrt] = useState("")
    const [betrieb, setBetrieb] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [telefon, setTelefon] = useState("")
    const [einwilligung, setEinwilligung] = useState(false)
    const [newsletter, setNewsletter] = useState(false)

    const [teaser, setTeaser] = useState<any>(null)
    const [laeuft, setLaeuft] = useState(false)
    const [fehler, setFehler] = useState<string | null>(null)
    const [ergebnis, setErgebnis] = useState<any>(null)

    const anker = useRef<HTMLDivElement>(null)

    // Nach jedem Schritt an den Anfang des ABSCHNITTS, nicht der Karte: Sonst klebt die
    // Frage unter der Kopfleiste und Ueberschrift, Einleitung und Fortschritt sind weg.
    useEffect(() => {
        if (schritt === 0) return
        const ziel = anker.current
        if (!ziel) return
        const y = ziel.getBoundingClientRect().top + window.scrollY - 72
        window.scrollTo({ top: y, behavior: "smooth" })
    }, [schritt])

    const abrufen = async (nutzlast: any, vorlauf: boolean) => {
        const u = endpunkt + (vorlauf ? "?vorlauf=1" : "")
        const antwort = await fetch(u, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(nutzlast),
        })
        const daten = await antwort.json().catch(() => null)
        if (!antwort.ok) throw new Error(daten?.fehler || "unbekannt")
        return daten
    }

    const teaserHolen = async () => {
        setLaeuft(true)
        setFehler(null)
        try {
            const d = await abrufen({ gewerk, ort }, true)
            setTeaser(d)
            setSchritt(3)
        } catch (f: any) {
            setFehler(
                f.message === "zu_wenige_betriebe"
                    ? `In ${ort} führt Google zu wenige ${gewerk}-Betriebe für einen Vergleich. Versuchen Sie den nächstgrößeren Ort.`
                    : f.message === "zu_viele_abrufe"
                        ? "Gerade sind viele Abrufe unterwegs. Versuchen Sie es in ein paar Minuten noch einmal."
                        : "Die Messung ist nicht durchgelaufen. Versuchen Sie es bitte noch einmal.",
            )
        } finally {
            setLaeuft(false)
        }
    }

    const absenden = async () => {
        setLaeuft(true)
        setFehler(null)
        try {
            const d = await abrufen({
                gewerk, ort, betrieb,
                kontakt: { name, email, telefon },
                newsletter,
                herkunft: herkunftLesen(),
            }, false)
            setErgebnis(d)
            setSchritt(5)
        } catch (f: any) {
            setFehler(
                f.message === "betrieb_unbekannt"
                    ? "Diesen Betrieb finden wir in der Liste nicht mehr. Gehen Sie einen Schritt zurück und wählen Sie ihn neu."
                    : "Die Auswertung ist nicht durchgelaufen. Versuchen Sie es bitte noch einmal.",
            )
        } finally {
            setLaeuft(false)
        }
    }

    const kannWeiter =
        schritt === 1 ? gewerk.trim().length >= 3
            : schritt === 2 ? ort.trim().length >= 2
                : schritt === 3 ? betrieb.length > 0
                    : schritt === 4 ? /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email.trim()) && name.trim().length >= 2 && einwilligung
                        : true

    return (
        <div ref={anker} className="fw-rl" style={{ fontFamily: SCHRIFT, background: PAPIER, ...style }}>
            <style>{STIL}</style>

            {/* ── Auftakt, dunkel mit Lichtschweif ───────────────────────────────── */}
            <section style={{ background: DUNKEL, position: "relative", overflow: "hidden", paddingBlock: "clamp(80px, 11vw, 140px)", paddingLeft: RAND, paddingRight: RAND }}>
                <div aria-hidden style={{ position: "absolute", top: "-30%", right: "-10%", width: "70vw", height: "70vw", maxWidth: 760, maxHeight: 760, borderRadius: "50%", background: `radial-gradient(circle, ${SIGNAL}22 0%, transparent 62%)`, pointerEvents: "none" }} />
                <div style={{ maxWidth: BREIT, margin: "0 auto", position: "relative" }}>
                    <Versal farbe={AKZENT_DUNKEL}>Kostenlos · In zwei Minuten</Versal>
                    <h1 style={{ margin: "26px 0 0", fontSize: "clamp(2.4rem, 7.5vw, 4.6rem)", lineHeight: 0.98, letterSpacing: "-0.05em", fontWeight: 500, color: PAPIER, maxWidth: "15ch", textWrap: "balance" as any }}>
                        Auf welchem Platz steht Ihr Betrieb?
                    </h1>
                    <Lead auf="dunkel" max={52}>
                        Wir zählen die Betriebe Ihrer Branche an Ihrem Ort durch — nach Bewertungen,
                        Fotos, Internetauftritt und danach, wer von ihnen gerade wirbt. Dann sagen wir
                        Ihnen, wo Sie darin stehen.
                    </Lead>

                    <div style={{ marginTop: 40 }}>
                        <TrichterRahmen
                            schritt={schritt} setSchritt={setSchritt}
                            laeuft={laeuft} fehler={fehler} kannWeiter={kannWeiter}
                            teaser={teaser} ergebnis={ergebnis}
                            werte={{ gewerk, setGewerk, ort, setOrt, betrieb, setBetrieb, name, setName, email, setEmail, telefon, setTelefon, einwilligung, setEinwilligung, newsletter, setNewsletter }}
                            teaserHolen={teaserHolen} absenden={absenden}
                        />
                    </div>
                </div>
            </section>

            {/* ── Das Ergebnis, sobald es da ist ─────────────────────────────────── */}
            {ergebnis ? <Ergebnisblatt e={ergebnis} /> : null}

            {/* ── Was man bekommt ────────────────────────────────────────────────── */}
            {!ergebnis ? (
                <Abschnitt geist="Dabei" grund={PAPIER}>
                    <Versal>Was Sie bekommen</Versal>
                    <div style={{ marginTop: 20 }}><H2>Eine Liste, auf der Ihre Nachbarn mit Namen stehen</H2></div>
                    <div className="fw-rl-karten" style={{ marginTop: 46 }}>
                        {WIESO.map((w, i) => (
                            <div key={w.titel} className="fw-karte-hell" style={{ background: REIN, border: `1px solid ${LINIE}`, borderRadius: RADIUS_KARTE, padding: "26px 24px 28px" }}>
                                <Versal farbe={T40} style={{ fontSize: 10 }}>{String(i + 1).padStart(2, "0")}</Versal>
                                <div style={{ margin: "14px 0 0", fontSize: 22, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.22, color: TINTE }}>{w.titel}</div>
                                <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.6, letterSpacing: "-0.025em", color: T60 }}>{w.text}</p>
                            </div>
                        ))}
                    </div>
                </Abschnitt>
            ) : null}

            {/* ── Fragen ─────────────────────────────────────────────────────────── */}
            {!ergebnis ? (
                <Abschnitt geist="Fragen" grund={REIN}>
                    <Versal>Bevor Sie anfangen</Versal>
                    <div style={{ marginTop: 20 }}><H2>Vier Fragen, die wir oft hören</H2></div>
                    <div style={{ marginTop: 44, borderTop: `1px solid ${LINIE}` }}>
                        {FAQ.map((f) => (
                            <details key={f.frage} style={{ borderBottom: `1px solid ${LINIE}` }}>
                                <summary style={{ cursor: "pointer", listStyle: "none", padding: "22px 0", fontSize: 19, fontWeight: 500, letterSpacing: "-0.03em", color: TINTE }}>
                                    {f.frage}
                                </summary>
                                <p style={{ margin: "0 0 24px", fontSize: 16, lineHeight: 1.62, letterSpacing: "-0.025em", color: T60, maxWidth: "62ch" }}>{f.antwort}</p>
                            </details>
                        ))}
                    </div>
                </Abschnitt>
            ) : null}
        </div>
    )
}

// Herkunft aus der Adresse, fuer die Zuordnung im Funnel. Faellt still aus, wenn es
// nichts zu lesen gibt — ein Werkzeug darf daran nicht haengen.
function herkunftLesen() {
    try {
        const p = new URLSearchParams(window.location.search)
        return {
            quelle: p.get("utm_source") || null,
            kampagne: p.get("utm_campaign") || null,
            anzeige: p.get("utm_content") || null,
        }
    } catch {
        return {}
    }
}

// --- Der Trichter --------------------------------------------------------------------

function TrichterRahmen({ schritt, setSchritt, laeuft, fehler, kannWeiter, teaser, ergebnis, werte, teaserHolen, absenden }: any) {
    const w = werte

    if (ergebnis) return null

    return (
        <div className="fw-karte-dunkel fw-trichter" style={{ borderRadius: 20, padding: "clamp(22px, 4vw, 34px)", maxWidth: 680, background: "rgba(245,243,239,0.03)" }}>
            {schritt > 0 && schritt < 5 ? <div style={{ marginBottom: 26 }}><Fortschritt schritt={schritt} /></div> : null}

            {schritt === 0 ? (
                <>
                    <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.035em", color: PAPIER, lineHeight: 1.3 }}>
                        Wir haben die Betriebe in Ihrem Ort schon gezählt.
                    </div>
                    <p style={{ margin: "14px 0 26px", fontSize: 15, lineHeight: 1.6, letterSpacing: "-0.025em", color: P70 }}>
                        Zwei Angaben, dann sehen Sie die Zahlen Ihres Ortes. Erst danach fragen wir,
                        welcher der Betriebe Sie sind.
                    </p>
                    <Pille auf="dunkel" onClick={() => setSchritt(1)}>Rangliste ansehen</Pille>
                </>
            ) : null}

            {schritt === 1 ? (
                <>
                    <Frage text="Was für ein Betrieb sind Sie?" neben="Damit wir die richtigen Nachbarn zählen." />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                        {GEWERKE.map((g) => (
                            <button key={g} type="button" onClick={() => { w.setGewerk(g); setSchritt(2) }}
                                style={{
                                    font: "inherit", fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em",
                                    color: w.gewerk === g ? TINTE : PAPIER,
                                    background: w.gewerk === g ? PAPIER : "rgba(245,243,239,0.05)",
                                    border: `1px solid ${w.gewerk === g ? PAPIER : LINIE_D}`,
                                    borderRadius: 999, padding: "12px 17px", minHeight: 46, cursor: "pointer",
                                }}>
                                {g}
                            </button>
                        ))}
                    </div>
                    <Feld kennung="fw-gewerk" wert={w.gewerk} setWert={w.setGewerk}
                        platzhalter="oder eintippen, z. B. Fliesenleger"
                        onEnter={() => { if (w.gewerk.trim().length >= 3) setSchritt(2) }} />
                    <Fussleiste zurueck={() => setSchritt(0)} weiter={() => setSchritt(2)} aus={!kannWeiter} />
                </>
            ) : null}

            {schritt === 2 ? (
                <>
                    <Frage text="In welchem Ort?" neben="Wir nehmen die Betriebe, die Google diesem Ort zuordnet." />
                    <Tippfeld kennung="fw-ort" wert={w.ort} setWert={w.setOrt} platzhalter="z. B. Westerstede"
                        vorschlaege={ORTE} weiter={teaserHolen} />
                    <Fussleiste zurueck={() => setSchritt(1)} weiter={teaserHolen} aus={!kannWeiter || laeuft}
                        wort={laeuft ? "Wird gezählt …" : "Zahlen ansehen"} />
                    {laeuft ? (
                        <p style={{ margin: "16px 0 0", fontSize: 13, lineHeight: 1.55, color: P45 }}>
                            Wir rufen gerade die Google-Profile aller Betriebe in {w.ort || "Ihrem Ort"} ab
                            und prüfen für jeden, ob er bei Meta wirbt. Das dauert einen Moment.
                        </p>
                    ) : null}
                </>
            ) : null}

            {schritt === 3 && teaser ? (
                <>
                    <div style={{ marginBottom: 24 }}>
                        <Versal farbe={AKZENT_DUNKEL}>{teaser.ort}</Versal>
                        <div style={{ margin: "14px 0 0", fontSize: 22, fontWeight: 500, letterSpacing: "-0.035em", color: PAPIER, lineHeight: 1.3 }}>
                            {teaser.anzahl} {teaser.gewerkPlural} — zusammen {new Intl.NumberFormat("de-DE").format(teaser.bewertungenGesamt)} Bewertungen.
                        </div>
                        <p style={{ margin: "10px 0 0", fontSize: 15, lineHeight: 1.6, letterSpacing: "-0.025em", color: P70 }}>
                            Der mit den meisten hat {teaser.hoechste}, der mit den wenigsten {teaser.niedrigste}.
                            {teaser.ohneWebsite > 0 ? ` ${teaser.ohneWebsite} haben keinen Internetauftritt im Profil.` : ""}
                            {teaser.anzeigenGemessen
                                ? teaser.werbendeUmKunden === 0
                                    ? " Um Kunden wirbt hier keiner."
                                    : ` ${teaser.werbendeUmKunden} werben um Kunden.`
                                : ""}
                        </p>
                    </div>

                    <Frage text="Welcher davon sind Sie?" neben="Danach sehen Sie Ihren Platz in der Liste." />
                    <div className="fw-rl-namen" style={{ marginBottom: 18, maxHeight: 340, overflowY: "auto" }}>
                        {teaser.namen.map((n: string) => (
                            <button key={n} type="button" onClick={() => { w.setBetrieb(n); setSchritt(4) }}
                                style={{
                                    font: "inherit", fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em",
                                    textAlign: "left", color: w.betrieb === n ? TINTE : PAPIER,
                                    background: w.betrieb === n ? PAPIER : "rgba(245,243,239,0.04)",
                                    border: `1px solid ${w.betrieb === n ? PAPIER : LINIE_D}`,
                                    borderRadius: RADIUS_FELD, padding: "13px 15px", minHeight: 48, cursor: "pointer",
                                }}>
                                {n}
                            </button>
                        ))}
                    </div>
                    <p style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.5, color: P45 }}>
                        Nicht dabei? Dann führt Google Sie unter einer anderen Kategorie — das ist für
                        sich schon ein Befund. Schreiben Sie uns, dann schauen wir nach.
                    </p>
                    <Fussleiste zurueck={() => setSchritt(2)} weiter={() => setSchritt(4)} aus={!kannWeiter} />
                </>
            ) : null}

            {schritt === 4 ? (
                <>
                    <Frage text="Wohin dürfen wir die Auswertung schicken?"
                        neben={`Sie bekommen die vollständige Liste aller ${teaser?.anzahl ?? ""} Betriebe als PDF.`} />
                    <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
                        <Feld kennung="fw-name" wert={w.name} setWert={w.setName} platzhalter="Ihr Name" autoComplete="name" />
                        <Feld kennung="fw-mail" wert={w.email} setWert={w.setEmail} platzhalter="E-Mail" type="email" autoComplete="email" inputMode="email" />
                        <Feld kennung="fw-tel" wert={w.telefon} setWert={w.setTelefon} platzhalter="Telefon (freiwillig)" type="tel" autoComplete="tel" inputMode="tel" />
                    </div>
                    <div style={{ display: "grid", gap: 4, marginBottom: 20 }}>
                        <Haken an={w.einwilligung} setAn={w.setEinwilligung}
                            text="Fokuswerk darf mir die Auswertung schicken und sich zu dieser Anfrage melden. Jederzeit widerrufbar, die Angaben gehen an niemanden sonst." />
                        <Haken an={w.newsletter} setAn={w.setNewsletter}
                            text="Schickt mir außerdem, was bei anderen Betrieben funktioniert hat — ein paar Mal im Jahr, jederzeit abbestellbar." />
                    </div>
                    <Fussleiste zurueck={() => setSchritt(3)} weiter={absenden} aus={!kannWeiter || laeuft}
                        wort={laeuft ? "Wird gerechnet …" : "Meinen Platz ansehen"} />
                </>
            ) : null}

            {fehler ? (
                <div role="alert" style={{ marginTop: 18, padding: "14px 16px", borderRadius: RADIUS_FELD, background: "rgba(255,138,107,0.1)", border: `1px solid rgba(255,138,107,0.3)`, fontSize: 14, lineHeight: 1.55, color: MANGEL_D }}>
                    {fehler}
                </div>
            ) : null}
        </div>
    )
}

function Frage({ text, neben }: any) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.26, color: PAPIER }}>{text}</div>
            {neben ? <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55, letterSpacing: "-0.02em", color: P45 }}>{neben}</p> : null}
        </div>
    )
}

function Fussleiste({ zurueck, weiter, aus, wort = "Weiter" }: any) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
            <Pille auf="dunkel" onClick={weiter} aus={aus}>{wort}</Pille>
            <button type="button" onClick={zurueck}
                style={{ font: "inherit", fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em", color: P45, background: "transparent", border: "none", cursor: "pointer", padding: "10px 4px", minHeight: 40 }}>
                Zurück
            </button>
        </div>
    )
}

// --- Das Ergebnis -----------------------------------------------------------------------

function Ergebnisblatt({ e }: any) {
    const anteil = ((e.liste.length - e.eigen.platz + 1) / e.liste.length) * 100
    return (
        <>
            <section style={{ background: DUNKEL, paddingBlock: "clamp(60px, 8vw, 110px)", paddingLeft: RAND, paddingRight: RAND }}>
                <div style={{ maxWidth: BREIT, margin: "0 auto" }}>
                    <Versal farbe={AKZENT_DUNKEL}>Ihr Platz in {e.ort}</Versal>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
                        <div style={{ fontSize: "clamp(4rem, 14vw, 7.5rem)", lineHeight: 0.9, fontWeight: 500, letterSpacing: "-0.05em", color: PAPIER }}>{e.eigen.platz}</div>
                        <div style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.03em", color: P45 }}>von {e.liste.length}</div>
                        <div style={{ marginLeft: "auto", fontSize: 19, fontWeight: 500, letterSpacing: "-0.03em", color: AKZENT_DUNKEL }}>{e.einordnung.wort}</div>
                    </div>
                    <div style={{ marginTop: 22 }}><Notenstrich note={anteil} hoehe={3} farbe={PAPIER} grund="rgba(245,243,239,0.14)" /></div>
                    <Lead auf="dunkel" max={62}>{e.einordnung.satz}</Lead>

                    <div className="fw-rl-zahlen" style={{ marginTop: 48 }}>
                        {[
                            { w: String(e.markt.anzahl), t: `${e.gewerkPlural} im Ort` },
                            { w: new Intl.NumberFormat("de-DE").format(e.markt.bewertungenGesamt), t: "Bewertungen zusammen" },
                            { w: `${e.markt.ohneWebsite} von ${e.markt.anzahl}`, t: "ohne Internetauftritt im Profil" },
                            { w: `${e.markt.umKunden} von ${e.markt.anzahl}`, t: "werben bei Meta um Kunden" },
                        ].map((k) => (
                            <div key={k.t}>
                                <div style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 500, letterSpacing: "-0.04em", color: PAPIER, lineHeight: 1.1 }}>{k.w}</div>
                                <div style={{ marginTop: 7, fontSize: 14, lineHeight: 1.5, letterSpacing: "-0.02em", color: P45 }}>{k.t}</div>
                            </div>
                        ))}
                    </div>

                    <p style={{ margin: "40px 0 0", fontSize: 14, lineHeight: 1.6, color: P45, maxWidth: "62ch" }}>
                        Die vollständige Auswertung ist unterwegs an Ihr Postfach — vier Seiten mit der
                        Liste, den Befunden und allen Quellen zum Nachprüfen.
                    </p>
                </div>
            </section>

            <Abschnitt geist="Die Liste" grund={PAPIER}>
                <Versal>Alle {e.liste.length} Betriebe</Versal>
                <div style={{ marginTop: 20 }}><H2>{e.gewerkPlural} in {e.ort}</H2></div>
                <Lead>Sortiert nach der Zahl der Bewertungen. Ihr Betrieb ist hervorgehoben. Über die
                    anderen stehen hier Zahlen — kein Urteil.</Lead>

                <div style={{ marginTop: 44 }}>
                    <div className="fw-rl-zeile" style={{ padding: "0 12px 11px", marginInline: -12, borderBottom: `1px solid ${LINIE_FEST}` }}>
                        <Kopfzelle rechts />
                        <Kopfzelle>Betrieb</Kopfzelle>
                        <Kopfzelle rechts>Bewert.</Kopfzelle>
                        <Kopfzelle rechts nurBreit>Schnitt</Kopfzelle>
                        <Kopfzelle rechts nurBreit>Fotos</Kopfzelle>
                        <Kopfzelle rechts nurBreit>Website</Kopfzelle>
                        <Kopfzelle rechts>Anzeigen</Kopfzelle>
                    </div>
                    {e.liste.map((b: any) => <Rangzeile key={b.name} b={b} eigen={b.name === e.betrieb} />)}
                </div>

                <p style={{ margin: "26px 0 0", fontSize: 13, lineHeight: 1.6, color: T40, maxWidth: "80ch" }}>
                    Bewertungen und Schnitt sind die von Google ausgewiesenen Werte, Fotos die Zahl der
                    im Profil hinterlegten Bilder. „Website: fehlt" heißt, dass im Google-Profil kein
                    Internetauftritt eingetragen ist — nicht, dass es keinen gibt. Die Anzeigenspalte ist
                    über die Meta-Werbebibliothek geprüft, aktive und vergangene Anzeigen.
                </p>
            </Abschnitt>

            <Abschnitt geist="Befunde" grund={REIN}>
                <Versal>Was dahinter steht</Versal>
                <div style={{ marginTop: 20 }}><H2>Woher Ihr Platz kommt</H2></div>
                <div style={{ display: "grid", gap: 14, marginTop: 44 }}>
                    {e.befunde.map((b: any) => <BefundKarte key={b.titel} b={b} />)}
                    {e.anzeigen ? <BefundKarte b={e.anzeigen.befund} /> : null}
                </div>
            </Abschnitt>
        </>
    )
}

addPropertyControls(Rangliste, {
    endpunkt: {
        type: ControlType.String,
        title: "Endpunkt",
        defaultValue: "https://fokuswerk-werkzeuge.vercel.app/api/rangliste",
        description:
            "Die Zieladresse haengt als Eigenschaft am Baustein. Vorgabewerte frieren beim " +
            "Platzieren ein — eine Aenderung im Code erreicht eine bestehende Instanz nicht, " +
            "die muss geloescht und neu gesetzt werden.",
    },
})
