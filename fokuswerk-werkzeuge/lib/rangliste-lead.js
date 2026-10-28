// Was nach der Auswertung passiert: Eintrag im Funnel, Meldung an uns, Zusendung an den
// Betrieb. Drei Wege, keiner reißt einen anderen mit — wer seine Auswertung bekommen
// hat, soll sie behalten, auch wenn die Übergabe klemmt.
//
// Gebaut wie `seo-analyse-lead.js`, mit einem Unterschied: Hier hängt die Rangliste am
// Ort, nicht an der Domain. Im Funnel steht deshalb der Ort, und die Antworten tragen
// Platz und Gesamtzahl — das ist der Gesprächseinstieg am Telefon.

import { sendeMail, mitFrist, AN_UNS } from "./lead.js";
import { escape, huelle, karte, etikett, WEISS, TINTE, LEISE, LINIE, AKZENT, SCHRIFT } from "./mail-vorlagen.js";
import { ranglistePdf } from "./rangliste-pdf.js";
import { plural } from "./rangliste-urteil.js";

const FREEBIE = "Ortsrangliste";

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
  `Rangliste-${String(e.betrieb || "Betrieb").replace(/[^\wÄÖÜäöüß-]+/g, "-").slice(0, 40)}.pdf`;

export async function meldeAnFunnel(daten, e) {
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
      seite: "/rangliste",
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
    `Markt:     ${e.markt?.anzahl} Betriebe · ${e.markt?.umKunden} werben um Kunden · ` +
      `${e.markt?.ohneWebsite} ohne Website im Profil`,
    "",
    maengel.length ? "Mängel:\n" + maengel.map((b) => "  · " + b.titel).join("\n") : "Keine schweren Mängel.",
    "",
    "Einstieg am Telefon:",
    `  „Ich hab die ${plural(e.gewerk)} in ${e.ort} durchgezählt — es sind ${e.liste?.length}. ` +
      `Sie stehen auf Platz ${e.eigen?.platz}."`,
    "",
    daten?.newsletter === true ? "Newsletter: ja" : "Newsletter: nein",
  ];
  return {
    betreff: `Rangliste: ${e.betrieb} (Platz ${e.eigen?.platz}/${e.liste?.length}, ${e.ort})`,
    text: zeilen.join("\n"),
  };
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
    ${etikett("Ihre Rangliste")}
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
  const wieViele = ZAHLWORT[e.markt.umKunden] || String(e.markt.umKunden);
  const anzeigenSatz =
    e.markt.umKunden === 0
      ? `Und eine Sache, die uns aufgefallen ist: In ${escape(e.ort)} wirbt bei Facebook und Instagram niemand um Kunden. Nicht ein einziger der ${gesamt} Betriebe.`
      : e.markt.umKunden === 1
        ? `Und eine Sache, die uns aufgefallen ist: Von den ${gesamt} Betrieben wirbt genau einer bei Facebook und Instagram um Kunden. Wer das ist, steht im PDF.`
        : `${wieViele} der ${gesamt} Betriebe werben bei Facebook und Instagram um Kunden. Wer das ist, steht im PDF.`;

  const brief = `<tr><td style="padding:26px 4px 0;">
    ${absatz(escape(anrede) + ",")}
    ${absatz(`im Anhang finden Sie Ihre Auswertung als PDF. Darin steht die vollständige Liste
      aller ${gesamt} ${escape(plural(e.gewerk))} in ${escape(e.ort)} — mit Namen, Bewertungen, Fotos
      und der Frage, wer von ihnen gerade wirbt.`)}
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
    `Ihre Rangliste für ${e.betrieb}: Platz ${e.eigen.platz} von ${gesamt} in ${e.ort}`,
    e.einordnung ? roh(e.einordnung.satz) : "",
    "",
    anrede + ",",
    "",
    roh(`im Anhang finden Sie Ihre Auswertung als PDF. Darin steht die vollständige Liste aller ${gesamt} ${plural(e.gewerk)} in ${e.ort} — mit Namen, Bewertungen, Fotos und der Frage, wer von ihnen gerade wirbt.`),
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
    betreff: `Ihre Rangliste: Platz ${e.eigen.platz} von ${gesamt} in ${e.ort}`,
    html: huelle(`<tr><td style="padding:0 4px;">${auftakt}</td></tr>` + brief,
      `Platz ${e.eigen.platz} von ${gesamt} in ${e.ort}`),
    text,
  };
}

export async function verarbeiteRanglisteLead(daten, e) {
  const bericht = {};
  const k = daten?.kontakt || {};

  const [funnel, meldung, zusendung] = await Promise.allSettled([
    mitFrist(meldeAnFunnel(daten, e), 8000, "Funnel"),
    (async () => {
      const m = meldungAnUns(daten, e);
      return mitFrist(sendeMail({ an: AN_UNS, betreff: m.betreff, text: m.text, antwortAn: k.email || undefined }), 8000, "Meldung");
    })(),
    (async () => {
      if (!k.email) return { uebersprungen: "keine Adresse" };
      let anhaenge;
      try {
        anhaenge = [{ name: dateiname(e), inhalt: await ranglistePdf(pdfDaten(e)) }];
      } catch (fehler) {
        // Lieber die Mail ohne PDF als gar keine: Der Betrieb hat auf der Seite gelesen,
        // dass die Auswertung kommt.
        console.error("PDF gescheitert:", fehler?.message);
        anhaenge = undefined;
      }
      const m = auswertungMail(daten, e);
      return mitFrist(sendeMail({ an: k.email, betreff: m.betreff, text: m.text, html: m.html, anhaenge }), 15000, "Zusendung");
    })(),
  ]);

  bericht.funnel = funnel.status === "fulfilled" ? funnel.value : { fehler: String(funnel.reason?.message || funnel.reason) };
  bericht.meldung = meldung.status === "fulfilled" ? meldung.value : { fehler: String(meldung.reason?.message || meldung.reason) };
  bericht.zusendung = zusendung.status === "fulfilled" ? zusendung.value : { fehler: String(zusendung.reason?.message || zusendung.reason) };
  return bericht;
}

/** Aus dem Urteil die Form, die der PDF-Satz erwartet. */
export function pdfDaten(e) {
  const heute = new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
  const kurz = new Date().toLocaleDateString("de-DE");

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
      anzeigenWort: b.anzeigen.length && b.anzeigen.every((a) => a.personal) ? "Stellen" : "ja",
      eigen: b.name === e.betrieb,
    })),
    einordnung: e.einordnung,
    kennzahlen: [
      { wert: String(e.markt.anzahl), text: `${plural(e.gewerk)} mit Google-Profil im Ort` },
      { wert: new Intl.NumberFormat("de-DE").format(e.markt.bewertungenGesamt), text: `Bewertungen verteilen sich auf diese ${e.markt.anzahl}` },
      { wert: `${e.markt.ohneWebsite} von ${e.markt.anzahl}`, text: "ohne Internetauftritt im Google-Profil" },
      {
        wert: `${e.markt.umKunden} von ${e.markt.anzahl}`,
        text: "werben bei Meta um Kunden",
      },
    ],
    listeEinleitung:
      `Alle Betriebe, die Google in ${e.ort} unter der Kategorie ${e.gewerk} führt, sortiert nach ` +
      "der Zahl der Bewertungen. Ihr Betrieb ist hervorgehoben.",
    listeFussnote:
      "Bewertungen und Schnitt sind die von Google ausgewiesenen Werte, Fotos die Zahl der im " +
      "Profil hinterlegten Bilder. „Website: fehlt\" heißt, dass im Google-Profil kein " +
      "Internetauftritt eingetragen ist — nicht, dass es keinen gibt. Die Anzeigenspalte ist " +
      "über die Meta-Werbebibliothek geprüft, aktive und vergangene Anzeigen.",
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
              "Dieser Teil fehlt in Ihrer Auswertung. Die Rangliste oben ist davon nicht betroffen.",
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
          "Teil dieser Rangliste.",
      },
      {
        titel: "Meta-Werbebibliothek",
        text:
          `Abgerufen am ${kurz}, Land Deutschland, aktive und vergangene Anzeigen, Suche je ` +
          "Betriebsname. Die Bibliothek ist Metas eigenes öffentliches Verzeichnis aller Anzeigen.",
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
          : `${e.markt.umKunden} von ${e.markt.anzahl} Betrieben in ${e.ort} werben bereits um ` +
            "Kunden und erreichen damit Leute, die gerade gar nicht suchen. Das ist der Teil des " +
            "Marktes, den eine Rangliste nicht abbildet.",
    },
  ];
}
