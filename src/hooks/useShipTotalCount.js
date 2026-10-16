import { useQuery } from "@tanstack/react-query";
import { getShipTotalCount } from "@/api/ships";

export function useShipTotalCount(options = {}) {
  return useQuery({
    queryKey: ["ship-total-count"],
    queryFn: getShipTotalCount,
    ...options,
  });
}