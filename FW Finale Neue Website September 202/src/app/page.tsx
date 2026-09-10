import Titelbereich from '@/components/abschnitte/Titelbereich';
import Vertrauen from '@/components/abschnitte/Vertrauen';
import Problem from '@/components/abschnitte/Problem';
import Monat from '@/components/abschnitte/Monat';
import Prinzip from '@/components/abschnitte/Prinzip';
import Einstieg from '@/components/abschnitte/Einstieg';
import Leistungen from '@/components/abschnitte/Leistungen';
import Stufen from '@/components/abschnitte/Stufen';
import Rechnung from '@/components/abschnitte/Rechnung';
import Bericht from '@/components/abschnitte/Bericht';
import Betriebe from '@/components/abschnitte/Betriebe';
import Warum from '@/components/abschnitte/Warum';
import Mitarbeiter from '@/components/abschnitte/Mitarbeiter';
import FuerWen from '@/components/abschnitte/FuerWen';
import Fragen from '@/components/abschnitte/Fragen';
import Schluss from '@/components/abschnitte/Schluss';

/**
 * Startseite — Aufbau 1 zu 1 nach der Gartenzwerg-Präsentation:
 *
 *  Titelbild · Vertrauen · Problem · Der Monat (gepinnt) · Prinzip ·
 *  So beginnt es · Leistungen · Stufen · Rechnung · Auswertung · Betriebe ·
 *  Warum wir · Für Mitarbeiter · Für wen · Fragen · Abschluss
 *
 * Ein einziger Einstieg („Gespräch vereinbaren") wiederholt sich im
 * Titelbild, in der Seitenmitte und im Abschluss.
 */
export default function Startseite() {
  return (
    <>
      <Titelbereich />
      <Vertrauen />
      <Problem />
      <Monat />
      <Prinzip />
      <Einstieg />
      <Leistungen />
      <Stufen />
      <Rechnung />
      <Bericht />
      <Betriebe />
      <Warum />
      <Mitarbeiter />
      <FuerWen />
      <Fragen />
      <Schluss />
    </>
  );
}
