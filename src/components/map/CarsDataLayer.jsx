import { useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getCarsByTile } from "@/api/mockCarsApi";
import { useFilters } from "@/context/FilterContext";
import { useSearch } from "@/context/SearchContext";
import { CarsCanvasLayer } from "./CarsCanvasLayer";

export function CarsDataLayer({ tiles, onStatsChange }) {
  const { status } = useFilters();
  const { debouncedSearch } = useSearch();

  const queries = useQueries({
    queries: tiles.map((tile) => ({
      queryKey: ["cars-tile", tile.z, tile.x, tile.y],
      queryFn: ({ signal }) =>
        getCarsByTile({
          z: tile.z,
          x: tile.x,
          y: tile.y,
          signal,
        }),
      staleTime: 4_000,
      gcTime: 5 * 60_000,
      refetchInterval: 5_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      retry: 1,
    })),
  });

  const cars = useMemo(() => {
    const uniqueCars = new Map();

    for (const query of queries) {
      if (!query.data) continue;
      for (const car of query.data) uniqueCars.set(car.id, car);
    }

    const search = debouncedSearch.trim().toLocaleLowerCase("fa");

    return Array.from(uniqueCars.values()).filter((car) => {
      if (status !== "all" && car.status !== status) return false;
      if (!search) return true;

      return (
        car.driverName.toLocaleLowerCase("fa").includes(search) ||
        car.plate.toLocaleLowerCase("fa").includes(search) ||
        String(car.id).toLocaleLowerCase("fa").includes(search)
      );
    });
  }, [queries, status, debouncedSearch]);

  const fetchingCount = queries.reduce(
    (count, query) => count + (query.isFetching ? 1 : 0),
    0,
  );

  const stats = useMemo(
    () => ({
      cars: cars.length,
      tiles: tiles.length,
      fetching: fetchingCount,
    }),
    [cars.length, tiles.length, fetchingCount],
  );

  useEffect(() => {
    onStatsChange?.(stats);
  }, [onStatsChange, stats]);

  return <CarsCanvasLayer cars={cars} />;
}

// import CarsCanvasLayer from "./CarsCanvasLayer";
// import { useCarsByTiles } from "../../hooks/useCarsByTiles";

// function CarsDataLayer({ tiles }) {
//   const {
//     cars,
//     isLoading,
//     isFetching,
//     hasError,
//   } = useCarsByTiles(tiles);

//   if (hasError) {
//     console.error("Error loading cars");
//   }

//   return (
//     <CarsCanvasLayer cars={cars} />
//   );
// }

// export default CarsDataLayer;