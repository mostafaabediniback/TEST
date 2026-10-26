import assert from "node:assert/strict";
import { test } from "node:test";
import { getSearchMapFocus, getInitialMapView } from "../src/lib/map/mapFocus.js";
import { getMapSelectionSearch, toggleShipTrack, clearMapSelection } from "../src/lib/map/mapSelection.js";

test("search targets include ships, ports and valid zero coordinates", () => {
  for (const kind of ["ship", "port"]) {
    assert.deepEqual(getSearchMapFocus(`/dashboard/12/2048/2048?${kind}Id=0&lng=0&lat=0`), { center: [0, 0], zoom: 12 });
  }
  for (const path of ["/ships/1", "/ports/1", "/dashboard/12/1/1?shipId=1", "/dashboard/12/1/1?shipId=1&lng=181&lat=25", undefined]) {
    assert.equal(getSearchMapFocus(path), null);
  }
});

test("ordinary selections and track toggles do not change the saved camera", () => {
  const saved = { pathname: "/dashboard/16/1/1", center: [55, 25], zoom: 16.75, pitch: 10, bearing: 30 };
  const clicked = getMapSelectionSearch("ship", 7, [54, 24]);
  const tracked = toggleShipTrack(clicked, 7);
  const closed = clearMapSelection(tracked);
  for (const search of [clicked, tracked, closed]) {
    assert.equal(getInitialMapView({ mapView: saved, pathname: saved.pathname, coordinates: search.has("lng") ? [54, 24] : null }), saved);
  }
});

test("direct links use the URL zoom, while an explicit search request overrides it", () => {
  const tileView = { center: [55, 25], zoom: 8 };
  assert.deepEqual(getInitialMapView({ tileView, pathname: "/dashboard/8/1/1", coordinates: [54, 24] }), { center: [54, 24], zoom: 8 });
  const request = { id: 1, center: [0, 0], zoom: 12 };
  assert.deepEqual(getInitialMapView({ focusRequest: request, tileView }), { center: [0, 0], zoom: 12 });
});
