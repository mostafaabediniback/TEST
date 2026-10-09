const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

// Prefer either side of the marker, then use vertical space on narrow maps.
export function getMapPopupPlacement(point, size, bounds, gap) {
  const { width, height } = size;
  const { left, top, right, bottom } = bounds;
  const candidates = [
    { side: "right", x: point.x + gap, y: point.y - height / 2 },
    { side: "left", x: point.x - gap - width, y: point.y - height / 2 },
    { side: "bottom", x: point.x - width / 2, y: point.y + gap },
    { side: "top", x: point.x - width / 2, y: point.y - gap - height },
  ];
  const fits = ({ side, x, y }) => side === "left" || side === "right"
    ? x >= left && x + width <= right
    : y >= top && y + height <= bottom;
  const visibleArea = ({ x, y }) =>
    Math.max(0, Math.min(x + width, right) - Math.max(x, left)) *
    Math.max(0, Math.min(y + height, bottom) - Math.max(y, top));
  const placement = candidates.find(fits) ?? candidates.reduce((best, candidate) =>
    visibleArea(candidate) > visibleArea(best) ? candidate : best);
  const x = clamp(placement.x, left, right - width);
  const y = clamp(placement.y, top, bottom - height);

  return {
    side: placement.side,
    offset: [x - point.x, y - point.y],
    tipX: clamp(point.x - x, 16, width - 16),
    tipY: clamp(point.y - y, 16, height - 16),
  };
}
