function readPositions(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const key of ["positions", "items", "results", "data", "body"]) {
      if (data[key] != null) return readPositions(data[key]);
    }
  }
  throw new Error("Expected an array of historical ship positions");
}

function number(value) {
  if (
    value == null ||
    typeof value === "boolean" ||
    String(value).trim() === ""
  )
    return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function timestamp(value) {
  if (
    value == null ||
    typeof value === "boolean" ||
    String(value).trim() === ""
  )
    return null;
  const numeric = number(value);
  if (numeric !== null)
    return Math.abs(numeric) < 1e12 ? numeric * 1000 : numeric;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getShipTrackPath(data) {
  const positions = readPositions(data).flatMap((position) => {
    const lon = number(position?.lon ?? position?.longitude);
    const lat = number(position?.lat ?? position?.latitude);
    if (
      lon === null ||
      lat === null ||
      Math.abs(lon) > 180 ||
      Math.abs(lat) > 85.05112878
    )
      return [];
    return [{ lon, lat, time: timestamp(position.time ?? position.timestamp) }];
  });
  // When timestamps are absent, retain the ordering supplied by the API.
  if (positions.every((position) => position.time !== null)) {
    positions.sort((a, b) => a.time - b.time);
  }
  const path = [];
  for (const { lon, lat } of positions) {
    const previous = path.at(-1);
    // Keep dateline crossings short rather than drawing across the world.
    const longitude = previous
      ? lon + 360 * Math.round((previous[0] - lon) / 360)
      : lon;
    if (!previous || longitude !== previous[0] || lat !== previous[1])
      path.push([longitude, lat]);
  }
  return path;
}

export function getShipTrackBounds(path, centerLongitude = 0) {
  if (path.length < 2) return null;
  let west = Infinity;
  let east = -Infinity;
  let south = Infinity;
  let north = -Infinity;
  for (const [longitude, latitude] of path) {
    west = Math.min(west, longitude);
    east = Math.max(east, longitude);
    south = Math.min(south, latitude);
    north = Math.max(north, latitude);
  }
  const shift = 360 * Math.round((centerLongitude - (west + east) / 2) / 360);
  return [
    [west + shift, south],
    [east + shift, north],
  ];
}
