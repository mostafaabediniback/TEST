// import { useMemo } from "react";
// import { useQueries } from "@tanstack/react-query";
// import { getCarsByTile } from "../api/carsApi";

// export function useCarsByTiles(tiles) {
//   const queries = useQueries({
//     queries: tiles.map((tile) => ({
//       queryKey: [
//         "cars-tile",
//         tile.z,
//         tile.x,
//         tile.y,
//       ],

//       queryFn: ({ signal }) =>
//         getCarsByTile({
//           z: tile.z,
//           x: tile.x,
//           y: tile.y,
//           signal,
//         }),

//       staleTime: 4000,

//       gcTime: 5 * 60 * 1000,

//       refetchInterval: 5000,

//       refetchIntervalInBackground: false,

//       refetchOnWindowFocus: false,

//       retry: 1,
//     })),
//   });

//   const cars = useMemo(() => {
//     const carsMap = new Map();

//     for (const query of queries) {
//       if (!query.data) continue;

//       for (const car of query.data) {
//         carsMap.set(car.id, car);
//       }
//     }

//     return Array.from(carsMap.values());
//   }, [queries]);

//   const isLoading = queries.some(
//     (query) => query.isLoading
//   );

//   const isFetching = queries.some(
//     (query) => query.isFetching
//   );

//   const hasError = queries.some(
//     (query) => query.isError
//   );

//   return {
//     cars,
//     isLoading,
//     isFetching,
//     hasError,
//     queries,
//   };
// }