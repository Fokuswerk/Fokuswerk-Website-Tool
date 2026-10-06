import type { ComponentType } from "react"
import { useEffect, useState } from "react"

// Schaltet die Navigation zwischen "Oben" (ohne Balken, helle Schrift über einem dunklen
// Auftakt) und "Leiste" (heller Balken). Oben gilt nur, solange die Seite einen Abschnitt
// mit der Anker-ID "auftakt-dunkel" hat (nur der Foto-Auftakt der Startseite; die hellen Unterseiten heißen "auftakt") und kaum gescrollt ist. Alle anderen Seiten zeigen sofort
// die Leiste.
// Geprüft wird bei jedem Scrollen, bei jedem Seitenwechsel (die Navigation liegt im Layout und
// bleibt stehen, während die Seite darunter wechselt) und sobald sich der Seiteninhalt ändert —
// sonst blieb nach einem Wechsel der Zustand der vorigen Seite hängen.

const SCHWELLE = 40

export function withScrollZustand(Component: ComponentType<any>): ComponentType<any> {
    return (props: any) => {
        // Startwert wie im vorgerenderten HTML; direkt nach dem Laden wird korrigiert
        const [oben, setOben] = useState(true)

        useEffect(() => {
            if (typeof window === "undefined") return
            // direkt prüfen (billig: eine ID-Abfrage; gleicher Zustand löst kein Neuzeichnen aus)
            const anstossen = () => {
                const auftakt = document.getElementById("auftakt-dunkel")
                setOben(!!auftakt && window.scrollY < SCHWELLE)
            }
            const pruefen = anstossen
            pruefen()
            window.addEventListener("scroll", anstossen, { passive: true })
            window.addEventListener("resize", anstossen)
            window.addEventListener("popstate", anstossen)
            // Seitenwechsel: neuer Inhalt wird eingehängt
            const mo = typeof MutationObserver !== "undefined" ? new MutationObserver(anstossen) : null
            mo?.observe(document.body, { childList: true, subtree: true })
            const timer = [80, 300, 900].map((ms) => window.setTimeout(anstossen, ms))
            return () => {
                window.removeEventListener("scroll", anstossen)
                window.removeEventListener("resize", anstossen)
                window.removeEventListener("popstate", anstossen)
                mo?.disconnect()
                timer.forEach((t) => window.clearTimeout(t))
            }
        }, [])

        return <Component {...props} variant={oben ? "Oben" : "Leiste"} />
    }
}
