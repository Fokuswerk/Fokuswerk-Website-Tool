// Baukasten für die Fokuswerk-Unterseiten (wird per eval in framer-exec geladen)
const K = {
  PAP: "var(--token-241910db-5361-4abc-a189-9b05fcffd0c3)",
  PR: "var(--token-5a7ac898-7b05-4ca9-b3ad-e73037ebf142)",
  INK: "var(--token-27d6c6c2-14dd-4e36-9e63-62c960c866cc)",
  I60: "var(--token-49fd75c3-d4f8-4298-8c2f-15347d0f9856)",
  T40: "var(--token-b9228f4f-57c1-4758-9b23-5e2c571c5ff4)",
  P64: "var(--token-8c75aa11-c760-47e8-b21b-3c31da199fb3)",
  P40: "var(--token-5529ab13-d600-4003-9a2a-e0204247a6ac)",
  P16: "var(--token-358ca465-3b38-4916-bf92-c5e3373afecc)",
  I16: "var(--token-112bd3e6-a98f-49de-8f3f-da68ae8ffa75)",
  SIG: "var(--token-f4dd38fc-12f9-45c2-914a-26147aaba59c)",
  HELL: "rgb(235, 232, 226)",
  HELLH: "rgb(226, 222, 215)",
};
const GEIST_DUNKEL = "linear-gradient(0deg, rgba(14, 15, 18, 0.16) 0%, rgba(14, 15, 18, 0.07) 55%, rgba(14, 15, 18, 0) 88%)";
const GEIST_HELL = "linear-gradient(0deg, rgba(245, 243, 239, 0.15) 0%, rgba(245, 243, 239, 0.06) 55%, rgba(245, 243, 239, 0) 88%)";
const ap = (d, y = 60) => `appearEffect.trigger="onInView" appearEffect.threshold="0.2" appearEffect.replay="false" appearEffect.enter.opacity="0" appearEffect.enter.x="0" appearEffect.enter.y="${y}" appearEffect.enter.scale="1" appearEffect.enter.rotate="0" appearEffect.enter.rotateX="0" appearEffect.enter.rotateY="0" appearEffect.enter.skewX="0" appearEffect.enter.skewY="0" appearEffect.enter.transition="tween 0.16,1,0.3,1 1.1s ${d}s" appearEffect.enter.stagger="0s"`;
const q = (s) => String(s).replace(/"/g, '\\"');

class Bau {
  constructor(code, seite) {
    this.c = code + Math.random().toString(36).slice(2, 5);
    this.n = 0;
    this.cmds = [];
    this.ov = [];
    this.seite = seite; // {pfad, D, T, P}
  }
  id() { return `${this.c}${++this.n}q`; }
  raw(s) { this.cmds.push(s); }
  node(typ, parent, attrs, index) {
    const id = this.id();
    this.cmds.push(`+${typ} ${id} parent="${parent}"${index != null ? ` index="${index}"` : ""} ${attrs};`);
    return id;
  }
  o(id, bp, attrs) { this.ov.push([id, bp, attrs]); }
  frame(parent, name, attrs, index) { return this.node("FrameNode", parent, `name="${q(name)}" ${attrs}`, index); }

  // Text: segmente "Teil [[Akzent]] Teil" – Akzent in Signalfarbe
  text(parent, inhalt, { preset, farbe, align = "start", tag = "p", breite = 'width="1fr"', extra = "", schrift = "", name = "Text" } = {}) {
    const id = this.node("RichTextNode", parent, `name="${name}" ${breite} height="auto"${preset ? ` textStylePreset="${preset}"` : ""}${farbe && !inhalt.includes("[[") ? ` textColor="${farbe}"` : ""} textAlignment="${align}" ${schrift} ${extra}`);
    const blk = this.id();
    this.cmds.push(`+TextBlock ${blk} tag="${tag}" parent="${id}";`);
    const teile = String(inhalt).split(/(\[\[.*?\]\])/).filter((t) => t !== "");
    for (const t of teile) {
      const akz = t.startsWith("[[");
      const txt = akz ? t.slice(2, -2) : t;
      const run = this.id();
      const col = akz ? K.SIG : inhalt.includes("[[") && farbe && !String(farbe).includes("gradient") ? farbe : null;
      this.cmds.push(`+TextRun ${run} parent="${blk}" text="${q(txt)}"${col ? ` textColor="${col}"` : ""};`);
    }
    return id;
  }
  // Mehrzeiliger Text mit Zeilenumbrüchen (Array von Zeilen)
  zeilen(parent, zeilen, { preset, farbe, name = "Text", tag = "p" } = {}) {
    const id = this.node("RichTextNode", parent, `name="${name}" width="1fr" height="auto"${preset ? ` textStylePreset="${preset}"` : ""}${farbe ? ` textColor="${farbe}"` : ""}`);
    const blk = this.id();
    this.cmds.push(`+TextBlock ${blk} tag="${tag}" parent="${id}";`);
    zeilen.forEach((z, i) => {
      if (i > 0) this.cmds.push(`+TextLineBreak ${this.id()} parent="${blk}";`);
      this.cmds.push(`+TextRun ${this.id()} parent="${blk}" text="${q(z)}";`);
    });
    return id;
  }
  // Überschrift ohne Stil (damit Akzentfarbe hält), Größen je Breakpoint
  titel(parent, inhalt, { d = 48, t = 40, p = 32, farbe = K.PAP, tag = "h2", align = "start", max = null, name = "Titel" } = {}) {
    const id = this.text(parent, inhalt, {
      farbe, tag, align, name,
      schrift: `fontName="Inter" fontWeight="500" fontSize="${d}px" letterSpacing="-0.05em" lineHeight="1.08em" textWrapBalance="true"${max ? ` maxWidth="${max}"` : ""}`,
    });
    this.o(id, "T", `fontSize="${t}px"`);
    this.o(id, "P", `fontSize="${p}px"`);
    return id;
  }

  // Abschnitt mit Innenfläche; erster = mehr Luft oben (Navigation)
  abschnitt({ name, fill = K.PAP, erster = false, anker = null, dunkel = false }) {
    const s = this.frame(this.seite.D, name, `fill="${dunkel ? K.INK : fill}" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="center" gap="0px" overflow="clip" padding="${erster ? 190 : 140}px 32px 140px 32px" width="100%" height="auto"${anker ? ` scrollTargetEnabled="true" elementId="${anker}"` : ""}`);
    this.o(s, "T", `padding="${erster ? 170 : 120}px 32px 120px 32px"`);
    this.o(s, "P", `padding="${erster ? 128 : 96}px 20px 88px 20px"`);
    const i = this.frame(s, "Inhalt", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="center" gap="0px" width="100%" height="auto" maxWidth="1240px"`);
    return { s, i };
  }
  // Etikett + Geisterwort
  kopf(parent, etikett, geist, { dunkel = false, tag = "h2" } = {}) {
    this.text(parent, etikett, { preset: "Marke", farbe: dunkel ? K.P40 : K.T40, align: "center", name: "Marke" });
    const z = this.frame(parent, "Geisterzeile", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="center" gap="0px" padding="22px 0px 0px 0px" width="100%" height="150px"`);
    this.o(z, "T", `height="104px" padding="18px 0px 0px 0px"`);
    this.o(z, "P", `height="60px" padding="14px 0px 0px 0px"`);
    const g = this.text(z, geist, {
      farbe: dunkel ? GEIST_HELL : GEIST_DUNKEL, align: "center", tag, breite: 'width="auto"', name: "Geist",
      schrift: `fontName="Inter" fontWeight="600" fontSize="${Math.min(232, Math.floor(1100 / (0.473 * geist.length)))}px" letterSpacing="-0.065em" lineHeight="0.86em" userSelect="none" ${ap(0, 40)}`,
    });
    this.o(g, "T", `fontSize="${Math.min(150, Math.floor(740 / (0.473 * geist.length)))}px"`);
    this.o(g, "P", `fontSize="${Math.min(84, Math.floor(360 / (0.473 * geist.length)))}px"`);
    return z;
  }
  // Kartenreihe
  karten(parent, { unten = 0, tabletSenkrecht = true, gap = 16 } = {}) {
    const r = this.frame(parent, "Karten", `layout="stack" stackDirection="horizontal" stackDistribution="start" stackAlignment="start" gap="${gap}px" padding="0px 0px ${unten}px 0px" width="100%" height="auto" zIndex="1"`);
    if (tabletSenkrecht) this.o(r, "T", `stackDirection="vertical"`);
    this.o(r, "P", `stackDirection="vertical" gap="12px"`);
    return r;
  }
  dunkel(parent, { w = "1fr", h = 560, d = 0.05, name = "Dunkle Karte", verteilung = "space-between", tabletSenkrecht = true } = {}) {
    const k = this.frame(parent, name, `fill="${K.INK}" layout="stack" stackDirection="vertical" stackDistribution="${verteilung}" stackAlignment="start" overflow="clip" padding="40px 36px 36px 36px" radius="18px" width="${w}" height="${h}px" ${ap(d)}`);
    if (tabletSenkrecht) this.o(k, "T", `width="100%" height="auto" stackDistribution="start" gap="40px"`);
    this.o(k, "P", `width="100%" height="auto" stackDistribution="start" gap="36px" padding="28px 24px 28px 24px"`);
    return k;
  }
  bild(parent, url, alt, { w = "1.5fr", h = 560, d = 0.15, name = "Bildkarte", pos = "center", tabletSenkrecht = true } = {}) {
    const k = this.frame(parent, name, `fill="${url}" fillImagePositionY="${pos}" altText="${q(alt)}" layout="stack" stackDirection="vertical" stackDistribution="end" stackAlignment="start" gap="24px" overflow="clip" padding="44px 44px 40px 44px" radius="18px" width="${w}" height="${h}px" ${ap(d)}`);
    this.frame(k, "Schatten", `fill="linear-gradient(180deg, rgba(14, 15, 18, 0.08) 0%, rgba(14, 15, 18, 0.35) 48%, rgba(14, 15, 18, 0.88) 100%)" position="absolute" left="0px" top="0px" width="100%" height="100%" zIndex="0"`);
    if (tabletSenkrecht) this.o(k, "T", `width="100%" height="460px"`);
    this.o(k, "P", `width="100%" height="480px" padding="28px 24px 28px 24px"`);
    return k;
  }
  // Fußzeile in Bildkarte: Titel + Etikett rechts
  bildFuss(karte, etikett, titel, hinweis = "BEISPIELBILD") {
    const z = this.frame(karte, "Fuß", `borderStyle="solid" borderColor="${K.P16}" borderTop="1px" layout="stack" stackDirection="horizontal" stackDistribution="start" stackAlignment="end" gap="24px" padding="22px 0px 0px 0px" width="100%" height="auto" zIndex="1"`);
    this.o(z, "P", `stackDirection="vertical" stackAlignment="start" gap="12px"`);
    const sp = this.frame(z, "Angabe", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="10px" width="1fr" height="auto"`);
    this.o(sp, "P", `width="100%"`);
    this.text(sp, etikett, { preset: "Marke", farbe: K.P40, name: "Marke" });
    this.titel(sp, titel, { d: 30, t: 26, p: 22, farbe: K.PAP, tag: "p", max: "560px" });
    if (hinweis) this.text(z, hinweis, { preset: "Marke", farbe: K.P40, breite: 'width="auto"', name: "Bildhinweis" });
    return z;
  }
  // Helle Karte mit Ziffer, Titel, Text
  hell(parent, nr, titel, text, { d = 0, w = "1fr", minH = 280, dunkel = false } = {}) {
    const k = this.frame(parent, dunkel ? "Dunkle Karte" : "Helle Karte", `fill="${dunkel ? K.INK : K.HELL}" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="14px" overflow="clip" padding="28px 28px 32px 28px" radius="18px" width="${w}" height="auto" minHeight="${minH}px"${dunkel ? "" : ` hoverEffect.backgroundColor="${K.HELLH}" hoverEffect.scale="1" hoverEffect.y="-4px" hoverEffect.transition="spring-duration 0.5s 0.2 0s"`} ${ap(d, 40)}`);
    this.o(k, "T", `width="100%" minHeight="null"`);
    this.o(k, "P", `width="100%" minHeight="null" padding="22px 22px 26px 22px"`);
    this.text(k, nr, { preset: "Marke", farbe: K.SIG, name: "Nummer" });
    this.titel(k, titel, { d: 26, t: 24, p: 22, farbe: dunkel ? K.PAP : K.INK, tag: "h3", name: "Titel" });
    this.text(k, text, { preset: "Fließtext", farbe: dunkel ? K.P64 : K.I60, name: "Text" });
    return k;
  }
  hinweis(parent, text, { dunkel = false } = {}) {
    return this.text(parent, text, { preset: "Beschriftung", farbe: dunkel ? K.P40 : K.T40, align: "center", extra: 'maxWidth="620px" textWrapBalance="true"', name: "Hinweis" });
  }
  knopf(parent, variante, text, ziel) {
    return this.node("ComponentInstanceNode", parent, `name="Knopf" component="FGiX6iPcm" $control__variant="${variante}" $control__beschriftung="${q(text)}" $control__ziel="${ziel}" width="auto" height="auto"`);
  }

  // ---- zusammengesetzte Blöcke ----
  seitenkopf({ etikett, geist, marke, h1, lead, bild, alt, bildEtikett, bildTitel, bildHinweis = "BEISPIELBILD", knopfText = "Erstgespräch vereinbaren", knopfZiel = "/kontakt" }) {
    const { i } = this.abschnitt({ name: "01 Auftakt", erster: true });
    this.kopf(i, etikett, geist);
    const r = this.karten(i);
    const dk = this.dunkel(r, { h: 580 });
    const oben = this.frame(dk, "Oben", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="22px" width="100%" height="auto"`);
    this.text(oben, marke, { preset: "Marke", farbe: K.SIG, name: "Marke" });
    this.titel(oben, h1, { d: 50, t: 44, p: 34, tag: "h1" });
    const unten = this.frame(dk, "Unten", `borderStyle="solid" borderColor="${K.P16}" borderTop="1px" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="26px" padding="24px 0px 0px 0px" width="100%" height="auto"`);
    this.text(unten, lead, { preset: "Fließtext", farbe: K.P64, name: "Vorlauf" });
    this.knopf(unten, "Hell", knopfText, knopfZiel);
    const bk = this.bild(r, bild, alt, { h: 580 });
    this.bildFuss(bk, bildEtikett, bildTitel, bildHinweis);
  }
  dreiKarten({ etikett, geist, karten, hinweis, anker = null }) {
    const { i } = this.abschnitt({ name: "02 Leistungen", anker });
    this.kopf(i, etikett, geist);
    const r = this.karten(i, { unten: hinweis ? 32 : 0, gap: 12 });
    this.o(r, "T", `stackDirection="vertical" gap="10px"`);
    karten.forEach((k, n) => this.hell(r, String(n + 1).padStart(2, "0"), k[0], k[1], { d: 0.05 + n * 0.08, minH: 330 }));
    if (hinweis) this.hinweis(i, hinweis);
  }
  ablauf() {
    const { i } = this.abschnitt({ name: "Ablauf", anker: "ablauf" });
    this.kopf(i, "[ SO LÄUFT ES AB ]", "Ablauf");
    const r = this.karten(i, { unten: 32, gap: 12 });
    this.o(r, "T", `stackDirection="vertical" gap="10px"`);
    const schritte = [
      ["01 · 30 MINUTEN", "Erstgespräch", "Wir fragen nach Ihren Zahlen: Wie viele Anfragen kommen heute rein, was ist ein Kunde wert, wo klemmt es. Danach wissen Sie, ob sich das für Sie rechnet — auch wenn die Antwort nein ist."],
      ["02 · WOCHE 1", "Aufnahme", "Ein halber Tag bei Ihnen vor Ort: Fotos, Video, Gespräch mit dem Team. Parallel sammeln wir alles, was an Texten, Preisen und Leistungen schon existiert."],
      ["03 · WOCHE 2 BIS 4", "Bau", "Die Seite entsteht. Sie sehen den Zwischenstand unter einem Testlink und geben Rückmeldung, bevor etwas live geht. Tracking richten wir direkt mit ein."],
      ["04 · AB WOCHE 5", "Schalten und messen", "Die Anzeigen laufen an. Jeden Monat ein kurzer Bericht in Klartext und ein Telefonat: hochfahren, halten oder umbauen."],
    ];
    schritte.forEach((s, n) => this.hell(r, s[0], s[1], s[2], { d: 0.05 + n * 0.08, dunkel: n === 0, minH: 420 }));
    this.hinweis(i, "Vom ersten Telefonat bis zur fertigen Seite vergehen in der Regel vier bis fünf Wochen. Das Tempo hängt vor allem daran, wie schnell Rückmeldungen kommen.");
  }
  fragen({ titel = "Das, was vorher [[geklärt]] wird.", liste }) {
    const { i } = this.abschnitt({ name: "Fragen", anker: "fragen" });
    this.kopf(i, "[ KLARHEIT VOR DEM ERSTGESPRÄCH ]", "Fragen");
    const r = this.karten(i);
    const dk = this.dunkel(r, { h: 100 + liste.length * 88, name: "Kopf" });
    this.titel(dk, titel, { d: 44, t: 40, p: 32 });
    const kf = this.frame(dk, "Kontakt", `borderStyle="solid" borderColor="${K.P16}" borderTop="1px" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="0px" padding="22px 0px 0px 0px" width="100%" height="auto"`);
    this.text(kf, "Etwas nicht dabei? Rufen Sie an — 0176 63307587.", { preset: "Fließtext", farbe: K.P64, name: "Hinweis" });
    const wk = this.frame(r, "Fragenkarte", `fill="${K.PR}" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="20px" overflow="clip" padding="36px 40px 12px 40px" radius="18px" width="1.9fr" height="auto" ${ap(0.15)}`);
    this.o(wk, "T", `width="100%"`);
    this.o(wk, "P", `width="100%" padding="28px 24px 8px 24px"`);
    this.text(wk, `[ ${["NULL","EINE","ZWEI","DREI","VIER","FÜNF","SECHS"][liste.length] || liste.length} FRAGEN, DIE OFT KOMMEN ]`, { preset: "Marke", farbe: K.T40, name: "Marke" });
    const l = this.frame(wk, "Liste", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="0px" width="100%" height="auto"`);
    liste.forEach(([f, a]) => this.node("ComponentInstanceNode", l, `name="Frage" component="bgFb2_wyj" $control__variant="Zu" $control__frage="${q(f)}" $control__antwort="${q(a)}" width="100%" height="auto"`));
  }

  async commit(label = "") {
    const pagePath = this.seite.pfad;
    const r = await framer.agent.applyChanges(this.cmds.join("\n"), { pagePath });
    const err = { ...(r.errors || {}), ...(r.parseErrors || {}) };
    const ren = r.renamedIds || {};
    const map = (x) => ren[x] || x;
    const ovs = this.ov.map(([id, bp, a]) => `SET ${bp === "T" ? this.seite.T : this.seite.P}${map(id)} ${a};`);
    let r2 = null;
    if (ovs.length) r2 = await framer.agent.applyChanges(ovs.join("\n"), { pagePath });
    const err2 = r2 ? { ...(r2.errors || {}), ...(r2.parseErrors || {}) } : {};
    this.cmds = []; this.ov = [];
    return { label, fehler: err, fehlerOv: err2, anzahl: Object.keys(ren).length, ren };
  }
}

// Überschreibungen der Startseite auf ein Duplikat übertragen
async function uebertrage(quelleId, ren, praefix, zielSeite) {
  const neuWurzel = ren[praefix];
  const src = await framer.agent.serialize({ id: quelleId, depth: 30 }, { pagePath: "/" });
  const ids = [];
  const w = (n) => { if (n.id && !String(n.id).startsWith("v:")) ids.push(n.id); (n.children || []).forEach(w); };
  w(src);
  const neu = (alt) => (alt === quelleId ? neuWurzel : ren[praefix + alt]);
  const out = [];
  const skip = new Set(["$control__logos", "$control__arbeiten", "$control__felder"]);
  for (const [bpSrc, bpDst] of [["Np0vhDBkT", zielSeite.T], ["DwpOhPzme", zielSeite.P]]) {
    const d = await framer.agent.serializeNodes({ ids, depth: 0 }, { pagePath: "/" });
    const r = await framer.agent.serializeNodes({ ids: ids.map((i) => bpSrc + i), depth: 0 }, { pagePath: "/" });
    d.forEach((dn, k) => {
      const rn = r[k];
      if (!rn) return;
      const nid = neu(dn.id);
      if (!nid) return;
      const diffs = [];
      for (const [key, val] of Object.entries(rn.attributes || {})) {
        if (skip.has(key) || key.startsWith("$") && !key.startsWith("$control__")) continue;
        const dv = (dn.attributes || {})[key];
        if (JSON.stringify(dv) === JSON.stringify(val)) continue;
        if (typeof val === "object" && val !== null) continue;
        diffs.push(`${key}="${q(val)}"`);
      }
      if (diffs.length) out.push(`SET ${bpDst}${nid} ${diffs.join(" ")};`);
    });
  }
  if (!out.length) return { n: 0 };
  const res = await framer.agent.applyChanges(out.join("\n"), { pagePath: zielSeite.pfad });
  return { n: out.length, fehler: { ...(res.errors || {}), ...(res.parseErrors || {}) } };
}

// Duplikat eines Startseiten-Abschnitts ans Ende einer Seite hängen, inkl. Breakpoint-Werten
async function dupliziere(quelleId, seite, parent) {
  const praefix = "dp" + Math.random().toString(36).slice(2, 7);
  const r = await framer.agent.applyChanges(`DUPE ${quelleId} newId="${praefix}" parent="${parent || seite.D}";`, { pagePath: seite.pfad });
  const ren = r.renamedIds || {};
  const u = await uebertrage(quelleId, ren, praefix, seite);
  return { id: ren[praefix], ren, praefix, fehler: { ...(r.errors || {}) }, uebertragen: u };
}
// Breakpoints einer leeren Seite anlegen
async function breakpoints(seite) {
  const r = await framer.agent.applyChanges(`CREATE_VARIANT bpT${seite.D} from="${seite.D}"; SET bpT${seite.D} name="Tablet" width="810px" left="1300px" top="0px"; CREATE_VARIANT bpP${seite.D} from="${seite.D}"; SET bpP${seite.D} name="Phone" width="390px" left="2210px" top="0px";`, { pagePath: seite.pfad });
  seite.T = r.renamedIds["bpT" + seite.D];
  seite.P = r.renamedIds["bpP" + seite.D];
  return { seite, fehler: r.errors };
}

globalThis.Bau = Bau; globalThis.K = K; globalThis.uebertrage = uebertrage; globalThis.dupliziere = dupliziere; globalThis.breakpoints = breakpoints; globalThis.q = q; globalThis.ap = ap; globalThis.GEIST_HELL = GEIST_HELL;

// ================= Branchen-Bausteine =================
const BILDU = (id, w = 1600) => `https://images.unsplash.com/${id}?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=${w}`;
Bau.prototype.brot = function (parent, teile) {
  const id = this.node("RichTextNode", parent, `name="Brotkrumen" width="1fr" height="auto" textStylePreset="Marke" textColor="${K.T40}" textAlignment="center"`);
  const blk = this.id();
  this.cmds.push(`+TextBlock ${blk} tag="p" parent="${id}";`);
  teile.forEach(([t, href], i) => {
    if (i > 0) this.cmds.push(`+TextRun ${this.id()} parent="${blk}" text="  /  ";`);
    this.cmds.push(`+TextRun ${this.id()} parent="${blk}" text="${q(t)}"${href ? ` link.href="${href}"` : ` textColor="${K.INK}"`};`);
  });
  const sp = this.frame(parent, "Abstand", `width="100%" height="18px"`);
  return id;
};
Bau.prototype.seitenkopfB = function (o) {
  const { i } = this.abschnitt({ name: "01 Auftakt", erster: true });
  if (o.brot) this.brot(i, o.brot);
  this.kopf(i, o.etikett, o.geist);
  const r = this.karten(i);
  const dk = this.dunkel(r, { h: 600 });
  const oben = this.frame(dk, "Oben", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="22px" width="100%" height="auto"`);
  this.text(oben, o.marke, { preset: "Marke", farbe: K.SIG, name: "Marke" });
  this.titel(oben, o.h1, { d: 46, t: 42, p: 32, tag: "h1" });
  const unten = this.frame(dk, "Unten", `borderStyle="solid" borderColor="${K.P16}" borderTop="1px" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="26px" padding="24px 0px 0px 0px" width="100%" height="auto"`);
  this.text(unten, o.lead, { preset: "Fließtext", farbe: K.P64, name: "Vorlauf" });
  this.knopf(unten, "Hell", o.knopfText || "Erstgespräch vereinbaren", "/kontakt");
  const bk = this.bild(r, o.bild, o.alt, { h: 600 });
  this.bildFuss(bk, o.bildEtikett, o.bildTitel, o.bildHinweis === undefined ? "BEISPIELBILD" : o.bildHinweis);
};
Bau.prototype.antwort = function (o) {
  const { i } = this.abschnitt({ name: "Kurz gesagt", anker: "ueberblick" });
  this.kopf(i, "[ KURZ GESAGT ]", "Überblick");
  const r = this.karten(i);
  const dk = this.dunkel(r, { h: 520, name: "Frage" });
  this.text(dk, "[ DIE KURZE ANTWORT ]", { preset: "Marke", farbe: K.P40, name: "Marke" });
  this.titel(dk, o.frage, { d: 40, t: 36, p: 28, tag: "h2" });
  const wk = this.frame(r, "Antwort", `fill="${K.PR}" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="18px" overflow="clip" padding="40px 44px 40px 44px" radius="18px" width="1.7fr" height="auto" minHeight="520px" ${ap(0.15)}`);
  this.o(wk, "T", `width="100%" minHeight="null"`);
  this.o(wk, "P", `width="100%" minHeight="null" padding="28px 22px 28px 22px"`);
  o.absaetze.forEach((a) => this.text(wk, a, { preset: "Fließtext", farbe: K.INK, name: "Absatz" }));
  const liste = this.frame(wk, "Fakten", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="0px" padding="8px 0px 0px 0px" width="100%" height="auto"`);
  o.fakten.forEach(([l, w]) => {
    const z = this.frame(liste, l, `borderStyle="solid" borderColor="${K.I16}" borderTop="1px" layout="stack" stackDirection="horizontal" stackDistribution="start" stackAlignment="start" gap="20px" padding="14px 0px 14px 0px" width="100%" height="auto"`);
    this.o(z, "P", `stackDirection="vertical" gap="6px"`);
    const lt = this.text(z, l.toUpperCase(), { preset: "Marke", farbe: K.T40, breite: 'width="190px"', name: "Etikett" });
    this.o(lt, "P", `width="1fr"`);
    this.text(z, w, { preset: "Beschriftung", farbe: K.INK, name: "Wert" });
  });
};
Bau.prototype.dreiKartenL = function ({ etikett, geist, karten, hinweis }) {
  const { i } = this.abschnitt({ name: geist });
  this.kopf(i, etikett, geist);
  const r = this.karten(i, { unten: hinweis ? 32 : 0, gap: 12 });
  this.o(r, "T", `stackDirection="vertical" gap="10px"`);
  karten.forEach((k, n) => {
    const c = this.hell(r, String(n + 1).padStart(2, "0"), k[0], k[1], { d: 0.05 + n * 0.08, minH: 330 });
    if (k[2]) {
      this.raw(`SET ${c} link.href="${k[2]}";`);
      this.text(c, "Mehr dazu  →", { preset: "Marke", farbe: K.INK, name: "Weiter" });
    }
  });
  if (hinweis) this.hinweis(i, hinweis);
};
Bau.prototype.beispiel = function (daten, comp) {
  const { i } = this.abschnitt({ name: "Beispielkampagne", dunkel: true, anker: "beispiel" });
  this.kopf(i, "[ BEISPIELKAMPAGNE · BEISPIELWERTE ]", "Kampagne", { dunkel: true });
  const inst = this.node("ComponentInstanceNode", i, `name="Branchenbeispiel" component="${comp}" $control__daten="${q(JSON.stringify(daten))}" width="100%" height="auto" zIndex="1"`);
  this.frame(i, "Abstand", `width="100%" height="28px"`);
  this.hinweis(i, "Beispielfirma und Beispielwerte zur Veranschaulichung — so sieht eine Kampagne aus, wie wir sie aufsetzen und auswerten.", { dunkel: true });
};
Bau.prototype.referenzen = function (liste) {
  const { i } = this.abschnitt({ name: "Referenzen", anker: "referenzen" });
  this.kopf(i, "[ AUS DER BRANCHE ]", "Referenzen");
  const r = this.karten(i, { unten: 32 });
  const k = this.frame(r, "Liste", `fill="${K.PR}" layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="0px" overflow="clip" padding="12px 12px 12px 12px" radius="18px" width="100%" height="auto" ${ap(0.05)}`);
  liste.forEach(([br, ti, ort, url], n) => {
    const z = this.frame(k, ti, `link.href="${url}" link.openInNewTab="true" borderStyle="solid" borderColor="${K.I16}" ${n > 0 ? 'borderTop="1px"' : 'border="null"'} layout="stack" stackDirection="horizontal" stackDistribution="start" stackAlignment="center" gap="24px" padding="24px 20px 24px 20px" radius="12px" width="100%" height="auto" hoverEffect.backgroundColor="${K.HELL}" hoverEffect.transition="spring-duration 0.45s 0.2 0s"`);
    this.o(z, "P", `stackDirection="vertical" stackAlignment="start" gap="8px" padding="18px 14px 18px 14px"`);
    const b1 = this.text(z, br, { preset: "Marke", farbe: K.T40, breite: 'width="220px"', name: "Branche" });
    this.o(b1, "P", `width="1fr"`);
    this.titel(z, ti, { d: 28, t: 26, p: 23, farbe: K.INK, tag: "h3" });
    this.text(z, ort, { preset: "Beschriftung", farbe: K.I60, breite: 'width="auto"', name: "Ort" });
  });
  this.hinweis(i, "Echte Arbeiten von Fokuswerk. Entwürfe sind freigegebene Seiten auf Testadressen.");
};
Bau.prototype.weitere = function (liste) {
  const { i } = this.abschnitt({ name: "Weitere Branchen" });
  this.kopf(i, "[ WEITERE BRANCHEN ]", "Branchen");
  const r = this.karten(i, { gap: 12 });
  this.o(r, "T", `stackDirection="vertical" gap="10px"`);
  liste.forEach(([ti, text, href], n) => {
    const c = this.frame(r, ti, `link.href="${href}" fill="${K.HELL}" layout="stack" stackDirection="vertical" stackDistribution="space-between" stackAlignment="start" overflow="clip" padding="26px 26px 26px 26px" radius="18px" width="1fr" height="220px" hoverEffect.backgroundColor="${K.HELLH}" hoverEffect.scale="1" hoverEffect.y="-4px" hoverEffect.transition="spring-duration 0.5s 0.2 0s" ${ap(0.05 + n * 0.06, 30)}`);
    this.o(c, "T", `width="100%" height="auto" stackDistribution="start" gap="18px"`);
    this.o(c, "P", `width="100%" height="auto" stackDistribution="start" gap="16px" padding="22px 22px 22px 22px"`);
    const o = this.frame(c, "Oben", `layout="stack" stackDirection="vertical" stackDistribution="start" stackAlignment="start" gap="10px" width="100%" height="auto"`);
    this.titel(o, ti, { d: 24, t: 22, p: 22, farbe: K.INK, tag: "h3" });
    this.text(o, text, { preset: "Beschriftung", farbe: K.I60, name: "Text" });
    this.text(c, "Zur Branchenseite  →", { preset: "Marke", farbe: K.INK, name: "Weiter" });
  });
};
Bau.prototype.schema = function (comp, graph) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  this.node("ComponentInstanceNode", this.seite.D, `name="Strukturdaten Seite" component="${comp}" $control__json="${q(json)}" position="absolute" left="0px" top="0px" width="1px" height="1px"`);
};
globalThis.BILDU = BILDU;
