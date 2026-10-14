import { useQuery } from "@tanstack/react-query";
import { getPortArrivalVoyages, getPortDepartureVoyages } from "@/api/ports";

export function usePortVoyages(id, options = {}) {
  return useQuery({
    queryKey: ["port-voyages", id],
    queryFn: async () => {
      const [arrivals, departures] = await Promise.all([
        getPortArrivalVoyages(id),
        getPortDepartureVoyages(id),
      ]);

      return {
        arrivals: Array.isArray(arrivals) ? arrivals : [],
        departures: Array.isArray(departures) ? departures : [],
      };
    },
    enabled: Boolean(id),
    ...options,
  });
}
