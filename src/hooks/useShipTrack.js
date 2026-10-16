import { useQuery } from "@tanstack/react-query";
import { getShipPositions } from "@/api/ships";
import { getShipTrackPath } from "@/lib/map/shipTrack";

const EMPTY_PATH = [];

export function useShipTrack(id, enabled = false) {
  const query = useQuery({
    queryKey: ["ship", id, "positions"],
    queryFn: async ({ signal }) => getShipTrackPath(await getShipPositions(id, { signal })),
    enabled: id != null && id !== "" && enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  return { ...query, path: query.data ?? EMPTY_PATH };
}
