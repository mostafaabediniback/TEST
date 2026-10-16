export function getMapMarkerScale(zoom) {
  const scale = 2 ** ((zoom - 10) / 4);
  return Math.max(0.5, Math.min(1.6, scale));
}