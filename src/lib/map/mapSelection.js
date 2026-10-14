import { getPortCoordinates } from "./portMarkers";
import { lngLatToTile } from "./mapTiles";

export function clearMapSelection(current) {
  const search = new URLSearchParams(current);
  for (const key of ["shipId", "portId", "lng", "lat"]) search.delete(key);
  return search;
}

export function getMapSelectionCoordinates(current) {
  const search = new URLSearchParams(current);
  if (!search.has("shipId") && !search.has("portId")) return null;
  return getPortCoordinates({ lon: search.get("lng"), lat: search.get("lat") });
}

export function getMapSelectionSearch(kind, id, coordinates, current = "") {
  const search = clearMapSelection(current);
  search.set(kind === "ship" ? "shipId" : "portId", String(id));
  const point = getPortCoordinates({
    lon: coordinates?.[0],
    lat: coordinates?.[1],
  });
  if (point) {
    search.set("lng", String(point[0]));
    search.set("lat", String(point[1]));
  }
  return search;
}

export function getMapSelectionNavigation(kind, id, coordinates) {
  const point = getPortCoordinates({
    lon: coordinates?.[0],
    lat: coordinates?.[1],
  });
  if (!point || id == null || String(id).trim() === "") return null;
  const { z, x, y } = lngLatToTile(point[0], point[1], 12);
  const search = getMapSelectionSearch(kind, id, point);
  return { to: "/dashboard/" + z + "/" + x + "/" + y + "?" + search };
}
