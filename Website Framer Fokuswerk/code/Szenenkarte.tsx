import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useInView } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import { Anzeigenstapel, Seitenschau, Filmstreifen } from "./Leistungsbuehne.tsx"

// Szenenkarte — eine Szene aus der Leistungsbühne als eigenständige Bildkarte für die Köpfe der
// Unterseiten (statt Stockfoto): Anzeigen-Stapel (Performance), echte Kundenseiten (Websites),
// Filmstreifen (Content). Unten Etikett und Satz wie bei den Bildkarten.

type Szene = "anzeigen" | "seiten" | "film"

interface SzenenkarteProps {
    szene: Szene
    etikett: string
    titel: string
    hinweis: string
    akzent: string
    style?: CSSProperties
}

const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const PAPIER = "rgb(245, 243, 239)"
const TINTE = "rgb(14, 15, 18)"
const FLAECHE = "rgb(42, 42, 42)"
const GRAU = "rgb(53, 53, 53)" // Markengrau für dunkle Flächen (ersetzt Tinte als Fläche)
const SAND = "rgb(236, 233, 227)"

/**
 * Szenenkarte
 *
 * @framerIntrinsicWidth 700
 * @framerIntrinsicHeight 580
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Szenenkarte(props: SzenenkarteProps) {
    const { szene = "anzeigen", etikett = "", titel = "", hinweis = "", akzent = "rgb(255, 90, 31)", style } = props
    const statisch = useIsStaticRenderer()
    const ref = useRef<HTMLDivElement>(null)
    const imBild = useInView(ref, { once: true, amount: 0.2 })
    const los = statisch || imBild
    const [aktiv, setAktiv] = useState(false)
    const [breite, setBreite] = useState(700)
    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => setBreite(el.clientWidth || 700))
        ro.observe(el)
        setBreite(el.clientWidth || 700)
        return () => ro.disconnect()
    }, [])
    const schmal = breite < 520
    const buehne = szene === "seiten" ? SAND : FLAECHE

    return (
        <div
            ref={ref}
            onPointerEnter={() => setAktiv(true)}
            onPointerLeave={() => setAktiv(false)}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: 420,
                background: GRAU,
                borderRadius: 18,
                padding: 10,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                fontFamily: SCHRIFT,
                color: PAPIER,
                overflow: "hidden",
            }}
        >
            <div style={{ position: "relative", flex: 1, minHeight: 260, borderRadius: 12, background: buehne, overflow: "hidden", isolation: "isolate" }}>
                {szene !== "seiten" && (
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: "linear-gradient(rgba(245,243,239,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,243,239,0.05) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />
                )}
                {szene === "anzeigen" && <Anzeigenstapel akzent={akzent} aktiv={aktiv} los={los} schmal={schmal} statisch={statisch} />}
                {szene === "seiten" && <Seitenschau aktiv={aktiv} los={los} schmal={schmal} statisch={statisch} akzent={akzent} />}
                {szene === "film" && <Filmstreifen aktiv={aktiv} schmal={schmal} statisch={statisch} akzent={akzent} />}
            </div>
            {(etikett || titel) && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 20, padding: schmal ? "18px 12px 10px" : "22px 24px 14px" }}>
                    <div style={{ flex: 1, display: "grid", gap: 10, minWidth: 0 }}>
                        {etikett && <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,243,239,0.42)" }}>{etikett}</span>}
                        {titel && <span style={{ fontSize: schmal ? 22 : 28, fontWeight: 500, letterSpacing: "-0.045em", lineHeight: 1.1 }}>{titel}</span>}
                    </div>
                    {hinweis && <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,243,239,0.42)", whiteSpace: "nowrap" }}>{hinweis}</span>}
                </div>
            )}
        </div>
    )
}

addPropertyControls(Szenenkarte, {
    szene: { type: ControlType.Enum, title: "Szene", options: ["anzeigen", "seiten", "film"], optionTitles: ["Anzeigen", "Websites", "Content"], defaultValue: "anzeigen" },
    etikett: { type: ControlType.String, title: "Etikett", defaultValue: "[ DER MASSSTAB ]" },
    titel: { type: ControlType.String, title: "Titel", defaultValue: "Mehr Anfragen. Nicht mehr Follower." },
    hinweis: { type: ControlType.String, title: "Hinweis", defaultValue: "" },
    akzent: { type: ControlType.Color, title: "Akzent", defaultValue: "rgb(255, 90, 31)" },
})
