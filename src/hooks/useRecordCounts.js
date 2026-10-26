import { useQuery } from "@tanstack/react-query";
import { getRecordCounts } from "@/api/records";

export function useRecordCounts(params, options = {}) {
  return useQuery({
    queryKey: ["record-counts", params],
    queryFn: () => getRecordCounts(params),
    ...options,
  });
}
