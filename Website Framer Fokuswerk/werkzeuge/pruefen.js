// Prüft alle Code-Bausteine des Framer-Projekts, bevor etwas veröffentlicht wird.
//
// Aufruf:  npx @framer/agent@latest exec -s <sitzung> < werkzeuge/pruefen.js
//
// Hintergrund: Ein Code-Baustein, der beim Rendern abstürzt, wird von Framer still
// abgefangen — auf der Seite bleibt der Platz leer, im Build gibt es keine Fehlermeldung.
// Am 28.10.2026 stand deshalb der ganze Arbeiten-Block auf /leistungen/websites leer
// („schmal is not defined"). Die Typprüfung hatte den Fehler die ganze Zeit gemeldet.

const BLOCKER = [
    /Cannot find name/i, // ReferenceError zur Laufzeit — genau der Fall von oben
    /is not defined/i,
    /Did you mean/i,
]

const HARMLOS = [
    /'textWrap' does not exist in type 'Properties/, // CSS, das die React-Typen nicht kennen
    /Cannot find module '\.\/.+\.tsx'/, // Framer löst Baustein-Importe zur Laufzeit auf
    /Cannot find module 'https:\/\//, // URL-Importe (esm.sh)
]

const files = await framer.getCodeFiles()
const blocker = []
const hinweise = []

for (const f of files) {
    let meldungen = []
    try {
        meldungen = await f.typecheck()
    } catch (e) {
        blocker.push(f.name + ": Prüfung fehlgeschlagen — " + e.message)
        continue
    }
    for (const m of meldungen) {
        const text = m.message || String(m)
        if (HARMLOS.some((r) => r.test(text))) continue
        const zeile = m.span && m.span.start ? "Zeile " + m.span.start.line + ": " : ""
        const eintrag = f.name + " → " + zeile + text
        if (BLOCKER.some((r) => r.test(text))) blocker.push(eintrag)
        else hinweise.push(eintrag)
    }
}

console.log("Geprüft: " + files.length + " Code-Bausteine")
console.log("")

if (hinweise.length) {
    console.log("Hinweise (blockieren nicht, laufen im Browser):")
    hinweise.forEach((h) => console.log("  · " + h))
    console.log("")
}

if (blocker.length) {
    console.log("STOPP — diese Fehler krachen zur Laufzeit und lassen den Baustein leer:")
    blocker.forEach((b) => console.log("  ✗ " + b))
    console.log("")
    console.log("Erst beheben, dann veröffentlichen.")
} else {
    console.log("Keine Laufzeitfehler. Veröffentlichen ist frei.")
}
