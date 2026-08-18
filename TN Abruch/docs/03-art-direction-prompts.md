# Art Direction — Prompt-Serie für ergänzende Materialstudien

Diese Serie erzeugt **Materialstudien**, keine Referenzbilder. Sie darf niemals einem
Projekt, einem Ort oder einem Auftraggeber zugeordnet werden. Siehe
`docs/02-creative-direction.md`, Abschnitt Bildsprache.

## Verbindlicher Rahmen für jeden Prompt

Jeder Prompt endet mit demselben Block, damit die Serie wie eine Kampagne wirkt und
nicht wie eine Sammlung von Einzelbildern:

> `hard cool daylight, fine mineral dust suspended in air, near-monochrome desaturated,
> high contrast, visible film grain, documentary photography, shallow depth of field,
> no people, no machinery, no logos, no text, no recognizable building`

## Status

Erzeugt und im Einsatz:

| Datei | Prompt | Verwendung |
|---|---|---|
| `src/assets/material-beton-bewehrung.jpg` | *Extreme macro material study: fractured reinforced concrete edge, exposed rusted rebar* + Rahmen | Hintergrund der Sektion „Wenn der Fund kommt" |

Noch offen — das Higgsfield-Guthaben war beim Bau aufgebraucht (0,10 Credits):

| Slot | Prompt |
|---|---|
| Schadstoffsanierung, Sektionshintergrund | `Extreme macro: translucent polyethylene sheeting taped over a doorway, folds catching cool daylight, faint blue cast, sealed edge in focus` + Rahmen |
| Rückbau & Entkernung, Sektionshintergrund | `Extreme macro: torn edge of a stripped interior wall, layered plaster and screed cross-section, dust hanging in a shaft of light` + Rahmen |
| Beton, Bohren & Sägen | `Extreme macro: core-drilled hole through concrete, clean circular cut edge, water-cooled slurry residue, aggregate visible in the cut face` + Rahmen |
| Entsorgung & Container | `Extreme macro: sorted demolition rubble, broken brick, concrete and steel fragments layered in shadow, sharp fracture surfaces` + Rahmen |
| Karriere, Übergangsbild | `Extreme macro: worn leather work glove resting on rusted steel plate, texture of both surfaces sharp, cold light` + Rahmen |
| Unternehmen, Übergangsbild | `Extreme macro: weathered steel container wall, layered paint and rust, riveted seam running diagonally` + Rahmen |

**Modell:** `z_image` (Higgsfield MCP), Seitenverhältnis 16:9 für Bänder, 4:5 für
Hochformate. Nach der Erzeugung durch `_research/prepare-images.py` laufen lassen — die
Funktion `grade()` bringt jedes Bild auf die gemeinsame Anmutung.

**Einbindung:** Dateiname beginnt mit `material-`, `alt` beschreibt ausschließlich das
Material („Bruchkante aus Stahlbeton mit freiliegender Bewehrung"), niemals ein Projekt.
Im Impressum steht der Hinweis auf KI-generierte Materialaufnahmen — bei jedem weiteren
Bild dort ergänzen.
