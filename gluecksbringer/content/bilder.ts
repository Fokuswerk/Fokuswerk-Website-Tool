/**
 * Zentrale Bildverwaltung.
 *
 * Alle Bilder stammen aus dem bisherigen Webauftritt des Vereins und wurden
 * lediglich in der Größe reduziert und neu komprimiert.
 *
 * Neues Bild ergänzen:
 *   1. Datei nach `assets/bilder/` legen (JPG oder PNG)
 *   2. hier importieren und unter einem sprechenden Schlüssel eintragen
 *   3. in `content/galerie.ts`, `content/aktuelles.ts` o. ä. verwenden
 *
 * Durch den statischen Import kennt Next.js Breite, Höhe und eine unscharfe
 * Vorschau – dadurch springt das Layout beim Laden nicht.
 */

import wunschbaum2025Team from "@/assets/bilder/wunschbaum-2025-team.jpg";
import wunschbaum2025Wunschkarten from "@/assets/bilder/wunschbaum-2025-wunschkarten.jpg";
import wunschbaum2025Vorbereitung from "@/assets/bilder/wunschbaum-2025-vorbereitung.jpg";
import wunschbaum2025Plakat from "@/assets/bilder/wunschbaum-2025-plakat.jpg";
import wunschbaum2025Banner from "@/assets/bilder/wunschbaum-2025-banner.jpg";
import puckPortraet from "@/assets/bilder/puck-portraet.jpg";
import wunschbaumDigital from "@/assets/bilder/wunschbaum-digital.png";
import vereinTeam from "@/assets/bilder/verein-team.jpg";
import geschenkuebergabe2024 from "@/assets/bilder/geschenkuebergabe-2024.jpg";
import meerAbend from "@/assets/bilder/zwischenahner-meer-abend.jpg";
import partnerWeinbar from "@/assets/bilder/partner-weinbar.jpg";
import puck from "@/assets/bilder/puck.png";

import g2011ErsteGeschenke from "@/assets/bilder/2011-erste-geschenke.jpg";
import g2011SoFingAllesAn from "@/assets/bilder/2011-so-fing-alles-an.jpg";
import g2011BaumAufstellen from "@/assets/bilder/2011-erster-wunschbaum-aufstellen.jpg";
import g2011BaumGeschmueckt from "@/assets/bilder/2011-erster-wunschbaum-geschmueckt.jpg";
import g2011Geschenkausgabe from "@/assets/bilder/2011-geschenkausgabe.jpg";
import g2011GrosseFreude from "@/assets/bilder/2011-grosse-freude.jpg";
import g2011VieleGeschenke from "@/assets/bilder/2011-viele-geschenke.jpg";
import g2011Weihnachtslogo from "@/assets/bilder/2011-erstes-weihnachtslogo.jpg";
import g2012RuegenwalderCup from "@/assets/bilder/2012-ruegenwalder-cup.jpg";
import g2012Vereinsmitglieder from "@/assets/bilder/2012-vereinsmitglieder.jpg";
import g2012Geschenke from "@/assets/bilder/2012-wunschbaumgeschenke.jpg";
import g2012Vorsitzende from "@/assets/bilder/2012-vereinsvorsitzende.jpg";
import g2013SchwimmkursUrkunden from "@/assets/bilder/2013-schwimmkurs-urkunden.jpg";
import g2013Schwimmkurs from "@/assets/bilder/2013-schwimmkurs.jpg";
import g2013SchwimmkursStolz from "@/assets/bilder/2013-schwimmkurs-stolz.jpg";
import g2013Wunschbaum from "@/assets/bilder/2013-wunschbaum.jpg";
import g2013WunschbaumKinder from "@/assets/bilder/2013-wunschbaum-kinder.jpg";
import g2014Schwimmkurs from "@/assets/bilder/2014-schwimmkurs.jpg";
import g2014SchwimmkursUrkunde from "@/assets/bilder/2014-schwimmkurs-urkunde.jpg";
import g2014Kuerbisfest1 from "@/assets/bilder/2014-kuerbisfest-1.jpg";
import g2014Kuerbisfest2 from "@/assets/bilder/2014-kuerbisfest-2.jpg";
import g2014Kuerbisfest3 from "@/assets/bilder/2014-kuerbisfest-3.jpg";
import g2015Wunschbaum from "@/assets/bilder/2015-wunschbaum.jpg";
import g2017Geschenke from "@/assets/bilder/2017-geschenke.jpg";

export const bilder = {
  wunschbaum2025Team,
  wunschbaum2025Wunschkarten,
  wunschbaum2025Vorbereitung,
  wunschbaum2025Plakat,
  wunschbaum2025Banner,
  puckPortraet,
  wunschbaumDigital,
  vereinTeam,
  geschenkuebergabe2024,
  meerAbend,
  partnerWeinbar,
  puck,
  g2011ErsteGeschenke,
  g2011SoFingAllesAn,
  g2011BaumAufstellen,
  g2011BaumGeschmueckt,
  g2011Geschenkausgabe,
  g2011GrosseFreude,
  g2011VieleGeschenke,
  g2011Weihnachtslogo,
  g2012RuegenwalderCup,
  g2012Vereinsmitglieder,
  g2012Geschenke,
  g2012Vorsitzende,
  g2013SchwimmkursUrkunden,
  g2013Schwimmkurs,
  g2013SchwimmkursStolz,
  g2013Wunschbaum,
  g2013WunschbaumKinder,
  g2014Schwimmkurs,
  g2014SchwimmkursUrkunde,
  g2014Kuerbisfest1,
  g2014Kuerbisfest2,
  g2014Kuerbisfest3,
  g2015Wunschbaum,
  g2017Geschenke,
};
