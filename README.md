# Car Map Dashboard

A bilingual Persian/English vehicle tracking dashboard built with Vite, React, TanStack Query, shadcn/ui components based on Base UI, and Leaflet.

## Features

- Language switcher available from the sidebar profile menu and settings page, with the selected language persisted in the browser
- shadcn/ui profile menu with an adjacent language submenu; the sidebar stays expanded while either menu is open
- `SidebarProfile` accepts an optional `user` with `name`, `email`, and `avatar`; without account data, it shows a neutral profile icon and label
- Local Sahel font for Persian and Inter for English, automatically switched based on the active language
- RTL layout with a right-side sidebar for Persian and LTR layout with a left-side sidebar for English
- Official shadcn/ui sidebar with expanded/icon modes on desktop and Sheet behavior on mobile
- Sidebar keyboard shortcut:
  - `Ctrl+B` on Windows/Linux
  - `Cmd+B` on macOS
- Full translation support for:
  - UI text
  - vehicle statuses
  - accessibility labels
  - map information
- Direction-aware icons, spacing, search UI, floating controls, and switches
- Application routes:
  - `/` — Map
  - `/vehicles` — Vehicle directory
  - `/settings` — Settings
- Header search
- Map filter/layer controls positioned according to the active text direction
- Vehicle status filtering through React Context
- Debounced search
- Vehicle data fetching with TanStack Query
- Polling every 3 seconds for:
  - vehicle directory
  - selected vehicle details
- Tile-based caching for map vehicle data
- Current map `z/x/y` values sent to the API
- Vehicles displayed as map markers
- Clicking a vehicle opens a bottom Drawer
- Vehicle markers support:
  - mouse click
  - `Enter`
  - `Space`
- Bilingual shadcn/ui Drawer for vehicle details
- Drawer can be closed with:
  - close button
  - `Escape`
  - downward swipe/drag
- Displays:
  - `lat`
  - `lng`
  - `z`
  - `x`
  - `y`
- Custom zoom controls
- Raster tile support with `.png`
- Optional vector tile support with `.pbf` and `Leaflet.VectorGrid`
- Mock API for running the project without a backend

## Installation

Using pnpm:

```bash
pnpm install
cp .env.example .env
pnpm dev
```

If pnpm is not installed:

```bash
npm install
cp .env.example .env
npm run dev
```

## Clean pnpm reinstall on Windows PowerShell

If dependencies were previously installed using npm, yarn, or another package manager, clean the existing installation before reinstalling with pnpm.

Run the following commands in PowerShell:

```powershell
taskkill /F /IM node.exe
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
pnpm install
```

If `package-lock.json` does not exist, PowerShell may show a file-not-found error. This can be safely ignored.

If `node_modules` cannot be deleted because of an `EPERM` or file-locking error:

- Stop the Vite development server
- Close other terminals using the project
- Close VS Code if necessary
- Run PowerShell as Administrator
- Retry the commands above

Avoid mixing npm, yarn, and pnpm installations in the same project whenever possible.

## Connecting to a Real API

Configure `.env`:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:3000/api
```

Vehicle requests are sent in the following format:

```http
GET /cars?search=ali&status=available&z=13&x=5265&y=3230
```

## Map Position and Tile Requests

The active map uses React Leaflet.

`MapPositionProvider` resolves the initial map position once, before `MapContainer` or the map vehicle query is mounted.

The initialization priority is:

```text
Valid XYZ values from URL
→ Browser geolocation
→ Default Tehran location
```

If valid `z/x/y` values already exist in the URL, browser geolocation is skipped.

This also applies when a selected `car` parameter exists in the URL.

XYZ values must be integer tile coordinates within the supported zoom range:

```text
0–18
```

Map movement stores the latest `z/x/y` values using:

```js
history.replaceState(...)
```

This prevents every map movement from creating a new browser history entry.

The URL also stores `lat/lng` because integer XYZ coordinates identify an entire map tile rather than an exact map center.

Behavior:

- XYZ-only links open at the center of the specified tile
- Saved `lat/lng` coordinates are used only when they belong to the corresponding XYZ tile
- Existing query parameters are preserved
- The URL hash is preserved
- Refreshing a page with valid XYZ values restores the same map location without requesting geolocation again

Vehicle API requests continue to use integer XYZ values.

Vehicle data updates after:

```text
moveend
```

with a `150 ms` debounce.

If another map movement starts before the debounce completes, the pending update is canceled.

The existing TanStack Query cache uses a query key based on:

```text
${z}/${x}/${y}
+ search filter
+ status filter
```

This provides the following behavior:

- identical tile requests reuse cached data
- concurrent requests for the same query can reuse the pending request
- successful tile responses remain cached for the QueryClient lifetime
- revisiting an already-loaded tile does not automatically poll or refetch it
- failed requests may still retry according to TanStack Query configuration

The vehicle directory and selected-vehicle detail queries retain their existing behavior.

## Supported Vehicle API Response

The API may return an array:

```json
[
  {
    "id": 101,
    "lat": 35.7001,
    "lng": 51.3922,
    "driverName": "Ali Rezaei",
    "plate": "12 A 345",
    "status": "available"
  }
]
```

Or an object containing `items`:

```json
{
  "items": []
}
```

## PBF / MBTiles

The frontend does not read `.mbtiles` files directly.

An MBTiles file must be exposed through a tile server that provides a PBF URL template.

Example:

```env
VITE_VECTOR_TILE_URL=http://localhost:8080/tiles/{z}/{x}/{y}.pbf
```

Then enable:

```text
Vector details
```

from either:

- the map toolbar
- the settings page

> The layer names inside the PBF file may differ from names such as `road`, `water`, `building`, and similar defaults.

If necessary, update:

```text
src/components/map/VectorTileLayer.jsx
```

to match the actual source-layer names inside your vector tile dataset.

## Language and Components

Application translations are stored in:

```text
src/i18n/messages.js
```

English translation keys use English text as the default value.

Persian translations are stored in:

```text
messages.fa
```

`LocaleProvider` manages:

- active language
- document `dir`
- page title
- number formatting
- Base UI direction

When adding new components, use:

```js
useLocale();
```

and prefer logical-direction CSS utilities such as:

```text
start
end
ps
pe
text-start
```

instead of hard-coded left/right positioning.

Driver names and license plates are API data and are not translated.

They are isolated from surrounding directional text using:

```html
<bdi></bdi>
```

## shadcn/ui

Components inside:

```text
src/components/ui
```

are based on the official shadcn/ui registry using the Base Nova style and have been adapted for:

- JavaScript
- Tailwind CSS 3
- Base UI APIs

Sidebar registry:

https://ui.shadcn.com/r/styles/base-nova/sidebar.json

Sidebar documentation:

https://ui.shadcn.com/docs/components/base/sidebar

Component composition uses Base UI's `render` API.

Example:

```jsx
<PopoverTrigger render={<Button />} />
```

Colors are defined in:

```text
src/index.css
```

and Tailwind token mappings are configured in:

```text
tailwind.config.js
```

## Fonts

The Persian Sahel font is stored in:

```text
src/assets/font
```

Supported Sahel weights:

```text
300
400
600
700
900
```

The Inter variable font is stored in:

```text
src/assets/font/inter
```

Supported Inter weights:

```text
100–900
```

Font declarations are defined using `@font-face` inside:

```text
src/index.css
```

Font selection automatically follows the active document language.

The `font-sans` utility also follows the same language-aware font configuration.

All fonts are loaded locally using WOFF2 files.

Font licenses are included in:

```text
public/licenses
```

and are published with the production build.

## Testing

Run:

```bash
npm run test
npm run build
```

The React interaction tests cover:

- language switching
- filters
- desktop sidebar behavior
- mobile sidebar behavior

These tests run in a simulated DOM environment.

For visual inspection of:

- map rendering
- real dimensions
- marker layout
- drawer behavior
- responsive behavior

run the development server:

```bash
npm run dev
```
