import { useQuery } from "@tanstack/react-query";
import { searchPortsByName } from "@/api/ports";

export function usePortsByName(name, page = 1, pageSize = 100, id, enabled = true) {
  return useQuery({
    queryKey: ["ports-by-name", name, page, pageSize, id],
    queryFn: () => searchPortsByName(name, page, pageSize, id),
    enabled,
  });
}
