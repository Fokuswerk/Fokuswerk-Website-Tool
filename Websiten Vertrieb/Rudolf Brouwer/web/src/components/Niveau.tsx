/**
 * Die Niveaulinie — links das Label, rechts die Kennziffer.
 * Eine Maßlinie, wie sie in einer technischen Zeichnung steht.
 */
export default function Niveau({
  marke,
  ziffer,
  akzent = false,
}: {
  marke: string;
  ziffer?: string;
  akzent?: boolean;
}) {
  return (
    <div className="niveau">
      <p className={akzent ? "marke marke-akzent" : "marke"}>{marke}</p>
      {ziffer ? <span className="kennziffer" aria-hidden="true">{ziffer}</span> : null}
    </div>
  );
}
