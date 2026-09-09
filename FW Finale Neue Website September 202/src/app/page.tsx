import Titelbereich from '@/components/abschnitte/Titelbereich';
import Beweisband from '@/components/abschnitte/Beweisband';
import Produktion from '@/components/abschnitte/Produktion';
import Leistungen from '@/components/abschnitte/Leistungen';
import Vorgehen from '@/components/abschnitte/Vorgehen';
import ZwischenCta from '@/components/abschnitte/ZwischenCta';
import Warum from '@/components/abschnitte/Warum';
import Fallstudie from '@/components/abschnitte/Fallstudie';
import Rechner from '@/components/abschnitte/Rechner';
import Abschluss from '@/components/abschnitte/Abschluss';

export default function Startseite() {
  return (
    <>
      <Titelbereich />
      <Beweisband />
      <Produktion />
      <Leistungen />
      <Vorgehen />
      <ZwischenCta />
      <Warum />
      <Fallstudie />
      <Rechner />
      <Abschluss />
    </>
  );
}
