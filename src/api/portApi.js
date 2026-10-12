// api/ports.js

import axiosClient from "./axiosClient";
import { readPortTileData } from "@/lib/portMarkers";

export async function getPortsInTile({ z, x, y, signal }) {
  const response = await axiosClient.get(`/ports/${z}/${x}/${y}/tile`, { signal });
  return readPortTileData(response.data);
}

export async function getPorts({
  page = 1,
  page_size = 20,
  id,
  country_code,
  timezone,
  name,
  alternative_name,
  unlo_code,
  country_name,
  gallery_url,
  lon_min,
  lon_max,
  lat_min,
  lat_max,
  create_time_from,
  create_time_to,
  update_time_from,
  update_time_to,
  sort_by = "id",
  sort_order = "asc",
} = {}) {
  const response = await axiosClient.get("/mersad/ports", {
    params: {
      page,
      page_size,
      id,
      country_code,
      timezone,
      name,
      alternative_name,
      unlo_code,
      country_name,
      gallery_url,
      lon_min,
      lon_max,
      lat_min,
      lat_max,
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
