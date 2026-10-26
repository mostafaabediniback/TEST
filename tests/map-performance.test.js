import assert from "node:assert/strict";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { buildShipMarker } from "../src/lib/map/shipMarkers.js";
import {
  buildShipOverviewData,
  createShipOverviewBuilder,
  getOverviewPickedShip,
  getOverviewTransferList,
} from "../src/lib/map/shipOverviewData.js";
import { createTileQueryCombiner } from "../src/lib/map/tileQueryResults.js";
import { buildPortOverviewData, createPortOverviewBuilder, getOverviewPickedPort } from "../src/lib/map/portOverviewData.js";

function makeShips(count) {
  return Array.from({ length: count }, (_, id) => ({
    id,
    lon: (id % 3600) / 10 - 180,
    lat: (id % 1600) / 10 - 80,
    vessel_type: id % 2 ? "Tanker" : "General Cargo",
    speed: id % 3 ? 12 : 0,
    course: id % 360,
    heading: id % 360,
    loa: 120,
    width: 20,
    navigational_status: id % 19 === 0 ? 98 : 0,
    color_code: id % 2 ? "#ff3125" : "#90ee90",
  }));
}

test("overview keeps shape rules, course direction, colours and zero coordinates", () => {
  const ships = [
    { id: 0, lon: 0, lat: 0, speed: 12, course: 90, color_code: "#123456" },
    { id: 1, lon: 12, lat: 25, speed: 0, navigational_status: 5 },
    { id: 2, lon: 12, lat: 25, kind: "aton" },
    { id: 3, lon: 12, lat: 25, navigational_status: 98 },
    { id: 4, lon: 12, lat: 25, speed: 8, course: 360 },
    { id: 5, lon: 181, lat: 25 },
    { id: 6, lon: 0, lat: 86 },
    { id: 7, lon: "", lat: 25 },
    { id: 8, lon: 12, lat: 25, speed: 0.5, course: 45 },
    { id: 9, lon: 12, lat: 25, navigational_status: "at anchor", speed: 0 },
  ];
  const overview = buildShipOverviewData(ships);
  assert.equal(overview.length, 7);
  for (const [bucket, expectedShape] of [
    [overview.circles, "circle"], [overview.arrows, "arrow"],
    [overview.navigationAids, "diamond"],
  ]) {
    for (let index = 0; index < bucket.length; index++) {
      const { ship } = getOverviewPickedShip(bucket, index, ships);
      assert.equal(buildShipMarker(ship, 8).shapeType, expectedShape);
    }
  }
  assert.deepEqual([...overview.arrows.attributes.getPosition.value], [0, 0]);
  assert.deepEqual([...overview.arrows.attributes.getAngle.value], [-90]);
  assert.deepEqual([...overview.arrows.attributes.getColor.value], [18, 52, 86, 255]);
  assert.equal(getOverviewPickedShip(overview.arrows, 0, ships).ship.id, 0);
  for (const index of [-1, 0.5, 999, NaN]) {
    assert.equal(getOverviewPickedShip(overview.arrows, index, ships), null);
  }
});

test("100K individual locations use bounded binary attributes, without sampling", () => {
  const ships = makeShips(100_000);
  const overview = buildShipOverviewData(ships);
  assert.equal(overview.length, ships.length);
  const seen = new Set();
  const transfer = getOverviewTransferList(overview);
  assert.equal(new Set(transfer).size, transfer.length, "each buffer transferred once");
  assert.ok(transfer.reduce((total, buffer) => total + buffer.byteLength, 0) < 3_000_000);
  for (const bucket of [overview.circles, overview.arrows, overview.navigationAids]) {
    assert.equal(bucket.attributes.getPosition.value.length, bucket.length * 2);
    assert.equal(bucket.shipIndices.length, bucket.length);
    for (let i = 0; i < bucket.length; i++) {
      const ship = getOverviewPickedShip(bucket, i, ships).ship;
      seen.add(ship.id);
      assert.equal(bucket.attributes.getPosition.value[i * 2], ship.lon);
      assert.equal(bucket.attributes.getPosition.value[i * 2 + 1], ship.lat);
    }
  }
  assert.equal(seen.size, 100_000);
  // This is the browser worker's ownership-transfer path, not JSON repacking.
  const transferred = structuredClone(overview, { transfer });
  assert.ok(transfer.every((buffer) => buffer.byteLength === 0));
  assert.equal(transferred.length, 100_000);
  assert.equal(transferred.arrows.attributes.getPosition.value.constructor, Float64Array);
});

test("filters and cooperative fallback produce the same complete result", () => {
  const ships = makeShips(10_000);
  const expected = buildShipOverviewData(ships, ["Tanker"]);
  assert.equal(expected.length, 5000);
  const builder = createShipOverviewBuilder(ships, ["Tanker"]);
  let batches = 1;
  while (!builder.step(137)) batches++;
  assert.ok(batches > 1);
  assert.deepEqual(builder.finish(), expected);
  assert.equal(buildShipOverviewData(ships, []).length, 0);
  for (const bucket of [expected.circles, expected.arrows, expected.navigationAids]) {
    for (const index of bucket.shipIndices) assert.equal(ships[index].vessel_type, "Tanker");
  }
});

test("tile results keep the 100K data reference on status/hover/zoom renders", () => {
  const combine = createTileQueryCombiner("ships");
  const ships = makeShips(100_000);
  const firstTile = { ships: ships.slice(0, 60_000) };
  const secondTile = { items: ships.slice(50_000) };
  const first = combine([{ data: firstTile }, { data: secondTile }]);
  assert.equal(first.ships.length, 100_000, "overlapping tile rows are deduplicated");
  for (let frame = 0; frame < 120; frame++) {
    const next = combine([
      { data: firstTile, isFetching: Boolean(frame % 2) },
      { data: secondTile, isPending: false },
    ]);
    assert.equal(next.ships, first.ships, "camera/status changes do not rebuild the data");
  }
  const updated = { ...ships[0], lon: 42 };
  const changed = combine([{ data: { ships: [updated] } }, { data: secondTile }]);
  assert.notEqual(changed.ships, first.ships);
  assert.equal(changed.ships[0], updated);
  assert.equal(combine([]).ships.length, 0, "deselected tiles leave no stale locations");
});

test("ports keep stable references and surface query errors", () => {
  const combine = createTileQueryCombiner("ports");
  const tile = { ports: [{ id: 0 }, { id: 42 }] };
  const first = combine([{ data: tile }]);
  const error = new Error("tile unavailable");
  const failed = combine([{ data: tile, isError: true, error }]);
  assert.equal(failed.ports, first.ports);
  assert.equal(failed.isError, true);
  assert.deepEqual(failed.errors, [error]);
  assert.equal(first.ports[0].id, 0);
});

test("100K ports remain individually selectable in compact binary data", () => {
  const ports = makeShips(100_000);
  const data = buildPortOverviewData(ports);
  assert.equal(data.length, 100_000);
  assert.equal(data.attributes.getPosition.value.byteLength + data.portIndices.byteLength, 2_000_000);
  for (let index = 0; index < data.length; index++) {
    assert.equal(getOverviewPickedPort(data, index, ports).port, ports[index]);
  }
  assert.equal(getOverviewPickedPort(data, -1, ports), null);
  const builder = createPortOverviewBuilder(ports);
  let batches = 1;
  while (!builder.step(1000)) batches++;
  assert.equal(batches, 100);
  assert.deepEqual(builder.finish(), data);
  const combine = createTileQueryCombiner("ports");
  const tile = { ports };
  const first = combine([{ data: tile }]);
  for (let frame = 0; frame < 120; frame++) {
    assert.equal(combine([{ data: tile, isFetching: Boolean(frame % 2) }]).ports, first.ports);
  }
});

test("real worker processes 100K records, then reuses them for filtering", { timeout: 30_000 }, async () => {
  const workerUrl = new URL("../src/lib/map/shipOverview.worker.js", import.meta.url).href;
  const bootstrap = `
    import { parentPort } from 'node:worker_threads';
    globalThis.self = { postMessage: (data, transfer) => parentPort.postMessage(data, transfer) };
    await import(${JSON.stringify(workerUrl)});
    parentPort.on('message', data => globalThis.self.onmessage({data}));
  `;
  const worker = new Worker(new URL(`data:text/javascript,${encodeURIComponent(bootstrap)}`));
  const request = (message) => new Promise((resolve, reject) => {
    const onError = (error) => { worker.off("message", onMessage); reject(error); };
    const onMessage = (result) => { worker.off("error", onError); resolve(result); };
    worker.once("message", onMessage);
    worker.once("error", onError);
    worker.postMessage(message);
  });
  try {
    const full = await request({ requestId: 1, ships: makeShips(100_000) });
    assert.equal(full.requestId, 1);
    assert.equal(full.overview.length, 100_000);
    const filtered = await request({ requestId: 2, vesselTypes: ["Tanker"] });
    assert.equal(filtered.requestId, 2);
    assert.equal(filtered.overview.length, 50_000);
    const cleared = await request({ requestId: 3, ships: [] });
    assert.equal(cleared.overview.length, 0);
  } finally {
    await worker.terminate();
  }
});
