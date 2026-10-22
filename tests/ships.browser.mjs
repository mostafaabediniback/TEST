import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { createMockShipsServer } from '../scripts/mock-ships.mjs';

// This runs the actual app with MapLibre/Deck.gl. It does not replace ship layers.
const fixture = createMockShipsServer();
const vite = await createServer({ configFile: 'tests/vite.mock.config.js', server: { host: '127.0.0.1', port: 3008, strictPort: true } });
let browser;
const report = { environment: 'Chromium + real MapLibre/Deck.gl + synthetic HTTP fleet', scenarios: [] };
await mkdir(new URL('./results/', import.meta.url), { recursive: true });
const configure = data => fetch('http://127.0.0.1:8000/__mock/config', { method: 'POST', body: JSON.stringify(data) });
try {
  await fixture.listen(); await vite.listen();
  browser = await chromium.launch({ headless: true,
    ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}),
    args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
  for (const scenario of [
    { name: 'immediate', delay: 0, count: 20000, fail: false },
    { name: 'slow-500ms', delay: 500, count: 20000, fail: false },
    { name: 'empty', delay: 0, count: 0, fail: false },
    { name: 'api-error', delay: 0, count: 20000, fail: true },
    { name: 'recovery', delay: 0, count: 20000, fail: false },
  ]) {
    await configure(scenario);
    const context = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => { sessionStorage.setItem('tooba:intro-seen', '1'); });
    // Constant blank basemap tile isolates ship rendering from OSM/network variability.
    await page.route('https://tile.openstreetmap.org/**', route => route.fulfill({
      contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==', 'base64'),
    }));
    await page.route('**/maps/countries.geo.json', route => route.fulfill({ json: { type: 'FeatureCollection', features: [] } }));
    await page.goto('http://127.0.0.1:3008/dashboard/8/214/104');
    await page.waitForFunction(() => window.__shipTest?.loadedAt !== null && window.__shipTest?.loadedAt !== undefined, null, { timeout: 30000 });
    if (scenario.count && !scenario.fail) {
      await page.waitForFunction(() => window.__shipTest.layers?.find(l => l.id === 'ship-markers')?.props.data.length === 20000, null, { timeout: 30000 });
      await page.evaluate(() => new Promise(resolve => { const map = window.__shipTest.map; map.once('render', () => resolve()); map.triggerRepaint(); }));
      const data = await page.evaluate(() => {
        const test = window.__shipTest;
        const markers = test.layers.find(l => l.id === 'ship-markers').props.data;
        const point = test.map.project(markers[10000].positionCoordinates);
        const picked = test.overlay.pickObject({ x: point.x, y: point.y, radius: 5, layerIds: ['ship-markers'] });
        const frames = test.updates.filter(u => u.count > 0);
        return { loadedAt: test.loadedAt, firstLayerAt: frames[0].at, fullFleetAt: frames.find(u => u.count === 20000).at,
          pickedShip: picked?.object?.ship?.id ?? null, markerCount: markers.length };
      });
      assert.ok(data.pickedShip, 'A real rendered ship must be GPU-pickable');
      if (scenario.name === 'immediate') {
        const canvas = page.locator('.maplibregl-canvas'); await canvas.hover();
        const before = await page.evaluate(() => window.__shipTest.map.getZoom());
        await page.mouse.wheel(0, -100);
        await page.waitForFunction(z => window.__shipTest.map.getZoom() === z + 1, before);
        data.mouseSingleStep = true;
        // A synthetic touchpad-like wheel stream; report the existing 180ms-lock behavior.
        await page.waitForTimeout(220);
        data.touchpadTrace = await page.evaluate(async () => {
          const map = window.__shipTest.map; const start = map.getZoom();
          for (let i = 0; i < 31; i++) {
            map.getContainer().dispatchEvent(new WheelEvent('wheel', { deltaY: -2, bubbles: true, cancelable: true }));
            await new Promise(resolve => setTimeout(resolve, 20));
          }
          return { start, end: map.getZoom() };
        });
      }
      await page.screenshot({ path: new URL(`./results/${scenario.name}.png`, import.meta.url).pathname });
      report.scenarios.push({ ...scenario, ...data, status: 'PASS' });
    } else {
      if (scenario.fail) {
        // The app retries twice using React Query's backoff.
        await page.waitForFunction(() => /could not load|ناموفق|تعذّر/i.test(document.querySelector('[role="status"]')?.textContent ?? ''), null, { timeout: 30000 });
      } else await page.waitForTimeout(800);
      const count = await page.evaluate(() => window.__shipTest.layers?.find(l => l.id === 'ship-markers')?.props.data.length ?? 0);
      assert.equal(count, 0);
      report.scenarios.push({ ...scenario, markerCount: count, status: 'PASS' });
    }
    assert.deepEqual(errors, [], 'No uncaught browser exceptions');
    await context.close();
  }
} catch (error) {
  report.failure = error.message; process.exitCode = 1;
} finally {
  await browser?.close(); await vite.close();
  if (fixture.server.listening) await new Promise(resolve => fixture.server.close(resolve));
  await writeFile(new URL('./results/browser.json', import.meta.url), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
