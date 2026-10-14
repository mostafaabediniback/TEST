import axiosClient from "./axiosClient";

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
  const params = {
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
  };
  const response = await axiosClient.get("/mersad/ports", { params });

  return response.data;
}
export async function getPortDetails(id) {
  const response = await axiosClient.get(`/mersad/port/${id}/details`);
  return response.data;
}


export async function getPortArrivalVoyages(id= {}) {
  const response = await axiosClient.get(
    `/mersad/port/${id}/arrival_voyages`,
  );
  return response.data;
}

export async function getPortDepartureVoyages(id= {}) {
  const response = await axiosClient.get(
    `/mersad/port/${id}/departure_voyages`,
  );
  return response.data;
}