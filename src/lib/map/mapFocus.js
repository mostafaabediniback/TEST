import { getMapSelectionCoordinates } from "./mapSelection.js";

// Calling this helper does not move the map. Only AppSearch submits the target
// as a one-shot camera request; ordinary URL selections remain camera-neutral.
export function getSearchMapFocus(path) {
  if (typeof path !== "string") return null;
  const url = new URL(path, "https://map.local");
  if (!/^\/dashboard\/\d+\/\d+\/\d+$/.test(url.pathname)) return null;
  const center = getMapSelectionCoordinates(url.search);
  return center ? { center, zoom: 12 } : null;
}

export function getInitialMapView({ focusRequest, mapView, pathname, tileView, coordinates }) {
  if (focusRequest) return { center: focusRequest.center, zoom: focusRequest.zoom };
  if (mapView?.pathname === pathname) return mapView;
  if (tileView) return coordinates ? { ...tileView, center: coordinates } : tileView;
  return { center: [45, 40.97989806962013], zoom: 2 };
}
