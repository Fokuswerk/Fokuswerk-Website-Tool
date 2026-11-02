import type { Metadata } from "next";
import Inhalt from "./Inhalt";

export const metadata: Metadata = {
  title: "Wo stehen Sie? – Pflegegeld-Antrag",
  description:
    "Der Weg vom Antrag bis zum Bescheid, mit der Stelle, an der Sie gerade stehen, und dem einen nächsten Schritt.",
};

export default function Seite() {
  return (
    <main className="band">
      <div className="huelle-schmal">
        <Inhalt />
      </div>
    </main>
  );
}
