import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"

// Langer, dünner Pfeil (38 × 7,4) — Form nach dem Spector-Knopf.

interface PfeilProps {
    farbe: string
    style?: CSSProperties
}

/**
 * Pfeil
 *
 * @framerIntrinsicWidth 38
 * @framerIntrinsicHeight 8
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function Pfeil(props: PfeilProps) {
    const { farbe = "rgb(255, 90, 31)", style } = props
    return (
        <div
            aria-hidden="true"
            style={{ ...style, position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center" }}
        >
            <svg
                viewBox="0 0 38 7.376"
                preserveAspectRatio="none"
                width="100%"
                height="100%"
                style={{ display: "block", overflow: "visible" }}
            >
                <path
                    d="M 0.5 3.189 C 0.224 3.189 0 3.413 0 3.689 C 0 3.965 0.224 4.189 0.5 4.189 Z M 37.854 4.042 C 38.049 3.846 38.049 3.53 37.854 3.335 L 34.672 0.153 C 34.546 0.023 34.361 -0.029 34.186 0.016 C 34.011 0.062 33.874 0.199 33.829 0.373 C 33.783 0.548 33.835 0.734 33.965 0.86 L 36.793 3.689 L 33.965 6.517 C 33.835 6.642 33.783 6.828 33.829 7.003 C 33.874 7.178 34.011 7.314 34.186 7.36 C 34.361 7.406 34.546 7.354 34.672 7.224 Z M 0.5 3.689 L 0.5 4.189 L 37.5 4.189 L 37.5 3.189 L 0.5 3.189 Z"
                    fill={farbe}
                />
            </svg>
        </div>
    )
}

addPropertyControls(Pfeil, {
    farbe: { type: ControlType.Color, title: "Farbe", defaultValue: "rgb(255, 90, 31)" },
})
