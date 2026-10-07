const MAX_LATITUDE = 85.05112878;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeX(x, max) {
  return ((x % max) + max) % max;
}

export function lngLatToTile(lng, lat, z) {
  const tileCount = 2 ** z;

  const x = Math.floor(((lng + 180) / 360) * tileCount);

  const clampedLat = clamp(lat, -MAX_LATITUDE, MAX_LATITUDE);

  const latRad = (clampedLat * Math.PI) / 180;

  const y = Math.floor(
    ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * tileCount,
  );

  return {
    z,

    x: normalizeX(x, tileCount),

    y: clamp(y, 0, tileCount - 1),
  };
}

export function getVisibleTiles(map) {
  const z = Math.floor(map.getZoom());

  const tileCount = 2 ** z;

  const bounds = map.getBounds();

  const west = bounds.getWest();
  const east = bounds.getEast();
  const north = bounds.getNorth();
  const south = bounds.getSouth();

  let startX = Math.floor(((west + 180) / 360) * tileCount);

  let endX = Math.floor(((east + 180) / 360) * tileCount);

  if (east < west) {
    endX += tileCount;
  }

  if (endX - startX + 1 > tileCount) {
    startX = 0;
    endX = tileCount - 1;
  }

  const startY = lngLatToTile(0, north, z).y;

  const endY = lngLatToTile(0, south, z).y;

  const tiles = [];
  const uniqueTiles = new Set();

  for (let rawX = startX; rawX <= endX; rawX += 1) {
    const x = normalizeX(rawX, tileCount);

    for (let y = startY; y <= endY; y += 1) {
      const key = `${z}/${x}/${y}`;

      if (uniqueTiles.has(key)) {
        continue;
      }

      uniqueTiles.add(key);

      tiles.push({
        z,
        x,
        y,
      });
    }
  }

  return tiles;
}
