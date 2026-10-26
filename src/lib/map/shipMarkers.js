import { getShipCoordinates } from "../shipNavigation.js";

const EARTH_CIRCUMFERENCE_METERS = 40075016.68557849;
const MAX_MAP_LATITUDE = 85.0511287798066;
const CIRCLE_SEGMENTS = 24;
// API-specific target code, separate from the standard AIS navigation statuses.
const NAVIGATION_AID_STATUS = 98;

// Build marker data here; ShipMarkers.jsx handles drawing and user interaction.
// These display rules belong to our app and can be adjusted independently.
export const SHIP_MARKER_OPTIONS = Object.freeze({
  minZoomForShipBody: 14, // Show the ship's actual size from this zoom level.
  movingSpeedThresholdKnots: 0.5, // Treat speeds above this value as moving.
  movementLineMinutes: 6, // Show the distance travelled in this many minutes.
  // Anchored and moored ships may keep their hull shape at low speed.
  stationaryHullStatuses: Object.freeze([1, 5]),
});

// Shape templates: X points right and Y points forward.
// Scale and rotate these points before placing them on the map.
const ARROW_POINTS = [
  [0, 0.5],
  [0.5, -0.5],
  [0, -0.25],
  [-0.5, -0.5],
];
const DIAMOND_POINTS = [
  [0, 0.5],
  [0.5, 0],
  [0, -0.5],
  [-0.5, 0],
];
const CIRCLE_POINTS = Array.from({ length: CIRCLE_SEGMENTS }, (_, index) => {
  const angleRadians = (index * 2 * Math.PI) / CIRCLE_SEGMENTS;
  return [Math.sin(angleRadians) / 2, Math.cos(angleRadians) / 2];
});

// Keep zero as a valid value; missing or invalid data stays unknown.
function readNumber(value) {
  if (
    value == null ||
    typeof value === "boolean" ||
    String(value).trim() === ""
  ) {
    return null;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function readAngle(value) {
  const numberValue = readNumber(value);
  // Includes north (0); excludes AIS unavailable values 360 and 511.
  if (numberValue === null || numberValue < 0 || numberValue >= 360) {
    return null;
  }
  return numberValue;
}

// Prefer position details, then fall back to the ship record.
// Accept the field names used by different API responses.
function readShipValue(
  ship,
  positionDetails,
  fieldNames,
  parseValue = readNumber,
) {
  for (const dataRecord of [positionDetails, ship]) {
    for (const fieldName of fieldNames) {
      const value = parseValue(dataRecord?.[fieldName]);
      if (value !== null) return value;
    }
  }
  return null;
}

function readNavigationStatus(value) {
  const numberValue = readNumber(value);
  if (numberValue === NAVIGATION_AID_STATUS) return NAVIGATION_AID_STATUS;
  if (Number.isInteger(numberValue) && numberValue >= 0 && numberValue <= 15) {
    return numberValue;
  }
  const statusText = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
  return (
    {
      "at anchor": 1,
      anchored: 1,
      moored: 5,
      "under way using engine": 0,
      "underway using engine": 0,
      "under way sailing": 8,
      "underway sailing": 8,
      "aid to navigation": NAVIGATION_AID_STATUS,
    }[statusText] ?? null
  );
}

// Read heading, course, speed in knots, and navigation status.
export function readShipMovement(ship, positionDetails = ship?.position) {
  return {
    headingDegrees: readShipValue(
      ship,
      positionDetails,
      ["true_heading", "heading"],
      readAngle,
    ),
    courseDegrees: readShipValue(
      ship,
      positionDetails,
      ["course", "cog", "course_over_ground"],
      readAngle,
    ),
    speedKnots: readShipValue(
      ship,
      positionDetails,
      ["speed", "sog", "speed_over_ground"],
      (value) => {
        const numberValue = readNumber(value);
        return numberValue !== null && numberValue >= 0 && numberValue < 102.3
          ? numberValue
          : null;
      },
    ),
    navigationStatus: readShipValue(
      ship,
      positionDetails,
      ["navigational_status", "navigation_status", "nav_status", "navStatus"],
      readNavigationStatus,
    ),
  };
}

// Kept for callers needing a single best available orientation.
export function getShipDirection(ship, positionDetails = ship?.position) {
  const { headingDegrees, courseDegrees } = readShipMovement(
    ship,
    positionDetails,
  );
  return headingDegrees ?? courseDegrees;
}

function readShipSize(ship, positionDetails) {
  const possibleSizeRecords = [
    positionDetails?.antenna,
    ship?.antenna,
    positionDetails?.dimensions,
    ship?.dimensions,
    positionDetails,
    ship,
  ];
  for (const dataRecord of possibleSizeRecords) {
    const candidateValues = [
      dataRecord?.bow ?? dataRecord?.to_bow ?? dataRecord?.dimension_to_bow,
      dataRecord?.stern ??
        dataRecord?.to_stern ??
        dataRecord?.dimension_to_stern,
      dataRecord?.port ?? dataRecord?.to_port ?? dataRecord?.dimension_to_port,
      dataRecord?.starboard ??
        dataRecord?.to_starboard ??
        dataRecord?.dimension_to_starboard,
    ].map(readNumber);
    // Distances from the reported position to each side of the hull, in metres.
    if (candidateValues.every((value) => value !== null && value >= 0)) {
      const [frontMeters, backMeters, leftMeters, rightMeters] =
        candidateValues;
      if (frontMeters + backMeters > 0 && leftMeters + rightMeters > 0) {
        return {
          frontMeters,
          backMeters,
          leftMeters,
          rightMeters,
          usesEstimatedPosition: false,
        };
      }
    }
  }
  const lengthMeters = readShipValue(
    ship,
    positionDetails,
    ["loa", "length"],
    readPositiveNumber,
  );
  const widthMeters = readShipValue(
    ship,
    positionDetails,
    ["width", "beam"],
    readPositiveNumber,
  );
  // Without antenna offsets, approximate the position as the centre.
  if (!lengthMeters || !widthMeters) return null;
  return {
    frontMeters: lengthMeters / 2,
    backMeters: lengthMeters / 2,
    leftMeters: widthMeters / 2,
    rightMeters: widthMeters / 2,
    usesEstimatedPosition: true,
  };
}

function readPositiveNumber(value) {
  const numberValue = readNumber(value);
  return numberValue !== null && numberValue > 0 ? numberValue : null;
}

function readFillColor(colorCode) {
  const hexMatch = /^#?([0-9a-f]{6})$/i.exec(String(colorCode ?? "").trim());
  if (!hexMatch) return [37, 99, 235, 255];
  return [0, 2, 4]
    .map((offset) => parseInt(hexMatch[1].slice(offset, offset + 2), 16))
    .concat(255);
}

// Overview markers keep one position per ship. Pixel-sized shapes are drawn by
// instanced GPU layers instead of tessellating two polygons for every record.
export function readShipOverview(ship) {
  const positionCoordinates = getShipCoordinates(ship);
  if (
    !positionCoordinates ||
    Math.abs(positionCoordinates[0]) > 180 ||
    Math.abs(positionCoordinates[1]) > MAX_MAP_LATITUDE
  ) return null;

  const { courseDegrees, speedKnots, navigationStatus } = readShipMovement(ship);
  const shipType = String(ship.kind ?? ship.vessel_type ?? ship.type ?? "")
    .trim().toLowerCase();
  const isNavigationAid = navigationStatus === NAVIGATION_AID_STATUS ||
    ["aton", "aid to navigation", "navigation aid"].includes(shipType);

  return {
    positionCoordinates,
    shapeType: isNavigationAid ? "diamond" :
      speedKnots !== null && speedKnots > SHIP_MARKER_OPTIONS.movingSpeedThresholdKnots &&
      courseDegrees !== null ? "arrow" : "circle",
    rotationDegrees: courseDegrees ?? 0,
    fillColor: readFillColor(ship.color_code),
  };
}

// Convert hull sizes from metres to pixels, then place the points on the map.
function createMapPointConverter(positionCoordinates, mapZoom) {
  const latitudeRadians = (positionCoordinates[1] * Math.PI) / 180;
  const worldSizePixels = 512 * 2 ** mapZoom;
  const shipPixelX = ((positionCoordinates[0] + 180) / 360) * worldSizePixels;
  const shipPixelY =
    ((1 - Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2)) / Math.PI) /
      2) *
    worldSizePixels;
  const metersPerPixel =
    (EARTH_CIRCUMFERENCE_METERS * Math.cos(latitudeRadians)) / worldSizePixels;

  function pixelOffsetToMapCoordinates(eastPixels, northPixels) {
    // Preserve unwrapped longitude for short dateline crossings.
    return [
      ((shipPixelX + eastPixels) / worldSizePixels) * 360 - 180,
      (Math.atan(
        Math.sinh(
          Math.PI * (1 - (2 * (shipPixelY - northPixels)) / worldSizePixels),
        ),
      ) *
        180) /
        Math.PI,
    ];
  }
  // Rotate a point around the ship's position and return [longitude, latitude].
  function placePointOnMap([rightPixels, forwardPixels], rotationDegrees) {
    const angleRadians = (rotationDegrees * Math.PI) / 180;
    return pixelOffsetToMapCoordinates(
      rightPixels * Math.cos(angleRadians) +
        forwardPixels * Math.sin(angleRadians),
      -rightPixels * Math.sin(angleRadians) +
        forwardPixels * Math.cos(angleRadians),
    );
  }
  return { metersPerPixel, placePointOnMap };
}

/**
 * Build the data needed to draw one ship at the current map zoom.
 * Input: ship record, zoom, optional position details, and display settings.
 * Output: shape, colour, outlines, movement line, and status icon; or null.
 */
export function buildShipMarker(
  ship,
  mapZoom,
  positionDetails = ship?.position,
  customSettings = {},
) {
  // Skip ships without a valid map position.
  const positionCoordinates = getShipCoordinates(ship);
  if (
    !positionCoordinates ||
    Math.abs(positionCoordinates[0]) > 180 ||
    Math.abs(positionCoordinates[1]) > MAX_MAP_LATITUDE ||
    !Number.isFinite(mapZoom)
  ) {
    return null;
  }

  // Read the ship data and decide which display rules apply.
  const displaySettings = { ...SHIP_MARKER_OPTIONS, ...customSettings };
  const movement = readShipMovement(ship, positionDetails);
  const { headingDegrees, courseDegrees, speedKnots, navigationStatus } =
    movement;
  const isMoving =
    speedKnots !== null &&
    speedKnots > displaySettings.movingSpeedThresholdKnots;
  const isZoomedIn = mapZoom >= displaySettings.minZoomForShipBody;
  const shipSize = readShipSize(ship, positionDetails);
  const shipType = String(ship.kind ?? ship.vessel_type ?? ship.type ?? "")
    .trim()
    .toLowerCase();
  const isNavigationAid =
    navigationStatus === NAVIGATION_AID_STATUS ||
    ["aton", "aid to navigation", "navigation aid"].includes(shipType);
  const isAnchoredOrMoored =
    displaySettings.stationaryHullStatuses.includes(navigationStatus);

  const showShipBody =
    !isNavigationAid &&
    isZoomedIn &&
    headingDegrees !== null &&
    shipSize !== null &&
    (isMoving || isAnchoredOrMoored);

  // Choose the main shape. Navigation aids take priority over ship shapes.
  let shapeType = "circle";
  if (isNavigationAid) {
    shapeType = "diamond";
  } else if (showShipBody) {
    shapeType = "hull";
  } else if (isMoving && courseDegrees !== null) {
    shapeType = "arrow";
  }

  // Rotate hulls by heading and simple arrows by course over ground.
  let rotationDegrees = null;
  if (shapeType === "hull") rotationDegrees = headingDegrees;
  if (shapeType === "arrow") rotationDegrees = courseDegrees;

  const fillColor = readFillColor(ship.color_code);
  const mapPointConverter = createMapPointConverter(
    positionCoordinates,
    mapZoom,
  );
  const iconScale = Math.max(0.8, Math.min(1.25, 0.8 + mapZoom * 0.03));

  // Build the shape around the reported position, using pixel offsets.
  function buildShapePixelPoints(paddingPixels = 0) {
    if (shapeType === "hull") {
      const { frontMeters, backMeters, leftMeters, rightMeters } = shipSize;
      const paddingMeters = paddingPixels * mapPointConverter.metersPerPixel;
      const frontCornerMeters =
        frontMeters -
        Math.min(
          (frontMeters + backMeters) * 0.2,
          (leftMeters + rightMeters) * 0.8,
        );
      // Hull outline: rear left, rear right, front right, bow, front left.
      return [
        [-leftMeters - paddingMeters, -backMeters - paddingMeters],
        [rightMeters + paddingMeters, -backMeters - paddingMeters],
        [rightMeters + paddingMeters, frontCornerMeters],
        [(rightMeters - leftMeters) / 2, frontMeters + paddingMeters],
        [-leftMeters - paddingMeters, frontCornerMeters],
      ].map(([x, y]) => [
        x / mapPointConverter.metersPerPixel,
        y / mapPointConverter.metersPerPixel,
      ]);
    }
    let shapePoints = CIRCLE_POINTS;
    if (shapeType === "arrow") shapePoints = ARROW_POINTS;
    if (shapeType === "diamond") shapePoints = DIAMOND_POINTS;
    const lengthPixels =
      (shapeType === "arrow" ? 16 : 8) * iconScale + 2 * paddingPixels;
    const widthPixels =
      (shapeType === "arrow" ? 12 : 8) * iconScale + 2 * paddingPixels;
    return shapePoints.map(([x, y]) => [x * widthPixels, y * lengthPixels]);
  }

  // Rotate the points and repeat the first point to close the outline.
  // Padding expands only the selection outline, leaving the hull size intact.
  function buildMapOutline(paddingPixels = 0) {
    const points = buildShapePixelPoints(paddingPixels).map((point) =>
      mapPointConverter.placePointOnMap(point, rotationDegrees ?? 0),
    );
    return [...points, points[0]];
  }

  // Add a course line only to moving hulls; simple arrows already show direction.
  // One knot is one nautical mile per hour, and one nautical mile is 1,852 metres.
  let movementLine = null;
  if (
    shapeType === "hull" &&
    isMoving &&
    courseDegrees !== null &&
    displaySettings.movementLineMinutes > 0
  ) {
    // const lineLengthMeters =
    //   (speedKnots * 1852 * displaySettings.movementLineMinutes) / 60;
    console.log(shipSize.leftMeters)
    console.log(shipSize.rightMeters)
    const lineLengthMeters = (shipSize.leftMeters + shipSize.rightMeters* 185 * displaySettings.movementLineMinutes) / 60  ;
    const lineLengthPixels =
      lineLengthMeters / mapPointConverter.metersPerPixel;
    const lineEndCoordinates = mapPointConverter.placePointOnMap(
      [0, lineLengthPixels],
      courseDegrees,
    );
    movementLine = {
      lineCoordinates: [positionCoordinates, lineEndCoordinates],
      arrowHeadCoordinates: [
        [-4, lineLengthPixels - 6],
        [0, lineLengthPixels],
        [4, lineLengthPixels - 6],
      ].map((point) => mapPointConverter.placePointOnMap(point, courseDegrees)),
    };
  }

  // Choose the status badge separately from the main shape.
  let statusIconName = null;
  if (!isNavigationAid && isZoomedIn) {
    if (navigationStatus === 1) statusIconName = "anchor";
    if (navigationStatus === 5) statusIconName = "moored";
  }

  // Return drawing data; the React component creates the map layers.
  return {
    ship,
    positionCoordinates,
    rotationDegrees,
    fillColor,
    shapeType,
    ...movement,
    movementLine, // Movement line and arrowhead, or null when there is no line.
    outlineCoordinates: buildMapOutline(),
    selectionOutlineCoordinates: buildMapOutline(
      shapeType === "hull" ? 6 : 3 * iconScale,
    ),
    popupOffsetPixels: Math.max(
      ...buildShapePixelPoints().map(([x, y]) => Math.hypot(x, y)),
    ),
    usesEstimatedPosition: showShipBody ? shipSize.usesEstimatedPosition : null,
    statusIconName,
  };
}
