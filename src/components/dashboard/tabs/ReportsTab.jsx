import DashboardTab from "../DashboardTab";
import { getReports } from "@/services/dashboard/reports.service";
export default function ReportsTab() {
  return <DashboardTab tab="reports" service={getReports} />;
}
