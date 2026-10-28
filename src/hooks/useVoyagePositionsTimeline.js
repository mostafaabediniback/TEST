import { useQuery } from "@tanstack/react-query";
import { getVoyagePositionsTimeline } from "@/api/voyages";

export function useVoyagePositionsTimeline(voyageId) {
  return useQuery({
    queryKey: ["voyagePositionsTimeline", voyageId],
    queryFn: () => getVoyagePositionsTimeline(voyageId),
    enabled: voyageId != null,
  });
}
