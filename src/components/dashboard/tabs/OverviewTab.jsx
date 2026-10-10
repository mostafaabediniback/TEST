import DashboardTab from "../DashboardTab";
import { getOverview } from "@/services/dashboard/overview.service";
export default function OverviewTab() {
  return <DashboardTab tab="overview" service={getOverview} />;
}
