import axiosClient from "./axiosClient";

export async function getCountryFlags() {
  const response = await axiosClient.get("/mersad/countries/names");
  return response.data;
}