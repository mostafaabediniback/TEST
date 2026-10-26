import { getShipVoyages } from "@/api/ships";
import { useQuery } from "@tanstack/react-query";

export function useShipVoyages(params, options = {}) {
  return useQuery({
    queryKey: ["ship-voyages", params],
    queryFn: () => getShipVoyages(params),
    enabled: params.shipId != null,
    ...options,
  });
}
