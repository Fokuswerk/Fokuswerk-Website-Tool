import { Sektion, Seitenkopf, Knopf } from "@/components/Bausteine";

export default function NichtGefunden() {
  return (
    <>
      <Seitenkopf
        label="404"
        titel="Diese Seite gibt es nicht."
        text="Vielleicht hat sich die Adresse geändert. Über das Menü finden Sie alles Weitere."
        aktionen={
          <>
            <Knopf href="/">Zur Startseite</Knopf>
            <Knopf href="/kontakt" art="linie-hell">
              Kontakt
            </Knopf>
          </>
        }
      />
      <Sektion>
        <p className="t-text mass text-tief/70">
          Wenn Sie etwas Bestimmtes gesucht haben, rufen Sie gerne an: 04407 8991.
        </p>
      </Sektion>
    </>
  );
}
