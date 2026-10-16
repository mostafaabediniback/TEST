import { useQuery } from "@tanstack/react-query";
import { getPortDetails } from "@/api/ports";

export function usePortDetails(id, options = {}) {
  return useQuery({
    queryKey: ["port-details", id],
    queryFn: () => getPortDetails(id),
    enabled: Boolean(id),
    ...options,
  });
}