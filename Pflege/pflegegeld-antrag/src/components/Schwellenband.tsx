const ZEILEN = [
  { grad: 1, alt: "12,5", neu: "15", mehr: "+2,5" },
  { grad: 2, alt: "27", neu: "30", mehr: "+3" },
  { grad: 3, alt: "47,5", neu: "50", mehr: "+2,5" },
  { grad: 4, alt: "70", neu: "70", mehr: null },
  { grad: 5, alt: "90", neu: "90", mehr: null },
];

/** Ab wie vielen Punkten ein Pflegegrad beginnt – heute und ab 2027. */
export default function Schwellenband() {
  return (
    <figure className="schwellen">
      <div className="tabelle-huelle">
        <table className="daten">
          <thead>
            <tr>
              <th>Pflegegrad</th>
              <th>heute ab</th>
              <th>ab 2027 ab</th>
              <th>Unterschied</th>
            </tr>
          </thead>
          <tbody>
            {ZEILEN.map((z) => (
              <tr key={z.grad} className={z.mehr ? "geaendert" : undefined}>
                <td><strong>Pflegegrad {z.grad}</strong></td>
                <td className="zahl">{z.alt}</td>
                <td className="zahl">{z.neu}</td>
                <td className={`zahl ${z.mehr ? "minus" : ""}`}>
                  {z.mehr ? `${z.mehr} Punkte` : "unverändert"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="schwellen-fuss">
        <span className="schwellen-punkt" aria-hidden="true" />
        Für die Pflegegrade 1 bis 3 braucht derselbe Mensch ab Januar mehr Punkte. Die Stufen 4
        und 5 bleiben, wo sie sind.
      </figcaption>
    </figure>
  );
}
