// Was nach der Auswertung passiert: Eintrag im Funnel, Meldung an uns, Zusendung an den
// Betrieb. Drei Wege, keiner reißt einen anderen mit — wer seine Auswertung bekommen
// hat, soll sie behalten, auch wenn die Übergabe klemmt.
//
// Gebaut wie `seo-analyse-lead.js`, mit einem Unterschied: Hier hängt der Vergleich am
// Ort, nicht an der Domain. Im Funnel steht deshalb der Ort, und die Antworten tragen
// Platz und Gesamtzahl — das ist der Gesprächseinstieg am Telefon.

import { sendeMail, mitFrist, AN_UNS } from "./lead.js";
import { escape, huelle, karte, etikett, angabe, WEISS, TINTE, LEISE, LINIE, AKZENT, SCHRIFT } from "./mail-vorlagen.js";
import { ranglistePdf } from "./rangliste-pdf.js";
import { plural, monatJahr } from "./rangliste-urteil.js";

const FREEBIE = "Wettbewerb";

// Der Wortlaut, den der Besucher im letzten Schritt abhakt. Er steht in `Rangliste.tsx`;
// ändert er sich dort, gehört er auch hier geändert — am Datensatz soll stehen, wem der
// Mensch tatsächlich zugestimmt hat, nicht eine ähnliche Formulierung.
const EINWILLIGUNG =
  "Fokuswerk darf mir die Auswertung schicken und sich zu dieser Anfrage melden. Jederzeit " +
  "widerrufbar, die Angaben gehen an niemanden sonst.";

const NEWSLETTER_EINWILLIGUNG =
  "Schickt mir außerdem, was bei anderen Betrieben funktioniert hat — ein paar Mal im Jahr, " +
  "jederzeit abbestellbar.";

const dateiname = (e) =>
  `Wettbewerb-${String(e.betrieb || "Betrieb").replace(/[^\wÄÖÜäöüß-]+/g, "-").slice(0, 40)}.pdf`;

export async function meldeAnFunnel(daten, e, pdf = null) {
  const ziel = process.env.FUNNEL_ZIEL || "https://fokuswerk-outreach.vercel.app/api/funnel";
  const schluessel = process.env.FUNNEL_SCHLUESSEL;
  if (!schluessel) return { uebersprungen: "kein FUNNEL_SCHLUESSEL" };

  const k = daten?.kontakt || {};
  if (!k.email) return { uebersprungen: "keine Adresse" };

  const antwort = await fetch(ziel, {
    method: "POST",
    headers: { "content-type": "application/json", "x-funnel-schluessel": schluessel },
    body: JSON.stringify({
      name: k.name || null,
      email: k.email,
      telefon: k.telefon || null,
      firma: e.betrieb || null,
      freebie: FREEBIE,
      newsletter: daten?.newsletter === true,
      einwilligungstext:
        daten?.newsletter === true
          ? EINWILLIGUNG + " | Newsletter: " + NEWSLETTER_EINWILLIGUNG
          : EINWILLIGUNG,
      quelle: daten?.herkunft?.quelle || "funnel",
      kampagne: daten?.herkunft?.kampagne || null,
      anzeige: daten?.herkunft?.anzeige || null,
      seite: "/wettbewerb",
      // Was der Vertrieb vor dem Anruf wissen muss. Platz und Gesamtzahl sind der
      // Einstiegssatz, die Mängel sind der Gesprächsstoff.
      antworten: {
        gewerk: e.gewerk || null,
        ort: e.ort || null,
        platz: e.eigen?.platz ?? null,
        von: e.liste?.length ?? null,
        bewertungen: e.eigen?.bewertungen ?? null,
        schnitt: e.eigen?.schnitt ?? null,
        fotos: e.eigen?.fotos ?? null,
        profil_uebernommen: e.eigen?.uebernommen ?? null,
        werbende_im_ort: e.markt?.umKunden ?? null,
        maengel: (e.befunde || []).filter((b) => b.art === "mangel").map((b) => b.titel).slice(0, 5),
      },
      // Dasselbe Dokument, das der Betrieb bekommt — damit im Gespräch beide dieselbe
      // Liste vor sich haben. Klemmt die Ablage drüben, kommt der Lead trotzdem an.
      pdf: pdf ? pdf.toString("base64") : null,
      pdf_name: pdf ? dateiname(e) : null,
    }),
  });
  if (!antwort.ok) throw new Error("Funnel " + antwort.status + ": " + (await antwort.text()).slice(0, 200));
  return await antwort.json().catch(() => ({ ok: true }));
}

export function meldungAnUns(daten, e) {
  const k = daten?.kontakt || {};
  const maengel = (e.befunde || []).filter((b) => b.art === "mangel");
  const zeilen = [
    `${e.betrieb} — Platz ${e.eigen?.platz} von ${e.liste?.length} in ${e.ort}`,
    "",
    `Kontakt:   ${k.name || "—"} · ${k.email || "—"} · ${k.telefon || "—"}`,
    `Gewerk:    ${e.gewerk} in ${e.ort}`,
    `Profil:    ${e.eigen?.bewertungen} Bewertungen · Schnitt ${e.eigen?.schnitt ?? "—"} · ` +
      `${e.eigen?.fotos} Fotos · Website ${e.eigen?.website ? "ja" : "fehlt"} · ` +
      `Profil ${e.eigen?.uebernommen ? "übernommen" : "NICHT übernommen"}`,
    // ▲ Auch hier die Zeitform, und hier ist sie am teuersten: Diese Zeilen liest der, der
    // anruft. „1 werben um Kunden" hat ihn mit einer Tatsache ins Gespräch geschickt, die
    // der Betrieb am Ort besser weiß als wir — in allen neun gemessenen Orten lief keine
    // Anzeige mehr.
    `Markt:     ${e.markt?.anzahl} Betriebe · ` +
      (e.markt?.umKunden === 0
        ? "keiner hat je um Kunden geworben"
        : e.markt?.umKundenAktiv
          ? `${e.markt.umKundenAktiv} ${e.markt.umKundenAktiv === 1 ? "wirbt" : "werben"} GERADE um Kunden`
          : `${e.markt?.umKunden} ${e.markt?.umKunden === 1 ? "hat" : "haben"} je geworben, aktiv gerade keiner` +
            (e.markt?.letzteKundenwerbung ? ` (letzte bis ${e.markt.letzteKundenwerbung})` : "")) +
      ` · ${e.markt?.ohneWebsite} ohne Website im Profil`,
    "",
    maengel.length ? "Mängel:\n" + maengel.map((b) => "  · " + b.titel).join("\n") : "Keine schweren Mängel.",
    "",
    "Einstieg am Telefon:",
    `  „Ich hab die ${plural(e.gewerk)} in ${e.ort} durchgezählt — es sind ${e.liste?.length}. ` +
      `Sie stehen auf Platz ${e.eigen?.platz}."`,
    "",
    daten?.newsletter === true ? "Newsletter: ja" : "Newsletter: nein",
  ];
  // Dieselbe Karte wie bei der SEO-Analyse und beim Stellenanzeiger. Bis zum 29.10.2026
  // ging diese eine Meldung als nackter Text mit ausgerichteten Doppelpunkten raus und sah
  // zwischen den anderen beiden aus wie ein Serverprotokoll. Der Text bleibt als zweite
  // Fassung erhalten — in Betrieben blockiert mancher Client HTML.
  const platz = `${e.eigen?.platz} von ${e.liste?.length}`;
  const inhalt = karte(`
    ${etikett("Neuer Lead · Wettbewerb")}
    <p style="margin:0 0 3px;font:500 21px/1.3 ${SCHRIFT};color:${TINTE};">${escape(k.name || "Ohne Namen")}</p>
    <p style="margin:0 0 18px;font:400 14px/1.5 ${SCHRIFT};color:${LEISE};">${escape(e.betrieb || "")}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;">
      ${angabe("Telefon", k.telefon, { hervor: true, link: k.telefon ? "tel:" + String(k.telefon).replace(/\s/g, "") : "" })}
      ${angabe("E-Mail", k.email, { link: k.email ? "mailto:" + k.email : "" })}
      ${angabe("Gewerk", e.gewerk ? e.gewerk + " in " + e.ort : null)}
      ${angabe("Profil", [
        e.eigen?.bewertungen + " Bewertungen",
        "Schnitt " + (e.eigen?.schnitt != null ? String(e.eigen.schnitt).replace(".", ",") : "—"),
        e.eigen?.fotos + " Fotos",
        "Website " + (e.eigen?.website ? "ja" : "fehlt"),
        e.eigen?.uebernommen ? "Profil übernommen" : "Profil NICHT übernommen",
      ].join(" · "))}
      ${angabe("Markt", marktsatz(e))}
    </table>

    <p style="margin:18px 0 0;padding-top:14px;border-top:1px solid ${LINIE};font:400 14px/1.6 ${SCHRIFT};color:${TINTE};">
      Platz <strong style="font-weight:600;">${escape(platz)}</strong> in ${escape(e.ort || "")}${
        maengel.length ? escape(" · " + maengel.length + (maengel.length === 1 ? " schwerer Mangel" : " schwere Mängel")) : " · keine schweren Mängel"
      }<br>
      <span style="color:${LEISE};">„Ich hab die ${escape(plural(e.gewerk))} in ${escape(e.ort || "")} durchgezählt — es sind ${escape(String(e.liste?.length ?? "—"))}. Sie stehen auf Platz ${escape(String(e.eigen?.platz ?? "—"))}."</span>
    </p>`);

  return {
    betreff: `Wettbewerb: ${e.betrieb} (Platz ${e.eigen?.platz}/${e.liste?.length}, ${e.ort})`,
    html: huelle(inhalt, `${k.name || "Neuer Lead"} · Platz ${platz} in ${e.ort}`),
    text: zeilen.join("\n"),
  };
}

// Die Marktlage in einem Satz — dieselbe Vorsicht bei der Zeitform wie überall: „werben"
// nur, wenn wirklich gerade jemand wirbt.
function marktsatz(e) {
  const m = e.markt || {};
  const teile = [m.anzahl + " Betriebe"];
  teile.push(
    m.umKunden === 0
      ? "keiner hat je bei Meta geworben"
      : m.umKundenAktiv
        ? `${m.umKundenAktiv} ${m.umKundenAktiv === 1 ? "wirbt" : "werben"} GERADE bei Meta`
        : `${m.umKunden} ${m.umKunden === 1 ? "hat" : "haben"} bei Meta je geworben, aktiv keiner`,
  );
  if (m.googlePruefbar) {
    teile.push(`${m.beiGoogle} von ${m.googlePruefbar} werben bei Google`);
  }
  teile.push(`${m.ohneWebsite} ohne Website im Profil`);
  return teile.join(" · ");
}

// Dieselbe Huelle und dieselben Karten wie bei der SEO-Analyse: Tabellenlayout, Stile
// inline, keine Webschriften, keine Bilder. In Betrieben wird beides blockiert.
//
// Oben EIN gestalteter Block mit dem Platz, danach ein ganz normaler Brief. Die erste
// Fassung ging als nackter Text mit eingerueckten Aufzaehlungen raus und sah aus wie ein
// Serverprotokoll. Die Gegenrichtung ist aber genauso falsch: Wer die ganze Mail baut —
// Karten, Etiketten, Befundlisten —, schreibt ein Prospekt, und ein Prospekt mag niemand.
export function auswertungMail(daten, e) {
  const name = String(daten?.kontakt?.name || "").trim();
  const anrede = name ? "Guten Tag " + name : "Guten Tag";
  const schwer = (e.befunde || []).filter((b) => b.art === "mangel");
  const gesamt = e.liste.length;

  const auftakt = karte(`
    ${etikett("Ihr Platz im Wettbewerb")}
    <p style="margin:0 0 4px;font:500 20px/1.25 ${SCHRIFT};color:${TINTE};">${escape(e.betrieb)}</p>
    <p style="margin:0 0 20px;font:400 13px/1.5 ${SCHRIFT};color:${LEISE};">${escape(plural(e.gewerk))} in ${escape(e.ort)} · gemessen am ${escape(e.geprueft || "")}</p>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="font:500 44px/1 ${SCHRIFT};color:${TINTE};">${e.eigen.platz}</td>
      <td style="padding-left:8px;font:400 13px/1 ${SCHRIFT};color:${LEISE};">von ${gesamt}</td>
    </tr></table>
    ${e.einordnung ? `<p style="margin:14px 0 0;font:400 15px/1.6 ${SCHRIFT};color:${TINTE};">${escape(e.einordnung.satz)}</p>` : ""}`);

  const absatz = (t) => `<p style="margin:0 0 16px;font:400 16px/1.7 ${SCHRIFT};color:${TINTE};">${t}</p>`;

  // Befundtitel sind ganze Saetze („Kein einziges Foto in Ihrem Profil"). Mit „und"
  // verbunden ergibt das Kauderwelsch, deshalb stehen sie untereinander. Zwei Zeilen
  // Aufzaehlung sind noch kein Prospekt.
  const liste = (b) => b.map((x) => `<li style="margin:0 0 6px;">${escape(x.titel)}</li>`).join("");
  const zuerstHtml = schwer.length
    ? `<p style="margin:0 0 10px;font:400 16px/1.7 ${SCHRIFT};color:${TINTE};">` +
      (schwer.length === 1 ? "Ein Punkt kostet Sie dabei Plätze:" : `${["", "Ein", "Zwei", "Drei", "Vier", "Fünf"][schwer.length] || schwer.length} Punkte kosten Sie dabei Plätze:`) +
      `</p><ul style="margin:0 0 16px;padding-left:20px;font:400 16px/1.6 ${SCHRIFT};color:${TINTE};">${liste(schwer)}</ul>`
    : `<p style="margin:0 0 16px;font:400 16px/1.7 ${SCHRIFT};color:${TINTE};">An Ihrem Profil selbst ist nichts zu beanstanden — das ist seltener, als Sie denken.</p>`;
  const zuerstText = schwer.length
    ? [(schwer.length === 1 ? "Ein Punkt kostet Sie dabei Plätze:" : `${["", "Ein", "Zwei", "Drei", "Vier", "Fünf"][schwer.length] || schwer.length} Punkte kosten Sie dabei Plätze:`),
       ...schwer.map((b) => "  - " + b.titel)].join("\n")
    : "An Ihrem Profil selbst ist nichts zu beanstanden — das ist seltener, als Sie denken.";

  const ZAHLWORT = ["", "Einer", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Sieben", "Acht", "Neun", "Zehn"];
  // ▲ Hier hing die Glaubwuerdigkeit der ganzen Mail an einer Zeitform. In allen neun
  // vorgerechneten Orten laeuft derzeit KEINE Anzeige, die juengste endete im Februar 2026.
  // Der Satz sagte trotzdem „wirbt genau einer". Wer den Betrieb kennt, widerlegt das in
  // zehn Sekunden in der Werbebibliothek — und glaubt danach auch die Rangliste nicht mehr.
  const aktiv = e.markt.umKundenAktiv ?? e.markt.umKunden;
  const wieViele = ZAHLWORT[aktiv] || String(aktiv);
  const wann = monatJahr(e.markt.letzteKundenwerbung);
  const anzeigenSatz =
    e.markt.umKunden === 0
      ? `Und eine Sache, die uns aufgefallen ist: In ${escape(e.ort)} hat bei Facebook und Instagram noch nie einer um Kunden geworben. Nicht ein einziger der ${gesamt} Betriebe.`
      : aktiv === 0
        ? `Und eine Sache, die uns aufgefallen ist: Bei Facebook und Instagram läuft in ${escape(e.ort)} gerade keine einzige Anzeige. ${e.markt.umKunden === 1 ? "Einer" : ZAHLWORT[e.markt.umKunden] || String(e.markt.umKunden)} der ${gesamt} Betriebe hat es schon einmal versucht${wann ? ", zuletzt " + wann : ""}. Wer das ist, steht im PDF.`
        : aktiv === 1
          ? `Und eine Sache, die uns aufgefallen ist: Von den ${gesamt} Betrieben wirbt gerade genau einer bei Facebook und Instagram um Kunden. Wer das ist, steht im PDF.`
          : `${wieViele} der ${gesamt} Betriebe werben gerade bei Facebook und Instagram um Kunden. Wer das ist, steht im PDF.`;

  const brief = `<tr><td style="padding:26px 4px 0;">
    ${absatz(escape(anrede) + ",")}
    ${absatz(`im Anhang finden Sie Ihre Auswertung als PDF. Darin steht die vollständige Liste
      aller ${gesamt} ${escape(plural(e.gewerk))} in ${escape(e.ort)} — mit Namen, Bewertungen, Fotos
      und der Frage, wer von ihnen wirbt — und wer es schon einmal versucht hat.`)}
    ${zuerstHtml}
    ${absatz(anzeigenSatz)}
    ${absatz(`Alle Zahlen stammen aus den öffentlichen Google-Profilen und aus Metas
      Werbebibliothek, abgerufen heute. Jede steht mit Quelle im Dokument, Sie können also
      alles nachschlagen — auch bei Ihren Nachbarn.`)}
    ${absatz(`Wenn etwas unklar ist, melden Sie sich gerne. Einfach auf diese Mail antworten
      oder anrufen: <a href="tel:+4917663307587" style="color:${TINTE};">0176 63307587</a>.`)}
    <p style="margin:26px 0 0;font:400 16px/1.7 ${SCHRIFT};color:${TINTE};">
      Viele Grüße<br>Thees Bodenstab
    </p>
  </td></tr>`;

  const roh = (t) => String(t).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  const text = [
    `Ihr Platz im Wettbewerb: ${e.betrieb} steht auf Platz ${e.eigen.platz} von ${gesamt} in ${e.ort}`,
    e.einordnung ? roh(e.einordnung.satz) : "",
    "",
    anrede + ",",
    "",
    roh(`im Anhang finden Sie Ihre Auswertung als PDF. Darin steht die vollständige Liste aller ${gesamt} ${plural(e.gewerk)} in ${e.ort} — mit Namen, Bewertungen, Fotos und der Frage, wer von ihnen wirbt — und wer es schon einmal versucht hat.`),
    "",
    zuerstText,
    "",
    roh(anzeigenSatz),
    "",
    "Alle Zahlen stammen aus den öffentlichen Google-Profilen und aus Metas Werbebibliothek,",
    "abgerufen heute. Jede steht mit Quelle im Dokument, Sie können also alles nachschlagen —",
    "auch bei Ihren Nachbarn.",
    "",
    "Wenn etwas unklar ist, melden Sie sich gerne. Einfach auf diese Mail antworten oder",
    "anrufen: 0176 63307587.",
    "",
    "Viele Grüße",
    "Thees Bodenstab",
    "",
    "Fokuswerk — Abt & Bodenstab GbR · Schramperweg 90 · 26129 Oldenburg",
    "0176 63307587 · contact@fokuswerk.de · USt-IdNr. DE456629159",
  ].join("\n");

  return {
    betreff: `Ihr Platz in ${e.ort}: ${e.eigen.platz} von ${gesamt}`,
    html: huelle(`<tr><td style="padding:0 4px;">${auftakt}</td></tr>` + brief,
      `Platz ${e.eigen.platz} von ${gesamt} in ${e.ort}`),
    text,
  };
}

export async function verarbeiteRanglisteLead(daten, e) {
  const bericht = {};
  const k = daten?.kontakt || {};

  // Das PDF entsteht vor den drei Wegen, weil zwei davon es brauchen: der Funnel als
  // base64 am Lead, der Betrieb als Mailanhang. Lieber die Mail ohne PDF als gar keine —
  // der Betrieb hat auf der Seite gelesen, dass die Auswertung kommt.
  let pdf = null;
  try {
    pdf = await ranglistePdf(pdfDaten(e));
  } catch (fehler) {
    console.error("PDF gescheitert:", fehler?.message);
  }

  const [funnel, meldung, zusendung] = await Promise.allSettled([
    mitFrist(meldeAnFunnel(daten, e, pdf), 8000, "Funnel"),
    (async () => {
      const m = meldungAnUns(daten, e);
      return mitFrist(sendeMail({ an: AN_UNS, betreff: m.betreff, text: m.text, html: m.html, antwortAn: k.email || undefined }), 8000, "Meldung");
    })(),
    (async () => {
      if (!k.email) return { uebersprungen: "keine Adresse" };
      const anhaenge = pdf ? [{ name: dateiname(e), inhalt: pdf }] : undefined;
      const m = auswertungMail(daten, e);
      const versand = await mitFrist(
        sendeMail({ an: k.email, betreff: m.betreff, text: m.text, html: m.html, anhaenge }),
        15000,
        "Zusendung",
      );
      // Das PDF gehört in den Bericht wie bei den anderen zwei Werkzeugen. Ohne diese Zeile
      // stand im Diagnosebericht nur „verschickt" — und dass die Mail ihr eigenes
      // Anhangversprechen brach, fiel wochenlang niemandem auf.
      return { ...versand, pdf: anhaenge ? Math.round(anhaenge[0].inhalt.length / 1024) + " KB" : "keins" };
    })(),
  ]);

  bericht.funnel = funnel.status === "fulfilled" ? funnel.value : { fehler: String(funnel.reason?.message || funnel.reason) };
  bericht.meldung = meldung.status === "fulfilled" ? meldung.value : { fehler: String(meldung.reason?.message || meldung.reason) };
  bericht.zusendung = zusendung.status === "fulfilled" ? zusendung.value : { fehler: String(zusendung.reason?.message || zusendung.reason) };
  return bericht;
}

// ───────────────────────────────────────────────────────────────────────────────
// Warteliste: wenn für diese Kombination noch nicht gezählt ist
// ───────────────────────────────────────────────────────────────────────────────
//
// Die Seite bietet sechs Betriebsarten und achtzehn Orte an, also 108 Möglichkeiten.
// Vorgerechnet sind neun. Alles andere braucht eine frische Messung, und die kostet Geld,
// das nicht immer da ist. Vorher endete dieser Fall in einem Satz ohne Ausgang — mit der
// Rückfrage, ob der Besucher sich beim Ortsnamen vertippt habe, und ohne ein Feld, in das
// er etwas hätte eintragen können. Er hatte seine Betriebsart gewählt, seinen Ort getippt
// und gewartet. Dann ging er, und wir erfuhren nicht einmal, dass er da war.
//
// Jetzt ist genau das der Lead: Betriebsart und Ort sagen, was er sucht, und zusammen
// sagen alle Einträge, welche Kombinationen wir als nächste vorrechnen sollten. Bisher
// stand diese Reihenfolge in `test/vorrechnen.mjs` — nach meinem Gefühl sortiert.

/** Die interne Meldung. Sie ist zugleich der Arbeitsauftrag fürs Vorrechnen. */
export function wartelisteMeldung(daten) {
  const k = daten?.kontakt || {};
  return {
    betreff: `Warteliste: ${daten.gewerk} in ${daten.ort}`,
    text: [
      `${daten.gewerk} in ${daten.ort} ist noch nicht gezählt — jemand wartet darauf.`,
      "",
      `Kontakt:   ${k.name || "—"} · ${k.email}`,
      `Gesucht:   ${daten.gewerk} in ${daten.ort}`,
      daten?.herkunft?.quelle ? `Herkunft:  ${daten.herkunft.quelle}${daten.herkunft.kampagne ? " · " + daten.herkunft.kampagne : ""}` : null,
      "",
      "So wird daraus eine Auswertung:",
      `  node test/vorrechnen.mjs --los --max 1`,
      "",
      "Das rechnet die nächste offene Kombination der Liste. Steht diese hier nicht oben",
      "in `ORTE`/`GEWERKE`, dann dort nach vorn ziehen — die Reihenfolge ist geraten, diese",
      "Anfrage ist gemessen.",
    ].filter((z) => z !== null).join("\n"),
  };
}

/** Die Bestätigung an den Betrieb. Kurz, ohne Anhang — es gibt noch nichts zu schicken. */
export function wartelisteBestaetigung(daten) {
  const was = `${escape(daten.gewerk)} in ${escape(daten.ort)}`;
  const inhalt = `
    ${karte(`
      ${etikett("Vormerkung")}
      <div style="margin-top:12px;font:500 21px/1.3 ${SCHRIFT};letter-spacing:-0.03em;color:${TINTE};">
        ${was}
      </div>
      <p style="margin:12px 0 0;font:400 15px/1.6 ${SCHRIFT};color:${LEISE};">
        Diesen Vergleich haben wir noch nicht gezählt. Wir holen das nach und schicken Ihnen
        die Liste, sobald sie steht.
      </p>
    `)}
    <p style="margin:24px 0 0;font:400 16px/1.62 ${SCHRIFT};color:${TINTE};">
      Was dann darin steht: alle Betriebe, die Google in ${escape(daten.ort)} unter
      ${escape(daten.gewerk)} führt — mit Namen, Bewertungen, Fotos, Internetauftritt und der
      Frage, wer von ihnen bei Facebook und Instagram wirbt oder geworben hat. Dazu Ihr Platz
      in dieser Liste.
    </p>
    <p style="margin:18px 0 0;font:400 16px/1.62 ${SCHRIFT};color:${TINTE};">
      Das Zählen machen wir von Hand nach, deshalb dauert es ein bis zwei Werktage. Wenn Sie
      vorher etwas brauchen, antworten Sie einfach auf diese Mail.
    </p>`;
  return {
    betreff: `Vormerkung: ${daten.gewerk} in ${daten.ort}`,
    text:
      `${daten.gewerk} in ${daten.ort} haben wir noch nicht gezählt.\n\n` +
      "Wir holen das nach und schicken Ihnen die Liste, sobald sie steht — mit allen " +
      "Betrieben, die Google dort führt, deren Bewertungen und Ihrem Platz darin. " +
      "Das dauert ein bis zwei Werktage.\n\n" +
      "Wenn Sie vorher etwas brauchen, antworten Sie einfach auf diese Mail.\n\n" +
      "Fokuswerk, Abt & Bodenstab GbR, Schramperweg 90, 26129 Oldenburg",
    html: huelle(inhalt),
  };
}

/** Eintrag im Funnel — mit `warteliste: true`, damit der Vertrieb sie unterscheiden kann. */
export async function wartelisteAnFunnel(daten) {
  const ziel = process.env.FUNNEL_ZIEL || "https://fokuswerk-outreach.vercel.app/api/funnel";
  const schluessel = process.env.FUNNEL_SCHLUESSEL;
  if (!schluessel) return { uebersprungen: "kein FUNNEL_SCHLUESSEL" };
  const k = daten?.kontakt || {};
  if (!k.email) return { uebersprungen: "keine Adresse" };

  const antwort = await fetch(ziel, {
    method: "POST",
    headers: { "content-type": "application/json", "x-funnel-schluessel": schluessel },
    body: JSON.stringify({
      name: k.name || null,
      email: k.email,
      telefon: k.telefon || null,
      firma: k.betrieb || null,
      freebie: FREEBIE,
      newsletter: daten?.newsletter === true,
      einwilligungstext:
        daten?.newsletter === true
          ? EINWILLIGUNG + " | Newsletter: " + NEWSLETTER_EINWILLIGUNG
          : EINWILLIGUNG,
      quelle: daten?.herkunft?.quelle || "funnel",
      kampagne: daten?.herkunft?.kampagne || null,
      anzeige: daten?.herkunft?.anzeige || null,
      seite: "/wettbewerb",
      antworten: {
        gewerk: daten.gewerk || null,
        ort: daten.ort || null,
        // ▲ Daran erkennt der Vertrieb den Unterschied: Dieser Mensch hat noch KEINE
        // Auswertung gesehen. Ihn anzurufen und nach seinem Platz zu fragen, geht schief.
        warteliste: true,
      },
    }),
  });
  if (!antwort.ok) throw new Error("Funnel " + antwort.status + ": " + (await antwort.text()).slice(0, 200));
  return await antwort.json().catch(() => ({ ok: true }));
}

/** Alle drei Wege der Warteliste. Keiner reißt einen anderen mit. */
export async function verarbeiteWarteliste(daten) {
  const k = daten?.kontakt || {};
  const m = wartelisteMeldung(daten);
  const b = wartelisteBestaetigung(daten);

  const [funnel, meldung, bestaetigung] = await Promise.allSettled([
    mitFrist(wartelisteAnFunnel(daten), 8000, "Funnel"),
    // Die Wartelisten-Meldung hat (noch) keine HTML-Fassung — sie ist drei Zeilen lang.
    mitFrist(sendeMail({ an: AN_UNS, betreff: m.betreff, text: m.text, antwortAn: k.email || undefined }), 8000, "Meldung"),
    mitFrist(sendeMail({ an: k.email, betreff: b.betreff, text: b.text, html: b.html }), 10000, "Bestätigung"),
  ]);

  const wert = (r) => (r.status === "fulfilled" ? r.value : { fehler: String(r.reason?.message || r.reason) });
  return { funnel: wert(funnel), meldung: wert(meldung), bestaetigung: wert(bestaetigung) };
}

/** Aus dem Urteil die Form, die der PDF-Satz erwartet. */
export function pdfDaten(e) {
  const heute = new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
  const kurz = new Date().toLocaleDateString("de-DE");
  // Wie viele gerade werben, nicht wie viele es je getan haben. Stand die Zahl hier nicht,
  // flog die ganze Funktion mit „aktiv is not defined" — und weil der Aufrufer das abfängt,
  // ging die Mail ohne das PDF raus, das sie im Text verspricht.
  const aktiv = e.markt.umKundenAktiv;

  return {
    betrieb: e.betrieb,
    gewerk: e.gewerk,
    gewerkPlural: plural(e.gewerk),
    ort: e.ort,
    geprueft: "Gemessen am " + heute,
    liste: e.liste.map((b) => ({
      platz: b.platz,
      name: b.name,
      bewertungen: b.bewertungen,
      schnitt: b.schnitt ?? 0,
      fotos: b.fotos,
      website: b.website,
      anzeigen: b.anzeigen.length > 0,
      anzeigenWort: b.anzeigen.length && b.anzeigen.every((a) => a.personal) ? "Stellen" : "Meta",
      google: (b.googleAnzeigen || []).length > 0,
      eigen: b.name === e.betrieb,
    })),
    einordnung: e.einordnung,
    kennzahlen: [
      { wert: String(e.markt.anzahl), text: `${plural(e.gewerk)} mit Google-Profil im Ort` },
      { wert: new Intl.NumberFormat("de-DE").format(e.markt.bewertungenGesamt), text: `Bewertungen verteilen sich auf diese ${e.markt.anzahl}` },
      { wert: `${e.markt.ohneWebsite} von ${e.markt.anzahl}`, text: "ohne Internetauftritt im Google-Profil" },
      {
        // Das Etikett muss zur Zahl passen: „werben" ist bei beendeten Anzeigen falsch.
        wert: `${aktiv || e.markt.umKunden} von ${e.markt.anzahl}`,
        text: aktiv ? "werben bei Meta um Kunden" : "haben bei Meta je um Kunden geworben",
      },
      // Google Ads, seit 29.10.2026. Bezugsgroesse ist die Zahl der Betriebe MIT Domain,
      // nicht die Gesamtzahl: Wer keine eigene Website hat, kann dort nicht geprueft werden,
      // und „0 von 15" waere eine Behauptung ueber sieben Betriebe, die wir nicht geprueft haben.
      ...(e.markt.googlePruefbar
        ? [{
            wert: `${e.markt.beiGoogle} von ${e.markt.googlePruefbar}`,
            // Kurz halten: Die Beschriftung steht einzeilig unter der Zahl. Dass nur
            // Betriebe mit eigener Website prüfbar sind, sagt schon die Bezugsgröße.
            text: "werben bei Google",
          }]
        : []),
    ],
    listeEinleitung:
      `Alle Betriebe, die Google in ${e.ort} unter der Kategorie ${e.gewerk} führt, sortiert nach ` +
      "der Zahl der Bewertungen. Ihr Betrieb ist hervorgehoben.",
    listeFussnote:
      "Bewertungen und Schnitt sind die von Google ausgewiesenen Werte, Fotos die Zahl der im " +
      "Profil hinterlegten Bilder. „Website: fehlt\" heißt, dass im Google-Profil kein " +
      "Internetauftritt eingetragen ist — nicht, dass es keinen gibt. Die Anzeigenspalte nennt " +
      "den Kanal: „Meta\" für Facebook und Instagram, „Google\" für Suchanzeigen. Bei Google " +
      "lassen sich nur Betriebe mit eigener Website prüfen.",
    befunde: e.befunde,
    anzeigen: e.anzeigen
      ? {
          einleitung:
            `Für jeden der ${e.markt.anzahl} Betriebe wurde in der Meta-Werbebibliothek nach dem ` +
            "Betriebsnamen gesucht, aktive und vergangene Anzeigen. Treffer, bei denen nicht der " +
            "Betrieb selbst, sondern ein Hersteller, eine Kette oder ein gleichnamiges Unternehmen " +
            "geworben hat, sind ausgeschlossen.",
          zahl: e.anzeigen.zahl,
          zahlText: e.anzeigen.zahlText,
          treffer: e.anzeigen.treffer.slice(0, 3).map((t) => ({
            wer: `${t.wer} · Platz ${t.platz} dieser Liste`,
            titel:
              `${t.anzahl} ${t.anzahl === 1 ? "Anzeige" : "Anzeigen"}` +
              (t.personal ? " — und zwar für eine Stelle" : ""),
            lauf:
              (t.von ? `Gelaufen ab ${t.von}` : "Laufzeit unbekannt") +
              (t.bis ? ` bis ${t.bis}` : "") +
              (t.id ? ` · Bibliotheks-ID ${t.id}` : "") +
              (t.aktiv ? " · läuft aktuell" : " · heute nicht mehr aktiv"),
            text: t.text || "Der Anzeigentext wird von Meta für diese Anzeige nicht ausgegeben.",
          })),
          befund: e.anzeigen.befund,
        }
      : {
          einleitung: "Die Meta-Werbebibliothek war beim Abruf nicht erreichbar.",
          zahl: "—",
          zahlText: "Die Anzeigenlage konnte für diese Auswertung nicht gemessen werden.",
          treffer: [],
          befund: {
            art: "luecke",
            titel: "Anzeigenlage nicht gemessen",
            messwert: "Der Abruf der Meta-Werbebibliothek ist gescheitert.",
            klartext:
              "Dieser Teil fehlt in Ihrer Auswertung. Die Liste oben ist davon nicht betroffen.",
            folge: "Auf Nachfrage reichen wir ihn nach.",
          },
        },
    schritte: schritte(e),
    schlusssatz:
      "Die ersten beiden Punkte sind Handarbeit und in einer Woche erledigt, dafür brauchen Sie " +
      "niemanden. Der dritte ist eine Entscheidung, keine Aufgabe — und der einzige in dieser " +
      "Auswertung, bei dem es sich lohnt, jemanden zu fragen, der das jeden Tag macht.",
    quellen: [
      {
        titel: "Google-Unternehmensprofile",
        text:
          `Abgerufen am ${kurz} über die Kartensuche nach ${plural(e.gewerk)} in ${e.ort}. Erfasst: ` +
          "Bewertungszahl, Schnitt, Zahl der Profilfotos, Eintrag im Feld Website, Kategorie und ob " +
          "das Profil übernommen ist. Betriebe anderer Kategorien aus demselben Abruf sind nicht " +
          "Teil dieses Vergleichs.",
      },
      {
        titel: "Meta-Werbebibliothek",
        text:
          `Abgerufen am ${kurz}, Land Deutschland, aktive und vergangene Anzeigen, Suche je ` +
          "Betriebsname. Die Bibliothek ist Metas eigenes öffentliches Verzeichnis aller Anzeigen.",
      },
      {
        titel: "Google Ads Transparency",
        text:
          `Abgerufen am ${kurz}, Region Deutschland, Suche je Website. Googles eigenes ` +
          "öffentliches Verzeichnis der Werbetreibenden. Geprüft werden konnten nur die " +
          `${e.markt.googlePruefbar ?? 0} Betriebe mit eigener Website im Profil; ` +
          "Werbetreibende, die auf eine fremde Seite werben — Hersteller, Agenturen, " +
          "Vermittler — zählen nicht als Werbung des Betriebs.",
      },
      {
        titel: "Was hier nicht gemessen wurde",
        text:
          "Das Alter Ihrer letzten Bewertung, Ihre Antwortquote auf Bewertungen und Ihre " +
          "Auffindbarkeit in der Websuche.",
      },
    ],
  };
}

// Die drei Schritte hängen an der Lage, nicht an einer Vorlage: Wer sein Profil nicht
// übernommen hat, braucht einen anderen ersten Schritt als jemand mit gepflegtem Eintrag.
function schritte(e) {
  // Dieselbe Zahl wie im PDF-Kopf: wie viele gerade werben, nicht wie viele es je taten.
  const aktiv = e.markt.umKundenAktiv;
  const selbst = [];
  if (!e.eigen.uebernommen) selbst.push("das Google-Profil übernehmen");
  if (!e.eigen.website) selbst.push("den Internetauftritt eintragen");
  if (e.eigen.fotos < Math.max(5, e.markt.medianFotos)) selbst.push("zehn Fotos hochladen");
  selbst.push("ab jetzt nach jedem Auftrag um eine Bewertung bitten");

  const ersterSatz = selbst.slice(0, -1).join(", ") + (selbst.length > 1 ? " und " : "") + selbst.at(-1);

  return [
    {
      titel: "Was Sie diese Woche selbst erledigen können",
      folge: ersterSatz.charAt(0).toUpperCase() + ersterSatz.slice(1) +
        ". Kostet nichts außer Zeit und bringt Sie in dieser Liste nach vorn.",
    },
    {
      titel: "Wo das aufhört",
      folge:
        "Ein gepflegtes Profil sorgt dafür, dass man Sie findet, wenn jemand sucht. Es sorgt " +
        `nicht dafür, dass jemand sucht. Alle ${e.markt.anzahl} Betriebe in ${e.ort} teilen sich ` +
        "dieselbe Nachfrage — diese Liste verschiebt nur, wer welchen Anteil davon bekommt.",
    },
    {
      titel: e.markt.umKunden === 0 ? "Wo der Markt offen liegt" : "Was die anderen schon tun",
      folge:
        e.markt.umKunden === 0
          ? `In ${e.ort} hat noch nie ein Betrieb dieser Art um Kunden geworben. Wer dort als ` +
            "Erster auftaucht, konkurriert mit niemandem um die Aufmerksamkeit — und erreicht " +
            "Leute, die heute gar nicht suchen."
          : aktiv
            ? `${aktiv} von ${e.markt.anzahl} Betrieben in ${e.ort} werben gerade um Kunden und ` +
              "erreichen damit Leute, die heute nicht suchen. Das ist der Teil des Marktes, den " +
              "diese Liste nicht abbildet."
            : `In ${e.ort} läuft gerade keine Anzeige. ${e.markt.umKunden} von ${e.markt.anzahl} ` +
              "Betrieben haben es schon einmal versucht und wieder aufgehört. Der Platz ist also " +
              "frei — und er war es nicht immer.",
    },
  ];
}
