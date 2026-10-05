import { http } from "./http";
import { mockCars } from "@/data/mockCars";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک");
}

async function getMockCars({ search, status }) {
  await sleep(180);

  const q = normalize(search);
  return mockCars.filter((car) => {
    const matchesSearch = !q || [car.driverName, car.plate, car.id].some((value) => normalize(value).includes(q));
    const matchesStatus = !status || status === "all" || car.status === status;
    return matchesSearch && matchesStatus;
  });
}

export async function getCars(params) {
  if ((import.meta.env.VITE_DATA_SOURCE || "mock") === "mock") {
    return getMockCars(params);
  }

  const { data } = await http.get("/cars", {
    params: {
      search: params.search || undefined,
      status: params.status === "all" ? undefined : params.status,
      z: params.z,
      x: params.x,
      y: params.y,
    },
  });

  return Array.isArray(data) ? data : data.items ?? [];
}
