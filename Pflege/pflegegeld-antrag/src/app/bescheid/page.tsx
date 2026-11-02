import type { Metadata } from "next";
import Inhalt from "./Inhalt";

export const metadata: Metadata = {
  title: "Bescheid prüfen – Pflegegeld-Antrag",
  description: "Die Punkte aus Ihrem Gutachten eintragen und sehen, in welchem Modul die größte Abweichung liegt.",
};

export default function Seite() {
  return <Inhalt />;
}
