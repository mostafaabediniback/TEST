export const TAB_KEYS = [
  "overview",
  "vehicles",
  "parkings",
  "routes",
  "reports",
];
export const REPORT_TYPES = [
  "movements",
  "parking_events",
  "completed",
  "in_transit",
  "delays",
  "route_performance",
  "vehicle_performance",
];
export const KPI_KEYS = {
  overview: [
    "totalVehicles",
    "parkedVehicles",
    "inTransitVehicles",
    "completedTrips",
    "delayedTrips",
    "activeParkings",
  ],
  vehicles: [
    "activeVehicles",
    "totalTrips",
    "averageDurationMinutes",
    "inTransitVehicles",
    "delayedTrips",
    "averageStopMinutes",
  ],
  parkings: [
    "activeParkings",
    "totalEntries",
    "totalExits",
    "stationedVehicles",
    "averageStopMinutes",
  ],
  routes: [
    "totalTrips",
    "activeRoutes",
    "inTransitTrips",
    "averageDurationMinutes",
    "delayedTrips",
  ],
  reports: ["totalTrips", "completedTrips", "inTransitTrips", "delayedTrips"],
};
export const CHART_KEYS = {
  overview: ["tripsByDay", "vehicleStatus", "parkingTraffic", "routeTraffic"],
  vehicles: [
    "vehicleTrips",
    "vehicleTrend",
    "durationComparison",
    "vehicleStatus",
    "vehicleRanking",
  ],
  parkings: [
    "parkingTraffic",
    "parkingTrend",
    "heatmap",
    "parkingRanking",
    "parkedByParking",
  ],
  routes: [
    "sankey",
    "routeTraffic",
    "routeDuration",
    "durationComparison",
    "delayTrend",
  ],
  reports: ["tripsByDay", "routeTraffic"],
};
const tripColumns = [
  "id",
  "vehicleId",
  "vehicleTitle",
  "registration",
  "originName",
  "destinationName",
  "actualDepartureAt",
  "estimatedArrivalAt",
  "actualArrivalAt",
  "status",
  "durationMinutes",
  "elapsedMinutes",
  "delayMinutes",
];
export function getColumns(tab, reportType) {
  const keys =
    tab === "parkings"
      ? [
          "id",
          "parkingName",
          "entries",
          "exits",
          "stationed",
          "averageStopMinutes",
          "lastEntryAt",
          "lastExitAt",
        ]
      : tab === "reports" && reportType === "parking_events"
        ? [
            "id",
            "vehicleId",
            "vehicleTitle",
            "registration",
            "parkingName",
            "type",
            "occurredAt",
          ]
        : tab === "reports" && reportType === "route_performance"
          ? [
              "routeName",
              "trips",
              "completedTrips",
              "averageDurationMinutes",
              "estimatedMinutes",
              "delayedTrips",
            ]
          : tab === "reports" && reportType === "vehicle_performance"
            ? [
                "vehicleId",
                "vehicleTitle",
                "registration",
                "trips",
                "completedTrips",
                "averageDurationMinutes",
                "estimatedMinutes",
                "delayedTrips",
              ]
            : tripColumns;
  return keys.map((key) => ({
    key,
    label: key === "estimatedMinutes" ? "estimated" : key,
  }));
}
