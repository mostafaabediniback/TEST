import assert from "node:assert/strict";
import test from "node:test";
import { getVisibleTiles, lngLatToTile } from "../src/utils/getVisibleTiles.js";
import { mergeTilePoints } from "../src/utils/mergeTilePoints.js";

function mapBounds(west, east, north, south, zoom) {
  return {
    getZoom: () => zoom,
    getBounds: () => ({
      getWest: () => west,
      getEast: () => east,
      getNorth: () => north,
      getSouth: () => south,
    }),
  };
}

test("Tehran center yields valid tile coordinates for URL parameters", () => {
  assert.deepEqual(lngLatToTile(51.3998, 35.6997, 5), { z: 5, x: 20, y: 12 });
  const visible = getVisibleTiles(mapBounds(50, 53, 37, 34, 5.8));
  assert.ok(visible.some(({ z, x, y }) => z === 5 && x === 20 && y === 12));
});

test("tiles across the date line wrap without fetching the whole world", () => {
  const tiles = getVisibleTiles(mapBounds(170, -170, 10, -10, 2));
  assert.deepEqual([...new Set(tiles.map((tile) => tile.x))].sort(), [0, 3]);
  assert.equal(new Set(tiles.map(({ z, x, y }) => `${z}/${x}/${y}`)).size, tiles.length);
});

test("wide view and polar bounds produce only valid unique tiles", () => {
  const tiles = getVisibleTiles(mapBounds(-540, 540, 90, -90, 2));
  assert.equal(tiles.length, 16);
  assert.ok(tiles.every(({ x, y }) => x >= 0 && x < 4 && y >= 0 && y < 4));
});

test("duplicate point IDs merge while missing IDs preserve all points", () => {
  const first = { id: 0, status: 1 };
  const updated = { id: 0, status: 2 };
  const anonymousA = { longitude: 51, latitude: 35 };
  const anonymousB = { id: null, longitude: 52, latitude: 36 };
  assert.deepEqual(mergeTilePoints([
    { data: [first, anonymousA] },
    { data: undefined },
    { data: [updated, anonymousB] },
  ]), [updated, anonymousA, anonymousB]);
});

test("no ready tile data returns an empty points layer", () => {
  assert.deepEqual(mergeTilePoints([]), []);
  assert.deepEqual(mergeTilePoints([{ data: undefined }, { data: [] }]), []);
});
