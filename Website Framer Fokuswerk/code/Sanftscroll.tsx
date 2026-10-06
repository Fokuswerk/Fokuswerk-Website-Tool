import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useEffect } from "react"
import Lenis from "https://esm.sh/lenis@1.1.20?bundle"

// Sanftscroll — weiches Scrollen (Lenis) wie Framers „Smooth Scroll“, aber mit sauberem
// Seitenwechsel: Framers Baustein hielt nach einem Klick auf einen Link die alte Scrollposition
// fest, die neue Seite öffnete dann mitten im Inhalt. Hier springt jede neue Seite nach oben,
// Links mit Anker (#abschnitt) fahren den Abschnitt an, Zurück/Vor behält die Position des Browsers.

interface SanftscrollProps {
    staerke: number
    ankerAbstand: number
}

declare global {
    interface Window {
        __sanftscroll?: any
    }
}

/**
 * Sanftscroll
 *
 * @framerIntrinsicWidth 1
 * @framerIntrinsicHeight 1
 *
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function Sanftscroll(props: SanftscrollProps) {
    const { staerke = 12, ankerAbstand = 96 } = props
    const statisch = useIsStaticRenderer()

    useEffect(() => {
        if (statisch || typeof window === "undefined") return
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
        if (window.__sanftscroll) return

        // Stärke 1–20 → lerp 0.2 (knapp) … 0.05 (sehr weich)
        const s = Math.max(1, Math.min(20, staerke))
        const lenis = new Lenis({ lerp: 0.2 - (s - 1) * (0.15 / 19), smoothWheel: true, wheelMultiplier: 1 })
        window.__sanftscroll = lenis
        let raf = 0
        const lauf = (t: number) => {
            lenis.raf(t)
            raf = requestAnimationFrame(lauf)
        }
        raf = requestAnimationFrame(lauf)

        const timer: number[] = []
        const spaeter = (fn: () => void, ms: number) => timer.push(window.setTimeout(fn, ms))

        const nachOben = () => {
            lenis.resize()
            lenis.scrollTo(0, { immediate: true, force: true })
        }
        const zumAnker = (hash: string) => {
            let el: Element | null = null
            try {
                el = document.getElementById(decodeURIComponent(hash.slice(1)))
            } catch {
                el = null
            }
            if (!el) return false
            lenis.resize()
            lenis.scrollTo(el as HTMLElement, { offset: -ankerAbstand, duration: 1.2, force: true })
            return true
        }

        let letzterPfad = location.pathname
        const beiWechsel = (art: "push" | "pop") => {
            const pfad = location.pathname
            const hash = location.hash
            const neueSeite = pfad !== letzterPfad
            letzterPfad = pfad
            if (art === "pop") {
                // Browser/Framer stellen die alte Position wieder her — nur übernehmen.
                spaeter(() => {
                    lenis.resize()
                    lenis.scrollTo(window.scrollY, { immediate: true, force: true })
                }, 60)
                return
            }
            if (hash && hash.length > 1) {
                if (neueSeite) nachOben()
                // Neue Seite braucht einen Moment, bis der Abschnitt im DOM steht.
                let versuche = 0
                const probieren = () => {
                    if (zumAnker(hash) || ++versuche > 12) return
                    spaeter(probieren, 120)
                }
                spaeter(probieren, neueSeite ? 180 : 0)
                return
            }
            if (neueSeite) {
                nachOben()
                spaeter(nachOben, 60)
                spaeter(nachOben, 250)
            }
        }

        const origPush = history.pushState
        const origReplace = history.replaceState
        history.pushState = function (...args: any[]) {
            const r = origPush.apply(this, args as any)
            beiWechsel("push")
            return r
        }
        history.replaceState = function (...args: any[]) {
            const vorher = location.pathname
            const r = origReplace.apply(this, args as any)
            if (location.pathname !== vorher) beiWechsel("push")
            return r
        }
        const beiPop = () => beiWechsel("pop")
        window.addEventListener("popstate", beiPop)

        // Overlay offen (Menü sperrt das Scrollen per overflow: hidden) → Lenis anhalten,
        // sonst scrollt die Seite hinter dem Menü weiter.
        const gesperrt = () => {
            const h = getComputedStyle(document.documentElement).overflow
            const b = getComputedStyle(document.body).overflow
            // Menü offen: seine Glasfläche hängt dann im Dokument
            const menue = !!document.querySelector('[data-framer-name="Glas"]')
            return h === "hidden" || b === "hidden" || menue
        }
        let angehalten = false
        const sperrePruefen = () => {
            const g = gesperrt()
            if (g && !angehalten) {
                lenis.stop()
                angehalten = true
            } else if (!g && angehalten) {
                lenis.start()
                angehalten = false
            }
        }
        const sperre = typeof MutationObserver !== "undefined" ? new MutationObserver(sperrePruefen) : null
        sperre?.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] })
        sperre?.observe(document.body, { attributes: true, attributeFilter: ["style", "class"], childList: true, subtree: true })

        // Höhe ändert sich laufend (Bilder, Einblendungen) — Lenis nachführen.
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => lenis.resize()) : null
        ro?.observe(document.body)

        return () => {
            cancelAnimationFrame(raf)
            timer.forEach((t) => window.clearTimeout(t))
            history.pushState = origPush
            history.replaceState = origReplace
            window.removeEventListener("popstate", beiPop)
            ro?.disconnect()
            sperre?.disconnect()
            lenis.destroy()
            window.__sanftscroll = undefined
        }
    }, [statisch, staerke, ankerAbstand])

    return <div aria-hidden="true" style={{ width: 1, height: 1, pointerEvents: "none" }} />
}

addPropertyControls(Sanftscroll, {
    staerke: { type: ControlType.Number, title: "Stärke", defaultValue: 12, min: 1, max: 20, step: 1 },
    ankerAbstand: { type: ControlType.Number, title: "Anker-Abstand", defaultValue: 96, min: 0, max: 240, step: 4, unit: "px" },
})
