export function getPortCoordinates(port) {
  const lat = port?.lat ?? port?.latitude;
  const lon = port?.lon ?? port?.longitude;
  if (lat == null || lon == null || typeof lat === "boolean" || typeof lon === "boolean" || String(lat).trim() === "" || String(lon).trim() === "") return null;
  const latitude = Number(lat), longitude = Number(lon);
  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 85.05112878
    ? [longitude, latitude] : null;
}

export function getPortKey(port) {
  return String(port.id ?? port.unlo_code ?? port.unlocode ?? getPortCoordinates(port)?.join(","));
}

export function readPortTileData(data) {
  if (Array.isArray(data)) return data;
  for (const key of ["ports", "items", "results", "data"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  if (data?.data && typeof data.data === "object") return readPortTileData(data.data);
  throw new Error("Unexpected ports tile response: expected an array or ports/items/results/data array");
}

export function mergePortTiles(tiles) {
  const ports = new Map();
  for (const rows of tiles) for (const port of rows ?? []) {
    if (getPortCoordinates(port)) ports.set(getPortKey(port), port);
  }
  return [...ports.values()];
}
