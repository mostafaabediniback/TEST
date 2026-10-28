import { toUnixSeconds } from "@/lib/dateTime";
// api/ships.js

import axiosClient from "./axiosClient";

export async function getShipsInTile({
  z,
  x,
  y,
  vessel_type,
  signal,
}) {
  const params = new URLSearchParams({ skip: "0" });

  const types = Array.isArray(vessel_type)
    ? vessel_type
    : vessel_type == null
      ? []
      : [vessel_type];

  for (const value of types) {
    params.append("vessel_type", value);
  }

  const response = await axiosClient.get(
    `/mersad/ship/${z}/${x}/${y}/tile`,
    { params, signal },
  );

  return response.data;
}


export async function getShipById(id) {
  const response = await axiosClient.get(`/mersad/ship/${id}`);
  return response.data;
}

export async function getShipPhoto(id) {
  const response = await axiosClient.get(`/mersad/ship/${id}/image`, {
    responseType: "blob",
  });

  return response.data;
}


export async function getShipPosition(id) {
  const response = await axiosClient.get(`/mersad/ship/${id}/position`);
  return response.data;
}

export async function getShipPositions(id, { signal } = {}) {
  const response = await axiosClient.get(`/mersad/ship/${encodeURIComponent(id)}/voyage/positions`, { signal });
  return response.data;
}

export async function getShipVoyage(id) {
  const response = await axiosClient.get(`/mersad/ship/${id}/voyage`);
  return response.data;
}

export async function getPortById(id) {
  const response = await axiosClient.get(`/mersad/port/${id}`);
  return response.data;
}

export async function getShips({
  page = 10,
  page_size = 20,
  name,
  flag,
  vessel_class,
  vessel_maker,
  vessel_type,
  gallery_url,
  id,
  imo,
  imo_like,
  yob,
  dwt,
  yob_from,
  yob_to,
  loa_min,
  loa_max,
  width_min,
  width_max,
  draft_min,
  draft_max,
  dwt_min,
  dwt_max,
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
    name,
    flag,
    vessel_class,
    vessel_maker,
    gallery_url,
    id,
    imo,
    imo_like,
    yob,
    dwt,
    yob_from,
    yob_to,
    loa_min,
    loa_max,
    width_min,
    width_max,
    draft_min,
    draft_max,
    dwt_min,
    dwt_max,
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

  const types = Array.isArray(vessel_type)
    ? vessel_type
    : vessel_type == null
      ? []
      : [vessel_type];

  for (const type of types) {
    if (type) params.append("vessel_type", type);
  }

  const response = await axiosClient.get("/mersad/ships", { params });
  return response.data;
}

export async function getShipSummary(id) {
  const response = await axiosClient.get(`/mersad/ship/${id}/summary`);
  return response.data;
}

export async function getShipCompanies(id) {
  const response = await axiosClient.get(`/mersad/ship/${id}/companies`);
  return response.data;
}


export async function getShipTotalCount() {
  const { data } = await axiosClient.get("/mersad/ships/total_count");
  return Number(data);
}


export async function searchShipsByName(name, page = 1, pageSize = 100, id) {
  const response = await axiosClient.get("/mersad/ships/name", {
    params: {
      name,
      page,
      page_size: pageSize,
      ...(id ? { id } : {}),
    },
  });

  return response.data;
}



export async function getShipVoyages({ shipId, ...params }) {
  const response = await axiosClient.get(
    `/mersad/ship/${encodeURIComponent(shipId)}/voyages`,
    { params },
  );

  return response.data;
}