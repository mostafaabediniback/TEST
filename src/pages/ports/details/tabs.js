import { InPortTab } from "./tabs/InPortTab";
import ExpectedArrivalsTab from "./tabs/ExpectedArrivalsTab";
import { ArrivalsDeparturesTab } from "./tabs/ArrivalsDeparturesTab";
import StatisticsTab from "./tabs/StatisticsTab";

export const tabPages = {
  "In port": InPortTab,
  "Expected arrivals": ExpectedArrivalsTab,
  "Arrivals and departures": ArrivalsDeparturesTab,
  Statistics: StatisticsTab,
};

export const tabs = ["Overview", ...Object.keys(tabPages)];