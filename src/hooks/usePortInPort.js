// hooks/usePortInPort.js
import { useQuery } from "@tanstack/react-query";
import { getPortInPort } from "@/api/ports";

export function usePortInPort(id, page , pageSize , options = {}) {
  return useQuery({
    queryKey: ["port-in-port", id, page, pageSize],
    queryFn: () => getPortInPort(id, { page, page_size: pageSize }),
    enabled: Boolean(id),
    ...options,
  });
}