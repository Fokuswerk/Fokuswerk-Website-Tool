import Link from "next/link";
import { auswertungLesen, datenbankVorhanden } from "@/lib/speicher";
import { angemeldet, passwortGesetzt } from "@/lib/zugang";
import Anmeldung from "./Anmeldung";
import Abmelden from "./Abmelden";
import type { Auswertung } from "@/lib/typen";

export const metadata = { title: "Auswertung – Pflegegeld-Antrag", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const ANLASS_NAMEN: Record<string, string> = {
  startseite: "Startseite, Fristerinnerung",
  "ergebnis-genau": "Nach dem genauen Rechner",
  bescheid: "Bescheidprüfung",
  "mappe-vormerken": "Begutachtungsmappe vorgemerkt",
  "widerspruch-fall": "Widerspruchsfall eingereicht",
  reform: "Leistungsvergleich",
  "anfrage:treppenlift": "Anfrage Treppenlift",
  "anfrage:hausnotruf": "Anfrage Hausnotruf",
  "anfrage:badumbau": "Anfrage Badumbau",
  "anfrage:pflegedienst": "Anfrage Pflegedienst",
  "anfrage:betreuung24": "Anfrage Betreuung",
  "anfrage:alltagsbegleitung": "Anfrage Alltagsbegleitung",
  "anfrage:tagespflege": "Anfrage Tagespflege",
  "anfrage:pflegebett": "Anfrage Pflegebett",
};

function prozent(x: number): string {
  return `${(x * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}
function zahl(x: number): string {
  return x.toLocaleString("de-DE");
}
function datum(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

/** Aus "pflegegradAlt" wird "Pflegegrad alt". */
function befundName(s: string): string {
  const mit = s.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ");
  return mit.charAt(0).toUpperCase() + mit.slice(1).toLowerCase();
}

/** Zahlen mit Komma, so wie sie auf der Seite auch stehen. */
function befundWert(w: string | number | null): string {
  if (w === null) return "–";
  if (typeof w === "number") return w.toLocaleString("de-DE", { maximumFractionDigits: 2 });
  return w;
}

export default async function Admin() {
  const schutz = passwortGesetzt();
  const offen = await angemeldet();

  if (schutz && !offen) {
    return (
      <main className="abschnitt">
        <div className="huelle">
          <Anmeldung />
        </div>
      </main>
    );
  }

  // Ohne gesetztes Passwort werden niemals echte Daten gezeigt.
  const a: Auswertung = schutz ? await auswertungLesen(30) : { ...(await import("@/lib/demodaten")).demoAuswertung(30) };
  const k = a.kennzahlen;
  const maxTag = Math.max(1, ...a.verlauf.map((t) => t.besucher));
  const maxTrichter = Math.max(1, ...a.trichter.map((t) => t.anzahl));
  const maxAnlass = Math.max(1, ...a.anlaesse.map((t) => t.anzahl));

  return (
    <main className="abschnitt">
      <div className="huelle">
        <div className="admin-kopf">
          <div>
            <span className="auge">Auswertung</span>
            <h1 style={{ fontSize: "var(--t-gross)" }}>Letzte 30 Tage</h1>
          </div>
          <div className="admin-werkzeuge">
            <a className="knopf knopf-zweit" href="/api/admin/export">Leads als CSV</a>
            {schutz && <Abmelden />}
          </div>
        </div>

        {a.demo && (
          <div className="hinweis hinweis-gelb abstand-m">
            <div className="hinweis-titel">Demo-Daten</div>
            {!schutz ? (
              <>
                Es ist kein Passwort gesetzt. Solange <code>ADMIN_PASSWORT</code> fehlt, zeigt
                dieser Bereich ausschließlich erfundene Zahlen – damit hier nichts Echtes
                offenstehen kann. Setzen Sie das Passwort und hinterlegen Sie die Datenbank,
                dann erscheinen die echten Werte.
              </>
            ) : !datenbankVorhanden() ? (
              <>
                <strong>Es ist keine Datenbank hinterlegt – eingehende Leads gehen verloren.</strong>{" "}
                Sie werden weder gespeichert noch protokolliert, denn eine E-Mail-Adresse gehört
                nicht ins Server-Log. Legen Sie <code>SUPABASE_URL</code> und{" "}
                <code>SUPABASE_DIENSTSCHLUESSEL</code> an, dann wird hier echt gerechnet. Das
                Schema steht in <code>datenbank/schema.sql</code>.
              </>
            ) : (
              <>Die Datenbank antwortet gerade nicht. Angezeigt werden Ersatzwerte.</>
            )}
          </div>
        )}

        <div className="kennzahlgitter abstand-m">
          <div className="kennzahlkarte">
            <span className="wert">{zahl(k.besucher)}</span>
            <span className="bezeichnung">Besucher</span>
          </div>
          <div className="kennzahlkarte">
            <span className="wert">{zahl(k.seitenaufrufe)}</span>
            <span className="bezeichnung">Seitenaufrufe</span>
          </div>
          <div className="kennzahlkarte">
            <span className="wert">{zahl(k.checksGestartet)}</span>
            <span className="bezeichnung">Checks gestartet · {prozent(k.startquote)}</span>
          </div>
          <div className="kennzahlkarte">
            <span className="wert">{zahl(k.checksBeendet)}</span>
            <span className="bezeichnung">Checks beendet · {prozent(k.abschlussquote)}</span>
          </div>
          <div className="kennzahlkarte heraus">
            <span className="wert">{zahl(k.leads)}</span>
            <span className="bezeichnung">Leads · {prozent(k.leadquote)} der Besucher</span>
          </div>
          <div className="kennzahlkarte">
            <span className="wert">{zahl(k.klicks)}</span>
            <span className="bezeichnung">Klicks auf Anbieter</span>
          </div>
        </div>

        <div className="gitter gitter-2 abstand-l">
          <section>
            <h2 style={{ fontSize: "var(--t-h3)", marginBottom: 6 }}>Besucher je Tag</h2>
            <p className="quelle" style={{ marginBottom: 18 }}>
              Balken: Besucher. Punkt: Leads an diesem Tag.
            </p>
            <div className="verlauf">
              {a.verlauf.map((t) => (
                <div className="verlauf-tag" key={t.tag} title={`${t.tag}: ${t.besucher} Besucher, ${t.leads} Leads`}>
                  <span className="saeule" style={{ height: `${(t.besucher / maxTag) * 100}%` }} />
                  {t.leads > 0 && <span className="lead-punkt" aria-hidden="true" />}
                </div>
              ))}
            </div>
            <div className="verlauf-achse">
              <span>{a.verlauf[0]?.tag.slice(8, 10)}.{a.verlauf[0]?.tag.slice(5, 7)}.</span>
              <span>heute</span>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: "var(--t-h3)", marginBottom: 6 }}>Wo der Schnellcheck abbricht</h2>
            <p className="quelle" style={{ marginBottom: 18 }}>
              Wie viele Sitzungen die jeweilige Frage erreicht haben.
            </p>
            <div className="trichter">
              {a.trichter.map((t, i) => (
                <div className="trichter-zeile" key={t.schritt}>
                  <span className="name">{t.schritt}</span>
                  <span className="balken">
                    <span style={{ width: `${(t.anzahl / maxTrichter) * 100}%` }} />
                  </span>
                  <span className="wert">{zahl(t.anzahl)}</span>
                  <span className="schwund">
                    {i === 0 ? "" : `−${zahl(Math.max(0, a.trichter[i - 1].anzahl - t.anzahl))}`}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="abstand-l">
          <h2 style={{ fontSize: "var(--t-h3)", marginBottom: 6 }}>Woher die Leads kommen</h2>
          <p className="quelle" style={{ marginBottom: 18 }}>Nach Anlass, absteigend.</p>
          <div className="trichter">
            {a.anlaesse.map((t) => (
              <div className="trichter-zeile" key={t.anlass}>
                <span className="name">{ANLASS_NAMEN[t.anlass] ?? t.anlass}</span>
                <span className="balken">
                  <span style={{ width: `${(t.anzahl / maxAnlass) * 100}%` }} />
                </span>
                <span className="wert">{zahl(t.anzahl)}</span>
                <span className="schwund" />
              </div>
            ))}
            {a.anlaesse.length === 0 && <p className="text-leise">Noch keine Leads.</p>}
          </div>
        </section>

        <section className="abstand-l">
          <h2 style={{ fontSize: "var(--t-h3)", marginBottom: 6 }}>Eingetragene Personen</h2>
          <p className="quelle" style={{ marginBottom: 18 }}>
            Die neuesten {Math.min(25, a.leads.length)} von {zahl(a.leads.length)}. Im Befund stehen
            nur Kennzahlen aus dem Rechner – Punkte und Pflegegrad. Das ist eine Gesundheitsangabe
            nach Art. 9 DSGVO und steht nur dort, wo die Person ausdrücklich eingewilligt hat.
            „Bestätigt: offen“ heißt: der Double-Opt-in fehlt noch, an diese Adresse darf noch
            nichts verschickt werden. Die vollständige Liste steht im CSV.
          </p>
          <div className="tabelle-huelle">
            <table className="daten">
              <thead>
                <tr>
                  <th>Eingang</th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>E-Mail</th>
                  <th style={{ textAlign: "left" }}>Anlass</th>
                  <th style={{ textAlign: "left" }}>Befund</th>
                  <th style={{ textAlign: "left" }}>Bestätigt</th>
                </tr>
              </thead>
              <tbody>
                {a.leads.slice(0, 25).map((l) => (
                  <tr key={l.id ?? l.zeit + l.mail}>
                    <td className="zahl" style={{ whiteSpace: "nowrap" }}>{datum(l.zeit)}</td>
                    <td style={{ textAlign: "left" }}>{l.name || "—"}</td>
                    <td style={{ textAlign: "left" }}>
                      <a href={`mailto:${l.mail}`}>{l.mail}</a>
                    </td>
                    <td style={{ textAlign: "left" }}>{ANLASS_NAMEN[l.anlass] ?? l.anlass}</td>
                    <td style={{ textAlign: "left" }} className="befund">
                      {Object.entries(l.befund ?? {}).length === 0
                        ? "—"
                        : Object.entries(l.befund)
                            .map(([s, w]) => `${befundName(s)}: ${befundWert(w)}`)
                            .join(" · ")}
                    </td>
                    <td style={{ textAlign: "left" }}>
                      {l.bestaetigt ? "ja" : <span style={{ color: "var(--warn)" }}>offen</span>}
                    </td>
                  </tr>
                ))}
                {a.leads.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "left" }}>Noch niemand eingetragen.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="quelle abstand-m">
          Stand {datum(a.stand)}. <Link href="/">Zurück zur Seite</Link>
        </p>
      </div>
    </main>
  );
}
