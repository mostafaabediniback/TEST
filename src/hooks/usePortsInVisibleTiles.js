// hooks/usePortsInVisibleTiles.js
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useQueries } from "@tanstack/react-query";
import { getPortsInTile } from "@/api/portTiles";
import { createTileQueryCombiner } from "@/lib/map/tileQueryResults";

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

export function usePortsInVisibleTiles({ map, enabled = true }) {
  const subscribe = useCallback(
    (callback) => {
      if (!enabled) return () => {};
      map.on("moveend", callback);
      map.on("zoomend", callback);

      return () => {
        map.off("moveend", callback);
        map.off("zoomend", callback);
      };
    },
    [map, enabled],
  );

  const getSnapshot = useCallback(
    () => enabled ? `${Math.floor(map.getZoom())}:${map.getBounds().toArray().flat().join(",")}` : "",
    [map, enabled],
  );

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const tiles = useMemo(() => snapshot ? getVisibleTiles(map) : [], [map, snapshot]);

  const combine = useMemo(() => createTileQueryCombiner("ports"), []);
  const combined = useQueries({
    combine,
    queries: tiles.map(({ z, x, y }) => ({
      queryKey: ["ports", z, x, y],
      queryFn: ({ signal }) => getPortsInTile({ z, x, y, signal }),
      staleTime: 60_000,
    })),
  });

  return combined;
}
