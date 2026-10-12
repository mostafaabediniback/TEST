import test from "node:test";
import assert from "node:assert/strict";
import { createMapLayerManager } from "../src/lib/mapOverlayLayers.js";
import { getShipMarker } from "../src/lib/shipMarkers.js";
import { mergePortTiles, readPortTileData } from "../src/lib/portMarkers.js";

function setup() {
  let props = {};
  const canvas = { style: { cursor: "" } };
  const manager = createMapLayerManager({ setProps: (next) => { props = next; } }, { getCanvas: () => canvas });
  return { manager, canvas, props: () => props };
}

test("Ports loading, updating, and unmounting preserve ship layers", () => {
  const { manager, props } = setup();
  const ships = [{ id: "ship-markers" }, { id: "selected-ship-outline" }];
  manager.setGroup("ships", { order: 20, layers: ships });
  manager.setGroup("ports", { order: 10, layers: [] });
  assert.deepEqual(props().layers, ships);
  const ports = [{ id: "port-markers" }];
  manager.setGroup("ports", { order: 10, layers: ports });
  assert.deepEqual(props().layers, [...ports, ...ships]);
  manager.setGroup("ships", { order: 20, layers: [{ id: "updated-ships" }] });
  assert.equal(props().layers[0], ports[0]);
  manager.removeGroup("ports");
  assert.deepEqual(props().layers, [{ id: "updated-ships" }]);
});

test("Blank clicks clear selection groups, hover routes to all groups, and cleanup is reusable", () => {
  const { manager, props, canvas } = setup();
  let cleared = 0, hoveredShip = null, hoveredPort = null;
  manager.setGroup("ships", { layers: [], onEmptyClick: () => cleared++, onHover: ({ object }) => { hoveredShip = object?.ship ?? null; } });
  manager.setGroup("ports", { layers: [], onEmptyClick: () => cleared++, onHover: ({ object }) => { hoveredPort = object?.port ?? null; } });
  props().onClick({ object: { ship: { id: 1 } } });
  assert.equal(cleared, 0);
  props().onClick({ object: null });
  assert.equal(cleared, 2);
  props().onHover({ object: { ship: { id: 1 } } });
  assert.equal(hoveredShip.id, 1);
  props().onHover({ object: { port: { id: 2 } } });
  assert.equal(hoveredShip, null);
  assert.equal(hoveredPort.id, 2);
  assert.equal(canvas.style.cursor, "pointer");
  manager.clear();
  manager.removeGroup("ports");
  assert.equal(props().onHover, null);
  assert.equal(canvas.style.cursor, "");
  manager.setGroup("ships", { layers: [{ id: "restored" }] });
  assert.equal(props().layers[0].id, "restored");
});

test("All ships use closed arrow polygons at low and high zoom without requiring dimensions", () => {
  for (const zoom of [2, 10, 19]) {
    for (const heading of [0, 90, 180, 270, undefined]) {
      const marker = getShipMarker({ lat: 31, lon: 121, heading }, zoom);
      assert.equal(marker.polygon.length, 5);
      assert.deepEqual(marker.polygon[0], marker.polygon.at(-1));
      assert.ok(marker.polygon.flat().every(Number.isFinite));
      const [tipLon, tipLat] = marker.polygon[0];
      if (heading === 0) assert.ok(tipLat > 31);
      if (heading === 90) assert.ok(tipLon > 121);
      if (heading === 180) assert.ok(tipLat < 31);
      if (heading === 270) assert.ok(tipLon < 121);
    }
  }
  assert.equal(getShipMarker({ id: 1 }, 10), null);
});

test("Port tiles accept list wrappers and merge duplicates while excluding invalid coordinates", () => {
  const port = { id: 7, name: "Port", lat: "31.2", lon: "121.4" };
  for (const response of [[port], { ports: [port] }, { items: [port] }, { results: [port] }, { data: { ports: [port] } }]) {
    assert.deepEqual(readPortTileData(response), [port]);
  }
  assert.deepEqual(readPortTileData({ ports: [] }), []);
  assert.throws(() => readPortTileData({ count: 0 }), /Unexpected ports tile response/);
  assert.deepEqual(mergePortTiles([[port], [port, { id: 8, lat: "", lon: 0 }, { id: 9, lat: 91, lon: 0 }], undefined]), [port]);
});
