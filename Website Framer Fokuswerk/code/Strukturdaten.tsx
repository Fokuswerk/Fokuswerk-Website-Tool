import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import type { CSSProperties } from "react"

// Strukturdaten — schreibt JSON-LD (schema.org) unsichtbar in die Seite.
// Google und KI-Assistenten lesen daraus Organisation, Adresse, Leistungen und Fragen.
// Auf der Arbeitsfläche erscheint nur ein kleines Etikett.

interface StrukturdatenProps {
    json: string
    style?: CSSProperties
}

/**
 * Strukturdaten
 *
 * @framerIntrinsicWidth 120
 * @framerIntrinsicHeight 24
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function Strukturdaten(props: StrukturdatenProps) {
    const { json = "{}", style } = props
    const statisch = useIsStaticRenderer()
    let sauber = "{}"
    try {
        sauber = JSON.stringify(JSON.parse(json)).replace(/</g, "\\u003c")
    } catch {
        sauber = "{}"
    }
    return (
        <div aria-hidden="true" style={{ ...style, position: "absolute", width: 1, height: 1, overflow: "hidden", pointerEvents: "none", opacity: statisch ? 1 : 0 }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sauber }} />
        </div>
    )
}

addPropertyControls(Strukturdaten, {
    json: { type: ControlType.String, title: "JSON-LD", displayTextArea: true, defaultValue: "{}" },
})
