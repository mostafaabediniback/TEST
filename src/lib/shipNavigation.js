export function getShipCoordinates(ship) {
  const lat = ship?.lat ?? ship?.latitude;
  const lng = ship?.lon ?? ship?.longitude;
  if (lat == null || lng == null || lat === "" || lng === "") return null;
  const latitude = Number(lat);
  const longitude = Number(lng);
  return Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90
    ? [longitude, latitude]
    : null;
}

export function getShipDetailsNavigation(
  ship,
  { source, returnTo, tableState },
) {
  const search = new URLSearchParams({ from: source, returnTo });
  return {
    to: "/ships/" + encodeURIComponent(ship.id) + "?" + search,
    state: {
      source,
      returnTo,
      ship,
      portId: ship.port_id ?? ship.portId,
      tableState,
    },
  };
}

export function getDetailsReturnTarget(search, state) {
  const params = new URLSearchParams(search);
  const source = state?.source ?? params.get("from");
  const returnTo = state?.returnTo ?? params.get("returnTo") ?? "";
  const allowed =
    source === "home"
      ? /^\/(?:\?|$)/
      : source === "map"
        ? /^\/dashboard\/\d+\/\d+\/\d+(?:\?|$)/
        : /^\/(?:ships|voyage)(?:\?|$)/;
  return allowed.test(returnTo) ? returnTo : "/ships";
}
