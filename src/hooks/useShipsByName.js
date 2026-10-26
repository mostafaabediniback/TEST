// hooks/useShipsByName.js
import { useQuery } from "@tanstack/react-query";
import { searchShipsByName } from "@/api/ships";

export function useShipsByName(
  name,
  page = 1,
  pageSize = 100,
  id,
  enabled = true,
) {
  return useQuery({
    queryKey: ["ships-by-name", name, page, pageSize, id],
    queryFn: () => searchShipsByName(name, page, pageSize, id),
    enabled,
  });
}
