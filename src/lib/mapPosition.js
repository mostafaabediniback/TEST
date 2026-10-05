export const DEFAULT_CENTER = [35.7008, 51.4001];
export const DEFAULT_ZOOM = 13;
// Match the existing raster layer's supported zoom range.
export const MAX_MAP_ZOOM = 18;
const MAX_LATITUDE = 85.0511287798066;

export function latLngToTile(lat, lng, z) {
  const n = 2 ** z;
  const wrappedLng = ((lng + 180) % 360 + 360) % 360 - 180;
  const latRad = (Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat)) * Math.PI) / 180;
  return {
    x: Math.min(n - 1, Math.floor(((wrappedLng + 180) / 360) * n)),
    y: Math.max(0, Math.min(n - 1, Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) * n / 2))),
  };
}

export function buildViewport(lat, lng, z) {
  return { lat, lng, z, ...latLngToTile(lat, lng, z) };
}

function readNumber(params, key) {
  const value = params.get(key);
  return value == null || value.trim() === "" ? NaN : Number(value);
}

export function readUrlPosition(search) {
  const params = new URLSearchParams(search);
  const [z, x, y] = ["z", "x", "y"].map((key) => readNumber(params, key));
  if (![z, x, y].every(Number.isInteger) || z < 0 || z > MAX_MAP_ZOOM ||
      x < 0 || y < 0 || x >= 2 ** z || y >= 2 ** z) return null;

  const lat = readNumber(params, "lat");
  const lng = readNumber(params, "lng");
  // Integer XYZ alone identifies a tile. Keep sub-tile precision in the URL,
  // but only accept it when it agrees with the authoritative XYZ position.
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90) {
    const precise = buildViewport(lat, lng, z);
    if (precise.x === x && precise.y === y) return precise;
  }

  const n = 2 ** z;
  return {
    z, x, y,
    lat: Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 0.5) / n))) * 180 / Math.PI,
    lng: (x + 0.5) / n * 360 - 180,
  };
}

export function replaceUrlPosition(position) {
  const url = new URL(window.location.href);
  for (const key of ["z", "x", "y", "lat", "lng"]) {
    url.searchParams.set(key, String(position[key]));
  }
  if (url.href !== window.location.href) {
    // Preserve the router's history state, other query parameters, and hash.
    window.history.replaceState(window.history.state, "", url);
  }
}
