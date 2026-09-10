import Titelbereich from '@/components/abschnitte/Titelbereich';
import Belege from '@/components/abschnitte/Belege';
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
      <Belege />
      <Leistungen />
      <Vorgehen />
      <ZwischenCta />
      <Produktion />
      <Warum />
      <Fallstudie />
      <Rechner />
      <Abschluss />
    </>
  );
}
