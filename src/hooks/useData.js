import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { getPointsByTile } from "@/server/dataApi";
import { mergeTilePoints } from "@/utils/mergeTilePoints";

export const useData = (tiles = []) => {
  const queries = useQueries({
    queries: tiles.map(
      (tile) => ({
        queryKey: [
          "map-data",
          tile.z,
          tile.x,
          tile.y,
        ],

        queryFn: ({ signal }) =>
          getPointsByTile({
            z: tile.z,
            x: tile.x,
            y: tile.y,
            signal,
          }),

        staleTime: 30_000,
        refetchInterval: 30_000,

        gcTime:
          5 * 60 * 1000,

        refetchOnWindowFocus: false,
        refetchOnReconnect: true,

        retry: 1,
      }),
    ),
  });

  const data = useMemo(() => mergeTilePoints(queries), [queries]);

  const isLoading =
    queries.some(
      (query) =>
        query.isLoading,
    );

  const isError =
    queries.some(
      (query) =>
        query.isError,
    );

  return {
    data,
    isLoading,
    isError,
  };
};
