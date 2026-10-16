// hooks/usePortVoyagesList.js
import { useQuery } from "@tanstack/react-query";
import { getPortVoyages } from "@/api/ports";

export function usePortVoyagesList(id, filters = {}, options = {}) {
  const params = {
    page: 1,
    page_size: 20,
    port_type: "arrival",
    arrival_type: "expected",
    sort_by: "id",
    sort_order: "asc",
    ...filters,
  };

  return useQuery({
    queryKey: ["port-voyages-list", id, params],
    queryFn: () => getPortVoyages(id, params),
    enabled: Boolean(id),
    ...options,
  });
}