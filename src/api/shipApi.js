// api/shipApi.js

import axiosClient from "./axiosClient";

export async function getShipsInTile({ z, x, y }) {
  const response = await axiosClient.get(`/mersad/ship/${z}/${x}/${y}/tile`, {
    params: {
      skip: 0,
    },
  });

  return response.data;
}

export async function getShipById(id) {
  const response = await axiosClient.get(`/mersad/ship/${id}`);
  return response.data;
}

export async function getShipPhoto(id) {
  const response = await axiosClient.get(`/mersad/ship/${id}/image`);
  return response.data;
}

export async function getShipPosition(id) {
  const response = await axiosClient.get(`/mersad/ship/${id}/position`);
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
  const response = await axiosClient.get("/mersad/ships", {
    params: {
      page,
      page_size,
      name,
      flag,
      vessel_class,
      vessel_maker,
      vessel_type,
      gallery_url,
      id,
      imo,
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
      sort_by,
      sort_order,
    },
  });

  return response.data;
}
