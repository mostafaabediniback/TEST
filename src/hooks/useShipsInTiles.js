import { useEffect, useMemo, useState } from "react";
import { getVisibleTiles } from "@/lib/mapTiles";
import { useQueries } from "@tanstack/react-query";
import { getShipsInTile } from "@/api/shipApi";

function getTileKeys(tiles) {
  return tiles
    .map(({ z, x, y }) => `${z}/${x}/${y}`)
    .sort()
    .join("|");
}

export function useShipsInVisibleTiles({ map, limit = 1000 } = {}) {
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    let timeoutId;
    let previousTileKeys = "";

    function updateTiles() {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const nextTiles = getVisibleTiles(map);
        const nextTileKeys = getTileKeys(nextTiles);

        // Do not update React state if the visible tiles did not change.
        if (nextTileKeys === previousTileKeys) {
          return;
        }

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

  const queries = useQueries({
    queries: tiles.map(({ z, x, y }) => ({
      // This must contain the complete tile identity.
      queryKey: ["ships", "tile", z, x, y, limit],

      queryFn: () =>
        getShipsInTile({
          z,
          x,
          y,
          limit,
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
