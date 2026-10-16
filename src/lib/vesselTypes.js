export const VESSEL_TYPE_GROUPS = [
  {
    id: "cargo",
    label: "Cargo vessels",
color: "#90ee90",    types: [
      "General Cargo",
      "Bulk Carrier",
      "Container Ship",
      "Ro-Ro/Vehicles Carrier",
      "Reefer",
      "Aggregates Carrier",
      "Cement Carrier",
      "Ore Carrier",
      "Livestock Carrier",
      "OBO Carrier",
      "Heavy Load Carrier",
      "Barge",
      "Inland Cargo",
      "Special Cargo",
      "Other Cargo",
    ],
  },
  {
    id: "tankers",
    label: "Tankers",
    color: "#FF3125",
    types: [
      "Tanker",
      "Oil Products Tanker",
      "Crude Oil Tanker",
      "Oil/Chemical Tanker",
      "Chemical Tanker",
      "LPG Tanker",
      "LNG Tanker",
      "Bunkering Tanker",
      "Asphalt/Bitumen Tanker",
      "Water Tanker",
      "Inland Tanker",
      "Special Tanker",
      "Other Tanker",
      "Floating Storage/Production",
    ],
  },
  {
    id: "passenger",
    label: "Passenger ships",
    color: "#197AFF",
    types: [
      "Passenger Ship",
      "Ro-Ro/Passenger Ship",
      "Inland Passenger Ship",
      "Passenger/Cargo Ship",
      "Special Passenger Vessel",
      "Other Passenger Ship",
    ],
  },
  {
    id: "high-speed",
    label: "High speed craft",
    color: "#FFCE1F",
    types: ["High Speed Craft"],
  },
  {
    id: "special",
    label: "Tugs & special craft",
    color: "#26F5F5",
    types: [
      "Tug",
      "Pusher Tug",
      "Tug/Supply Vessel",
      "Special Tug",
      "Pilot Boat",
      "Supply Vessel",
      "Service Vessel",
      "Offshore Structure",
      "Dredger",
      "Research/Survey Vessel",
      "Crew Boat",
      "Patrol Vessel",
      "Cable Layer",
      "Landing Craft",
      "Offshore Vessel",
      "Anchor Handling Vessel",
      "Platform",
      "Floating Crane",
      "Drill Ship",
      "Search & Rescue",
      "Pollution Control Vessel",
      "Icebreaker",
      "Fire Fighting Vessel",
      "Training Ship",
      "Inland Tug",
      "Special Craft",
      "Military Ops",
      "Other Tug / Special Craft",
    ],
  },
  {
    id: "fishing",
    label: "Fishing",
    color: "#F7997C",
    types: [
      "Fishing Vessel",
      "Fish Carrier",
      "Trawler",
      "Special Fishing Vessel",
      "Other Fishing",
    ],
  },
  {
    id: "pleasure",
    label: "Pleasure craft",
    color: "#E33AFF",
    types: ["Yacht", "Sailing Vessel", "Other Pleasure Craft"],
  },
  {
    id: "navigation",
    label: "Navigation aids",
    color: "#FFC0CB",
    types: ["Navigation Aid"],
  },
  {
    id: "unspecified",
    label: "Unspecified ships",
    color: "#D2D5DA",
    types: ["Unspecified"],
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

const aliases = new Map();

function addAliases(canonical, names) {
  for (const name of names) {
    aliases.set(normalizeType(name), canonical);
  }
}

const canonicalTypes = new Map(
  ALL_VESSEL_TYPES.map((type) => [normalizeType(type), type]),
);

// Cargo
addAliases("General Cargo", ["General Cargo"]);
addAliases("Bulk Carrier", ["Bulk Carrier", "Self Discharging Bulk Carrier"]);
addAliases("Container Ship", ["Container Ship"]);
addAliases("Ro-Ro/Vehicles Carrier", [
  "Ro-Ro",
  "Ro-Ro Cargo",
  "Ro-Ro/Container Carrier",
  "Vehicles Carrier",
]);
addAliases("Reefer", ["Reefer"]);
addAliases("Aggregates Carrier", ["Aggregates Carrier"]);
addAliases("Cement Carrier", ["Cement Carrier"]);
addAliases("Ore Carrier", ["Ore Carrier"]);
addAliases("Livestock Carrier", ["Livestock Carrier"]);
addAliases("OBO Carrier", ["Obo Carrier", "OBO Carrier"]);
addAliases("Heavy Load Carrier", ["Heavy Load Carrier", "Heavy Lift Vessel"]);
addAliases("Barge", ["Barge"]);
addAliases("Inland Cargo", ["Inland Cargo", "Deck Cargo Ship"]);
addAliases("Special Cargo", ["Special Cargo"]);
addAliases("Other Cargo", ["Cargo", "Other Cargo"]);

// Tankers
addAliases("Tanker", ["Tanker"]);
addAliases("Oil Products Tanker", ["Oil Products Tanker"]);
addAliases("Crude Oil Tanker", ["Crude Oil Tanker"]);
addAliases("Oil/Chemical Tanker", ["Oil/Chemical Tanker", "LPG/Chemical Tanker"]);
addAliases("Chemical Tanker", ["Chemical Tanker"]);
addAliases("LPG Tanker", ["LPG Tanker"]);
addAliases("LNG Tanker", ["LNG Tanker"]);
addAliases("Bunkering Tanker", ["Bunkering Tanker"]);
addAliases("Asphalt/Bitumen Tanker", [
  "Asphalt/Bitumen Tanker",
  "Asphalt / Bitumen",
]);
addAliases("Water Tanker", ["Water Tanker"]);
addAliases("Inland Tanker", ["Inland Tanker"]);
addAliases("Special Tanker", ["Special Tanker"]);
addAliases("Other Tanker", [
  "Other Tanker",
  "CO2 Tanker",
  "Replenishment Vessel",
]);
addAliases("Floating Storage/Production", [
  "Floating Storage/Production",
  "FSO",
  "FPSO",
  "FSO / FPSO",
]);

// Passenger
addAliases("Passenger Ship", ["Passenger", "Passenger Ship"]);
addAliases("Ro-Ro/Passenger Ship", ["Ro-Ro/Passenger Ship"]);
addAliases("Inland Passenger Ship", ["Inland, Ferry", "Inland Passenger Ship"]);
addAliases("Passenger/Cargo Ship", ["Passenger / Cargo Ship"]);
addAliases("Special Passenger Vessel", ["Special Passenger Vessel"]);
addAliases("Other Passenger Ship", ["Other Passenger Ship"]);

// Other groups
addAliases("High Speed Craft", ["High Speed Craft"]);
addAliases("Tug", ["Tug", "Tugs", "Towing Vessel"]);
addAliases("Pusher Tug", ["Pusher Tug", "Articulated Pusher Tug"]);
addAliases("Tug/Supply Vessel", ["Tug/Supply Vessel"]);
addAliases("Special Tug", ["Special Tug"]);
addAliases("Pilot Boat", ["Pilot Boat", "Pilot Vessel"]);
addAliases("Supply Vessel", ["Supply Vessel"]);
addAliases("Service Vessel", ["Service Vessel", "Utility Vessel"]);
addAliases("Offshore Structure", ["Offshore Structure"]);
addAliases("Dredger", [
  "Dredger",
  "Hopper Dredger",
  "Trailing Suction Hopper Dredger",
  "Motor Hopper",
  "Inland, Maintainance Craft, Cableship, Dredger",
]);
addAliases("Research/Survey Vessel", ["Research/Survey Vessel"]);
addAliases("Crew Boat", ["Crew Boat"]);
addAliases("Patrol Vessel", ["Patrol Vessel"]);
addAliases("Cable Layer", ["Cable Layer", "Pipe Layer"]);
addAliases("Landing Craft", ["Landing Craft"]);
addAliases("Offshore Vessel", ["Offshore Vessel", "Multi Purpose Offshore Vessel"]);
addAliases("Anchor Handling Vessel", ["Anchor Handling Vessel"]);
addAliases("Platform", ["Platform"]);
addAliases("Floating Crane", ["Floating Crane"]);
addAliases("Drill Ship", ["Drill Ship"]);
addAliases("Search & Rescue", ["SAR", "Search & Rescue"]);
addAliases("Pollution Control Vessel", ["Anti-Pollution", "Pollution Control Vessel"]);
addAliases("Icebreaker", ["Icebreaker"]);
addAliases("Fire Fighting Vessel", ["Fire Fighting Vessel"]);
addAliases("Training Ship", ["Training Ship"]);
addAliases("Inland Tug", [
  "Inland Tug",
  "Inland, Tug, Freighter/Tanker, coupled",
]);
addAliases("Special Craft", [
  "Dive Vessel",
  "Work Vessel",
  "Well Stimulation Vessel",
  "Waste Disposal Vessel",
  "Isolated Danger",
  "Law Enforce",
  "Local Vessel",
  "Port Tender",
  "Reserved",
  "Wing In Grnd",
  "Special Craft",
]);
addAliases("Military Ops", ["Military", "Military Ops", "Warship"]);
addAliases("Other Tug / Special Craft", [
  "Other Tug / Special Craft",
  "Other",
]);
addAliases("Fishing Vessel", [
  "Fishing",
  "Fishing Vessel",
  "Fishing Boat",
  "Inland, Fishing Boat",
]);
addAliases("Fish Carrier", ["Fish Carrier"]);
addAliases("Trawler", ["Trawler"]);
addAliases("Special Fishing Vessel", ["Special Fishing Vessel"]);
addAliases("Other Fishing", ["Other Fishing"]);
addAliases("Yacht", ["Yacht", "Pleasure Craft", "Houseboat"]);
addAliases("Sailing Vessel", ["Sailing Vessel"]);
addAliases("Other Pleasure Craft", ["Other Pleasure Craft"]);
addAliases("Navigation Aid", ["Navigation Aid", "Buoy-Laying Vessel"]);
addAliases("Unspecified", ["Unspecified", "Unknown", "Not available", ""]);

export function getVesselType(ship) {
  const subtype = normalizeType(ship?.subtype);
  const vesselType = normalizeType(ship?.vessel_type ?? ship?.type);

  // Prefer subtype: AIS broad types like Cargo and Tanker are less specific.
  for (const value of [subtype, vesselType]) {
    if (!value || value === "unknown" || value === "notavailable") continue;

    const canonical = canonicalTypes.get(value) ?? aliases.get(value);
    if (canonical) return canonical;
  }

  const rawType = String(ship?.vessel_type ?? ship?.type ?? "").trim();

  if (/^(cargo|tanker)\s*-\s*hazard\s*[abcd](?:\s*\([^)]*\))?$/i.test(rawType)) {
    return rawType.toLowerCase().startsWith("cargo")
      ? "Other Cargo"
      : "Other Tanker";
  }

  return "Unspecified";
}

export function matchesVesselTypes(ship, selected) {
  return selected.includes(getVesselType(ship));
}

export function getVesselTypeFilter(selected) {
  const types = ALL_VESSEL_TYPES.filter((type) => selected.includes(type));
  return types.length === ALL_VESSEL_TYPES.length ? undefined : types;
}