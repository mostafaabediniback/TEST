// api/portTiles.js
import axiosClient from "./axiosClient"; // Adjust this path to your project.


export async function getPortsInTile({ z, x, y, skip = 0, signal }) {
  const response = await axiosClient.get(
    `/mersad/tile/${z}/${x}/${y}/ports`,
    {
      params: { skip },
      signal,
    },
  );

  return response.data;
}



