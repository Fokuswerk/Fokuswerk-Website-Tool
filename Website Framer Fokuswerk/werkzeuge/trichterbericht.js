// Trichterbericht aus Framer Analytics — misst ohne Einwilligung, ohne Pixel.
//
// Aufruf:  npx @framer/agent@latest exec -s <sitzung> < werkzeuge/trichterbericht.js
//
// Warum es das gibt: Meta-Pixel und Google Analytics liegen hinter dem Einwilligungs-
// banner. Gemessen am 1.11.2026 stimmten rund 5 % zu — beide sehen also fast nichts.
// Framers eigene Messung ist cookielos und läuft unabhängig davon. Sie ist damit die
// einzige Quelle, die den ganzen Verkehr kennt.
//
// Was sie kann: Einstieg und Abschluss. Die Zwischenschritte im Trichter laufen ohne
// Seitenwechsel und tauchen hier nicht auf — dafür braucht es GA4, und das heißt: die
// Zustimmungsrate muss hoch.
//
// Grenze: Framer hält nur 30 Tage vor.

const TAGE = 30
const bis = new Date()
const von = new Date(bis.getTime() - TAGE * 24 * 3600 * 1000)
// Framer lehnt alles ab, was auch nur knapp älter als 30 Tage ist.
von.setTime(von.getTime() + 2 * 3600 * 1000)
const from = von.toISOString()

function tabelle(kopf, zeilen) {
    const breite = kopf.map((k, i) =>
        Math.max(k.length, ...zeilen.map((z) => String(z[i]).length))
    )
    const strich = breite.map((b) => "-".repeat(b))
    const zeile = (z) => "| " + z.map((w, i) => String(w).padEnd(breite[i])).join(" | ") + " |"
    return [zeile(kopf), zeile(strich), ...zeilen.map(zeile)].join("\n")
}

function quote(ab, bes) {
    return bes > 0 ? (100 * ab / bes).toFixed(1).replace(".", ",") + " %" : "—"
}

// ---------- 1. Je Anzeige ----------
//
// utmContent steht nur auf dem ersten Aufruf eines Besuchers. Der Abschluss wird deshalb
// nicht über die Spalte verbunden, sondern über dailyVisitorIdHash: wer mit dieser
// Kennung eingestiegen ist und später eine /ergebnis-Seite gesehen hat, hat abgeschlossen.
const jeAnzeige = await framer.agent.queryAnalytics({
    query: `WITH
      einstieg AS (
        SELECT dailyVisitorIdHash AS v,
               any(utmSource) AS quelle,
               any(utmCampaign) AS kampagne,
               any(utmContent) AS anzeige
        FROM events_v2
        WHERE eventType = 'pageview' AND utmSource != ''
        GROUP BY v
      ),
      fertig AS (
        SELECT DISTINCT dailyVisitorIdHash AS v
        FROM events_v2
        WHERE eventType = 'pageview' AND pathname LIKE '%/ergebnis%'
      )
    SELECT quelle, kampagne, anzeige,
           count() AS besucher,
           countIf(v IN (SELECT v FROM fertig)) AS abschluesse
    FROM einstieg
    GROUP BY quelle, kampagne, anzeige
    ORDER BY besucher DESC
    LIMIT 30`,
    from,
})

// ---------- 2. Je Freebie ----------
const jeFreebie = await framer.agent.queryAnalytics({
    query: `SELECT
              multiIf(pathname LIKE '%seo-analyse%', 'SEO- und GEO-Analyse',
                      pathname LIKE '%stellenanzeige%', 'Stellenanzeige',
                      pathname LIKE '%wettbewerb%', 'Ortsrangliste', 'anderes') AS freebie,
              uniqIf(dailyVisitorIdHash, pathname NOT LIKE '%/ergebnis%') AS einstiege,
              uniqIf(dailyVisitorIdHash, pathname LIKE '%/ergebnis%') AS abschluesse
            FROM events_v2
            WHERE eventType = 'pageview'
              AND (pathname LIKE '%seo-analyse%' OR pathname LIKE '%stellenanzeige%' OR pathname LIKE '%wettbewerb%')
            GROUP BY freebie
            ORDER BY einstiege DESC`,
    from,
})

// ---------- 3. Gesamt ----------
const gesamt = await framer.agent.queryAnalytics({
    query: `SELECT count() AS pageviews, uniq(dailyVisitorIdHash) AS besucher
            FROM events_v2 WHERE eventType = 'pageview'`,
    from,
})

console.log("# Trichterbericht — Framer Analytics (cookielos, ohne Einwilligung)")
console.log("")
console.log("Zeitraum: " + from.slice(0, 10) + " bis heute (" + TAGE + " Tage, Framers Grenze)")
console.log("Gesamt: " + gesamt[0].besucher + " Besucher, " + gesamt[0].pageviews + " Seitenaufrufe")
console.log("")

console.log("## Je Freebie")
console.log("")
console.log(
    tabelle(
        ["Freebie", "Einstiege", "Abschlüsse", "Quote"],
        jeFreebie.map((r) => [r.freebie, r.einstiege, r.abschluesse, quote(r.abschluesse, r.einstiege)])
    )
)
console.log("")

console.log("## Je Anzeige (nach Herkunft)")
console.log("")
console.log(
    tabelle(
        ["Quelle", "Kampagne", "Anzeige", "Besucher", "Abschlüsse", "Quote"],
        jeAnzeige.map((r) => [
            r.quelle || "—",
            r.kampagne || "—",
            r.anzeige || "—",
            r.besucher,
            r.abschluesse,
            quote(r.abschluesse, r.besucher),
        ])
    )
)
console.log("")
console.log("Kosten pro Abschluss: Ausgaben der Anzeige aus dem Werbeanzeigenmanager")
console.log("durch die Abschlüsse oben teilen. Metas eigene Lead-Zahl ist zu niedrig,")
console.log("solange die Zustimmungsrate niedrig ist.")
