import { useQuery } from "@tanstack/react-query";
import { getCountryFlags } from "@/api/countries";

export function useCountryFlags(options = {}) {
  return useQuery({
    queryKey: ["country-flags"],
    queryFn: getCountryFlags,
    ...options,
  });
}