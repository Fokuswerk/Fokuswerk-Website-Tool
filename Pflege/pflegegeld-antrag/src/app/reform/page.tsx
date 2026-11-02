import type { Metadata } from "next";
import Inhalt from "./Inhalt";

export const metadata: Metadata = {
  title: "Leistungen vergleichen – Pflegegeld-Antrag",
  description: "Was Ihr Haushalt heute bekommt und was nach dem Regierungsentwurf ab Januar 2027 bleibt – in Euro im Monat.",
};

export default function Seite() {
  return <Inhalt />;
}
