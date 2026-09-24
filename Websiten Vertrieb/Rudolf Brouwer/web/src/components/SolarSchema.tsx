/**
 * Wie eine thermische Solaranlage arbeitet — gezeichnet nach der Beschreibung
 * auf der Seite „Solarenergie" von brouwer-gmbh.de. Keine Fremdgrafik,
 * keine Messwerte, nur der Aufbau.
 */
export default function SolarSchema() {
  return (
    <figure className="schema">
      <svg viewBox="0 0 960 440" role="img" aria-labelledby="schema-titel schema-text" className="schema-svg">
        <title id="schema-titel">Aufbau einer thermischen Solaranlage</title>
        <desc id="schema-text">
          Der Sonnenkollektor auf dem Dach erhitzt eine Wärmeträgerflüssigkeit. Sie läuft in den
          Solarspeicher und gibt ihre Wärme über den unteren Wärmetauscher an das Brauchwasser ab.
          Ein zweiter Wärmetauscher im oberen Teil des Speichers ist an den Heizkessel angeschlossen
          und heizt das Brauchwasser im Winter zusätzlich auf. Kaltwasser läuft unten in den
          Speicher, Warmwasser wird oben entnommen.
        </desc>

        {/* 01 Kollektor */}
        <g>
          <path d="M48 92 L198 52 L222 104 L72 144 Z" fill="var(--marine)" opacity="0.12" stroke="var(--marine)" strokeWidth="1.6" />
          <path d="M76 92 L188 62 M84 110 L196 80 M92 128 L204 98" stroke="var(--marine)" strokeWidth="1.4" opacity="0.55" />
          <text x="48" y="178" className="schema-marke">01 Sonnenkollektor</text>
          <text x="48" y="200" className="schema-klein">Flach- oder Vakuum-Röhrenkollektor</text>
        </g>

        {/* Solarkreis: Vorlauf zum Speicher */}
        <path d="M222 104 C 300 104, 322 136, 400 136" fill="none" stroke="var(--marine)" strokeWidth="2.2" strokeLinecap="round" />
        <text x="238" y="90" className="schema-klein">Wärmeträgerflüssigkeit</text>

        {/* Solarkreis: Rücklauf */}
        <path d="M400 282 C 318 282, 268 200, 214 132" fill="none" stroke="var(--marine)" strokeWidth="1.3" strokeDasharray="5 6" strokeLinecap="round" opacity="0.55" />
        <text x="232" y="300" className="schema-klein">Rücklauf</text>

        {/* 02 Speicher */}
        <g>
          <rect x="400" y="60" width="132" height="250" rx="12" fill="var(--marine)" opacity="0.05" />
          <rect x="400" y="60" width="132" height="250" rx="12" fill="none" stroke="currentColor" strokeWidth="1.6" />
          {/* oberer Wärmetauscher: am Kessel */}
          <path d="M424 112 q 21 -14 42 0 q 21 14 42 0 M424 136 q 21 -14 42 0 q 21 14 42 0"
                fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          {/* unterer Wärmetauscher: an der Solaranlage */}
          <path d="M424 236 q 21 -14 42 0 q 21 14 42 0 M424 260 q 21 -14 42 0 q 21 14 42 0"
                fill="none" stroke="var(--marine)" strokeWidth="1.9" />
          <text x="400" y="342" className="schema-marke">02 Solarspeicher</text>
          <text x="400" y="364" className="schema-klein">Zwei Wärmetauscher in einem Kessel</text>
        </g>

        {/* 03 Heizkessel */}
        <g>
          <rect x="716" y="178" width="108" height="132" rx="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="736" y="198" width="68" height="8" rx="4" fill="currentColor" opacity="0.22" />
          <circle cx="770" cy="256" r="21" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
          <text x="716" y="342" className="schema-marke">03 Heizkessel</text>
          <text x="716" y="364" className="schema-klein">heizt im Winter nach</text>
        </g>
        <path d="M716 214 C 650 214, 600 124, 532 124" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />

        {/* Warmwasser oben raus */}
        <path d="M532 86 L628 86 L628 40" fill="none" stroke="var(--marine)" strokeWidth="2.2" strokeLinecap="round" />
        <text x="642" y="44" className="schema-marke">Warmwasser</text>

        {/* Kaltwasser unten rein */}
        <path d="M532 288 L600 288 L600 398" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
        <text x="614" y="402" className="schema-klein">Kaltwasser</text>
      </svg>
      <figcaption className="still schema-fuss">
        Schematisch. Welche Kollektorbauart und welcher Speicher zu Ihrem Dach und Ihrem
        Verbrauch passen, entscheidet die Beratung vor Ort.
      </figcaption>
    </figure>
  );
}
