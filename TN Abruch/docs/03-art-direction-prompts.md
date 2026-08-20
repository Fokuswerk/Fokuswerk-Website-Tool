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

Erzeugt am 20.08.2026, aufbereitet über `_research/prepare-material.py`
(gleiche `grade()`-Funktion wie die Fotoserie), je als 21:9-Band und 3:2-Zuschnitt:

| Datei | Prompt | Verwendung |
|---|---|---|
| `material-folie-*` | `Extreme macro close-up of thick translucent polyethylene containment sheeting stapled and taped over a rough concrete wall opening …` + Rahmen | Seitenkopf Schadstoffsanierung |
| `material-wandschnitt-*` | `Extreme macro: torn edge of a stripped interior wall, layered plaster and screed cross-section, dust hanging in a shaft of light` + Rahmen | Seitenkopf Rückbau, Band Beton, Band Karriere |
| `material-kernbohrung-*` | `Extreme macro: core-drilled hole through concrete, clean circular cut edge, water-cooled slurry residue, aggregate visible in the cut face` + Rahmen | Seitenkopf Beton, Bohren & Sägen |
| `material-bauschutt-*` | `Extreme macro: sorted demolition rubble, broken brick, concrete and steel fragments layered in shadow, sharp fracture surfaces` + Rahmen | Seitenkopf Leistungen, Bänder Rückbau und Entsorgung |
| `material-handschuh-*` | `Extreme macro: worn leather work glove resting on rusted steel plate, texture of both surfaces sharp, cold light` + Rahmen | Seitenkopf Karriere |
| `material-container-*` | `Extreme macro: weathered steel container wall, layered paint and rust, riveted seam running diagonally` + Rahmen | Seitenkopf Kontakt |
| `material-schnurschlag-*` | `Extreme macro: chalk snap line across a raw concrete floor, fine dust settled along the line, cold raking light` + Rahmen | Seitenkopf Referenzen |

Die erste Fassung der Folienaufnahme las sich wie ein Fenster mit Vorhang. Der
Prompt wurde um „no window, no glass" und die Beschreibung der Klebekante
ergänzt und neu erzeugt; die verworfene Fassung liegt in `_research/ai/`.

**Modell:** `z_image` (Higgsfield MCP), Seitenverhältnis 16:9 für Bänder, 4:5 für
Hochformate. Nach der Erzeugung durch `_research/prepare-images.py` laufen lassen — die
Funktion `grade()` bringt jedes Bild auf die gemeinsame Anmutung.

**Einbindung:** Dateiname beginnt mit `material-`, `alt` beschreibt ausschließlich das
Material („Bruchkante aus Stahlbeton mit freiliegender Bewehrung"), niemals ein Projekt.
Im Impressum steht der Hinweis auf KI-generierte Materialaufnahmen — bei jedem weiteren
Bild dort ergänzen.
