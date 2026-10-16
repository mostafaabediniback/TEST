import { getShipCoordinates } from "../shipNavigation.js";

const EARTH_CIRCUMFERENCE = 40075016.68557849;
const ELLIPSE_SEGMENTS = 32;
const FOOTPRINT_MIN_ZOOM = 12;
const LOA_DISPLAY_SCALE = 1.2;

const HULL = [
  [0, 0.5],
  [0.5, 0.25],
  [0.5, -0.4],
  [0.35, -0.5],
  [-0.35, -0.5],
  [-0.5, -0.4],
  [-0.5, 0.25],
];

const ARROW = [
  [0, 0.5],
  [0.5, -0.5],
  [0, -0.25],
  [-0.5, -0.5],
];

function positiveNumber(value) {
  if (
    value == null ||
    typeof value === "boolean" ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function validAngle(value) {
  if (
    value == null ||
    typeof value === "boolean" ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const angle = Number(value);
  // AIS uses 511 for unavailable heading and 360 for unavailable course.
  return Number.isFinite(angle) && angle >= 0 && angle < 360
    ? angle
    : null;
}

function getShipColor(colorCode) {
  const match = /^#?([0-9a-f]{6})$/i.exec(
    String(colorCode ?? "").trim(),
  );

  if (!match) return [37, 99, 235, 255];

  const hex = match[1];

  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
    255,
  ];
}

export function getShipDirection(ship, position = ship?.position) {
  for (const value of [
    position?.heading,
    position?.true_heading,
    ship?.heading,
    ship?.true_heading,
    position?.course,
    position?.cog,
    ship?.course,
    ship?.cog,
  ]) {
    const angle = validAngle(value);
    if (angle !== null) return angle;
  }

  return null;
}

export function getShipMarker(ship, zoom, position) {
  const coordinates = getShipCoordinates(ship);
  if (!coordinates) return null;

  const direction = getShipDirection(ship, position);
  const length = positiveNumber(ship.loa);
  const width = positiveNumber(ship.width);
  const color = getShipColor(ship.color_code);

  if (zoom >= FOOTPRINT_MIN_ZOOM && length && width) {
    const latitudeRadians =
      (Math.max(
        -85.0511287798066,
        Math.min(85.0511287798066, coordinates[1]),
      ) *
        Math.PI) /
      180;

    const worldSize = 512 * 2 ** zoom;
    const centerX = ((coordinates[0] + 180) / 360) * worldSize;
    const centerY =
      ((1 -
        Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2)) / Math.PI) /
        2) *
      worldSize;

    const metersPerPixel =
      (EARTH_CIRCUMFERENCE * Math.max(Math.cos(latitudeRadians), 0.000001)) /
      worldSize;

    const lengthPixels = (length * LOA_DISPLAY_SCALE) / metersPerPixel;
    const widthPixels = width / metersPerPixel;
    const longest = Math.max(lengthPixels, widthPixels);
    const shortest = Math.min(lengthPixels, widthPixels);

    const scale = Math.min(
      Math.max(1, 18 / longest, 8 / shortest),
      96 / longest,
    );

    const displayedLength = Math.max(18, lengthPixels * scale);
    const displayedWidth = Math.max(8, widthPixels * scale);
    const angle = ((direction ?? 0) * Math.PI) / 180;

    const shape =
      direction === null
        ? Array.from({ length: ELLIPSE_SEGMENTS }, (_, index) => {
            const phase = (index * 2 * Math.PI) / ELLIPSE_SEGMENTS;
            return [Math.sin(phase) / 2, Math.cos(phase) / 2];
          })
        : HULL;

    function getPolygon(padding = 0) {
      const polygon = shape.map(([x, y]) => {
        const across = x * (displayedWidth + 2 * padding);
        const along = y * (displayedLength + 2 * padding);
        const east = across * Math.cos(angle) + along * Math.sin(angle);
        const north = -across * Math.sin(angle) + along * Math.cos(angle);

        return [
          ((centerX + east) / worldSize) * 360 - 180,
          (Math.atan(
            Math.sinh(
              Math.PI * (1 - (2 * (centerY - north)) / worldSize),
            ),
          ) *
            180) /
            Math.PI,
        ];
      });

      return [...polygon, polygon[0]];
    }

    return {
      ship,
      coordinates,
      direction,
      color,
      polygon: getPolygon(),
      selectionPolygon: getPolygon(6),
      radius: Math.hypot(displayedLength, displayedWidth) / 2,
    };
  }

  const markerScale = Math.max(0.8, Math.min(1.25, 0.8 + zoom * 0.03));
  const displayedLength = 16 * markerScale;
  const displayedWidth = 12 * markerScale;

  const latitudeRadians =
    (Math.max(
      -85.0511287798066,
      Math.min(85.0511287798066, coordinates[1]),
    ) *
      Math.PI) /
    180;

  const worldSize = 512 * 2 ** zoom;
  const centerX = ((coordinates[0] + 180) / 360) * worldSize;
  const centerY =
    ((1 -
      Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2)) / Math.PI) /
      2) *
    worldSize;

  const angle = ((direction ?? 0) * Math.PI) / 180;

  function getArrowPolygon(padding = 0) {
    const polygon = ARROW.map(([x, y]) => {
      const across = x * (displayedWidth + 2 * padding);
      const along = y * (displayedLength + 2 * padding);
      const east = across * Math.cos(angle) + along * Math.sin(angle);
      const north = -across * Math.sin(angle) + along * Math.cos(angle);

      return [
        ((centerX + east) / worldSize) * 360 - 180,
        (Math.atan(
          Math.sinh(
            Math.PI * (1 - (2 * (centerY - north)) / worldSize),
          ),
        ) *
          180) /
          Math.PI,
      ];
    });

    return [...polygon, polygon[0]];
  }

  return {
    ship,
    coordinates,
    direction,
    color,
    polygon: getArrowPolygon(),
    selectionPolygon: getArrowPolygon(3 * markerScale),
    radius: Math.hypot(displayedLength, displayedWidth) / 2,
  };
}