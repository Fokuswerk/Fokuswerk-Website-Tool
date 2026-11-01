// Prüft alle Code-Bausteine und veröffentlicht nur, wenn nichts zur Laufzeit kracht.
//
// Aufruf:  npx @framer/agent@latest exec -s <sitzung> < werkzeuge/publizieren.js
//
// Das Projekt läuft live unter fokuswerk.de — jede Veröffentlichung geht direkt auf die Domain.

const BLOCKER = [/Cannot find name/i, /is not defined/i, /Did you mean/i]
const HARMLOS = [
    /'textWrap' does not exist in type 'Properties/,
    /Cannot find module '\.\/.+\.tsx'/,
    /Cannot find module 'https:\/\//,
]

// ---------- 1. Prüfen ----------

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
if (hinweise.length) {
    console.log("Hinweise (blockieren nicht):")
    hinweise.forEach((h) => console.log("  · " + h))
}

if (blocker.length) {
    console.log("")
    console.log("STOPP — nichts veröffentlicht. Diese Fehler lassen den Baustein leer:")
    blocker.forEach((b) => console.log("  ✗ " + b))
    throw new Error("Veröffentlichung abgebrochen: " + blocker.length + " Laufzeitfehler")
}

// ---------- 2. Hat sich seit der letzten Veröffentlichung Baustein-Code geändert? ----------
//
// Framer baut das Baustein-Paket nur bei einer Änderung auf der Leinwand neu. Wer nur Code
// repariert und dann veröffentlicht, bekommt „Änderungen: 0" und lässt die kaputte Fassung live.
// Darum merkt sich das Skript den Stand des Codes und kann die beiden Fälle unterscheiden:
// nichts zu tun — oder Code geändert, aber Leinwand unberührt.

const crypto = require("crypto")
const fs = require("fs")
const os = require("os")
// `process` gibt es in der Agenten-Umgebung nicht, deshalb der Pfad über das Benutzerverzeichnis.
const STANDDATEI = os.homedir() + "/Desktop/Claude/Website Framer Fokuswerk/werkzeuge/.code-stand.json"

// Leerraum wird zusammengefasst, bevor gehasht wird: Framer formatiert Dateien gelegentlich
// selbst um (gleiche Länge, anderer Inhalt). Solche Umbrüche sollen keinen Fehlalarm auslösen.
const standJetzt = {}
for (const f of files) {
    const norm = f.content.replace(/\s+/g, " ").trim()
    standJetzt[f.name] = crypto.createHash("sha1").update(norm).digest("hex").slice(0, 12)
}

let standVorher = null
try {
    standVorher = JSON.parse(fs.readFileSync(STANDDATEI, "utf8"))
} catch (e) {
    standVorher = null
}

const codeGeaendert = standVorher
    ? Object.keys(standJetzt).some((n) => standJetzt[n] !== standVorher[n]) ||
      Object.keys(standVorher).some((n) => !(n in standJetzt))
    : null // beim ersten Lauf unbekannt

// ---------- 3. Veröffentlichen ----------

const vorschau = await framer.agent.publish({ action: "preview" })

if (vorschau.errors && vorschau.errors.length) {
    console.log("STOPP — Framer meldet Fehler:")
    console.log(JSON.stringify(vorschau.errors).slice(0, 800))
    throw new Error("Veröffentlichung abgebrochen")
}

console.log("")
console.log("Änderungen: " + vorschau.changesCount)
;(vorschau.changes || []).forEach((c) => console.log("  · " + c.name + " (" + c.status + ")"))

if (vorschau.changesCount === 0) {
    console.log("")
    if (codeGeaendert === true) {
        console.log("STOPP — der Baustein-Code hat sich geändert, die Leinwand nicht:")
        Object.keys(standJetzt)
            .filter((n) => standJetzt[n] !== (standVorher || {})[n])
            .forEach((n) => console.log("  ! " + n))
        console.log("")
        console.log("Framer baut das Paket so nicht neu — die alte, womöglich kaputte Fassung")
        console.log("bliebe live. Erst eine echte Leinwand-Änderung auslösen (eine Umbenennung")
        console.log("reicht), dann erneut veröffentlichen. Nichts veröffentlicht.")
        throw new Error("Veröffentlichung abgebrochen: Leinwand unberührt")
    }
    if (codeGeaendert === null) {
        console.log("Hinweis: kein gemerkter Code-Stand vorhanden (erster Lauf). Falls gerade ein")
        console.log("Baustein repariert wurde, braucht es eine Leinwand-Änderung, sonst bleibt die")
        console.log("alte Fassung live.")
    } else {
        console.log("Nichts zu veröffentlichen — der Stand ist bereits live.")
    }
    fs.writeFileSync(STANDDATEI, JSON.stringify(standJetzt, null, 1))
    throw new Error("Nichts zu veröffentlichen")
}

const ergebnis = await framer.agent.publish({
    action: "confirm_publish",
    confirmationHash: vorschau.confirmationHash,
})

fs.writeFileSync(STANDDATEI, JSON.stringify(standJetzt, null, 1))

console.log("")
console.log("Status: " + ergebnis.status + " | Fassung: " + (ergebnis.version && ergebnis.version.id))
console.log("Jetzt live gegenprüfen (zweimal abrufen, der erste Abruf ist oft eine kalte Hülle):")
;(vorschau.changes || []).forEach((c) => {
    const pfad = c.name === "Home" ? "/" : c.name
    if (String(pfad).startsWith("/")) console.log("  curl -s --compressed https://fokuswerk.de" + pfad + " | grep -c '<suchwort>'")
})
