import axiosClient from "./axiosClient";

export async function getRecordCounts({ interval, start, end }) {
  const params = { interval };

  if (start != null) params.start = start;
  if (end != null) params.end = end;

  const response = await axiosClient.get("/mersad/stats/counts", { params });
  return response.data;
}


export async function getRecordSummary({ start, end } = {}) {
  const params = {};

  if (start != null) params.start = start;
  if (end != null) params.end = end;

  const response = await axiosClient.get("/mersad/stats/summary", { params });
  return response.data;
}