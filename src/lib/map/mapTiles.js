const MAX_LATITUDE = 85.05112878;
const wrap = (value, count) => ((value % count) + count) % count;

export function lngLatToTile(lng, lat, z) {
  const count = 2 ** z;
  const latitude = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat));
  const radians = (latitude * Math.PI) / 180;
  return {
    z,
    x: wrap(Math.floor(((lng + 180) / 360) * count), count),
    y: Math.max(
      0,
      Math.min(
        count - 1,
        Math.floor(((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * count),
      ),
    ),
  };
}

export function tileToLngLat(z, x, y) {
  const count = 2 ** z;
  return [
    (x / count) * 360 - 180,
    (Math.atan(Math.sinh(Math.PI - (2 * Math.PI * y) / count)) * 180) / Math.PI,
  ];
}

export function getVisibleTiles(map) {
  const z = Math.floor(map.getZoom());
  const count = 2 ** z;
  const bounds = map.getBounds();
  const west = bounds.getWest();
  let east = bounds.getEast();
  if (east < west) east += 360;
  let startX = Math.floor(((west + 180) / 360) * count);
  let endX = Math.floor(((east + 180) / 360) * count);
  if (endX - startX + 1 > count) {
    startX = 0;
    endX = count - 1;
  }
  const northY = lngLatToTile(0, bounds.getNorth(), z).y;
  const southY = lngLatToTile(0, bounds.getSouth(), z).y;
  const tiles = [];
  for (let x = startX; x <= endX; x += 1) {
    for (let y = northY; y <= southY; y += 1)
      tiles.push({ z, x: wrap(x, count), y });
  }
  return tiles;
}

export function getMapView(map, pathname) {
  const center = map.getCenter();
  return {
    pathname,
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}
