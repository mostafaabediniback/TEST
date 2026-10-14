
import axiosClient from "./axiosClient";

export async function getVoyages({
  page = 1,
  page_size = 20,
  id,
  ship_id,
  departure_port_id,
  arrival_port_id,
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
  const response = await axiosClient.get("/mersad/voyages", {
    params: {
      page,
      page_size,
      id,
      ship_id,
      departure_port_id,
      arrival_port_id,
      departure_time_from,
      departure_time_to,
      arrival_time_from,
      arrival_time_to,
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
