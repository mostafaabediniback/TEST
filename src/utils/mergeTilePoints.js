export function mergeTilePoints(queries) {
  const points = new Map();

  for (const query of queries) {
    if (!query.data) continue;

    for (const point of query.data) {
      // Without an ID, keep every point rather than merging unrelated locations.
      points.set(point.id ?? Symbol(), point);
    }
  }

  return Array.from(points.values());
}
