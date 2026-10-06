// Ratgeber: Übersicht /ratgeber und Artikelvorlage /ratgeber/:Ratgeber (per eval nach _baukasten-unterseiten.js)
const RG = {
  col: "Ratgeber",
  titel: "js1FOag_P", slug: "s7goyj_ER", kat: "qvaVaRs9j", bes: "tbFfnLx7h", kurz: "f6GwSRtAj",
  inh: "HrIPkp2By", autor: "cXeL5Mq0t", datum: "MSG7auKdf", lese: "rVznymT40", seo: "xC5AzHuI4", json: "jzUJePvnO",
  schema: "codeFile/BVnTf8Z:default",
  knopf: "FGiX6iPcm",
};
const v = (id) => `var(--variable-${id})`;

// Text, der an ein CMS-Feld gebunden ist (optional mit Vor-/Nachsatz)
Bau.prototype.feld = function (parent, feld, { preset, farbe, align = "start", breite = 'width="1fr"', name = "Feld", vor, nach, extra = "", datum = false } = {}) {
  const tr = [];
  if (datum) tr.push(`name="toDateString" dateStyle="long" capitalize="false"`);
  if (vor) tr.push(`name="prefix" value="${q(vor)}"`);
  if (nach) tr.push(`name="suffix" value="${q(nach)}"`);
  let txt = `text="${v(feld)}"`;
  if (tr.length) txt = `text.from="${v(feld)}" ` + tr.map((t, i) => t.replace(/(\w+)="/g, `text.transforms.${i}.$1="`)).join(" ");
  return this.node("RichTextNode", parent, `name="${name}" ${breite} height="auto" ${txt}${preset ? ` textStylePreset="${preset}"` : ""}${farbe ? ` textColor="${farbe}"` : ""} textAlignment="${align}" ${extra}`);
};

async function baueArtikelvorlage(seite) {
  const b = new Bau("rga", seite);
  // Kopf
  const { i } = b.abschnitt({ name: "01 Artikelkopf", erster: true });
  b.brot(i, [["Startseite", "/"], ["Ratgeber", "/ratgeber"], ["Artikel", null]]);
  b.feld(i, RG.kat, { preset: "Marke", farbe: K.T40, align: "center", name: "Kategorie", vor: "[ RATGEBER · ", nach: " ]", extra: 'textTransform="uppercase"' });
  b.frame(i, "Abstand", `width="100%" height="26px"`);
  const h = b.feld(i, RG.titel, { preset: "Artikel H1", align: "center", name: "Titel", extra: 'maxWidth="980px" textWrapBalance="true"' });
  b.frame(i, "Abstand", `width="100%" height="26px"`);
  const meta = b.frame(i, "Angaben", `layout="stack" stackDirection="horizontal" stackDistribution="center" stackAlignment="center" stackWrapEnabled="true" gap="10px" width="100%" height="auto"`);
  b.feld(meta, RG.autor, { preset: "Beschriftung", farbe: K.I60, breite: 'width="auto"', name: "Autor", vor: "Von " });
  b.text(meta, "·", { preset: "Beschriftung", farbe: K.T40, breite: 'width="auto"', name: "Punkt" });
  b.feld(meta, RG.lese, { preset: "Beschriftung", farbe: K.I60, breite: 'width="auto"', name: "Lesezeit" });
  b.text(meta, "·", { preset: "Beschriftung", farbe: K.T40, breite: 'width="auto"', name: "Punkt" });
  b.feld(meta, RG.datum, { preset: "Beschriftung", farbe: K.I60, breite: 'width="auto"', name: "Datum", datum: true, vor: "Stand: " });
  b.frame(i, "Abstand", `width="100%" height="56px"`);
  const kg = b.frame(i, "Kurz gesagt", `fill="${K.INK}" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="16px" padding="36px 40px 38px 40px" radius="18px" width="100%" maxWidth="820px" height="auto" ${ap(0.1, 30)}`);
  b.o(kg, "P", `padding="26px 22px 28px 22px"`);
  b.text(kg, "[ KURZ GESAGT ]", { preset: "Marke", farbe: K.P40, name: "Marke" });
  b.feld(kg, RG.kurz, { preset: "Fließtext Groß", farbe: K.PAP, name: "Kurzantwort" });

  // Artikeltext
  const s2 = b.frame(seite.D, "02 Artikel", `fill="${K.PAP}" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="center" gap="0px" padding="8px 32px 150px 32px" width="100%" height="auto"`);
  b.o(s2, "T", `padding="8px 32px 120px 32px"`);
  b.o(s2, "P", `padding="0px 20px 96px 20px"`);
  b.node("RichTextNode", s2, `name="Inhalt" width="100%" maxWidth="720px" height="auto" text="${v(RG.inh)}" stylePresetHeading2="Artikel H2" stylePresetHeading3="Artikel H3" stylePresetParagraph="Artikel Text" linkStylePreset="Artikel Link"`);

  // Weiterlesen: vorheriger / nächster Artikel
  const w = b.abschnitt({ name: "03 Weiterlesen", fill: K.PR });
  b.kopf(w.i, "[ WEITERLESEN ]", "Ratgeber", { tag: "p" });
  const r = b.karten(w.i, { unten: 36, gap: 12 });
  for (const [art, lab] of [["previousItemId", "←  VORHERIGER ARTIKEL"], ["nextItemId", "NÄCHSTER ARTIKEL  →"]]) {
    const c = b.frame(r, lab.includes("VOR") ? "Vorheriger" : "Nächster", `link.href="/ratgeber/:Ratgeber" link.collectionItem="var(--variable-${art}.${RG.slug})" visible.from="var(--variable-${art})" visible.transforms.0.name="isSet" fill="${K.HELL}" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="14px" overflow="clip" padding="30px 30px 32px 30px" radius="18px" width="1fr" height="auto" minHeight="240px" hoverEffect.backgroundColor="${K.HELLH}" hoverEffect.scale="1" hoverEffect.y="-4px" hoverEffect.transition="spring-duration 0.5s 0.2 0s"`);
    b.o(c, "T", `width="100%" minHeight="null"`);
    b.o(c, "P", `width="100%" minHeight="null" padding="22px 22px 26px 22px"`);
    b.text(c, lab, { preset: "Marke", farbe: K.T40, name: "Marke" });
    const t = b.node("RichTextNode", c, `name="Titel" width="1fr" height="auto" text="var(--variable-${art}.${RG.titel})" fontName="Inter" fontWeight="500" fontSize="26px" letterSpacing="-0.045em" lineHeight="1.16em" textColor="${K.INK}" textWrapBalance="true"`);
    b.o(t, "P", `fontSize="22px"`);
    b.node("RichTextNode", c, `name="Beschreibung" width="1fr" height="auto" text="var(--variable-${art}.${RG.bes})" textStylePreset="Beschriftung" textColor="${K.I60}"`);
  }
  b.knopf(w.i, "Dunkel", "Alle Artikel im Ratgeber", "/ratgeber");

  // Strukturdaten aus dem CMS
  b.node("ComponentInstanceNode", seite.D, `name="Strukturdaten Artikel" component="${RG.schema}" $control__jSONLD="${v(RG.json)}" position="absolute" left="0px" top="0px" width="1px" height="1px"`);
  return await b.commit("artikel");
}

async function baueUebersicht(seite) {
  const b = new Bau("rgu", seite);
  const { i } = b.abschnitt({ name: "01 Auftakt", erster: true });
  b.brot(i, [["Startseite", "/"], ["Ratgeber", null]]);
  b.kopf(i, "[ RATGEBER · WISSEN FÜR BETRIEBE ]", "Ratgeber", { tag: "p" });
  b.frame(i, "Abstand", `width="100%" height="10px"`);
  b.titel(i, "Ehrliche Antworten zu Werbung, Websites und [[Sichtbarkeit]].", { d: 60, t: 46, p: 34, farbe: K.INK, tag: "h1", align: "center", max: "940px" });
  b.frame(i, "Abstand", `width="100%" height="24px"`);
  b.text(i, "Was kostet eine Website? Lohnt sich Werbung bei Google? Wie finden Sie neue Mitarbeiter? Hier schreiben wir auf, was wir aus der Arbeit mit Betrieben rund um Oldenburg wissen — mit Zahlen, Beispielen und ohne Fachchinesisch.", { preset: "Fließtext Groß", farbe: K.I60, align: "center", extra: 'maxWidth="720px" textWrapBalance="true"', name: "Vorlauf" });
  b.frame(i, "Abstand", `width="100%" height="72px"`);
  const liste = b.frame(i, "Artikelliste", `layout="grid" gridColumnCount="3" gridRowHeightType="auto" gridColumnMinWidth="200px" gridAlignment="start" gap="12px" width="100%" height="auto"`);
  b.o(liste, "T", `gridColumnCount="2" gap="10px"`);
  b.o(liste, "P", `gridColumnCount="1" gap="10px"`);
  const k = b.frame(liste, "Artikel", `link.href="/ratgeber/:Ratgeber" link.collectionItem="${v(RG.slug)}" fill="${K.HELL}" layout="stack" stackDirection="vertical" stackDistribution="space-between" stackAlignment="start" gap="28px" overflow="clip" padding="28px 28px 26px 28px" radius="18px" width="1fr" height="1fr" hoverEffect.backgroundColor="${K.HELLH}" hoverEffect.scale="1" hoverEffect.y="-4px" hoverEffect.transition="spring-duration 0.5s 0.2 0s"`);
  b.o(k, "P", `padding="22px 22px 22px 22px"`);
  const o = b.frame(k, "Oben", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="14px" width="100%" height="auto"`);
  b.feld(o, RG.kat, { preset: "Marke", farbe: K.T40, name: "Kategorie", extra: 'textTransform="uppercase"' });
  const t = b.node("RichTextNode", o, `name="Titel" width="1fr" height="auto" text="${v(RG.titel)}" fontName="Inter" fontWeight="500" fontSize="25px" letterSpacing="-0.045em" lineHeight="1.16em" textColor="${K.INK}" textWrapBalance="true"`);
  b.o(t, "P", `fontSize="22px"`);
  b.feld(o, RG.bes, { preset: "Beschriftung", farbe: K.I60, name: "Beschreibung" });
  b.feld(k, RG.lese, { preset: "Marke", farbe: K.INK, name: "Weiter", nach: "  →", extra: 'textTransform="uppercase"' });
  b.raw(`SET ${liste} collectionList.collection="${RG.col}" collectionList.repeatedDescendantId="${k}";`);
  return await b.commit("uebersicht");
}
globalThis.baueArtikelvorlage = baueArtikelvorlage; globalThis.baueUebersicht = baueUebersicht; globalThis.RG = RG;

// Abschnitt „Aus dem Ratgeber“ mit drei passenden Artikeln vor dem Abschluss einer Seite
async function baueRatgeberTeaser(seite, slugs, vorId) {
  const b = new Bau("rgt", seite);
  const s = b.frame(seite.D, "Aus dem Ratgeber", `fill="${K.PAP}" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="center" gap="0px" overflow="clip" padding="130px 32px 130px 32px" width="100%" height="auto" scrollTargetEnabled="true" elementId="ratgeber"`, seite.index);
  b.o(s, "T", `padding="110px 32px 110px 32px"`);
  b.o(s, "P", `padding="88px 20px 80px 20px"`);
  const i = b.frame(s, "Inhalt", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="center" gap="0px" width="100%" height="auto" maxWidth="1240px"`);
  b.kopf(i, "[ AUS DEM RATGEBER ]", "Ratgeber", { tag: "p" });
  const liste = b.frame(i, "Artikelliste", `layout="grid" gridColumnCount="3" gridRowHeightType="auto" gridAlignment="start" gap="12px" padding="0px 0px 36px 0px" width="100%" height="auto"`);
  b.o(liste, "T", `gridColumnCount="1" gap="10px"`);
  b.o(liste, "P", `gridColumnCount="1" gap="10px"`);
  const k = b.frame(liste, "Artikel", `fill="${K.HELL}" layout="stack" stackDirection="vertical" stackDistribution="space-between" stackAlignment="start" overflow="clip" padding="28px 28px 26px 28px" radius="18px" width="1fr" height="1fr" hoverEffect.backgroundColor="${K.HELLH}" hoverEffect.scale="1" hoverEffect.y="-4px" hoverEffect.transition="spring-duration 0.5s 0.2 0s"`);
  let filt = "";
  if (slugs) filt = ` collectionList.filters.0.variableId="${RG.slug}" collectionList.filters.0.transforms.0.name="isIncludedIn" collectionList.filters.0.transforms.0.value="${q(JSON.stringify(slugs))}"`;
  b.raw(`SET ${liste} collectionList.collection="${RG.col}" collectionList.repeatedDescendantId="${k}" collectionList.limit="3"${filt};`);
  b.raw(`SET ${k} link.href="/ratgeber/:Ratgeber" link.collectionItem="${v(RG.slug)}";`);
  b.o(k, "P", `padding="22px 22px 22px 22px"`);
  const o = b.frame(k, "Oben", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="14px" padding="0px 0px 26px 0px" width="100%" height="auto"`);
  const MARKE = `fontName="Inter" fontWeight="500" fontSize="12px" letterSpacing="0.12em" lineHeight="1em" textTransform="uppercase"`;
  b.node("RichTextNode", o, `name="Kategorie" width="1fr" height="auto" text="${v(RG.kat)}" ${MARKE} textColor="${K.T40}"`);
  const t = b.node("RichTextNode", o, `name="Titel" width="1fr" height="auto" text="${v(RG.titel)}" fontName="Inter" fontWeight="500" fontSize="25px" letterSpacing="-0.045em" lineHeight="1.16em" textColor="${K.INK}" textWrapBalance="true"`);
  b.o(t, "P", `fontSize="22px"`);
  b.node("RichTextNode", o, `name="Beschreibung" width="1fr" height="auto" text="${v(RG.bes)}" textStylePreset="Beschriftung" textColor="${K.I60}"`);
  b.node("RichTextNode", k, `name="Weiter" width="1fr" height="auto" text.from="${v(RG.lese)}" text.transforms.0.name="suffix" text.transforms.0.value="  →" ${MARKE} textColor="${K.INK}"`);
  b.knopf(i, "Dunkel", "Alle Artikel im Ratgeber", "/ratgeber");
  return await b.commit("teaser " + seite.pfad);
}
globalThis.baueRatgeberTeaser = baueRatgeberTeaser;
