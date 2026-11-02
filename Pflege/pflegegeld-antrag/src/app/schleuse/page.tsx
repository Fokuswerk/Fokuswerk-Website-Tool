import type { Metadata } from "next";
import Inhalt from "./Inhalt";

export const metadata: Metadata = {
  title: "Noch nicht öffentlich – Pflegegeld-Antrag",
  robots: { index: false, follow: false },
};

export default async function Seite({
  searchParams,
}: {
  searchParams: Promise<{ weiter?: string }>;
}) {
  const { weiter } = await searchParams;
  // Nur seiteninterne Ziele zulassen. Ohne diese Prüfung liesse sich die
  // Schleuse als Weiterleitung auf eine fremde Adresse missbrauchen.
  const ziel = weiter && /^\/[^/\\]/.test(weiter) ? weiter : "/";

  return (
    <main className="band">
      <div className="huelle-schmal">
        <div className="auge">Noch im Bau</div>
        <h1>Diese Seite ist noch nicht öffentlich</h1>
        <p className="vorspann abstand-s">
          Pflegegeld-Antrag ist fertig gerechnet, aber noch nicht freigegeben. Wenn Sie ein
          Passwort haben, kommen Sie hier hinein.
        </p>
        <div className="abstand-m">
          <Inhalt weiter={ziel} />
        </div>
      </div>
    </main>
  );
}
