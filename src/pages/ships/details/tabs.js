import VesselCharacteristicsTab from "./tabs/VesselCharacteristicsTab";
import VoyagesTab from "./tabs/VoyagesTab";

export const tabPages = {
  Voyages: VoyagesTab,
  "Vessel characteristics": VesselCharacteristicsTab,
};

export const tabs = ["Overview", ...Object.keys(tabPages)];
