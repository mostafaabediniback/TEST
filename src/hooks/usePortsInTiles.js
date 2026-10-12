import { useQueries } from "@tanstack/react-query";
import { getPortsInTile } from "@/api/portApi";
import { mergePortTiles } from "@/lib/portMarkers";
import { useVisibleMapTiles } from "./useVisibleMapTiles";

export function usePortsInVisibleTiles({ map } = {}) {
  const tiles = useVisibleMapTiles(map);
  const queries = useQueries({
    queries: tiles.map(({ z, x, y }) => ({
      queryKey: ["ports", "tile", z, x, y],
      queryFn: ({ signal }) => getPortsInTile({ z, x, y, signal }),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 2,
    })),
  });
  return {
    ports: mergePortTiles(queries.map((query) => query.data)),
    isPending: queries.some((query) => query.isPending),
    isError: queries.some((query) => query.isError),
  };
}
