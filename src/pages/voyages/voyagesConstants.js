export const columns = [
  { key: "id", label: "Voyage ID" },
  { key: "ship_id", labelKey: "shipId" },
  { key: "departure_port_id", labelKey: "departurePortId" },
  { key: "departure_time", labelKey: "departureTime" },
  { key: "arrival_port_id", labelKey: "arrivalPortId" },
  { key: "arrival_time", labelKey: "arrivalTime" },
];

export const emptyFilters = {
  id: "",
  ship_id: "",
  departure_port_id: "",
  arrival_port_id: "",
};
