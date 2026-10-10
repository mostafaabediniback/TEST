const MINUTE = 60_000;
export const TRIP_STATUSES = [
  "completed",
  "completed_delayed",
  "in_transit",
  "delayed_in_transit",
  "scheduled",
];
export function deriveTrip(trip, now) {
  const atd =
    trip.actualDepartureAt == null ? null : Date.parse(trip.actualDepartureAt);
  const eta = Date.parse(trip.estimatedArrivalAt);
  const ata =
    trip.actualArrivalAt == null ? null : Date.parse(trip.actualArrivalAt);
  if (
    !Number.isFinite(eta) ||
    (atd !== null && !Number.isFinite(atd)) ||
    (ata !== null && (!Number.isFinite(ata) || atd === null || ata < atd))
  )
    throw new Error("Invalid trip timestamps: " + trip.id);
  const completed = ata !== null;
  const status = completed
    ? ata > eta
      ? "completed_delayed"
      : "completed"
    : atd === null
      ? "scheduled"
      : now > eta
        ? "delayed_in_transit"
        : "in_transit";
  return {
    ...trip,
    status,
    completed,
    delayed: status === "completed_delayed" || status === "delayed_in_transit",
    durationMinutes: completed ? (ata - atd) / MINUTE : null,
    elapsedMinutes:
      !completed && atd !== null ? Math.max(0, (now - atd) / MINUTE) : null,
    estimatedMinutes: atd !== null ? (eta - atd) / MINUTE : null,
    delayMinutes: atd === null ? 0 : Math.max(0, ((ata ?? now) - eta) / MINUTE),
  };
}
export function materialize(source, now) {
  const shift = now - Date.parse(source.meta.referenceAt);
  const trips = source.data.trips.map((trip) =>
    deriveTrip(
      {
        ...trip,
        ...Object.fromEntries(
          ["actualDepartureAt", "estimatedArrivalAt", "actualArrivalAt"].map(
            (key) => [
              key,
              trip[key] == null
                ? null
                : new Date(Date.parse(trip[key]) + shift).toISOString(),
            ],
          ),
        ),
      },
      now,
    ),
  );
  return { ...source.data, trips };
}
const mean = (values) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
const sum = (rows, key) => rows.reduce((n, row) => n + (row[key] ?? 0), 0);
function group(rows, key) {
  const groups = new Map();
  for (const row of rows) {
    const id = typeof key === "function" ? key(row) : row[key];
    groups.set(id, [...(groups.get(id) ?? []), row]);
  }
  return [...groups.entries()];
}
export function localDate(value, timeZone = "Asia/Tehran") {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const field = (key) => parts.find((part) => part.type === key).value;
  return field("year") + "-" + field("month") + "-" + field("day");
}
function inRange(at, filters, zone) {
  if (!at) return false;
  const day = localDate(at, zone);
  return (
    (!filters.dateFrom || day >= filters.dateFrom) &&
    (!filters.dateTo || day <= filters.dateTo)
  );
}
export function fleetSnapshot(vehicles, trips) {
  return vehicles.map((vehicle) => {
    const history = trips
      .filter((trip) => trip.vehicleId === vehicle.id && trip.actualDepartureAt)
      .sort(
        (a, b) =>
          Date.parse(b.actualDepartureAt) - Date.parse(a.actualDepartureAt),
      );
    const latest = history[0];
    return {
      ...vehicle,
      status: !vehicle.active
        ? "inactive"
        : latest && !latest.completed
          ? "in_transit"
          : "parked",
      parkingId:
        latest && !latest.completed
          ? null
          : (latest?.destinationParkingId ?? vehicle.initialParkingId),
      latest,
    };
  });
}
export function filterTrips(trips, filters, fleet, ignoreDate = false) {
  const eligibleFleet = new Set(
    fleet
      .filter(
        (vehicle) =>
          !filters.vehicleStatus || vehicle.status === filters.vehicleStatus,
      )
      .map((vehicle) => vehicle.id),
  );
  const needle = (filters.search ?? "").trim().toLocaleLowerCase();
  return trips.filter(
    (trip) =>
      eligibleFleet.has(trip.vehicleId) &&
      (!filters.vehicleId || trip.vehicleId === filters.vehicleId) &&
      (!filters.originParkingId ||
        trip.originParkingId === filters.originParkingId) &&
      (!filters.destinationParkingId ||
        trip.destinationParkingId === filters.destinationParkingId) &&
      (!filters.parkingId ||
        trip.originParkingId === filters.parkingId ||
        trip.destinationParkingId === filters.parkingId) &&
      (!filters.status || trip.status === filters.status) &&
      (!filters.delayedOnly || trip.delayed) &&
      (ignoreDate ||
        inRange(
          trip.actualDepartureAt ?? trip.estimatedArrivalAt,
          filters,
          trip.timeZone,
        )) &&
      (!needle ||
        [
          trip.id,
          trip.vehicleId,
          trip.vehicleTitle,
          trip.registration,
          trip.originName,
          trip.destinationName,
          trip.status,
          trip.originName + " → " + trip.destinationName,
        ].some((value) =>
          String(value ?? "")
            .toLocaleLowerCase()
            .includes(needle),
        )),
  );
}
function getDwell(trips, allTrips) {
  return trips
    .filter((trip) => trip.completed)
    .flatMap((trip) => {
      const next = allTrips
        .filter(
          (other) =>
            other.vehicleId === trip.vehicleId &&
            Date.parse(other.actualDepartureAt) >=
              Date.parse(trip.actualArrivalAt),
        )
        .sort(
          (a, b) =>
            Date.parse(a.actualDepartureAt) - Date.parse(b.actualDepartureAt),
        )[0];
      return next && next.originParkingId === trip.destinationParkingId
        ? [
            {
              vehicleId: trip.vehicleId,
              parkingId: trip.destinationParkingId,
              arrivalTripId: trip.id,
              departureTripId: next.id,
              minutes:
                (Date.parse(next.actualDepartureAt) -
                  Date.parse(trip.actualArrivalAt)) /
                MINUTE,
            },
          ]
        : [];
    });
}
export function buildDashboardResponse(
  source,
  tab,
  filters = {},
  now = Date.now(),
) {
  if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo)
    throw new Error("تاریخ شروع باید قبل از تاریخ پایان باشد.");
  const model = materialize(source, now);
  const vehicles = model.vehicles;
  const parkings = model.parkings;
  const vehicleMap = new Map(vehicles.map((row) => [row.id, row]));
  const parkingMap = new Map(parkings.map((row) => [row.id, row]));
  const allTrips = model.trips.map((trip) => ({
    ...trip,
    vehicleTitle: vehicleMap.get(trip.vehicleId)?.title,
    registration: vehicleMap.get(trip.vehicleId)?.registration,
    originName: parkingMap.get(trip.originParkingId)?.name,
    destinationName: parkingMap.get(trip.destinationParkingId)?.name,
  }));
  const fleet = fleetSnapshot(vehicles, allTrips);
  const reportType = filters.reportType ?? "movements";
  const search = (filters.search ?? "").trim().toLocaleLowerCase();
  const effective = { ...filters };
  let trips = filterTrips(
    allTrips,
    effective,
    fleet,
    tab === "parkings" ||
      (tab === "reports" && reportType === "parking_events"),
  );
  if (tab === "reports") {
    if (reportType === "completed")
      trips = trips.filter((trip) => trip.completed);
    if (reportType === "in_transit")
      trips = trips.filter((trip) => !trip.completed && trip.actualDepartureAt);
    if (reportType === "delays") trips = trips.filter((trip) => trip.delayed);
  }
  let events = trips
    .flatMap((trip) => [
      ...(trip.actualDepartureAt
        ? [
            {
              id: trip.id + "-out",
              tripId: trip.id,
              vehicleId: trip.vehicleId,
              vehicleTitle: trip.vehicleTitle,
              registration: trip.registration,
              parkingId: trip.originParkingId,
              parkingName: trip.originName,
              type: "outgoing",
              occurredAt: trip.actualDepartureAt,
              timeZone: trip.timeZone,
            },
          ]
        : []),
      ...(trip.actualArrivalAt
        ? [
            {
              id: trip.id + "-in",
              tripId: trip.id,
              vehicleId: trip.vehicleId,
              vehicleTitle: trip.vehicleTitle,
              registration: trip.registration,
              parkingId: trip.destinationParkingId,
              parkingName: trip.destinationName,
              type: "incoming",
              occurredAt: trip.actualArrivalAt,
              timeZone: trip.timeZone,
            },
          ]
        : []),
    ])
    .filter(
      (event) =>
        (!filters.parkingId || event.parkingId === filters.parkingId) &&
        (!filters.trafficType || event.type === filters.trafficType) &&
        inRange(event.occurredAt, filters, event.timeZone),
    );
  if (tab === "reports" && reportType === "parking_events" && search)
    events = events.filter((event) =>
      [
        event.id,
        event.vehicleId,
        event.vehicleTitle,
        event.registration,
        event.parkingName,
        event.type,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase()
          .includes(search),
      ),
    );
  const eventTripIds = new Set(events.map((event) => event.tripId));
  if (
    tab === "parkings" ||
    (tab === "reports" && reportType === "parking_events")
  ) {
    trips = trips.filter((trip) => eventTripIds.has(trip.id));
  }
  const tripVehicleIds = new Set(trips.map((trip) => trip.vehicleId));
  const tripScoped = !!(
    filters.dateFrom ||
    filters.dateTo ||
    filters.originParkingId ||
    filters.destinationParkingId ||
    filters.status ||
    filters.delayedOnly ||
    filters.search ||
    (tab === "reports" &&
      ["completed", "in_transit", "delays"].includes(reportType))
  );
  const selectedFleet = fleet.filter(
    (vehicle) =>
      (!filters.vehicleId || vehicle.id === filters.vehicleId) &&
      (!filters.vehicleStatus || vehicle.status === filters.vehicleStatus) &&
      (!filters.parkingId ||
        vehicle.parkingId === filters.parkingId ||
        tripVehicleIds.has(vehicle.id)) &&
      (!tripScoped || tripVehicleIds.has(vehicle.id)),
  );
  const parkingMode =
    tab === "parkings" ||
    (tab === "reports" && reportType === "parking_events");
  const dwell = getDwell(parkingMode ? allTrips : trips, allTrips).filter(
    (row) =>
      !parkingMode ||
      events.some(
        (event) =>
          event.parkingId === row.parkingId &&
          (event.tripId === row.arrivalTripId ||
            event.tripId === row.departureTripId),
      ),
  );
  const parkingRows = parkings
    .filter((parking) => !filters.parkingId || parking.id === filters.parkingId)
    .map((parking) => {
      const entries = events.filter(
        (event) => event.parkingId === parking.id && event.type === "incoming",
      );
      const exits = events.filter(
        (event) => event.parkingId === parking.id && event.type === "outgoing",
      );
      const stationed = selectedFleet.filter(
        (vehicle) =>
          vehicle.parkingId === parking.id && vehicle.status === "parked",
      );
      const latest = (rows) =>
        rows.length
          ? rows
              .map((row) => row.occurredAt)
              .sort()
              .at(-1)
          : null;
      return {
        id: parking.id,
        parkingName: parking.name,
        timeZone: parking.timezone ?? "Asia/Tehran",
        active: parking.active,
        entries: entries.length,
        exits: exits.length,
        stationed: stationed.length,
        averageStopMinutes: mean(
          dwell
            .filter((row) => row.parkingId === parking.id)
            .map((row) => row.minutes),
        ),
        lastEntryAt: latest(entries),
        lastExitAt: latest(exits),
      };
    })
    .filter((row) => row.entries || row.exits || row.stationed);
  const routeRows = group(
    trips,
    (trip) => trip.originParkingId + "→" + trip.destinationParkingId,
  ).map(([id, rows]) => ({
    id,
    originParkingId: rows[0].originParkingId,
    destinationParkingId: rows[0].destinationParkingId,
    originName: rows[0].originName,
    destinationName: rows[0].destinationName,
    routeName: rows[0].originName + " → " + rows[0].destinationName,
    trips: rows.length,
    completedTrips: rows.filter((row) => row.completed).length,
    averageDurationMinutes: mean(
      rows.filter((row) => row.completed).map((row) => row.durationMinutes),
    ),
    estimatedMinutes: mean(
      rows.filter((row) => row.completed).map((row) => row.estimatedMinutes),
    ),
    delayedTrips: rows.filter((row) => row.delayed).length,
  }));
  const vehicleRows = group(trips, "vehicleId").map(([id, rows]) => ({
    id,
    vehicleId: id,
    vehicleTitle: rows[0].vehicleTitle,
    registration: rows[0].registration,
    trips: rows.length,
    completedTrips: rows.filter((row) => row.completed).length,
    averageDurationMinutes: mean(
      rows.filter((row) => row.completed).map((row) => row.durationMinutes),
    ),
    estimatedMinutes: mean(
      rows.filter((row) => row.completed).map((row) => row.estimatedMinutes),
    ),
    delayedTrips: rows.filter((row) => row.delayed).length,
  }));
  const timeline = group(trips, (trip) =>
    localDate(trip.actualDepartureAt ?? trip.estimatedArrivalAt, trip.timeZone),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rows]) => ({
      date,
      trips: rows.length,
      delays: rows.filter((row) => row.delayed).length,
    }));
  const trafficTimeline = group(events, (event) =>
    localDate(event.occurredAt, event.timeZone),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rows]) => ({
      date,
      entries: rows.filter((row) => row.type === "incoming").length,
      exits: rows.filter((row) => row.type === "outgoing").length,
    }));
  const heatmap = group(events, (event) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: event.timeZone,
      weekday: "short",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(event.occurredAt));
    return (
      ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(
        parts.find((p) => p.type === "weekday").value,
      ) +
      ":" +
      Number(parts.find((p) => p.type === "hour").value)
    );
  }).map(([key, rows]) => ({
    day: Number(key.split(":")[0]),
    hour: Number(key.split(":")[1]),
    value: rows.length,
  }));
  const statusCounts = ["parked", "in_transit", "inactive"].map((status) => ({
    status,
    value: selectedFleet.filter((vehicle) => vehicle.status === status).length,
  }));
  const summary = {
    totalVehicles: selectedFleet.length,
    activeVehicles: selectedFleet.filter((vehicle) => vehicle.active).length,
    parkedVehicles: statusCounts[0].value,
    inTransitVehicles: statusCounts[1].value,
    totalTrips: trips.length,
    completedTrips: trips.filter((trip) => trip.completed).length,
    inTransitTrips: trips.filter(
      (trip) => !trip.completed && trip.actualDepartureAt,
    ).length,
    delayedTrips: trips.filter((trip) => trip.delayed).length,
    activeParkings: parkingRows.filter((row) => row.active).length,
    activeRoutes: routeRows.length,
    averageDurationMinutes: mean(
      trips
        .filter((trip) => trip.completed)
        .map((trip) => trip.durationMinutes),
    ),
    averageStopMinutes: mean(dwell.map((row) => row.minutes)),
    totalEntries: sum(parkingRows, "entries"),
    totalExits: sum(parkingRows, "exits"),
    stationedVehicles: sum(parkingRows, "stationed"),
  };
  const charts = {
    tripsByDay: timeline,
    vehicleTrend: timeline,
    delayTrend: timeline,
    vehicleStatus: statusCounts,
    parkingTraffic: parkingRows,
    parkingTrend: trafficTimeline,
    heatmap,
    parkingRanking: [...parkingRows].sort(
      (a, b) => b.entries + b.exits - (a.entries + a.exits),
    ),
    parkedByParking: parkingRows,
    routeTraffic: [...routeRows].sort((a, b) => b.trips - a.trips),
    routeDuration: routeRows,
    durationComparison: tab === "routes" ? routeRows : vehicleRows,
    vehicleTrips: vehicleRows,
    vehicleRanking: [...vehicleRows].sort((a, b) => b.trips - a.trips),
    sankey: {
      nodes: [
        ...new Set(
          routeRows.flatMap((row) => [
            "origin:" + row.originParkingId,
            "destination:" + row.destinationParkingId,
          ]),
        ),
      ].map((id) => ({
        name: id,
        label: parkingMap.get(id.split(":")[1])?.name,
        side: id.startsWith("origin:") ? "origin" : "destination",
      })),
      links: routeRows.map((row) => ({
        source: "origin:" + row.originParkingId,
        target: "destination:" + row.destinationParkingId,
        value: row.trips,
      })),
    },
  };
  let items = tab === "parkings" ? parkingRows : trips;
  if (tab === "reports")
    items =
      reportType === "parking_events"
        ? events
        : reportType === "route_performance"
          ? routeRows
          : reportType === "vehicle_performance"
            ? vehicleRows
            : trips;
  const sortBy =
    filters.sortBy ??
    (tab === "parkings"
      ? "entries"
      : tab === "reports" && reportType === "parking_events"
        ? "occurredAt"
        : items === routeRows || items === vehicleRows
          ? "trips"
          : "actualDepartureAt");
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
  items = [...items].sort((a, b) => {
    const left = a[sortBy],
      right = b[sortBy];
    if (left == null) return right == null ? 0 : 1;
    if (right == null) return -1;
    return (
      sortOrder *
      (typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right), "fa", { numeric: true }))
    );
  });
  const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 10));
  const totalItems = items.length;
  const page = Math.min(
    Math.max(1, Number(filters.page) || 1),
    Math.max(1, Math.ceil(totalItems / pageSize)),
  );
  return {
    success: true,
    data: {
      summary,
      charts,
      items: filters.exportAll
        ? items
        : items.slice((page - 1) * pageSize, page * pageSize),
      options: { vehicles, parkings, statuses: TRIP_STATUSES },
    },
    meta: {
      filters: effective,
      generatedAt: new Date(now).toISOString(),
      timeZone: source.meta.timeZone,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      },
    },
  };
}
