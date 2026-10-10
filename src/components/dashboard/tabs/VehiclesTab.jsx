import DashboardTab from "../DashboardTab";
import { getVehicles } from "@/services/dashboard/vehicles.service";
export default function VehiclesTab() {
  return <DashboardTab tab="vehicles" service={getVehicles} />;
}
