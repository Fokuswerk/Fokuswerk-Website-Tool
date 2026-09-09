import Titelbereich from '@/components/abschnitte/Titelbereich';
import Beweisband from '@/components/abschnitte/Beweisband';
import Handwerk from '@/components/abschnitte/Handwerk';
import Rechner from '@/components/abschnitte/Rechner';
import Fallstudie from '@/components/abschnitte/Fallstudie';
import Abschluss from '@/components/abschnitte/Abschluss';

export default function Startseite() {
  return (
    <>
      <Titelbereich />
      <Beweisband />
      <Handwerk />
      <Rechner />
      <Fallstudie />
      <Abschluss />
    </>
  );
}
