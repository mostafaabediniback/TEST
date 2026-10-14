export const columns = [
  { key: "name", labelKey: "name" },
  { key: "imo", labelKey: "imo" },
  { key: "flag", labelKey: "flag" },
  { key: "vessel_type", labelKey: "vesselType" },
  { key: "vessel_class", labelKey: "vesselClass" },
  { key: "vessel_maker", labelKey: "maker" },
  { key: "yob", labelKey: "yearBuilt" },
  { key: "dwt", labelKey: "dwt" },
];

export const emptyFilters = {
  name: "",
  imo: "",
  flag: "",
  vessel_type: [],
  vessel_class: "",
  vessel_maker: "",
  yob_from: "",
  yob_to: "",
  loa_min: "",
  loa_max: "",
  width_min: "",
  width_max: "",
  draft_min: "",
  draft_max: "",
  dwt_min: "",
  dwt_max: "",
};

export function filtersToValue(value) {
  if (typeof value === "string") return value.trim() || undefined;
  return value || undefined;
}