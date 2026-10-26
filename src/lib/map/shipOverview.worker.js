import { buildShipOverviewData, getOverviewTransferList } from "./shipOverviewData.js";

let ships = [];
self.onmessage = ({ data }) => {
  if (data.ships) ships = data.ships;
  const overview = buildShipOverviewData(ships, data.vesselTypes);
  self.postMessage({ requestId: data.requestId, overview }, getOverviewTransferList(overview));
};
