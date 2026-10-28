import { toUnixSeconds } from "@/lib/dateTime";

import axiosClient from "./axiosClient";

export async function getVoyages({
  page = 1,
  page_size = 20,
  id,
  ship_id,
  departure_port_id,
  arrival_port_id,
  ship_type,
  ship_subtype,
  departure_time_from,
  departure_time_to,
  arrival_time_from,
  arrival_time_to,
  create_time_from,
  create_time_to,
  update_time_from,
  update_time_to,
  sort_by = "id",
  sort_order = "desc",
} = {}) {
  const params = new URLSearchParams();

  const filters = {
    page,
    page_size,
    id,
    ship_id,
    departure_port_id,
    arrival_port_id,
    departure_time_from: toUnixSeconds(departure_time_from),
    departure_time_to: toUnixSeconds(departure_time_to),
    arrival_time_from: toUnixSeconds(arrival_time_from),
    arrival_time_to: toUnixSeconds(arrival_time_to),
    create_time_from: toUnixSeconds(create_time_from),
    create_time_to: toUnixSeconds(create_time_to),
    update_time_from: toUnixSeconds(update_time_from),
    update_time_to: toUnixSeconds(update_time_to),
    sort_by,
    sort_order,
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }

  // Append each type as a repeated query parameter, like:
  // ?ship_type=...&ship_type=...
  for (const type of Array.isArray(ship_type)
    ? ship_type
    : ship_type == null
      ? []
      : [ship_type]) {
    if (type) params.append("ship_type", type);
  }

  for (const subtype of Array.isArray(ship_subtype)
    ? ship_subtype
    : ship_subtype == null
      ? []
      : [ship_subtype]) {
    if (subtype) params.append("ship_subtype", subtype);
  }

  const response = await axiosClient.get("/mersad/voyages", { params });
  return response.data;
}


export async function getVoyagePositionsTimeline(voyageId) {
  const response = await axiosClient.get(
    `/mersad/voyage/${voyageId}/positions/timeline`
  );

  return response.data;
}