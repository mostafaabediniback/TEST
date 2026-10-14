export const VESSEL_TYPE_GROUPS = [
  {
    id: "cargo",
    label: "Cargo vessels",
    color: "#eab308",
    types: [
      "Bulk Carrier",
      "General Cargo",
      "Container Ship",
      "Reefer",
      "Ro-Ro",
      "Vehicles Carrier",
      "Cement Carrier",
      "Wood Chips Carrier",
      "Urea Carrier",
      "Aggregates Carrier",
      "Limestone Carrier",
      "Landing Craft",
      "Livestock Carrier",
      "Heavy Load Carrier",
      "Cargo",
    ],
  },
  {
    id: "tankers",
    label: "Tankers",
    color: "#f59e0b",
    types: [
      "Crude Oil Tanker",
      "Oil Products Tanker",
      "Oil/Chemical Tanker",
      "LNG Tanker",
      "LPG Tanker",
      "Asphalt / Bitumen",
      "Bunkering Tanker",
      "FSO / FPSO",
      "Other Tanker",
    ],
  },
  {
    id: "passenger",
    label: "Passenger / Cruise ships",
    color: "#22c55e",
    types: [
      "Cruise Ship",
      "Passenger / Cargo Ship",
      "Passenger / Ro-Ro Ship",
      "Passenger Ship",
    ],
  },
  {
    id: "fishing",
    label: "Fishing ships",
    color: "#38bdf8",
    types: ["Fishing"],
  },
  {
    id: "yachts",
    label: "Yachts / Sailing Vessels",
    color: "#d946ef",
    types: ["Pleasure Craft", "Sailing Vessel"],
  },
  {
    id: "military",
    label: "Military",
    color: "#ef4444",
    types: ["Military"],
  },
  {
    id: "tugs",
    label: "Tugs",
    color: "#16a34a",
    types: ["Tug"],
  },
  {
    id: "other",
    label: "Other type / Auxiliary",
    color: "#3b82f6",
    types: ["Other"],
  },
  {
    id: "unknown",
    label: "Unknown",
    color: "#cbd5e1",
    types: ["Unknown"],
  },
];

export const ALL_VESSEL_TYPES = VESSEL_TYPE_GROUPS.flatMap(
  (group) => group.types,
);

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

  return {
    checked: count === group.types.length,
    indeterminate: count > 0 && count < group.types.length,
  };
}

const normalizeType = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const canonicalTypes = new Map(
  ALL_VESSEL_TYPES.map((type) => [normalizeType(type), type]),
);

const aliases = new Map();

function addAliases(canonical, names) {
  for (const name of names) {
    aliases.set(normalizeType(name), canonical);
  }
}

addAliases("Cargo", [
  "Cargo",
  "Inland Cargo",
  "Deck Cargo Ship",
  "Self Discharging Bulk Carrier",
  "Ore Carrier",
  "Ro-Ro Cargo",
  "Ro-Ro/Container Carrier",
  "Heavy Lift Vessel",
  "Wood Chips Carrier",
  "Urea Carrier",
  "Aggregates Carrier",
  "Limestone Carrier",
]);

addAliases("Ro-Ro", [
  "Ro-Ro",
  "Ro-Ro Cargo",
  "Ro-Ro/Container Carrier",
]);

addAliases("Vehicles Carrier", ["Vehicles Carrier"]);

addAliases("General Cargo", ["General Cargo"]);

addAliases("Landing Craft", ["Landing Craft"]);

addAliases("Livestock Carrier", ["Livestock Carrier"]);

addAliases("Heavy Load Carrier", [
  "Heavy Load Carrier",
  "Heavy Lift Vessel",
]);

addAliases("Cement Carrier", ["Cement Carrier"]);

addAliases("Container Ship", ["Container Ship"]);

addAliases("Bulk Carrier", [
  "Bulk Carrier",
  "Self Discharging Bulk Carrier",
  "Ore Carrier",
]);

addAliases("Reefer", ["Reefer"]);

addAliases("Crude Oil Tanker", ["Crude Oil Tanker"]);

addAliases("Oil Products Tanker", ["Oil Products Tanker"]);

addAliases("Oil/Chemical Tanker", [
  "Oil/Chemical Tanker",
  "Chemical Tanker",
  "LPG/Chemical Tanker",
]);

addAliases("LPG Tanker", ["LPG Tanker"]);

addAliases("LNG Tanker", ["LNG Tanker"]);

addAliases("Asphalt / Bitumen", [
  "Asphalt/Bitumen Tanker",
  "Asphalt / Bitumen",
]);

addAliases("Bunkering Tanker", ["Bunkering Tanker"]);

addAliases("FSO / FPSO", [
  "Floating Storage/Production",
  "FSO",
  "FPSO",
]);

addAliases("Other Tanker", [
  "Tanker",
  "Obo Carrier",
  "CO2 Tanker",
  "Replenishment Vessel",
]);

addAliases("Passenger Ship", [
  "Passenger",
  "Passenger Ship",
  "Ro-Ro/Passenger Ship",
  "Inland, Ferry",
]);

addAliases("Fishing", [
  "Fishing",
  "Fishing Vessel",
  "Fishing Boat",
  "Inland, Fishing Boat",
  "Trawler",
]);

addAliases("Pleasure Craft", ["Pleasure Craft", "Yacht", "Houseboat"]);

addAliases("Sailing Vessel", ["Sailing Vessel"]);

addAliases("Military", ["Military", "Military Ops", "Warship"]);

addAliases("Tug", [
  "Tug",
  "Tugs",
  "Towing Vessel",
  "Pusher Tug",
  "Articulated Pusher Tug",
  "Tug/Supply Vessel",
  "Inland, Tug, Freighter/Tanker, coupled",
]);

addAliases("Other", [
  "Other",
  "Anti-Pollution",
  "Dive Vessel",
  "Work Vessel",
  "Well Stimulation Vessel",
  "Waste Disposal Vessel",
  "Research/Survey Vessel",
  "Pipe Layer",
  "Multi Purpose Offshore Vessel",
  "Floating Crane",
  "Anchor Handling Vessel",
  "Fire Fighting Vessel",
  "Dredger",
  "Hopper Dredger",
  "Trailing Suction Hopper Dredger",
  "Motor Hopper",
  "Inland, Maintainance Craft, Cableship, Dredger",
  "High Speed Craft",
  "Isolated Danger",
  "Law Enforce",
  "Local Vessel",
  "Pilot Vessel",
  "Port Tender",
  "Reserved",
  "SAR",
  "Buoy-Laying Vessel",
  "Utility Vessel",
  "Icebreaker",
  "Inland, Unknown",
  "Wing In Grnd",
]);

const hazardTypePattern =
  /^(cargo|tanker)\s*-\s*hazard\s*[abcd](?:\s*\([^)]*\))?$/i;

export function getVesselType(ship) {
  const subtype = normalizeType(ship?.subtype);
  const vesselType = normalizeType(ship?.vessel_type ?? ship?.type);

  // Prefer a useful subtype over a broad AIS type such as "Cargo" or "Tanker".
  for (const value of [subtype, vesselType]) {
    if (!value) continue;

    if (value === "unknown" || value === "notavailable") {
      continue;
    }

    const canonical = canonicalTypes.get(value) ?? aliases.get(value);
    if (canonical) return canonical;
  }

  // Hazard class names are AIS navigation/type categories, not vessel classes.
  // If there is no recognized subtype, classify them as Other.
  const rawType = String(ship?.vessel_type ?? ship?.type ?? "").trim();
  if (hazardTypePattern.test(rawType)) return "Other";

  return "Unknown";
}

export function matchesVesselTypes(ship, selected) {
  return selected.includes(getVesselType(ship));
}

export function getVesselTypeFilter(selected) {
  // A stable order keeps identical selections in the same query-cache entry.
  const types = ALL_VESSEL_TYPES.filter((type) => selected.includes(type));
  return types.length === ALL_VESSEL_TYPES.length ? undefined : types;
}