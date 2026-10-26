// hooks/usePortsInVisibleTiles.js
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useQueries } from "@tanstack/react-query";
import { getPortsInTile } from "@/api/portTiles";

function getVisibleTiles(map) {
  const zoom = Math.floor(map.getZoom());

  return map
    .coveringTiles({ tileSize: 256, minzoom: zoom, maxzoom: zoom })
    .map(({ canonical }) => ({
      z: canonical.z,
      x: canonical.x,
      y: canonical.y,
    }));
}

export function usePortsInVisibleTiles({ map }) {
  const subscribe = useCallback(
    (callback) => {
      map.on("moveend", callback);
      map.on("zoomend", callback);

      return () => {
        map.off("moveend", callback);
        map.off("zoomend", callback);
      };
    },
    [map],
  );

  const getSnapshot = useCallback(
    () => `${map.getZoom()}:${map.getBounds().toArray().flat().join(",")}`,
    [map],
  );

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const tiles = useMemo(() => getVisibleTiles(map), [map, snapshot]);

  const queries = useQueries({
    queries: tiles.map(({ z, x, y }) => ({
      queryKey: ["ports", z, x, y],
      queryFn: ({ signal }) => getPortsInTile({ z, x, y, signal }),
      staleTime: 60_000,
    })),
  });

  const ports = useMemo(() => {
    const byId = new Map();

    for (const query of queries) {
      for (const port of query.data?.ports ?? []) {
        byId.set(port.id, port);
      }
    }

    return [...byId.values()];
  }, [queries]);

  return {
    ports,
    isPending: queries.some((query) => query.isPending),
    isError: queries.some((query) => query.isError),
    errors: queries.filter((query) => query.error).map((query) => query.error),
  };
}