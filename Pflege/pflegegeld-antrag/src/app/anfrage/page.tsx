import type { Metadata } from "next";
import Inhalt from "./Inhalt";

export const metadata: Metadata = {
  title: "Anfrage an Anbieter – Pflegegeld-Antrag",
  description: "Unverbindlich zwei bis drei Angebote aus Ihrer Region anfordern.",
};

export default function Seite() {
  return <Inhalt />;
}
