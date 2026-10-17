import { toUnixSeconds } from "@/lib/dateTime";
import axiosClient from "./axiosClient";

async function getPortStats(id, direction, stat, options = {}) {
  const {
    page = 1,
    page_size = 20,
    start,
    end,
    sort_by = "value",
    sort_order = "desc",
  } = options;

  const params = {
    page,
    page_size,
    start: toUnixSeconds(start),
    end: toUnixSeconds(end),
    sort_by,
    sort_order,
  };

  const response = await axiosClient.get(
    `/mersad/port/${id}/${direction}/stats/${stat}`,
    { params },
  );

  return response.data;
}

export const getPortArrivalDeparturePorts = (id, options) =>
  getPortStats(id, "arrival", "departure_ports", options);

export const getPortArrivalFlags = (id, options) =>
  getPortStats(id, "arrival", "flags", options);

export const getPortArrivalTypes = (id, options) =>
  getPortStats(id, "arrival", "type", options);

export const getPortArrivalSubtypes = (id, options) =>
  getPortStats(id, "arrival", "subtype", options);

export const getPortDepartureArrivalPorts = (id, options) =>
  getPortStats(id, "departure", "arrival_ports", options);

export const getPortDepartureFlags = (id, options) =>
  getPortStats(id, "departure", "flags", options);

export const getPortDepartureTypes = (id, options) =>
  getPortStats(id, "departure", "type", options);

export const getPortDepartureSubtypes = (id, options) =>
  getPortStats(id, "departure", "subtype", options);