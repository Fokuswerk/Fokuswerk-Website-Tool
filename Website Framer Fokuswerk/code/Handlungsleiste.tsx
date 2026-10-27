import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties } from "react"

// Handlungsleiste — nur auf dem Handy, fest am unteren Rand.
//
// Gemessen am 06.10.2026: Die Startseite ist auf dem iPhone 18.142 px lang, also 22 Bildschirme.
// Der erste Handlungsaufruf steht bei 518 px im Auftakt, der nächste erst bei 15.773 px im
// Abschluss. Dazwischen liegen 18,8 Bildschirme, auf denen niemand sich melden kann — wer bei
// „Arbeiten" überzeugt ist, muss zehn Bildschirme weiterscrollen, um das auszudrücken.
//
// Die Leiste schließt diese Lücke: Sie fährt ein, sobald der Auftakt oben raus ist, und zieht
// sich wieder zurück, sobald der Abschluss im Bild ist — dort stehen die eigentlichen Knöpfe,
// und zwei Angebote übereinander wären Lärm. Auf Tablet und Desktop erscheint sie nie.
//
// Sie liegt im Layout und gilt damit für alle Seiten (vorher nur Startseite: /leistungen hatte
// 11,5 Bildschirme ohne jede Möglichkeit, sich zu melden). Zwei Ausnahmen halten sie zurück:
// auf der Zielseite selbst (/kontakt — dort ist man schon) und wenn ein Formular im Bild ist,
// damit sie nie ein Feld verdeckt.

interface HandlungsleisteProps {
    anrufText: string
    telefon: string
    hauptText: string
    hauptZiel: string
    abschlussAnker: string
    akzent: string
    schwelle: number
    style?: CSSProperties
}

const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const PAPIER = "rgb(245, 243, 239)"
const TINTE = "rgb(14, 15, 18)"
const FLAECHE = "rgba(28, 28, 30, 0.82)"
const KANTE = "rgba(245, 243, 239, 0.14)"
const BRUCH = 810

/**
 * Handlungsleiste
 *
 * @framerIntrinsicWidth 320
 * @framerIntrinsicHeight 1
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight fixed
 * @framerDisableUnlink
 */
export default function Handlungsleiste(props: HandlungsleisteProps) {
    const {
        anrufText = "Anrufen",
        telefon = "+4917663307587",
        hauptText = "Projekt besprechen",
        hauptZiel = "/kontakt",
        abschlussAnker = "kontakt",
        akzent = "rgb(255, 90, 31)",
        schwelle = 0.85,
        style,
    } = props
    const statisch = useIsStaticRenderer()
    const reduziert = useReducedMotion() ?? false
    const [zeigen, setZeigen] = useState(false)
    const amAbschluss = useRef(false)

    useEffect(() => {
        if (statisch || typeof window === "undefined") return

        // Solange der Abschluss im Bild ist, bleibt die Leiste unten — seine Knöpfe reichen.
        let beobachter: IntersectionObserver | null = null
        const anAbschluss = () => {
            const ziel = document.getElementById(abschlussAnker)
            if (!ziel || typeof IntersectionObserver === "undefined") return
            beobachter = new IntersectionObserver(
                (eintraege) => {
                    amAbschluss.current = eintraege.some((e) => e.isIntersecting)
                    pruefen()
                },
                { rootMargin: "0px 0px -20% 0px" }
            )
            beobachter.observe(ziel)
        }

        // Auf der Zielseite selbst wäre der Knopf sinnlos ("Projekt besprechen" auf /kontakt)
        const aufZielseite = () => {
            const weg = (s: string) => (s || "").split(/[?#]/)[0].replace(/\/+$/, "") || "/"
            return weg(window.location.pathname) === weg(hauptZiel)
        }

        // Kein Knopf über einem Formular, das gerade ausgefüllt wird
        // Die Leiste tritt zurück, solange der Besucher an einem Formular steht.
        //
        // ▲ Geprüft wurde nur auf `<form>`. Die Werkzeugseiten (/stellenanzeige,
        // /seo-analyse) bauen ihren Trichter aus `div`s — dort lag die Leiste
        // auf dem Handy 69 px unter dem Absende-Knopf und war heller als er.
        // Deshalb zusätzlich die Marke `data-fw-formular`, die solche Trichter tragen.
        const formularImBild = () =>
            Array.from(document.querySelectorAll("form, [data-fw-formular]")).some((f) => {
                const r = f.getBoundingClientRect()
                return r.height > 2 && r.top < window.innerHeight && r.bottom > 0
            })

        const pruefen = () => {
            const schmal = window.innerWidth < BRUCH
            const weitGenug = window.scrollY > window.innerHeight * schwelle
            setZeigen(schmal && weitGenug && !amAbschluss.current && !aufZielseite() && !formularImBild())
        }

        pruefen()
        anAbschluss()
        window.addEventListener("scroll", pruefen, { passive: true })
        window.addEventListener("resize", pruefen)
        // Seitenwechsel: der Abschluss der neuen Seite muss neu beobachtet werden
        const mo =
            typeof MutationObserver !== "undefined"
                ? new MutationObserver(() => {
                      beobachter?.disconnect()
                      amAbschluss.current = false
                      anAbschluss()
                      pruefen()
                  })
                : null
        mo?.observe(document.body, { childList: true })
        const spaet = [200, 800].map((ms) => window.setTimeout(pruefen, ms))

        return () => {
            window.removeEventListener("scroll", pruefen)
            window.removeEventListener("resize", pruefen)
            beobachter?.disconnect()
            mo?.disconnect()
            spaet.forEach((t) => window.clearTimeout(t))
        }
    }, [statisch, schwelle, abschlussAnker, hauptZiel])

    const knopf: CSSProperties = {
        fontFamily: SCHRIFT,
        fontSize: 14.5,
        fontWeight: 500,
        letterSpacing: "-0.015em",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 48,
        borderRadius: 99,
        textDecoration: "none",
        whiteSpace: "nowrap",
        WebkitTapHighlightColor: "transparent",
    }

    return (
        <div style={{ ...style, width: "100%", height: 1, pointerEvents: "none" }}>
            <AnimatePresence>
                {zeigen && (
                    <motion.div
                        initial={reduziert ? { opacity: 0 } : { y: "120%" }}
                        animate={reduziert ? { opacity: 1 } : { y: 0 }}
                        exit={reduziert ? { opacity: 0 } : { y: "120%" }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: "fixed",
                            left: 12,
                            right: 12,
                            bottom: "max(12px, env(safe-area-inset-bottom))",
                            zIndex: 2147483000,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: 8,
                            borderRadius: 99,
                            background: FLAECHE,
                            backdropFilter: "blur(20px) saturate(1.6)",
                            WebkitBackdropFilter: "blur(20px) saturate(1.6)",
                            boxShadow: `inset 0 0 0 1px ${KANTE}, 0 24px 50px -20px rgba(0,0,0,0.75)`,
                            pointerEvents: "auto",
                        }}
                    >
                        <a
                            href={`tel:${telefon}`}
                            aria-label={`${anrufText} — ${telefon}`}
                            style={{ ...knopf, flex: "0 0 auto", padding: "0 18px", color: PAPIER, boxShadow: `inset 0 0 0 1px ${KANTE}` }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M6.2 3.5h3l1.5 3.8-2 1.5a12.5 12.5 0 0 0 6.5 6.5l1.5-2 3.8 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z"
                                    fill="none"
                                    stroke={PAPIER}
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            {anrufText}
                        </a>
                        <a href={hauptZiel} style={{ ...knopf, flex: 1, background: PAPIER, color: TINTE, fontWeight: 600 }}>
                            {hauptText}
                            <svg width="17" height="11" viewBox="0 0 26 12" aria-hidden="true">
                                <path d="M0 6h23M18.5 1 23.5 6l-5 5" fill="none" stroke={akzent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

addPropertyControls(Handlungsleiste, {
    anrufText: { type: ControlType.String, title: "Anruf", defaultValue: "Anrufen" },
    telefon: { type: ControlType.String, title: "Nummer", defaultValue: "+4917663307587" },
    hauptText: { type: ControlType.String, title: "Haupt-Knopf", defaultValue: "Projekt besprechen" },
    hauptZiel: { type: ControlType.Link, title: "Ziel" },
    abschlussAnker: { type: ControlType.String, title: "Abschluss-ID", defaultValue: "kontakt" },
    akzent: { type: ControlType.Color, title: "Akzent", defaultValue: "rgb(255, 90, 31)" },
    schwelle: { type: ControlType.Number, title: "Ab Bildschirm", min: 0.2, max: 3, step: 0.05, defaultValue: 0.85 },
})
