# Spatial Canvases — Course Project README

**Student:** Zhengrui (Jerry) Hao  
**Course:** Computational Design Workflows — *Exploration of Digital Objects*  
**Advisor:** Catherine Griffiths  
**Year:** 2025

This site presents six interactive “canvases,” each demonstrating a different computational technique (p5.js, D3.js, MapLibre GL) with an emphasis on temporal and relational structures, interaction, and accessibility. A small Firebase poll at the bottom lets viewers vote for their favorite canvas.

---

## Quick Start

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

> Please use a local web server (not `file://`) so module loading, fonts, and data fetches work reliably.

---

## File Structure

```
index.html
style.css

# p5.js canvases (1–3)
2d-drawing.js
bouncing-ball.js
zoom-pan.js

# D3 canvases (4–5)
temporal_struacture.js          # (note the file name exactly)
relational_structures.js        # NYC subway network graph

# Map canvas (6) — MapLibre + OSM (token-free)
mapbox_canvas6.js

# Poll (Firebase Realtime Database)
poll-canvases.js
```

Optional data files (supported but not required):
```
nodes_nyc.csv, edges_nyc.csv    # For Canvas 5 (if replacing demo data)
manhattan.geojson               # For Canvas 6 (if replacing demo geometry)
```

---

## Canvases Overview

### 1) 2D Drawing with Primitives (p5.js)
- **What:** Composition using lines, ellipses, polygons with a simple grid.
- **Why:** Studies proportion, rhythm, layering; introduces p5 drawing APIs.
- **How:** `2d-drawing.js` renders into `#canvas-container-1`.

### 2) Drawing Lines (p5.js)
- **What:** An interactive “sketch surface” (click/drag to draw).
- **Why:** Demonstrates event handling, stateful rendering, custom tools.
- **How:** `bouncing-ball.js` renders into `#canvas-container-2`.

### 3) Orbit Control (p5.js)
- **What:** 3D scene with orbit-like camera interaction.
- **Why:** Camera transforms and spatial navigation for model inspection.
- **How:** `zoom-pan.js` renders into `#canvas-container-3`.

### 4) Temporal Structures (D3.js)
- **What:** Project timeline (Gantt-style) for a haptic + audio navigation aid for low-vision mobility in NYC.
- **Why:** Demonstrates temporal encodings (start/end/progress), scales, axes, tooltips, and categories.
- **How:** `temporal_struacture.js` renders into `#temporal-structures`.

### 5) Relational Structures — NYC Subway Network (D3.js)
- **What:** Force-directed graph of **stations**, **lines**, and **boroughs**; edges for **adjacent stations**, **station–line membership**, and **station–borough**.
- **Why:** Shows relational modeling (types, link semantics), search/filter, and accessible tooltips.
- **How:** `relational_structures.js` renders into `#relational-structures`.
- **Data:**
  - **Default:** Built-in demo (Line 7 + part of A line).
  - **CSV mode (optional):** Place `nodes_nyc.csv` & `edges_nyc.csv` next to the HTML, then set `hasCSV = true` inside `relational_structures.js`.
    - `nodes.csv` columns: `id,name,type,short,borough,size,year,url`
    - `edges.csv` columns: `source,target,rel` (`adj|member|boro`)

### 6) Geospatial Structures — Manhattan Sketch (MapLibre GL)
- **What:** Token-free base map (OSM raster tiles) + **borough polygon**, **sample corridor**, **landmarks**, with layer toggles and popups.
- **Why:** Demonstrates geospatial layering, view fitting, and light-weight UI controls.
- **How:** `mapbox_canvas6.js` (MapLibre build) renders into `#mapbox-container-6`.
- **Data:**
  - **Default:** Inline demo geometry.
  - **GeoJSON mode (optional):** Add `manhattan.geojson` and uncomment the provided `loadExternalGeoJSON(...)` call in `mapbox_canvas6.js` (function included).

---

## Poll: “Favorite Canvas?” (Firebase Realtime Database)

- **Files:** `poll-canvases.js` + minimal HTML block at the end of `index.html`.
- **SDK:** Firebase compat (`firebase-app-compat.js`, `firebase-database-compat.js`).
- **Behavior:** Six buttons (canvases 1–6), real-time counts, soft progress backgrounds, local “voted” highlight, and connection status.
- **DB Path:** `poll/canvases/{canvas1..canvas6}` (uses **transactions** to avoid lost updates).

> Uses the same Firebase config provided by course materials. No auth required; safe for classroom demos.

---

## Assignment Alignment (What to Look For)

- **Progressive Complexity:** p5 primitives → interaction → 3D orbit → D3 time (Gantt) → D3 graph (typed links) → MapLibre geospatial canvas.
- **Temporal Visualization:** Canvas 4 fulfills *Temporal Structures*; designs include scales, axes, progress overlay, and category color.
- **Relational Thinking:** Canvas 5 models entities and heterogeneous relations; searchable and legible at small sizes.
- **Data Loading & Robustness:** Canvas 5 supports CSV; Canvas 6 supports external GeoJSON; graceful fallbacks when files are absent.
- **Accessibility & UX:**
  - Keyboard focus styles; ARIA labels on SVGs.
  - High-contrast legends, readable labels, and tooltips.
  - Motion kept subtle; responsive layout.
- **Aesthetic Considerations:** Consistent typographic scale, soft shadows, rounded cards, restrained color palette, minimal chrome.

---

## How to Swap Data

### Canvas 5 (Graph) — CSV
1. Put `nodes_nyc.csv` and `edges_nyc.csv` in the project root.  
2. In `relational_structures.js`, set `const hasCSV = true;`.  
3. Column expectations:
   - **Nodes:** `id,name,type,short,borough,size,year,url`  
   - **Edges:** `source,target,rel` (values: `adj`, `member`, `boro`)

### Canvas 6 (Map) — GeoJSON
1. Add `manhattan.geojson` (Polygon or MultiPolygon recommended).  
2. In `mapbox_canvas6.js`, uncomment the provided `loadExternalGeoJSON(...)` call after `map.on('load', ...)`.  
3. The script auto-fits bounds and keeps the UI toggles working.

---

## Tech Stack

- **p5.js** (1–3)  
- **D3.js v7** (4–5)  
- **MapLibre GL JS v2 + OSM raster tiles** (6)  
- **Firebase Realtime Database** (poll)  
- **Plain HTML/CSS/JS** — no build step

---

## Known Notes

- Keep the filename **`temporal_struacture.js`** exactly as-is to match the HTML reference.
- Do not load Mapbox GL when using MapLibre (Canvas 6). Ensure only one map library is included.
- Always run via a local server (CORS/security).

---

## Credits & Data Acknowledgements

- Open source libraries: p5.js, D3.js, MapLibre GL JS.  
- Basemap tiles: © OpenStreetMap contributors.  
- Demo subway data is illustrative; for full datasets use NYC Open Data / MTA GTFS (CSV ready).  
- Firebase configuration provided by course materials.

---

## Instructor Checklist

- [ ] Each canvas renders and interacts as described  
- [ ] Temporal chart (4) shows categories, time scale, progress, tooltips  
- [ ] Graph (5) supports search, typed links, and CSV swap  
- [ ] Map (6) loads default layers; toggles and popups function; optional GeoJSON swap  
- [ ] Poll records and updates votes in real time  
- [ ] Code is organized, commented, and consistent with course conventions

---

*Thank you for reviewing!*
