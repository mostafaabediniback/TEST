import PortCallLogTab from "./tabs/PortCallLogTab";
import VesselCharacteristicsTab from "./tabs/VesselCharacteristicsTab";
import OwnershipTab from "./tabs/OwnershipTab";
import PerformanceInsightsTab from "./tabs/PerformanceInsightsTab";
import ComplianceTab from "./tabs/ComplianceTab";
import InTheNewsTab from "./tabs/InTheNewsTab";

export const tabPages = {
  "Port call log": PortCallLogTab,
  "Vessel characteristics": VesselCharacteristicsTab,
  Ownership: OwnershipTab,
  "Performance insights": PerformanceInsightsTab,
  Compliance: ComplianceTab,
  "In the news": InTheNewsTab,
};

export const tabs = ["Overview", ...Object.keys(tabPages)];
