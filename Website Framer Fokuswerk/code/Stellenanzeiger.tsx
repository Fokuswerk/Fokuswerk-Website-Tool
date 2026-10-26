import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useEffect, useRef, useState, type CSSProperties } from "react"

// Stellenanzeiger — das Werkzeug auf /stellenanzeige.
//
// Zweck ist nicht das Werkzeug, sondern der Lead: Am Ende stehen Name, E-Mail und Telefon eines
// Betriebs, der gerade jemanden sucht. Deshalb eine Schrittfolge statt eines einzelnen Formulars.
//
// Warum die Fragen vor der Abfrage stehen (Entscheidung Thees, 26.10.2026): Wer vier Fragen
// beantwortet hat, hat Arbeit investiert und gibt seine Daten eher heraus, damit die Mühe nicht
// umsonst war. Die Fragen sind deshalb bewusst mit einem Klick zu beantworten — kein Tippen.
//
// Die Fragen arbeiten doppelt:
//   fachlich  — Dringlichkeit, Zahl der Stellen und die Stärken der Stelle gehen in die Anzeige ein
//   vertriebl. — dieselben Antworten qualifizieren den Lead (Dringlichkeit ≈ Kaufbereitschaft,
//                Zahl der Stellen ≈ Budget, bisherige Erfahrung ≈ Gesprächseinstieg)
//
// Aufbau: Schritt 0 Beruf · Schritte 1–4 je eine Frage · Schritt 5 Website · Schritt 6
// Kontaktdaten · danach Lauf und Ergebnis. Zurück ist aus jedem Schritt möglich.
//
// Warum der Beruf vorn steht und die Website hinten (27.10.2026): Tippen ist die teuerste
// Eingabe, die man verlangen kann, und zwei leere Felder als Eröffnung sind die Stelle, an
// der die meisten abspringen. Jetzt beginnt der Trichter mit einer Frage, die ein Fingertipp
// beantwortet — die acht häufigsten Berufe stehen als Vorschläge da. Die Website wird erst
// gefragt, wenn längst klar ist, wofür sie gebraucht wird, und die Frage sagt es dazu.
//
// Anfangszustand ist Schritt 0 — kein `useEffect`, das erst nach dem Hochfahren etwas einblendet.
// Bei Auftaktleiste.tsx und Arbeitsschau.tsx stand im ausgelieferten HTML sonst nichts.
//
// Vertrag des Endpunkts (existiert noch nicht, erweitert um die Antworten):
//   POST https://fokuswerk-werkzeuge.vercel.app/api/stellenanzeige
//   { domain, beruf,
//     dringlichkeit: "sofort"|"wochen"|"planung",
//     stellen: "eine"|"zwei_drei"|"mehr",
//     erfahrung: "laeuft"|"probiert"|"nie",
//     staerken: string[],
//     kontakt: { name, email, telefon } }
//   200 → { betrieb, anzeigen:[{titel,text}×3], fragen:[×4], budget }
//   422 → { fehler: "seite_nicht_lesbar" | "beruf_unklar" }
// Solange er fehlt, liefert die Komponente BEISPIEL-Daten und sagt das sichtbar an.

const SCHRIFT = "Inter, 'Inter Placeholder', system-ui, sans-serif"
const TINTE = "rgb(14, 15, 18)"
const PAPIER = "rgb(245, 243, 239)"
const LEISE = "rgba(14, 15, 18, 0.56)"
const LINIE = "rgba(14, 15, 18, 0.14)"
// Markenorange erreicht als Kleintext den Kontrast nicht (2,81 : 1 auf Papier). Für Schrift
// unter 24 px gilt der abgedunkelte Ton: 4,98 : 1 auf Papier, 5,52 : 1 auf Weiß.
const AKZENT_TEXT = "#B84116"
const SIGNAL = "rgb(255, 90, 31)"

interface Wahl {
    wert: string
    text: string
}
interface Frage {
    schluessel: "dringlichkeit" | "stellen" | "erfahrung" | "staerken"
    titel: string
    hinweis?: string
    mehrfach?: boolean
    optionen: Wahl[]
}

const FRAGEN: Frage[] = [
    {
        schluessel: "dringlichkeit",
        titel: "Wie schnell muss die Stelle besetzt sein?",
        optionen: [
            { wert: "sofort", text: "So schnell wie möglich" },
            { wert: "wochen", text: "In den nächsten Wochen" },
            { wert: "planung", text: "Wir planen vor" },
        ],
    },
    {
        schluessel: "stellen",
        titel: "Wie viele Stellen sind offen?",
        optionen: [
            { wert: "eine", text: "Eine" },
            { wert: "zwei_drei", text: "Zwei bis drei" },
            { wert: "mehr", text: "Mehr als drei" },
        ],
    },
    {
        schluessel: "erfahrung",
        titel: "Haben Sie schon einmal Anzeigen bei Facebook oder Instagram geschaltet?",
        optionen: [
            { wert: "laeuft", text: "Ja, läuft gerade" },
            { wert: "probiert", text: "Schon probiert, hat wenig gebracht" },
            { wert: "nie", text: "Noch nie" },
        ],
    },
    {
        schluessel: "staerken",
        titel: "Was spricht bei Ihnen für die Stelle?",
        hinweis: "Mehreres möglich. Das geht in die Anzeigentexte ein.",
        mehrfach: true,
        optionen: [
            { wert: "bezahlung", text: "Bezahlung über dem Üblichen" },
            { wert: "feierabend", text: "Geregelter Feierabend" },
            { wert: "team", text: "Kleines, eingespieltes Team" },
            { wert: "technik", text: "Moderne Ausrüstung" },
            { wert: "aufstieg", text: "Weiterbildung und Aufstieg" },
            { wert: "sicherheit", text: "Sicherer Arbeitsplatz" },
        ],
    },
]

// Die Reihenfolge der Schritte an einer Stelle, damit Rücksprünge aus Fehlern nicht raten.
const SCHRITT_BERUF = 0
const SCHRITT_WEBSITE = FRAGEN.length + 1
const SCHRITT_KONTAKT = FRAGEN.length + 2
const SCHRITTE_GESAMT = FRAGEN.length + 3

// Vorschläge für den ersten Schritt. Kein Pflichtraster — wer etwas anderes sucht, tippt es
// ein. Sie stehen da, damit der Einstieg ein Tipp ist und keine leere Zeile.
const BERUF_VORSCHLAEGE = [
    "Kfz-Mechatroniker",
    "Anlagenmechaniker SHK",
    "Elektroniker",
    "Dachdecker",
    "Maler und Lackierer",
    "Tischler",
]

interface Anzeige {
    titel: string
    text: string
}
interface Ergebnis {
    betrieb: string
    anzeigen: Anzeige[]
    fragen: string[]
    budget: string
}

// BEISPIEL — wird ausgeliefert, solange der Endpunkt fehlt. Das Ergebnis weist sichtbar darauf hin.
const BEISPIEL: Ergebnis = {
    betrieb: "Beispielbetrieb",
    anzeigen: [
        {
            titel: "Die ehrliche",
            text: "Wir suchen jemanden, der bei uns anpackt. Kein Großbetrieb, keine Hierarchie über drei Ecken: Sie wissen morgens, mit wem Sie rausfahren, und abends, was Sie geschafft haben. Wenn Sie das Handwerk können und zuverlässig sind, reden wir über den Rest.",
        },
        {
            titel: "Die konkrete",
            text: "Feierabend ist Feierabend. Keine Wochenenden, keine Montage über Nacht. Wir zahlen nach Tarif, die Ausrüstung ist neu, und wer sich weiterbilden will, bekommt die Zeit dafür bezahlt. Melden Sie sich, auch wenn Sie noch in einem anderen Betrieb sind.",
        },
        {
            titel: "Die direkte",
            text: "Zwei Minuten für Ihre Bewerbung, mehr brauchen wir nicht. Kein Anschreiben, kein Lebenslauf im ersten Schritt. Sie schreiben uns, was Sie können und ab wann Sie Zeit haben — alles Weitere klären wir im Gespräch.",
        },
    ],
    fragen: [
        "Wie lange arbeiten Sie schon in dem Beruf?",
        "Haben Sie einen Führerschein der Klasse B?",
        "Ab wann könnten Sie anfangen?",
        "Wie erreichen wir Sie am besten?",
    ],
    budget: "Für eine Stelle dieser Art reichen in der Regel 15 bis 25 € am Tag über zwei bis drei Wochen. Das ergibt im Umkreis von 30 km genug Reichweite, um eine Stelle zu besetzen.",
}

// Jeder Fehler, den der Endpunkt kennt, bekommt einen eigenen Text — der Nutzer soll wissen,
// ob er etwas ändern kann oder ob es an uns lag. `zurueck` sagt, in welchen Schritt der Knopf
// zurückführt: bei Eingabefehlern an den Anfang, sonst auf den Kontaktschritt.
const FEHLERTEXTE: Record<string, { titel: string; hinweis: string; zurueck: number }> = {
    domain_fehlt: {
        titel: "Die Adresse Ihrer Website fehlt",
        hinweis: "Tragen Sie die Adresse ein, unter der Ihr Betrieb erreichbar ist.",
        zurueck: SCHRITT_WEBSITE,
    },
    beruf_fehlt: {
        titel: "Der gesuchte Beruf fehlt",
        hinweis: "Tragen Sie ein, wen Sie suchen — möglichst mit der üblichen Berufsbezeichnung.",
        zurueck: SCHRITT_BERUF,
    },
    seite_nicht_lesbar: {
        titel: "Wir konnten diese Seite nicht abrufen",
        hinweis:
            "Stimmt die Adresse? Möglich ist auch, dass die Seite gerade nicht erreichbar ist oder hinter einem Schutz steht. Prüfen Sie die Schreibweise und versuchen Sie es noch einmal.",
        zurueck: SCHRITT_WEBSITE,
    },
    beruf_unklar: {
        titel: "Dieser Beruf passt nicht zu dem Betrieb auf dieser Seite",
        hinweis: `Prüfen Sie, ob Adresse und Beruf zusammengehören. Hilfreich ist die Bezeichnung, die in Ihrem Betrieb üblich ist — also „Kfz-Mechatroniker" statt „Mitarbeiter".`,
        zurueck: SCHRITT_BERUF,
    },
    zu_viele_abrufe: {
        titel: "Bitte in ein paar Minuten noch einmal",
        hinweis:
            "Von dieser Verbindung kamen gerade viele Anfragen. Das ist eine Bremse gegen Dauerfeuer, keine Sperre für Sie.",
        zurueck: -1,
    },
    modell: {
        titel: "Da ist bei uns etwas schiefgegangen",
        hinweis:
            "Bitte noch einmal versuchen. Bleibt es dabei, schreiben Sie uns kurz — dann schicken wir Ihnen die Anzeigen von Hand.",
        zurueck: -1,
    },
    netz: {
        titel: "Die Verbindung kam nicht zustande",
        hinweis:
            "Das lag an uns, nicht an Ihnen. Versuchen Sie es in einem Moment noch einmal.",
        zurueck: -1,
    },
}

// Der Endpunkt meldet mehrere Modellfehler (modell_nicht_erreichbar, modell_antwortet_nicht …).
// Für den Nutzer sind die alle dasselbe, deshalb auf einen Text zusammengefasst.
function fehlerText(code: string) {
    if (code && code.indexOf("modell") === 0) return FEHLERTEXTE.modell
    return FEHLERTEXTE[code] || FEHLERTEXTE.netz
}

// Die Antwort braucht rund 30 Sekunden — so lange dauert es, die Website zu lesen und die Texte
// zu schreiben. Statt eines Kreisels benennt die Seite, was gerade passiert.
const LAUFTEXTE = [
    { ab: 0, text: "Wir rufen Ihre Website ab." },
    { ab: 7, text: "Wir lesen, was Ihr Betrieb anbietet." },
    { ab: 16, text: "Wir schreiben die Anzeigen. Gleich fertig." },
    { ab: 32, text: "Dauert heute etwas länger. Bitte bleiben Sie noch einen Moment." },
]

interface StellenanzeigerProps {
    endpunkt: string
    beispielZeigen: boolean
    angebotLink: string
    style?: CSSProperties
}

export default function Stellenanzeiger(props: StellenanzeigerProps) {
    const {
        endpunkt = "https://fokuswerk-werkzeuge.vercel.app/api/stellenanzeige",
        beispielZeigen = false,
        angebotLink = "/kontakt",
        style,
    } = props

    const statisch = useIsStaticRenderer()

    const [schritt, setSchritt] = useState(0) // 0 = Start, 1..4 = Fragen, 5 = Kontakt
    const [lage, setLage] = useState<"formular" | "laeuft" | "fertig" | "fehler">("formular")
    const [domain, setDomain] = useState("")
    const [beruf, setBeruf] = useState("")
    const [antworten, setAntworten] = useState<Record<string, any>>({})
    const [name, setName] = useState("")
    const [mail, setMail] = useState("")
    const [telefon, setTelefon] = useState("")
    const [einwilligung, setEinwilligung] = useState(false)
    // Zweites, getrenntes Haekchen. Es ist freiwillig und blockiert das Absenden
    // nicht: Die Einwilligung oben gilt der Antwort auf diese Anfrage, diese hier
    // laufender Werbung. Zwei Zwecke, zwei Haekchen — ein gemeinsames waere keine
    // wirksame Einwilligung (Kopplungsverbot).
    const [newsletter, setNewsletter] = useState(false)
    const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null)
    const [fehler, setFehler] = useState("netz")
    const [beispiel, setBeispiel] = useState(false)
    const [kopiert, setKopiert] = useState<number | null>(null)
    const [sekunden, setSekunden] = useState(0)

    // Nach jedem Schritt an den Anfang des Trichters springen.
    //
    // Ohne das bleibt das Handy dort stehen, wo der Finger getippt hat: Die neue Frage steht
    // dann über dem sichtbaren Bereich, und der Trichter wirkt, als sei nichts passiert. Am
    // Schreibtisch fällt das nicht auf, auf dem Handy ist es der Abbruchgrund.
    const rahmen = useRef<HTMLDivElement | null>(null)
    const ersterLauf = useRef(true)
    useEffect(() => {
        if (ersterLauf.current) {
            ersterLauf.current = false
            return
        }
        const k = rahmen.current
        if (!k) return
        const oben = k.getBoundingClientRect().top + window.scrollY - 24
        window.scrollTo({ top: oben, behavior: "smooth" })
    }, [schritt, lage])

    function waehlen(f: Frage, wert: string) {
        if (f.mehrfach) {
            const bisher: string[] = antworten[f.schluessel] || []
            const neu = bisher.includes(wert) ? bisher.filter((x) => x !== wert) : [...bisher, wert]
            setAntworten({ ...antworten, [f.schluessel]: neu })
            return
        }
        setAntworten({ ...antworten, [f.schluessel]: wert })
        setSchritt((s) => s + 1) // Einfachauswahl führt direkt weiter
    }

    async function absenden() {
        setLage("laeuft")
        setBeispiel(false)
        setSekunden(0)
        // Zähler für die Lauftexte. Kein Zeitlimit: Der Endpunkt darf bis zu 60 Sekunden
        // brauchen, und ein eigener Abbruch würde eine fertige Antwort wegwerfen.
        const ticker = setInterval(() => setSekunden((s) => s + 1), 1000)
        try {
            const antwort = await fetch(endpunkt, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    domain: domain.trim(),
                    beruf: beruf.trim(),
                    ...antworten,
                    kontakt: { name: name.trim(), email: mail.trim(), telefon: telefon.trim() },
                    newsletter,
                }),
            })
            // Jede Antwort des Endpunkts ist JSON mit einem Feld `fehler` — auch 429 und 502.
            // Nur wenn gar keine Antwort kommt, greift unten der Netzfall.
            if (!antwort.ok) {
                const d = await antwort.json().catch(() => ({}))
                setFehler(d && d.fehler ? d.fehler : "netz")
                setLage("fehler")
                return
            }
            setErgebnis(await antwort.json())
            setLage("fertig")
        } catch {
            // Hier landet nur, wer den Endpunkt gar nicht erreicht: keine Verbindung, oder der
            // Türsteher (ORIGINS) lässt den Browser wortlos abblitzen.
            if (beispielZeigen) {
                setErgebnis({ ...BEISPIEL, betrieb: domain.trim() || BEISPIEL.betrieb })
                setBeispiel(true)
                setLage("fertig")
            } else {
                setFehler("netz")
                setLage("fehler")
            }
        } finally {
            clearInterval(ticker)
        }
    }

    function kopieren(i: number, text: string) {
        try {
            navigator.clipboard.writeText(text)
            setKopiert(i)
            setTimeout(() => setKopiert(null), 2000)
        } catch {
            setKopiert(null)
        }
    }

    // ---------- Stile ----------
    const feldStil: CSSProperties = {
        width: "100%",
        boxSizing: "border-box",
        font: `400 17px/1.4 ${SCHRIFT}`,
        color: TINTE,
        background: "rgb(255,255,255)",
        border: `1px solid ${LINIE}`,
        borderRadius: 12,
        padding: "15px 16px",
        minHeight: 52,
        outline: "none",
        appearance: "none",
    }
    const etikett: CSSProperties = {
        font: `500 11px/1 ${SCHRIFT}`,
        letterSpacing: "0.16em",
        color: LEISE,
        textTransform: "uppercase",
        marginBottom: 8,
        display: "block",
    }
    const hauptKnopf = (aus: boolean): CSSProperties => ({
        font: `500 17px/1 ${SCHRIFT}`,
        color: PAPIER,
        background: TINTE,
        border: "none",
        borderRadius: 999,
        padding: "18px 28px",
        minHeight: 56,
        cursor: aus ? "default" : "pointer",
        opacity: aus ? 0.45 : 1,
        alignSelf: "start",
    })
    const hakenZeile: CSSProperties = {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        font: `400 14px/1.5 ${SCHRIFT}`,
        color: LEISE,
        cursor: "pointer",
        minHeight: 44,
        padding: "4px 0",
    }
    const hakenKasten: CSSProperties = {
        width: 20,
        height: 20,
        marginTop: 2,
        flex: "0 0 auto",
        accentColor: SIGNAL,
    }
    const wahlKnopf = (gewaehlt: boolean): CSSProperties => ({
        font: `400 17px/1.35 ${SCHRIFT}`,
        textAlign: "left",
        color: TINTE,
        background: gewaehlt ? "rgba(255,90,31,0.10)" : "rgb(255,255,255)",
        border: `1.5px solid ${gewaehlt ? SIGNAL : LINIE}`,
        borderRadius: 12,
        padding: "16px 18px",
        minHeight: 56,
        cursor: "pointer",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 14,
    })
    // Ein Rand allein reicht nicht, um „ausgewählt" zu zeigen — bei Mehrfachauswahl schon gar
    // nicht. Rund heißt: eine Antwort. Eckig heißt: mehrere möglich. Das kennt jeder.
    const wahlMarke = (gewaehlt: boolean, mehrfach: boolean): CSSProperties => ({
        width: 22,
        height: 22,
        flex: "0 0 auto",
        borderRadius: mehrfach ? 6 : 999,
        border: `1.5px solid ${gewaehlt ? SIGNAL : LINIE}`,
        background: gewaehlt ? SIGNAL : "transparent",
        color: "rgb(255,255,255)",
        font: `600 13px/1 ${SCHRIFT}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    })
    const vorschlag: CSSProperties = {
        font: `400 14px/1 ${SCHRIFT}`,
        color: TINTE,
        background: "rgb(255,255,255)",
        border: `1px solid ${LINIE}`,
        borderRadius: 999,
        padding: "0 14px",
        minHeight: 44,
        cursor: "pointer",
    }

    const frage = schritt >= 1 && schritt <= FRAGEN.length ? FRAGEN[schritt - 1] : null
    const kontaktSchritt = schritt === SCHRITT_KONTAKT
    const kontaktVollstaendig = !!name.trim() && !!mail.trim() && !!telefon.trim() && einwilligung

    // ---------- Fortschritt ----------
    function Fortschritt() {
        // Der Balken steht beim ersten Schritt schon auf einem Siebtel, nicht auf null: Ein
        // angefangener Weg wird eher zu Ende gegangen als ein leerer.
        const anteil = Math.min(1, (schritt + 1) / SCHRITTE_GESAMT)
        return (
            <div style={{ marginBottom: 24, maxWidth: 560 }}>
                <div style={{ height: 2, background: LINIE, borderRadius: 2, overflow: "hidden" }}>
                    <div
                        style={{
                            height: "100%",
                            width: `${anteil * 100}%`,
                            background: SIGNAL,
                            transition: "width .35s cubic-bezier(.16,1,.3,1)",
                        }}
                    />
                </div>
                <p style={{ margin: "8px 0 0", font: `500 12px/1 ${SCHRIFT}`, color: LEISE, letterSpacing: "0.08em" }}>
                    Schritt {schritt + 1} von {SCHRITTE_GESAMT}
                </p>
            </div>
        )
    }

    function Zurueck() {
        if (schritt === 0 || lage !== "formular") return null
        return (
            <button
                type="button"
                onClick={() => setSchritt((s) => Math.max(0, s - 1))}
                style={{
                    font: `400 15px/1 ${SCHRIFT}`,
                    color: LEISE,
                    background: "transparent",
                    border: "none",
                    padding: "12px 0",
                    minHeight: 44,
                    cursor: "pointer",
                    alignSelf: "start",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                }}
            >
                Zurück
            </button>
        )
    }

    return (
        <div ref={rahmen} style={{ ...style, font: `400 17px/1.6 ${SCHRIFT}`, color: TINTE, width: "100%" }}>
            {lage === "formular" && (
                <div style={{ maxWidth: 560 }}>
                    <Fortschritt />

                    {/* Schritt 0 — wen suchen Sie */}
                    {schritt === SCHRITT_BERUF && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <p style={{ margin: 0, font: `500 22px/1.3 ${SCHRIFT}` }}>
                                Wen suchen Sie?
                            </p>
                            <p style={{ margin: "-6px 0 0", font: `400 15px/1.5 ${SCHRIFT}`, color: LEISE }}>
                                Die Bezeichnung, die in Ihrem Betrieb üblich ist.
                            </p>
                            <input
                                id="fw-beruf"
                                name="beruf"
                                type="text"
                                autoComplete="off"
                                placeholder="z. B. Kfz-Mechatroniker"
                                value={beruf}
                                onChange={(e) => setBeruf(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && beruf.trim()) setSchritt(1)
                                }}
                                style={feldStil}
                            />
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {BERUF_VORSCHLAEGE.map((b) => (
                                    <button
                                        key={b}
                                        type="button"
                                        onClick={() => {
                                            setBeruf(b)
                                            setSchritt(1)
                                        }}
                                        style={vorschlag}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                disabled={!beruf.trim()}
                                onClick={() => setSchritt(1)}
                                style={hauptKnopf(!beruf.trim())}
                            >
                                Weiter
                            </button>
                        </div>
                    )}

                    {/* Schritte 1–4 — je eine Frage */}
                    {frage && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <p style={{ margin: 0, font: `500 22px/1.3 ${SCHRIFT}` }}>{frage.titel}</p>
                            {frage.hinweis && (
                                <p style={{ margin: "-6px 0 0", font: `400 15px/1.5 ${SCHRIFT}`, color: LEISE }}>
                                    {frage.hinweis}
                                </p>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {frage.optionen.map((o) => {
                                    const wert = antworten[frage.schluessel]
                                    const gewaehlt = frage.mehrfach
                                        ? (wert || []).includes(o.wert)
                                        : wert === o.wert
                                    return (
                                        <button
                                            key={o.wert}
                                            type="button"
                                            onClick={() => waehlen(frage, o.wert)}
                                            style={wahlKnopf(gewaehlt)}
                                        >
                                            <span style={wahlMarke(gewaehlt, !!frage.mehrfach)}>
                                                {gewaehlt ? "✓" : ""}
                                            </span>
                                            <span>{o.text}</span>
                                        </button>
                                    )
                                })}
                            </div>
                            {frage.mehrfach && (
                                // Sechs Antworten sind auf dem Handy länger als der Bildschirm.
                                // Stünde „Weiter" einfach darunter, müsste man nach jedem Tipp
                                // erst scrollen, um weiterzukommen — also klebt der Knopf am
                                // unteren Rand, sobald etwas gewählt ist.
                                <div
                                    style={{
                                        position: "sticky",
                                        bottom: 12,
                                        zIndex: 2,
                                        paddingTop: 10,
                                        background: `linear-gradient(to top, ${PAPIER} 60%, rgba(245,243,239,0))`,
                                    }}
                                >
                                    <button
                                        type="button"
                                        disabled={!(antworten[frage.schluessel] || []).length}
                                        onClick={() => setSchritt((s) => s + 1)}
                                        style={{
                                            ...hauptKnopf(!(antworten[frage.schluessel] || []).length),
                                            alignSelf: "stretch",
                                            width: "100%",
                                        }}
                                    >
                                        Weiter
                                    </button>
                                </div>
                            )}
                            <Zurueck />
                        </div>
                    )}

                    {/* Vorletzter Schritt — die Website */}
                    {schritt === SCHRITT_WEBSITE && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <p style={{ margin: 0, font: `500 22px/1.3 ${SCHRIFT}` }}>
                                Wie lautet die Adresse Ihrer Website?
                            </p>
                            <p style={{ margin: "-6px 0 0", font: `400 15px/1.5 ${SCHRIFT}`, color: LEISE }}>
                                Wir lesen daraus, was Ihren Betrieb ausmacht — Leistungen, Orte, Ton.
                                Genau das steht dann in den Anzeigen, statt allgemeiner Floskeln.
                            </p>
                            <input
                                id="fw-domain"
                                name="domain"
                                type="text"
                                inputMode="url"
                                autoComplete="url"
                                placeholder="ihr-betrieb.de"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && domain.trim()) setSchritt(SCHRITT_KONTAKT)
                                }}
                                style={feldStil}
                            />
                            <button
                                type="button"
                                disabled={!domain.trim()}
                                onClick={() => setSchritt(SCHRITT_KONTAKT)}
                                style={hauptKnopf(!domain.trim())}
                            >
                                Weiter
                            </button>
                            <Zurueck />
                        </div>
                    )}

                    {/* Letzter Schritt — Kontaktdaten */}
                    {kontaktSchritt && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <p style={{ margin: 0, font: `500 22px/1.3 ${SCHRIFT}` }}>
                                Fast geschafft — wohin dürfen wir die Anzeigen schicken?
                            </p>
                            <p style={{ margin: "-6px 0 4px", font: `400 15px/1.55 ${SCHRIFT}`, color: LEISE }}>
                                Sie sehen das Ergebnis gleich hier auf der Seite. Die Angaben brauchen wir,
                                um es Ihnen zusätzlich zuzuschicken und bei Rückfragen erreichbar zu sein.
                            </p>
                            <div>
                                <label htmlFor="fw-name" style={etikett}>
                                    Name
                                </label>
                                <input
                                    id="fw-name"
                                    name="Name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Vor- und Nachname"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={feldStil}
                                />
                            </div>
                            <div>
                                <label htmlFor="fw-mail" style={etikett}>
                                    E-Mail
                                </label>
                                <input
                                    id="fw-mail"
                                    name="E-Mail"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@betrieb.de"
                                    value={mail}
                                    onChange={(e) => setMail(e.target.value)}
                                    style={feldStil}
                                />
                            </div>
                            <div>
                                <label htmlFor="fw-tel" style={etikett}>
                                    Telefon
                                </label>
                                <input
                                    id="fw-tel"
                                    name="Telefon"
                                    type="tel"
                                    autoComplete="tel"
                                    placeholder="Für Rückfragen zur Anzeige"
                                    value={telefon}
                                    onChange={(e) => setTelefon(e.target.value)}
                                    style={feldStil}
                                />
                            </div>
                            <label style={hakenZeile}>
                                <input
                                    type="checkbox"
                                    checked={einwilligung}
                                    onChange={(e) => setEinwilligung(e.target.checked)}
                                    style={hakenKasten}
                                />
                                <span>
                                    Fokuswerk darf mir die Anzeigen schicken und sich zu dieser Anfrage
                                    melden. Jederzeit widerrufbar, die Angaben gehen an niemanden sonst.{" "}
                                    <a href="/datenschutz" style={{ color: TINTE }}>
                                        Datenschutzerklärung
                                    </a>
                                </span>
                            </label>
                            {/*
                                Zweites Häkchen, getrennt und freiwillig. Zwei Zwecke brauchen zwei
                                Einwilligungen: Die obere gilt der Antwort auf diese Anfrage, diese hier
                                laufender Werbung. Zusammengelegt wäre keine von beiden wirksam, und
                                vorangekreuzt erst recht nicht.
                            */}
                            <label style={{ ...hakenZeile, marginTop: -8 }}>
                                <input
                                    type="checkbox"
                                    checked={newsletter}
                                    onChange={(e) => setNewsletter(e.target.checked)}
                                    style={hakenKasten}
                                />
                                <span>
                                    Schickt mir außerdem, was bei anderen Betrieben funktioniert hat — ein
                                    paar Mal im Jahr, jederzeit abbestellbar.{" "}
                                    <span style={{ opacity: 0.7 }}>Freiwillig.</span>
                                </span>
                            </label>
                            <button
                                type="button"
                                disabled={!kontaktVollstaendig}
                                onClick={absenden}
                                style={hauptKnopf(!kontaktVollstaendig)}
                            >
                                Anzeigen erstellen
                            </button>
                            <p style={{ margin: "-4px 0 0", font: `400 13px/1.5 ${SCHRIFT}`, color: LEISE }}>
                                Kostenlos, kein Abo. Ihre Angaben gehen an niemanden sonst.
                            </p>
                            <Zurueck />
                        </div>
                    )}
                </div>
            )}

            {/* Zwischenzustand — benennt den Schritt, dreht sich nicht */}
            {lage === "laeuft" && !statisch && (
                <div style={{ maxWidth: 560 }} aria-live="polite">
                    <div style={{ height: 1, background: LINIE, overflow: "hidden" }}>
                        <div
                            style={{
                                height: "100%",
                                background: SIGNAL,
                                transformOrigin: "0 50%",
                                animation: "fwStellenLauf 2.4s cubic-bezier(.3,.1,.3,1) infinite",
                            }}
                        />
                    </div>
                    <p style={{ margin: "14px 0 0", color: LEISE, font: `400 15px/1.5 ${SCHRIFT}` }}>
                        {LAUFTEXTE.filter((l) => sekunden >= l.ab).slice(-1)[0].text}
                    </p>
                    <p style={{ margin: "6px 0 0", color: LEISE, font: `400 13px/1.5 ${SCHRIFT}` }}>
                        Das dauert etwa eine halbe Minute. Bitte schließen Sie die Seite nicht.
                    </p>
                    <style>{`@keyframes fwStellenLauf{0%{transform:scaleX(0)}60%{transform:scaleX(.92)}100%{transform:scaleX(1)}}`}</style>
                </div>
            )}

            {/* Fehlerfälle */}
            {lage === "fehler" && (
                <div role="alert" style={{ maxWidth: 560, borderTop: `2px solid ${AKZENT_TEXT}`, paddingTop: 18 }}>
                    <p style={{ margin: 0, font: `500 19px/1.35 ${SCHRIFT}`, color: TINTE }}>
                        {fehlerText(fehler).titel}
                    </p>
                    <p style={{ margin: "8px 0 16px", color: LEISE, font: `400 16px/1.55 ${SCHRIFT}` }}>
                        {fehlerText(fehler).hinweis}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            const z = fehlerText(fehler).zurueck
                            setLage("formular")
                            // −1 heißt: nichts an der Eingabe ändern, direkt noch einmal senden
                            setSchritt(z < 0 ? SCHRITT_KONTAKT : z)
                        }}
                        style={hauptKnopf(false)}
                    >
                        {fehlerText(fehler).zurueck < 0 ? "Noch einmal versuchen" : "Eingabe prüfen"}
                    </button>
                </div>
            )}

            {/* Ergebnis */}
            {lage === "fertig" && ergebnis && (
                <div>
                    {beispiel && (
                        <p
                            style={{
                                margin: "0 0 20px",
                                padding: "12px 14px",
                                borderRadius: 10,
                                background: "rgba(255,90,31,0.10)",
                                color: AKZENT_TEXT,
                                font: `500 14px/1.5 ${SCHRIFT}`,
                                maxWidth: 560,
                            }}
                        >
                            Beispielergebnis. Das Werkzeug ist noch nicht an die Auswertung angeschlossen —
                            die Texte unten sind Muster, nicht aus Ihrer Website gelesen.
                        </p>
                    )}

                    <p style={{ ...etikett, marginBottom: 14 }}>Drei Anzeigen für {ergebnis.betrieb}</p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: 16,
                        }}
                    >
                        {(ergebnis.anzeigen || []).map((a, i) => (
                            <div
                                key={i}
                                style={{
                                    border: `1px solid ${LINIE}`,
                                    borderRadius: 16,
                                    padding: 20,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 12,
                                    background: "rgb(255,255,255)",
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        font: `500 12px/1 ${SCHRIFT}`,
                                        letterSpacing: "0.14em",
                                        textTransform: "uppercase",
                                        color: AKZENT_TEXT,
                                    }}
                                >
                                    {a.titel}
                                </p>
                                <div style={{ flex: 1 }}>
                                    {String(a.text || "")
                                        .split("\n")
                                        .filter((z) => z.trim())
                                        .map((z, j) => (
                                            <p
                                                key={j}
                                                style={{
                                                    margin: j === 0 ? 0 : "10px 0 0",
                                                    font: `400 16px/1.6 ${SCHRIFT}`,
                                                }}
                                            >
                                                {z}
                                            </p>
                                        ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => kopieren(i, a.text)}
                                    style={{
                                        font: `500 15px/1 ${SCHRIFT}`,
                                        color: TINTE,
                                        background: "transparent",
                                        border: `1px solid ${LINIE}`,
                                        borderRadius: 999,
                                        padding: "13px 18px",
                                        minHeight: 44,
                                        cursor: "pointer",
                                        alignSelf: "start",
                                    }}
                                >
                                    {kopiert === i ? "Kopiert" : "Text kopieren"}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 36, maxWidth: 680 }}>
                        <p style={etikett}>Vier Fragen für die Bewerbung</p>
                        <ol style={{ margin: "6px 0 0", paddingLeft: 22 }}>
                            {(ergebnis.fragen || []).map((f, i) => (
                                <li key={i} style={{ margin: "0 0 8px", font: `400 17px/1.55 ${SCHRIFT}` }}>
                                    {f}
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div style={{ marginTop: 32, maxWidth: 680, borderTop: `1px solid ${LINIE}`, paddingTop: 18 }}>
                        <p style={etikett}>Budget</p>
                        <p style={{ margin: "6px 0 0", font: `400 17px/1.6 ${SCHRIFT}` }}>{ergebnis.budget}</p>
                    </div>

                    <div style={{ marginTop: 32, maxWidth: 680, borderTop: `1px solid ${LINIE}`, paddingTop: 20 }}>
                        <p style={{ margin: 0, color: LEISE, font: `400 16px/1.6 ${SCHRIFT}` }}>
                            Die Anzeigen liegen auch in Ihrem Postfach. Was darüber entscheidet, ob sich
                            jemand meldet, ist die Ausspielung: Wer sie sieht, bei welchem Budget und wie die
                            Bewerbung hereinkommt.{" "}
                            <a href={angebotLink} style={{ color: TINTE }}>
                                Darüber sprechen wir gern
                            </a>
                            .
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

Stellenanzeiger.displayName = "Stellenanzeiger"

addPropertyControls(Stellenanzeiger, {
    endpunkt: {
        type: ControlType.String,
        title: "Endpunkt",
        defaultValue: "https://fokuswerk-werkzeuge.vercel.app/api/stellenanzeige",
    },
    beispielZeigen: {
        type: ControlType.Boolean,
        title: "Beispiel statt Fehler",
        defaultValue: false,
        description:
            "Seit 26.10.2026 aus: Der Endpunkt läuft, also sollen echte Fehler sichtbar werden. Nur einschalten, wenn der Endpunkt vorübergehend nicht erreichbar ist.",
    },
    angebotLink: { type: ControlType.Link, title: "Abzweig", defaultValue: "/kontakt" },
})
