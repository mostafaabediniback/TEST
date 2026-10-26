import { ALL_VESSEL_TYPES, getVesselType } from "../vesselTypes.js";
import { readShipOverview } from "./shipMarkers.js";

// Detailed hulls/vectors stay bounded even if a dense tile contains 100K ships.
// Every location remains in the overview; the selected ship always gets detail.
export const MAX_DETAILED_SHIPS = 2000;

function createBucket(capacity) {
  return {
    length: 0,
    positions: new Float64Array(capacity * 2),
    colors: new Uint8Array(capacity * 4),
    angles: new Float32Array(capacity),
    indices: new Uint32Array(capacity),
  };
}

function finishBucket(bucket, shape) {
  const length = bucket.length;
  const attributes = {
    getPosition: { value: bucket.positions.slice(0, length * 2), size: 2 },
  };
  if (shape !== "diamond") {
    attributes[shape === "circle" ? "getFillColor" : "getColor"] = {
      value: bucket.colors.slice(0, length * 4), size: 4,
    };
  }
  if (shape === "arrow") {
    attributes.getAngle = { value: bucket.angles.slice(0, length), size: 1 };
  }
  return { length, attributes, shipIndices: bucket.indices.slice(0, length) };
}

// The same builder is used in the worker and in the cooperative fallback.
export function createShipOverviewBuilder(ships, vesselTypes = ALL_VESSEL_TYPES) {
  const selected = new Set(vesselTypes);
  const includeAll = ALL_VESSEL_TYPES.every((type) => selected.has(type));
  const circles = createBucket(ships.length);
  const arrows = createBucket(ships.length);
  const navigationAids = createBucket(ships.length);
  let cursor = 0;
  return {
    step(count = ships.length) {
      const end = Math.min(ships.length, cursor + count);
      for (; cursor < end; cursor++) {
        const ship = ships[cursor];
        if (!ship || (!includeAll && !selected.has(getVesselType(ship)))) continue;
        const marker = readShipOverview(ship);
        if (!marker) continue;
        const bucket = marker.shapeType === "diamond" ? navigationAids :
          marker.shapeType === "arrow" ? arrows : circles;
        const index = bucket.length++;
        bucket.positions.set(marker.positionCoordinates, index * 2);
        bucket.colors.set(marker.fillColor, index * 4);
        // AIS courses are clockwise; IconLayer angles are counterclockwise.
        bucket.angles[index] = -marker.rotationDegrees;
        bucket.indices[index] = cursor;
      }
      return cursor === ships.length;
    },
    finish() {
      return {
        length: circles.length + arrows.length + navigationAids.length,
        circles: finishBucket(circles, "circle"),
        arrows: finishBucket(arrows, "arrow"),
        navigationAids: finishBucket(navigationAids, "diamond"),
      };
    },
  };
}

export function buildShipOverviewData(ships, vesselTypes) {
  const builder = createShipOverviewBuilder(ships, vesselTypes);
  builder.step();
  return builder.finish();
}

export function getOverviewTransferList(data) {
  const buffers = [];
  for (const bucket of [data.circles, data.arrows, data.navigationAids]) {
    buffers.push(bucket.shipIndices.buffer);
    for (const attribute of Object.values(bucket.attributes)) {
      buffers.push(attribute.value.buffer);
    }
  }
  return buffers;
}

export function getOverviewPickedShip(bucket, index, ships) {
  if (!Number.isInteger(index) || index < 0 || index >= bucket.length) return null;
  const ship = ships[bucket.shipIndices[index]];
  return ship ? { ship } : null;
}

export const EMPTY_SHIP_OVERVIEW = buildShipOverviewData([]);
