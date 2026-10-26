import { getPortCoordinates } from "./portMarkers.js";

export function createPortOverviewBuilder(ports) {
  const positions = new Float64Array(ports.length * 2);
  const indices = new Uint32Array(ports.length);
  let cursor = 0;
  let length = 0;
  return {
    step(count = ports.length) {
      const end = Math.min(ports.length, cursor + count);
      for (; cursor < end; cursor++) {
        const coordinates = getPortCoordinates(ports[cursor]);
        if (!coordinates) continue;
        positions.set(coordinates, length * 2);
        indices[length++] = cursor;
      }
      return cursor === ports.length;
    },
    finish() {
      return {
        length,
        attributes: { getPosition: { value: positions.slice(0, length * 2), size: 2 } },
        portIndices: indices.slice(0, length),
      };
    },
  };
}

export function buildPortOverviewData(ports) {
  const builder = createPortOverviewBuilder(ports);
  builder.step();
  return builder.finish();
}

export function getOverviewPickedPort(data, index, ports) {
  if (!Number.isInteger(index) || index < 0 || index >= data.length) return null;
  const port = ports[data.portIndices[index]];
  return port ? { port, coordinates: getPortCoordinates(port) } : null;
}

export const EMPTY_PORT_OVERVIEW = buildPortOverviewData([]);
