# Ship loading experiment — 2026-10-22

Branch: `perf/ship-load-step-zoom`. Application source tested: `21e4bce3ca806b6a2f47a16088661670a2cd510b`. No merge into v4.

## Executed checks

- Clean `npm ci --ignore-scripts`: passed with the preserved application dependency lock.
- `npm run test:ships`: all 8 integration checks passed.
- `npm run build`: passed. Large bundle warnings remain. This local source transport omitted binary fonts, producing unresolved-font warnings; no font files were changed in the repository.
- `npx eslint tests/vite.mock.config.js`: passed.
- Full existing project lint: 16 errors and 4 warnings in unchanged application/config files. It is not a clean lint run.

The integration tests execute the real React hook, React Query, Axios HTTP requests and ship geometry code. The fake map supplies bounds/events; it does not implement GPU rendering.

| Single-run synthetic observation | Time |
| --- | ---: |
| Immediate mock API: mount to all 20,000 ships in hook | 143 ms |
| API with 500 ms delay: mount to all 20,000 ships in hook | 573 ms |
| Build all 20,000 marker geometries, zoom 9 | 194 ms |
| Build all 20,000 marker geometries, zoom 14 | 201 ms |
| Build all 20,000 marker geometries, zoom 19 | 194 ms |

These are separate Node observations, not time-to-first-visible-ship or production browser benchmarks. They exclude startup, map tiles, GPU uploads and drawing. No before/after speedup has been measured.

## Functional results

- PASS: 20,000 stable, unique ship IDs received through actual hook and HTTP API
- PASS: Finite geometry at zoom 9/14/19; arrows, stationary circles, hulls and status badges retained
- PASS: Unchanged visible tiles do not request ships again
- PASS: Remount reuses fresh React Query cache without another HTTP request
- PASS: 500ms API delay handled; fleet appears after response
- PASS: 503 responses expose error after retries without fabricating ship data
- PASS: Empty API response handled without error
- PASS: Actual wheel handler: integer step, direction and zoom boundaries

## Known issues and pending checks

The 180 ms wheel lock retains two issues: three fast mouse notches at 0/60/120 ms result in one zoom step; a continuous 600 ms touchpad-like stream produces four steps. These are synthetic event traces, not tests with physical devices.

Ship fetching still starts after map.load. The branch removes the initial 200 ms debounce, but does not yet prefetch before map readiness.

The browser suite was attempted. Chromium exits with SIGTRAP before any page loads; zero browser scenarios completed. Screenshots, GPU drawing, picking, FPS, visual equivalence and instantaneous ship display remain unverified. The browser test is included for reproducible execution elsewhere, with pending assertions clearly documented.

No production API URL, marker geometry, map rendering or zoom handler was changed by this test-environment commit. Existing locked dependency entries were preserved; only test dependencies were added.
