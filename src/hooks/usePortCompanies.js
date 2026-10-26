import { getPortCompanies } from "@/api/ports";
import { useQuery } from "@tanstack/react-query";

export function usePortCompanies({
  portId,
  radiusMeters = 12000,
  enabled = true,
}) {
  const hasPortId = portId !== undefined && portId !== null;

  return useQuery({
    queryKey: ["port", "companies", portId, radiusMeters],
    queryFn: () => getPortCompanies(portId, radiusMeters),
    enabled: hasPortId && enabled,
  });
}
