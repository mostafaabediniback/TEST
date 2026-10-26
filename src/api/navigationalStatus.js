import axiosClient from "./axiosClient";

export async function getNavigationalStatuses() {
  const response = await axiosClient.get(
    "/mersad/position/distinct/navigational_status",
  );

  return response.data;
}
