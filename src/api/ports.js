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


// ...existing functions

export async function getPortInPort(id, { page = 1, page_size = 5 } = {}) {
  const response = await axiosClient.get(`/mersad/port/${id}/in_port`, {
    params: { page, page_size },
  });

  return response.data;
}


export async function getPortVoyages(id, options = {}) {
  const {
    page = 1,
    page_size = 20,
    port_type = "arrival",
    arrival_type = "expected",
    arrival_time_from,
    arrival_time_to,
    departure_time_from,
    departure_time_to,
    vessel_name,
    vessel_type,
    vessel_subtype,
    vessel_flag,
    sort_by = "id",
    sort_order = "asc",
  } = options;

  const params = new URLSearchParams();

  Object.entries({
    page,
    page_size,
    port_type,
    arrival_type,
    vessel_name,
    arrival_time_from,
    arrival_time_to,
    departure_time_from,
    departure_time_to,
    vessel_subtype,
    vessel_flag,
    sort_by,
    sort_order,
  }).forEach(([key, value]) => {
    if (value != null && value !== "") params.append(key, value);
  });

  const vesselTypes = Array.isArray(vessel_type)
    ? vessel_type
    : vessel_type
      ? [vessel_type]
      : [];

  vesselTypes.forEach((type) => {
    if (type) params.append("vessel_type", type);
  });

  const response = await axiosClient.get(`/mersad/port/${id}/voyages`, {
    params,
  });

  return response.data;
}