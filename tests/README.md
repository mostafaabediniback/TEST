# Ship mock environment

These tools use the existing `perf/ship-load-step-zoom` app. They do not change production API configuration, ship geometry or rendering. No merge is required.

## Run without a backend

```sh
npm ci
npm run mock:ships
# In another terminal:
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:3008/dashboard/8/214/104`. The API returns a deterministic synthetic fleet of 20,000 vessels near Shanghai, filtered by each requested tile and vessel type. Vessel IDs and coordinates remain stable across zoom levels. Ports are empty. Ship detail/track endpoints are intentionally not implemented; this fixture tests fleet loading and markers.

Optional slow-response configuration:

```sh
MOCK_DELAY_MS=500 MOCK_SHIPS=20000 npm run mock:ships
```

The fixture binds only to `127.0.0.1:8000`; the app already uses `localhost:8000`. Stop a real local API before using it. Change count, delay or failure state with JSON POST to `/__mock/config`; inspect tile requests at `/__mock/requests`. This fixture is for development only.

## Executed integration suite

```sh
npm run test:ships
```

Runs the actual `useShipsInVisibleTiles` React hook and React Query against a local HTTP server, with a fake map providing bounds and events. Checks 20,000 unique records, geometry at zoom 9/14/19, fresh-cache remount, unchanged bounds, delayed responses, 503 retries, empty responses, and the actual extracted wheel callback. Results are written to `tests/results/integration.json`.

This is a Node integration test: the timings exclude app startup, basemap loading, GPU uploads, rendering, picking and display refresh. They are individual fixture observations, not production benchmarks. Synthetic wheel sequences are not physical-device testing.

## Browser suite

```sh
npx playwright install chromium
npm run test:ships:browser
```

Stop manual Vite/mock servers first; this suite owns ports 3008 and 8000. It launches the actual app, verifies the ship layer count, waits for a rendered map frame, checks GPU picking, exercises wheel input, and saves screenshots plus JSON in `tests/results/`. It also includes slow, empty, error and recovery loads. The test config alone injects observation hooks; ordinary Vite builds do not expose them. The startup intro is skipped and OSM is replaced with a constant raster tile to isolate fleet behavior. Recovery here means a fresh load after API restoration, not automatic reconnect.

The browser suite could not reach any scenarios in the current execution environment: Chromium exits with `SIGTRAP` before opening a page. Therefore this work does **not** establish GPU correctness, FPS or instantaneous visible ship display. The browser assertions remain pending successful execution in a browser-capable environment.

## Known behavior retained

- Initial ship requests still begin after `map.load`; prefetch before map readiness is not implemented.
- The current 180ms wheel lock drops two of three mouse notches at 0/60/120ms.
- A continuous touchpad-like trace at 20ms intervals over 600ms causes four integer zoom steps.
- No physical mouse/touchpad test has been performed.

See `SHIP_TEST_REPORT.md` for measured results and limitations.
