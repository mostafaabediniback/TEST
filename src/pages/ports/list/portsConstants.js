export const columns = [
  { key: "name", labelKey: "name" },
  { key: "unlo_code", labelKey: "unloCode" },
  { key: "country_name", labelKey: "country" },
  { key: "country_code", labelKey: "countryCode" },
  { key: "timezone", labelKey: "timezone" },
  { key: "lon", labelKey: "longitude" },
  { key: "lat", labelKey: "latitude" },
];

export const emptyFilters = {
  id: "",
  country_code: "",
  timezone: "",
  name: "",
  alternative_name: "",
  unlo_code: "",
  country_name: "",
  gallery_url: "",
  lon_min: "",
  lon_max: "",
  lat_min: "",
  lat_max: "",
  create_time_from: "",
  create_time_to: "",
  update_time_from: "",
  update_time_to: "",
};

export function optionalValue(value) {
  if (value === "" || value == null) return undefined;

  const trimmed = String(value).trim();
  return trimmed || undefined;
}
