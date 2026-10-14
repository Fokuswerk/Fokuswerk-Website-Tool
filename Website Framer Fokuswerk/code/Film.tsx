import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useRef, useState, type CSSProperties } from "react"

// Film — ein Video, das erst auf Klick lädt.
// Vorher steht nur das Standbild da (ein Bild, ~60–120 KB). Die Videodatei selbst holt der
// Browser erst, wenn jemand auf Abspielen tippt: preload="none" und das <video> entsteht
// überhaupt erst beim Klick. Damit kostet ein 7-MB-Film auf einer Seite, die niemand abspielt,
// exakt null. Kein YouTube- oder Vimeo-Einbau: deren Player lädt 3,7 MB vor dem ersten Klick.
// Ohne Datei und ohne Standbild zeichnet der Baustein nichts — so bleiben Fallstudien ohne
// Film sauber, statt ein leeres Feld zu zeigen.

interface Bild {
    src?: string
    srcSet?: string
    alt?: string
}

interface FilmProps {
    datei?: string
    standbild?: Bild
    verhaeltnis: number
    radius: number
    beschriftung: string
    knopfFarbe: string
    knopfGrund: string
    style?: CSSProperties
}

const PFEIL = "M8 5.14v14.72a1 1 0 0 0 1.52.85l11.18-7.36a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z"

export default function Film(props: FilmProps) {
    const { datei, standbild, verhaeltnis, radius, beschriftung, knopfFarbe, knopfGrund, style } = props
    const istStatisch = useIsStaticRenderer()
    const [laeuft, setLaeuft] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const quelle = typeof datei === "string" ? datei : ""
    const bild = standbild?.src
    if (!quelle && !bild) return null

    const starten = () => {
        if (!quelle) return
        setLaeuft(true)
        // Der Browser braucht einen Takt, bis das <video> im Baum steht.
        window.setTimeout(() => videoRef.current?.play().catch(() => {}), 0)
    }

    return (
        <div style={{ ...style, display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: String(verhaeltnis),
                    borderRadius: radius,
                    overflow: "hidden",
                    background: "rgb(18,16,19)",
                }}
            >
                {!laeuft && (
                    <>
                        {bild && (
                            <img
                                src={bild}
                                srcSet={standbild?.srcSet}
                                alt={standbild?.alt || "Standbild des Films"}
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        )}
                        {quelle && !istStatisch && (
                            <button
                                type="button"
                                onClick={starten}
                                aria-label={beschriftung ? `Film abspielen: ${beschriftung}` : "Film abspielen"}
                                style={{
                                    all: "unset",
                                    position: "absolute",
                                    inset: 0,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    WebkitTapHighlightColor: "transparent",
                                }}
                            >
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 72,
                                        height: 72,
                                        borderRadius: 72,
                                        background: knopfGrund,
                                        backdropFilter: "blur(8px)",
                                        WebkitBackdropFilter: "blur(8px)",
                                        boxShadow: "0 18px 40px -18px rgba(0,0,0,0.6)",
                                    }}
                                >
                                    <svg width="26" height="26" viewBox="0 0 26 26" style={{ marginLeft: 3 }}>
                                        <path d={PFEIL} fill={knopfFarbe} />
                                    </svg>
                                </span>
                            </button>
                        )}
                    </>
                )}
                {laeuft && quelle && (
                    <video
                        ref={videoRef}
                        src={quelle}
                        poster={bild}
                        controls
                        playsInline
                        preload="none"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", background: "rgb(18,16,19)" }}
                    />
                )}
            </div>
            {beschriftung ? (
                <span
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        lineHeight: 1.45,
                        letterSpacing: "-0.01em",
                        color: "var(--token-5529ab13-d600-4003-9a2a-e0204247a6ac, rgba(245,243,239,0.4))",
                    }}
                >
                    {beschriftung}
                </span>
            ) : null}
        </div>
    )
}

Film.defaultProps = {
    verhaeltnis: 0.5625,
    radius: 16,
    beschriftung: "",
    knopfFarbe: "rgb(18,16,19)",
    knopfGrund: "rgba(244,243,239,0.92)",
}

addPropertyControls(Film, {
    datei: { type: ControlType.File, title: "Datei", allowedFileTypes: ["mp4", "webm", "mov"] },
    standbild: { type: ControlType.ResponsiveImage, title: "Standbild" },
    verhaeltnis: {
        type: ControlType.Number,
        title: "Verhältnis",
        description: "Breite geteilt durch Höhe. Hochkant 9:16 = 0.5625, quer 16:9 = 1.78.",
        min: 0.3,
        max: 3,
        step: 0.0125,
        displayStepper: true,
        defaultValue: 0.5625,
    },
    radius: { type: ControlType.Number, title: "Radius", min: 0, max: 48, step: 1, defaultValue: 16 },
    beschriftung: { type: ControlType.String, title: "Bildunterschrift", defaultValue: "" },
    knopfFarbe: { type: ControlType.Color, title: "Pfeil", defaultValue: "rgb(18,16,19)" },
    knopfGrund: { type: ControlType.Color, title: "Knopf", defaultValue: "rgba(244,243,239,0.92)" },
})
