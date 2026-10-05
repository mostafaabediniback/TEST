import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCars } from "@/api/carsApi";

export function useCars(filters) {
  return useQuery({
    queryKey: ["cars", filters],
    queryFn: () => getCars(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 3000,
    staleTime: 1500,
  });
}
