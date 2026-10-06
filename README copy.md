I want you to act as a senior React frontend engineer and pair-program with me inside this chat.

I will send you parts of my existing project one by one: files, components, routes, layout code, API code, map code, package.json, etc.

IMPORTANT RULE:

Until I send the exact word:

DONE

do not provide a final implementation.

Do not rewrite the project yet.

Do not generate a complete solution yet.

Do not assume missing project structure.

For every file I send before DONE:

- Read it carefully.
- Understand how it connects to the previous files.
- Keep track of the current project structure.
- Point out only critical issues if absolutely necessary.
- Otherwise simply confirm that you understood it and ask me to send the next relevant file.

When I send:

DONE

then analyze everything I sent and guide me through the changes step by step inside the chat.

I do NOT want you to build, zip, generate, or return a complete project.

I want to manually apply the changes to my existing project while following your instructions.

Use JavaScript only.

Do NOT use TypeScript.

Prefer `.js` and `.jsx`.

Do not refactor unrelated parts of my application.

Do not change my UI, layout, routing structure, sidebar, header, filters, search, or other pages unless it is directly required for this map feature.

Reuse existing project patterns whenever possible.

---

## What I am trying to build

I have a Leaflet-based map in a React application.

My map tiles use the standard tile coordinate model:

z
x
y

For example:

/tiles/{z}/{x}/{y}.png

My backend service will also receive:

z
x
y

and return the objects that belong to that tile.

Example backend response:

[
  {
    "id": 101,
    "lat": 35.7001,
    "lng": 51.3922,
    "driverName": "Ali Rezaei",
    "plate": "12 A 345",
    "status": "available"
  },
  {
    "id": 102,
    "lat": 35.6963,
    "lng": 51.4017,
    "driverName": "Reza Ahmadi",
    "plate": "21 B 123",
    "status": "busy"
  }
]

The important requirement is:

The frontend must detect which XYZ tiles are currently visible in the Leaflet viewport.

Then it must request data only for those visible tiles.

Example:

zoom = 13

visible tiles:

13/5261/3201
13/5262/3201
13/5263/3201
13/5261/3202

Then the frontend should request the backend using those z/x/y values.

---

## Tech stack

Use the project's existing stack where possible.

For this feature I expect to use:

- React
- JavaScript
- Leaflet
- React Leaflet
- TanStack React Query
- Canvas

If one of these libraries already exists in the project, use the existing setup.

Do not create a second QueryClient if the project already has one.

Do not create duplicate providers.

---

# Architecture I want

The data flow should approximately become:

Leaflet
→ current viewport
→ visible XYZ tiles
→ custom React Query hook
→ API layer
→ backend
→ React Query cache
→ Canvas data layer

I want responsibilities separated cleanly.

A possible structure could be:

src/
  api/
    carsApi.js

  hooks/
    useCarsByTiles.js

  components/
    map/
      CarsMap.jsx
      VisibleTilesTracker.jsx
      CarsDataLayer.jsx
      CarsCanvasLayer.jsx

But do not force this structure if my existing project already has a better folder convention.

Adapt to my project.

---

# Visible tile calculation

The map should calculate visible tiles using Leaflet's current zoom and pixel bounds.

The data tile coordinates must match the coordinates used by the PNG TileLayer.

If the existing project uses standard XYZ tiles, use XYZ.

If the existing map uses TMS, 512px tiles, a custom CRS, or another convention, detect it from my code before changing anything.

Do not guess.

---

# Map movement

This is very important for performance.

Do NOT trigger expensive state updates or API requests on every:

move

event.

Do not fetch on every pixel while dragging the map.

Prefer events such as:

moveend
zoomend
resize

The idea is:

while user is dragging:
- no expensive React updates
- no full data recalculation
- no API spam

after dragging ends:
- recalculate visible tiles
- update active queries

---

# React Query

Use a custom hook for the tile data logic.

For example:

useCarsByTiles(tiles)

Internally it should use:

useQueries

because the number of visible tiles changes dynamically.

Each tile should have an independent query key such as:

["cars-tile", z, x, y]

Suggested starting settings:

staleTime: 4000

gcTime: 5 * 60 * 1000

refetchInterval: 5000

refetchIntervalInBackground: false

refetchOnWindowFocus: false

retry: 1

However, inspect my project first and adjust if necessary.

Only currently visible tile queries should remain active.

Tiles that are no longer visible should not keep polling forever.

Their cached data may remain temporarily so returning to that area feels instant.

---

# API layer

Keep backend access outside the map rendering component.

For example:

getCarsByTile({
  z,
  x,
  y,
  signal
})

Use the AbortSignal provided by React Query when using fetch.

This is important so obsolete requests can be cancelled when the viewport changes quickly.

When my real backend is available, I want to be able to change only the API layer without rewriting the map rendering logic.

---

# Mock API

If my backend is not connected yet, help me create a temporary mock.

The mock should behave exactly like the real API contract.

It should accept:

z
x
y

and return cars only inside that tile.

Example:

getCarsByTile({
  z,
  x,
  y
})

The generated car coordinates must actually fall inside the geographic bounds of that XYZ tile.

Do not generate all cars globally and then filter them.

Generate them per tile.

Keep the number of generated cars easy to control with something like:

const CARS_PER_TILE = 50;

so I can benchmark the map with:

50
100
500
1000
3000

cars per tile.

---

# Duplicate handling

When multiple visible tile responses are merged, deduplicate cars by:

car.id

because objects close to tile borders might appear in multiple responses depending on backend behavior.

---

# Most important performance requirement

Do NOT render thousands of cars using React Leaflet Marker components.

I specifically do NOT want this:

cars.map(car => (
  <Marker ... />
))

because this creates thousands of React components and Leaflet DOM layers.

I want the vehicle layer to use ONE Canvas.

Architecture:

React
→ CarsCanvasLayer
→ one HTML canvas
→ thousands of vehicles drawn inside it

The DOM should not contain thousands of vehicle markers.

---

# Canvas rendering

For every car:

lat/lng

must be converted to Leaflet pixel coordinates.

Use the most appropriate Leaflet conversion method after inspecting the existing map, for example:

map.latLngToLayerPoint(...)

or another suitable coordinate conversion.

Then draw the vehicle on the Canvas.

Initially it can be a simple circle or square.

Example status colors:

available = green
busy = orange
offline = gray

If my project already contains a car icon that can be drawn efficiently on Canvas, reuse it if appropriate.

Do not convert it into thousands of DOM markers.

---

# High DPI / Retina

Canvas must render sharply on high-DPI displays.

Handle:

window.devicePixelRatio

correctly.

The visual CSS size and actual canvas pixel resolution should be handled separately.

---

# Redraw behavior

When React Query returns updated car positions:

Do not recreate the entire Canvas React component unnecessarily.

Prefer keeping the current car data in refs and triggering an imperative redraw.

Use:

requestAnimationFrame

to batch redraws and prevent multiple redraw calls within the same browser frame.

---

# Pan performance

During map dragging, do not recompute thousands of car screen coordinates on every pixel unless absolutely necessary.

Prefer letting the Canvas move with the Leaflet pane where possible.

Perform the main redraw after:

moveend

---

# Zoom performance

Avoid freezing the UI during zoom.

If helpful, temporarily hide or suspend the Canvas during zoom animation and redraw after:

zoomend

---

# Only draw visible cars

Even if the merged dataset accidentally includes objects slightly outside the current viewport, skip drawing them when their pixel position is outside the visible map bounds.

---

# Search and filters

My existing project may already contain search and filter UI.

If so, reuse them.

For example:

Search should be able to match:

driverName
plate

Status filters may include:

available
busy
offline

Do not create a second search/filter system if one already exists.

---

# Clicking a car

If practical, add click support without switching back to Leaflet Markers.

Use Canvas hit detection.

When the user clicks near a car, identify the closest relevant car and show information such as:

driverName
plate
status

Use the project's existing popup/card/UI style where possible.

Performance is more important than fancy hit detection.

---

# Sidebar and route

If the project already has a Sidebar/Menu and Router:

add the Map page to the existing navigation.

Do not create a second navigation system.

Do not redesign the sidebar.

Do not change unrelated routes.

---

# What to do after I send DONE

Once I send DONE:

1. Analyze all files together.

2. Explain briefly where the current performance problems are.

3. Tell me exactly which existing files need changes.

4. Tell me which new files, if any, should be created.

5. Then guide me file by file.

For each file:

- show the exact file path
- explain what we are changing
- provide the complete replacement code only when necessary
- otherwise provide a small targeted patch if that is safer

Do not rewrite large unrelated files unnecessarily.

6. If packages are missing, give me the exact install command based on the package manager already used by the project.

Examples:

npm install ...

pnpm add ...

yarn add ...

7. If environment variables are needed, tell me exactly what to add.

8. After each major step, tell me what I should test before continuing.

9. Keep the work interactive.

Do not dump the entire solution at once unless it is necessary.

I want to apply each change manually and tell you whether it works.

10. When debugging, ask me for:
- browser console errors
- network request results
- React Query behavior
- relevant screenshots
- relevant files

only when needed.

---

## Final rule

Before I send:

DONE

your role is only to understand my project.

After I send:

DONE

your role is to pair-program with me interactively and help me modify the project step by step.

Do not build a project archive.

Do not generate a ZIP.

Do not claim you changed files on my machine.

Everything should happen as code and instructions inside this chat.
