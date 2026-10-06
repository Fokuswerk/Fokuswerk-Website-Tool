// Ratgeber-Import: liest /tmp/fw_ratgeber_import.json (aus Ratgeber/_import.py), legt neue Artikel an,
// aktualisiert vorhandene (per Slug) und setzt die Reihenfolge. Aufruf per eval in framer exec.
async function ratgeberImport() {
  const fs = require('fs');
  const daten = JSON.parse(fs.readFileSync('/tmp/fw_ratgeber_import.json', 'utf8'));
  const col = (await framer.getCollections()).find(c => c.name === "Ratgeber");
  const F = { titel:"js1FOag_P", kategorie:"qvaVaRs9j", beschreibung:"tbFfnLx7h", kurzantwort:"f6GwSRtAj", inhalt:"HrIPkp2By", autor:"cXeL5Mq0t", datum:"MSG7auKdf", lesezeit:"rVznymT40", seo:"xC5AzHuI4", json:"jzUJePvnO" };
  const vorhanden = Object.fromEntries((await col.getItems()).map(i => [i.slug, i.id]));
  const item = (a) => ({ ...(vorhanden[a.slug] ? { id: vorhanden[a.slug] } : {}), slug: a.slug, fieldData: {
    [F.titel]: { type:"string", value:a.titel }, [F.kategorie]: { type:"string", value:a.kategorie },
    [F.beschreibung]: { type:"string", value:a.beschreibung }, [F.kurzantwort]: { type:"string", value:a.kurzantwort },
    [F.inhalt]: { type:"formattedText", value:a.inhalt, contentType:"markdown" }, [F.autor]: { type:"string", value:a.autor },
    [F.datum]: { type:"date", value:a.datum }, [F.lesezeit]: { type:"string", value:a.lesezeit },
    [F.seo]: { type:"string", value:a.seo }, [F.json]: { type:"string", value:a.json } } });
  await col.addItems(daten.map(item));
  const items = await col.getItems();
  const byslug = Object.fromEntries(items.map(i => [i.slug, i.id]));
  await col.setItemOrder(daten.map(d => byslug[d.slug]).filter(Boolean));
  const neu = daten.filter(d => !vorhanden[d.slug]).map(d => d.slug);
  return { gesamt: items.length, neu, aktualisiert: daten.length - neu.length };
}
globalThis.ratgeberImport = ratgeberImport;
