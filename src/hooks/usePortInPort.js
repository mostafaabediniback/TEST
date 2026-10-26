import { useQuery } from "@tanstack/react-query";
import { getPortInPort } from "@/api/ports";

export function usePortInPort(id, page, pageSize, filters = {}, options = {}) {
  return useQuery({
    queryKey: ["port-in-port", id, page, pageSize, filters],
    queryFn: () =>
      getPortInPort(id, {
        page,
        page_size: pageSize,
        ...filters,
      }),
    enabled: Boolean(id),
    ...options,
  });
}
