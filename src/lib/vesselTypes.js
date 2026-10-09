export const VESSEL_TYPE_GROUPS = [
  { id: "cargo", label: "Cargo vessels", color: "#eab308", types: ["Bulk Carrier", "General Cargo", "Container Ship", "Reefer", "Ro-Ro", "Vehicles Carrier", "Cement Carrier", "Wood Chips Carrier", "Urea Carrier", "Aggregates Carrier", "Limestone Carrier", "Landing Craft", "Livestock Carrier", "Heavy Load Carrier", "Cargo"] },
  { id: "tankers", label: "Tankers", color: "#f59e0b", types: ["Crude Oil Tanker", "Oil Products Tanker", "Oil/Chemical Tanker", "LNG Tanker", "LPG Tanker", "Asphalt / Bitumen", "Bunkering Tanker", "FSO / FPSO", "Other Tanker"] },
  { id: "passenger", label: "Passenger / Cruise ships", color: "#22c55e", types: ["Cruise Ship", "Passenger / Cargo Ship", "Passenger / Ro-Ro Ship", "Passenger Ship"] },
  { id: "fishing", label: "Fishing ships", color: "#38bdf8", types: ["Fishing"] },
  { id: "yachts", label: "Yachts / Sailing Vessels", color: "#d946ef", types: ["Pleasure Craft", "Sailing Vessel"] },
  { id: "military", label: "Military", color: "#ef4444", types: ["Military"] },
  { id: "tugs", label: "Tugs", color: "#16a34a", types: ["Tug"] },
  { id: "other", label: "Other type / Auxiliary", color: "#3b82f6", types: ["Other"] },
  { id: "unknown", label: "Unknown", color: "#cbd5e1", types: ["Unknown"] },
];

export const ALL_VESSEL_TYPES = VESSEL_TYPE_GROUPS.flatMap((group) => group.types);

export function updateVesselTypeSelection(selected, types, checked) {
  const next = new Set(selected);
  for (const type of types) {
    if (checked) next.add(type);
    else next.delete(type);
  }
  return ALL_VESSEL_TYPES.filter((type) => next.has(type));
}

export function getVesselTypeGroupState(selected, group) {
  const selectedTypes = new Set(selected);
  const count = group.types.filter((type) => selectedTypes.has(type)).length;
  return { checked: count === group.types.length, indeterminate: count > 0 && count < group.types.length };
}

const normalizeType = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const canonicalTypes = new Map(ALL_VESSEL_TYPES.map((type) => [normalizeType(type), type]));
const aliases = new Map([
  ["chemicaloiltanker", "Oil/Chemical Tanker"], ["lpgchemicaltanker", "LPG Tanker"],
  ["tanker", "Other Tanker"], ["fishingvessel", "Fishing"], ["fishingship", "Fishing"],
  ["yacht", "Pleasure Craft"], ["yachts", "Pleasure Craft"], ["tugs", "Tug"],
  ["militaryops", "Military"], ["warship", "Military"],
]);

export function getVesselType(ship) {
  const type = normalizeType(ship?.vessel_type);
  if (!type || type === "unknown" || type === "notavailable") return "Unknown";
  return canonicalTypes.get(type) ?? aliases.get(type) ?? "Other";
}

export function matchesVesselTypes(ship, selected) {
  return selected.includes(getVesselType(ship));
}

export function getVesselTypeFilter(selected) {
  // A stable order keeps identical selections in the same query-cache entry.
  const types = ALL_VESSEL_TYPES.filter((type) => selected.includes(type));
  return types.length === ALL_VESSEL_TYPES.length ? undefined : types;
}
