const TILE_SIZE = 256;

export function getVisibleTiles(map) {
  const zoom = Math.round(map.getZoom());
  const pixelBounds = map.getPixelBounds();
  const worldTileCount = 2 ** zoom;

  const minX = Math.floor(pixelBounds.min.x / TILE_SIZE);
  const maxX = Math.floor((pixelBounds.max.x - 1) / TILE_SIZE);
  const minY = Math.floor(pixelBounds.min.y / TILE_SIZE);
  const maxY = Math.floor((pixelBounds.max.y - 1) / TILE_SIZE);
  const tiles = [];

  for (let rawX = minX; rawX <= maxX; rawX += 1) {
    const x = ((rawX % worldTileCount) + worldTileCount) % worldTileCount;

    for (let y = minY; y <= maxY; y += 1) {
      if (y < 0 || y >= worldTileCount) continue;
      tiles.push({ z: zoom, x, y });
    }
  }

  tiles.sort((a, b) => a.y - b.y || a.x - b.x);
  return tiles;
}
