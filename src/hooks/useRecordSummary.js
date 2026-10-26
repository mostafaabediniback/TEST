import { useQuery } from "@tanstack/react-query";
import { getRecordSummary } from "@/api/records";

export function useRecordSummary(params, options = {}) {
  return useQuery({
    queryKey: ["record-summary", params],
    queryFn: () => getRecordSummary(params),
    ...options,
  });
}
