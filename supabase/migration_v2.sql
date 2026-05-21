-- Run this in Supabase SQL Editor to upgrade existing installations

alter table sites add column if not exists meta_title text;
alter table sites add column if not exists meta_description text;
alter table sites add column if not exists logo_url text;
alter table sites add column if not exists whatsapp text;
alter table sites add column if not exists ai_content jsonb;

-- Global settings table (for legal templates etc.)
create table if not exists settings (
  key  text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

insert into settings (key, value) values
('impressum_template', E'# Impressum\n\nAngaben gemäß § 5 TMG:\n\n**{company_name}**\n{address}\n\nVertreten durch: {contact_person}\n\nKontakt:\nTelefon: {phone}\nE-Mail: {email}\n\n## Haftungsausschluss\n\nDie Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.\n\n## Urheberrecht\n\nDie durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.'),
('datenschutz_template', E'# Datenschutzerklärung\n\n## 1. Datenschutz auf einen Blick\n\n**Verantwortlicher:**\n{company_name}, {address}\nKontakt: {email}, {phone}\n\n## 2. Welche Daten wir erheben\n\nWenn Sie unsere Website besuchen, erfassen wir automatisch technische Daten (IP-Adresse, Browsertyp, Betriebssystem, Referrer-URL). Diese Daten werden nur zur technischen Bereitstellung der Website verwendet und nicht mit personenbezogenen Daten verknüpft.\n\nBei der Nutzung unseres Kontaktformulars erheben wir:\n- Name\n- E-Mail-Adresse\n- Ihre Nachricht\n\nDiese Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet.\n\n## 3. Ihre Rechte\n\nSie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten sowie das Recht auf Datenübertragbarkeit. Wenden Sie sich dazu an: {email}\n\n## 4. Cookies\n\nUnsere Website verwendet keine Tracking-Cookies. Es werden nur technisch notwendige Cookies gesetzt.\n\n## 5. Kontakt\n\nBei Fragen zum Datenschutz: {email}'),
('agb_template', E'# Allgemeine Geschäftsbedingungen\n\n**{company_name}**\n{address}\n\n## § 1 Geltungsbereich\n\nDiese Allgemeinen Geschäftsbedingungen gelten für alle Geschäftsbeziehungen zwischen {company_name} und unseren Kunden.\n\n## § 2 Vertragsschluss\n\nDie Darstellung unserer Leistungen stellt kein rechtlich bindendes Angebot dar. Durch Ihre Anfrage geben Sie ein verbindliches Angebot ab. Die Annahme erfolgt durch unsere ausdrückliche Auftragsbestätigung.\n\n## § 3 Preise und Zahlung\n\nAlle angegebenen Preise verstehen sich inkl. der gesetzlichen Mehrwertsteuer. Die Zahlungsbedingungen werden im Einzelauftrag vereinbart.\n\n## § 4 Gewährleistung\n\nEs gelten die gesetzlichen Gewährleistungsrechte.\n\n## § 5 Haftungsbeschränkung\n\nWir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit. Im Übrigen ist unsere Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.\n\n## § 6 Schlussbestimmungen\n\nEs gilt deutsches Recht. Gerichtsstand ist, soweit gesetzlich zulässig, unser Sitz.')
on conflict (key) do nothing;
