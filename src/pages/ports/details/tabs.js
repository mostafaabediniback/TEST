import { InPortTab } from "./tabs/InPortTab";
import ExpectedArrivalsTab from "./tabs/ExpectedArrivalsTab";
import { ArrivalsDeparturesTab } from "./tabs/ArrivalsDeparturesTab";
import PortCongestionTab from "./tabs/PortCongestionTab";
import StatisticsTab from "./tabs/StatisticsTab";
import InTheNewsTab from "./tabs/InTheNewsTab";

export const tabPages = {
  "In port": InPortTab,
  "Expected arrivals": ExpectedArrivalsTab,
  "Arrivals and departures": ArrivalsDeparturesTab,
  "Port congestion": PortCongestionTab,
  Statistics: StatisticsTab,
  "In the news": InTheNewsTab,
};

export const tabs = ["Overview", ...Object.keys(tabPages)];
