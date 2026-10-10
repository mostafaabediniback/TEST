import DashboardTab from "../DashboardTab";
import { getRoutes } from "@/services/dashboard/routes.service";
export default function RoutesTab() {
  return <DashboardTab tab="routes" service={getRoutes} />;
}
