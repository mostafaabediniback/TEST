export const columns = [
  { key: "ship_name", label: "Ship Name" },
  { key: "ship_details", label: "Ship Type / Subtype" },
  // { key: "id", label: "Voyage ID" },
  { key: "ship_imo", labelKey: "IMO" },
  { key: "departure_port_name", labelKey: "Departure Port" },
  // { key: "departure_port_id", labelKey: "departurePortId" },
  { key: "departure_time", labelKey: "Departure Time" },
  { key: "arrival_port_name", labelKey: "Arrival Port" },
  // { key: "arrival_port_id", labelKey: "arrivalPortId" },
  { key: "arrival_time", labelKey: "Arrival Time" },
  // { key: "create_time", labelKey: "createTime" },
  // { key: "update_time", labelKey: "updateTime" },
];

export const emptyFilters = {
  id: "",
  ship_id: "",
  departure_port_id: "",
  arrival_port_id: "",
  ship_type: "",
  ship_subtype: [],
};
