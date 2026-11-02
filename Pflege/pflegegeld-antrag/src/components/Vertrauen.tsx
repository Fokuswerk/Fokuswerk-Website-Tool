import { Schloss, Paragraf, Siegel, Uhr } from "./Icon";

const PUNKTE = [
  {
    icon: <Paragraf size={18} />,
    titel: "Amtliche Grundlage",
    text: "Alle Kriterien und Punktwerte aus Anlage 1 und 2 zu § 15 SGB XI.",
  },
  {
    icon: <Schloss size={18} />,
    titel: "Daten bleiben bei Ihnen",
    text: "Gerechnet wird im Browser. Angaben zur Gesundheit werden nicht übertragen.",
  },
  {
    icon: <Siegel size={18} />,
    titel: "Quellen offen",
    text: "Jede Zahl ist belegt und verlinkt, auch der Regierungsentwurf im Original.",
  },
  {
    icon: <Uhr size={18} />,
    titel: "Ohne Anmeldung",
    text: "Keine Registrierung, keine Cookies, kein Konto. Sieben Fragen genügen.",
  },
];

export default function Vertrauen() {
  return (
    <ul className="vertrauen">
      {PUNKTE.map((p) => (
        <li key={p.titel}>
          <span className="vertrauen-icon">{p.icon}</span>
          <span>
            <strong>{p.titel}</strong>
            <span className="vertrauen-text">{p.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
