# GQRegCat — Strategic Design Notes

_Forward-looking notes on where the map could go. Not a spec — a direction to revisit when the core directory is stable._

---

## Core Idea: The Map as a Multi-Lens Commons

The GQRegCat directory is not just a list of regenerative actors. It is a **shared substrate** — the same underlying dataset (the ReFi BCN CRM) viewed through different strategic lenses. Each lens is a **filter + a narrative**: it decides which actors to surface, which properties to highlight, and what story to tell about why regeneration in Catalunya matters.

A user does not browse "the map." They browse **a perspective on the map.**

---

## The Lens System

### What a lens does

| Layer | What the lens controls |
|-------|------------------------|
| **Filter** | Which actors appear (subset by tag, area, agency, ontology) |
| **Weight** | Which actors are prominent (re-rank by lens-specific criteria) |
| **Property surface** | Which CRM fields are shown, hidden, or renamed for this lens |
| **Narrative frame** | A short essay (2–4 paragraphs) that frames the problem and the solution from this perspective |
| **Advocacy** | What this lens argues for — policy, funding, coordination, narrative shift |

### Lenses are wrappers

A lens is a **thin configuration layer** over the canonical CRM data. It never edits the underlying dataset. It is a **reading** of the dataset — one of many valid readings.

New lenses can be added without changing the core site. A lens is:
- A YAML/JSON config (filter rules, weighting rules, field mapping)
- A markdown narrative file (the frame + advocacy)
- Optional: custom CSS tokens (accent colour, mood)

---

## Example Lenses

### 1. Agenda Rural Catalunya 2030
**Framing:** Catalunya's rural territories are depopulating, overexploited, and underfunded. The 2030 agenda is the public-policy framework that could reverse this — but only if the right actors are visible to policymakers.

- **Filter:** Actors with `Area1/2 = rural`, `Agency = org/network`, `Memes` containing agriculture, land stewardship, rural development
- **Weight:** Favour actors with public funding history, territorial scale, cross-municipal reach
- **Surface:** `Website`, `Public Email`, `Area1/2`, `Ontology Tags` (to show policy alignment)
- **Narrative:** "These are the actors already doing what the Agenda Rural calls for. The gap is not activity — it is visibility and coordination."
- **Advocacy:** Public administrations should fund existing networks rather than creating new ones from scratch.

---

### 2. Bioeconomy Plan Catalunya 2030
**Framing:** The bioeconomy is the industrial transition Catalunya must make — from linear extraction to circular biomass use. The map shows who is already building the bioeconomy on the ground.

- **Filter:** `Memes` containing bioeconomy, circular economy, materials transformation, industrial symbiosis
- **Weight:** Favour actors with explicit product/service outputs, industrial partnerships, research credentials
- **Surface:** `Website`, `LinkedIn`, `Description` (to show business model), `SAP` (to show narrative depth)
- **Narrative:** "Catalunya's bioeconomy is not a future plan — it is a present patchwork. The map makes the patchwork legible to investors and industry."
- **Advocacy:** Bioeconomy policy should route through existing actor networks, not top-down industrial parks.

---

### 3. Degrowth Perspective
**Framing:** Growth is the problem. Regeneration in Catalunya means doing less, not more — decommodifying land, reducing throughput, shrinking material footprints.

- **Filter:** `Memes` containing degrowth, post-growth, decolonization, commons, mutual aid; exclude `Agency = venture/corporate` unless explicitly commons-aligned
- **Weight:** Favour actors with cooperative structure, non-monetary exchange, community land tenure
- **Surface:** `Description` (to show anti-capitalist framing), `2NDTAG` (to show collaboration stance), `Ontology` (to show theoretical grounding)
- **Narrative:** "These actors do not want to grow the economy. They want to transform it. The map resists the framing that 'more actors = more progress.'"
- **Advocacy:** Fund commons infrastructure, not scale. Measure wellbeing, not GDP.

---

### 4. Extractive / Venture-Capital Perspective *(contrast lens)*
**Framing:** This is a **deliberately uncomfortable** lens. It shows what the map would look like if read by actors who see Catalunya as a market to enter, a resource to extract, or a ESG story to tell.

- **Filter:** `Agency = org` with `Memes` containing climate tech, carbon capture, ESG, impact investment; or actors with `Website` showing VC backing, B-Corp certification as primary identity
- **Weight:** Favour actors with scalable models, international expansion, patent/IP portfolios
- **Surface:** `Website`, `LinkedIn`, `Funding Opportunities` (if tracked), `Review flags` (to show CRM assessment)
- **Narrative:** "This is not a neutral view. It is a warning. The same territory can be read as a regeneration commons or as an emerging market. The map makes both readings visible — so the regeneration field can defend itself."
- **Advocacy:** Transparency. If extractive actors enter, the field must know who they are and what they want.

---

## Technical Approach

### Data layer (unchanged)
- The CRM remains the single source of truth.
- Lenses read from the same `src/lib/notion.ts` normalised records.

### Lens config layer (new)
```yaml
# src/data/lenses.yaml
lenses:
  - id: agenda-rural-2030
    name: "Agenda Rural Catalunya 2030"
    tagline: "Rural actors the public sector should already know"
    filter:
      memes_contains: ["rural", "agriculture", "land stewardship"]
      area1_in: ["Ops in Catalunya", "catalan"]
      agency_in: ["org", "network/ecosystem"]
    weight:
      - field: "Ontology Tags"
        contains: "Political_Advocacy"
        boost: 1.5
      - field: "2NDTAG"
        contains: "CATBIS"
        boost: 1.2
    surface:
      primary: ["Name", "Website", "Public Email", "Area1", "Area2"]
      secondary: ["Ontology Tags", "Description"]
    narrative: "lenses/agenda-rural-2030.md"
    accent: "#5a7a3a"  # rural green
    contrast: true      # darker, earthier palette
```

### UI layer
- A **lens switcher** in the nav or hero (dropdown or horizontal tabs).
- Switching re-renders the actor grid with the new filter/weight/surface rules.
- The narrative frame appears as a collapsible essay above the grid.
- Each lens can opt into a **subtle palette shift** (accent colour, background tint) to signal the mood of the perspective.

---

## Design Implications

### Editorial-organic system already supports this
- The current `editorial-organic.css` palette is **warm and neutral** — a good baseline for any lens.
- Lenses can override **accent colour** (the `--primary` token) without breaking the system.
- Typography stays the same (Averia Serif + Geist); the voice of the site is consistent even as the perspective shifts.

### What needs designing later
- **Lens switcher component** — how does the user discover and switch lenses?
- **Narrative frame layout** — where does the 2–4 paragraph essay sit? Collapsible? Sticky?
- **Contrast lens UX** — how do we signal that one lens is adversarial/contrast without being alarmist?
- **Deep-linking** — `/?lens=degrowth` should work as a shareable URL.

---

## Why This Matters

1. **No single map is neutral.** Any aggregation of actors implies a value system. Making lenses explicit turns this from a bug into a feature.
2. **Catalunya is contested.** The same territory is being claimed by bioeconomy planners, degrowth activists, rural policy bureaucrats, and impact investors. The map should reflect that contest, not hide it.
3. **Scalable without bloat.** New lenses = new config files + narrative markdown. No new database schemas. No new page types.
4. **Useful to different audiences.** A policymaker wants the Agenda Rural lens. A funder wants the Bioeconomy lens. A movement organiser wants the Degrowth lens. A researcher wants to compare all three.

---

## Open Questions

- **Who writes the narratives?** Giulio + Miceli for v1, but future lenses may need domain experts.
- **Who decides what a lens filters?** The lens author, but should there be a review process?
- **Can users create their own lenses?** Not in v1, but the config format is simple enough that a power user could fork + PR.
- **Do lenses affect the map view, or only the directory?** In v1, probably only the directory. Map colours/layers per lens = Phase 2.
- **How many lenses is too many?** 3–5 feels right for launch. More = noise.

---

_These notes are append-only. If you iterate on the lens concept, add a new section below rather than editing this one — keep the design archaeology visible._
