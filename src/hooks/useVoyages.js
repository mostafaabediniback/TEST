// src/hooks/useVoyages.js
import { getVoyages } from "@/api/voyages";
import { useQuery } from "@tanstack/react-query";


export function useVoyages(params = {}, options = {}) {
  return useQuery({
    queryKey: ["voyages", params],
    queryFn: () => getVoyages(params),
    ...options,
  });
}
