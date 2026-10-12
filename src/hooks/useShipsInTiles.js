import { useMemo } from "react";
import { useVisibleMapTiles } from "./useVisibleMapTiles";
import { useQueries } from "@tanstack/react-query";
import { getShipsInTile } from "@/api/shipApi";
import { useFilters } from "@/context/FilterContext";
import { getVesselTypeFilter } from "@/lib/vesselTypes";

export function useShipsInVisibleTiles({ map, limit = 1000 } = {}) {
  const tiles = useVisibleMapTiles(map);
  const { vesselTypes } = useFilters();
  const type = useMemo(() => getVesselTypeFilter(vesselTypes), [vesselTypes]);

  const queries = useQueries({
    queries: (type?.length === 0 ? [] : tiles).map(({ z, x, y }) => ({
      // Cache each tile independently for every vessel-type selection.
      queryKey: ["ships", "tile", z, x, y, limit, { type: type ?? null }],

      queryFn: ({ signal }) =>
        getShipsInTile({
          z,
          x,
          y,
          limit,
          type,
          signal,
        }),

      // Do not request the same tile again for 5 minutes.
      staleTime: 5 * 60 * 1000,

      // Keep unused tile data in the cache for 10 minutes.
      gcTime: 10 * 60 * 1000,

      // Do not automatically refetch the tile.
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,

      retry: 2,
    })),
  });

  const ships = useMemo(() => {
    const allShips = queries.flatMap((query) => {
      return query.data?.ships ?? query.data?.items ?? [];
    });

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
