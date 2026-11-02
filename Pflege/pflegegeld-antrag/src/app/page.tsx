import type { Metadata } from "next";
import Start from "./Start";
import { tageBisStichtag } from "@/lib/recht";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pflegegrad berechnen – nach heutigem Recht und nach den Grenzen ab 2027",
  description:
    "Für einen Antrag zählt das Recht vom Tag der Antragstellung. Rechnen Sie in 90 Sekunden aus, ob der Stichtag 31. Dezember für Ihren Fall eine Stufe ausmacht.",
};

export default function Seite() {
  return <Start tage={tageBisStichtag()} />;
}
