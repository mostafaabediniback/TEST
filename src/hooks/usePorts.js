// hooks/usePorts.js
import { getPorts } from "@/api/portApi";
import { useQuery } from "@tanstack/react-query";
export function usePorts(params = {}, options = {}) {
  return useQuery({
    queryKey: ["ports", params],
    queryFn: () => getPorts(params),
    ...options,
  });
}
