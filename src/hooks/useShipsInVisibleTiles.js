// hooks/useShipsInVisibleTiles.js

import { useEffect, useMemo, useState } from "react";
import { getVisibleTiles } from "@/lib/map/mapTiles";
import { useQueries } from "@tanstack/react-query";
import { getShipsInTile } from "@/api/ships";
import { useFilters } from "@/context/FilterContext";
import { getVesselTypeFilter } from "@/lib/vesselTypes";
import { createTileQueryCombiner } from "@/lib/map/tileQueryResults";

function getTileKeys(tiles) {
  return tiles
    .map(({ z, x, y }) => `${z}/${x}/${y}`)
    .sort()
    .join("|");
}

export function useShipsInVisibleTiles({ map, limit = 1000 } = {}) {
  const [tiles, setTiles] = useState([]);
  const { vesselTypes } = useFilters();

  const vessel_type = useMemo(
    () => getVesselTypeFilter(vesselTypes),
    [vesselTypes],
  );

  useEffect(() => {
    if (!map) return;

    let timeoutId;
    let previousTileKeys = "";

    function updateTiles() {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const nextTiles = getVisibleTiles(map);
        const nextTileKeys = getTileKeys(nextTiles);

        if (nextTileKeys === previousTileKeys) return;

        previousTileKeys = nextTileKeys;
        setTiles(nextTiles);
      }, 200);
    }

    updateTiles();
    map.on("moveend", updateTiles);
    map.on("resize", updateTiles);

    return () => {
      clearTimeout(timeoutId);
      map.off("moveend", updateTiles);
      map.off("resize", updateTiles);
    };
  }, [map]);

  const combine = useMemo(() => createTileQueryCombiner("ships"), []);
  const combined = useQueries({
    combine,
    queries: (vessel_type?.length === 0 ? [] : tiles).map(({ z, x, y }) => ({
      queryKey: [
        "ships",
        "tile",
        z,
        x,
        y,
        limit,
        { vessel_type: vessel_type ?? null },
      ],

      queryFn: ({ signal }) =>
        getShipsInTile({
          z,
          x,
          y,
          limit,
          vessel_type,
          signal,
        }),

      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 2,
    })),
  });

  return {
    ...combined,
    tiles,
  };
}

