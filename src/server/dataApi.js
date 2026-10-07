
import axiosInstance from "@/utils/axiosInstance";


export async function getPointsByTile({ z, x, y, signal }) {
  const response = await axiosInstance.get("/api/Map/points", {
    signal,
    skipGlobalLoading: true,
    params: {
      z,
      x,
      y,
    },
  });

  return response.data;
}
