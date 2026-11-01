// Schreibt den Custom-Code aus den Dateien in code/custom/ in das Framer-Projekt.
//
// Aufruf:  npx @framer/agent@latest exec -s <sitzung> < werkzeuge/custom-code-schreiben.js
//
// bodyEnd wird komplett aus den Dateien zusammengesetzt (Reihenfolge ist Absicht: das
// Einwilligungs-Skript zuerst, der Meta-Pixel danach — so steht die Quelle der Wahrheit oben).
//
// headStart und headEnd enthalten dagegen auch Bausteine, die nicht hier liegen (Favicon,
// Lesbarkeit, Öffnungszeiten, Seitenwechsel). Dort wird deshalb nur der jeweils eigene
// <script>-Block anhand seiner ID ersetzt, der Rest bleibt unangetastet.

const fs = require("fs")
const os = require("os")
const ORDNER = os.homedir() + "/Desktop/Claude/Website Framer Fokuswerk/code/custom/"

const lies = (n) => fs.readFileSync(ORDNER + n, "utf8").trim()

const BODY_END = ["einwilligung-body-end.html", "meta-pixel-body-end.html", "kontakt-spiegel-body-end.html"]
const EINZELN = [
    { datei: "einwilligungsmodus-head-start.html", ort: "headStart", id: "fokuswerk-einwilligungsmodus" },
    { datei: "schleuse-head-ende.html", ort: "headEnd", id: "fokuswerk-schleuse-auf" },
]

const vorher = await framer.getCustomCode()
const stand = {}
for (const ort of ["headStart", "headEnd", "bodyStart", "bodyEnd"]) {
    stand[ort] = (vorher[ort] && vorher[ort].html) || ""
}

// ---------- bodyEnd: ganz ersetzen ----------
const bodyEnd = BODY_END.map(lies).join("\n\n")
const zuSchreiben = {}
if (stand.bodyEnd !== bodyEnd) zuSchreiben.bodyEnd = bodyEnd

// ---------- headStart / headEnd: nur den eigenen Block tauschen ----------
for (const { datei, ort, id } of EINZELN) {
    const block = lies(datei)
    const muster = new RegExp('<script id="' + id + '"[\\s\\S]*?</script>')
    const alt = zuSchreiben[ort] !== undefined ? zuSchreiben[ort] : stand[ort]
    if (!muster.test(alt)) {
        console.log("ACHTUNG: Block " + id + " in " + ort + " nicht gefunden — nichts geändert.")
        continue
    }
    const ersetzt = alt.replace(muster, () => block)
    if (ersetzt !== alt) zuSchreiben[ort] = ersetzt
}

if (Object.keys(zuSchreiben).length === 0) {
    console.log("Unverändert — nichts geschrieben.")
} else {
    for (const [ort, html] of Object.entries(zuSchreiben)) {
        await framer.setCustomCode({ html, location: ort })
        console.log(ort + ": " + stand[ort].length + " -> " + html.length + " Zeichen")
    }
    const nachher = await framer.getCustomCode()
    for (const ort of Object.keys(zuSchreiben)) {
        const neu = (nachher[ort] && nachher[ort].html) || ""
        console.log(ort + " stimmt überein: " + (neu === zuSchreiben[ort]))
    }
    const be = (nachher.bodyEnd && nachher.bodyEnd.html) || ""
    console.log("Einwilligungs-Skript: " + ((be.match(/id="fokuswerk-einwilligung-skript"/g) || []).length) + "x (muss 1 sein)")
    console.log("Meta-Pixel: " + ((be.match(/id="fokuswerk-meta-pixel"/g) || []).length) + "x (muss 1 sein)")
    console.log("Kontakt-Spiegel: " + ((be.match(/id="fokuswerk-kontakt-spiegel"/g) || []).length) + "x (muss 1 sein)")
    const hs = (nachher.headStart && nachher.headStart.html) || ""
    console.log("fwSofortMessen im headStart: " + ((hs.match(/fwSofortMessen/g) || []).length) + "x")
}
