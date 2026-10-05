import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCars } from "@/api/carsApi";

export function useCars(filters) {
  const hasTile = [filters.z, filters.x, filters.y].every(Number.isFinite);

  return useQuery({
    // Keep filter results separate while sharing successful and pending tile
    // requests across map movements and component remounts.
    queryKey: hasTile
      ? ["cars", `${filters.z}/${filters.x}/${filters.y}`, { search: filters.search, status: filters.status }]
      : ["cars", filters],
    queryFn: () => getCars(filters),
    placeholderData: keepPreviousData,
    ...(hasTile
      ? {
          staleTime: Infinity,
          gcTime: Infinity,
          refetchInterval: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        }
      : { refetchInterval: 3000, staleTime: 1500 }),
  });
}
