import type { Site } from "./types";

/** Replace {placeholder} tokens with real site data */
export function renderTemplate(template: string, site: Site): string {
  return template
    .replace(/\{company_name\}/g, site.company_name || "")
    .replace(/\{address\}/g, site.address || "")
    .replace(/\{contact_person\}/g, site.contact_person || site.company_name || "")
    .replace(/\{phone\}/g, site.phone || "")
    .replace(/\{email\}/g, site.email || "")
    .replace(/\{industry\}/g, site.industry || "")
    .replace(/\{year\}/g, new Date().getFullYear().toString());
}

/** Convert basic markdown to HTML for legal text rendering */
export function markdownToHtml(md: string): string {
  return md
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-0">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mb-3 mt-8">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mb-2 mt-6">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="text-gray-600 leading-relaxed mb-4">')
    .replace(/^/, '<p class="text-gray-600 leading-relaxed mb-4">')
    .concat('</p>');
}

export const DEFAULT_IMPRESSUM = `# Impressum

Angaben gemäß § 5 TMG:

**{company_name}**
{address}

Vertreten durch: {contact_person}

## Kontakt

Telefon: {phone}
E-Mail: {email}

## Haftungsausschluss

Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.

## Urheberrecht

Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors.`;

export const DEFAULT_DATENSCHUTZ = `# Datenschutzerklärung

## 1. Datenschutz auf einen Blick

**Verantwortlicher:**
{company_name}
{address}
E-Mail: {email}
Telefon: {phone}

## 2. Datenerfassung auf dieser Website

**Server-Log-Dateien:** Der Provider dieser Website erhebt und speichert automatisch technische Informationen in Server-Log-Dateien (IP-Adresse, Browsertyp, Betriebssystem, Referrer-URL). Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.

**Kontaktformular:** Wenn Sie uns per Formular Anfragen zukommen lassen, werden Ihre Angaben inklusive der von Ihnen angegebenen Kontaktdaten zum Zweck der Bearbeitung der Anfrage gespeichert. Diese Daten geben wir nicht weiter.

## 3. Ihre Rechte

Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wenden Sie sich dazu an: {email}

## 4. Cookies

Unsere Website verwendet keine Tracking-Cookies. Es werden ausschließlich technisch notwendige Cookies gesetzt.

## 5. SSL-Verschlüsselung

Diese Website nutzt aus Sicherheitsgründen eine SSL-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an „https://" in der Adresszeile Ihres Browsers.`;

export const DEFAULT_AGB = `# Allgemeine Geschäftsbedingungen

**{company_name}**
{address}

## § 1 Geltungsbereich

Diese Allgemeinen Geschäftsbedingungen gelten für alle Geschäftsbeziehungen zwischen {company_name} und unseren Kunden in ihrer zum Zeitpunkt der Bestellung gültigen Fassung.

## § 2 Vertragsschluss

Die Darstellung unserer Leistungen auf der Website stellt kein rechtlich bindendes Angebot dar. Durch Ihre Anfrage geben Sie ein verbindliches Angebot ab. Die Annahme erfolgt durch unsere ausdrückliche schriftliche oder mündliche Auftragsbestätigung.

## § 3 Preise und Zahlung

Alle angegebenen Preise verstehen sich inkl. der gesetzlichen Mehrwertsteuer. Die konkreten Preise und Zahlungsbedingungen werden im Einzelauftrag vereinbart.

## § 4 Leistungserbringung

Wir erbringen unsere Leistungen mit der gebotenen Sorgfalt. Termine und Fristen werden nach Möglichkeit eingehalten. Bei unvorhergesehenen Verzögerungen informieren wir Sie unverzüglich.

## § 5 Gewährleistung

Es gelten die gesetzlichen Gewährleistungsrechte. Mängel sind uns unverzüglich nach Entdeckung mitzuteilen.

## § 6 Haftungsbeschränkung

Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei schuldhafter Verletzung von Leben, Körper und Gesundheit. Im Übrigen ist unsere Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.

## § 7 Datenschutz

Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung und den geltenden gesetzlichen Bestimmungen.

## § 8 Schlussbestimmungen

Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist, soweit gesetzlich zulässig, unser Geschäftssitz. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.`;
