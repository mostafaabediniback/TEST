import { getPortArrivalDeparturePorts, getPortArrivalFlags, getPortArrivalSubtypes, getPortArrivalTypes, getPortDepartureArrivalPorts, getPortDepartureFlags, getPortDepartureSubtypes, getPortDepartureTypes } from "@/api/getPortStats";
import { useQuery } from "@tanstack/react-query";


function usePortStat(queryKey, fetcher, id, options = {}) {
  return useQuery({
    queryKey: ["port-stats", queryKey, id, options],
    queryFn: () => fetcher(id, options),
    enabled: id != null,
  });
}

export const usePortArrivalDeparturePorts = (id, options) =>
  usePortStat("arrival-departure-ports", getPortArrivalDeparturePorts, id, options);

export const usePortArrivalFlags = (id, options) =>
  usePortStat("arrival-flags", getPortArrivalFlags, id, options);

export const usePortArrivalTypes = (id, options) =>
  usePortStat("arrival-types", getPortArrivalTypes, id, options);

export const usePortArrivalSubtypes = (id, options) =>
  usePortStat("arrival-subtypes", getPortArrivalSubtypes, id, options);

export const usePortDepartureArrivalPorts = (id, options) =>
  usePortStat("departure-arrival-ports", getPortDepartureArrivalPorts, id, options);

export const usePortDepartureFlags = (id, options) =>
  usePortStat("departure-flags", getPortDepartureFlags, id, options);

export const usePortDepartureTypes = (id, options) =>
  usePortStat("departure-types", getPortDepartureTypes, id, options);

export const usePortDepartureSubtypes = (id, options) =>
  usePortStat("departure-subtypes", getPortDepartureSubtypes, id, options);