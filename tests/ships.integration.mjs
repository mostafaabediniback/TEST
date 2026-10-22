import assert from 'node:assert/strict';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import vm from 'node:vm';
import React from 'react';
import { act, create } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createServer } from 'vite';
import { createMockShipsServer } from '../scripts/mock-ships.mjs';
import { buildShipMarker } from '../src/lib/map/shipMarkers.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const fixture = createMockShipsServer({ port: 0 });
await fixture.listen();
const base = `http://127.0.0.1:${fixture.server.address().port}`;
const { default: api } = await vite.ssrLoadModule('/src/api/axiosClient.js');
api.defaults.baseURL = base;
const { useShipsInVisibleTiles } = await vite.ssrLoadModule('/src/hooks/useShipsInVisibleTiles.js');
const { FilterProvider } = await vite.ssrLoadModule('/src/context/FilterContext.jsx');
const report = { environment: 'Node + real React hook + React Query + HTTP mock; no GPU', tests: [], timings: {} };
const pass = name => { report.tests.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); };
const configure = data => fetch(`${base}/__mock/config`, { method: 'POST', body: JSON.stringify(data) });
const requests = async () => (await fetch(`${base}/__mock/requests`)).json();
let state, renderer;
const map = {
  zoom: 9, listeners: new Map(),
  getZoom() { return this.zoom; },
  getBounds() { return { getWest: () => 120.5, getEast: () => 122.5, getNorth: () => 32, getSouth: () => 30.5 }; },
  on(event, fn) { this.listeners.set(event, fn); },
  off(event, fn) { if (this.listeners.get(event) === fn) this.listeners.delete(event); },
};
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
// The actual hook sets retry:2; use a short retry delay solely to keep failure tests fast.
client.setQueryDefaults(['ships'], { retryDelay: 10 });
function Probe() { state = useShipsInVisibleTiles({ map }); return null; }
const mount = async () => act(async () => {
  renderer = create(React.createElement(QueryClientProvider, { client },
    React.createElement(FilterProvider, null, React.createElement(Probe))));
});
const unmount = async () => { if (renderer) await act(async () => renderer.unmount()); renderer = null; };
const wait = async (condition, timeout = 12000) => {
  const start = performance.now();
  while (!condition()) {
    if (performance.now() - start > timeout) throw Error('Timed out waiting for hook state');
    await act(async () => new Promise(resolve => setTimeout(resolve, 20)));
  }
};
try {
  await configure({ count: 20000, delay: 0, fail: false });
  const started = performance.now(); await mount();
  await wait(() => state?.ships.length === 20000 && !state.isFetching);
  report.timings.immediateHttpToHookMs = Math.round(performance.now() - started);
  assert.equal(new Set(state.ships.map(s => s.id)).size, 20000);
  pass('20,000 stable, unique ship IDs received through actual hook and HTTP API');
  const fleet = state.ships;
  for (const zoom of [9, 14, 19]) {
    const before = performance.now();
    const markers = fleet.map(ship => buildShipMarker(ship, zoom));
    assert.equal(markers.length, 20000);
    assert.ok(markers.every(marker => marker?.outlineCoordinates.every(p => p.every(Number.isFinite))));
    if (zoom >= 14) {
      assert.ok(markers.every(marker => marker.shapeType === 'hull'));
      assert.ok(markers.some(marker => marker.statusIconName === 'anchor'));
      assert.ok(markers.some(marker => marker.statusIconName === 'moored'));
    } else {
      assert.ok(markers.some(marker => marker.shapeType === 'arrow'));
      assert.ok(markers.some(marker => marker.shapeType === 'circle'));
    }
    report.timings[`geometry${zoom}Ms`] = Math.round(performance.now() - before);
  }
  pass('Finite geometry at zoom 9/14/19; arrows, stationary circles, hulls and status badges retained');
  const countBefore = (await requests()).length;
  await act(async () => { map.listeners.get('moveend')(); await new Promise(resolve => setTimeout(resolve, 250)); });
  assert.equal((await requests()).length, countBefore);
  pass('Unchanged visible tiles do not request ships again');
  await unmount(); await mount(); await wait(() => state.ships.length === 20000);
  assert.equal((await requests()).length, countBefore);
  pass('Remount reuses fresh React Query cache without another HTTP request');

  await unmount(); client.clear(); await configure({ delay: 500 });
  const slowStart = performance.now(); await mount();
  assert.equal(state.ships.length, 0);
  await wait(() => state.ships.length === 20000 && !state.isFetching);
  report.timings.delayed500HttpToHookMs = Math.round(performance.now() - slowStart);
  assert.ok(performance.now() - slowStart >= 500);
  pass('500ms API delay handled; fleet appears after response');

  await unmount(); client.clear(); await configure({ fail: true, delay: 0 });
  await mount(); await wait(() => state.isError && !state.isFetching);
  assert.equal(state.ships.length, 0);
  pass('503 responses expose error after retries without fabricating ship data');
  await unmount(); client.clear(); await configure({ fail: false, count: 0 });
  await mount(); await wait(() => !state.isFetching && !state.isPending);
  assert.equal(state.ships.length, 0); assert.equal(state.isError, false);
  pass('Empty API response handled without error');

  const source = await readFile(new URL('../src/components/map/WorldMap.jsx', import.meta.url), 'utf8');
  const block = source.slice(source.indexOf('    let wheelLocked'), source.indexOf('    wheelTarget.addEventListener'));
  function wheel(events, initial = 10) {
    let now = 0, zoom = initial, nextId = 0; const timers = new Map(), changes = [];
    const context = { map: { getZoom: () => zoom, zoomTo: (z, options) => { zoom = z; changes.push({ at: now, zoom, duration: options.duration }); } },
      setTimeout: (fn, ms) => { timers.set(++nextId, { fn, at: now + ms }); return nextId; }, clearTimeout: id => timers.delete(id) };
    vm.createContext(context); vm.runInContext(block + ';globalThis.wheel=onWheel;', context);
    for (const [at, deltaY] of events) {
      now = at; for (const [id, timer] of timers) if (timer.at <= now) { timers.delete(id); timer.fn(); }
      context.wheel({ deltaY, preventDefault() {} });
    }
    return changes;
  }
  assert.equal(wheel([[0, -100]])[0].zoom, 11);
  assert.equal(wheel([[0, 100]])[0].zoom, 9);
  assert.equal(wheel([[0, -100]], 19)[0].zoom, 19);
  assert.equal(wheel([[0, 100]], 2)[0].zoom, 2);
  pass('Actual wheel handler: integer step, direction and zoom boundaries');
  report.knownIssues = {
    rapidMouseNotches: wheel([[0, -100], [60, -100], [120, -100]]),
    continuousTouchpad: wheel(Array.from({ length: 31 }, (_, i) => [20 * i, -2])),
    note: '180ms lock drops rapid mouse notches and allows multiple steps during a continuous touchpad gesture. Device traces are synthetic.',
  };
  report.browser = { status: 'NOT MEASURED', reason: 'This integration suite does not execute a browser. Use test:ships:browser for GPU rendering and picking.' };
} finally {
  await unmount(); client.clear(); await vite.close();
  await new Promise(resolve => fixture.server.close(resolve));
  await mkdir(new URL('./results/', import.meta.url), { recursive: true });
  await writeFile(new URL('./results/integration.json', import.meta.url), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
