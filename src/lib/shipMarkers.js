import { getShipCoordinates } from "./shipNavigation.js";

const ARROW = [[0, 0.5], [0.5, -0.5], [0, -0.25], [-0.5, -0.5]];

function validAngle(value) {
  if (value == null || typeof value === "boolean" || String(value).trim() === "") return null;
  const angle = Number(value);
  // AIS uses 511 for unavailable heading and 360 for unavailable course.
  return Number.isFinite(angle) && angle >= 0 && angle < 360 ? angle : null;
}

export function getShipDirection(ship, position = ship?.position) {
  for (const value of [position?.heading, position?.true_heading, ship?.heading, ship?.true_heading,
  position?.course, position?.cog, ship?.course, ship?.cog]) {
    const angle = validAngle(value);
    if (angle !== null) return angle;
  }
  return null;
}

export function getShipMarker(ship, zoom, position) {
  const coordinates = getShipCoordinates(ship);
  if (!coordinates) return null;
  const latitudeRadians = Math.max(-85.0511287798066, Math.min(85.0511287798066, coordinates[1])) * Math.PI / 180;
  const worldSize = 512 * 2 ** zoom;
  const centerX = (coordinates[0] + 180) / 360 * worldSize;
  const centerY = (1 - Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2)) / Math.PI) / 2 * worldSize;
  // A filled arrow stays readable at every zoom, including ships without dimensions.
  const displayedLength = 24;
  const displayedWidth = 18;
  const direction = getShipDirection(ship, position);
  const angle = (direction ?? 0) * Math.PI / 180;
  const shape = ARROW;

  function getPolygon(padding = 0) {
    const polygon = shape.map(([x, y]) => {
      const across = x * (displayedWidth + 2 * padding);
      const along = y * (displayedLength + 2 * padding);
      const east = across * Math.cos(angle) + along * Math.sin(angle);
      const north = -across * Math.sin(angle) + along * Math.cos(angle);
      // Inverse Mercator keeps the displayed proportions exact even when zoomed out.
      return [(centerX + east) / worldSize * 360 - 180,
      Math.atan(Math.sinh(Math.PI * (1 - 2 * (centerY - north) / worldSize))) * 180 / Math.PI];
    });
    return [...polygon, polygon[0]];
  }

  return {
    ship,
    coordinates,
    direction,
    polygon: getPolygon(),
    selectionPolygon: getPolygon(6),
    radius: Math.hypot(displayedLength, displayedWidth) / 2,
  };
}
