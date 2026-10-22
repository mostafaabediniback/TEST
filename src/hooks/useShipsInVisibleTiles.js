// hooks/useShipsInVisibleTiles.js

import { useEffect, useMemo, useState } from "react";
import { getVisibleTiles } from "@/lib/map/mapTiles";
import { useQueries } from "@tanstack/react-query";
import { getShipsInTile } from "@/api/ships";
import { useFilters } from "@/context/FilterContext";
import { getVesselTypeFilter } from "@/lib/vesselTypes";

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

    function applyTiles() {
        const nextTiles = getVisibleTiles(map);
        const nextTileKeys = getTileKeys(nextTiles);

        if (nextTileKeys === previousTileKeys) return;

        previousTileKeys = nextTileKeys;
        setTiles(nextTiles);
    }

    function updateTiles() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(applyTiles, 200);
    }

    // Do not delay the initial ships request.
    applyTiles();
    map.on("moveend", updateTiles);
    map.on("resize", updateTiles);

    return () => {
      clearTimeout(timeoutId);
      map.off("moveend", updateTiles);
      map.off("resize", updateTiles);
    };
  }, [map]);

  const queries = useQueries({
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

  const ships = useMemo(() => {
    const allShips = queries.flatMap(
      (query) => query.data?.ships ?? query.data?.items ?? [],
    );

    const uniqueShips = new Map();

    for (const ship of allShips) {
      const id = ship.id ?? ship.mmsi ?? ship.imo;

      if (id !== undefined && id !== null) {
        uniqueShips.set(String(id), ship);
      }
    }

    return Array.from(uniqueShips.values());
  }, [queries]);

  return {
    ships,
    tiles,
    isPending: queries.some((query) => query.isPending),
    isFetching: queries.some((query) => query.isFetching),
    isError: queries.some((query) => query.isError),
    errors: queries
      .filter((query) => query.isError)
      .map((query) => query.error),
  };
}
