export function detailValue(value, suffix = "") {
  return value == null || value === "" ? "—" : `${value}${suffix}`;
}

export function detailDate(value, timeZone = "UTC") {
  if (!value || !Number.isFinite(new Date(value).getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(value));
  }
}

export function getDetailVoyage(voyage, port) {
  return {
    origin:
      voyage.origin_name ??
      voyage.originName ??
      voyage.departure_port ??
      "Departure not reported",
    destination:
      voyage.destination ??
      voyage.port_name ??
      port.name ??
      "Destination not reported",
    departure: voyage.actualDepartureAt ?? voyage.departure ?? voyage.atd,
    eta: voyage.estimatedArrivalAt ?? voyage.eta,
    arrival: voyage.actualArrivalAt ?? voyage.arrival ?? voyage.ata,
    timeZone: voyage.timeZone ?? port.timezone ?? "UTC",
  };
}

export function getVoyageProgress(voyage, now = Date.now()) {
  const departure =
    voyage.departure == null ? NaN : new Date(voyage.departure).getTime();
  const eta = voyage.eta == null ? NaN : new Date(voyage.eta).getTime();
  if (voyage.arrival && Number.isFinite(new Date(voyage.arrival).getTime()))
    return 100;
  if (!Number.isFinite(departure) || !Number.isFinite(eta) || eta <= departure)
    return null;
  return Math.max(
    0,
    Math.min(100, ((now - departure) / (eta - departure)) * 100),
  );
}
